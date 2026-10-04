import type { Vector3 } from "../orientation/types";

export type QuasiStaticSample = {
  linearAccelerationWorldMps2: Vector3;
  gyroRadPerSec: Vector3;
  timestampMs: number;
  sampleIndex?: number;
};

export type QuasiStaticConfig = {
  maxLinearAccelerationMps2: number;
  maxGyroRadPerSec: number;
  minimumDurationMs: number;
  maximumSampleGapMs: number;
  dynamicContext?: {
    windowDurationMs: number;
    minLinearAccelerationRmsMps2: number;
    minGyroRmsRadPerSec: number;
  };
};

export type QuasiStaticInterval = {
  startArrayIndex: number;
  endArrayIndex: number;
  startTimestampMs: number;
  endTimestampMs: number;
  durationMs: number;
  sampleCount: number;
  anchorArrayIndex: number;
  anchorTimestampMs: number;
  anchorSampleIndex?: number;
};

function vectorNorm(vector: Readonly<Vector3>): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function validateVector(
  vector: Readonly<Vector3>,
  label: string,
  index: number,
): void {
  if (![vector.x, vector.y, vector.z].every(Number.isFinite)) {
    throw new RangeError(`${label} must be finite at index ${index}.`);
  }
}

function validateConfig(config: Readonly<QuasiStaticConfig>): void {
  if (
    !Number.isFinite(config.maxLinearAccelerationMps2) ||
    config.maxLinearAccelerationMps2 < 0
  ) {
    throw new RangeError(
      "maxLinearAccelerationMps2 must be finite and non-negative.",
    );
  }
  if (!Number.isFinite(config.maxGyroRadPerSec) || config.maxGyroRadPerSec < 0) {
    throw new RangeError("maxGyroRadPerSec must be finite and non-negative.");
  }
  if (!Number.isFinite(config.minimumDurationMs) || config.minimumDurationMs < 0) {
    throw new RangeError("minimumDurationMs must be finite and non-negative.");
  }
  if (!Number.isFinite(config.maximumSampleGapMs) || config.maximumSampleGapMs <= 0) {
    throw new RangeError("maximumSampleGapMs must be finite and strictly positive.");
  }
  if (config.dynamicContext !== undefined) {
    if (
      !Number.isFinite(config.dynamicContext.windowDurationMs) ||
      config.dynamicContext.windowDurationMs <= 0
    ) {
      throw new RangeError(
        "dynamicContext.windowDurationMs must be finite and strictly positive.",
      );
    }
    if (
      !Number.isFinite(config.dynamicContext.minLinearAccelerationRmsMps2) ||
      config.dynamicContext.minLinearAccelerationRmsMps2 < 0
    ) {
      throw new RangeError(
        "dynamicContext.minLinearAccelerationRmsMps2 must be finite and non-negative.",
      );
    }
    if (
      !Number.isFinite(config.dynamicContext.minGyroRmsRadPerSec) ||
      config.dynamicContext.minGyroRmsRadPerSec < 0
    ) {
      throw new RangeError(
        "dynamicContext.minGyroRmsRadPerSec must be finite and non-negative.",
      );
    }
  }
}

function buildInterval(
  samples: readonly Readonly<QuasiStaticSample>[],
  startArrayIndex: number,
  endArrayIndex: number,
): QuasiStaticInterval {
  const start = samples[startArrayIndex];
  const end = samples[endArrayIndex];
  const midpointTimestampMs = (start.timestampMs + end.timestampMs) / 2;
  let anchorArrayIndex = startArrayIndex;
  for (let index = startArrayIndex + 1; index <= endArrayIndex; index += 1) {
    if (
      Math.abs(samples[index].timestampMs - midpointTimestampMs) <
      Math.abs(samples[anchorArrayIndex].timestampMs - midpointTimestampMs)
    ) {
      anchorArrayIndex = index;
    }
  }
  const anchor = samples[anchorArrayIndex];
  return {
    startArrayIndex,
    endArrayIndex,
    startTimestampMs: start.timestampMs,
    endTimestampMs: end.timestampMs,
    durationMs: end.timestampMs - start.timestampMs,
    sampleCount: endArrayIndex - startArrayIndex + 1,
    anchorArrayIndex,
    anchorTimestampMs: anchor.timestampMs,
    ...(anchor.sampleIndex === undefined
      ? {}
      : { anchorSampleIndex: anchor.sampleIndex }),
  };
}

