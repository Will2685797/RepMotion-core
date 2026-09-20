import { test } from "node:test";
import assert from "node:assert/strict";
import { decimalMicroseconds, samplePosition, intervalIndices, velocityAt, signCounts, signCrossings } from "./diagnoseVelocity";

test("decimal GT boundaries stay exact, including integer boundaries and half samples", () => {
  const offset = decimalMicroseconds(6.62);
  assert.equal(samplePosition(19.845, offset), 264.5);
  assert.equal(samplePosition(15.1, offset), 169.6);
  assert.equal(samplePosition(25.66, decimalMicroseconds(11.81)), 277);
  assert.deepEqual(intervalIndices(277, 278, true), [277, 278]);
  assert.deepEqual(intervalIndices(277, 278, false), []);
});

test("short GT windows are not expanded and pivot boundaries are not double counted", () => {
  assert.deepEqual(intervalIndices(218.2, 218.8, true), []);
  assert.deepEqual(intervalIndices(301, 301.8, true), [301]);
  assert.deepEqual(intervalIndices(301.8, 310, false), [302, 303, 304, 305, 306, 307, 308, 309]);
});

test("boundary readout interpolates but does not replace discrete samples", () => {
  const velocity = Object.freeze([0, -2, 4]);
  assert.equal(velocityAt(velocity, 1.5), 1);
  assert.equal(velocityAt(velocity, 1), -2);
  assert.deepEqual(velocity, [0, -2, 4]);
});

test("raw sign counts use no tolerance and explicitly handle empty windows", () => {
  assert.deepEqual(signCounts([-1e-300, 0, 1e-300], [0, 1, 2]), {
    n: 3, positive: 1, negative: 1, zero: 1,
    positiveProportion: 1 / 3, negativeProportion: 1 / 3, zeroProportion: 1 / 3,
  });
  assert.equal(signCounts([], []).positiveProportion, null);
});

test("crossings report adjacent brackets without importing an outside sample", () => {
  const velocity = [-1, 3, -1];
  const crossings = signCrossings(velocity, [0, 1, 2]);
  assert.equal(crossings.length, 2);
  assert.equal(crossings[0].crossingIndex, 0.25);
  assert.equal(crossings[1].crossingIndex, 1.75);
  assert.deepEqual(signCrossings(velocity, [1]), []);
});

test("exact-zero runs count only when they connect opposite nonzero signs", () => {
  assert.deepEqual(signCrossings([1, 0, 1], [0, 1, 2]), []);
  assert.deepEqual(signCrossings([0, 1], [0, 1]), []);
  const crossings = signCrossings([-1, 0, 0, 1], [0, 1, 2, 3]);
  assert.equal(crossings.length, 1);
  assert.deepEqual(crossings[0].zeroIndices, [1, 2]);
  assert.equal(crossings[0].location, "exact-zero-sample");
});
