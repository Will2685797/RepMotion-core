import type { NormalizedImuSample } from "../imu/types";

export type Vector3 = NormalizedImuSample["accelMps2"];

export type Quaternion = {
  w: number;
  x: number;
  y: number;
  z: number;
};

export type Mahony6AxisConfig = {
  kp: number;
  ki: number;
};

export type Mahony6Axis = {
  update: (sample: Readonly<NormalizedImuSample>) => Quaternion;
  getQuaternion: () => Quaternion;
  reset: () => void;
};
