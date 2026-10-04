import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { applyAccelerometerCalibration } from "../../../mobile/RepMotion/analytics/imu/accelerometerCalibration";
import { applyGyroBias, estimateGyroBias } from "../../../mobile/RepMotion/analytics/imu/gyroBias";
import { normalizeImuSample } from "../../../mobile/RepMotion/analytics/imu/normalizeImuSample";
import type { AccelerometerCalibration, SensorScaleConfig } from "../../../mobile/RepMotion/analytics/imu/types";
import {
  buildPhaseBlocksV1,
  type PhaseBlock,
  type PhaseBlockConfig,
  type PhaseBlockPhase,
} from "../../../mobile/RepMotion/analytics/kinematics/buildPhaseBlocksV1";
import { correctVelocityDrift } from "../../../mobile/RepMotion/analytics/kinematics/correctVelocityDrift";
import { createZeroVelocityAnchors } from "../../../mobile/RepMotion/analytics/kinematics/createZeroVelocityAnchors";
import {
  detectQuasiStaticIntervals,
  type QuasiStaticConfig,
  type QuasiStaticSample,
} from "../../../mobile/RepMotion/analytics/kinematics/detectQuasiStaticIntervals";
import {
  integrateVelocity1D,
  type VelocitySample1D,
} from "../../../mobile/RepMotion/analytics/kinematics/integrateVelocity1D";
import { computeLinearAccelerationWorld } from "../../../mobile/RepMotion/analytics/orientation/gravityCompensation";
import { estimateInitialOrientationFromAccel } from "../../../mobile/RepMotion/analytics/orientation/initialOrientation";
import { createMahony6Axis } from "../../../mobile/RepMotion/analytics/orientation/mahony6Axis";
import type { ImuSampleV2 } from "../../../mobile/RepMotion/types/imu";

const DATASET_IDS = [
  "011", "012", "013", "014", "015",
  "016", "017", "018", "019", "020",
] as const;
type DatasetId = (typeof DATASET_IDS)[number];

const STATIC_WINDOWS: Record<DatasetId, readonly [number, number]> = {
  "011": [13, 32], "012": [25, 44], "013": [35, 54], "014": [73, 92],
  "015": [42, 61], "016": [114, 133], "017": [94, 113], "018": [629, 646],
  "019": [113, 132], "020": [91, 110],
};

const SENSOR_SCALE_CONFIG: SensorScaleConfig = {
  accelCountsPerG: 16_384,
  gyroCountsPerDegPerSec: 131,
};
const ACCELEROMETER_CALIBRATION: AccelerometerCalibration = {
  biasMps2: { x: 0.494509751, y: 0.047544765, z: 1.084472007 },
  scale: { x: 1.000833116, y: 0.993389137, z: 0.979272511 },
};
const MAHONY_CONFIG = { kp: 1, ki: 0 } as const;
const INITIAL_STATIC_SAMPLE_COUNT = 10;
const QUASI_STATIC_CONFIG: QuasiStaticConfig = {
  maxLinearAccelerationMps2: 0.20,
  maxGyroRadPerSec: 0.01,
  minimumDurationMs: 200,
  maximumSampleGapMs: 100,
  dynamicContext: {
    windowDurationMs: 1_000,
    minLinearAccelerationRmsMps2: 0.90,
    minGyroRmsRadPerSec: 0.010,
  },
};
const MAXIMUM_PHASE_SAMPLE_GAP_MS = 100;
const ENTER_VELOCITIES_MPS = [0.03, 0.05, 0.08, 0.10, 0.15, 0.20, 0.30] as const;
const EXIT_RATIOS = [0.25, 0.50, 0.75] as const;
const MINIMUM_STATE_DURATIONS_MS = [100, 150, 200, 250, 300, 400, 500] as const;
const STABLE_ZONE_SCORE_TOLERANCE = 0.01;

type DatasetV2 = {
  schemaVersion: 2;
  sensorDataUnit: "raw_counts";
  sampleCount: number;
  samples: ImuSampleV2[];
};
type GroundTruthEvent = {
  type: "BOTTOM" | "TOP";
  rep: number;
  arrivalSampleFloat: number;
  departureSampleFloat: number | null;
};
type GroundTruthV2 = {
  annotationVersion: 2;
  performedReps: 5;
  events: GroundTruthEvent[];
};
type EvaluationPhase = PhaseBlockPhase;
type GroundTruthMovementBlock = {
  phase: "UP" | "DOWN";
  startArrayIndex: number;
  endArrayIndex: number;
};
type IndexedPhaseBlock = {
  phase: EvaluationPhase;
  startArrayIndex: number;
  endArrayIndex: number;
};
type ConfusionMatrix = Record<EvaluationPhase, Record<EvaluationPhase, number>>;

