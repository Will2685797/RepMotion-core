import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDataset,
  type CalibrationDebugEvent,
} from "../../../mobile/RepMotion/analytics/calibration";

type BenchmarkDataset = CalibrationDataset & { name: string };
type EventType = "BOTTOM" | "TOP";

type FinalSelectedEvent = {
  type: EventType;
  index: number;
};

type MinDistanceConflict = {
  key: string;
  datasetName: string;
  type: EventType;
  winnerIndex: number;
  winnerValue: number;
  loserIndex: number;
  loserValue: number;
  distance: number;
  crossesOppositeConfirmedEvent: boolean;
  oppositeConfirmedEvents: FinalSelectedEvent[];
  winnerSurvivesFinalSelection: boolean;
  contributesToAlternationBreak: boolean;
  previousFinalEvent?: FinalSelectedEvent;
  nextFinalEvent?: FinalSelectedEvent;
};

const H1_PARAMETERS = {
  rawDetectionStrategy: "local_extrema" as const,
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
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

function getOppositeType(type: EventType): EventType {
  return type === "BOTTOM" ? "TOP" : "BOTTOM";
}

function getCandidateKey(type: EventType, index: number): string {
  return `${type}:${index}`;
}

function getConflictKey(
  datasetName: string,
  type: EventType,
  indexA: number,
  indexB: number,
): string {
  return `${datasetName}:${type}:${Math.min(indexA, indexB)}:${Math.max(
    indexA,
    indexB,
  )}`;
}

function buildFinalSequence(
  selectedBottomIndexes: number[],
  selectedTopIndexes: number[],
): FinalSelectedEvent[] {
  return [
    ...selectedBottomIndexes.map((index) => ({
      type: "BOTTOM" as const,
      index,
    })),
    ...selectedTopIndexes.map((index) => ({
      type: "TOP" as const,
      index,
    })),
  ].sort((left, right) => left.index - right.index);
}

function findFinalNeighbors(
  finalSequence: FinalSelectedEvent[],
  type: EventType,
  index: number,
) {
  const sequenceIndex = finalSequence.findIndex(
    (event) => event.type === type && event.index === index,
  );

  if (sequenceIndex === -1) {
    return {};
  }

  return {
    previousFinalEvent: finalSequence[sequenceIndex - 1],
    nextFinalEvent: finalSequence[sequenceIndex + 1],
  };
}

function isSelected(
  selectedKeys: Set<string>,
  type: EventType,
  index: number,
): boolean {
  return selectedKeys.has(getCandidateKey(type, index));
}

function getOppositeConfirmedEventsBetween(
  finalSequence: FinalSelectedEvent[],
  type: EventType,
  indexA: number,
  indexB: number,
): FinalSelectedEvent[] {
  const oppositeType = getOppositeType(type);
  const startIndex = Math.min(indexA, indexB);
  const endIndex = Math.max(indexA, indexB);

  return finalSequence.filter(
    (event) =>
      event.type === oppositeType &&
      event.index > startIndex &&
      event.index < endIndex,
  );
}

function eventToConflictDraft(
  datasetName: string,
  event: CalibrationDebugEvent,
): Pick<
  MinDistanceConflict,
  | "key"
  | "datasetName"
  | "type"
  | "winnerIndex"
  | "winnerValue"
  | "loserIndex"
  | "loserValue"
  | "distance"
> | null {
  if (
    event.filter !== "MIN_DISTANCE" ||
    event.conflictWithIndex === undefined ||
    event.conflictWithValue === undefined ||
    event.keptIndex === undefined ||
    event.keptValue === undefined
  ) {
    return null;
  }

  const winnerIndex = event.keptIndex;
  const winnerValue = event.keptValue;
  const loserIndex =
    event.index === winnerIndex ? event.conflictWithIndex : event.index;
  const loserValue =
    event.index === winnerIndex ? event.conflictWithValue : event.value;

  return {
    key: getConflictKey(datasetName, event.type, event.index, event.conflictWithIndex),
    datasetName,
    type: event.type,
    winnerIndex,
    winnerValue,
    loserIndex,
    loserValue,
    distance:
      event.conflictDistance ?? Math.abs(event.index - event.conflictWithIndex),
  };
}

function collectDatasetConflicts(dataset: BenchmarkDataset): MinDistanceConflict[] {
  const calibrationResult = calculateCalibration(
    dataset.samples,
    undefined,
    H1_PARAMETERS,
  );
  const debug = calibrationResult.debug;

  if (!debug) {
    return [];
  }

  const finalSequence = buildFinalSequence(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
  );
  const selectedKeys = new Set([
    ...debug.selectedBottomIndexes.map((index) =>
      getCandidateKey("BOTTOM", index),
    ),
    ...debug.selectedTopIndexes.map((index) => getCandidateKey("TOP", index)),
  ]);

  const conflicts = new Map<string, MinDistanceConflict>();
  const minDistanceEvents = debug.filterDebugEvents.filter(
    (event) =>
      event.filter === "MIN_DISTANCE" && event.conflictWithIndex !== undefined,
  );
  const sortedEvents = [
    ...minDistanceEvents.filter((event) => !event.kept),
    ...minDistanceEvents.filter((event) => event.kept),
  ];

  for (const event of sortedEvents) {
    const draft = eventToConflictDraft(dataset.name, event);

    if (!draft || conflicts.has(draft.key)) {
      continue;
    }

    const oppositeConfirmedEvents = getOppositeConfirmedEventsBetween(
      finalSequence,
      draft.type,
      draft.winnerIndex,
      draft.loserIndex,
    );
    const winnerSurvivesFinalSelection = isSelected(
      selectedKeys,
      draft.type,
      draft.winnerIndex,
    );
    const { previousFinalEvent, nextFinalEvent } = findFinalNeighbors(
      finalSequence,
      draft.type,
      draft.winnerIndex,
    );
    const contributesToAlternationBreak =
      winnerSurvivesFinalSelection &&
      (previousFinalEvent?.type === draft.type ||
        nextFinalEvent?.type === draft.type);

    conflicts.set(draft.key, {
      ...draft,
      crossesOppositeConfirmedEvent: oppositeConfirmedEvents.length > 0,
      oppositeConfirmedEvents,
      winnerSurvivesFinalSelection,
      contributesToAlternationBreak,
      previousFinalEvent,
      nextFinalEvent,
    });
  }

  return [...conflicts.values()];
}

function summarizeConflicts(conflicts: MinDistanceConflict[]) {
  const rows = [
    { crossesOppositeConfirmedEvent: true, contributesToAlternationBreak: true },
    { crossesOppositeConfirmedEvent: true, contributesToAlternationBreak: false },
    { crossesOppositeConfirmedEvent: false, contributesToAlternationBreak: true },
    {
      crossesOppositeConfirmedEvent: false,
      contributesToAlternationBreak: false,
    },
  ];

  return rows.map((row) => ({
    ...row,
    count: conflicts.filter(
      (conflict) =>
        conflict.crossesOppositeConfirmedEvent ===
          row.crossesOppositeConfirmedEvent &&
        conflict.contributesToAlternationBreak ===
          row.contributesToAlternationBreak,
    ).length,
  }));
}

function formatEvent(event: FinalSelectedEvent | undefined): string {
  return event ? `${event.type} ${event.index}` : "";
}

function formatEvents(events: FinalSelectedEvent[]): string {
  return events.map(formatEvent).join(", ");
}

function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return "n/a";
  }

  return `${((numerator / denominator) * 100).toFixed(2)}%`;
}

