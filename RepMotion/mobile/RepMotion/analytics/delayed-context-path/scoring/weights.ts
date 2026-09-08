import {
  characterizationRanks,
  type CriterionName,
} from "../config";

export type CriterionWeights = Partial<Record<CriterionName, number>>;

export function calculateWeights(
  criteria: CriterionName[],
): CriterionWeights {
  return Object.fromEntries(
    criteria.map((criterion) => [
      criterion,
      1 / characterizationRanks[criterion],
    ]),
  ) as CriterionWeights;
}
