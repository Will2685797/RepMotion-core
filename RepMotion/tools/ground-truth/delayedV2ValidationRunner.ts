import { windowOracle, traceWindowOracle } from "./windowOracle";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { historical007Input, historicalParameters } from "./historical007Input";
import { assertOracleInput, auditInjectedCandidates } from "./auditInjectedCandidates";
import { prepareDelayedContextInput } from "../../mobile/RepMotion/analytics/prepareDelayedContextInput";
import { delayedContextPath } from "../../mobile/RepMotion/analytics/delayed-context-path/delayedContextPath";
import type { CalibrationDataset } from "../../mobile/RepMotion/analytics/calibration";

type Pivot = { type: string; index: number };
type Event = { type: string; rep: number; arrivalSampleFloat: number; departureSampleFloat: number | null };
type GT = { annotationVersion: number; dataset: string; samplingRateHz: number; events: Event[] };
const root = new URL("../../", import.meta.url);
const read = (relative: string) => readFileSync(new URL(relative, root), "utf8").replace(/^\uFEFF/, "");
const clean = (n: number) => Number(n.toFixed(10)); // Remove binary arithmetic noise, no tolerance.
function structure(path: Pivot[] | null) {
  const rows = path ?? [];
  const typesIncorrect = rows.flatMap((p, i) => p.type === (i % 2 ? "TOP" : "BOTTOM") ? [] : [i]);
  const chronological = rows.every((p, i) => Number.isInteger(p.index) && (i === 0 || p.index > rows[i - 1].index));
  return {
    signature: rows.map(p => `${p.type}:${p.index}`).join("|"),
    totalEvents: rows.length, bottoms: rows.filter(p => p.type === "BOTTOM").length,
    tops: rows.filter(p => p.type === "TOP").length,
    perfectAlternation: rows.length > 0 && typesIncorrect.length === 0,
    completeReps: rows.filter((p, i) => p.type === "BOTTOM" && rows[i + 1]?.type === "TOP" && rows[i + 2]?.type === "BOTTOM").length,
    missingEvents: Math.max(0, 11 - rows.length), extraEvents: Math.max(0, rows.length - 11),
    incorrectTypePositions: typesIncorrect, chronological,
    valid: rows.length === 11 && typesIncorrect.length === 0 && chronological,
  };
}
function evaluate(path: Pivot[] | null, gt: GT) {
  const shape = structure(path);
  if (!shape.valid || !path) return { structure: shape, events: null, b6: null, summary: null };
  const events = gt.events.slice(0, 10).map((e, i) => {
    const predicted = path[i].index, arrival = e.arrivalSampleFloat, departure = e.departureSampleFloat!;
    const insideZone = arrival <= predicted && predicted <= departure;
    const zoneErrorSamples = clean(insideZone ? 0 : Math.min(Math.abs(predicted - arrival), Math.abs(predicted - departure)));
    return { event: `${e.type === "BOTTOM" ? "B" : "T"}${e.rep}`, arrival, departure, predicted,
      insideZone, zoneErrorSamples, zoneErrorMs: clean(zoneErrorSamples / gt.samplingRateHz * 1000) };
  });
  const signedErrorSamples = clean(path[10].index - gt.events[10].arrivalSampleFloat);
  const b6 = { event: "B6", arrival: gt.events[10].arrivalSampleFloat, predicted: path[10].index,
    signedErrorSamples, absoluteErrorSamples: Math.abs(signedErrorSamples),
    absoluteErrorMs: clean(Math.abs(signedErrorSamples) / gt.samplingRateHz * 1000) };
  const errors = events.map(e => e.zoneErrorSamples).sort((a, b) => a - b);
  const summary = { insideZoneCount: events.filter(e => e.insideZone).length, completeZoneCount: 10,
    meanZoneErrorSamples: clean(errors.reduce((a, b) => a + b, 0) / 10),
    medianZoneErrorSamples: clean((errors[4] + errors[5]) / 2), maxZoneErrorSamples: errors[9],
    b6AbsoluteErrorSamples: b6.absoluteErrorSamples, b6AbsoluteErrorMs: b6.absoluteErrorMs };
  return { structure: shape, events, b6, summary };
}
type Protocol = "segmented_007_style_window_oracle_diagnostic" | "full" | "segmented" | "segmented_gt_injected_diagnostic" | "segmented_007_style" | "segmented_007_style_gt_injected_diagnostic";
function run(id: string, protocol: Protocol) {
  const name = `rowing_5reps_${id}.json`;
  const datasetText = read(`datasets/calibration/rowing/${name}`);
  const dataset: CalibrationDataset = JSON.parse(datasetText);
  // Experimental sync boundaries supplied by the user, independent of rep GT.
  const syncBoundaries: Record<string, number> = { "009": 174, "010": 177 };
  const analysisStartSample = protocol !== "full" ? syncBoundaries[id] : 0;
  if (!Number.isInteger(analysisStartSample) || analysisStartSample < 0 ||
      analysisStartSample >= dataset.samples.length) throw new Error("INVALID_ANALYSIS_START");
  const analysisSamples = dataset.samples.slice(analysisStartSample);
  const historical = protocol.startsWith("segmented_007_style");
  const { calibration, input } = historical ? historical007Input(analysisSamples) : prepareDelayedContextInput(analysisSamples);
  const windowMode = protocol === "segmented_007_style_window_oracle_diagnostic";
  const injected = windowMode || protocol.endsWith("gt_injected_diagnostic");
  const gtFile = `datasets/ground-truth/rowing_5reps_${id}.v2.json`;
  const oracleText = injected ? read(gtFile) : null;
  const rawCount = input.candidatePool.length;
  const pool = [...input.candidatePool];
  const windows = windowMode ? windowOracle((JSON.parse(oracleText!) as GT).events, analysisStartSample, input.values) : null;
  const windowCandidates = windows?.groups.flatMap(g => g.candidates.map(c => {
    const existing = pool.some(n => n.type === c.type && n.index === c.index);
    if (!existing) pool.push(c);
    const index = c.index + analysisStartSample;
    return { event: g.event, type: c.type, arrival: g.arrivalSampleFloat, departure: g.departureSampleFloat,
      oracleCandidateSample: index, oracleCandidateLocalSample: c.index, naturallyPresent: existing,
      oracleCandidateAvailable: false, approximatedBecauseSamplingResolution: g.approximatedBecauseSamplingResolution,
      oracleCandidateInsideZone: g.departureSampleFloat === null ? null : index >= g.arrivalSampleFloat && index <= g.departureSampleFloat,
      oracleDistanceToZoneSamples: g.departureSampleFloat === null ? null : clean(Math.max(g.arrivalSampleFloat-index,0,index-g.departureSampleFloat)),
      oracleAbsoluteErrorToArrivalSamples: g.departureSampleFloat === null ? clean(Math.abs(index-g.arrivalSampleFloat)) : null };
  }));
  const oracleCandidates = windowCandidates ?? (oracleText ? (JSON.parse(oracleText) as GT).events.map((e, position) => {
    const arrival = e.arrivalSampleFloat, departure = e.departureSampleFloat;
    const distance = (index: number) => clean(departure === null ? Math.abs(index - arrival) :
      Math.max(arrival - index, 0, index - departure));
    const first = Math.ceil(Math.max(arrival, analysisStartSample));
    // V2 oracle convention approved by the user; integers restricted to retained IMU.
    const index = departure === null ? Math.max(analysisStartSample, Math.round(arrival)) :
      first <= departure ? first : Array.from({ length: analysisSamples.length }, (_, i) => i + analysisStartSample)
        .sort((a, b) => distance(a) - distance(b) || a - b)[0];
    if (!Number.isInteger(index) || index < analysisStartSample || index >= dataset.samples.length ||
        !["BOTTOM", "TOP"].includes(e.type)) throw new Error("INVALID_ORACLE_CANDIDATE");
    const localIndex = index - analysisStartSample;
    const existing = pool.find(c => c.type === e.type && c.index === localIndex);
    if (!existing) pool.push({ candidateId: `TOP_K_GT_${position + 1}_${e.type}_${localIndex}`,
      type: e.type as "BOTTOM" | "TOP", index: localIndex, value: dataset.samples[index][calibration.axis] });
    return { event: `${e.type === "BOTTOM" ? "B" : "T"}${e.rep}`, arrival, departure,
      oracleCandidateSample: index, oracleCandidateLocalSample: localIndex,
      naturallyPresent: Boolean(existing), oracleCandidateAvailable: pool.some(c => c.type === e.type && c.index === localIndex),
      oracleCandidateInsideZone: departure === null ? null : arrival <= index && index <= departure,
      oracleDistanceToZoneSamples: departure === null ? null : distance(index),
      oracleAbsoluteErrorToArrivalSamples: departure === null ? distance(index) : null };
  }) : []);
  // Historical harness ordering; no changes to bootstrap, values or production code.
  if (injected) pool.sort((a, b) => a.index - b.index || a.type.localeCompare(b.type) || a.candidateId.localeCompare(b.candidateId));
  // Historical A/C/D harness neutralizes all IDs after injection, preserving pool order.
  const executionPool = historical && injected ? pool.map(c => ({ ...c, candidateId: `EXPERIMENTAL_${c.type}_${c.index}` })) : pool;
  const executionInput = injected ? { ...input, candidatePool: executionPool } : input;
  const oracleTargets = windows ? windows.groups.flatMap(g => g.candidates) : oracleCandidates.map((c, i) => ({ type: i % 2 ? "TOP" as const : "BOTTOM" as const,
    index: c.oracleCandidateLocalSample, candidateId: "audit-target", value: input.values[c.oracleCandidateLocalSample] }));
  if (injected) assertOracleInput(executionInput, oracleTargets);
  if (windows) {
    for (const c of windowCandidates!) c.oracleCandidateAvailable = executionInput.candidatePool.some(n => n.type === c.type && n.index === c.oracleCandidateLocalSample);
    console.table(windowCandidates);
    console.log("PRE-DELAYED STRUCTURAL EXISTENCE", windows.existence.exists ? "YES" : "NO", windows.existence);
  }
  const result = delayedContextPath(executionInput);
  if (process.env.ORACLE_AUDIT === "1" && injected && !windowMode) auditInjectedCandidates(id, executionInput, oracleTargets, result, analysisStartSample);
  const toOriginal = (path: Pivot[]) => path.map(p => ({ ...p, index: p.index + analysisStartSample }));
  const bootstrapPath = toOriginal(input.selectedDpV1Chain);
  const finalPath = result.finalPath === null ? null : toOriginal(result.finalPath);
  // Natural protocols first access GT here. Oracle protocol intentionally reads it earlier.
  const gtText = oracleText ?? read(gtFile);
  const gt: GT = JSON.parse(gtText);
  if (gt.annotationVersion !== 2 || gt.dataset !== name || gt.samplingRateHz !== dataset.samplingRateHz ||
      gt.events.length !== 11 || !Number.isFinite(gt.samplingRateHz) || gt.samplingRateHz <= 0 ||
      gt.events.some((e, i) => e.type !== (i % 2 ? "TOP" : "BOTTOM") || e.rep !== Math.floor(i / 2) + 1 ||
        !Number.isFinite(e.arrivalSampleFloat) || e.arrivalSampleFloat < 0 || e.arrivalSampleFloat >= dataset.samples.length ||
        (i === 10 ? e.departureSampleFloat !== null :
          e.departureSampleFloat === null || !Number.isFinite(e.departureSampleFloat) ||
          e.departureSampleFloat < e.arrivalSampleFloat || e.departureSampleFloat >= dataset.samples.length) ||
        (i > 0 && e.arrivalSampleFloat < gt.events[i - 1].departureSampleFloat!))) throw new Error("INVALID_GT_V2");
  const bootstrap = evaluate(bootstrapPath, gt), delayed = evaluate(finalPath, gt);
  const delta = bootstrap.summary && delayed.summary ? Object.fromEntries(
    Object.keys(bootstrap.summary).filter(key => key !== "completeZoneCount").map(key => {
      const k = key as keyof typeof bootstrap.summary;
      return [key, clean(delayed.summary![k] - bootstrap.summary![k])];
    })) : null;
  const report = { dataset: name, axis: calibration.axis, calibrationIsValid: calibration.isValid,
    protocol, predictionIndexSpace: "original",
    calibrationParameters: historical ? historicalParameters : "production defaults",
    candidatePopulation: historical ? "admissible DIRECTION_CHANGE kept" : "RAW",
    oracleInjection: injected ? { label: "TEST ORACLE ONLY", convention: windows ? "All retained integers inside each window; if no integer, all nearest retained integers including ties. B6: nearest retained integer(s) to arrival. Real IMU values. Natural bootstrap unchanged." : "First retained integer inside window; otherwise nearest retained integer to window, ties to smaller index. B6: Math.round(arrival), constrained to retained samples. Real IMU value; reuse type/index; historical pool sort.",
      poolBefore: rawCount, poolAfter: pool.length, alreadyPresent: oracleCandidates.filter(c => c.naturallyPresent).length,
      added: pool.length - rawCount, bootstrapUnchanged: true, candidates: oracleCandidates } : null,
    windowOracle: windows ? { ...windows, trace: traceWindowOracle(windows, result, analysisStartSample) } : null,
    segmentation: { analysisStartSample, analysisStartTimeSeconds: analysisStartSample / dataset.samplingRateHz,
      removedSampleCount: analysisStartSample, segmentationUsesRepGroundTruth: false,
      reason: protocol !== "full" ? "Artificial synchronization gesture removed before analysis. Boundary selected from post-sync IMU return-to-baseline inspection, not from repetition Ground Truth." : "Full signal; no samples removed." },
    localPaths: { bootstrap: input.selectedDpV1Chain, delayed: result.finalPath },
    samplingRateHz: dataset.samplingRateHz, rawCandidateCount: input.candidatePool.length,
    provenance: { gtInjection: injected ? "TEST ORACLE ONLY" : "NONE", syntheticCandidates: injected ? "GT ORACLE CANDIDATES WITH REAL IMU VALUES" : "NONE", datasetSpecificPatch: "NONE", gtLoadedOnlyAfterDelayed: !injected,
      datasetSha256: createHash("sha256").update(datasetText).digest("hex"), gtSha256: createHash("sha256").update(gtText).digest("hex") },
    bootstrap, delayed, deltaDelayedMinusBootstrap: delta,
    structureChanged: JSON.stringify({ ...bootstrap.structure, signature: undefined }) !==
      JSON.stringify({ ...delayed.structure, signature: undefined }),
    diagnostics: { systemA: result.systemA.context, systemC: result.systemC.context, compositionD: result.composition.context,
      aSegments: result.extractedSegments.aSegments.length, cOnlySegments: result.extractedSegments.cOnlySegments.length,
      unionSegments: result.extractedSegments.segments.length, uniquePaths: result.composition.uniquePaths.size },
  };
  const directory = new URL("tools/ground-truth/output/delayed-v2/", root);
  mkdirSync(directory, { recursive: true });
  const destination = new URL(`rowing_5reps_${id}${protocol === "full" ? "" : `.${protocol}`}${process.env.ORACLE_AUDIT === "1" ? ".audit-run" : ""}.json`, directory);
  writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
  for (const [label, evaluation] of [["BOOTSTRAP", bootstrap], ["DELAYED", delayed]] as const) {
    console.log(id, label, evaluation.structure);
    if (evaluation.events) console.table(evaluation.events);
    if (evaluation.b6) console.table([evaluation.b6]);
    console.log(evaluation.summary);
  }
  console.log("DELAYED - BOOTSTRAP", delta);
  console.log("GUARDS", { A: result.systemA.context.limit, AProgressive: result.systemA.context.progressiveGuard,
    C: result.systemC.context.limit, CProgressive: result.systemC.context.progressiveGuard, D: result.composition.context.guard });
  console.log("REPORT", fileURLToPath(destination));
}
const args = process.argv.slice(2);
if (![2, 4].includes(args.length) || args[0] !== "--dataset" || !["009", "010", "all"].includes(args[1]) ||
    (args.length === 4 && (args[2] !== "--protocol" || !["segmented_007_style_window_oracle_diagnostic", "full", "segmented", "segmented_gt_injected_diagnostic", "segmented_007_style", "segmented_007_style_gt_injected_diagnostic"].includes(args[3])))) {
  throw new Error("Usage: delayedV2ValidationRunner.ts --dataset 009|010|all [--protocol full|segmented]");
}
const protocol = (args[3] ?? "full") as Protocol;
for (const id of args[1] === "all" ? ["009", "010"] : [args[1]]) {
  try { run(id, protocol); } catch (error) { console.error(`DATASET ${id} FAILED`, error); process.exitCode = 1; }
}
