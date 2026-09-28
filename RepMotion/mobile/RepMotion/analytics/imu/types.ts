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
