import type { GyroBias, NormalizedImuSample } from "./types";

export function estimateGyroBias(
  samples: readonly NormalizedImuSample[],
): GyroBias {
  if (samples.length === 0) {
    throw new Error("Cannot estimate gyroscope bias from zero samples.");
  }

  const total = samples.reduce<GyroBias>(
    (sum, sample) => ({
      x: sum.x + sample.gyroRadPerSec.x,
      y: sum.y + sample.gyroRadPerSec.y,
      z: sum.z + sample.gyroRadPerSec.z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: total.x / samples.length,
    y: total.y / samples.length,
    z: total.z / samples.length,
  };
}

export function applyGyroBias(
  sample: Readonly<NormalizedImuSample>,
  bias: Readonly<GyroBias>,
): NormalizedImuSample {
  return {
    accelMps2: { ...sample.accelMps2 },
    gyroRadPerSec: {
      x: sample.gyroRadPerSec.x - bias.x,
      y: sample.gyroRadPerSec.y - bias.y,
      z: sample.gyroRadPerSec.z - bias.z,
    },
    sampleIndex: sample.sampleIndex,
    timestampMs: sample.timestampMs,
  };
}
