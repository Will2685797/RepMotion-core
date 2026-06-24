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
const DEFAULT_BOTTOM_RATIO = 0.3;
const DEFAULT_TOP_RATIO = 0.7;
const MIN_VALID_RANGE = 5000;

export function calculateCalibration(
  samples: MotionSample[],
  axis: CalibrationAxis = DEFAULT_AXIS
): CalibrationResult {
  const values = samples.map((sample) => sample[axis]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const bottomThreshold = min + range * DEFAULT_BOTTOM_RATIO;
  const topThreshold = min + range * DEFAULT_TOP_RATIO;

  return {
    axis,
    min,
    max,
    range,
    bottomThreshold,
    topThreshold,
    isValid: range >= MIN_VALID_RANGE,
  };
}