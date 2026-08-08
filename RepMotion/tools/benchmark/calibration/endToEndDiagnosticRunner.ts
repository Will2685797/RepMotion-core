import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDataset,
  type CalibrationDebugEvent,
  type RawCalibrationCandidateDebug,
} from "../../../mobile/RepMotion/analytics/calibration";
import {
  analyzeBottomTopBottomCycles,
  type CycleAnalyzerDebugEvent,
  type ReconstructedRep,
} from "../../calibration-runner/cycleAnalyzer";

type BenchmarkDataset = CalibrationDataset & { name: string };
type EventType = "BOTTOM" | "TOP";
type FilterStatus = "KEPT" | "REJECTED" | "NOT_REACHED";

type SelectedEvent = {
  type: EventType;
  index: number;
  value: number;
  location: "BEGINNING" | "MIDDLE" | "END";
};

const DATASET_NAMES = ["rowing_5reps_005.json", "rowing_5reps_002.json"];

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

function getEventLocation(
  index: number,
  sampleCount: number,
): SelectedEvent["location"] {
  const ratio = index / Math.max(sampleCount - 1, 1);

  if (ratio < 0.25) {
    return "BEGINNING";
  }

  if (ratio > 0.75) {
    return "END";
  }

  return "MIDDLE";
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

function formatSelectedChain(events: SelectedEvent[]): string {
  return events
    .map((event) => `${event.type === "BOTTOM" ? "B" : "T"}(${event.index})`)
    .join(" -> ");
}

function formatCycleDebugDecision(
  events: CycleAnalyzerDebugEvent[],
): string {
  if (events.length === 0) {
    return "UNUSED";
  }

  return events.map((event) => `${event.action}:${event.reason}`).join(" | ");
}

function getRepNumbersUsingEvent(reps: ReconstructedRep[], index: number): string {
  return reps
    .filter(
      (rep) =>
        rep.bottomStart === index || rep.top === index || rep.bottomEnd === index,
    )
    .map((rep) => rep.repNumber)
    .join(", ");
}

function getSelectedEvents(
  dataset: BenchmarkDataset,
  selectedBottomIndexes: number[],
  selectedTopIndexes: number[],
  valuesByIndex: Map<number, number>,
): SelectedEvent[] {
  return [
    ...selectedBottomIndexes.map((index) => ({
      type: "BOTTOM" as const,
      index,
      value: valuesByIndex.get(index) ?? 0,
      location: getEventLocation(index, dataset.sampleCount),
    })),
    ...selectedTopIndexes.map((index) => ({
      type: "TOP" as const,
      index,
      value: valuesByIndex.get(index) ?? 0,
      location: getEventLocation(index, dataset.sampleCount),
    })),
  ].sort((left, right) => left.index - right.index);
}

function buildCycleChainEvents(chain: string): Set<string> {
  const keys = new Set<string>();
  const matches = chain.matchAll(/([BT])\((\d+)\)/g);

  for (const match of matches) {
    keys.add(`${match[1] === "B" ? "BOTTOM" : "TOP"}:${match[2]}`);
  }

  return keys;
}

function summarizeResponsibleEvents(
  expectedReps: number,
  simulatedReps: number,
  cycleDebugEvents: CycleAnalyzerDebugEvent[],
): string {
  if (simulatedReps === expectedReps) {
    return "No extra or missing repetition: simulatedReps equals expectedReps.";
  }

  const replacedEvents = cycleDebugEvents.filter(
    (event) => event.action === "REPLACED",
  );
  const rejectedEvents = cycleDebugEvents.filter(
    (event) => event.action === "REJECTED",
  );

  if (replacedEvents.length === 0 && rejectedEvents.length === 0) {
    return "No Cycle Analyzer REJECTED or REPLACED event explains the difference directly.";
  }

  const details = [...replacedEvents, ...rejectedEvents].map(
    (event) => `${event.type} ${event.index}: ${event.action} ${event.reason}`,
  );

  return details.join(" | ");
}

function printDatasetDiagnostic(dataset: BenchmarkDataset) {
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
  const valuesByIndex = new Map(axisValues.map((value, index) => [index, value]));
  const rawByKey = new Map<string, RawCalibrationCandidateDebug>();
  const filterEventsByKey = new Map<string, CalibrationDebugEvent[]>();

  for (const rawEvent of debug.rawCandidateDebugEvents) {
    rawByKey.set(getCandidateKey(rawEvent.type, rawEvent.index), rawEvent);
  }

  for (const filterEvent of debug.filterDebugEvents) {
    const key = getCandidateKey(filterEvent.type, filterEvent.index);
    const events = filterEventsByKey.get(key) ?? [];
    events.push(filterEvent);
    filterEventsByKey.set(key, events);
  }

  const selectedEvents = getSelectedEvents(
    dataset,
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    valuesByIndex,
  );
  const selectedKeys = new Set(
    selectedEvents.map((event) => getCandidateKey(event.type, event.index)),
  );

  const cycleAnalysis = analyzeBottomTopBottomCycles(
    debug.selectedBottomIndexes,
    debug.selectedTopIndexes,
    expectedReps,
    CYCLE_ANALYZER_PARAMETERS,
  );
  const cycleChainKeys = buildCycleChainEvents(cycleAnalysis.chain);
  const cycleDebugByKey = new Map<string, CycleAnalyzerDebugEvent[]>();

  for (const event of cycleAnalysis.debugEvents) {
    const key = getCandidateKey(event.type, event.index);
    const events = cycleDebugByKey.get(key) ?? [];
    events.push(event);
    cycleDebugByKey.set(key, events);
  }

  const chronologicalRows = debug.rawCandidateDebugEvents
    .sort((left, right) => left.index - right.index)
    .map((candidate) => {
      const key = getCandidateKey(candidate.type, candidate.index);
      const filterEvents = filterEventsByKey.get(key) ?? [];
      const firstRejection = getFirstRejection(filterEvents);
      const cycleDebugEvents = cycleDebugByKey.get(key) ?? [];

      return {
        index: candidate.index,
        type: candidate.type,
        value: candidate.value,
        rawStatus: rawByKey.has(key) ? "RAW" : "",
        minDistance: getStageStatus(filterEvents, "MIN_DISTANCE"),
        prominence: getStageStatus(filterEvents, "PROMINENCE"),
        directionChange: getStageStatus(filterEvents, "DIRECTION_CHANGE"),
        selectedFinal: selectedKeys.has(key) ? "SELECTED" : "NOT_SELECTED",
        inCycleAnalyzerInput: selectedKeys.has(key) ? "YES" : "NO",
        inCycleFinalChain: cycleChainKeys.has(key) ? "YES" : "NO",
        cycleDecision: formatCycleDebugDecision(cycleDebugEvents),
        calibrationRejectReason: formatCalibrationReason(firstRejection),
        repNumber: getRepNumbersUsingEvent(
          cycleAnalysis.reconstructedReps,
          candidate.index,
        ),
        location: getEventLocation(candidate.index, dataset.sampleCount),
      };
    });

  const unusedSelectedEvents = selectedEvents.filter(
    (event) => !cycleChainKeys.has(getCandidateKey(event.type, event.index)),
  );

  console.log(`\n\n=== End-To-End Diagnostic: ${dataset.name} ===\n`);
  console.log("Calibration parameters:");
  console.log(CALIBRATION_PARAMETERS);
  console.log("Cycle Analyzer parameters:");
  console.log(CYCLE_ANALYZER_PARAMETERS);

  console.log("\n--- Calibration Selected Counts ---\n");
  console.table([
    {
      expectedReps,
      expectedBottoms: expectedReps + 1,
      expectedTops: expectedReps,
      selectedBottoms: debug.selectedBottomIndexes.length,
      selectedTops: debug.selectedTopIndexes.length,
      rawBottoms: debug.rawBottomIndexes.length,
      rawTops: debug.rawTopIndexes.length,
    },
  ]);

  console.log("\n--- Selected Sequence ---\n");
  console.log(formatSelectedChain(selectedEvents));
  console.table(selectedEvents);

  console.log("\n--- Exact Cycle Analyzer Input ---\n");
  console.table([
    {
      bottomIndexes: debug.selectedBottomIndexes.join(", "),
      topIndexes: debug.selectedTopIndexes.join(", "),
      expectedReps,
    },
  ]);

  console.log("\n--- Cycle Analyzer Result ---\n");
  console.table([
    {
      simulatedReps: cycleAnalysis.simulatedReps,
      expectedReps: cycleAnalysis.expectedReps,
      status: cycleAnalysis.status,
      chainLength: cycleAnalysis.chainLength,
      usedBottoms: cycleAnalysis.usedBottoms,
      usedTops: cycleAnalysis.usedTops,
      ignoredEvents: cycleAnalysis.ignoredEvents,
      chain: cycleAnalysis.chain,
    },
  ]);

  console.log("\n--- Reconstructed Bottom -> Top -> Bottom Cycles ---\n");
  console.table(cycleAnalysis.reconstructedReps);

  console.log("\n--- Alternated Durations In Final Cycle Chain ---\n");
  console.table(
    cycleAnalysis.reconstructedReps.map((rep) => ({
      repNumber: rep.repNumber,
      bottomStart: rep.bottomStart,
      top: rep.top,
      bottomEnd: rep.bottomEnd,
      bottomToTopSamples: rep.concentricDuration,
      topToBottomSamples: rep.eccentricDuration,
      totalDurationSamples: rep.totalDuration,
    })),
  );

  console.log("\n--- Selected Events Not Used In Final Cycle Chain ---\n");
  console.table(unusedSelectedEvents);

  console.log("\n--- Cycle Analyzer Debug Events ---\n");
  console.table(cycleAnalysis.debugEvents);

  console.log("\n--- Cycle Analyzer Rejected Or Replaced Events ---\n");
  console.table(
    cycleAnalysis.debugEvents.filter((event) => event.action !== "ACCEPTED"),
  );

  console.log("\n--- Chronological RAW -> Selected -> Cycle Analyzer Trace ---\n");
  console.table(chronologicalRows);

  console.log("\n--- Objective Difference Explanation From Logs ---\n");
  console.log(
    summarizeResponsibleEvents(
      expectedReps,
      cycleAnalysis.simulatedReps,
      cycleAnalysis.debugEvents,
    ),
  );
}

function main() {
  const datasets = loadDatasets();

  for (const datasetName of DATASET_NAMES) {
    const dataset = datasets.find((candidate) => candidate.name === datasetName);

    if (!dataset) {
      console.warn(`Dataset not found: ${datasetName}`);
      continue;
    }

    printDatasetDiagnostic(dataset);
  }
}

main();
