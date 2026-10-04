import assert from "node:assert/strict";
import test from "node:test";

import type { NormalizedImuSample } from "../analytics/imu/types";
import { estimateInitialOrientationFromAccel } from "../analytics/orientation/initialOrientation";
import { rotateBodyToWorld } from "../analytics/orientation/gravityCompensation";
import type { Quaternion, Vector3 } from "../analytics/orientation/types";

const GRAVITY = 9.80665;
const IDENTITY_QUATERNION: Quaternion = { w: 1, x: 0, y: 0, z: 0 };

function createSample(accelMps2: Vector3, index = 0): NormalizedImuSample {
  return {
    accelMps2,
    gyroRadPerSec: { x: 0, y: 0, z: 0 },
    sampleIndex: index,
    timestampMs: index * 50,
  };
}

function assertApproximatelyEqual(
  actual: number,
  expected: number,
  tolerance = 1e-12,
): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function assertVectorApproximatelyEqual(
  actual: Vector3,
  expected: Vector3,
  tolerance = 1e-10,
): void {
  assertApproximatelyEqual(actual.x, expected.x, tolerance);
  assertApproximatelyEqual(actual.y, expected.y, tolerance);
  assertApproximatelyEqual(actual.z, expected.z, tolerance);
}

function quaternionNorm(quaternion: Quaternion): number {
  return Math.hypot(
    quaternion.w,
    quaternion.x,
    quaternion.y,
    quaternion.z,
  );
}

test("returns identity for acceleration aligned with world positive Z", () => {
  assert.deepEqual(
    estimateInitialOrientationFromAccel([
      createSample({ x: 0, y: 0, z: GRAVITY }),
    ]),
    IDENTITY_QUATERNION,
  );
});

test("recovers a simple positive X-axis tilt", () => {
  const angle = Math.PI / 6;
  const quaternion = estimateInitialOrientationFromAccel([
    createSample({
      x: 0,
      y: GRAVITY * Math.sin(angle),
      z: GRAVITY * Math.cos(angle),
    }),
  ]);

  assertApproximatelyEqual(quaternion.w, Math.cos(angle / 2));
  assertApproximatelyEqual(quaternion.x, Math.sin(angle / 2));
  assertApproximatelyEqual(quaternion.y, 0);
  assertApproximatelyEqual(quaternion.z, 0);
});

test("recovers a simple positive Y-axis tilt", () => {
  const angle = Math.PI / 4;
  const quaternion = estimateInitialOrientationFromAccel([
    createSample({
      x: -GRAVITY * Math.sin(angle),
      y: 0,
      z: GRAVITY * Math.cos(angle),
    }),
  ]);

  assertApproximatelyEqual(quaternion.w, Math.cos(angle / 2));
  assertApproximatelyEqual(quaternion.x, 0);
  assertApproximatelyEqual(quaternion.y, Math.sin(angle / 2));
  assertApproximatelyEqual(quaternion.z, 0);
});

test("aligns an arbitrary mean acceleration with world positive Z", () => {
  const samples = [
    createSample({ x: 2.9, y: -4.2, z: 8.1 }, 0),
    createSample({ x: 3.1, y: -3.8, z: 7.9 }, 1),
  ];
  const mean = { x: 3, y: -4, z: 8 };
  const quaternion = estimateInitialOrientationFromAccel(samples);
  const rotated = rotateBodyToWorld(mean, quaternion);

  assertVectorApproximatelyEqual(rotated, {
    x: 0,
    y: 0,
    z: Math.hypot(mean.x, mean.y, mean.z),
  });
  assertApproximatelyEqual(quaternionNorm(quaternion), 1);
});

test("is invariant to acceleration amplitude", () => {
  const direction = { x: 1, y: -2, z: 3 };
  const scaledDirection = { x: 10, y: -20, z: 30 };

  const first = estimateInitialOrientationFromAccel([
    createSample(direction),
  ]);
  const second = estimateInitialOrientationFromAccel([
    createSample(scaledDirection),
  ]);

  assertApproximatelyEqual(first.w, second.w);
  assertApproximatelyEqual(first.x, second.x);
  assertApproximatelyEqual(first.y, second.y);
  assertApproximatelyEqual(first.z, second.z);
});

test("rejects NaN and Infinity acceleration components", () => {
  for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () =>
        estimateInitialOrientationFromAccel([
          createSample({ x: invalid, y: 0, z: GRAVITY }),
        ]),
      /must be finite/,
    );
  }
});

test("rejects empty and zero-mean acceleration windows", () => {
  assert.throws(
    () => estimateInitialOrientationFromAccel([]),
    /at least one accelerometer sample/,
  );
  assert.throws(
    () =>
      estimateInitialOrientationFromAccel([
        createSample({ x: 1, y: 0, z: 0 }, 0),
        createSample({ x: -1, y: 0, z: 0 }, 1),
      ]),
    /norm must be finite and non-zero/,
  );
});

test("handles exact and near-antiparallel gravity without NaN", () => {
  for (const acceleration of [
    { x: 0, y: 0, z: -GRAVITY },
    { x: 1e-10, y: -2e-10, z: -GRAVITY },
  ]) {
    const quaternion = estimateInitialOrientationFromAccel([
      createSample(acceleration),
    ]);
    const rotated = rotateBodyToWorld(acceleration, quaternion);

    assert.ok(Object.values(quaternion).every(Number.isFinite));
    assertApproximatelyEqual(quaternionNorm(quaternion), 1);
    assertVectorApproximatelyEqual(
      rotated,
      {
        x: 0,
        y: 0,
        z: Math.hypot(acceleration.x, acceleration.y, acceleration.z),
      },
      1e-9,
    );
  }
});

test("does not mutate samples or their acceleration vectors", () => {
  const samples = Object.freeze([
    Object.freeze({
      ...createSample({ x: 1, y: 2, z: 9 }, 0),
      accelMps2: Object.freeze({ x: 1, y: 2, z: 9 }),
      gyroRadPerSec: Object.freeze({ x: 0, y: 0, z: 0 }),
    }),
  ]);
  const before = JSON.parse(JSON.stringify(samples));

  estimateInitialOrientationFromAccel(samples);

  assert.deepEqual(samples, before);
});
