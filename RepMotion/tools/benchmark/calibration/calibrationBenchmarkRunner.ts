import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDataset,
} from "../../../mobile/RepMotion/analytics/calibration";
import { calibrationParameterGrid } from "./calibrationParameterGrid";
import type {
  CalibrationBenchmarkDatasetResult,
  CalibrationBenchmarkResult,
} from "./calibrationBenchmarkTypes";

type BenchmarkDataset = CalibrationDataset & { name: string };

function getCalibrationDatasetFiles(rootDir: string): string[] {
  const files: string[] = [];

  for (const exercise of fs.readdirSync(rootDir)) {
    const exerciseDir = path.join(rootDir, exercise);

    if (!fs.statSync(exerciseDir).isDirectory()) {
      continue;
    }

    for (const file of fs.readdirSync(exerciseDir)) {
      if (file.endsWith(".json")) {
        files.push(path.join(exerciseDir, file));
      }
    }
  }

  return files;
}

function loadDatasets(): BenchmarkDataset[] {
  const datasetsRoot = path.resolve(__dirname, "../../../datasets/calibration");

  return getCalibrationDatasetFiles(datasetsRoot).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const dataset = JSON.parse(raw) as CalibrationDataset;

    return {
      ...dataset,
      name: path.basename(filePath),
    };
  });
}

const datasets = loadDatasets();

function scoreDataset(result: CalibrationBenchmarkDatasetResult): number {
  return result.totalDifference;
}

function benchmarkCalibrationParameters(
  parameters: any,
): CalibrationBenchmarkResult {
  const datasetResults: CalibrationBenchmarkDatasetResult[] = [];

  for (const dataset of datasets) {
    const calibrationResult = calculateCalibration(
      dataset.samples,
      undefined,
      parameters,
    );

    const expectedReps = dataset.performedReps ?? dataset.expectedReps ?? 0;

    const expectedBottoms = expectedReps + 1;
    const expectedTops = expectedReps;

    const selectedBottoms = calibrationResult.debug?.selectedBottoms ?? 0;
    const selectedTops = calibrationResult.debug?.selectedTops ?? 0;

    const bottomsDetected = calibrationResult.debug?.bottomsDetected ?? 0;
    const topsDetected = calibrationResult.debug?.topsDetected ?? 0;

    const bottomDifference = Math.abs(selectedBottoms - expectedBottoms);
    const topDifference = Math.abs(selectedTops - expectedTops);
    const totalDifference = bottomDifference + topDifference;

    datasetResults.push({
      datasetName: dataset.name,
      expectedReps,

      bottomsDetected,
      topsDetected,
      selectedBottoms,
      selectedTops,

      bottomDifference,
      topDifference,
      totalDifference,
    });
  }

  const totalBottomDifference = datasetResults.reduce(
    (sum, r) => sum + r.bottomDifference,
    0,
  );

  const totalTopDifference = datasetResults.reduce(
    (sum, r) => sum + r.topDifference,
    0,
  );

  const totalScore = datasetResults.reduce(
    (sum, r) => sum + scoreDataset(r),
    0,
  );

  const avgSelectedBottoms =
    datasetResults.reduce((sum, r) => sum + r.selectedBottoms, 0) /
    datasetResults.length;

  const avgSelectedTops =
    datasetResults.reduce((sum, r) => sum + r.selectedTops, 0) /
    datasetResults.length;

  return {
    parameters,
    totalScore,
    totalBottomDifference,
    totalTopDifference,
    avgSelectedBottoms,
    avgSelectedTops,
    datasets: datasetResults,
  };
}

function main() {
  const results = calibrationParameterGrid
    .map(benchmarkCalibrationParameters)
    .sort((a, b) => a.totalScore - b.totalScore);

  console.log("\n=== Calibration Benchmark Results ===\n");

  console.table(
    results.slice(0, 20).map((result) => ({
      score: result.totalScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgBottoms: result.avgSelectedBottoms.toFixed(2),
      avgTops: result.avgSelectedTops.toFixed(2),
      minimumDistanceSamples: result.parameters.minimumDistanceSamples,
      minimumProminenceRatio: result.parameters.minimumProminenceRatio,
      peakWindowSize: result.parameters.peakWindowSize,
      smoothingWindowSize: result.parameters.smoothingWindowSize,
      prominenceWindowSize: result.parameters.prominenceWindowSize,
    })),
  );

  console.log("\n=== Worst 10 Configurations ===\n");

  console.table(
    results.slice(-10).map((result) => ({
      score: result.totalScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgBottoms: result.avgSelectedBottoms.toFixed(2),
      avgTops: result.avgSelectedTops.toFixed(2),
      minimumDistanceSamples: result.parameters.minimumDistanceSamples,
      minimumProminenceRatio: result.parameters.minimumProminenceRatio,
      peakWindowSize: result.parameters.peakWindowSize,
      smoothingWindowSize: result.parameters.smoothingWindowSize,
      prominenceWindowSize: result.parameters.prominenceWindowSize,
    })),
  );

  console.log("\n=== Benchmark Summary ===\n");

  console.log("Best score :", results[0].totalScore);
  console.log("Worst score:", results[results.length - 1].totalScore);
  console.log(
    "Score delta:",
    results[results.length - 1].totalScore - results[0].totalScore,
  );

  const best =
    results.find(
      (result) =>
        result.parameters.minimumDistanceSamples === 70 &&
        result.parameters.minimumProminenceRatio === 0.08 &&
        result.parameters.peakWindowSize === 2 &&
        result.parameters.prominenceWindowSize === 8,
    ) ?? results[0];

  console.log("\n=== Best Configuration Details ===\n");
  console.log(best.parameters);

  console.table(
    best.datasets.map((dataset) => ({
      dataset: dataset.datasetName,
      expected: dataset.expectedReps,
      bottomsDetected: dataset.bottomsDetected,
      topsDetected: dataset.topsDetected,
      selectedBottoms: dataset.selectedBottoms,
      selectedTops: dataset.selectedTops,
      bottomDiff: dataset.bottomDifference,
      topDiff: dataset.topDifference,
      totalDiff: dataset.totalDifference,
    })),
  );
}

main();
