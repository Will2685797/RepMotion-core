import type { Candidate } from "../types";

export type CandidateKey = string;

export type Position = number;

export type PromisingCandidatesAtPosition = Map<CandidateKey, Candidate>;

/**
 * Structure example PromisingAlternatives:
 *
 * {
 *   1: {                         // Position
 *     "TOP:179": {               // CandidateKey
 *       candidateId: "TOP:179",
 *       type: "TOP",
 *       index: 179,
 *       value: 0.62
 *     },
 *
 *     "TOP:199": {
 *       candidateId: "TOP:199",
 *       type: "TOP",
 *       index: 199,
 *       value: 0.78
 *     }
 *   },
 *
 *   2: {
 *     "BOTTOM:228": {
 *       candidateId: "BOTTOM:228",
 *       type: "BOTTOM",
 *       index: 228,
 *       value: -0.71
 *     },
 *
 *     "BOTTOM:262": {
 *       candidateId: "BOTTOM:262",
 *       type: "BOTTOM",
 *       index: 262,
 *       value: -0.82
 *     }
 *   }
 * }
 *
 * Position -> CandidateKey -> Candidate
 */

export type PromisingAlternatives = Map<
  Position,
  PromisingCandidatesAtPosition
>;

