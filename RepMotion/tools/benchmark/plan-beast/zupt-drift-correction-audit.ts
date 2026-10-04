import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { applyAccelerometerCalibration } from "../../../mobile/RepMotion/analytics/imu/accelerometerCalibration";
import { applyGyroBias, estimateGyroBias } from "../../../mobile/RepMotion/analytics/imu/gyroBias";
import { normalizeImuSample } from "../../../mobile/RepMotion/analytics/imu/normalizeImuSample";
import type { AccelerometerCalibration, SensorScaleConfig } from "../../../mobile/RepMotion/analytics/imu/types";
import { correctVelocityDrift } from "../../../mobile/RepMotion/analytics/kinematics/correctVelocityDrift";
import { createZeroVelocityAnchors } from "../../../mobile/RepMotion/analytics/kinematics/createZeroVelocityAnchors";
import {
  detectQuasiStaticIntervals,
  type QuasiStaticConfig,
  type QuasiStaticSample,
} from "../../../mobile/RepMotion/analytics/kinematics/detectQuasiStaticIntervals";
import { integrateVelocity1D, type VelocitySample1D } from "../../../mobile/RepMotion/analytics/kinematics/integrateVelocity1D";
import { computeLinearAccelerationWorld } from "../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import { estimateInitialOrientationFromAccel } from "../../../mobile/RepMotion/analytics/orientation/initialOrientation";
import { createMahony6Axis } from "../../../mobile/RepMotion/analytics/orientation/mahony6Axis";
import type { Vector3 } from "../../../mobile/RepMotion/analytics/orientation/types";
import type { ImuSampleV2 } from "../../../mobile/RepMotion/types/imu";

const DATASET_IDS = ["011", "012", "013", "014", "015", "016", "017", "018", "019", "020"] as const;
type DatasetId = (typeof DATASET_IDS)[number];

const STATIC_WINDOWS: Record<DatasetId, readonly [number, number]> = {
  "011": [13, 32], "012": [25, 44], "013": [35, 54], "014": [73, 92],
  "015": [42, 61], "016": [114, 133], "017": [94, 113], "018": [629, 646],
  "019": [113, 132], "020": [91, 110],
};

const SENSOR_SCALE_CONFIG: SensorScaleConfig = {
  accelCountsPerG: 16_384,
  gyroCountsPerDegPerSec: 131,
};
const ACCELEROMETER_CALIBRATION: AccelerometerCalibration = {
  biasMps2: { x: 0.494509751, y: 0.047544765, z: 1.084472007 },
  scale: { x: 1.000833116, y: 0.993389137, z: 0.979272511 },
};
const MAHONY_CONFIG = { kp: 1, ki: 0 } as const;
const INITIAL_STATIC_SAMPLE_COUNT = 10;
const BASELINE_QUASI_STATIC_CONFIG: QuasiStaticConfig = {
  maxLinearAccelerationMps2: 0.20,
  maxGyroRadPerSec: 0.01,
  minimumDurationMs: 200,
  maximumSampleGapMs: 100,
};
const QUASI_STATIC_CONFIG: QuasiStaticConfig = {
  ...BASELINE_QUASI_STATIC_CONFIG,
  dynamicContext: {
    windowDurationMs: 1_000,
    minLinearAccelerationRmsMps2: 0.90,
    minGyroRmsRadPerSec: 0.010,
  },
};

