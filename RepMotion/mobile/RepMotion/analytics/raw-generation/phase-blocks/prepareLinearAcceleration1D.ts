import type { MotionSample } from "../../calibration";
import { estimateStaticBaseline } from "./estimateStaticBaseline";
import { estimateMovementAxis } from "./estimateMovementAxis";
import { projectAcceleration1D } from "./projectAcceleration1D";
import type { PreparedLinearAcceleration1D, PrepareLinearAcceleration1DOptions } from "./types";

/** MPU6050 nominal ±2 g sensitivity; an unverified assumption for historical captures. */
export const NOMINAL_MPU6050_COUNTS_PER_G = 16384;
export const GRAVITY_MPS2 = 9.80665;

/**
 * Prepares signed linear acceleration in m/s², without integration.
 * Requires an externally justified rest window, approximately constant bias and
 * fixed sensor orientation. PCA cannot establish these physical assumptions.
 * countsPerG is mandatory; there is no implicit sensor sensitivity.
 */
export function prepareLinearAcceleration1D(
  samples: readonly MotionSample[],
  options: PrepareLinearAcceleration1DOptions,
): PreparedLinearAcceleration1D {
  const { countsPerG, baselineWindow, axisStrategy } = options;
  if (!Number.isFinite(countsPerG) || countsPerG <= 0) {
    throw new RangeError("countsPerG must be finite and strictly positive.");
  }
  const baseline = estimateStaticBaseline(samples, baselineWindow.startIndex, baselineWindow.endIndex);
  const dynamicAcceleration = samples.map((sample, index) => {
    if (!sample || ![sample.ax, sample.ay, sample.az].every(Number.isFinite)) {
      throw new TypeError(`Non-finite acceleration sample at index ${index}.`);
    }
    return { x: sample.ax - baseline.x, y: sample.ay - baseline.y, z: sample.az - baseline.z };
  });
  const axisEstimate = estimateMovementAxis(dynamicAcceleration, axisStrategy);
  const acceleration1D = projectAcceleration1D(dynamicAcceleration, axisEstimate.movementAxis).map(value => {
    const converted = (value / countsPerG) * GRAVITY_MPS2;
    if (!Number.isFinite(converted)) throw new RangeError("Converted acceleration exceeds the numeric range.");
    return converted;
  });
  return { acceleration1D, baseline, countsPerG, ...axisEstimate };
}
