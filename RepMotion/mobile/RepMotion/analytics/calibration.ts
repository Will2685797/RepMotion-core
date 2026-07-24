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
    selectionStrategy?: CalibrationSelectionStrategy;
    admissibleCandidateCount?: number;
    selectedChain?: Array<{ type: "BOTTOM" | "TOP"; index: number }>;
    selectionScore?: number;
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

export type CalibrationDebugFilter =
  | "MIN_DISTANCE"
  | "PROMINENCE"
  | "DIRECTION_CHANGE";

export type CalibrationDebugEvent = {
  type: "BOTTOM" | "TOP";
  index: number;
  value: number;
  filter: CalibrationDebugFilter;
  kept: boolean;
  rejectedReason?: CalibrationDebugRejectedReason;
  distanceToPreviousSameType?: number;
  prominence?: number;
  directionChange?: number;
  conflictWithIndex?: number;
  conflictWithValue?: number;
  conflictDistance?: number;
  keptIndex?: number;
  keptValue?: number;
  selectionRule?: string;
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
  selectionStrategy?: CalibrationSelectionStrategy;
  admissibleCandidateCount?: number;
  selectedChain?: Array<{ type: "BOTTOM" | "TOP"; index: number }>;
  selectionScore?: number;
};

type ChronologicalMinDistanceCandidate = {
  type: "BOTTOM" | "TOP";
  index: number;
  value: number;
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

export type MinDistanceStrategy = "current" | "reset_on_opposite";
export type CalibrationSelectionStrategy =
  | "current_filters"
  | "global_alternating_path";

export type CalibrationParameters = {
  prominenceWindowSize?: number;
  minimumProminenceRatio?: number;
  minimumDistanceSamples?: number;
  peakWindowSize?: number;
  smoothingWindowSize?: number;
  rawDetectionStrategy?: RawDetectionStrategy;
  minDistanceStrategy?: MinDistanceStrategy;
  selectionStrategy?: CalibrationSelectionStrategy;
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

export type RawDetectionStrategy = "local_extrema" | "direction_change";

const RAW_DETECTION_STRATEGY: RawDetectionStrategy = "direction_change";
const DEFAULT_MIN_DISTANCE_STRATEGY: MinDistanceStrategy = "current";
const DEFAULT_SELECTION_STRATEGY: CalibrationSelectionStrategy =
  "current_filters";

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

/*--------------------------------V2----------------------------------------*/

//  * Applique un lissage simple par moyenne mobile.
//  *
//  * Utilisé par la V2.5 pour réduire les micro-oscillations du signal avant
//  * la détection des changements de direction.
//  *
//  * Le but est de tester si un signal moins bruité produit des candidats RAW
//  * moins ambigus que la V2 basée directement sur les extrema locaux.
//  */
function smoothSignal(values: number[], windowSize: number): number[] {
  if (windowSize <= 1 || values.length === 0) {
    return values;
  }

  const halfWindow = Math.floor(windowSize / 2);

  return values.map((_, index) => {
    const start = Math.max(0, index - halfWindow);
    const end = Math.min(values.length - 1, index + halfWindow);

    let sum = 0;
    let count = 0;

    for (let i = start; i <= end; i += 1) {
      sum += values[i];
      count += 1;
    }

    return sum / count;
  });
}

/**
 * Calcule une dérivée discrète simple du signal.
 *
 * En V2.5, cette dérivée sert de proxy de direction :
 * - valeur positive : le signal monte
 * - valeur négative : le signal descend
 *
 * Les changements de signe de cette dérivée seront utilisés pour détecter
 * les pivots potentiels du mouvement.
 */
function computeVelocityProxy(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  const velocity: number[] = [0];

  for (let index = 1; index < values.length; index += 1) {
    velocity.push(values[index] - values[index - 1]);
  }

  return velocity;
}

type DirectionChangeCandidate = {
  type: "BOTTOM" | "TOP";
  index: number;
};

/**
 * Détecte les changements de direction du signal.
 *
 * Cette fonction travaille uniquement sur la dérivée du signal lissé et
 * retourne les pivots théoriques avant toute validation ou ajustement
 * vers les véritables extrema locaux.
 */
function findDirectionChangeCandidates(
  velocity: number[],
): DirectionChangeCandidate[] {
  const candidates: DirectionChangeCandidate[] = [];

  for (let index = 1; index < velocity.length; index += 1) {
    const previousVelocity = velocity[index - 1];
    const currentVelocity = velocity[index];

    if (previousVelocity < 0 && currentVelocity >= 0) {
      candidates.push({
        type: "BOTTOM",
        index,
      });
    }

    if (previousVelocity > 0 && currentVelocity <= 0) {
      candidates.push({
        type: "TOP",
        index,
      });
    }
  }

  return candidates;
}

/**
 * Ajuste un candidat de changement de direction vers le véritable extremum local.
 *
 * Le changement de signe de la dérivée donne une zone probable de pivot,
 * mais le minimum/maximum réel peut être légèrement décalé de quelques samples.
 */
function snapToLocalExtremum(
  values: number[],
  candidate: DirectionChangeCandidate,
  searchWindowSize: number,
): CalibrationEventCandidate {
  if (values.length === 0) {
    return {
      index: candidate.index,
      value: 0,
    };
  }

  const safeIndex = Math.max(0, Math.min(values.length - 1, candidate.index));
  const safeSearchWindowSize = Math.max(0, searchWindowSize);

  const start = Math.max(0, safeIndex - safeSearchWindowSize);
  const end = Math.min(values.length - 1, safeIndex + safeSearchWindowSize);

  let bestIndex = safeIndex;
  let bestValue = values[safeIndex];

  for (let index = start; index <= end; index += 1) {
    const value = values[index];

    if (candidate.type === "BOTTOM" && value < bestValue) {
      bestIndex = index;
      bestValue = value;
    }

    if (candidate.type === "TOP" && value > bestValue) {
      bestIndex = index;
      bestValue = value;
    }
  }

  return {
    index: bestIndex,
    value: bestValue,
  };
}

/**
 * Convertit les changements de direction en candidats RAW compatibles
 * avec le reste du pipeline de calibration.
 *
 * Cette étape applique seulement :
 * - le snap vers le véritable extremum local ;
 * - la séparation Bottom / Top ;
 * - la contrainte de zone basse / haute ;
 * - la création des rawDebugEvents.
 *
 * Elle ne remplace pas validateCalibrationEvents().
 */
function buildRawCandidatesFromDirectionChanges(
  values: number[],
  directionCandidates: DirectionChangeCandidate[],
  bottomZone: number,
  topZone: number,
  snapWindowSize: number,
): DetectedCalibrationEvents {
  const bottoms: CalibrationEventCandidate[] = [];
  const tops: CalibrationEventCandidate[] = [];
  const rawDebugEvents: RawCalibrationCandidateDebug[] = [];

  let previousSameTypeBottom: CalibrationEventCandidate | undefined;
  let previousSameTypeTop: CalibrationEventCandidate | undefined;
  let previousGlobal: CalibrationEventCandidate | undefined;

  for (const directionCandidate of directionCandidates) {
    const snappedCandidate = snapToLocalExtremum(
      values,
      directionCandidate,
      snapWindowSize,
    );

    const isBottom = directionCandidate.type === "BOTTOM";
    const isTop = directionCandidate.type === "TOP";

    const isInBottomZone = snappedCandidate.value <= bottomZone;
    const isInTopZone = snappedCandidate.value >= topZone;

    if (isBottom && isInBottomZone) {
      bottoms.push(snappedCandidate);

      rawDebugEvents.push({
        type: "BOTTOM",
        index: snappedCandidate.index,
        value: snappedCandidate.value,
        previousValue: values[Math.max(0, snappedCandidate.index - 1)],
        nextValue:
          values[Math.min(values.length - 1, snappedCandidate.index + 1)],
        localAmplitude:
          Math.abs(
            values[Math.max(0, snappedCandidate.index - 1)] -
              snappedCandidate.value,
          ) +
          Math.abs(
            values[Math.min(values.length - 1, snappedCandidate.index + 1)] -
              snappedCandidate.value,
          ),
        distanceToPreviousSameType: previousSameTypeBottom
          ? snappedCandidate.index - previousSameTypeBottom.index
          : undefined,
        distanceToPreviousGlobal: previousGlobal
          ? snappedCandidate.index - previousGlobal.index
          : undefined,
      });

      previousSameTypeBottom = snappedCandidate;
      previousGlobal = snappedCandidate;
    }

    if (isTop && isInTopZone) {
      tops.push(snappedCandidate);

      rawDebugEvents.push({
        type: "TOP",
        index: snappedCandidate.index,
        value: snappedCandidate.value,
        previousValue: values[Math.max(0, snappedCandidate.index - 1)],
        nextValue:
          values[Math.min(values.length - 1, snappedCandidate.index + 1)],
        localAmplitude:
          Math.abs(
            values[Math.max(0, snappedCandidate.index - 1)] -
              snappedCandidate.value,
          ) +
          Math.abs(
            values[Math.min(values.length - 1, snappedCandidate.index + 1)] -
              snappedCandidate.value,
          ),
        distanceToPreviousSameType: previousSameTypeTop
          ? snappedCandidate.index - previousSameTypeTop.index
          : undefined,
        distanceToPreviousGlobal: previousGlobal
          ? snappedCandidate.index - previousGlobal.index
          : undefined,
      });

      previousSameTypeTop = snappedCandidate;
      previousGlobal = snappedCandidate;
    }
  }

  return {
    bottoms,
    tops,
    rawDebugEvents,
  };
}

/**
 * Génère les candidats RAW de calibration à l'aide d'une stratégie basée
 * sur le changement de direction d'un signal lissé.
 *
 * Cette fonction remplace uniquement la génération des candidats RAW.
 * Le reste du pipeline (validation, Cycle Analyzer, benchmark, etc.)
 * demeure inchangé.
 */
function detectBottomsAndTopsV25(
  values: number[],
  bottomZone: number,
  topZone: number,
  peakWindowSize: number,
  smoothingWindowSize: number,
): DetectedCalibrationEvents {
  const smoothedValues = smoothSignal(values, smoothingWindowSize);
  const velocity = computeVelocityProxy(smoothedValues);
  const directionCandidates = findDirectionChangeCandidates(velocity);

  const detectedEvents = buildRawCandidatesFromDirectionChanges(
    values,
    directionCandidates,
    bottomZone,
    topZone,
    peakWindowSize,
  );

  return detectedEvents;
}

/*------------------------------------------------------------------------*/

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
          Math.max(
            ...values.slice(index - peakWindowSize, index + peakWindowSize + 1),
          ) -
          Math.min(
            ...values.slice(index - peakWindowSize, index + peakWindowSize + 1),
          ),
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
          Math.max(
            ...values.slice(index - peakWindowSize, index + peakWindowSize + 1),
          ) -
          Math.min(
            ...values.slice(index - peakWindowSize, index + peakWindowSize + 1),
          ),
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

/**
 * Résume l'espacement entre les candidats RAW détectés.
 *
 * Utilisé comme diagnostic expérimental pour établir une baseline de la V2
 * avant l'implémentation de la stratégie V2.5.
 *
 * L'objectif est de quantifier la densité des candidats générés afin de
 * vérifier si de nombreuses détections sont concentrées sur quelques samples,
 * ce qui pourrait indiquer des micro-oscillations du signal.
 */

function summarizeRawCandidateSpacing(
  rawDebugEvents: RawCalibrationCandidateDebug[],
): {
  totalCandidates: number;
  closeGlobalCandidates: number;
  minimumGlobalDistance: number | undefined;
  averageGlobalDistance: number | undefined;
} {
  const globalDistances = rawDebugEvents
    .map((event) => event.distanceToPreviousGlobal)
    .filter((distance): distance is number => distance !== undefined);

  if (globalDistances.length === 0) {
    return {
      totalCandidates: rawDebugEvents.length,
      closeGlobalCandidates: 0,
      minimumGlobalDistance: undefined,
      averageGlobalDistance: undefined,
    };
  }

  return {
    totalCandidates: rawDebugEvents.length,
    closeGlobalCandidates: globalDistances.filter((distance) => distance < 10)
      .length,
    minimumGlobalDistance: Math.min(...globalDistances),
    averageGlobalDistance: average(globalDistances),
  };
}

/*--------------------------(FILTRE)Réduction de bruit des candidats(FILTRE)--------------------------------*/

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
function filterByMinimumDistanceCurrent(
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
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
      });

      filteredEvents.push(candidate);
      continue;
    }

    const distanceToPreviousSameType = candidate.index - lastEvent.index;

    if (hasMinimumDistance(lastEvent, candidate, minimumDistanceSamples)) {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
      });

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
        filter: "MIN_DISTANCE",
        kept: false,
        rejectedReason: "MIN_DISTANCE",
        distanceToPreviousSameType,
        conflictWithIndex: candidate.index,
        conflictWithValue: candidate.value,
        conflictDistance: distanceToPreviousSameType,
        keptIndex: candidate.index,
        keptValue: candidate.value,
        selectionRule: keepLowerValue
          ? "BOTTOM keeps the lower value when same-type candidates are too close"
          : "TOP keeps the higher value when same-type candidates are too close",
      });

      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
        conflictWithIndex: lastEvent.index,
        conflictWithValue: lastEvent.value,
        conflictDistance: distanceToPreviousSameType,
        keptIndex: candidate.index,
        keptValue: candidate.value,
        selectionRule: keepLowerValue
          ? "BOTTOM keeps the lower value when same-type candidates are too close"
          : "TOP keeps the higher value when same-type candidates are too close",
      });

      filteredEvents[filteredEvents.length - 1] = candidate;
      continue;
    }

    debugEvents.push({
      type,
      index: candidate.index,
      value: candidate.value,
      filter: "MIN_DISTANCE",
      kept: false,
      rejectedReason: "MIN_DISTANCE",
      distanceToPreviousSameType,
      conflictWithIndex: lastEvent.index,
      conflictWithValue: lastEvent.value,
      conflictDistance: distanceToPreviousSameType,
      keptIndex: lastEvent.index,
      keptValue: lastEvent.value,
      selectionRule: keepLowerValue
        ? "BOTTOM keeps the lower value when same-type candidates are too close"
        : "TOP keeps the higher value when same-type candidates are too close",
    });
  }

  return filteredEvents;
}

