import fs from "fs";
import path from "path";
import zlib from "zlib";
import {
  calculateCalibration,
  type CalibrationDataset,
} from "../../mobile/RepMotion/analytics/calibration";

type EventType = "BOTTOM" | "TOP";

type GroundTruthAnnotation = {
  type: EventType;
  rep: number;
  videoTimeSeconds: number;
};

type GroundTruthFile = {
  dataset: string;
  video: string;
  exercise: string;
  performedReps: number;
  videoFps: number;
  annotationMethod: string;
  sync: {
    type: string;
    videoTimeSeconds: number;
    imuSampleIndex: number;
    notes?: string;
  };
  events: GroundTruthAnnotation[];
};

type TransitionGroundTruthAnnotation = {
  type: EventType;
  rep: number;
  arrivalTimeSeconds: number;
  departureTimeSeconds: number | null;
};

type TransitionGroundTruthFile = Omit<GroundTruthFile, "events" | "sync"> & {
  sync: {
    videoTimeSeconds: number;
    imuSampleIndex: number;
    description?: string;
  };
  events: TransitionGroundTruthAnnotation[];
};

type ValidationErrorCode =
  | "DATASET_NOT_FOUND"
  | "ANNOTATION_FILE_NOT_FOUND"
  | "POINT_ANNOTATION_FILE_NOT_FOUND"
  | "TRANSITION_ANNOTATION_FILE_NOT_FOUND"
  | "INVALID_SYNC_CONFIGURATION"
  | "INVALID_ANNOTATION_SEQUENCE"
  | "INVALID_TRANSITION_SEQUENCE"
  | "INVALID_TRANSITION_WINDOW"
  | "GLOBAL_PATH_NOT_FOUND"
  | "INVALID_GLOBAL_CHAIN"
  | "GROUND_TRUTH_INDEX_OUT_OF_RANGE"
  | "DP_REPLAY_MISMATCH"
  | "INJECTED_POPULATION_MISMATCH"
  | "WINNER_PATH_MISMATCH"
  | "WINNER_SCORE_MISMATCH"
  | "DP_SCORE_REPLAY_MISMATCH"
  | "GROUND_TRUTH_TRACE_ERROR"
  | "DOMINANCE_TRACE_ERROR"
  | "GROUND_TRUTH_PATH_MISMATCH"
  | "INVALID_PATH_STRUCTURE"
  | "FEATURE_CALCULATION_ERROR"
  | "EXPERIMENT_REPLAY_MISMATCH"
  | "TERMINAL_PATH_COUNT_MISMATCH"
  | "FEATURE_DEFINITION_MISMATCH"
  | "NORMALIZATION_ERROR"
  | "PATH_RANKING_ERROR"
  | "TOP_K_K1_PARITY_MISMATCH"
  | "TOP_K_BUCKET_INTEGRITY_ERROR"
  | "DUPLICATE_PATH_STATE_ERROR"
  | "TERMINAL_RECONSTRUCTION_ERROR"
  | "CANDIDATE_IDENTITY_ERROR"
  | "DATA_INTEGRITY_ERROR";

const DATASET_NAME = "rowing_5reps_007.json";
const EXPECTED_REPS = 5;
const EXPECTED_EVENT_COUNT = EXPECTED_REPS * 2 + 1;
const VALIDATION_MODE:
  | "POINT"
  | "TRANSITION"
  | "DP_ISOLATION"
  | "DP_GROUND_TRUTH_INJECTION"
  | "DP_SCORE_DECOMPOSITION"
  | "DP_V2_FEATURE_ANALYSIS"
  | "DP_V2_PATH_RANKING_ANALYSIS"
  | "DP_V2_TOP_K_SEARCH_DIAGNOSTIC" =
  "DP_V2_TOP_K_SEARCH_DIAGNOSTIC";
const RAW_WINDOW_START_INDEX = 100;
const RAW_WINDOW_END_INDEX = 169;
const DATASET_PATH = path.resolve(
  __dirname,
  "../../datasets/calibration/rowing",
  DATASET_NAME,
);
const ANNOTATION_PATH = path.resolve(
  __dirname,
  "../../datasets/ground-truth",
  "rowing_5reps_007.annotations.json",
);
const TRANSITION_ANNOTATION_PATH = path.resolve(
  __dirname,
  "../../datasets/ground-truth",
  "rowing_5reps_007.transition-annotations.json",
);

const CALIBRATION_PARAMETERS = {
  rawDetectionStrategy: "local_extrema" as const,
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
  selectionStrategy: "global_alternating_path" as const,
};

class ValidationError extends Error {
  constructor(
    readonly code: ValidationErrorCode,
    detail: string,
  ) {
    super(detail);
  }
}

type RGB = [number, number, number];
type LocalAzExtremum = {
  index: number;
  type: "LOCAL_MAXIMUM" | "LOCAL_MINIMUM";
  relativeTimeSeconds: number;
  az: number;
};

const FONT: Record<string, string[]> = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "-": ["000", "000", "000", "111", "000", "000", "000"],
  "+": ["000", "010", "010", "111", "010", "010", "000"],
  "=": ["000", "000", "111", "000", "111", "000", "000"],
  ".": ["000", "000", "000", "000", "000", "010", "010"],
  "_": ["000", "000", "000", "000", "000", "000", "111"],
  ":": ["000", "010", "000", "000", "010", "000", "000"],
  "0": ["111", "101", "101", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["111", "001", "001", "111", "100", "100", "111"],
  "3": ["111", "001", "001", "111", "001", "001", "111"],
  "4": ["101", "101", "101", "111", "001", "001", "001"],
  "5": ["111", "100", "100", "111", "001", "001", "111"],
  "6": ["111", "100", "100", "111", "101", "101", "111"],
  "7": ["111", "001", "001", "010", "010", "010", "010"],
  "8": ["111", "101", "101", "111", "101", "101", "111"],
  "9": ["111", "101", "101", "111", "001", "001", "111"],
  A: ["010", "101", "101", "111", "101", "101", "101"],
  B: ["110", "101", "101", "110", "101", "101", "110"],
  C: ["111", "100", "100", "100", "100", "100", "111"],
  D: ["110", "101", "101", "101", "101", "101", "110"],
  E: ["111", "100", "100", "110", "100", "100", "111"],
  F: ["111", "100", "100", "110", "100", "100", "100"],
  G: ["111", "100", "100", "101", "101", "101", "111"],
  H: ["101", "101", "101", "111", "101", "101", "101"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  L: ["100", "100", "100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101", "101", "101"],
  N: ["101", "111", "111", "111", "111", "111", "101"],
  O: ["111", "101", "101", "101", "101", "101", "111"],
  P: ["110", "101", "101", "110", "100", "100", "100"],
  R: ["110", "101", "101", "110", "101", "101", "101"],
  S: ["111", "100", "100", "111", "001", "001", "111"],
  T: ["111", "010", "010", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "101", "101", "010"],
  X: ["101", "101", "010", "010", "010", "101", "101"],
  Y: ["101", "101", "101", "010", "010", "010", "010"],
  Z: ["111", "001", "001", "010", "100", "100", "111"],
};

class Raster {
  readonly pixels: Uint8Array;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.pixels = new Uint8Array(width * height * 3);
    this.pixels.fill(255);
  }

  point(x: number, y: number, color: RGB): void {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    if (
      roundedX < 0 ||
      roundedY < 0 ||
      roundedX >= this.width ||
      roundedY >= this.height
    ) {
      return;
    }

    this.pixels.set(
      color,
      (roundedY * this.width + roundedX) * 3,
    );
  }

  line(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: RGB,
  ): void {
    const steps = Math.max(
      Math.abs(x1 - x0),
      Math.abs(y1 - y0),
      1,
    );

    for (let step = 0; step <= steps; step += 1) {
      const ratio = step / steps;
      this.point(
        x0 + (x1 - x0) * ratio,
        y0 + (y1 - y0) * ratio,
        color,
      );
    }
  }

  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: RGB,
  ): void {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) {
        this.point(column, row, color);
      }
    }
  }

  text(
    x: number,
    y: number,
    value: string,
    color: RGB,
    scale = 2,
  ): void {
    let cursor = x;
    for (const character of value.toUpperCase()) {
      const glyph = FONT[character] ?? FONT[" "];
      glyph.forEach((row, rowIndex) =>
        [...row].forEach((bit, columnIndex) => {
          if (bit === "1") {
            this.rectangle(
              cursor + columnIndex * scale,
              y + rowIndex * scale,
              scale,
              scale,
              color,
            );
          }
        }),
      );
      cursor += 4 * scale;
    }
  }

  marker(
    x: number,
    y: number,
    shape: "up" | "down" | "circle" | "square",
    color: RGB,
  ): void {
    for (let row = -5; row <= 5; row += 1) {
      for (let column = -5; column <= 5; column += 1) {
        const inside =
          shape === "circle"
            ? row * row + column * column <= 25
            : shape === "square"
              ? true
              : shape === "up"
            ? Math.abs(column) <= (row + 5) / 2
            : Math.abs(column) <= (5 - row) / 2;
        if (inside) this.point(x + column, y + row, color);
      }
    }
  }

  writePng(filePath: string): void {
    const scanlineLength = this.width * 3 + 1;
    const scanlines = Buffer.alloc(scanlineLength * this.height);

    for (let y = 0; y < this.height; y += 1) {
      const destination = y * scanlineLength;
      scanlines[destination] = 0;
      Buffer.from(
        this.pixels.subarray(
          y * this.width * 3,
          (y + 1) * this.width * 3,
        ),
      ).copy(scanlines, destination + 1);
    }

    const header = Buffer.alloc(13);
    header.writeUInt32BE(this.width, 0);
    header.writeUInt32BE(this.height, 4);
    header.set([8, 2, 0, 0, 0], 8);

    fs.writeFileSync(
      filePath,
      Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        pngChunk("IHDR", header),
        pngChunk("IDAT", zlib.deflateSync(scanlines)),
        pngChunk("IEND", Buffer.alloc(0)),
      ]),
    );
  }
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type);
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(
    crc32(Buffer.concat([typeBuffer, data])),
    data.length + 8,
  );
  return chunk;
}

function findSimpleAzExtrema(
  samples: CalibrationDataset["samples"],
): LocalAzExtremum[] {
  const extrema: LocalAzExtremum[] = [];

  for (
    let index = RAW_WINDOW_START_INDEX + 1;
    index < RAW_WINDOW_END_INDEX;
    index += 1
  ) {
    const previous = samples[index - 1].az;
    const current = samples[index].az;
    const next = samples[index + 1].az;

    if (current > previous && current > next) {
      extrema.push({
        index,
        type: "LOCAL_MAXIMUM",
        relativeTimeSeconds: index / 20,
        az: current,
      });
    } else if (current < previous && current < next) {
      extrema.push({
        index,
        type: "LOCAL_MINIMUM",
        relativeTimeSeconds: index / 20,
        az: current,
      });
    }
  }

  return extrema;
}

function renderRawSignalWindow(
  samples: CalibrationDataset["samples"],
  firstGlobalBottomIndex: number,
  outputPath: string,
): void {
  const image = new Raster(1600, 960);
  const left = 80;
  const right = 1540;
  const panelHeight = 250;
  const panels = [
    { axis: "az" as const, color: [30, 80, 210] as RGB, label: "AZ BRUT" },
    { axis: "ax" as const, color: [210, 40, 40] as RGB, label: "AX BRUT" },
    { axis: "ay" as const, color: [20, 145, 70] as RGB, label: "AY BRUT" },
  ];
  const extrema = findSimpleAzExtrema(samples);
  const x = (index: number) =>
    left +
    ((index - RAW_WINDOW_START_INDEX) /
      (RAW_WINDOW_END_INDEX - RAW_WINDOW_START_INDEX)) *
      (right - left);

  panels.forEach((panel, panelIndex) => {
    const top = 55 + panelIndex * 300;
    const bottom = top + panelHeight;
    const values = samples
      .slice(RAW_WINDOW_START_INDEX, RAW_WINDOW_END_INDEX + 1)
      .map((sample) => sample[panel.axis]);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const padding = Math.max((maximum - minimum) * 0.08, 1);
    const yMinimum = minimum - padding;
    const yMaximum = maximum + padding;
    const y = (value: number) =>
      bottom -
      ((value - yMinimum) / (yMaximum - yMinimum)) *
        panelHeight;

    image.line(left, top, left, bottom, [0, 0, 0]);
    image.line(left, bottom, right, bottom, [0, 0, 0]);
    image.text(18, top + 8, panel.label, panel.color, 2);

    for (
      let index = RAW_WINDOW_START_INDEX + 1;
      index <= RAW_WINDOW_END_INDEX;
      index += 1
    ) {
      image.line(
        x(index - 1),
        y(samples[index - 1][panel.axis]),
        x(index),
        y(samples[index][panel.axis]),
        panel.color,
      );
    }

    const bottomX = x(firstGlobalBottomIndex);
    image.line(bottomX, top, bottomX, bottom, [0, 0, 0]);
    image.text(right - 190, top + 8, "FIRST GLOBAL BOTTOM 169", [0, 0, 0], 1);

    for (
      let tick = RAW_WINDOW_START_INDEX;
      tick <= RAW_WINDOW_END_INDEX;
      tick += 5
    ) {
      const tickX = x(tick);
      image.line(tickX, bottom, tickX, bottom + 7, [0, 0, 0]);
      image.text(tickX - 10, bottom + 12, String(tick), [0, 0, 0], 1);
    }
    if ((RAW_WINDOW_END_INDEX - RAW_WINDOW_START_INDEX) % 5 !== 0) {
      image.line(right, bottom, right, bottom + 7, [0, 0, 0]);
      image.text(right - 10, bottom + 12, String(RAW_WINDOW_END_INDEX), [0, 0, 0], 1);
    }

    if (panel.axis === "az") {
      for (const extremum of extrema) {
        const markerX = x(extremum.index);
        const markerY = y(extremum.az);
        const isMaximum = extremum.type === "LOCAL_MAXIMUM";
        const color: RGB = isMaximum ? [225, 120, 10] : [125, 35, 170];
        image.marker(markerX, markerY, isMaximum ? "up" : "down", color);
        image.text(
          markerX - 10,
          markerY + (isMaximum ? -18 : 10),
          String(extremum.index),
          color,
          1,
        );
      }
      image.marker(940, top + 18, "up", [225, 120, 10]);
      image.text(952, top + 11, "LOCAL MAXIMUM", [225, 120, 10], 1);
      image.marker(1100, top + 18, "down", [125, 35, 170]);
      image.text(1112, top + 11, "LOCAL MINIMUM", [125, 35, 170], 1);
    }
  });

  image.writePng(outputPath);
}

type ComparisonRow = {
  eventNumber: number;
  label: string;
  type: EventType;
  rep: number;
  videoTimeSeconds: number;
  expectedImuTimeSeconds: number;
  expectedImuSampleIndex: number;
  globalSampleIndex: number;
  globalImuTimeSeconds: number;
  signedErrorSamples: number;
  absoluteErrorSamples: number;
  signedErrorMilliseconds: number;
  absoluteErrorMilliseconds: number;
  withinOneSample: boolean;
  withinTwoSamples: boolean;
};

type DpCandidate = {
  candidateId: string;
  type: EventType;
  index: number;
  value: number;
};

type DpFinalPath = {
  stateId: string;
  score: number;
  chain: DpCandidate[];
};

type RankedDpPath = DpFinalPath & {
  rank: number;
  totalAbsoluteError: number;
  meanAbsoluteError: number;
  medianAbsoluteError: number;
  maxError: number;
  eventsWithinOneSample: number;
  eventsWithinTwoSamples: number;
};

type DpCandidateTrace = {
  candidateId: string;
  statesContainingAsCurrent: number;
  chainPositions: number[];
  validPredecessorStateIds: string[];
  incomingTransitionsEvaluated: number;
  incomingTransitionsAccepted: number;
  incomingTransitionsRefused: number;
  refusalCounts: Record<string, number>;
  outgoingTransitionsEvaluated: number;
  outgoingTransitionsAccepted: number;
  outgoingTransitionsRefused: number;
  outgoingRefusalCounts: Record<string, number>;
  transitionDetails: Array<{
    layer: number;
    predecessorStateId: string;
    predecessorIndex: number | null;
    accepted: boolean;
    reason: string;
    measuredDuration: number | null;
    minimumDuration: number | null;
  }>;
  dominatedStateCount: number;
  dominanceScoreDifferences: number[];
  maximumDescendantLayer: number;
};

type DpStateAttempt = {
  attemptId: number;
  step: number;
  stateId: string;
  predecessorStateId: string;
  candidateId: string;
  candidateType: EventType;
  candidateIndex: number;
  lastBottomIndex: number | null;
  score: number;
  previousScoreForSameKey: number | null;
  dominanceOutcome:
    | "STATE_CREATED_AND_KEPT"
    | "STATE_CREATED_THEN_DOMINATED"
    | "STATE_NOT_KEPT_LOWER_OR_EQUAL_SCORE";
  chainCandidateIds: string[];
};

function reconstructAllDpFinalPaths(
  candidates: DpCandidate[],
  expectedReps: number,
): {
  finalPaths: DpFinalPath[];
  candidateTraces: Map<string, DpCandidateTrace>;
  createdStates: Array<{
    stateId: string;
    score: number;
    predecessorStateId: string | null;
    candidateId: string | null;
    candidateIndex: number | null;
    chainLength: number;
  }>;
  stateAttempts: DpStateAttempt[];
} {
  type State = {
    score: number;
    predecessorKey: string | null;
    candidateIndex: number;
    lastBottomIndex: number | null;
    chainCandidateIds: string[];
  };

  const pooledCandidates = [...candidates].sort(
    (left, right) => left.index - right.index,
  );
  const targetChainLength = expectedReps * 2 + 1;
  const candidateTraces = new Map(
    pooledCandidates.map((candidate) => [
      candidate.candidateId,
      {
        candidateId: candidate.candidateId,
        statesContainingAsCurrent: 0,
        chainPositions: [],
        validPredecessorStateIds: [],
        incomingTransitionsEvaluated: 0,
        incomingTransitionsAccepted: 0,
        incomingTransitionsRefused: 0,
        refusalCounts: {},
        outgoingTransitionsEvaluated: 0,
        outgoingTransitionsAccepted: 0,
        outgoingTransitionsRefused: 0,
        outgoingRefusalCounts: {},
        transitionDetails: [],
        dominatedStateCount: 0,
        dominanceScoreDifferences: [],
        maximumDescendantLayer: 0,
      } satisfies DpCandidateTrace,
    ]),
  );
  const stateStore = new Map<string, State>();
  const stateAttempts: DpStateAttempt[] = [];
  const keptAttemptByStateId = new Map<string, DpStateAttempt>();
  let currentStates = new Map<string, State>();
  const initialStateKey = "0:-1:-1";
  const initialState: State = {
    score: 0,
    predecessorKey: null,
    candidateIndex: -1,
    lastBottomIndex: null,
    chainCandidateIds: [],
  };
  currentStates.set(initialStateKey, initialState);
  stateStore.set(initialStateKey, initialState);

  for (let step = 0; step < targetChainLength; step += 1) {
    const requiredType: EventType =
      step % 2 === 0 ? "BOTTOM" : "TOP";
    const nextStates = new Map<string, State>();

    for (const [stateKey, state] of currentStates) {
      const previousCandidate =
        state.candidateIndex >= 0
          ? pooledCandidates[state.candidateIndex]
          : null;

      for (
        let candidateIndex = 0;
        candidateIndex < pooledCandidates.length;
        candidateIndex += 1
      ) {
        const candidate = pooledCandidates[candidateIndex];
        const trace = candidateTraces.get(candidate.candidateId)!;
        const predecessorTrace = previousCandidate
          ? candidateTraces.get(previousCandidate.candidateId)!
          : null;
        trace.incomingTransitionsEvaluated += 1;
        if (predecessorTrace) {
          predecessorTrace.outgoingTransitionsEvaluated += 1;
        }
        let refusalReason: string | null = null;
        let measuredDuration: number | null = null;
        let minimumDuration: number | null = null;

        if (candidate.type !== requiredType) {
          refusalReason = "WRONG_EXPECTED_TYPE";
        } else if (
          previousCandidate &&
          candidate.index <= previousCandidate.index
        ) {
          refusalReason = "NOT_STRICTLY_AFTER_PREVIOUS";
          measuredDuration =
            candidate.index - previousCandidate.index;
        } else if (previousCandidate) {
          const transitionDuration =
            candidate.index - previousCandidate.index;
          measuredDuration = transitionDuration;
          if (
            requiredType === "TOP" &&
            transitionDuration < 8
          ) {
            refusalReason = "MIN_CONCENTRIC_DURATION_FAILED";
            minimumDuration = 8;
          } else if (
            requiredType === "BOTTOM" &&
            transitionDuration < 8
          ) {
            refusalReason = "MIN_ECCENTRIC_DURATION_FAILED";
            minimumDuration = 8;
          } else if (
            requiredType === "BOTTOM" &&
            state.lastBottomIndex !== null &&
            candidate.index - state.lastBottomIndex < 45
          ) {
            refusalReason = "MIN_REP_DURATION_FAILED";
            measuredDuration =
              candidate.index - state.lastBottomIndex;
            minimumDuration = 45;
          }
        }

        if (refusalReason) {
          trace.incomingTransitionsRefused += 1;
          trace.refusalCounts[refusalReason] =
            (trace.refusalCounts[refusalReason] ?? 0) + 1;
          trace.transitionDetails.push({
            layer: step + 1,
            predecessorStateId: stateKey,
            predecessorIndex: previousCandidate?.index ?? null,
            accepted: false,
            reason: refusalReason,
            measuredDuration,
            minimumDuration,
          });
          if (predecessorTrace) {
            predecessorTrace.outgoingTransitionsRefused += 1;
            predecessorTrace.outgoingRefusalCounts[refusalReason] =
              (predecessorTrace.outgoingRefusalCounts[
                refusalReason
              ] ?? 0) + 1;
          }
          continue;
        }
        trace.incomingTransitionsAccepted += 1;
        if (predecessorTrace) {
          predecessorTrace.outgoingTransitionsAccepted += 1;
        }
        trace.validPredecessorStateIds.push(stateKey);
        trace.transitionDetails.push({
          layer: step + 1,
          predecessorStateId: stateKey,
          predecessorIndex: previousCandidate?.index ?? null,
          accepted: true,
          reason: "ACCEPTED",
          measuredDuration,
          minimumDuration,
        });

        const nextLastBottomIndex =
          requiredType === "BOTTOM"
            ? candidate.index
            : state.lastBottomIndex;
        const nextScore =
          state.score +
          (candidate.type === "BOTTOM"
            ? -candidate.value
            : candidate.value);
        const nextKey =
          `${step + 1}:${candidateIndex}:` +
          `${nextLastBottomIndex ?? -1}`;
        const existingState = nextStates.get(nextKey);
        const attempt: DpStateAttempt = {
          attemptId: stateAttempts.length + 1,
          step: step + 1,
          stateId: nextKey,
          predecessorStateId: stateKey,
          candidateId: candidate.candidateId,
          candidateType: candidate.type,
          candidateIndex: candidate.index,
          lastBottomIndex: nextLastBottomIndex,
          score: nextScore,
          previousScoreForSameKey: existingState?.score ?? null,
          dominanceOutcome:
            !existingState || nextScore > existingState.score
              ? "STATE_CREATED_AND_KEPT"
              : "STATE_NOT_KEPT_LOWER_OR_EQUAL_SCORE",
          chainCandidateIds: [
            ...state.chainCandidateIds,
            candidate.candidateId,
          ],
        };
        stateAttempts.push(attempt);

        if (!existingState || nextScore > existingState.score) {
          const nextState: State = {
            score: nextScore,
            predecessorKey: stateKey,
            candidateIndex,
            lastBottomIndex: nextLastBottomIndex,
            chainCandidateIds: [
              ...state.chainCandidateIds,
              candidate.candidateId,
            ],
          };
          if (existingState) {
            const previouslyKeptAttempt =
              keptAttemptByStateId.get(nextKey);
            if (previouslyKeptAttempt) {
              previouslyKeptAttempt.dominanceOutcome =
                "STATE_CREATED_THEN_DOMINATED";
            }
            trace.dominatedStateCount += 1;
            trace.dominanceScoreDifferences.push(
              nextScore - existingState.score,
            );
          }
          nextStates.set(nextKey, nextState);
          stateStore.set(nextKey, nextState);
          keptAttemptByStateId.set(nextKey, attempt);
        } else {
          trace.dominatedStateCount += 1;
          trace.dominanceScoreDifferences.push(
            nextScore - existingState.score,
          );
        }
      }
    }

    currentStates = nextStates;
    for (const state of currentStates.values()) {
      const currentCandidate =
        pooledCandidates[state.candidateIndex];
      const currentTrace = candidateTraces.get(
        currentCandidate.candidateId,
      )!;
      currentTrace.statesContainingAsCurrent += 1;
      currentTrace.chainPositions.push(step + 1);
      for (const candidateId of state.chainCandidateIds) {
        const descendantTrace = candidateTraces.get(candidateId)!;
        descendantTrace.maximumDescendantLayer = Math.max(
          descendantTrace.maximumDescendantLayer,
          step + 1,
        );
      }
    }
    if (currentStates.size === 0) break;
  }

  const finalPaths = [...currentStates.entries()].map(([stateId, terminalState]) => {
    const candidateIndexes: number[] = [];
    let cursor: string | null = stateId;

    while (cursor) {
      const state = stateStore.get(cursor);
      if (!state) {
        fail(
          "DATA_INTEGRITY_ERROR",
          `Missing DP replay state ${cursor}.`,
        );
      }
      if (state.candidateIndex >= 0) {
        candidateIndexes.push(state.candidateIndex);
      }
      cursor = state.predecessorKey;
    }

    candidateIndexes.reverse();
    return {
      stateId,
      score: terminalState.score,
      chain: candidateIndexes.map(
        (candidateIndex) => pooledCandidates[candidateIndex],
      ),
    };
  });
  const createdStates = [...stateStore.entries()].map(
    ([stateId, state]) => {
      const candidate =
        state.candidateIndex >= 0
          ? pooledCandidates[state.candidateIndex]
          : null;
      return {
        stateId,
        score: state.score,
        predecessorStateId: state.predecessorKey,
        candidateId: candidate?.candidateId ?? null,
        candidateIndex: candidate?.index ?? null,
        chainLength: state.chainCandidateIds.length,
      };
    },
  );
  return {
    finalPaths,
    candidateTraces,
    createdStates,
    stateAttempts,
  };
}

function formatDpChain(chain: DpCandidate[]): string {
  return chain
    .map(
      (event) =>
        `${event.type === "BOTTOM" ? "B" : "T"}(${event.index})`,
    )
    .join(" -> ");
}

function simpleExtremaInWindow(
  values: number[],
  start: number,
  end: number,
): Array<{ index: number; type: "MAX" | "MIN"; value: number }> {
  const extrema: Array<{
    index: number;
    type: "MAX" | "MIN";
    value: number;
  }> = [];
  for (
    let index = Math.max(1, start + 1);
    index < Math.min(values.length - 1, end);
    index += 1
  ) {
    if (
      values[index] > values[index - 1] &&
      values[index] > values[index + 1]
    ) {
      extrema.push({ index, type: "MAX", value: values[index] });
    } else if (
      values[index] < values[index - 1] &&
      values[index] < values[index + 1]
    ) {
      extrema.push({ index, type: "MIN", value: values[index] });
    }
  }
  return extrema;
}

function drawSignal(
  image: Raster,
  values: number[],
  start: number,
  end: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): {
  x: (index: number) => number;
  y: (value: number) => number;
} {
  const visible = values.slice(start, end + 1);
  const minimum = Math.min(...visible);
  const maximum = Math.max(...visible);
  const padding = Math.max((maximum - minimum) * 0.08, 1);
  const yMinimum = minimum - padding;
  const yMaximum = maximum + padding;
  const x = (index: number) =>
    left + ((index - start) / Math.max(end - start, 1)) * (right - left);
  const y = (value: number) =>
    bottom -
    ((value - yMinimum) / (yMaximum - yMinimum)) * (bottom - top);

  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);
  for (let index = start + 1; index <= end; index += 1) {
    image.line(
      x(index - 1),
      y(values[index - 1]),
      x(index),
      y(values[index]),
      [65, 65, 65],
    );
  }
  return { x, y };
}

function renderFullComparison(
  values: number[],
  axis: string,
  rows: ComparisonRow[],
  syncImuSampleIndex: number,
  samplingRateHz: number,
  outputPath: string,
): void {
  const image = new Raster(1800, 950);
  const left = 90;
  const right = 1740;
  const top = 120;
  const bottom = 850;
  const { x, y } = drawSignal(
    image,
    values,
    0,
    values.length - 1,
    left,
    right,
    top,
    bottom,
  );

  image.text(90, 25, `ROWING 5REPS 007 GROUND TRUTH AXIS ${axis}`, [0, 0, 0], 3);
  image.marker(900, 55, "square", [120, 35, 175]);
  image.text(914, 48, "GROUND TRUTH", [120, 35, 175], 1);
  image.marker(1060, 55, "circle", [215, 35, 35]);
  image.text(1074, 48, "GLOBAL", [215, 35, 35], 1);
  image.marker(1190, 55, "up", [20, 150, 70]);
  image.text(1204, 48, "SYNC", [20, 150, 70], 1);

  for (const row of rows) {
    const groundTruthX = x(row.expectedImuSampleIndex);
    image.line(groundTruthX, top, groundTruthX, bottom, [190, 150, 210]);
    image.marker(
      groundTruthX,
      y(values[row.expectedImuSampleIndex]),
      "square",
      [120, 35, 175],
    );
    image.text(
      groundTruthX - 10,
      top + 12 + ((row.eventNumber - 1) % 2) * 20,
      row.label,
      [120, 35, 175],
      1,
    );
    const globalX = x(row.globalSampleIndex);
    image.marker(
      globalX,
      y(values[row.globalSampleIndex]),
      "circle",
      [215, 35, 35],
    );
    image.text(
      globalX - 10,
      y(values[row.globalSampleIndex]) +
        (row.type === "BOTTOM" ? 12 : -20),
      String(row.globalSampleIndex),
      [215, 35, 35],
      1,
    );
  }

  const syncX = x(syncImuSampleIndex);
  image.line(syncX, top, syncX, bottom, [20, 150, 70]);
  image.marker(syncX, y(values[syncImuSampleIndex]), "up", [20, 150, 70]);
  image.text(syncX - 25, top - 25, `SYNC ${syncImuSampleIndex}`, [20, 150, 70], 1);

  for (let tick = 0; tick < values.length; tick += 50) {
    const tickX = x(tick);
    image.line(tickX, bottom, tickX, bottom + 8, [0, 0, 0]);
    image.text(tickX - 10, bottom + 15, String(tick), [0, 0, 0], 1);
    image.text(
      tickX - 15,
      bottom + 35,
      `${(tick / samplingRateHz).toFixed(1)}S`,
      [80, 80, 80],
      1,
    );
  }
  image.writePng(outputPath);
}

