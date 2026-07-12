import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDebugEvent,
  type CalibrationDataset,
  type RawCalibrationCandidateDebug,
} from "../../../mobile/RepMotion/analytics/calibration";
import { calibrationParameterGrid } from "./calibrationParameterGrid";
import type {
  CalibrationBenchmarkDatasetResult,
  CalibrationBenchmarkResult,
} from "./calibrationBenchmarkTypes";

type BenchmarkDataset = CalibrationDataset & { name: string };

const DIAGNOSTIC_DATASET_NAME = "rowing_5reps_005.json";
const DIAGNOSTIC_PARAMETERS = {
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
  rawDetectionStrategy: "local_extrema" as const,
};

type FilterStatus = "KEPT" | "REJECTED" | "NOT_REACHED";

function getCandidateKey(type: "BOTTOM" | "TOP", index: number): string {
  return `${type}:${index}`;
}

function getStageStatus(
  events: CalibrationDebugEvent[],
  filter: CalibrationDebugEvent["filter"],
): FilterStatus {
  const stageEvents = events.filter((event) => event.filter === filter);

  if (stageEvents.length === 0) {
    return "NOT_REACHED";
  }

  return stageEvents.some((event) => !event.kept) ? "REJECTED" : "KEPT";
}

function getStageRejection(
  events: CalibrationDebugEvent[],
  filter: CalibrationDebugEvent["filter"],
): CalibrationDebugEvent | undefined {
  return events.find((event) => event.filter === filter && !event.kept);
}

function getFirstRejection(
  events: CalibrationDebugEvent[],
): CalibrationDebugEvent | undefined {
  return (
    getStageRejection(events, "MIN_DISTANCE") ??
    getStageRejection(events, "PROMINENCE") ??
    getStageRejection(events, "DIRECTION_CHANGE")
  );
}

function formatRejectReason(
  event: CalibrationDebugEvent | undefined,
  minimumProminence: number,
): string {
  if (!event?.rejectedReason) {
    return "";
  }

  if (event.rejectedReason === "MIN_DISTANCE") {
    return event.selectionRule ?? "same-type candidates are too close";
  }

  if (event.rejectedReason === "LOW_PROMINENCE") {
    return `prominence ${event.prominence?.toFixed(2)} < minimum ${minimumProminence.toFixed(2)}`;
  }

  return `directionChange ${event.directionChange?.toFixed(2)} <= 0`;
}

