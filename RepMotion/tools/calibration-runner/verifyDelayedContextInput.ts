import { deepStrictEqual, ok } from "node:assert";
import { readFileSync } from "node:fs";
import { calculateCalibration, type CalibrationDataset } from "../../mobile/RepMotion/analytics/calibration";
import { prepareDelayedContextInput } from "../../mobile/RepMotion/analytics/prepareDelayedContextInput";
import { delayedContextPath } from "../../mobile/RepMotion/analytics/delayed-context-path/delayedContextPath";

// Real IMU fixture only. No Ground Truth imports, injection or synthetic candidates.
const dataset: CalibrationDataset = JSON.parse(readFileSync(
  new URL("../../datasets/calibration/rowing/rowing_5reps_007.json", import.meta.url), "utf8"));
const before = calculateCalibration(dataset.samples);
deepStrictEqual(before, calculateCalibration(dataset.samples, undefined, { selectionStrategy: "current_filters" }));
const direct = calculateCalibration(dataset.samples, undefined, { selectionStrategy: "global_alternating_path" });
const prepared = prepareDelayedContextInput(dataset.samples);
deepStrictEqual(prepared.calibration, direct);
deepStrictEqual(prepared.input.candidatePool.map(({ type, index, value }) => ({ type, index, value })),
  direct.debug!.rawCandidateDebugEvents.map(({ type, index, value }) => ({ type, index, value })));
deepStrictEqual(prepared.input.selectedDpV1Chain.map(({ type, index }) => ({ type, index })), direct.debug!.selectedChain);
deepStrictEqual(prepared.input.values, dataset.samples.map(sample => sample[direct.axis]));
for (const candidate of prepared.input.selectedDpV1Chain) ok(prepared.input.candidatePool.some(raw => raw === candidate));
const result = delayedContextPath(prepared.input);
deepStrictEqual(result.initialPath, prepared.input.selectedDpV1Chain);
const directPool = direct.debug!.rawCandidateDebugEvents.map(({ type, index, value }) => ({
  candidateId: `RAW_${type}_${index}`, type, index, value,
}));
const directResult = delayedContextPath({
  candidatePool: directPool,
  selectedDpV1Chain: direct.debug!.selectedChain!.map(pivot =>
    directPool.find(candidate => candidate.type === pivot.type && candidate.index === pivot.index)!),
  values: dataset.samples.map(sample => sample[direct.axis]),
});
// Timing is observational, not deterministic; preserve all counters, guards and ordering.
const snapshot = (value: unknown): unknown => {
  if (value instanceof Map) return [...value].map(([key, entry]) => [key, snapshot(entry)]);
  if (value instanceof Set) return [...value].map(snapshot);
  if (Array.isArray(value)) return value.map(snapshot);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["started", "progressiveStarted", "elapsedMs"].includes(key))
    .map(([key, entry]) => [key, snapshot(entry)]));
  return value;
};
deepStrictEqual(snapshot(result), snapshot(directResult));
deepStrictEqual(calculateCalibration(dataset.samples), before);
console.log(JSON.stringify({ status: "PASS", axis: direct.axis, raw: prepared.input.candidatePool.length,
  bootstrap: result.initialPath.map(c => `${c.type}:${c.index}`).join("|"),
  final: result.finalPath?.map(c => `${c.type}:${c.index}`).join("|") ?? null,
  segments: result.extractedSegments.segments.length, guard: result.composition.context.guard,
  systemALimit: result.systemA.context.limit, systemCLimit: result.systemC.context.limit }, null, 2));
