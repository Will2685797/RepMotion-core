import assert from "node:assert/strict";
import test from "node:test";

import type { ImuSampleV2 } from "../../../../mobile/RepMotion/types/imu";
import {
  analyzeSixPositionCaptures,
  DIAGNOSTIC_QUALITY_LIMITS,
  parseV2CaptureJson,
  type Orientation,
  type SixPositionCaptureSamples,
} from "./calibrationTool";

const GRAVITY_COUNTS = 16384;

function createCapture(
  accel: { x: number; y: number; z: number },
  count = 100,
): ImuSampleV2[] {
  return Array.from({ length: count }, (_, index) => ({
    ax: accel.x,
    ay: accel.y,
    az: accel.z,
    gx: 0,
    gy: 0,
    gz: 0,
    sampleIndex: index,
    timestampMs: index * 50,
  }));
}

function idealCaptures(count = 100): SixPositionCaptureSamples {
  return {
    positiveX: createCapture({ x: GRAVITY_COUNTS, y: 0, z: 0 }, count),
    negativeX: createCapture({ x: -GRAVITY_COUNTS, y: 0, z: 0 }, count),
    positiveY: createCapture({ x: 0, y: GRAVITY_COUNTS, z: 0 }, count),
    negativeY: createCapture({ x: 0, y: -GRAVITY_COUNTS, z: 0 }, count),
    positiveZ: createCapture({ x: 0, y: 0, z: GRAVITY_COUNTS }, count),
    negativeZ: createCapture({ x: 0, y: 0, z: -GRAVITY_COUNTS }, count),
  };
}

function assertApproximatelyEqual(
  actual: number,
  expected: number,
  tolerance = 1e-12,
): void {
  assert.ok(Math.abs(actual - expected) <= tolerance);
}

test("analyzes six ideal captures through the production pipeline", () => {
  const report = analyzeSixPositionCaptures(idealCaptures());

  assert.deepEqual(report.calibration.biasMps2, { x: 0, y: 0, z: 0 });
  assertApproximatelyEqual(report.calibration.scale.x, 1);
  assertApproximatelyEqual(report.calibration.scale.y, 1);
  assertApproximatelyEqual(report.calibration.scale.z, 1);
  for (const metrics of report.orientations) {
    assert.equal(metrics.sampleCount, 100);
    assertApproximatelyEqual(metrics.normErrorAfterCalibrationMps2, 0);
    assertApproximatelyEqual(metrics.vectorErrorMps2.x, 0);
    assertApproximatelyEqual(metrics.vectorErrorMps2.y, 0);
    assertApproximatelyEqual(metrics.vectorErrorMps2.z, 0);
  }
});

test("recovers known raw-count bias and per-axis scale", () => {
  const biasCounts = { x: 100, y: -200, z: 300 };
  const halfSpanCounts = { x: 18000, y: 17000, z: 16000 };
  const captures: SixPositionCaptureSamples = {
    positiveX: createCapture({ x: biasCounts.x + halfSpanCounts.x, y: biasCounts.y, z: biasCounts.z }),
    negativeX: createCapture({ x: biasCounts.x - halfSpanCounts.x, y: biasCounts.y, z: biasCounts.z }),
    positiveY: createCapture({ x: biasCounts.x, y: biasCounts.y + halfSpanCounts.y, z: biasCounts.z }),
    negativeY: createCapture({ x: biasCounts.x, y: biasCounts.y - halfSpanCounts.y, z: biasCounts.z }),
    positiveZ: createCapture({ x: biasCounts.x, y: biasCounts.y, z: biasCounts.z + halfSpanCounts.z }),
    negativeZ: createCapture({ x: biasCounts.x, y: biasCounts.y, z: biasCounts.z - halfSpanCounts.z }),
  };

  const report = analyzeSixPositionCaptures(captures);

  assertApproximatelyEqual(report.calibration.biasMps2.x, (biasCounts.x * 9.80665) / GRAVITY_COUNTS);
  assertApproximatelyEqual(report.calibration.biasMps2.y, (biasCounts.y * 9.80665) / GRAVITY_COUNTS);
  assertApproximatelyEqual(report.calibration.biasMps2.z, (biasCounts.z * 9.80665) / GRAVITY_COUNTS);
  assertApproximatelyEqual(report.calibration.scale.x, GRAVITY_COUNTS / halfSpanCounts.x);
  assertApproximatelyEqual(report.calibration.scale.y, GRAVITY_COUNTS / halfSpanCounts.y);
  assertApproximatelyEqual(report.calibration.scale.z, GRAVITY_COUNTS / halfSpanCounts.z);
  for (const metrics of report.orientations) {
    assertApproximatelyEqual(metrics.vectorErrorMps2.x, 0, 1e-10);
    assertApproximatelyEqual(metrics.vectorErrorMps2.y, 0, 1e-10);
    assertApproximatelyEqual(metrics.vectorErrorMps2.z, 0, 1e-10);
  }
});