function renderEventZoom(
  values: number[],
  row: ComparisonRow,
  outputPath: string,
): void {
  const image = new Raster(1300, 760);
  const start = Math.max(0, row.expectedImuSampleIndex - 30);
  const end = Math.min(values.length - 1, row.expectedImuSampleIndex + 30);
  const left = 80;
  const right = 1240;
  const top = 110;
  const bottom = 670;
  const { x, y } = drawSignal(
    image,
    values,
    start,
    end,
    left,
    right,
    top,
    bottom,
  );

  image.text(80, 20, `${row.label} EXPECTED ${row.expectedImuSampleIndex} GLOBAL ${row.globalSampleIndex}`, [0, 0, 0], 2);
  image.text(
    80,
    52,
    `ERROR ${row.signedErrorSamples} SAMPLES ${row.signedErrorMilliseconds} MS`,
    [0, 0, 0],
    2,
  );
  const expectedX = x(row.expectedImuSampleIndex);
  image.line(expectedX, top, expectedX, bottom, [120, 35, 175]);
  image.marker(
    expectedX,
    y(values[row.expectedImuSampleIndex]),
    "square",
    [120, 35, 175],
  );
  const globalIsVisible =
    row.globalSampleIndex >= start && row.globalSampleIndex <= end;
  const globalX = globalIsVisible
    ? x(row.globalSampleIndex)
    : row.globalSampleIndex < start
      ? left
      : right;
  image.line(globalX, top, globalX, bottom, [215, 35, 35]);
  image.marker(
    globalX,
    globalIsVisible ? y(values[row.globalSampleIndex]) : top + 55,
    globalIsVisible
      ? "circle"
      : row.globalSampleIndex < start
        ? "down"
        : "up",
    [215, 35, 35],
  );
  image.text(expectedX - 12, top + 10, `GT ${row.expectedImuSampleIndex}`, [120, 35, 175], 1);
  image.text(
    globalIsVisible ? globalX - 12 : left + 12,
    top + 28,
    globalIsVisible
      ? `GLOBAL ${row.globalSampleIndex}`
      : `GLOBAL ${row.globalSampleIndex} OUTSIDE ${row.globalSampleIndex < start ? "LEFT" : "RIGHT"}`,
    [215, 35, 35],
    1,
  );

  for (const extremum of simpleExtremaInWindow(values, start, end)) {
    const color: RGB =
      extremum.type === "MAX" ? [225, 120, 10] : [20, 130, 170];
    image.marker(
      x(extremum.index),
      y(extremum.value),
      extremum.type === "MAX" ? "up" : "down",
      color,
    );
    image.text(
      x(extremum.index) - 9,
      y(extremum.value) + (extremum.type === "MAX" ? -18 : 9),
      String(extremum.index),
      color,
      1,
    );
  }
  for (let tick = start; tick <= end; tick += 5) {
    const tickX = x(tick);
    image.line(tickX, bottom, tickX, bottom + 7, [0, 0, 0]);
    image.text(tickX - 9, bottom + 13, String(tick), [0, 0, 0], 1);
  }
  image.writePng(outputPath);
}

type RawInvestigationEvent = {
  eventLabel: string;
  expectedType: EventType;
  groundTruthIndex: number;
  status: "REFERENCE_EXACT" | "RAW_MISSING" | "RAW_NEAR_MISS";
  nearestSameTypeRawIndex: number | null;
  signedDistanceSamples: number | null;
  absoluteDistanceSamples: number | null;
  signalValueAtGroundTruth: number;
  signalValueAtNearestRaw: number | null;
  localMinimum: number;
  localMaximum: number;
  localPeakToPeakAmplitude: number;
  localMedian: number;
  localNoiseEstimate: number;
  amplitudeToNoiseRatio: number | null;
  slopeBefore: number;
  slopeAfter: number;
  directionChangeVisible: boolean;
  simpleExtremumAtGroundTruth: boolean;
  rawCandidateAtGroundTruth: boolean;
  snappedCandidateIndex: "DIAGNOSTIC_UNAVAILABLE";
  selectedAxis: string;
  strongestAxisInWindow: "ax" | "ay" | "az";
  windowStart: number;
  windowEnd: number;
  radiusMeasurements: Array<{
    radius: 2 | 4 | 8;
    minimum: number;
    maximum: number;
    amplitude: number;
    slopeBefore: number;
    slopeAfter: number;
    directionChangeVisible: boolean;
    plateauLengthSamples: number;
  }>;
  competingSimpleExtrema: Array<{
    index: number;
    type: "MAX" | "MIN";
    value: number;
  }>;
};

function meanSlope(
  values: number[],
  start: number,
  end: number,
): number {
  if (end <= start) return 0;
  let sum = 0;
  for (let index = start + 1; index <= end; index += 1) {
    sum += values[index] - values[index - 1];
  }
  return sum / (end - start);
}

function plateauLengthAround(
  values: number[],
  center: number,
  radius: number,
  noiseThreshold: number,
): number {
  const startLimit = Math.max(0, center - radius);
  const endLimit = Math.min(values.length - 1, center + radius);
  let start = center;
  let end = center;
  while (
    start > startLimit &&
    Math.abs(values[start] - values[start - 1]) <= noiseThreshold
  ) {
    start -= 1;
  }
  while (
    end < endLimit &&
    Math.abs(values[end + 1] - values[end]) <= noiseThreshold
  ) {
    end += 1;
  }
  return end - start + 1;
}

function renderRawInvestigationEvent(
  dataset: CalibrationDataset,
  selectedAxis: "ax" | "ay" | "az",
  event: RawInvestigationEvent,
  rawCandidates: Array<{
    type: EventType;
    index: number;
    value: number;
  }>,
  outputPath: string,
): void {
  const image = new Raster(1700, 1320);
  const axes: Array<{
    axis: "ax" | "ay" | "az";
    label: string;
    color: RGB;
  }> = [
    { axis: selectedAxis, label: `SELECTED AXIS ${selectedAxis}`, color: [25, 75, 210] },
    { axis: "ax", label: "AX RAW", color: [210, 40, 40] },
    { axis: "ay", label: "AY RAW", color: [20, 145, 70] },
    { axis: "az", label: "AZ RAW", color: [35, 80, 200] },
  ];

  image.text(
    70,
    18,
    `${event.eventLabel} ${event.status} GT ${event.groundTruthIndex}`,
    [0, 0, 0],
    2,
  );
  image.text(
    900,
    18,
    event.nearestSameTypeRawIndex === null
      ? "TRACKED RAW NONE"
      : `TRACKED RAW ${event.nearestSameTypeRawIndex} DIST ${event.signedDistanceSamples}`,
    [215, 35, 35],
    2,
  );
  image.line(420, 43, 420, 68, [125, 35, 175]);
  image.text(430, 49, "GROUND TRUTH", [125, 35, 175], 1);
  image.marker(570, 55, "up", [225, 120, 10]);
  image.text(582, 49, "SIMPLE MAX", [225, 120, 10], 1);
  image.marker(700, 55, "down", [20, 130, 170]);
  image.text(712, 49, "SIMPLE MIN", [20, 130, 170], 1);
  image.marker(830, 55, "circle", [80, 80, 80]);
  image.text(842, 49, "RAW", [80, 80, 80], 1);
  image.marker(900, 55, "square", [215, 35, 35]);
  image.text(912, 49, "TRACKED", [215, 35, 35], 1);

  axes.forEach((panel, panelIndex) => {
    const values = dataset.samples.map((sample) => sample[panel.axis]);
    const top = 75 + panelIndex * 305;
    const bottom = top + 245;
    const left = 90;
    const right = 1640;
    const { x, y } = drawSignal(
      image,
      values,
      event.windowStart,
      event.windowEnd,
      left,
      right,
      top,
      bottom,
    );
    image.text(12, top + 8, panel.label, panel.color, 1);
    const gtX = x(event.groundTruthIndex);
    image.line(gtX, top, gtX, bottom, [125, 35, 175]);
    image.text(gtX + 4, top + 8, `${event.eventLabel} GT`, [125, 35, 175], 1);

    const extrema = simpleExtremaInWindow(
      values,
      event.windowStart,
      event.windowEnd,
    );
    for (const extremum of extrema) {
      const color: RGB =
        extremum.type === "MAX" ? [225, 120, 10] : [20, 130, 170];
      image.marker(
        x(extremum.index),
        y(extremum.value),
        extremum.type === "MAX" ? "up" : "down",
        color,
      );
      if (panelIndex === 0) {
        image.text(
          x(extremum.index) - 8,
          y(extremum.value) + (extremum.type === "MAX" ? -16 : 8),
          `${extremum.index}:${extremum.value}`,
          color,
          1,
        );
      }
    }

    for (const candidate of rawCandidates.filter(
      (candidate) =>
        candidate.index >= event.windowStart &&
        candidate.index <= event.windowEnd,
    )) {
      const candidateY = y(values[candidate.index]);
      image.marker(
        x(candidate.index),
        candidateY,
        "circle",
        [80, 80, 80],
      );
      if (panelIndex === 0) {
        image.text(
          x(candidate.index) + 5,
          candidateY + 8,
          `R${candidate.index}:${candidate.value}`,
          [80, 80, 80],
          1,
        );
      }
    }

    if (event.nearestSameTypeRawIndex !== null) {
      const trackedIndex = event.nearestSameTypeRawIndex;
      image.marker(
        x(trackedIndex),
        y(values[trackedIndex]),
        "square",
        [215, 35, 35],
      );
    }
    for (
      let tick = Math.ceil(event.windowStart / 10) * 10;
      tick <= event.windowEnd;
      tick += 10
    ) {
      const tickX = x(tick);
      image.line(tickX, bottom, tickX, bottom + 6, [0, 0, 0]);
      image.text(tickX - 8, bottom + 10, String(tick), [0, 0, 0], 1);
    }
  });
  image.writePng(outputPath);
}

function renderRawWindowsComparison(
  dataset: CalibrationDataset,
  selectedAxis: "ax" | "ay" | "az",
  events: RawInvestigationEvent[],
  outputPath: string,
): void {
  const image = new Raster(1900, 1750);
  const values = dataset.samples.map((sample) => sample[selectedAxis]);
  const globalMinimum = Math.min(
    ...events.flatMap((event) =>
      values.slice(event.windowStart, event.windowEnd + 1),
    ),
  );
  const globalMaximum = Math.max(
    ...events.flatMap((event) =>
      values.slice(event.windowStart, event.windowEnd + 1),
    ),
  );
  const padding = Math.max((globalMaximum - globalMinimum) * 0.06, 1);
  const yMinimum = globalMinimum - padding;
  const yMaximum = globalMaximum + padding;
  image.text(45, 18, `RAW GT WINDOWS COMPARISON AXIS ${selectedAxis}`, [0, 0, 0], 3);

  events.forEach((event, eventIndex) => {
    const column = eventIndex % 2;
    const row = Math.floor(eventIndex / 2);
    const left = 70 + column * 940;
    const right = left + 850;
    const top = 90 + row * 405;
    const bottom = top + 315;
    const x = (relativeIndex: number) =>
      left + ((relativeIndex + 60) / 120) * (right - left);
    const y = (value: number) =>
      bottom -
      ((value - yMinimum) / (yMaximum - yMinimum)) *
        (bottom - top);
    image.line(left, top, left, bottom, [0, 0, 0]);
    image.line(left, bottom, right, bottom, [0, 0, 0]);
    for (
      let index = event.windowStart + 1;
      index <= event.windowEnd;
      index += 1
    ) {
      image.line(
        x(index - 1 - event.groundTruthIndex),
        y(values[index - 1]),
        x(index - event.groundTruthIndex),
        y(values[index]),
        [55, 55, 55],
      );
    }
    image.line(x(0), top, x(0), bottom, [125, 35, 175]);
    if (event.nearestSameTypeRawIndex !== null) {
      const relativeRaw =
        event.nearestSameTypeRawIndex - event.groundTruthIndex;
      image.marker(
        x(relativeRaw),
        y(values[event.nearestSameTypeRawIndex]),
        "square",
        [215, 35, 35],
      );
    }
    image.text(
      left + 5,
      top + 8,
      `${event.eventLabel} ${event.status}`,
      [0, 0, 0],
      1,
    );
    image.text(
      left + 5,
      top + 24,
      event.nearestSameTypeRawIndex === null
        ? "RAW NONE"
        : `RAW ${event.nearestSameTypeRawIndex} DIST ${event.signedDistanceSamples}`,
      [215, 35, 35],
      1,
    );
    for (let tick = -60; tick <= 60; tick += 20) {
      image.line(x(tick), bottom, x(tick), bottom + 6, [0, 0, 0]);
      image.text(x(tick) - 7, bottom + 10, String(tick), [0, 0, 0], 1);
    }
  });
  image.writePng(outputPath);
}

function runRawInvestigation(
  dataset: CalibrationDataset,
  selectedAxis: "ax" | "ay" | "az",
  comparisonRows: ComparisonRow[],
  rawCandidates: Array<{
    candidateId: string;
    type: EventType;
    index: number;
    value: number;
  }>,
  outputRoot: string,
): {
  events: RawInvestigationEvent[];
  pngPaths: string[];
  comparisonPath: string;
  reportPath: string;
} {
  const targetDefinitions = [
    { label: "B1", status: "REFERENCE_EXACT", file: "B1_reference_exact.png" },
    { label: "T2", status: "REFERENCE_EXACT", file: "T2_reference_exact.png" },
    { label: "B3", status: "RAW_MISSING", file: "B3_raw_missing.png" },
    { label: "T4", status: "RAW_MISSING", file: "T4_raw_missing.png" },
    { label: "T1", status: "RAW_NEAR_MISS", file: "T1_raw_near_miss.png" },
    { label: "T3", status: "RAW_NEAR_MISS", file: "T3_raw_near_miss.png" },
    { label: "B4", status: "RAW_NEAR_MISS", file: "B4_raw_near_miss.png" },
    { label: "T5", status: "RAW_NEAR_MISS", file: "T5_raw_near_miss.png" },
  ] as const;
  const selectedValues = dataset.samples.map(
    (sample) => sample[selectedAxis],
  );
  const outputDirectory = path.join(outputRoot, "raw-investigation");
  fs.mkdirSync(outputDirectory, { recursive: true });

  const events = targetDefinitions.map((definition) => {
    const comparison = comparisonRows.find(
      (row) => row.label === definition.label,
    );
    if (!comparison) {
      fail(
        "DATA_INTEGRITY_ERROR",
        `Missing comparison row ${definition.label}.`,
      );
    }
    const groundTruthIndex = comparison.expectedImuSampleIndex;
    const windowStart = Math.max(0, groundTruthIndex - 60);
    const windowEnd = Math.min(
      dataset.samples.length - 1,
      groundTruthIndex + 60,
    );
    const sameTypeCandidates = rawCandidates
      .filter((candidate) => candidate.type === comparison.type)
      .sort(
        (left, right) =>
          Math.abs(left.index - groundTruthIndex) -
            Math.abs(right.index - groundTruthIndex) ||
          left.index - right.index,
      );
    const nearest = sameTypeCandidates[0] ?? null;
    const localValues = selectedValues.slice(
      windowStart,
      windowEnd + 1,
    );
    const consecutiveAbsoluteDifferences = localValues
      .slice(1)
      .map((value, index) =>
        Math.abs(value - localValues[index]),
      );
    const localNoiseEstimate = median(
      consecutiveAbsoluteDifferences,
    );
    const localMinimum = Math.min(...localValues);
    const localMaximum = Math.max(...localValues);
    const localPeakToPeakAmplitude = localMaximum - localMinimum;
    const slopeBefore = meanSlope(
      selectedValues,
      Math.max(windowStart, groundTruthIndex - 8),
      groundTruthIndex,
    );
    const slopeAfter = meanSlope(
      selectedValues,
      groundTruthIndex,
      Math.min(windowEnd, groundTruthIndex + 8),
    );
    const simpleExtremumAtGroundTruth =
      comparison.type === "TOP"
        ? selectedValues[groundTruthIndex] >
            selectedValues[groundTruthIndex - 1] &&
          selectedValues[groundTruthIndex] >
            selectedValues[groundTruthIndex + 1]
        : selectedValues[groundTruthIndex] <
            selectedValues[groundTruthIndex - 1] &&
          selectedValues[groundTruthIndex] <
            selectedValues[groundTruthIndex + 1];
    const axisAmplitudes = (["ax", "ay", "az"] as const).map(
      (axis) => {
        const values = dataset.samples
          .slice(windowStart, windowEnd + 1)
          .map((sample) => sample[axis]);
        return {
          axis,
          amplitude: Math.max(...values) - Math.min(...values),
        };
      },
    );
    axisAmplitudes.sort(
      (left, right) => right.amplitude - left.amplitude,
    );
    const radiusMeasurements = ([2, 4, 8] as const).map(
      (radius) => {
        const start = Math.max(
          windowStart,
          groundTruthIndex - radius,
        );
        const end = Math.min(
          windowEnd,
          groundTruthIndex + radius,
        );
        const radiusValues = selectedValues.slice(start, end + 1);
        const radiusSlopeBefore = meanSlope(
          selectedValues,
          start,
          groundTruthIndex,
        );
        const radiusSlopeAfter = meanSlope(
          selectedValues,
          groundTruthIndex,
          end,
        );
        return {
          radius,
          minimum: Math.min(...radiusValues),
          maximum: Math.max(...radiusValues),
          amplitude:
            Math.max(...radiusValues) - Math.min(...radiusValues),
          slopeBefore: radiusSlopeBefore,
          slopeAfter: radiusSlopeAfter,
          directionChangeVisible:
            radiusSlopeBefore * radiusSlopeAfter < 0,
          plateauLengthSamples: plateauLengthAround(
            selectedValues,
            groundTruthIndex,
            radius,
            localNoiseEstimate,
          ),
        };
      },
    );

    return {
      eventLabel: definition.label,
      expectedType: comparison.type,
      groundTruthIndex,
      status: definition.status,
      nearestSameTypeRawIndex: nearest?.index ?? null,
      signedDistanceSamples:
        nearest === null ? null : nearest.index - groundTruthIndex,
      absoluteDistanceSamples:
        nearest === null
          ? null
          : Math.abs(nearest.index - groundTruthIndex),
      signalValueAtGroundTruth: selectedValues[groundTruthIndex],
      signalValueAtNearestRaw:
        nearest === null ? null : selectedValues[nearest.index],
      localMinimum,
      localMaximum,
      localPeakToPeakAmplitude,
      localMedian: median(localValues),
      localNoiseEstimate,
      amplitudeToNoiseRatio:
        localNoiseEstimate === 0
          ? null
          : localPeakToPeakAmplitude / localNoiseEstimate,
      slopeBefore,
      slopeAfter,
      directionChangeVisible: slopeBefore * slopeAfter < 0,
      simpleExtremumAtGroundTruth,
      rawCandidateAtGroundTruth: sameTypeCandidates.some(
        (candidate) => candidate.index === groundTruthIndex,
      ),
      snappedCandidateIndex:
        "DIAGNOSTIC_UNAVAILABLE" as const,
      selectedAxis,
      strongestAxisInWindow: axisAmplitudes[0].axis,
      windowStart,
      windowEnd,
      radiusMeasurements,
      competingSimpleExtrema: simpleExtremaInWindow(
        selectedValues,
        windowStart,
        windowEnd,
      ),
    } satisfies RawInvestigationEvent;
  });

  const pngPaths = events.map((event, index) => {
    const outputPath = path.join(
      outputDirectory,
      targetDefinitions[index].file,
    );
    renderRawInvestigationEvent(
      dataset,
      selectedAxis,
      event,
      rawCandidates,
      outputPath,
    );
    return outputPath;
  });
  const comparisonPath = path.join(
    outputDirectory,
    "raw_ground_truth_windows_comparison.png",
  );
  renderRawWindowsComparison(
    dataset,
    selectedAxis,
    events,
    comparisonPath,
  );
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_raw_investigation_report.md",
  );
  const report: string[] = [
    "# rowing_5reps_007 — RAW Investigation",
    "",
    "Investigation descriptive en lecture seule des huit événements ciblés.",
    "",
    "## Formules descriptives",
    "",
    "- `localNoiseEstimate = median(abs(signal[i] - signal[i-1]))` sur la fenêtre ±60.",
    "- `amplitudeToNoiseRatio = localPeakToPeakAmplitude / localNoiseEstimate`.",
    "- `slopeBefore` et `slopeAfter` sont les moyennes des différences consécutives sur un rayon de 8 samples.",
    "- `plateauLengthSamples` étend une zone contiguë autour de Ground Truth tant que chaque différence consécutive reste inférieure ou égale à `localNoiseEstimate`.",
    "- Ces mesures ne sont utilisées par aucun filtre et ne constituent aucun score.",
    "",
    "## Tableau récapitulatif",
    "",
    "| eventLabel | expectedType | groundTruthIndex | status | nearestSameTypeRawIndex | signedDistanceSamples | localPeakToPeakAmplitude | localNoiseEstimate | amplitudeToNoiseRatio | slopeBefore | slopeAfter | directionChangeVisible | simpleExtremumAtGroundTruth | rawCandidateAtGroundTruth | snappedCandidateIndex | selectedAxis | strongestAxisInWindow |",
    "|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|---|---|",
    ...events.map(
      (event) =>
        `| ${event.eventLabel} | ${event.expectedType} | ${event.groundTruthIndex} | ${event.status} | ${event.nearestSameTypeRawIndex ?? "—"} | ${event.signedDistanceSamples ?? "—"} | ${event.localPeakToPeakAmplitude} | ${event.localNoiseEstimate} | ${event.amplitudeToNoiseRatio ?? "—"} | ${event.slopeBefore} | ${event.slopeAfter} | ${event.directionChangeVisible} | ${event.simpleExtremumAtGroundTruth} | ${event.rawCandidateAtGroundTruth} | ${event.snappedCandidateIndex} | ${event.selectedAxis} | ${event.strongestAxisInWindow} |`,
    ),
    "",
    "## Mesures détaillées",
    "",
  ];

  events.forEach((event, index) => {
    const rawInWindow = rawCandidates.filter(
      (candidate) =>
        candidate.index >= event.windowStart &&
        candidate.index <= event.windowEnd,
    );
    report.push(
      `### ${event.eventLabel}`,
      "",
      `![${event.eventLabel}](./${path.basename(pngPaths[index])})`,
      "",
      "```json",
      JSON.stringify(
        {
          ...event,
          detectorFacts: {
            simpleExtremumOfExpectedTypeAtGroundTruth:
              event.simpleExtremumAtGroundTruth,
            directionChangeAroundGroundTruth:
              event.directionChangeVisible,
            snapToLocalExtremumWouldMoveCandidate:
              "DIAGNOSTIC_UNAVAILABLE",
            snapSelectedIndex: "DIAGNOSTIC_UNAVAILABLE",
            candidateAbsentBeforeOrAfterSnap:
              "DIAGNOSTIC_UNAVAILABLE",
            rawCandidatesInWindow: rawInWindow,
            competingSimpleExtrema:
              event.competingSimpleExtrema,
          },
        },
        null,
        2,
      ),
      "```",
      "",
    );
  });
  report.push(
    "## Comparaison alignée",
    "",
    `![Comparaison](./${path.basename(comparisonPath)})`,
    "",
    "## Observations humaines à compléter",
    "",
  );
  fs.writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");

  return { events, pngPaths, comparisonPath, reportPath };
}

function fail(code: ValidationErrorCode, detail: string): never {
  throw new ValidationError(code, detail);
}

function isExpectedAlternation(
  events: Array<{ type: EventType }>,
): boolean {
  return events.every(
    (event, index) =>
      event.type === (index % 2 === 0 ? "BOTTOM" : "TOP"),
  );
}

function isStrictlyIncreasing(values: number[]): boolean {
  return values.every(
    (value, index) => index === 0 || values[index - 1] < value,
  );
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

type TransitionCandidate = {
  type: EventType;
  index: number;
  value: number;
};

type WindowMatch = {
  index: number | null;
  status:
    | "INSIDE_TRANSITION_WINDOW"
    | "BEFORE_TRANSITION_WINDOW"
    | "AFTER_TRANSITION_WINDOW"
    | "NO_CANDIDATE_OF_EXPECTED_TYPE"
    | "DIAGNOSTIC_UNAVAILABLE";
  signedDistanceSamples: number | null;
  absoluteDistanceSamples: number | null;
  distanceMilliseconds: number | null;
};

type TransitionRow = {
  eventNumber: number;
  eventLabel: string;
  type: EventType;
  rep: number;
  arrivalVideoTimeSeconds: number;
  departureVideoTimeSeconds: number | null;
  arrivalImuSampleIndex: number;
  departureImuSampleIndex: number | null;
  windowStartSampleIndex: number;
  windowEndSampleIndex: number;
  windowWidthSamples: number;
  windowWidthMilliseconds: number;
  transitionStatus: "TRANSITION_WINDOW" | "FINAL_EVENT_WITHOUT_DEPARTURE";
  raw: WindowMatch;
  prominence: WindowMatch;
  direction: WindowMatch;
  dpInput: WindowMatch;
  global: WindowMatch;
};

function matchCandidateToWindow(
  candidates: TransitionCandidate[],
  type: EventType,
  windowStart: number,
  windowEnd: number,
  samplingRateHz: number,
): WindowMatch {
  const sameType = candidates.filter((candidate) => candidate.type === type);
  if (sameType.length === 0) {
    return {
      index: null,
      status: "NO_CANDIDATE_OF_EXPECTED_TYPE",
      signedDistanceSamples: null,
      absoluteDistanceSamples: null,
      distanceMilliseconds: null,
    };
  }
  const distance = (index: number) =>
    index < windowStart
      ? windowStart - index
      : index > windowEnd
        ? index - windowEnd
        : 0;
  const candidate = [...sameType].sort(
    (left, right) =>
      distance(left.index) - distance(right.index) ||
      left.index - right.index,
  )[0];
  const signedDistanceSamples =
    candidate.index < windowStart
      ? candidate.index - windowStart
      : candidate.index > windowEnd
        ? candidate.index - windowEnd
        : 0;
  return {
    index: candidate.index,
    status:
      signedDistanceSamples < 0
        ? "BEFORE_TRANSITION_WINDOW"
        : signedDistanceSamples > 0
          ? "AFTER_TRANSITION_WINDOW"
          : "INSIDE_TRANSITION_WINDOW",
    signedDistanceSamples,
    absoluteDistanceSamples: Math.abs(signedDistanceSamples),
    distanceMilliseconds:
      Math.abs(signedDistanceSamples) * (1000 / samplingRateHz),
  };
}

function transitionAggregate(
  population: string,
  rows: TransitionRow[],
  selector: (row: TransitionRow) => WindowMatch,
  samplingRateHz: number,
) {
  const matches = rows.map(selector);
  const available = matches.filter(
    (match) => match.absoluteDistanceSamples !== null,
  );
  const distances = available.map(
    (match) => match.absoluteDistanceSamples as number,
  );
  return {
    population,
    eventsInsideWindow: matches.filter(
      (match) => match.status === "INSIDE_TRANSITION_WINDOW",
    ).length,
    eventsBeforeWindow: matches.filter(
      (match) => match.status === "BEFORE_TRANSITION_WINDOW",
    ).length,
    eventsAfterWindow: matches.filter(
      (match) => match.status === "AFTER_TRANSITION_WINDOW",
    ).length,
    eventsWithoutCandidate: matches.filter(
      (match) =>
        match.status === "NO_CANDIDATE_OF_EXPECTED_TYPE" ||
        match.status === "DIAGNOSTIC_UNAVAILABLE",
    ).length,
    meanAbsoluteDistanceToWindowSamples:
      distances.length > 0 ? mean(distances) : null,
    medianAbsoluteDistanceToWindowSamples:
      distances.length > 0 ? median(distances) : null,
    maxAbsoluteDistanceToWindowSamples:
      distances.length > 0 ? Math.max(...distances) : null,
    meanAbsoluteDistanceToWindowMilliseconds:
      distances.length > 0
        ? mean(distances) * (1000 / samplingRateHz)
        : null,
    eventsWithinOneSampleOfWindow: distances.filter(
      (distance) => distance <= 1,
    ).length,
    eventsWithinTwoSamplesOfWindow: distances.filter(
      (distance) => distance <= 2,
    ).length,
    bottomEventsInsideWindow: rows.filter(
      (row) =>
        row.type === "BOTTOM" &&
        selector(row).status === "INSIDE_TRANSITION_WINDOW",
    ).length,
    topEventsInsideWindow: rows.filter(
      (row) =>
        row.type === "TOP" &&
        selector(row).status === "INSIDE_TRANSITION_WINDOW",
    ).length,
  };
}

function markdownTable(records: Record<string, unknown>[]): string {
  if (records.length === 0) return "_Aucune ligne._";
  const columns = Object.keys(records[0]);
  const cell = (value: unknown) =>
    value === null || value === undefined
      ? ""
      : String(value).replace(/\|/g, "\\|");
  return [
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...records.map(
      (record) =>
        `| ${columns.map((column) => cell(record[column])).join(" | ")} |`,
    ),
  ].join("\n");
}

function renderTransitionPlot(
  values: number[],
  axis: string,
  rows: TransitionRow[],
  syncIndex: number,
  outputPath: string,
): void {
  const image = new Raster(1800, 780);
  const left = 75;
  const right = 1740;
  const top = 90;
  const bottom = 690;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.06, 1);
  const x = (index: number) =>
    left + (index / (values.length - 1)) * (right - left);
  const y = (value: number) =>
    bottom -
    ((value - (minimum - padding)) /
      (maximum - minimum + 2 * padding)) *
      (bottom - top);

  image.text(left, 20, `TRANSITION GROUND TRUTH - AXIS ${axis}`, [0, 0, 0], 2);
  image.text(left, 52, "BAND=WINDOW  RAW=ORANGE  GLOBAL=RED  SYNC=GREEN", [0, 0, 0], 1);
  for (const row of rows) {
    const startX = x(row.windowStartSampleIndex);
    const endX = x(row.windowEndSampleIndex);
    image.rectangle(
      Math.round(Math.min(startX, endX)),
      top,
      Math.max(2, Math.round(Math.abs(endX - startX)) + 1),
      bottom - top,
      row.type === "BOTTOM" ? [225, 238, 255] : [238, 226, 250],
    );
    image.line(startX, top, startX, bottom, [30, 110, 210]);
    image.line(endX, top, endX, bottom, [130, 45, 175]);
  }
  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);
  for (let index = 1; index < values.length; index += 1) {
    image.line(x(index - 1), y(values[index - 1]), x(index), y(values[index]), [40, 40, 40]);
  }
  for (const row of rows) {
    if (row.raw.index !== null) {
      image.marker(x(row.raw.index), y(values[row.raw.index]), row.type === "BOTTOM" ? "down" : "up", [225, 120, 10]);
    }
    if (row.global.index !== null) {
      image.marker(x(row.global.index), y(values[row.global.index]), "square", [210, 35, 35]);
    }
    image.text(x(row.windowStartSampleIndex) - 8, top + 12, row.eventLabel, [0, 0, 0], 1);
  }
  image.line(x(syncIndex), top, x(syncIndex), bottom, [20, 150, 70]);
  image.marker(x(syncIndex), y(values[syncIndex]), "circle", [20, 150, 70]);
  for (let tick = 0; tick < values.length; tick += 50) {
    image.line(x(tick), bottom, x(tick), bottom + 6, [0, 0, 0]);
    image.text(x(tick) - 8, bottom + 12, String(tick), [0, 0, 0], 1);
  }
  image.writePng(outputPath);
}

