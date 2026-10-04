import assert from "node:assert/strict";
import test from "node:test";

import {
  applyAccelerometerCalibration,
  estimateAccelerometerCalibration,
} from "../analytics/imu/accelerometerCalibration";
import type {
  AccelerometerCalibration,
  AccelerometerVector,
  NormalizedImuSample,
  SixPositionAccelerometerMeasurements,
} from "../analytics/imu/types";

const GRAVITY_MPS2 = 9.80665;

const idealMeasurements: SixPositionAccelerometerMeasurements = {
  positiveX: { x: GRAVITY_MPS2, y: 0, z: 0 },
  negativeX: { x: -GRAVITY_MPS2, y: 0, z: 0 },
  positiveY: { x: 0, y: GRAVITY_MPS2, z: 0 },
  negativeY: { x: 0, y: -GRAVITY_MPS2, z: 0 },
  positiveZ: { x: 0, y: 0, z: GRAVITY_MPS2 },
  negativeZ: { x: 0, y: 0, z: -GRAVITY_MPS2 },
};

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
  actual: AccelerometerVector,
  expected: AccelerometerVector,
): void {
  assertApproximatelyEqual(actual.x, expected.x);
  assertApproximatelyEqual(actual.y, expected.y);
  assertApproximatelyEqual(actual.z, expected.z);
}

function createSample(accelMps2: AccelerometerVector): NormalizedImuSample {
  return {
    accelMps2: { ...accelMps2 },
    gyroRadPerSec: { x: 0.1, y: -0.2, z: 0.3 },
    sampleIndex: 42,
    timestampMs: 2100,
  };
}

function createSyntheticMeasurements(
  biasMps2: AccelerometerVector,
  scale: AccelerometerVector,
): SixPositionAccelerometerMeasurements {
  const measurement = (
    axis: "x" | "y" | "z",
    sign: 1 | -1,
  ): AccelerometerVector => ({
    x: biasMps2.x + (axis === "x" ? (sign * GRAVITY_MPS2) / scale.x : 0),
    y: biasMps2.y + (axis === "y" ? (sign * GRAVITY_MPS2) / scale.y : 0),
    z: biasMps2.z + (axis === "z" ? (sign * GRAVITY_MPS2) / scale.z : 0),
  });

  return {
    positiveX: measurement("x", 1),
    negativeX: measurement("x", -1),
    positiveY: measurement("y", 1),
    negativeY: measurement("y", -1),
    positiveZ: measurement("z", 1),
    negativeZ: measurement("z", -1),
  };
}

test("estimates zero bias and unit scale from ideal six-position measurements", () => {
  const calibration = estimateAccelerometerCalibration(idealMeasurements);

  assertVectorApproximatelyEqual(calibration.biasMps2, { x: 0, y: 0, z: 0 });
  assertVectorApproximatelyEqual(calibration.scale, { x: 1, y: 1, z: 1 });
});

test("estimates the exact per-axis bias", () => {
  const measurements = {
    ...idealMeasurements,
    positiveX: { x: 10.3, y: 0, z: 0 },
    negativeX: { x: -9.3, y: 0, z: 0 },
  };

  const calibration = estimateAccelerometerCalibration(measurements);

  assertApproximatelyEqual(calibration.biasMps2.x, 0.5);
});

test("estimates the exact per-axis scale", () => {
  const measurements = {
    ...idealMeasurements,
    positiveX: { x: 11, y: 0, z: 0 },
    negativeX: { x: -11, y: 0, z: 0 },
  };

  const calibration = estimateAccelerometerCalibration(measurements);

  assertApproximatelyEqual(calibration.scale.x, GRAVITY_MPS2 / 11);
});

test("recovers combined synthetic bias and scale on all axes", () => {
  const expected: AccelerometerCalibration = {
    biasMps2: { x: 0.5, y: -0.25, z: 0.1 },
    scale: { x: 0.9, y: 1.1, z: 0.8 },
  };
  const measurements = createSyntheticMeasurements(
    expected.biasMps2,
    expected.scale,
  );

  const calibration = estimateAccelerometerCalibration(measurements);

  assertVectorApproximatelyEqual(calibration.biasMps2, expected.biasMps2);
  assertVectorApproximatelyEqual(calibration.scale, expected.scale);
});

