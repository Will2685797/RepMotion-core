import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDataset,
  type CalibrationDebugEvent,
} from "../../../mobile/RepMotion/analytics/calibration";
import {
  analyzeBottomTopBottomCycles,
  type CycleAnalyzerDebugEvent,
  type ReconstructedRep,
} from "../../calibration-runner/cycleAnalyzer";

type BenchmarkDataset = CalibrationDataset & { name: string };
type EventType = "BOTTOM" | "TOP";
type FinalSelectedEvent = {
  type: EventType;
  index: number;
  value: number;
};

type CounterfactualCategory =
  | "LOSER_IMPROVES_ALTERNATION"
  | "LOSER_WORSENS_ALTERNATION"
  | "NO_ALTERNATION_CHANGE"
  | "WINNER_NOT_IN_FINAL_SELECTION";

type MinDistanceConflict = {
  key: string;
  datasetName: string;
  type: EventType;
  winnerIndex: number;
  winnerValue: number;
  loserIndex: number;
  loserValue: number;
  distance: number;
  oppositeConfirmedEvents: FinalSelectedEvent[];
  crossesOppositeConfirmedEvent: boolean;
  winnerSurvivesFinalSelection: boolean;
  loserSurvivesFinalSelection: boolean;
  contributesToAlternationBreak: boolean;
  winnerReplacedLaterDescription: string;
  previousWinnerNeighbor?: FinalSelectedEvent;
  nextWinnerNeighbor?: FinalSelectedEvent;
  hasLocalOppositeSelectedNeighbor: boolean;
  hasOtherOppositeFinalEventInZone: boolean;
  realAlternationBreaks: number;
  counterfactualAlternationBreaks: number | null;
  counterfactualCategory: CounterfactualCategory;
  cycleWinnerDecision: string;
  cycleWinnerInFinalChain: boolean;
  cycleWinnerHasOppositeChainNeighbor: boolean;
  cycleWinnerRepNumbers: string;
};

const CALIBRATION_PARAMETERS = {
  rawDetectionStrategy: "local_extrema" as const,
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
};

const CYCLE_ANALYZER_PARAMETERS = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
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

function getOppositeType(type: EventType): EventType {
  return type === "BOTTOM" ? "TOP" : "BOTTOM";
}

function buildFinalSequence(
  bottomIndexes: number[],
  topIndexes: number[],
  valuesByIndex: Map<number, number>,
): FinalSelectedEvent[] {
  return [
    ...bottomIndexes.map((index) => ({
      type: "BOTTOM" as const,
      index,
      value: valuesByIndex.get(index) ?? 0,
    })),
    ...topIndexes.map((index) => ({
      type: "TOP" as const,
      index,
      value: valuesByIndex.get(index) ?? 0,
    })),
  ].sort((left, right) => left.index - right.index);
}

function buildSelectedKeys(events: FinalSelectedEvent[]): Set<string> {
  return new Set(events.map((event) => getCandidateKey(event.type, event.index)));
}

function countAlternationBreaks(events: FinalSelectedEvent[]): number {
  let breaks = 0;

  for (let index = 0; index + 1 < events.length; index += 1) {
    if (events[index].type === events[index + 1].type) {
      breaks += 1;
    }
  }

  return breaks;
}

function findEventIndex(
  events: FinalSelectedEvent[],
  type: EventType,
  index: number,
): number {
  return events.findIndex(
    (event) => event.type === type && event.index === index,
  );
}

function getNeighbors(
  events: FinalSelectedEvent[],
  type: EventType,
  index: number,
) {
  const eventIndex = findEventIndex(events, type, index);

  if (eventIndex === -1) {
    return {};
  }

  return {
    previousWinnerNeighbor: events[eventIndex - 1],
    nextWinnerNeighbor: events[eventIndex + 1],
  };
}