type PreparedDataset = {
  id: DatasetId;
  velocity: VelocitySample1D[];
  groundTruthLabels: Array<EvaluationPhase | null>;
  groundTruthMovementBlocks: GroundTruthMovementBlock[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  )) as T;
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationStandardDeviation(values: readonly number[]): number {
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function percentile(values: readonly number[], probability: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower] +
    (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction;
}

function buildCorrectedVelocity(id: DatasetId, dataset: DatasetV2): VelocitySample1D[] {
  const normalizedAndCalibrated = dataset.samples.map((sample) =>
    applyAccelerometerCalibration(
      normalizeImuSample(sample, SENSOR_SCALE_CONFIG),
      ACCELEROMETER_CALIBRATION,
    ),
  );
  const [staticStart, staticEnd] = STATIC_WINDOWS[id];
  const gyroBias = estimateGyroBias(
    normalizedAndCalibrated.slice(staticStart, staticEnd + 1),
  );
  const gyroCorrected = normalizedAndCalibrated.map((sample) =>
    applyGyroBias(sample, gyroBias),
  );
  const initialQuaternion = estimateInitialOrientationFromAccel(
    gyroCorrected.slice(0, INITIAL_STATIC_SAMPLE_COUNT),
  );
  const mahony = createMahony6Axis(MAHONY_CONFIG, initialQuaternion);
  const quasiStaticSamples: QuasiStaticSample[] = [];
  const acceleration = gyroCorrected.map((sample) => {
    const linearAccelerationWorldMps2 = computeLinearAccelerationWorld(
      sample.accelMps2,
      mahony.update(sample),
    );
    quasiStaticSamples.push({
      linearAccelerationWorldMps2,
      gyroRadPerSec: { ...sample.gyroRadPerSec },
      timestampMs: sample.timestampMs,
      sampleIndex: sample.sampleIndex,
    });
    return {
      accelerationMps2: linearAccelerationWorldMps2.z,
      timestampMs: sample.timestampMs,
      sampleIndex: sample.sampleIndex,
    };
  });
  const rawVelocity = integrateVelocity1D(acceleration);
  const intervals = detectQuasiStaticIntervals(quasiStaticSamples, QUASI_STATIC_CONFIG);
  return correctVelocityDrift(rawVelocity, createZeroVelocityAnchors(intervals));
}

function buildGroundTruth(
  sampleCount: number,
  groundTruth: GroundTruthV2,
): {
  labels: Array<EvaluationPhase | null>;
  movementBlocks: GroundTruthMovementBlock[];
} {
  const labels = Array<EvaluationPhase | null>(sampleCount).fill(null);
  const movementBlocks: GroundTruthMovementBlock[] = [];
  groundTruth.events.forEach((event, eventIndex) => {
    const holdStart = Math.ceil(event.arrivalSampleFloat);
    const holdEnd = event.departureSampleFloat === null
      ? sampleCount - 1
      : Math.floor(event.departureSampleFloat);
    for (let index = holdStart; index <= holdEnd; index += 1) {
      labels[index] = "TRANSITION_OR_UNKNOWN";
    }

    const next = groundTruth.events[eventIndex + 1];
    if (event.departureSampleFloat === null || next === undefined) return;
    const startArrayIndex = Math.floor(event.departureSampleFloat) + 1;
    const endArrayIndex = Math.ceil(next.arrivalSampleFloat) - 1;
    const phase = event.type === "BOTTOM" ? "UP" as const : "DOWN" as const;
    movementBlocks.push({ phase, startArrayIndex, endArrayIndex });
    for (let index = startArrayIndex; index <= endArrayIndex; index += 1) {
      labels[index] = phase;
    }
  });
  return { labels, movementBlocks };
}

function prepareDataset(id: DatasetId): PreparedDataset {
  const dataset = readJson<DatasetV2>(
    `datasets/calibration/rowing/rowing_5reps_${id}.json`,
  );
  const groundTruth = readJson<GroundTruthV2>(
    `datasets/ground-truth/rowing_5reps_${id}.v2.json`,
  );
  if (
    dataset.schemaVersion !== 2 ||
    dataset.sensorDataUnit !== "raw_counts" ||
    dataset.sampleCount !== dataset.samples.length
  ) throw new Error(`${id}: invalid raw-counts V2 dataset.`);
  if (
    groundTruth.annotationVersion !== 2 ||
    groundTruth.performedReps !== 5 ||
    groundTruth.events.length !== 11
  ) throw new Error(`${id}: invalid Ground Truth V2.`);

  const velocity = buildCorrectedVelocity(id, dataset);
  const { labels, movementBlocks } = buildGroundTruth(velocity.length, groundTruth);
  return {
    id,
    velocity,
    groundTruthLabels: labels,
    groundTruthMovementBlocks: movementBlocks,
  };
}

function emptyConfusionMatrix(): ConfusionMatrix {
  return {
    UP: { UP: 0, DOWN: 0, TRANSITION_OR_UNKNOWN: 0 },
    DOWN: { UP: 0, DOWN: 0, TRANSITION_OR_UNKNOWN: 0 },
    TRANSITION_OR_UNKNOWN: { UP: 0, DOWN: 0, TRANSITION_OR_UNKNOWN: 0 },
  };
}

const EVALUATION_PHASES: readonly EvaluationPhase[] = [
  "UP", "DOWN", "TRANSITION_OR_UNKNOWN",
];

function addConfusion(target: ConfusionMatrix, source: ConfusionMatrix): void {
  EVALUATION_PHASES.forEach((actual) => {
    EVALUATION_PHASES.forEach((predicted) => {
      target[actual][predicted] += source[actual][predicted];
    });
  });
}

function metricsFromConfusion(confusion: ConfusionMatrix) {
  const perPhase = Object.fromEntries(EVALUATION_PHASES.map((phase) => {
    const truePositive = confusion[phase][phase];
    const actualCount = EVALUATION_PHASES.reduce(
      (sum, predicted) => sum + confusion[phase][predicted],
      0,
    );
    const predictedCount = EVALUATION_PHASES.reduce(
      (sum, actual) => sum + confusion[actual][phase],
      0,
    );
    const precision = predictedCount === 0 ? 0 : truePositive / predictedCount;
    const recall = actualCount === 0 ? 0 : truePositive / actualCount;
    const f1 = precision + recall === 0
      ? 0
      : 2 * precision * recall / (precision + recall);
    return [phase, { precision, recall, f1, actualCount, predictedCount }];
  })) as Record<EvaluationPhase, {
    precision: number;
    recall: number;
    f1: number;
    actualCount: number;
    predictedCount: number;
  }>;
  const evaluatedSampleCount = EVALUATION_PHASES.reduce(
    (sum, actual) => sum + EVALUATION_PHASES.reduce(
      (rowSum, predicted) => rowSum + confusion[actual][predicted],
      0,
    ),
    0,
  );
  const correctSampleCount = EVALUATION_PHASES.reduce(
    (sum, phase) => sum + confusion[phase][phase],
    0,
  );
  return {
    confusion,
    perPhase,
    accuracy: correctSampleCount / evaluatedSampleCount,
    macroF1: mean(EVALUATION_PHASES.map((phase) => perPhase[phase].f1)),
    directionalMacroF1: mean([perPhase.UP.f1, perPhase.DOWN.f1]),
    unknownCoverage: perPhase.TRANSITION_OR_UNKNOWN.predictedCount / evaluatedSampleCount,
    evaluatedSampleCount,
  };
}

function labelsFromBlocks(
  sampleCount: number,
  blocks: readonly Readonly<IndexedPhaseBlock>[],
): EvaluationPhase[] {
  const labels = Array<EvaluationPhase>(sampleCount).fill("TRANSITION_OR_UNKNOWN");
  blocks.forEach((block) => {
    for (let index = block.startArrayIndex; index <= block.endArrayIndex; index += 1) {
      labels[index] = block.phase;
    }
  });
  return labels;
}

function blocksFromLabels(
  labels: readonly EvaluationPhase[],
  velocity: readonly Readonly<VelocitySample1D>[],
): IndexedPhaseBlock[] {
  if (labels.length === 0) return [];
  const blocks: IndexedPhaseBlock[] = [];
  let startArrayIndex = 0;
  for (let index = 1; index < labels.length; index += 1) {
    const hasGap =
      velocity[index].timestampMs - velocity[index - 1].timestampMs >
      MAXIMUM_PHASE_SAMPLE_GAP_MS;
    if (hasGap || labels[index] !== labels[startArrayIndex]) {
      blocks.push({
        phase: labels[startArrayIndex],
        startArrayIndex,
        endArrayIndex: index - 1,
      });
      startArrayIndex = index;
    }
  }
  blocks.push({
    phase: labels[startArrayIndex],
    startArrayIndex,
    endArrayIndex: labels.length - 1,
  });
  return blocks;
}

function overlapSampleCount(
  left: Pick<IndexedPhaseBlock, "startArrayIndex" | "endArrayIndex">,
  right: Pick<IndexedPhaseBlock, "startArrayIndex" | "endArrayIndex">,
): number {
  return Math.max(
    0,
    Math.min(left.endArrayIndex, right.endArrayIndex) -
      Math.max(left.startArrayIndex, right.startArrayIndex) + 1,
  );
}

function evaluateDataset(
  dataset: PreparedDataset,
  predictedBlocks: readonly Readonly<IndexedPhaseBlock>[],
) {
  const predictedLabels = labelsFromBlocks(dataset.velocity.length, predictedBlocks);
  const confusion = emptyConfusionMatrix();
  dataset.groundTruthLabels.forEach((actual, index) => {
    if (actual !== null) confusion[actual][predictedLabels[index]] += 1;
  });

  let fragmentedGroundTruthBlockCount = 0;
  let fragmentationExtraBlockCount = 0;
  let missedGroundTruthBlockCount = 0;
  const matchedPredictedDirectionalBlocks = new Set<number>();
  const boundaryErrorsMs: number[] = [];
  dataset.groundTruthMovementBlocks.forEach((groundTruthBlock) => {
    const matches = predictedBlocks.flatMap((block, predictedIndex) =>
      block.phase === groundTruthBlock.phase &&
      overlapSampleCount(block, groundTruthBlock) > 0
        ? [{ block, predictedIndex }]
        : [],
    );
    matches.forEach(({ predictedIndex }) => {
      matchedPredictedDirectionalBlocks.add(predictedIndex);
    });
    if (matches.length === 0) {
      missedGroundTruthBlockCount += 1;
      return;
    }
    if (matches.length > 1) {
      fragmentedGroundTruthBlockCount += 1;
      fragmentationExtraBlockCount += matches.length - 1;
    }
    const bestMatch = matches.reduce((best, current) =>
      overlapSampleCount(current.block, groundTruthBlock) >
      overlapSampleCount(best.block, groundTruthBlock)
        ? current
        : best,
    );
    boundaryErrorsMs.push(Math.abs(
      dataset.velocity[bestMatch.block.startArrayIndex].timestampMs -
      dataset.velocity[groundTruthBlock.startArrayIndex].timestampMs,
    ));
    boundaryErrorsMs.push(Math.abs(
      dataset.velocity[bestMatch.block.endArrayIndex].timestampMs -
      dataset.velocity[groundTruthBlock.endArrayIndex].timestampMs,
    ));
  });
  const directionalBlocks = predictedBlocks.flatMap((block, index) =>
    block.phase === "TRANSITION_OR_UNKNOWN" ? [] : [{ block, index }],
  );
  const unmatchedDirectionalBlockCount = directionalBlocks.filter(
    ({ index }) => !matchedPredictedDirectionalBlocks.has(index),
  ).length;
  const classification = metricsFromConfusion(confusion);
  return {
    id: dataset.id,
    ...classification,
    predictedBlockCount: predictedBlocks.length,
    predictedDirectionalBlockCount: directionalBlocks.length,
    groundTruthMovementBlockCount: dataset.groundTruthMovementBlocks.length,
    fragmentedGroundTruthBlockCount,
    fragmentationExtraBlockCount,
    missedGroundTruthBlockCount,
    unmatchedDirectionalBlockCount,
    falseChangeCount: fragmentationExtraBlockCount + unmatchedDirectionalBlockCount,
    boundaryErrorMs: {
      matchedBoundaryCount: boundaryErrorsMs.length,
      mean: boundaryErrorsMs.length === 0 ? 0 : mean(boundaryErrorsMs),
      median: percentile(boundaryErrorsMs, 0.5),
      p95: percentile(boundaryErrorsMs, 0.95),
      values: boundaryErrorsMs,
    },
  };
}

type DatasetEvaluation = ReturnType<typeof evaluateDataset>;

function aggregateEvaluations(evaluations: readonly DatasetEvaluation[]) {
  const confusion = emptyConfusionMatrix();
  evaluations.forEach((evaluation) => addConfusion(confusion, evaluation.confusion));
  const global = metricsFromConfusion(confusion);
  const datasetScores = evaluations.map((evaluation) => evaluation.macroF1);
  const boundaryErrorsMs = evaluations.flatMap(
    (evaluation) => evaluation.boundaryErrorMs.values,
  );
  return {
    global,
    meanDatasetMacroF1: mean(datasetScores),
    worstDatasetMacroF1: Math.min(...datasetScores),
    bestDatasetMacroF1: Math.max(...datasetScores),
    interDatasetMacroF1StandardDeviation: populationStandardDeviation(datasetScores),
    predictedBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.predictedBlockCount,
      0,
    ),
    predictedDirectionalBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.predictedDirectionalBlockCount,
      0,
    ),
    fragmentedGroundTruthBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.fragmentedGroundTruthBlockCount,
      0,
    ),
    fragmentationExtraBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.fragmentationExtraBlockCount,
      0,
    ),
    missedGroundTruthBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.missedGroundTruthBlockCount,
      0,
    ),
    unmatchedDirectionalBlockCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.unmatchedDirectionalBlockCount,
      0,
    ),
    falseChangeCount: evaluations.reduce(
      (sum, evaluation) => sum + evaluation.falseChangeCount,
      0,
    ),
    boundaryErrorMs: {
      matchedBoundaryCount: boundaryErrorsMs.length,
      mean: mean(boundaryErrorsMs),
      median: percentile(boundaryErrorsMs, 0.5),
      p95: percentile(boundaryErrorsMs, 0.95),
    },
  };
}

