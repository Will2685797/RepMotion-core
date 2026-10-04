import assert from "node:assert/strict";
import test from "node:test";

import type { NormalizedImuSample } from "../analytics/imu/types";
import { createMahony6Axis } from "../analytics/orientation/mahony6Axis";
import type { Quaternion } from "../analytics/orientation/types";

const IDENTITY_QUATERNION: Quaternion = { w: 1, x: 0, y: 0, z: 0 };

function createSample(
  timestampMs: number,
  options?: {
    accelMps2?: { x: number; y: number; z: number };
    gyroRadPerSec?: { x: number; y: number; z: number };
  },
): NormalizedImuSample {
  return {
    accelMps2: options?.accelMps2 ?? { x: 0, y: 0, z: 9.80665 },
    gyroRadPerSec: options?.gyroRadPerSec ?? { x: 0, y: 0, z: 0 },
    sampleIndex: timestampMs,
    timestampMs,
  };
}

function assertApproximatelyEqual(
  actual: number,
  expected: number,
  tolerance = 1e-10,
): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

function quaternionNorm(quaternion: Quaternion): number {
  return Math.hypot(
    quaternion.w,
    quaternion.x,
    quaternion.y,
    quaternion.z,
  );
}

function rotationAngle(quaternion: Quaternion): number {
  return 2 * Math.atan2(
    Math.hypot(quaternion.x, quaternion.y, quaternion.z),
    quaternion.w,
  );
}

test("starts at identity and does not integrate the first sample", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 1 });

  assert.deepEqual(filter.getQuaternion(), IDENTITY_QUATERNION);
  assert.deepEqual(
    filter.update(
      createSample(100, {
        accelMps2: { x: 0, y: 9.80665, z: 0 },
        gyroRadPerSec: { x: 1, y: 2, z: 3 },
      }),
    ),
    IDENTITY_QUATERNION,
  );
});

test("preserves historical behavior when no initial quaternion is provided", () => {
  const implicitIdentity = createMahony6Axis({ kp: 1, ki: 0 });
  const explicitIdentity = createMahony6Axis(
    { kp: 1, ki: 0 },
    IDENTITY_QUATERNION,
  );
  const samples = [
    createSample(0, { accelMps2: { x: 1, y: 2, z: 9 } }),
    createSample(50, {
      accelMps2: { x: 1.1, y: 1.9, z: 9.1 },
      gyroRadPerSec: { x: 0.01, y: -0.02, z: 0.03 },
    }),
  ];

  assert.deepEqual(
    samples.map((sample) => implicitIdentity.update(sample)),
    samples.map((sample) => explicitIdentity.update(sample)),
  );
});

test("starts exactly at a normalized supplied initial quaternion", () => {
  const supplied = Object.freeze({ w: 2, x: 2, y: 0, z: 0 });
  const filter = createMahony6Axis({ kp: 1, ki: 0 }, supplied);
  const expected = {
    w: Math.SQRT1_2,
    x: Math.SQRT1_2,
    y: 0,
    z: 0,
  };
  const actual = filter.getQuaternion();

  assertApproximatelyEqual(actual.w, expected.w);
  assertApproximatelyEqual(actual.x, expected.x);
  assertApproximatelyEqual(actual.y, expected.y);
  assertApproximatelyEqual(actual.z, expected.z);
  assert.deepEqual(filter.update(createSample(100)), actual);
  assert.deepEqual(supplied, { w: 2, x: 2, y: 0, z: 0 });
});

test("reset restores the supplied initial quaternion", () => {
  const initial = { w: Math.SQRT1_2, x: 0, y: Math.SQRT1_2, z: 0 };
  const filter = createMahony6Axis({ kp: 0, ki: 0 }, initial);
  const normalizedInitial = filter.getQuaternion();
  filter.update(createSample(0));
  filter.update(
    createSample(100, {
      accelMps2: { x: 0, y: 0, z: 0 },
      gyroRadPerSec: { x: 1, y: 0, z: 0 },
    }),
  );

  filter.reset();

  assert.deepEqual(filter.getQuaternion(), normalizedInitial);
  assert.deepEqual(filter.update(createSample(200)), normalizedInitial);
});

test("rejects invalid initial quaternions", () => {
  assert.throws(
    () =>
      createMahony6Axis(
        { kp: 1, ki: 0 },
        { w: Number.NaN, x: 0, y: 0, z: 0 },
      ),
    /must be finite/,
  );
  assert.throws(
    () =>
      createMahony6Axis(
        { kp: 1, ki: 0 },
        { w: Number.POSITIVE_INFINITY, x: 0, y: 0, z: 0 },
      ),
    /must be finite/,
  );
  assert.throws(
    () =>
      createMahony6Axis(
        { kp: 1, ki: 0 },
        { w: 0, x: 0, y: 0, z: 0 },
      ),
    /norm must be finite and non-zero/,
  );
});

test("keeps a normalized quaternion at aligned rest", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 0 });
  filter.update(createSample(0));

  for (let timestampMs = 10; timestampMs <= 1000; timestampMs += 10) {
    filter.update(createSample(timestampMs));
  }

  const quaternion = filter.getQuaternion();
  assert.deepEqual(quaternion, IDENTITY_QUATERNION);
  assertApproximatelyEqual(quaternionNorm(quaternion), 1);
});

