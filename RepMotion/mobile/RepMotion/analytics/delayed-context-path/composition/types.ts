import type {
  Candidate,
  DelayedContextPath,
} from "../types";
import type { CandidateKey, Position } from "../promotion/types";
import type { SequenceFeatures } from "../scoring/scoreSequence";


// {
//   id: "S0946",

//   start: 8,
//   end: 10,

//   replacements: [
//     B529,
//     T558,
//     B611
//   ],

//   signature: "8-10:BOTTOM:529|TOP:558|BOTTOM:611",

//   sources: new Set([
//     "C:D5"
//   ])
// }

/* « Une correction locale valide produite par A ou C, prête à être combinée par D. » */
export type DSegment = {
  id: string;
  start: Position;
  end: Position;
  replacements: Candidate[];
  signature: string;
  sources: Set<string>;
};

/* « L'état courant d'une hypothèse globale pendant que D combine progressivement plusieurs segments. » */

// Exemple :
// {
//   path: [B169, T199, B228, T291, B353, T383, B391, T467, B500, T509, B564],
//
//   assignments: {
//     1: "TOP:199",
//     4: "BOTTOM:353",
//     5: "TOP:383"
//   },
//
//   segmentIds: ["S0001", "S0042"],
//
//   nextIndex: 43
// }

/* « L'état courant d'une hypothèse globale pendant que D combine progressivement plusieurs segments. » */
export type DState = {
  path: DelayedContextPath;
  assignments: Record<Position, CandidateKey>;
  segmentIds: string[];
  nextIndex: number;
};

/* « Un chemin global unique après déduplication, avec toutes les combinaisons de segments qui ont produit ce même chemin. » */
export type DUnique = {
  state: DState;
  provenances: Set<string>;
};

export type ExtractedSegments = {
  aSegments: DSegment[];
  cOnlySegments: DSegment[];
  segments: DSegment[];
};

export type DCompositionContext = {
  started: number;
  maxCompositions: number;
  maxUniquePaths: number;
  examined: number;
  structurallyRejected: number;
  incompatibleOverlaps: number;
  duplicates: number;
  guard: string | null;
};

export type DComposedPath = {
  pathSignature: string;
  entry: DUnique;
  feature: SequenceFeatures;
};

export type DScoredPath = {
  path: string;
  temporal: number;
  shapeRaw: string;
  shape: number;
  combined: number;
  segmentIds: string;
  provenanceCount: number;
};

export type DCompositionResult = {
  uniquePaths: Map<string, DUnique>;
  composed: DComposedPath[];
  rows: DScoredPath[];
  temporalRanking: DScoredPath[];
  shapeRanking: DScoredPath[];
  combinedRanking: DScoredPath[];
  temporalWinner: DScoredPath | undefined;
  shapeWinner: DScoredPath | undefined;
  combinedWinner: DScoredPath | undefined;
  context: DCompositionContext;
  elapsedMs: number;
};
