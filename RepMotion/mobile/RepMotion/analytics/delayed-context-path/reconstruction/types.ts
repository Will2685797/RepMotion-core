import type {
  Candidate,
  DelayedContextPath,
  FeatureValue,
} from "../types";
import type { CandidateKey, Position } from "../promotion/types";

export type ConditionalRepairKey = string;

/*Quel candidat voisin pourrait réparer mon candidat conditionnel ?*/

/* {
*   position: 10,
*   candidate: {
*     candidateId: "BOTTOM_611",
*     type: "BOTTOM",
*     index: 611,
*     value: -0.76
*   }
* }
*/
export type ConditionalRepair = {
  position: Position;   /**où**/
  candidate: Candidate; /**avec quoi**/
};


/*« Voici un candidat que je veux garder même s’il ne fonctionne pas seul, et voici toutes les réparations qui pourraient le rendre valide. »*/

// ConditionalAlternative
// │
// ├── candidate
// │   └── TOP:558
// │
// └── repairs
//     ├── "10:BOTTOM:595" → réparation B595
//     ├── "10:BOTTOM:609" → réparation B609
//     └── "10:BOTTOM:611" → réparation B611

export type ConditionalAlternative = {
  candidate: Candidate;
  repairs: Map<ConditionalRepairKey, ConditionalRepair>;
};

/* « À cette position précise, voici tous les candidats conditionnels possibles. » */
export type ConditionalCandidatesAtPosition = Map<
  CandidateKey,
  ConditionalAlternative
>;

/* « Pour chaque position du chemin, voici les candidats conditionnels disponibles à cet endroit. » */
export type ConditionalAlternatives = Map<
  Position,
  ConditionalCandidatesAtPosition
>;

/* « Voici une reconstruction locale complète que nous avons réussi à construire et que nous pouvons maintenant évaluer. » */
export type LocalReconstructionCandidate = {
  start: Position;
  candidates: Candidate[];
  chain: DelayedContextPath;
  f: Record<string, FeatureValue>;
};

/* « Voici l'état actuel d'une hypothèse pendant qu'on la construit progressivement et qu'on décide si elle mérite de continuer. » */
export type ProgressiveReconstructionState = {
  path: DelayedContextPath;
  start: Position;
  end: Position;
  conditionalPosition: Position;
  conditionalCandidate: Candidate;
  repairPosition: Position;
  repairCandidate: Candidate;
  depth: number;
  score: number;
  scoreDetail: Record<string, unknown>;
  rank: number;
  survived: boolean;
};

/* « Voici une reconstruction générée, avec le chemin avant et après, afin d'identifier la correction locale qui pourra devenir un segment. » */
export type GeneratedReconstructionSegment = {
  cycle: number;
  start: Position;
  candidates: Candidate[];
  chain: DelayedContextPath;
  activeBefore: DelayedContextPath;
  chosen: boolean;
};
