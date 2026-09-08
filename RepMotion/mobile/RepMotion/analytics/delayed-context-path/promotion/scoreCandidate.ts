import type { Candidate } from "../types";
import type { CriterionName } from "../config";
import type { SequenceFeatures } from "../scoring/scoreSequence";
import type { NormalizedFeatures } from "../scoring/normalizeFeatures";
import type { CriterionWeights } from "../scoring/weights";
import type { CriterionConfidence } from "../scoring/calculateConfidence";

export type CandidateContributions = Partial<
  Record<CriterionName, number>
>;

export type ScoredCandidate = {
  candidate: Candidate;
  features: SequenceFeatures;
  normalized: NormalizedFeatures;
  contributions: CandidateContributions;
  score: number;
};

export function scoreCandidate(
  candidate: Candidate,
  features: SequenceFeatures,
  normalized: NormalizedFeatures,
  weights: CriterionWeights,
  confidence: CriterionConfidence,
  criteria: CriterionName[],
): ScoredCandidate {
  const contributions = Object.fromEntries(
    criteria.map((criterion) => [
      criterion,
      (normalized[criterion] as number) *
        (weights[criterion] as number) *
        (confidence[criterion] as number),
    ]),
  ) as CandidateContributions;

  return {
    candidate,
    features,
    normalized,
    contributions,
    score: Object.values(contributions).reduce(
      (sum, value) => sum + value,
      0,
    ),
  };
}
