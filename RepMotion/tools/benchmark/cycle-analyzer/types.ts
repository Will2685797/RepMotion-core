// Définit les paramètres testés par le benchmark pour segmenter les cycles Bottom -> Top -> Bottom.
export type BenchmarkParameters = {
  minRepDuration: number;
  minConcentricDuration: number;
  minEccentricDuration: number;
};

// Définit le résultat d'un benchmark pour un dataset précis.
export type DatasetBenchmarkResult = {
  datasetName: string;
  expectedReps: number;
  detectedReps: number;
  score: number;
  segmentationStatus: string;
  ignoredEvents: number;
};

// Définit le résultat global d'une combinaison de paramètres sur tous les datasets.
export type BenchmarkResult = {
  parameters: BenchmarkParameters;
  datasetsPassed: number;
  datasetsFailed: number;
  totalScore: number;
  averageScore: number;
  datasetResults: DatasetBenchmarkResult[];
};