function compactDatasetEvaluation(evaluation: DatasetEvaluation) {
  const { values: _values, ...boundaryErrorMs } = evaluation.boundaryErrorMs;
  return {
    id: evaluation.id,
    accuracy: evaluation.accuracy,
    macroF1: evaluation.macroF1,
    directionalMacroF1: evaluation.directionalMacroF1,
    unknownCoverage: evaluation.unknownCoverage,
    perPhase: evaluation.perPhase,
    confusion: evaluation.confusion,
    predictedBlockCount: evaluation.predictedBlockCount,
    predictedDirectionalBlockCount: evaluation.predictedDirectionalBlockCount,
    fragmentedGroundTruthBlockCount: evaluation.fragmentedGroundTruthBlockCount,
    fragmentationExtraBlockCount: evaluation.fragmentationExtraBlockCount,
    missedGroundTruthBlockCount: evaluation.missedGroundTruthBlockCount,
    unmatchedDirectionalBlockCount: evaluation.unmatchedDirectionalBlockCount,
    falseChangeCount: evaluation.falseChangeCount,
    boundaryErrorMs,
  };
}

function evaluateConfig(
  datasets: readonly PreparedDataset[],
  config: PhaseBlockConfig,
) {
  const datasetEvaluations = datasets.map((dataset) => evaluateDataset(
    dataset,
    buildPhaseBlocksV1(dataset.velocity, config),
  ));
  return { config, aggregate: aggregateEvaluations(datasetEvaluations), datasetEvaluations };
}

