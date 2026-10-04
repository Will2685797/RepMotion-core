import type { Quaternion, Vector3 } from "./types";

export const STANDARD_GRAVITY_MPS2 = 9.80665;

/**
 * Rotates a body-frame vector into the world frame using the Mahony convention:
 * vWorld = q ⊗ vBody ⊗ conjugate(q), with Hamilton { w, x, y, z } ordering.
 * The quaternion is expected to have unit norm, as guaranteed by Mahony updates.
 */
export function rotateBodyToWorld(
  vectorBody: Readonly<Vector3>,
  quaternion: Readonly<Quaternion>,
): Vector3 {
  const { w, x, y, z } = quaternion;

  return {
    x:
      (w * w + x * x - y * y - z * z) * vectorBody.x +
      2 * (x * y - w * z) * vectorBody.y +
      2 * (x * z + w * y) * vectorBody.z,
    y:
      2 * (x * y + w * z) * vectorBody.x +
      (w * w - x * x + y * y - z * z) * vectorBody.y +
      2 * (y * z - w * x) * vectorBody.z,
    z:
      2 * (x * z - w * y) * vectorBody.x +
      2 * (y * z + w * x) * vectorBody.y +
      (w * w - x * x - y * y + z * z) * vectorBody.z,
  };
}

export function removeGravity(
  accelWorld: Readonly<Vector3>,
  gravityMagnitude = STANDARD_GRAVITY_MPS2,
): Vector3 {
  return {
    x: accelWorld.x,
    y: accelWorld.y,
    z: accelWorld.z - gravityMagnitude,
  };
}

export function computeLinearAccelerationWorld(
  accelBody: Readonly<Vector3>,
  quaternion: Readonly<Quaternion>,
): Vector3 {
  return removeGravity(rotateBodyToWorld(accelBody, quaternion));
}
