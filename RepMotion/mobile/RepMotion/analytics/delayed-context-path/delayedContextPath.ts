import {
  composeGlobalPaths,
} from "./composition/composeGlobalPaths";
import { extractSegments } from "./composition/extractSegments";
import type {
  DCompositionResult,
  ExtractedSegments,
} from "./composition/types";
import { createExecutionContext } from "./execution/createExecutionContext";
import type { DelayedExecutionContext } from "./execution/types";
import { promoteCandidates } from "./promotion/promoteCandidates";
import type { PromisingAlternatives } from "./promotion/types";
import type {
  ConditionalAlternatives,
  GeneratedReconstructionSegment,
} from "./reconstruction/types";
import { reconstructLocalPaths } from "./reconstruction/reconstructLocalPaths";
import { selectLocalReconstruction } from "./reconstruction/selectLocalReconstruction";
import { scoreSequence } from "./scoring/scoreSequence";
import type { Candidate, DelayedContextPath } from "./types";

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
    const promotion = promoteCandidates(
      activePath,
      candidatePool,
      cycle,
      values,
      promisingAlternatives,
      conditionalAlternatives,
      context,
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
  const systemC = runDelayed(
    initialPath,
    input.candidatePool,
    input.values,
    true,
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
  };
}
