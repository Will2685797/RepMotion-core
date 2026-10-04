import assert from "node:assert/strict";
import test from "node:test";

import { normalizeImuSample } from "../analytics/imu/normalizeImuSample";
import type { SensorScaleConfig } from "../analytics/imu/types";
import type { ImuSampleV2 } from "../types/imu";

const CURRENT_SENSOR_SCALE: SensorScaleConfig = {
  accelCountsPerG: 16384,
  gyroCountsPerDegPerSec: 131,
};

const rawSample: ImuSampleV2 = {
  ax: 16384,
  ay: -16384,
  az: 0,
  gx: 131,
  gy: -131,
  gz: 0,
  sampleIndex: 42,
  timestampMs: 2100,
};

function assertApproximatelyEqual(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 1e-12,
    `expected ${actual} to be approximately ${expected}`,
  );
}

test("normalizes positive, negative, and zero acceleration to m/s²", () => {
  const normalized = normalizeImuSample(rawSample, CURRENT_SENSOR_SCALE);

  assertApproximatelyEqual(normalized.accelMps2.x, 9.80665);
  assertApproximatelyEqual(normalized.accelMps2.y, -9.80665);
  assert.equal(normalized.accelMps2.z, 0);
});

test("normalizes positive, negative, and zero gyroscope values to rad/s", () => {
  const normalized = normalizeImuSample(rawSample, CURRENT_SENSOR_SCALE);

  assertApproximatelyEqual(normalized.gyroRadPerSec.x, Math.PI / 180);
  assertApproximatelyEqual(normalized.gyroRadPerSec.y, -Math.PI / 180);
  assert.equal(normalized.gyroRadPerSec.z, 0);
});

test("preserves sampleIndex and timestampMs exactly", () => {
  const normalized = normalizeImuSample(rawSample, CURRENT_SENSOR_SCALE);

  assert.equal(normalized.sampleIndex, rawSample.sampleIndex);
  assert.equal(normalized.timestampMs, rawSample.timestampMs);
});

test("does not mutate the input sample or scale config", () => {
  const sample = Object.freeze({ ...rawSample });
  const config = Object.freeze({ ...CURRENT_SENSOR_SCALE });
  const sampleBefore = { ...sample };
  const configBefore = { ...config };

  normalizeImuSample(sample, config);

  assert.deepEqual(sample, sampleBefore);
  assert.deepEqual(config, configBefore);
});

test("uses a different explicit sensor scale without changing the algorithm", () => {
  const sample = { ...rawSample, ax: 8192 };
  const alternateScale: SensorScaleConfig = {
    accelCountsPerG: 8192,
    gyroCountsPerDegPerSec: 65.5,
  };

  const currentScaleResult = normalizeImuSample(sample, CURRENT_SENSOR_SCALE);
  const alternateScaleResult = normalizeImuSample(sample, alternateScale);

  assertApproximatelyEqual(currentScaleResult.accelMps2.x, 9.80665 / 2);
  assertApproximatelyEqual(alternateScaleResult.accelMps2.x, 9.80665);
  assert.notEqual(
    currentScaleResult.gyroRadPerSec.x,
    alternateScaleResult.gyroRadPerSec.x,
  );
});