function getOppositeConfirmedEventsBetween(
  events: FinalSelectedEvent[],
  type: EventType,
  indexA: number,
  indexB: number,
): FinalSelectedEvent[] {
  const oppositeType = getOppositeType(type);
  const startIndex = Math.min(indexA, indexB);
  const endIndex = Math.max(indexA, indexB);

  return events.filter(
    (event) =>
      event.type === oppositeType &&
      event.index > startIndex &&
      event.index < endIndex,
  );
}

function hasOtherOppositeFinalEventInZone(
  events: FinalSelectedEvent[],
  type: EventType,
  winnerIndex: number,
  loserIndex: number,
): boolean {
  const oppositeType = getOppositeType(type);
  const startIndex = Math.min(winnerIndex, loserIndex);
  const endIndex = Math.max(winnerIndex, loserIndex);

  return events.some(
    (event) =>
      event.type === oppositeType &&
      event.index > startIndex &&
      event.index < endIndex,
  );
}

function classifyCounterfactual(
  finalSequence: FinalSelectedEvent[],
  selectedKeys: Set<string>,
  conflict: Pick<
    MinDistanceConflict,
    "type" | "winnerIndex" | "loserIndex" | "loserValue" | "realAlternationBreaks"
  >,
): {
  counterfactualAlternationBreaks: number | null;
  counterfactualCategory: CounterfactualCategory;
} {
  const winnerKey = getCandidateKey(conflict.type, conflict.winnerIndex);
  const loserKey = getCandidateKey(conflict.type, conflict.loserIndex);

  if (!selectedKeys.has(winnerKey)) {
    return {
      counterfactualAlternationBreaks: null,
      counterfactualCategory: "WINNER_NOT_IN_FINAL_SELECTION",
    };
  }

  if (selectedKeys.has(loserKey)) {
    return {
      counterfactualAlternationBreaks: conflict.realAlternationBreaks,
      counterfactualCategory: "NO_ALTERNATION_CHANGE",
    };
  }

  const virtualSequence = finalSequence
    .filter(
      (event) =>
        event.type !== conflict.type || event.index !== conflict.winnerIndex,
    )
    .concat({
      type: conflict.type,
      index: conflict.loserIndex,
      value: conflict.loserValue,
    })
    .sort((left, right) => left.index - right.index);
  const counterfactualAlternationBreaks =
    countAlternationBreaks(virtualSequence);

  if (counterfactualAlternationBreaks < conflict.realAlternationBreaks) {
    return {
      counterfactualAlternationBreaks,
      counterfactualCategory: "LOSER_IMPROVES_ALTERNATION",
    };
  }

  if (counterfactualAlternationBreaks > conflict.realAlternationBreaks) {
    return {
      counterfactualAlternationBreaks,
      counterfactualCategory: "LOSER_WORSENS_ALTERNATION",
    };
  }

  return {
    counterfactualAlternationBreaks,
    counterfactualCategory: "NO_ALTERNATION_CHANGE",
  };
}

