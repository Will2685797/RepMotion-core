export type AnalysisSet = {
  id: string;
  setOrder: number;
  setLabel: string;
  exercise: string;
  weightKg: number;
  reps: number;
  avgVelocity: number;
  maxVelocity: number;
  bestRep: number;
  romDeg: number;
  durationSec: number;
  tutSec: number;
  formScore: number;
  formStatus: string;
  formDescription: string;
  declineText: string;
  stickingPointText: string;
  stickingPointRep: number;
  stickingPointPercent: number;
  velocities: number[];
};

export type SessionExercise = {
  id: string;
  exerciseName: string;
  exerciseOrder: number;
  sets: AnalysisSet[];
};

export type AnalysisSession = {
  id: string;
  dateLabel: string;
  setsCount: number;
  repsTotal: number;
  avgVelocity: number;
  avgTUT: number;
  hasStickingPoint: boolean;
  hasFormWarning: boolean;
  exercises: SessionExercise[];
  sets: AnalysisSet[];
};