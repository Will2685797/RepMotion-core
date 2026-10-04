export type SensorScaleConfig = {
  accelCountsPerG: number;
  gyroCountsPerDegPerSec: number;
};

export type NormalizedImuSample = {
  accelMps2: {
    x: number;
    y: number;
    z: number;
  };
  gyroRadPerSec: {
    x: number;
    y: number;
    z: number;
  };
  sampleIndex: number;
  timestampMs: number;
};

export type GyroBias = NormalizedImuSample["gyroRadPerSec"];

export type AccelerometerVector = NormalizedImuSample["accelMps2"];

export type AccelerometerCalibration = {
  biasMps2: AccelerometerVector;
  scale: AccelerometerVector;
};

export type SixPositionAccelerometerMeasurements = {
  positiveX: AccelerometerVector;
  negativeX: AccelerometerVector;
  positiveY: AccelerometerVector;
  negativeY: AccelerometerVector;
  positiveZ: AccelerometerVector;
  negativeZ: AccelerometerVector;
};