function evaluateSignBaseline(datasets: readonly PreparedDataset[]) {
  const datasetEvaluations = datasets.map((dataset) => {
    const labels = dataset.velocity.map((sample): EvaluationPhase => {
      if (sample.velocityMps > 0) return "UP";
      if (sample.velocityMps < 0) return "DOWN";
      return "TRANSITION_OR_UNKNOWN";
    });
    return evaluateDataset(dataset, blocksFromLabels(labels, dataset.velocity));
  });
  return { aggregate: aggregateEvaluations(datasetEvaluations), datasetEvaluations };
}

type ConfigEvaluation = ReturnType<typeof evaluateConfig>;

function compactConfigEvaluation(evaluation: ConfigEvaluation) {
  return { config: evaluation.config, ...evaluation.aggregate };
}

function compareRobustness(left: ConfigEvaluation, right: ConfigEvaluation): number {
  const meanDifference = right.aggregate.meanDatasetMacroF1 -
    left.aggregate.meanDatasetMacroF1;
  if (Math.abs(meanDifference) > 1e-12) return meanDifference;
  const worstDifference = right.aggregate.worstDatasetMacroF1 -
    left.aggregate.worstDatasetMacroF1;
  if (Math.abs(worstDifference) > 1e-12) return worstDifference;
  const deviationDifference = left.aggregate.interDatasetMacroF1StandardDeviation -
    right.aggregate.interDatasetMacroF1StandardDeviation;
  if (Math.abs(deviationDifference) > 1e-12) return deviationDifference;
  return left.aggregate.fragmentationExtraBlockCount -
    right.aggregate.fragmentationExtraBlockCount;
}