type DatasetV2 = {
  schemaVersion: 2;
  sensorDataUnit: "raw_counts";
  sampleCount: number;
  samples: ImuSampleV2[];
};
type GroundTruthEvent = {
  type: "BOTTOM" | "TOP";
  rep: number;
  arrivalSampleFloat: number;
  departureSampleFloat: number | null;
};
type GroundTruthV2 = {
  annotationVersion: 2;
  performedReps: 5;
  events: GroundTruthEvent[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  )) as T;
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rms(values: readonly number[]): number {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function populationStandardDeviation(values: readonly number[]): number {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function signalStats(values: readonly number[]) {
  return {
    mean: mean(values),
    min: Math.min(...values),
    max: Math.max(...values),
    rms: rms(values),
    standardDeviation: populationStandardDeviation(values),
  };
}

function percentile(values: readonly number[], probability: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower] +
    (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction;
}

function distribution(values: readonly number[]) {
  return {
    p10: percentile(values, 0.10),
    p25: percentile(values, 0.25),
    p50: percentile(values, 0.50),
    p75: percentile(values, 0.75),
    p90: percentile(values, 0.90),
    p95: percentile(values, 0.95),
    p99: percentile(values, 0.99),
  };
}

function vectorNorm(vector: Readonly<Vector3>): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function centeredWindowIndices(
  samples: readonly Readonly<QuasiStaticSample>[],
  centerTimestampMs: number,
  windowDurationMs: number,
): number[] {
  const halfWindowMs = windowDurationMs / 2;
  return samples.flatMap((sample, index) =>
    sample.timestampMs >= centerTimestampMs - halfWindowMs &&
    sample.timestampMs <= centerTimestampMs + halfWindowMs
      ? [index]
      : [],
  );
}


function internalIndices(start: number, end: number): number[] {
  const indices: number[] = [];
  for (let index = Math.floor(start) + 1; index < end; index += 1) indices.push(index);
  return indices;
}

function boundedIndices(start: number, end: number): number[] {
  const indices: number[] = [];
  for (let index = Math.ceil(start); index <= Math.floor(end); index += 1) indices.push(index);
  return indices;
}

function valueAtSampleFloat(values: readonly number[], position: number): number {
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return values[lower];
  const fraction = position - lower;
  return values[lower] + (values[upper] - values[lower]) * fraction;
}

function buildProductionSignals(id: DatasetId, dataset: DatasetV2) {
  const normalizedAndCalibrated = dataset.samples.map((sample) =>
    applyAccelerometerCalibration(
      normalizeImuSample(sample, SENSOR_SCALE_CONFIG),
      ACCELEROMETER_CALIBRATION,
    ),
  );
  const [staticStart, staticEnd] = STATIC_WINDOWS[id];
  const gyroBias = estimateGyroBias(
    normalizedAndCalibrated.slice(staticStart, staticEnd + 1),
  );
  const corrected = normalizedAndCalibrated.map((sample) => applyGyroBias(sample, gyroBias));
  const initialQuaternion = estimateInitialOrientationFromAccel(
    corrected.slice(0, INITIAL_STATIC_SAMPLE_COUNT),
  );
  const mahony = createMahony6Axis(MAHONY_CONFIG, initialQuaternion);
  const quasiStaticSamples: QuasiStaticSample[] = [];
  const acceleration1D = corrected.map((sample) => {
    const linearAccelerationWorldMps2 = computeLinearAccelerationWorld(
      sample.accelMps2,
      mahony.update(sample),
    );
    quasiStaticSamples.push({
      linearAccelerationWorldMps2,
      gyroRadPerSec: { ...sample.gyroRadPerSec },
      timestampMs: sample.timestampMs,
      sampleIndex: sample.sampleIndex,
    });
    return {
      accelerationMps2: linearAccelerationWorldMps2.z,
      timestampMs: sample.timestampMs,
      sampleIndex: sample.sampleIndex,
    };
  });
  return { quasiStaticSamples, acceleration1D };
}

function evaluateVelocity(
  velocitySamples: readonly Readonly<VelocitySample1D>[],
  groundTruth: GroundTruthV2,
) {
  const velocity = velocitySamples.map((sample) => sample.velocityMps);
  const events = groundTruth.events;
  const phases = events.slice(0, -1).map((event, index) => {
    const next = events[index + 1];
    const phase = event.type === "BOTTOM" ? "UP" as const : "DOWN" as const;
    const indices = internalIndices(event.departureSampleFloat!, next.arrivalSampleFloat);
    const values = indices.map((sampleIndex) => velocity[sampleIndex]);
    const expectedSignCount = values.filter((value) =>
      phase === "UP" ? value > 0 : value < 0,
    ).length;
    return { phase, indices, expectedSignCount };
  });
  const movementIndices = phases.flatMap((phase) => phase.indices);
  const movementVelocity = movementIndices.map((index) => velocity[index]);
  const bottomEvents = events.filter((event) => event.type === "BOTTOM");
  const topEvents = events.filter((event) => event.type === "TOP");
  const bottomArrivals = bottomEvents.map((event) =>
    valueAtSampleFloat(velocity, event.arrivalSampleFloat),
  );
  const topArrivals = topEvents.map((event) =>
    valueAtSampleFloat(velocity, event.arrivalSampleFloat),
  );
  const up = phases.filter((phase) => phase.phase === "UP");
  const down = phases.filter((phase) => phase.phase === "DOWN");
  const upExpectedSignCount = up.reduce(
    (sum, phase) => sum + phase.expectedSignCount,
    0,
  );
  const upSampleCount = up.reduce((sum, phase) => sum + phase.indices.length, 0);
  const downExpectedSignCount = down.reduce(
    (sum, phase) => sum + phase.expectedSignCount,
    0,
  );
  const downSampleCount = down.reduce(
    (sum, phase) => sum + phase.indices.length,
    0,
  );
  return {
    finalVelocityMps: velocity.at(-1)!,
    minVelocityMps: Math.min(...velocity),
    maxVelocityMps: Math.max(...velocity),
    driftArrivalB1ToArrivalB6Mps: bottomArrivals.at(-1)! - bottomArrivals[0],
    bottomArrivalMeanAbsMps: mean(bottomArrivals.map(Math.abs)),
    bottomArrivalMaxAbsMps: Math.max(...bottomArrivals.map(Math.abs)),
    topArrivalMeanAbsMps: mean(topArrivals.map(Math.abs)),
    topArrivalMaxAbsMps: Math.max(...topArrivals.map(Math.abs)),
    movementMedianAbsMps: percentile(movementVelocity.map(Math.abs), 0.5),
    movementP95AbsMps: percentile(movementVelocity.map(Math.abs), 0.95),
    upExpectedSignCount,
    upSampleCount,
    downExpectedSignCount,
    downSampleCount,
    upPositiveProportion: upExpectedSignCount / upSampleCount,
    downNegativeProportion: downExpectedSignCount / downSampleCount,
  };
}

function auditDataset(id: DatasetId) {
  const dataset = readJson<DatasetV2>(
    `datasets/calibration/rowing/rowing_5reps_${id}.json`,
  );
  const groundTruth = readJson<GroundTruthV2>(
    `datasets/ground-truth/rowing_5reps_${id}.v2.json`,
  );
  if (
    dataset.schemaVersion !== 2 ||
    dataset.sensorDataUnit !== "raw_counts" ||
    dataset.sampleCount !== dataset.samples.length
  ) throw new Error(`${id}: invalid raw-counts V2 dataset.`);

  const { quasiStaticSamples, acceleration1D } = buildProductionSignals(id, dataset);
  const rawVelocity = integrateVelocity1D(acceleration1D);
  const baselineIntervals = detectQuasiStaticIntervals(
    quasiStaticSamples,
    BASELINE_QUASI_STATIC_CONFIG,
  );
  const baselineAnchors = createZeroVelocityAnchors(baselineIntervals);
  const baselineCorrectedVelocity = correctVelocityDrift(
    rawVelocity,
    baselineAnchors,
  );
  const intervals = detectQuasiStaticIntervals(quasiStaticSamples, QUASI_STATIC_CONFIG);
  const anchors = createZeroVelocityAnchors(intervals);
  const correctedVelocity = correctVelocityDrift(rawVelocity, anchors);
  const raw = evaluateVelocity(rawVelocity, groundTruth);
  const baselineCorrected = evaluateVelocity(
    baselineCorrectedVelocity,
    groundTruth,
  );
  const corrected = evaluateVelocity(correctedVelocity, groundTruth);

  const rawValues = rawVelocity.map((sample) => sample.velocityMps);
  const accelNorms = quasiStaticSamples.map((sample) =>
    vectorNorm(sample.linearAccelerationWorldMps2),
  );
  const gyroNorms = quasiStaticSamples.map((sample) => vectorNorm(sample.gyroRadPerSec));
  const movementIndices = groundTruth.events.slice(0, -1).flatMap((event, index) =>
    internalIndices(event.departureSampleFloat!, groundTruth.events[index + 1].arrivalSampleFloat),
  );
  const holdIndices = groundTruth.events.slice(0, -1).flatMap((event) =>
    boundedIndices(event.arrivalSampleFloat, event.departureSampleFloat!),
  );
  const movementIndexSet = new Set(movementIndices);
  const holdIndexSet = new Set(holdIndices);
  const oracleIntervals = baselineIntervals.filter(
    (interval) => !movementIndexSet.has(interval.anchorArrayIndex),
  );
  const oracleCorrectedVelocity = correctVelocityDrift(
    rawVelocity,
    createZeroVelocityAnchors(oracleIntervals),
  );
  const indicesInTimestampRange = (
    startTimestampMs: number,
    endTimestampMs: number,
    includeStart: boolean,
    includeEnd: boolean,
  ): number[] => quasiStaticSamples.flatMap((sample, index) => {
    const afterStart = includeStart
      ? sample.timestampMs >= startTimestampMs
      : sample.timestampMs > startTimestampMs;
    const beforeEnd = includeEnd
      ? sample.timestampMs <= endTimestampMs
      : sample.timestampMs < endTimestampMs;
    return afterStart && beforeEnd ? [index] : [];
  });
  const describeIntervals = (
    detectedIntervals: typeof intervals,
    velocitySamples: readonly Readonly<VelocitySample1D>[],
  ) => {
    const correctedValues = velocitySamples.map((sample) => sample.velocityMps);
    return detectedIntervals.map((interval) => {
      const values = correctedValues.slice(
        interval.startArrayIndex,
        interval.endArrayIndex + 1,
      );
      const intervalIndices = Array.from(
        { length: interval.sampleCount },
        (_, offset) => interval.startArrayIndex + offset,
      );
      const annotatedMovementSampleCount = intervalIndices.filter(
        (index) => movementIndexSet.has(index),
      ).length;
      const beforeIndices = indicesInTimestampRange(
        interval.startTimestampMs - 500,
        interval.startTimestampMs,
        true,
        false,
      );
      const afterIndices = indicesInTimestampRange(
        interval.endTimestampMs,
        interval.endTimestampMs + 500,
        false,
        true,
      );
      const surroundingIndices = indicesInTimestampRange(
        interval.anchorTimestampMs - 500,
        interval.anchorTimestampMs + 500,
        true,
        true,
      );
      const statsFor = (indices: readonly number[]) => ({
        sampleCount: indices.length,
        accelerationNormMps2: signalStats(
          indices.map((index) => accelNorms[index]),
        ),
        gyroNormRadPerSec: signalStats(indices.map((index) => gyroNorms[index])),
        rawVelocityMps: signalStats(indices.map((index) => rawValues[index])),
      });
      const centeredWindowStats = (windowDurationMs: number) => statsFor(
        centeredWindowIndices(
          quasiStaticSamples,
          interval.anchorTimestampMs,
          windowDurationMs,
        ),
      );
      return {
        startTimestampMs: interval.startTimestampMs,
        endTimestampMs: interval.endTimestampMs,
        durationMs: interval.durationMs,
        sampleCount: interval.sampleCount,
        anchorTimestampMs: interval.anchorTimestampMs,
        anchorContext: movementIndexSet.has(interval.anchorArrayIndex)
          ? "MOVEMENT"
          : holdIndexSet.has(interval.anchorArrayIndex)
            ? "HOLD"
            : "OUTSIDE_ANNOTATED_REPS",
        annotatedMovementSampleCount,
        annotatedMovementProportion:
          annotatedMovementSampleCount / interval.sampleCount,
        correctedAnchorVelocityMps: correctedValues[interval.anchorArrayIndex],
        correctedMeanAbsVelocityMps: mean(values.map(Math.abs)),
        correctedMaxAbsVelocityMps: Math.max(...values.map(Math.abs)),
        diagnostics: {
          interval: statsFor(intervalIndices),
          preceding500Ms: statsFor(beforeIndices),
          following500Ms: statsFor(afterIndices),
          centered400Ms: centeredWindowStats(400),
          centered600Ms: centeredWindowStats(600),
          centered1000Ms: statsFor(surroundingIndices),
          rawVelocityAtAnchorMps: rawValues[interval.anchorArrayIndex],
        },
      };
    });
  };
  const baselineIntervalVelocity = describeIntervals(
    baselineIntervals,
    baselineCorrectedVelocity,
  );
  const intervalVelocity = describeIntervals(intervals, correctedVelocity);

  return {
    id,
    sampleCount: dataset.samples.length,
    distributions: {
      full: {
        linearAccelerationNormMps2: distribution(accelNorms),
        gyroNormRadPerSec: distribution(gyroNorms),
      },
      annotatedMovement: {
        linearAccelerationNormMps2: distribution(movementIndices.map((index) => accelNorms[index])),
        gyroNormRadPerSec: distribution(movementIndices.map((index) => gyroNorms[index])),
      },
      annotatedHolds: {
        linearAccelerationNormMps2: distribution(holdIndices.map((index) => accelNorms[index])),
        gyroNormRadPerSec: distribution(holdIndices.map((index) => gyroNorms[index])),
      },
    },
    baselineQuasiStatic: {
      intervalCount: baselineIntervals.length,
      anchorCount: baselineAnchors.length,
      anchorsInAnnotatedMovement: baselineIntervalVelocity.filter(
        (interval) => interval.anchorContext === "MOVEMENT",
      ).length,
      anchorsInAnnotatedHolds: baselineIntervalVelocity.filter(
        (interval) => interval.anchorContext === "HOLD",
      ).length,
      anchorsOutsideAnnotatedReps: baselineIntervalVelocity.filter(
        (interval) => interval.anchorContext === "OUTSIDE_ANNOTATED_REPS",
      ).length,
      intervals: baselineIntervalVelocity,
    },
    quasiStatic: {
      intervalCount: intervals.length,
      anchorCount: anchors.length,
      anchorsInAnnotatedMovement: intervalVelocity.filter(
        (interval) => interval.anchorContext === "MOVEMENT",
      ).length,
      anchorsInAnnotatedHolds: intervalVelocity.filter(
        (interval) => interval.anchorContext === "HOLD",
      ).length,
      anchorsOutsideAnnotatedReps: intervalVelocity.filter(
        (interval) => interval.anchorContext === "OUTSIDE_ANNOTATED_REPS",
      ).length,
      correctedAnchorMaxAbsVelocityMps: Math.max(...intervalVelocity.map(
        (interval) => Math.abs(interval.correctedAnchorVelocityMps),
      )),
      intervals: intervalVelocity,
      correctedMeanAbsVelocityMps: mean(intervalVelocity.map(
        (interval) => interval.correctedMeanAbsVelocityMps,
      )),
      correctedMaxAbsVelocityMps: Math.max(...intervalVelocity.map(
        (interval) => interval.correctedMaxAbsVelocityMps,
      )),
    },
    raw,
    baselineCorrected,
    corrected,
    evaluationOnlyOracleWithoutMovementAnchors: {
      intervalCount: oracleIntervals.length,
      corrected: evaluateVelocity(oracleCorrectedVelocity, groundTruth),
    },
  };
}

const datasets = DATASET_IDS.map(auditDataset);
console.log(JSON.stringify({
  controls: {
    sensorScale: SENSOR_SCALE_CONFIG,
    accelerometerCalibration: ACCELEROMETER_CALIBRATION,
    mahony: MAHONY_CONFIG,
    baselineQuasiStatic: BASELINE_QUASI_STATIC_CONFIG,
    quasiStatic: QUASI_STATIC_CONFIG,
    anchorRepresentation: "one actual sample nearest each interval temporal midpoint",
    outsideAnchorRangePolicy: "hold-nearest-anchor-error",
    groundTruthUsage: "evaluation only; never used by detection, anchors, integration, or correction",
    smoothing: false,
    clamping: false,
    automaticRepDetection: false,
  },
  datasets,
}, null, 2));
