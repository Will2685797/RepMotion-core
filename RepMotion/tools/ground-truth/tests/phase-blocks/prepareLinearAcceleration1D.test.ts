import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateStaticBaseline } from "../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateStaticBaseline";
import { estimateMovementAxis } from "../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateMovementAxis";
import { projectAcceleration1D } from "../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/projectAcceleration1D";
import { GRAVITY_MPS2, prepareLinearAcceleration1D } from "../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import type { Vector3, PrepareLinearAcceleration1DOptions } from "../../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/types";

const Z: Vector3 = { x: 0, y: 0, z: 1 };
const X: Vector3 = { x: 1, y: 0, z: 0 };
const options: PrepareLinearAcceleration1DOptions = {
  baselineWindow: { startIndex: 0, endIndex: 1 },
  axisStrategy: { method: "explicit", axis: Z },
  countsPerG: 1000,
};
function close(actual: number, expected: number, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}
function vectorClose(actual: Vector3, expected: Vector3, tolerance = 1e-10) {
  close(actual.x, expected.x, tolerance);
  close(actual.y, expected.y, tolerance);
  close(actual.z, expected.z, tolerance);
}
function line(axis: Vector3): Vector3[] {
  return [-3, -1, 0, 1, 3].map(t => ({ x: t * axis.x, y: t * axis.y, z: t * axis.z }));
}

test("baseline averages XYZ only inside the half-open supplied window", () => {
  const samples = [
    { ax: 999, ay: 999, az: 999 },
    { ax: 2, ay: -4, az: 10 },
    { ax: 4, ay: 8, az: 20 },
    { ax: -999, ay: -999, az: -999 },
  ];
  assert.deepEqual(estimateStaticBaseline(samples, 1, 3), { x: 3, y: 2, z: 15 });
});

test("an immobile sensor yields zero with an explicit axis", () => {
  const samples = Array.from({ length: 100 }, () => ({ ax: 0.3, ay: -275, az: 18540 }));
  const result = prepareLinearAcceleration1D(samples, {
    ...options, baselineWindow: { startIndex: 0, endIndex: 100 },
  });
  assert.deepEqual(result.acceleration1D, Array(100).fill(0));
  assert.equal(result.signConvention, "explicit");
  assert.equal(result.pca, null);
});

test("projection on Z preserves the sign and ignores perpendicular components", () => {
  assert.deepEqual(projectAcceleration1D([
    { x: 999, y: -999, z: -4 }, { x: -999, y: 999, z: 7 },
  ], Z), [-4, 7]);
});

test("projection on a known inclined axis is a signed dot product", () => {
  const axis = { x: 3 / 5, y: 0, z: 4 / 5 };
  const projected = projectAcceleration1D([
    { x: 3, y: 10, z: 4 }, { x: -3, y: 0, z: -4 }, { x: 4, y: 0, z: -3 },
  ], axis);
  close(projected[0], 5); close(projected[1], -5); close(projected[2], 0);
});

test("explicit axes are normalized without reversing their polarity", () => {
  const result = estimateMovementAxis([], { method: "explicit", axis: { x: 0, y: 0, z: -9 } });
  vectorClose(result.movementAxis, { x: 0, y: 0, z: -1 });
  assert.equal(result.signConvention, "explicit");
});

test("orchestrator subtracts the full vector baseline before inclined projection", () => {
  const result = prepareLinearAcceleration1D([
    { ax: 100, ay: -200, az: 18000 },
    { ax: 103, ay: -200, az: 18004 },
    { ax: 97, ay: -200, az: 17996 },
  ], { ...options, axisStrategy: { method: "explicit", axis: { x: 3, y: 0, z: 4 } } });
  assert.deepEqual(result.baseline, { x: 100, y: -200, z: 18000 });
  close(result.acceleration1D[0], 0);
  close(result.acceleration1D[1], 5 * GRAVITY_MPS2 / 1000);
  close(result.acceleration1D[2], -5 * GRAVITY_MPS2 / 1000);
});

test("countsPerG is explicit and configurable, and output units are m/s²", () => {
  const samples = [{ ax: 0, ay: 0, az: 18000 }, { ax: 0, ay: 0, az: 19000 }];
  const first = prepareLinearAcceleration1D(samples, options);
  const second = prepareLinearAcceleration1D(samples, { ...options, countsPerG: 2000 });
  close(first.acceleration1D[1], GRAVITY_MPS2);
  close(second.acceleration1D[1], GRAVITY_MPS2 / 2);
  assert.equal(first.countsPerG, 1000);
  assert.equal(first.acceleration1D.length, samples.length);
});