const datasets = DATASET_IDS.map(prepareDataset);
const signBaseline = evaluateSignBaseline(datasets);
const sweep = ENTER_VELOCITIES_MPS.flatMap((enterVelocityMps) =>
  EXIT_RATIOS.flatMap((exitRatio) =>
    MINIMUM_STATE_DURATIONS_MS.map((minimumStateDurationMs) => evaluateConfig(
      datasets,
      {
        enterVelocityMps,
        exitVelocityMps: enterVelocityMps * exitRatio,
        minimumStateDurationMs,
        maximumSampleGapMs: MAXIMUM_PHASE_SAMPLE_GAP_MS,
      },
    )),
  ),
);
const ranked = [...sweep].sort(compareRobustness);
const bestMeanScore = ranked[0].aggregate.meanDatasetMacroF1;
const stableZone = ranked.filter((evaluation) =>
  evaluation.aggregate.meanDatasetMacroF1 >=
    bestMeanScore - STABLE_ZONE_SCORE_TOLERANCE,
);
const recommended = [...stableZone].sort((left, right) => {
  const worstDifference = right.aggregate.worstDatasetMacroF1 -
    left.aggregate.worstDatasetMacroF1;
  if (Math.abs(worstDifference) > 1e-12) return worstDifference;
  const deviationDifference = left.aggregate.interDatasetMacroF1StandardDeviation -
    right.aggregate.interDatasetMacroF1StandardDeviation;
  if (Math.abs(deviationDifference) > 1e-12) return deviationDifference;
  const fragmentationDifference = left.aggregate.fragmentationExtraBlockCount -
    right.aggregate.fragmentationExtraBlockCount;
  if (fragmentationDifference !== 0) return fragmentationDifference;
  return compareRobustness(left, right);
})[0];

