import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { applyAccelerometerCalibration } from "../../../mobile/RepMotion/analytics/imu/accelerometerCalibration";
import { applyGyroBias, estimateGyroBias } from "../../../mobile/RepMotion/analytics/imu/gyroBias";
import { normalizeImuSample } from "../../../mobile/RepMotion/analytics/imu/normalizeImuSample";
import type {
  AccelerometerCalibration,
  NormalizedImuSample,
  SensorScaleConfig,
} from "../../../mobile/RepMotion/analytics/imu/types";
import {
  computeLinearAccelerationWorld,
  rotateBodyToWorld,
} from "../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import { estimateInitialOrientationFromAccel } from "../../../mobile/RepMotion/analytics/orientation/initialOrientation";
import { createMahony6Axis } from "../../../mobile/RepMotion/analytics/orientation/mahony6Axis";
import type { Vector3 } from "../../../mobile/RepMotion/analytics/orientation/types";
import type { ImuSampleV2 } from "../../../mobile/RepMotion/types/imu";

const DATASET_IDS = ["011", "012", "013", "014", "015", "016", "017", "018", "019", "020"] as const;
type DatasetId = (typeof DATASET_IDS)[number];
type Axis = keyof Vector3;

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
const AXES = ["x", "y", "z"] as const;

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

type PhaseResult = {
  label: string;
  phase: "UP" | "DOWN";
  rep: number;
  sampleCount: number;
  durationSeconds: number;
  min: number;
  max: number;
  rms: number;
  mean: number;
  p95Abs: number;
  signTransitions: number;
  lobeOrder: "POS_THEN_NEG" | "NEG_THEN_POS";
  positivePeakPosition: number;
  negativePeakPosition: number;
};

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rms(values: readonly number[]): number {
  return Math.sqrt(mean(values.map((value) => value * value)));
}

function vectorNorm(value: Readonly<Vector3>): number {
  return Math.hypot(value.x, value.y, value.z);
}

function meanVector(values: readonly Vector3[]): Vector3 {
  return {
    x: mean(values.map((value) => value.x)),
    y: mean(values.map((value) => value.y)),
    z: mean(values.map((value) => value.z)),
  };
}

function percentile(values: readonly number[], probability: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction;
}

function readJson<T>(relativePath: string): T {
  const path = fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url));
  return JSON.parse(readFileSync(path, "utf8")) as T;
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

  dataset.samples.forEach((sample, index) => {
    if (index === 0) return;
    const previous = dataset.samples[index - 1];
    if (
      sample.sampleIndex !== previous.sampleIndex + 1 ||
      sample.timestampMs <= previous.timestampMs
    ) {
      throw new Error(`${id}: discontinuous sample stream at array index ${index}.`);
    }
  });
}