function renderTransitionZoom(
  values: number[],
  row: TransitionRow,
  outputPath: string,
): void {
  const margin = 18;
  const focusIndexes = [
    row.windowStartSampleIndex,
    row.windowEndSampleIndex,
    row.raw.index ?? row.windowStartSampleIndex,
    row.global.index ?? row.windowEndSampleIndex,
  ];
  const start = Math.max(0, Math.min(...focusIndexes) - margin);
  const end = Math.min(values.length - 1, Math.max(...focusIndexes) + margin);
  const segment = values.slice(start, end + 1);
  const minimum = Math.min(...segment);
  const maximum = Math.max(...segment);
  const padding = Math.max((maximum - minimum) * 0.08, 1);
  const image = new Raster(1500, 760);
  const left = 80;
  const right = 1440;
  const top = 125;
  const bottom = 650;
  const x = (index: number) =>
    left + ((index - start) / Math.max(1, end - start)) * (right - left);
  const y = (value: number) =>
    bottom -
    ((value - (minimum - padding)) /
      (maximum - minimum + 2 * padding)) *
      (bottom - top);
  const bandStart = x(row.windowStartSampleIndex);
  const bandEnd = x(row.windowEndSampleIndex);
  image.rectangle(
    Math.round(Math.min(bandStart, bandEnd)),
    top,
    Math.max(2, Math.round(Math.abs(bandEnd - bandStart)) + 1),
    bottom - top,
    [225, 238, 255],
  );
  image.text(left, 18, `${row.eventLabel} TRANSITION WINDOW ${row.windowStartSampleIndex}-${row.windowEndSampleIndex}`, [0, 0, 0], 2);
  image.text(left, 52, `RAW ${row.raw.index ?? "NONE"} ${row.raw.status} DIST ${row.raw.absoluteDistanceSamples ?? "NA"}`, [225, 120, 10], 1);
  image.text(left, 72, `GLOBAL ${row.global.index ?? "NONE"} ${row.global.status} DIST ${row.global.absoluteDistanceSamples ?? "NA"}`, [210, 35, 35], 1);
  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);
  image.line(bandStart, top, bandStart, bottom, [30, 110, 210]);
  image.line(bandEnd, top, bandEnd, bottom, [130, 45, 175]);
  for (let index = start + 1; index <= end; index += 1) {
    image.line(x(index - 1), y(values[index - 1]), x(index), y(values[index]), [40, 40, 40]);
  }
  for (let index = start + 1; index < end; index += 1) {
    if (
      (values[index] > values[index - 1] && values[index] > values[index + 1]) ||
      (values[index] < values[index - 1] && values[index] < values[index + 1])
    ) {
      const isMaximum = values[index] > values[index - 1];
      image.marker(x(index), y(values[index]), isMaximum ? "up" : "down", [90, 90, 90]);
      image.text(x(index) - 7, y(values[index]) + (isMaximum ? -18 : 10), String(index), [90, 90, 90], 1);
    }
  }
  if (row.raw.index !== null) {
    image.marker(x(row.raw.index), y(values[row.raw.index]), row.type === "BOTTOM" ? "down" : "up", [225, 120, 10]);
    image.text(x(row.raw.index) - 8, y(values[row.raw.index]) - 34, `R${row.raw.index}`, [225, 120, 10], 1);
  }
  if (row.global.index !== null) {
    image.marker(x(row.global.index), y(values[row.global.index]), "square", [210, 35, 35]);
    image.text(x(row.global.index) - 8, y(values[row.global.index]) + 18, `G${row.global.index}`, [210, 35, 35], 1);
  }
  for (let tick = Math.ceil(start / 5) * 5; tick <= end; tick += 5) {
    image.line(x(tick), bottom, x(tick), bottom + 6, [0, 0, 0]);
    image.text(x(tick) - 8, bottom + 12, String(tick), [0, 0, 0], 1);
  }
  image.writePng(outputPath);
}

function runDpIsolationExperiment(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
): void {
  const samplingRateHz = dataset.samplingRateHz;
  const syncImuTimeSeconds =
    groundTruth.sync.imuSampleIndex / samplingRateHz;
  const videoToImuOffsetSeconds =
    groundTruth.sync.videoTimeSeconds - syncImuTimeSeconds;
  const injectedCandidates: DpCandidate[] = groundTruth.events.map(
    (event, index) => {
      const projectedIndex = Math.round(
        (event.videoTimeSeconds - videoToImuOffsetSeconds) *
          samplingRateHz,
      );
      if (
        projectedIndex < 0 ||
        projectedIndex >= dataset.samples.length
      ) {
        fail(
          "GROUND_TRUTH_INDEX_OUT_OF_RANGE",
          `DP isolation event ${index + 1}: projectedIndex=${projectedIndex}`,
        );
      }
      return {
        candidateId: `INJECTED_GT_${index + 1}_${event.type}_${projectedIndex}`,
        type: event.type,
        index: projectedIndex,
        value: dataset.samples[projectedIndex][axis],
      };
    },
  );

  if (
    injectedCandidates.length !== EXPECTED_EVENT_COUNT ||
    !isExpectedAlternation(injectedCandidates) ||
    !isStrictlyIncreasing(
      injectedCandidates.map((candidate) => candidate.index),
    )
  ) {
    fail(
      "DATA_INTEGRITY_ERROR",
      "Injected Ground Truth candidates are not an 11-event strictly increasing alternating chain.",
    );
  }

  const replay = reconstructAllDpFinalPaths(
    injectedCandidates,
    EXPECTED_REPS,
  );
  const terminalStates = [...replay.finalPaths].sort(
    (left, right) =>
      right.score - left.score ||
      left.stateId.localeCompare(right.stateId),
  );
  if (terminalStates.length === 0) {
    fail(
      "GLOBAL_PATH_NOT_FOUND",
      "DP isolation produced no terminal state.",
    );
  }
  const winner = terminalStates[0];
  const comparisons = injectedCandidates.map((expected, index) => {
    const selected = winner.chain[index];
    const exact =
      selected?.type === expected.type &&
      selected?.index === expected.index;
    return {
      eventNumber: index + 1,
      groundTruth: `${expected.type === "BOTTOM" ? "B" : "T"}${expected.index}`,
      winnerDp: selected
        ? `${selected.type === "BOTTOM" ? "B" : "T"}${selected.index}`
        : null,
      status: exact ? "MATCH_EXACT" : "DIFFERENT",
    };
  });
  const exactChain =
    winner.chain.length === injectedCandidates.length &&
    comparisons.every((comparison) => comparison.status === "MATCH_EXACT");
  const candidateTable = injectedCandidates.map((candidate, index) => ({
    order: index + 1,
    candidateId: candidate.candidateId,
    type: candidate.type,
    index: candidate.index,
    value: candidate.value,
    display: `${candidate.type === "BOTTOM" ? "B" : "T"}${candidate.index}`,
  }));
  const stateTable = replay.createdStates.map((state) => ({
    stateId: state.stateId,
    score: state.score,
    predecessorStateId: state.predecessorStateId,
    candidateId: state.candidateId,
    candidateIndex: state.candidateIndex,
    chainLength: state.chainLength,
  }));
  const terminalTable = terminalStates.map((terminal, index) => ({
    rank: index + 1,
    stateId: terminal.stateId,
    score: terminal.score,
    chain: formatDpChain(terminal.chain),
  }));
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-isolation",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_isolation_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP isolation",
      "",
      "## Métadonnées",
      "",
      `- Mode: ${VALIDATION_MODE}`,
      `- Dataset: ${DATASET_NAME}`,
      `- Axe: ${String(axis)}`,
      `- Fréquence: ${samplingRateHz} Hz`,
      `- Offset vidéo vers IMU: ${videoToImuOffsetSeconds}`,
      `- Nombre de candidats injectés: ${injectedCandidates.length}`,
      `- Nombre total d'états DP créés: ${replay.createdStates.length}`,
      `- Nombre d'états terminaux: ${terminalStates.length}`,
      "",
      "## Candidats injectés",
      "",
      markdownTable(candidateTable),
      "",
      "## Chaîne gagnante",
      "",
      `- Chaîne: ${formatDpChain(winner.chain)}`,
      `- Score final: ${winner.score}`,
      `- Comparaison globale: ${exactChain ? "MATCH_EXACT" : "DIFFERENT"}`,
      "",
      "## Comparaison événement par événement",
      "",
      markdownTable(comparisons),
      "",
      "## Tous les états DP créés",
      "",
      markdownTable(stateTable),
      "",
      "## États terminaux",
      "",
      markdownTable(terminalTable),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log("\n=== DP ISOLATION: INJECTED CANDIDATES ===\n");
  console.table(candidateTable);
  console.log("\n=== DP ISOLATION: ALL CREATED STATES ===\n");
  console.table(stateTable);
  console.log("\n=== DP ISOLATION: TERMINAL STATES ===\n");
  console.table(terminalTable);
  console.log("\n=== DP ISOLATION: WINNER ===\n");
  console.table([{
    finalScore: winner.score,
    reconstructedPath: formatDpChain(winner.chain),
    comparison: exactChain ? "MATCH_EXACT" : "DIFFERENT",
  }]);
  console.log("\n=== DP ISOLATION: EVENT COMPARISON ===\n");
  console.table(comparisons);
  console.log("\n=== DP ISOLATION: REPORT ===\n");
  console.log(reportPath);
}

function runDpGroundTruthInjectionExperiment(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realDpCandidates: DpCandidate[],
): void {
  const samplingRateHz = dataset.samplingRateHz;
  const videoToImuOffsetSeconds =
    groundTruth.sync.videoTimeSeconds -
    groundTruth.sync.imuSampleIndex / samplingRateHz;
  const groundTruthCandidates: DpCandidate[] =
    groundTruth.events.map((event, index) => {
      const projectedIndex = Math.round(
        (event.videoTimeSeconds - videoToImuOffsetSeconds) *
          samplingRateHz,
      );
      if (
        projectedIndex < 0 ||
        projectedIndex >= dataset.samples.length
      ) {
        fail(
          "GROUND_TRUTH_INDEX_OUT_OF_RANGE",
          `DP injection event ${index + 1}: projectedIndex=${projectedIndex}`,
        );
      }
      return {
        candidateId: `INJECTED_GT_${index + 1}_${event.type}_${projectedIndex}`,
        type: event.type,
        index: projectedIndex,
        value: dataset.samples[projectedIndex][axis],
      };
    });
  const realIdentitySet = new Set(
    realDpCandidates.map(
      (candidate) => `${candidate.type}:${candidate.index}`,
    ),
  );
  const injectionRows = groundTruthCandidates.map(
    (candidate, index) => ({
      order: index + 1,
      display: `${candidate.type === "BOTTOM" ? "B" : "T"}${candidate.index}`,
      type: candidate.type,
      index: candidate.index,
      value: candidate.value,
      alreadyPresentInRealPopulation: realIdentitySet.has(
        `${candidate.type}:${candidate.index}`,
      ),
    }),
  );
  const candidatesToAdd = groundTruthCandidates.filter(
    (candidate) =>
      !realIdentitySet.has(`${candidate.type}:${candidate.index}`),
  );
  const combinedCandidates = [
    ...realDpCandidates,
    ...candidatesToAdd,
  ];
  const identityCount = new Set(
    combinedCandidates.map(
      (candidate) => `${candidate.type}:${candidate.index}`,
    ),
  ).size;
  if (identityCount !== combinedCandidates.length) {
    fail(
      "CANDIDATE_IDENTITY_ERROR",
      "DP Ground Truth injection produced duplicate type/index candidates.",
    );
  }

  const replay = reconstructAllDpFinalPaths(
    combinedCandidates,
    EXPECTED_REPS,
  );
  const terminalStates = [...replay.finalPaths].sort(
    (left, right) =>
      right.score - left.score ||
      left.stateId.localeCompare(right.stateId),
  );
  if (terminalStates.length === 0) {
    fail(
      "GLOBAL_PATH_NOT_FOUND",
      "DP Ground Truth injection produced no terminal state.",
    );
  }
  const winner = terminalStates[0];
  const winnerIdentitySet = new Set(
    winner.chain.map(
      (candidate) => `${candidate.type}:${candidate.index}`,
    ),
  );
  const comparisonRows = groundTruthCandidates.map(
    (groundTruthCandidate, index) => {
      const winnerCandidate = winner.chain[index];
      const exact =
        winnerCandidate?.type === groundTruthCandidate.type &&
        winnerCandidate?.index === groundTruthCandidate.index;
      const presentAnywhere = winnerIdentitySet.has(
        `${groundTruthCandidate.type}:${groundTruthCandidate.index}`,
      );
      return {
        eventNumber: index + 1,
        groundTruth:
          `${groundTruthCandidate.type === "BOTTOM" ? "B" : "T"}` +
          groundTruthCandidate.index,
        winnerDp: winnerCandidate
          ? `${winnerCandidate.type === "BOTTOM" ? "B" : "T"}${winnerCandidate.index}`
          : null,
        exactPositionMatch: exact ? "MATCH_EXACT" : "DIFFERENT",
        presentInWinningChain: presentAnywhere ? "OUI" : "NON",
        sameTypeCandidateChosenInstead:
          presentAnywhere || !winnerCandidate
            ? null
            : `${winnerCandidate.type === "BOTTOM" ? "B" : "T"}${winnerCandidate.index}`,
      };
    },
  );
  const selectedInjected = comparisonRows.filter(
    (row) => row.presentInWinningChain === "OUI",
  );
  const ignoredInjected = comparisonRows.filter(
    (row) => row.presentInWinningChain === "NON",
  );
  const beforePopulation = {
    population: "REAL_DP_INPUT",
    bottoms: realDpCandidates.filter(
      (candidate) => candidate.type === "BOTTOM",
    ).length,
    tops: realDpCandidates.filter(
      (candidate) => candidate.type === "TOP",
    ).length,
    total: realDpCandidates.length,
  };
  const afterPopulation = {
    population: "REAL_DP_INPUT_PLUS_GROUND_TRUTH",
    bottoms: combinedCandidates.filter(
      (candidate) => candidate.type === "BOTTOM",
    ).length,
    tops: combinedCandidates.filter(
      (candidate) => candidate.type === "TOP",
    ).length,
    total: combinedCandidates.length,
  };
  const terminalTable = terminalStates.map((terminal, index) => ({
    rank: index + 1,
    stateId: terminal.stateId,
    score: terminal.score,
    chain: formatDpChain(terminal.chain),
  }));
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-ground-truth-injection",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_ground_truth_injection_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP Ground Truth injection",
      "",
      "## Population avant injection",
      "",
      markdownTable([beforePopulation]),
      "",
      "## Population après injection",
      "",
      markdownTable([afterPopulation]),
      "",
      "## Candidats Ground Truth",
      "",
      markdownTable(injectionRows),
      "",
      "## Chaîne gagnante",
      "",
      `- Chaîne: ${formatDpChain(winner.chain)}`,
      `- Score final: ${winner.score}`,
      `- Nombre total d'états DP: ${replay.createdStates.length}`,
      `- Nombre d'états terminaux: ${terminalStates.length}`,
      "",
      "## Comparaison Ground Truth / Winner",
      "",
      markdownTable(comparisonRows),
      "",
      "## Candidats Ground Truth sélectionnés",
      "",
      markdownTable(selectedInjected),
      "",
      "## Candidats Ground Truth ignorés",
      "",
      markdownTable(ignoredInjected),
      "",
      "## États terminaux",
      "",
      markdownTable(terminalTable),
      "",
    ].join("\n"),
    "utf8",
  );

  console.log("\n=== DP GT INJECTION: POPULATIONS ===\n");
  console.table([beforePopulation, afterPopulation]);
  console.log("\n=== DP GT INJECTION: GROUND TRUTH CANDIDATES ===\n");
  console.table(injectionRows);
  console.log("\n=== DP GT INJECTION: WINNER ===\n");
  console.table([{
    totalDpStates: replay.createdStates.length,
    terminalStateCount: terminalStates.length,
    finalScore: winner.score,
    reconstructedPath: formatDpChain(winner.chain),
  }]);
  console.log("\n=== DP GT INJECTION: COMPARISON ===\n");
  console.table(comparisonRows);
  console.log("\n=== DP GT INJECTION: SELECTED ===\n");
  console.table(selectedInjected);
  console.log("\n=== DP GT INJECTION: IGNORED ===\n");
  console.table(ignoredInjected);
  console.log("\n=== DP GT INJECTION: TERMINAL STATES ===\n");
  console.table(terminalTable);
  console.log("\n=== DP GT INJECTION: REPORT ===\n");
  console.log(reportPath);
}

function runDpScoreDecomposition(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realDpCandidates: DpCandidate[],
  calibrationWinner: TransitionCandidate[],
  calibrationWinnerScore: number | undefined,
): void {
  const samplingRateHz = dataset.samplingRateHz;
  const offset =
    groundTruth.sync.videoTimeSeconds -
    groundTruth.sync.imuSampleIndex / samplingRateHz;
  const projectedGroundTruth = groundTruth.events.map(
    (event, index): DpCandidate => {
      const sampleIndex = Math.round(
        (event.videoTimeSeconds - offset) * samplingRateHz,
      );
      if (
        sampleIndex < 0 ||
        sampleIndex >= dataset.samples.length
      ) {
        fail(
          "GROUND_TRUTH_INDEX_OUT_OF_RANGE",
          `Score decomposition event ${index + 1}: ${sampleIndex}`,
        );
      }
      return {
        candidateId: `INJECTED_GT_${index + 1}_${event.type}_${sampleIndex}`,
        type: event.type,
        index: sampleIndex,
        value: dataset.samples[sampleIndex][axis],
      };
    },
  );
  const realByIdentity = new Map(
    realDpCandidates.map((candidate) => [
      `${candidate.type}:${candidate.index}`,
      candidate,
    ]),
  );
  const addedGroundTruth = projectedGroundTruth.filter(
    (candidate) =>
      !realByIdentity.has(`${candidate.type}:${candidate.index}`),
  );
  const combinedCandidates = [
    ...realDpCandidates,
    ...addedGroundTruth,
  ];
  if (
    realDpCandidates.length !== 46 ||
    addedGroundTruth.length !== 9 ||
    combinedCandidates.length !== 55 ||
    combinedCandidates.filter((candidate) => candidate.type === "BOTTOM")
      .length !== 27 ||
    combinedCandidates.filter((candidate) => candidate.type === "TOP")
      .length !== 28
  ) {
    fail(
      "INJECTED_POPULATION_MISMATCH",
      `Expected real=46, added=9, combined=55 (27 BOTTOM/28 TOP); got real=${realDpCandidates.length}, added=${addedGroundTruth.length}, combined=${combinedCandidates.length}.`,
    );
  }
  const canonicalGroundTruth = projectedGroundTruth.map(
    (candidate) =>
      realByIdentity.get(`${candidate.type}:${candidate.index}`) ??
      candidate,
  );
  const replay = reconstructAllDpFinalPaths(
    combinedCandidates,
    EXPECTED_REPS,
  );
  const terminalStates = [...replay.finalPaths].sort(
    (left, right) =>
      right.score - left.score ||
      left.stateId.localeCompare(right.stateId),
  );
  const winner = terminalStates[0];
  if (!winner) {
    fail("GLOBAL_PATH_NOT_FOUND", "No terminal DP state.");
  }
  const expectedWinner =
    "BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564";
  const winnerIdentity = winner.chain
    .map((candidate) => `${candidate.type}:${candidate.index}`)
    .join("|");
  const calibrationIdentity = calibrationWinner
    .map((candidate) => `${candidate.type}:${candidate.index}`)
    .join("|");
  if (
    winnerIdentity !== expectedWinner ||
    winnerIdentity !== calibrationIdentity
  ) {
    fail(
      "WINNER_PATH_MISMATCH",
      `Winner=${winnerIdentity}; calibration=${calibrationIdentity}.`,
    );
  }
  if (
    winner.score !== 48176 ||
    calibrationWinnerScore !== 48176
  ) {
    fail(
      "WINNER_SCORE_MISMATCH",
      `Replay=${winner.score}; calibration=${calibrationWinnerScore}.`,
    );
  }

  const candidateContribution = (candidate: DpCandidate) =>
    candidate.type === "BOTTOM" ? -candidate.value : candidate.value;
  const combinedById = new Map(
    combinedCandidates.map((candidate) => [
      candidate.candidateId,
      candidate,
    ]),
  );
  const formatAttemptPath = (attempt: DpStateAttempt) =>
    attempt.chainCandidateIds
      .map((candidateId) => combinedById.get(candidateId))
      .filter(
        (candidate): candidate is DpCandidate =>
          candidate !== undefined,
      )
      .map(
        (candidate) =>
          `${candidate.type === "BOTTOM" ? "B" : "T"}${candidate.index}`,
      )
      .join("-");
  const chainIds = (chain: DpCandidate[]) =>
    chain.map((candidate) => candidate.candidateId);
  const sameIds = (left: string[], right: string[]) =>
    left.length === right.length &&
    left.every((candidateId, index) => candidateId === right[index]);
  const findAttemptForPrefix = (
    chain: DpCandidate[],
    position: number,
  ) => {
    const prefixIds = chainIds(chain.slice(0, position));
    const attempts = replay.stateAttempts.filter(
      (attempt) =>
        attempt.step === position &&
        sameIds(attempt.chainCandidateIds, prefixIds),
    );
    return attempts.length === 0
      ? null
      : attempts.sort((left, right) => right.score - left.score)[0];
  };
  const decompose = (
    pathName: string,
    chain: DpCandidate[],
  ) => {
    let cumulativeScore = 0;
    let previousBottomIndex: number | null = null;
    return chain.map((candidate, index) => {
      const contribution = candidateContribution(candidate);
      cumulativeScore += contribution;
      const predecessor = index > 0 ? chain[index - 1] : null;
      const phaseDurationSamples = predecessor
        ? candidate.index - predecessor.index
        : null;
      const repDurationSamples =
        candidate.type === "BOTTOM" &&
        previousBottomIndex !== null
          ? candidate.index - previousBottomIndex
          : null;
      if (candidate.type === "BOTTOM") {
        previousBottomIndex = candidate.index;
      }
      const attempt = findAttemptForPrefix(chain, index + 1);
      return {
        pathName,
        positionInPath: index + 1,
        eventLabel: `${candidate.type === "BOTTOM" ? "B" : "T"}${Math.floor(index / 2) + 1}`,
        type: candidate.type,
        sampleIndex: candidate.index,
        signalValue: candidate.value,
        candidateScoreContribution: contribution,
        transitionScoreContribution: 0,
        bonusContribution: 0,
        penaltyContribution: 0,
        incrementalScore: contribution,
        cumulativeScore,
        predecessorIndex: predecessor?.index ?? null,
        phaseDurationSamples,
        repDurationSamples,
        dpStateKey: attempt?.stateId ?? null,
        stateId: attempt?.stateId ?? null,
      };
    });
  };
  const winnerRows = decompose("CURRENT_DP_WINNER", winner.chain);
  const groundTruthRows = decompose(
    "GROUND_TRUTH_PATH",
    canonicalGroundTruth,
  );
  const winnerReplayedScore =
    winnerRows[winnerRows.length - 1].cumulativeScore;
  if (
    winnerReplayedScore !== winner.score ||
    winnerReplayedScore !== calibrationWinnerScore
  ) {
    fail(
      "DP_SCORE_REPLAY_MISMATCH",
      `Decomposed=${winnerReplayedScore}; DP=${winner.score}; calibration=${calibrationWinnerScore}.`,
    );
  }
  const groundTruthPathScore =
    groundTruthRows[groundTruthRows.length - 1].cumulativeScore;
  const firstPositionWinnerLeads =
    winnerRows.findIndex(
      (row, index) =>
        row.cumulativeScore >
        groundTruthRows[index].cumulativeScore,
    ) + 1 || null;
  const firstDivergencePosition =
    winner.chain.findIndex(
      (candidate, index) =>
        candidate.type !== canonicalGroundTruth[index].type ||
        candidate.index !== canonicalGroundTruth[index].index,
    ) + 1 || null;

  const dominanceTrace = canonicalGroundTruth.map(
    (candidate, index) => {
      const prefix = canonicalGroundTruth.slice(0, index + 1);
      const prefixDisplay = prefix
        .map(
          (item) =>
            `${item.type === "BOTTOM" ? "B" : "T"}${item.index}`,
        )
        .join("-");
      const attempt = findAttemptForPrefix(
        canonicalGroundTruth,
        index + 1,
      );
      const keptForKey = attempt
        ? replay.stateAttempts
            .filter(
              (entry) =>
                entry.stateId === attempt.stateId &&
                entry.dominanceOutcome ===
                  "STATE_CREATED_AND_KEPT",
            )
            .sort((left, right) => right.score - left.score)[0]
        : null;
      const sameKeyDominant =
        attempt &&
        keptForKey &&
        keptForKey.attemptId !== attempt.attemptId
          ? keptForKey
          : null;
      let reason:
        | "lower_score_same_key"
        | "transition_not_created"
        | "structurally_unreachable"
        | "pruned_by_other_real_rule"
        | "survived_to_terminal"
        | "diagnostic_unavailable";
      if (!attempt) {
        reason =
          index > 0 &&
          dominanceTraceSafePrevious(index, canonicalGroundTruth, replay)
            ? "transition_not_created"
            : "structurally_unreachable";
      } else if (
        attempt.dominanceOutcome !== "STATE_CREATED_AND_KEPT"
      ) {
        reason = "lower_score_same_key";
      } else if (
        terminalStates.some((terminal) =>
          sameIds(
            chainIds(terminal.chain.slice(0, prefix.length)),
            chainIds(prefix),
          ),
        )
      ) {
        reason = "survived_to_terminal";
      } else {
        reason = "diagnostic_unavailable";
      }
      return {
        position: index + 1,
        prefix: prefixDisplay,
        stateCreated: attempt ? "OUI" : "NON",
        score:
          attempt?.score ??
          groundTruthRows[index].cumulativeScore,
        dpKey: attempt?.stateId ?? null,
        attemptOutcome: attempt?.dominanceOutcome ?? "STATE_NOT_CREATED",
        dominantState: sameKeyDominant?.stateId ?? null,
        dominantPath:
          sameKeyDominant
            ? formatAttemptPath(sameKeyDominant)
            : null,
        dominantScore: sameKeyDominant?.score ?? null,
        delta:
          sameKeyDominant && attempt
            ? sameKeyDominant.score - attempt.score
            : null,
        momentOfRemoval:
          attempt &&
          attempt.dominanceOutcome !== "STATE_CREATED_AND_KEPT"
            ? index + 1
            : null,
        reason,
      };
    },
  );
  const firstDominanceLoss =
    dominanceTrace.find(
      (row) => row.reason === "lower_score_same_key",
    )?.position ?? null;
  const gtTerminal = terminalStates.find((terminal) =>
    sameIds(
      chainIds(terminal.chain),
      chainIds(canonicalGroundTruth),
    ),
  );
  const groundTruthTerminalStatus = gtTerminal
    ? "GROUND_TRUTH_TERMINAL_FOUND"
    : firstDominanceLoss !== null
      ? "GROUND_TRUTH_PATH_DOMINATED_BEFORE_TERMINAL"
      : dominanceTrace.some(
            (row) =>
              row.reason === "transition_not_created" ||
              row.reason === "structurally_unreachable",
          )
        ? "GROUND_TRUTH_PATH_BLOCKED_BEFORE_TERMINAL"
        : "GROUND_TRUTH_TRACE_UNAVAILABLE";
  const lastSurvivingPrefix = [...dominanceTrace]
    .reverse()
    .find(
      (row) =>
        row.stateCreated === "OUI" &&
        row.attemptOutcome === "STATE_CREATED_AND_KEPT",
    );
  const comparisonRows = winnerRows.map((winnerRow, index) => {
    const gtRow = groundTruthRows[index];
    return {
      position: index + 1,
      expectedType: winnerRow.type,
      winnerIndex: winnerRow.sampleIndex,
      groundTruthIndex: gtRow.sampleIndex,
      winnerIncrementalScore: winnerRow.incrementalScore,
      groundTruthIncrementalScore: gtRow.incrementalScore,
      incrementalScoreDelta:
        winnerRow.incrementalScore - gtRow.incrementalScore,
      winnerCumulativeScore: winnerRow.cumulativeScore,
      groundTruthCumulativeScore: gtRow.cumulativeScore,
      cumulativeScoreDelta:
        winnerRow.cumulativeScore - gtRow.cumulativeScore,
      firstPositionWhereWinnerLeads:
        index + 1 === firstPositionWinnerLeads ? "OUI" : "NON",
      firstPositionWhereGroundTruthStateDisappears:
        index + 1 === firstDominanceLoss ? "OUI" : "NON",
    };
  });
  const focusIndexes = new Set([195, 199, 228, 262]);
  const focusRows = [
    ...winnerRows,
    ...groundTruthRows,
  ]
    .filter((row) => focusIndexes.has(row.sampleIndex))
    .map((row) => {
      const chain =
        row.pathName === "CURRENT_DP_WINNER"
          ? winner.chain
          : canonicalGroundTruth;
      const attempt = findAttemptForPrefix(
        chain,
        row.positionInPath,
      );
      const dominant = attempt
        ? replay.stateAttempts
            .filter(
              (entry) =>
                entry.stateId === attempt.stateId &&
                entry.score > attempt.score,
            )
            .sort((left, right) => right.score - left.score)[0]
        : null;
      return {
        path: row.pathName,
        candidate: `${row.type === "BOTTOM" ? "B" : "T"}${row.sampleIndex}`,
        value: row.signalValue,
        candidateContribution: row.candidateScoreContribution,
        transitionContribution: 0,
        phaseDurationSamples: row.phaseDurationSamples,
        repDurationSamples: row.repDurationSamples,
        cumulativeScore: row.cumulativeScore,
        stateCreated: attempt ? "OUI" : "NON",
        stateKey: attempt?.stateId ?? null,
        dominanceKey: attempt?.stateId ?? null,
        status:
          attempt?.dominanceOutcome ??
          "STATE_NOT_CREATED",
        dominantState: dominant?.stateId ?? null,
        competingStatePath:
          dominant ? formatAttemptPath(dominant) : null,
        dominantScore: dominant?.score ?? null,
        dominatedScore: dominant ? attempt?.score ?? null : null,
        exactDifference:
          dominant && attempt
            ? dominant.score - attempt.score
            : null,
        mechanicalReason:
          dominant
            ? "higher_score_same_key"
            : attempt
              ? "state_retained_for_key"
              : "predecessor_not_available_or_transition_refused",
      };
    });
  const totals = [
    {
      path: "CURRENT_DP_WINNER",
      totalCandidateContribution: winnerReplayedScore,
      totalTransitionContribution: 0,
      totalBonusContribution: 0,
      totalPenaltyContribution: 0,
      finalScore: winnerReplayedScore,
    },
    {
      path: "GROUND_TRUTH_PATH",
      totalCandidateContribution: groundTruthPathScore,
      totalTransitionContribution: 0,
      totalBonusContribution: 0,
      totalPenaltyContribution: 0,
      finalScore: groundTruthPathScore,
    },
  ];
  const componentComparison = {
    winnerMinusGroundTruthCandidateScore:
      winnerReplayedScore - groundTruthPathScore,
    winnerMinusGroundTruthTransitionScore: 0,
    winnerMinusGroundTruthBonus: 0,
    winnerMinusGroundTruthPenalty: 0,
    winnerMinusGroundTruthFinalScore:
      winnerReplayedScore - groundTruthPathScore,
  };
  const candidateDelta =
    componentComparison.winnerMinusGroundTruthCandidateScore;
  const dominantScoreComponentExplainingDelta =
    Math.abs(candidateDelta) > 0
      ? "CANDIDATE_CONTRIBUTION"
      : "MULTIPLE_EQUAL_COMPONENTS";
  const summary = {
    currentWinnerScore: winnerReplayedScore,
    groundTruthPathScore,
    finalScoreDelta: winnerReplayedScore - groundTruthPathScore,
    firstDivergencePosition,
    firstPositionWinnerLeads,
    firstGroundTruthDominanceLoss: firstDominanceLoss,
    groundTruthTerminalStatus,
    lastSurvivingGroundTruthPrefix:
      lastSurvivingPrefix?.prefix ?? null,
    dominantScoreComponentExplainingDelta,
  };
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-score-decomposition",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_score_decomposition_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP score decomposition",
      "",
      "## Formule exacte du score",
      "",
      "- Score initial : `0`.",
      "- BOTTOM : `candidateScoreContribution = -candidate.value`.",
      "- TOP : `candidateScoreContribution = +candidate.value`.",
      "- `nextScore = previousScore + candidateScoreContribution`.",
      "- Contribution de transition : `0` (aucune dans le code réel).",
      "- Bonus : `0` (aucun dans le code réel).",
      "- Pénalité : `0` (aucune dans le code réel).",
      "- Normalisation : aucune.",
      "",
      "## Contraintes et dominance exactes",
      "",
      "- Alternance imposée : BOTTOM puis TOP, sur 11 positions.",
      "- Index strictement croissants.",
      "- Durée concentrique minimale : 8 samples.",
      "- Durée excentrique minimale : 8 samples.",
      "- Durée minimale entre deux BOTTOM : 45 samples.",
      "- Clé d'état : `step:candidateIndex:lastBottomIndex`.",
      "- Pour une même clé, le nouvel état remplace l'existant uniquement si `nextScore > existingState.score`.",
      "- Le terminal gagnant est le premier état de score strictement supérieur au meilleur rencontré.",
      "",
      "## CURRENT_DP_WINNER",
      "",
      markdownTable(winnerRows),
      "",
      "## GROUND_TRUTH_PATH",
      "",
      markdownTable(groundTruthRows),
      "",
      "## Comparaison position par position",
      "",
      markdownTable(comparisonRows),
      "",
      "## Focus B228 vs B262",
      "",
      markdownTable(focusRows),
      "",
      "## Trace de dominance Ground Truth",
      "",
      markdownTable(dominanceTrace),
      "",
      "## Totaux par composante",
      "",
      markdownTable(totals),
      "",
      markdownTable([componentComparison]),
      "",
      "## Statut terminal Ground Truth",
      "",
      `- GROUND_TRUTH_TERMINAL_STATUS: ${groundTruthTerminalStatus}`,
      `- État terminal Ground Truth: ${gtTerminal?.stateId ?? "absent"}`,
      `- Rang terminal: ${gtTerminal ? terminalStates.indexOf(gtTerminal) + 1 : "non applicable"}`,
      `- Dernier préfixe survivant: ${lastSurvivingPrefix?.prefix ?? "indisponible"}`,
      "",
      "## Résumé mécanique",
      "",
      markdownTable([summary]),
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("\n=== DP SCORE FORMULA ===\n");
  console.log("initialScore = 0");
  console.log("BOTTOM contribution = -candidate.value");
  console.log("TOP contribution = +candidate.value");
  console.log("transition=0, bonus=0, penalty=0, normalization=none");
  console.log("stateKey = step:candidateIndex:lastBottomIndex");
  console.log("replace same key only when nextScore > existingScore");
  console.log("\n=== CURRENT DP WINNER DECOMPOSITION ===\n");
  console.table(winnerRows);
  console.log("\n=== GROUND TRUTH PATH DECOMPOSITION ===\n");
  console.table(groundTruthRows);
  console.log("\n=== POSITION COMPARISON ===\n");
  console.table(comparisonRows);
  console.log("\n=== FOCUS B228 VS B262 ===\n");
  console.table(focusRows);
  console.log("\n=== GROUND TRUTH DOMINANCE TRACE ===\n");
  console.table(dominanceTrace);
  console.log("\n=== COMPONENT TOTALS ===\n");
  console.table(totals);
  console.table([componentComparison]);
  console.log("\n=== TERMINAL STATUS ===\n");
  console.table([summary]);
  console.log("\n=== REPORT ===\n");
  console.log(reportPath);
}