function eventToConflictDraft(
  datasetName: string,
  event: CalibrationDebugEvent,
) {
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

function buildCycleDebugByKey(debugEvents: CycleAnalyzerDebugEvent[]) {
  const eventsByKey = new Map<string, CycleAnalyzerDebugEvent[]>();

  for (const event of debugEvents) {
    const key = getCandidateKey(event.type, event.index);
    const events = eventsByKey.get(key) ?? [];
    events.push(event);
    eventsByKey.set(key, events);
  }

  return eventsByKey;
}

function parseCycleChain(chain: string): FinalSelectedEvent[] {
  return [...chain.matchAll(/([BT])\((\d+)\)/g)].map((match) => ({
    type: match[1] === "B" ? "BOTTOM" : "TOP",
    index: Number(match[2]),
    value: 0,
  }));
}

function getCycleWinnerDecision(
  cycleDebugByKey: Map<string, CycleAnalyzerDebugEvent[]>,
  type: EventType,
  index: number,
): string {
  const events = cycleDebugByKey.get(getCandidateKey(type, index)) ?? [];

  if (events.length === 0) {
    return "UNUSED";
  }

  return events.map((event) => `${event.action}:${event.reason}`).join(" | ");
}

function getRepNumbersUsingWinner(
  reps: ReconstructedRep[],
  winnerIndex: number,
): string {
  return reps
    .filter(
      (rep) =>
        rep.bottomStart === winnerIndex ||
        rep.top === winnerIndex ||
        rep.bottomEnd === winnerIndex,
    )
    .map((rep) => rep.repNumber)
    .join(", ");
}

function describeLaterReplacement(
  conflict: {
    type: EventType;
    winnerIndex: number;
    winnerSurvivesFinalSelection: boolean;
  },
  minDistanceEvents: CalibrationDebugEvent[],
): string {
  if (conflict.winnerSurvivesFinalSelection) {
    return "winner survives final selection";
  }

  const laterReplacement = minDistanceEvents.find(
    (event) =>
      event.type === conflict.type &&
      event.filter === "MIN_DISTANCE" &&
      event.conflictWithIndex !== undefined &&
      event.keptIndex !== undefined &&
      event.keptIndex !== conflict.winnerIndex &&
      (event.index === conflict.winnerIndex ||
        event.conflictWithIndex === conflict.winnerIndex),
  );

  if (!laterReplacement) {
    return "winner absent from final selection; later MIN_DISTANCE replacement not reconstructed";
  }

  return `winner absent from final selection; later MIN_DISTANCE kept ${conflict.type} ${laterReplacement.keptIndex} over ${conflict.type} ${conflict.winnerIndex}`;
}

function hasOppositeChainNeighbor(
  chainEvents: FinalSelectedEvent[],
  type: EventType,
  index: number,
): boolean {
  const eventIndex = findEventIndex(chainEvents, type, index);

  if (eventIndex === -1) {
    return false;
  }

  return (
    chainEvents[eventIndex - 1]?.type === getOppositeType(type) ||
    chainEvents[eventIndex + 1]?.type === getOppositeType(type)
  );
}

function collectDatasetConflicts(dataset: BenchmarkDataset): MinDistanceConflict[] {
  const expectedReps = dataset.performedReps ?? dataset.expectedReps ?? 0;
  const calibration = calculateCalibration(
    dataset.samples,
    undefined,
    CALIBRATION_PARAMETERS,
  );
  const debug = calibration.debug;

  if (!debug) {
    return [];
  }

  const axisValues = dataset.samples.map((sample) => sample[calibration.axis]);
  const valuesByIndex = new Map(axisValues.map((value, index) => [index, value]));
  const finalSequence = buildFinalSequence(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    valuesByIndex,
  );
  const selectedKeys = buildSelectedKeys(finalSequence);
  const realAlternationBreaks = countAlternationBreaks(finalSequence);
  const cycleAnalysis = analyzeBottomTopBottomCycles(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    expectedReps,
    CYCLE_ANALYZER_PARAMETERS,
  );
  const cycleDebugByKey = buildCycleDebugByKey(cycleAnalysis.debugEvents);
  const cycleChainEvents = parseCycleChain(cycleAnalysis.chain);
  const minDistanceEvents = debug.filterDebugEvents.filter(
    (event) =>
      event.filter === "MIN_DISTANCE" && event.conflictWithIndex !== undefined,
  );
  const sortedEvents = [
    ...minDistanceEvents.filter((event) => !event.kept),
    ...minDistanceEvents.filter((event) => event.kept),
  ];
  const conflicts = new Map<string, MinDistanceConflict>();

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
    const crossesOppositeConfirmedEvent =
      oppositeConfirmedEvents.length > 0;
    const winnerSurvivesFinalSelection = selectedKeys.has(
      getCandidateKey(draft.type, draft.winnerIndex),
    );
    const loserSurvivesFinalSelection = selectedKeys.has(
      getCandidateKey(draft.type, draft.loserIndex),
    );
    const { previousWinnerNeighbor, nextWinnerNeighbor } = getNeighbors(
      finalSequence,
      draft.type,
      draft.winnerIndex,
    );
    const contributesToAlternationBreak =
      winnerSurvivesFinalSelection &&
      (previousWinnerNeighbor?.type === draft.type ||
        nextWinnerNeighbor?.type === draft.type);
    const hasLocalOppositeSelectedNeighbor =
      previousWinnerNeighbor?.type === getOppositeType(draft.type) ||
      nextWinnerNeighbor?.type === getOppositeType(draft.type);
    const baseConflict = {
      ...draft,
      realAlternationBreaks,
    };
    const counterfactual = classifyCounterfactual(
      finalSequence,
      selectedKeys,
      baseConflict,
    );
    const cycleWinnerDecision = getCycleWinnerDecision(
      cycleDebugByKey,
      draft.type,
      draft.winnerIndex,
    );
    const cycleWinnerInFinalChain =
      findEventIndex(cycleChainEvents, draft.type, draft.winnerIndex) !== -1;

    conflicts.set(draft.key, {
      ...draft,
      oppositeConfirmedEvents,
      crossesOppositeConfirmedEvent,
      winnerSurvivesFinalSelection,
      loserSurvivesFinalSelection,
      contributesToAlternationBreak,
      winnerReplacedLaterDescription: describeLaterReplacement(
        {
          type: draft.type,
          winnerIndex: draft.winnerIndex,
          winnerSurvivesFinalSelection,
        },
        minDistanceEvents,
      ),
      previousWinnerNeighbor,
      nextWinnerNeighbor,
      hasLocalOppositeSelectedNeighbor,
      hasOtherOppositeFinalEventInZone: hasOtherOppositeFinalEventInZone(
        finalSequence,
        draft.type,
        draft.winnerIndex,
        draft.loserIndex,
      ),
      realAlternationBreaks,
      counterfactualAlternationBreaks:
        counterfactual.counterfactualAlternationBreaks,
      counterfactualCategory: counterfactual.counterfactualCategory,
      cycleWinnerDecision,
      cycleWinnerInFinalChain,
      cycleWinnerHasOppositeChainNeighbor: hasOppositeChainNeighbor(
        cycleChainEvents,
        draft.type,
        draft.winnerIndex,
      ),
      cycleWinnerRepNumbers: getRepNumbersUsingWinner(
        cycleAnalysis.reconstructedReps,
        draft.winnerIndex,
      ),
    });
  }

  return [...conflicts.values()].filter(
    (conflict) =>
      conflict.crossesOppositeConfirmedEvent &&
      !conflict.contributesToAlternationBreak,
  );
}

