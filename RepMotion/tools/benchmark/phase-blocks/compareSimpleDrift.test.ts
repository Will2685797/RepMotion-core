import { test } from "node:test";
import assert from "node:assert/strict";
import { slowEma, gtOracle, piecewiseValue, curveCrossings, nearestCrossing } from "./compareSimpleDrift";

test("EMA has a known constant-input response and uses no future samples", () => {
  const dt = 0.05, tau = 10;
  const a = Object.freeze([2, 2, 2, 2]);
  const result = slowEma(a, dt, tau);
  result.bias.forEach((bias, i) => assert.ok(Math.abs(bias - 2 * (1 - Math.exp(-i * dt / tau))) < 1e-12));
  assert.deepEqual(slowEma([2, 2, 200], dt, tau).bias.slice(0, 2), result.bias.slice(0, 2));
  assert.equal(result.bias[0], 0);
});

test("oracle removes linear velocity drift between exact fractional constraints", () => {
  const original = Object.freeze([0, 1, 2, 3, 4]);
  const result = gtOracle(original, [0.5, 2.5]);
  assert.equal(piecewiseValue(result.curve, 0.5), 0);
  assert.equal(piecewiseValue(result.curve, 2.5), 0);
  assert.equal(result.velocity[1], 0);
  assert.equal(result.velocity[2], 0);
  assert.equal(result.velocity[4], 1.5); // Hold final correction, do not force final velocity.
  assert.equal(result.velocity[0], 0);
  assert.deepEqual(original, [0, 1, 2, 3, 4]);
});

test("a zero constraint is not automatically a crossing", () => {
  assert.deepEqual(curveCrossings([{ index: 0, value: 1 }, { index: 0.5, value: 0 }, { index: 1, value: 1 }]), []);
  const crossing = curveCrossings([{ index: 0, value: -1 }, { index: 0.5, value: 0 }, { index: 1, value: 1 }]);
  assert.equal(crossing.length, 1);
  assert.equal(crossing[0].start, 0.5);
});

test("zero plateau is an interval and nearest errors use no distance threshold", () => {
  const crossing = curveCrossings([{ index: 0, value: -1 }, { index: 1, value: 0 }, { index: 2, value: 0 }, { index: 3, value: 1 }]);
  assert.equal(nearestCrossing(crossing, 1.5, 0.05)!.absoluteErrorMs, 0);
  assert.ok(Math.abs(nearestCrossing(crossing, 5, 0.05)!.signedErrorMs + 150) < 1e-10);
  assert.equal(nearestCrossing([], 1, 0.05), null);
});
