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

  debug?: {
    globalRange: number;
    robustRange: number;
    bottomsDetected: number;
    topsDetected: number;
    selectedBottoms: number;
    selectedTops: number;
    bottomAverage: number;
    topAverage: number;
    saturationCount: number;
    saturationRatio: number;
    rawBottomIndexes: number[];
    rawTopIndexes: number[];
    selectedBottomIndexes: number[];
    selectedTopIndexes: number[];
    filterDebugEvents: CalibrationDebugEvent[];
    rawCandidateDebugEvents: RawCalibrationCandidateDebug[];
  };
};

type CalibrationEventCandidate = {
  index: number;
  value: number;
};

export type RawCalibrationCandidateDebug = {
  type: "BOTTOM" | "TOP";
  index: number;
  value: number;
  distanceToPreviousSameType?: number;
  distanceToPreviousGlobal?: number;
  previousValue: number;
  nextValue: number;
  localAmplitude: number;
};

export type CalibrationDebugRejectedReason =
  | "MIN_DISTANCE"
  | "LOW_PROMINENCE"
  | "WEAK_DIRECTION_CHANGE";

export type CalibrationDebugEvent = {
  type: "BOTTOM" | "TOP";
  index: number;
  value: number;
  kept: boolean;
  rejectedReason?: CalibrationDebugRejectedReason;
  distanceToPreviousSameType?: number;
  prominence?: number;
  directionChange?: number;
};

type DetectedCalibrationEvents = {
  bottoms: CalibrationEventCandidate[];
  tops: CalibrationEventCandidate[];
  rawDebugEvents: RawCalibrationCandidateDebug[];
};

type ValidatedCalibrationEvents = {
  bottoms: CalibrationEventCandidate[];
  tops: CalibrationEventCandidate[];
  debugEvents: CalibrationDebugEvent[];
};

export type CalibrationDataset = {
  id: string;
  exercise: string;
  expectedReps: number;
  performedReps?: number;
  createdAt: string;
  sampleCount: number;
  samplingRateHz: number;
  samples: MotionSample[];
  notes?: string;
};