test("PCA finds X and reports population variance for a rank-one signal", () => {
  const result = estimateMovementAxis(line(X), { method: "pca", referenceAxis: X });
  vectorClose(result.movementAxis, X);
  assert.ok(result.pca);
  close(result.pca.eigenvalues[0], 4);
  close(result.pca.eigenvalues[1], 0);
  close(result.pca.eigenvalues[2], 0);
  close(result.pca.explainedVarianceRatio, 1);
});

test("PCA finds an inclined 3D axis and normalizes its eigenvector", () => {
  const axis = { x: 2 / 3, y: -1 / 3, z: 2 / 3 };
  const result = estimateMovementAxis(line(axis), { method: "pca", referenceAxis: Z });
  vectorClose(result.movementAxis, axis);
  close(Math.hypot(result.movementAxis.x, result.movementAxis.y, result.movementAxis.z), 1);
});

test("PCA resolves a full-rank rotated covariance with known eigenvalues", () => {
  const u = { x: 2 / 3, y: -1 / 3, z: 2 / 3 };
  const v = { x: 1 / Math.sqrt(5), y: 2 / Math.sqrt(5), z: 0 };
  const w = { x: -4 / (3 * Math.sqrt(5)), y: 2 / (3 * Math.sqrt(5)), z: 5 / (3 * Math.sqrt(5)) };
  const data = [u, v, w].flatMap((axis, i) => [-1, 1].map(sign => {
    const amplitude = Math.sqrt(3 * [9, 4, 1][i]) * sign;
    return { x: amplitude * axis.x, y: amplitude * axis.y, z: amplitude * axis.z };
  }));
  const result = estimateMovementAxis(data, { method: "pca", referenceAxis: Z });
  vectorClose(result.movementAxis, u);
  assert.ok(result.pca);
  [9, 4, 1].forEach((expected, i) => close(result.pca!.eigenvalues[i], expected));
  close(result.pca.explainedVarianceRatio, 9 / 14);
  const reversed = estimateMovementAxis([...data].reverse(), { method: "pca", referenceAxis: Z });
  vectorClose(reversed.movementAxis, u);
});

test("PCA covariance is centered but the prepared signal retains its residual mean", () => {
  const samples = [0, 2, 4, 6].map(t => ({ ax: 100 + t, ay: 200, az: 18000 }));
  const result = prepareLinearAcceleration1D(samples, {
    ...options, axisStrategy: { method: "pca", referenceAxis: X },
  });
  vectorClose(result.movementAxis, X);
  result.acceleration1D.forEach((value, i) => close(value, 2 * i * GRAVITY_MPS2 / 1000));
  assert.ok(result.pca);
  close(result.pca.eigenvalues[0], 5);
  const translated = estimateMovementAxis(
    line(X).map(p => ({ x: p.x + 100, y: p.y + 20, z: p.z - 40 })),
    { method: "pca", referenceAxis: X },
  );
  close(translated.pca!.eigenvalues[0], 4);
});

test("reference polarity deterministically flips PCA without assigning physical meaning", () => {
  const data = line({ x: 0.6, y: 0, z: -0.8 });
  const positive = estimateMovementAxis(data, { method: "pca", referenceAxis: { x: 0, y: 0, z: 10 } });
  const negative = estimateMovementAxis(data, { method: "pca", referenceAxis: { x: 0, y: 0, z: -1 } });
  vectorClose(positive.movementAxis, { x: -0.6, y: 0, z: 0.8 });
  vectorClose(negative.movementAxis, { x: 0.6, y: 0, z: -0.8 });
  assert.equal(positive.signConvention, "reference-aligned");
  assert.equal(negative.signConvention, "reference-aligned");
  assert.deepEqual(estimateMovementAxis(data, { method: "pca", referenceAxis: Z }), positive);
});

test("missing or orthogonal reference leaves the PCA sign explicitly unresolved", () => {
  for (const referenceAxis of [undefined, Z, { x: 1e-12, y: 0, z: 1 }]) {
    const result = estimateMovementAxis(line(X), { method: "pca", referenceAxis });
    assert.equal(result.signConvention, "unresolved");
    vectorClose(result.movementAxis, X);
  }
});

