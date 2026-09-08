import { calculateCalibration, type MotionSample } from "../../mobile/RepMotion/analytics/calibration";
import type { Candidate } from "../../mobile/RepMotion/analytics/delayed-context-path/types";

// Diagnostic configuration copied exactly from the historical 007 harness.
export const historicalParameters = {
  rawDetectionStrategy: "local_extrema" as const,
  minimumDistanceSamples: 70, minimumProminenceRatio: 0.08,
  peakWindowSize: 8, smoothingWindowSize: 2, prominenceWindowSize: 8,
  selectionStrategy: "global_alternating_path" as const,
};
export function historical007Input(samples: MotionSample[]) {
  const calibration = calculateCalibration(samples, undefined, historicalParameters, 5);
  const debug = calibration.debug;
  if (!debug?.selectedChain?.length) throw new Error("HISTORICAL_DP_BOOTSTRAP_UNAVAILABLE");
  const raw = new Map<string, string>();
  for (const event of debug.rawCandidateDebugEvents) {
    const key = `${event.type}:${event.index}`;
    if (raw.has(key)) throw new Error(`CANDIDATE_IDENTITY_ERROR: ${key}`);
    raw.set(key, `${key}:1`);
  }
  const eligible = debug.filterDebugEvents.filter(e => e.filter === "DIRECTION_CHANGE" && e.kept);
  const candidatePool: Candidate[] = [...new Map(eligible.map(e => {
    const key = `${e.type}:${e.index}`, candidateId = raw.get(key);
    if (!candidateId) throw new Error(`CANDIDATE_IDENTITY_ERROR: ${key}`);
    return [key, { candidateId, type: e.type, index: e.index, value: e.value }] as const;
  })).values()];
  if (candidatePool.length !== eligible.length || candidatePool.length !== debug.admissibleCandidateCount)
    throw new Error("DP_INPUT_IDENTITY_MISMATCH");
  const values = samples.map(s => s[calibration.axis]);
  const selectedDpV1Chain = debug.selectedChain.map(p => {
    const found = candidatePool.find(c => c.type === p.type && c.index === p.index);
    if (!found) throw new Error("DP_BOOTSTRAP_NOT_ADMISSIBLE");
    return found;
  });
  return { calibration, input: { candidatePool, selectedDpV1Chain, values } };
}
