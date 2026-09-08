import {
  characterizationRanks,
  criteriaAtCycle,
  directions,
  type CriterionName,
} from "../../config";
import type { DelayedExecutionContext } from "../../execution/types";
import type { DelayedContextPath, FeatureValue } from "../../types";
import type { LocalReconstructionCandidate } from "./types";

type Contender = {
  row: LocalReconstructionCandidate | null;
  f: Record<string, FeatureValue>;
};

export type LocalReconstructionScore = {
  row: LocalReconstructionCandidate | null;
  path: DelayedContextPath;
  raw: Record<string, FeatureValue>;
  normalized: Record<string, number>;
  individualContributions: Record<string, number>;
  synergyContributions: Record<string, number>;
  score: number;
  rank: number;
  chosen: boolean;
};

export type LocalReconstructionSelection = {
  activePath: DelayedContextPath;
  winner: LocalReconstructionCandidate | null;
  reason: string;
  scores: LocalReconstructionScore[];
};

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function selectLocalReconstruction(
  activePath: DelayedContextPath,
  activeFeatures: Record<string, FeatureValue>,
  segmentRows: LocalReconstructionCandidate[],
  cycle: number,
  context: DelayedExecutionContext,
): LocalReconstructionSelection {
  const criteria = criteriaAtCycle[cycle];
  let winner: LocalReconstructionCandidate | null = null;
  let reason = "NO_WINNER";
  let scores: LocalReconstructionScore[] = [];

  if (!context.limit && segmentRows.length > 0) {
    const contenders: Contender[] = [
      { row: null, f: activeFeatures },
      ...segmentRows.map((row) => ({ row, f: row.f })),
    ];
    const normalizedByCriterion: Record<string, number[]> = {};
    for (const criterion of criteria) {
      const componentCount = Math.max(
        ...contenders.map((contender) =>
          Array.isArray(contender.f[criterion])
            ? (contender.f[criterion] as number[]).length
            : 1,
        ),
      );
      const componentScores = Array.from(
        { length: componentCount },
        (_, component) => {
          const raw = contenders.map((contender) => {
            const value = contender.f[criterion];
            return Array.isArray(value)
              ? value[component]
              : (value as number);
          });
          const oriented = raw.map((value) =>
            directions[criterion][component] === "HIGHER"
              ? value
              : -value,
          );
          const minimum = Math.min(...oriented);
          const maximum = Math.max(...oriented);
          return oriented.map((value) =>
            maximum === minimum
              ? 0.5
              : (value - minimum) / (maximum - minimum),
          );
        },
      );
      normalizedByCriterion[criterion] = contenders.map(
        (_, index) =>
          mean(componentScores.map((component) => component[index])),
      );
    }
    const weights = Object.fromEntries(
      criteria.map((criterion) => [
        criterion,
        1 / characterizationRanks[criterion],
      ]),
    ) as Record<CriterionName, number>;
    const synergyPairs: Array<[CriterionName, CriterionName]> = [];
    for (let left = 0; left < criteria.length; left += 1) {
      for (let right = left + 1; right < criteria.length; right += 1) {
        synergyPairs.push([criteria[left], criteria[right]]);
      }
    }
    const scored = contenders.map((contender, index) => {
      const normalized = Object.fromEntries(
        criteria.map((criterion) => [
          criterion,
          normalizedByCriterion[criterion][index],
        ]),
      ) as Record<string, number>;
      const individualContributions = Object.fromEntries(
        criteria.map((criterion) => [
          criterion,
          weights[criterion] * normalizedByCriterion[criterion][index],
        ]),
      ) as Record<string, number>;
      const synergyContributions: Record<string, number> = {};
      for (const [left, right] of synergyPairs) {
        const name = `${left}+${right}`;
        synergyContributions[name] =
          Math.sqrt(weights[left] * weights[right]) *
          Math.sqrt(
            normalizedByCriterion[left][index] *
              normalizedByCriterion[right][index],
          );
      }
      return {
        contender,
        normalized,
        individualContributions,
        synergyContributions,
        score: [
          ...Object.values(individualContributions),
          ...Object.values(synergyContributions),
        ].reduce((sum, value) => sum + value, 0),
      };
    });
    const maximum = Math.max(...scored.map((entry) => entry.score));
    const winners = scored.filter(
      (entry) => Math.abs(entry.score - maximum) <= 1e-12,
    );
    const ordered = [...scored].sort(
      (left, right) => right.score - left.score,
    );
    if (winners.length === 1) {
      winner = winners[0].contender.row;
      reason = winner
        ? "UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER"
        : "ACTIVE_PATH_BEST_DYNAMIC_WEIGHTED_PROMOTION";
    } else {
      reason = "DYNAMIC_WEIGHTED_PROMOTION_SCORE_TIE";
      context.decisionConflicts += 1;
    }
    scores = scored.map((entry) => ({
      row: entry.contender.row,
      path: entry.contender.row?.chain ?? [...activePath],
      raw: entry.contender.f,
      normalized: entry.normalized,
      individualContributions: entry.individualContributions,
      synergyContributions: entry.synergyContributions,
      score: entry.score,
      rank:
        1 +
        ordered.filter(
          (other) => other.score > entry.score + 1e-12,
        ).length,
      chosen: winners.length === 1 && entry === winners[0],
    }));
  }

  context.decisions += 1;
  if (winner && !context.limit) {
    context.backtracking += 1;
    return { activePath: winner.chain, winner, reason, scores };
  }
  return { activePath, winner, reason, scores };
}
