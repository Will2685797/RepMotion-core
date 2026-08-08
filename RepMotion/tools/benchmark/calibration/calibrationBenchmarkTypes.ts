import type { CalibrationBenchmarkParameters } from "./calibrationParameterGrid";

export type CalibrationBenchmarkDatasetResult = {
  datasetName: string;
  expectedReps: number;

  bottomsDetected: number;
  topsDetected: number;
  selectedBottoms: number;
  selectedTops: number;

  bottomDifference: number;
  topDifference: number;
  totalDifference: number;
  selectedCountScore: number;

  alternationBreakCount: number;
  simulatedReps: number;
  repDifference: number;
  cycleAnalyzerStatus: string;
  usedBottoms: number;
  usedTops: number;
  ignoredEventsCount: number;
};

export type CalibrationBenchmarkResult = {
  parameters: CalibrationBenchmarkParameters;

  /** @deprecated Selected-count error only. Use totalRepDifference for
   * end-to-end ranking.
   */
  totalScore: number;
  totalSelectedCountScore: number;
  totalRepDifference: number;
  datasetsExactRepCount: number;
  datasetsMissing: number;
  datasetsTooMany: number;
  totalAlternationBreaks: number;
  totalBottomDifference: number;
  totalTopDifference: number;

  avgDetectedBottoms: number;
  avgDetectedTops: number;
  avgSelectedBottoms: number;
  avgSelectedTops: number;
  avgSimulatedReps: number;

  datasets: CalibrationBenchmarkDatasetResult[];
};