test("locks the body-to-world convention for a positive Z rotation", () => {
  const filter = createMahony6Axis({ kp: 0, ki: 0 });
  const gyro = { x: 0, y: 0, z: Math.PI / 2 };
  filter.update(createSample(0, { accelMps2: { x: 0, y: 0, z: 0 }, gyroRadPerSec: gyro }));

  for (let timestampMs = 10; timestampMs <= 1000; timestampMs += 10) {
    filter.update(
      createSample(timestampMs, {
        accelMps2: { x: 0, y: 0, z: 0 },
        gyroRadPerSec: gyro,
      }),
    );
  }

  const quaternion = filter.getQuaternion();
  assertApproximatelyEqual(quaternion.w, Math.SQRT1_2, 3e-5);
  assertApproximatelyEqual(quaternion.x, 0);
  assertApproximatelyEqual(quaternion.y, 0);
  assertApproximatelyEqual(quaternion.z, Math.SQRT1_2, 3e-5);
  assertApproximatelyEqual(quaternionNorm(quaternion), 1);
});

test("uses timestamp deltas instead of a fixed sample interval", () => {
  const gyro = { x: 0, y: 0, z: 1 };
  const createUpdatedFilter = (elapsedMs: number) => {
    const filter = createMahony6Axis({ kp: 0, ki: 0 });
    filter.update(createSample(0));
    return filter.update(
      createSample(elapsedMs, {
        accelMps2: { x: 0, y: 0, z: 0 },
        gyroRadPerSec: gyro,
      }),
    );
  };

  const angle50Ms = rotationAngle(createUpdatedFilter(50));
  const angle100Ms = rotationAngle(createUpdatedFilter(100));

  assertApproximatelyEqual(angle100Ms / angle50Ms, 2, 0.002);
});

test("rejects equal and decreasing timestamps without changing state", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 0 });
  filter.update(createSample(100));

  assert.throws(
    () => filter.update(createSample(100)),
    /timestamps must be strictly increasing/,
  );
  assert.throws(
    () => filter.update(createSample(99)),
    /timestamps must be strictly increasing/,
  );
  assert.deepEqual(filter.getQuaternion(), IDENTITY_QUATERNION);
});

test("continues gyro-only with zero acceleration and finite output", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 0 });
  const zeroAccel = { x: 0, y: 0, z: 0 };
  filter.update(createSample(0, { accelMps2: zeroAccel }));
  const quaternion = filter.update(
    createSample(100, {
      accelMps2: zeroAccel,
      gyroRadPerSec: { x: 0.2, y: -0.1, z: 0.3 },
    }),
  );

  assert.ok(Object.values(quaternion).every(Number.isFinite));
  assertApproximatelyEqual(quaternionNorm(quaternion), 1);
});

test("uses only acceleration direction for feedback", () => {
  const runWithAcceleration = (scale: number): Quaternion => {
    const filter = createMahony6Axis({ kp: 1, ki: 0 });
    filter.update(createSample(0));
    return filter.update(
      createSample(100, {
        accelMps2: { x: 0, y: scale, z: scale },
      }),
    );
  };

  assert.deepEqual(runWithAcceleration(1), runWithAcceleration(9.80665));
});

test("does not retain integral feedback when ki is zero", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 0 });
  filter.update(createSample(0));
  const afterFeedback = filter.update(
    createSample(100, { accelMps2: { x: 0, y: 1, z: 1 } }),
  );
  const afterGyroOnly = filter.update(
    createSample(200, { accelMps2: { x: 0, y: 0, z: 0 } }),
  );

  assert.deepEqual(afterGyroOnly, afterFeedback);
});

test("reset clears quaternion, integral feedback, and temporal state", () => {
  const filter = createMahony6Axis({ kp: 0, ki: 1 });
  filter.update(createSample(100));
  const changed = filter.update(
    createSample(200, { accelMps2: { x: 0, y: 1, z: 1 } }),
  );
  assert.notDeepEqual(changed, IDENTITY_QUATERNION);

  filter.reset();
  assert.deepEqual(filter.getQuaternion(), IDENTITY_QUATERNION);
  assert.deepEqual(filter.update(createSample(200)), IDENTITY_QUATERNION);
  assert.deepEqual(
    filter.update(createSample(300, { accelMps2: { x: 0, y: 0, z: 0 } })),
    IDENTITY_QUATERNION,
  );
});

test("does not mutate input samples", () => {
  const filter = createMahony6Axis({ kp: 1, ki: 1 });
  const createFrozenSample = (timestampMs: number) =>
    Object.freeze({
      ...createSample(timestampMs),
      accelMps2: Object.freeze({ x: 0, y: 1, z: 9.80665 }),
      gyroRadPerSec: Object.freeze({ x: 0.1, y: -0.2, z: 0.3 }),
    });
  const firstSample = createFrozenSample(0);
  const secondSample = createFrozenSample(100);
  const copySample = (sample: Readonly<NormalizedImuSample>) => ({
    ...sample,
    accelMps2: { ...sample.accelMps2 },
    gyroRadPerSec: { ...sample.gyroRadPerSec },
  });
  const firstBefore = copySample(firstSample);
  const secondBefore = copySample(secondSample);

  filter.update(firstSample);
  filter.update(secondSample);

  assert.deepEqual(firstSample, firstBefore);
  assert.deepEqual(secondSample, secondBefore);
});
