/**
 * PHASE BLOCKS V2 — BASELINE A — ACCEL ONLY.
 *
 * Offline benchmark for datasets 011–020. Ground Truth is used for evaluation
 * only: it never changes acceleration, velocity, axis polarity, or integration.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { prepareLinearAcceleration1D } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import {
  estimateVelocity,
  estimateVelocityWithIntervalDts,
} from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity";
import {
  decimalMicroseconds,
  intervalIndices,
  samplePosition,
  signCounts,
  signCrossings,
  velocityAt,
} from "./diagnoseVelocity";

const ROOT = new URL("../../../", import.meta.url);
const BASELINE_OUTPUT = new URL("tools/benchmark/phase-blocks/output/velocity-v2-baseline/", ROOT);
const SYNC_BASELINE_OUTPUT = new URL("tools/benchmark/phase-blocks/output/velocity-v2-sync-baseline/", ROOT);
const REAL_TIME_OUTPUT = new URL("tools/benchmark/phase-blocks/output/velocity-v2-real-time/", ROOT);
export const DATASET_IDS = ["011", "012", "013", "014", "015", "016", "017", "018", "019", "020"] as const;
const DT_SECONDS = 0.05;
const FIXED_BASELINE_WINDOW = { startIndex: 0, endIndex: 100 } as const;
const SHARED_CONFIG = {
  axisStrategy: { method: "pca" as const, referenceAxis: { x: 0, y: 0, z: 1 } },
  countsPerG: 16384,
};
const BASELINE_REPRODUCTION_COMMAND = "node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnoseVelocityV2.ts";
const SYNC_BASELINE_REPRODUCTION_COMMAND = `${BASELINE_REPRODUCTION_COMMAND} --baseline=sync`;
const REAL_TIME_REPRODUCTION_COMMAND = `${BASELINE_REPRODUCTION_COMMAND} --time=real`;
const OUTPUT_FILENAMES = ["summary.md", "summary.json", "pivot-results.csv", "phase-results.csv"] as const;

export type DatasetId = typeof DATASET_IDS[number];
export type ExperimentVariant = "fixed" | "sync" | "time";
type EventType = "BOTTOM" | "TOP";
type PhaseType = "UP" | "DOWN";
export type CrossingDirection = "NEG_TO_POS" | "POS_TO_NEG";
export type PivotClassification =
  | "UNIQUE_EXPECTED_INSIDE"
  | "MULTIPLE_OR_AMBIGUOUS"
  | "WRONG_DIRECTION_INSIDE"
  | "OUTSIDE_BEFORE"
  | "OUTSIDE_AFTER"
  | "NO_CROSSING";

export type RawSampleV2 = {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  sampleIndex: number;
  timestampMs: number;
};

export type CalibrationDatasetV2 = {
  schemaVersion: number;
  exercise: string;
  sampleCount: number;
  samplingRateHz: number;
  sensorDataUnit: string;
  samples: RawSampleV2[];
  captureDiagnostics: {
    missingSampleCount: number;
    nonContiguousSampleCount: number;
  };
};

export type GroundTruthEvent = {
  type: EventType;
  rep: number;
  arrivalTimeSeconds: number;
  departureTimeSeconds: number | null;
  arrivalSampleFloat: number;
  departureSampleFloat: number | null;
  departureSampleRounded?: number | null;
};

export type GroundTruthV2 = {
  annotationVersion: number;
  dataset: string;
  exercise: string;
  performedReps: number;
  samplingRateHz: number;
  sync: {
    offsetSeconds: number;
    baseline: {
      startSampleInclusive: number;
      endSampleInclusive: number;
    };
  };
  events: GroundTruthEvent[];
};

export type Source<T> = {
  value: T;
  path: string;
  sha256: string;
};

export type NormalizedEvent = GroundTruthEvent & {
  label: string;
  arrival: number;
  departure: number | null;
};

export type CrossingRecord = {
  leftIndex: number;
  rightIndex: number;
  velocityBefore: number;
  velocityAfter: number;
  startSampleFloat: number;
  endSampleFloat: number;
  crossingSampleFloat: number;
  direction: CrossingDirection;
  location: "LINEAR_INTERPOLATION" | "EXACT_ZERO_SAMPLE";
  zeroIndices: number[];
};

type PhaseResult = {
  dataset: DatasetId;
  label: string;
  phase: PhaseType;
  expectedVelocitySign: "POSITIVE" | "NEGATIVE";
  startSampleFloat: number;
  endSampleFloat: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  sampleCount: number;
  positiveCount: number;
  negativeCount: number;
  zeroCount: number;
  expectedSignCount: number;
  expectedSignProportion: number | null;
  meanVelocity: number | null;
  minVelocity: number | null;
  maxVelocity: number | null;
  parasiteCrossingCount: number;
  parasiteCrossings: CrossingRecord[];
};

export type BoundedPivotResult = {
  dataset: DatasetId;
  label: string;
  type: EventType;
  rep: number;
  arrivalSampleFloat: number;
  departureSampleFloat: number;
  arrivalTimeSeconds: number;
  departureTimeSeconds: number;
  expectedCrossingDirection: CrossingDirection;
  crossingsInWindow: CrossingRecord[];
  expectedCrossingsInWindow: CrossingRecord[];
  wrongDirectionCrossingsInWindow: CrossingRecord[];
  nearestExpectedBefore: CrossingRecord | null;
  nearestExpectedAfter: CrossingRecord | null;
  nearestExpectedCrossing: CrossingRecord | null;
  signedDistanceToWindowSamples: number | null;
  signedDistanceToWindowMilliseconds: number | null;
  classification: PivotClassification;
};

type B6Result = {
  dataset: DatasetId;
  label: "B6";
  type: "BOTTOM";
  rep: 6;
  arrivalSampleFloat: number;
  arrivalTimeSeconds: number;
  arrivalVelocity: number;
  arrivalVelocitySign: "POSITIVE" | "NEGATIVE" | "ZERO";
  incomingPhase: "DOWN";
  incomingPhaseExpectedSign: "NEGATIVE";
  incomingPhaseObservedExpectedSignProportion: number | null;
  expectedCrossingDirection: "NEG_TO_POS";
  expectedCrossingsAtArrival: CrossingRecord[];
  nearestExpectedBefore: CrossingRecord | null;
  nearestExpectedAfter: CrossingRecord | null;
  nearestExpectedCrossing: CrossingRecord | null;
  signedDistanceToArrivalSamples: number | null;
  signedDistanceToArrivalMilliseconds: number | null;
};

type CategoryCounts = Record<PivotClassification, number>;

type DatasetAggregate = {
  dataset: DatasetId;
  boundedWindowCount: 10;
  categoryCounts: CategoryCounts;
  uniqueExpectedInsideRate: number;
  expectedCrossingInsideCount: number;
  expectedCrossingInsideRate: number;
  upSampleCount: number;
  downSampleCount: number;
  upDirectionalScore: number;
  downDirectionalScore: number;
  balancedDirectionalScore: number;
  overallDirectionalScore: number;
  parasiteCrossingCount: number;
  outsideExpectedDistanceCount: number;
  meanAbsoluteOutsideExpectedDistanceSamples: number | null;
  meanAbsoluteOutsideExpectedDistanceMilliseconds: number | null;
  b6: B6Result;
};

type DatasetResult = {
  id: DatasetId;
  sampleCount: number;
  nominalDurationSeconds: number;
  datasetSource: Omit<Source<CalibrationDatasetV2>, "value">;
  groundTruthSource: Omit<Source<GroundTruthV2>, "value">;
  baselineWindow: {
    source: "FIXED_[0,100)" | "GT_SYNC_BASELINE";
    startSampleInclusive: number;
    endSampleInclusive: number;
    endSampleExclusive: number;
    sampleCount: number;
  };
  baseline: { x: number; y: number; z: number };
  timing: {
    intervalCount: number;
    minDtSeconds: number;
    maxDtSeconds: number;
    meanDtSeconds: number;
    medianDtSeconds: number;
    actualDurationSeconds: number;
    theoreticalDurationSeconds: number;
    cumulativeDifferenceSeconds: number;
  } | null;
  movementAxis: { x: number; y: number; z: number };
  signConvention: string;
  explainedVarianceRatio: number | null;
  velocitySummary: {
    initial: number;
    final: number;
    min: number;
    max: number;
    mean: number;
  };
  allCrossings: CrossingRecord[];
  phases: PhaseResult[];
  boundedPivots: BoundedPivotResult[];
  b6: B6Result;
  aggregate: DatasetAggregate;
};

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readSource<T>(path: string): Source<T> {
  const bytes = readFileSync(new URL(path, ROOT));
  return { value: JSON.parse(bytes.toString("utf8")) as T, path, sha256: sha256(bytes) };
}

function assertFinite(value: number, message: string): void {
  assert.ok(Number.isFinite(value), message);
}

function assertFiniteInteger(value: number, message: string): void {
  assert.ok(Number.isFinite(value) && Number.isInteger(value), message);
}

function validateDataset(dataset: CalibrationDatasetV2, id: DatasetId): void {
  const prefix = `Dataset ${id}`;
  assert.equal(dataset.schemaVersion, 2, `${prefix}: schemaVersion must be 2`);
  assert.equal(dataset.exercise, "rowing", `${prefix}: exercise must be rowing`);
  assert.equal(dataset.samplingRateHz, 20, `${prefix}: samplingRateHz must be 20`);
  assert.equal(dataset.sensorDataUnit, "raw_counts", `${prefix}: sensorDataUnit must be raw_counts`);
  assert.ok(Array.isArray(dataset.samples), `${prefix}: samples must be an array`);
  assert.equal(dataset.samples.length, dataset.sampleCount, `${prefix}: samples.length must equal sampleCount`);
  assert.ok(dataset.samples.length >= FIXED_BASELINE_WINDOW.endIndex, `${prefix}: baseline [0,100) is out of bounds`);
  assert.ok(dataset.captureDiagnostics && typeof dataset.captureDiagnostics === "object", `${prefix}: captureDiagnostics missing`);
  assert.equal(dataset.captureDiagnostics.missingSampleCount, 0, `${prefix}: captureDiagnostics reports missing samples`);
  assert.equal(dataset.captureDiagnostics.nonContiguousSampleCount, 0, `${prefix}: captureDiagnostics reports non-contiguous samples`);

  dataset.samples.forEach((sample, index) => {
    assert.ok(sample && typeof sample === "object", `${prefix}: sample ${index} missing`);
    for (const field of ["ax", "ay", "az", "gx", "gy", "gz"] as const) {
      assertFinite(sample[field], `${prefix}: ${field} must be finite at sample ${index}`);
    }
    assertFiniteInteger(sample.sampleIndex, `${prefix}: sampleIndex must be an integer at sample ${index}`);
    assertFiniteInteger(sample.timestampMs, `${prefix}: timestampMs must be an integer at sample ${index}`);
    if (index > 0) {
      const previous = dataset.samples[index - 1];
      assert.equal(sample.sampleIndex, previous.sampleIndex + 1, `${prefix}: sampleIndex discontinuity at array index ${index}`);
      assert.ok(sample.timestampMs > previous.timestampMs, `${prefix}: timestampMs must be strictly increasing at array index ${index}`);
    }
  });
}

function normalizeAndValidateGroundTruth(
  gt: GroundTruthV2,
  dataset: CalibrationDatasetV2,
  filename: string,
  id: DatasetId,
): NormalizedEvent[] {
  const prefix = `Ground Truth ${id}`;
  assert.equal(gt.annotationVersion, 2, `${prefix}: annotationVersion must be 2`);
  assert.equal(gt.dataset, filename, `${prefix}: dataset filename mismatch`);
  assert.equal(gt.exercise, "rowing", `${prefix}: exercise must be rowing`);
  assert.equal(gt.performedReps, 5, `${prefix}: performedReps must be 5`);
  assert.equal(gt.samplingRateHz, dataset.samplingRateHz, `${prefix}: samplingRateHz mismatch`);
  assert.ok(gt.sync && typeof gt.sync === "object", `${prefix}: sync missing`);
  assertFinite(gt.sync.offsetSeconds, `${prefix}: sync.offsetSeconds must be finite`);
  assert.ok(gt.sync.baseline && typeof gt.sync.baseline === "object", `${prefix}: sync.baseline missing`);
  assertFiniteInteger(gt.sync.baseline.startSampleInclusive, `${prefix}: sync.baseline.startSampleInclusive must be an integer`);
  assertFiniteInteger(gt.sync.baseline.endSampleInclusive, `${prefix}: sync.baseline.endSampleInclusive must be an integer`);
  assert.ok(gt.sync.baseline.startSampleInclusive >= 0, `${prefix}: sync baseline starts before the capture`);
  assert.ok(
    gt.sync.baseline.endSampleInclusive >= gt.sync.baseline.startSampleInclusive,
    `${prefix}: sync baseline end precedes its start`,
  );
  assert.ok(gt.sync.baseline.endSampleInclusive < dataset.samples.length, `${prefix}: sync baseline exceeds the capture`);
  assert.ok(Array.isArray(gt.events), `${prefix}: events must be an array`);
  assert.equal(gt.events.length, 11, `${prefix}: exactly 11 events are required`);

  const offset = decimalMicroseconds(gt.sync.offsetSeconds);
  const events = gt.events.map((event, index): NormalizedEvent => {
    const expectedType: EventType = index % 2 === 0 ? "BOTTOM" : "TOP";
    const expectedRep = Math.floor(index / 2) + 1;
    assert.equal(event.type, expectedType, `${prefix}: invalid event type at index ${index}`);
    assert.equal(event.rep, expectedRep, `${prefix}: invalid rep at index ${index}`);
    assertFinite(event.arrivalTimeSeconds, `${prefix}: arrivalTimeSeconds must be finite at index ${index}`);
    assertFinite(event.arrivalSampleFloat, `${prefix}: arrivalSampleFloat must be finite at index ${index}`);
    const arrival = samplePosition(event.arrivalTimeSeconds, offset);
    assert.equal(arrival, event.arrivalSampleFloat, `${prefix}: arrival sample conversion mismatch at index ${index}`);
    assert.ok(arrival >= 0 && arrival <= dataset.samples.length - 1, `${prefix}: arrival out of bounds at index ${index}`);

    let departure: number | null = null;
    if (index === gt.events.length - 1) {
      assert.equal(event.departureTimeSeconds, null, `${prefix}: B6 departureTimeSeconds must be null`);
      assert.equal(event.departureSampleFloat, null, `${prefix}: B6 departureSampleFloat must be null`);
      assert.equal(event.departureSampleRounded, null, `${prefix}: B6 departureSampleRounded must be null`);
    } else {
      assert.notEqual(event.departureTimeSeconds, null, `${prefix}: bounded event ${index} needs departureTimeSeconds`);
      assert.notEqual(event.departureSampleFloat, null, `${prefix}: bounded event ${index} needs departureSampleFloat`);
      assertFinite(event.departureTimeSeconds!, `${prefix}: departureTimeSeconds must be finite at index ${index}`);
      assertFinite(event.departureSampleFloat!, `${prefix}: departureSampleFloat must be finite at index ${index}`);
      departure = samplePosition(event.departureTimeSeconds!, offset);
      assert.equal(departure, event.departureSampleFloat, `${prefix}: departure sample conversion mismatch at index ${index}`);
      assert.ok(departure >= arrival, `${prefix}: departure precedes arrival at index ${index}`);
      assert.ok(departure <= dataset.samples.length - 1, `${prefix}: departure out of bounds at index ${index}`);
    }

    return {
      ...event,
      label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep}`,
      arrival,
      departure,
    };
  });

  events.forEach((event, index) => {
    if (index === 0) return;
    const previous = events[index - 1];
    assert.notEqual(previous.departure, null, `${prefix}: only B6 may have a null departure`);
    assert.ok(previous.departure! < event.arrival, `${prefix}: windows overlap or are not strictly ordered at ${event.label}`);
  });
  return events;
}

export function baselineWindowFor(
  variant: ExperimentVariant,
  syncBaseline: GroundTruthV2["sync"]["baseline"],
): { startIndex: number; endIndex: number } {
  if (variant === "sync") return {
    startIndex: syncBaseline.startSampleInclusive,
    endIndex: syncBaseline.endSampleInclusive + 1,
  };
  return { ...FIXED_BASELINE_WINDOW };
}

export function experimentConfiguration(
  variant: ExperimentVariant,
  syncBaseline: GroundTruthV2["sync"]["baseline"],
) {
  return {
    baselineWindow: baselineWindowFor(variant, syncBaseline),
    axisStrategy: SHARED_CONFIG.axisStrategy,
    countsPerG: SHARED_CONFIG.countsPerG,
    dtSeconds: DT_SECONDS,
    initialVelocity: 0,
    driftCorrection: false,
    velocityReset: false,
    gyroUsed: false,
    timestampMsUsedForIntegration: variant === "time",
    groundTruthInjectedIntoSignal: false,
  };
}

export function outputDirectoryFor(variant: ExperimentVariant): URL {
  if (variant === "sync") return new URL(SYNC_BASELINE_OUTPUT.href);
  if (variant === "time") return new URL(REAL_TIME_OUTPUT.href);
  return new URL(BASELINE_OUTPUT.href);
}

const UINT32_MODULUS = 0x1_0000_0000;

export function unsignedTimestampDeltaMs(current: number, previous: number): number {
  for (const [label, value] of [["current", current], ["previous", previous]] as const) {
    assert.ok(
      Number.isInteger(value) && value >= 0 && value < UINT32_MODULUS,
      `${label} timestampMs must be a uint32 integer`,
    );
  }
  const delta = current >= previous
    ? current - previous
    : UINT32_MODULUS - previous + current;
  assert.ok(delta > 0, "timestampMs interval must be strictly positive");
  return delta;
}

export function intervalSecondsFromTimestamps(timestampMs: readonly number[]): number[] {
  const intervals: number[] = [];
  for (let index = 1; index < timestampMs.length; index += 1) {
    intervals.push(unsignedTimestampDeltaMs(timestampMs[index], timestampMs[index - 1]) / 1000);
  }
  return intervals;
}

function buildTimingStats(intervalDtSeconds: readonly number[]) {
  assert.ok(intervalDtSeconds.length > 0, "Timing statistics require at least one interval");
  const statistics = numberStats(intervalDtSeconds)!;
  const actualDurationSeconds = intervalDtSeconds.reduce((sum, value) => sum + value, 0);
  const theoreticalDurationSeconds = intervalDtSeconds.length * DT_SECONDS;
  return {
    intervalCount: intervalDtSeconds.length,
    minDtSeconds: statistics.min,
    maxDtSeconds: statistics.max,
    meanDtSeconds: statistics.mean,
    medianDtSeconds: median(intervalDtSeconds)!,
    actualDurationSeconds,
    theoreticalDurationSeconds,
    cumulativeDifferenceSeconds: actualDurationSeconds - theoreticalDurationSeconds,
  };
}

function numberStats(values: readonly number[]): { min: number; max: number; mean: number } | null {
  if (values.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const value of values) {
    assertFinite(value, "Statistics require finite values");
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }
  return { min, max, mean: sum / values.length };
}

function velocitySign(value: number): "POSITIVE" | "NEGATIVE" | "ZERO" {
  return value > 0 ? "POSITIVE" : value < 0 ? "NEGATIVE" : "ZERO";
}

function mapCrossings(velocity: readonly number[], indices: readonly number[]): CrossingRecord[] {
  return signCrossings(velocity, indices).map(crossing => {
    const start = crossing.zeroIndices.length ? crossing.zeroIndices[0] : crossing.crossingIndex;
    const end = crossing.zeroIndices.length ? crossing.zeroIndices[crossing.zeroIndices.length - 1] : crossing.crossingIndex;
    return {
      leftIndex: crossing.leftIndex,
      rightIndex: crossing.rightIndex,
      velocityBefore: velocity[crossing.leftIndex],
      velocityAfter: velocity[crossing.rightIndex],
      startSampleFloat: start,
      endSampleFloat: end,
      crossingSampleFloat: crossing.crossingIndex,
      direction: crossing.direction === "negative-to-positive" ? "NEG_TO_POS" : "POS_TO_NEG",
      location: crossing.location === "linear-interpolation" ? "LINEAR_INTERPOLATION" : "EXACT_ZERO_SAMPLE",
      zeroIndices: [...crossing.zeroIndices],
    };
  });
}

function intersectsWindow(crossing: CrossingRecord, start: number, end: number): boolean {
  return crossing.endSampleFloat >= start && crossing.startSampleFloat <= end;
}

export function signedDistanceToWindow(crossing: CrossingRecord, start: number, end: number): number {
  assert.ok(Number.isFinite(start) && Number.isFinite(end) && start <= end);
  if (intersectsWindow(crossing, start, end)) return 0;
  return crossing.endSampleFloat < start
    ? crossing.endSampleFloat - start
    : crossing.startSampleFloat - end;
}

function nearestBefore(crossings: readonly CrossingRecord[], start: number): CrossingRecord | null {
  return crossings
    .filter(crossing => crossing.endSampleFloat < start)
    .reduce<CrossingRecord | null>((nearest, crossing) =>
      nearest === null || crossing.endSampleFloat > nearest.endSampleFloat ? crossing : nearest, null);
}

function nearestAfter(crossings: readonly CrossingRecord[], end: number): CrossingRecord | null {
  return crossings
    .filter(crossing => crossing.startSampleFloat > end)
    .reduce<CrossingRecord | null>((nearest, crossing) =>
      nearest === null || crossing.startSampleFloat < nearest.startSampleFloat ? crossing : nearest, null);
}

function chooseNearestExpected(
  before: CrossingRecord | null,
  after: CrossingRecord | null,
  start: number,
  end: number,
): CrossingRecord | null {
  if (before === null) return after;
  if (after === null) return before;
  const beforeDistance = Math.abs(signedDistanceToWindow(before, start, end));
  const afterDistance = Math.abs(signedDistanceToWindow(after, start, end));
  assert.notEqual(beforeDistance, afterDistance, `Equidistant expected crossings require an explicit convention at [${start}, ${end}]`);
  return beforeDistance < afterDistance ? before : after;
}

export function classifyBoundedPivot(
  expectedDirection: CrossingDirection,
  start: number,
  end: number,
  allCrossings: readonly CrossingRecord[],
): Omit<BoundedPivotResult,
  "dataset" | "label" | "type" | "rep" |
  "arrivalSampleFloat" | "departureSampleFloat" |
  "arrivalTimeSeconds" | "departureTimeSeconds" |
  "expectedCrossingDirection"
> {
  const crossingsInWindow = allCrossings.filter(crossing => intersectsWindow(crossing, start, end));
  const expectedCrossingsInWindow = crossingsInWindow.filter(crossing => crossing.direction === expectedDirection);
  const wrongDirectionCrossingsInWindow = crossingsInWindow.filter(crossing => crossing.direction !== expectedDirection);
  const expected = allCrossings.filter(crossing => crossing.direction === expectedDirection);
  const before = nearestBefore(expected, start);
  const after = nearestAfter(expected, end);
  const nearest = chooseNearestExpected(before, after, start, end);

  let classification: PivotClassification;
  if (crossingsInWindow.length > 1) classification = "MULTIPLE_OR_AMBIGUOUS";
  else if (expectedCrossingsInWindow.length === 1) classification = "UNIQUE_EXPECTED_INSIDE";
  else if (wrongDirectionCrossingsInWindow.length === 1) classification = "WRONG_DIRECTION_INSIDE";
  else if (nearest === null) classification = "NO_CROSSING";
  else classification = signedDistanceToWindow(nearest, start, end) < 0 ? "OUTSIDE_BEFORE" : "OUTSIDE_AFTER";

  const distance = expectedCrossingsInWindow.length > 0
    ? 0
    : nearest === null ? null : signedDistanceToWindow(nearest, start, end);
  return {
    crossingsInWindow,
    expectedCrossingsInWindow,
    wrongDirectionCrossingsInWindow,
    nearestExpectedBefore: before,
    nearestExpectedAfter: after,
    nearestExpectedCrossing: expectedCrossingsInWindow[0] ?? nearest,
    signedDistanceToWindowSamples: distance,
    signedDistanceToWindowMilliseconds: distance === null ? null : distance * DT_SECONDS * 1000,
    classification,
  };
}

function emptyCategoryCounts(): CategoryCounts {
  return {
    UNIQUE_EXPECTED_INSIDE: 0,
    MULTIPLE_OR_AMBIGUOUS: 0,
    WRONG_DIRECTION_INSIDE: 0,
    OUTSIDE_BEFORE: 0,
    OUTSIDE_AFTER: 0,
    NO_CROSSING: 0,
  };
}

function mean(values: readonly number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function buildDatasetAggregate(
  id: DatasetId,
  phases: readonly PhaseResult[],
  pivots: readonly BoundedPivotResult[],
  b6: B6Result,
): DatasetAggregate {
  assert.equal(pivots.length, 10, `${id}: exactly 10 bounded pivots are required`);
  const categoryCounts = emptyCategoryCounts();
  pivots.forEach(pivot => { categoryCounts[pivot.classification] += 1; });
  const expectedInside = pivots.filter(pivot => pivot.expectedCrossingsInWindow.length > 0).length;
  const up = phases.filter(phase => phase.phase === "UP");
  const down = phases.filter(phase => phase.phase === "DOWN");
  const upN = up.reduce((sum, phase) => sum + phase.sampleCount, 0);
  const downN = down.reduce((sum, phase) => sum + phase.sampleCount, 0);
  const upCorrect = up.reduce((sum, phase) => sum + phase.expectedSignCount, 0);
  const downCorrect = down.reduce((sum, phase) => sum + phase.expectedSignCount, 0);
  assert.ok(upN > 0 && downN > 0, `${id}: directional scores require non-empty UP and DOWN samples`);
  const upScore = upCorrect / upN;
  const downScore = downCorrect / downN;
  const outsideDistances = pivots
    .filter(pivot => pivot.expectedCrossingsInWindow.length === 0 && pivot.signedDistanceToWindowSamples !== null)
    .map(pivot => Math.abs(pivot.signedDistanceToWindowSamples!));
  return {
    dataset: id,
    boundedWindowCount: 10,
    categoryCounts,
    uniqueExpectedInsideRate: categoryCounts.UNIQUE_EXPECTED_INSIDE / pivots.length,
    expectedCrossingInsideCount: expectedInside,
    expectedCrossingInsideRate: expectedInside / pivots.length,
    upSampleCount: upN,
    downSampleCount: downN,
    upDirectionalScore: upScore,
    downDirectionalScore: downScore,
    balancedDirectionalScore: (upScore + downScore) / 2,
    overallDirectionalScore: (upCorrect + downCorrect) / (upN + downN),
    parasiteCrossingCount: phases.reduce((sum, phase) => sum + phase.parasiteCrossingCount, 0),
    outsideExpectedDistanceCount: outsideDistances.length,
    meanAbsoluteOutsideExpectedDistanceSamples: mean(outsideDistances),
    meanAbsoluteOutsideExpectedDistanceMilliseconds: mean(outsideDistances.map(value => value * DT_SECONDS * 1000)),
    b6,
  };
}

export function loadValidatedDataset(id: DatasetId) {
  const filename = `rowing_5reps_${id}.json`;
  const datasetSource = readSource<CalibrationDatasetV2>(`datasets/calibration/rowing/${filename}`);
  const gtSource = readSource<GroundTruthV2>(`datasets/ground-truth/rowing_5reps_${id}.v2.json`);
  validateDataset(datasetSource.value, id);
  const events = normalizeAndValidateGroundTruth(gtSource.value, datasetSource.value, filename, id);
  return { id, filename, datasetSource, gtSource, events };
}

function diagnoseDataset(id: DatasetId, variant: ExperimentVariant): DatasetResult {
  const { datasetSource, gtSource, events } = loadValidatedDataset(id);

  // Both A variants are deliberately accel-only. Gyro and timestampMs were validated above but are not read here.
  const configuration = experimentConfiguration(variant, gtSource.value.sync.baseline);
  const prepared = prepareLinearAcceleration1D(datasetSource.value.samples, {
    baselineWindow: configuration.baselineWindow,
    axisStrategy: configuration.axisStrategy,
    countsPerG: configuration.countsPerG,
  });
  const intervalDtSeconds = variant === "time"
    ? intervalSecondsFromTimestamps(datasetSource.value.samples.map(sample => sample.timestampMs))
    : null;
  const velocity = intervalDtSeconds === null
    ? estimateVelocity(prepared.acceleration1D, DT_SECONDS)
    : estimateVelocityWithIntervalDts(prepared.acceleration1D, intervalDtSeconds);
  assert.equal(velocity.length, datasetSource.value.samples.length, `${id}: velocity length mismatch`);
  assert.equal(velocity[0], 0, `${id}: velocity must start at zero`);
  const allIndices = Array.from({ length: velocity.length }, (_, index) => index);
  const allCrossings = mapCrossings(velocity, allIndices);

  const phases: PhaseResult[] = events.slice(0, -1).map((event, index) => {
    const next = events[index + 1];
    assert.notEqual(event.departure, null);
    assert.notEqual(event.departureTimeSeconds, null);
    const phase: PhaseType = event.type === "BOTTOM" ? "UP" : "DOWN";
    const indices = intervalIndices(event.departure!, next.arrival, false);
    const counts = signCounts(velocity, indices);
    const statistics = numberStats(indices.map(sampleIndex => velocity[sampleIndex]));
    const crossings = mapCrossings(velocity, indices);
    const expectedSignCount = phase === "UP" ? counts.positive : counts.negative;
    return {
      dataset: id,
      label: `${event.label} -> ${next.label}`,
      phase,
      expectedVelocitySign: phase === "UP" ? "POSITIVE" : "NEGATIVE",
      startSampleFloat: event.departure!,
      endSampleFloat: next.arrival,
      startTimeSeconds: event.departureTimeSeconds!,
      endTimeSeconds: next.arrivalTimeSeconds,
      sampleCount: counts.n,
      positiveCount: counts.positive,
      negativeCount: counts.negative,
      zeroCount: counts.zero,
      expectedSignCount,
      expectedSignProportion: counts.n ? expectedSignCount / counts.n : null,
      meanVelocity: statistics?.mean ?? null,
      minVelocity: statistics?.min ?? null,
      maxVelocity: statistics?.max ?? null,
      parasiteCrossingCount: crossings.length,
      parasiteCrossings: crossings,
    };
  });
  assert.equal(phases.length, 10, `${id}: exactly 10 movement phases are required`);

  const boundedPivots: BoundedPivotResult[] = events.slice(0, -1).map(event => {
    assert.notEqual(event.departure, null);
    assert.notEqual(event.departureTimeSeconds, null);
    const expectedDirection: CrossingDirection = event.type === "BOTTOM" ? "NEG_TO_POS" : "POS_TO_NEG";
    return {
      dataset: id,
      label: event.label,
      type: event.type,
      rep: event.rep,
      arrivalSampleFloat: event.arrival,
      departureSampleFloat: event.departure!,
      arrivalTimeSeconds: event.arrivalTimeSeconds,
      departureTimeSeconds: event.departureTimeSeconds!,
      expectedCrossingDirection: expectedDirection,
      ...classifyBoundedPivot(expectedDirection, event.arrival, event.departure!, allCrossings),
    };
  });

  const finalEvent = events[events.length - 1];
  assert.equal(finalEvent.label, "B6");
  const incoming = phases[phases.length - 1];
  assert.equal(incoming.phase, "DOWN");
  const expectedB6Crossings = allCrossings.filter(crossing => crossing.direction === "NEG_TO_POS");
  const b6AtArrival = expectedB6Crossings.filter(crossing =>
    intersectsWindow(crossing, finalEvent.arrival, finalEvent.arrival));
  const b6Before = nearestBefore(expectedB6Crossings, finalEvent.arrival);
  const b6After = nearestAfter(expectedB6Crossings, finalEvent.arrival);
  const b6Nearest = b6AtArrival[0] ?? chooseNearestExpected(b6Before, b6After, finalEvent.arrival, finalEvent.arrival);
  const b6Distance = b6Nearest === null ? null : signedDistanceToWindow(b6Nearest, finalEvent.arrival, finalEvent.arrival);
  const arrivalVelocity = velocityAt(velocity, finalEvent.arrival);
  const b6: B6Result = {
    dataset: id,
    label: "B6",
    type: "BOTTOM",
    rep: 6,
    arrivalSampleFloat: finalEvent.arrival,
    arrivalTimeSeconds: finalEvent.arrivalTimeSeconds,
    arrivalVelocity,
    arrivalVelocitySign: velocitySign(arrivalVelocity),
    incomingPhase: "DOWN",
    incomingPhaseExpectedSign: "NEGATIVE",
    incomingPhaseObservedExpectedSignProportion: incoming.expectedSignProportion,
    expectedCrossingDirection: "NEG_TO_POS",
    expectedCrossingsAtArrival: b6AtArrival,
    nearestExpectedBefore: b6Before,
    nearestExpectedAfter: b6After,
    nearestExpectedCrossing: b6Nearest,
    signedDistanceToArrivalSamples: b6Distance,
    signedDistanceToArrivalMilliseconds: b6Distance === null ? null : b6Distance * DT_SECONDS * 1000,
  };

  const velocityStatistics = numberStats(velocity)!;
  const aggregate = buildDatasetAggregate(id, phases, boundedPivots, b6);
  return {
    id,
    sampleCount: datasetSource.value.samples.length,
    nominalDurationSeconds: (datasetSource.value.samples.length - 1) * DT_SECONDS,
    datasetSource: { path: datasetSource.path, sha256: datasetSource.sha256 },
    groundTruthSource: { path: gtSource.path, sha256: gtSource.sha256 },
    baselineWindow: {
      source: variant === "sync" ? "GT_SYNC_BASELINE" : "FIXED_[0,100)",
      startSampleInclusive: configuration.baselineWindow.startIndex,
      endSampleInclusive: configuration.baselineWindow.endIndex - 1,
      endSampleExclusive: configuration.baselineWindow.endIndex,
      sampleCount: configuration.baselineWindow.endIndex - configuration.baselineWindow.startIndex,
    },
    baseline: prepared.baseline,
    timing: intervalDtSeconds === null ? null : buildTimingStats(intervalDtSeconds),
    movementAxis: prepared.movementAxis,
    signConvention: prepared.signConvention,
    explainedVarianceRatio: prepared.pca?.explainedVarianceRatio ?? null,
    velocitySummary: { initial: velocity[0], final: velocity[velocity.length - 1], ...velocityStatistics },
    allCrossings,
    phases,
    boundedPivots,
    b6,
    aggregate,
  };
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function buildGlobalAggregate(results: readonly DatasetResult[]) {
  assert.equal(results.length, 10, "Exactly ten dataset results are required");
  const pivots = results.flatMap(result => result.boundedPivots);
  const phases = results.flatMap(result => result.phases);
  const b6 = results.map(result => result.b6);
  assert.equal(pivots.length, 100, "Exactly 100 bounded pivots are required");
  assert.equal(phases.length, 100, "Exactly 100 movement phases are required");
  assert.equal(b6.length, 10, "Exactly ten B6 results are required");
  const categoryCounts = emptyCategoryCounts();
  pivots.forEach(pivot => { categoryCounts[pivot.classification] += 1; });
  const expectedInsideCount = pivots.filter(pivot => pivot.expectedCrossingsInWindow.length > 0).length;
  const upPhases = phases.filter(phase => phase.phase === "UP");
  const downPhases = phases.filter(phase => phase.phase === "DOWN");
  const upN = upPhases.reduce((sum, phase) => sum + phase.sampleCount, 0);
  const downN = downPhases.reduce((sum, phase) => sum + phase.sampleCount, 0);
  const upCorrect = upPhases.reduce((sum, phase) => sum + phase.expectedSignCount, 0);
  const downCorrect = downPhases.reduce((sum, phase) => sum + phase.expectedSignCount, 0);
  const microUp = upCorrect / upN;
  const microDown = downCorrect / downN;
  const outsideDistances = pivots
    .filter(pivot => pivot.expectedCrossingsInWindow.length === 0 && pivot.signedDistanceToWindowSamples !== null)
    .map(pivot => Math.abs(pivot.signedDistanceToWindowSamples!));
  const sortedOutsideDistances = [...outsideDistances].sort((a, b) => a - b);
  return {
    boundedWindowCount: 100,
    b6Count: 10,
    categoryCounts,
    micro: {
      uniqueExpectedInsideRate: categoryCounts.UNIQUE_EXPECTED_INSIDE / pivots.length,
      expectedCrossingInsideCount: expectedInsideCount,
      expectedCrossingInsideRate: expectedInsideCount / pivots.length,
      overallDirectionalScore: (upCorrect + downCorrect) / (upN + downN),
      upDirectionalScore: microUp,
      downDirectionalScore: microDown,
      balancedDirectionalScore: (microUp + microDown) / 2,
      upSampleCount: upN,
      downSampleCount: downN,
      parasiteCrossingCount: phases.reduce((sum, phase) => sum + phase.parasiteCrossingCount, 0),
    },
    macro: {
      uniqueExpectedInsideRate: mean(results.map(result => result.aggregate.uniqueExpectedInsideRate))!,
      expectedCrossingInsideRate: mean(results.map(result => result.aggregate.expectedCrossingInsideRate))!,
      overallDirectionalScore: mean(results.map(result => result.aggregate.overallDirectionalScore))!,
      upDirectionalScore: mean(results.map(result => result.aggregate.upDirectionalScore))!,
      downDirectionalScore: mean(results.map(result => result.aggregate.downDirectionalScore))!,
      balancedDirectionalScore: mean(results.map(result => result.aggregate.balancedDirectionalScore))!,
    },
    outsideExpectedDistanceDistribution: {
      count: sortedOutsideDistances.length,
      minSamples: sortedOutsideDistances[0] ?? null,
      medianSamples: median(sortedOutsideDistances),
      meanSamples: mean(sortedOutsideDistances),
      maxSamples: sortedOutsideDistances[sortedOutsideDistances.length - 1] ?? null,
      minMilliseconds: sortedOutsideDistances.length ? sortedOutsideDistances[0] * DT_SECONDS * 1000 : null,
      medianMilliseconds: median(sortedOutsideDistances.map(value => value * DT_SECONDS * 1000)),
      meanMilliseconds: mean(sortedOutsideDistances.map(value => value * DT_SECONDS * 1000)),
      maxMilliseconds: sortedOutsideDistances.length ? sortedOutsideDistances[sortedOutsideDistances.length - 1] * DT_SECONDS * 1000 : null,
      absoluteDistancesSamples: sortedOutsideDistances,
    },
    b6,
  };
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" ? value : typeof value === "number" ? String(value) : JSON.stringify(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(headers: readonly string[], rows: readonly Record<string, unknown>[]): string {
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n") + "\n";
}

function formatNumber(value: number | null, digits = 6): string {
  return value === null ? "N/D" : value.toFixed(digits);
}

function percent(value: number): string {
  return `${(value * 100).toFixed(2)} %`;
}

function markdownTable(headers: readonly string[], rows: readonly (string | number)[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map(row => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function buildFixedMarkdown(results: readonly DatasetResult[], global: ReturnType<typeof buildGlobalAggregate>): string {
  const categories = Object.keys(emptyCategoryCounts()) as PivotClassification[];
  const lines = [
    "# PHASE BLOCKS V2 — BASELINE A — ACCEL ONLY", "",
    "Benchmark offline figé pour les captures 011–020. Les Ground Truth servent exclusivement à l'évaluation et ne modifient jamais le signal.", "",
    "## Configuration", "",
    "- baseline : `[0,100)` ;",
    "- axe : PCA sur la capture complète ;",
    "- axe de référence : `+Z` géométrique ;",
    "- sensibilité : `16384 counts/g` nominale ;",
    "- intégration : trapézoïdale existante, `dt=0.05 s` constant ;",
    "- condition initiale : `v[0]=0` ;",
    "- aucune correction de dérive, aucun reset, aucun gyroscope, aucun `timestampMs`, aucune baseline `sync` ;",
    "- aucune injection GT et aucune inversion automatique de polarité ;",
    "- convention évaluée : `UP => velocity > 0`, `DOWN => velocity < 0`.", "",
    "Les phases utilisent les samples strictement internes à `(departure, arrival)`. Un crossing de pivot est dans la fenêtre lorsque sa position interpolée, ou son intervalle de zéros exacts, intersecte `[arrival, departure]`. Aucun milieu de fenêtre n'est utilisé.", "",
    "## Résultats par dataset", "",
    markdownTable(
      ["Dataset", "Fenêtres", "Unique", "Multi", "Mauvais sens", "Avant", "Après", "Absent", "Attendu dedans", "UP", "DOWN", "Équilibré", "Crossings parasites", "Distance hors fenêtre moyenne"],
      results.map(result => [
        result.id,
        result.aggregate.boundedWindowCount,
        `${result.aggregate.categoryCounts.UNIQUE_EXPECTED_INSIDE} (${percent(result.aggregate.uniqueExpectedInsideRate)})`,
        result.aggregate.categoryCounts.MULTIPLE_OR_AMBIGUOUS,
        result.aggregate.categoryCounts.WRONG_DIRECTION_INSIDE,
        result.aggregate.categoryCounts.OUTSIDE_BEFORE,
        result.aggregate.categoryCounts.OUTSIDE_AFTER,
        result.aggregate.categoryCounts.NO_CROSSING,
        `${result.aggregate.expectedCrossingInsideCount} (${percent(result.aggregate.expectedCrossingInsideRate)})`,
        percent(result.aggregate.upDirectionalScore),
        percent(result.aggregate.downDirectionalScore),
        percent(result.aggregate.balancedDirectionalScore),
        result.aggregate.parasiteCrossingCount,
        result.aggregate.meanAbsoluteOutsideExpectedDistanceSamples === null
          ? "N/D"
          : `${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceSamples, 3)} samples / ${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceMilliseconds, 2)} ms`,
      ])), "",
    "## Agrégats globaux", "",
    `- fenêtres bornées : **${global.boundedWindowCount}** ; B6 descriptifs : **${global.b6Count}** ;`,
    `- micro — unique attendu dedans : **${percent(global.micro.uniqueExpectedInsideRate)}** ; crossing attendu dedans : **${global.micro.expectedCrossingInsideCount}/${global.boundedWindowCount} (${percent(global.micro.expectedCrossingInsideRate)})** ;`,
    `- macro — unique attendu dedans : **${percent(global.macro.uniqueExpectedInsideRate)}** ; crossing attendu dedans : **${percent(global.macro.expectedCrossingInsideRate)}** ;`,
    `- direction micro — global : **${percent(global.micro.overallDirectionalScore)}**, UP : **${percent(global.micro.upDirectionalScore)}**, DOWN : **${percent(global.micro.downDirectionalScore)}**, équilibré : **${percent(global.micro.balancedDirectionalScore)}** ;`,
    `- direction macro — global : **${percent(global.macro.overallDirectionalScore)}**, UP : **${percent(global.macro.upDirectionalScore)}**, DOWN : **${percent(global.macro.downDirectionalScore)}**, équilibré : **${percent(global.macro.balancedDirectionalScore)}** ;`,
    `- crossings parasites dans les phases : **${global.micro.parasiteCrossingCount}**.`, "",
    "### Distribution des catégories", "",
    markdownTable(["Catégorie", "Nombre", "Taux micro"], categories.map(category => [category, global.categoryCounts[category], percent(global.categoryCounts[category] / global.boundedWindowCount)])), "",
    "### Distances des crossings attendus hors fenêtre", "",
    `Nombre exploitable : **${global.outsideExpectedDistanceDistribution.count}**. Min / médiane / moyenne / max : **${formatNumber(global.outsideExpectedDistanceDistribution.minSamples, 3)} / ${formatNumber(global.outsideExpectedDistanceDistribution.medianSamples, 3)} / ${formatNumber(global.outsideExpectedDistanceDistribution.meanSamples, 3)} / ${formatNumber(global.outsideExpectedDistanceDistribution.maxSamples, 3)} samples**, soit **${formatNumber(global.outsideExpectedDistanceDistribution.minMilliseconds, 2)} / ${formatNumber(global.outsideExpectedDistanceDistribution.medianMilliseconds, 2)} / ${formatNumber(global.outsideExpectedDistanceDistribution.meanMilliseconds, 2)} / ${formatNumber(global.outsideExpectedDistanceDistribution.maxMilliseconds, 2)} ms** nominaux.`, "",
    "## B6 — descriptif uniquement", "",
    markdownTable(
      ["Dataset", "Arrival", "v(arrival)", "Signe v", "DOWN entrant correct", "NEG_TO_POS à arrival", "Précédent", "Suivant", "Plus proche", "Distance"],
      global.b6.map(row => [
        row.dataset,
        formatNumber(row.arrivalSampleFloat, 3),
        formatNumber(row.arrivalVelocity),
        row.arrivalVelocitySign,
        row.incomingPhaseObservedExpectedSignProportion === null ? "N/D" : percent(row.incomingPhaseObservedExpectedSignProportion),
        row.expectedCrossingsAtArrival.length,
        row.nearestExpectedBefore === null ? "N/D" : formatNumber(row.nearestExpectedBefore.crossingSampleFloat, 3),
        row.nearestExpectedAfter === null ? "N/D" : formatNumber(row.nearestExpectedAfter.crossingSampleFloat, 3),
        row.nearestExpectedCrossing === null ? "N/D" : formatNumber(row.nearestExpectedCrossing.crossingSampleFloat, 3),
        row.signedDistanceToArrivalSamples === null ? "N/D" : `${formatNumber(row.signedDistanceToArrivalSamples, 3)} samples / ${formatNumber(row.signedDistanceToArrivalMilliseconds, 2)} ms`,
      ])), "",
    "Les B6 ne participent à aucun taux de fenêtre et ne reçoivent aucune classification succès/échec.", "",
    "Pour les pivots sans crossing attendu dans la fenêtre, le plus proche est recherché sur toute la capture, sans seuil de distance et sans appariement un-à-un. Une égalité exacte entre un crossing avant et après fait échouer le runner plutôt que d'introduire une convention silencieuse.", "",
    "## Sources", "",
    markdownTable(
      ["Dataset", "Capture", "SHA-256 capture", "Ground Truth", "SHA-256 GT"],
      results.map(result => [result.id, `\`${result.datasetSource.path}\``, `\`${result.datasetSource.sha256}\``, `\`${result.groundTruthSource.path}\``, `\`${result.groundTruthSource.sha256}\``]),
    ), "",
    "## Reproduction", "",
    "Depuis la racine du workspace :", "",
    "```powershell", BASELINE_REPRODUCTION_COMMAND, "```", "",
    "Les rapports Phase Blocks historiques n'incluent pas de date d'exécution ; ce rapport reste donc déterministe et n'en ajoute pas.", "",
    "## Limites factuelles", "",
    "- `[0,100)` est une baseline candidate, conservée ici pour reproduire A.",
    "- La PCA sur capture complète est offline.",
    "- `16384 counts/g` est nominal.",
    "- `+Z` fixe une polarité géométrique, pas un sens biomécanique certifié.",
    "- Les indices fractionnaires interpolent la courbe à 20 Hz sans augmenter la résolution physique.",
    "- Ce benchmark mesure la baseline accel-only ; il ne propose ni correction ni algorithme Phase Blocks de production.", "",
  ];
  return lines.join("\n");
}

function outsideDistanceStats(result: DatasetResult) {
  const samples = result.boundedPivots
    .filter(pivot => pivot.expectedCrossingsInWindow.length === 0 && pivot.signedDistanceToWindowSamples !== null)
    .map(pivot => Math.abs(pivot.signedDistanceToWindowSamples!));
  return {
    count: samples.length,
    medianSamples: median(samples),
    meanSamples: mean(samples),
    medianMilliseconds: median(samples.map(value => value * DT_SECONDS * 1000)),
    meanMilliseconds: mean(samples.map(value => value * DT_SECONDS * 1000)),
  };
}

export function buildComparison(fixedResults: readonly DatasetResult[], syncResults: readonly DatasetResult[]) {
  assert.equal(fixedResults.length, syncResults.length, "A and A-baseline dataset counts differ");
  const fixedGlobal = buildGlobalAggregate(fixedResults);
  const syncGlobal = buildGlobalAggregate(syncResults);
  const categories = Object.keys(emptyCategoryCounts()) as PivotClassification[];
  const perDataset = fixedResults.map((fixed, index) => {
    const sync = syncResults[index];
    assert.equal(sync.id, fixed.id, `A and A-baseline dataset order differs at ${fixed.id}`);
    return {
      dataset: fixed.id,
      expectedCrossingInside: { A: fixed.aggregate.expectedCrossingInsideCount, A_baseline: sync.aggregate.expectedCrossingInsideCount },
      upDirectionalScore: { A: fixed.aggregate.upDirectionalScore, A_baseline: sync.aggregate.upDirectionalScore },
      downDirectionalScore: { A: fixed.aggregate.downDirectionalScore, A_baseline: sync.aggregate.downDirectionalScore },
      balancedDirectionalScore: { A: fixed.aggregate.balancedDirectionalScore, A_baseline: sync.aggregate.balancedDirectionalScore },
      parasiteCrossingCount: { A: fixed.aggregate.parasiteCrossingCount, A_baseline: sync.aggregate.parasiteCrossingCount },
      outsideExpectedDistance: { A: outsideDistanceStats(fixed), A_baseline: outsideDistanceStats(sync) },
    };
  });
  return {
    perDataset,
    global: {
      uniqueExpectedInside: {
        A: fixedGlobal.categoryCounts.UNIQUE_EXPECTED_INSIDE,
        A_baseline: syncGlobal.categoryCounts.UNIQUE_EXPECTED_INSIDE,
      },
      categoryCounts: Object.fromEntries(categories.map(category => [category, {
        A: fixedGlobal.categoryCounts[category],
        A_baseline: syncGlobal.categoryCounts[category],
        delta: syncGlobal.categoryCounts[category] - fixedGlobal.categoryCounts[category],
      }])) as Record<PivotClassification, { A: number; A_baseline: number; delta: number }>,
      micro: {
        expectedCrossingInsideRate: { A: fixedGlobal.micro.expectedCrossingInsideRate, A_baseline: syncGlobal.micro.expectedCrossingInsideRate },
        upDirectionalScore: { A: fixedGlobal.micro.upDirectionalScore, A_baseline: syncGlobal.micro.upDirectionalScore },
        downDirectionalScore: { A: fixedGlobal.micro.downDirectionalScore, A_baseline: syncGlobal.micro.downDirectionalScore },
        balancedDirectionalScore: { A: fixedGlobal.micro.balancedDirectionalScore, A_baseline: syncGlobal.micro.balancedDirectionalScore },
        parasiteCrossingCount: { A: fixedGlobal.micro.parasiteCrossingCount, A_baseline: syncGlobal.micro.parasiteCrossingCount },
      },
      macro: {
        expectedCrossingInsideRate: { A: fixedGlobal.macro.expectedCrossingInsideRate, A_baseline: syncGlobal.macro.expectedCrossingInsideRate },
        upDirectionalScore: { A: fixedGlobal.macro.upDirectionalScore, A_baseline: syncGlobal.macro.upDirectionalScore },
        downDirectionalScore: { A: fixedGlobal.macro.downDirectionalScore, A_baseline: syncGlobal.macro.downDirectionalScore },
        balancedDirectionalScore: { A: fixedGlobal.macro.balancedDirectionalScore, A_baseline: syncGlobal.macro.balancedDirectionalScore },
      },
      outsideExpectedDistance: {
        medianSamples: { A: fixedGlobal.outsideExpectedDistanceDistribution.medianSamples, A_baseline: syncGlobal.outsideExpectedDistanceDistribution.medianSamples },
        meanSamples: { A: fixedGlobal.outsideExpectedDistanceDistribution.meanSamples, A_baseline: syncGlobal.outsideExpectedDistanceDistribution.meanSamples },
        medianMilliseconds: { A: fixedGlobal.outsideExpectedDistanceDistribution.medianMilliseconds, A_baseline: syncGlobal.outsideExpectedDistanceDistribution.medianMilliseconds },
        meanMilliseconds: { A: fixedGlobal.outsideExpectedDistanceDistribution.meanMilliseconds, A_baseline: syncGlobal.outsideExpectedDistanceDistribution.meanMilliseconds },
      },
    },
  };
}

export function buildTimeComparison(fixedResults: readonly DatasetResult[], timeResults: readonly DatasetResult[]) {
  const comparison = buildComparison(fixedResults, timeResults);
  const pair = <T>(value: { A: T; A_baseline: T }) => ({ A: value.A, B_time: value.A_baseline });
  return {
    perDataset: comparison.perDataset.map(row => ({
      dataset: row.dataset,
      expectedCrossingInside: pair(row.expectedCrossingInside),
      upDirectionalScore: pair(row.upDirectionalScore),
      downDirectionalScore: pair(row.downDirectionalScore),
      balancedDirectionalScore: pair(row.balancedDirectionalScore),
      parasiteCrossingCount: pair(row.parasiteCrossingCount),
      outsideExpectedDistance: {
        A: row.outsideExpectedDistance.A,
        B_time: row.outsideExpectedDistance.A_baseline,
      },
    })),
    global: {
      uniqueExpectedInside: pair(comparison.global.uniqueExpectedInside),
      categoryCounts: Object.fromEntries(Object.entries(comparison.global.categoryCounts).map(([category, value]) => [category, {
        A: value.A,
        B_time: value.A_baseline,
        delta: value.delta,
      }])) as Record<PivotClassification, { A: number; B_time: number; delta: number }>,
      micro: {
        expectedCrossingInsideRate: pair(comparison.global.micro.expectedCrossingInsideRate),
        upDirectionalScore: pair(comparison.global.micro.upDirectionalScore),
        downDirectionalScore: pair(comparison.global.micro.downDirectionalScore),
        balancedDirectionalScore: pair(comparison.global.micro.balancedDirectionalScore),
        parasiteCrossingCount: pair(comparison.global.micro.parasiteCrossingCount),
      },
      macro: {
        expectedCrossingInsideRate: pair(comparison.global.macro.expectedCrossingInsideRate),
        upDirectionalScore: pair(comparison.global.macro.upDirectionalScore),
        downDirectionalScore: pair(comparison.global.macro.downDirectionalScore),
        balancedDirectionalScore: pair(comparison.global.macro.balancedDirectionalScore),
      },
      outsideExpectedDistance: {
        medianSamples: pair(comparison.global.outsideExpectedDistance.medianSamples),
        meanSamples: pair(comparison.global.outsideExpectedDistance.meanSamples),
        medianMilliseconds: pair(comparison.global.outsideExpectedDistance.medianMilliseconds),
        meanMilliseconds: pair(comparison.global.outsideExpectedDistance.meanMilliseconds),
      },
    },
  };
}

function pairPercent(pair: { A: number; A_baseline: number }): string {
  return `${percent(pair.A)} / ${percent(pair.A_baseline)}`;
}

function pairNumber(pair: { A: number | null; A_baseline: number | null }, digits = 3): string {
  return `${formatNumber(pair.A, digits)} / ${formatNumber(pair.A_baseline, digits)}`;
}

function timePairPercent(pair: { A: number; B_time: number }): string {
  return `${percent(pair.A)} / ${percent(pair.B_time)}`;
}

function timePairNumber(pair: { A: number | null; B_time: number | null }, digits = 3): string {
  return `${formatNumber(pair.A, digits)} / ${formatNumber(pair.B_time, digits)}`;
}

function buildSyncMarkdown(
  results: readonly DatasetResult[],
  global: ReturnType<typeof buildGlobalAggregate>,
  comparison: ReturnType<typeof buildComparison>,
): string {
  const categories = Object.keys(emptyCategoryCounts()) as PivotClassification[];
  const lines = [
    "# PHASE BLOCKS V2 — A-BASELINE — SYNC BASELINE", "",
    "Expérience offline sur les captures 011–020. La seule variable modifiée par rapport à A est la fenêtre utilisée pour `estimateStaticBaseline()`.", "",
    "## Configuration", "",
    "- baseline : `GT sync.baseline`, convertie de `[startSampleInclusive,endSampleInclusive]` vers `[startIndex,endIndex)` avec `endIndex=endSampleInclusive+1` ;",
    "- axe : PCA sur la capture complète ; référence `+Z` géométrique ;",
    "- sensibilité : `16384 counts/g` nominale ;",
    "- intégration : trapézoïdale existante, `dt=0.05 s` constant, `v[0]=0` ;",
    "- aucune correction de dérive, aucun reset, aucun gyroscope, aucune intégration par timestamps réels ;",
    "- aucune injection GT dans la vitesse, aucune inversion de polarité, aucun réglage par dataset ;",
    "- convention : `UP => velocity > 0`, `DOWN => velocity < 0`.", "",
    "## Baselines utilisées", "",
    markdownTable(
      ["Dataset", "Début inclus", "Fin incluse", "Fin exclusive", "Samples", "Mean ax", "Mean ay", "Mean az"],
      results.map(result => [
        result.id,
        result.baselineWindow.startSampleInclusive,
        result.baselineWindow.endSampleInclusive,
        result.baselineWindow.endSampleExclusive,
        result.baselineWindow.sampleCount,
        formatNumber(result.baseline.x),
        formatNumber(result.baseline.y),
        formatNumber(result.baseline.z),
      ])), "",
    "## Résultats A-baseline par dataset", "",
    markdownTable(
      ["Dataset", "Unique", "Multi", "Mauvais sens", "Avant", "Après", "Absent", "Attendu dedans", "UP", "DOWN", "Équilibré", "Parasites", "Distance moyenne hors fenêtre"],
      results.map(result => [
        result.id,
        result.aggregate.categoryCounts.UNIQUE_EXPECTED_INSIDE,
        result.aggregate.categoryCounts.MULTIPLE_OR_AMBIGUOUS,
        result.aggregate.categoryCounts.WRONG_DIRECTION_INSIDE,
        result.aggregate.categoryCounts.OUTSIDE_BEFORE,
        result.aggregate.categoryCounts.OUTSIDE_AFTER,
        result.aggregate.categoryCounts.NO_CROSSING,
        result.aggregate.expectedCrossingInsideCount,
        percent(result.aggregate.upDirectionalScore),
        percent(result.aggregate.downDirectionalScore),
        percent(result.aggregate.balancedDirectionalScore),
        result.aggregate.parasiteCrossingCount,
        `${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceSamples, 3)} samples / ${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceMilliseconds, 2)} ms`,
      ])), "",
    "## Comparaison A / A-baseline par dataset", "",
    "Chaque cellule présente `A / A-baseline`.", "",
    markdownTable(
      ["Dataset", "Attendu dedans", "UP", "DOWN", "Équilibré", "Parasites", "Médiane distance", "Moyenne distance"],
      comparison.perDataset.map(row => [
        row.dataset,
        `${row.expectedCrossingInside.A} / ${row.expectedCrossingInside.A_baseline}`,
        pairPercent(row.upDirectionalScore),
        pairPercent(row.downDirectionalScore),
        pairPercent(row.balancedDirectionalScore),
        `${row.parasiteCrossingCount.A} / ${row.parasiteCrossingCount.A_baseline}`,
        `${pairNumber({ A: row.outsideExpectedDistance.A.medianSamples, A_baseline: row.outsideExpectedDistance.A_baseline.medianSamples })} samples`,
        `${pairNumber({ A: row.outsideExpectedDistance.A.meanSamples, A_baseline: row.outsideExpectedDistance.A_baseline.meanSamples })} samples`,
      ])), "",
    "## Comparaison globale A / A-baseline", "",
    "Chaque cellule présente `A / A-baseline`.", "",
    markdownTable(
      ["Mesure", "A / A-baseline"],
      [
        ["UNIQUE_EXPECTED_INSIDE", `${comparison.global.uniqueExpectedInside.A} / ${comparison.global.uniqueExpectedInside.A_baseline}`],
        ["Taux micro crossing attendu dedans", pairPercent(comparison.global.micro.expectedCrossingInsideRate)],
        ["Taux macro crossing attendu dedans", pairPercent(comparison.global.macro.expectedCrossingInsideRate)],
        ["UP micro", pairPercent(comparison.global.micro.upDirectionalScore)],
        ["DOWN micro", pairPercent(comparison.global.micro.downDirectionalScore)],
        ["Équilibré micro", pairPercent(comparison.global.micro.balancedDirectionalScore)],
        ["UP macro", pairPercent(comparison.global.macro.upDirectionalScore)],
        ["DOWN macro", pairPercent(comparison.global.macro.downDirectionalScore)],
        ["Équilibré macro", pairPercent(comparison.global.macro.balancedDirectionalScore)],
        ["Crossings parasites", `${comparison.global.micro.parasiteCrossingCount.A} / ${comparison.global.micro.parasiteCrossingCount.A_baseline}`],
        ["Médiane distance hors fenêtre", `${pairNumber(comparison.global.outsideExpectedDistance.medianSamples)} samples / ${pairNumber(comparison.global.outsideExpectedDistance.medianMilliseconds, 2)} ms`],
        ["Moyenne distance hors fenêtre", `${pairNumber(comparison.global.outsideExpectedDistance.meanSamples)} samples / ${pairNumber(comparison.global.outsideExpectedDistance.meanMilliseconds, 2)} ms`],
      ]), "",
    "### Évolution des catégories", "",
    markdownTable(
      ["Catégorie", "A", "A-baseline", "Delta"],
      categories.map(category => {
        const value = comparison.global.categoryCounts[category];
        return [category, value.A, value.A_baseline, value.delta];
      })), "",
    `A-baseline contient **${global.boundedWindowCount}** fenêtres bornées et **${global.b6Count}** B6 descriptifs. Les B6 restent exclus des taux de fenêtre.`, "",
    "## Sources", "",
    markdownTable(
      ["Dataset", "Capture", "SHA-256 capture", "Ground Truth", "SHA-256 GT"],
      results.map(result => [result.id, `\`${result.datasetSource.path}\``, `\`${result.datasetSource.sha256}\``, `\`${result.groundTruthSource.path}\``, `\`${result.groundTruthSource.sha256}\``]),
    ), "",
    "## Reproduction", "",
    "```powershell", SYNC_BASELINE_REPRODUCTION_COMMAND, "```", "",
    "Les rapports historiques n'incluent pas de date d'exécution ; ce rapport déterministe n'en ajoute pas.", "",
  ];
  return lines.join("\n");
}

function buildTimeMarkdown(
  results: readonly DatasetResult[],
  global: ReturnType<typeof buildGlobalAggregate>,
  comparison: ReturnType<typeof buildTimeComparison>,
): string {
  const categories = Object.keys(emptyCategoryCounts()) as PivotClassification[];
  const lines = [
    "# PHASE BLOCKS V2 — B-TIME — REAL TIMESTAMPS", "",
    "Expérience offline sur les captures 011–020. La seule variable modifiée par rapport à A est le dt de chaque intervalle d'intégration.", "",
    "## Configuration", "",
    "- baseline : `[0,100)` ;",
    "- axe : PCA sur la capture complète ; référence `+Z` géométrique ;",
    "- sensibilité : `16384 counts/g` nominale ;",
    "- intégration : trapézoïdale existante avec `dt[i]=unsignedDelta(timestampMs[i],timestampMs[i-1])/1000` ;",
    "- condition initiale : `v[0]=0` ;",
    "- aucune correction de dérive, aucun reset, aucun gyroscope, aucune baseline `sync` ;",
    "- aucune injection GT, aucune inversion de polarité, aucun réglage par dataset ;",
    "- convention : `UP => velocity > 0`, `DOWN => velocity < 0`.", "",
    "## Statistiques temporelles", "",
    markdownTable(
      ["Dataset", "Min dt", "Max dt", "Mean dt", "Median dt", "Durée réelle", "Durée théorique", "Différence cumulée"],
      results.map(result => {
        assert.notEqual(result.timing, null);
        const timing = result.timing!;
        return [
          result.id,
          formatNumber(timing.minDtSeconds, 6),
          formatNumber(timing.maxDtSeconds, 6),
          formatNumber(timing.meanDtSeconds, 9),
          formatNumber(timing.medianDtSeconds, 6),
          formatNumber(timing.actualDurationSeconds, 6),
          formatNumber(timing.theoreticalDurationSeconds, 6),
          formatNumber(timing.cumulativeDifferenceSeconds, 6),
        ];
      })), "",
    "Toutes les durées sont exprimées en secondes. Ces métriques sont descriptives.", "",
    "## Résultats B-time par dataset", "",
    markdownTable(
      ["Dataset", "Unique", "Multi", "Mauvais sens", "Avant", "Après", "Absent", "Attendu dedans", "UP", "DOWN", "Équilibré", "Parasites", "Distance moyenne hors fenêtre"],
      results.map(result => [
        result.id,
        result.aggregate.categoryCounts.UNIQUE_EXPECTED_INSIDE,
        result.aggregate.categoryCounts.MULTIPLE_OR_AMBIGUOUS,
        result.aggregate.categoryCounts.WRONG_DIRECTION_INSIDE,
        result.aggregate.categoryCounts.OUTSIDE_BEFORE,
        result.aggregate.categoryCounts.OUTSIDE_AFTER,
        result.aggregate.categoryCounts.NO_CROSSING,
        result.aggregate.expectedCrossingInsideCount,
        percent(result.aggregate.upDirectionalScore),
        percent(result.aggregate.downDirectionalScore),
        percent(result.aggregate.balancedDirectionalScore),
        result.aggregate.parasiteCrossingCount,
        `${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceSamples, 3)} samples / ${formatNumber(result.aggregate.meanAbsoluteOutsideExpectedDistanceMilliseconds, 2)} ms`,
      ])), "",
    "## Comparaison A / B-time par dataset", "",
    "Chaque cellule présente `A / B-time`.", "",
    markdownTable(
      ["Dataset", "Attendu dedans", "UP", "DOWN", "Équilibré", "Parasites", "Médiane distance", "Moyenne distance"],
      comparison.perDataset.map(row => [
        row.dataset,
        `${row.expectedCrossingInside.A} / ${row.expectedCrossingInside.B_time}`,
        timePairPercent(row.upDirectionalScore),
        timePairPercent(row.downDirectionalScore),
        timePairPercent(row.balancedDirectionalScore),
        `${row.parasiteCrossingCount.A} / ${row.parasiteCrossingCount.B_time}`,
        `${timePairNumber({ A: row.outsideExpectedDistance.A.medianSamples, B_time: row.outsideExpectedDistance.B_time.medianSamples })} samples`,
        `${timePairNumber({ A: row.outsideExpectedDistance.A.meanSamples, B_time: row.outsideExpectedDistance.B_time.meanSamples })} samples`,
      ])), "",
    "## Comparaison globale A / B-time", "",
    "Chaque cellule présente `A / B-time`.", "",
    markdownTable(
      ["Mesure", "A / B-time"],
      [
        ["UNIQUE_EXPECTED_INSIDE", `${comparison.global.uniqueExpectedInside.A} / ${comparison.global.uniqueExpectedInside.B_time}`],
        ["Taux micro crossing attendu dedans", timePairPercent(comparison.global.micro.expectedCrossingInsideRate)],
        ["Taux macro crossing attendu dedans", timePairPercent(comparison.global.macro.expectedCrossingInsideRate)],
        ["UP micro", timePairPercent(comparison.global.micro.upDirectionalScore)],
        ["DOWN micro", timePairPercent(comparison.global.micro.downDirectionalScore)],
        ["Équilibré micro", timePairPercent(comparison.global.micro.balancedDirectionalScore)],
        ["UP macro", timePairPercent(comparison.global.macro.upDirectionalScore)],
        ["DOWN macro", timePairPercent(comparison.global.macro.downDirectionalScore)],
        ["Équilibré macro", timePairPercent(comparison.global.macro.balancedDirectionalScore)],
        ["Crossings parasites", `${comparison.global.micro.parasiteCrossingCount.A} / ${comparison.global.micro.parasiteCrossingCount.B_time}`],
        ["Médiane distance hors fenêtre", `${timePairNumber(comparison.global.outsideExpectedDistance.medianSamples)} samples / ${timePairNumber(comparison.global.outsideExpectedDistance.medianMilliseconds, 2)} ms`],
        ["Moyenne distance hors fenêtre", `${timePairNumber(comparison.global.outsideExpectedDistance.meanSamples)} samples / ${timePairNumber(comparison.global.outsideExpectedDistance.meanMilliseconds, 2)} ms`],
      ]), "",
    "### Évolution des catégories", "",
    markdownTable(
      ["Catégorie", "A", "B-time", "Delta"],
      categories.map(category => {
        const value = comparison.global.categoryCounts[category];
        return [category, value.A, value.B_time, value.delta];
      })), "",
    `B-time contient **${global.boundedWindowCount}** fenêtres bornées et **${global.b6Count}** B6 descriptifs. Les B6 restent exclus des taux de fenêtre.`, "",
    "## Sources", "",
    markdownTable(
      ["Dataset", "Capture", "SHA-256 capture", "Ground Truth", "SHA-256 GT"],
      results.map(result => [result.id, `\`${result.datasetSource.path}\``, `\`${result.datasetSource.sha256}\``, `\`${result.groundTruthSource.path}\``, `\`${result.groundTruthSource.sha256}\``]),
    ), "",
    "## Reproduction", "",
    "```powershell", REAL_TIME_REPRODUCTION_COMMAND, "```", "",
    "Les rapports historiques n'incluent pas de date d'exécution ; ce rapport déterministe n'en ajoute pas.", "",
  ];
  return lines.join("\n");
}

function pivotCsvRows(results: readonly DatasetResult[]): Record<string, unknown>[] {
  return results.flatMap(result => [
    ...result.boundedPivots.map(pivot => ({
      dataset: pivot.dataset,
      label: pivot.label,
      type: pivot.type,
      rep: pivot.rep,
      arrivalTimeSeconds: pivot.arrivalTimeSeconds,
      departureTimeSeconds: pivot.departureTimeSeconds,
      arrivalSampleFloat: pivot.arrivalSampleFloat,
      departureSampleFloat: pivot.departureSampleFloat,
      expectedCrossingDirection: pivot.expectedCrossingDirection,
      classification: pivot.classification,
      crossingsInWindowCount: pivot.crossingsInWindow.length,
      expectedCrossingsInWindowCount: pivot.expectedCrossingsInWindow.length,
      wrongDirectionCrossingsInWindowCount: pivot.wrongDirectionCrossingsInWindow.length,
      crossingsInWindow: pivot.crossingsInWindow,
      nearestExpectedBefore: pivot.nearestExpectedBefore,
      nearestExpectedAfter: pivot.nearestExpectedAfter,
      nearestExpectedCrossing: pivot.nearestExpectedCrossing,
      signedDistanceSamples: pivot.signedDistanceToWindowSamples,
      signedDistanceMilliseconds: pivot.signedDistanceToWindowMilliseconds,
      arrivalVelocity: null,
      arrivalVelocitySign: null,
      incomingPhase: null,
      incomingPhaseExpectedSignProportion: null,
    })),
    {
      dataset: result.b6.dataset,
      label: result.b6.label,
      type: result.b6.type,
      rep: result.b6.rep,
      arrivalTimeSeconds: result.b6.arrivalTimeSeconds,
      departureTimeSeconds: null,
      arrivalSampleFloat: result.b6.arrivalSampleFloat,
      departureSampleFloat: null,
      expectedCrossingDirection: result.b6.expectedCrossingDirection,
      classification: null,
      crossingsInWindowCount: result.b6.expectedCrossingsAtArrival.length,
      expectedCrossingsInWindowCount: result.b6.expectedCrossingsAtArrival.length,
      wrongDirectionCrossingsInWindowCount: null,
      crossingsInWindow: result.b6.expectedCrossingsAtArrival,
      nearestExpectedBefore: result.b6.nearestExpectedBefore,
      nearestExpectedAfter: result.b6.nearestExpectedAfter,
      nearestExpectedCrossing: result.b6.nearestExpectedCrossing,
      signedDistanceSamples: result.b6.signedDistanceToArrivalSamples,
      signedDistanceMilliseconds: result.b6.signedDistanceToArrivalMilliseconds,
      arrivalVelocity: result.b6.arrivalVelocity,
      arrivalVelocitySign: result.b6.arrivalVelocitySign,
      incomingPhase: result.b6.incomingPhase,
      incomingPhaseExpectedSignProportion: result.b6.incomingPhaseObservedExpectedSignProportion,
    },
  ]);
}

const PIVOT_CSV_HEADERS = [
  "dataset", "label", "type", "rep", "arrivalTimeSeconds", "departureTimeSeconds",
  "arrivalSampleFloat", "departureSampleFloat", "expectedCrossingDirection", "classification",
  "crossingsInWindowCount", "expectedCrossingsInWindowCount", "wrongDirectionCrossingsInWindowCount",
  "crossingsInWindow", "nearestExpectedBefore", "nearestExpectedAfter", "nearestExpectedCrossing",
  "signedDistanceSamples", "signedDistanceMilliseconds", "arrivalVelocity", "arrivalVelocitySign",
  "incomingPhase", "incomingPhaseExpectedSignProportion",
] as const;

const PHASE_CSV_HEADERS = [
  "dataset", "label", "phase", "expectedVelocitySign", "startSampleFloat", "endSampleFloat",
  "startTimeSeconds", "endTimeSeconds", "sampleCount", "positiveCount", "negativeCount", "zeroCount",
  "expectedSignCount", "expectedSignProportion", "meanVelocity", "minVelocity", "maxVelocity",
  "parasiteCrossingCount", "parasiteCrossings",
] as const;

export function buildBaselineResults(variant: ExperimentVariant = "fixed"): DatasetResult[] {
  const results = DATASET_IDS.map(id => diagnoseDataset(id, variant));
  assert.equal(results.reduce((sum, result) => sum + result.boundedPivots.length, 0), 100);
  assert.equal(results.reduce((sum, result) => sum + result.phases.length, 0), 100);
  assert.equal(results.filter(result => result.b6 !== null).length, 10);
  return results;
}

function snapshotOutputFiles(directory: URL): Map<string, string | null> {
  return new Map(OUTPUT_FILENAMES.map(filename => {
    try {
      return [filename, sha256(readFileSync(new URL(filename, directory)))] as const;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [filename, null] as const;
      throw error;
    }
  }));
}

function assertOutputSnapshotUnchanged(directory: URL, before: ReadonlyMap<string, string | null>): void {
  const after = snapshotOutputFiles(directory);
  for (const filename of OUTPUT_FILENAMES) {
    assert.equal(after.get(filename), before.get(filename), `Protected output was modified: ${fileURLToPath(directory)}${filename}`);
  }
}

function variantFromArguments(arguments_: readonly string[]): ExperimentVariant {
  assert.ok(
    arguments_.length === 0 || (arguments_.length === 1 && ["--baseline=fixed", "--baseline=sync", "--time=real"].includes(arguments_[0])),
    `Usage: ${BASELINE_REPRODUCTION_COMMAND} [--baseline=fixed|--baseline=sync|--time=real]`,
  );
  if (arguments_[0] === "--time=real") return "time";
  return arguments_[0] === "--baseline=sync" ? "sync" : "fixed";
}

export function main(variant: ExperimentVariant = variantFromArguments(process.argv.slice(2))): void {
  const protectedOutputSnapshots = variant === "sync"
    ? [[BASELINE_OUTPUT, snapshotOutputFiles(BASELINE_OUTPUT)] as const]
    : variant === "time"
      ? [
          [BASELINE_OUTPUT, snapshotOutputFiles(BASELINE_OUTPUT)] as const,
          [SYNC_BASELINE_OUTPUT, snapshotOutputFiles(SYNC_BASELINE_OUTPUT)] as const,
        ]
      : [];
  const results = buildBaselineResults(variant);
  const global = buildGlobalAggregate(results);
  const fixedResults = variant === "fixed" ? results : buildBaselineResults("fixed");
  const syncComparison = variant === "sync" ? buildComparison(fixedResults, results) : null;
  const timeComparison = variant === "time" ? buildTimeComparison(fixedResults, results) : null;
  const output = outputDirectoryFor(variant);
  const outputResults = results.map(result => {
    if (variant === "time") return result;
    const { timing: _timing, ...withoutTiming } = result;
    if (variant === "sync") return withoutTiming;
    const { baselineWindow: _baselineWindow, ...historicalResult } = withoutTiming;
    return historicalResult;
  });
  const commonEvaluation = {
    nearestExpectedCrossingSearch: "full capture, no maximum distance, no one-to-one matching",
    equidistantExpectedCrossings: "explicit failure; no silent tie-break",
    transitionTruth: "[arrivalSampleFloat, departureSampleFloat]",
    windowMidpointUsed: false,
  };
  let summary: unknown;
  let markdown: string;
  if (variant === "fixed") {
    summary = {
      title: "PHASE BLOCKS V2 — BASELINE A — ACCEL ONLY",
      configuration: {
        baselineWindow: FIXED_BASELINE_WINDOW,
        axisStrategy: SHARED_CONFIG.axisStrategy,
        countsPerG: SHARED_CONFIG.countsPerG,
        dtSeconds: DT_SECONDS,
        initialVelocity: 0,
        integration: "existing trapezoidal estimateVelocity",
        driftCorrection: false,
        velocityReset: false,
        gyroUsed: false,
        timestampMsUsedForIntegration: false,
        syncBaselineUsed: false,
        groundTruthInjectedIntoSignal: false,
        phaseSignConvention: { UP: "velocity > 0", DOWN: "velocity < 0" },
        evaluation: commonEvaluation,
      },
      datasets: [...DATASET_IDS],
      reproductionCommand: BASELINE_REPRODUCTION_COMMAND,
      global,
      results: outputResults,
    };
    markdown = buildFixedMarkdown(results, global);
  } else if (variant === "sync") {
    summary = {
      title: "PHASE BLOCKS V2 — A-BASELINE — SYNC BASELINE",
      configuration: {
        baselineWindow: "GT sync.baseline: inclusive bounds converted to [start, end + 1)",
        axisStrategy: SHARED_CONFIG.axisStrategy,
        countsPerG: SHARED_CONFIG.countsPerG,
        dtSeconds: DT_SECONDS,
        initialVelocity: 0,
        integration: "existing trapezoidal estimateVelocity",
        driftCorrection: false,
        velocityReset: false,
        gyroUsed: false,
        timestampMsUsedForIntegration: false,
        syncBaselineUsed: true,
        groundTruthPivotsInjectedIntoSignal: false,
        phaseSignConvention: { UP: "velocity > 0", DOWN: "velocity < 0" },
        evaluation: commonEvaluation,
      },
      datasets: [...DATASET_IDS],
      reproductionCommand: SYNC_BASELINE_REPRODUCTION_COMMAND,
      global,
      comparisonToA: syncComparison,
      results: outputResults,
    };
    markdown = buildSyncMarkdown(results, global, syncComparison!);
  } else {
    summary = {
      title: "PHASE BLOCKS V2 — B-TIME — REAL TIMESTAMPS",
      configuration: {
        baselineWindow: FIXED_BASELINE_WINDOW,
        axisStrategy: SHARED_CONFIG.axisStrategy,
        countsPerG: SHARED_CONFIG.countsPerG,
        dtSeconds: "unsigned timestampMs delta / 1000 for each interval",
        initialVelocity: 0,
        integration: "trapezoidal estimateVelocityWithIntervalDts",
        driftCorrection: false,
        velocityReset: false,
        gyroUsed: false,
        timestampMsUsedForIntegration: true,
        syncBaselineUsed: false,
        groundTruthInjectedIntoSignal: false,
        phaseSignConvention: { UP: "velocity > 0", DOWN: "velocity < 0" },
        evaluation: commonEvaluation,
      },
      datasets: [...DATASET_IDS],
      reproductionCommand: REAL_TIME_REPRODUCTION_COMMAND,
      global,
      comparisonToA: timeComparison,
      results: outputResults,
    };
    markdown = buildTimeMarkdown(results, global, timeComparison!);
  }

  mkdirSync(output, { recursive: true });
  writeFileSync(new URL("summary.json", output), JSON.stringify(summary, null, 2) + "\n");
  writeFileSync(new URL("summary.md", output), markdown);
  writeFileSync(new URL("pivot-results.csv", output), csv(PIVOT_CSV_HEADERS, pivotCsvRows(results)));
  writeFileSync(new URL("phase-results.csv", output), csv(PHASE_CSV_HEADERS, results.flatMap(result => result.phases)));

  for (const result of results) {
    for (const source of [result.datasetSource, result.groundTruthSource]) {
      assert.equal(sha256(readFileSync(new URL(source.path, ROOT))), source.sha256, `Source changed during benchmark: ${source.path}`);
    }
  }
  protectedOutputSnapshots.forEach(([directory, snapshot]) => assertOutputSnapshotUnchanged(directory, snapshot));
  console.log(JSON.stringify({
    variant,
    output: fileURLToPath(output),
    datasetAggregates: results.map(result => result.aggregate),
    global,
    comparisonToA: syncComparison ?? timeComparison,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