export type CalibrationParameters = {
  prominenceWindowSize?: number;
  minimumProminenceRatio?: number;
  minimumDistanceSamples?: number;
  peakWindowSize?: number;
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
const MIN_PROMINENCE_RATIO = 0.35;

// Nombre minimal de samples séparant deux événements pour éviter les doublons.
const MINIMUM_DISTANCE_SAMPLES = 10;

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
  peakWindowSize: number,
): DetectedCalibrationEvents {

  const bottoms: CalibrationEventCandidate[] = [];
  const tops: CalibrationEventCandidate[] = [];
  const rawDebugEvents: RawCalibrationCandidateDebug[] = [];

  let bottomZoneHits = 0;
  let topZoneHits = 0;
  let localMinimumHits = 0;
  let localMaximumHits = 0;

  let previousSameTypeBottom: CalibrationEventCandidate | undefined;
  let previousSameTypeTop: CalibrationEventCandidate | undefined;
  let previousGlobal: CalibrationEventCandidate | undefined;

  for (
    let index = peakWindowSize;
    index < values.length - peakWindowSize;
    index += 1
  ) {
    const value = values[index];

    const isInBottomZone = value <= bottomZone;
    const isInTopZone = value >= topZone;
    const isLocalMinimum = detectLocalMinimum(values, index, peakWindowSize);
    const isLocalMaximum = detectLocalMaximum(values, index, peakWindowSize);

    if (isInBottomZone) bottomZoneHits += 1;
    if (isInTopZone) topZoneHits += 1;
    if (isLocalMinimum) localMinimumHits += 1;
    if (isLocalMaximum) localMaximumHits += 1;

   if (isInBottomZone && isLocalMinimum) {
  const candidate = { index, value };
  bottoms.push(candidate);

  rawDebugEvents.push({
    type: "BOTTOM",
    index,
    value,
    distanceToPreviousSameType: previousSameTypeBottom
      ? index - previousSameTypeBottom.index
      : undefined,
    distanceToPreviousGlobal: previousGlobal
      ? index - previousGlobal.index
      : undefined,
    previousValue: values[index - 1],
    nextValue: values[index + 1],
    localAmplitude:
      Math.max(...values.slice(index - peakWindowSize, index + peakWindowSize + 1)) -
      Math.min(...values.slice(index - peakWindowSize, index + peakWindowSize + 1)),
  });

  previousSameTypeBottom = candidate;
  previousGlobal = candidate;
}

    if (isInTopZone && isLocalMaximum) {
  const candidate = { index, value };
  tops.push(candidate);

  rawDebugEvents.push({
    type: "TOP",
    index,
    value,
    distanceToPreviousSameType: previousSameTypeTop
      ? index - previousSameTypeTop.index
      : undefined,
    distanceToPreviousGlobal: previousGlobal
      ? index - previousGlobal.index
      : undefined,
    previousValue: values[index - 1],
    nextValue: values[index + 1],
    localAmplitude:
      Math.max(...values.slice(index - peakWindowSize, index + peakWindowSize + 1)) -
      Math.min(...values.slice(index - peakWindowSize, index + peakWindowSize + 1)),
  });

  previousSameTypeTop = candidate;
  previousGlobal = candidate;
}
  }

  //   console.log("[CALIBRATION PEAK DEBUG]", {
  //     bottomZone,
  //     topZone,
  //     bottomZoneHits,
  //     topZoneHits,
  //     localMinimumHits,
  //     localMaximumHits,
  //     bottomsDetected: bottoms.length,
  //     topsDetected: tops.length,
  //   });

  return { bottoms, tops, rawDebugEvents };
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
    currentCandidate.index - previousCandidate.index >= minimumDistanceSamples
  );
}

// Filtre les candidats trop proches et conserve le plus extrême dans chaque groupe.
function filterEventsByMinimumDistance(
  candidates: CalibrationEventCandidate[],
  minimumDistanceSamples: number,
  keepLowerValue: boolean,
  type: "BOTTOM" | "TOP",
  debugEvents: CalibrationDebugEvent[],
): CalibrationEventCandidate[] {
  const filteredEvents: CalibrationEventCandidate[] = [];

  for (const candidate of candidates) {
    const lastEvent = filteredEvents[filteredEvents.length - 1];

    if (!lastEvent) {
      filteredEvents.push(candidate);
      continue;
    }

    const distanceToPreviousSameType = candidate.index - lastEvent.index;

    if (hasMinimumDistance(lastEvent, candidate, minimumDistanceSamples)) {
      filteredEvents.push(candidate);
      continue;
    }

    const shouldReplaceLastEvent = keepLowerValue
      ? candidate.value < lastEvent.value
      : candidate.value > lastEvent.value;

    if (shouldReplaceLastEvent) {
      debugEvents.push({
        type,
        index: lastEvent.index,
        value: lastEvent.value,
        kept: false,
        rejectedReason: "MIN_DISTANCE",
        distanceToPreviousSameType,
      });

      filteredEvents[filteredEvents.length - 1] = candidate;
      continue;
    }

    debugEvents.push({
      type,
      index: candidate.index,
      value: candidate.value,
      kept: false,
      rejectedReason: "MIN_DISTANCE",
      distanceToPreviousSameType,
    });
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
  prominenceWindowSize: number,
): boolean {
  const nextValues = values.slice(
    candidate.index + 1,
    candidate.index + 1 + prominenceWindowSize,
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

// Filtre les événements qui ne sont pas suivis d'un mouvement assez fort dans la direction attendue.
function filterEventsByProminence(
  values: number[],
  candidates: CalibrationEventCandidate[],
  minimumProminence: number,
  isBottom: boolean,
  prominenceWindowSize: number,
  type: "BOTTOM" | "TOP",
  debugEvents: CalibrationDebugEvent[],
): CalibrationEventCandidate[] {
  return candidates.filter((candidate) => {
    const windowEnd = Math.min(
      candidate.index + prominenceWindowSize,
      values.length,
    );

    const futureValues = values.slice(candidate.index, windowEnd);

    const bestFutureValue = isBottom
      ? Math.max(...futureValues)
      : Math.min(...futureValues);

    const prominence = isBottom
      ? bestFutureValue - candidate.value
      : candidate.value - bestFutureValue;

    const keep = prominence >= minimumProminence;

    if (!keep) {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        kept: false,
        rejectedReason: "LOW_PROMINENCE",
        prominence,
      });
    }

    return keep;
  });
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
  peakWindowSize: number,
): boolean {
  const nextValues = values.slice(
    candidate.index + 1,
    candidate.index + 1 + peakWindowSize,
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
  peakWindowSize: number,
  type: "BOTTOM" | "TOP",
  debugEvents: CalibrationDebugEvent[],
): CalibrationEventCandidate[] {
  return candidates.filter((candidate) => {
    const nextValues = values.slice(
      candidate.index + 1,
      candidate.index + 1 + peakWindowSize,
    );

    if (nextValues.length === 0) {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        kept: false,
        rejectedReason: "WEAK_DIRECTION_CHANGE",
        directionChange: 0,
      });

      return false;
    }

    const nextAverage = average(nextValues);

    const directionChange = isBottom
      ? nextAverage - candidate.value
      : candidate.value - nextAverage;

    const keep = directionChange > 0;

    if (!keep) {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        kept: false,
        rejectedReason: "WEAK_DIRECTION_CHANGE",
        directionChange,
      });
    }

    return keep;
  });
}

