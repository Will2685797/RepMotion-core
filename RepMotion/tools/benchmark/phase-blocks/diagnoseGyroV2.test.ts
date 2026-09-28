import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  bracketingIndices,
  buildGyroDescriptiveResults,
  calculateGyroBias,
  correctGyro,
  gyroOutputDirectory,
  pearsonCorrelation,
  summarizeClosedGyroWindow,
  summarizeGyroWindow,
} from "./diagnoseGyroV2";
import { outputDirectoryFor, type RawSampleV2 } from "./diagnoseVelocityV2";

function sample(gx: number, gy: number, gz: number, sampleIndex: number): RawSampleV2 {
  return { ax: 0, ay: 0, az: 0, gx, gy, gz, sampleIndex, timestampMs: sampleIndex * 50 };
}

test("gyro bias uses the inclusive GT baseline and corrects each raw axis", () => {
  const samples = [sample(100, 200, -50, 0), sample(110, 220, -30, 1), sample(140, 180, -10, 2)];
  const bias = calculateGyroBias(samples, 0, 1);
  assert.deepEqual(bias, { gx: 105, gy: 210, gz: -40 });
  assert.deepEqual(correctGyro(samples, bias), [
    { gx: -5, gy: -10, gz: -10, norm: 15 },
    { gx: 5, gy: 10, gz: 10, norm: 15 },
    { gx: 35, gy: -30, gz: 30, norm: 55 },
  ]);
});

test("gyro norm and RMS window statistics remain in raw counts", () => {
  const corrected = correctGyro([sample(3, 4, 0, 0), sample(0, 0, 12, 1)], { gx: 0, gy: 0, gz: 0 });
  const result = summarizeGyroWindow(corrected, [0, 1]);
  assert.equal(result.meanGyroNormRaw, 8.5);
  assert.equal(result.medianGyroNormRaw, 8.5);
  assert.equal(result.rmsGyroNormRaw, Math.sqrt((25 + 144) / 2));
  assert.equal(result.maxGyroNormRaw, 12);
  assert.equal(result.dominantAxis, "GZ");
});

test("B6 uses only samples bracketing arrival without inventing a departure", () => {
  assert.deepEqual(bracketingIndices(10, 20), [10]);
  assert.deepEqual(bracketingIndices(10.4, 20), [10, 11]);
});

test("sub-sample pivot windows use interpolated closed bounds without expansion", () => {
  const corrected = correctGyro([sample(0, 0, 0, 0), sample(10, 0, 0, 1)], { gx: 0, gy: 0, gz: 0 });
  const result = summarizeClosedGyroWindow(corrected, 0.2, 0.4);
  assert.equal(result.sampleCount, 2);
  assert.equal(result.meanGyroNormRaw, 3);
  assert.equal(result.maxGyroNormRaw, 4);
});

test("descriptive correlation handles exact linear data and degenerate inputs", () => {
  assert.equal(pearsonCorrelation([1, 2, 3], [2, 4, 6]), 1);
  assert.equal(pearsonCorrelation([1, 1, 1], [2, 3, 4]), null);
});

test("GT segmentation matches A and gyro never enters velocity integration", () => {
  const results = buildGyroDescriptiveResults();
  assert.equal(results.phaseResults.length, 100);
  assert.equal(results.pivotResults.filter(row => row.windowMode === "CLOSED_GT_WINDOW").length, 100);
  assert.equal(results.pivotResults.filter(row => row.windowMode === "BRACKETING_SAMPLES_AT_ARRIVAL").length, 10);
  const source = readFileSync(new URL("./diagnoseGyroV2.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /import[^;]*estimateVelocity/);
  assert.doesNotMatch(source, /estimateVelocity\s*\(/);
});

test("gyro outputs are isolated from A, A-baseline, and B-time", () => {
  const gyro = gyroOutputDirectory().href;
  assert.notEqual(gyro, outputDirectoryFor("fixed").href);
  assert.notEqual(gyro, outputDirectoryFor("sync").href);
  assert.notEqual(gyro, outputDirectoryFor("time").href);
  assert.match(gyroOutputDirectory().pathname, /gyro-descriptive\/$/);
});
