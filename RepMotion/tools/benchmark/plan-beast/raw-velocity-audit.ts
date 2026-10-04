import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { applyAccelerometerCalibration } from "../../../mobile/RepMotion/analytics/imu/accelerometerCalibration";
import { applyGyroBias, estimateGyroBias } from "../../../mobile/RepMotion/analytics/imu/gyroBias";
import { normalizeImuSample } from "../../../mobile/RepMotion/analytics/imu/normalizeImuSample";
import type {
  AccelerometerCalibration,
  SensorScaleConfig,
} from "../../../mobile/RepMotion/analytics/imu/types";
import { integrateVelocity1D } from "../../../mobile/RepMotion/analytics/kinematics/integrateVelocity1D";
import { computeLinearAccelerationWorld } from "../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import { estimateInitialOrientationFromAccel } from "../../../mobile/RepMotion/analytics/orientation/initialOrientation";
import { createMahony6Axis } from "../../../mobile/RepMotion/analytics/orientation/mahony6Axis";
import type { ImuSampleV2 } from "../../../mobile/RepMotion/types/imu";

const DATASET_IDS = ["011", "012", "013", "014", "015", "016", "017", "018", "019", "020"] as const;
type DatasetId = (typeof DATASET_IDS)[number];

const STATIC_WINDOWS: Record<DatasetId, readonly [number, number]> = {
  "011": [13, 32],
  "012": [25, 44],
  "013": [35, 54],
  "014": [73, 92],
  "015": [42, 61],
  "016": [114, 133],
  "017": [94, 113],
  "018": [629, 646],
  "019": [113, 132],
  "020": [91, 110],
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
  const path = fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: readonly number[], probability: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower] +
    (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction;
}

function internalIndices(start: number, end: number): number[] {
  const indices: number[] = [];
  for (let index = Math.floor(start) + 1; index < end; index += 1) {
    indices.push(index);
  }
  return indices;
}

function boundedIndices(start: number, end: number): number[] {
  const indices: number[] = [];
  for (let index = Math.ceil(start); index <= Math.floor(end); index += 1) {
    indices.push(index);
  }
  return indices;
}

function valueAtSampleFloat(values: readonly number[], position: number): number {
  if (!Number.isFinite(position) || position < 0 || position > values.length - 1) {
    throw new RangeError(`Sample position ${position} is outside the velocity series.`);
  }
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return values[lower];
  const fraction = position - lower;
  return values[lower] + (values[upper] - values[lower]) * fraction;
}

function statistics(values: readonly number[]) {
  if (values.length === 0) return null;
  return {
    mean: mean(values),
    min: Math.min(...values),
    max: Math.max(...values),
    meanAbs: mean(values.map(Math.abs)),
    maxAbs: Math.max(...values.map(Math.abs)),
  };
}

function validateInputs(
  id: DatasetId,
  dataset: DatasetV2,
  groundTruth: GroundTruthV2,
): void {
  if (
    dataset.schemaVersion !== 2 ||
    dataset.sensorDataUnit !== "raw_counts" ||
    dataset.sampleCount !== dataset.samples.length
  ) {
    throw new Error(`${id}: invalid raw-counts V2 dataset.`);
  }
  if (
    groundTruth.annotationVersion !== 2 ||
    groundTruth.performedReps !== 5 ||
    groundTruth.events.length !== 11
  ) {
    throw new Error(`${id}: invalid V2 Ground Truth.`);
  }
}

function buildProductionLinearAccelerationZ(
  id: DatasetId,
  dataset: DatasetV2,
) {
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
  const corrected = normalizedAndCalibrated.map((sample) =>
    applyGyroBias(sample, gyroBias),
  );
  const initialQuaternion = estimateInitialOrientationFromAccel(
    corrected.slice(0, INITIAL_STATIC_SAMPLE_COUNT),
  );
  const mahony = createMahony6Axis(MAHONY_CONFIG, initialQuaternion);

  return corrected.map((sample) => ({
    accelerationMps2:
      computeLinearAccelerationWorld(
        sample.accelMps2,
        mahony.update(sample),
      ).z,
    timestampMs: sample.timestampMs,
    sampleIndex: sample.sampleIndex,
  }));
}