/**
 * Finds contiguous intervals whose world linear acceleration and corrected gyro
 * norms stay below configurable physical thresholds for a minimum real duration.
 * An optional centered RMS context veto rejects quiet passages embedded in
 * simultaneous translational and rotational activity.
 */
export function detectQuasiStaticIntervals(
  samples: readonly Readonly<QuasiStaticSample>[],
  config: Readonly<QuasiStaticConfig>,
): QuasiStaticInterval[] {
  validateConfig(config);
  samples.forEach((sample, index) => {
    validateVector(
      sample.linearAccelerationWorldMps2,
      "Linear acceleration",
      index,
    );
    validateVector(sample.gyroRadPerSec, "Gyroscope", index);
    if (!Number.isFinite(sample.timestampMs)) {
      throw new RangeError(`timestampMs must be finite at index ${index}.`);
    }
    if (index > 0 && sample.timestampMs <= samples[index - 1].timestampMs) {
      throw new RangeError(
        `timestampMs must be strictly increasing at index ${index}.`,
      );
    }
  });

  const accelerationNorms = samples.map((sample) =>
    vectorNorm(sample.linearAccelerationWorldMps2),
  );
  const gyroNorms = samples.map((sample) => vectorNorm(sample.gyroRadPerSec));
  const hasStrongDynamicContext = (anchorArrayIndex: number): boolean => {
    const context = config.dynamicContext;
    if (context === undefined) return false;

    const centerTimestampMs = samples[anchorArrayIndex].timestampMs;
    const halfWindowMs = context.windowDurationMs / 2;
    const windowStartMs = centerTimestampMs - halfWindowMs;
    const windowEndMs = centerTimestampMs + halfWindowMs;
    if (
      samples.length === 0 ||
      samples[0].timestampMs > windowStartMs ||
      samples.at(-1)!.timestampMs < windowEndMs
    ) return false;

    let squaredAccelerationSum = 0;
    let squaredGyroSum = 0;
    let sampleCount = 0;
    samples.forEach((sample, index) => {
      if (
        sample.timestampMs >= windowStartMs &&
        sample.timestampMs <= windowEndMs
      ) {
        squaredAccelerationSum += accelerationNorms[index] ** 2;
        squaredGyroSum += gyroNorms[index] ** 2;
        sampleCount += 1;
      }
    });
    const accelerationRmsMps2 = Math.sqrt(squaredAccelerationSum / sampleCount);
    const gyroRmsRadPerSec = Math.sqrt(squaredGyroSum / sampleCount);
    return (
      accelerationRmsMps2 >= context.minLinearAccelerationRmsMps2 &&
      gyroRmsRadPerSec >= context.minGyroRmsRadPerSec
    );
  };

  const intervals: QuasiStaticInterval[] = [];
  let candidateStart: number | null = null;

  const closeCandidate = (endArrayIndex: number): void => {
    if (candidateStart === null) return;
    const interval = buildInterval(samples, candidateStart, endArrayIndex);
    if (
      interval.durationMs >= config.minimumDurationMs &&
      !hasStrongDynamicContext(interval.anchorArrayIndex)
    ) intervals.push(interval);
    candidateStart = null;
  };

  samples.forEach((sample, index) => {
    const gapExceeded =
      index > 0 &&
      sample.timestampMs - samples[index - 1].timestampMs >
        config.maximumSampleGapMs;
    if (gapExceeded) closeCandidate(index - 1);

    const isQuasiStatic =
      accelerationNorms[index] <= config.maxLinearAccelerationMps2 &&
      gyroNorms[index] <= config.maxGyroRadPerSec;
    if (isQuasiStatic) {
      if (candidateStart === null) candidateStart = index;
    } else {
      closeCandidate(index - 1);
    }
  });
  closeCandidate(samples.length - 1);

  return intervals;
}
