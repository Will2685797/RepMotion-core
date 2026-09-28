import type {
  AccelerometerCalibration,
  AccelerometerVector,
  NormalizedImuSample,
  SixPositionAccelerometerMeasurements,
} from "./types";

const STANDARD_GRAVITY_MPS2 = 9.80665;

function assertFiniteVector(
  label: string,
  vector: Readonly<AccelerometerVector>,
): void {
  for (const axis of ["x", "y", "z"] as const) {
    if (!Number.isFinite(vector[axis])) {
      throw new TypeError(
        `Accelerometer calibration measurement ${label}.${axis} must be finite.`,
      );
    }
  }
}

function estimateAxisCalibration(
  axis: "X" | "Y" | "Z",
  positive: number,
  negative: number,
): { biasMps2: number; scale: number } {
  const biasMps2 = (positive + negative) / 2;
  const halfSpan = (positive - negative) / 2;

  if (!Number.isFinite(halfSpan) || halfSpan <= 0) {
    throw new RangeError(
      `Accelerometer calibration ${axis} half-span must be finite and strictly positive.`,
    );
  }

  const scale = STANDARD_GRAVITY_MPS2 / halfSpan;
  if (!Number.isFinite(biasMps2) || !Number.isFinite(scale)) {
    throw new RangeError(
      `Accelerometer calibration ${axis} bias and scale must be finite.`,
    );
  }

  return { biasMps2, scale };
}

/**
 * Six-position convention: positiveX is measured with body +X aligned with
 * world +gravity, negativeX with body -X aligned with world +gravity, and
 * equivalently for Y and Z. Only the active component of each opposing pair
 * enters the diagonal bias-and-scale model; cross-axis terms are not fitted.
 */
export function estimateAccelerometerCalibration(
  measurements: Readonly<SixPositionAccelerometerMeasurements>,
): AccelerometerCalibration {
  const entries: Array<[string, Readonly<AccelerometerVector>]> = [
    ["positiveX", measurements.positiveX],
    ["negativeX", measurements.negativeX],
    ["positiveY", measurements.positiveY],
    ["negativeY", measurements.negativeY],
    ["positiveZ", measurements.positiveZ],
    ["negativeZ", measurements.negativeZ],
  ];
  entries.forEach(([label, vector]) => assertFiniteVector(label, vector));

  const x = estimateAxisCalibration(
    "X",
    measurements.positiveX.x,
    measurements.negativeX.x,
  );
  const y = estimateAxisCalibration(
    "Y",
    measurements.positiveY.y,
    measurements.negativeY.y,
  );
  const z = estimateAxisCalibration(
    "Z",
    measurements.positiveZ.z,
    measurements.negativeZ.z,
  );

  return {
    biasMps2: { x: x.biasMps2, y: y.biasMps2, z: z.biasMps2 },
    scale: { x: x.scale, y: y.scale, z: z.scale },
  };
}

export function applyAccelerometerCalibration(
  sample: Readonly<NormalizedImuSample>,
  calibration: Readonly<AccelerometerCalibration>,
): NormalizedImuSample {
  return {
    accelMps2: {
      x:
        (sample.accelMps2.x - calibration.biasMps2.x) *
        calibration.scale.x,
      y:
        (sample.accelMps2.y - calibration.biasMps2.y) *
        calibration.scale.y,
      z:
        (sample.accelMps2.z - calibration.biasMps2.z) *
        calibration.scale.z,
    },
    gyroRadPerSec: { ...sample.gyroRadPerSec },
    sampleIndex: sample.sampleIndex,
    timestampMs: sample.timestampMs,
  };
}