function auditDataset(id: DatasetId) {
  const dataset = readJson<DatasetV2>(
    `datasets/calibration/rowing/rowing_5reps_${id}.json`,
  );
  const groundTruth = readJson<GroundTruthV2>(
    `datasets/ground-truth/rowing_5reps_${id}.v2.json`,
  );
  validateInputs(id, dataset, groundTruth);

  const acceleration = buildProductionLinearAccelerationZ(id, dataset);
  const velocitySamples = integrateVelocity1D(acceleration);
  const velocity = velocitySamples.map((sample) => sample.velocityMps);
  const events = groundTruth.events;

  const phases = events.slice(0, -1).map((event, eventIndex) => {
    const next = events[eventIndex + 1];
    if (event.departureSampleFloat === null) {
      throw new Error(`${id}: only final B6 may have no departure.`);
    }
    const phase = event.type === "BOTTOM" ? "UP" as const : "DOWN" as const;
    const indices = internalIndices(
      event.departureSampleFloat,
      next.arrivalSampleFloat,
    );
    const values = indices.map((index) => velocity[index]);
    const expected = values.filter((value) =>
      phase === "UP" ? value > 0 : value < 0,
    ).length;
    return {
      label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep} -> ${next.type === "BOTTOM" ? "B" : "T"}${next.rep}`,
      phase,
      rep: event.type === "BOTTOM" ? event.rep : next.rep - 1,
      sampleCount: values.length,
      startVelocityMps: valueAtSampleFloat(velocity, event.departureSampleFloat),
      endVelocityMps: valueAtSampleFloat(velocity, next.arrivalSampleFloat),
      statistics: statistics(values),
      expectedSignCount: expected,
      expectedSignProportion: expected / values.length,
      meanHasExpectedSign:
        phase === "UP" ? mean(values) > 0 : mean(values) < 0,
    };
  });

  const holds = events.flatMap((event) => {
    const indices = event.departureSampleFloat === null
      ? []
      : boundedIndices(event.arrivalSampleFloat, event.departureSampleFloat);
    const values = indices.map((index) => velocity[index]);
    return [{
      label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep}`,
      type: event.type,
      sampleCount: values.length,
      arrivalVelocityMps: valueAtSampleFloat(velocity, event.arrivalSampleFloat),
      departureVelocityMps: event.departureSampleFloat === null
        ? null
        : valueAtSampleFloat(velocity, event.departureSampleFloat),
      statistics: statistics(values),
    }];
  });

  const bottomEvents = events.filter((event) => event.type === "BOTTOM");
  const cycles = bottomEvents.slice(0, -1).map((start, index) => {
    const end = bottomEvents[index + 1];
    const startVelocity = valueAtSampleFloat(
      velocity,
      start.departureSampleFloat!,
    );
    const endVelocity = valueAtSampleFloat(velocity, end.arrivalSampleFloat);
    return {
      rep: start.rep,
      startVelocityMps: startVelocity,
      endVelocityMps: endVelocity,
      driftMps: endVelocity - startVelocity,
    };
  });

  const movementIndices = phases.flatMap((phase, phaseIndex) => {
    const event = events[phaseIndex];
    const next = events[phaseIndex + 1];
    return internalIndices(event.departureSampleFloat!, next.arrivalSampleFloat);
  });
  const movementVelocity = movementIndices.map((index) => velocity[index]);
  const upPhases = phases.filter((phase) => phase.phase === "UP");
  const downPhases = phases.filter((phase) => phase.phase === "DOWN");
  const firstBottom = bottomEvents[0];
  const finalBottom = bottomEvents.at(-1)!;
  const firstBottomArrivalVelocity = valueAtSampleFloat(
    velocity,
    firstBottom.arrivalSampleFloat,
  );
  const firstBottomDepartureVelocity = valueAtSampleFloat(
    velocity,
    firstBottom.departureSampleFloat!,
  );
  const finalBottomArrivalVelocity = valueAtSampleFloat(
    velocity,
    finalBottom.arrivalSampleFloat,
  );
  const bottomArrivalVelocities = bottomEvents.map((event) =>
    valueAtSampleFloat(velocity, event.arrivalSampleFloat),
  );
  const topArrivalVelocities = events
    .filter((event) => event.type === "TOP")
    .map((event) => valueAtSampleFloat(velocity, event.arrivalSampleFloat));

  return {
    id,
    sampleCount: dataset.samples.length,
    initialVelocityMps: velocity[0],
    finalVelocityMps: velocity.at(-1)!,
    finalDriftMps: velocity.at(-1)! - velocity[0],
    minVelocityMps: Math.min(...velocity),
    maxVelocityMps: Math.max(...velocity),
    maxAbsVelocityMps: Math.max(...velocity.map(Math.abs)),
    peakToPeakVelocityMps: Math.max(...velocity) - Math.min(...velocity),
    fiveRepSpan: {
      firstBottomArrivalVelocityMps: firstBottomArrivalVelocity,
      firstBottomDepartureVelocityMps: firstBottomDepartureVelocity,
      finalBottomArrivalVelocityMps: finalBottomArrivalVelocity,
      driftArrivalB1ToArrivalB6Mps:
        finalBottomArrivalVelocity - firstBottomArrivalVelocity,
      driftDepartureB1ToArrivalB6Mps:
        finalBottomArrivalVelocity - firstBottomDepartureVelocity,
    },
    movementVelocity: {
      sampleCount: movementVelocity.length,
      medianAbsMps: percentile(movementVelocity.map(Math.abs), 0.5),
      p95AbsMps: percentile(movementVelocity.map(Math.abs), 0.95),
      maxAbsMps: Math.max(...movementVelocity.map(Math.abs)),
    },
    direction: {
      upExpectedSignProportion:
        upPhases.reduce((sum, phase) => sum + phase.expectedSignCount, 0) /
        upPhases.reduce((sum, phase) => sum + phase.sampleCount, 0),
      downExpectedSignProportion:
        downPhases.reduce((sum, phase) => sum + phase.expectedSignCount, 0) /
        downPhases.reduce((sum, phase) => sum + phase.sampleCount, 0),
      phaseMeansWithExpectedSign: phases.filter(
        (phase) => phase.meanHasExpectedSign,
      ).length,
      phaseCount: phases.length,
    },
    returnToZero: {
      bottomArrivalMeanAbsMps: mean(bottomArrivalVelocities.map(Math.abs)),
      bottomArrivalMaxAbsMps: Math.max(...bottomArrivalVelocities.map(Math.abs)),
      topArrivalMeanAbsMps: mean(topArrivalVelocities.map(Math.abs)),
      topArrivalMaxAbsMps: Math.max(...topArrivalVelocities.map(Math.abs)),
    },
    cycles,
    holds,
    phases,
  };
}

const datasets = DATASET_IDS.map(auditDataset);

console.log(JSON.stringify({
  controls: {
    sensorScale: SENSOR_SCALE_CONFIG,
    accelerometerCalibration: ACCELEROMETER_CALIBRATION,
    mahony: MAHONY_CONFIG,
    initialStaticSampleCount: INITIAL_STATIC_SAMPLE_COUNT,
    staticWindows: STATIC_WINDOWS,
    integration: "production integrateVelocity1D; trapezoidal; real timestampMs",
    initialVelocityMps: 0,
    velocityReset: false,
    filtering: false,
    smoothing: false,
    clamping: false,
    zupt: false,
    driftCorrection: false,
    automaticRepDetection: false,
    groundTruthUsage: "Descriptive readout boundaries only; never used by the IMU pipeline or integration.",
  },
  datasets,
}, null, 2));
