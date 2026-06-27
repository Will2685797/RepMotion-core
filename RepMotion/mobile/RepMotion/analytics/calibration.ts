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
const BOTTOM_THRESHOLD_RATIO = 0.3;
const TOP_THRESHOLD_RATIO = 0.6;

const MIN_ABSOLUTE_SAFETY_RANGE = 1500;
const MIN_ROBUST_RANGE_RATIO = 0.25;
const REQUIRED_CALIBRATION_REPS = 5;
const PEAK_WINDOW_SIZE = 3;
const CALIBRATION_AXES: CalibrationAxis[] = ["ax", "ay", "az"];

type AxisDiagnostics = {
  min: number;
  max: number;
  range: number;
  saturationCount: number;
  saturationRatio: number;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = Math.floor((sortedValues.length - 1) * ratio);

  return sortedValues[index];
}

function getAxisValues(
  samples: MotionSample[],
  axis: CalibrationAxis,
): number[] {
  return samples.map((sample) => sample[axis]);
}

function getAxisDiagnostics(
  samples: MotionSample[],
  axis: CalibrationAxis,
): AxisDiagnostics {
  const values = getAxisValues(samples, axis);

  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      range: 0,
      saturationCount: 0,
      saturationRatio: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const saturationCount = values.filter(
    (value) => Math.abs(value) >= 32000,
  ).length;

  return {
    min,
    max,
    range: max - min,
    saturationCount,
    saturationRatio: saturationCount / values.length,
  };
}

function getAllAxisDiagnostics(
  samples: MotionSample[],
): Record<CalibrationAxis, AxisDiagnostics> {
  return {
    ax: getAxisDiagnostics(samples, "ax"),
    ay: getAxisDiagnostics(samples, "ay"),
    az: getAxisDiagnostics(samples, "az"),
  };
}

function detectDominantAxis(samples: MotionSample[]): CalibrationAxis {
  const axisDiagnostics = getAllAxisDiagnostics(samples);

  return CALIBRATION_AXES.reduce((dominantAxis, axis) =>
    axisDiagnostics[axis].range > axisDiagnostics[dominantAxis].range
      ? axis
      : dominantAxis,
  );
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

  let bottomZoneHits = 0;
  let topZoneHits = 0;
  let localMinimumHits = 0;
  let localMaximumHits = 0;

  for (
    let index = PEAK_WINDOW_SIZE;
    index < values.length - PEAK_WINDOW_SIZE;
    index += 1
  ) {
    const value = values[index];

    const isInBottomZone = value <= bottomZone;
    const isInTopZone = value >= topZone;
    const isLocalMinimum = detectLocalMinimum(values, index, PEAK_WINDOW_SIZE);
    const isLocalMaximum = detectLocalMaximum(values, index, PEAK_WINDOW_SIZE);

    if (isInBottomZone) bottomZoneHits += 1;
    if (isInTopZone) topZoneHits += 1;
    if (isLocalMinimum) localMinimumHits += 1;
    if (isLocalMaximum) localMaximumHits += 1;

    if (isInBottomZone && isLocalMinimum) {
      bottoms.push(value);
    }

    if (isInTopZone && isLocalMaximum) {
      tops.push(value);
    }
  }

  console.log("[CALIBRATION PEAK DEBUG]", {
    bottomZone,
    topZone,
    bottomZoneHits,
    topZoneHits,
    localMinimumHits,
    localMaximumHits,
    bottomsDetected: bottoms.length,
    topsDetected: tops.length,
  });

  return { bottoms, tops };
}

export function calculateCalibration(
  samples: MotionSample[],
  axis?: CalibrationAxis,
): CalibrationResult {
  if (samples.length === 0) {
    return {
      axis: axis ?? DEFAULT_AXIS,
      min: 0,
      max: 0,
      range: 0,
      bottomThreshold: 0,
      topThreshold: 0,
      isValid: false,
    };
  }

  const axisDiagnostics = getAllAxisDiagnostics(samples);
  const dominantAxisForCalibration = detectDominantAxis(samples);
  const selectedAxis = axis ?? dominantAxisForCalibration;
  const values = getAxisValues(samples, selectedAxis);

  const globalMin = Math.min(...values);
  const globalMax = Math.max(...values);
  const globalRange = globalMax - globalMin;

  const p10 = percentile(values, 0.1);
  const p25 = percentile(values, 0.25);
  const p50 = percentile(values, 0.5);
  const p75 = percentile(values, 0.75);
  const p90 = percentile(values, 0.9);

  const robustRange = p90 - p10;
  const dynamicMinRange = Math.max(
    MIN_ABSOLUTE_SAFETY_RANGE,
    robustRange * MIN_ROBUST_RANGE_RATIO,
  );

  const saturationCount = values.filter(
    (value) => Math.abs(value) >= 32000,
  ).length;

  const bottomZone = p25;
  const topZone = p75;

  const { bottoms, tops } = detectBottomsAndTops(values, bottomZone, topZone);
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
  const hasValidRange = range >= dynamicMinRange;

  console.log("[CALIBRATION DEBUG]", {
    axis: selectedAxis,
    selectedAxis,
    dominantAxisForCalibration,
    sampleCount: values.length,

    axisRanges: {
      ax: axisDiagnostics.ax.range,
      ay: axisDiagnostics.ay.range,
      az: axisDiagnostics.az.range,
    },
    axisSaturation: {
      ax: axisDiagnostics.ax.saturationCount,
      ay: axisDiagnostics.ay.saturationCount,
      az: axisDiagnostics.az.saturationCount,
    },

    globalMin,
    globalMax,
    globalRange,

    robustRange,
    dynamicMinRange,

    saturationCount,
    saturationRatio: saturationCount / values.length,

    bottomZone,
    topZone,

    bottomsDetected: bottoms.length,
    topsDetected: tops.length,
    selectedBottoms: selectedBottoms.length,
    selectedTops: selectedTops.length,

    bottomAverage,
    topAverage,
    range,

    bottomThreshold,
    topThreshold,

    hasEnoughBottoms,
    hasEnoughTops,
    hasValidRange,

    distribution: {
      p10,
      p25,
      p50,
      p75,
      p90,
    },
  });

  return {
    axis: selectedAxis,
    min,
    max,
    range,
    bottomThreshold,
    topThreshold,
    isValid: hasEnoughBottoms && hasEnoughTops && hasValidRange,
  };
}