function printDiagnosticTable(datasetsToAnalyze: BenchmarkDataset[]) {
  const dataset = datasetsToAnalyze.find(
    (candidate) => candidate.name === DIAGNOSTIC_DATASET_NAME,
  );

  if (!dataset) {
    console.warn(`Diagnostic dataset not found: ${DIAGNOSTIC_DATASET_NAME}`);
    return;
  }

  const calibrationResult = calculateCalibration(
    dataset.samples,
    undefined,
    DIAGNOSTIC_PARAMETERS,
  );

  const debug = calibrationResult.debug;

  if (!debug) {
    console.warn(`No calibration debug available for ${DIAGNOSTIC_DATASET_NAME}`);
    return;
  }

  const eventsByCandidate = new Map<string, CalibrationDebugEvent[]>();

  for (const event of debug.filterDebugEvents) {
    const key = getCandidateKey(event.type, event.index);
    const events = eventsByCandidate.get(key) ?? [];
    events.push(event);
    eventsByCandidate.set(key, events);
  }

  const selectedKeys = new Set([
    ...debug.selectedBottomIndexes.map((index) =>
      getCandidateKey("BOTTOM", index),
    ),
    ...debug.selectedTopIndexes.map((index) => getCandidateKey("TOP", index)),
  ]);

  const minimumProminence =
    debug.robustRange * DIAGNOSTIC_PARAMETERS.minimumProminenceRatio;

  const rawCandidates = [...debug.rawCandidateDebugEvents].sort(
    (left, right) => left.index - right.index,
  );

  const diagnosticRows = rawCandidates.map(
    (candidate: RawCalibrationCandidateDebug) => {
      const key = getCandidateKey(candidate.type, candidate.index);
      const candidateEvents = eventsByCandidate.get(key) ?? [];
      const firstRejection = getFirstRejection(candidateEvents);
      const minDistanceRejection = getStageRejection(
        candidateEvents,
        "MIN_DISTANCE",
      );

      return {
        index: candidate.index,
        type: candidate.type,
        value: candidate.value,
        amplitude: candidate.localAmplitude,
        minDistance: getStageStatus(candidateEvents, "MIN_DISTANCE"),
        prominence: getStageStatus(candidateEvents, "PROMINENCE"),
        directionChange: getStageStatus(candidateEvents, "DIRECTION_CHANGE"),
        finalStatus: selectedKeys.has(key) ? "KEPT" : "REJECTED",
        firstRejectFilter: firstRejection?.filter ?? "",
        rejectReason: formatRejectReason(firstRejection, minimumProminence),
        conflictWithIndex: minDistanceRejection?.conflictWithIndex ?? "",
        conflictDistance: minDistanceRejection?.conflictDistance ?? "",
        candidateValue: minDistanceRejection ? candidate.value : "",
        conflictValue: minDistanceRejection?.conflictWithValue ?? "",
        keptIndex: minDistanceRejection?.keptIndex ?? "",
        keptValue: minDistanceRejection?.keptValue ?? "",
        minDistanceRule: minDistanceRejection?.selectionRule ?? "",
      };
    },
  );

  const afterMinDistanceCount = rawCandidates.filter((candidate) => {
    const events =
      eventsByCandidate.get(getCandidateKey(candidate.type, candidate.index)) ??
      [];
    return getStageStatus(events, "MIN_DISTANCE") === "KEPT";
  }).length;

  const afterProminenceCount = rawCandidates.filter((candidate) => {
    const events =
      eventsByCandidate.get(getCandidateKey(candidate.type, candidate.index)) ??
      [];
    return getStageStatus(events, "PROMINENCE") === "KEPT";
  }).length;

  const afterDirectionChangeCount =
    debug.selectedBottomIndexes.length + debug.selectedTopIndexes.length;

  console.log(
    `\n=== Filter Decision Diagnostic: ${DIAGNOSTIC_DATASET_NAME} ===\n`,
  );
  console.table(diagnosticRows);

  console.log("\n=== Filter Decision Summary ===\n");
  console.table([
    {
      rawCandidates: rawCandidates.length,
      afterMinDistance: afterMinDistanceCount,
      afterProminence: afterProminenceCount,
      afterDirectionChange: afterDirectionChangeCount,
      selectedFinal: afterDirectionChangeCount,
    },
  ]);
}

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

  const avgDetectedBottoms =
    datasetResults.reduce((sum, r) => sum + r.bottomsDetected, 0) /
    datasetResults.length;

  const avgDetectedTops =
    datasetResults.reduce((sum, r) => sum + r.topsDetected, 0) /
    datasetResults.length;

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
    avgDetectedBottoms,
    avgDetectedTops,
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
      selectedCountScore: result.totalScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgRawBottoms: result.avgDetectedBottoms.toFixed(2),
      avgRawTops: result.avgDetectedTops.toFixed(2),
      avgSelectedBottoms: result.avgSelectedBottoms.toFixed(2),
      avgSelectedTops: result.avgSelectedTops.toFixed(2),
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
      selectedCountScore: result.totalScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgRawBottoms: result.avgDetectedBottoms.toFixed(2),
      avgRawTops: result.avgDetectedTops.toFixed(2),
      avgSelectedBottoms: result.avgSelectedBottoms.toFixed(2),
      avgSelectedTops: result.avgSelectedTops.toFixed(2),
      minimumDistanceSamples: result.parameters.minimumDistanceSamples,
      minimumProminenceRatio: result.parameters.minimumProminenceRatio,
      peakWindowSize: result.parameters.peakWindowSize,
      smoothingWindowSize: result.parameters.smoothingWindowSize,
      prominenceWindowSize: result.parameters.prominenceWindowSize,
    })),
  );

  console.log("\n=== Benchmark Summary ===\n");

  // totalScore measures Selected count error only; it is not a Cycle Analyzer rep count.
  console.log("Best score :", results[0].totalScore);
  console.log("Worst score:", results[results.length - 1].totalScore);
  console.log(
    "Score delta:",
    results[results.length - 1].totalScore - results[0].totalScore,
  );

  const best = results[0];

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

  printDiagnosticTable(datasets);
}

main();
