export type MotionSample = {
  ax: number;
  ay: number;
  az: number;
};

export type CalibrationAxis = "ax" | "ay" | "az";

export type CalibrationResult = {
  axis: CalibrationAxis;
  min: number;
  max: number;
  range: number;
  bottomThreshold: number;
  topThreshold: number;
  isValid: boolean;
};

type CalibrationEventCandidate = {
  index: number;
  value: number;
};

const DEFAULT_AXIS: CalibrationAxis = "az";
const BOTTOM_THRESHOLD_RATIO = 0.3;
const TOP_THRESHOLD_RATIO = 0.6;

// Amplitude minimale absolue requise pour éviter de valider un mouvement trop faible ou du bruit.
const MIN_ABSOLUTE_SAFETY_RANGE = 1500;

// Pourcentage du robustRange utilisé pour adapter dynamiquement l'amplitude minimale requise.
const MIN_ROBUST_RANGE_RATIO = 0.25;

// Nombre minimal de Bottoms et de Tops requis pour valider la calibration.
const REQUIRED_CALIBRATION_REPS = 5;

// Nombre de samples regardés après un candidat pour vérifier si le mouvement repart vraiment.
const PROMINENCE_WINDOW_SIZE = 10;

// Pourcentage du robustRange requis pour considérer qu'un candidat a assez de prominence.
const MIN_PROMINENCE_RATIO = 0.15;

const PEAK_WINDOW_SIZE = 3;
const CALIBRATION_AXES: CalibrationAxis[] = ["ax", "ay", "az"];

type AxisDiagnostics = {
  min: number;
  max: number;
  range: number;
  saturationCount: number;
  saturationRatio: number;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = Math.floor((sortedValues.length - 1) * ratio);

  return sortedValues[index];
}

function getAxisValues(
  samples: MotionSample[],
  axis: CalibrationAxis,
): number[] {
  return samples.map((sample) => sample[axis]);
}

function getAxisDiagnostics(
  samples: MotionSample[],
  axis: CalibrationAxis,
): AxisDiagnostics {
  const values = getAxisValues(samples, axis);

  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      range: 0,
      saturationCount: 0,
      saturationRatio: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const saturationCount = values.filter(
    (value) => Math.abs(value) >= 32000,
  ).length;

  return {
    min,
    max,
    range: max - min,
    saturationCount,
    saturationRatio: saturationCount / values.length,
  };
}

function getAllAxisDiagnostics(
  samples: MotionSample[],
): Record<CalibrationAxis, AxisDiagnostics> {
  return {
    ax: getAxisDiagnostics(samples, "ax"),
    ay: getAxisDiagnostics(samples, "ay"),
    az: getAxisDiagnostics(samples, "az"),
  };
}

function detectDominantAxis(samples: MotionSample[]): CalibrationAxis {
  const axisDiagnostics = getAllAxisDiagnostics(samples);

  return CALIBRATION_AXES.reduce((dominantAxis, axis) =>
    axisDiagnostics[axis].range > axisDiagnostics[dominantAxis].range
      ? axis
      : dominantAxis,
  );
}

function detectLocalMinimum(
  values: number[],
  index: number,
  windowSize: number,
): boolean {
  const value = values[index];

  for (let offset = 1; offset <= windowSize; offset += 1) {
    if (value >= values[index - offset]) return false;
    if (value >= values[index + offset]) return false;
  }

  return true;
}

function detectLocalMaximum(
  values: number[],
  index: number,
  windowSize: number,
): boolean {
  const value = values[index];

  for (let offset = 1; offset <= windowSize; offset += 1) {
    if (value <= values[index - offset]) return false;
    if (value <= values[index + offset]) return false;
  }

  return true;
}

// Parcourt le signal pour détecter les Bottoms et Tops candidats.
// Un candidat doit être un extremum local situé dans la zone basse ou haute du mouvement.
// La validation des candidats est effectuée dans une étape distincte.

