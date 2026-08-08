import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  CalibrationDataset,
  CalibrationDebugEvent,
} from "../../mobile/RepMotion/analytics/calibration";
import { analyzeBottomTopBottomCycles } from "./cycleAnalyzer";

type MinDistanceDebugEventSnapshot = {
  type: "BOTTOM" | "TOP";
  index: number;
  value: number;
  kept: boolean;
  rejectedReason?: "MIN_DISTANCE" | "LOW_PROMINENCE" | "WEAK_DIRECTION_CHANGE";
  distanceToPreviousSameType?: number;
  conflictWithIndex?: number;
  conflictWithValue?: number;
  conflictDistance?: number;
  keptIndex?: number;
  keptValue?: number;
  selectionRule?: string;
};

type DatasetSnapshot = {
  file: string;
  exercise: string;
  expectedReps: number;
  performedReps?: number;
  sampleCount: number;
  axis: string;
  isValid: boolean;
  selectedBottomIndexes: number[];
  selectedTopIndexes: number[];
  simulatedReps: number;
  cycleAnalyzerStatus: string;
  minDistanceDebugEvents: MinDistanceDebugEventSnapshot[];
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

function snapshotMinDistanceDebugEvents(
  debugEvents: CalibrationDebugEvent[],
): MinDistanceDebugEventSnapshot[] {
  return debugEvents
    .filter((event) => event.filter === "MIN_DISTANCE")
    .map((event) => ({
      type: event.type,
      index: event.index,
      value: event.value,
      kept: event.kept,
      rejectedReason: event.rejectedReason,
      distanceToPreviousSameType: event.distanceToPreviousSameType,
      conflictWithIndex: event.conflictWithIndex,
      conflictWithValue: event.conflictWithValue,
      conflictDistance: event.conflictDistance,
      keptIndex: event.keptIndex,
      keptValue: event.keptValue,
      selectionRule: event.selectionRule,
    }));
}

function collectSnapshots(): DatasetSnapshot[] {
  const datasetsRoot = path.resolve(__dirname, "../../datasets/calibration");
  const files = getCalibrationDatasetFiles(datasetsRoot);

  return files.map((filePath) => {
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
      selectedBottomIndexes: result.debug?.selectedBottomIndexes ?? [],
      selectedTopIndexes: result.debug?.selectedTopIndexes ?? [],
      simulatedReps: cycleAnalysis.simulatedReps,
      cycleAnalyzerStatus: cycleAnalysis.status,
      minDistanceDebugEvents: snapshotMinDistanceDebugEvents(
        result.debug?.filterDebugEvents ?? [],
      ),
    };
  });
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function compareSnapshots(
  baseline: DatasetSnapshot[],
  current: DatasetSnapshot[],
): string[] {
  const issues: string[] = [];

  if (baseline.length !== current.length) {
    issues.push(`Dataset count changed: ${baseline.length} -> ${current.length}`);
  }

  const maxLength = Math.max(baseline.length, current.length);

  for (let index = 0; index < maxLength; index += 1) {
    const baselineEntry = baseline[index];
    const currentEntry = current[index];

    if (!baselineEntry || !currentEntry) {
      issues.push(`Missing dataset entry at index ${index}`);
      continue;
    }

    if (baselineEntry.file !== currentEntry.file) {
      issues.push(
        `${baselineEntry.file}: file mismatch (${baselineEntry.file} -> ${currentEntry.file})`,
      );
    }

    const checks: Array<[string, unknown, unknown]> = [
      ["selectedBottomIndexes", baselineEntry.selectedBottomIndexes, currentEntry.selectedBottomIndexes],
      ["selectedTopIndexes", baselineEntry.selectedTopIndexes, currentEntry.selectedTopIndexes],
      ["simulatedReps", baselineEntry.simulatedReps, currentEntry.simulatedReps],
      ["cycleAnalyzerStatus", baselineEntry.cycleAnalyzerStatus, currentEntry.cycleAnalyzerStatus],
      ["minDistanceDebugEvents", baselineEntry.minDistanceDebugEvents, currentEntry.minDistanceDebugEvents],
    ];

    for (const [label, baselineValue, currentValue] of checks) {
      if (!deepEqual(baselineValue, currentValue)) {
        issues.push(
          `${baselineEntry.file}: ${label} changed\n  baseline=${JSON.stringify(baselineValue)}\n  current=${JSON.stringify(currentValue)}`,
        );
      }
    }
  }

  return issues;
}

function main() {
  const args = process.argv.slice(2);
  const saveBaseline = args.includes("--save-baseline");
  const baselinePath = args.find((arg) => arg.startsWith("--baseline="))?.split("=")[1];
  const outputPath = baselinePath ?? path.resolve(__dirname, "baseline-min-distance-strategy.json");

  const snapshots = collectSnapshots();

  if (saveBaseline) {
    fs.writeFileSync(outputPath, JSON.stringify(snapshots, null, 2));
    console.log(`Saved baseline to ${outputPath}`);
    console.log(`Datasets captured: ${snapshots.length}`);
    return;
  }

  if (!fs.existsSync(outputPath)) {
    console.error(`Baseline file not found: ${outputPath}`);
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(outputPath, "utf-8")) as DatasetSnapshot[];
  const issues = compareSnapshots(baseline, snapshots);

  if (issues.length > 0) {
    console.error("MIN_DISTANCE strategy comparison failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`MIN_DISTANCE strategy comparison passed for ${snapshots.length} datasets.`);
}

main();