function printGlobalSummary(conflicts: MinDistanceConflict[]) {
  const crossingConflicts = conflicts.filter(
    (conflict) => conflict.crossesOppositeConfirmedEvent,
  );
  const nonCrossingConflicts = conflicts.filter(
    (conflict) => !conflict.crossesOppositeConfirmedEvent,
  );
  const crossingBreaks = crossingConflicts.filter(
    (conflict) => conflict.contributesToAlternationBreak,
  );
  const nonCrossingBreaks = nonCrossingConflicts.filter(
    (conflict) => conflict.contributesToAlternationBreak,
  );
  const survivingWinners = conflicts.filter(
    (conflict) => conflict.winnerSurvivesFinalSelection,
  );

  console.log("\n=== H1 Global Cross Table ===\n");
  console.table(summarizeConflicts(conflicts));

  console.log("\n=== H1 Global Totals ===\n");
  console.table([
    {
      totalConflicts: conflicts.length,
      winnerSurvivesFinalSelection: survivingWinners.length,
      winnerReplacedLater: conflicts.length - survivingWinners.length,
      breakRateWhenCrossesOppositeConfirmedEvent: formatPercent(
        crossingBreaks.length,
        crossingConflicts.length,
      ),
      breakRateWhenNotCrossingOppositeConfirmedEvent: formatPercent(
        nonCrossingBreaks.length,
        nonCrossingConflicts.length,
      ),
    },
  ]);
}

