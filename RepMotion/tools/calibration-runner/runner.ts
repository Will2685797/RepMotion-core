import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  CalibrationDataset,
  CalibrationDebugEvent,
  RawCalibrationCandidateDebug,
} from "../../mobile/RepMotion/analytics/calibration";
import { analyzeBottomTopBottomCycles } from "./cycleAnalyzer";
import { analyzeCalibrationOutput } from "../benchmark/calibration/calibrationOutputAnalyzer";

const DEBUG_CHAIN_FILE = "overhead_press_5reps_004.json";

// Lit tous les fichiers JSON de calibration, exercice par exercice.
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

// Charge un dataset JSON depuis le disque.
function loadDataset(filePath: string): CalibrationDataset {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CalibrationDataset;
}

function summarizeFilterDebugEvents(debugEvents: CalibrationDebugEvent[]) {
  const minDistanceEvents = debugEvents.filter(
    (event) => event.rejectedReason === "MIN_DISTANCE",
  );

  const lowProminenceEvents = debugEvents.filter(
    (event) => event.rejectedReason === "LOW_PROMINENCE",
  );

  const weakDirectionChangeEvents = debugEvents.filter(
    (event) => event.rejectedReason === "WEAK_DIRECTION_CHANGE",
  );

  return {
    minDistanceRejectedTotal: minDistanceEvents.length,
    minDistanceRejectedBottoms: minDistanceEvents.filter(
      (event) => event.type === "BOTTOM",
    ).length,
    minDistanceRejectedTops: minDistanceEvents.filter(
      (event) => event.type === "TOP",
    ).length,

    lowProminenceRejectedTotal: lowProminenceEvents.length,
    lowProminenceRejectedBottoms: lowProminenceEvents.filter(
      (event) => event.type === "BOTTOM",
    ).length,
    lowProminenceRejectedTops: lowProminenceEvents.filter(
      (event) => event.type === "TOP",
    ).length,
    weakDirectionChangeRejectedTotal: weakDirectionChangeEvents.length,
    weakDirectionChangeRejectedBottoms: weakDirectionChangeEvents.filter(
      (event) => event.type === "BOTTOM",
    ).length,
    weakDirectionChangeRejectedTops: weakDirectionChangeEvents.filter(
      (event) => event.type === "TOP",
    ).length,
  };
}

function summarizeRawCandidateDebugEvents(
  debugEvents: RawCalibrationCandidateDebug[],
) {
  const bottoms = debugEvents.filter((event) => event.type === "BOTTOM");
  const tops = debugEvents.filter((event) => event.type === "TOP");

  const summarizeNumbers = (values: number[]) => {
    if (values.length === 0) {
      return { min: null, avg: null, max: null };
    }

    return {
      min: Math.min(...values),
      avg: Math.round(
        values.reduce((sum, value) => sum + value, 0) / values.length,
      ),
      max: Math.max(...values),
    };
  };

  return {
    rawDebugBottoms: bottoms.length,
    rawDebugTops: tops.length,

    bottomDistanceSameType: summarizeNumbers(
      bottoms
        .map((event) => event.distanceToPreviousSameType)
        .filter((value): value is number => value !== undefined),
    ),

    topDistanceSameType: summarizeNumbers(
      tops
        .map((event) => event.distanceToPreviousSameType)
        .filter((value): value is number => value !== undefined),
    ),

    globalDistance: summarizeNumbers(
      debugEvents
        .map((event) => event.distanceToPreviousGlobal)
        .filter((value): value is number => value !== undefined),
    ),

    localAmplitude: summarizeNumbers(
      debugEvents.map((event) => event.localAmplitude),
    ),
  };
}

