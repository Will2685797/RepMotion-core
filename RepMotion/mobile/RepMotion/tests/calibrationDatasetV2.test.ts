import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCalibration,
  createCalibrationDataset,
  createCalibrationDatasetV2,
  type MotionSample,
} from "../analytics/calibration";
import type { ImuSampleV2 } from "../types/imu";

const v2Samples: ImuSampleV2[] = [
  {
    ax: 101,
    ay: -202,
    az: 303,
    gx: -404,
    gy: 505,
    gz: -606,
    sampleIndex: 41,
    timestampMs: 2050,
  },
  {
    ax: 111,
    ay: -212,
    az: 313,
    gx: -414,
    gy: 515,
    gz: -616,
    sampleIndex: 43,
    timestampMs: 2150,
  },
];

test("creates a V2 dataset without losing any sample field", () => {
  const dataset = createCalibrationDatasetV2(
    v2Samples,
    "rowing",
    5,
    20,
    5,
    "V2 capture test",
  );

  assert.equal(dataset.schemaVersion, 2);
  assert.equal(dataset.sensorDataUnit, "raw_counts");
  assert.equal(dataset.sampleCount, 2);
  assert.equal(dataset.samplingRateHz, 20);
  assert.strictEqual(dataset.samples[0], v2Samples[0]);
  assert.deepEqual(dataset.samples[0], v2Samples[0]);
  assert.equal(dataset.samples[0].gx, -404);
  assert.equal(dataset.samples[0].sampleIndex, 41);
  assert.equal(dataset.samples[0].timestampMs, 2050);
  assert.deepEqual(dataset.captureDiagnostics, {
    missingSampleCount: 1,
    nonContiguousSampleCount: 1,
  });
});

test("historical calibration calculations ignore additional V2 fields", () => {
  const historicalSamples: MotionSample[] = v2Samples.map(({ ax, ay, az }) => ({
    ax,
    ay,
    az,
  }));

  assert.deepEqual(
    calculateCalibration(v2Samples),
    calculateCalibration(historicalSamples),
  );
});

test("keeps the historical dataset factory free of invented V2 fields", () => {
  const historicalSample: MotionSample = { ax: 1, ay: 2, az: 3 };
  const dataset = createCalibrationDataset(
    [historicalSample],
    "rowing",
    5,
    20,
  );

  assert.equal(Object.hasOwn(dataset, "schemaVersion"), false);
  assert.equal(Object.hasOwn(dataset, "sensorDataUnit"), false);
  assert.equal(Object.hasOwn(dataset.samples[0], "gx"), false);
  assert.equal(Object.hasOwn(dataset.samples[0], "sampleIndex"), false);
  assert.equal(Object.hasOwn(dataset.samples[0], "timestampMs"), false);
});
