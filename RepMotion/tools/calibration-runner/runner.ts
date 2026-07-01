import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  CalibrationDataset,
} from "../../mobile/RepMotion/analytics/calibration";

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

  console.log("");
  console.log(`Calibration datasets tested: ${results.length}`);
  console.log(`Valid calibrations: ${validCount}/${results.length}`);
}

main();