export type AccelerationSample1D = {
  accelerationMps2: number;
  timestampMs: number;
  sampleIndex?: number;
};

export type VelocitySample1D = {
  velocityMps: number;
  timestampMs: number;
  sampleIndex?: number;
};

function velocitySample(
  sample: Readonly<AccelerationSample1D>,
  velocityMps: number,
): VelocitySample1D {
  return sample.sampleIndex === undefined
    ? { velocityMps, timestampMs: sample.timestampMs }
    : { velocityMps, timestampMs: sample.timestampMs, sampleIndex: sample.sampleIndex };
}

/**
 * Integrates ordered 1D acceleration samples with the trapezoidal rule.
 * The first velocity is zero. No filtering, reset, clamp, or drift correction
 * is applied.
 */
export function integrateVelocity1D(
  samples: readonly Readonly<AccelerationSample1D>[],
): VelocitySample1D[] {
  samples.forEach((sample, index) => {
    if (!Number.isFinite(sample.accelerationMps2)) {
      throw new RangeError(`Acceleration must be finite at index ${index}.`);
    }
    if (!Number.isFinite(sample.timestampMs)) {
      throw new RangeError(`timestampMs must be finite at index ${index}.`);
    }
  });

  if (samples.length === 0) return [];

  const velocity = [velocitySample(samples[0], 0)];
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const elapsedMs = current.timestampMs - previous.timestampMs;
    const dtSeconds = elapsedMs / 1000;
    if (!Number.isFinite(dtSeconds)) {
      throw new RangeError(`dt must be finite at interval ${index - 1}.`);
    }
    if (dtSeconds <= 0) {
      throw new RangeError(
        `timestampMs must be strictly increasing at index ${index}.`,
      );
    }

    const averageAcceleration =
      0.5 * (previous.accelerationMps2 + current.accelerationMps2);
    const velocityMps =
      velocity[index - 1].velocityMps + averageAcceleration * dtSeconds;
    if (!Number.isFinite(velocityMps)) {
      throw new RangeError(`Integrated velocity is not finite at index ${index}.`);
    }
    velocity.push(velocitySample(current, velocityMps));
  }

  return velocity;
}
