import assert from "node:assert/strict";
import test from "node:test";

import {
  integrateVelocity1D,
  type AccelerationSample1D,
} from "../analytics/kinematics/integrateVelocity1D";

function samples(
  accelerationMps2: readonly number[],
  timestampMs = accelerationMps2.map((_, index) => index * 1000),
): AccelerationSample1D[] {
  return accelerationMps2.map((acceleration, index) => ({
    accelerationMps2: acceleration,
    timestampMs: timestampMs[index],
    sampleIndex: 100 + index,
  }));
}

function velocities(input: readonly AccelerationSample1D[]): number[] {
  return integrateVelocity1D(input).map((sample) => sample.velocityMps);
}

test("integrates constant positive acceleration", () => {
  assert.deepEqual(velocities(samples([2, 2, 2, 2])), [0, 2, 4, 6]);
});

test("integrates constant negative acceleration", () => {
  assert.deepEqual(velocities(samples([-3, -3, -3])), [0, -3, -6]);
});

test("keeps zero acceleration at zero velocity", () => {
  assert.deepEqual(velocities(samples([0, 0, 0, 0])), [0, 0, 0, 0]);
});

test("integrates a positive then negative acceleration triangle", () => {
  assert.deepEqual(velocities(samples([0, 2, 0, -2, 0])), [0, 1, 2, 1, 0]);
});

test("uses each real irregular timestamp interval", () => {
  const input = samples([2, 2, 2], [100, 350, 1100]);
  assert.deepEqual(velocities(input), [0, 0.5, 2]);
});

test("returns one zero-velocity sample with preserved metadata", () => {
  assert.deepEqual(integrateVelocity1D(samples([7], [1234])), [
    { velocityMps: 0, timestampMs: 1234, sampleIndex: 100 },
  ]);
});

test("returns an empty series for empty input", () => {
  assert.deepEqual(integrateVelocity1D([]), []);
});

test("rejects duplicate timestamps", () => {
  assert.throws(
    () => integrateVelocity1D(samples([1, 1], [100, 100])),
    /strictly increasing at index 1/,
  );
});

test("rejects decreasing timestamps", () => {
  assert.throws(
    () => integrateVelocity1D(samples([1, 1], [100, 99])),
    /strictly increasing at index 1/,
  );
});

test("rejects non-finite acceleration and timestamps", () => {
  for (const acceleration of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(
      () => integrateVelocity1D(samples([acceleration], [0])),
      /Acceleration must be finite at index 0/,
    );
  }
  for (const timestamp of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(
      () => integrateVelocity1D(samples([0], [timestamp])),
      /timestampMs must be finite at index 0/,
    );
  }
});

test("rejects non-finite dt and integrated velocity", () => {
  assert.throws(
    () => integrateVelocity1D(samples(
      [0, 0],
      [-Number.MAX_VALUE, Number.MAX_VALUE],
    )),
    /dt must be finite at interval 0/,
  );
  assert.throws(
    () => integrateVelocity1D(samples(
      [Number.MAX_VALUE, Number.MAX_VALUE],
      [0, 1000],
    )),
    /Integrated velocity is not finite at index 1/,
  );
});

test("does not mutate or alias its input", () => {
  const input = Object.freeze([
    Object.freeze({ accelerationMps2: 1, timestampMs: 10, sampleIndex: 7 }),
    Object.freeze({ accelerationMps2: 3, timestampMs: 510, sampleIndex: 8 }),
  ]);
  const before = input.map((sample) => ({ ...sample }));

  const result = integrateVelocity1D(input);

  assert.deepEqual(input, before);
  assert.deepEqual(result, [
    { velocityMps: 0, timestampMs: 10, sampleIndex: 7 },
    { velocityMps: 1, timestampMs: 510, sampleIndex: 8 },
  ]);
  assert.notStrictEqual(result[0], input[0]);
  assert.notStrictEqual(result[1], input[1]);
});
