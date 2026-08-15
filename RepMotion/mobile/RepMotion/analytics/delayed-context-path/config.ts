export type CriterionName =
  | "ZERO_PROXY"
  | "JERK_PROXY"
  | "AMPLITUDE_PROXY"
  | "TEMPORAL"
  | "SHAPE";

export type CriterionDirection = "HIGHER" | "LOWER";

/**Quel critères en fonction de quel cycle! */
export const criteriaAtCycle: Record<number, CriterionName[]> = {
  1: ["ZERO_PROXY", "JERK_PROXY"],
  2: ["ZERO_PROXY", "JERK_PROXY"],
  3: ["ZERO_PROXY", "JERK_PROXY", "AMPLITUDE_PROXY"],
  4: ["ZERO_PROXY", "JERK_PROXY", "AMPLITUDE_PROXY", "TEMPORAL"],
  5: [
    "ZERO_PROXY",
    "JERK_PROXY",
    "AMPLITUDE_PROXY",
    "TEMPORAL",
    "SHAPE",
  ],
};

export const directions: Record<CriterionName, CriterionDirection[]> = {
  ZERO_PROXY: ["LOWER"], /**Pour ZERO_PROXY, plus la valeur est petite, meilleur est le candidat. */
  JERK_PROXY: ["LOWER"],
  AMPLITUDE_PROXY: ["LOWER", "LOWER", "LOWER"],
  TEMPORAL: ["HIGHER"], /**Pour TEMPORAL, plus la valeur est élevée, meilleur est le candidat. */
  SHAPE: ["HIGHER", "HIGHER", "LOWER"],
};

/* Si je classe ces 15 chemins uniquement avec toi, où arrives-tu à placer la GT ?*/
export const characterizationRanks: Record<CriterionName, number> = {
  ZERO_PROXY: 1,
  JERK_PROXY: 4,
  AMPLITUDE_PROXY: 9,
  TEMPORAL: 1,
  SHAPE: 1,
};


/* Nombre maximum d'alternatives les mieux classées promues
   comme Promising pour une position à chaque cycle. */
export const dynamicTopN = 3;


/* Limite de sécurité du nombre d'états/hypothèses que Delayed peut explorer.
   Peut être configurée par variable d'environnement.
   Valeur par défaut : 100 000. */
export const maxStates = Number(
  process.env.DELAYED_CONTEXT_MAX_STATES ?? "100000",
);


/* Limite de sécurité du nombre total d'alternatives Promising
   pouvant être conservées cumulativement.
   Peut être configurée par variable d'environnement.
   Valeur par défaut : 1 000. */
export const maxAlternatives = Number(
  process.env.DELAYED_CONTEXT_MAX_ALTERNATIVES ?? "1000",
);