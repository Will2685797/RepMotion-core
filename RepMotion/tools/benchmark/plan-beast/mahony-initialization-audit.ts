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
import type {
  Quaternion,
  Vector3,
} from "../../../mobile/RepMotion/analytics/orientation/types";
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
const WARMUP_DURATIONS_MS = [250, 500, 1_000, 2_000, 3_000, 4_000] as const;
const IDENTITY_QUATERNION: Quaternion = { w: 1, x: 0, y: 0, z: 0 };
const REFERENCE_GLOBAL_MEAN: Vector3 = {
  x: -0.06084762659066267,
  y: -0.023361614546616758,
  z: -0.011717134405525421,
};

type DatasetV2 = {
  schemaVersion: 2;
  sensorDataUnit: "raw_counts";
  sampleCount: number;
  samples: ImuSampleV2[];
};

type Initialization =
  | { kind: "identity" }
  | { kind: "accelerometer" }
  | { kind: "warmup"; requestedDurationMs: number };

type DatasetResult = {
  id: DatasetId;
  window: readonly [number, number];
  windowElapsedMs: readonly [number, number];
  sampleCount: number;
  meanLinearAccelWorldMps2: Vector3;
  meanResidualNormMps2: number;
  combinedXyResidualMps2: number;
  meanTiltErrorDeg: number;
  initialAccelTiltDeg: number;
  actualWarmupDurationMs: number;
  warmupSampleCount: number;
  quaternionAtWindowStart: Quaternion;
  quaternionAtWindowEnd: Quaternion;
};

type ScenarioResult = {
  scenario: string;
  datasets: DatasetResult[];
  totalStaticSamples: number;
  globalMeanLinearAccelWorldMps2: Vector3;
  globalMeanResidualNormMps2: number;
  globalCombinedXyResidualMps2: number;
  interDatasetStdMps2: Vector3;
};

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function meanVector(values: readonly Vector3[]): Vector3 {
  return {
    x: mean(values.map((value) => value.x)),
    y: mean(values.map((value) => value.y)),
    z: mean(values.map((value) => value.z)),
  };
}

function vectorNorm(value: Readonly<Vector3>): number {
  return Math.hypot(value.x, value.y, value.z);
}

