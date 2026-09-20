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