function formatEvent(event: FinalSelectedEvent | undefined): string {
  return event ? `${event.type} ${event.index}` : "";
}

function formatEvents(events: FinalSelectedEvent[]): string {
  return events.map(formatEvent).join(", ");
}

function printGlobalSummary(conflicts: MinDistanceConflict[]) {
  const categories: CounterfactualCategory[] = [
    "LOSER_IMPROVES_ALTERNATION",
    "LOSER_WORSENS_ALTERNATION",
    "NO_ALTERNATION_CHANGE",
    "WINNER_NOT_IN_FINAL_SELECTION",
  ];

  console.log("\n=== H1 true/false Counterfactual Summary ===\n");
  console.table(
    categories.map((category) => ({
      category,
      count: conflicts.filter(
        (conflict) => conflict.counterfactualCategory === category,
      ).length,
    })),
  );

  console.log("\n=== H1 true/false Descriptive Counts ===\n");
  console.table([
    {
      totalTrueFalseConflicts: conflicts.length,
      winnerDoesNotSurviveFinalSelection: conflicts.filter(
        (conflict) => !conflict.winnerSurvivesFinalSelection,
      ).length,
      hasLocalOppositeSelectedNeighbor: conflicts.filter(
        (conflict) => conflict.hasLocalOppositeSelectedNeighbor,
      ).length,
      hasOtherOppositeFinalEventInZone: conflicts.filter(
        (conflict) => conflict.hasOtherOppositeFinalEventInZone,
      ).length,
      cycleWinnerAccepted: conflicts.filter((conflict) =>
        conflict.cycleWinnerDecision.includes("ACCEPTED"),
      ).length,
      cycleWinnerAcceptedWithoutReplacementOrRejection: conflicts.filter(
        (conflict) =>
          conflict.cycleWinnerDecision.includes("ACCEPTED") &&
          !conflict.cycleWinnerDecision.includes("REPLACED") &&
          !conflict.cycleWinnerDecision.includes("REJECTED"),
      ).length,
      noCounterfactualAlternationChange: conflicts.filter(
        (conflict) =>
          conflict.counterfactualCategory === "NO_ALTERNATION_CHANGE",
      ).length,
    },
  ]);
}