function dominanceTraceSafePrevious(
  position: number,
  chain: DpCandidate[],
  replay: ReturnType<typeof reconstructAllDpFinalPaths>,
): boolean {
  if (position <= 0) return false;
  const prefixIds = chain
    .slice(0, position)
    .map((candidate) => candidate.candidateId);
  return replay.stateAttempts.some(
    (attempt) =>
      attempt.step === position &&
      attempt.chainCandidateIds.length === prefixIds.length &&
      attempt.chainCandidateIds.every(
        (candidateId, index) =>
          candidateId === prefixIds[index],
      ),
  );
}

function populationStd(values: number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  return Math.sqrt(
    mean(values.map((value) => (value - average) ** 2)),
  );
}

function medianAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const center = median(values);
  return median(values.map((value) => Math.abs(value - center)));
}

function linearTrend(values: number[]) {
  const xs = values.map((_, index) => index + 1);
  const xMean = mean(xs);
  const yMean = mean(values);
  const denominator = xs.reduce(
    (sum, x) => sum + (x - xMean) ** 2,
    0,
  );
  const slope =
    denominator === 0
      ? 0
      : xs.reduce(
          (sum, x, index) =>
            sum + (x - xMean) * (values[index] - yMean),
          0,
        ) / denominator;
  const intercept = yMean - slope * xMean;
  const residualError = Math.sqrt(
    mean(
      values.map(
        (value, index) =>
          (value - (intercept + slope * xs[index])) ** 2,
      ),
    ),
  );
  const differences = values
    .slice(1)
    .map((value, index) => value - values[index]);
  const differenceMad = medianAbsoluteDeviation(differences);
  const differenceMedian =
    differences.length > 0 ? median(differences) : 0;
  const abruptThreshold = 3 * differenceMad;
  return {
    differences: differences.join(", "),
    slope,
    residualError,
    abruptChangeThreshold:
      differenceMad === 0 ? null : abruptThreshold,
    abruptChangeCount:
      differenceMad === 0
        ? 0
        : differences.filter(
            (difference) =>
              Math.abs(difference - differenceMedian) >
              abruptThreshold,
          ).length,
  };
}

function resampleSignal(segment: number[], length: number): number[] {
  if (segment.length === 0 || length <= 0) return [];
  if (segment.length === 1) return Array(length).fill(segment[0]);
  return Array.from({ length }, (_, outputIndex) => {
    const sourcePosition =
      (outputIndex / (length - 1)) * (segment.length - 1);
    const left = Math.floor(sourcePosition);
    const right = Math.min(segment.length - 1, left + 1);
    const ratio = sourcePosition - left;
    return segment[left] * (1 - ratio) + segment[right] * ratio;
  });
}

function pearsonCorrelation(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) return 0;
  const leftMean = mean(left);
  const rightMean = mean(right);
  const numerator = left.reduce(
    (sum, value, index) =>
      sum + (value - leftMean) * (right[index] - rightMean),
    0,
  );
  const leftScale = Math.sqrt(
    left.reduce((sum, value) => sum + (value - leftMean) ** 2, 0),
  );
  const rightScale = Math.sqrt(
    right.reduce(
      (sum, value) => sum + (value - rightMean) ** 2,
      0,
    ),
  );
  return leftScale === 0 || rightScale === 0
    ? 0
    : numerator / (leftScale * rightScale);
}

function renderComparisonLines(
  title: string,
  series: Array<{ label: string; values: number[]; color: RGB }>,
  outputPath: string,
): void {
  const image = new Raster(1400, 760);
  const left = 100;
  const right = 1330;
  const top = 100;
  const bottom = 650;
  const allValues = series.flatMap((entry) => entry.values);
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const padding = Math.max((maximum - minimum) * 0.1, 0.01);
  const maxLength = Math.max(
    ...series.map((entry) => entry.values.length),
  );
  const x = (index: number) =>
    left + (index / Math.max(1, maxLength - 1)) * (right - left);
  const y = (value: number) =>
    bottom -
    ((value - (minimum - padding)) /
      (maximum - minimum + 2 * padding)) *
      (bottom - top);
  image.text(left, 25, title, [0, 0, 0], 2);
  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);
  series.forEach((entry, seriesIndex) => {
    image.text(
      left + seriesIndex * 300,
      62,
      entry.label,
      entry.color,
      1,
    );
    entry.values.forEach((value, index) => {
      image.marker(x(index), y(value), "circle", entry.color);
      if (index > 0) {
        image.line(
          x(index - 1),
          y(entry.values[index - 1]),
          x(index),
          y(value),
          entry.color,
        );
      }
    });
  });
  for (let index = 0; index < maxLength; index += 1) {
    image.text(x(index) - 4, bottom + 15, String(index + 1), [0, 0, 0], 1);
  }
  image.writePng(outputPath);
}

function renderCycleShapes(
  winnerCycles: number[][],
  groundTruthCycles: number[][],
  outputPath: string,
): void {
  const image = new Raster(1500, 900);
  const panels = [
    {
      title: "CURRENT DP WINNER - 5 NORMALIZED CYCLES",
      cycles: winnerCycles,
      top: 85,
    },
    {
      title: "GROUND TRUTH - 5 NORMALIZED CYCLES",
      cycles: groundTruthCycles,
      top: 500,
    },
  ];
  const colors: RGB[] = [
    [210, 35, 35],
    [30, 100, 210],
    [20, 150, 70],
    [150, 45, 180],
    [225, 120, 10],
  ];
  panels.forEach((panel) => {
    const left = 90;
    const right = 1430;
    const top = panel.top;
    const bottom = top + 300;
    const values = panel.cycles.flat();
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const x = (index: number) =>
      left + (index / 99) * (right - left);
    const y = (value: number) =>
      bottom -
      ((value - minValue) / Math.max(1, maxValue - minValue)) *
        (bottom - top);
    image.text(left, top - 45, panel.title, [0, 0, 0], 2);
    image.line(left, top, left, bottom, [0, 0, 0]);
    image.line(left, bottom, right, bottom, [0, 0, 0]);
    panel.cycles.forEach((cycle, cycleIndex) => {
      for (let index = 1; index < cycle.length; index += 1) {
        image.line(
          x(index - 1),
          y(cycle[index - 1]),
          x(index),
          y(cycle[index]),
          colors[cycleIndex],
        );
      }
    });
  });
  image.writePng(outputPath);
}

function runDpV2FeatureAnalysis(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realDpCandidates: DpCandidate[],
  calibrationWinner: TransitionCandidate[],
  calibrationWinnerScore: number | undefined,
  debug: NonNullable<ReturnType<typeof calculateCalibration>["debug"]>,
): void {
  const values = dataset.samples.map((sample) => sample[axis]);
  const samplingRateHz = dataset.samplingRateHz;
  const offset =
    groundTruth.sync.videoTimeSeconds -
    groundTruth.sync.imuSampleIndex / samplingRateHz;
  const groundTruthPath: DpCandidate[] = groundTruth.events.map(
    (event, index) => {
      const sampleIndex = Math.round(
        (event.videoTimeSeconds - offset) * samplingRateHz,
      );
      return {
        candidateId: `GT_${index + 1}`,
        type: event.type,
        index: sampleIndex,
        value: values[sampleIndex],
      };
    },
  );
  const realByIdentity = new Map(
    realDpCandidates.map((candidate) => [
      `${candidate.type}:${candidate.index}`,
      candidate,
    ]),
  );
  const winnerPath: DpCandidate[] = calibrationWinner.map(
    (event, index) =>
      realByIdentity.get(`${event.type}:${event.index}`) ?? {
        candidateId: `WINNER_${index + 1}`,
        type: event.type,
        index: event.index,
        value: values[event.index],
      },
  );
  const expectedWinner =
    "BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564";
  const expectedGroundTruth =
    "BOTTOM:169|TOP:199|BOTTOM:262|TOP:291|BOTTOM:353|TOP:383|BOTTOM:445|TOP:474|BOTTOM:529|TOP:558|BOTTOM:611";
  const identity = (chain: DpCandidate[]) =>
    chain.map((event) => `${event.type}:${event.index}`).join("|");
  if (identity(winnerPath) !== expectedWinner) {
    fail("WINNER_PATH_MISMATCH", identity(winnerPath));
  }
  if (calibrationWinnerScore !== 48176) {
    fail(
      "WINNER_SCORE_MISMATCH",
      String(calibrationWinnerScore),
    );
  }
  if (identity(groundTruthPath) !== expectedGroundTruth) {
    fail("GROUND_TRUTH_PATH_MISMATCH", identity(groundTruthPath));
  }
  for (const chain of [winnerPath, groundTruthPath]) {
    if (
      chain.length !== 11 ||
      !isExpectedAlternation(chain) ||
      !isStrictlyIncreasing(chain.map((event) => event.index)) ||
      chain.some(
        (event) =>
          event.index < 0 || event.index >= dataset.samples.length,
      )
    ) {
      fail("INVALID_PATH_STRUCTURE", identity(chain));
    }
  }

  const robustRange = debug.robustRange;
  const descriptiveProminence = (
    candidate: DpCandidate,
  ): number => {
    const future = values.slice(
      candidate.index,
      Math.min(
        values.length,
        candidate.index +
          CALIBRATION_PARAMETERS.prominenceWindowSize,
      ),
    );
    return candidate.type === "BOTTOM"
      ? Math.max(...future) - candidate.value
      : candidate.value - Math.min(...future);
  };
  const localNoise = (index: number) => {
    const start = Math.max(0, index - 8);
    const end = Math.min(values.length - 1, index + 8);
    const segment = values.slice(start, end + 1);
    return median(
      segment
        .slice(1)
        .map((value, offsetIndex) =>
          Math.abs(value - segment[offsetIndex]),
        ),
    );
  };
  const eventRowsFor = (
    pathName: string,
    chain: DpCandidate[],
  ) =>
    chain.map((candidate, index) => {
      const identityKey = `${candidate.type}:${candidate.index}`;
      const existed = realByIdentity.has(identityKey);
      const prominenceDebug = debug.filterDebugEvents.find(
        (event) =>
          event.filter === "PROMINENCE" &&
          event.type === candidate.type &&
          event.index === candidate.index,
      );
      const directionDebug = debug.filterDebugEvents.find(
        (event) =>
          event.filter === "DIRECTION_CHANGE" &&
          event.type === candidate.type &&
          event.index === candidate.index,
      );
      const prominence =
        prominenceDebug?.prominence ??
        descriptiveProminence(candidate);
      const noise = localNoise(candidate.index);
      return {
        pathName,
        positionInPath: index + 1,
        eventLabel: `${candidate.type === "BOTTOM" ? "B" : "T"}${Math.floor(index / 2) + 1}`,
        type: candidate.type,
        index: candidate.index,
        rawSignalValue: candidate.value,
        localProminence: prominence,
        robustNormalizedProminence:
          robustRange === 0 ? null : prominence / robustRange,
        localNoiseEstimate: noise,
        prominenceToNoiseRatio:
          noise === 0 ? null : prominence / noise,
        directionChangeMagnitude:
          directionDebug?.directionChange ?? null,
        directionChangeConfidence: null,
        snapDistanceSamples: null,
        candidateSource:
          pathName === "CURRENT_DP_WINNER"
            ? "REAL_CANDIDATE"
            : existed
              ? "EXISTED_BEFORE_INJECTION"
              : "INJECTED_GROUND_TRUTH",
        prominenceSource: prominenceDebug
          ? "CALIBRATION_DEBUG"
          : "DESCRIPTIVE_RECOMPUTATION",
      };
    });
  const winnerEventRows = eventRowsFor(
    "CURRENT_DP_WINNER",
    winnerPath,
  );
  const groundTruthEventRows = eventRowsFor(
    "GROUND_TRUTH_PATH",
    groundTruthPath,
  );
  const eventRows = [...winnerEventRows, ...groundTruthEventRows];

  const cyclesFor = (
    pathName: string,
    chain: DpCandidate[],
  ) => {
    const normalizedSegments = Array.from(
      { length: 5 },
      (_, repIndex) => {
        const start = chain[repIndex * 2].index;
        const end = chain[repIndex * 2 + 2].index;
        return resampleSignal(values.slice(start, end + 1), 100);
      },
    );
    const medianProfile = Array.from({ length: 100 }, (_, index) =>
      median(normalizedSegments.map((segment) => segment[index])),
    );
    const rows = Array.from({ length: 5 }, (_, repIndex) => {
      const bottomStart = chain[repIndex * 2];
      const top = chain[repIndex * 2 + 1];
      const bottomEnd = chain[repIndex * 2 + 2];
      const bottomToTop = top.index - bottomStart.index;
      const topToBottom = bottomEnd.index - top.index;
      const fullRep = bottomEnd.index - bottomStart.index;
      const upwardAmplitude = Math.abs(
        top.value - bottomStart.value,
      );
      const downwardAmplitude = Math.abs(
        top.value - bottomEnd.value,
      );
      const meanCycleAmplitude =
        (upwardAmplitude + downwardAmplitude) / 2;
      return {
        pathName,
        repNumber: repIndex + 1,
        bottomStartIndex: bottomStart.index,
        topIndex: top.index,
        bottomEndIndex: bottomEnd.index,
        bottomToTopDurationSamples: bottomToTop,
        topToBottomDurationSamples: topToBottom,
        fullRepDurationSamples: fullRep,
        bottomToTopDurationMilliseconds:
          bottomToTop * (1000 / samplingRateHz),
        topToBottomDurationMilliseconds:
          topToBottom * (1000 / samplingRateHz),
        fullRepDurationMilliseconds:
          fullRep * (1000 / samplingRateHz),
        phaseDurationRatio:
          topToBottom === 0 ? null : bottomToTop / topToBottom,
        startBottomValue: bottomStart.value,
        topValue: top.value,
        endBottomValue: bottomEnd.value,
        upwardAmplitude,
        downwardAmplitude,
        meanCycleAmplitude,
        normalizedCycleAmplitude:
          robustRange === 0
            ? null
            : meanCycleAmplitude / robustRange,
        bottomDrift: Math.abs(bottomEnd.value - bottomStart.value),
        correlationToMedianCycle: pearsonCorrelation(
          normalizedSegments[repIndex],
          medianProfile,
        ),
      };
    });
    return { rows, normalizedSegments, medianProfile };
  };
  const winnerCycles = cyclesFor("CURRENT_DP_WINNER", winnerPath);
  const groundTruthCycles = cyclesFor(
    "GROUND_TRUTH_PATH",
    groundTruthPath,
  );
  const cycleRows = [
    ...winnerCycles.rows,
    ...groundTruthCycles.rows,
  ];
  if (cycleRows.length !== 10) {
    fail(
      "FEATURE_CALCULATION_ERROR",
      `Expected 10 cycle rows, got ${cycleRows.length}.`,
    );
  }
  const activeRegionStartIndex = Math.min(
    ...realDpCandidates.map((candidate) => candidate.index),
  );
  const activeRegionEndIndex = Math.max(
    ...realDpCandidates.map((candidate) => candidate.index),
  );
  const summarize = (
    pathName: string,
    chain: DpCandidate[],
    events: typeof winnerEventRows,
    cycles: typeof winnerCycles,
    finalLegacyDpScore: number,
  ) => {
    const bottomToTop = cycles.rows.map(
      (row) => row.bottomToTopDurationSamples,
    );
    const topToBottom = cycles.rows.map(
      (row) => row.topToBottomDurationSamples,
    );
    const fullRep = cycles.rows.map(
      (row) => row.fullRepDurationSamples,
    );
    const amplitudes = cycles.rows.map(
      (row) => row.meanCycleAmplitude,
    );
    const drifts = cycles.rows.map((row) => row.bottomDrift);
    const correlations = cycles.rows.map(
      (row) => row.correlationToMedianCycle,
    );
    const gaps = chain
      .slice(1)
      .map((candidate, index) => candidate.index - chain[index].index);
    const cv = (numbers: number[]) =>
      mean(numbers) === 0
        ? null
        : populationStd(numbers) / mean(numbers);
    return {
      pathName,
      finalLegacyDpScore,
      meanNormalizedProminence: mean(
        events.map(
          (event) => event.robustNormalizedProminence as number,
        ),
      ),
      medianNormalizedProminence: median(
        events.map(
          (event) => event.robustNormalizedProminence as number,
        ),
      ),
      meanProminenceToNoiseRatio: mean(
        events
          .map((event) => event.prominenceToNoiseRatio)
          .filter((value): value is number => value !== null),
      ),
      meanBottomToTopDuration: mean(bottomToTop),
      medianBottomToTopDuration: median(bottomToTop),
      stdBottomToTopDurationPopulation: populationStd(bottomToTop),
      bottomToTopDurationCV: cv(bottomToTop),
      meanTopToBottomDuration: mean(topToBottom),
      medianTopToBottomDuration: median(topToBottom),
      stdTopToBottomDurationPopulation: populationStd(topToBottom),
      topToBottomDurationCV: cv(topToBottom),
      meanFullRepDuration: mean(fullRep),
      medianFullRepDuration: median(fullRep),
      stdFullRepDurationPopulation: populationStd(fullRep),
      fullRepDurationCV: cv(fullRep),
      fullRepDurationMAD: medianAbsoluteDeviation(fullRep),
      minFullRepDuration: Math.min(...fullRep),
      maxFullRepDuration: Math.max(...fullRep),
      fullRepDurationRange:
        Math.max(...fullRep) - Math.min(...fullRep),
      meanCycleAmplitude: mean(amplitudes),
      medianCycleAmplitude: median(amplitudes),
      stdCycleAmplitudePopulation: populationStd(amplitudes),
      cycleAmplitudeCV: cv(amplitudes),
      cycleAmplitudeMAD: medianAbsoluteDeviation(amplitudes),
      minCycleAmplitude: Math.min(...amplitudes),
      maxCycleAmplitude: Math.max(...amplitudes),
      cycleAmplitudeRange:
        Math.max(...amplitudes) - Math.min(...amplitudes),
      meanBottomDrift: mean(drifts),
      maxBottomDrift: Math.max(...drifts),
      firstSelectedIndex: chain[0].index,
      lastSelectedIndex: chain[chain.length - 1].index,
      selectedSpanSamples:
        chain[chain.length - 1].index - chain[0].index,
      selectedSpanMilliseconds:
        (chain[chain.length - 1].index - chain[0].index) *
        (1000 / samplingRateHz),
      activeRegionStartIndex,
      activeRegionEndIndex,
      activeRegionSpanSamples:
        activeRegionEndIndex - activeRegionStartIndex,
      coverageRatio:
        (chain[chain.length - 1].index - chain[0].index) /
        (activeRegionEndIndex - activeRegionStartIndex),
      unselectedPrefixSamples:
        chain[0].index - activeRegionStartIndex,
      unselectedSuffixSamples:
        activeRegionEndIndex - chain[chain.length - 1].index,
      largestGapBetweenSelectedEvents: Math.max(...gaps),
      meanGapBetweenSelectedEvents: mean(gaps),
      numberOfLargeUnexplainedOscillations:
        "ACTIVITY_REGION_DIAGNOSTIC_UNAVAILABLE",
      meanCycleCorrelation: mean(correlations),
      medianCycleCorrelation: median(correlations),
      minCycleCorrelation: Math.min(...correlations),
      cycleCorrelationStdPopulation: populationStd(correlations),
    };
  };
  const legacyScore = (chain: DpCandidate[]) =>
    chain.reduce(
      (sum, candidate) =>
        sum +
        (candidate.type === "BOTTOM"
          ? -candidate.value
          : candidate.value),
      0,
    );
  const winnerSummary = summarize(
    "CURRENT_DP_WINNER",
    winnerPath,
    winnerEventRows,
    winnerCycles,
    legacyScore(winnerPath),
  );
  const groundTruthSummary = summarize(
    "GROUND_TRUTH_PATH",
    groundTruthPath,
    groundTruthEventRows,
    groundTruthCycles,
    legacyScore(groundTruthPath),
  );
  const summaryRows = [winnerSummary, groundTruthSummary];
  const trends = [
    {
      pathName: "CURRENT_DP_WINNER",
      metric: "FULL_REP_DURATION",
      ...linearTrend(
        winnerCycles.rows.map((row) => row.fullRepDurationSamples),
      ),
    },
    {
      pathName: "GROUND_TRUTH_PATH",
      metric: "FULL_REP_DURATION",
      ...linearTrend(
        groundTruthCycles.rows.map(
          (row) => row.fullRepDurationSamples,
        ),
      ),
    },
    {
      pathName: "CURRENT_DP_WINNER",
      metric: "CYCLE_AMPLITUDE",
      ...linearTrend(
        winnerCycles.rows.map((row) => row.meanCycleAmplitude),
      ),
    },
    {
      pathName: "GROUND_TRUTH_PATH",
      metric: "CYCLE_AMPLITUDE",
      ...linearTrend(
        groundTruthCycles.rows.map(
          (row) => row.meanCycleAmplitude,
        ),
      ),
    },
  ];
  type Direction =
    | "LOWER_IS_MORE_REGULAR"
    | "HIGHER_IS_MORE_COHERENT"
    | "NO_AUTOMATIC_PREFERENCE"
    | "UNAVAILABLE";
  const metricDefinitions: Array<{
    metricName: keyof typeof winnerSummary;
    preferredDirectionKnown: Direction;
    family: string;
  }> = [
    { metricName: "finalLegacyDpScore", preferredDirectionKnown: "NO_AUTOMATIC_PREFERENCE", family: "LOCAL_CANDIDATE_QUALITY" },
    { metricName: "meanNormalizedProminence", preferredDirectionKnown: "HIGHER_IS_MORE_COHERENT", family: "LOCAL_CANDIDATE_QUALITY" },
    { metricName: "medianNormalizedProminence", preferredDirectionKnown: "HIGHER_IS_MORE_COHERENT", family: "LOCAL_CANDIDATE_QUALITY" },
    { metricName: "meanProminenceToNoiseRatio", preferredDirectionKnown: "HIGHER_IS_MORE_COHERENT", family: "LOCAL_CANDIDATE_QUALITY" },
    { metricName: "fullRepDurationCV", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "TEMPORAL_CONSISTENCY" },
    { metricName: "fullRepDurationMAD", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "TEMPORAL_CONSISTENCY" },
    { metricName: "bottomToTopDurationCV", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "TEMPORAL_CONSISTENCY" },
    { metricName: "topToBottomDurationCV", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "TEMPORAL_CONSISTENCY" },
    { metricName: "cycleAmplitudeCV", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "AMPLITUDE_CONSISTENCY" },
    { metricName: "cycleAmplitudeMAD", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "AMPLITUDE_CONSISTENCY" },
    { metricName: "meanBottomDrift", preferredDirectionKnown: "LOWER_IS_MORE_REGULAR", family: "AMPLITUDE_CONSISTENCY" },
    { metricName: "coverageRatio", preferredDirectionKnown: "NO_AUTOMATIC_PREFERENCE", family: "ACTIVITY_COVERAGE" },
    { metricName: "meanCycleCorrelation", preferredDirectionKnown: "HIGHER_IS_MORE_COHERENT", family: "CYCLE_SHAPE_SIMILARITY" },
    { metricName: "minCycleCorrelation", preferredDirectionKnown: "HIGHER_IS_MORE_COHERENT", family: "CYCLE_SHAPE_SIMILARITY" },
  ];
  const differenceRows = metricDefinitions.map((definition) => {
    const winnerValue = winnerSummary[definition.metricName];
    const gtValue = groundTruthSummary[definition.metricName];
    const numericWinner =
      typeof winnerValue === "number" ? winnerValue : null;
    const numericGt = typeof gtValue === "number" ? gtValue : null;
    const signedDelta =
      numericWinner !== null && numericGt !== null
        ? numericGt - numericWinner
        : null;
    return {
      metricName: definition.metricName,
      family: definition.family,
      currentWinnerValue: numericWinner,
      groundTruthValue: numericGt,
      signedDelta,
      absoluteDelta:
        signedDelta === null ? null : Math.abs(signedDelta),
      relativeDeltaPercent:
        signedDelta === null ||
        numericWinner === null ||
        numericWinner === 0
          ? null
          : (signedDelta / Math.abs(numericWinner)) * 100,
      preferredDirectionKnown: definition.preferredDirectionKnown,
    };
  });
  const familyNames = [
    "LOCAL_CANDIDATE_QUALITY",
    "TEMPORAL_CONSISTENCY",
    "AMPLITUDE_CONSISTENCY",
    "ACTIVITY_COVERAGE",
    "CYCLE_SHAPE_SIMILARITY",
  ];
  const familyRows = familyNames.map((family) => {
    const metrics = differenceRows.filter(
      (row) => row.family === family,
    );
    const directed = metrics.filter(
      (row) =>
        row.preferredDirectionKnown !==
          "NO_AUTOMATIC_PREFERENCE" &&
        row.preferredDirectionKnown !== "UNAVAILABLE" &&
        row.signedDelta !== null &&
        row.signedDelta !== 0,
    );
    const groundTruthFavored = directed.filter((row) =>
      row.preferredDirectionKnown === "LOWER_IS_MORE_REGULAR"
        ? (row.signedDelta as number) < 0
        : (row.signedDelta as number) > 0,
    ).length;
    const winnerFavored = directed.length - groundTruthFavored;
    const noPreference = metrics.filter(
      (row) =>
        row.preferredDirectionKnown ===
        "NO_AUTOMATIC_PREFERENCE",
    ).length;
    const standardized = metrics
      .map((row) => {
        const denominator = Math.max(
          Math.abs(row.currentWinnerValue ?? 0),
          Math.abs(row.groundTruthValue ?? 0),
        );
        return denominator === 0 || row.absoluteDelta === null
          ? null
          : row.absoluteDelta / denominator;
      })
      .filter((value): value is number => value !== null);
    const status =
      directed.length === 0
        ? noPreference === metrics.length
          ? "NO_PREFERENCE_DEFINED"
          : "INSUFFICIENT_DATA"
        : groundTruthFavored === directed.length
          ? `GROUND_TRUTH_MORE_REGULAR_ON_${groundTruthFavored}_METRICS`
          : winnerFavored === directed.length
            ? `WINNER_MORE_REGULAR_ON_${winnerFavored}_METRICS`
            : "MIXED_RESULTS";
    return {
      family,
      metricsIncluded: metrics
        .map((row) => row.metricName)
        .join(", "),
      availableMetricCount: metrics.filter(
        (row) => row.signedDelta !== null,
      ).length,
      groundTruthFavoredMetricCount: groundTruthFavored,
      winnerFavoredMetricCount: winnerFavored,
      noPreferenceMetricCount: noPreference,
      largestObservableStandardizedDifference:
        standardized.length > 0 ? Math.max(...standardized) : null,
      status,
    };
  });
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-v2-feature-analysis",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const graphPaths = {
    repDurations: path.join(outputDirectory, "rep_durations_comparison.png"),
    phaseDurations: path.join(outputDirectory, "phase_durations_comparison.png"),
    amplitudes: path.join(outputDirectory, "cycle_amplitudes_comparison.png"),
    shapes: path.join(outputDirectory, "cycle_shapes_comparison.png"),
    summary: path.join(outputDirectory, "feature_summary_comparison.png"),
  };
  renderComparisonLines(
    "FULL REP DURATIONS - SAMPLES",
    [
      { label: "WINNER", values: winnerCycles.rows.map((row) => row.fullRepDurationSamples), color: [210, 35, 35] },
      { label: "GROUND TRUTH", values: groundTruthCycles.rows.map((row) => row.fullRepDurationSamples), color: [30, 100, 210] },
    ],
    graphPaths.repDurations,
  );
  renderComparisonLines(
    "PHASE DURATIONS - SAMPLES",
    [
      { label: "WINNER B-T", values: winnerCycles.rows.map((row) => row.bottomToTopDurationSamples), color: [210, 35, 35] },
      { label: "WINNER T-B", values: winnerCycles.rows.map((row) => row.topToBottomDurationSamples), color: [225, 120, 10] },
      { label: "GT B-T", values: groundTruthCycles.rows.map((row) => row.bottomToTopDurationSamples), color: [30, 100, 210] },
      { label: "GT T-B", values: groundTruthCycles.rows.map((row) => row.topToBottomDurationSamples), color: [20, 150, 70] },
    ],
    graphPaths.phaseDurations,
  );
  renderComparisonLines(
    "MEAN CYCLE AMPLITUDES",
    [
      { label: "WINNER", values: winnerCycles.rows.map((row) => row.meanCycleAmplitude), color: [210, 35, 35] },
      { label: "GROUND TRUTH", values: groundTruthCycles.rows.map((row) => row.meanCycleAmplitude), color: [30, 100, 210] },
    ],
    graphPaths.amplitudes,
  );
  renderCycleShapes(
    winnerCycles.normalizedSegments,
    groundTruthCycles.normalizedSegments,
    graphPaths.shapes,
  );
  const comparableMetrics = differenceRows.filter(
    (row) =>
      row.currentWinnerValue !== null &&
      row.groundTruthValue !== null,
  );
  renderComparisonLines(
    "FEATURE SUMMARY - EACH METRIC DIVIDED BY PAIR MAX ABS",
    [
      {
        label: "WINNER",
        values: comparableMetrics.map((row) => {
          const scale = Math.max(
            Math.abs(row.currentWinnerValue as number),
            Math.abs(row.groundTruthValue as number),
          );
          return scale === 0
            ? 0
            : (row.currentWinnerValue as number) / scale;
        }),
        color: [210, 35, 35],
      },
      {
        label: "GROUND TRUTH",
        values: comparableMetrics.map((row) => {
          const scale = Math.max(
            Math.abs(row.currentWinnerValue as number),
            Math.abs(row.groundTruthValue as number),
          );
          return scale === 0
            ? 0
            : (row.groundTruthValue as number) / scale;
        }),
        color: [30, 100, 210],
      },
    ],
    graphPaths.summary,
  );
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_v2_feature_analysis_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP V2 feature analysis",
      "",
      "## Contexte et chaînes comparées",
      "",
      `- CURRENT_DP_WINNER: ${formatDpChain(winnerPath)}`,
      `- GROUND_TRUTH_PATH: ${formatDpChain(groundTruthPath)}`,
      "",
      "## Définitions",
      "",
      `- Axe brut: ${String(axis)}.`,
      `- robustSignalRange: ${robustRange}, valeur instrumentée par calibration.`,
      "- Prominence réelle: diagnostic PROMINENCE de calibration lorsqu'il existe.",
      "- Prominence injectée: DESCRIPTIVE_RECOMPUTATION sur la fenêtre future de 8 samples; elle n'est pas présentée comme une valeur interne officielle.",
      "- Bruit local: médiane des différences absolues consécutives dans la fenêtre ±8 samples.",
      "- Écart-type: population.",
      "- Zone active descriptive: étendue min–max de tous les candidats réels admissibles entrant dans le DP; aucun détecteur d'activité supplémentaire.",
      "- Cycles: interpolation linéaire à 100 points, profil médian point par point, corrélation de Pearson.",
      "- Changements brusques: écart à la médiane des différences successives supérieur à 3 × MAD; mesure descriptive uniquement.",
      "",
      "## Tableau A — Événements",
      "",
      markdownTable(eventRows),
      "",
      "## Tableau B — Répétitions",
      "",
      markdownTable(cycleRows),
      "",
      "## Tableau C — Synthèse",
      "",
      markdownTable(summaryRows),
      "",
      "## Régularité et tendances",
      "",
      markdownTable(trends),
      "",
      "## Différences Winner vs Ground Truth",
      "",
      markdownTable(differenceRows),
      "",
      "## Résumé par famille",
      "",
      markdownTable(familyRows),
      "",
      "## Graphiques",
      "",
      ...Object.values(graphPaths).map((graphPath) => `- ${graphPath}`),
      "",
      "## Limites",
      "",
      "- Une seule vidéo annotée.",
      "- Aucune généralisation possible.",
      "- Aucune pondération apprise.",
      "- Aucune conclusion biomécanique automatique.",
      "",
      "## Décision humaine sur les features à retenir",
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("\n=== DP V2 FEATURE ANALYSIS: EVENTS ===\n");
  console.table(eventRows);
  console.log("\n=== DP V2 FEATURE ANALYSIS: REPS ===\n");
  console.table(cycleRows);
  console.log("\n=== DP V2 FEATURE ANALYSIS: SUMMARY ===\n");
  console.table(summaryRows);
  console.log("\n=== DP V2 FEATURE ANALYSIS: DIFFERENCES ===\n");
  console.table(differenceRows);
  console.log("\n=== DP V2 FEATURE ANALYSIS: FAMILIES ===\n");
  console.table(familyRows);
  console.log("\n=== DP V2 FEATURE ANALYSIS: ARTIFACTS ===\n");
  Object.values(graphPaths).forEach((graphPath) =>
    console.log(graphPath),
  );
  console.log(reportPath);
}

