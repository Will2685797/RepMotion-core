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
};

export type CalibrationBenchmarkResult = {
  parameters: CalibrationBenchmarkParameters;

  totalScore: number;
  totalBottomDifference: number;
  totalTopDifference: number;

  avgDetectedBottoms: number;
  avgDetectedTops: number;
  avgSelectedBottoms: number;
  avgSelectedTops: number;

  datasets: CalibrationBenchmarkDatasetResult[];
};