console.log(JSON.stringify({
  controls: {
    datasets: DATASET_IDS,
    pipeline: [
      "normalizeImuSample",
      "applyAccelerometerCalibration",
      "estimateGyroBias/applyGyroBias",
      "estimateInitialOrientationFromAccel",
      "createMahony6Axis",
      "computeLinearAccelerationWorld.z",
      "integrateVelocity1D",
      "detectQuasiStaticIntervals(dynamicContext RMS)",
      "createZeroVelocityAnchors",
      "correctVelocityDrift",
      "buildPhaseBlocksV1",
    ],
    sensorScale: SENSOR_SCALE_CONFIG,
    accelerometerCalibration: ACCELEROMETER_CALIBRATION,
    mahony: MAHONY_CONFIG,
    quasiStatic: QUASI_STATIC_CONFIG,
    phaseMaximumSampleGapMs: MAXIMUM_PHASE_SAMPLE_GAP_MS,
    sweep: {
      enterVelocityMps: ENTER_VELOCITIES_MPS,
      exitRatios: EXIT_RATIOS,
      minimumStateDurationMs: MINIMUM_STATE_DURATIONS_MS,
      combinationCount: sweep.length,
    },
    evaluation: {
      groundTruthUsage: "evaluation only; never passed to buildPhaseBlocksV1 or the velocity pipeline",
      globalScore: "macro-F1 over UP, DOWN, and TRANSITION_OR_UNKNOWN",
      stableZone: `mean dataset macro-F1 within ${STABLE_ZONE_SCORE_TOLERANCE} of the best mean`,
      recommendedSelection: "highest worst-dataset macro-F1 in stable zone, then lowest inter-dataset standard deviation, then least fragmentation",
      transitionGroundTruth: "annotated BOTTOM/TOP holds, including the final hold; pre-B1 samples excluded",
      falseChange: "extra same-phase fragments plus directional predicted blocks with no same-phase GT overlap",
    },
  },
  signBaseline: {
    ...signBaseline.aggregate,
    datasets: signBaseline.datasetEvaluations.map(compactDatasetEvaluation),
  },
  sweep: {
    configurationCount: sweep.length,
    top10: ranked.slice(0, 10).map(compactConfigEvaluation),
    stableZoneCount: stableZone.length,
    stableZone: stableZone.map(compactConfigEvaluation),
    recommended: {
      ...compactConfigEvaluation(recommended),
      datasets: recommended.datasetEvaluations.map(compactDatasetEvaluation),
    },
    allConfigurations: sweep.map(compactConfigEvaluation),
  },
}, null, 2));
