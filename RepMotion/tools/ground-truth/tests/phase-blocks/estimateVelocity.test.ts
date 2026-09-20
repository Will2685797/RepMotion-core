import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateVelocity } from '../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity';

test('empty input returns an empty array', () => {
  assert.deepEqual(estimateVelocity([], 0.5), []);
});

test('a single sample returns zero initial velocity', () => {
  assert.deepEqual(estimateVelocity([8], 0.5), [0]);
});

test('output preserves sample count and starts at zero', () => {
  for (const values of [[0], [1, 3], [2, -1, 4, 0, -3]]) {
    const velocity = estimateVelocity(values, 0.25);
    assert.equal(velocity.length, values.length);
    assert.equal(velocity[0], 0);
  }
});

test('constant acceleration produces linearly increasing velocity', () => {
  assert.deepEqual(estimateVelocity([2, 2, 2, 2], 0.5), [0, 1, 2, 3]);
});

test('positive then negative acceleration increases then decreases velocity', () => {
  assert.deepEqual(
    estimateVelocity([2, 2, 0, -2, -2], 0.5),
    [0, 1, 1.5, 1, 0],
  );
});

test('each interval uses both endpoint accelerations', () => {
  assert.deepEqual(estimateVelocity([0, 4, 8], 0.25), [0, 0.5, 2]);
});

test('input remains unchanged and repeated calls are independent', () => {
  const values = [0, 4, -2];
  const original = [...values];
  const first = estimateVelocity(values, 0.5);
  assert.deepEqual(values, original);
  assert.deepEqual(estimateVelocity(values, 0.5), first);
  assert.notStrictEqual(first, values);
});