function rankNumbers(values: number[], descending: boolean): number[] {
  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort(
      (left, right) =>
        (descending
          ? right.value - left.value
          : left.value - right.value) || left.index - right.index,
    );
  const ranks = Array(values.length).fill(0) as number[];
  for (let position = 0; position < sorted.length; ) {
    let end = position + 1;
    while (
      end < sorted.length &&
      sorted[end].value === sorted[position].value
    ) {
      end += 1;
    }
    const averageRank = (position + 1 + end) / 2;
    for (let cursor = position; cursor < end; cursor += 1) {
      ranks[sorted[cursor].index] = averageRank;
    }
    position = end;
  }
  return ranks;
}

function spearmanCorrelation(left: number[], right: number[]): number {
  return pearsonCorrelation(
    rankNumbers(left, false),
    rankNumbers(right, false),
  );
}

function renderScatterPlot(
  points: Array<{
    x: number;
    y: number;
    label: string;
    color: RGB;
  }>,
  outputPath: string,
): void {
  const image = new Raster(1400, 850);
  const left = 100;
  const right = 1320;
  const top = 100;
  const bottom = 750;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const x = (value: number) =>
    left +
    ((value - minX) / Math.max(0.000001, maxX - minX)) *
      (right - left);
  const y = (value: number) =>
    bottom -
    ((value - minY) / Math.max(0.000001, maxY - minY)) *
      (bottom - top);
  image.text(left, 25, "TEMPORAL SCORE VS SHAPE SCORE", [0, 0, 0], 2);
  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);
  points.forEach((point) => {
    image.marker(x(point.x), y(point.y), "circle", point.color);
    image.text(x(point.x) + 8, y(point.y) - 8, point.label, point.color, 1);
  });
  image.writePng(outputPath);
}

function renderCorrelationMatrix(
  metricNames: string[],
  matrix: number[][],
  outputPath: string,
): void {
  const cell = Math.max(18, Math.floor(1050 / metricNames.length));
  const image = new Raster(1450, 1300);
  const left = 330;
  const top = 180;
  image.text(50, 25, "SPEARMAN FEATURE CORRELATION MATRIX", [0, 0, 0], 2);
  metricNames.forEach((name, index) => {
    image.text(5, top + index * cell + 5, `${index + 1} ${name}`, [0, 0, 0], 1);
    image.text(left + index * cell + 5, top - 25, String(index + 1), [0, 0, 0], 1);
  });
  matrix.forEach((row, rowIndex) =>
    row.forEach((correlation, columnIndex) => {
      const magnitude = Math.min(1, Math.abs(correlation));
      const color: RGB =
        correlation >= 0
          ? [Math.round(255 * (1 - magnitude)), Math.round(255 * (1 - magnitude)), 255]
          : [255, Math.round(255 * (1 - magnitude)), Math.round(255 * (1 - magnitude))];
      image.rectangle(
        left + columnIndex * cell,
        top + rowIndex * cell,
        cell - 1,
        cell - 1,
        color,
      );
    }),
  );
  image.writePng(outputPath);
}

function runDpV2PathRankingAnalysis(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realDpCandidates: DpCandidate[],
  calibrationWinner: TransitionCandidate[],
  calibrationWinnerScore: number | undefined,
  debug: NonNullable<ReturnType<typeof calculateCalibration>["debug"]>,
): void {
  type Direction = "LOWER" | "HIGHER";
  type PathFeatures = Record<string, number>;
  type AnalyzedPath = {
    pathId: string;
    terminalStateId: string | null;
    isGroundTruth: boolean;
    isLegacyWinner: boolean;
    legacyDpScore: number;
    legacyDpRank: number;
    chain: DpCandidate[];
    fullPath: string;
    features: PathFeatures;
    familyScores: Record<string, number>;
  };
  const values = dataset.samples.map((sample) => sample[axis]);
  const samplingRateHz = dataset.samplingRateHz;
  const offset =
    groundTruth.sync.videoTimeSeconds -
    groundTruth.sync.imuSampleIndex / samplingRateHz;
  const projectedGroundTruth: DpCandidate[] = groundTruth.events.map(
    (event, index) => {
      const sampleIndex = Math.round(
        (event.videoTimeSeconds - offset) * samplingRateHz,
      );
      return {
        candidateId: `INJECTED_GT_${index + 1}_${event.type}_${sampleIndex}`,
        type: event.type,
        index: sampleIndex,
        value: values[sampleIndex],
      };
    },
  );
  const realByIdentity = new Map(
    realDpCandidates.map((candidate) => [
      `${candidate.type}:${candidate.index}`,
      candidate,
    ]),
  );
  const canonicalGroundTruth = projectedGroundTruth.map(
    (candidate) =>
      realByIdentity.get(`${candidate.type}:${candidate.index}`) ??
      candidate,
  );
  const addedGroundTruth = canonicalGroundTruth.filter(
    (candidate) =>
      !realByIdentity.has(`${candidate.type}:${candidate.index}`),
  );
  const combinedCandidates = [
    ...realDpCandidates,
    ...addedGroundTruth,
  ];
  const replay = reconstructAllDpFinalPaths(
    combinedCandidates,
    EXPECTED_REPS,
  );
  const terminals = [...replay.finalPaths].sort(
    (left, right) =>
      right.score - left.score ||
      left.stateId.localeCompare(right.stateId),
  );
  const expectedWinner =
    "BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564";
  const identity = (chain: DpCandidate[]) =>
    chain.map((candidate) => `${candidate.type}:${candidate.index}`).join("|");
  if (
    realDpCandidates.length !== 46 ||
    combinedCandidates.length !== 55 ||
    replay.createdStates.length !== 1207 ||
    terminals.length !== 14
  ) {
    fail(
      "EXPERIMENT_REPLAY_MISMATCH",
      `real=${realDpCandidates.length}, combined=${combinedCandidates.length}, states=${replay.createdStates.length}, terminals=${terminals.length}`,
    );
  }
  if (terminals.length !== 14) {
    fail("TERMINAL_PATH_COUNT_MISMATCH", String(terminals.length));
  }
  if (
    identity(terminals[0].chain) !== expectedWinner ||
    identity(calibrationWinner as DpCandidate[]) !== expectedWinner
  ) {
    fail("WINNER_PATH_MISMATCH", identity(terminals[0].chain));
  }
  if (
    terminals[0].score !== 48176 ||
    calibrationWinnerScore !== 48176
  ) {
    fail(
      "WINNER_SCORE_MISMATCH",
      `${terminals[0].score}/${calibrationWinnerScore}`,
    );
  }
  const expectedGroundTruth =
    "BOTTOM:169|TOP:199|BOTTOM:262|TOP:291|BOTTOM:353|TOP:383|BOTTOM:445|TOP:474|BOTTOM:529|TOP:558|BOTTOM:611";
  if (identity(canonicalGroundTruth) !== expectedGroundTruth) {
    fail(
      "GROUND_TRUTH_PATH_MISMATCH",
      identity(canonicalGroundTruth),
    );
  }
  const allChains = [
    ...terminals.map((terminal, index) => ({
      pathId: `TERMINAL_${String(index + 1).padStart(2, "0")}`,
      terminalStateId: terminal.stateId,
      chain: terminal.chain,
      legacyDpScore: terminal.score,
      isGroundTruth: false,
      isLegacyWinner: index === 0,
    })),
    {
      pathId: "GROUND_TRUTH_REFERENCE",
      terminalStateId: null,
      chain: canonicalGroundTruth,
      legacyDpScore: canonicalGroundTruth.reduce(
        (sum, candidate) =>
          sum +
          (candidate.type === "BOTTOM"
            ? -candidate.value
            : candidate.value),
        0,
      ),
      isGroundTruth: true,
      isLegacyWinner: false,
    },
  ];
  if (
    allChains.length !== 15 ||
    allChains.some(
      (path) =>
        path.chain.length !== 11 ||
        !isExpectedAlternation(path.chain) ||
        !isStrictlyIncreasing(
          path.chain.map((candidate) => candidate.index),
        ),
    )
  ) {
    fail("PATH_RANKING_ERROR", "Invalid 15-path population.");
  }
  const activeStart = Math.min(
    ...realDpCandidates.map((candidate) => candidate.index),
  );
  const activeEnd = Math.max(
    ...realDpCandidates.map((candidate) => candidate.index),
  );
  const robustRange = debug.robustRange;
  const prominence = (candidate: DpCandidate) => {
    const official = debug.filterDebugEvents.find(
      (event) =>
        event.filter === "PROMINENCE" &&
        event.type === candidate.type &&
        event.index === candidate.index,
    )?.prominence;
    if (official !== undefined) return official;
    const future = values.slice(
      candidate.index,
      Math.min(
        values.length,
        candidate.index +
          CALIBRATION_PARAMETERS.prominenceWindowSize,
      ),
    );
    return candidate.type === "BOTTOM"
      ? Math.max(...future) - candidate.value
      : candidate.value - Math.min(...future);
  };
  const noise = (index: number) => {
    const segment = values.slice(
      Math.max(0, index - 8),
      Math.min(values.length, index + 9),
    );
    return median(
      segment
        .slice(1)
        .map((value, offsetIndex) =>
          Math.abs(value - segment[offsetIndex]),
        ),
    );
  };
  const cv = (numbers: number[]) =>
    mean(numbers) === 0
      ? 0
      : populationStd(numbers) / mean(numbers);
  const calculateFeatures = (chain: DpCandidate[]): PathFeatures => {
    const normalizedProminences = chain.map(
      (candidate) => prominence(candidate) / robustRange,
    );
    const prominenceNoise = chain.map((candidate) => {
      const localNoise = noise(candidate.index);
      return localNoise === 0
        ? 0
        : prominence(candidate) / localNoise;
    });
    const bToT: number[] = [];
    const tToB: number[] = [];
    const full: number[] = [];
    const amplitudes: number[] = [];
    const drifts: number[] = [];
    const normalizedCycles: number[][] = [];
    for (let rep = 0; rep < 5; rep += 1) {
      const bottomStart = chain[rep * 2];
      const top = chain[rep * 2 + 1];
      const bottomEnd = chain[rep * 2 + 2];
      bToT.push(top.index - bottomStart.index);
      tToB.push(bottomEnd.index - top.index);
      full.push(bottomEnd.index - bottomStart.index);
      const upward = Math.abs(top.value - bottomStart.value);
      const downward = Math.abs(top.value - bottomEnd.value);
      amplitudes.push((upward + downward) / 2);
      drifts.push(Math.abs(bottomEnd.value - bottomStart.value));
      normalizedCycles.push(
        resampleSignal(
          values.slice(bottomStart.index, bottomEnd.index + 1),
          100,
        ),
      );
    }
    const medianProfile = Array.from({ length: 100 }, (_, index) =>
      median(normalizedCycles.map((cycle) => cycle[index])),
    );
    const correlations = normalizedCycles.map((cycle) =>
      pearsonCorrelation(cycle, medianProfile),
    );
    const range = (numbers: number[]) =>
      Math.max(...numbers) - Math.min(...numbers);
    return {
      meanNormalizedProminence: mean(normalizedProminences),
      medianNormalizedProminence: median(normalizedProminences),
      meanProminenceToNoiseRatio: mean(prominenceNoise),
      fullRepDurationCV: cv(full),
      fullRepDurationMAD: medianAbsoluteDeviation(full),
      bottomToTopDurationCV: cv(bToT),
      topToBottomDurationCV: cv(tToB),
      fullRepDurationRange: range(full),
      bottomToTopDurationRange: range(bToT),
      topToBottomDurationRange: range(tToB),
      cycleAmplitudeCV: cv(amplitudes),
      cycleAmplitudeMAD: medianAbsoluteDeviation(amplitudes),
      meanBottomDrift: mean(drifts),
      maxBottomDrift: Math.max(...drifts),
      coverageRatio:
        (chain[chain.length - 1].index - chain[0].index) /
        (activeEnd - activeStart),
      unselectedPrefixSamples: chain[0].index - activeStart,
      unselectedSuffixSamples:
        activeEnd - chain[chain.length - 1].index,
      selectedSpanSamples:
        chain[chain.length - 1].index - chain[0].index,
      meanCycleCorrelation: mean(correlations),
      medianCycleCorrelation: median(correlations),
      minCycleCorrelation: Math.min(...correlations),
      cycleCorrelationStd: populationStd(correlations),
    };
  };
  const featureDefinitions: Array<{
    name: string;
    direction: Direction;
    family: string;
    definition: string;
  }> = [
    { name: "meanNormalizedProminence", direction: "HIGHER", family: "LOCAL", definition: "mean(localProminence / robustSignalRange)" },
    { name: "medianNormalizedProminence", direction: "HIGHER", family: "LOCAL", definition: "median(localProminence / robustSignalRange)" },
    { name: "meanProminenceToNoiseRatio", direction: "HIGHER", family: "LOCAL", definition: "mean(localProminence / localNoiseEstimate)" },
    { name: "fullRepDurationCV", direction: "LOWER", family: "TEMPORAL", definition: "populationStd(B-B duration) / mean(B-B duration)" },
    { name: "fullRepDurationMAD", direction: "LOWER", family: "TEMPORAL", definition: "MAD(B-B duration)" },
    { name: "bottomToTopDurationCV", direction: "LOWER", family: "TEMPORAL", definition: "populationStd(B-T duration) / mean(B-T duration)" },
    { name: "topToBottomDurationCV", direction: "LOWER", family: "TEMPORAL", definition: "populationStd(T-B duration) / mean(T-B duration)" },
    { name: "fullRepDurationRange", direction: "LOWER", family: "TEMPORAL", definition: "max(B-B duration) - min(B-B duration)" },
    { name: "bottomToTopDurationRange", direction: "LOWER", family: "TEMPORAL", definition: "max(B-T duration) - min(B-T duration)" },
    { name: "topToBottomDurationRange", direction: "LOWER", family: "TEMPORAL", definition: "max(T-B duration) - min(T-B duration)" },
    { name: "cycleAmplitudeCV", direction: "LOWER", family: "AMPLITUDE", definition: "populationStd(mean cycle amplitude) / mean(mean cycle amplitude)" },
    { name: "cycleAmplitudeMAD", direction: "LOWER", family: "AMPLITUDE", definition: "MAD(mean cycle amplitude)" },
    { name: "meanBottomDrift", direction: "LOWER", family: "AMPLITUDE", definition: "mean(abs(endBottomValue-startBottomValue))" },
    { name: "maxBottomDrift", direction: "LOWER", family: "AMPLITUDE", definition: "max(abs(endBottomValue-startBottomValue))" },
    { name: "coverageRatio", direction: "HIGHER", family: "COVERAGE", definition: "selectedSpan / real admissible candidate span" },
    { name: "unselectedPrefixSamples", direction: "LOWER", family: "COVERAGE", definition: "firstSelectedIndex-activeRegionStart" },
    { name: "unselectedSuffixSamples", direction: "LOWER", family: "COVERAGE", definition: "activeRegionEnd-lastSelectedIndex" },
    { name: "selectedSpanSamples", direction: "HIGHER", family: "COVERAGE", definition: "lastSelectedIndex-firstSelectedIndex" },
    { name: "meanCycleCorrelation", direction: "HIGHER", family: "SHAPE", definition: "mean Pearson correlation to pointwise median 100-point cycle" },
    { name: "medianCycleCorrelation", direction: "HIGHER", family: "SHAPE", definition: "median Pearson correlation to pointwise median 100-point cycle" },
    { name: "minCycleCorrelation", direction: "HIGHER", family: "SHAPE", definition: "minimum Pearson correlation to pointwise median 100-point cycle" },
    { name: "cycleCorrelationStd", direction: "LOWER", family: "SHAPE", definition: "population std of cycle correlations" },
  ];
  const legacyRanks = rankNumbers(
    allChains.map((path) => path.legacyDpScore),
    true,
  );
  const analyzedPaths: AnalyzedPath[] = allChains.map(
    (path, index) => ({
      ...path,
      legacyDpRank: legacyRanks[index],
      fullPath: formatDpChain(path.chain),
      features: calculateFeatures(path.chain),
      familyScores: {},
    }),
  );
  const normalizedMetricValues = new Map<string, number[]>();
  const normalizationRows = featureDefinitions.map((definition) => {
    const metricValues = analyzedPaths.map(
      (path) => path.features[definition.name],
    );
    const center = median(metricValues);
    const mad = medianAbsoluteDeviation(metricValues);
    const standardDeviation = populationStd(metricValues);
    const method =
      mad !== 0
        ? "ROBUST_Z_MEDIAN_MAD"
        : standardDeviation !== 0
          ? "STANDARD_Z_FALLBACK"
          : "CONSTANT_METRIC";
    const normalized = metricValues.map((value) => {
      if (method === "CONSTANT_METRIC") return 0;
      const z =
        method === "ROBUST_Z_MEDIAN_MAD"
          ? (value - center) / mad
          : (value - mean(metricValues)) / standardDeviation;
      const oriented = definition.direction === "LOWER" ? -z : z;
      return Math.max(-3, Math.min(3, oriented));
    });
    normalizedMetricValues.set(definition.name, normalized);
    return {
      metricName: definition.name,
      medianAcrossPaths: center,
      madAcrossPaths: mad,
      populationStdAcrossPaths: standardDeviation,
      method,
      orientation:
        definition.direction === "LOWER"
          ? "orientedValue=-z"
          : "orientedValue=+z",
      clipping: "[-3,+3]",
    };
  });
  const familyDefinitions: Record<string, string[]> = {
    LOCAL_QUALITY_SCORE: [
      "meanNormalizedProminence",
      "medianNormalizedProminence",
      "meanProminenceToNoiseRatio",
    ],
    TEMPORAL_CONSISTENCY_SCORE: [
      "fullRepDurationCV",
      "fullRepDurationMAD",
      "bottomToTopDurationCV",
      "topToBottomDurationCV",
    ],
    AMPLITUDE_CONSISTENCY_SCORE: [
      "cycleAmplitudeCV",
      "cycleAmplitudeMAD",
      "meanBottomDrift",
    ],
    COVERAGE_SCORE: [
      "coverageRatio",
      "unselectedPrefixSamples",
      "unselectedSuffixSamples",
    ],
    SHAPE_SIMILARITY_SCORE: [
      "meanCycleCorrelation",
      "minCycleCorrelation",
      "cycleCorrelationStd",
    ],
  };
  Object.entries(familyDefinitions).forEach(
    ([familyName, metricNames]) => {
      analyzedPaths.forEach((path, pathIndex) => {
        const available = metricNames
          .map(
            (metricName) =>
              normalizedMetricValues.get(metricName)?.[pathIndex],
          )
          .filter((value): value is number => value !== undefined);
        path.familyScores[familyName] = mean(available);
      });
    },
  );
  const groundTruthIndex = analyzedPaths.findIndex(
    (path) => path.isGroundTruth,
  );
  const winnerIndex = analyzedPaths.findIndex(
    (path) => path.isLegacyWinner,
  );
  const metricRankingDetails: Record<string, unknown>[] = [];
  const metricRankingSummary = featureDefinitions.map((definition) => {
    const metricValues = analyzedPaths.map(
      (path) => path.features[definition.name],
    );
    const ranks = rankNumbers(
      metricValues,
      definition.direction === "HIGHER",
    );
    const ordered = analyzedPaths
      .map((path, index) => ({
        pathId: path.pathId,
        value: metricValues[index],
        rank: ranks[index],
        normalizedRankPercentile:
          ((analyzedPaths.length - ranks[index]) /
            (analyzedPaths.length - 1)) *
          100,
        tiedRank:
          ranks.filter((rank) => rank === ranks[index]).length > 1,
      }))
      .sort((left, right) => left.rank - right.rank);
    ordered.forEach((row) =>
      metricRankingDetails.push({
        metricName: definition.name,
        preferredDirection: definition.direction,
        ...row,
      }),
    );
    const gtRank = ranks[groundTruthIndex];
    return {
      metricName: definition.name,
      preferredDirection: definition.direction,
      groundTruthValue: metricValues[groundTruthIndex],
      groundTruthRank: gtRank,
      winnerValue: metricValues[winnerIndex],
      winnerRank: ranks[winnerIndex],
      bestPathId: ordered[0].pathId,
      bestChainValue: ordered[0].value,
      groundTruthMinusWinner:
        metricValues[groundTruthIndex] - metricValues[winnerIndex],
      groundTruthInTop1: gtRank <= 1,
      groundTruthInTop3: gtRank <= 3,
      groundTruthInTop5: gtRank <= 5,
      topThreePaths: ordered
        .filter((row) => row.rank <= 3)
        .map((row) => row.pathId)
        .join(", "),
    };
  });
  const familyRankingDetails: Record<string, unknown>[] = [];
  const familyRankingSummary = Object.keys(familyDefinitions).map(
    (familyName) => {
      const scores = analyzedPaths.map(
        (path) => path.familyScores[familyName],
      );
      const ranks = rankNumbers(scores, true);
      const ordered = analyzedPaths
        .map((path, index) => ({
          pathId: path.pathId,
          score: scores[index],
          rank: ranks[index],
        }))
        .sort((left, right) => left.rank - right.rank);
      ordered.forEach((row) =>
        familyRankingDetails.push({ familyName, ...row }),
      );
      return {
        familyName,
        groundTruthRank: ranks[groundTruthIndex],
        winnerRank: ranks[winnerIndex],
        bestPathId: ordered[0].pathId,
        groundTruthFamilyScore: scores[groundTruthIndex],
        winnerFamilyScore: scores[winnerIndex],
        topFivePaths: ordered
          .filter((row) => row.rank <= 5)
          .map((row) => row.pathId)
          .join(", "),
        groundTruthTop1: ranks[groundTruthIndex] <= 1,
        groundTruthTop3: ranks[groundTruthIndex] <= 3,
        groundTruthTop5: ranks[groundTruthIndex] <= 5,
      };
    },
  );
  const legacyValues = analyzedPaths.map(
    (path) => path.legacyDpScore,
  );
  const legacyMedian = median(legacyValues);
  const legacyMad = medianAbsoluteDeviation(legacyValues);
  const legacyStd = populationStd(legacyValues);
  const normalizedLegacy = legacyValues.map((value) => {
    const z =
      legacyMad !== 0
        ? (value - legacyMedian) / legacyMad
        : legacyStd !== 0
          ? (value - mean(legacyValues)) / legacyStd
          : 0;
    return Math.max(-3, Math.min(3, z));
  });
  const combos: Record<string, Record<string, number>> = {
    COMBO_A_TEMPORAL_ONLY: { TEMPORAL_CONSISTENCY_SCORE: 1 },
    COMBO_B_SHAPE_ONLY: { SHAPE_SIMILARITY_SCORE: 1 },
    COMBO_C_TEMPORAL_SHAPE_EQUAL: {
      TEMPORAL_CONSISTENCY_SCORE: 0.5,
      SHAPE_SIMILARITY_SCORE: 0.5,
    },
    COMBO_D_TEMPORAL_SHAPE_LOCAL: {
      TEMPORAL_CONSISTENCY_SCORE: 0.45,
      SHAPE_SIMILARITY_SCORE: 0.35,
      LOCAL_QUALITY_SCORE: 0.2,
    },
    COMBO_E_TEMPORAL_SHAPE_COVERAGE: {
      TEMPORAL_CONSISTENCY_SCORE: 0.45,
      SHAPE_SIMILARITY_SCORE: 0.35,
      COVERAGE_SCORE: 0.2,
    },
    COMBO_F_BALANCED_WITHOUT_AMPLITUDE: {
      TEMPORAL_CONSISTENCY_SCORE: 0.35,
      SHAPE_SIMILARITY_SCORE: 0.3,
      LOCAL_QUALITY_SCORE: 0.2,
      COVERAGE_SCORE: 0.15,
    },
    COMBO_G_BALANCED_ALL_FAMILIES: {
      TEMPORAL_CONSISTENCY_SCORE: 0.3,
      SHAPE_SIMILARITY_SCORE: 0.25,
      LOCAL_QUALITY_SCORE: 0.2,
      COVERAGE_SCORE: 0.15,
      AMPLITUDE_CONSISTENCY_SCORE: 0.1,
    },
    COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES: {
      LEGACY_LOCAL_SCORE_NORMALIZED: 0.2,
      TEMPORAL_CONSISTENCY_SCORE: 0.35,
      SHAPE_SIMILARITY_SCORE: 0.3,
      COVERAGE_SCORE: 0.15,
    },
  };
  const scoreWeights = (
    weights: Record<string, number>,
  ): number[] =>
    analyzedPaths.map((path, pathIndex) =>
      Object.entries(weights).reduce(
        (score, [familyName, weight]) =>
          score +
          weight *
            (familyName === "LEGACY_LOCAL_SCORE_NORMALIZED"
              ? normalizedLegacy[pathIndex]
              : path.familyScores[familyName]),
        0,
      ),
    );
  const combinationRankings: Record<string, unknown>[] = [];
  const combinationSummary = Object.entries(combos).map(
    ([comboName, weights]) => {
      const scores = scoreWeights(weights);
      const ranks = rankNumbers(scores, true);
      const ordered = analyzedPaths
        .map((path, index) => ({
          pathId: path.pathId,
          score: scores[index],
          rank: ranks[index],
          fullPath: path.fullPath,
        }))
        .sort((left, right) => left.rank - right.rank);
      ordered.forEach((row) =>
        combinationRankings.push({ comboName, ...row }),
      );
      const gtRank = ranks[groundTruthIndex];
      const ahead = ordered.filter((row) => row.rank < gtRank);
      return {
        comboName,
        groundTruthRank: gtRank,
        legacyWinnerRank: ranks[winnerIndex],
        winningPathId: ordered[0].pathId,
        groundTruthScore: scores[groundTruthIndex],
        winningScore: ordered[0].score,
        groundTruthGapToBest:
          scores[groundTruthIndex] - ordered[0].score,
        pathsAheadOfGroundTruth: ahead.length,
        groundTruthTop1: gtRank <= 1,
        groundTruthTop3: gtRank <= 3,
        groundTruthTop5: gtRank <= 5,
        pathsAheadDetails: ahead
          .map((row) => `${row.pathId}: ${row.fullPath}`)
          .join(" | "),
      };
    },
  );
  const sensitivityCombos = [
    "COMBO_C_TEMPORAL_SHAPE_EQUAL",
    "COMBO_D_TEMPORAL_SHAPE_LOCAL",
    "COMBO_E_TEMPORAL_SHAPE_COVERAGE",
    "COMBO_F_BALANCED_WITHOUT_AMPLITUDE",
  ];
  const sensitivityRows = sensitivityCombos.map((comboName) => {
    const base = combos[comboName];
    const variants: Record<string, number>[] = [];
    Object.keys(base).forEach((changedFamily) => {
      for (const delta of [-0.1, 0.1]) {
        const changed = {
          ...base,
          [changedFamily]: base[changedFamily] + delta,
        };
        if (changed[changedFamily] < 0) continue;
        const total = Object.values(changed).reduce(
          (sum, value) => sum + value,
          0,
        );
        variants.push(
          Object.fromEntries(
            Object.entries(changed).map(([name, value]) => [
              name,
              value / total,
            ]),
          ),
        );
      }
    });
    const gtRanks = variants.map((variant) => {
      const ranks = rankNumbers(scoreWeights(variant), true);
      return ranks[groundTruthIndex];
    });
    return {
      comboName,
      testedVariantCount: variants.length,
      groundTruthBestRank: Math.min(...gtRanks),
      groundTruthWorstRank: Math.max(...gtRanks),
      groundTruthMedianRank: median(gtRanks),
      top1Count: gtRanks.filter((rank) => rank <= 1).length,
      top3Count: gtRanks.filter((rank) => rank <= 3).length,
      outsideTop5Count: gtRanks.filter((rank) => rank > 5).length,
    };
  });
  const metricNames = featureDefinitions.map(
    (definition) => definition.name,
  );
  const correlationMatrix = metricNames.map((leftName) =>
    metricNames.map((rightName) =>
      spearmanCorrelation(
        analyzedPaths.map((path) => path.features[leftName]),
        analyzedPaths.map((path) => path.features[rightName]),
      ),
    ),
  );
  const redundantPairs: Record<string, unknown>[] = [];
  for (let left = 0; left < metricNames.length; left += 1) {
    for (
      let right = left + 1;
      right < metricNames.length;
      right += 1
    ) {
      const correlation = correlationMatrix[left][right];
      if (Math.abs(correlation) >= 0.85) {
        redundantPairs.push({
          metricA: metricNames[left],
          metricB: metricNames[right],
          spearmanCorrelation: correlation,
          absoluteCorrelation: Math.abs(correlation),
        });
      }
    }
  }
  const pathTable = analyzedPaths.map((path) => ({
    pathId: path.pathId,
    terminalStateId: path.terminalStateId,
    isGroundTruth: path.isGroundTruth,
    isLegacyWinner: path.isLegacyWinner,
    legacyDpScore: path.legacyDpScore,
    legacyDpRank: path.legacyDpRank,
    fullPath: path.fullPath,
    ...path.familyScores,
  }));
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-v2-path-ranking-analysis",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const graphPaths = {
    metricRanks: path.join(outputDirectory, "metric_ground_truth_ranks.png"),
    familyRanking: path.join(outputDirectory, "family_score_ranking.png"),
    comboRanks: path.join(outputDirectory, "combination_ground_truth_ranks.png"),
    scatter: path.join(outputDirectory, "top_paths_temporal_vs_shape.png"),
    correlation: path.join(outputDirectory, "feature_correlation_matrix.png"),
    sensitivity: path.join(outputDirectory, "combination_sensitivity.png"),
  };
  renderComparisonLines(
    "GROUND TRUTH RANK BY METRIC - LOWER RANK IS BETTER",
    [{ label: "GROUND TRUTH RANK", values: metricRankingSummary.map((row) => row.groundTruthRank), color: [30, 100, 210] }],
    graphPaths.metricRanks,
  );
  renderComparisonLines(
    "FAMILY SCORES ACROSS 15 PATHS",
    Object.keys(familyDefinitions).map((familyName, index) => ({
      label: familyName,
      values: analyzedPaths.map((path) => path.familyScores[familyName]),
      color: ([[210, 35, 35], [30, 100, 210], [20, 150, 70], [150, 45, 180], [225, 120, 10]] as RGB[])[index],
    })),
    graphPaths.familyRanking,
  );
  renderComparisonLines(
    "GROUND TRUTH RANK BY EXPERIMENTAL COMBINATION",
    [{ label: "GROUND TRUTH RANK", values: combinationSummary.map((row) => row.groundTruthRank), color: [30, 100, 210] }],
    graphPaths.comboRanks,
  );
  renderScatterPlot(
    analyzedPaths.map((path) => ({
      x: path.familyScores.TEMPORAL_CONSISTENCY_SCORE,
      y: path.familyScores.SHAPE_SIMILARITY_SCORE,
      label: path.pathId,
      color: path.isGroundTruth
        ? [30, 100, 210]
        : path.isLegacyWinner
          ? [210, 35, 35]
          : [90, 90, 90],
    })),
    graphPaths.scatter,
  );
  renderCorrelationMatrix(
    metricNames,
    correlationMatrix,
    graphPaths.correlation,
  );
  renderComparisonLines(
    "GROUND TRUTH SENSITIVITY RANK INTERVALS",
    [
      { label: "BEST RANK", values: sensitivityRows.map((row) => row.groundTruthBestRank), color: [20, 150, 70] },
      { label: "MEDIAN RANK", values: sensitivityRows.map((row) => row.groundTruthMedianRank), color: [30, 100, 210] },
      { label: "WORST RANK", values: sensitivityRows.map((row) => row.groundTruthWorstRank), color: [210, 35, 35] },
    ],
    graphPaths.sensitivity,
  );
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_v2_path_ranking_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP V2 path ranking analysis",
      "",
      "## Contexte et population",
      "",
      "- 46 candidats DP réels, 55 après injection sans doublon.",
      "- 1207 états créés, 14 états terminaux.",
      "- 14 chemins terminaux plus GROUND_TRUTH_REFERENCE externe.",
      "",
      "## Définitions et normalisation",
      "",
      markdownTable(featureDefinitions),
      "",
      "- Normalisation: robustZ=(value-medianAcrossPaths)/MADAcrossPaths.",
      "- Si MAD=0: z-score population standard; si écart-type=0: CONSTANT_METRIC exclue.",
      "- Orientation: signe inversé pour les métriques LOWER; signe conservé pour HIGHER.",
      "- Valeurs orientées limitées à [-3,+3].",
      "- Scores de famille: moyenne non pondérée des métriques disponibles.",
      "",
      markdownTable(normalizationRows),
      "",
      "## Tableau A — Toutes les chaînes",
      "",
      markdownTable(pathTable),
      "",
      "## Classement par métrique — résumé",
      "",
      markdownTable(metricRankingSummary),
      "",
      "## Classement complet par métrique",
      "",
      markdownTable(metricRankingDetails),
      "",
      "## Classement par famille — résumé",
      "",
      markdownTable(familyRankingSummary),
      "",
      "## Scores complets par famille",
      "",
      markdownTable(familyRankingDetails),
      "",
      "## Combinaisons — résumé",
      "",
      markdownTable(combinationSummary),
      "",
      "## Classements complets des combinaisons",
      "",
      markdownTable(combinationRankings),
      "",
      "## Sensibilité limitée",
      "",
      markdownTable(sensitivityRows),
      "",
      "## Redondance des métriques — Spearman |r| >= 0.85",
      "",
      markdownTable(redundantPairs),
      "",
      "## Chaînes devant la Ground Truth",
      "",
      markdownTable(
        combinationSummary.map((row) => ({
          comboName: row.comboName,
          pathsAheadOfGroundTruth: row.pathsAheadOfGroundTruth,
          details: row.pathsAheadDetails,
        })),
      ),
      "",
      "## Graphiques",
      "",
      ...Object.values(graphPaths).map((graphPath) => `- ${graphPath}`),
      "",
      "## Limites",
      "",
      "- Une seule vidéo annotée.",
      "- Ground Truth utilisée pour l'analyse.",
      "- Poids non généralisables.",
      "- Aucun score de production validé.",
      "- Aucune conclusion biomécanique universelle.",
      "",
      "## Décision humaine pour DP V2",
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("\n=== ALL PATHS ===\n");
  console.table(pathTable);
  console.log("\n=== GROUND TRUTH RANK BY METRIC ===\n");
  console.table(metricRankingSummary);
  console.log("\n=== GROUND TRUTH RANK BY FAMILY ===\n");
  console.table(familyRankingSummary);
  console.log("\n=== EXPERIMENTAL COMBINATIONS ===\n");
  console.table(combinationSummary);
  console.log("\n=== LIMITED SENSITIVITY ===\n");
  console.table(sensitivityRows);
  console.log("\n=== HIGH SPEARMAN CORRELATIONS ===\n");
  console.table(redundantPairs);
  console.log("\n=== ARTIFACTS ===\n");
  Object.values(graphPaths).forEach((graphPath) =>
    console.log(graphPath),
  );
  console.log(reportPath);
}