test("rejects an empty capture", () => {
  const captures = idealCaptures() as Record<Orientation, ImuSampleV2[]>;
  captures.positiveX = [];

  assert.throws(
    () => analyzeSixPositionCaptures(captures),
    /positiveX: capture requires at least/,
  );
});

test("rejects an invalid V2 sample while parsing", () => {
  const invalid = {
    schemaVersion: 2,
    sensorDataUnit: "raw_counts",
    sampleCount: 1,
    samples: [{ ...createCapture({ x: 1, y: 2, z: 3 }, 1)[0], ax: "invalid" }],
  };

  assert.throws(
    () => parseV2CaptureJson(JSON.stringify(invalid), "positiveX"),
    /sample 0\.ax must be a finite int16 value/,
  );
});

test("rejects a V2 envelope without sampleCount", () => {
  const samples = createCapture({ x: GRAVITY_COUNTS, y: 0, z: 0 }, 60);

  assert.throws(
    () =>
      parseV2CaptureJson(
        JSON.stringify({
          schemaVersion: 2,
          sensorDataUnit: "raw_counts",
          samples,
        }),
        "positiveX",
      ),
    /sampleCount must be a positive integer/,
  );
});

test("rejects a capture with too few samples", () => {
  assert.throws(
    () =>
      analyzeSixPositionCaptures(
        idealCaptures(DIAGNOSTIC_QUALITY_LIMITS.minimumSampleCount - 1),
      ),
    /requires at least 60 samples/,
  );
});

test("rejects excessive acceleration dispersion", () => {
  const captures = idealCaptures() as Record<Orientation, ImuSampleV2[]>;
  captures.positiveX = createCapture({ x: GRAVITY_COUNTS, y: 0, z: 0 }).map(
    (sample, index) => ({
      ...sample,
      ay: index % 2 === 0 ? 1000 : -1000,
    }),
  );

  assert.throws(
    () => analyzeSixPositionCaptures(captures),
    /acceleration vector RMS deviation .* exceeds diagnostic limit/,
  );
});

test("rejects an unstable acceleration norm", () => {
  const captures = idealCaptures() as Record<Orientation, ImuSampleV2[]>;
  captures.positiveX = createCapture({ x: GRAVITY_COUNTS, y: 0, z: 0 }).map(
    (sample, index) => ({
      ...sample,
      ax: GRAVITY_COUNTS + (index % 2 === 0 ? 270 : -270),
    }),
  );

  assert.throws(
    () => analyzeSixPositionCaptures(captures),
    /acceleration norm std .* exceeds diagnostic limit/,
  );
});

test("parses the existing V2 capture envelope", () => {
  const samples = createCapture({ x: GRAVITY_COUNTS, y: 0, z: 0 }, 60);
  const parsed = parseV2CaptureJson(
    JSON.stringify({
      schemaVersion: 2,
      sensorDataUnit: "raw_counts",
      sampleCount: samples.length,
      samples,
    }),
    "positiveX",
  );

  assert.deepEqual(parsed, samples);
});
