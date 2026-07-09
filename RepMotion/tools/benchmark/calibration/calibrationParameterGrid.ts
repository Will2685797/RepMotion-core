export type CalibrationBenchmarkParameters = {
  minimumDistanceSamples: number;
  minimumProminenceRatio: number;
  peakWindowSize: number;
  prominenceWindowSize: number;
  smoothingWindowSize: number;
};

export const calibrationParameterGrid: CalibrationBenchmarkParameters[] = [];

for (const minimumDistanceSamples of [70, 75, 80, 85, 90, 95, 100]) {
  for (const minimumProminenceRatio of [0.08, 0.1, 0.12, 0.15]) {
  for (const smoothingWindowSize of [2, 3, 5, 7, 9, 11, 15]) {
  for (const prominenceWindowSize of [8, 12, 16]) {
    calibrationParameterGrid.push({
      minimumDistanceSamples,
      minimumProminenceRatio,
      peakWindowSize: 8,
      prominenceWindowSize,
      smoothingWindowSize,
    });
  }
}
  }
}