type TopKPathState = {
  stateId: string;
  stateKey: string;
  score: number;
  candidateIndex: number;
  lastBottomIndex: number | null;
  chain: DpCandidate[];
  pathSignature: string;
};

type TopKEviction = {
  step: number;
  stateKey: string;
  evictedStateId: string;
  evictedPathSignature: string;
  evictedScore: number;
  evictedByStateId: string;
  evictedByScore: number;
};

type TopKSearchResult = {
  k: number;
  terminalStates: TopKPathState[];
  uniqueTerminalStates: TopKPathState[];
  evictions: TopKEviction[];
  allCreatedBySignature: Map<string, TopKPathState>;
  retainedByLayer: Array<Map<string, TopKPathState[]>>;
  totalStatesGenerated: number;
  totalTransitionStatesAttempted: number;
  totalStatesRetained: number;
  totalStatesEvicted: number;
  totalBuckets: number;
  meanBucketSize: number;
  medianBucketSize: number;
  maxBucketSize: number;
  maximumMemoryEstimate: number;
  executionTimeMilliseconds: number;
};

function topKPathSignature(chain: DpCandidate[]): string {
  return chain
    .map((candidate) => `${candidate.type}:${candidate.index}`)
    .join("|");
}

function buildInjectedCandidatePool(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realCandidates: DpCandidate[],
): {
  pool: DpCandidate[];
  groundTruthChain: DpCandidate[];
  addedCount: number;
} {
  const offset =
    groundTruth.sync.videoTimeSeconds -
    groundTruth.sync.imuSampleIndex / dataset.samplingRateHz;
  const realByIdentity = new Map(
    realCandidates.map((candidate) => [
      `${candidate.type}:${candidate.index}`,
      candidate,
    ]),
  );
  const projected = groundTruth.events.map(
    (event, index): DpCandidate => {
      const sampleIndex = Math.round(
        (event.videoTimeSeconds - offset) *
          dataset.samplingRateHz,
      );
      return {
        candidateId: `TOP_K_GT_${index + 1}_${event.type}_${sampleIndex}`,
        type: event.type,
        index: sampleIndex,
        value: dataset.samples[sampleIndex][axis],
      };
    },
  );
  const groundTruthChain = projected.map(
    (candidate) =>
      realByIdentity.get(`${candidate.type}:${candidate.index}`) ??
      candidate,
  );
  const additions = groundTruthChain.filter(
    (candidate) =>
      !realByIdentity.has(`${candidate.type}:${candidate.index}`),
  );
  const pool = [...realCandidates, ...additions].sort(
    (left, right) =>
      left.index - right.index ||
      left.type.localeCompare(right.type) ||
      left.candidateId.localeCompare(right.candidateId),
  );
  const identities = new Set(
    pool.map((candidate) => `${candidate.type}:${candidate.index}`),
  );
  if (
    realCandidates.length !== 46 ||
    pool.length !== 55 ||
    additions.length !== 9 ||
    identities.size !== pool.length
  ) {
    fail(
      "INJECTED_POPULATION_MISMATCH",
      `real=${realCandidates.length}, pool=${pool.length}, added=${additions.length}, identities=${identities.size}`,
    );
  }
  return { pool, groundTruthChain, addedCount: additions.length };
}

function insertStateIntoTopKBucket(
  bucket: TopKPathState[],
  newState: TopKPathState,
  k: number,
  step: number,
  evictions: TopKEviction[],
): void {
  if (
    bucket.some(
      (state) => state.pathSignature === newState.pathSignature,
    )
  ) {
    fail(
      "DUPLICATE_PATH_STATE_ERROR",
      `${newState.stateKey}:${newState.pathSignature}`,
    );
  }
  bucket.push(newState);
  bucket.sort(
    (left, right) =>
      right.score - left.score ||
      left.pathSignature.localeCompare(right.pathSignature) ||
      left.stateId.localeCompare(right.stateId),
  );
  if (bucket.length > k) {
    const evicted = bucket.pop();
    if (!evicted) {
      fail(
        "TOP_K_BUCKET_INTEGRITY_ERROR",
        `Unable to evict from ${newState.stateKey}.`,
      );
    }
    const responsible =
      evicted.stateId === newState.stateId
        ? bucket[0]
        : newState;
    evictions.push({
      step,
      stateKey: newState.stateKey,
      evictedStateId: evicted.stateId,
      evictedPathSignature: evicted.pathSignature,
      evictedScore: evicted.score,
      evictedByStateId: responsible.stateId,
      evictedByScore: responsible.score,
    });
  }
  if (
    bucket.length > k ||
    bucket.some(
      (state, index) =>
        index > 0 &&
        (state.score > bucket[index - 1].score ||
          (state.score === bucket[index - 1].score &&
            state.pathSignature <
              bucket[index - 1].pathSignature)),
    )
  ) {
    fail(
      "TOP_K_BUCKET_INTEGRITY_ERROR",
      `Invalid ordering for ${newState.stateKey}.`,
    );
  }
}

function reconstructPathFromState(
  state: TopKPathState,
): DpCandidate[] {
  const reconstructed = [...state.chain];
  if (
    topKPathSignature(reconstructed) !== state.pathSignature ||
    reconstructed.length === 0
  ) {
    fail(
      "TERMINAL_RECONSTRUCTION_ERROR",
      state.stateId,
    );
  }
  return reconstructed;
}