function filterByMinimumDistance(
  candidates: CalibrationEventCandidate[],
  minimumDistanceSamples: number,
  keepLowerValue: boolean,
  type: "BOTTOM" | "TOP",
  debugEvents: CalibrationDebugEvent[],
  strategy: MinDistanceStrategy,
): CalibrationEventCandidate[] {
  if (strategy === "current") {
    return filterByMinimumDistanceCurrent(
      candidates,
      minimumDistanceSamples,
      keepLowerValue,
      type,
      debugEvents,
    );
  }

  return filterByMinimumDistanceCurrent(
    candidates,
    minimumDistanceSamples,
    keepLowerValue,
    type,
    debugEvents,
  );
}

type GlobalAlternatingPathState = {
  score: number;
  predecessorKey: string | null;
  candidateIndex: number;
  lastBottomIndex: number | null;
};

function selectGlobalAlternatingPath(
  bottoms: CalibrationEventCandidate[],
  tops: CalibrationEventCandidate[],
  expectedReps: number,
  constraints: {
    minConcentricDuration: number;
    minEccentricDuration: number;
    minRepDuration: number;
  },
  debugEvents: CalibrationDebugEvent[],
): {
  bottoms: CalibrationEventCandidate[];
  tops: CalibrationEventCandidate[];
  selectionScore: number;
  selectedChain: Array<{ type: "BOTTOM" | "TOP"; index: number }>;
} {
  const pooledCandidates = [
    ...bottoms.map((candidate) => ({
      ...candidate,
      type: "BOTTOM" as const,
    })),
    ...tops.map((candidate) => ({
      ...candidate,
      type: "TOP" as const,
    })),
  ].sort((left, right) => left.index - right.index);

  const targetChainLength = expectedReps * 2 + 1;

  if (pooledCandidates.length < targetChainLength) {
    debugEvents.push({
      type: "BOTTOM",
      index: -1,
      value: 0,
      filter: "MIN_DISTANCE",
      kept: false,
      rejectedReason: "MIN_DISTANCE",
      selectionRule: "GLOBAL_PATH_NOT_FOUND",
    });

    return {
      bottoms: [],
      tops: [],
      selectionScore: 0,
      selectedChain: [],
    };
  }

  const stateStore = new Map<string, GlobalAlternatingPathState>();
  let currentStates = new Map<string, GlobalAlternatingPathState>();
  const initialStateKey = "0:-1:-1";
  const initialState: GlobalAlternatingPathState = {
    score: 0,
    predecessorKey: null,
    candidateIndex: -1,
    lastBottomIndex: null,
  };
  currentStates.set(initialStateKey, initialState);
  stateStore.set(initialStateKey, initialState);

  for (let step = 0; step < targetChainLength; step += 1) {
    const requiredType = step % 2 === 0 ? "BOTTOM" : "TOP";
    const nextStates = new Map<string, GlobalAlternatingPathState>();

    for (const [stateKey, state] of currentStates) {
      const previousCandidateIndex = state.candidateIndex;
      const previousCandidate =
        previousCandidateIndex >= 0
          ? pooledCandidates[previousCandidateIndex]
          : null;

      for (let candidateIndex = 0; candidateIndex < pooledCandidates.length; candidateIndex += 1) {
        const candidate = pooledCandidates[candidateIndex];

        if (candidate.type !== requiredType) {
          continue;
        }

        if (previousCandidate && candidate.index <= previousCandidate.index) {
          continue;
        }

        if (previousCandidate) {
          const transitionDuration = candidate.index - previousCandidate.index;

          if (requiredType === "TOP") {
            if (transitionDuration < constraints.minConcentricDuration) {
              continue;
            }
          } else {
            if (transitionDuration < constraints.minEccentricDuration) {
              continue;
            }
          }

          if (
            requiredType === "BOTTOM" &&
            state.lastBottomIndex !== null &&
            candidate.index - state.lastBottomIndex < constraints.minRepDuration
          ) {
            continue;
          }
        } else if (requiredType !== "BOTTOM") {
          continue;
        }

        const nextLastBottomIndex =
          requiredType === "BOTTOM" ? candidate.index : state.lastBottomIndex;
        const nextScore = state.score + (candidate.type === "BOTTOM" ? -candidate.value : candidate.value);
        const nextKey = `${step + 1}:${candidateIndex}:${nextLastBottomIndex ?? -1}`;
        const existingState = nextStates.get(nextKey);

        if (!existingState || nextScore > existingState.score) {
          const nextState: GlobalAlternatingPathState = {
            score: nextScore,
            predecessorKey: stateKey,
            candidateIndex,
            lastBottomIndex: nextLastBottomIndex,
          };
          nextStates.set(nextKey, nextState);
          stateStore.set(nextKey, nextState);
        }
      }
    }

    currentStates = nextStates;

    if (currentStates.size === 0) {
      break;
    }
  }

  let bestTerminalState: GlobalAlternatingPathState | null = null;
  let bestTerminalStateKey: string | null = null;

  for (const [stateKey, state] of currentStates) {
    if (
      !bestTerminalState ||
      state.score > bestTerminalState.score
    ) {
      bestTerminalState = state;
      bestTerminalStateKey = stateKey;
    }
  }

  if (!bestTerminalStateKey || !bestTerminalState) {
    debugEvents.push({
      type: "BOTTOM",
      index: -1,
      value: 0,
      filter: "MIN_DISTANCE",
      kept: false,
      rejectedReason: "MIN_DISTANCE",
      selectionRule: "GLOBAL_PATH_NOT_FOUND",
    });

    return {
      bottoms: [],
      tops: [],
      selectionScore: 0,
      selectedChain: [],
    };
  }

  const selectedCandidateIndices: number[] = [];
  let cursorKey: string | null = bestTerminalStateKey;

  while (cursorKey) {
    const state = stateStore.get(cursorKey);

    if (!state) {
      break;
    }

    if (state.candidateIndex >= 0) {
      selectedCandidateIndices.push(state.candidateIndex);
    }

    cursorKey = state.predecessorKey;
  }

  selectedCandidateIndices.reverse();

  const selectedCandidates = selectedCandidateIndices.map(
    (candidateIndex) => pooledCandidates[candidateIndex],
  );

  const selectedBottoms = selectedCandidates.filter(
    (candidate) => candidate.type === "BOTTOM",
  );
  const selectedTops = selectedCandidates.filter(
    (candidate) => candidate.type === "TOP",
  );

  const selectionScore = selectedCandidates.reduce(
    (sum, candidate) => sum + (candidate.type === "BOTTOM" ? -candidate.value : candidate.value),
    0,
  );

  return {
    bottoms: selectedBottoms,
    tops: selectedTops,
    selectionScore,
    selectedChain: selectedCandidates.map((candidate) => ({
      type: candidate.type,
      index: candidate.index,
    })),
  };
}

