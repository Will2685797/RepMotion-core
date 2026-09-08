import { criteriaAtCycle, type CriterionName } from "../../config";
import type { DelayedExecutionContext } from "../../execution/types";
import type { PromisingAlternatives } from "../../promotion/types";
import { calculateConfidence } from "../../scoring/calculateConfidence";
import { normalizeFeatures } from "../../scoring/normalizeFeatures";
import {
  scoreSequence,
  type SequenceFeatures,
} from "../../scoring/scoreSequence";
import { calculateWeights } from "../../scoring/weights";
import type { Candidate, DelayedContextPath } from "../../types";
import { validatePath } from "../../validation/validatePath";
import type {
  ConditionalAlternatives,
  LocalReconstructionCandidate,
  ProgressiveReconstructionState,
} from "./types";

export type ReconstructLocalPathsInput = {
  active: DelayedContextPath;
  promising: PromisingAlternatives;
  conditional: ConditionalAlternatives;
  cycle: number;
  values: number[];
  progressiveScoredMixed: boolean;
  context: DelayedExecutionContext;
};

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topKPathSignature(path: DelayedContextPath): string {
  return path
    .map((candidate) => `${candidate.type}:${candidate.index}`)
    .join("|");
}

function applySegment(
  pathValue: DelayedContextPath,
  start: number,
  candidates: Candidate[],
): DelayedContextPath {
  const next = [...pathValue];
  candidates.forEach((candidate, offset) => {
    next[start + offset] = candidate;
  });
  return next;
}

