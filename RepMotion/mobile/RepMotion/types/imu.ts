export type ImuSample = {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
};

export type ImuSampleV2 = ImuSample & {
  sampleIndex: number;
  timestampMs: number;
};

export type ImuData = ImuSample & {
  reps?: number;
};
