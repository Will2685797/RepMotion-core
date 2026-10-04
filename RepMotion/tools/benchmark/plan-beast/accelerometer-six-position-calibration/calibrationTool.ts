import { readFileSync } from "node:fs";

import {
  applyAccelerometerCalibration,
  estimateAccelerometerCalibration,
} from "../../../../mobile/RepMotion/analytics/imu/accelerometerCalibration";
import { normalizeImuSample } from "../../../../mobile/RepMotion/analytics/imu/normalizeImuSample";
import type {
  AccelerometerCalibration,
  AccelerometerVector,
  NormalizedImuSample,
  SensorScaleConfig,
  SixPositionAccelerometerMeasurements,
} from "../../../../mobile/RepMotion/analytics/imu/types";
import { STANDARD_GRAVITY_MPS2 } from "../../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import type { ImuSampleV2 } from "../../../../mobile/RepMotion/types/imu";

export const ORIENTATIONS = [
  "positiveX",
  "negativeX",
  "positiveY",
  "negativeY",
  "positiveZ",
  "negativeZ",
] as const;

export type Orientation = (typeof ORIENTATIONS)[number];
export type SixPositionCaptureSamples = Record<
  Orientation,
  readonly ImuSampleV2[]
>;

export const SENSOR_SCALE_CONFIG: SensorScaleConfig = {
  accelCountsPerG: 16384,
  gyroCountsPerDegPerSec: 131,
};

/**
 * Diagnostic capture limits, not production motion-detection thresholds.
 * Sixty samples represent three seconds at the current nominal 20 Hz capture
 * rate. The dispersion limits are roughly three times the static dispersion
 * observed in the rowing 011-020 audit, leaving margin for capture noise while
 * still rejecting a sensor that was visibly moving.
 */
export const DIAGNOSTIC_QUALITY_LIMITS = {
  minimumSampleCount: 60,
  maximumAccelVectorDeviationRmsMps2: 0.2,
  maximumAccelNormStdMps2: 0.15,
} as const;

type CaptureQuality = {
  accelAxisStdMps2: AccelerometerVector;
  accelVectorDeviationRmsMps2: number;
  accelNormStdMps2: number;
};

export type OrientationValidationMetrics = {
  orientation: Orientation;
  sampleCount: number;
  meanNormalizedAccelMps2: AccelerometerVector;
  meanNormBeforeCalibrationMps2: number;
  meanCalibratedAccelMps2: AccelerometerVector;
  meanNormAfterCalibrationMps2: number;
  normErrorAfterCalibrationMps2: number;
  idealAccelMps2: AccelerometerVector;
  vectorErrorMps2: AccelerometerVector;
  quality: CaptureQuality;
};

export type SixPositionCalibrationReport = {
  sensorScaleConfig: SensorScaleConfig;
  diagnosticQualityLimits: typeof DIAGNOSTIC_QUALITY_LIMITS;
  calibration: AccelerometerCalibration;
  observedHalfSpansMps2: AccelerometerVector;
  orientations: OrientationValidationMetrics[];
};

const SENSOR_FIELDS = ["ax", "ay", "az", "gx", "gy", "gz"] as const;
const METADATA_FIELDS = ["sampleIndex", "timestampMs"] as const;
const UINT32_MAX = 0xffffffff;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateSample(value: unknown, label: string, index: number): ImuSampleV2 {
  if (!isRecord(value)) {
    throw new TypeError(`${label}: sample ${index} must be an object.`);
  }

  for (const field of SENSOR_FIELDS) {
    const fieldValue = value[field];
    if (
      !Number.isFinite(fieldValue) ||
      !Number.isInteger(fieldValue) ||
      (fieldValue as number) < -32768 ||
      (fieldValue as number) > 32767
    ) {
      throw new TypeError(
        `${label}: sample ${index}.${field} must be a finite int16 value.`,
      );
    }
  }

  for (const field of METADATA_FIELDS) {
    const fieldValue = value[field];
    if (
      !Number.isFinite(fieldValue) ||
      !Number.isInteger(fieldValue) ||
      (fieldValue as number) < 0 ||
      (fieldValue as number) > UINT32_MAX
    ) {
      throw new TypeError(
        `${label}: sample ${index}.${field} must be a finite uint32 value.`,
      );
    }
  }

  return value as ImuSampleV2;
}

