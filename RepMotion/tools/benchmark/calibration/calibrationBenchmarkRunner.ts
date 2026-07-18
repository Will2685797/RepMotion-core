import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDebugEvent,
  type CalibrationDataset,
  type RawCalibrationCandidateDebug,
} from "../../../mobile/RepMotion/analytics/calibration";
import { analyzeBottomTopBottomCycles } from "../../calibration-runner/cycleAnalyzer";
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
const CYCLE_ANALYZER_PARAMETERS = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
};

type FilterStatus = "KEPT" | "REJECTED" | "NOT_REACHED";
type SelectedEvent = {
  type: "BOTTOM" | "TOP";
  index: number;
};

function getCandidateKey(type: "BOTTOM" | "TOP", index: number): string {
  return `${type}:${index}`;
}

function countAlternationBreaks(
  selectedBottomIndexes: number[],
  selectedTopIndexes: number[],
): number {
  const selectedEvents: SelectedEvent[] = [
    ...selectedBottomIndexes.map((index) => ({
      type: "BOTTOM" as const,
      index,
    })),
    ...selectedTopIndexes.map((index) => ({
      type: "TOP" as const,
      index,
    })),
  ].sort((left, right) => left.index - right.index);

  let alternationBreakCount = 0;

  for (let index = 0; index + 1 < selectedEvents.length; index += 1) {
    if (selectedEvents[index].type === selectedEvents[index + 1].type) {
      alternationBreakCount += 1;
    }
  }

  return alternationBreakCount;
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
    const selectedCountScore = totalDifference;
    const selectedBottomIndexes =
      calibrationResult.debug?.selectedBottomIndexes ?? [];
    const selectedTopIndexes = calibrationResult.debug?.selectedTopIndexes ?? [];
    const alternationBreakCount = countAlternationBreaks(
      selectedBottomIndexes,
      selectedTopIndexes,
    );
    const cycleAnalysis = analyzeBottomTopBottomCycles(
      selectedBottomIndexes,
      selectedTopIndexes,
      expectedReps,
      CYCLE_ANALYZER_PARAMETERS,
    );
    const repDifference = Math.abs(cycleAnalysis.simulatedReps - expectedReps);

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
      selectedCountScore,

      alternationBreakCount,
      simulatedReps: cycleAnalysis.simulatedReps,
      repDifference,
      cycleAnalyzerStatus: cycleAnalysis.status,
      usedBottoms: cycleAnalysis.usedBottoms,
      usedTops: cycleAnalysis.usedTops,
      ignoredEventsCount: cycleAnalysis.ignoredEvents,
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

  const totalSelectedCountScore = datasetResults.reduce(
    (sum, r) => sum + r.selectedCountScore,
    0,
  );

  const totalRepDifference = datasetResults.reduce(
    (sum, r) => sum + r.repDifference,
    0,
  );

  const datasetsExactRepCount = datasetResults.filter(
    (result) => result.repDifference === 0,
  ).length;

  const datasetsMissing = datasetResults.filter(
    (result) => result.cycleAnalyzerStatus === "MISSING",
  ).length;

  const datasetsTooMany = datasetResults.filter(
    (result) => result.cycleAnalyzerStatus === "TOO_MANY",
  ).length;

  const totalAlternationBreaks = datasetResults.reduce(
    (sum, r) => sum + r.alternationBreakCount,
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

  const avgSimulatedReps =
    datasetResults.reduce((sum, r) => sum + r.simulatedReps, 0) /
    datasetResults.length;

  return {
    parameters,
    totalScore: totalSelectedCountScore,
    totalSelectedCountScore,
    totalRepDifference,
    datasetsExactRepCount,
    datasetsMissing,
    datasetsTooMany,
    totalAlternationBreaks,
    totalBottomDifference,
    totalTopDifference,
    avgDetectedBottoms,
    avgDetectedTops,
    avgSelectedBottoms,
    avgSelectedTops,
    avgSimulatedReps,
    datasets: datasetResults,
  };
}

function main() {
  const results = calibrationParameterGrid.map(benchmarkCalibrationParameters);
  const endToEndResults = [...results].sort((a, b) => {
    if (a.totalRepDifference !== b.totalRepDifference) {
      return a.totalRepDifference - b.totalRepDifference;
    }

    if (a.datasetsExactRepCount !== b.datasetsExactRepCount) {
      return b.datasetsExactRepCount - a.datasetsExactRepCount;
    }

    if (a.totalAlternationBreaks !== b.totalAlternationBreaks) {
      return a.totalAlternationBreaks - b.totalAlternationBreaks;
    }

    return a.totalSelectedCountScore - b.totalSelectedCountScore;
  });
  const selectedCountResults = [...results].sort(
    (a, b) => a.totalSelectedCountScore - b.totalSelectedCountScore,
  );

  console.log("\n=== Calibration Benchmark Results: End-To-End Top 20 ===\n");

  console.table(
    endToEndResults.slice(0, 20).map((result) => ({
      totalRepDifference: result.totalRepDifference,
      datasetsExactRepCount: result.datasetsExactRepCount,
      datasetsMissing: result.datasetsMissing,
      datasetsTooMany: result.datasetsTooMany,
      totalAlternationBreaks: result.totalAlternationBreaks,
      totalSelectedCountScore: result.totalSelectedCountScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgRawBottoms: result.avgDetectedBottoms.toFixed(2),
      avgRawTops: result.avgDetectedTops.toFixed(2),
      avgSelectedBottoms: result.avgSelectedBottoms.toFixed(2),
      avgSelectedTops: result.avgSelectedTops.toFixed(2),
      avgSimulatedReps: result.avgSimulatedReps.toFixed(2),
      minimumDistanceSamples: result.parameters.minimumDistanceSamples,
      minimumProminenceRatio: result.parameters.minimumProminenceRatio,
      peakWindowSize: result.parameters.peakWindowSize,
      smoothingWindowSize: result.parameters.smoothingWindowSize,
      prominenceWindowSize: result.parameters.prominenceWindowSize,
    })),
  );

  console.log("\n=== Worst 10 Configurations ===\n");

  console.table(
    endToEndResults.slice(-10).map((result) => ({
      totalRepDifference: result.totalRepDifference,
      datasetsExactRepCount: result.datasetsExactRepCount,
      datasetsMissing: result.datasetsMissing,
      datasetsTooMany: result.datasetsTooMany,
      totalAlternationBreaks: result.totalAlternationBreaks,
      totalSelectedCountScore: result.totalSelectedCountScore,
      bottomDiff: result.totalBottomDifference,
      topDiff: result.totalTopDifference,
      avgRawBottoms: result.avgDetectedBottoms.toFixed(2),
      avgRawTops: result.avgDetectedTops.toFixed(2),
      avgSelectedBottoms: result.avgSelectedBottoms.toFixed(2),
      avgSelectedTops: result.avgSelectedTops.toFixed(2),
      avgSimulatedReps: result.avgSimulatedReps.toFixed(2),
      minimumDistanceSamples: result.parameters.minimumDistanceSamples,
      minimumProminenceRatio: result.parameters.minimumProminenceRatio,
      peakWindowSize: result.parameters.peakWindowSize,
      smoothingWindowSize: result.parameters.smoothingWindowSize,
      prominenceWindowSize: result.parameters.prominenceWindowSize,
    })),
  );

  console.log("\n=== Benchmark Summary ===\n");

  // totalScore measures Selected count error only; it is not a Cycle Analyzer rep count.
  console.log("Best totalRepDifference :", endToEndResults[0].totalRepDifference);
  console.log(
    "Worst totalRepDifference:",
    endToEndResults[endToEndResults.length - 1].totalRepDifference,
  );
  console.log(
    "Rep difference delta:",
    endToEndResults[endToEndResults.length - 1].totalRepDifference -
      endToEndResults[0].totalRepDifference,
  );

  const bestEndToEnd = endToEndResults[0];
  const bestSelectedCount = selectedCountResults[0];

  console.log("\n=== Best End-To-End Configuration Details ===\n");
  console.log(bestEndToEnd.parameters);

  console.table(
    bestEndToEnd.datasets.map((dataset) => ({
      dataset: dataset.datasetName,
      expected: dataset.expectedReps,
      bottomsDetected: dataset.bottomsDetected,
      topsDetected: dataset.topsDetected,
      selectedBottoms: dataset.selectedBottoms,
      selectedTops: dataset.selectedTops,
      selectedCountScore: dataset.selectedCountScore,
      alternationBreakCount: dataset.alternationBreakCount,
      simulatedReps: dataset.simulatedReps,
      repDifference: dataset.repDifference,
      cycleAnalyzerStatus: dataset.cycleAnalyzerStatus,
      usedBottoms: dataset.usedBottoms,
      usedTops: dataset.usedTops,
      ignoredEventsCount: dataset.ignoredEventsCount,
      bottomDiff: dataset.bottomDifference,
      topDiff: dataset.topDifference,
      totalDiff: dataset.totalDifference,
    })),
  );

  console.log("\n=== Selected Count vs End-To-End Best Comparison ===\n");
  console.table([
    {
      ranking: "bestSelectedCount",
      totalRepDifference: bestSelectedCount.totalRepDifference,
      datasetsExactRepCount: bestSelectedCount.datasetsExactRepCount,
      totalAlternationBreaks: bestSelectedCount.totalAlternationBreaks,
      totalSelectedCountScore: bestSelectedCount.totalSelectedCountScore,
      parameters: JSON.stringify(bestSelectedCount.parameters),
    },
    {
      ranking: "bestEndToEnd",
      totalRepDifference: bestEndToEnd.totalRepDifference,
      datasetsExactRepCount: bestEndToEnd.datasetsExactRepCount,
      totalAlternationBreaks: bestEndToEnd.totalAlternationBreaks,
      totalSelectedCountScore: bestEndToEnd.totalSelectedCountScore,
      parameters: JSON.stringify(bestEndToEnd.parameters),
    },
  ]);

  console.log(
    "\nRanking changed:",
    JSON.stringify(bestSelectedCount.parameters) !==
      JSON.stringify(bestEndToEnd.parameters),
  );

  console.log("\n=== Required Dataset Details For Best End-To-End Configuration ===\n");
  console.table(
    bestEndToEnd.datasets
      .filter((dataset) =>
        ["rowing_5reps_005.json", "rowing_5reps_002.json"].includes(
          dataset.datasetName,
        ),
      )
      .map((dataset) => ({
        dataset: dataset.datasetName,
        expectedReps: dataset.expectedReps,
        selectedBottoms: dataset.selectedBottoms,
        selectedTops: dataset.selectedTops,
        selectedCountScore: dataset.selectedCountScore,
        alternationBreakCount: dataset.alternationBreakCount,
        simulatedReps: dataset.simulatedReps,
        repDifference: dataset.repDifference,
        cycleAnalyzerStatus: dataset.cycleAnalyzerStatus,
        usedBottoms: dataset.usedBottoms,
        usedTops: dataset.usedTops,
        ignoredEventsCount: dataset.ignoredEventsCount,
      })),
  );

  printDiagnosticTable(datasets);
}

main();
