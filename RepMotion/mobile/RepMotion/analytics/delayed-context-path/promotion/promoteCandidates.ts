import type {
  Candidate,
  DelayedContextPath,
} from "../types";
import {
  criteriaAtCycle,
  dynamicTopN,
  type CriterionName,
} from "../config";
import type { DelayedExecutionContext } from "../execution/types";
import { buildConditionalAlternatives } from "../reconstruction/system-c/buildConditionalAlternatives";
import type { ConditionalAlternatives } from "../reconstruction/shared/types";
import { validatePath } from "../validation/validatePath";
import {
  scoreSequence,
  type SequenceFeatures,
} from "../scoring/scoreSequence";
import { normalizeFeatures } from "../scoring/normalizeFeatures";
import { calculateConfidence } from "../scoring/calculateConfidence";
import { calculateWeights } from "../scoring/weights";
import {
  scoreCandidate,
  type ScoredCandidate,
} from "./scoreCandidate";
import type { PromisingAlternatives } from "./types";

type DynamicCandidate = {
  candidate: Candidate;
  features: SequenceFeatures;
};

export type PromotionResult = {
  promisingAlternatives: PromisingAlternatives;
  conditionalAlternatives: ConditionalAlternatives;
  promotedThisCycle: number;
};

export function promoteCandidates(
  activePath: DelayedContextPath,
  candidatePool: Candidate[],
  cycle: number,
  values: number[],
  promisingAlternatives: PromisingAlternatives,
  conditionalAlternatives: ConditionalAlternatives,
  context: DelayedExecutionContext,
  onUnrepaired?: (candidate: Candidate, position: number) => void,
): PromotionResult {
  const criteria = criteriaAtCycle[cycle] as CriterionName[];
  const prefixLength = cycle * 2 + 1;
  const activeFeatures = scoreSequence(activePath, cycle, values);

  let promotedThisCycle = 0;

  for (
    let position = 0;
    position < prefixLength && !context.limit;
    position += 1
  ) {
    const dynamicCandidates: DynamicCandidate[] = [];

    for (const candidate of candidatePool) {
      if (
        candidate.type !== activePath[position].type ||
        candidate.index === activePath[position].index
      ) {
        continue;
      }

      context.rawEvaluated += 1;
      context.states += 1;
      if (context.states > context.maxStates) {
        context.limit = "MAX_STATES";
        break;
      }

      const candidatePath = [...activePath];
      candidatePath[position] = candidate;
      const prefix = candidatePath.slice(0, prefixLength);

      if (!validatePath(prefix)) {
        buildConditionalAlternatives(
          activePath,
          candidatePool,
          position,
          candidate,
          prefixLength,
          conditionalAlternatives,
          context,
          onUnrepaired,
        );
        continue;
      }

      const candidateFeatures = scoreSequence(
        candidatePath,
        cycle,
        values,
      );
      dynamicCandidates.push({
        candidate,
        features: candidateFeatures,
      });
    }

    if (dynamicCandidates.length === 0 || context.limit) {
      continue;
    }

    const candidateFeatures = dynamicCandidates.map(
      (entry) => entry.features,
    );
    const normalizedFeatures = normalizeFeatures(
      activeFeatures,
      candidateFeatures,
      criteria,
    );
    const confidence = calculateConfidence(
      activeFeatures,
      candidateFeatures,
      criteria,
    );
    const weights = calculateWeights(criteria);
    const scored: ScoredCandidate[] = dynamicCandidates
      .map((entry, index) =>
        scoreCandidate(
          entry.candidate,
          entry.features,
          normalizedFeatures[index],
          weights,
          confidence,
          criteria,
        ),
      )
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.candidate.index - right.candidate.index ||
          left.candidate.candidateId.localeCompare(
            right.candidate.candidateId,
          ),
      );

    scored.forEach((entry, rankIndex) => {
      const promoted = rankIndex < dynamicTopN;

      if (promoted) {
        const bucket = promisingAlternatives.get(position) ?? new Map();
        const key = `${entry.candidate.type}:${entry.candidate.index}`;

        if (!bucket.has(key)) {
          bucket.set(key, entry.candidate);
          context.promotedCount += 1;
          promotedThisCycle += 1;
        }

        promisingAlternatives.set(position, bucket);
      }
    });
  }

  const promisingSize = [...promisingAlternatives.values()].reduce(
    (sum, bucket) => sum + bucket.size,
    0,
  );
  const conditionalSize = [...conditionalAlternatives.values()].reduce(
    (sum, bucket) => sum + bucket.size,
    0,
  );
  context.maxPromising = Math.max(context.maxPromising, promisingSize);
  context.maxConditional = Math.max(
    context.maxConditional,
    conditionalSize,
  );
  if (promisingSize > context.maxAlternatives) {
    context.limit = "MAX_ALTERNATIVES";
  }

  return {
    promisingAlternatives,
    conditionalAlternatives,
    promotedThisCycle,
  };
}