export function parseV2CaptureJson(
  jsonText: string,
  label: string,
): ImuSampleV2[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new SyntaxError(
      `${label}: invalid JSON (${error instanceof Error ? error.message : String(error)}).`,
    );
  }

  if (!isRecord(parsed)) {
    throw new TypeError(`${label}: capture root must be an object.`);
  }
  if (parsed.schemaVersion !== 2) {
    throw new TypeError(`${label}: schemaVersion must be 2.`);
  }
  if (parsed.sensorDataUnit !== "raw_counts") {
    throw new TypeError(`${label}: sensorDataUnit must be "raw_counts".`);
  }
  if (!Array.isArray(parsed.samples)) {
    throw new TypeError(`${label}: samples must be an array.`);
  }
  if (parsed.samples.length === 0) {
    throw new RangeError(`${label}: capture must contain at least one sample.`);
  }
  if (!Number.isInteger(parsed.sampleCount) || (parsed.sampleCount as number) < 1) {
    throw new TypeError(`${label}: sampleCount must be a positive integer.`);
  }
  if (parsed.sampleCount !== parsed.samples.length) {
    throw new RangeError(
      `${label}: sampleCount does not match samples.length.`,
    );
  }

  const samples = parsed.samples.map((sample, index) =>
    validateSample(sample, label, index),
  );
  for (let index = 1; index < samples.length; index += 1) {
    if (samples[index].timestampMs <= samples[index - 1].timestampMs) {
      throw new RangeError(
        `${label}: timestampMs must be strictly increasing at sample ${index}.`,
      );
    }
    if (samples[index].sampleIndex <= samples[index - 1].sampleIndex) {
      throw new RangeError(
        `${label}: sampleIndex must be strictly increasing at sample ${index}.`,
      );
    }
  }

  return samples;
}

export function loadV2CaptureFile(path: string, label: string): ImuSampleV2[] {
  return parseV2CaptureJson(readFileSync(path, "utf8"), label);
}

function meanVector(
  samples: readonly NormalizedImuSample[],
): AccelerometerVector {
  const total = samples.reduce(
    (sum, sample) => ({
      x: sum.x + sample.accelMps2.x,
      y: sum.y + sample.accelMps2.y,
      z: sum.z + sample.accelMps2.z,
    }),
    { x: 0, y: 0, z: 0 },
  );
  return {
    x: total.x / samples.length,
    y: total.y / samples.length,
    z: total.z / samples.length,
  };
}

