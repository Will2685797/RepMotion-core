import type { DelayedContextPath } from "../types";
import {
  expectedAlternation,
  minConcentricDuration,
  minEccentricDuration,
  minRepDuration,
} from "./structuralRules";


/*On donne en entrée notre sequence initial (initialPath) qui est typé DelayedContextPath qui est tout simplement une liste de candidat*/
/*Cette fonction sert à repondre à « Est-ce que cette hypothèse est structurellement valide selon les règles minimales de Delayed ? »*/
export function validatePath(path: DelayedContextPath): boolean {

  /*Est-ce que on alterne bien entre Bottom -> Top*/
  // every = « Est-ce que CHAQUE candidat respecte cette condition ? »
  const hasExpectedAlternation = path.every(
    (candidate, index) =>
      candidate.type === expectedAlternation[index % expectedAlternation.length],
  );

  if (!hasExpectedAlternation) {
    return false;
  }

  // Quand on avance dans notre chaîne de Bottom/Top, on doit aussi avancer dans le signal IMU. On ne peut jamais revenir à un sample précédent.
  //Ex : 169 < 195 < 228 < 291 car candidat.index représente le sample
  const hasStrictlyIncreasingIndexes = path.every(
    (candidate, index) =>
      index === 0 || path[index - 1].index < candidate.index,
  );

  if (!hasStrictlyIncreasingIndexes) {
    return false;
  }

  // À partir d'ici, les 2 dernières condition ayant passé, on sait que notre suite ressemble à B169 → T195 → B228 → T291
  // Si premier tours de boucle alors le candidat n'a pas de candidat précedant 
  return path.every((candidate, index) => {
    if (index === 0) {
      return true;
    }
  // Sinon
  // Si le candidat courant est un TOP, 
  // alors la phase qu’on vient de parcourir est une phase 
  // BOTTOM → TOP, donc on utilise minConcentricDuration. 
  // Sinon, le candidat courant est un BOTTOM,
  // donc la phase précédente était TOP → BOTTOM, et on utilise minEccentricDuration.

  // Sert seulement a vérifier la phase et lui attribuer
  // la valeurs minimal accepter soit 8 pour l'instant 
    const adjacentDuration = candidate.index - path[index - 1].index;
    const minimumAdjacentDuration =
      candidate.type === expectedAlternation[1]
        ? minConcentricDuration
        : minEccentricDuration;

  // Le candidat courant passe si la distance avec le candidat précédent est assez grande,
  // ET si c’est un BOTTOM,
  // alors il faut aussi que la distance avec le BOTTOM précédent soit assez grande.
    return (
      adjacentDuration >= minimumAdjacentDuration &&
      (candidate.type !== expectedAlternation[0] ||
        candidate.index - path[index - 2].index >= minRepDuration)
    );
  });
}
