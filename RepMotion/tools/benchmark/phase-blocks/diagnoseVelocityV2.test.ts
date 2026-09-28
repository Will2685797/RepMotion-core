import { test } from "node:test";
import assert from "node:assert/strict";
import {
  baselineWindowFor,
  buildBaselineResults,
  buildComparison,
  buildGlobalAggregate,
  buildTimeComparison,
  classifyBoundedPivot,
  experimentConfiguration,
  intervalSecondsFromTimestamps,
  outputDirectoryFor,
  signedDistanceToWindow,
  unsignedTimestampDeltaMs,
  type CrossingDirection,
  type CrossingRecord,
} from "./diagnoseVelocityV2";

function crossing(
  startSampleFloat: number,
  direction: CrossingDirection,
  endSampleFloat = startSampleFloat,
): CrossingRecord {
  return {
    leftIndex: Math.floor(startSampleFloat),
    rightIndex: Math.ceil(endSampleFloat),
    velocityBefore: direction === "NEG_TO_POS" ? -1 : 1,
    velocityAfter: direction === "NEG_TO_POS" ? 1 : -1,
    startSampleFloat,
    endSampleFloat,
    crossingSampleFloat: startSampleFloat,
    direction,
    location: startSampleFloat === endSampleFloat ? "LINEAR_INTERPOLATION" : "EXACT_ZERO_SAMPLE",
    zeroIndices: [],
  };
}

test("signed distance uses the nearest window boundary and preserves side", () => {
  assert.equal(signedDistanceToWindow(crossing(8, "NEG_TO_POS"), 10, 12), -2);
  assert.equal(signedDistanceToWindow(crossing(15, "NEG_TO_POS"), 10, 12), 3);
  assert.equal(signedDistanceToWindow(crossing(9, "NEG_TO_POS", 10), 10, 12), 0);
});

test("bounded pivot classification covers expected, ambiguous, wrong, outside, and absent cases", () => {
  const expected = "NEG_TO_POS" as const;
  assert.equal(classifyBoundedPivot(expected, 10, 12, [crossing(11, expected)]).classification, "UNIQUE_EXPECTED_INSIDE");
  assert.equal(classifyBoundedPivot(expected, 10, 12, [crossing(10.5, expected), crossing(11.5, "POS_TO_NEG")]).classification, "MULTIPLE_OR_AMBIGUOUS");
  assert.equal(classifyBoundedPivot(expected, 10, 12, [crossing(11, "POS_TO_NEG")]).classification, "WRONG_DIRECTION_INSIDE");
  assert.equal(classifyBoundedPivot(expected, 10, 12, [crossing(8, expected)]).classification, "OUTSIDE_BEFORE");
  assert.equal(classifyBoundedPivot(expected, 10, 12, [crossing(15, expected)]).classification, "OUTSIDE_AFTER");
  assert.equal(classifyBoundedPivot(expected, 10, 12, []).classification, "NO_CROSSING");
});

test("zero intervals intersect transition windows without using their midpoint", () => {
  const result = classifyBoundedPivot("NEG_TO_POS", 10, 12, [crossing(9, "NEG_TO_POS", 10)]);
  assert.equal(result.classification, "UNIQUE_EXPECTED_INSIDE");
  assert.equal(result.signedDistanceToWindowSamples, 0);
});

test("011-020 validate as 110 alternating events with ten unclassified B6 records", () => {
  const results = buildBaselineResults();
  assert.equal(results.length, 10);
  assert.equal(results.flatMap(result => result.boundedPivots).length, 100);
  assert.equal(results.flatMap(result => result.phases).length, 100);
  for (const result of results) {
    assert.equal(result.boundedPivots.length, 10);
    result.boundedPivots.forEach((pivot, index) => {
      assert.equal(pivot.type, index % 2 === 0 ? "BOTTOM" : "TOP");
      assert.equal(pivot.rep, Math.floor(index / 2) + 1);
      assert.ok(pivot.departureSampleFloat >= pivot.arrivalSampleFloat);
    });
    assert.equal(result.b6.label, "B6");
    assert.equal(result.b6.rep, 6);
    assert.equal(result.b6.incomingPhase, "DOWN");
  }
});

test("global aggregation exposes micro and macro results without counting B6 as windows", () => {
  const results = buildBaselineResults();
  const global = buildGlobalAggregate(results);
  assert.equal(global.boundedWindowCount, 100);
  assert.equal(global.b6Count, 10);
  assert.equal(Object.values(global.categoryCounts).reduce((sum, value) => sum + value, 0), 100);
  assert.equal(global.b6.length, 10);
  for (const group of [global.micro, global.macro]) {
    assert.ok(group.upDirectionalScore >= 0 && group.upDirectionalScore <= 1);
    assert.ok(group.downDirectionalScore >= 0 && group.downDirectionalScore <= 1);
    assert.ok(group.balancedDirectionalScore >= 0 && group.balancedDirectionalScore <= 1);
  }
});

test("inclusive GT sync baselines convert to semi-open preparation windows", () => {
  assert.deepEqual(
    baselineWindowFor("sync", { startSampleInclusive: 336, endSampleInclusive: 355 }),
    { startIndex: 336, endIndex: 356 },
  );
});

