import type { CandidateKey, Position } from "../promotion/types";
import type { DSegment } from "./types";

function candidateKey(
  candidate: DSegment["replacements"][number],
): CandidateKey {
  return `${candidate.type}:${candidate.index}`;
}

export function validateSegmentCompatibility(
  assignments: Record<Position, CandidateKey>,
  segment: DSegment,
): boolean {
  for (let offset = 0; offset < segment.replacements.length; offset += 1) {
    const position = segment.start + offset;
    const proposed = candidateKey(segment.replacements[offset]);
    const prior = assignments[position];
    if (prior !== undefined && prior !== proposed) return false;
  }
  return true;
}
