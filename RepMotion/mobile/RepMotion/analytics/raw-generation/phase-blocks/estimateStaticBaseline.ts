import type { MotionSample } from "../../calibration";
import type { Vector3 } from "./types";

function updateMean(mean: number, value: number, count: number): number {
  const delta = value - mean;
  return Number.isFinite(delta)
    ? mean + delta / count
    : mean * ((count - 1) / count) + value / count;
}

/**
 * Mean RAW vector over [startIndex, endIndex), with no automatic rest detection.
 * The caller must establish rest. This reference removes static gravity response
 * and approximately constant bias only while sensor orientation remains fixed.
 */
export function estimateStaticBaseline(
  samples: readonly MotionSample[],
  startIndex: number,
  endIndex: number,
): Vector3 {
  if (
    !Number.isInteger(startIndex) || !Number.isInteger(endIndex) ||
    startIndex < 0 || endIndex > samples.length || startIndex >= endIndex
  ) {
    throw new RangeError("Baseline requires a non-empty, in-bounds [startIndex, endIndex) window.");
  }

  const baseline: Vector3 = { x: 0, y: 0, z: 0 };
  for (let index = startIndex; index < endIndex; index += 1) {
    const sample = samples[index];
    if (!sample || ![sample.ax, sample.ay, sample.az].every(Number.isFinite)) {
      throw new TypeError(`Non-finite acceleration sample at index ${index}.`);
    }
    const count = index - startIndex + 1;
    baseline.x = updateMean(baseline.x, sample.ax, count);
    baseline.y = updateMean(baseline.y, sample.ay, count);
    baseline.z = updateMean(baseline.z, sample.az, count);
  }
  return baseline;
}
