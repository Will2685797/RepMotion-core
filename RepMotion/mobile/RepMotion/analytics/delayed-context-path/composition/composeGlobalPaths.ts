import { scoreSequence } from "../scoring/scoreSequence";
import type { DelayedContextPath } from "../types";
import { validatePath } from "../validation/validatePath";
import type {
  DCompositionContext,
  DCompositionResult,
  DScoredPath,
  DSegment,
  DState,
  DUnique,
} from "./types";
import { validateSegmentCompatibility } from "./validateSegmentCompatibility";

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function candidateKey(
  candidate: DelayedContextPath[number],
): string {
  return `${candidate.type}:${candidate.index}`;
}

function pathSignature(path: DelayedContextPath): string {
  return path.map(candidateKey).join("|");
}

function minMax(values: number[]): number[] {
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    if (value < minimum) minimum = value;
    if (value > maximum) maximum = value;
  }
  return values.map((value) =>
    maximum === minimum ? 0.5 : (value - minimum) / (maximum - minimum),
  );
}

export function composeGlobalPaths(
  base: DelayedContextPath,
  segments: DSegment[],
  values: number[],
): DCompositionResult {
  const context: DCompositionContext = {
    started: performance.now(),
    maxCompositions: 1_000_000,
    maxUniquePaths: 200_000,
    examined: 0,
    structurallyRejected: 0,
    incompatibleOverlaps: 0,
    duplicates: 0,
    guard: null,
  };
  const uniquePaths = new Map<string, DUnique>();
  const queue: DState[] = [];

  const tryApply = (
    state: DState | null,
    segment: DSegment,
    index: number,
  ) => {
    context.examined += 1;
    if (context.examined > context.maxCompositions) {
      context.guard = "MAX_COMPOSITIONS";
      return;
    }
    const pathValue = state ? [...state.path] : [...base];
    const assignments = state ? { ...state.assignments } : {};
    if (!validateSegmentCompatibility(assignments, segment)) {
      context.incompatibleOverlaps += 1;
      return;
    }
    for (let offset = 0; offset < segment.replacements.length; offset += 1) {
      const position = segment.start + offset;
      const proposed = candidateKey(segment.replacements[offset]);
      pathValue[position] = segment.replacements[offset];
      assignments[position] = proposed;
    }
    if (state && pathSignature(pathValue) === pathSignature(state.path)) {
      return;
    }
    if (!validatePath(pathValue)) {
      context.structurallyRejected += 1;
      return;
    }
    const next: DState = {
      path: pathValue,
      assignments,
      segmentIds: [...(state?.segmentIds ?? []), segment.id],
      nextIndex: index,
    };
    const signature = pathSignature(pathValue);
    const provenance = next.segmentIds.join(" -> ");
    const existing = uniquePaths.get(signature);
    if (existing) {
      existing.provenances.add(provenance);
      context.duplicates += 1;
      if (next.segmentIds.length < existing.state.segmentIds.length) {
        existing.state = next;
      }
      return;
    }
    uniquePaths.set(signature, {
      state: next,
      provenances: new Set([provenance]),
    });
    queue.push(next);
    if (uniquePaths.size > context.maxUniquePaths) {
      context.guard = "MAX_UNIQUE_PATHS";
    }
  };

  for (
    let index = 0;
    index < segments.length && !context.guard;
    index += 1
  ) {
    tryApply(null, segments[index], index);
  }
  for (
    let cursor = 0;
    cursor < queue.length && !context.guard;
    cursor += 1
  ) {
    for (
      let index = queue[cursor].nextIndex + 1;
      index < segments.length && !context.guard;
      index += 1
    ) {
      tryApply(queue[cursor], segments[index], index);
    }
  }

  const composed = [...uniquePaths.entries()].map(
    ([composedPathSignature, entry]) => ({
      pathSignature: composedPathSignature,
      entry,
      feature: scoreSequence(entry.state.path, 5, values),
    }),
  );
  const temporalRaw = composed.map(
    (row) => row.feature.TEMPORAL as number,
  );
  const shapeRaw = composed.map(
    (row) => row.feature.SHAPE as number[],
  );
  const temporalNormalized = minMax(temporalRaw);
  const shapeComponents = [0, 1, 2].map((component) =>
    minMax(
      shapeRaw.map((value) =>
        component === 2 ? -value[component] : value[component],
      ),
    ),
  );
  const rows: DScoredPath[] = composed.map((row, index) => {
    const shapeScore = mean(
      shapeComponents.map((component) => component[index]),
    );
    return {
      path: row.pathSignature,
      temporal: temporalRaw[index],
      shapeRaw: JSON.stringify(shapeRaw[index]),
      shape: shapeScore,
      combined:
        0.5 * temporalNormalized[index] + 0.5 * shapeScore,
      segmentIds: row.entry.state.segmentIds.join(" -> "),
      provenanceCount: row.entry.provenances.size,
    };
  });
  const rank = (
    criterion: "temporal" | "shape" | "combined",
  ): DScoredPath[] =>
    [...rows].sort(
      (left, right) =>
        right[criterion] - left[criterion] ||
        left.path.localeCompare(right.path),
    );
  const temporalRanking = rank("temporal");
  const shapeRanking = rank("shape");
  const combinedRanking = rank("combined");

  return {
    uniquePaths,
    composed,
    rows,
    temporalRanking,
    shapeRanking,
    combinedRanking,
    temporalWinner: temporalRanking[0],
    shapeWinner: shapeRanking[0],
    combinedWinner: combinedRanking[0],
    context,
    elapsedMs: performance.now() - context.started,
  };
}
