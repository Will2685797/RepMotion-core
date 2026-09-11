# C multi-neighbor — opt-in experiment

Call `delayedContextPath(input, { cStrategy: "multi_neighbor" })` explicitly.
Omitting the option, or selecting `legacy`, retains the existing execution.

## Additive integration

A runs without a fallback. In C multi_neighbor, promotion passes an optional
callback into `buildConditionalAlternatives`. Immediately after its real repair
loop, `repairs.length === 0 && !context.limit` invokes the callback synchronously,
with the failed candidate and its exact position. The builder no longer rescans
all targets or repeats admission after C finishes.

Each cycle owns one search session. All callbacks share its existing expansion
and seed limits; a later target never receives a fresh cycle budget. Valid new
local reconstructions join that cycle's audit, with deduplication. Existing
segment extraction and D consume the union. Legacy local selection remains on
its original rows, so its trajectory and all legacy reconstructions are retained.
The new rows are already ranked seeds offered to D, not forced local winners.

The new rows do not feed back into later legacy contexts. If C stops before a
cycle, positions first accessible in that cycle still cannot trigger a fallback.
No guard is bypassed, paused, extended or reset. Unlike the first experiment,
search work now occurs during promotion and is therefore within C's elapsed
wall-clock interval; the timeout value and its checks are unchanged.

## Trigger and bounded search

Promotion considers same-type candidates already in the pool, excluding the
active candidate. A candidate must fail the current structural prefix and obtain
no single-neighbor repair from the actual `buildConditionalAlternatives` call.
A legacy admission guard prevents the callback: it is not proof of zero repairs.
The target-specific builder retains defensive membership/type/prefix checks.

Enumerate contiguous positional windows of lengths 3 and 4 containing the target,
in increasing length/start order. Pin the target and construct the window from
left to right. All other options come from the input pool with the required type.
Keep the outside context unchanged. Require at least three changed positions.

Reject invalid assigned prefixes with `validatePath`, and apply a necessary
minimum-duration bound to reach the fixed target. No structurally invalid prefix
is scored. Completed hypotheses must also validate against the full outside path.

For beam ranking, use the unchanged sequence/promotion scoring functions over
the completed B-T-B triples of the assigned prefix, with the existing criteria
for that number of triples. Before any triple is complete, use signature order
without inventing a score. Full valid seeds use the existing cycle scoring.
No GT, video time, exercise label or dataset identifier enters this module.

## Explicit experimental limits

Defined in `config.ts`, fixed before the comparative dataset runs:

- Maximum window/replacement span: 4, matching the existing maximum local span.
- Beam width: 32 partial hypotheses.
- Retained seeds per target: existing `dynamicTopN` (3).
- Expansion budget per target: 4096.
- Expansion budget per cycle: 65536.
- Retained seeds per cycle: 64.

These are new experimental capacity limits, not changes to legacy guards or
structural rules. Beam truncation, signature tie-breaking and budgets make this
search incomplete. Its retained set is not a guarantee of oracle recovery.

`generated` counts completed window hypotheses before full validation;
`structurallyRejected` includes invalid partial prefixes and full hypotheses;
`retained` counts distinct ranked seeds returned per cycle. `targets` now counts
callback invocations, including those blocked by an already exhausted cycle
budget; this differs from the first post-hoc experiment's started-target count.
Union with the
legacy audit can deduplicate further. Legacy context counters remain legacy-only;
`multiNeighbor` diagnostics report the independent search cost and guards.

## Reproduction

From the repository root:

```powershell
.\tools\calibration-runner\node_modules\.bin\tsx.cmd --test tools/ground-truth/tests/delayed-context-path/regression.test.ts
.\tools\calibration-runner\node_modules\.bin\tsx.cmd --test tools/ground-truth/tests/delayed-context-path/multiNeighbor.test.ts
node tools/ground-truth/compareCStrategies.cjs
```

The comparison runs 007 legacy/multi_neighbor, 009 legacy/multi_neighbor, then
010 legacy/multi_neighbor. It checks natural bootstrap/pool equality, unchanged A,
unchanged legacy C counters and inclusion of every legacy reconstruction. It
writes separate reports with exclusive creation under `output/c-strategy-comparison`.
It exits unsuccessfully if 007 D recovery drops below 10/11; no compensating
change to D or scoring is performed.

For the immediate-fallback experiment, preserve the previous outputs:

```powershell
node tools/ground-truth/traceImmediateFallback.cjs 009
node tools/ground-truth/traceImmediateFallback.cjs 010
node tools/ground-truth/compareCStrategies.cjs immediate-fallback-comparison
```

Target traces deliberately report admission, callback entry, budget blocking and
positional coverage before presenting final winners. Instrumentation lives in
the diagnostic loader, not in production branches keyed to a dataset or index.
