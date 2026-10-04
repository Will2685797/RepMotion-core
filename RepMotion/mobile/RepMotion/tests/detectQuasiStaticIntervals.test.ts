import assert from "node:assert/strict";
import test from "node:test";

import { createZeroVelocityAnchors } from "../analytics/kinematics/createZeroVelocityAnchors";
import {
  detectQuasiStaticIntervals,
  type QuasiStaticConfig,
  type QuasiStaticSample,
} from "../analytics/kinematics/detectQuasiStaticIntervals";

const CONFIG: QuasiStaticConfig = {
  maxLinearAccelerationMps2: 0.2,
  maxGyroRadPerSec: 0.1,
  minimumDurationMs: 150,
  maximumSampleGapMs: 120,
};

function sample(
  timestampMs: number,
  acceleration = { x: 0.01, y: -0.02, z: 0.03 },
  gyro = { x: 0.01, y: 0.02, z: -0.01 },
  sampleIndex = timestampMs,
): QuasiStaticSample {
  return {
    linearAccelerationWorldMps2: acceleration,
    gyroRadPerSec: gyro,
    timestampMs,
    sampleIndex,
  };
}

test("detects a perfectly quasi-static interval using real elapsed time", () => {
  const intervals = detectQuasiStaticIntervals(
    [sample(0), sample(50), sample(120), sample(200)],
    CONFIG,
  );

  assert.deepEqual(intervals, [{
    startArrayIndex: 0,
    endArrayIndex: 3,
    startTimestampMs: 0,
    endTimestampMs: 200,
    durationMs: 200,
    sampleCount: 4,
    anchorArrayIndex: 2,
    anchorTimestampMs: 120,
    anchorSampleIndex: 120,
  }]);
});

test("rejects clear movement", () => {
  const moving = [0, 50, 100, 150, 200].map((timestamp) =>
    sample(timestamp, { x: 0.3, y: 0, z: 0 }),
  );
  assert.deepEqual(detectQuasiStaticIntervals(moving, CONFIG), []);
});

test("rejects a qualifying interval shorter than the minimum duration", () => {
  assert.deepEqual(
    detectQuasiStaticIntervals([sample(0), sample(50), sample(100)], CONFIG),
    [],
  );
});

test("uses irregular timestamps and splits intervals across excessive gaps", () => {
  const irregular = [sample(0), sample(70), sample(160), sample(260)];
  assert.equal(detectQuasiStaticIntervals(irregular, CONFIG).length, 1);

  const split = [sample(0), sample(100), sample(300), sample(400)];
  assert.deepEqual(detectQuasiStaticIntervals(split, CONFIG), []);
});

test("does not classify calm acceleration with active gyroscope", () => {
  const input = [0, 50, 100, 150, 200].map((timestamp) =>
    sample(timestamp, undefined, { x: 0.11, y: 0, z: 0 }),
  );
  assert.deepEqual(detectQuasiStaticIntervals(input, CONFIG), []);
});

test("does not classify calm gyroscope with dynamic acceleration", () => {
  const input = [0, 50, 100, 150, 200].map((timestamp) =>
    sample(timestamp, { x: 0, y: 0.21, z: 0 }),
  );
  assert.deepEqual(detectQuasiStaticIntervals(input, CONFIG), []);
});

test("rejects a short quiet passage embedded in strong dynamic context", () => {
  const dynamic = { x: 1, y: 0, z: 0 };
  const activeGyro = { x: 0.2, y: 0, z: 0 };
  const input = [
    sample(0, dynamic, activeGyro),
    sample(100, dynamic, activeGyro),
    sample(200),
    sample(300),
    sample(400),
    sample(500, dynamic, activeGyro),
    sample(600, dynamic, activeGyro),
  ];
  const config: QuasiStaticConfig = {
    ...CONFIG,
    minimumDurationMs: 200,
    dynamicContext: {
      windowDurationMs: 600,
      minLinearAccelerationRmsMps2: 0.5,
      minGyroRmsRadPerSec: 0.1,
    },
  };

  assert.deepEqual(detectQuasiStaticIntervals(input, config), []);
  assert.equal(
    detectQuasiStaticIntervals(
      input.map((value) => ({ ...value, gyroRadPerSec: { x: 0, y: 0, z: 0 } })),
      config,
    ).length,
    1,
  );
});

test("creates one midpoint anchor per detected interval", () => {
  const intervals = detectQuasiStaticIntervals(
    [sample(0, undefined, undefined, 10), sample(100, undefined, undefined, 11), sample(200, undefined, undefined, 12)],
    { ...CONFIG, minimumDurationMs: 200 },
  );
  assert.deepEqual(createZeroVelocityAnchors(intervals), [{
    timestampMs: 100,
    targetVelocityMps: 0,
    sampleIndex: 11,
  }]);
});

test("rejects invalid samples, timestamps, and configuration", () => {
  assert.throws(
    () => detectQuasiStaticIntervals([
      sample(0, { x: Number.NaN, y: 0, z: 0 }),
    ], CONFIG),
    /Linear acceleration must be finite/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([
      sample(0, undefined, { x: 0, y: Number.POSITIVE_INFINITY, z: 0 }),
    ], CONFIG),
    /Gyroscope must be finite/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([sample(0), sample(0)], CONFIG),
    /strictly increasing/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([], { ...CONFIG, minimumDurationMs: -1 }),
    /minimumDurationMs/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([], { ...CONFIG, maximumSampleGapMs: 0 }),
    /maximumSampleGapMs/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([], {
      ...CONFIG,
      dynamicContext: {
        windowDurationMs: 0,
        minLinearAccelerationRmsMps2: 1,
        minGyroRmsRadPerSec: 1,
      },
    }),
    /dynamicContext\.windowDurationMs/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([], {
      ...CONFIG,
      dynamicContext: {
        windowDurationMs: 1_000,
        minLinearAccelerationRmsMps2: Number.NaN,
        minGyroRmsRadPerSec: 1,
      },
    }),
    /dynamicContext\.minLinearAccelerationRmsMps2/,
  );
  assert.throws(
    () => detectQuasiStaticIntervals([], {
      ...CONFIG,
      dynamicContext: {
        windowDurationMs: 1_000,
        minLinearAccelerationRmsMps2: 1,
        minGyroRmsRadPerSec: -1,
      },
    }),
    /dynamicContext\.minGyroRmsRadPerSec/,
  );
});

test("does not mutate its inputs", () => {
  const input = Object.freeze([
    Object.freeze({
      ...sample(0),
      linearAccelerationWorldMps2: Object.freeze({ x: 0, y: 0, z: 0 }),
      gyroRadPerSec: Object.freeze({ x: 0, y: 0, z: 0 }),
    }),
    Object.freeze({
      ...sample(200),
      linearAccelerationWorldMps2: Object.freeze({ x: 0, y: 0, z: 0 }),
      gyroRadPerSec: Object.freeze({ x: 0, y: 0, z: 0 }),
    }),
  ]);
  const config = Object.freeze({ ...CONFIG });
  const before = JSON.stringify(input);

  detectQuasiStaticIntervals(input, config);

  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(config, CONFIG);
});
