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
  STANDARD_GRAVITY_MPS2,
} from "../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import { createMahony6Axis } from "../../../mobile/RepMotion/analytics/orientation/mahony6Axis";
import type { Vector3 } from "../../../mobile/RepMotion/analytics/orientation/types";
import type { ImuSampleV2 } from "../../../mobile/RepMotion/types/imu";

const DATASET_IDS = ["011", "012", "013", "014", "015", "016", "017", "018", "019", "020"] as const;

const STATIC_WINDOWS: Record<(typeof DATASET_IDS)[number], readonly [number, number]> = {
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

const PHYSICAL_ACCELEROMETER_CALIBRATION: AccelerometerCalibration = {
  biasMps2: {
    x: 0.494509751,
    y: 0.047544765,
    z: 1.084472007,
  },
  scale: {
    x: 1.000833116,
    y: 0.993389137,
    z: 0.979272511,
  },
};

const HISTORICAL_UNCALIBRATED_GLOBAL_MEAN: Vector3 = {
  x: -0.025094,
  y: -0.020015,
  z: 1.250687,
};
const HISTORICAL_REPRODUCTION_TOLERANCE_MPS2 = 1e-6;

type DatasetV2 = {
  schemaVersion: 2;
  sensorDataUnit: "raw_counts";
  sampleCount: number;
  samples: ImuSampleV2[];
};

type DatasetResult = {
  id: string;
  window: readonly [number, number];
  sampleCount: number;
  meanAccelWorldMps2: Vector3;
  meanLinearAccelWorldMps2: Vector3;
  meanLinearResidualNormMps2: number;
  combinedXyResidualMps2: number;
  meanAccelWorldNormMps2: number;
  meanAccelWorldNormErrorMps2: number;
};

type AuditResult = {
  calibrated: boolean;
  datasets: DatasetResult[];
  totalStaticSamples: number;
  globalMeanLinearAccelWorldMps2: Vector3;
  globalMeanResidualNormMps2: number;
  globalCombinedXyResidualMps2: number;
  interDatasetStdLinearAccelWorldMps2: Vector3;
  interDatasetResidualNormStdMps2: number;
  globalMeanAccelWorldNormMps2: number;
  globalMeanAccelWorldNormErrorMps2: number;
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

function loadDataset(id: (typeof DATASET_IDS)[number]): DatasetV2 {
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

function prepareSamples(
  samples: readonly ImuSampleV2[],
  calibration: AccelerometerCalibration | null,
): NormalizedImuSample[] {
  return samples.map((sample) => {
    const normalized = normalizeImuSample(sample, SENSOR_SCALE_CONFIG);
    return calibration
      ? applyAccelerometerCalibration(normalized, calibration)
      : normalized;
  });
}

function auditDataset(
  id: (typeof DATASET_IDS)[number],
  calibration: AccelerometerCalibration | null,
): DatasetResult {
  const dataset = loadDataset(id);
  const prepared = prepareSamples(dataset.samples, calibration);
  const [startIndex, endIndex] = STATIC_WINDOWS[id];
  const biasWindow = prepared.slice(startIndex, endIndex + 1);
  const gyroBias = estimateGyroBias(biasWindow);
  const corrected = prepared.map((sample) => applyGyroBias(sample, gyroBias));
  const mahony = createMahony6Axis({ kp: 1, ki: 0 });
  const accelWorld: Vector3[] = [];
  const linearAccelWorld: Vector3[] = [];

  corrected.forEach((sample, index) => {
    const quaternion = mahony.update(sample);
    if (index >= startIndex && index <= endIndex) {
      accelWorld.push(rotateBodyToWorld(sample.accelMps2, quaternion));
      linearAccelWorld.push(
        computeLinearAccelerationWorld(sample.accelMps2, quaternion),
      );
    }
  });

  const meanAccelWorldMps2 = meanVector(accelWorld);
  const meanLinearAccelWorldMps2 = meanVector(linearAccelWorld);
  const meanAccelWorldNormMps2 = mean(accelWorld.map(vectorNorm));

  return {
    id,
    window: STATIC_WINDOWS[id],
    sampleCount: linearAccelWorld.length,
    meanAccelWorldMps2,
    meanLinearAccelWorldMps2,
    meanLinearResidualNormMps2: vectorNorm(meanLinearAccelWorldMps2),
    combinedXyResidualMps2: Math.hypot(
      meanLinearAccelWorldMps2.x,
      meanLinearAccelWorldMps2.y,
    ),
    meanAccelWorldNormMps2,
    meanAccelWorldNormErrorMps2:
      meanAccelWorldNormMps2 - STANDARD_GRAVITY_MPS2,
  };
}

function runAudit(calibration: AccelerometerCalibration | null): AuditResult {
  const datasets = DATASET_IDS.map((id) => auditDataset(id, calibration));
  const totalStaticSamples = datasets.reduce(
    (total, dataset) => total + dataset.sampleCount,
    0,
  );
  const globalMeanLinearAccelWorldMps2 = {
    x:
      datasets.reduce(
        (sum, dataset) =>
          sum + dataset.meanLinearAccelWorldMps2.x * dataset.sampleCount,
        0,
      ) / totalStaticSamples,
    y:
      datasets.reduce(
        (sum, dataset) =>
          sum + dataset.meanLinearAccelWorldMps2.y * dataset.sampleCount,
        0,
      ) / totalStaticSamples,
    z:
      datasets.reduce(
        (sum, dataset) =>
          sum + dataset.meanLinearAccelWorldMps2.z * dataset.sampleCount,
        0,
      ) / totalStaticSamples,
  };
  const globalMeanAccelWorldNormMps2 =
    datasets.reduce(
      (sum, dataset) =>
        sum + dataset.meanAccelWorldNormMps2 * dataset.sampleCount,
      0,
    ) / totalStaticSamples;

  return {
    calibrated: calibration !== null,
    datasets,
    totalStaticSamples,
    globalMeanLinearAccelWorldMps2,
    globalMeanResidualNormMps2: vectorNorm(
      globalMeanLinearAccelWorldMps2,
    ),
    globalCombinedXyResidualMps2: Math.hypot(
      globalMeanLinearAccelWorldMps2.x,
      globalMeanLinearAccelWorldMps2.y,
    ),
    interDatasetStdLinearAccelWorldMps2: {
      x: populationStd(
        datasets.map((dataset) => dataset.meanLinearAccelWorldMps2.x),
      ),
      y: populationStd(
        datasets.map((dataset) => dataset.meanLinearAccelWorldMps2.y),
      ),
      z: populationStd(
        datasets.map((dataset) => dataset.meanLinearAccelWorldMps2.z),
      ),
    },
    interDatasetResidualNormStdMps2: populationStd(
      datasets.map((dataset) => dataset.meanLinearResidualNormMps2),
    ),
    globalMeanAccelWorldNormMps2,
    globalMeanAccelWorldNormErrorMps2:
      globalMeanAccelWorldNormMps2 - STANDARD_GRAVITY_MPS2,
  };
}

function deltaFromHistorical(value: Readonly<Vector3>): Vector3 {
  return {
    x: value.x - HISTORICAL_UNCALIBRATED_GLOBAL_MEAN.x,
    y: value.y - HISTORICAL_UNCALIBRATED_GLOBAL_MEAN.y,
    z: value.z - HISTORICAL_UNCALIBRATED_GLOBAL_MEAN.z,
  };
}

const uncalibrated = runAudit(null);
const historicalDelta = deltaFromHistorical(
  uncalibrated.globalMeanLinearAccelWorldMps2,
);
if (
  Math.max(
    Math.abs(historicalDelta.x),
    Math.abs(historicalDelta.y),
    Math.abs(historicalDelta.z),
  ) > HISTORICAL_REPRODUCTION_TOLERANCE_MPS2
) {
  throw new Error("The uncalibrated audit does not reproduce the historical baseline.");
}
const calibrated = runAudit(PHYSICAL_ACCELEROMETER_CALIBRATION);
const driftSeconds = [1, 5, 10];

console.log(
  JSON.stringify(
    {
      configuration: {
        sensorScale: SENSOR_SCALE_CONFIG,
        mahony: { kp: 1, ki: 0 },
        accelerometerCalibration: PHYSICAL_ACCELEROMETER_CALIBRATION,
        staticWindows: STATIC_WINDOWS,
      },
      historicalReproduction: {
        expectedGlobalMeanLinearAccelWorldMps2:
          HISTORICAL_UNCALIBRATED_GLOBAL_MEAN,
        actualGlobalMeanLinearAccelWorldMps2:
          uncalibrated.globalMeanLinearAccelWorldMps2,
        toleranceMps2: HISTORICAL_REPRODUCTION_TOLERANCE_MPS2,
        delta: historicalDelta,
      },
      uncalibrated,
      calibrated,
      calibratedTheoreticalVelocityDrift: Object.fromEntries(
        driftSeconds.map((seconds) => [
          `${seconds}s`,
          {
            vectorMps: {
              x: calibrated.globalMeanLinearAccelWorldMps2.x * seconds,
              y: calibrated.globalMeanLinearAccelWorldMps2.y * seconds,
              z: calibrated.globalMeanLinearAccelWorldMps2.z * seconds,
            },
            normMps: calibrated.globalMeanResidualNormMps2 * seconds,
          },
        ]),
      ),
    },
    null,
    2,
  ),
);