function printDatasetSummary(conflicts: MinDistanceConflict[]) {
  const datasetNames = [...new Set(conflicts.map((conflict) => conflict.datasetName))].sort();

  console.log("\n=== H1 true/false By Dataset ===\n");
  console.table(
    datasetNames.map((datasetName) => {
      const datasetConflicts = conflicts.filter(
        (conflict) => conflict.datasetName === datasetName,
      );

      return {
        datasetName,
        total: datasetConflicts.length,
        improves: datasetConflicts.filter(
          (conflict) =>
            conflict.counterfactualCategory ===
            "LOSER_IMPROVES_ALTERNATION",
        ).length,
        worsens: datasetConflicts.filter(
          (conflict) =>
            conflict.counterfactualCategory === "LOSER_WORSENS_ALTERNATION",
        ).length,
        noChange: datasetConflicts.filter(
          (conflict) =>
            conflict.counterfactualCategory === "NO_ALTERNATION_CHANGE",
        ).length,
        winnerNotFinal: datasetConflicts.filter(
          (conflict) =>
            conflict.counterfactualCategory ===
            "WINNER_NOT_IN_FINAL_SELECTION",
        ).length,
        localOppositeNeighbor: datasetConflicts.filter(
          (conflict) => conflict.hasLocalOppositeSelectedNeighbor,
        ).length,
        cycleAcceptedWithoutReplacementOrRejection: datasetConflicts.filter(
          (conflict) =>
            conflict.cycleWinnerDecision.includes("ACCEPTED") &&
            !conflict.cycleWinnerDecision.includes("REPLACED") &&
            !conflict.cycleWinnerDecision.includes("REJECTED"),
        ).length,
      };
    }),
  );
}

function toDetailRow(conflict: MinDistanceConflict) {
  return {
    dataset: conflict.datasetName,
    type: conflict.type,
    winner: `${conflict.winnerIndex}/${conflict.winnerValue}`,
    loser: `${conflict.loserIndex}/${conflict.loserValue}`,
    distance: conflict.distance,
    oppositeFinalBetween: formatEvents(conflict.oppositeConfirmedEvents),
    winnerSurvivesFinalSelection: conflict.winnerSurvivesFinalSelection,
    loserSurvivesFinalSelection: conflict.loserSurvivesFinalSelection,
    winnerReplacedLater: conflict.winnerReplacedLaterDescription,
    previousWinnerNeighbor: formatEvent(conflict.previousWinnerNeighbor),
    nextWinnerNeighbor: formatEvent(conflict.nextWinnerNeighbor),
    hasLocalOppositeSelectedNeighbor:
      conflict.hasLocalOppositeSelectedNeighbor,
    hasOtherOppositeFinalEventInZone:
      conflict.hasOtherOppositeFinalEventInZone,
    realAlternationBreaks: conflict.realAlternationBreaks,
    counterfactualAlternationBreaks:
      conflict.counterfactualAlternationBreaks ?? "",
    counterfactualCategory: conflict.counterfactualCategory,
    cycleWinnerDecision: conflict.cycleWinnerDecision,
    cycleWinnerInFinalChain: conflict.cycleWinnerInFinalChain,
    cycleWinnerHasOppositeChainNeighbor:
      conflict.cycleWinnerHasOppositeChainNeighbor,
    cycleWinnerRepNumbers: conflict.cycleWinnerRepNumbers,
  };
}

