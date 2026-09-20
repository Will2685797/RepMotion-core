/**
 * Offline, read-only diagnostic. Run from any working directory with:
 * node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnoseAccelerationPreparation.ts
 * (The command paths above are relative to the repository workspace.)
 */
import { readFileSync } from "node:fs";
import type { MotionSample } from "../../../mobile/RepMotion/analytics/calibration";
import {
  NOMINAL_MPU6050_COUNTS_PER_G,
  prepareLinearAcceleration1D,
} from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import type { PreparedLinearAcceleration1D, Vector3 } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/types";

const referenceAxis: Vector3 = { x: 0, y: 0, z: 1 };
const baselineWindow = { startIndex: 0, endIndex: 100 };

function statistics(values: readonly number[]) {
  let min = Infinity;
  let max = -Infinity;
  let mean = 0;
  let squaredDeviations = 0;
  values.forEach((value, index) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
    const delta = value - mean;
    mean += delta / (index + 1);
    squaredDeviations += delta * (value - mean);
  });
  return { min, max, mean, std: Math.sqrt(squaredDeviations / values.length) };
}

function summarize(result: PreparedLinearAcceleration1D) {
  return {
    movementAxis: result.movementAxis,
    signConvention: result.signConvention,
    accelerationMps2: statistics(result.acceleration1D),
  };
}

const datasets = ["007", "009", "010"].map(id => {
  const filename = `rowing_5reps_${id}.json`;
  const source = new URL(`../../../datasets/calibration/rowing/${filename}`, import.meta.url);
  const dataset = JSON.parse(readFileSync(source, "utf8")) as {
    samples: MotionSample[]; sampleCount: number; samplingRateHz: number;
  };
  if (!Array.isArray(dataset.samples) || dataset.sampleCount !== dataset.samples.length) {
    throw new Error(`Invalid sample array/count in ${filename}.`);
  }
  const common = { baselineWindow, countsPerG: NOMINAL_MPU6050_COUNTS_PER_G };
  const explicit = prepareLinearAcceleration1D(dataset.samples, {
    ...common, axisStrategy: { method: "explicit", axis: referenceAxis },
  });
  const pca = prepareLinearAcceleration1D(dataset.samples, {
    ...common, axisStrategy: { method: "pca", referenceAxis },
  });
  return {
    filename,
    sampleCount: dataset.samples.length,
    declaredSamplingRateHz: dataset.samplingRateHz,
    baselineWindow: { ...baselineWindow, label: "candidate rest window" },
    countsPerG: common.countsPerG,
    baselineCounts: explicit.baseline,
    explicitZ: summarize(explicit),
    pca: {
      ...summarize(pca),
      angleWithZDegrees: Math.acos(Math.max(-1, Math.min(1, pca.movementAxis.z))) * 180 / Math.PI,
      ...pca.pca,
    },
  };
});

console.log(JSON.stringify({
  FACT: {
    mode: "offline diagnostic; PCA covariance over the full capture after baseline subtraction",
    covarianceConvention: "population (divide by N); centering used only to determine the PCA axis",
    stdConvention: "population (divide by N)",
    referenceConvention: "+Z fixes geometric polarity only; no physical movement label is assigned",
    datasets,
  },
  INFERENCE: [
    "A dominant eigenvalue supports a principal geometric direction, not successful gravity removal.",
    "Linear acceleration interpretation requires a valid rest reference and approximately fixed sensor orientation and bias.",
  ],
  UNKNOWN: [
    "The [0,100) candidate rest window is not certified rest.",
    "16384 counts/g is the nominal MPU6050 ±2 g assumption, not a measured sensitivity for these captures.",
    "Sensor orientation changes during motion are not established by this diagnostic.",
    "Full-capture PCA does not define a future real-time axis estimation policy.",
  ],
}, null, 2));
