import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPhaseBlocksV1,
  type PhaseBlockConfig,
} from "../analytics/kinematics/buildPhaseBlocksV1";
import type { VelocitySample1D } from "../analytics/kinematics/integrateVelocity1D";

const CONFIG: PhaseBlockConfig = {
  enterVelocityMps: 0.2,
  exitVelocityMps: 0.1,
  minimumStateDurationMs: 200,
  maximumSampleGapMs: 150,
};

function samples(
  velocityMps: readonly number[],
  timestampMs = velocityMps.map((_, index) => index * 100),
): VelocitySample1D[] {
  return velocityMps.map((velocity, index) => ({
    velocityMps: velocity,
    timestampMs: timestampMs[index],
    sampleIndex: 100 + index,
  }));
}

function phases(input: readonly VelocitySample1D[], config = CONFIG): string[] {
  return buildPhaseBlocksV1(input, config).map((block) => block.phase);
}

test("builds one UP block from sustained positive velocity", () => {
  const result = buildPhaseBlocksV1(samples([0.3, 0.3, 0.3, 0.3]), CONFIG);
  assert.deepEqual(result, [{
    phase: "UP",
    startArrayIndex: 0,
    endArrayIndex: 3,
    startTimestampMs: 0,
    endTimestampMs: 300,
    durationMs: 300,
    sampleCount: 4,
    startSampleIndex: 100,
    endSampleIndex: 103,
  }]);
});

test("builds one DOWN block from sustained negative velocity", () => {
  assert.deepEqual(phases(samples([-0.3, -0.3, -0.3])), ["DOWN"]);
});

test("keeps near-zero velocity TRANSITION_OR_UNKNOWN", () => {
  assert.deepEqual(phases(samples([0.01, -0.02, 0, 0.04])), [
    "TRANSITION_OR_UNKNOWN",
  ]);
});

test("builds UP then transition then DOWN", () => {
  assert.deepEqual(
    phases(samples([0.3, 0.3, 0.3, 0.05, -0.3, -0.3, -0.3])),
    ["UP", "TRANSITION_OR_UNKNOWN", "DOWN"],
  );
});

test("builds DOWN then transition then UP", () => {
  assert.deepEqual(
    phases(samples([-0.3, -0.3, -0.3, -0.05, 0.3, 0.3, 0.3])),
    ["DOWN", "TRANSITION_OR_UNKNOWN", "UP"],
  );
});

test("does not flip-flop in noise around zero", () => {
  assert.deepEqual(phases(samples([0.09, -0.09, 0.11, -0.11, 0])), [
    "TRANSITION_OR_UNKNOWN",
  ]);
});

test("does not confirm an excursion shorter than the minimum duration", () => {
  assert.deepEqual(phases(samples([0, 0.3, 0.3, 0, 0])), [
    "TRANSITION_OR_UNKNOWN",
  ]);
});

test("uses the exit threshold as directional hysteresis", () => {
  const result = buildPhaseBlocksV1(
    samples([0.3, 0.15, 0.11, 0.15, 0.09, 0.3, 0.09]),
    CONFIG,
  );
  assert.deepEqual(result.map((block) => [
    block.phase,
    block.startArrayIndex,
    block.endArrayIndex,
  ]), [
    ["UP", 0, 3],
    ["TRANSITION_OR_UNKNOWN", 4, 6],
  ]);
});

test("uses irregular real timestamps for state duration", () => {
  assert.deepEqual(
    phases(samples([0.3, 0.3, 0.3], [10, 80, 225])),
    ["UP"],
  );
  assert.deepEqual(
    phases(samples([0.3, 0.3, 0.3], [10, 80, 190])),
    ["TRANSITION_OR_UNKNOWN"],
  );
});

test("splits equal phases across a timestamp gap", () => {
  const result = buildPhaseBlocksV1(
    samples([0.3, 0.3, 0.3, 0.3], [0, 100, 500, 600]),
    { ...CONFIG, minimumStateDurationMs: 100 },
  );
  assert.deepEqual(result.map((block) => [
    block.phase,
    block.startArrayIndex,
    block.endArrayIndex,
  ]), [
    ["UP", 0, 1],
    ["UP", 2, 3],
  ]);
});

test("rejects duplicate and decreasing timestamps", () => {
  assert.throws(
    () => buildPhaseBlocksV1(samples([0, 0], [10, 10]), CONFIG),
    /strictly increasing at index 1/,
  );
  assert.throws(
    () => buildPhaseBlocksV1(samples([0, 0], [10, 9]), CONFIG),
    /strictly increasing at index 1/,
  );
});

test("rejects non-finite samples", () => {
  assert.throws(
    () => buildPhaseBlocksV1(samples([Number.NaN]), CONFIG),
    /velocityMps must be finite/,
  );
  assert.throws(
    () => buildPhaseBlocksV1(samples([0], [Number.POSITIVE_INFINITY]), CONFIG),
    /timestampMs must be finite/,
  );
  assert.throws(
    () => buildPhaseBlocksV1([
      { velocityMps: 0, timestampMs: 0, sampleIndex: Number.NaN },
    ], CONFIG),
    /sampleIndex must be finite/,
  );
});

test("rejects invalid configuration", () => {
  assert.throws(
    () => buildPhaseBlocksV1([], { ...CONFIG, enterVelocityMps: 0 }),
    /enterVelocityMps/,
  );
  assert.throws(
    () => buildPhaseBlocksV1([], { ...CONFIG, exitVelocityMps: 0.2 }),
    /smaller than enterVelocityMps/,
  );
  assert.throws(
    () => buildPhaseBlocksV1([], { ...CONFIG, minimumStateDurationMs: -1 }),
    /minimumStateDurationMs/,
  );
  assert.throws(
    () => buildPhaseBlocksV1([], { ...CONFIG, maximumSampleGapMs: 0 }),
    /maximumSampleGapMs/,
  );
});

test("handles empty input and one sample explicitly", () => {
  assert.deepEqual(buildPhaseBlocksV1([], CONFIG), []);
  assert.deepEqual(buildPhaseBlocksV1(samples([0.3], [123]), CONFIG), [{
    phase: "TRANSITION_OR_UNKNOWN",
    startArrayIndex: 0,
    endArrayIndex: 0,
    startTimestampMs: 123,
    endTimestampMs: 123,
    durationMs: 0,
    sampleCount: 1,
    startSampleIndex: 100,
    endSampleIndex: 100,
  }]);
});

test("does not mutate or alias inputs and config", () => {
  const input = Object.freeze([
    Object.freeze({ velocityMps: 0.3, timestampMs: 0, sampleIndex: 7 }),
    Object.freeze({ velocityMps: 0.3, timestampMs: 200, sampleIndex: 8 }),
  ]);
  const config = Object.freeze({ ...CONFIG });
  const before = JSON.stringify({ input, config });

  const result = buildPhaseBlocksV1(input, config);

  assert.equal(JSON.stringify({ input, config }), before);
  assert.notStrictEqual(result[0], input[0]);
});
