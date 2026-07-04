type EventType = "B" | "T";

type CalibrationEvent = {
  type: EventType;
  index: number;
};

function buildDiagnostic(bottomIndexes: number[], topIndexes: number[]) {
  const events: CalibrationEvent[] = [
    ...bottomIndexes.map((index) => ({ type: "B" as const, index })),
    ...topIndexes.map((index) => ({ type: "T" as const, index })),
  ].sort((a, b) => a.index - b.index);

  let alternationBreaks = 0;
  let shortTransitions = 0;
  let reconstructibleReps = 0;

  for (let i = 1; i < events.length; i++) {
    const previous = events[i - 1];
    const current = events[i];

    if (previous.type === current.type) {
      alternationBreaks++;
    }

    if (current.index - previous.index <= 5) {
      shortTransitions++;
    }
  }

  for (let i = 0; i < events.length - 2; i++) {
    if (
      events[i].type === "B" &&
      events[i + 1].type === "T" &&
      events[i + 2].type === "B"
    ) {
      reconstructibleReps++;
      i += 1;
    }
  }

  return {
    bottomCount: bottomIndexes.length,
    topCount: topIndexes.length,
    alternationBreaks,
    shortTransitions,
    reconstructibleReps,
    chain: events.map((event) => `${event.type}(${event.index})`).join(" -> "),
  };
}

export function analyzeCalibrationOutput(params: {
  datasetName: string;
  expectedReps: number;
  rawBottomIndexes: number[];
  rawTopIndexes: number[];
  selectedBottomIndexes: number[];
  selectedTopIndexes: number[];
}) {
  const raw = buildDiagnostic(params.rawBottomIndexes, params.rawTopIndexes);
  const selected = buildDiagnostic(
    params.selectedBottomIndexes,
    params.selectedTopIndexes,
  );

  const expectedBottoms = params.expectedReps + 1;
  const expectedTops = params.expectedReps;

  const failureReasons: string[] = [];

  if (selected.bottomCount !== expectedBottoms) {
    failureReasons.push(
      `Expected ${expectedBottoms} bottoms, got ${selected.bottomCount}`,
    );
  }

  if (selected.topCount !== expectedTops) {
    failureReasons.push(
      `Expected ${expectedTops} tops, got ${selected.topCount}`,
    );
  }

  if (selected.alternationBreaks > 0) {
    failureReasons.push(`${selected.alternationBreaks} alternation breaks`);
  }

  if (selected.shortTransitions > 0) {
    failureReasons.push(`${selected.shortTransitions} short transitions`);
  }

  if (selected.reconstructibleReps !== params.expectedReps) {
    failureReasons.push(
      `Only ${selected.reconstructibleReps}/${params.expectedReps} reconstructible reps`,
    );
  }

  return {
    datasetName: params.datasetName,
    expectedReps: params.expectedReps,
    raw,
    selected: {
      ...selected,
      verdict: failureReasons.length === 0 ? "EXPLOITABLE" : "NON_EXPLOITABLE",
      failureReasons: failureReasons.join(" | ") || "None",
    },
  };
}