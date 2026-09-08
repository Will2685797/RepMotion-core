import type { FeatureValue } from "../types";
import {
  directions,
  type CriterionName,
} from "../config";
import type { SequenceFeatures } from "./scoreSequence";

export type NormalizedFeatures = Partial<Record<CriterionName, number>>;

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function normalizeFeatures(
  activeFeatures: SequenceFeatures,
  candidateFeatures: SequenceFeatures[],
  criteria: CriterionName[],
): NormalizedFeatures[] {
  const contributionsByCriterion = {} as Record<CriterionName, number[]>;

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
    const componentContributions: number[][] = [];

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

      componentContributions.push(
        oriented
          .slice(1)
          .map((value) =>
            range === 0 ? 0 : 2 * ((value - minimum) / range) - 1,
          ),
      );
    }

    contributionsByCriterion[criterion] = candidateFeatures.map(
      (_, index) =>
        mean(
          componentContributions.map(
            (component) => component[index],
          ),
        ),
    );
  }

  return candidateFeatures.map((_, index) =>
    Object.fromEntries(
      criteria.map((criterion) => [
        criterion,
        contributionsByCriterion[criterion][index],
      ]),
    ) as NormalizedFeatures,
  );
}