test("empty inputs and invalid baseline windows have explicit behavior", () => {
  const samples = [{ ax: 0, ay: 0, az: 10 }];
  assert.throws(() => prepareLinearAcceleration1D([], options), RangeError);
  assert.throws(() => estimateStaticBaseline([], 0, 0), RangeError);
  for (const [start, end] of [[0, 0], [-1, 1], [0, 2], [0.5, 1], [1, 0], [0, Infinity]]) {
    assert.throws(() => estimateStaticBaseline(samples, start, end), RangeError);
  }
  assert.deepEqual(projectAcceleration1D([], Z), []);
  assert.throws(() => estimateMovementAxis([], { method: "pca" }), /PCA_INDETERMINATE/);
});

test("non-finite input is rejected, including samples outside the baseline window", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.throws(() => estimateStaticBaseline([{ ax: value, ay: 0, az: 0 }], 0, 1), TypeError);
    assert.throws(() => prepareLinearAcceleration1D([
      { ax: 0, ay: 0, az: 0 }, { ax: 0, ay: value, az: 0 },
    ], options), TypeError);
    assert.throws(() => estimateMovementAxis([{ x: 0, y: 0, z: value }], { method: "pca" }), TypeError);
    assert.throws(() => projectAcceleration1D([{ x: value, y: 0, z: 0 }], Z), TypeError);
  }
});

test("missing or invalid sensitivity never falls back to a nominal value", () => {
  for (const countsPerG of [0, -1, NaN, Infinity, undefined]) {
    assert.throws(() => prepareLinearAcceleration1D([{ ax: 0, ay: 0, az: 1 }], {
      ...options, countsPerG: countsPerG as number,
    }), /countsPerG/);
  }
});

test("invalid axes and non-unit projection axes are rejected", () => {
  for (const axis of [{ x: 0, y: 0, z: 0 }, { x: NaN, y: 0, z: 1 }]) {
    assert.throws(() => estimateMovementAxis([], { method: "explicit", axis }));
    assert.throws(() => estimateMovementAxis(line(X), { method: "pca", referenceAxis: axis }));
    assert.throws(() => projectAcceleration1D([], axis));
  }
  assert.throws(() => projectAcceleration1D([], { x: 0, y: 0, z: 2 }), /unit axis/);
});

test("PCA rejects constant data and repeated principal eigenvalues", () => {
  const isotropic = [X, { x: 0, y: 1, z: 0 }, Z].flatMap(p => [p, { x: -p.x, y: -p.y, z: -p.z }]);
  const tiedPrincipal = isotropic.slice(0, 4);
  for (const data of [
    [X], Array(100).fill({ x: 2, y: 3, z: 4 }), Array(4).fill({ x: 0, y: 0, z: 0 }),
    isotropic, tiedPrincipal,
  ]) {
    assert.throws(() => estimateMovementAxis(data, { method: "pca" }), /PCA_INDETERMINATE/);
  }
});

test("PCA direction and explained ratio do not depend on signal scale", () => {
  const axis = { x: 0.6, y: 0, z: 0.8 };
  for (const scale of [1e-100, 1, 1e100]) {
    const result = estimateMovementAxis(line(axis).map(p => ({ x: p.x * scale, y: 0, z: p.z * scale })), {
      method: "pca", referenceAxis: Z,
    });
    vectorClose(result.movementAxis, axis);
    close(result.pca!.explainedVarianceRatio, 1);
  }
});

test("all stages leave frozen inputs and configuration unchanged", () => {
  const samples = Object.freeze([0, -2, 2].map(t => Object.freeze({ ax: 100 + t, ay: 200, az: 18000 + t })));
  const config = Object.freeze({
    baselineWindow: Object.freeze({ startIndex: 0, endIndex: 1 }),
    axisStrategy: Object.freeze({ method: "pca" as const, referenceAxis: Object.freeze({ ...Z }) }),
    countsPerG: 1000,
  });
  const snapshot = JSON.stringify({ samples, config });
  const result = prepareLinearAcceleration1D(samples, config);
  assert.equal(JSON.stringify({ samples, config }), snapshot);
  assert.deepEqual(prepareLinearAcceleration1D(samples, config), result);
  const vectors = Object.freeze(line(X).map(vector => Object.freeze(vector)));
  estimateMovementAxis(vectors, { method: "pca", referenceAxis: X });
  projectAcceleration1D(vectors, Object.freeze({ ...X }));
});