function detectBottomsAndTops(
  values: number[],
  bottomZone: number,
  topZone: number,
) {
  const bottoms: CalibrationEventCandidate[] = [];
  const tops: CalibrationEventCandidate[] = [];

  let bottomZoneHits = 0;
  let topZoneHits = 0;
  let localMinimumHits = 0;
  let localMaximumHits = 0;

  for (
    let index = PEAK_WINDOW_SIZE;
    index < values.length - PEAK_WINDOW_SIZE;
    index += 1
  ) {
    const value = values[index];

    const isInBottomZone = value <= bottomZone;
    const isInTopZone = value >= topZone;
    const isLocalMinimum = detectLocalMinimum(values, index, PEAK_WINDOW_SIZE);
    const isLocalMaximum = detectLocalMaximum(values, index, PEAK_WINDOW_SIZE);

    if (isInBottomZone) bottomZoneHits += 1;
    if (isInTopZone) topZoneHits += 1;
    if (isLocalMinimum) localMinimumHits += 1;
    if (isLocalMaximum) localMaximumHits += 1;

    if (isInBottomZone && isLocalMinimum) {
      bottoms.push({ index, value });
    }

    if (isInTopZone && isLocalMaximum) {
      tops.push({ index, value });
    }
  }

  console.log("[CALIBRATION PEAK DEBUG]", {
    bottomZone,
    topZone,
    bottomZoneHits,
    topZoneHits,
    localMinimumHits,
    localMaximumHits,
    bottomsDetected: bottoms.length,
    topsDetected: tops.length,
  });

  return { bottoms, tops };
}

/*--------------------------Réduction de bruit des candidats--------------------------------*/

//**********************//
// 1. distance minimale
//**********************//

// Vérifie si deux événements sont suffisamment éloignés l'un de l'autre.
function hasMinimumDistance(
  previousCandidate: CalibrationEventCandidate,
  currentCandidate: CalibrationEventCandidate,
  minimumDistanceSamples: number,
): boolean {
  return (
    currentCandidate.index - previousCandidate.index >=
    minimumDistanceSamples
  );
}


// Filtre les candidats trop proches et conserve le plus extrême dans chaque groupe.
function filterEventsByMinimumDistance(
  candidates: CalibrationEventCandidate[],
  minimumDistanceSamples: number,
  keepLowerValue: boolean,
): CalibrationEventCandidate[] {
  const filteredEvents: CalibrationEventCandidate[] = [];

  for (const candidate of candidates) {
    const lastEvent = filteredEvents[filteredEvents.length - 1];

    if (!lastEvent) {
      filteredEvents.push(candidate);
      continue;
    }

    if (
      hasMinimumDistance(
        lastEvent,
        candidate,
        minimumDistanceSamples,
      )
    ) {
      filteredEvents.push(candidate);
      continue;
    }

    // Si deux candidats représentent le même événement, on conserve le plus extrême.
    const shouldReplaceLastEvent = keepLowerValue
      ? candidate.value < lastEvent.value
      : candidate.value > lastEvent.value;

    if (shouldReplaceLastEvent) {
      filteredEvents[filteredEvents.length - 1] = candidate;
    }
  }

  return filteredEvents;
}

//**********************//
// 2. prominence
//**********************//

// Vérifie si un candidat est suivi d'un mouvement assez grand pour ne pas être considéré comme du bruit.
// Répond uniquement à la question : "Ce candidat possède-t-il assez de prominence ?"
function hasEnoughProminence(
  values: number[],
  candidate: CalibrationEventCandidate,
  minimumProminence: number,
  isBottom: boolean,
): boolean {
  const nextValues = values.slice(
    candidate.index + 1,
    candidate.index + 1 + PROMINENCE_WINDOW_SIZE,
  );

  if (nextValues.length === 0) {
    return false;
  }

  if (isBottom) {
    const highestValueAfterCandidate = Math.max(...nextValues);

    return highestValueAfterCandidate - candidate.value >= minimumProminence;
  }

  const lowestValueAfterCandidate = Math.min(...nextValues);

  return candidate.value - lowestValueAfterCandidate >= minimumProminence;
}


// Filtre les candidats qui ne sont pas suivis d'une vraie remontée ou descente du signal.
// Si hasEnoughProminence() == true -> Je le garde Sinon -> Je le retire

function filterEventsByProminence(
  values: number[],
  candidates: CalibrationEventCandidate[],
  minimumProminence: number,
  isBottom: boolean,
): CalibrationEventCandidate[] {
  return candidates.filter((candidate) =>
    hasEnoughProminence(values, candidate, minimumProminence, isBottom),
  );
}


//******************************//
// 3. confirmation de direction
//*****************************//

// Vérifie si le signal repart clairement dans la bonne direction après un candidat.
// Repond seulement à la question et retourne oui ou non !
function hasConfirmedDirectionChange(
  values: number[],
  candidate: CalibrationEventCandidate,
  isBottom: boolean,
): boolean {
  const nextValues = values.slice(
    candidate.index + 1,
    candidate.index + 1 + PEAK_WINDOW_SIZE,
  );

  if (nextValues.length === 0) {
    return false;
  }

  const nextAverage = average(nextValues);

  if (isBottom) {
    return nextAverage > candidate.value;
  }

  return nextAverage < candidate.value;
}


