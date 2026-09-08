import type {
  DelayedContextPath,
  FeatureValue,
} from "../types";
import type { CriterionName } from "../config";

export type SequenceFeatures = Record<CriterionName, FeatureValue>;

type PartialTemporalFeatures = {
  partialFullRepDurationCV: number | null;
  partialBottomToTopDurationCV: number | null;
  partialTopToBottomDurationCV: number | null;
  status: "AVAILABLE" | "PARTIAL_TEMPORAL_FEATURE_UNAVAILABLE";
};

// Calcule la moyenne d'une liste de valeurs numériques.
function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
// Milieu d'une suite 
function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2); // Trouver la position centrale

  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2 //Quand la suite est pair on fait la moyenne des 2 chiffres du milieu
    : sorted[midpoint]; // Sinon on retourne le chiffre du milieu donc le midpoint directement 
}

// Calcule l'écart-type : mesure à quel point les valeurs sont dispersées autour de leur moyenne.
// Les écarts sont mis au carré pour empêcher les valeurs positives et négatives de s'annuler.
// Plus l'écart-type est faible, plus les valeurs sont proches les unes des autres.

function populationStd(values: number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  return Math.sqrt(
    mean(values.map((value) => (value - average) ** 2)),
  );
}

// Mesure la régularité entre les reps tout en étant peu influencée par une rep anormale.
// Plus le MAD est faible, plus les valeurs sont régulières.

function medianAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const center = median(values);
  return median(values.map((value) => Math.abs(value - center)));
}

// mettre toutes les reps sur la même échelle pour comparer leur forme, même si elles n'ont pas exactement la même durée.

function resampleSignal(segment: number[], length: number): number[] {
  if (segment.length === 0 || length <= 0) return [];
  if (segment.length === 1) return Array(length).fill(segment[0]);
  return Array.from({ length }, (_, outputIndex) => {
    const sourcePosition =
      (outputIndex / (length - 1)) * (segment.length - 1);
    const left = Math.floor(sourcePosition);
    const right = Math.min(segment.length - 1, left + 1);
    const ratio = sourcePosition - left;
    return segment[left] * (1 - ratio) + segment[right] * ratio;
  });
}

function pearsonCorrelation(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) return 0;
  const leftMean = mean(left);
  const rightMean = mean(right);
  const numerator = left.reduce(
    (sum, value, index) =>
      sum + (value - leftMean) * (right[index] - rightMean),
    0,
  );
  const leftScale = Math.sqrt(
    left.reduce((sum, value) => sum + (value - leftMean) ** 2, 0),
  );
  const rightScale = Math.sqrt(
    right.reduce(
      (sum, value) => sum + (value - rightMean) ** 2,
      0,
    ),
  );
  return leftScale === 0 || rightScale === 0
    ? 0
    : numerator / (leftScale * rightScale);
}

function calculatePartialTemporalFeatures(
  path: DelayedContextPath,
): PartialTemporalFeatures {
  const completedRepCount = Math.floor((path.length - 1) / 2);

  if (completedRepCount < 2) {
    return {
      // CV (coefficient de variation) Un CV sert ici à comparer la variation des durées.
      partialFullRepDurationCV: null,
      partialBottomToTopDurationCV: null,
      partialTopToBottomDurationCV: null,
      status: "PARTIAL_TEMPORAL_FEATURE_UNAVAILABLE",
    };
  }
  const bottomToTop: number[] = [];
  const topToBottom: number[] = [];
  const fullRep: number[] = [];
  for (let rep = 0; rep < completedRepCount; rep += 1) {
    const bottomStart = path[rep * 2];
    const top = path[rep * 2 + 1];
    const bottomEnd = path[rep * 2 + 2];
    if (!bottomStart || !top || !bottomEnd) {
      throw new Error("PARTIAL_TEMPORAL_CALCULATION_ERROR");
    }
    bottomToTop.push(top.index - bottomStart.index);
    topToBottom.push(bottomEnd.index - top.index);
    fullRep.push(bottomEnd.index - bottomStart.index);
  }
  const coefficient = (numbers: number[]) => {
    const average = mean(numbers);
    return average === 0 ? null : populationStd(numbers) / average;
  };
  const features = {
    partialFullRepDurationCV: coefficient(fullRep),
    partialBottomToTopDurationCV: coefficient(bottomToTop),
    partialTopToBottomDurationCV: coefficient(topToBottom),
  };
  return {
    ...features,
    status: Object.values(features).some((value) => value === null)
      ? "PARTIAL_TEMPORAL_FEATURE_UNAVAILABLE"
      : "AVAILABLE",
  };
}

function calculatePartialTemporalScore(
  features: PartialTemporalFeatures,
): number | null {
  const available = [
    features.partialFullRepDurationCV,
    features.partialBottomToTopDurationCV,
    features.partialTopToBottomDurationCV,
  ].filter((value): value is number => value !== null);
  return available.length === 0 ? null : -mean(available);
}

export function scoreSequence(
  path: DelayedContextPath,
  cycles: number,
  values: number[],
): SequenceFeatures { /*Features = caractéristique | comme temporal ou shape*/
  const prefix = path.slice(0, cycles * 2 + 1);
  const amplitudes: number[] = [];
  const drifts: number[] = [];
  const jerks: number[] = [];
  const normalized: number[][] = [];

  for (let rep = 0; rep < cycles; rep += 1) {
    const bottom = prefix[rep * 2];
    const top = prefix[rep * 2 + 1];
    const end = prefix[rep * 2 + 2];
    amplitudes.push(
      (Math.abs(top.value - bottom.value) + Math.abs(top.value - end.value)) /
        2,
    );
    drifts.push(Math.abs(end.value - bottom.value));
    const segment = values.slice(bottom.index, end.index + 1);
    const diff = segment
      .slice(1)
      .map((value, index) => value - segment[index]);
    jerks.push(Math.sqrt(mean(diff.map((value) => value * value))));
    normalized.push(resampleSignal(segment, 100));
  }

  let shape: number[] | null = null;
  if (cycles >= 2) {
    const profile = Array.from({ length: 100 }, (_, point) =>
      median(normalized.map((cycle) => cycle[point])),
    );
    const correlations = normalized.map((cycle) =>
      pearsonCorrelation(cycle, profile),
    );
    if (correlations.every(Number.isFinite)) {
      shape = [
        mean(correlations),
        Math.min(...correlations),
        populationStd(correlations),
      ];
    }
  }

  const cv = (numbers: number[]) =>
    numbers.length < 2 || mean(numbers) === 0
      ? null
      : populationStd(numbers) / mean(numbers);

  return {
    ZERO_PROXY: mean(
      prefix.map((candidate) =>
        Math.abs(
          values[candidate.index] -
            values[Math.max(0, candidate.index - 1)],
        ),
      ),
    ),
    JERK_PROXY: mean(jerks),
    AMPLITUDE_PROXY:
      cycles < 3
        ? null
        : [
            cv(amplitudes) as number,
            medianAbsoluteDeviation(amplitudes),
            mean(drifts),
          ],
    TEMPORAL:
      cycles < 4
        ? null
        : calculatePartialTemporalScore(
            calculatePartialTemporalFeatures(prefix),
          ),
    SHAPE: cycles < 5 ? null : shape,
  };
}
