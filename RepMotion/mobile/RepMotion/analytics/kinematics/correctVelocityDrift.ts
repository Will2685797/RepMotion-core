import type { VelocitySample1D } from "./integrateVelocity1D";
import type { ZeroVelocityAnchor } from "./createZeroVelocityAnchors";

export type VelocityDriftCorrectionPolicy = "hold-nearest-anchor-error";

export type CorrectVelocityDriftOptions = {
  outsideAnchorRange: VelocityDriftCorrectionPolicy;
};

const DEFAULT_OPTIONS: CorrectVelocityDriftOptions = {
  outsideAnchorRange: "hold-nearest-anchor-error",
};

function rawVelocityAt(
  velocity: readonly Readonly<VelocitySample1D>[],
  timestampMs: number,
): number {
  const exact = velocity.findIndex((sample) => sample.timestampMs === timestampMs);
  if (exact >= 0) return velocity[exact].velocityMps;

  let upper = 1;
  while (velocity[upper].timestampMs < timestampMs) upper += 1;
  const lower = upper - 1;
  const fraction =
    (timestampMs - velocity[lower].timestampMs) /
    (velocity[upper].timestampMs - velocity[lower].timestampMs);
  return velocity[lower].velocityMps +
    (velocity[upper].velocityMps - velocity[lower].velocityMps) * fraction;
}

/**
 * Removes the time-linear raw velocity error between zero-velocity anchors.
 * Outside their range, the nearest anchor error is held constant; no drift slope
 * is extrapolated.
 */
export function correctVelocityDrift(
  velocity: readonly Readonly<VelocitySample1D>[],
  anchors: readonly Readonly<ZeroVelocityAnchor>[],
  options: Readonly<CorrectVelocityDriftOptions> = DEFAULT_OPTIONS,
): VelocitySample1D[] {
  if (options.outsideAnchorRange !== "hold-nearest-anchor-error") {
    throw new RangeError("Unsupported outside-anchor correction policy.");
  }
  if (velocity.length === 0) {
    if (anchors.length !== 0) {
      throw new RangeError("Anchors require a non-empty velocity series.");
    }
    return [];
  }
  if (anchors.length === 0) {
    throw new RangeError("At least one zero-velocity anchor is required.");
  }

  velocity.forEach((sample, index) => {
    if (!Number.isFinite(sample.velocityMps)) {
      throw new RangeError(`Velocity must be finite at index ${index}.`);
    }
    if (!Number.isFinite(sample.timestampMs)) {
      throw new RangeError(`timestampMs must be finite at index ${index}.`);
    }
    if (index > 0 && sample.timestampMs <= velocity[index - 1].timestampMs) {
      throw new RangeError(
        `Velocity timestamps must be strictly increasing at index ${index}.`,
      );
    }
  });

  anchors.forEach((anchor, index) => {
    if (!Number.isFinite(anchor.timestampMs)) {
      throw new RangeError(`Anchor timestamp must be finite at index ${index}.`);
    }
    if (anchor.targetVelocityMps !== 0) {
      throw new RangeError(`Anchor target must be zero at index ${index}.`);
    }
    if (index > 0 && anchor.timestampMs <= anchors[index - 1].timestampMs) {
      throw new RangeError(
        `Anchor timestamps must be strictly increasing at index ${index}.`,
      );
    }
    if (
      anchor.timestampMs < velocity[0].timestampMs ||
      anchor.timestampMs > velocity.at(-1)!.timestampMs
    ) {
      throw new RangeError(`Anchor timestamp is outside the velocity series at index ${index}.`);
    }
  });

  const errors = anchors.map((anchor) =>
    rawVelocityAt(velocity, anchor.timestampMs) - anchor.targetVelocityMps,
  );
  let segment = 0;
  return velocity.map((sample) => {
    while (
      segment < anchors.length - 2 &&
      sample.timestampMs > anchors[segment + 1].timestampMs
    ) {
      segment += 1;
    }

    let error: number;
    if (sample.timestampMs <= anchors[0].timestampMs) {
      error = errors[0];
    } else if (sample.timestampMs >= anchors.at(-1)!.timestampMs) {
      error = errors.at(-1)!;
    } else {
      const left = anchors[segment];
      const right = anchors[segment + 1];
      const fraction =
        (sample.timestampMs - left.timestampMs) /
        (right.timestampMs - left.timestampMs);
      error = errors[segment] + (errors[segment + 1] - errors[segment]) * fraction;
    }
    const velocityMps = sample.velocityMps - error;
    if (!Number.isFinite(velocityMps)) {
      throw new RangeError("Corrected velocity is not finite.");
    }
    return sample.sampleIndex === undefined
      ? { velocityMps, timestampMs: sample.timestampMs }
      : { velocityMps, timestampMs: sample.timestampMs, sampleIndex: sample.sampleIndex };
  });
}