function printRepresentativeExamples(conflicts: MinDistanceConflict[]) {
  const categories: CounterfactualCategory[] = [
    "LOSER_IMPROVES_ALTERNATION",
    "LOSER_WORSENS_ALTERNATION",
    "NO_ALTERNATION_CHANGE",
    "WINNER_NOT_IN_FINAL_SELECTION",
  ];

  console.log("\n=== H1 true/false Representative Examples ===\n");

  for (const category of categories) {
    console.log(`\n--- ${category} ---\n`);
    console.table(
      conflicts
        .filter((conflict) => conflict.counterfactualCategory === category)
        .slice(0, 5)
        .map(toDetailRow),
    );
  }
}

function printRowing005Comparison(conflicts: MinDistanceConflict[]) {
  const rowing005TrueFalse = conflicts.filter(
    (conflict) => conflict.datasetName === "rowing_5reps_005.json",
  );

  console.log("\n=== rowing_5reps_005 true/false Conflicts For Comparison ===\n");
  console.table(rowing005TrueFalse.map(toDetailRow));

  console.log("\n=== rowing_5reps_005 Known Alternation Breaks For Comparison ===\n");
  console.table([
    {
      break: "BOTTOM 26 -> BOTTOM 133",
      intermediateOppositeRaw: "TOP 103 rejected by MIN_DISTANCE; kept TOP 154 after bounds",
      cycleAnalyzerImpact:
        "BOTTOM 133 replaces BOTTOM 26: REPLACED_CONSECUTIVE_BOTTOM",
    },
    {
      break: "TOP 245 -> TOP 315",
      intermediateOppositeRaw:
        "BOTTOM 248/264/290 rejected by MIN_DISTANCE; kept BOTTOM 222 before bounds; BOTTOM 313 rejected by MIN_DISTANCE; kept BOTTOM 331 after bounds",
      cycleAnalyzerImpact: "TOP 315 replaces TOP 245: REPLACED_CONSECUTIVE_TOP",
    },
    {
      break: "BOTTOM 331 -> BOTTOM 415",
      intermediateOppositeRaw:
        "TOP 345/358/369 rejected by MIN_DISTANCE; kept TOP 315 before bounds; TOP 392 rejected by MIN_DISTANCE; kept TOP 420 after bounds",
      cycleAnalyzerImpact:
        "BOTTOM 415 replaces BOTTOM 331; TOP 420 rejected duration=5 min=8",
    },
    {
      break: "TOP 515 -> TOP 601",
      intermediateOppositeRaw:
        "BOTTOM 516/530/545/557/572 rejected by MIN_DISTANCE; kept BOTTOM 507 before bounds",
      cycleAnalyzerImpact:
        "TOP 601 replaces TOP 515; BOTTOM 603 rejected duration=2 min=8",
    },
  ]);
}

function main() {
  const datasets = loadDatasets();
  const conflicts = datasets.flatMap(collectDatasetConflicts);

  console.log("\n=== H1 true/false Diagnostic Fixed Parameters ===\n");
  console.log("Calibration:", CALIBRATION_PARAMETERS);
  console.log("Cycle Analyzer:", CYCLE_ANALYZER_PARAMETERS);

  printGlobalSummary(conflicts);
  printDatasetSummary(conflicts);
  printRepresentativeExamples(conflicts);
  printRowing005Comparison(conflicts);
}

main();
