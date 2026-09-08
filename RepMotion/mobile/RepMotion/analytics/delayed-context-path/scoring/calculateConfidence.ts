import type { FeatureValue } from "../types";
import {
  directions,
  type CriterionName,
} from "../config";
import type { SequenceFeatures } from "./scoreSequence";

export type CriterionConfidence = Partial<Record<CriterionName, number>>;

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

export function calculateConfidence(
  activeFeatures: SequenceFeatures,
  candidateFeatures: SequenceFeatures[],
  criteria: CriterionName[],
): CriterionConfidence {
  const confidence = {} as CriterionConfidence;

  for (const criterion of criteria) {
    const allValues: FeatureValue[] = [
      activeFeatures[criterion],
      ...candidateFeatures.map((features) => features[criterion]),
    ];
    const componentCount = Math.max(
      ...allValues.map((value) =>
        Array.isArray(value) ? value.length : 1,
      ),
    );
    const componentConfidences: number[] = [];

    for (let component = 0; component < componentCount; component += 1) {
      const raw = allValues.map((value) =>
        Array.isArray(value) ? value[component] : (value as number),
      );
      const oriented = raw.map((value) =>
        directions[criterion][component] === "HIGHER" ? value : -value,
      );
      const minimum = Math.min(...oriented);
      const maximum = Math.max(...oriented);
      const range = maximum - minimum;
      const rawMedian = median(oriented);
      const dispersion = median(
        oriented.map((value) => Math.abs(value - rawMedian)),
      );

      componentConfidences.push(
        range === 0 ? 0 : range / (range + dispersion),
      );
    }

    confidence[criterion] = mean(componentConfidences);
  }

  return confidence;
}
