export type MotionSample = {
  ax: number;
  ay: number;
  az: number;
};

export type CalibrationAxis = "ax" | "ay" | "az";

export type CalibrationResult = {
  axis: CalibrationAxis;
  min: number;
  max: number;
  range: number;
  bottomThreshold: number;
  topThreshold: number;
  isValid: boolean;
};

const DEFAULT_AXIS: CalibrationAxis = "az";
const BOTTOM_ZONE_RATIO = 0.3;
const TOP_ZONE_RATIO = 0.7;
const BOTTOM_THRESHOLD_RATIO = 0.30;
const TOP_THRESHOLD_RATIO = 0.60;

const MIN_VALID_RANGE = 5000;
const REQUIRED_CALIBRATION_REPS = 5;
const PEAK_WINDOW_SIZE = 3;

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getAxisValues(
  samples: MotionSample[],
  axis: CalibrationAxis,
): number[] {
  return samples.map((sample) => sample[axis]);
}

function detectLocalMinimum(
  values: number[],
  index: number,
  windowSize: number,
): boolean {
  const value = values[index];

  for (let offset = 1; offset <= windowSize; offset += 1) {
    if (value >= values[index - offset]) return false;
    if (value >= values[index + offset]) return false;
  }

  return true;
}

function detectLocalMaximum(
  values: number[],
  index: number,
  windowSize: number,
): boolean {
  const value = values[index];

  for (let offset = 1; offset <= windowSize; offset += 1) {
    if (value <= values[index - offset]) return false;
    if (value <= values[index + offset]) return false;
  }

  return true;
}

function detectBottomsAndTops(
  values: number[],
  bottomZone: number,
  topZone: number,
) {
  const bottoms: number[] = [];
  const tops: number[] = [];

  for (
    let index = PEAK_WINDOW_SIZE;
    index < values.length - PEAK_WINDOW_SIZE;
    index += 1
  ) {
    const value = values[index];

    if (
      value <= bottomZone &&
      detectLocalMinimum(values, index, PEAK_WINDOW_SIZE)
    ) {
      bottoms.push(value);
    }

    if (
      value >= topZone &&
      detectLocalMaximum(values, index, PEAK_WINDOW_SIZE)
    ) {
      tops.push(value);
    }
  }

  return { bottoms, tops };
}

export function calculateCalibration(
  samples: MotionSample[],
  axis: CalibrationAxis = DEFAULT_AXIS,
): CalibrationResult {
  const values = getAxisValues(samples, axis);

  if (values.length === 0) {
    return {
      axis,
      min: 0,
      max: 0,
      range: 0,
      bottomThreshold: 0,
      topThreshold: 0,
      isValid: false,
    };
  }

  const globalMin = Math.min(...values);
  const globalMax = Math.max(...values);
  const globalRange = globalMax - globalMin;

  const bottomZone = globalMin + globalRange * BOTTOM_ZONE_RATIO;
  const topZone = globalMin + globalRange * TOP_ZONE_RATIO;

  const { bottoms, tops } = detectBottomsAndTops(
    values,
    bottomZone,
    topZone,
  );
  const selectedBottoms = bottoms;
  const selectedTops = tops;

  const bottomAverage = average(bottoms);
  const topAverage = average(tops);

  const min = bottomAverage;
  const max = topAverage;
  const range = max - min;

  const bottomThreshold = min + range * BOTTOM_THRESHOLD_RATIO;
  const topThreshold = min + range * TOP_THRESHOLD_RATIO;

  const hasEnoughBottoms = bottoms.length >= REQUIRED_CALIBRATION_REPS;
  const hasEnoughTops = tops.length >= REQUIRED_CALIBRATION_REPS;
  const hasValidRange = range >= MIN_VALID_RANGE;

  console.log("[CALIBRATION DEBUG]", {
    bottomsDetected: bottoms.length,
    topsDetected: tops.length,
    selectedBottoms: selectedBottoms.length,
    selectedTops: selectedTops.length,
    range,
    hasEnoughBottoms,
    hasEnoughTops,
    hasValidRange,
  });

  return {
    axis,
    min,
    max,
    range,
    bottomThreshold,
    topThreshold,
    isValid: hasEnoughBottoms && hasEnoughTops && hasValidRange,
  };
}