// Filtre les candidats qui ne sont pas suivis d'un mouvement dans la bonne direction.
function filterEventsByDirectionChange(
  values: number[],
  candidates: CalibrationEventCandidate[],
  isBottom: boolean,
): CalibrationEventCandidate[] {
  return candidates.filter((candidate) =>
    hasConfirmedDirectionChange(values, candidate, isBottom),
  );
}

//******************************//
// 3. Fonction de service qui regroupe les fonction de bruits
//*****************************//

// Applique les différentes règles de validation afin de conserver uniquement les véritables événements du mouvement.
function validateCalibrationEvents(
  bottoms: CalibrationEventCandidate[],
  tops: CalibrationEventCandidate[],
) {
  return {
    bottoms,
    tops,
  };
}

export function calculateCalibration(
  samples: MotionSample[],
  axis?: CalibrationAxis,
): CalibrationResult {
  if (samples.length === 0) {
    return {
      axis: axis ?? DEFAULT_AXIS,
      min: 0,
      max: 0,
      range: 0,
      bottomThreshold: 0,
      topThreshold: 0,
      isValid: false,
    };
  }

  const axisDiagnostics = getAllAxisDiagnostics(samples);
  const dominantAxisForCalibration = detectDominantAxis(samples);
  const selectedAxis = axis ?? dominantAxisForCalibration;
  const values = getAxisValues(samples, selectedAxis);

  const globalMin = Math.min(...values);
  const globalMax = Math.max(...values);
  const globalRange = globalMax - globalMin;

  const p10 = percentile(values, 0.1);
  const p25 = percentile(values, 0.25);
  const p50 = percentile(values, 0.5);
  const p75 = percentile(values, 0.75);
  const p90 = percentile(values, 0.9);

  const robustRange = p90 - p10;
  const dynamicMinRange = Math.max(
    MIN_ABSOLUTE_SAFETY_RANGE,
    robustRange * MIN_ROBUST_RANGE_RATIO,
  );

  const saturationCount = values.filter(
    (value) => Math.abs(value) >= 32000,
  ).length;

  const bottomZone = p25;
  const topZone = p75;

  const detectedEvents = detectBottomsAndTops(values, bottomZone, topZone);
  const validatedEvents = validateCalibrationEvents(
    detectedEvents.bottoms,
    detectedEvents.tops,
  );

  const selectedBottoms = validatedEvents.bottoms;
  const selectedTops = validatedEvents.tops;

  const bottomAverage = average(selectedBottoms.map((bottom) => bottom.value));
  const topAverage = average(selectedTops.map((top) => top.value));

  const min = bottomAverage;
  const max = topAverage;
  const range = max - min;

  const bottomThreshold = min + range * BOTTOM_THRESHOLD_RATIO;
  const topThreshold = min + range * TOP_THRESHOLD_RATIO;

  const hasEnoughBottoms = selectedBottoms.length >= REQUIRED_CALIBRATION_REPS;
  const hasEnoughTops = selectedTops.length >= REQUIRED_CALIBRATION_REPS;
  const hasValidRange = range >= dynamicMinRange;

  console.log("[CALIBRATION DEBUG]", {
    axis: selectedAxis,
    selectedAxis,
    dominantAxisForCalibration,
    sampleCount: values.length,

    axisRanges: {
      ax: axisDiagnostics.ax.range,
      ay: axisDiagnostics.ay.range,
      az: axisDiagnostics.az.range,
    },
    axisSaturation: {
      ax: axisDiagnostics.ax.saturationCount,
      ay: axisDiagnostics.ay.saturationCount,
      az: axisDiagnostics.az.saturationCount,
    },

    globalMin,
    globalMax,
    globalRange,

    robustRange,
    dynamicMinRange,

    saturationCount,
    saturationRatio: saturationCount / values.length,

    bottomZone,
    topZone,

    bottomsDetected: detectedEvents.bottoms.length,
    topsDetected: detectedEvents.tops.length,
    selectedBottoms: selectedBottoms.length,
    selectedTops: selectedTops.length,

    bottomAverage,
    topAverage,
    range,

    bottomThreshold,
    topThreshold,

    hasEnoughBottoms,
    hasEnoughTops,
    hasValidRange,

    distribution: {
      p10,
      p25,
      p50,
      p75,
      p90,
    },
  });

  return {
    axis: selectedAxis,
    min,
    max,
    range,
    bottomThreshold,
    topThreshold,
    isValid: hasEnoughBottoms && hasEnoughTops && hasValidRange,
  };
}