//******************************//
// 3. Fonction de service qui regroupe les fonction de bruits
//*****************************//

// Applique les différentes règles de validation afin de conserver uniquement les véritables événements du mouvement.
function validateCalibrationEvents(
  values: number[],
  robustRange: number,
  bottoms: CalibrationEventCandidate[],
  tops: CalibrationEventCandidate[],
  parameters: Required<CalibrationParameters>,
): ValidatedCalibrationEvents {
  const minimumProminence = robustRange * parameters.minimumProminenceRatio;
  const debugEvents: CalibrationDebugEvent[] = [];

  //   console.log("[CALIBRATION FILTERS] Initial", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //   });

  bottoms = filterEventsByMinimumDistance(
    bottoms,
    parameters.minimumDistanceSamples,
    true,
    "BOTTOM",
    debugEvents,
  );

  tops = filterEventsByMinimumDistance(
    tops,
    parameters.minimumDistanceSamples,
    false,
    "TOP",
    debugEvents,
  );

  //   console.log("[CALIBRATION FILTERS] After Distance", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //   });

  bottoms = filterEventsByProminence(
    values,
    bottoms,
    minimumProminence,
    true,
    parameters.prominenceWindowSize,
    "BOTTOM",
    debugEvents,
  );

  tops = filterEventsByProminence(
    values,
    tops,
    minimumProminence,
    false,
    parameters.prominenceWindowSize,
    "TOP",
    debugEvents,
  );

  //   console.log("[CALIBRATION FILTERS] After Prominence", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //     minimumProminence,
  //   });

  bottoms = filterEventsByDirectionChange(
    values,
    bottoms,
    true,
    parameters.peakWindowSize,
    "BOTTOM",
    debugEvents,
  );

  tops = filterEventsByDirectionChange(
    values,
    tops,
    false,
    parameters.peakWindowSize,
    "TOP",
    debugEvents,
  );

  //   console.log("[CALIBRATION FILTERS] After Direction", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //   });

  return {
    bottoms,
    tops,
    debugEvents,
  };
}