function populationStd(values: readonly number[]): number {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function tiltFromWorldZDeg(value: Readonly<Vector3>): number {
  const norm = vectorNorm(value);
  const cosine = Math.max(-1, Math.min(1, value.z / norm));
  return radiansToDegrees(Math.acos(cosine));
}

function loadDataset(id: DatasetId): DatasetV2 {
  const path = fileURLToPath(
    new URL(`../../../datasets/calibration/rowing/rowing_5reps_${id}.json`, import.meta.url),
  );
  const dataset = JSON.parse(readFileSync(path, "utf8")) as DatasetV2;
  if (
    dataset.schemaVersion !== 2 ||
    dataset.sensorDataUnit !== "raw_counts" ||
    dataset.sampleCount !== dataset.samples.length
  ) {
    throw new Error(`Dataset ${id} is not a consistent raw-counts V2 capture.`);
  }
  return dataset;
}

function prepareSamples(dataset: DatasetV2, id: DatasetId): NormalizedImuSample[] {
  const calibrated = dataset.samples.map((sample) =>
    applyAccelerometerCalibration(
      normalizeImuSample(sample, SENSOR_SCALE_CONFIG),
      ACCELEROMETER_CALIBRATION,
    ),
  );
  const [startIndex, endIndex] = STATIC_WINDOWS[id];
  const gyroBias = estimateGyroBias(calibrated.slice(startIndex, endIndex + 1));
  return calibrated.map((sample) => applyGyroBias(sample, gyroBias));
}

function createWarmupSamples(
  samples: readonly NormalizedImuSample[],
  requestedDurationMs: number,
): NormalizedImuSample[] {
  const initial = samples.slice(0, INITIAL_STATIC_SAMPLE_COUNT);
  const deltas = initial.slice(1).map(
    (sample, index) => sample.timestampMs - initial[index].timestampMs,
  );
  const selected: NormalizedImuSample[] = [];
  const selectedDeltas: number[] = [];
  let durationMs = 0;
  let index = 0;

  while (durationMs < requestedDurationMs) {
    const delta = deltas[index % deltas.length];
    durationMs += delta;
    selectedDeltas.push(delta);
    selected.push(initial[index % initial.length]);
    index += 1;
  }

  let timestampMs = samples[0].timestampMs - durationMs;
  return selected.map((sample, selectedIndex) => {
    const warmupSample = { ...sample, timestampMs };
    timestampMs += selectedDeltas[selectedIndex];
    return warmupSample;
  });
}

function auditDataset(id: DatasetId, initialization: Initialization): DatasetResult {
  const dataset = loadDataset(id);
  const samples = prepareSamples(dataset, id);
  const initialAccel = meanVector(
    samples.slice(0, INITIAL_STATIC_SAMPLE_COUNT).map((sample) => sample.accelMps2),
  );
  const initialQuaternion =
    initialization.kind === "accelerometer"
      ? estimateInitialOrientationFromAccel(
          samples.slice(0, INITIAL_STATIC_SAMPLE_COUNT),
        )
      : IDENTITY_QUATERNION;
  const alignedInitialAccel = rotateBodyToWorld(initialAccel, initialQuaternion);
  const initialAlignmentError = Math.hypot(
    alignedInitialAccel.x,
    alignedInitialAccel.y,
  );
  if (initialization.kind === "accelerometer" && initialAlignmentError > 1e-9) {
    throw new Error(
      `Dataset ${id}: accelerometer initialization alignment error ${initialAlignmentError}.`,
    );
  }

  const mahony = createMahony6Axis(MAHONY_CONFIG, initialQuaternion);
  const warmupSamples =
    initialization.kind === "warmup"
      ? createWarmupSamples(samples, initialization.requestedDurationMs)
      : [];
  warmupSamples.forEach((sample) => mahony.update(sample));

  const [startIndex, endIndex] = STATIC_WINDOWS[id];
  const linearWindow: Vector3[] = [];
  const accelWorldWindow: Vector3[] = [];
  let quaternionAtWindowStart: Quaternion | null = null;
  let quaternionAtWindowEnd: Quaternion | null = null;

  samples.forEach((sample, index) => {
    const bodyToWorld = mahony.update(sample);

    if (index >= startIndex && index <= endIndex) {
      quaternionAtWindowStart ??= bodyToWorld;
      quaternionAtWindowEnd = bodyToWorld;
      accelWorldWindow.push(rotateBodyToWorld(sample.accelMps2, bodyToWorld));
      linearWindow.push(
        computeLinearAccelerationWorld(sample.accelMps2, bodyToWorld),
      );
    }
  });

  if (!quaternionAtWindowStart || !quaternionAtWindowEnd) {
    throw new Error(`Dataset ${id}: static window was not evaluated.`);
  }

  const meanLinearAccelWorldMps2 = meanVector(linearWindow);
  const meanAccelWorld = meanVector(accelWorldWindow);
  return {
    id,
    window: STATIC_WINDOWS[id],
    windowElapsedMs: [
      samples[startIndex].timestampMs - samples[0].timestampMs,
      samples[endIndex].timestampMs - samples[0].timestampMs,
    ],
    sampleCount: linearWindow.length,
    meanLinearAccelWorldMps2,
    meanResidualNormMps2: vectorNorm(meanLinearAccelWorldMps2),
    combinedXyResidualMps2: Math.hypot(
      meanLinearAccelWorldMps2.x,
      meanLinearAccelWorldMps2.y,
    ),
    meanTiltErrorDeg: tiltFromWorldZDeg(meanAccelWorld),
    initialAccelTiltDeg: tiltFromWorldZDeg(initialAccel),
    actualWarmupDurationMs:
      warmupSamples.length === 0
        ? 0
        : samples[0].timestampMs - warmupSamples[0].timestampMs,
    warmupSampleCount: warmupSamples.length,
    quaternionAtWindowStart,
    quaternionAtWindowEnd,
  };
}

function runScenario(name: string, initialization: Initialization): ScenarioResult {
  const datasets = DATASET_IDS.map((id) => auditDataset(id, initialization));
  const totalStaticSamples = datasets.reduce(
    (total, dataset) => total + dataset.sampleCount,
    0,
  );
  const weightedMean = (axis: keyof Vector3): number =>
    datasets.reduce(
      (sum, dataset) =>
        sum + dataset.meanLinearAccelWorldMps2[axis] * dataset.sampleCount,
      0,
    ) / totalStaticSamples;
  const globalMeanLinearAccelWorldMps2 = {
    x: weightedMean("x"),
    y: weightedMean("y"),
    z: weightedMean("z"),
  };

  return {
    scenario: name,
    datasets,
    totalStaticSamples,
    globalMeanLinearAccelWorldMps2,
    globalMeanResidualNormMps2: vectorNorm(globalMeanLinearAccelWorldMps2),
    globalCombinedXyResidualMps2: Math.hypot(
      globalMeanLinearAccelWorldMps2.x,
      globalMeanLinearAccelWorldMps2.y,
    ),
    interDatasetStdMps2: {
      x: populationStd(datasets.map((result) => result.meanLinearAccelWorldMps2.x)),
      y: populationStd(datasets.map((result) => result.meanLinearAccelWorldMps2.y)),
      z: populationStd(datasets.map((result) => result.meanLinearAccelWorldMps2.z)),
    },
  };
}

const reference = runScenario("A_identity", { kind: "identity" });
const referenceError = {
  x: reference.globalMeanLinearAccelWorldMps2.x - REFERENCE_GLOBAL_MEAN.x,
  y: reference.globalMeanLinearAccelWorldMps2.y - REFERENCE_GLOBAL_MEAN.y,
  z: reference.globalMeanLinearAccelWorldMps2.z - REFERENCE_GLOBAL_MEAN.z,
};
if (Math.max(...Object.values(referenceError).map(Math.abs)) > 1e-12) {
  throw new Error("Scenario A does not reproduce the calibrated reference audit.");
}

const accelerometerInitialized = runScenario("B_accelerometer_initialization", {
  kind: "accelerometer",
});
const warmups = WARMUP_DURATIONS_MS.map((requestedDurationMs) =>
  runScenario(`C_warmup_${requestedDurationMs}ms`, {
    kind: "warmup",
    requestedDurationMs,
  }),
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
        realSampleTimestampsChanged: false,
      },
      referenceReproductionErrorMps2: referenceError,
      scenarios: [reference, accelerometerInitialized, ...warmups],
    },
    null,
    2,
  ),
);
