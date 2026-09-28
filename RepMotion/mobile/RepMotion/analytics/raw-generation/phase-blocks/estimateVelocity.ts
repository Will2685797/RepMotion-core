/**
 * Integrates 1D acceleration using the trapezoidal rule and zero initial velocity.
 * Assumes finite samples and a constant, positive dtSeconds.
 * Output units are input acceleration units multiplied by seconds (m/s for m/s^2).
 * No gravity removal or drift correction is applied.
 */
export function estimateVelocity(values: number[], dtSeconds: number): number[] {
  if (values.length === 0) {
    return [];
  }

  const velocity: number[] = [0];

  for (let index = 1; index < values.length; index += 1) {
    const averageAcceleration = (values[index - 1] + values[index]) / 2;
    velocity.push(velocity[index - 1] + averageAcceleration * dtSeconds);
  }

  return velocity;
}

/**
 * Integrates 1D acceleration with one strictly positive dt per sample interval.
 * The historical constant-dt API above remains unchanged.
 */
export function estimateVelocityWithIntervalDts(
  values: readonly number[],
  intervalDtSeconds: readonly number[],
): number[] {
  if (values.length === 0) {
    if (intervalDtSeconds.length !== 0) throw new RangeError("Empty acceleration requires no dt intervals.");
    return [];
  }
  if (intervalDtSeconds.length !== values.length - 1) {
    throw new RangeError("intervalDtSeconds must contain exactly values.length - 1 entries.");
  }

  const velocity: number[] = [0];
  for (let index = 1; index < values.length; index += 1) {
    const dtSeconds = intervalDtSeconds[index - 1];
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
      throw new RangeError(`dt must be finite and strictly positive at interval ${index - 1}.`);
    }
    const averageAcceleration = (values[index - 1] + values[index]) / 2;
    velocity.push(velocity[index - 1] + averageAcceleration * dtSeconds);
  }
  return velocity;
}
