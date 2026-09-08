import {
  calculateCalibration,
  type CalibrationAxis,
  type CalibrationParameters,
  type MotionSample,
} from "./calibration";
import type { DelayedContextPathInput } from "./delayed-context-path/delayedContextPath";

/** Explicit DP V1 bootstrap; the application's default calibration is unchanged. */
export function prepareDelayedContextInput(
  samples: MotionSample[],
  axis?: CalibrationAxis,
  parameters?: Omit<CalibrationParameters, "selectionStrategy">,
  expectedReps?: number,
) {
  const calibration = calculateCalibration(samples, axis, {
    ...parameters,
    selectionStrategy: "global_alternating_path",
  }, expectedReps);
  const debug = calibration.debug;
  if (!debug || debug.selectionStrategy !== "global_alternating_path" ||
      !debug.selectedChain?.length) {
    throw new Error("DP_V1_BOOTSTRAP_UNAVAILABLE");
  }
  // Preserve RAW order and values. IDs identify existing detections only.
  const candidatePool = debug.rawCandidateDebugEvents.map(({ type, index, value }) => ({
    candidateId: `RAW_${type}_${index}`, type, index, value,
  }));
  const byIdentity = new Map(candidatePool.map(candidate =>
    [`${candidate.type}:${candidate.index}`, candidate]));
  const selectedDpV1Chain = debug.selectedChain.map(({ type, index }) => {
    const candidate = byIdentity.get(`${type}:${index}`);
    if (!candidate) throw new Error(`DP_V1_CANDIDATE_NOT_RAW: ${type}:${index}`);
    return candidate;
  });
  const input: DelayedContextPathInput = {
    candidatePool,
    selectedDpV1Chain,
    values: samples.map(sample => sample[calibration.axis]),
  };
  return { calibration, input };
}
