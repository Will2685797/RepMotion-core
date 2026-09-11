import type {
  Candidate,
  DelayedContextPath,
} from "../../types";
import { validatePath } from "../../validation/validatePath";
import type {
  ConditionalAlternative,
  ConditionalAlternatives,
  ConditionalRepair,
} from "../shared/types";
import type { DelayedExecutionContext } from "../../execution/types";

export function buildConditionalAlternatives(
  activePath: DelayedContextPath,
  candidatePool: Candidate[],
  position: number,
  candidate: Candidate,
  prefixLength: number,
  conditionalAlternatives: ConditionalAlternatives,
  context: DelayedExecutionContext,
  onUnrepaired?: (candidate: Candidate, position: number) => void,
): ConditionalAlternatives {
  const candidatePath = [...activePath];
  candidatePath[position] = candidate;
  const prefix = candidatePath.slice(0, prefixLength);

  if (validatePath(prefix)) {
    return conditionalAlternatives;
  }

  const repairs: ConditionalRepair[] = [];

  for (const neighborPosition of [position - 1, position + 1]) {
    if (
      neighborPosition < 0 ||
      neighborPosition >= prefixLength
    ) {
      continue;
    }

    for (const neighbor of candidatePool) {
      if (
        neighbor.type !== activePath[neighborPosition].type ||
        neighbor.index === activePath[neighborPosition].index
      ) {
        continue;
      }

      context.conditionalStates += 1;
      context.states += 1;
      if (context.states > context.maxStates) {
        context.limit = "MAX_STATES";
        break;
      }

      const repaired = [...candidatePath];
      repaired[neighborPosition] = neighbor;

      if (validatePath(repaired.slice(0, prefixLength))) {
        repairs.push({
          position: neighborPosition,
          candidate: neighbor,
        });
      }
    }
    if (context.limit) break;
  }

  if (repairs.length === 0 && !context.limit) {
    onUnrepaired?.(candidate, position);
  }
  if (repairs.length > 0 && !context.limit) {
    const bucket = conditionalAlternatives.get(position) ?? new Map();
    const candidateKey = `${candidate.type}:${candidate.index}`;
    const record: ConditionalAlternative = bucket.get(candidateKey) ?? {
      candidate,
      repairs: new Map(),
    };

    repairs.forEach((repair) =>
      record.repairs.set(
        `${repair.position}:${repair.candidate.type}:${repair.candidate.index}`,
        repair,
      ),
    );
    bucket.set(candidateKey, record);
    conditionalAlternatives.set(position, bucket);
  }

  return conditionalAlternatives;
}
