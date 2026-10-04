import assert from "node:assert/strict";
import test from "node:test";

import { applyGyroBias, estimateGyroBias } from "../analytics/imu/gyroBias";
import type { GyroBias, NormalizedImuSample } from "../analytics/imu/types";

function createSample(
  gyroRadPerSec: GyroBias,
  sampleIndex = 1,
  timestampMs = 50,
): NormalizedImuSample {
  return {
    accelMps2: { x: 1.5, y: -2.5, z: 9.7 },
    gyroRadPerSec: { ...gyroRadPerSec },
    sampleIndex,
    timestampMs,
  };
}

function assertApproximatelyEqual(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 1e-12,
    `expected ${actual} to be approximately ${expected}`,
  );
}

test("estimates a constant gyroscope bias", () => {
  const samples = Array.from({ length: 3 }, () =>
    createSample({ x: 0.1, y: -0.2, z: 0.05 }),
  );

  const bias = estimateGyroBias(samples);

  assertApproximatelyEqual(bias.x, 0.1);
  assertApproximatelyEqual(bias.y, -0.2);
  assertApproximatelyEqual(bias.z, 0.05);
});

test("estimates each gyroscope axis independently using its arithmetic mean", () => {
  const samples = [
    createSample({ x: 0.1, y: -0.6, z: 0.3 }),
    createSample({ x: 0.2, y: 0.3, z: 0.6 }),
    createSample({ x: 0.3, y: 0.9, z: 1.8 }),
  ];

  const bias = estimateGyroBias(samples);

  assertApproximatelyEqual(bias.x, 0.2);
  assertApproximatelyEqual(bias.y, 0.2);
  assertApproximatelyEqual(bias.z, 0.9);
});

test("rejects an empty static sample window", () => {
  assert.throws(
    () => estimateGyroBias([]),
    /Cannot estimate gyroscope bias from zero samples/,
  );
});

test("applies bias without changing acceleration or sample metadata", () => {
  const sample = createSample({ x: 0.15, y: -0.1, z: 0.04 }, 42, 2100);
  const bias: GyroBias = { x: 0.1, y: -0.2, z: 0.01 };

  const corrected = applyGyroBias(sample, bias);

  assertApproximatelyEqual(corrected.gyroRadPerSec.x, 0.05);
  assertApproximatelyEqual(corrected.gyroRadPerSec.y, 0.1);
  assertApproximatelyEqual(corrected.gyroRadPerSec.z, 0.03);
  assert.deepEqual(corrected.accelMps2, sample.accelMps2);
  assert.notStrictEqual(corrected.accelMps2, sample.accelMps2);
  assert.equal(corrected.sampleIndex, 42);
  assert.equal(corrected.timestampMs, 2100);
});

test("does not mutate the normalized sample or bias", () => {
  const sample = Object.freeze({
    ...createSample({ x: 0.15, y: -0.1, z: 0.04 }),
    accelMps2: Object.freeze({ x: 1.5, y: -2.5, z: 9.7 }),
    gyroRadPerSec: Object.freeze({ x: 0.15, y: -0.1, z: 0.04 }),
  });
  const bias = Object.freeze({ x: 0.1, y: -0.2, z: 0.01 });
  const sampleBefore = {
    ...sample,
    accelMps2: { ...sample.accelMps2 },
    gyroRadPerSec: { ...sample.gyroRadPerSec },
  };
  const biasBefore = { ...bias };

  applyGyroBias(sample, bias);

  assert.deepEqual(sample, sampleBefore);
  assert.deepEqual(bias, biasBefore);
});

test("centers the mean gyroscope value of the estimated static window", () => {
  const samples = [
    createSample({ x: 0.1, y: -0.4, z: 0.05 }),
    createSample({ x: 0.2, y: -0.2, z: 0.1 }),
    createSample({ x: 0.3, y: 0, z: 0.15 }),
  ];
  const bias = estimateGyroBias(samples);
  const corrected = samples.map((sample) => applyGyroBias(sample, bias));
  const correctedMean = estimateGyroBias(corrected);

  assertApproximatelyEqual(correctedMean.x, 0);
  assertApproximatelyEqual(correctedMean.y, 0);
  assertApproximatelyEqual(correctedMean.z, 0);
});