function vectorNorm(vector: Readonly<AccelerometerVector>): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function meanAndStd(values: readonly number[]): { mean: number; std: number } {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce(
    (sum, value) => sum + (value - mean) ** 2,
    0,
  ) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

function validateCaptureQuality(
  orientation: Orientation,
  samples: readonly NormalizedImuSample[],
): CaptureQuality {
  if (samples.length < DIAGNOSTIC_QUALITY_LIMITS.minimumSampleCount) {
    throw new RangeError(
      `${orientation}: capture requires at least ${DIAGNOSTIC_QUALITY_LIMITS.minimumSampleCount} samples; received ${samples.length}.`,
    );
  }

  const mean = meanVector(samples);
  const variance = samples.reduce(
    (sum, sample) => ({
      x: sum.x + (sample.accelMps2.x - mean.x) ** 2,
      y: sum.y + (sample.accelMps2.y - mean.y) ** 2,
      z: sum.z + (sample.accelMps2.z - mean.z) ** 2,
    }),
    { x: 0, y: 0, z: 0 },
  );
  const accelAxisStdMps2 = {
    x: Math.sqrt(variance.x / samples.length),
    y: Math.sqrt(variance.y / samples.length),
    z: Math.sqrt(variance.z / samples.length),
  };
  const accelVectorDeviationRmsMps2 = vectorNorm(accelAxisStdMps2);
  const accelNormStdMps2 = meanAndStd(
    samples.map((sample) => vectorNorm(sample.accelMps2)),
  ).std;

  if (
    accelVectorDeviationRmsMps2 >
    DIAGNOSTIC_QUALITY_LIMITS.maximumAccelVectorDeviationRmsMps2
  ) {
    throw new RangeError(
      `${orientation}: acceleration vector RMS deviation ${accelVectorDeviationRmsMps2.toFixed(6)} m/s² exceeds diagnostic limit ${DIAGNOSTIC_QUALITY_LIMITS.maximumAccelVectorDeviationRmsMps2} m/s².`,
    );
  }
  if (
    accelNormStdMps2 >
    DIAGNOSTIC_QUALITY_LIMITS.maximumAccelNormStdMps2
  ) {
    throw new RangeError(
      `${orientation}: acceleration norm std ${accelNormStdMps2.toFixed(6)} m/s² exceeds diagnostic limit ${DIAGNOSTIC_QUALITY_LIMITS.maximumAccelNormStdMps2} m/s².`,
    );
  }

  return {
    accelAxisStdMps2,
    accelVectorDeviationRmsMps2,
    accelNormStdMps2,
  };
}

const IDEAL_ACCELERATION: Record<Orientation, AccelerometerVector> = {
  positiveX: { x: STANDARD_GRAVITY_MPS2, y: 0, z: 0 },
  negativeX: { x: -STANDARD_GRAVITY_MPS2, y: 0, z: 0 },
  positiveY: { x: 0, y: STANDARD_GRAVITY_MPS2, z: 0 },
  negativeY: { x: 0, y: -STANDARD_GRAVITY_MPS2, z: 0 },
  positiveZ: { x: 0, y: 0, z: STANDARD_GRAVITY_MPS2 },
  negativeZ: { x: 0, y: 0, z: -STANDARD_GRAVITY_MPS2 },
};

export function analyzeSixPositionCaptures(
  captures: SixPositionCaptureSamples,
): SixPositionCalibrationReport {
  const normalized = Object.fromEntries(
    ORIENTATIONS.map((orientation) => [
      orientation,
      captures[orientation].map((sample) =>
        normalizeImuSample(sample, SENSOR_SCALE_CONFIG),
      ),
    ]),
  ) as Record<Orientation, NormalizedImuSample[]>;

  const quality = Object.fromEntries(
    ORIENTATIONS.map((orientation) => [
      orientation,
      validateCaptureQuality(orientation, normalized[orientation]),
    ]),
  ) as Record<Orientation, CaptureQuality>;
  const meanBefore = Object.fromEntries(
    ORIENTATIONS.map((orientation) => [
      orientation,
      meanVector(normalized[orientation]),
    ]),
  ) as SixPositionAccelerometerMeasurements;

  const calibration = estimateAccelerometerCalibration(meanBefore);
  const calibrated = Object.fromEntries(
    ORIENTATIONS.map((orientation) => [
      orientation,
      normalized[orientation].map((sample) =>
        applyAccelerometerCalibration(sample, calibration),
      ),
    ]),
  ) as Record<Orientation, NormalizedImuSample[]>;

  const orientations = ORIENTATIONS.map((orientation) => {
    const meanNormalizedAccelMps2 = meanBefore[orientation];
    const meanCalibratedAccelMps2 = meanVector(calibrated[orientation]);
    const meanNormBeforeCalibrationMps2 = meanAndStd(
      normalized[orientation].map((sample) => vectorNorm(sample.accelMps2)),
    ).mean;
    const meanNormAfterCalibrationMps2 = meanAndStd(
      calibrated[orientation].map((sample) => vectorNorm(sample.accelMps2)),
    ).mean;
    const idealAccelMps2 = IDEAL_ACCELERATION[orientation];

    return {
      orientation,
      sampleCount: normalized[orientation].length,
      meanNormalizedAccelMps2,
      meanNormBeforeCalibrationMps2,
      meanCalibratedAccelMps2,
      meanNormAfterCalibrationMps2,
      normErrorAfterCalibrationMps2:
        meanNormAfterCalibrationMps2 - STANDARD_GRAVITY_MPS2,
      idealAccelMps2,
      vectorErrorMps2: {
        x: meanCalibratedAccelMps2.x - idealAccelMps2.x,
        y: meanCalibratedAccelMps2.y - idealAccelMps2.y,
        z: meanCalibratedAccelMps2.z - idealAccelMps2.z,
      },
      quality: quality[orientation],
    };
  });

  return {
    sensorScaleConfig: { ...SENSOR_SCALE_CONFIG },
    diagnosticQualityLimits: { ...DIAGNOSTIC_QUALITY_LIMITS },
    calibration,
    observedHalfSpansMps2: {
      x: STANDARD_GRAVITY_MPS2 / calibration.scale.x,
      y: STANDARD_GRAVITY_MPS2 / calibration.scale.y,
      z: STANDARD_GRAVITY_MPS2 / calibration.scale.z,
    },
    orientations,
  };
}
