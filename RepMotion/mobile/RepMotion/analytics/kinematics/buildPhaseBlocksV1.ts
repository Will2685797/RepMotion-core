import type { VelocitySample1D } from "./integrateVelocity1D";

export type PhaseBlockPhase = "UP" | "DOWN" | "TRANSITION_OR_UNKNOWN";

export type PhaseBlockConfig = {
  enterVelocityMps: number;
  exitVelocityMps: number;
  minimumStateDurationMs: number;
  maximumSampleGapMs?: number;
};

export type PhaseBlock = {
  phase: PhaseBlockPhase;
  startArrayIndex: number;
  endArrayIndex: number;
  startTimestampMs: number;
  endTimestampMs: number;
  durationMs: number;
  sampleCount: number;
  startSampleIndex?: number;
  endSampleIndex?: number;
};

type DirectionalPhase = Exclude<PhaseBlockPhase, "TRANSITION_OR_UNKNOWN">;

type DirectionCandidate = {
  phase: DirectionalPhase;
  startArrayIndex: number;
  startTimestampMs: number;
};

function validateConfig(config: Readonly<PhaseBlockConfig>): void {
  if (!Number.isFinite(config.enterVelocityMps) || config.enterVelocityMps <= 0) {
    throw new RangeError("enterVelocityMps must be finite and strictly positive.");
  }
  if (!Number.isFinite(config.exitVelocityMps) || config.exitVelocityMps < 0) {
    throw new RangeError("exitVelocityMps must be finite and non-negative.");
  }
  if (config.exitVelocityMps >= config.enterVelocityMps) {
    throw new RangeError("exitVelocityMps must be smaller than enterVelocityMps.");
  }
  if (
    !Number.isFinite(config.minimumStateDurationMs) ||
    config.minimumStateDurationMs < 0
  ) {
    throw new RangeError("minimumStateDurationMs must be finite and non-negative.");
  }
  if (
    config.maximumSampleGapMs !== undefined &&
    (!Number.isFinite(config.maximumSampleGapMs) || config.maximumSampleGapMs <= 0)
  ) {
    throw new RangeError("maximumSampleGapMs must be finite and strictly positive.");
  }
}

function entryPhase(
  velocityMps: number,
  enterVelocityMps: number,
): DirectionalPhase | null {
  if (velocityMps >= enterVelocityMps) return "UP";
  if (velocityMps <= -enterVelocityMps) return "DOWN";
  return null;
}

function sustainsPhase(
  phase: DirectionalPhase,
  velocityMps: number,
  exitVelocityMps: number,
): boolean {
  return phase === "UP"
    ? velocityMps > exitVelocityMps
    : velocityMps < -exitVelocityMps;
}

function phaseBlock(
  samples: readonly Readonly<VelocitySample1D>[],
  phases: readonly PhaseBlockPhase[],
  startArrayIndex: number,
  endArrayIndex: number,
): PhaseBlock {
  const start = samples[startArrayIndex];
  const end = samples[endArrayIndex];
  return {
    phase: phases[startArrayIndex],
    startArrayIndex,
    endArrayIndex,
    startTimestampMs: start.timestampMs,
    endTimestampMs: end.timestampMs,
    durationMs: end.timestampMs - start.timestampMs,
    sampleCount: endArrayIndex - startArrayIndex + 1,
    ...(start.sampleIndex === undefined
      ? {}
      : { startSampleIndex: start.sampleIndex }),
    ...(end.sampleIndex === undefined
      ? {}
      : { endSampleIndex: end.sampleIndex }),
  };
}

/**
 * Builds contiguous directional blocks from corrected 1D velocity.
 * Direction entry requires a sustained threshold crossing in real time. Once a
 * direction is confirmed, the lower exit threshold supplies hysteresis. Samples
 * not belonging to a confirmed direction remain TRANSITION_OR_UNKNOWN.
 */
export function buildPhaseBlocksV1(
  samples: readonly Readonly<VelocitySample1D>[],
  config: Readonly<PhaseBlockConfig>,
): PhaseBlock[] {
  validateConfig(config);
  samples.forEach((sample, index) => {
    if (!Number.isFinite(sample.velocityMps)) {
      throw new RangeError(`velocityMps must be finite at index ${index}.`);
    }
    if (!Number.isFinite(sample.timestampMs)) {
      throw new RangeError(`timestampMs must be finite at index ${index}.`);
    }
    if (sample.sampleIndex !== undefined && !Number.isFinite(sample.sampleIndex)) {
      throw new RangeError(`sampleIndex must be finite at index ${index}.`);
    }
    if (index > 0 && sample.timestampMs <= samples[index - 1].timestampMs) {
      throw new RangeError(`timestampMs must be strictly increasing at index ${index}.`);
    }
  });
  if (samples.length === 0) return [];

  const phases = Array<PhaseBlockPhase>(samples.length).fill(
    "TRANSITION_OR_UNKNOWN",
  );
  const gapBefore = Array<boolean>(samples.length).fill(false);
  let confirmedPhase: DirectionalPhase | null = null;
  let candidate: DirectionCandidate | null = null;

  const startCandidate = (
    phase: DirectionalPhase,
    arrayIndex: number,
  ): DirectionCandidate => ({
    phase,
    startArrayIndex: arrayIndex,
    startTimestampMs: samples[arrayIndex].timestampMs,
  });

  samples.forEach((sample, index) => {
    const hasGap =
      index > 0 &&
      config.maximumSampleGapMs !== undefined &&
      sample.timestampMs - samples[index - 1].timestampMs >
        config.maximumSampleGapMs;
    if (hasGap) {
      gapBefore[index] = true;
      confirmedPhase = null;
      candidate = null;
    }

    if (
      confirmedPhase !== null &&
      sustainsPhase(confirmedPhase, sample.velocityMps, config.exitVelocityMps)
    ) {
      phases[index] = confirmedPhase;
      return;
    }
    confirmedPhase = null;

    const entering = entryPhase(sample.velocityMps, config.enterVelocityMps);
    if (candidate === null) {
      if (entering !== null) candidate = startCandidate(entering, index);
    } else if (!sustainsPhase(
      candidate.phase,
      sample.velocityMps,
      config.exitVelocityMps,
    )) {
      candidate = entering === null ? null : startCandidate(entering, index);
    } else if (entering !== null && entering !== candidate.phase) {
      candidate = startCandidate(entering, index);
    }

    if (
      candidate !== null &&
      sample.timestampMs - candidate.startTimestampMs >=
        config.minimumStateDurationMs
    ) {
      confirmedPhase = candidate.phase;
      for (
        let confirmedIndex = candidate.startArrayIndex;
        confirmedIndex <= index;
        confirmedIndex += 1
      ) {
        phases[confirmedIndex] = confirmedPhase;
      }
      candidate = null;
    }
  });

  const blocks: PhaseBlock[] = [];
  let blockStart = 0;
  for (let index = 1; index < samples.length; index += 1) {
    if (gapBefore[index] || phases[index] !== phases[blockStart]) {
      blocks.push(phaseBlock(samples, phases, blockStart, index - 1));
      blockStart = index;
    }
  }
  blocks.push(phaseBlock(samples, phases, blockStart, samples.length - 1));
  return blocks;
}