function buildProductionSignal(
  id: DatasetId,
  dataset: DatasetV2,
): {
  normalizedAndCalibrated: NormalizedImuSample[];
  accelWorld: Vector3[];
  linearAccelWorld: Vector3[];
} {
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
  const accelWorld: Vector3[] = [];
  const linearAccelWorld: Vector3[] = [];

  corrected.forEach((sample) => {
    const quaternion = mahony.update(sample);
    accelWorld.push(rotateBodyToWorld(sample.accelMps2, quaternion));
    linearAccelWorld.push(
      computeLinearAccelerationWorld(sample.accelMps2, quaternion),
    );
  });

  return { normalizedAndCalibrated, accelWorld, linearAccelWorld };
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

function countSignTransitions(
  values: readonly number[],
  deadband: number,
): number {
  let previousSign = 0;
  let transitions = 0;
  for (const value of values) {
    const sign = value > deadband ? 1 : value < -deadband ? -1 : 0;
    if (sign === 0) continue;
    if (previousSign !== 0 && sign !== previousSign) transitions += 1;
    previousSign = sign;
  }
  return transitions;
}

function resample(values: readonly number[], size = 64): number[] {
  if (values.length === 1) return Array.from({ length: size }, () => values[0]);
  return Array.from({ length: size }, (_, index) => {
    const position = (index * (values.length - 1)) / (size - 1);
    const lower = Math.floor(position);
    const fraction = position - lower;
    return values[lower] + (values[Math.min(lower + 1, values.length - 1)] - values[lower]) * fraction;
  });
}

function correlation(left: readonly number[], right: readonly number[]): number {
  const leftMean = mean(left);
  const rightMean = mean(right);
  let numerator = 0;
  let leftEnergy = 0;
  let rightEnergy = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftDelta = left[index] - leftMean;
    const rightDelta = right[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftEnergy += leftDelta * leftDelta;
    rightEnergy += rightDelta * rightDelta;
  }
  return numerator / Math.sqrt(leftEnergy * rightEnergy);
}

function pairwiseCorrelations(waves: readonly number[][]): number[] {
  const correlations: number[] = [];
  for (let left = 0; left < waves.length; left += 1) {
    for (let right = left + 1; right < waves.length; right += 1) {
      correlations.push(correlation(waves[left], waves[right]));
    }
  }
  return correlations;
}

function linearSlope(times: readonly number[], values: readonly number[]): number {
  const timeMean = mean(times);
  const valueMean = mean(values);
  const numerator = times.reduce(
    (sum, time, index) => sum + (time - timeMean) * (values[index] - valueMean),
    0,
  );
  const denominator = times.reduce(
    (sum, time) => sum + (time - timeMean) ** 2,
    0,
  );
  return denominator === 0 ? 0 : numerator / denominator;
}

function auditDataset(id: DatasetId) {
  const dataset = readJson<DatasetV2>(
    `datasets/calibration/rowing/rowing_5reps_${id}.json`,
  );
  const groundTruth = readJson<GroundTruthV2>(
    `datasets/ground-truth/rowing_5reps_${id}.v2.json`,
  );
  validateInputs(id, dataset, groundTruth);
  const { linearAccelWorld } = buildProductionSignal(id, dataset);

  const phaseDefinitions = groundTruth.events.slice(0, -1).map((event, index) => {
    const next = groundTruth.events[index + 1];
    if (event.departureSampleFloat === null) {
      throw new Error(`${id}: only final B6 may have no departure.`);
    }
    return {
      label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep} -> ${next.type === "BOTTOM" ? "B" : "T"}${next.rep}`,
      phase: event.type === "BOTTOM" ? "UP" as const : "DOWN" as const,
      rep: event.type === "BOTTOM" ? event.rep : next.rep - 1,
      indices: internalIndices(event.departureSampleFloat, next.arrivalSampleFloat),
    };
  });
  const movementIndices = phaseDefinitions.flatMap((phase) => phase.indices);
  const bottomEvents = groundTruth.events.filter((event) => event.type === "BOTTOM");
  const repDefinitions = bottomEvents.slice(0, -1).map((event, index) => ({
    rep: event.rep,
    indices: internalIndices(
      event.departureSampleFloat!,
      bottomEvents[index + 1].arrivalSampleFloat,
    ),
  }));
  const fullAxisValues = Object.fromEntries(
    AXES.map((axis) => [axis, linearAccelWorld.map((sample) => sample[axis])]),
  ) as Record<Axis, number[]>;
  const movementAxisValues = Object.fromEntries(
    AXES.map((axis) => [
      axis,
      movementIndices.map((index) => linearAccelWorld[index][axis]),
    ]),
  ) as Record<Axis, number[]>;
  const fullRms = Object.fromEntries(
    AXES.map((axis) => [axis, rms(fullAxisValues[axis])]),
  ) as Record<Axis, number>;
  const movementRms = Object.fromEntries(
    AXES.map((axis) => [axis, rms(movementAxisValues[axis])]),
  ) as Record<Axis, number>;
  const dominantAxis = [...AXES].sort(
    (left, right) => movementRms[right] - movementRms[left],
  )[0];
  const transverseAxes = AXES.filter((axis) => axis !== dominantAxis);
  const [staticStart, staticEnd] = STATIC_WINDOWS[id];
  const staticSamples = linearAccelWorld.slice(staticStart, staticEnd + 1);
  const staticMean = meanVector(staticSamples);
  const staticRms = Object.fromEntries(
    AXES.map((axis) => [axis, rms(staticSamples.map((sample) => sample[axis]))]),
  ) as Record<Axis, number>;
  const lobeDeadband = Math.max(0.05, 3 * staticRms[dominantAxis]);

  const phaseWaves: Record<"UP" | "DOWN", number[][]> = { UP: [], DOWN: [] };
  const phases: PhaseResult[] = phaseDefinitions.map((definition) => {
    const values = definition.indices.map(
      (index) => linearAccelWorld[index][dominantAxis],
    );
    const max = Math.max(...values);
    const min = Math.min(...values);
    const positivePeakIndex = values.indexOf(max);
    const negativePeakIndex = values.indexOf(min);
    phaseWaves[definition.phase].push(resample(values));
    return {
      label: definition.label,
      phase: definition.phase,
      rep: definition.rep,
      sampleCount: values.length,
      durationSeconds:
        (dataset.samples[definition.indices.at(-1)!].timestampMs -
          dataset.samples[definition.indices[0]].timestampMs) /
        1000,
      min,
      max,
      rms: rms(values),
      mean: mean(values),
      p95Abs: percentile(values.map(Math.abs), 0.95),
      signTransitions: countSignTransitions(values, lobeDeadband),
      lobeOrder:
        positivePeakIndex < negativePeakIndex ? "POS_THEN_NEG" : "NEG_THEN_POS",
      positivePeakPosition: positivePeakIndex / Math.max(1, values.length - 1),
      negativePeakPosition: negativePeakIndex / Math.max(1, values.length - 1),
    };
  });

  const correlations = Object.fromEntries(
    (["UP", "DOWN"] as const).map((phase) => {
      const values = pairwiseCorrelations(phaseWaves[phase]);
      return [phase, {
        mean: mean(values),
        min: Math.min(...values),
        max: Math.max(...values),
      }];
    }),
  );
  const fullReps = repDefinitions.map((definition) => {
    const values = definition.indices.map(
      (index) => linearAccelWorld[index][dominantAxis],
    );
    return {
      rep: definition.rep,
      sampleCount: values.length,
      durationSeconds:
        (dataset.samples[definition.indices.at(-1)!].timestampMs -
          dataset.samples[definition.indices[0]].timestampMs) /
        1000,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean(values),
      rms: rms(values),
      resampled: resample(values),
    };
  });
  const repWaves = fullReps.map((rep) => rep.resampled);
  const repCorrelations = pairwiseCorrelations(repWaves);
  const phasePeakToPeak = phases.map((phase) => phase.max - phase.min);
  const strongBidirectionalPhaseCount = phases.filter(
    (phase) => phase.max > lobeDeadband && phase.min < -lobeDeadband,
  ).length;
  const lobeOrderCounts = Object.fromEntries(
    (["UP", "DOWN"] as const).map((phase) => [
      phase,
      phases.filter((result) => result.phase === phase).reduce(
        (counts, result) => ({
          ...counts,
          [result.lobeOrder]: counts[result.lobeOrder] + 1,
        }),
        { POS_THEN_NEG: 0, NEG_THEN_POS: 0 },
      ),
    ]),
  );

  const holdWindows = groundTruth.events.slice(0, -1).flatMap((event) => {
    const indices = boundedIndices(
      event.arrivalSampleFloat,
      event.departureSampleFloat!,
    );
    if (indices.length === 0) return [];
    const vector = meanVector(indices.map((index) => linearAccelWorld[index]));
    return [{
      label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep}`,
      type: event.type,
      sampleCount: indices.length,
      centerTimeSeconds:
        mean(indices.map((index) => dataset.samples[index].timestampMs)) / 1000,
      mean: vector,
      norm: vectorNorm(vector),
    }];
  });
  const summarizeHolds = (type: GroundTruthEvent["type"]) => {
    const selected = holdWindows.filter((window) => window.type === type);
    const dominantMeans = selected.map((window) => window.mean[dominantAxis]);
    const times = selected.map((window) => window.centerTimeSeconds);
    return {
      count: selected.length,
      sampleCountRange: {
        min: Math.min(...selected.map((window) => window.sampleCount)),
        max: Math.max(...selected.map((window) => window.sampleCount)),
      },
      mean: meanVector(selected.map((window) => window.mean)),
      meanNorm: mean(selected.map((window) => window.norm)),
      maxNorm: Math.max(...selected.map((window) => window.norm)),
      firstToLastDominantDeltaMps2: dominantMeans.at(-1)! - dominantMeans[0],
      dominantSlopeMps2PerSecond: linearSlope(times, dominantMeans),
    };
  };

  const vectorMagnitudes = linearAccelWorld.map(vectorNorm);
  const movementVectorMagnitudes = movementIndices.map(
    (index) => vectorMagnitudes[index],
  );
  const fullMagnitudeP995 = percentile(vectorMagnitudes, 0.995);
  const fullMaxMagnitude = Math.max(...vectorMagnitudes);
  const fullMaxMagnitudeIndex = vectorMagnitudes.indexOf(fullMaxMagnitude);
  const magnitudeP995 = percentile(movementVectorMagnitudes, 0.995);
  const maxMagnitude = Math.max(...movementVectorMagnitudes);
  const maxMagnitudeIndex = vectorMagnitudes.indexOf(maxMagnitude);
  const rawFields = ["ax", "ay", "az", "gx", "gy", "gz"] as const;
  const rawMaxAbs = Object.fromEntries(
    rawFields.map((field) => [
      field,
      Math.max(...dataset.samples.map((sample) => Math.abs(sample[field]))),
    ]),
  );
  const saturatedSamples = dataset.samples.flatMap((sample, arrayIndex) => {
    const fields = rawFields.filter((field) => Math.abs(sample[field]) >= 32_760);
    return fields.length === 0
      ? []
      : [{
          arrayIndex,
          sampleIndex: sample.sampleIndex,
          timestampMs: sample.timestampMs,
          fields,
          duringAnnotatedMovement: movementIndices.includes(arrayIndex),
        }];
  });
  const dts = dataset.samples.slice(1).map(
    (sample, index) => sample.timestampMs - dataset.samples[index].timestampMs,
  );
  const medianDt = percentile(dts, 0.5);

  return {
    id,
    sampleCount: dataset.samples.length,
    durationSeconds:
      (dataset.samples.at(-1)!.timestampMs - dataset.samples[0].timestampMs) /
      1000,
    fullCapture: {
      min: Object.fromEntries(AXES.map((axis) => [axis, Math.min(...fullAxisValues[axis])])),
      max: Object.fromEntries(AXES.map((axis) => [axis, Math.max(...fullAxisValues[axis])])),
      rms: fullRms,
    },
    movement: {
      sampleCount: movementIndices.length,
      rms: movementRms,
      dominantAxis,
      dominantToLargestTransverseRmsRatio:
        movementRms[dominantAxis] /
        Math.max(...transverseAxes.map((axis) => movementRms[axis])),
      dominantToCombinedTransverseRmsRatio:
        movementRms[dominantAxis] /
        Math.hypot(...transverseAxes.map((axis) => movementRms[axis])),
      dominantP95AbsMps2: percentile(
        movementAxisValues[dominantAxis].map(Math.abs),
        0.95,
      ),
      medianPhasePeakToPeakMps2: percentile(phasePeakToPeak, 0.5),
      lobeDeadbandMps2: lobeDeadband,
      strongBidirectionalPhaseCount,
      phaseCount: phases.length,
      lobeOrderCounts,
      resampledWaveformCorrelations: correlations,
      resampledFullRepCorrelations: {
        mean: mean(repCorrelations),
        min: Math.min(...repCorrelations),
        max: Math.max(...repCorrelations),
      },
      fullReps: fullReps.map(({ resampled: _resampled, ...rep }) => rep),
      phases,
    },
    staticWindow: {
      indices: STATIC_WINDOWS[id],
      mean: staticMean,
      meanNorm: vectorNorm(staticMean),
      rms: staticRms,
    },
    annotatedHolds: {
      bottom: summarizeHolds("BOTTOM"),
      top: summarizeHolds("TOP"),
      windows: holdWindows,
    },
    quality: {
      fullVectorMagnitudeMaxMps2: fullMaxMagnitude,
      fullVectorMagnitudeP995Mps2: fullMagnitudeP995,
      fullMaxToP995Ratio: fullMaxMagnitude / fullMagnitudeP995,
      fullMaxMagnitudeArrayIndex: fullMaxMagnitudeIndex,
      fullMaxMagnitudeTimestampMs:
        dataset.samples[fullMaxMagnitudeIndex].timestampMs,
      fullMaxDuringAnnotatedMovement:
        movementIndices.includes(fullMaxMagnitudeIndex),
      movementVectorMagnitudeMaxMps2: maxMagnitude,
      movementVectorMagnitudeP995Mps2: magnitudeP995,
      maxToP995Ratio: maxMagnitude / magnitudeP995,
      maxMagnitudeArrayIndex: maxMagnitudeIndex,
      maxMagnitudeTimestampMs: dataset.samples[maxMagnitudeIndex].timestampMs,
      rawMaxAbs,
      saturationCount: saturatedSamples.length,
      movementSaturationCount: saturatedSamples.filter(
        (sample) => sample.duringAnnotatedMovement,
      ).length,
      saturatedSamples,
      sampleIndexGapCount: 0,
      nonIncreasingTimestampCount: 0,
      timestampDtMs: {
        min: Math.min(...dts),
        median: medianDt,
        max: Math.max(...dts),
        largeGapCount: dts.filter((dt) => dt > 1.5 * medianDt).length,
      },
      suspiciousIsolatedSpike:
        maxMagnitude > 2 * magnitudeP995,
      suspiciousFullCaptureIsolatedSpike:
        fullMaxMagnitude > 2 * fullMagnitudeP995,
    },
  };
}

const datasets = DATASET_IDS.map(auditDataset);
const dominantAxisCounts = datasets.reduce(
  (counts, dataset) => ({
    ...counts,
    [dataset.movement.dominantAxis]: counts[dataset.movement.dominantAxis] + 1,
  }),
  { x: 0, y: 0, z: 0 },
);

console.log(
  JSON.stringify(
    {
      controls: {
        sensorScale: SENSOR_SCALE_CONFIG,
        accelerometerCalibration: ACCELEROMETER_CALIBRATION,
        mahony: MAHONY_CONFIG,
        initialStaticSampleCount: INITIAL_STATIC_SAMPLE_COUNT,
        staticWindows: STATIC_WINDOWS,
        groundTruthUsage:
          "Descriptive phase boundaries only; never used by the IMU pipeline or to estimate orientation.",
        velocityIntegration: false,
        automaticRepDetection: false,
        zupt: false,
      },
      dominantAxisCounts,
      datasets,
    },
    null,
    2,
  ),
);
