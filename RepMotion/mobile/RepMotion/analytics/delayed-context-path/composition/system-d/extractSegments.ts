import type { GeneratedReconstructionSegment } from "../../reconstruction/shared/types";
import type {
  DSegment,
  ExtractedSegments,
} from "./types";

function candidateKey(candidate: DSegment["replacements"][number]): string {
  return `${candidate.type}:${candidate.index}`;
}

function extractInto(
  rows: GeneratedReconstructionSegment[],
  source: string,
  map: Map<string, DSegment>,
): void {
  for (const row of rows) {
    const changed = row.chain
      .map((candidate, position) =>
        candidateKey(candidate) !== candidateKey(row.activeBefore[position])
          ? position
          : -1,
      )
      .filter((position) => position >= 0);
    if (!changed.length) continue;
    const start = Math.min(...changed);
    const end = Math.max(...changed);
    const replacements = row.chain.slice(start, end + 1);
    const signature = `${start}-${end}:${replacements
      .map(candidateKey)
      .join("|")}`;
    const existing = map.get(signature) ?? {
      id: "",
      start,
      end,
      replacements,
      signature,
      sources: new Set<string>(),
    };
    existing.sources.add(`${source}:D${row.cycle}`);
    map.set(signature, existing);
  }
}

export function extractSegments(
  systemARows: GeneratedReconstructionSegment[],
  systemCRows: GeneratedReconstructionSegment[],
): ExtractedSegments {
  const aMap = new Map<string, DSegment>();
  extractInto(systemARows, "A", aMap);
  const unionMap = new Map(aMap);
  extractInto(systemCRows, "C", unionMap);
  const segments = [...unionMap.values()].sort(
    (left, right) =>
      left.start - right.start ||
      left.end - right.end ||
      left.signature.localeCompare(right.signature),
  );
  segments.forEach((segment, index) => {
    segment.id = `S${String(index + 1).padStart(4, "0")}`;
  });
  const aSegments = [...aMap.values()];
  const cOnlySegments = segments.filter(
    (segment) => !aMap.has(segment.signature),
  );
  return { aSegments, cOnlySegments, segments };
}
