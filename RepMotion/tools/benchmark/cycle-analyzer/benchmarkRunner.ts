import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  CalibrationDataset,
} from "../../../mobile/RepMotion/analytics/calibration";
import {
  analyzeBottomTopBottomCycles,
  CycleAnalyzerDebugEvent,
  ReconstructedRep,
} from "../../calibration-runner/cycleAnalyzer";
import { generateParameterGrid } from "./parameterGrid";

type BenchmarkDatasetRow = {
  datasetName: string;
  expectedReps: number;
  simulatedReps: number;
  status: string;
  ignoredEvents: number;
  chain: string;
  reconstructedReps: ReconstructedRep[];
  debugEvents: CycleAnalyzerDebugEvent[];
};

type DatasetSummaryRow = {
  datasetName: string;
  expectedReps: number;
  okCount: number;
  missingCount: number;
  tooManyCount: number;
  bestSimulatedReps: number;
};

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

function loadDataset(filePath: string): CalibrationDataset {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CalibrationDataset;
}

function main() {
  const datasetsRoot = path.resolve(__dirname, "../../../datasets/calibration");
  const files = getCalibrationDatasetFiles(datasetsRoot);
  const datasets = files.map((filePath) => ({
    filePath,
    dataset: loadDataset(filePath),
  }));
  const parameterGrid = generateParameterGrid();

  if (datasets.length === 0) {
    console.log("No calibration datasets found.");
    return;
  }

  const results = parameterGrid
    .map((parameters) => {
      let ok = 0;
      let missing = 0;
      let tooMany = 0;
      const datasetResults: BenchmarkDatasetRow[] = [];

      for (const { filePath, dataset } of datasets) {
        const calibration = calculateCalibration(dataset.samples, undefined, {
          minimumDistanceSamples: 70,
          minimumProminenceRatio: 0.08,
          peakWindowSize: 2,
          prominenceWindowSize: 8,
        });

        const analysis = analyzeBottomTopBottomCycles(
          calibration.debug?.selectedBottomIndexes ?? [],
          calibration.debug?.selectedTopIndexes ?? [],
          dataset.performedReps ?? dataset.expectedReps ?? 0,
          parameters,
        );

        if (analysis.status === "OK") {
          ok += 1;
        } else if (analysis.status === "MISSING") {
          missing += 1;
        } else {
          tooMany += 1;
        }

        datasetResults.push({
          datasetName: path.basename(filePath),
          expectedReps: dataset.performedReps ?? dataset.expectedReps ?? 0,
          simulatedReps: analysis.simulatedReps,
          status: analysis.status,
          ignoredEvents: analysis.ignoredEvents,
          chain: analysis.chain,
          reconstructedReps: analysis.reconstructedReps,
          debugEvents: analysis.debugEvents,
        });
      }

      return {
        minRepDuration: parameters.minRepDuration,
        minConcentricDuration: parameters.minConcentricDuration,
        minEccentricDuration: parameters.minEccentricDuration,
        OK: ok,
        MISSING: missing,
        TOO_MANY: tooMany,
        datasets: datasets.length,
        datasetResults,
      };
    })
    .sort((left, right) => {
      if (right.OK !== left.OK) return right.OK - left.OK;
      if (left.MISSING !== right.MISSING) return left.MISSING - right.MISSING;
      return left.TOO_MANY - right.TOO_MANY;
    });

  console.table(results.map(({ datasetResults, ...summary }) => summary));

  for (const result of results.slice(0, 3)) {
    console.log("");
    console.log("Top configuration details:", {
      minRepDuration: result.minRepDuration,
      minConcentricDuration: result.minConcentricDuration,
      minEccentricDuration: result.minEccentricDuration,
    });
    console.table(result.datasetResults);
  }

  const datasetSummary: DatasetSummaryRow[] = datasets
    .map(({ filePath, dataset }) => {
      const datasetName = path.basename(filePath);
      const expectedReps = dataset.performedReps ?? dataset.expectedReps ?? 0;
      const summary: DatasetSummaryRow = {
        datasetName,
        expectedReps,
        okCount: 0,
        missingCount: 0,
        tooManyCount: 0,
        bestSimulatedReps: 0,
      };

      for (const result of results) {
        const attempt = result.datasetResults.find(
          (datasetResult) => datasetResult.datasetName === datasetName,
        );

        if (!attempt) {
          continue;
        }

        if (attempt.status === "OK") {
          summary.okCount += 1;
        } else if (attempt.status === "MISSING") {
          summary.missingCount += 1;
        } else {
          summary.tooManyCount += 1;
        }

        const currentDiff = Math.abs(summary.bestSimulatedReps - expectedReps);
        const attemptDiff = Math.abs(attempt.simulatedReps - expectedReps);

        if (
          summary.okCount + summary.missingCount + summary.tooManyCount === 1 ||
          attemptDiff < currentDiff
        ) {
          summary.bestSimulatedReps = attempt.simulatedReps;
        }
      }

      return summary;
    })
    .sort((left, right) => {
      const leftFailures = left.missingCount + left.tooManyCount;
      const rightFailures = right.missingCount + right.tooManyCount;

      if (rightFailures !== leftFailures) return rightFailures - leftFailures;
      return left.okCount - right.okCount;
    });

  console.log("");
  console.log("Dataset summary across all configurations:");
  console.table(datasetSummary);

  const failingDatasetDiagnostics = datasetSummary
    .filter((summary) => summary.okCount === 0)
    .map((summary) => {
      const attempts = results
        .flatMap((result) => result.datasetResults)
        .filter((attempt) => attempt.datasetName === summary.datasetName);

      const bestAttempt = attempts.reduce((best, current) => {
        const bestDiff = Math.abs(best.simulatedReps - summary.expectedReps);
        const currentDiff = Math.abs(
          current.simulatedReps - summary.expectedReps,
        );

        return currentDiff < bestDiff ? current : best;
      });

      return {
        datasetName: summary.datasetName,
        expectedReps: summary.expectedReps,
        bestSimulatedReps: bestAttempt.simulatedReps,
        status: bestAttempt.status,
        missingCount: summary.missingCount,
        tooManyCount: summary.tooManyCount,
        ignoredEvents: bestAttempt.ignoredEvents,
        chain: bestAttempt.chain,
      };
    });

  console.log("");
  console.log("Diagnostics for datasets with okCount = 0:");
  console.table(failingDatasetDiagnostics);
  for (const diagnostic of failingDatasetDiagnostics) {
    console.log("");
    console.log(`Detailed reconstructed reps for ${diagnostic.datasetName}:`);

    const bestAttempt = results
      .flatMap((result) => result.datasetResults)
      .filter((attempt) => attempt.datasetName === diagnostic.datasetName)
      .reduce((best, current) => {
        const bestDiff = Math.abs(best.simulatedReps - diagnostic.expectedReps);
        const currentDiff = Math.abs(
          current.simulatedReps - diagnostic.expectedReps,
        );

        return currentDiff < bestDiff ? current : best;
      });

    console.table(bestAttempt.reconstructedReps);

    console.log("Rejected / Replaced events:");
    console.table(
      bestAttempt.debugEvents.filter((event) => event.action !== "ACCEPTED"),
    );
  }
}

main();
