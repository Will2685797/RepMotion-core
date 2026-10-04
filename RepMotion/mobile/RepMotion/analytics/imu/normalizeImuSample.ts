import type { ImuSampleV2 } from "../../types/imu";
import type { NormalizedImuSample, SensorScaleConfig } from "./types";

const STANDARD_GRAVITY_MPS2 = 9.80665;

export function normalizeImuSample(
  sample: Readonly<ImuSampleV2>,
  config: Readonly<SensorScaleConfig>,
): NormalizedImuSample {
  const normalizeAcceleration = (rawValue: number): number =>
    (rawValue * STANDARD_GRAVITY_MPS2) / config.accelCountsPerG;
  const normalizeGyroscope = (rawValue: number): number =>
    (rawValue * Math.PI) / (config.gyroCountsPerDegPerSec * 180);

  return {
    accelMps2: {
      x: normalizeAcceleration(sample.ax),
      y: normalizeAcceleration(sample.ay),
      z: normalizeAcceleration(sample.az),
    },
    gyroRadPerSec: {
      x: normalizeGyroscope(sample.gx),
      y: normalizeGyroscope(sample.gy),
      z: normalizeGyroscope(sample.gz),
    },
    sampleIndex: sample.sampleIndex,
    timestampMs: sample.timestampMs,
  };
}
