import type { CalibrationDataset } from "../../mobile/RepMotion/analytics/calibration";
import type { Candidate as DpCandidate } from "../../mobile/RepMotion/analytics/delayed-context-path/types";
type GroundTruthFile = { sync: { videoTimeSeconds: number; imuSampleIndex: number }; events: { type: "BOTTOM" | "TOP"; videoTimeSeconds: number }[] };
function fail(code: string, detail: string): never { throw new Error(`${code}: ${detail}`); }

// Extracted without changing projection, reuse, sorting or historical population checks.
export function buildInjectedCandidatePool(
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