export function reconstructLocalPaths({
  active,
  promising,
  conditional,
  cycle,
  values,
  progressiveScoredMixed,
  context,
}: ReconstructLocalPathsInput): LocalReconstructionCandidate[] {
  const criteria = criteriaAtCycle[cycle];
  const prefixLength = cycle * 2 + 1;
  const activeFeatures = scoreSequence(active, cycle, values);
  const segmentRows: LocalReconstructionCandidate[] = [];

  for (const length of [2, 3, 4]) {
    for (
      let start = 0;
      start + length <= prefixLength && !context.limit;
      start += 1
    ) {
      const options = Array.from({ length }, (_, offset) => {
        const position = start + offset;
        return [
          active[position],
          ...(promising.get(position)?.values() ?? []),
        ];
      });
      const chosen: Candidate[] = [];
      const visit = (offset: number) => {
        if (context.limit) return;
        if (performance.now() - context.started > context.timeoutMs) {
          context.limit = "TIMEOUT";
          return;
        }
        if (offset === length) {
          if (
            chosen.every(
              (candidate, index) =>
                candidate.index === active[start + index].index,
            )
          ) {
            return;
          }
          context.segmentsReconstructed += 1;
          context.states += 1;
          if (context.segmentsReconstructed > context.maxSegments) {
            context.limit = "MAX_SEGMENTS";
            return;
          }
          const chain = applySegment(active, start, chosen);
          const prefixValid = validatePath(chain.slice(0, prefixLength));
          const fullValid = validatePath(chain);
          if (prefixValid && fullValid) {
            context.validSegments += 1;
            segmentRows.push({
              start,
              candidates: [...chosen],
              chain,
              f: scoreSequence(chain, cycle, values),
            });
          }
          return;
        }
        for (const option of options[offset]) {
          chosen.push(option);
          visit(offset + 1);
          chosen.pop();
          if (context.limit) return;
        }
      };
      visit(0);
    }
  }

  if (!context.limit) {
    for (const [position, bucket] of conditional) {
      for (const record of bucket.values()) {
        for (const repair of record.repairs.values()) {
          if (
            position >= prefixLength ||
            repair.position >= prefixLength ||
            Math.abs(position - repair.position) !== 1
          ) {
            continue;
          }
          context.coupledGenerated += 1;
          context.states += 1;
          if (context.states > context.maxStates) {
            context.limit = "MAX_STATES";
            break;
          }
          const chain = [...active];
          chain[position] = record.candidate;
          chain[repair.position] = repair.candidate;
          const valid =
            validatePath(chain.slice(0, prefixLength)) &&
            validatePath(chain);
          if (valid) {
            context.coupledValid += 1;
            context.validSegments += 1;
            const start = Math.min(position, repair.position);
            const candidates = chain.slice(start, start + 2);
            segmentRows.push({
              start,
              candidates,
              chain,
              f: scoreSequence(chain, cycle, values),
            });
          }
        }
      }
    }
  }

  if (progressiveScoredMixed && !context.progressiveGuard) {
    const scoreAndTopK = (
      hypotheses: ProgressiveReconstructionState[],
    ): ProgressiveReconstructionState[] => {
      if (!hypotheses.length) return [];
      const hypothesisFeatures = hypotheses.map((hypothesis) =>
        scoreSequence(hypothesis.path, cycle, values),
      );
      const activeCriteria = criteria.filter(
        (criterion) =>
          activeFeatures[criterion] !== null &&
          hypothesisFeatures.every((row) => row[criterion] !== null),
      );
      const weights = calculateWeights(activeCriteria);
      const confidence = calculateConfidence(
        activeFeatures,
        hypothesisFeatures,
        activeCriteria,
      );
      const normalized = normalizeFeatures(
        activeFeatures,
        hypothesisFeatures,
        activeCriteria,
      );

      hypotheses.forEach((hypothesis, index) => {
        const contributions = Object.fromEntries(
          activeCriteria.map((criterion) => [
            criterion,
            (normalized[index][criterion] as number) *
              (weights[criterion] as number) *
              (confidence[criterion] as number),
          ]),
        ) as Partial<Record<CriterionName, number>>;
        hypothesis.score = Object.values(contributions).reduce(
          (sum, value) => sum + value,
          0,
        );
        hypothesis.scoreDetail = {
          activeCriteria,
          raw: Object.fromEntries(
            activeCriteria.map((criterion) => [
              criterion,
              hypothesisFeatures[index][criterion],
            ]),
          ) as Partial<SequenceFeatures>,
          normalized: Object.fromEntries(
            activeCriteria.map((criterion) => [
              criterion,
              normalized[index][criterion],
            ]),
          ),
          weights,
          confidence,
          contributions,
        };
      });
      const ordered = [...hypotheses].sort(
        (left, right) =>
          right.score - left.score ||
          topKPathSignature(left.path).localeCompare(
            topKPathSignature(right.path),
          ),
      );
      ordered.forEach((hypothesis, index) => {
        hypothesis.rank = index + 1;
        hypothesis.survived = index < 3;
        context.progressiveScored += 1;
        if (!hypothesis.survived) context.progressivePruned += 1;
      });
      return ordered.slice(0, 3);
    };

    for (const [conditionalPosition, bucket] of conditional) {
      for (const record of bucket.values()) {
        for (const repair of record.repairs.values()) {
          if (
            context.progressiveGuard ||
            conditionalPosition >= prefixLength ||
            repair.position >= prefixLength ||
            Math.abs(conditionalPosition - repair.position) !== 1
          ) {
            continue;
          }
          const seedPath = [...active];
          seedPath[conditionalPosition] = record.candidate;
          seedPath[repair.position] = repair.candidate;
          context.progressiveStates += 1;
          context.progressiveGenerated += 1;
          if (context.progressiveStates > context.progressiveMaxStates) {
            context.progressiveGuard = "PROGRESSIVE_MAX_STATES";
            break;
          }
          if (
            performance.now() - context.progressiveStarted >
            context.progressiveTimeoutMs
          ) {
            context.progressiveGuard = "PROGRESSIVE_TIMEOUT";
            break;
          }
          if (
            !validatePath(seedPath.slice(0, prefixLength)) ||
            !validatePath(seedPath)
          ) {
            continue;
          }
          context.progressiveValid += 1;
          let survivors: ProgressiveReconstructionState[] = [
            {
              path: seedPath,
              start: Math.min(conditionalPosition, repair.position),
              end: Math.max(conditionalPosition, repair.position),
              conditionalPosition,
              conditionalCandidate: record.candidate,
              repairPosition: repair.position,
              repairCandidate: repair.candidate,
              depth: 0,
              score: 0,
              scoreDetail: {},
              rank: 1,
              survived: true,
            },
          ];
          for (
            let depth = 1;
            depth <= 2 &&
            survivors.length &&
            !context.progressiveGuard;
            depth += 1
          ) {
            const position = survivors[0].start - 1;
            if (
              position < 0 ||
              survivors[0].end - position + 1 > 4
            ) {
              break;
            }
            const extensions: ProgressiveReconstructionState[] = [];
            const uniqueAtDepth = new Map<
              string,
              ProgressiveReconstructionState
            >();
            for (const survivor of survivors) {
              for (const option of [
                active[position],
                ...(promising.get(position)?.values() ?? []),
              ]) {
                context.progressiveStates += 1;
                context.progressiveGenerated += 1;
                if (
                  context.progressiveStates >
                  context.progressiveMaxStates
                ) {
                  context.progressiveGuard = "PROGRESSIVE_MAX_STATES";
                  break;
                }
                if (
                  performance.now() - context.progressiveStarted >
                  context.progressiveTimeoutMs
                ) {
                  context.progressiveGuard = "PROGRESSIVE_TIMEOUT";
                  break;
                }
                const pathValue = [...survivor.path];
                pathValue[position] = option;
                if (
                  !validatePath(pathValue.slice(0, prefixLength)) ||
                  !validatePath(pathValue)
                ) {
                  continue;
                }
                context.progressiveValid += 1;
                const hypothesis: ProgressiveReconstructionState = {
                  ...survivor,
                  path: pathValue,
                  start: position,
                  depth,
                  score: 0,
                  scoreDetail: {},
                  rank: 0,
                  survived: false,
                };
                uniqueAtDepth.set(
                  topKPathSignature(pathValue),
                  hypothesis,
                );
              }
            }
            extensions.push(...uniqueAtDepth.values());
            const next = scoreAndTopK(extensions);
            survivors = next;
            for (const survivor of survivors) {
              const candidates = survivor.path.slice(
                survivor.start,
                survivor.end + 1,
              );
              segmentRows.push({
                start: survivor.start,
                candidates,
                chain: survivor.path,
                f: scoreSequence(survivor.path, cycle, values),
              });
              context.validSegments += 1;
            }
          }
        }
      }
    }
  }

  return segmentRows;
}
