export type EventType = "BOTTOM" | "TOP";

export type Candidate = {
  candidateId: string;
  type: EventType;
  index: number;
  value: number;
};

export type Pivot = Candidate;

export type FeatureValue = number | number[] | null;

export type DelayedContextPath = Candidate[];
