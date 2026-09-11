import {
  composeGlobalPaths,
} from "./composition/system-d/composeGlobalPaths";
import { extractSegments } from "./composition/system-d/extractSegments";
import type {
  DCompositionResult,
  ExtractedSegments,
} from "./composition/system-d/types";
import { createExecutionContext } from "./execution/createExecutionContext";
import type { DelayedExecutionContext } from "./execution/types";
import { promoteCandidates } from "./promotion/promoteCandidates";
import type { PromisingAlternatives } from "./promotion/types";
import type {
  ConditionalAlternatives,
  GeneratedReconstructionSegment,
} from "./reconstruction/shared/types";
import { reconstructLocalPaths } from "./reconstruction/shared/reconstructLocalPaths";
import { selectLocalReconstruction } from "./reconstruction/shared/selectLocalReconstruction";
import { scoreSequence } from "./scoring/scoreSequence";
import type { Candidate, DelayedContextPath } from "./types";
import { buildMultiNeighborAlternatives, createMultiNeighborSearch, type MultiNeighborDiagnostics } from "./reconstruction/system-c/buildMultiNeighborAlternatives";

export type CStrategy = "legacy" | "multi_neighbor";

export type SelectedDpV1Candidate = Pick<
  Candidate,
  "type" | "index" | "value"
>;

export type DelayedContextPathInput = {
  candidatePool: Candidate[];
  selectedDpV1Chain: SelectedDpV1Candidate[];
  values: number[];
};

export type DelayedCycleResult = {
  cycle: number;
  activeBefore: DelayedContextPath;
  activeAfter: DelayedContextPath;
  promotedThisCycle: number;
  generatedCount: number;
  winnerReason: string;
};

export type DelayedRunResult = {
  progressiveScoredMixed: boolean;
  initialPath: DelayedContextPath;
  finalActivePath: DelayedContextPath;
  promisingAlternatives: PromisingAlternatives;
  conditionalAlternatives: ConditionalAlternatives;
  generatedAudit: GeneratedReconstructionSegment[];
  cycles: DelayedCycleResult[];
  context: DelayedExecutionContext;
};

export type DelayedContextPathResult = {
  initialPath: DelayedContextPath;
  systemA: DelayedRunResult;
  systemC: DelayedRunResult;
  extractedSegments: ExtractedSegments;
  composition: DCompositionResult;
  finalPath: DelayedContextPath | null;
  multiNeighbor?: { cycle: number; stats: MultiNeighborDiagnostics }[];
};

function candidateKey(candidate: SelectedDpV1Candidate): string {
  return `${candidate.type}:${candidate.index}`;
}

function buildInitialPath(
  candidatePool: Candidate[],
  selectedDpV1Chain: SelectedDpV1Candidate[],
): DelayedContextPath {
  const byIdentity = new Map(
    candidatePool.map((candidate) => [candidateKey(candidate), candidate]),
  );
  return selectedDpV1Chain.map(
    (candidate, index) =>
      byIdentity.get(candidateKey(candidate)) ?? {
        candidateId: `PROMISING_ACTIVE_${index}`,
        type: candidate.type,
        index: candidate.index,
        value: candidate.value,
      },
  );
}

function runDelayed(
  initialPath: DelayedContextPath,
  candidatePool: Candidate[],
  values: number[],
  progressiveScoredMixed: boolean,
  multiNeighbor?: { cycle: number; stats: MultiNeighborDiagnostics }[],
): DelayedRunResult {
  const context = createExecutionContext();
  let activePath = [...initialPath];
  const promisingAlternatives: PromisingAlternatives = new Map();
  const conditionalAlternatives: ConditionalAlternatives = new Map();
  const generatedAudit: GeneratedReconstructionSegment[] = [];
  const cycles: DelayedCycleResult[] = [];

  for (let cycle = 1; cycle <= 5 && !context.limit; cycle += 1) {
    const activeBefore = [...activePath];
    const activeFeatures = scoreSequence(activePath, cycle, values);
    const multiSearch = multiNeighbor ? createMultiNeighborSearch() : undefined;
    const promotion = promoteCandidates(
      activePath,
      candidatePool,
      cycle,
      values,
      promisingAlternatives,
      conditionalAlternatives,
      context,
      multiSearch ? (target, position) => {
        buildMultiNeighborAlternatives(activePath, candidatePool, cycle, values, position, target, multiSearch);
      } : undefined,
    );
    const segmentRows = reconstructLocalPaths({
      active: activePath,
      promising: promisingAlternatives,
      conditional: conditionalAlternatives,
      cycle,
      values,
      progressiveScoredMixed,
      context,
    });
    const selection = selectLocalReconstruction(
      activePath,
      activeFeatures,
      segmentRows,
      cycle,
      context,
    );
    activePath = selection.activePath;
    segmentRows.forEach((row) =>
      generatedAudit.push({
        cycle,
        start: row.start,
        candidates: row.candidates,
        chain: row.chain,
        activeBefore,
        chosen: row === selection.winner,
      }),
    );
    // Seeds are already ranked valid reconstructions. Union them within this
    // cycle, preserving legacy local selection and all its alternatives.
    if (multiSearch) {
      multiNeighbor!.push({ cycle, stats: multiSearch.stats });
      const key = (path: DelayedContextPath) => path.map(c => `${c.type}:${c.index}`).join("|");
      const seen = new Set(segmentRows.map(row => key(row.chain)));
      for (const row of multiSearch.rows) {
        if (seen.has(key(row.chain))) continue;
        seen.add(key(row.chain));
        generatedAudit.push({ cycle, start: row.start, candidates: row.candidates, chain: row.chain, activeBefore, chosen: false });
      }
    }
    cycles.push({
      cycle,
      activeBefore,
      activeAfter: [...activePath],
      promotedThisCycle: promotion.promotedThisCycle,
      generatedCount: segmentRows.length,
      winnerReason: selection.reason,
    });
  }

  return {
    progressiveScoredMixed,
    initialPath: [...initialPath],
    finalActivePath: activePath,
    promisingAlternatives,
    conditionalAlternatives,
    generatedAudit,
    cycles,
    context,
  };
}

export function delayedContextPath(
  input: DelayedContextPathInput,
  options: { cStrategy?: CStrategy } = {},
): DelayedContextPathResult {
  const initialPath = buildInitialPath(
    input.candidatePool,
    input.selectedDpV1Chain,
  );
  const systemA = runDelayed(
    initialPath,
    input.candidatePool,
    input.values,
    false,
  );
  const multiNeighbor: { cycle: number; stats: MultiNeighborDiagnostics }[] = [];
  const systemC = runDelayed(
    initialPath,
    input.candidatePool,
    input.values,
    true,
    options.cStrategy === "multi_neighbor" ? multiNeighbor : undefined,
  );
  const extractedSegments = extractSegments(
    systemA.generatedAudit,
    systemC.generatedAudit,
  );
  const composition = composeGlobalPaths(
    initialPath,
    extractedSegments.segments,
    input.values,
  );
  const winnerSignature = composition.combinedWinner?.path;
  const finalPath = winnerSignature
    ? composition.uniquePaths.get(winnerSignature)?.state.path ?? null
    : null;

  return {
    initialPath,
    systemA,
    systemC,
    extractedSegments,
    composition,
    finalPath,
    ...(options.cStrategy === "multi_neighbor" ? { multiNeighbor } : {}),
  };
}