// Rejoue calculateCalibration() sur un dataset et retourne un résumé.
function runDataset(filePath: string) {
  const dataset = loadDataset(filePath);
  const result = calculateCalibration(dataset.samples);

  const calibrationDiagnostic = analyzeCalibrationOutput({
    datasetName: path.basename(filePath),
    expectedReps: dataset.performedReps ?? dataset.expectedReps ?? 0,
    rawBottomIndexes: result.debug?.rawBottomIndexes ?? [],
    rawTopIndexes: result.debug?.rawTopIndexes ?? [],
    selectedBottomIndexes: result.debug?.selectedBottomIndexes ?? [],
    selectedTopIndexes: result.debug?.selectedTopIndexes ?? [],
  });

  const cycleAnalysis = analyzeBottomTopBottomCycles(
    result.debug?.selectedBottomIndexes ?? [],
    result.debug?.selectedTopIndexes ?? [],
    dataset.performedReps ?? dataset.expectedReps ?? 0,
  );

  const filterDebugSummary = summarizeFilterDebugEvents(
    result.debug?.filterDebugEvents ?? [],
  );
  const rawCandidateDebugSummary = summarizeRawCandidateDebugEvents(
    result.debug?.rawCandidateDebugEvents ?? [],
  );

  return {
    file: path.basename(filePath),
    exercise: dataset.exercise,
    expectedReps: dataset.expectedReps,
    performedReps: dataset.performedReps,
    sampleCount: dataset.sampleCount,

    axis: result.axis,
    isValid: result.isValid,
    range: Math.round(result.range),
    bottomThreshold: Math.round(result.bottomThreshold),
    topThreshold: Math.round(result.topThreshold),

    globalRange: result.debug?.globalRange ?? null,
    robustRange: result.debug?.robustRange ?? null,
    bottomsDetected: result.debug?.bottomsDetected ?? null,
    topsDetected: result.debug?.topsDetected ?? null,
    selectedBottoms: result.debug?.selectedBottoms ?? null,
    selectedTops: result.debug?.selectedTops ?? null,
    minDistanceRejectedTotal: filterDebugSummary.minDistanceRejectedTotal,
    minDistanceRejectedBottoms: filterDebugSummary.minDistanceRejectedBottoms,
    minDistanceRejectedTops: filterDebugSummary.minDistanceRejectedTops,
    lowProminenceRejectedTotal: filterDebugSummary.lowProminenceRejectedTotal,
    lowProminenceRejectedBottoms:
      filterDebugSummary.lowProminenceRejectedBottoms,
    lowProminenceRejectedTops: filterDebugSummary.lowProminenceRejectedTops,

    weakDirectionChangeRejectedTotal:
      filterDebugSummary.weakDirectionChangeRejectedTotal,
    weakDirectionChangeRejectedBottoms:
      filterDebugSummary.weakDirectionChangeRejectedBottoms,
    weakDirectionChangeRejectedTops:
      filterDebugSummary.weakDirectionChangeRejectedTops,

    rawBottoms: calibrationDiagnostic.raw.bottomCount,
    rawTops: calibrationDiagnostic.raw.topCount,
    selectedBottomCount: calibrationDiagnostic.selected.bottomCount,
    selectedTopCount: calibrationDiagnostic.selected.topCount,
    alternationBreaks: calibrationDiagnostic.selected.alternationBreaks,
    shortTransitions: calibrationDiagnostic.selected.shortTransitions,
    reconstructibleReps: calibrationDiagnostic.selected.reconstructibleReps,
    calibrationVerdict: calibrationDiagnostic.selected.verdict,
    calibrationFailureReasons: calibrationDiagnostic.selected.failureReasons,

    saturationCount: result.debug?.saturationCount ?? null,
    saturationRatio: result.debug?.saturationRatio ?? null,

    simulatedReps: cycleAnalysis.simulatedReps,
    expectedRepsFromSegmentation: cycleAnalysis.expectedReps,
    segmentationStatus: cycleAnalysis.status,
    chainLength: cycleAnalysis.chainLength,
    usedBottoms: cycleAnalysis.usedBottoms,
    usedTops: cycleAnalysis.usedTops,
    ignoredEvents: cycleAnalysis.ignoredEvents,
    chain: cycleAnalysis.chain,

    rawChain: calibrationDiagnostic.raw.chain,
    selectedChain: calibrationDiagnostic.selected.chain,
    filterDebugEvents: result.debug?.filterDebugEvents ?? [],
    rawCandidateDebugEvents: result.debug?.rawCandidateDebugEvents ?? [],
  };
}

// Point d’entrée du runner.
function main() {
  const datasetsRoot = path.resolve(__dirname, "../../datasets/calibration");
  const files = getCalibrationDatasetFiles(datasetsRoot);

  if (files.length === 0) {
    console.log("No calibration datasets found.");
    return;
  }

  const results = files.map(runDataset);
  const validCount = results.filter((result) => result.isValid).length;

  console.table(results);

  const debugResult = results.find(
    (result) => result.file === DEBUG_CHAIN_FILE,
  );

  if (debugResult) {
    console.log("");
    console.log(`Calibration diagnostic for ${DEBUG_CHAIN_FILE}:`);
    console.log("RAW chain:");
    console.log(debugResult.rawChain);
    console.log("");
    console.log("SELECTED chain:");
    console.log(debugResult.selectedChain);
    console.log("");
    console.log("MIN_DISTANCE rejected events:");
    console.table(
      debugResult.filterDebugEvents.filter(
        (event) => event.rejectedReason === "MIN_DISTANCE",
      ),
    );

    console.log("");
    console.log("LOW_PROMINENCE rejected events:");
    console.table(
      debugResult.filterDebugEvents.filter(
        (event) => event.rejectedReason === "LOW_PROMINENCE",
      ),
    );

    console.log("");
    console.log("WEAK_DIRECTION_CHANGE rejected events:");
    console.table(
      debugResult.filterDebugEvents.filter(
        (event) => event.rejectedReason === "WEAK_DIRECTION_CHANGE",
      ),
    );

    console.log("");
    console.log("RAW candidate debug events:");
    console.table(debugResult.rawCandidateDebugEvents);
  }

  console.log("");
  console.log(`Calibration datasets tested: ${results.length}`);
  console.log(`Valid calibrations: ${validCount}/${results.length}`);
}

main();
