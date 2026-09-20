import type { MovementAxisEstimate, MovementAxisStrategy, Vector3 } from "./types";

const JACOBI_RELATIVE_TOLERANCE = 1e-12;
const PRINCIPAL_GAP_RELATIVE_TOLERANCE = 1e-10;
const REFERENCE_ALIGNMENT_TOLERANCE = 1e-10;
const MAX_JACOBI_ROTATIONS = 64;
type Matrix3 = [number[], number[], number[]];

function normalize(vector: Vector3): Vector3 {
  if (!vector || ![vector.x, vector.y, vector.z].every(Number.isFinite)) {
    throw new TypeError("Axis must have finite components.");
  }
  const scale = Math.max(Math.abs(vector.x), Math.abs(vector.y), Math.abs(vector.z));
  if (scale === 0) throw new RangeError("Axis must be non-zero.");
  const x = vector.x / scale;
  const y = vector.y / scale;
  const z = vector.z / scale;
  const length = Math.hypot(x, y, z);
  return { x: x / length, y: y / length, z: z / length };
}

function negate(axis: Vector3): Vector3 {
  return { x: -axis.x, y: -axis.y, z: -axis.z };
}

/** Numerical representative only; ties prefer X, then Y, then Z. */
function canonicalSign(axis: Vector3): Vector3 {
  const components = [axis.x, axis.y, axis.z];
  let largest = 0;
  for (let index = 1; index < 3; index += 1) {
    if (Math.abs(components[index]) > Math.abs(components[largest])) largest = index;
  }
  return components[largest] < 0 ? negate(axis) : axis;
}

/** Diagonalizes a local symmetric covariance matrix; inputs are never mutated. */
function diagonalize(covariance: Matrix3): { values: number[]; vectors: Matrix3 } {
  const matrix = covariance.map(row => [...row]) as Matrix3;
  const vectors: Matrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];

  for (let iteration = 0; iteration <= MAX_JACOBI_ROTATIONS; iteration += 1) {
    let p = 0;
    let q = 1;
    for (const [i, j] of [[0, 2], [1, 2]]) {
      if (Math.abs(matrix[i][j]) > Math.abs(matrix[p][q])) { p = i; q = j; }
    }
    if (Math.abs(matrix[p][q]) <= JACOBI_RELATIVE_TOLERANCE * trace) {
      return { values: [matrix[0][0], matrix[1][1], matrix[2][2]], vectors };
    }
    if (iteration === MAX_JACOBI_ROTATIONS) break;

    const app = matrix[p][p];
    const aqq = matrix[q][q];
    const apq = matrix[p][q];
    const angle = 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    matrix[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    matrix[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    matrix[p][q] = matrix[q][p] = 0;

    for (let k = 0; k < 3; k += 1) {
      if (k !== p && k !== q) {
        const akp = matrix[k][p];
        const akq = matrix[k][q];
        matrix[k][p] = matrix[p][k] = c * akp - s * akq;
        matrix[k][q] = matrix[q][k] = s * akp + c * akq;
      }
      const vkp = vectors[k][p];
      const vkq = vectors[k][q];
      vectors[k][p] = c * vkp - s * vkq;
      vectors[k][q] = s * vkp + c * vkq;
    }
  }
  throw new Error("PCA_NON_CONVERGENCE: Jacobi iteration limit reached.");
}

/**
 * Estimates one fixed geometric axis in sensor coordinates.
 * PCA centers data for covariance only; it does not change projected samples.
 * PCA over a complete capture is an offline choice, not a streaming policy.
 */
export function estimateMovementAxis(
  dynamicAcceleration: readonly Vector3[],
  strategy: MovementAxisStrategy,
): MovementAxisEstimate {
  let scale = 0;
  for (const vector of dynamicAcceleration) {
    if (!vector || ![vector.x, vector.y, vector.z].every(Number.isFinite)) {
      throw new TypeError("Dynamic acceleration must have finite components.");
    }
    scale = Math.max(scale, Math.abs(vector.x), Math.abs(vector.y), Math.abs(vector.z));
  }
  if (strategy.method === "explicit") {
    return { movementAxis: normalize(strategy.axis), signConvention: "explicit", pca: null };
  }
  if (strategy.method !== "pca") throw new TypeError("Unsupported movement axis strategy.");
  const reference = strategy.referenceAxis === undefined ? undefined : normalize(strategy.referenceAxis);
  if (dynamicAcceleration.length < 2 || scale === 0) {
    throw new RangeError("PCA_INDETERMINATE: at least two samples with non-zero variance are required.");
  }

  // Scale before products to keep covariance computation numerically bounded.
  const mean = [0, 0, 0];
  const count = dynamicAcceleration.length;
  let seen = 0;
  for (const vector of dynamicAcceleration) {
    seen += 1;
    mean[0] += (vector.x / scale - mean[0]) / seen;
    mean[1] += (vector.y / scale - mean[1]) / seen;
    mean[2] += (vector.z / scale - mean[2]) / seen;
  }
  const covariance: Matrix3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const vector of dynamicAcceleration) {
    const centered = [vector.x / scale - mean[0], vector.y / scale - mean[1], vector.z / scale - mean[2]];
    for (let i = 0; i < 3; i += 1) {
      for (let j = i; j < 3; j += 1) {
        covariance[i][j] += (centered[i] * centered[j]) / count;
      }
    }
  }
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < i; j += 1) covariance[i][j] = covariance[j][i];
  }
  const trace = covariance[0][0] + covariance[1][1] + covariance[2][2];
  if (trace <= 0) throw new RangeError("PCA_INDETERMINATE: covariance is zero.");

  const decomposition = diagonalize(covariance);
  const order = [0, 1, 2].sort((a, b) => decomposition.values[b] - decomposition.values[a]);
  const eigenvaluesScaled = order.map(index => {
    const value = decomposition.values[index];
    if (value < -JACOBI_RELATIVE_TOLERANCE * trace) {
      throw new Error("PCA_NUMERICAL_FAILURE: covariance has a negative eigenvalue.");
    }
    return Math.max(0, value); // Clamp roundoff only.
  });
  if (eigenvaluesScaled[0] - eigenvaluesScaled[1] <= PRINCIPAL_GAP_RELATIVE_TOLERANCE * eigenvaluesScaled[0]) {
    throw new RangeError("PCA_INDETERMINATE: principal eigenvalue is not uniquely separated.");
  }
  const eigenvalues = eigenvaluesScaled.map(value => value * scale * scale) as [number, number, number];
  if (!eigenvalues.every(Number.isFinite) || eigenvalues[0] === 0) {
    throw new RangeError("PCA covariance is outside the representable numeric range.");
  }
  const principal = order[0];
  let movementAxis = canonicalSign(normalize({
    x: decomposition.vectors[0][principal],
    y: decomposition.vectors[1][principal],
    z: decomposition.vectors[2][principal],
  }));
  let signConvention: MovementAxisEstimate["signConvention"] = "unresolved";
  if (reference) {
    const dot = movementAxis.x * reference.x + movementAxis.y * reference.y + movementAxis.z * reference.z;
    if (Math.abs(dot) > REFERENCE_ALIGNMENT_TOLERANCE) {
      if (dot < 0) movementAxis = negate(movementAxis);
      signConvention = "reference-aligned";
    }
  }
  return {
    movementAxis,
    signConvention,
    pca: {
      eigenvalues,
      explainedVarianceRatio: eigenvaluesScaled[0] / eigenvaluesScaled.reduce((sum, value) => sum + value, 0),
    },
  };
}