test("applies calibration only to acceleration", () => {
  const sample = createSample({ x: 2, y: 2, z: 1 });
  const calibration: AccelerometerCalibration = {
    biasMps2: { x: 1, y: -2, z: 0.5 },
    scale: { x: 2, y: 0.5, z: 4 },
  };

  const calibrated = applyAccelerometerCalibration(sample, calibration);

  assertVectorApproximatelyEqual(calibrated.accelMps2, { x: 2, y: 2, z: 2 });
  assert.deepEqual(calibrated.gyroRadPerSec, sample.gyroRadPerSec);
  assert.equal(calibrated.sampleIndex, sample.sampleIndex);
  assert.equal(calibrated.timestampMs, sample.timestampMs);
});

test("does not mutate the sample or calibration", () => {
  const sample = Object.freeze({
    ...createSample({ x: 2, y: 2, z: 1 }),
    accelMps2: Object.freeze({ x: 2, y: 2, z: 1 }),
    gyroRadPerSec: Object.freeze({ x: 0.1, y: -0.2, z: 0.3 }),
  });
  const calibration = Object.freeze({
    biasMps2: Object.freeze({ x: 1, y: -2, z: 0.5 }),
    scale: Object.freeze({ x: 2, y: 0.5, z: 4 }),
  });
  const sampleBefore = JSON.parse(JSON.stringify(sample));
  const calibrationBefore = JSON.parse(JSON.stringify(calibration));

  applyAccelerometerCalibration(sample, calibration);

  assert.deepEqual(sample, sampleBefore);
  assert.deepEqual(calibration, calibrationBefore);
});

test("rejects a zero half-span", () => {
  const measurements = {
    ...idealMeasurements,
    positiveX: { x: 2, y: 0, z: 0 },
    negativeX: { x: 2, y: 0, z: 0 },
  };

  assert.throws(
    () => estimateAccelerometerCalibration(measurements),
    /X half-span must be finite and strictly positive/,
  );
});

test("rejects a negative half-span caused by inverted orientations", () => {
  const measurements = {
    ...idealMeasurements,
    positiveY: { x: 0, y: -10, z: 0 },
    negativeY: { x: 0, y: 10, z: 0 },
  };

  assert.throws(
    () => estimateAccelerometerCalibration(measurements),
    /Y half-span must be finite and strictly positive/,
  );
});

test("rejects NaN and Infinity in any six-position vector component", () => {
  assert.throws(
    () =>
      estimateAccelerometerCalibration({
        ...idealMeasurements,
        positiveX: { x: GRAVITY_MPS2, y: Number.NaN, z: 0 },
      }),
    /positiveX\.y must be finite/,
  );
  assert.throws(
    () =>
      estimateAccelerometerCalibration({
        ...idealMeasurements,
        negativeZ: { x: Number.POSITIVE_INFINITY, y: 0, z: -GRAVITY_MPS2 },
      }),
    /negativeZ\.x must be finite/,
  );
});

test("maps all six synthetic cardinal measurements back to plus or minus gravity", () => {
  const expected: AccelerometerCalibration = {
    biasMps2: { x: 0.5, y: -0.25, z: 0.1 },
    scale: { x: 0.9, y: 1.1, z: 0.8 },
  };
  const measurements = createSyntheticMeasurements(
    expected.biasMps2,
    expected.scale,
  );
  const calibration = estimateAccelerometerCalibration(measurements);
  const expectedVectors: Record<
    keyof SixPositionAccelerometerMeasurements,
    AccelerometerVector
  > = {
    positiveX: { x: GRAVITY_MPS2, y: 0, z: 0 },
    negativeX: { x: -GRAVITY_MPS2, y: 0, z: 0 },
    positiveY: { x: 0, y: GRAVITY_MPS2, z: 0 },
    negativeY: { x: 0, y: -GRAVITY_MPS2, z: 0 },
    positiveZ: { x: 0, y: 0, z: GRAVITY_MPS2 },
    negativeZ: { x: 0, y: 0, z: -GRAVITY_MPS2 },
  };

  for (const key of Object.keys(measurements) as Array<
    keyof SixPositionAccelerometerMeasurements
  >) {
    const calibrated = applyAccelerometerCalibration(
      createSample(measurements[key]),
      calibration,
    );
    assertVectorApproximatelyEqual(calibrated.accelMps2, expectedVectors[key]);
  }
});