function searchTopKPathsDiagnostic(
  candidates: DpCandidate[],
  expectedReps: number,
  k: number,
): TopKSearchResult {
  const startTime = performance.now();
  const targetLength = expectedReps * 2 + 1;
  const initialState: TopKPathState = {
    stateId: `K${k}:INITIAL`,
    stateKey: "0:-1:-1",
    score: 0,
    candidateIndex: -1,
    lastBottomIndex: null,
    chain: [],
    pathSignature: "",
  };
  let currentStates = new Map<string, TopKPathState[]>([
    [initialState.stateKey, [initialState]],
  ]);
  const retainedByLayer = [
    new Map<string, TopKPathState[]>(currentStates),
  ];
  const evictions: TopKEviction[] = [];
  const allCreatedBySignature = new Map<string, TopKPathState>();
  let totalTransitionStatesAttempted = 0;
  let maximumMemoryEstimate = 1;

  for (let step = 0; step < targetLength; step += 1) {
    const requiredType: EventType =
      step % 2 === 0 ? "BOTTOM" : "TOP";
    const nextStates = new Map<string, TopKPathState[]>();
    const orderedStates = [...currentStates.values()]
      .flat()
      .sort((left, right) =>
        left.stateId.localeCompare(right.stateId),
      );
    for (const state of orderedStates) {
      const previous =
        state.candidateIndex >= 0
          ? candidates[state.candidateIndex]
          : null;
      for (
        let candidateIndex = 0;
        candidateIndex < candidates.length;
        candidateIndex += 1
      ) {
        const candidate = candidates[candidateIndex];
        if (candidate.type !== requiredType) continue;
        if (previous && candidate.index <= previous.index) continue;
        if (previous) {
          const phaseDuration = candidate.index - previous.index;
          if (
            requiredType === "TOP" &&
            phaseDuration < 8
          ) {
            continue;
          }
          if (
            requiredType === "BOTTOM" &&
            phaseDuration < 8
          ) {
            continue;
          }
          if (
            requiredType === "BOTTOM" &&
            state.lastBottomIndex !== null &&
            candidate.index - state.lastBottomIndex < 45
          ) {
            continue;
          }
        } else if (requiredType !== "BOTTOM") {
          continue;
        }
        totalTransitionStatesAttempted += 1;
        const nextLastBottom =
          requiredType === "BOTTOM"
            ? candidate.index
            : state.lastBottomIndex;
        const nextChain = [...state.chain, candidate];
        const signature = topKPathSignature(nextChain);
        const stateKey =
          `${step + 1}:${candidateIndex}:` +
          `${nextLastBottom ?? -1}`;
        const nextState: TopKPathState = {
          stateId:
            `K${k}:S${step + 1}:C${candidateIndex}:B` +
            `${nextLastBottom ?? -1}:P${signature}`,
          stateKey,
          score:
            state.score +
            (candidate.type === "BOTTOM"
              ? -candidate.value
              : candidate.value),
          candidateIndex,
          lastBottomIndex: nextLastBottom,
          chain: nextChain,
          pathSignature: signature,
        };
        if (!allCreatedBySignature.has(signature)) {
          allCreatedBySignature.set(signature, nextState);
        }
        const bucket = nextStates.get(stateKey) ?? [];
        insertStateIntoTopKBucket(
          bucket,
          nextState,
          k,
          step + 1,
          evictions,
        );
        nextStates.set(stateKey, bucket);
      }
    }
    currentStates = nextStates;
    retainedByLayer.push(
      new Map(
        [...currentStates.entries()].map(([key, bucket]) => [
          key,
          [...bucket],
        ]),
      ),
    );
    maximumMemoryEstimate = Math.max(
      maximumMemoryEstimate,
      [...currentStates.values()].reduce(
        (sum, bucket) => sum + bucket.length,
        0,
      ),
    );
    if (currentStates.size === 0) break;
  }
  const terminalStates = [...currentStates.values()]
    .flat()
    .map((state) => ({
      ...state,
      chain: reconstructPathFromState(state),
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.pathSignature.localeCompare(right.pathSignature),
    );
  const uniqueByPath = new Map<string, TopKPathState>();
  terminalStates.forEach((state) => {
    const existing = uniqueByPath.get(state.pathSignature);
    if (!existing || state.score > existing.score) {
      uniqueByPath.set(state.pathSignature, state);
    }
  });
  const uniqueTerminalStates = [...uniqueByPath.values()].sort(
    (left, right) =>
      right.score - left.score ||
      left.pathSignature.localeCompare(right.pathSignature),
  );
  const bucketSizes = retainedByLayer
    .slice(1)
    .flatMap((layer) =>
      [...layer.values()].map((bucket) => bucket.length),
    );
  const totalBuckets =
    1 +
    retainedByLayer
      .slice(1)
      .reduce((sum, layer) => sum + layer.size, 0);
  const totalStatesRetained =
    1 + bucketSizes.reduce((sum, size) => sum + size, 0);
  return {
    k,
    terminalStates,
    uniqueTerminalStates,
    evictions,
    allCreatedBySignature,
    retainedByLayer,
    totalStatesGenerated: totalBuckets,
    totalTransitionStatesAttempted,
    totalStatesRetained,
    totalStatesEvicted: evictions.length,
    totalBuckets,
    meanBucketSize:
      bucketSizes.length > 0 ? mean(bucketSizes) : 0,
    medianBucketSize:
      bucketSizes.length > 0 ? median(bucketSizes) : 0,
    maxBucketSize:
      bucketSizes.length > 0 ? Math.max(...bucketSizes) : 0,
    maximumMemoryEstimate,
    executionTimeMilliseconds: performance.now() - startTime,
  };
}

function traceGroundTruthPrefixes(
  result: TopKSearchResult,
  groundTruthChain: DpCandidate[],
) {
  return groundTruthChain.map((_, index) => {
    const prefix = groundTruthChain.slice(0, index + 1);
    const signature = topKPathSignature(prefix);
    const created = result.allCreatedBySignature.get(signature);
    const eviction = created
      ? result.evictions.find(
          (entry) => entry.evictedStateId === created.stateId,
        )
      : null;
    const layer = result.retainedByLayer[index + 1];
    const retainedBucket = created
      ? layer?.get(created.stateKey)
      : undefined;
    const retainedIndex =
      created && retainedBucket
        ? retainedBucket.findIndex(
            (state) => state.pathSignature === signature,
          )
        : -1;
    const terminal = result.uniqueTerminalStates.find(
      (state) => state.pathSignature === signature,
    );
    const status = !created
      ? "PREFIX_NOT_CREATED"
      : terminal
        ? "PREFIX_SURVIVED_TO_TERMINAL"
        : eviction
          ? "PREFIX_CREATED_THEN_EVICTED"
          : retainedIndex >= 0
            ? "PREFIX_CREATED_AND_RETAINED"
            : "PREFIX_TRACE_UNAVAILABLE";
    return {
      K: result.k,
      prefixLength: index + 1,
      path: signature
        .replaceAll("BOTTOM:", "B")
        .replaceAll("TOP:", "T")
        .replaceAll("|", "-"),
      stateCreated: created ? "OUI" : "NON",
      stateId: created?.stateId ?? null,
      stateKey: created?.stateKey ?? null,
      legacyScore: created?.score ?? null,
      rankInsideBucket:
        retainedIndex >= 0 ? retainedIndex + 1 : null,
      bucketSize: retainedBucket?.length ?? null,
      survivedBucketPruning:
        retainedIndex >= 0 || terminal ? "OUI" : "NON",
      evictedAtStep: eviction?.step ?? null,
      evictedByStateId: eviction?.evictedByStateId ?? null,
      evictedByScore: eviction?.evictedByScore ?? null,
      terminalReached: terminal ? "OUI" : "NON",
      status,
    };
  });
}

function summarizeTopKExperiment(
  result: TopKSearchResult,
  groundTruthChain: DpCandidate[],
  trace: ReturnType<typeof traceGroundTruthPrefixes>,
) {
  const groundTruthSignature = topKPathSignature(groundTruthChain);
  const groundTruthTerminalIndex =
    result.uniqueTerminalStates.findIndex(
      (state) => state.pathSignature === groundTruthSignature,
    );
  const groundTruthTerminal =
    groundTruthTerminalIndex >= 0
      ? result.uniqueTerminalStates[groundTruthTerminalIndex]
      : null;
  const lastReached = [...trace]
    .reverse()
    .find((row) => row.stateCreated === "OUI");
  const firstLost = trace.find(
    (row) =>
      row.status === "PREFIX_NOT_CREATED" ||
      row.status === "PREFIX_CREATED_THEN_EVICTED",
  );
  const winner = result.uniqueTerminalStates[0];
  return {
    K: result.k,
    totalStatesGenerated: result.totalStatesGenerated,
    totalTransitionStatesAttempted:
      result.totalTransitionStatesAttempted,
    totalStatesRetained: result.totalStatesRetained,
    totalStatesEvicted: result.totalStatesEvicted,
    totalBuckets: result.totalBuckets,
    meanBucketSize: result.meanBucketSize,
    medianBucketSize: result.medianBucketSize,
    maxBucketSize: result.maxBucketSize,
    terminalStateCount: result.terminalStates.length,
    uniqueTerminalPathCount: result.uniqueTerminalStates.length,
    legacyWinningPath: winner?.pathSignature ?? null,
    legacyWinningScore: winner?.score ?? null,
    groundTruthFullPathGenerated:
      result.allCreatedBySignature.has(groundTruthSignature),
    groundTruthTerminalReached: groundTruthTerminal !== null,
    groundTruthTerminalStateId:
      groundTruthTerminal?.stateId ?? null,
    groundTruthLegacyScore:
      groundTruthTerminal?.score ?? null,
    groundTruthLegacyRankAmongTerminals:
      groundTruthTerminalIndex >= 0
        ? groundTruthTerminalIndex + 1
        : null,
    lastGroundTruthPrefixReached:
      lastReached?.prefixLength ?? 0,
    firstGroundTruthPrefixLost:
      firstLost?.prefixLength ?? null,
    maximumMemoryEstimate: result.maximumMemoryEstimate,
    executionTimeMilliseconds:
      result.executionTimeMilliseconds,
  };
}

function runDpV2TopKSearchDiagnostic(
  dataset: CalibrationDataset,
  groundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  realDpCandidates: DpCandidate[],
): void {
  const { pool, groundTruthChain } =
    buildInjectedCandidatePool(
      dataset,
      groundTruth,
      axis,
      realDpCandidates,
    );
  const kValues = [1, 3, 5, 10, 20, 30];
  const experiments = kValues.map((k) => {
    const result = searchTopKPathsDiagnostic(
      pool,
      EXPECTED_REPS,
      k,
    );
    const trace = traceGroundTruthPrefixes(
      result,
      groundTruthChain,
    );
    const summary = summarizeTopKExperiment(
      result,
      groundTruthChain,
      trace,
    );
    return { result, trace, summary };
  });
  const expectedWinner =
    "BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564";
  const k1 = experiments[0];
  if (
    k1.summary.totalStatesGenerated !== 1207 ||
    k1.summary.uniqueTerminalPathCount !== 14 ||
    k1.summary.legacyWinningPath !== expectedWinner ||
    k1.summary.legacyWinningScore !== 48176
  ) {
    fail(
      "TOP_K_K1_PARITY_MISMATCH",
      JSON.stringify(k1.summary),
    );
  }
  const summaries = experiments.map(
    (experiment) => experiment.summary,
  );
  const traces = experiments.flatMap(
    (experiment) => experiment.trace,
  );
  const terminalRows = experiments.flatMap(
    ({ result }) =>
      result.uniqueTerminalStates
        .slice(0, 20)
        .map((terminal, index) => ({
          K: result.k,
          legacyRank: index + 1,
          stateId: terminal.stateId,
          legacyScore: terminal.score,
          isGroundTruth:
            terminal.pathSignature ===
            topKPathSignature(groundTruthChain),
          path: terminal.pathSignature,
        })),
  );
  const groundTruthPrefixSignatures = new Set(
    groundTruthChain.map((_, index) =>
      topKPathSignature(groundTruthChain.slice(0, index + 1)),
    ),
  );
  const importantEvictions = experiments.flatMap(
    ({ result }) =>
      result.evictions
        .filter((eviction) =>
          groundTruthPrefixSignatures.has(
            eviction.evictedPathSignature,
          ),
        )
        .map((eviction) => ({ K: result.k, ...eviction })),
  );
  const reached = summaries.filter(
    (summary) => summary.groundTruthTerminalReached,
  );
  const smallestKWhereGroundTruthReachesTerminal =
    reached.length > 0 ? Math.min(...reached.map((row) => row.K)) : null;
  const groundTruthReachedForAllLargerTestedK =
    smallestKWhereGroundTruthReachesTerminal === null
      ? false
      : summaries
          .filter(
            (row) =>
              row.K >= smallestKWhereGroundTruthReachesTerminal,
          )
          .every((row) => row.groundTruthTerminalReached);
  const stability = {
    smallestKWhereGroundTruthReachesTerminal,
    groundTruthReachedForAllLargerTestedK,
    terminalCountGrowthRatio:
      summaries[summaries.length - 1].uniqueTerminalPathCount /
      summaries[0].uniqueTerminalPathCount,
    stateCountGrowthRatio:
      summaries[summaries.length - 1].totalStatesRetained /
      summaries[0].totalStatesRetained,
  };
  const outputDirectory = path.resolve(
    __dirname,
    "output",
    "dp-v2-top-k-diagnostic",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });
  const graphPaths = {
    survival: path.join(outputDirectory, "ground_truth_survival_by_k.png"),
    terminals: path.join(outputDirectory, "terminal_count_by_k.png"),
    states: path.join(outputDirectory, "state_count_by_k.png"),
    execution: path.join(outputDirectory, "execution_time_by_k.png"),
    rank: path.join(outputDirectory, "ground_truth_legacy_rank_by_k.png"),
  };
  renderComparisonLines(
    "MAX GT PREFIX - K ORDER 1 3 5 10 20 30",
    [{ label: "PREFIX LENGTH", values: summaries.map((row) => row.lastGroundTruthPrefixReached), color: [30, 100, 210] }],
    graphPaths.survival,
  );
  renderComparisonLines(
    "UNIQUE TERMINALS - K ORDER 1 3 5 10 20 30",
    [{ label: "TERMINALS", values: summaries.map((row) => row.uniqueTerminalPathCount), color: [30, 100, 210] }],
    graphPaths.terminals,
  );
  renderComparisonLines(
    "STATE COUNTS - K ORDER 1 3 5 10 20 30",
    [
      { label: "GENERATED KEYS", values: summaries.map((row) => row.totalStatesGenerated), color: [30, 100, 210] },
      { label: "RETAINED", values: summaries.map((row) => row.totalStatesRetained), color: [20, 150, 70] },
      { label: "EVICTED", values: summaries.map((row) => row.totalStatesEvicted), color: [210, 35, 35] },
    ],
    graphPaths.states,
  );
  renderComparisonLines(
    "EXECUTION MS - K ORDER 1 3 5 10 20 30",
    [{ label: "MS", values: summaries.map((row) => row.executionTimeMilliseconds), color: [150, 45, 180] }],
    graphPaths.execution,
  );
  renderComparisonLines(
    "GT LEGACY RANK - K 1 3 5 10 20 30 - 0 NOT TERMINAL",
    [{
      label: "LEGACY RANK",
      values: summaries.map(
        (row) => row.groundTruthLegacyRankAmongTerminals ?? 0,
      ),
      color: [225, 120, 10],
    }],
    graphPaths.rank,
  );
  const reportPath = path.join(
    outputDirectory,
    "rowing_5reps_007_dp_v2_top_k_diagnostic_report.md",
  );
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — DP V2 Top-K search diagnostic",
      "",
      "## Contexte et rappel DP V1",
      "",
      "- Population réelle: 46; population injectée sans doublon: 55.",
      "- Alternance, contraintes 8/8/45, score legacy et terminalité inchangés.",
      "- K=1 attendu: 1207 clés matérialisées, 14 terminaux uniques, winner 48176.",
      "",
      "## Définition Top-K et égalité",
      "",
      "- Bucket: `step:candidateIndex:lastBottomIndex`.",
      "- Jusqu'à K chemins distincts par bucket.",
      "- Ordre déterministe: score legacy décroissant, puis signature complète lexicographique, puis stateId.",
      "- `totalStatesGenerated` reprend la définition V1: état initial + clés DP matérialisées sur toutes les couches.",
      "- `totalTransitionStatesAttempted` compte séparément toutes les transitions admissibles instanciées.",
      "",
      "## Parité K=1",
      "",
      "- TOP_K_K1_PARITY: MATCH.",
      markdownTable([k1.summary]),
      "",
      "## Tableau comparatif de tous les K",
      "",
      markdownTable(summaries),
      "",
      "## Trace Ground Truth complète",
      "",
      markdownTable(traces),
      "",
      "## États évincés liés aux préfixes Ground Truth",
      "",
      markdownTable(importantEvictions),
      "",
      "## Top 20 terminaux par K",
      "",
      markdownTable(terminalRows),
      "",
      "## Stabilité",
      "",
      markdownTable([stability]),
      "",
      "## Graphiques",
      "",
      ...Object.values(graphPaths).map((graphPath) => `- ${graphPath}`),
      "",
      "## Limites",
      "",
      "- Candidats Ground Truth injectés.",
      "- Une seule vidéo.",
      "- Score legacy inchangé.",
      "- Aucun reranker.",
      "- Aucun choix de K de production.",
      "",
      "## Décision humaine pour la suite de DP V2",
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("\n=== TOP-K K=1 PARITY ===\n");
  console.table([k1.summary]);
  console.log("\n=== TOP-K SUMMARY ===\n");
  console.table(summaries);
  console.log("\n=== GROUND TRUTH PREFIX TRACE ===\n");
  console.table(traces);
  console.log("\n=== TOP-K STABILITY ===\n");
  console.table([stability]);
  console.log("\n=== TOP TERMINALS ===\n");
  console.table(terminalRows);
  console.log("\n=== ARTIFACTS ===\n");
  Object.values(graphPaths).forEach((graphPath) =>
    console.log(graphPath),
  );
  console.log(reportPath);
}

function runTransitionValidation(
  dataset: CalibrationDataset,
  pointGroundTruth: GroundTruthFile,
  axis: keyof CalibrationDataset["samples"][number],
  globalChain: TransitionCandidate[],
  rawCandidates: TransitionCandidate[],
  prominenceCandidates: TransitionCandidate[],
  directionCandidates: TransitionCandidate[],
  dpInputCandidates: TransitionCandidate[],
  globalScore: number | undefined,
): void {
  if (!fs.existsSync(TRANSITION_ANNOTATION_PATH)) {
    fail("TRANSITION_ANNOTATION_FILE_NOT_FOUND", TRANSITION_ANNOTATION_PATH);
  }
  let transitionGroundTruth: TransitionGroundTruthFile;
  try {
    transitionGroundTruth = JSON.parse(
      fs.readFileSync(TRANSITION_ANNOTATION_PATH, "utf8"),
    ) as TransitionGroundTruthFile;
  } catch (error) {
    fail("DATA_INTEGRITY_ERROR", `Unable to parse transition annotations: ${String(error)}`);
  }
  const samplingRateHz = dataset.samplingRateHz;
  const sync = transitionGroundTruth.sync;
  if (
    !sync ||
    !Number.isFinite(sync.videoTimeSeconds) ||
    !Number.isInteger(sync.imuSampleIndex) ||
    sync.imuSampleIndex < 0 ||
    sync.imuSampleIndex >= dataset.samples.length
  ) {
    fail("INVALID_SYNC_CONFIGURATION", `Invalid transition sync: ${JSON.stringify(sync)}`);
  }
  const annotations = transitionGroundTruth.events;
  if (
    transitionGroundTruth.dataset !== DATASET_NAME ||
    !Array.isArray(annotations) ||
    annotations.length !== EXPECTED_EVENT_COUNT ||
    !isExpectedAlternation(annotations) ||
    !isStrictlyIncreasing(annotations.map((event) => event.arrivalTimeSeconds))
  ) {
    fail("INVALID_TRANSITION_SEQUENCE", "Expected exactly 11 strictly increasing B-T-B-T-B-T-B-T-B-T-B transition events.");
  }
  annotations.forEach((event, index) => {
    const isLast = index === annotations.length - 1;
    if (
      !Number.isFinite(event.arrivalTimeSeconds) ||
      (event.departureTimeSeconds === null
        ? !isLast || event.type !== "BOTTOM"
        : !Number.isFinite(event.departureTimeSeconds) ||
          event.arrivalTimeSeconds > event.departureTimeSeconds)
    ) {
      fail("INVALID_TRANSITION_WINDOW", `Invalid transition window at event ${index + 1}: ${JSON.stringify(event)}`);
    }
    if (
      index > 0 &&
      annotations[index - 1].departureTimeSeconds !== null &&
      event.arrivalTimeSeconds <=
        (annotations[index - 1].departureTimeSeconds as number)
    ) {
      fail("INVALID_TRANSITION_SEQUENCE", `Transition event ${index + 1} does not start after the previous event.`);
    }
  });
  const syncImuTimeSeconds = sync.imuSampleIndex / samplingRateHz;
  const videoToImuOffsetSeconds = sync.videoTimeSeconds - syncImuTimeSeconds;
  const rows: TransitionRow[] = annotations.map((event, index) => {
    const arrivalIndex = Math.round(
      (event.arrivalTimeSeconds - videoToImuOffsetSeconds) * samplingRateHz,
    );
    const departureIndex =
      event.departureTimeSeconds === null
        ? null
        : Math.round(
            (event.departureTimeSeconds - videoToImuOffsetSeconds) *
              samplingRateHz,
          );
    const windowStart = Math.min(arrivalIndex, departureIndex ?? arrivalIndex);
    const windowEnd = Math.max(arrivalIndex, departureIndex ?? arrivalIndex);
    if (
      windowStart < 0 ||
      windowEnd >= dataset.samples.length
    ) {
      fail("GROUND_TRUTH_INDEX_OUT_OF_RANGE", `Transition event ${index + 1}: window=${windowStart}-${windowEnd}`);
    }
    const match = (candidates: TransitionCandidate[]) =>
      matchCandidateToWindow(candidates, event.type, windowStart, windowEnd, samplingRateHz);
    const strictGlobal = globalChain[index];
    const globalMatch = strictGlobal
      ? matchCandidateToWindow([strictGlobal], event.type, windowStart, windowEnd, samplingRateHz)
      : {
          index: null,
          status: "DIAGNOSTIC_UNAVAILABLE" as const,
          signedDistanceSamples: null,
          absoluteDistanceSamples: null,
          distanceMilliseconds: null,
        };
    return {
      eventNumber: index + 1,
      eventLabel: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep}`,
      type: event.type,
      rep: event.rep,
      arrivalVideoTimeSeconds: event.arrivalTimeSeconds,
      departureVideoTimeSeconds: event.departureTimeSeconds,
      arrivalImuSampleIndex: arrivalIndex,
      departureImuSampleIndex: departureIndex,
      windowStartSampleIndex: windowStart,
      windowEndSampleIndex: windowEnd,
      windowWidthSamples: windowEnd - windowStart,
      windowWidthMilliseconds: (windowEnd - windowStart) * (1000 / samplingRateHz),
      transitionStatus:
        event.departureTimeSeconds === null
          ? "FINAL_EVENT_WITHOUT_DEPARTURE"
          : "TRANSITION_WINDOW",
      raw: match(rawCandidates),
      prominence: match(prominenceCandidates),
      direction: match(directionCandidates),
      dpInput: match(dpInputCandidates),
      global: globalMatch,
    };
  });
  const mainTable = rows.map((row) => ({
    eventLabel: row.eventLabel,
    type: row.type,
    rep: row.rep,
    arrivalVideoTimeSeconds: row.arrivalVideoTimeSeconds,
    departureVideoTimeSeconds: row.departureVideoTimeSeconds,
    arrivalImuSampleIndex: row.arrivalImuSampleIndex,
    departureImuSampleIndex: row.departureImuSampleIndex,
    windowStartSampleIndex: row.windowStartSampleIndex,
    windowEndSampleIndex: row.windowEndSampleIndex,
    windowWidthSamples: row.windowWidthSamples,
    windowWidthMilliseconds: row.windowWidthMilliseconds,
    transitionStatus: row.transitionStatus,
    nearestRawIndex: row.raw.index,
    rawPositionRelativeToWindow: row.raw.status,
    rawSignedDistanceSamples: row.raw.signedDistanceSamples,
    rawAbsoluteDistanceSamples: row.raw.absoluteDistanceSamples,
    rawDistanceMilliseconds: row.raw.distanceMilliseconds,
    nearestProminenceIndex: row.prominence.index,
    prominencePositionRelativeToWindow: row.prominence.status,
    prominenceAbsoluteDistanceSamples: row.prominence.absoluteDistanceSamples,
    nearestDirectionIndex: row.direction.index,
    directionPositionRelativeToWindow: row.direction.status,
    directionAbsoluteDistanceSamples: row.direction.absoluteDistanceSamples,
    nearestDpInputIndex: row.dpInput.index,
    dpInputPositionRelativeToWindow: row.dpInput.status,
    dpInputAbsoluteDistanceSamples: row.dpInput.absoluteDistanceSamples,
    globalIndex: row.global.index,
    globalPositionRelativeToWindow: row.global.status,
    globalSignedDistanceSamples: row.global.signedDistanceSamples,
    globalAbsoluteDistanceSamples: row.global.absoluteDistanceSamples,
    globalDistanceMilliseconds: row.global.distanceMilliseconds,
  }));
  const aggregates = [
    transitionAggregate("RAW", rows, (row) => row.raw, samplingRateHz),
    transitionAggregate("PROMINENCE", rows, (row) => row.prominence, samplingRateHz),
    transitionAggregate("DIRECTION_CHANGE", rows, (row) => row.direction, samplingRateHz),
    transitionAggregate("DP_INPUT", rows, (row) => row.dpInput, samplingRateHz),
    transitionAggregate("GLOBAL_WINNER", rows, (row) => row.global, samplingRateHz),
  ];
  const bottomWidths = rows.filter((row) => row.type === "BOTTOM").map((row) => row.windowWidthSamples);
  const topWidths = rows.filter((row) => row.type === "TOP").map((row) => row.windowWidthSamples);
  const widthAggregates = {
    bottomEventsInsideWindow: aggregates.find((entry) => entry.population === "GLOBAL_WINNER")?.bottomEventsInsideWindow,
    topEventsInsideWindow: aggregates.find((entry) => entry.population === "GLOBAL_WINNER")?.topEventsInsideWindow,
    meanBottomWindowWidthSamples: mean(bottomWidths),
    meanTopWindowWidthSamples: mean(topWidths),
    meanBottomWindowWidthMilliseconds: mean(bottomWidths) * (1000 / samplingRateHz),
    meanTopWindowWidthMilliseconds: mean(topWidths) * (1000 / samplingRateHz),
    finalEventWithoutDeparture: "B6",
  };
  const pointOffset =
    pointGroundTruth.sync.videoTimeSeconds -
    pointGroundTruth.sync.imuSampleIndex / samplingRateHz;
  const pointComparison = rows.map((row, index) => {
    const pointIndex = Math.round(
      (pointGroundTruth.events[index].videoTimeSeconds - pointOffset) *
        samplingRateHz,
    );
    const pointError =
      row.raw.index === null ? null : Math.abs(row.raw.index - pointIndex);
    const transitionDistance = row.raw.absoluteDistanceSamples;
    let classificationChanged:
      | "POINT_OUTSIDE_TRANSITION_INSIDE"
      | "POINT_AND_TRANSITION_BOTH_OUTSIDE"
      | "POINT_AND_TRANSITION_BOTH_INSIDE"
      | "NOT_APPLICABLE" = "NOT_APPLICABLE";
    if (pointError !== null && transitionDistance !== null) {
      classificationChanged =
        pointError > 2 && transitionDistance === 0
          ? "POINT_OUTSIDE_TRANSITION_INSIDE"
          : pointError > 2 && transitionDistance > 0
            ? "POINT_AND_TRANSITION_BOTH_OUTSIDE"
            : pointError <= 2 && transitionDistance === 0
              ? "POINT_AND_TRANSITION_BOTH_INSIDE"
              : "NOT_APPLICABLE";
    }
    return {
      eventLabel: row.eventLabel,
      pointExpectedSampleIndex: pointIndex,
      transitionWindowStart: row.windowStartSampleIndex,
      transitionWindowEnd: row.windowEndSampleIndex,
      nearestRawIndex: row.raw.index,
      pointAbsoluteErrorSamples: pointError,
      transitionAbsoluteDistanceSamples: transitionDistance,
      classificationChanged,
    };
  });
  const outputDirectory = path.resolve(__dirname, "output", "transition-validation");
  fs.mkdirSync(outputDirectory, { recursive: true });
  const values = dataset.samples.map((sample) => sample[axis]);
  const fullPath = path.join(outputDirectory, "rowing_5reps_007_transition_ground_truth_full_comparison.png");
  renderTransitionPlot(values, String(axis), rows, sync.imuSampleIndex, fullPath);
  const zoomPaths = rows.map((row) => {
    const zoomPath = path.join(
      outputDirectory,
      `rowing_5reps_007_transition_event_${String(row.eventNumber).padStart(2, "0")}_${row.type.toLowerCase()}_zoom.png`,
    );
    renderTransitionZoom(values, row, zoomPath);
    return zoomPath;
  });
  const reportPath = path.join(outputDirectory, "rowing_5reps_007_transition_validation_report.md");
  fs.writeFileSync(
    reportPath,
    [
      "# Rowing 5 reps 007 — Transition validation",
      "",
      "## Métadonnées",
      "",
      `- Mode: ${VALIDATION_MODE}`,
      `- Dataset: ${DATASET_NAME}`,
      `- Axe de calibration: ${String(axis)}`,
      `- Fréquence: ${samplingRateHz} Hz`,
      `- Score du chemin Global: ${globalScore ?? "indisponible"}`,
      "",
      "## Synchronisation",
      "",
      `- sync.videoTimeSeconds: ${sync.videoTimeSeconds}`,
      `- sync.imuSampleIndex: ${sync.imuSampleIndex}`,
      `- syncImuTimeSeconds: ${syncImuTimeSeconds}`,
      `- videoToImuOffsetSeconds: ${videoToImuOffsetSeconds}`,
      "",
      "## Tableau complet",
      "",
      markdownTable(mainTable),
      "",
      "## Agrégats par population",
      "",
      markdownTable(aggregates),
      "",
      "## Agrégats des largeurs",
      "",
      markdownTable([widthAggregates]),
      "",
      "## Point vs Transition",
      "",
      markdownTable(pointComparison),
      "",
      "## Graphiques",
      "",
      `- Principal: ${fullPath}`,
      ...zoomPaths.map((zoomPath) => `- Zoom: ${zoomPath}`),
      "",
      "## Observations humaines à compléter",
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("\n=== TRANSITION VALIDATION METADATA ===\n");
  console.table([{
    mode: VALIDATION_MODE,
    samplingRateHz,
    axis,
    syncVideoTimeSeconds: sync.videoTimeSeconds,
    syncImuSampleIndex: sync.imuSampleIndex,
    syncImuTimeSeconds,
    videoToImuOffsetSeconds,
  }]);
  console.log("\n=== TRANSITION EVENT TABLE ===\n");
  console.table(mainTable);
  console.log("\n=== TRANSITION AGGREGATES ===\n");
  console.table(aggregates);
  console.table([widthAggregates]);
  console.log("\n=== POINT VS TRANSITION ===\n");
  console.table(pointComparison);
  console.log("\n=== TRANSITION ARTIFACTS ===\n");
  console.log(fullPath);
  zoomPaths.forEach((zoomPath) => console.log(zoomPath));
  console.log(reportPath);
}

function main(): void {
  if (!fs.existsSync(DATASET_PATH)) {
    fail("DATASET_NOT_FOUND", DATASET_PATH);
  }

  if (!fs.existsSync(ANNOTATION_PATH)) {
    fail("POINT_ANNOTATION_FILE_NOT_FOUND", ANNOTATION_PATH);
  }

  let dataset: CalibrationDataset;
  let groundTruth: GroundTruthFile;

  try {
    dataset = JSON.parse(
      fs.readFileSync(DATASET_PATH, "utf8"),
    ) as CalibrationDataset;
  } catch (error) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Unable to parse dataset: ${String(error)}`,
    );
  }

  try {
    groundTruth = JSON.parse(
      fs.readFileSync(ANNOTATION_PATH, "utf8"),
    ) as GroundTruthFile;
  } catch (error) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Unable to parse annotations: ${String(error)}`,
    );
  }

  if (
    !Number.isFinite(dataset.samplingRateHz) ||
    dataset.samplingRateHz <= 0
  ) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Invalid samplingRateHz: ${dataset.samplingRateHz}`,
    );
  }

  if (dataset.samplingRateHz !== 20) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Expected samplingRateHz=20, got ${dataset.samplingRateHz}`,
    );
  }

  if (
    dataset.sampleCount !== dataset.samples.length ||
    dataset.expectedReps !== EXPECTED_REPS ||
    groundTruth.dataset !== DATASET_NAME
  ) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Dataset metadata mismatch: sampleCount=${dataset.sampleCount}, samples.length=${dataset.samples.length}, expectedReps=${dataset.expectedReps}, annotation.dataset=${groundTruth.dataset}`,
    );
  }

  const annotations = groundTruth.events;
  const sync = groundTruth.sync;

  if (
    !sync ||
    !Number.isFinite(sync.videoTimeSeconds) ||
    sync.videoTimeSeconds < 0 ||
    !Number.isInteger(sync.imuSampleIndex) ||
    sync.imuSampleIndex < 0 ||
    sync.imuSampleIndex >= dataset.samples.length
  ) {
    fail(
      "INVALID_SYNC_CONFIGURATION",
      `Invalid sync block: ${JSON.stringify(sync)}`,
    );
  }

  if (
    !Array.isArray(annotations) ||
    annotations.length !== EXPECTED_EVENT_COUNT ||
    !isExpectedAlternation(annotations) ||
    !isStrictlyIncreasing(
      annotations.map((annotation) => annotation.videoTimeSeconds),
    )
  ) {
    fail(
      "INVALID_ANNOTATION_SEQUENCE",
      `Expected ${EXPECTED_EVENT_COUNT} strictly increasing B-T-B-T-B-T-B-T-B-T-B annotations.`,
    );
  }

  const calibration = calculateCalibration(
    dataset.samples,
    undefined,
    CALIBRATION_PARAMETERS,
    EXPECTED_REPS,
  );
  const debug = calibration.debug;
  const globalChain = debug?.selectedChain ?? [];

  if (
    !debug ||
    debug.selectionStrategy !== "global_alternating_path" ||
    globalChain.length === 0
  ) {
    fail(
      "GLOBAL_PATH_NOT_FOUND",
      "Calibration returned no global alternating path.",
    );
  }

  if (
    globalChain.length !== EXPECTED_EVENT_COUNT ||
    !isExpectedAlternation(globalChain) ||
    !isStrictlyIncreasing(globalChain.map((event) => event.index))
  ) {
    fail(
      "INVALID_GLOBAL_CHAIN",
      `Expected ${EXPECTED_EVENT_COUNT} strictly increasing B-T-B-T-B-T-B-T-B-T-B events, got: ${globalChain
        .map((event) => `${event.type}:${event.index}`)
        .join(", ")}`,
    );
  }

  const samplingRateHz = dataset.samplingRateHz;
  const millisecondsPerSample = 1000 / samplingRateHz;
  const syncImuTimeSeconds = sync.imuSampleIndex / samplingRateHz;
  const videoToImuOffsetSeconds =
    sync.videoTimeSeconds - syncImuTimeSeconds;
  const rows: ComparisonRow[] = annotations.map((annotation, index) => {
    const globalEvent = globalChain[index];
    const expectedImuTimeSeconds =
      annotation.videoTimeSeconds - videoToImuOffsetSeconds;
    const expectedImuSampleIndex = Math.round(
      expectedImuTimeSeconds * samplingRateHz,
    );

    if (
      expectedImuSampleIndex < 0 ||
      expectedImuSampleIndex >= dataset.samples.length
    ) {
      fail(
        "GROUND_TRUTH_INDEX_OUT_OF_RANGE",
        `Event ${index + 1}: expectedImuSampleIndex=${expectedImuSampleIndex}`,
      );
    }

    const signedErrorSamples =
      globalEvent.index - expectedImuSampleIndex;
    const absoluteErrorSamples = Math.abs(signedErrorSamples);

    return {
      eventNumber: index + 1,
      label: `${annotation.type === "BOTTOM" ? "B" : "T"}${annotation.rep}`,
      type: annotation.type,
      rep: annotation.rep,
      videoTimeSeconds: annotation.videoTimeSeconds,
      expectedImuTimeSeconds,
      expectedImuSampleIndex,
      globalSampleIndex: globalEvent.index,
      globalImuTimeSeconds: globalEvent.index / samplingRateHz,
      signedErrorSamples,
      absoluteErrorSamples,
      signedErrorMilliseconds:
        signedErrorSamples * millisecondsPerSample,
      absoluteErrorMilliseconds:
        absoluteErrorSamples * millisecondsPerSample,
      withinOneSample: absoluteErrorSamples <= 1,
      withinTwoSamples: absoluteErrorSamples <= 2,
    };
  });

  if (VALIDATION_MODE === "DP_ISOLATION") {
    runDpIsolationExperiment(
      dataset,
      groundTruth,
      calibration.axis,
    );
    return;
  }

  const rawOccurrenceByKey = new Map<string, number>();
  const rawCandidates = debug.rawCandidateDebugEvents.map((event) => {
    const identityKey = `${event.type}:${event.index}`;
    const occurrence =
      (rawOccurrenceByKey.get(identityKey) ?? 0) + 1;
    rawOccurrenceByKey.set(identityKey, occurrence);
    return {
      ...event,
      candidateId: `${identityKey}:${occurrence}`,
    };
  });
  const duplicatedRawIdentities = [
    ...rawOccurrenceByKey.entries(),
  ].filter(([, count]) => count > 1);

  if (duplicatedRawIdentities.length > 0) {
    fail(
      "CANDIDATE_IDENTITY_ERROR",
      `Calibration debug cannot associate filter events to duplicate type/index occurrences: ${JSON.stringify(duplicatedRawIdentities)}`,
    );
  }

  const rawCandidateByIdentity = new Map(
    rawCandidates.map((candidate) => [
      `${candidate.type}:${candidate.index}`,
      candidate,
    ]),
  );
  const eligibleDirectionEvents = debug.filterDebugEvents.filter(
    (event) =>
      event.filter === "DIRECTION_CHANGE" && event.kept,
  );
  const eligibleCandidates = [
    ...new Map(
      eligibleDirectionEvents
        .map((event) => [
          `${event.type}:${event.index}`,
          {
            candidateId:
              rawCandidateByIdentity.get(
                `${event.type}:${event.index}`,
              )?.candidateId ??
              fail(
                "CANDIDATE_IDENTITY_ERROR",
                `Eligible candidate ${event.type}:${event.index} has no RAW identity.`,
              ),
            type: event.type,
            index: event.index,
            value: event.value,
          } satisfies DpCandidate,
        ]),
    ).values(),
  ];

  if (
    eligibleCandidates.length !== eligibleDirectionEvents.length ||
    eligibleCandidates.length !== debug.admissibleCandidateCount
  ) {
    fail(
      "CANDIDATE_IDENTITY_ERROR",
      `DP input identity mismatch: directionEvents=${eligibleDirectionEvents.length}, uniqueCandidates=${eligibleCandidates.length}, admissibleCandidateCount=${debug.admissibleCandidateCount}.`,
    );
  }

  if (VALIDATION_MODE === "DP_V2_TOP_K_SEARCH_DIAGNOSTIC") {
    runDpV2TopKSearchDiagnostic(
      dataset,
      groundTruth,
      calibration.axis,
      eligibleCandidates,
    );
    return;
  }

  if (VALIDATION_MODE === "DP_V2_PATH_RANKING_ANALYSIS") {
    runDpV2PathRankingAnalysis(
      dataset,
      groundTruth,
      calibration.axis,
      eligibleCandidates,
      globalChain,
      debug.selectionScore,
      debug,
    );
    return;
  }

  if (VALIDATION_MODE === "DP_V2_FEATURE_ANALYSIS") {
    runDpV2FeatureAnalysis(
      dataset,
      groundTruth,
      calibration.axis,
      eligibleCandidates,
      globalChain,
      debug.selectionScore,
      debug,
    );
    return;
  }

  if (VALIDATION_MODE === "DP_SCORE_DECOMPOSITION") {
    runDpScoreDecomposition(
      dataset,
      groundTruth,
      calibration.axis,
      eligibleCandidates,
      globalChain,
      debug.selectionScore,
    );
    return;
  }

  if (VALIDATION_MODE === "DP_GROUND_TRUTH_INJECTION") {
    runDpGroundTruthInjectionExperiment(
      dataset,
      groundTruth,
      calibration.axis,
      eligibleCandidates,
    );
    return;
  }

  if (VALIDATION_MODE === "TRANSITION") {
    const uniqueFilterCandidates = (
      filterName: "PROMINENCE" | "DIRECTION_CHANGE",
    ): TransitionCandidate[] => [
      ...new Map(
        debug.filterDebugEvents
          .filter(
            (event) => event.filter === filterName && event.kept,
          )
          .map((event) => [
            `${event.type}:${event.index}`,
            {
              type: event.type,
              index: event.index,
              value: event.value,
            },
          ]),
      ).values(),
    ];
    runTransitionValidation(
      dataset,
      groundTruth,
      calibration.axis,
      globalChain,
      rawCandidates,
      uniqueFilterCandidates("PROMINENCE"),
      uniqueFilterCandidates("DIRECTION_CHANGE"),
      eligibleCandidates,
      debug.selectionScore,
    );
    return;
  }

  const dpReplay = reconstructAllDpFinalPaths(
    eligibleCandidates,
    EXPECTED_REPS,
  );
  const finalDpPaths = dpReplay.finalPaths;

  if (
    finalDpPaths.length === 0 ||
    finalDpPaths.some(
      (pathResult) =>
        pathResult.chain.length !== EXPECTED_EVENT_COUNT,
    )
  ) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Read-only DP replay produced ${finalDpPaths.length} terminal states with an invalid chain length.`,
    );
  }

  const rankedDpPaths: RankedDpPath[] = finalDpPaths
    .map((pathResult) => {
      const absoluteErrors = pathResult.chain.map(
        (event, index) =>
          Math.abs(event.index - rows[index].expectedImuSampleIndex),
      );
      return {
        ...pathResult,
        rank: 0,
        totalAbsoluteError: absoluteErrors.reduce(
          (sum, error) => sum + error,
          0,
        ),
        meanAbsoluteError: mean(absoluteErrors),
        medianAbsoluteError: median(absoluteErrors),
        maxError: Math.max(...absoluteErrors),
        eventsWithinOneSample: absoluteErrors.filter(
          (error) => error <= 1,
        ).length,
        eventsWithinTwoSamples: absoluteErrors.filter(
          (error) => error <= 2,
        ).length,
      };
    })
    .sort(
      (left, right) =>
        left.totalAbsoluteError - right.totalAbsoluteError ||
        left.maxError - right.maxError ||
        right.score - left.score ||
        left.stateId.localeCompare(right.stateId),
    )
    .map((pathResult, index) => ({
      ...pathResult,
      rank: index + 1,
    }));
  const bestMatchToGroundTruth = rankedDpPaths[0];
  const calibrationWinnerSequence = globalChain
    .map((event) => `${event.type}:${event.index}`)
    .join("|");
  const currentDpWinner = rankedDpPaths.find(
    (pathResult) =>
      pathResult.chain
        .map((event) => `${event.type}:${event.index}`)
        .join("|") === calibrationWinnerSequence,
  );

  if (
    !currentDpWinner ||
    currentDpWinner.score !== debug.selectionScore ||
    currentDpWinner.score !==
      Math.max(...rankedDpPaths.map((pathResult) => pathResult.score))
  ) {
    fail(
      "DP_REPLAY_MISMATCH",
      "Read-only DP replay winner differs from calibration output.",
    );
  }

  const sameChain =
    formatDpChain(bestMatchToGroundTruth.chain) ===
    formatDpChain(currentDpWinner.chain);
  const dpComparison = {
    sameChain: sameChain ? "YES" : "NO",
    totalErrorDifferenceBestMinusWinner:
      bestMatchToGroundTruth.totalAbsoluteError -
      currentDpWinner.totalAbsoluteError,
    dpScoreDifferenceBestMinusWinner:
      bestMatchToGroundTruth.score - currentDpWinner.score,
  };
  const terminalScoreRanks = new Map(
    [...rankedDpPaths]
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.stateId.localeCompare(right.stateId),
      )
      .map((pathResult, index) => [
        pathResult.stateId,
        index + 1,
      ]),
  );
  const prominenceThreshold =
    debug.robustRange *
    CALIBRATION_PARAMETERS.minimumProminenceRatio;

  const eventCandidateTraces = rows.map((row) => {
    const sameTypeRawCandidates = rawCandidates.filter(
      (candidate) => candidate.type === row.type,
    );
    const primaryCandidates = sameTypeRawCandidates.filter(
      (candidate) =>
        Math.abs(candidate.index - row.expectedImuSampleIndex) <= 2,
    );
    const nearestDistance =
      sameTypeRawCandidates.length === 0
        ? null
        : Math.min(
            ...sameTypeRawCandidates.map((candidate) =>
              Math.abs(
                candidate.index - row.expectedImuSampleIndex,
              ),
            ),
          );
    const nearestCandidates =
      nearestDistance === null
        ? []
        : sameTypeRawCandidates.filter(
            (candidate) =>
              Math.abs(
                candidate.index - row.expectedImuSampleIndex,
              ) === nearestDistance,
          );
    const diagnosticCandidates =
      primaryCandidates.length > 0 || nearestDistance === null ||
      nearestDistance > 5
        ? []
        : nearestCandidates;
    const followedCandidates =
      primaryCandidates.length > 0
        ? primaryCandidates
        : diagnosticCandidates;
    const rawStatus =
      primaryCandidates.length > 1
        ? "MULTIPLE_RAW_PRIMARY_CANDIDATES"
        : primaryCandidates.length === 1
          ? "FOUND_RAW_PRIMARY"
          : diagnosticCandidates.length > 0
            ? "NEAREST_OUTSIDE_PRIMARY_TOLERANCE"
            : nearestDistance === null || nearestDistance > 5
              ? "NO_RAW_CANDIDATE_WITHIN_DIAGNOSTIC_WINDOW"
              : "NOT_FOUND_RAW_PRIMARY";

    const candidateJourneys = followedCandidates.map((candidate) => {
      const filterEvents = debug.filterDebugEvents.filter(
        (event) =>
          event.type === candidate.type &&
          event.index === candidate.index,
      );
      const prominenceEvent = filterEvents.find(
        (event) => event.filter === "PROMINENCE",
      );
      const directionEvent = filterEvents.find(
        (event) => event.filter === "DIRECTION_CHANGE",
      );
      const prominenceStatus = !prominenceEvent
        ? "PROMINENCE_STATUS_UNAVAILABLE"
        : prominenceEvent.kept
          ? "SURVIVED_PROMINENCE"
          : "REMOVED_BY_PROMINENCE";
      const directionChangeStatus =
        prominenceStatus !== "SURVIVED_PROMINENCE" ||
        !directionEvent
          ? "DIRECTION_CHANGE_STATUS_UNAVAILABLE"
          : directionEvent.kept
            ? "SURVIVED_DIRECTION_CHANGE"
            : "REMOVED_BY_DIRECTION_CHANGE";
      const dpInputPosition = eligibleCandidates.findIndex(
        (eligible) =>
          eligible.candidateId === candidate.candidateId,
      );
      const dpInputStatus =
        dpInputPosition >= 0
          ? "FOUND_IN_DP_INPUT"
          : "NOT_FOUND_IN_DP_INPUT";
      const dpTrace = dpReplay.candidateTraces.get(
        candidate.candidateId,
      );
      const dpStateStatus =
        dpTrace && dpTrace.statesContainingAsCurrent > 0
          ? "FOUND_IN_DP_STATE"
          : "NEVER_REACHED_BY_DP_STATE";
      const terminalPaths = rankedDpPaths.filter((pathResult) =>
        pathResult.chain.some(
          (event) => event.candidateId === candidate.candidateId,
        ),
      );
      const terminalPathStatus =
        terminalPaths.length > 0
          ? "FOUND_IN_TERMINAL_PATHS"
          : "NOT_PRESENT_IN_ANY_TERMINAL_PATH";
      const winnerPosition = currentDpWinner.chain.findIndex(
        (event) => event.candidateId === candidate.candidateId,
      );
      const winnerStatus =
        winnerPosition >= 0
          ? "SELECTED_BY_DP_WINNER"
          : "NOT_SELECTED_BY_DP_WINNER";
      const structuralReachabilityStatus =
        dpInputStatus !== "FOUND_IN_DP_INPUT" ||
        terminalPaths.length > 0
          ? "REACHABILITY_NOT_APPLICABLE"
          : dpTrace && dpTrace.incomingTransitionsAccepted > 0
            ? "STRUCTURALLY_REACHABLE_BUT_NOT_IN_TERMINAL_PATH"
            : "STRUCTURALLY_UNREACHABLE";

      return {
        candidate,
        distanceSignedSamples:
          candidate.index - row.expectedImuSampleIndex,
        distanceAbsoluteSamples: Math.abs(
          candidate.index - row.expectedImuSampleIndex,
        ),
        distanceMilliseconds:
          (candidate.index - row.expectedImuSampleIndex) *
          millisecondsPerSample,
        prominenceEvent,
        prominenceThreshold,
        prominenceStatus,
        directionEvent,
        directionChangeStatus,
        dpInputPosition,
        dpInputStatus,
        dpTrace,
        dpStateStatus,
        structuralReachabilityStatus,
        terminalPaths,
        terminalPathStatus,
        winnerPosition,
        winnerStatus,
      };
    });
    const combinedStatus = (
      selector: (journey: (typeof candidateJourneys)[number]) => string,
      unavailable: string,
    ) => {
      if (candidateJourneys.length === 0) return unavailable;
      const statuses = [...new Set(candidateJourneys.map(selector))];
      return statuses.length === 1
        ? statuses[0]
        : `MULTIPLE:${statuses.join("|")}`;
    };
    const prominenceStatus = combinedStatus(
      (journey) => journey.prominenceStatus,
      "PROMINENCE_STATUS_UNAVAILABLE",
    );
    const directionChangeStatus = combinedStatus(
      (journey) => journey.directionChangeStatus,
      "DIRECTION_CHANGE_STATUS_UNAVAILABLE",
    );
    const dpInputStatus = combinedStatus(
      (journey) => journey.dpInputStatus,
      "NOT_FOUND_IN_DP_INPUT",
    );
    const dpStateStatus = combinedStatus(
      (journey) => journey.dpStateStatus,
      "NEVER_REACHED_BY_DP_STATE",
    );
    const structuralReachabilityStatus = combinedStatus(
      (journey) => journey.structuralReachabilityStatus,
      "REACHABILITY_NOT_APPLICABLE",
    );
    const terminalPathStatus = combinedStatus(
      (journey) => journey.terminalPathStatus,
      "NOT_PRESENT_IN_ANY_TERMINAL_PATH",
    );
    const winnerStatus = combinedStatus(
      (journey) => journey.winnerStatus,
      "NOT_SELECTED_BY_DP_WINNER",
    );
    let firstConfirmedLossStage:
      | "RAW"
      | "PROMINENCE"
      | "DIRECTION_CHANGE"
      | "DP_INPUT"
      | "DP_REACHABILITY"
      | "TERMINAL_COMPLETION"
      | "WINNER_SELECTION"
      | "NOT_LOST"
      | "AMBIGUOUS_MULTIPLE_CANDIDATES";

    if (primaryCandidates.length > 1) {
      firstConfirmedLossStage = "AMBIGUOUS_MULTIPLE_CANDIDATES";
    } else if (primaryCandidates.length === 0) {
      firstConfirmedLossStage = "RAW";
    } else {
      const journey = candidateJourneys[0];
      firstConfirmedLossStage =
        journey.prominenceStatus !== "SURVIVED_PROMINENCE"
          ? "PROMINENCE"
          : journey.directionChangeStatus !==
                "SURVIVED_DIRECTION_CHANGE"
            ? "DIRECTION_CHANGE"
            : journey.dpInputStatus !== "FOUND_IN_DP_INPUT"
              ? "DP_INPUT"
              : journey.dpStateStatus !== "FOUND_IN_DP_STATE"
                ? "DP_REACHABILITY"
                : journey.terminalPathStatus !==
                    "FOUND_IN_TERMINAL_PATHS"
                  ? "TERMINAL_COMPLETION"
                  : journey.winnerStatus !==
                      "SELECTED_BY_DP_WINNER"
                    ? "WINNER_SELECTION"
                    : "NOT_LOST";
    }

    return {
      row,
      primaryCandidates,
      nearestCandidates,
      diagnosticCandidates,
      candidateJourneys,
      summary: {
        eventLabel: row.label,
        expectedType: row.type,
        expectedSampleIndex: row.expectedImuSampleIndex,
        primaryRawCandidateCount: primaryCandidates.length,
        nearestRawCandidateIndex:
          nearestCandidates.map((candidate) => candidate.index).join(", ") ||
          null,
        nearestRawDistanceSamples: nearestDistance,
        rawStatus,
        prominenceStatus,
        directionChangeStatus,
        dpInputStatus,
        dpStateStatus,
        structuralReachabilityStatus,
        terminalPathStatus,
        winnerStatus,
        firstConfirmedLossStage,
      },
    };
  });

  const absoluteSampleErrors = rows.map(
    (row) => row.absoluteErrorSamples,
  );
  const absoluteMillisecondErrors = rows.map(
    (row) => row.absoluteErrorMilliseconds,
  );
  const bottomErrors = rows
    .filter((row) => row.type === "BOTTOM")
    .map((row) => row.absoluteErrorSamples);
  const topErrors = rows
    .filter((row) => row.type === "TOP")
    .map((row) => row.absoluteErrorSamples);
  const outsideTwoSamples = rows.filter(
    (row) => row.absoluteErrorSamples > 2,
  );
  const statistics = {
    evaluatedEventCount: rows.length,
    meanAbsoluteErrorSamples: mean(absoluteSampleErrors),
    medianAbsoluteErrorSamples: median(absoluteSampleErrors),
    maxAbsoluteErrorSamples: Math.max(...absoluteSampleErrors),
    meanAbsoluteErrorMilliseconds: mean(absoluteMillisecondErrors),
    medianAbsoluteErrorMilliseconds: median(
      absoluteMillisecondErrors,
    ),
    maxAbsoluteErrorMilliseconds: Math.max(
      ...absoluteMillisecondErrors,
    ),
    eventsWithinOneSample: rows.filter(
      (row) => row.withinOneSample,
    ).length,
    eventsWithinTwoSamples: rows.filter(
      (row) => row.withinTwoSamples,
    ).length,
    eventsOutsideTwoSamples: outsideTwoSamples.length,
    bottomMeanAbsoluteErrorSamples: mean(bottomErrors),
    topMeanAbsoluteErrorSamples: mean(topErrors),
    listEventsOutsideTwoSamples: outsideTwoSamples
      .map((row) => row.label)
      .join(", "),
  };
  const metadata = {
    datasetName: DATASET_NAME,
    samplingRateHz,
    annotationEventCount: annotations.length,
    globalEventCount: globalChain.length,
    globalPathStatus: "GLOBAL_PATH_FOUND",
    globalPathScore: debug.selectionScore,
    syncVideoTimeSeconds: sync.videoTimeSeconds,
    syncImuSampleIndex: sync.imuSampleIndex,
    syncImuTimeSeconds,
    videoToImuOffsetSeconds,
  };
  const axis = calibration.axis;

  if (
    !dataset.samples.every(
      (sample) =>
        axis in sample && Number.isFinite(sample[axis]),
    )
  ) {
    fail(
      "DATA_INTEGRITY_ERROR",
      `Calibration axis ${axis} is absent or invalid in dataset samples.`,
    );
  }

  const values = dataset.samples.map((sample) => sample[axis]);
  const outputDirectory = path.resolve(__dirname, "output");
  fs.mkdirSync(outputDirectory, { recursive: true });
  const rawInvestigation = runRawInvestigation(
    dataset,
    axis,
    rows,
    rawCandidates,
    outputDirectory,
  );
  console.log("\n=== RAW INVESTIGATION SUMMARY ===\n");
  console.table(
    rawInvestigation.events.map((event) => ({
      eventLabel: event.eventLabel,
      expectedType: event.expectedType,
      groundTruthIndex: event.groundTruthIndex,
      status: event.status,
      nearestSameTypeRawIndex: event.nearestSameTypeRawIndex,
      signedDistanceSamples: event.signedDistanceSamples,
      localPeakToPeakAmplitude: event.localPeakToPeakAmplitude,
      localNoiseEstimate: event.localNoiseEstimate,
      amplitudeToNoiseRatio: event.amplitudeToNoiseRatio,
      slopeBefore: event.slopeBefore,
      slopeAfter: event.slopeAfter,
      directionChangeVisible: event.directionChangeVisible,
      simpleExtremumAtGroundTruth:
        event.simpleExtremumAtGroundTruth,
      rawCandidateAtGroundTruth: event.rawCandidateAtGroundTruth,
      snappedCandidateIndex: event.snappedCandidateIndex,
      selectedAxis: event.selectedAxis,
      strongestAxisInWindow: event.strongestAxisInWindow,
    })),
  );
  console.log("\n=== RAW INVESTIGATION ARTIFACTS ===\n");
  rawInvestigation.pngPaths.forEach((artifactPath) =>
    console.log(artifactPath),
  );
  console.log(rawInvestigation.comparisonPath);
  console.log(rawInvestigation.reportPath);
  return;

  const fullPngName =
    "rowing_5reps_007_ground_truth_full_comparison.png";
  const fullPngPath = path.join(outputDirectory, fullPngName);
  renderFullComparison(
    values,
    axis,
    rows,
    sync.imuSampleIndex,
    samplingRateHz,
    fullPngPath,
  );

  const zoomFiles = rows.map((row) => {
    const fileName =
      `rowing_5reps_007_event_${String(row.eventNumber).padStart(2, "0")}_` +
      `${row.type.toLowerCase()}_zoom.png`;
    renderEventZoom(values, row, path.join(outputDirectory, fileName));
    return fileName;
  });

  const reportName = "rowing_5reps_007_ground_truth_report.md";
  const reportPath = path.join(outputDirectory, reportName);
  const report = [
    "# rowing_5reps_007 — Ground Truth Validation",
    "",
    "## Métadonnées",
    "",
    "| Champ | Valeur |",
    "|---|---:|",
    ...Object.entries(metadata).map(
      ([name, value]) => `| ${name} | ${value} |`,
    ),
    "",
    "## Comparaison stricte des événements",
    "",
    "| # | label | type | rep | vidéo (s) | IMU attendue (s) | index attendu | index Global | temps Global (s) | erreur samples | erreur abs. | erreur ms | erreur abs. ms | ≤1 | ≤2 |",
    "|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|",
    ...rows.map(
      (row) =>
        `| ${row.eventNumber} | ${row.label} | ${row.type} | ${row.rep} | ${row.videoTimeSeconds} | ${row.expectedImuTimeSeconds} | ${row.expectedImuSampleIndex} | ${row.globalSampleIndex} | ${row.globalImuTimeSeconds} | ${row.signedErrorSamples} | ${row.absoluteErrorSamples} | ${row.signedErrorMilliseconds} | ${row.absoluteErrorMilliseconds} | ${row.withinOneSample} | ${row.withinTwoSamples} |`,
    ),
    "",
    "## Statistiques",
    "",
    "| Mesure | Valeur |",
    "|---|---:|",
    ...Object.entries(statistics).map(
      ([name, value]) => `| ${name} | ${value} |`,
    ),
    "",
    "## Toutes les chaînes terminales du DP",
    "",
    "| Rang | DP State Id | DP Score | Erreur absolue totale | Erreur moyenne | Erreur médiane | Erreur maximale | Événements ≤1 | Événements ≤2 | Chaîne |",
    "|---:|---|---:|---:|---:|---:|---:|---:|---:|---|",
    ...rankedDpPaths.map(
      (pathResult) =>
        `| ${pathResult.rank} | ${pathResult.stateId} | ${pathResult.score} | ${pathResult.totalAbsoluteError} | ${pathResult.meanAbsoluteError} | ${pathResult.medianAbsoluteError} | ${pathResult.maxError} | ${pathResult.eventsWithinOneSample} | ${pathResult.eventsWithinTwoSamples} | ${formatDpChain(pathResult.chain)} |`,
    ),
    "",
    "## BEST_MATCH_TO_GROUND_TRUTH",
    "",
    `- rang: ${bestMatchToGroundTruth.rank}`,
    `- score DP: ${bestMatchToGroundTruth.score}`,
    `- chaîne: ${formatDpChain(bestMatchToGroundTruth.chain)}`,
    `- erreur absolue totale: ${bestMatchToGroundTruth.totalAbsoluteError}`,
    `- erreur moyenne: ${bestMatchToGroundTruth.meanAbsoluteError}`,
    "",
    "## CURRENT_DP_WINNER",
    "",
    `- rang Ground Truth: ${currentDpWinner.rank}`,
    `- score DP: ${currentDpWinner.score}`,
    `- chaîne: ${formatDpChain(currentDpWinner.chain)}`,
    `- erreur absolue totale: ${currentDpWinner.totalAbsoluteError}`,
    `- erreur moyenne: ${currentDpWinner.meanAbsoluteError}`,
    "",
    "## BEST_MATCH_TO_GROUND_TRUTH vs CURRENT_DP_WINNER",
    "",
    `- même chaîne: ${dpComparison.sameChain}`,
    `- différence d’erreur totale (Best - Winner): ${dpComparison.totalErrorDifferenceBestMinusWinner}`,
    `- différence de score DP (Best - Winner): ${dpComparison.dpScoreDifferenceBestMinusWinner}`,
    "",
    "## Événements à plus de 2 samples",
    "",
    outsideTwoSamples.length === 0
      ? "Aucun."
      : outsideTwoSamples
          .map(
            (row) =>
              `- ${row.label}: ${row.signedErrorSamples} samples (${row.signedErrorMilliseconds} ms)`,
          )
          .join("\n"),
    "",
    "## Preuve visuelle",
    "",
    `![Comparaison complète](./${fullPngName})`,
    "",
    ...zoomFiles.flatMap((file, index) => [
      `### ${rows[index].label}`,
      "",
      `![${rows[index].label}](./${file})`,
      "",
    ]),
    "## Interprétation limitée",
    "",
    `- ${statistics.eventsWithinTwoSamples} événements sont à deux samples ou moins.`,
    `- ${statistics.eventsOutsideTwoSamples} événements sont à plus de deux samples.`,
    "- Ces mesures ne constituent aucune conclusion biomécanique.",
    "- Ce rapport ne propose aucune modification d’algorithme.",
    "",
  ];
  fs.writeFileSync(reportPath, report.join("\n"), "utf8");

  const candidateTraceReportName =
    "rowing_5reps_007_ground_truth_candidate_trace.md";
  const candidateTraceReportPath = path.join(
    outputDirectory,
    candidateTraceReportName,
  );
  const candidateTraceReport: string[] = [
    "# rowing_5reps_007 — Ground Truth Candidate Trace",
    "",
    "Rapport factuel en lecture seule. Tolérance primaire ±2 samples; fenêtre diagnostique ±5 samples.",
    "",
    "## Tableau synthétique",
    "",
    "| eventLabel | expectedType | expectedSampleIndex | primaryRawCandidateCount | nearestRawCandidateIndex | nearestRawDistanceSamples | rawStatus | prominenceStatus | directionChangeStatus | dpInputStatus | dpStateStatus | structuralReachabilityStatus | terminalPathStatus | winnerStatus | firstConfirmedLossStage |",
    "|---|---|---:|---:|---|---:|---|---|---|---|---|---|---|---|---|",
    ...eventCandidateTraces.map(({ summary }) =>
      `| ${summary.eventLabel} | ${summary.expectedType} | ${summary.expectedSampleIndex} | ${summary.primaryRawCandidateCount} | ${summary.nearestRawCandidateIndex ?? "—"} | ${summary.nearestRawDistanceSamples ?? "—"} | ${summary.rawStatus} | ${summary.prominenceStatus} | ${summary.directionChangeStatus} | ${summary.dpInputStatus} | ${summary.dpStateStatus} | ${summary.structuralReachabilityStatus} | ${summary.terminalPathStatus} | ${summary.winnerStatus} | ${summary.firstConfirmedLossStage} |`,
    ),
  ];

  for (const eventTrace of eventCandidateTraces) {
    candidateTraceReport.push(
      "",
      `## ${eventTrace.row.label}`,
      "",
      `- expectedType: ${eventTrace.row.type}`,
      `- expectedSampleIndex: ${eventTrace.row.expectedImuSampleIndex}`,
      `- videoTimeSeconds: ${eventTrace.row.videoTimeSeconds}`,
      `- expectedImuTimeSeconds: ${eventTrace.row.expectedImuTimeSeconds}`,
      `- rawStatus: ${eventTrace.summary.rawStatus}`,
      `- firstConfirmedLossStage: ${eventTrace.summary.firstConfirmedLossStage}`,
      "",
      "### Candidats RAW primaires",
      "",
    );
    if (eventTrace.primaryCandidates.length === 0) {
      candidateTraceReport.push("Aucun.");
    } else {
      candidateTraceReport.push(
        "```json",
        JSON.stringify(eventTrace.primaryCandidates, null, 2),
        "```",
      );
    }
    candidateTraceReport.push(
      "",
      "### Candidat(s) diagnostique(s) le(s) plus proche(s)",
      "",
    );
    if (eventTrace.diagnosticCandidates.length === 0) {
      candidateTraceReport.push("Aucun dans la fenêtre ±5, ou non applicable.");
    } else {
      candidateTraceReport.push(
        "```json",
        JSON.stringify(eventTrace.diagnosticCandidates, null, 2),
        "```",
      );
    }

    for (const journey of eventTrace.candidateJourneys) {
      const dpTrace = journey.dpTrace;
      candidateTraceReport.push(
        "",
        `### Parcours ${journey.candidate.candidateId}`,
        "",
        "#### RAW",
        "",
        "```json",
        JSON.stringify(
          {
            ...journey.candidate,
            distanceSignedSamples: journey.distanceSignedSamples,
            distanceAbsoluteSamples:
              journey.distanceAbsoluteSamples,
            distanceMilliseconds: journey.distanceMilliseconds,
          },
          null,
          2,
        ),
        "```",
        "",
        "#### PROMINENCE",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.prominenceStatus,
            measuredProminence:
              journey.prominenceEvent?.prominence ?? null,
            appliedThreshold: journey.prominenceThreshold,
            rejectedReason:
              journey.prominenceEvent?.rejectedReason ?? null,
            kept: journey.prominenceEvent?.kept ?? null,
            debugEvent: journey.prominenceEvent ?? null,
          },
          null,
          2,
        ),
        "```",
        "",
        "#### DIRECTION_CHANGE",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.directionChangeStatus,
            measuredDirectionChange:
              journey.directionEvent?.directionChange ?? null,
            appliedRule: "directionChange > 0",
            rejectedReason:
              journey.directionEvent?.rejectedReason ?? null,
            kept: journey.directionEvent?.kept ?? null,
            debugEvent: journey.directionEvent ?? null,
          },
          null,
          2,
        ),
        "```",
        "",
        "#### DP INPUT",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.dpInputStatus,
            position:
              journey.dpInputPosition >= 0
                ? journey.dpInputPosition
                : null,
            type: journey.candidate.type,
            index: journey.candidate.index,
            value: journey.candidate.value,
          },
          null,
          2,
        ),
        "```",
        "",
        "#### DP INTERNAL REACHABILITY ET TRANSITIONS",
        "",
        "```json",
        JSON.stringify(
          dpTrace
            ? {
                status: journey.dpStateStatus,
                statesContainingAsCurrent:
                  dpTrace.statesContainingAsCurrent,
                chainPositions: [...new Set(dpTrace.chainPositions)],
                validPredecessorStateCount:
                  new Set(dpTrace.validPredecessorStateIds).size,
                validPredecessorStateIds: [
                  ...new Set(dpTrace.validPredecessorStateIds),
                ],
                incomingTransitionsEvaluated:
                  dpTrace.incomingTransitionsEvaluated,
                incomingTransitionsAccepted:
                  dpTrace.incomingTransitionsAccepted,
                incomingTransitionsRefused:
                  dpTrace.incomingTransitionsRefused,
                incomingRefusalCounts: dpTrace.refusalCounts,
                outgoingTransitionsEvaluated:
                  dpTrace.outgoingTransitionsEvaluated,
                outgoingTransitionsAccepted:
                  dpTrace.outgoingTransitionsAccepted,
                outgoingTransitionsRefused:
                  dpTrace.outgoingTransitionsRefused,
                outgoingRefusalCounts:
                  dpTrace.outgoingRefusalCounts,
                dominatedStateCount: dpTrace.dominatedStateCount,
                dominanceScoreDifferences:
                  dpTrace.dominanceScoreDifferences,
                maximumDescendantLayer:
                  dpTrace.maximumDescendantLayer,
                transitionDetails: dpTrace.transitionDetails,
              }
            : {
                status: journey.dpStateStatus,
                reason: "Candidate absent du DP input.",
              },
          null,
          2,
        ),
        "```",
        "",
        "#### STRUCTURAL REACHABILITY (5B)",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.structuralReachabilityStatus,
            compatiblePredecessorStateIds: dpTrace
              ? [...new Set(dpTrace.validPredecessorStateIds)]
              : [],
            structurallyValidIncomingTransitions:
              dpTrace?.incomingTransitionsAccepted ?? 0,
            stateCreated:
              (dpTrace?.statesContainingAsCurrent ?? 0) > 0,
            dominatedOrReplacedStateCount:
              dpTrace?.dominatedStateCount ?? 0,
            dominanceScoreDifferences:
              dpTrace?.dominanceScoreDifferences ?? [],
            maximumDescendantLayer:
              dpTrace?.maximumDescendantLayer ?? null,
            blockingTransitionDetails:
              journey.structuralReachabilityStatus ===
              "STRUCTURALLY_UNREACHABLE"
                ? dpTrace?.transitionDetails.filter(
                    (transition) => !transition.accepted,
                  ) ?? []
                : [],
          },
          null,
          2,
        ),
        "```",
        "",
        "#### TERMINAL PATHS",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.terminalPathStatus,
            terminalPathCount: journey.terminalPaths.length,
            paths: journey.terminalPaths.map((pathResult) => ({
              dpStateId: pathResult.stateId,
              scoreRank:
                terminalScoreRanks.get(pathResult.stateId) ?? null,
              groundTruthErrorRank: pathResult.rank,
              score: pathResult.score,
              chain: formatDpChain(pathResult.chain),
            })),
          },
          null,
          2,
        ),
        "```",
        "",
        "#### WINNING PATH",
        "",
        "```json",
        JSON.stringify(
          {
            status: journey.winnerStatus,
            winnerChainPosition:
              journey.winnerPosition >= 0
                ? journey.winnerPosition + 1
                : null,
            index: journey.candidate.index,
            type: journey.candidate.type,
            winnerFinalScore: currentDpWinner.score,
          },
          null,
          2,
        ),
        "```",
      );
    }
  }
  fs.writeFileSync(
    candidateTraceReportPath,
    `${candidateTraceReport.join("\n")}\n`,
    "utf8",
  );

  console.log("\n=== GROUND TRUTH VALIDATION METADATA ===\n");
  console.table([metadata]);
  console.log("\n=== STRICT ORDERED EVENT COMPARISON ===\n");
  console.table(
    rows.map(({ label: _label, ...row }) => row),
  );
  console.log("\n=== ERROR STATISTICS (ALL 11 EVENTS) ===\n");
  console.table([statistics]);
  console.log("\n=== ALL VALID DP TERMINAL PATHS RANKED BY GROUND TRUTH ERROR ===\n");
  console.table(
    rankedDpPaths.map((pathResult) => ({
      dpPathRank: pathResult.rank,
      dpStateId: pathResult.stateId,
      dpScore: pathResult.score,
      totalAbsoluteError: pathResult.totalAbsoluteError,
      meanAbsoluteError: pathResult.meanAbsoluteError,
      medianAbsoluteError: pathResult.medianAbsoluteError,
      maxError: pathResult.maxError,
      eventsWithinOneSample: pathResult.eventsWithinOneSample,
      eventsWithinTwoSamples: pathResult.eventsWithinTwoSamples,
      chain: formatDpChain(pathResult.chain),
    })),
  );
  console.log("\n=== BEST_MATCH_TO_GROUND_TRUTH ===\n");
  console.table([
    {
      rank: bestMatchToGroundTruth.rank,
      dpScore: bestMatchToGroundTruth.score,
      chain: formatDpChain(bestMatchToGroundTruth.chain),
      totalAbsoluteError:
        bestMatchToGroundTruth.totalAbsoluteError,
      meanAbsoluteError:
        bestMatchToGroundTruth.meanAbsoluteError,
    },
  ]);
  console.log("\n=== CURRENT_DP_WINNER ===\n");
  console.table([
    {
      rank: currentDpWinner.rank,
      dpScore: currentDpWinner.score,
      chain: formatDpChain(currentDpWinner.chain),
      totalAbsoluteError: currentDpWinner.totalAbsoluteError,
      meanAbsoluteError: currentDpWinner.meanAbsoluteError,
    },
  ]);
  console.log(
    "\n=== BEST_MATCH_TO_GROUND_TRUTH vs CURRENT_DP_WINNER ===\n",
  );
  console.table([dpComparison]);
  console.log("\n=== EVENTS OUTSIDE TWO SAMPLES ===\n");
  console.table(outsideTwoSamples);
  console.log("\n=== GROUND TRUTH CANDIDATE TRACE SUMMARY ===\n");
  console.table(
    eventCandidateTraces.map((eventTrace) => eventTrace.summary),
  );
  console.log("\n=== STRUCTURAL REACHABILITY 5B ===\n");
  console.table(
    eventCandidateTraces.flatMap((eventTrace) =>
      eventTrace.candidateJourneys
        .filter(
          (journey) =>
            journey.structuralReachabilityStatus !==
            "REACHABILITY_NOT_APPLICABLE",
        )
        .map((journey) => ({
          eventLabel: eventTrace.row.label,
          candidateId: journey.candidate.candidateId,
          candidateIndex: journey.candidate.index,
          status: journey.structuralReachabilityStatus,
          validPredecessorCount: journey.dpTrace
            ? new Set(
                journey.dpTrace.validPredecessorStateIds,
              ).size
            : 0,
          validIncomingTransitions:
            journey.dpTrace?.incomingTransitionsAccepted ?? 0,
          stateCreated:
            (journey.dpTrace?.statesContainingAsCurrent ?? 0) > 0,
          dominatedStateCount:
            journey.dpTrace?.dominatedStateCount ?? 0,
          maximumDescendantLayer:
            journey.dpTrace?.maximumDescendantLayer ?? null,
          refusalCounts: JSON.stringify(
            journey.dpTrace?.refusalCounts ?? {},
          ),
        })),
    ),
  );
  console.log("\n=== GENERATED ARTIFACTS ===\n");
  console.log(fullPngPath);
  zoomFiles.forEach((file) =>
    console.log(path.join(outputDirectory, file)),
  );
  console.log(reportPath);
  console.log(candidateTraceReportPath);
}

try {
  main();
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`${error.code}: ${error.message}`);
  } else {
    console.error(`DATA_INTEGRITY_ERROR: ${String(error)}`);
  }

  process.exitCode = 1;
}
