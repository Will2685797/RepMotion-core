import type { Vector3 } from "./types";

/** Signed dot product in counts, independent of how the fixed axis was obtained. */
export function projectAcceleration1D(
  dynamicAcceleration: readonly Vector3[],
  movementAxis: Vector3,
): number[] {
  if (!movementAxis || ![movementAxis.x, movementAxis.y, movementAxis.z].every(Number.isFinite)) {
    throw new TypeError("Projection axis must have finite components.");
  }
  if (Math.abs(Math.hypot(movementAxis.x, movementAxis.y, movementAxis.z) - 1) > 1e-10) {
    throw new RangeError("Projection requires a unit axis.");
  }
  return dynamicAcceleration.map((vector, index) => {
    if (!vector || ![vector.x, vector.y, vector.z].every(Number.isFinite)) {
      throw new TypeError(`Non-finite dynamic acceleration at index ${index}.`);
    }
    const projected = vector.x * movementAxis.x + vector.y * movementAxis.y + vector.z * movementAxis.z;
    if (!Number.isFinite(projected)) throw new RangeError("Projection exceeds the numeric range.");
    return projected;
  });
}
