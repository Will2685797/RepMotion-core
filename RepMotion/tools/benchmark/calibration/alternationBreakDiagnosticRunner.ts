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
type FilterStatus = "KEPT" | "REJECTED" | "NOT_REACHED";

type Rupture = {
  type: EventType;
  firstIndex: number;
  secondIndex: number;
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

const ROWING_005_RUPTURES: Rupture[] = [
  { type: "BOTTOM", firstIndex: 26, secondIndex: 133 },
  { type: "TOP", firstIndex: 245, secondIndex: 315 },
  { type: "BOTTOM", firstIndex: 331, secondIndex: 415 },
  { type: "TOP", firstIndex: 515, secondIndex: 601 },
];

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

function getOppositeType(type: EventType): EventType {
  return type === "BOTTOM" ? "TOP" : "BOTTOM";
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

function formatCalibrationReason(
  event: CalibrationDebugEvent | undefined,
): string {
  if (!event) {
    return "";
  }

  if (event.rejectedReason === "MIN_DISTANCE") {
    return event.selectionRule ?? "MIN_DISTANCE";
  }

  if (event.rejectedReason === "LOW_PROMINENCE") {
    return `LOW_PROMINENCE prominence=${event.prominence}`;
  }

  if (event.rejectedReason === "WEAK_DIRECTION_CHANGE") {
    return `WEAK_DIRECTION_CHANGE directionChange=${event.directionChange}`;
  }

  return event.rejectedReason ?? event.filter;
}

function getWinnerPosition(
  keptIndex: number | undefined,
  firstIndex: number,
  secondIndex: number,
): string {
  if (keptIndex === undefined) {
    return "";
  }

  if (keptIndex < firstIndex) {
    return "before";
  }

  if (keptIndex > secondIndex) {
    return "after";
  }

  if (keptIndex === firstIndex || keptIndex === secondIndex) {
    return "boundary";
  }

  return "between";
}

function formatSelectedChain(bottomIndexes: number[], topIndexes: number[]) {
  return [
    ...bottomIndexes.map((index) => ({ type: "BOTTOM" as const, index })),
    ...topIndexes.map((index) => ({ type: "TOP" as const, index })),
  ]
    .sort((left, right) => left.index - right.index)
    .map((event) => `${event.type === "BOTTOM" ? "B" : "T"}${event.index}`)
    .join(" -> ");
}

function buildFilterEventsByKey(debugEvents: CalibrationDebugEvent[]) {
  const eventsByKey = new Map<string, CalibrationDebugEvent[]>();

  for (const event of debugEvents) {
    const key = getCandidateKey(event.type, event.index);
    const events = eventsByKey.get(key) ?? [];
    events.push(event);
    eventsByKey.set(key, events);
  }

  return eventsByKey;
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

function formatCycleDecisions(
  type: EventType,
  index: number,
  eventsByKey: Map<string, CycleAnalyzerDebugEvent[]>,
): string {
  const events = eventsByKey.get(getCandidateKey(type, index)) ?? [];

  if (events.length === 0) {
    return "UNUSED";
  }

  return events.map((event) => `${event.action}:${event.reason}`).join(" | ");
}

function formatCycleImpact(
  rupture: Rupture,
  eventsByKey: Map<string, CycleAnalyzerDebugEvent[]>,
): string {
  return [
    `${rupture.type} ${rupture.firstIndex}: ${formatCycleDecisions(
      rupture.type,
      rupture.firstIndex,
      eventsByKey,
    )}`,
    `${rupture.type} ${rupture.secondIndex}: ${formatCycleDecisions(
      rupture.type,
      rupture.secondIndex,
      eventsByKey,
    )}`,
  ].join(" ; ");
}

function formatIntermediateCandidate(
  candidate: { type: EventType; index: number; value: number },
  filterEventsByKey: Map<string, CalibrationDebugEvent[]>,
  rupture: Rupture,
): string {
  const events =
    filterEventsByKey.get(getCandidateKey(candidate.type, candidate.index)) ??
    [];
  const firstRejection = getFirstRejection(events);
  const minDistanceRejection = getStageRejection(events, "MIN_DISTANCE");
  const conflict = minDistanceRejection
    ? ` conflict=${minDistanceRejection.conflictWithIndex}/${minDistanceRejection.conflictWithValue} kept=${minDistanceRejection.keptIndex}/${minDistanceRejection.keptValue} keptPosition=${getWinnerPosition(
        minDistanceRejection.keptIndex,
        rupture.firstIndex,
        rupture.secondIndex,
      )}`
    : "";

  return [
    `${candidate.type}${candidate.index} value=${candidate.value}`,
    `MIN_DISTANCE=${getStageStatus(events, "MIN_DISTANCE")}`,
    `PROMINENCE=${getStageStatus(events, "PROMINENCE")}`,
    `DIRECTION_CHANGE=${getStageStatus(events, "DIRECTION_CHANGE")}`,
    `reason=${formatCalibrationReason(firstRejection) || "none"}`,
    conflict,
  ]
    .filter(Boolean)
    .join(" ");
}

function printRowing005Ruptures(dataset: BenchmarkDataset) {
  const expectedReps = dataset.performedReps ?? dataset.expectedReps ?? 0;
  const calibration = calculateCalibration(
    dataset.samples,
    undefined,
    CALIBRATION_PARAMETERS,
  );
  const debug = calibration.debug;

  if (!debug) {
    console.warn(`No calibration debug for ${dataset.name}`);
    return;
  }

  const axisValues = dataset.samples.map((sample) => sample[calibration.axis]);
  const filterEventsByKey = buildFilterEventsByKey(debug.filterDebugEvents);
  const cycleAnalysis = analyzeBottomTopBottomCycles(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    expectedReps,
    CYCLE_ANALYZER_PARAMETERS,
  );
  const cycleDebugByKey = buildCycleDebugByKey(cycleAnalysis.debugEvents);

  const rows = ROWING_005_RUPTURES.map((rupture) => {
    const oppositeType = getOppositeType(rupture.type);
    const intermediateCandidates = debug.rawCandidateDebugEvents.filter(
      (candidate) =>
        candidate.type === oppositeType &&
        candidate.index > rupture.firstIndex &&
        candidate.index < rupture.secondIndex,
    );

    return {
      rupture: `${rupture.type} ${rupture.firstIndex} -> ${rupture.type} ${rupture.secondIndex}`,
      firstSelected: `${rupture.type}${rupture.firstIndex} value=${axisValues[rupture.firstIndex]}`,
      secondSelected: `${rupture.type}${rupture.secondIndex} value=${axisValues[rupture.secondIndex]}`,
      intermediateRawOppositeCandidates: intermediateCandidates
        .map((candidate) =>
          formatIntermediateCandidate(
            candidate,
            filterEventsByKey,
            rupture,
          ),
        )
        .join(" || "),
      localInsertionWouldAlternate:
        intermediateCandidates.length > 0
          ? `${oppositeType} candidate exists between same-type Selected bounds`
          : "no opposite RAW candidate between bounds",
      finalSequenceConsequence: `Selected sequence keeps ${rupture.type}${rupture.firstIndex} -> ${rupture.type}${rupture.secondIndex} with no selected ${oppositeType} between them`,
      cycleAnalyzerImpact: formatCycleImpact(rupture, cycleDebugByKey),
    };
  });

  const minDistanceMechanismCount = rows.filter((row) =>
    row.intermediateRawOppositeCandidates.includes("MIN_DISTANCE=REJECTED"),
  ).length;

  console.log("\n=== rowing_5reps_005 Alternation Breaks ===\n");
  console.log("Selected sequence:");
  console.log(formatSelectedChain(debug.selectedBottomIndexes, debug.selectedTopIndexes));
  console.log("Cycle Analyzer chain:");
  console.log(cycleAnalysis.chain);
  console.table(rows);

  console.log("\n=== rowing_5reps_005 Factual Summary ===\n");
  console.table([
    {
      breaksAnalyzed: rows.length,
      breaksWithIntermediateOppositeRawRejectedByMinDistance:
        minDistanceMechanismCount,
      breaksWithOtherExplanation: rows.length - minDistanceMechanismCount,
      simulatedReps: cycleAnalysis.simulatedReps,
      expectedReps,
      status: cycleAnalysis.status,
    },
  ]);
}

function formatCycleEventDecision(
  type: EventType,
  index: number,
  eventsByKey: Map<string, CycleAnalyzerDebugEvent[]>,
): string {
  const decisions = eventsByKey.get(getCandidateKey(type, index)) ?? [];

  return decisions.length === 0
    ? "UNUSED"
    : decisions.map((event) => `${event.action}:${event.reason}`).join(" | ");
}

function formatCleanCycleRow(
  rep: ReconstructedRep,
  eventsByKey: Map<string, CycleAnalyzerDebugEvent[]>,
) {
  const bottomStartDecision = formatCycleEventDecision(
    "BOTTOM",
    rep.bottomStart,
    eventsByKey,
  );
  const topDecision = formatCycleEventDecision("TOP", rep.top, eventsByKey);
  const bottomEndDecision = formatCycleEventDecision(
    "BOTTOM",
    rep.bottomEnd,
    eventsByKey,
  );

  return {
    repNumber: rep.repNumber,
    sequence: `B${rep.bottomStart} -> T${rep.top} -> B${rep.bottomEnd}`,
    selectedPresence: "all three events are Selected",
    chronologicalOrder: "B-T-B",
    bottomStartDecision,
    topDecision,
    bottomEndDecision,
    hasReplacedOrRejected:
      [bottomStartDecision, topDecision, bottomEndDecision].some(
        (decision) =>
          decision.includes("REPLACED") || decision.includes("REJECTED"),
      )
        ? "YES"
        : "NO",
    concentricDuration: rep.concentricDuration,
    eccentricDuration: rep.eccentricDuration,
    totalDuration: rep.totalDuration,
    durationChecks: [
      `concentric ${rep.concentricDuration} >= ${CYCLE_ANALYZER_PARAMETERS.minConcentricDuration}`,
      `eccentric ${rep.eccentricDuration} >= ${CYCLE_ANALYZER_PARAMETERS.minEccentricDuration}`,
      `total ${rep.totalDuration} >= ${CYCLE_ANALYZER_PARAMETERS.minRepDuration}`,
    ].join(" ; "),
  };
}

function printRowing002CleanCycles(dataset: BenchmarkDataset) {
  const expectedReps = dataset.performedReps ?? dataset.expectedReps ?? 0;
  const calibration = calculateCalibration(
    dataset.samples,
    undefined,
    CALIBRATION_PARAMETERS,
  );
  const debug = calibration.debug;

  if (!debug) {
    console.warn(`No calibration debug for ${dataset.name}`);
    return;
  }

  const cycleAnalysis = analyzeBottomTopBottomCycles(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    expectedReps,
    CYCLE_ANALYZER_PARAMETERS,
  );
  const cycleDebugByKey = buildCycleDebugByKey(cycleAnalysis.debugEvents);

  console.log("\n=== rowing_5reps_002 Clean B-T-B Transitions ===\n");
  console.log("Selected sequence:");
  console.log(formatSelectedChain(debug.selectedBottomIndexes, debug.selectedTopIndexes));
  console.log("Cycle Analyzer chain:");
  console.log(cycleAnalysis.chain);
  console.table(
    cycleAnalysis.reconstructedReps.map((rep) =>
      formatCleanCycleRow(rep, cycleDebugByKey),
    ),
  );

  console.log("\n=== rowing_5reps_002 Factual Summary ===\n");
  console.table([
    {
      cyclesAnalyzed: cycleAnalysis.reconstructedReps.length,
      cyclesWithAllThreeEventsAccepted: cycleAnalysis.reconstructedReps.filter(
        (rep) =>
          formatCycleEventDecision("BOTTOM", rep.bottomStart, cycleDebugByKey)
            .includes("ACCEPTED") &&
          formatCycleEventDecision("TOP", rep.top, cycleDebugByKey).includes(
            "ACCEPTED",
          ) &&
          formatCycleEventDecision("BOTTOM", rep.bottomEnd, cycleDebugByKey)
            .includes("ACCEPTED"),
      ).length,
      replacedOrRejectedAmongCycleEvents: cycleAnalysis.debugEvents.filter(
        (event) => event.action !== "ACCEPTED",
      ).length,
      simulatedReps: cycleAnalysis.simulatedReps,
      expectedReps,
      status: cycleAnalysis.status,
    },
  ]);
}

function main() {
  const datasets = loadDatasets();
  const rowing005 = datasets.find(
    (dataset) => dataset.name === "rowing_5reps_005.json",
  );
  const rowing002 = datasets.find(
    (dataset) => dataset.name === "rowing_5reps_002.json",
  );

  console.log("\n=== Alternation Break Diagnostic Fixed Parameters ===\n");
  console.log("Calibration:", CALIBRATION_PARAMETERS);
  console.log("Cycle Analyzer:", CYCLE_ANALYZER_PARAMETERS);

  if (rowing005) {
    printRowing005Ruptures(rowing005);
  } else {
    console.warn("Dataset not found: rowing_5reps_005.json");
  }

  if (rowing002) {
    printRowing002CleanCycles(rowing002);
  } else {
    console.warn("Dataset not found: rowing_5reps_002.json");
  }
}

main();
