import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  CalibrationDataset,
} from "../../mobile/RepMotion/analytics/calibration";
import { analyzeBottomTopBottomCycles } from "./cycleAnalyzer";

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

// Rejoue calculateCalibration() sur un dataset et retourne un résumé.
function runDataset(filePath: string) {
  const dataset = loadDataset(filePath);
  const result = calculateCalibration(dataset.samples);

  const cycleAnalysis = analyzeBottomTopBottomCycles(
    result.debug?.selectedBottomIndexes ?? [],
    result.debug?.selectedTopIndexes ?? [],
    dataset.performedReps ?? dataset.expectedReps ?? 0,
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
    console.log(`Event chain for ${DEBUG_CHAIN_FILE}:`);
    console.log(debugResult.chain);
  }

  console.log("");
  console.log(`Calibration datasets tested: ${results.length}`);
  console.log(`Valid calibrations: ${validCount}/${results.length}`);
}

main();