function filterByMinimumDistanceResetOnOpposite(
  bottoms: CalibrationEventCandidate[],
  tops: CalibrationEventCandidate[],
  minimumDistanceSamples: number,
  debugEvents: CalibrationDebugEvent[],
): {
  bottoms: CalibrationEventCandidate[];
  tops: CalibrationEventCandidate[];
} {
  const eligibleEvents: ChronologicalMinDistanceCandidate[] = [
    ...bottoms.map((candidate) => ({
      type: "BOTTOM" as const,
      index: candidate.index,
      value: candidate.value,
    })),
    ...tops.map((candidate) => ({
      type: "TOP" as const,
      index: candidate.index,
      value: candidate.value,
    })),
  ].sort((left, right) => left.index - right.index);

  const selectedBottoms: CalibrationEventCandidate[] = [];
  const selectedTops: CalibrationEventCandidate[] = [];

  let activeGroupType: "BOTTOM" | "TOP" | null = null;
  let activeGroupSurvivor: (CalibrationEventCandidate & {
    type: "BOTTOM" | "TOP";
  }) | null = null;

  const startNewGroup = (candidate: ChronologicalMinDistanceCandidate) => {
    const mappedCandidate = {
      index: candidate.index,
      value: candidate.value,
      type: candidate.type,
    };

    if (candidate.type === "BOTTOM") {
      selectedBottoms.push(mappedCandidate);
    } else {
      selectedTops.push(mappedCandidate);
    }

    activeGroupType = candidate.type;
    activeGroupSurvivor = mappedCandidate;
  };

  for (const candidate of eligibleEvents) {
    const distanceToPreviousSameType = activeGroupSurvivor
      ? candidate.index - activeGroupSurvivor.index
      : undefined;

    if (!activeGroupSurvivor || activeGroupType === null) {
      startNewGroup(candidate);
      debugEvents.push({
        type: candidate.type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
        selectionRule:
          "reset_on_opposite: start new cluster after opposite-type boundary",
      });
      continue;
    }

    if (candidate.type !== activeGroupType) {
      startNewGroup(candidate);
      debugEvents.push({
        type: candidate.type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
        selectionRule:
          "reset_on_opposite: opposite-type event closes the current cluster",
      });
      continue;
    }

    if (distanceToPreviousSameType !== undefined && distanceToPreviousSameType >= minimumDistanceSamples) {
      startNewGroup(candidate);
      debugEvents.push({
        type: candidate.type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
        selectionRule:
          "reset_on_opposite: same-type event starts a new temporal cluster",
      });
      continue;
    }

    const keepLowerValue = candidate.type === "BOTTOM";
    const shouldReplace = keepLowerValue
      ? candidate.value < activeGroupSurvivor.value
      : candidate.value > activeGroupSurvivor.value;

    if (shouldReplace) {
      const previousSurvivor = activeGroupSurvivor;

      if (candidate.type === "BOTTOM") {
        selectedBottoms[selectedBottoms.length - 1] = {
          index: candidate.index,
          value: candidate.value,
        };
      } else {
        selectedTops[selectedTops.length - 1] = {
          index: candidate.index,
          value: candidate.value,
        };
      }

      activeGroupSurvivor = {
        index: candidate.index,
        value: candidate.value,
        type: candidate.type,
      };

      debugEvents.push({
        type: previousSurvivor.type,
        index: previousSurvivor.index,
        value: previousSurvivor.value,
        filter: "MIN_DISTANCE",
        kept: false,
        rejectedReason: "MIN_DISTANCE",
        distanceToPreviousSameType,
        conflictWithIndex: candidate.index,
        conflictWithValue: candidate.value,
        conflictDistance: distanceToPreviousSameType,
        keptIndex: candidate.index,
        keptValue: candidate.value,
        selectionRule:
          "reset_on_opposite: same-type candidate replaces the previous survivor within the cluster",
      });

      debugEvents.push({
        type: candidate.type,
        index: candidate.index,
        value: candidate.value,
        filter: "MIN_DISTANCE",
        kept: true,
        distanceToPreviousSameType,
        conflictWithIndex: previousSurvivor.index,
        conflictWithValue: previousSurvivor.value,
        conflictDistance: distanceToPreviousSameType,
        keptIndex: candidate.index,
        keptValue: candidate.value,
        selectionRule:
          "reset_on_opposite: same-type candidate replaces the previous survivor within the cluster",
      });
      continue;
    }

    debugEvents.push({
      type: candidate.type,
      index: candidate.index,
      value: candidate.value,
      filter: "MIN_DISTANCE",
      kept: false,
      rejectedReason: "MIN_DISTANCE",
      distanceToPreviousSameType,
      conflictWithIndex: activeGroupSurvivor.index,
      conflictWithValue: activeGroupSurvivor.value,
      conflictDistance: distanceToPreviousSameType,
      keptIndex: activeGroupSurvivor.index,
      keptValue: activeGroupSurvivor.value,
      selectionRule:
        "reset_on_opposite: same-type candidate is rejected within the current cluster",
    });
  }

  return {
    bottoms: selectedBottoms,
    tops: selectedTops,
  };
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
        filter: "PROMINENCE",
        kept: false,
        rejectedReason: "LOW_PROMINENCE",
        prominence,
      });
    } else {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        filter: "PROMINENCE",
        kept: true,
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
        filter: "DIRECTION_CHANGE",
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
        filter: "DIRECTION_CHANGE",
        kept: false,
        rejectedReason: "WEAK_DIRECTION_CHANGE",
        directionChange,
      });
    } else {
      debugEvents.push({
        type,
        index: candidate.index,
        value: candidate.value,
        filter: "DIRECTION_CHANGE",
        kept: true,
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
  expectedReps: number,
): ValidatedCalibrationEvents {
  const minimumProminence = robustRange * parameters.minimumProminenceRatio;
  const debugEvents: CalibrationDebugEvent[] = [];

  //   console.log("[CALIBRATION FILTERS] Initial", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //   });

  if (parameters.selectionStrategy === "global_alternating_path") {
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

    const admissibleCandidateCount = bottoms.length + tops.length;
    const globalSelection = selectGlobalAlternatingPath(
      bottoms,
      tops,
      expectedReps,
      {
        minConcentricDuration: 8,
        minEccentricDuration: 8,
        minRepDuration: 45,
      },
      debugEvents,
    );

    bottoms = globalSelection.bottoms;
    tops = globalSelection.tops;

    return {
      bottoms,
      tops,
      debugEvents,
      selectionStrategy: "global_alternating_path",
      admissibleCandidateCount,
      selectedChain: globalSelection.selectedChain,
      selectionScore: globalSelection.selectionScore,
    };
  } else if (parameters.minDistanceStrategy === "reset_on_opposite") {
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

    const resetSelection = filterByMinimumDistanceResetOnOpposite(
      bottoms,
      tops,
      parameters.minimumDistanceSamples,
      debugEvents,
    );

    bottoms = resetSelection.bottoms;
    tops = resetSelection.tops;
  } else {
    bottoms = filterByMinimumDistanceCurrent(
      bottoms,
      parameters.minimumDistanceSamples,
      true,
      "BOTTOM",
      debugEvents,
    );

    tops = filterByMinimumDistanceCurrent(
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
  }

  //   console.log("[CALIBRATION FILTERS] After Direction", {
  //     bottoms: bottoms.length,
  //     tops: tops.length,
  //   });

  return {
    bottoms,
    tops,
    debugEvents,
    selectionStrategy: undefined,
    admissibleCandidateCount: bottoms.length + tops.length,
  };
}

export function calculateCalibration(
  samples: MotionSample[],
  axis?: CalibrationAxis,
  parameters?: CalibrationParameters,
  expectedReps?: number,
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
    smoothingWindowSize: parameters?.smoothingWindowSize ?? PEAK_WINDOW_SIZE,
    rawDetectionStrategy:
      parameters?.rawDetectionStrategy ?? RAW_DETECTION_STRATEGY,
    minDistanceStrategy:
      parameters?.minDistanceStrategy ?? DEFAULT_MIN_DISTANCE_STRATEGY,
    selectionStrategy:
      parameters?.selectionStrategy ?? DEFAULT_SELECTION_STRATEGY,
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

  // Sélection de la stratégie de génération des candidats RAW.
  // La branche "direction_change" utilisera detectBottomsAndTopsV25()
  // une fois son implémentation terminée afin de comparer V2 et V2.5
  // sans modifier le reste du pipeline.

  let detectedEvents: DetectedCalibrationEvents;
  const rawDetectionStrategy = resolvedParameters.rawDetectionStrategy;

  if (rawDetectionStrategy === "direction_change") {
    detectedEvents = detectBottomsAndTopsV25(
      values,
      bottomZone,
      topZone,
      resolvedParameters.peakWindowSize,
      resolvedParameters.smoothingWindowSize,
    );
  } else {
    detectedEvents = detectBottomsAndTops(
      values,
      bottomZone,
      topZone,
      resolvedParameters.peakWindowSize,
    );
  }

  const rawSpacingSummary = summarizeRawCandidateSpacing(
    detectedEvents.rawDebugEvents,
  );

  // console.log("[CALIBRATION RAW SPACING BASELINE]", rawSpacingSummary);

  /*-----------------------------------------------------------*/
  const validatedEvents = validateCalibrationEvents(
    values,
    robustRange,
    detectedEvents.bottoms,
    detectedEvents.tops,
    resolvedParameters,
    expectedReps ?? REQUIRED_CALIBRATION_REPS,
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
      selectionStrategy: validatedEvents.selectionStrategy,
      admissibleCandidateCount: validatedEvents.admissibleCandidateCount,
      selectedChain: validatedEvents.selectedChain,
      selectionScore: validatedEvents.selectionScore,
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
