export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

/** Half-open sample window: startIndex is included, endIndex is excluded. */
export type SampleWindow = {
  startIndex: number;
  endIndex: number;
};

/** Axis selection is independent of projection and unit conversion. */
export type MovementAxisStrategy =
  | { method: "explicit"; axis: Vector3 }
  | { method: "pca"; referenceAxis?: Vector3 };

export type MovementAxisEstimate = {
  movementAxis: Vector3;
  /** A reference fixes geometric polarity, not a physical movement label. */
  signConvention: "explicit" | "reference-aligned" | "unresolved";
  pca: {
    /** Population covariance eigenvalues, descending, in counts squared. */
    eigenvalues: [number, number, number];
    explainedVarianceRatio: number;
  } | null;
};

export type PrepareLinearAcceleration1DOptions = {
  baselineWindow: SampleWindow;
  axisStrategy: MovementAxisStrategy;
  countsPerG: number;
};

export type PreparedLinearAcceleration1D = {
  acceleration1D: number[]; // m/s²
  baseline: Vector3; // RAW counts
  movementAxis: Vector3; // unit vector
  countsPerG: number;
  signConvention: MovementAxisEstimate["signConvention"];
  pca: MovementAxisEstimate["pca"];
};