test("A keeps [0,100) while A-baseline uses each dataset GT baseline", () => {
  const fixed = buildBaselineResults("fixed");
  const sync = buildBaselineResults("sync");
  for (let index = 0; index < fixed.length; index += 1) {
    assert.deepEqual(fixed[index].baselineWindow, {
      source: "FIXED_[0,100)",
      startSampleInclusive: 0,
      endSampleInclusive: 99,
      endSampleExclusive: 100,
      sampleCount: 100,
    });
    assert.equal(sync[index].baselineWindow.source, "GT_SYNC_BASELINE");
    assert.equal(sync[index].baselineWindow.endSampleExclusive, sync[index].baselineWindow.endSampleInclusive + 1);
    assert.equal(
      sync[index].baselineWindow.sampleCount,
      sync[index].baselineWindow.endSampleInclusive - sync[index].baselineWindow.startSampleInclusive + 1,
    );
  }
  assert.ok(sync.some(result => result.baselineWindow.startSampleInclusive !== 0));
});

test("the baseline window is the only preparation and integration configuration difference", () => {
  const syncBaseline = { startSampleInclusive: 336, endSampleInclusive: 355 };
  const fixed = experimentConfiguration("fixed", syncBaseline);
  const sync = experimentConfiguration("sync", syncBaseline);
  const { baselineWindow: fixedWindow, ...fixedShared } = fixed;
  const { baselineWindow: syncWindow, ...syncShared } = sync;
  assert.deepEqual(fixedWindow, { startIndex: 0, endIndex: 100 });
  assert.deepEqual(syncWindow, { startIndex: 336, endIndex: 356 });
  assert.deepEqual(syncShared, fixedShared);
});

test("A-baseline comparison retains 100 bounded windows and separate output directories", () => {
  const fixed = buildBaselineResults("fixed");
  const sync = buildBaselineResults("sync");
  const comparison = buildComparison(fixed, sync);
  assert.equal(comparison.perDataset.length, 10);
  assert.equal(Object.values(comparison.global.categoryCounts).reduce((sum, value) => sum + value.A, 0), 100);
  assert.equal(Object.values(comparison.global.categoryCounts).reduce((sum, value) => sum + value.A_baseline, 0), 100);
  assert.notEqual(outputDirectoryFor("fixed").href, outputDirectoryFor("sync").href);
  assert.match(outputDirectoryFor("fixed").pathname, /velocity-v2-baseline\/$/);
  assert.match(outputDirectoryFor("sync").pathname, /velocity-v2-sync-baseline\/$/);
});

test("real timestamp dt handles ordinary intervals and uint32 wrap", () => {
  assert.equal(unsignedTimestampDeltaMs(1050, 1000), 50);
  assert.equal(unsignedTimestampDeltaMs(24, 0xffff_ffe6), 50);
  assert.deepEqual(intervalSecondsFromTimestamps([1000, 1050, 1101]), [0.05, 0.051]);
  assert.throws(() => unsignedTimestampDeltaMs(1000, 1000), /strictly positive/);
});

test("B-time changes only the integration clock and keeps A baseline [0,100)", () => {
  const syncBaseline = { startSampleInclusive: 336, endSampleInclusive: 355 };
  const fixed = experimentConfiguration("fixed", syncBaseline);
  const time = experimentConfiguration("time", syncBaseline);
  const { timestampMsUsedForIntegration: fixedUsesTimestamps, ...fixedShared } = fixed;
  const { timestampMsUsedForIntegration: timeUsesTimestamps, ...timeShared } = time;
  assert.equal(fixedUsesTimestamps, false);
  assert.equal(timeUsesTimestamps, true);
  assert.deepEqual(timeShared, fixedShared);
  assert.deepEqual(time.baselineWindow, { startIndex: 0, endIndex: 100 });
});

test("B-time uses real timestamp intervals for every dataset and keeps outputs isolated", () => {
  const fixed = buildBaselineResults("fixed");
  const time = buildBaselineResults("time");
  const comparison = buildTimeComparison(fixed, time);
  assert.equal(comparison.perDataset.length, 10);
  for (const result of time) {
    assert.deepEqual(result.baselineWindow, {
      source: "FIXED_[0,100)",
      startSampleInclusive: 0,
      endSampleInclusive: 99,
      endSampleExclusive: 100,
      sampleCount: 100,
    });
    assert.notEqual(result.timing, null);
    assert.equal(result.timing!.intervalCount, result.sampleCount - 1);
    assert.ok(result.timing!.minDtSeconds > 0);
    assert.equal(
      result.timing!.actualDurationSeconds - result.timing!.theoreticalDurationSeconds,
      result.timing!.cumulativeDifferenceSeconds,
    );
  }
  const outputs = ["fixed", "sync", "time"].map(variant => outputDirectoryFor(variant as "fixed" | "sync" | "time").href);
  assert.equal(new Set(outputs).size, 3);
  assert.match(outputDirectoryFor("time").pathname, /velocity-v2-real-time\/$/);
});
