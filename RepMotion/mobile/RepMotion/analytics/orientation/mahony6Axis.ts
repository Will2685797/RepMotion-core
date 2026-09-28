import type { NormalizedImuSample } from "../imu/types";
import type { Mahony6Axis, Mahony6AxisConfig, Quaternion } from "./types";

const IDENTITY_QUATERNION: Quaternion = { w: 1, x: 0, y: 0, z: 0 };
const MIN_ACCEL_NORM = 1e-12;

function normalizeQuaternion(quaternion: Quaternion): Quaternion {
  const norm = Math.hypot(
    quaternion.w,
    quaternion.x,
    quaternion.y,
    quaternion.z,
  );

  return {
    w: quaternion.w / norm,
    x: quaternion.x / norm,
    y: quaternion.y / norm,
    z: quaternion.z / norm,
  };
}

/**
 * Mahony 6-axis orientation convention:
 * - Hamilton quaternion ordered as { w, x, y, z }.
 * - Right-handed body and world frames.
 * - q actively rotates body vectors into world coordinates:
 *   v_world = q ⊗ v_body ⊗ conjugate(q).
 * - Body-frame angular velocity follows qDot = 0.5 * q ⊗ [0, omega].
 * - At identity, a stationary accelerometer points along world +Z.
 */
export function createMahony6Axis(
  config: Readonly<Mahony6AxisConfig>,
): Mahony6Axis {
  if (!Number.isFinite(config.kp) || config.kp < 0) {
    throw new RangeError("Mahony kp must be finite and non-negative.");
  }
  if (!Number.isFinite(config.ki) || config.ki < 0) {
    throw new RangeError("Mahony ki must be finite and non-negative.");
  }

  const kp = config.kp;
  const ki = config.ki;
  let quaternion = { ...IDENTITY_QUATERNION };
  let integralError = { x: 0, y: 0, z: 0 };
  let previousTimestampMs: number | null = null;

  const getQuaternion = (): Quaternion => ({ ...quaternion });

  const reset = (): void => {
    quaternion = { ...IDENTITY_QUATERNION };
    integralError = { x: 0, y: 0, z: 0 };
    previousTimestampMs = null;
  };

  const update = (sample: Readonly<NormalizedImuSample>): Quaternion => {
    if (!Number.isFinite(sample.timestampMs)) {
      throw new RangeError("Mahony timestampMs must be finite.");
    }

    if (previousTimestampMs === null) {
      previousTimestampMs = sample.timestampMs;
      return getQuaternion();
    }

    const elapsedMs = sample.timestampMs - previousTimestampMs;
    if (elapsedMs <= 0) {
      throw new RangeError(
        "Mahony timestamps must be strictly increasing after the first sample.",
      );
    }
    const dtSeconds = elapsedMs / 1000;

    let errorX = 0;
    let errorY = 0;
    let errorZ = 0;
    const accelNorm = Math.hypot(
      sample.accelMps2.x,
      sample.accelMps2.y,
      sample.accelMps2.z,
    );

    if (Number.isFinite(accelNorm) && accelNorm > MIN_ACCEL_NORM) {
      const measuredX = sample.accelMps2.x / accelNorm;
      const measuredY = sample.accelMps2.y / accelNorm;
      const measuredZ = sample.accelMps2.z / accelNorm;

      const { w, x, y, z } = quaternion;
      const estimatedX = 2 * (x * z - w * y);
      const estimatedY = 2 * (w * x + y * z);
      const estimatedZ = 1 - 2 * (x * x + y * y);

      errorX = measuredY * estimatedZ - measuredZ * estimatedY;
      errorY = measuredZ * estimatedX - measuredX * estimatedZ;
      errorZ = measuredX * estimatedY - measuredY * estimatedX;

      if (ki > 0) {
        integralError = {
          x: integralError.x + ki * errorX * dtSeconds,
          y: integralError.y + ki * errorY * dtSeconds,
          z: integralError.z + ki * errorZ * dtSeconds,
        };
      }
    }

    if (ki === 0) {
      integralError = { x: 0, y: 0, z: 0 };
    }

    const correctedGyroX =
      sample.gyroRadPerSec.x + kp * errorX + integralError.x;
    const correctedGyroY =
      sample.gyroRadPerSec.y + kp * errorY + integralError.y;
    const correctedGyroZ =
      sample.gyroRadPerSec.z + kp * errorZ + integralError.z;

    const { w, x, y, z } = quaternion;
    const halfDt = 0.5 * dtSeconds;
    quaternion = normalizeQuaternion({
      w: w + (-x * correctedGyroX - y * correctedGyroY - z * correctedGyroZ) * halfDt,
      x: x + (w * correctedGyroX + y * correctedGyroZ - z * correctedGyroY) * halfDt,
      y: y + (w * correctedGyroY - x * correctedGyroZ + z * correctedGyroX) * halfDt,
      z: z + (w * correctedGyroZ + x * correctedGyroY - y * correctedGyroX) * halfDt,
    });
    previousTimestampMs = sample.timestampMs;

    return getQuaternion();
  };

  return { update, getQuaternion, reset };
}