export function calculateCalibration(
  samples: MotionSample[],
  axis?: CalibrationAxis,
  parameters?: CalibrationParameters,
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

  const resolvedParameters: Required<CalibrationParameters> = {
    prominenceWindowSize:
      parameters?.prominenceWindowSize ?? PROMINENCE_WINDOW_SIZE,
    minimumProminenceRatio:
      parameters?.minimumProminenceRatio ?? MIN_PROMINENCE_RATIO,
    minimumDistanceSamples:
      parameters?.minimumDistanceSamples ?? MINIMUM_DISTANCE_SAMPLES,
    peakWindowSize: parameters?.peakWindowSize ?? PEAK_WINDOW_SIZE,
  };

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

  const detectedEvents = detectBottomsAndTops(
    values,
    bottomZone,
    topZone,
    resolvedParameters.peakWindowSize,
  );
  const validatedEvents = validateCalibrationEvents(
    values,
    robustRange,
    detectedEvents.bottoms,
    detectedEvents.tops,
    resolvedParameters,
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

  //   console.log("[CALIBRATION DEBUG]", {
  //     axis: selectedAxis,
  //     selectedAxis,
  //     dominantAxisForCalibration,
  //     sampleCount: values.length,

  //     axisRanges: {
  //       ax: axisDiagnostics.ax.range,
  //       ay: axisDiagnostics.ay.range,
  //       az: axisDiagnostics.az.range,
  //     },
  //     axisSaturation: {
  //       ax: axisDiagnostics.ax.saturationCount,
  //       ay: axisDiagnostics.ay.saturationCount,
  //       az: axisDiagnostics.az.saturationCount,
  //     },

  //     globalMin,
  //     globalMax,
  //     globalRange,

  //     robustRange,
  //     dynamicMinRange,

  //     saturationCount,
  //     saturationRatio: saturationCount / values.length,

  //     bottomZone,
  //     topZone,

  //     bottomsDetected: detectedEvents.bottoms.length,
  //     topsDetected: detectedEvents.tops.length,
  //     selectedBottoms: selectedBottoms.length,
  //     selectedTops: selectedTops.length,

  //     bottomAverage,
  //     topAverage,
  //     range,

  //     bottomThreshold,
  //     topThreshold,

  //     hasEnoughBottoms,
  //     hasEnoughTops,
  //     hasValidRange,

  //     distribution: {
  //       p10,
  //       p25,
  //       p50,
  //       p75,
  //       p90,
  //     },
  //   });

  return {
    axis: selectedAxis,
    min,
    max,
    range,
    bottomThreshold,
    topThreshold,
    isValid: hasEnoughBottoms && hasEnoughTops && hasValidRange,

    debug: {
      globalRange,
      robustRange,
      bottomsDetected: detectedEvents.bottoms.length,
      topsDetected: detectedEvents.tops.length,
      selectedBottoms: selectedBottoms.length,
      selectedTops: selectedTops.length,
      bottomAverage,
      topAverage,
      saturationCount,
      saturationRatio: saturationCount / values.length,
      rawBottomIndexes: detectedEvents.bottoms.map((event) => event.index),
      rawTopIndexes: detectedEvents.tops.map((event) => event.index),
      selectedBottomIndexes: selectedBottoms.map((event) => event.index),
      selectedTopIndexes: selectedTops.map((event) => event.index),
      filterDebugEvents: validatedEvents.debugEvents,
      rawCandidateDebugEvents: detectedEvents.rawDebugEvents,
    },
  };
}

// Crée un dataset JSON réutilisable à partir des samples capturés pendant la calibration.
export function createCalibrationDataset(
  samples: MotionSample[],
  exercise: string,
  expectedReps: number,
  samplingRateHz: number,
  performedReps?: number,
  notes?: string,
): CalibrationDataset {
  return {
    id: `${exercise}-${expectedReps}reps-${Date.now()}`,
    exercise,
    expectedReps,
    performedReps,
    createdAt: new Date().toISOString(),
    sampleCount: samples.length,
    samplingRateHz,
    samples,
    notes,
  };
}
