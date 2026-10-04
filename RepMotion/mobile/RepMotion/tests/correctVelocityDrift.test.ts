import assert from "node:assert/strict";
import test from "node:test";

import type { ZeroVelocityAnchor } from "../analytics/kinematics/createZeroVelocityAnchors";
import { correctVelocityDrift } from "../analytics/kinematics/correctVelocityDrift";
import type { VelocitySample1D } from "../analytics/kinematics/integrateVelocity1D";

function series(
  velocities: readonly number[],
  timestamps = velocities.map((_, index) => index * 1000),
): VelocitySample1D[] {
  return velocities.map((velocityMps, index) => ({
    velocityMps,
    timestampMs: timestamps[index],
    sampleIndex: 20 + index,
  }));
}

function anchors(...timestamps: number[]): ZeroVelocityAnchor[] {
  return timestamps.map((timestampMs) => ({
    timestampMs,
    targetVelocityMps: 0,
  }));
}

function values(result: readonly VelocitySample1D[]): number[] {
  return result.map((sample) => sample.velocityMps);
}

function assertApproximatelyEqual(
  actual: readonly number[],
  expected: readonly number[],
  tolerance = 1e-12,
): void {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) => {
    assert.ok(
      Math.abs(value - expected[index]) <= tolerance,
      `expected ${value} to be within ${tolerance} of ${expected[index]}`,
    );
  });
}

test("leaves a no-drift signal unchanged", () => {
  const input = series([0, 1, 0, -1, 0]);
  assert.deepEqual(
    correctVelocityDrift(input, anchors(0, 4000)),
    input,
  );
});

test("removes simple linear drift between two anchors", () => {
  assertApproximatelyEqual(
    values(correctVelocityDrift(series([0, 0.5, 1]), anchors(0, 2000))),
    [0, 0, 0],
  );
});

test("preserves dynamic shape while removing linear drift", () => {
  const dynamic = [0, 1, 0, -1, 0];
  const withDrift = dynamic.map((value, index) => value + 0.25 * index);
  assertApproximatelyEqual(
    values(correctVelocityDrift(series(withDrift), anchors(0, 4000))),
    dynamic,
  );
});

test("corrects piecewise drift across multiple anchors", () => {
  assertApproximatelyEqual(
    values(correctVelocityDrift(
      series([0, 0.5, 1, 0.5, 0]),
      anchors(0, 2000, 4000),
    )),
    [0, 0, 0, 0, 0],
  );
});

test("interpolates correction by irregular real timestamps", () => {
  assertApproximatelyEqual(
    values(correctVelocityDrift(
      series([0, 0.2, 1], [0, 200, 1000]),
      anchors(0, 1000),
    )),
    [0, 0, 0],
  );
});

test("produces zero velocity at every anchor", () => {
  const result = correctVelocityDrift(
    series([2, 3, 4, 5, 6]),
    anchors(0, 2000, 4000),
  );
  assertApproximatelyEqual([result[0].velocityMps, result[2].velocityMps, result[4].velocityMps], [0, 0, 0]);
});

test("holds the nearest anchor error outside the anchor range", () => {
  assertApproximatelyEqual(
    values(correctVelocityDrift(
      series([1, 2, 4, 7, 8]),
      anchors(1000, 3000),
    )),
    [-1, 0, -0.5, 0, 1],
  );
});

test("handles empty input explicitly", () => {
  assert.deepEqual(correctVelocityDrift([], []), []);
  assert.throws(
    () => correctVelocityDrift([], anchors(0)),
    /non-empty velocity series/,
  );
});

test("rejects missing, unordered, duplicate, and out-of-range anchors", () => {
  const input = series([0, 1, 2]);
  assert.throws(() => correctVelocityDrift(input, []), /At least one/);
  assert.throws(
    () => correctVelocityDrift(input, anchors(2000, 1000)),
    /strictly increasing/,
  );
  assert.throws(
    () => correctVelocityDrift(input, anchors(1000, 1000)),
    /strictly increasing/,
  );
  assert.throws(
    () => correctVelocityDrift(input, anchors(3000)),
    /outside the velocity series/,
  );
  assert.throws(
    () => correctVelocityDrift(input, [{ timestampMs: 1000, targetVelocityMps: 1 as 0 }]),
    /target must be zero/,
  );
});

test("rejects invalid velocity samples and timestamps", () => {
  assert.throws(
    () => correctVelocityDrift(series([0, Number.NaN]), anchors(0)),
    /Velocity must be finite/,
  );
  assert.throws(
    () => correctVelocityDrift(series([0, 1], [0, 0]), anchors(0)),
    /strictly increasing/,
  );
});

test("does not mutate or alias velocity, anchors, or options", () => {
  const input = Object.freeze(
    series([0, 1, 2]).map((sample) => Object.freeze(sample)),
  );
  const zeroAnchors = Object.freeze(
    anchors(0, 2000).map((anchor) => Object.freeze(anchor)),
  );
  const options = Object.freeze({
    outsideAnchorRange: "hold-nearest-anchor-error" as const,
  });
  const inputBefore = JSON.stringify(input);
  const anchorsBefore = JSON.stringify(zeroAnchors);

  const result = correctVelocityDrift(input, zeroAnchors, options);

  assert.equal(JSON.stringify(input), inputBefore);
  assert.equal(JSON.stringify(zeroAnchors), anchorsBefore);
  assert.notStrictEqual(result[0], input[0]);
  assert.deepEqual(options, { outsideAnchorRange: "hold-nearest-anchor-error" });
});
