import type { NormalizedImuSample } from "../imu/types";
import type { Quaternion, Vector3 } from "./types";

const ANTIPARALLEL_EPSILON = 1e-12;

function meanAcceleration(
  samples: readonly NormalizedImuSample[],
): Vector3 {
  if (samples.length === 0) {
    throw new RangeError(
      "Initial orientation requires at least one accelerometer sample.",
    );
  }

  const total = { x: 0, y: 0, z: 0 };
  for (const sample of samples) {
    for (const axis of ["x", "y", "z"] as const) {
      const value = sample.accelMps2[axis];
      if (!Number.isFinite(value)) {
        throw new TypeError(
          `Initial orientation acceleration ${axis} must be finite.`,
        );
      }
      total[axis] += value;
    }
  }

  return {
    x: total.x / samples.length,
    y: total.y / samples.length,
    z: total.z / samples.length,
  };
}

/**
 * Estimates the zero-twist Hamilton quaternion that actively rotates the mean
 * calibrated body-frame acceleration onto world +Z. Yaw remains unobservable.
 */
export function estimateInitialOrientationFromAccel(
  samples: readonly NormalizedImuSample[],
): Quaternion {
  const mean = meanAcceleration(samples);
  const accelerationNorm = Math.hypot(mean.x, mean.y, mean.z);
  if (!Number.isFinite(accelerationNorm) || accelerationNorm <= 0) {
    throw new RangeError(
      "Initial orientation mean acceleration norm must be finite and non-zero.",
    );
  }

  const unit = {
    x: mean.x / accelerationNorm,
    y: mean.y / accelerationNorm,
    z: mean.z / accelerationNorm,
  };
  const horizontalNorm = Math.hypot(unit.x, unit.y);

  if (horizontalNorm <= ANTIPARALLEL_EPSILON) {
    return unit.z >= 0
      ? { w: 1, x: 0, y: 0, z: 0 }
      : { w: 0, x: 1, y: 0, z: 0 };
  }

  // Numerically stable equivalent of normalize(1 + uz, uy, -ux, 0),
  // including vectors close to the antiparallel world -Z direction.
  const tiltAngle = Math.atan2(horizontalNorm, unit.z);
  const sinHalfTilt = Math.sin(tiltAngle / 2);
  const inverseHorizontalNorm = 1 / horizontalNorm;

  return {
    w: Math.cos(tiltAngle / 2),
    x: unit.y * inverseHorizontalNorm * sinHalfTilt,
    y: -unit.x * inverseHorizontalNorm * sinHalfTilt,
    z: 0,
  };
}
