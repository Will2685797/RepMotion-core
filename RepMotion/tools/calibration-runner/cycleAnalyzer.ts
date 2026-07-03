export type SegmentationEventType = "BOTTOM" | "TOP";

export type SegmentationEvent = {
  type: SegmentationEventType;
  index: number;
};

export type SegmentationStatus = "OK" | "MISSING" | "TOO_MANY";

export type CycleAnalyzerParameters = {
  minRepDuration: number;
  minConcentricDuration: number;
  minEccentricDuration: number;
};

export type SegmentationAnalysisResult = {
  simulatedReps: number;
  expectedReps: number;
  status: SegmentationStatus;
  chainLength: number;
  usedBottoms: number;
  usedTops: number;
  ignoredEvents: number;
  chain: string;
  reconstructedReps: ReconstructedRep[];
};

export type ReconstructedRep = {
  repNumber: number;

  bottomStart: number;
  top: number;
  bottomEnd: number;

  concentricDuration: number;
  eccentricDuration: number;
  totalDuration: number;
};

// Définit les paramètres par défaut pour garder le runner actuel fonctionnel.
const DEFAULT_CYCLE_ANALYZER_PARAMETERS: CycleAnalyzerParameters = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
};

// Analyse les événements retenus en construisant une chaîne biomécanique B -> T -> B -> T.
export function analyzeBottomTopBottomCycles(
  bottomIndexes: number[],
  topIndexes: number[],
  expectedReps: number,
  parameters: CycleAnalyzerParameters = DEFAULT_CYCLE_ANALYZER_PARAMETERS,
): SegmentationAnalysisResult {
  const events: SegmentationEvent[] = [
    ...bottomIndexes.map((index) => ({ type: "BOTTOM" as const, index })),
    ...topIndexes.map((index) => ({ type: "TOP" as const, index })),
  ].sort((a, b) => a.index - b.index);

  const chain: SegmentationEvent[] = [];

  for (const event of events) {
    const lastEvent = chain[chain.length - 1];

    if (!lastEvent && event.type !== "BOTTOM") {
      continue;
    }

    if (lastEvent && lastEvent.type === event.type) {
      chain[chain.length - 1] = event;
      continue;
    }

    if (lastEvent) {
      const transitionDuration = event.index - lastEvent.index;

      if (
        lastEvent.type === "BOTTOM" &&
        event.type === "TOP" &&
        transitionDuration < parameters.minConcentricDuration
      ) {
        continue;
      }

      if (
        lastEvent.type === "TOP" &&
        event.type === "BOTTOM" &&
        transitionDuration < parameters.minEccentricDuration
      ) {
        continue;
      }
    }

    if (event.type === "BOTTOM" && chain.length >= 2) {
      const previousBottom = chain[chain.length - 2];

      if (previousBottom.type === "BOTTOM") {
        const repDurationSamples = event.index - previousBottom.index;

        if (repDurationSamples < parameters.minRepDuration) {
          continue;
        }
      }
    }

    chain.push(event);
  }

  const usedBottoms = chain.filter((event) => event.type === "BOTTOM").length;
  const usedTops = chain.filter((event) => event.type === "TOP").length;

  const reconstructedReps: ReconstructedRep[] = [];

  for (let i = 0; i + 2 < chain.length; i += 2) {
    const bottomStart = chain[i];
    const top = chain[i + 1];
    const bottomEnd = chain[i + 2];

    reconstructedReps.push({
      repNumber: reconstructedReps.length + 1,
      bottomStart: bottomStart.index,
      top: top.index,
      bottomEnd: bottomEnd.index,
      concentricDuration: top.index - bottomStart.index,
      eccentricDuration: bottomEnd.index - top.index,
      totalDuration: bottomEnd.index - bottomStart.index,
    });
  }

  const simulatedReps = reconstructedReps.length;

  const status =
    simulatedReps === expectedReps
      ? "OK"
      : simulatedReps < expectedReps
        ? "MISSING"
        : "TOO_MANY";

  return {
    simulatedReps,
    expectedReps,
    status,
    chainLength: chain.length,
    usedBottoms,
    usedTops,
    ignoredEvents: events.length - chain.length,
    chain: chain
      .map((event) => `${event.type === "BOTTOM" ? "B" : "T"}(${event.index})`)
      .join(" -> "),
    reconstructedReps,
  };
}
