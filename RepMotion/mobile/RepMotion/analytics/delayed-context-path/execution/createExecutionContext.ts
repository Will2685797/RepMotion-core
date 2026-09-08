import type { DelayedExecutionContext } from "./types";

export function createExecutionContext(): DelayedExecutionContext {
  const maxStates = Number(
    process.env.DELAYED_CONTEXT_MAX_STATES ?? "100000",
  );
  const maxSegments = Number(
    process.env.DELAYED_CONTEXT_MAX_SEGMENTS ?? "20000",
  );
  const maxAlternatives = Number(
    process.env.DELAYED_CONTEXT_MAX_ALTERNATIVES ?? "1000",
  );
  const timeoutMs = Number(
    process.env.DELAYED_CONTEXT_TIMEOUT_MS ?? "30000",
  );
  const started = performance.now();
  const progressiveStarted = performance.now();

  return {
    started,
    states: 0,
    rawEvaluated: 0,
    promotedCount: 0,
    maxPromising: 0,
    maxConditional: 0,
    conditionalStates: 0,
    decisions: 0,
    backtracking: 0,
    decisionConflicts: 0,
    segmentsReconstructed: 0,
    validSegments: 0,
    maxStates,
    maxAlternatives,
    maxSegments,
    timeoutMs,
    limit: null,
    coupledGenerated: 0,
    coupledValid: 0,
    progressiveStarted,
    progressiveStates: 0,
    progressiveGenerated: 0,
    progressiveValid: 0,
    progressiveScored: 0,
    progressivePruned: 0,
    progressiveMaxStates: 100_000,
    progressiveTimeoutMs: 30_000,
    progressiveGuard: null,
  };
}
