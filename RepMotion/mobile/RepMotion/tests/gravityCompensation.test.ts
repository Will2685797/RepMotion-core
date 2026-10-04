import assert from "node:assert/strict";
import test from "node:test";

import {
  computeLinearAccelerationWorld,
  removeGravity,
  rotateBodyToWorld,
  STANDARD_GRAVITY_MPS2,
} from "../analytics/orientation/gravityCompensation";
import type { Quaternion, Vector3 } from "../analytics/orientation/types";

const IDENTITY_QUATERNION: Quaternion = { w: 1, x: 0, y: 0, z: 0 };

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
  tolerance = 1e-12,
): void {
  assertApproximatelyEqual(actual.x, expected.x, tolerance);
  assertApproximatelyEqual(actual.y, expected.y, tolerance);
  assertApproximatelyEqual(actual.z, expected.z, tolerance);
}

test("identity quaternion leaves a body vector unchanged", () => {
  const vector = { x: 1, y: 2, z: 3 };

  assertVectorApproximatelyEqual(
    rotateBodyToWorld(vector, IDENTITY_QUATERNION),
    vector,
  );
});

test("positive 90 degree Z rotation maps body X to world Y", () => {
  const quaternion = {
    w: Math.SQRT1_2,
    x: 0,
    y: 0,
    z: Math.SQRT1_2,
  };

  assertVectorApproximatelyEqual(
    rotateBodyToWorld({ x: 1, y: 0, z: 0 }, quaternion),
    { x: 0, y: 1, z: 0 },
  );
});

test("180 degree X rotation reverses body Y and Z", () => {
  const quaternion = { w: 0, x: 1, y: 0, z: 0 };

  assertVectorApproximatelyEqual(
    rotateBodyToWorld({ x: 0, y: 1, z: 0 }, quaternion),
    { x: 0, y: -1, z: 0 },
  );
  assertVectorApproximatelyEqual(
    rotateBodyToWorld({ x: 0, y: 0, z: 1 }, quaternion),
    { x: 0, y: 0, z: -1 },
  );
});

test("rotation preserves vector magnitude", () => {
  const vector = { x: 1.25, y: -4.5, z: 2.75 };
  const quaternion = {
    w: Math.SQRT1_2,
    x: 0,
    y: Math.SQRT1_2,
    z: 0,
  };
  const rotated = rotateBodyToWorld(vector, quaternion);

  assertApproximatelyEqual(
    Math.hypot(rotated.x, rotated.y, rotated.z),
    Math.hypot(vector.x, vector.y, vector.z),
  );
});

test("removes standard gravity from aligned resting acceleration", () => {
  assertVectorApproximatelyEqual(
    removeGravity({ x: 0, y: 0, z: STANDARD_GRAVITY_MPS2 }),
    { x: 0, y: 0, z: 0 },
  );
});

test("preserves world XY and removes gravity from world Z", () => {
  assertVectorApproximatelyEqual(
    removeGravity({ x: 1.2, y: -0.5, z: 10.80665 }),
    { x: 1.2, y: -0.5, z: 1 },
  );
});

test("does not mutate vectors or quaternion and returns finite outputs", () => {
  const vectorBody = Object.freeze({ x: 1, y: 2, z: 3 });
  const quaternion = Object.freeze({
    w: Math.SQRT1_2,
    x: 0,
    y: 0,
    z: Math.SQRT1_2,
  });
  const accelWorld = Object.freeze({ x: 1.2, y: -0.5, z: 10.80665 });
  const vectorBefore = { ...vectorBody };
  const quaternionBefore = { ...quaternion };
  const accelBefore = { ...accelWorld };

  const rotated = rotateBodyToWorld(vectorBody, quaternion);
  const linear = removeGravity(accelWorld);

  assert.deepEqual(vectorBody, vectorBefore);
  assert.deepEqual(quaternion, quaternionBefore);
  assert.deepEqual(accelWorld, accelBefore);
  assert.ok([...Object.values(rotated), ...Object.values(linear)].every(Number.isFinite));
});

test("matches the Mahony body-to-world convention for tilted gravity", () => {
  const quaternion = {
    w: Math.SQRT1_2,
    x: Math.SQRT1_2,
    y: 0,
    z: 0,
  };
  const gravityBody = { x: 0, y: STANDARD_GRAVITY_MPS2, z: 0 };

  assertVectorApproximatelyEqual(
    computeLinearAccelerationWorld(gravityBody, quaternion),
    { x: 0, y: 0, z: 0 },
  );
});
