/** PHASE BLOCKS V2 — C-GYRO DESCRIPTIVE. Raw gyro counts only. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { intervalIndices } from "./diagnoseVelocity";
import {
  DATASET_IDS,
  loadValidatedDataset,
  type DatasetId,
  type RawSampleV2,
} from "./diagnoseVelocityV2";

const ROOT = new URL("../../../", import.meta.url);
const OUTPUT = new URL("tools/benchmark/phase-blocks/output/gyro-descriptive/", ROOT);
const A_SUMMARY = new URL("tools/benchmark/phase-blocks/output/velocity-v2-baseline/summary.json", ROOT);
const PROTECTED_OUTPUTS = [
  new URL("tools/benchmark/phase-blocks/output/velocity-v2-baseline/", ROOT),
  new URL("tools/benchmark/phase-blocks/output/velocity-v2-sync-baseline/", ROOT),
  new URL("tools/benchmark/phase-blocks/output/velocity-v2-real-time/", ROOT),
] as const;
const PROTECTED_FILENAMES = ["summary.md", "summary.json", "pivot-results.csv", "phase-results.csv"] as const;
const REPRODUCTION_COMMAND = "node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnoseGyroV2.ts";

export function gyroOutputDirectory(): URL {
  return new URL(OUTPUT.href);
}

type Axis = "GX" | "GY" | "GZ";
type GyroBias = { gx: number; gy: number; gz: number };
export type CorrectedGyroSample = GyroBias & { norm: number };
type NumericStats = { min: number; max: number; mean: number; median: number; rms: number };
type GyroWindowStats = {
  sampleCount: number;
  meanGyroNormRaw: number;
  medianGyroNormRaw: number;
  rmsGyroNormRaw: number;
  maxGyroNormRaw: number;
  rmsGxCorrected: number;
  rmsGyCorrected: number;
  rmsGzCorrected: number;
  dominantAxis: Axis;
};

type APhase = {
  dataset: DatasetId;
  label: string;
  phase: "UP" | "DOWN";
  startSampleFloat: number;
  endSampleFloat: number;
  sampleCount: number;
  expectedSignProportion: number | null;
};
type APivot = {
  dataset: DatasetId;
  label: string;
  type: "BOTTOM" | "TOP";
  rep: number;
  arrivalSampleFloat: number;
  departureSampleFloat: number;
  classification: string;
  signedDistanceToWindowSamples: number | null;
};
type AResult = {
  id: DatasetId;
  datasetSource: { path: string; sha256: string };
  groundTruthSource: { path: string; sha256: string };
  phases: APhase[];
  boundedPivots: APivot[];
  b6: { label: "B6"; arrivalSampleFloat: number; arrivalTimeSeconds: number };
};
type ASummary = { title: string; results: AResult[] };

type PhaseGyroResult = GyroWindowStats & {
  dataset: DatasetId;
  label: string;
  phase: "UP" | "DOWN";
  startSampleFloat: number;
  endSampleFloat: number;
  velocityAExpectedSignProportion: number | null;
  velocityADirectionalError: number | null;
};
type PivotGyroResult = GyroWindowStats & {
  dataset: DatasetId;
  label: string;
  type: "BOTTOM" | "TOP";
  rep: number;
  windowMode: "CLOSED_GT_WINDOW" | "BRACKETING_SAMPLES_AT_ARRIVAL";
  arrivalSampleFloat: number;
  departureSampleFloat: number | null;
  classificationA: string | null;
  signedDistanceAInSamples: number | null;
  absoluteDistanceAInSamples: number | null;
  incomingPhaseLabel: string | null;
  incomingPhaseRmsGyroNormRaw: number | null;
  outgoingPhaseLabel: string | null;
  outgoingPhaseRmsGyroNormRaw: number | null;
};

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function median(values: readonly number[]): number {
  assert.ok(values.length > 0, "Median requires at least one value");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function mean(values: readonly number[]): number {
  assert.ok(values.length > 0, "Mean requires at least one value");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function numericStats(values: readonly number[]): NumericStats {
  assert.ok(values.length > 0, "Statistics require at least one value");
  values.forEach(value => assert.ok(Number.isFinite(value), "Statistics require finite values"));
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: mean(values),
    median: median(values),
    rms: Math.sqrt(mean(values.map(value => value * value))),
  };
}

export function calculateGyroBias(
  samples: readonly RawSampleV2[],
  startSampleInclusive: number,
  endSampleInclusive: number,
): GyroBias {
  assert.ok(Number.isInteger(startSampleInclusive) && Number.isInteger(endSampleInclusive));
  assert.ok(startSampleInclusive >= 0 && endSampleInclusive >= startSampleInclusive && endSampleInclusive < samples.length);
  const baseline = samples.slice(startSampleInclusive, endSampleInclusive + 1);
  return {
    gx: mean(baseline.map(sample => sample.gx)),
    gy: mean(baseline.map(sample => sample.gy)),
    gz: mean(baseline.map(sample => sample.gz)),
  };
}

export function correctGyro(samples: readonly RawSampleV2[], bias: GyroBias): CorrectedGyroSample[] {
  return samples.map((sample, index) => {
    const gx = sample.gx - bias.gx;
    const gy = sample.gy - bias.gy;
    const gz = sample.gz - bias.gz;
    assert.ok([gx, gy, gz].every(Number.isFinite), `Non-finite corrected gyro at sample ${index}`);
    return { gx, gy, gz, norm: Math.sqrt(gx * gx + gy * gy + gz * gz) };
  });
}

export function summarizeGyroWindow(
  corrected: readonly CorrectedGyroSample[],
  indices: readonly number[],
): GyroWindowStats {
  assert.ok(indices.length > 0, "Gyro window must contain at least one discrete sample");
  const selected = indices.map(index => {
    assert.ok(Number.isInteger(index) && index >= 0 && index < corrected.length, `Gyro sample index out of bounds: ${index}`);
    return corrected[index];
  });
  return summarizeCorrectedSamples(selected);
}

function summarizeCorrectedSamples(selected: readonly CorrectedGyroSample[]): GyroWindowStats {
  assert.ok(selected.length > 0, "Gyro statistics require at least one value");
  const gx = numericStats(selected.map(sample => sample.gx));
  const gy = numericStats(selected.map(sample => sample.gy));
  const gz = numericStats(selected.map(sample => sample.gz));
  const norm = numericStats(selected.map(sample => sample.norm));
  const axes: [Axis, number][] = [["GX", gx.rms], ["GY", gy.rms], ["GZ", gz.rms]];
  const dominantAxis = axes.reduce((best, current) => current[1] > best[1] ? current : best)[0];
  return {
    sampleCount: selected.length,
    meanGyroNormRaw: norm.mean,
    medianGyroNormRaw: norm.median,
    rmsGyroNormRaw: norm.rms,
    maxGyroNormRaw: norm.max,
    rmsGxCorrected: gx.rms,
    rmsGyCorrected: gy.rms,
    rmsGzCorrected: gz.rms,
    dominantAxis,
  };
}

export function interpolateCorrectedGyro(
  corrected: readonly CorrectedGyroSample[],
  position: number,
): CorrectedGyroSample {
  assert.ok(Number.isFinite(position) && position >= 0 && position <= corrected.length - 1);
  const left = Math.floor(position);
  const right = Math.ceil(position);
  if (left === right) return { ...corrected[left] };
  const fraction = position - left;
  const gx = corrected[left].gx * (1 - fraction) + corrected[right].gx * fraction;
  const gy = corrected[left].gy * (1 - fraction) + corrected[right].gy * fraction;
  const gz = corrected[left].gz * (1 - fraction) + corrected[right].gz * fraction;
  return { gx, gy, gz, norm: Math.sqrt(gx * gx + gy * gy + gz * gz) };
}

export function summarizeClosedGyroWindow(
  corrected: readonly CorrectedGyroSample[],
  startSampleFloat: number,
  endSampleFloat: number,
): GyroWindowStats {
  assert.ok(Number.isFinite(startSampleFloat) && Number.isFinite(endSampleFloat) && startSampleFloat <= endSampleFloat);
  const positions = [
    startSampleFloat,
    ...intervalIndices(startSampleFloat, endSampleFloat, false),
    ...(endSampleFloat === startSampleFloat ? [] : [endSampleFloat]),
  ];
  return summarizeCorrectedSamples(positions.map(position => interpolateCorrectedGyro(corrected, position)));
}

export function bracketingIndices(position: number, sampleCount: number): number[] {
  assert.ok(Number.isFinite(position) && position >= 0 && position <= sampleCount - 1);
  const left = Math.floor(position);
  const right = Math.ceil(position);
  return left === right ? [left] : [left, right];
}

export function pearsonCorrelation(left: readonly number[], right: readonly number[]): number | null {
  assert.equal(left.length, right.length);
  if (left.length < 2) return null;
  const leftMean = mean(left);
  const rightMean = mean(right);
  let numerator = 0;
  let leftSquares = 0;
  let rightSquares = 0;
  for (let index = 0; index < left.length; index += 1) {
    const l = left[index] - leftMean;
    const r = right[index] - rightMean;
    numerator += l * r;
    leftSquares += l * l;
    rightSquares += r * r;
  }
  const denominator = Math.sqrt(leftSquares * rightSquares);
  return denominator === 0 ? null : numerator / denominator;
}

function snapshotProtectedOutputs(): Map<string, string | null> {
  const snapshot = new Map<string, string | null>();
  for (const directory of PROTECTED_OUTPUTS) {
    for (const filename of PROTECTED_FILENAMES) {
      const url = new URL(filename, directory);
      try {
        snapshot.set(url.href, sha256(readFileSync(url)));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") snapshot.set(url.href, null);
        else throw error;
      }
    }
  }
  return snapshot;
}

function assertProtectedOutputsUnchanged(before: ReadonlyMap<string, string | null>): void {
  const after = snapshotProtectedOutputs();
  for (const [path, hash] of before) assert.equal(after.get(path), hash, `Protected output changed: ${path}`);
}

function loadASummary(): { value: ASummary; sha256: string; path: string } {
  const bytes = readFileSync(A_SUMMARY);
  const value = JSON.parse(bytes.toString("utf8")) as ASummary;
  assert.equal(value.title, "PHASE BLOCKS V2 — BASELINE A — ACCEL ONLY");
  assert.equal(value.results.length, 10);
  return { value, sha256: sha256(bytes), path: "tools/benchmark/phase-blocks/output/velocity-v2-baseline/summary.json" };
}

function wholeCaptureStats(corrected: readonly CorrectedGyroSample[]) {
  const gx = numericStats(corrected.map(sample => sample.gx));
  const gy = numericStats(corrected.map(sample => sample.gy));
  const gz = numericStats(corrected.map(sample => sample.gz));
  const norm = numericStats(corrected.map(sample => sample.norm));
  return {
    minGxCorrected: gx.min, maxGxCorrected: gx.max, rmsGxCorrected: gx.rms,
    minGyCorrected: gy.min, maxGyCorrected: gy.max, rmsGyCorrected: gy.rms,
    minGzCorrected: gz.min, maxGzCorrected: gz.max, rmsGzCorrected: gz.rms,
    meanGyroNormRaw: norm.mean, medianGyroNormRaw: norm.median,
    rmsGyroNormRaw: norm.rms, maxGyroNormRaw: norm.max,
  };
}

function groupSummary<T>(rows: readonly T[], value: (row: T) => number) {
  const values = rows.map(value);
  return { count: values.length, meanRmsGyroNormRaw: values.length ? mean(values) : null, medianRmsGyroNormRaw: values.length ? median(values) : null };
}

function axisCounts(rows: readonly { dominantAxis: Axis }[]): Record<Axis, number> {
  const counts: Record<Axis, number> = { GX: 0, GY: 0, GZ: 0 };
  rows.forEach(row => { counts[row.dominantAxis] += 1; });
  return counts;
}

function buildResults() {
  const aSource = loadASummary();
  const datasetResults = [] as Record<string, unknown>[];
  const phaseResults: PhaseGyroResult[] = [];
  const pivotResults: PivotGyroResult[] = [];

  for (const id of DATASET_IDS) {
    const input = loadValidatedDataset(id);
    const a = aSource.value.results.find(result => result.id === id);
    assert.ok(a, `A result missing for ${id}`);
    assert.equal(a.datasetSource.path, input.datasetSource.path);
    assert.equal(a.datasetSource.sha256, input.datasetSource.sha256, `A capture hash mismatch for ${id}`);
    assert.equal(a.groundTruthSource.path, input.gtSource.path);
    assert.equal(a.groundTruthSource.sha256, input.gtSource.sha256, `A GT hash mismatch for ${id}`);
    assert.equal(a.phases.length, 10);
    assert.equal(a.boundedPivots.length, 10);

    const baseline = input.gtSource.value.sync.baseline;
    const bias = calculateGyroBias(input.datasetSource.value.samples, baseline.startSampleInclusive, baseline.endSampleInclusive);
    const corrected = correctGyro(input.datasetSource.value.samples, bias);
    const baselineIndices = intervalIndices(baseline.startSampleInclusive, baseline.endSampleInclusive, true);
    const baselineStats = summarizeGyroWindow(corrected, baselineIndices);
    const datasetPhases: PhaseGyroResult[] = a.phases.map(phase => {
      const event = input.events.find(candidate => `${candidate.label} -> ${input.events[input.events.indexOf(candidate) + 1]?.label}` === phase.label);
      assert.ok(event, `${id}: phase GT not found for ${phase.label}`);
      const indices = intervalIndices(phase.startSampleFloat, phase.endSampleFloat, false);
      assert.equal(indices.length, phase.sampleCount, `${id}: phase segmentation differs from A at ${phase.label}`);
      return {
        dataset: id, label: phase.label, phase: phase.phase,
        startSampleFloat: phase.startSampleFloat, endSampleFloat: phase.endSampleFloat,
        velocityAExpectedSignProportion: phase.expectedSignProportion,
        velocityADirectionalError: phase.expectedSignProportion === null ? null : 1 - phase.expectedSignProportion,
        ...summarizeGyroWindow(corrected, indices),
      };
    });
    phaseResults.push(...datasetPhases);

    const datasetPivots: PivotGyroResult[] = a.boundedPivots.map((pivot, index) => {
      const event = input.events[index];
      assert.equal(event.label, pivot.label, `${id}: pivot segmentation differs from A`);
      assert.notEqual(event.departure, null);
      const incoming = index > 0 ? datasetPhases[index - 1] : null;
      const outgoing = datasetPhases[index] ?? null;
      return {
        dataset: id, label: pivot.label, type: pivot.type, rep: pivot.rep,
        windowMode: "CLOSED_GT_WINDOW",
        arrivalSampleFloat: pivot.arrivalSampleFloat,
        departureSampleFloat: pivot.departureSampleFloat,
        classificationA: pivot.classification,
        signedDistanceAInSamples: pivot.signedDistanceToWindowSamples,
        absoluteDistanceAInSamples: pivot.signedDistanceToWindowSamples === null ? null : Math.abs(pivot.signedDistanceToWindowSamples),
        incomingPhaseLabel: incoming?.label ?? null,
        incomingPhaseRmsGyroNormRaw: incoming?.rmsGyroNormRaw ?? null,
        outgoingPhaseLabel: outgoing?.label ?? null,
        outgoingPhaseRmsGyroNormRaw: outgoing?.rmsGyroNormRaw ?? null,
        ...summarizeClosedGyroWindow(corrected, event.arrival, event.departure!),
      };
    });
    const b6Event = input.events[input.events.length - 1];
    assert.equal(b6Event.label, "B6");
    const incomingB6 = datasetPhases[datasetPhases.length - 1];
    const b6: PivotGyroResult = {
      dataset: id, label: "B6", type: "BOTTOM", rep: 6,
      windowMode: "BRACKETING_SAMPLES_AT_ARRIVAL",
      arrivalSampleFloat: b6Event.arrival, departureSampleFloat: null,
      classificationA: null, signedDistanceAInSamples: null, absoluteDistanceAInSamples: null,
      incomingPhaseLabel: incomingB6.label,
      incomingPhaseRmsGyroNormRaw: incomingB6.rmsGyroNormRaw,
      outgoingPhaseLabel: null, outgoingPhaseRmsGyroNormRaw: null,
      ...summarizeGyroWindow(corrected, bracketingIndices(b6Event.arrival, corrected.length)),
    };
    pivotResults.push(...datasetPivots, b6);

    const whole = wholeCaptureStats(corrected);
    datasetResults.push({
      dataset: id,
      datasetSource: { path: input.datasetSource.path, sha256: input.datasetSource.sha256 },
      groundTruthSource: { path: input.gtSource.path, sha256: input.gtSource.sha256 },
      baselineStartSampleInclusive: baseline.startSampleInclusive,
      baselineEndSampleInclusive: baseline.endSampleInclusive,
      baselineSampleCount: baseline.endSampleInclusive - baseline.startSampleInclusive + 1,
      baselineMeanGx: bias.gx, baselineMeanGy: bias.gy, baselineMeanGz: bias.gz,
      baselineRmsGyroNormRaw: baselineStats.rmsGyroNormRaw,
      ...whole,
      phaseMeanRmsGyroNormRaw: mean(datasetPhases.map(row => row.rmsGyroNormRaw)),
      pivotMeanRmsGyroNormRaw: mean(datasetPivots.map(row => row.rmsGyroNormRaw)),
      phaseDominantAxisCounts: axisCounts(datasetPhases),
      pivotDominantAxisCounts: axisCounts(datasetPivots),
    });
  }
  return { aSource, datasetResults, phaseResults, pivotResults };
}

function buildAnalysis(phaseResults: readonly PhaseGyroResult[], pivotResults: readonly PivotGyroResult[]) {
  const bounded = pivotResults.filter(row => row.windowMode === "CLOSED_GT_WINDOW");
  const unique = bounded.filter(row => row.classificationA === "UNIQUE_EXPECTED_INSIDE");
  const outside = bounded.filter(row => row.classificationA === "OUTSIDE_BEFORE" || row.classificationA === "OUTSIDE_AFTER");
  const before = bounded.filter(row => row.classificationA === "OUTSIDE_BEFORE");
  const after = bounded.filter(row => row.classificationA === "OUTSIDE_AFTER");
  const correctPhases = phaseResults.filter(row => row.velocityAExpectedSignProportion !== null && row.velocityAExpectedSignProportion >= 0.5);
  const incorrectPhases = phaseResults.filter(row => row.velocityAExpectedSignProportion !== null && row.velocityAExpectedSignProportion < 0.5);
  const distanceRows = bounded.filter(row => row.absoluteDistanceAInSamples !== null);
  const scoreRows = phaseResults.filter(row => row.velocityADirectionalError !== null);
  return {
    pivotGroups: {
      UNIQUE_EXPECTED_INSIDE: groupSummary(unique, row => row.rmsGyroNormRaw),
      OUTSIDE: groupSummary(outside, row => row.rmsGyroNormRaw),
      OUTSIDE_BEFORE: groupSummary(before, row => row.rmsGyroNormRaw),
      OUTSIDE_AFTER: groupSummary(after, row => row.rmsGyroNormRaw),
    },
    phaseGroups: {
      MAJORITY_SIGN_CORRECT: groupSummary(correctPhases, row => row.rmsGyroNormRaw),
      MAJORITY_SIGN_INCORRECT: groupSummary(incorrectPhases, row => row.rmsGyroNormRaw),
      splitDefinition: "expectedSignProportion >= 0.5 versus < 0.5; fixed descriptive split, not optimized",
    },
    correlations: {
      pivotRmsVsAbsoluteCrossingError: {
        n: distanceRows.length,
        pearsonR: pearsonCorrelation(distanceRows.map(row => row.rmsGyroNormRaw), distanceRows.map(row => row.absoluteDistanceAInSamples!)),
      },
      phaseRmsVsVelocityDirectionalError: {
        n: scoreRows.length,
        pearsonR: pearsonCorrelation(scoreRows.map(row => row.rmsGyroNormRaw), scoreRows.map(row => row.velocityADirectionalError!)),
      },
      interpretation: "descriptive Pearson correlations only; no causal claim",
    },
    phaseOverall: groupSummary(phaseResults, row => row.rmsGyroNormRaw),
    pivotOverall: groupSummary(bounded, row => row.rmsGyroNormRaw),
    phaseDominantAxisCounts: axisCounts(phaseResults),
    pivotDominantAxisCounts: axisCounts(bounded),
  };
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(rows: readonly Record<string, unknown>[]): string {
  assert.ok(rows.length > 0);
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\n") + "\n";
}

function f(value: number | null, digits = 3): string {
  return value === null ? "N/D" : value.toFixed(digits);
}

function table(headers: readonly string[], rows: readonly (string | number)[][]): string {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map(row => `| ${row.join(" | ")} |`)].join("\n");
}

function buildMarkdown(
  datasetResults: readonly Record<string, unknown>[],
  phaseResults: readonly PhaseGyroResult[],
  pivotResults: readonly PivotGyroResult[],
  analysis: ReturnType<typeof buildAnalysis>,
  aSource: { path: string; sha256: string },
): string {
  const bounded = pivotResults.filter(row => row.windowMode === "CLOSED_GT_WINDOW");
  const ranked = [...datasetResults].sort((a, b) => Number(b.rmsGyroNormRaw) - Number(a.rmsGyroNormRaw));
  const phaseByDataset = DATASET_IDS.flatMap(id => (["UP", "DOWN"] as const).map(phase => {
    const rows = phaseResults.filter(row => row.dataset === id && row.phase === phase);
    return [id, phase, f(mean(rows.map(row => row.rmsGyroNormRaw))), JSON.stringify(axisCounts(rows))] as (string | number)[];
  }));
  const pivotByDataset = DATASET_IDS.flatMap(id => (["BOTTOM", "TOP"] as const).map(type => {
    const rows = bounded.filter(row => row.dataset === id && row.type === type);
    return [id, type, f(mean(rows.map(row => row.rmsGyroNormRaw))), JSON.stringify(axisCounts(rows))] as (string | number)[];
  }));
  const datasetRatios = datasetResults.map(row => Number(row.phaseMeanRmsGyroNormRaw) / Number(row.baselineRmsGyroNormRaw));
  const phaseVsPivot = datasetResults.map(row => Number(row.phaseMeanRmsGyroNormRaw) - Number(row.pivotMeanRmsGyroNormRaw));
  const phaseHigher = phaseVsPivot.filter(value => value > 0).length;
  const pivotHigher = phaseVsPivot.filter(value => value < 0).length;
  return [
    "# PHASE BLOCKS V2 — C-GYRO DESCRIPTIVE", "",
    "Analyse descriptive des raw counts gyroscope pour 011–020.", "",
    "- gyro raw counts only ;",
    "- bias soustrait depuis `GT.sync.baseline` ;",
    "- aucune conversion physique gyro ;",
    "- aucune estimation d'orientation ;",
    "- aucune compensation de gravité ;",
    "- aucune modification ou réintégration de velocity A ;",
    "- aucune optimisation de seuil ;",
    "- GT utilisée uniquement pour segmentation/évaluation.", "",
    "Les pivots fermés sont évalués aux bornes interpolées et aux samples entiers strictement internes, ce qui couvre aussi les fenêtres sub-sample sans les élargir. B6 utilise uniquement le ou les samples qui encadrent `arrivalSampleFloat`; aucune fenêtre de fin n'est inventée.", "",
    "## Gyro par dataset", "",
    table(
      ["Dataset", "Bias gx/gy/gz", "RMS gx/gy/gz", "Norm mean", "Norm median", "Norm RMS", "Norm max", "RMS phase", "RMS pivot"],
      datasetResults.map(row => [
        String(row.dataset),
        `${f(Number(row.baselineMeanGx), 2)} / ${f(Number(row.baselineMeanGy), 2)} / ${f(Number(row.baselineMeanGz), 2)}`,
        `${f(Number(row.rmsGxCorrected))} / ${f(Number(row.rmsGyCorrected))} / ${f(Number(row.rmsGzCorrected))}`,
        f(Number(row.meanGyroNormRaw)), f(Number(row.medianGyroNormRaw)),
        f(Number(row.rmsGyroNormRaw)), f(Number(row.maxGyroNormRaw)),
        f(Number(row.phaseMeanRmsGyroNormRaw)), f(Number(row.pivotMeanRmsGyroNormRaw)),
      ])), "",
    "Les minima/maxima corrigés par axe sont disponibles dans `dataset-results.csv` et `summary.json`.", "",
    "## Résumé par phase", "",
    table(["Dataset", "Phase", "RMS norm moyen", "Axes dominants GX/GY/GZ"], phaseByDataset), "",
    "Les 100 fenêtres détaillées figurent dans `phase-gyro-results.csv`.", "",
    "## Résumé par pivot", "",
    table(["Dataset", "Pivot", "RMS norm moyen", "Axes dominants GX/GY/GZ"], pivotByDataset), "",
    "Les 100 pivots bornés et les 10 B6 figurent dans `pivot-gyro-results.csv`.", "",
    "## Croisement avec velocity A", "",
    table(
      ["Groupe pivot A", "n", "Mean gyro RMS", "Median gyro RMS"],
      Object.entries(analysis.pivotGroups).map(([name, value]) => [name, value.count, f(value.meanRmsGyroNormRaw), f(value.medianRmsGyroNormRaw)]),
    ), "",
    table(
      ["Groupe phase A", "n", "Mean gyro RMS", "Median gyro RMS"],
      [
        ["Signe attendu majoritaire (>=50%)", analysis.phaseGroups.MAJORITY_SIGN_CORRECT.count, f(analysis.phaseGroups.MAJORITY_SIGN_CORRECT.meanRmsGyroNormRaw), f(analysis.phaseGroups.MAJORITY_SIGN_CORRECT.medianRmsGyroNormRaw)],
        ["Signe attendu minoritaire (<50%)", analysis.phaseGroups.MAJORITY_SIGN_INCORRECT.count, f(analysis.phaseGroups.MAJORITY_SIGN_INCORRECT.meanRmsGyroNormRaw), f(analysis.phaseGroups.MAJORITY_SIGN_INCORRECT.medianRmsGyroNormRaw)],
      ]), "",
    "## Corrélations descriptives", "",
    `- gyro RMS pivot vs erreur absolue de crossing A : **r=${f(analysis.correlations.pivotRmsVsAbsoluteCrossingError.pearsonR, 4)}**, n=${analysis.correlations.pivotRmsVsAbsoluteCrossingError.n} ;`,
    `- gyro RMS phase vs erreur directionnelle A \`1-score\` : **r=${f(analysis.correlations.phaseRmsVsVelocityDirectionalError.pearsonR, 4)}**, n=${analysis.correlations.phaseRmsVsVelocityDirectionalError.n}.`, "",
    "Corrélations de Pearson descriptives uniquement ; aucune causalité n'est affirmée.", "",
    "## Réponses factuelles", "",
    `1. Le gyro n'est pas plat pendant les mouvements : le RMS de phase dépasse le RMS de baseline par un facteur médian de **${f(median(datasetRatios), 2)}** sur les dix datasets. L'activité est nette dans toutes les captures, mais sa reproductibilité d'amplitude n'est pas uniforme entre datasets.`, "",
    `2. Axes dominants sur les 100 phases : **GX=${analysis.phaseDominantAxisCounts.GX}, GY=${analysis.phaseDominantAxisCounts.GY}, GZ=${analysis.phaseDominantAxisCounts.GZ}**. Sur les 100 pivots : **GX=${analysis.pivotDominantAxisCounts.GX}, GY=${analysis.pivotDominantAxisCounts.GY}, GZ=${analysis.pivotDominantAxisCounts.GZ}**. Ce comptage ne donne aucune orientation physique.`, "",
    `3. Le RMS moyen est plus élevé en phase dans **${phaseHigher}/10** datasets et plus élevé aux pivots dans **${pivotHigher}/10** datasets ; la relation varie donc selon le dataset. Globalement : phases **${f(analysis.phaseOverall.meanRmsGyroNormRaw)}**, pivots **${f(analysis.pivotOverall.meanRmsGyroNormRaw)}** raw counts RMS.`, "",
    `4. Aucune association monotone nette n'apparaît entre forte activité gyro et grosse erreur A : pivots corrects **${f(analysis.pivotGroups.UNIQUE_EXPECTED_INSIDE.meanRmsGyroNormRaw)}** (n=${analysis.pivotGroups.UNIQUE_EXPECTED_INSIDE.count}), pivots hors fenêtre **${f(analysis.pivotGroups.OUTSIDE.meanRmsGyroNormRaw)}** (n=${analysis.pivotGroups.OUTSIDE.count}), corrélation RMS/erreur absolue **${f(analysis.correlations.pivotRmsVsAbsoluteCrossingError.pearsonR, 4)}**.`, "",
    `5. L'association est **faible et non démontrée** dans ces données : r pivot=${f(analysis.correlations.pivotRmsVsAbsoluteCrossingError.pearsonR, 4)}, r phase=${f(analysis.correlations.phaseRmsVsVelocityDirectionalError.pearsonR, 4)}, et le groupe de pivots correctement classés ne contient qu'un cas. Aucune causalité n'est affirmée.`, "",
    `6. Les comportements diffèrent : RMS norm capture le plus élevé **${ranked[0].dataset}=${f(Number(ranked[0].rmsGyroNormRaw))}**, le plus faible **${ranked[ranked.length - 1].dataset}=${f(Number(ranked[ranked.length - 1].rmsGyroNormRaw))}**.`, "",
    "## Graphiques", "",
    "Aucun graphique n'est produit : les artefacts A existants ne persistent pas la trace velocity complète, et cette expérience ne la recalcule pas.", "",
    "## Reproductibilité", "",
    `- source A : \`${aSource.path}\`, SHA-256 \`${aSource.sha256}\` ;`,
    `- commande : \`${REPRODUCTION_COMMAND}\` ;`,
    "- les chemins et SHA-256 des captures/GT figurent dans `summary.json` et `dataset-results.csv`.", "",
  ].join("\n");
}

export function buildGyroDescriptiveResults() {
  const built = buildResults();
  assert.equal(built.phaseResults.length, 100);
  assert.equal(built.pivotResults.filter(row => row.windowMode === "CLOSED_GT_WINDOW").length, 100);
  assert.equal(built.pivotResults.filter(row => row.windowMode === "BRACKETING_SAMPLES_AT_ARRIVAL").length, 10);
  const analysis = buildAnalysis(built.phaseResults, built.pivotResults);
  return { ...built, analysis };
}

export function main(): void {
  const protectedSnapshot = snapshotProtectedOutputs();
  const { aSource, datasetResults, phaseResults, pivotResults, analysis } = buildGyroDescriptiveResults();
  const summary = {
    title: "PHASE BLOCKS V2 — C-GYRO DESCRIPTIVE",
    configuration: {
      gyroUnit: "raw counts",
      biasWindow: "GT.sync.baseline inclusive",
      physicalGyroConversion: false,
      orientationEstimation: false,
      gravityCompensation: false,
      velocityModifiedOrRecomputed: false,
      thresholdOptimization: false,
      groundTruthUse: "segmentation and evaluation only",
      boundedPivotSampling: "linearly interpolated closed bounds plus strictly internal integer samples",
      b6Window: "floor/ceil samples bracketing arrivalSampleFloat only",
    },
    sourceA: { path: aSource.path, sha256: aSource.sha256 },
    datasets: datasetResults,
    phases: phaseResults,
    pivots: pivotResults,
    analysis,
  };
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(new URL("summary.json", OUTPUT), JSON.stringify(summary, null, 2) + "\n");
  writeFileSync(new URL("summary.md", OUTPUT), buildMarkdown(datasetResults, phaseResults, pivotResults, analysis, aSource));
  writeFileSync(new URL("dataset-results.csv", OUTPUT), csv(datasetResults));
  writeFileSync(new URL("phase-gyro-results.csv", OUTPUT), csv(phaseResults));
  writeFileSync(new URL("pivot-gyro-results.csv", OUTPUT), csv(pivotResults));
  assertProtectedOutputsUnchanged(protectedSnapshot);
  console.log(JSON.stringify({ output: fileURLToPath(OUTPUT), datasetResults, analysis }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