function printDatasetSummaries(conflicts: MinDistanceConflict[]) {
  const datasetNames = [...new Set(conflicts.map((conflict) => conflict.datasetName))].sort();

  console.log("\n=== H1 Cross Table By Dataset ===\n");

  for (const datasetName of datasetNames) {
    const datasetConflicts = conflicts.filter(
      (conflict) => conflict.datasetName === datasetName,
    );

    console.log(`\n--- ${datasetName} ---\n`);
    console.table(summarizeConflicts(datasetConflicts));
  }
}

function printTrueTrueCases(conflicts: MinDistanceConflict[]) {
  const rows = conflicts
    .filter(
      (conflict) =>
        conflict.crossesOppositeConfirmedEvent &&
        conflict.contributesToAlternationBreak,
    )
    .map((conflict) => ({
      dataset: conflict.datasetName,
      type: conflict.type,
      winnerIndex: conflict.winnerIndex,
      winnerValue: conflict.winnerValue,
      loserIndex: conflict.loserIndex,
      loserValue: conflict.loserValue,
      distance: conflict.distance,
      oppositeConfirmedEvents: formatEvents(conflict.oppositeConfirmedEvents),
      previousFinalEvent: formatEvent(conflict.previousFinalEvent),
      nextFinalEvent: formatEvent(conflict.nextFinalEvent),
      winnerSurvivesFinalSelection: conflict.winnerSurvivesFinalSelection,
    }));

  console.log("\n=== H1 true / true Cases ===\n");
  console.table(rows);
}

function printExamples(conflicts: MinDistanceConflict[]) {
  const categories = [
    { crosses: true, breaks: false },
    { crosses: false, breaks: true },
    { crosses: false, breaks: false },
  ];

  console.log("\n=== H1 Examples From Other Categories ===\n");

  for (const category of categories) {
    const rows = conflicts
      .filter(
        (conflict) =>
          conflict.crossesOppositeConfirmedEvent === category.crosses &&
          conflict.contributesToAlternationBreak === category.breaks,
      )
      .slice(0, 5)
      .map((conflict) => ({
        dataset: conflict.datasetName,
        type: conflict.type,
        winnerIndex: conflict.winnerIndex,
        winnerValue: conflict.winnerValue,
        loserIndex: conflict.loserIndex,
        loserValue: conflict.loserValue,
        distance: conflict.distance,
        oppositeConfirmedEvents: formatEvents(conflict.oppositeConfirmedEvents),
        previousFinalEvent: formatEvent(conflict.previousFinalEvent),
        nextFinalEvent: formatEvent(conflict.nextFinalEvent),
        winnerSurvivesFinalSelection: conflict.winnerSurvivesFinalSelection,
      }));

    console.log(
      `\n--- crossesOppositeConfirmedEvent=${category.crosses}, contributesToAlternationBreak=${category.breaks} ---\n`,
    );
    console.table(rows);
  }
}

function main() {
  const datasets = loadDatasets();
  const conflicts = datasets.flatMap(collectDatasetConflicts);

  console.log("\n=== H1 Fixed Configuration ===\n");
  console.log(H1_PARAMETERS);

  printGlobalSummary(conflicts);
  printDatasetSummaries(conflicts);
  printTrueTrueCases(conflicts);
  printExamples(conflicts);
}

main();
