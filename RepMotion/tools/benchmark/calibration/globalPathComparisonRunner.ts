import fs from "fs";
import path from "path";
import {
  calculateCalibration,
  type CalibrationDataset,
  type CalibrationParameters,
} from "../../../mobile/RepMotion/analytics/calibration";
import {
  analyzeBottomTopBottomCycles,
  type SegmentationAnalysisResult,
  type SegmentationEvent,
} from "../../calibration-runner/cycleAnalyzer";

type BenchmarkDataset = CalibrationDataset & {
  datasetName: string;
};

type Candidate = SegmentationEvent & {
  value: number;
};

type PathReplay = {
  finalStatesCount: number;
  selectedChain: Candidate[];
  score: number | null;
};

type Outcome =
  | "IMPROVED"
  | "UNCHANGED"
  | "REGRESSED"
  | "GLOBAL_PATH_NOT_FOUND";

const CALIBRATION_PARAMETERS = {
  rawDetectionStrategy: "local_extrema",
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
} as const satisfies CalibrationParameters;

const CYCLE_ANALYZER_PARAMETERS = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
};

function loadDatasets(): BenchmarkDataset[] {
  const datasetsRoot = path.resolve(
    __dirname,
    "../../../datasets/calibration",
  );
  const datasets: BenchmarkDataset[] = [];

  for (const exercise of fs.readdirSync(datasetsRoot).sort()) {
    const exerciseDirectory = path.join(datasetsRoot, exercise);

    if (!fs.statSync(exerciseDirectory).isDirectory()) {
      continue;
    }

    for (const fileName of fs.readdirSync(exerciseDirectory).sort()) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const dataset = JSON.parse(
        fs.readFileSync(path.join(exerciseDirectory, fileName), "utf8"),
      ) as CalibrationDataset;

      datasets.push({ ...dataset, datasetName: fileName });
    }
  }

  return datasets;
}

function eventKey(event: SegmentationEvent): string {
  return `${event.type}:${event.index}`;
}

function uniqueEvents<T extends SegmentationEvent>(events: T[]): T[] {
  const byKey = new Map<string, T>();

  for (const event of events) {
    byKey.set(eventKey(event), event);
  }

  return [...byKey.values()];
}

function sortedEvents(
  bottomIndexes: number[],
  topIndexes: number[],
): SegmentationEvent[] {
  return [
    ...bottomIndexes.map((index) => ({
      type: "BOTTOM" as const,
      index,
    })),
    ...topIndexes.map((index) => ({ type: "TOP" as const, index })),
  ].sort((left, right) => left.index - right.index);
}

function formatSequence(events: SegmentationEvent[]): string {
  return events
    .map((event) => `${event.type === "BOTTOM" ? "B" : "T"}(${event.index})`)
    .join(" -> ");
}

function countAlternationBreaks(events: SegmentationEvent[]): number {
  let count = 0;

  for (let index = 1; index < events.length; index += 1) {
    if (events[index - 1].type === events[index].type) {
      count += 1;
    }
  }

  return count;
}

function countActions(analysis: SegmentationAnalysisResult) {
  return {
    ignored: analysis.ignoredEvents,
    accepted: analysis.debugEvents.filter(
      (event) => event.action === "ACCEPTED",
    ).length,
    replaced: analysis.debugEvents.filter(
      (event) => event.action === "REPLACED",
    ).length,
    rejected: analysis.debugEvents.filter(
      (event) => event.action === "REJECTED",
    ).length,
  };
}

// Exact read-only replay of the currently implemented V1 DP. It supplies the
// terminal-state count that calibration debug does not expose.
function replayGlobalPath(
  candidates: Candidate[],
  expectedReps: number,
): PathReplay {
  type State = {
    score: number;
    predecessorKey: string | null;
    candidateIndex: number;
    lastBottomIndex: number | null;
  };

  const pooledCandidates = [...candidates].sort(
    (left, right) => left.index - right.index,
  );
  const targetChainLength = expectedReps * 2 + 1;

  if (pooledCandidates.length < targetChainLength) {
    return { finalStatesCount: 0, selectedChain: [], score: null };
  }

  const stateStore = new Map<string, State>();
  let currentStates = new Map<string, State>();
  const initialKey = "0:-1:-1";
  const initialState: State = {
    score: 0,
    predecessorKey: null,
    candidateIndex: -1,
    lastBottomIndex: null,
  };
  currentStates.set(initialKey, initialState);
  stateStore.set(initialKey, initialState);

  for (let step = 0; step < targetChainLength; step += 1) {
    const requiredType = step % 2 === 0 ? "BOTTOM" : "TOP";
    const nextStates = new Map<string, State>();

    for (const [stateKey, state] of currentStates) {
      const previous =
        state.candidateIndex >= 0
          ? pooledCandidates[state.candidateIndex]
          : null;

      for (
        let candidateIndex = 0;
        candidateIndex < pooledCandidates.length;
        candidateIndex += 1
      ) {
        const candidate = pooledCandidates[candidateIndex];

        if (
          candidate.type !== requiredType ||
          (previous && candidate.index <= previous.index)
        ) {
          continue;
        }

        if (previous) {
          const transitionDuration = candidate.index - previous.index;

          if (
            (requiredType === "TOP" &&
              transitionDuration <
                CYCLE_ANALYZER_PARAMETERS.minConcentricDuration) ||
            (requiredType === "BOTTOM" &&
              transitionDuration <
                CYCLE_ANALYZER_PARAMETERS.minEccentricDuration) ||
            (requiredType === "BOTTOM" &&
              state.lastBottomIndex !== null &&
              candidate.index - state.lastBottomIndex <
                CYCLE_ANALYZER_PARAMETERS.minRepDuration)
          ) {
            continue;
          }
        }

        const nextLastBottomIndex =
          requiredType === "BOTTOM"
            ? candidate.index
            : state.lastBottomIndex;
        const nextScore =
          state.score +
          (candidate.type === "BOTTOM" ? -candidate.value : candidate.value);
        const nextKey = `${step + 1}:${candidateIndex}:${nextLastBottomIndex ?? -1}`;
        const existing = nextStates.get(nextKey);

        if (!existing || nextScore > existing.score) {
          const nextState: State = {
            score: nextScore,
            predecessorKey: stateKey,
            candidateIndex,
            lastBottomIndex: nextLastBottomIndex,
          };
          nextStates.set(nextKey, nextState);
          stateStore.set(nextKey, nextState);
        }
      }
    }

    currentStates = nextStates;

    if (currentStates.size === 0) {
      break;
    }
  }

  let bestKey: string | null = null;
  let bestState: State | null = null;

  for (const [key, state] of currentStates) {
    if (!bestState || state.score > bestState.score) {
      bestKey = key;
      bestState = state;
    }
  }

  if (!bestKey || !bestState) {
    return { finalStatesCount: 0, selectedChain: [], score: null };
  }

  const candidateIndexes: number[] = [];
  let cursor: string | null = bestKey;

  while (cursor) {
    const state = stateStore.get(cursor);

    if (!state) {
      break;
    }

    if (state.candidateIndex >= 0) {
      candidateIndexes.push(state.candidateIndex);
    }

    cursor = state.predecessorKey;
  }

  candidateIndexes.reverse();

  return {
    finalStatesCount: currentStates.size,
    selectedChain: candidateIndexes.map((index) => pooledCandidates[index]),
    score: bestState.score,
  };
}

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function main(): void {
  const datasets = loadDatasets();
  const integrityErrors: string[] = [];

  if (datasets.length !== 10) {
    integrityErrors.push(
      `Expected 10 datasets, found ${datasets.length}.`,
    );
  }

  const results = datasets.map((dataset) => {
    const expectedReps = dataset.performedReps ?? dataset.expectedReps;
    const currentCalibration = calculateCalibration(
      dataset.samples,
      undefined,
      {
        ...CALIBRATION_PARAMETERS,
        minDistanceStrategy: "current",
        selectionStrategy: "current_filters",
      },
      expectedReps,
    );
    const globalCalibration = calculateCalibration(
      dataset.samples,
      undefined,
      {
        ...CALIBRATION_PARAMETERS,
        selectionStrategy: "global_alternating_path",
      },
      expectedReps,
    );
    const currentDebug = currentCalibration.debug;
    const globalDebug = globalCalibration.debug;

    if (!currentDebug || !globalDebug) {
      integrityErrors.push(`${dataset.datasetName}: missing calibration debug.`);
    }

    const currentEvents = sortedEvents(
      currentDebug?.selectedBottomIndexes ?? [],
      currentDebug?.selectedTopIndexes ?? [],
    );
    const globalEvents = sortedEvents(
      globalDebug?.selectedBottomIndexes ?? [],
      globalDebug?.selectedTopIndexes ?? [],
    );
    const currentAnalysis = analyzeBottomTopBottomCycles(
      currentDebug?.selectedBottomIndexes ?? [],
      currentDebug?.selectedTopIndexes ?? [],
      expectedReps,
      CYCLE_ANALYZER_PARAMETERS,
    );
    const globalAnalysis = analyzeBottomTopBottomCycles(
      globalDebug?.selectedBottomIndexes ?? [],
      globalDebug?.selectedTopIndexes ?? [],
      expectedReps,
      CYCLE_ANALYZER_PARAMETERS,
    );
    const currentActions = countActions(currentAnalysis);
    const globalActions = countActions(globalAnalysis);
    const eligibleCandidates = uniqueEvents(
      (globalDebug?.filterDebugEvents ?? [])
        .filter(
          (event) => event.filter === "DIRECTION_CHANGE" && event.kept,
        )
        .map((event) => ({
          type: event.type,
          index: event.index,
          value: event.value,
        })),
    );
    const replay = replayGlobalPath(eligibleCandidates, expectedReps);
    const globalPathFound =
      (globalDebug?.selectedChain?.length ?? 0) === expectedReps * 2 + 1;
    const currentKeys = new Set(currentEvents.map(eventKey));
    const globalKeys = new Set(globalEvents.map(eventKey));
    const commonSelectedEventsCount = [...currentKeys].filter((key) =>
      globalKeys.has(key),
    ).length;
    const currentOnlyEventsCount =
      currentKeys.size - commonSelectedEventsCount;
    const globalOnlyEventsCount =
      globalKeys.size - commonSelectedEventsCount;
    const unionCount =
      currentKeys.size + globalKeys.size - commonSelectedEventsCount;
    const selectedEventOverlapRate =
      unionCount === 0 ? 1 : commonSelectedEventsCount / unionCount;
    const currentRepDifference = Math.abs(
      currentAnalysis.simulatedReps - expectedReps,
    );
    const globalRepDifference = Math.abs(
      globalAnalysis.simulatedReps - expectedReps,
    );
    const outcome: Outcome = !globalPathFound
      ? "GLOBAL_PATH_NOT_FOUND"
      : globalRepDifference < currentRepDifference
        ? "IMPROVED"
        : globalRepDifference > currentRepDifference
          ? "REGRESSED"
          : "UNCHANGED";

    if (
      dataset.datasetName === "rowing_5reps_005.json" &&
      currentAnalysis.simulatedReps !== 2
    ) {
      integrityErrors.push(
        `${dataset.datasetName}: current_filters baseline expected 2 reps, got ${currentAnalysis.simulatedReps}.`,
      );
    }

    if (
      dataset.datasetName === "rowing_5reps_002.json" &&
      currentAnalysis.simulatedReps !== 5
    ) {
      integrityErrors.push(
        `${dataset.datasetName}: current_filters baseline expected 5 reps, got ${currentAnalysis.simulatedReps}.`,
      );
    }

    if (globalPathFound) {
      const expectedTypes = globalEvents.every(
        (event, index) =>
          event.type === (index % 2 === 0 ? "BOTTOM" : "TOP"),
      );
      const indexesIncrease = globalEvents.every(
        (event, index) =>
          index === 0 || globalEvents[index - 1].index < event.index,
      );
      const unique = new Set(globalEvents.map(eventKey)).size;
      const validDurations = globalAnalysis.reconstructedReps.every(
        (rep) =>
          rep.concentricDuration >=
            CYCLE_ANALYZER_PARAMETERS.minConcentricDuration &&
          rep.eccentricDuration >=
            CYCLE_ANALYZER_PARAMETERS.minEccentricDuration &&
          rep.totalDuration >= CYCLE_ANALYZER_PARAMETERS.minRepDuration,
      );
      const replaySequence = formatSequence(replay.selectedChain);
      const implementationSequence = formatSequence(globalEvents);

      if (
        globalEvents.length !== expectedReps * 2 + 1 ||
        !expectedTypes ||
        globalEvents.filter((event) => event.type === "BOTTOM").length !==
          expectedReps + 1 ||
        globalEvents.filter((event) => event.type === "TOP").length !==
          expectedReps ||
        !indexesIncrease ||
        unique !== globalEvents.length ||
        !validDurations
      ) {
        integrityErrors.push(
          `${dataset.datasetName}: global chain structural or duration check failed.`,
        );
      }

      if (
        replaySequence !== implementationSequence ||
        replay.score !== globalDebug?.selectionScore
      ) {
        integrityErrors.push(
          `${dataset.datasetName}: read-only DP replay differs from calibration output.`,
        );
      }
    }

    return {
      datasetName: dataset.datasetName,
      exercise: dataset.exercise,
      expectedReps,
      currentSelectedBottomsCount: currentDebug?.selectedBottoms ?? 0,
      currentSelectedTopsCount: currentDebug?.selectedTops ?? 0,
      currentSelectedSequence: formatSequence(currentEvents),
      currentAlternationBreakCount: countAlternationBreaks(currentEvents),
      currentSimulatedReps: currentAnalysis.simulatedReps,
      currentRepDifference,
      currentCycleAnalyzerStatus: currentAnalysis.status,
      currentIgnoredEventsCount: currentActions.ignored,
      currentAcceptedCount: currentActions.accepted,
      currentReplacedCount: currentActions.replaced,
      currentRejectedCount: currentActions.rejected,
      globalPathStatus: globalPathFound
        ? ("GLOBAL_PATH_FOUND" as const)
        : ("GLOBAL_PATH_NOT_FOUND" as const),
      globalEligibleBottomsCount: eligibleCandidates.filter(
        (event) => event.type === "BOTTOM",
      ).length,
      globalEligibleTopsCount: eligibleCandidates.filter(
        (event) => event.type === "TOP",
      ).length,
      globalEligibleCandidatesCount: eligibleCandidates.length,
      globalSelectedBottomsCount: globalDebug?.selectedBottoms ?? 0,
      globalSelectedTopsCount: globalDebug?.selectedTops ?? 0,
      globalSelectedSequence: formatSequence(globalEvents),
      globalAlternationBreakCount: countAlternationBreaks(globalEvents),
      globalPathScore: globalPathFound
        ? (globalDebug?.selectionScore ?? null)
        : null,
      globalFinalStatesCount: replay.finalStatesCount,
      globalUnselectedEligibleCandidatesCount:
        eligibleCandidates.length - globalEvents.length,
      globalSimulatedReps: globalAnalysis.simulatedReps,
      globalRepDifference,
      globalCycleAnalyzerStatus: globalAnalysis.status,
      globalIgnoredEventsCount: globalActions.ignored,
      globalAcceptedCount: globalActions.accepted,
      globalReplacedCount: globalActions.replaced,
      globalRejectedCount: globalActions.rejected,
      commonSelectedEventsCount,
      currentOnlyEventsCount,
      globalOnlyEventsCount,
      selectedEventOverlapRate,
      repDifferenceDelta: globalRepDifference - currentRepDifference,
      outcome,
      globalAnalysis,
    };
  });

  if (integrityErrors.length > 0) {
    console.error("DATA_INTEGRITY_ERROR");
    console.table(integrityErrors.map((error) => ({ error })));
    process.exitCode = 1;
    return;
  }

  console.log("\n=== MAIN DATASET COMPARISON (10 DATASETS) ===\n");
  console.table(
    results.map(({ globalAnalysis: _globalAnalysis, ...result }) => ({
      ...result,
      selectedEventOverlapRate: result.selectedEventOverlapRate.toFixed(4),
    })),
  );

  const aggregate = (prefix: "current" | "global") => ({
    totalRepDifference: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentRepDifference
          : result.globalRepDifference),
      0,
    ),
    datasetsExactRepCount: results.filter(
      (result) =>
        (prefix === "current"
          ? result.currentRepDifference
          : result.globalRepDifference) === 0,
    ).length,
    datasetsMissing: results.filter(
      (result) =>
        (prefix === "current"
          ? result.currentCycleAnalyzerStatus
          : result.globalCycleAnalyzerStatus) === "MISSING",
    ).length,
    datasetsTooMany: results.filter(
      (result) =>
        (prefix === "current"
          ? result.currentCycleAnalyzerStatus
          : result.globalCycleAnalyzerStatus) === "TOO_MANY",
    ).length,
    avgSimulatedReps: average(
      results.map((result) =>
        prefix === "current"
          ? result.currentSimulatedReps
          : result.globalSimulatedReps,
      ),
    ),
    totalAlternationBreaks: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentAlternationBreakCount
          : result.globalAlternationBreakCount),
      0,
    ),
    totalIgnoredEvents: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentIgnoredEventsCount
          : result.globalIgnoredEventsCount),
      0,
    ),
    totalAccepted: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentAcceptedCount
          : result.globalAcceptedCount),
      0,
    ),
    totalReplaced: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentReplacedCount
          : result.globalReplacedCount),
      0,
    ),
    totalRejected: results.reduce(
      (sum, result) =>
        sum +
        (prefix === "current"
          ? result.currentRejectedCount
          : result.globalRejectedCount),
      0,
    ),
  });

  console.log("\n=== CURRENT_FILTERS AGGREGATES ===\n");
  console.table([aggregate("current")]);

  console.log("\n=== GLOBAL_ALTERNATING_PATH AGGREGATES ===\n");
  console.table([
    {
      ...aggregate("global"),
      globalPathFoundCount: results.filter(
        (result) => result.globalPathStatus === "GLOBAL_PATH_FOUND",
      ).length,
      globalPathNotFoundCount: results.filter(
        (result) => result.globalPathStatus === "GLOBAL_PATH_NOT_FOUND",
      ).length,
      avgEligibleCandidatesCount: average(
        results.map((result) => result.globalEligibleCandidatesCount),
      ),
      avgGlobalFinalStatesCount: average(
        results.map((result) => result.globalFinalStatesCount),
      ),
      avgSelectedEventOverlapRate: average(
        results.map((result) => result.selectedEventOverlapRate),
      ).toFixed(4),
    },
  ]);

  const outcomes: Outcome[] = [
    "IMPROVED",
    "UNCHANGED",
    "REGRESSED",
    "GLOBAL_PATH_NOT_FOUND",
  ];
  const datasetsForOutcome = (outcome: Outcome) =>
    results
      .filter((result) => result.outcome === outcome)
      .map((result) => result.datasetName)
      .join(", ");

  console.log("\n=== GLOBAL COMPARISON ===\n");
  console.table([
    {
      improvedDatasetsCount: results.filter(
        (result) => result.outcome === "IMPROVED",
      ).length,
      unchangedDatasetsCount: results.filter(
        (result) => result.outcome === "UNCHANGED",
      ).length,
      regressedDatasetsCount: results.filter(
        (result) => result.outcome === "REGRESSED",
      ).length,
      globalPathNotFoundCount: results.filter(
        (result) => result.outcome === "GLOBAL_PATH_NOT_FOUND",
      ).length,
      totalRepDifferenceDelta: results.reduce(
        (sum, result) => sum + result.repDifferenceDelta,
        0,
      ),
    },
  ]);
  console.table(
    outcomes.map((outcome) => ({
      outcome,
      datasets: datasetsForOutcome(outcome),
    })),
  );

  console.log("\n=== GLOBAL CHAIN REP DURATIONS ===\n");

  for (const result of results.filter(
    (candidate) => candidate.globalPathStatus === "GLOBAL_PATH_FOUND",
  )) {
    const reps = result.globalAnalysis.reconstructedReps;
    const durations = reps.map((rep) => rep.totalDuration);

    console.log(`\n${result.datasetName}`);
    console.table(
      reps.map((rep) => ({
        repNumber: rep.repNumber,
        bottomStartIndex: rep.bottomStart,
        topIndex: rep.top,
        bottomEndIndex: rep.bottomEnd,
        concentricDuration: rep.concentricDuration,
        eccentricDuration: rep.eccentricDuration,
        totalDuration: rep.totalDuration,
      })),
    );
    console.table([
      {
        minGlobalRepDuration: Math.min(...durations),
        maxGlobalRepDuration: Math.max(...durations),
        avgGlobalRepDuration: average(durations).toFixed(2),
        globalRepDurationRange:
          Math.max(...durations) - Math.min(...durations),
      },
    ]);
  }
}

main();
