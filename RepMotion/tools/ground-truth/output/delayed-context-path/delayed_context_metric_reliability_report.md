# Delayed Context Path – Fiabilité de Temporal et Shape selon le nombre de cycles

## 1. Objectif

Mesurer séparément le pouvoir discriminant de Temporal et Shape sur les préfixes exhaustifs de 1 à 5 cycles, sans sélection ni pruning biomécanique.

## 2. Hypothèse

Un contexte de plusieurs cycles doit améliorer le rang de la branche Ground Truth avant le rerank terminal.

## 3. Dataset et pool contrôlé

Dataset: rowing_5reps_007.json. Pool: 46 RAW + 9 injections individuelles = 55 candidats, parasites conservés. Tolérance Ground Truth existante: ±2 samples; l'identité injectée exacte est utilisée par la trace existante.

## 4. Logique réutilisée

`buildInjectedCandidatePool`, `calculatePartialTemporalFeatures`, `calculatePartialTemporalScore`, `resampleSignal`, `pearsonCorrelation`, la normalisation robuste Shape de `normalizeCompleteSequenceFeatures`, les annotations et signatures de chemins existantes.

## 5. Rejets structurels conservés

Alternance B/T, indices strictement croissants par parcours du pool trié, transition minimale de 8 samples et durée B-B minimale de 45 samples. Aucun Top-K, score legacy, partialTemporalScore ou Shape n'élimine un chemin.

## 6. Audit de Temporal

`calculatePartialTemporalScore` est inchangé: opposé de la moyenne des CV population des durées B-B, B-T et T-B disponibles. Il est indisponible avec un cycle (une seule observation) et calculable dès deux cycles. Aucun seuil de sélection n'existe dans cette caractérisation; l'écart à un seuil est donc non applicable.

## 7. Audit de Shape

La fonction actuelle passe par `buildCyclesFromSequence`, qui exige explicitement 11 événements alternés et construit exactement 5 cycles. L'adaptation locale expérimentale construit 2, 3 ou 4 cycles avec le même découpage B-T-B, rééchantillonne chacun à 100 points, construit le profil médian point par point et calcule les mêmes corrélations de Pearson (moyenne, minimum, écart-type population). La même normalisation robuste par métrique Shape est appliquée séparément à la population de chaque longueur. Un cycle est `NOT_COMPARABLE`. Les corrélations non finies sont rapportées comme non calculables.

## 8. Résultats à 1 cycle

- Préfixes valides : 1.
- Préfixe Ground Truth construit : NON.
- Temporal : score=—, rang=—/0, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPARABLE.
- Temporal voisins : devant=—; derrière=—.
- Temporal Top-1/3/5/10 : false/false/false/false.
- Shape : score=—, rang=—/0, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPARABLE.
- Shape voisins : devant=—; derrière=—.
- Shape Top-1/3/5/10 : false/false/false/false.

## 9. Résultats à 2 cycles

- Préfixes valides : 25.
- Préfixe Ground Truth construit : NON.
- Temporal : score=—, rang=—/25, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Temporal voisins : devant=—; derrière=—.
- Temporal Top-1/3/5/10 : false/false/false/false.
- Shape : score=—, rang=—/25, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Shape voisins : devant=—; derrière=—.
- Shape Top-1/3/5/10 : false/false/false/false.

## 10. Résultats à 3 cycles

- Préfixes valides : 1869.
- Préfixe Ground Truth construit : NON.
- Temporal : score=—, rang=—/1869, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Temporal voisins : devant=—; derrière=—.
- Temporal Top-1/3/5/10 : false/false/false/false.
- Shape : score=—, rang=—/1869, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Shape voisins : devant=—; derrière=—.
- Shape Top-1/3/5/10 : false/false/false/false.

## 11. Résultats à 4 cycles

- Préfixes valides : 33600.
- Préfixe Ground Truth construit : NON.
- Temporal : score=—, rang=—/33600, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Temporal voisins : devant=—; derrière=—.
- Temporal Top-1/3/5/10 : false/false/false/false.
- Shape : score=—, rang=—/33600, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Shape voisins : devant=—; derrière=—.
- Shape Top-1/3/5/10 : false/false/false/false.

## 12. Résultats à 5 cycles

- Préfixes valides : 176457.
- Préfixe Ground Truth construit : NON.
- Temporal : score=—, rang=—/176457, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Temporal voisins : devant=—; derrière=—.
- Temporal Top-1/3/5/10 : false/false/false/false.
- Shape : score=—, rang=—/176457, percentile=—, écart au meilleur=—, quasi-ex-aequo=0, stabilité=STABLE_UNIQUE_AT_1E-12, verdict=NOT_COMPUTABLE.
- Shape voisins : devant=—; derrière=—.
- Shape Top-1/3/5/10 : false/false/false/false.

## 13. Tableau comparatif Temporal vs Shape

| Cycles | Temporal rang GT | Shape rang GT | Temporal verdict | Shape verdict |
| --- | --- | --- | --- | --- |
| 1 | —/0 | —/0 | NOT_COMPARABLE | NOT_COMPARABLE |
| 2 | —/25 | —/25 | NOT_COMPUTABLE | NOT_COMPUTABLE |
| 3 | —/1869 | —/1869 | NOT_COMPUTABLE | NOT_COMPUTABLE |
| 4 | —/33600 | —/33600 | NOT_COMPUTABLE | NOT_COMPUTABLE |
| 5 | —/176457 | —/176457 | NOT_COMPUTABLE | NOT_COMPUTABLE |

## 14. Rang de la Ground Truth par nombre de cycles

| Cycles | Temporal percentile | Shape percentile | Temporal Top-10 | Shape Top-10 |
| --- | --- | --- | --- | --- |
| 1 | — | — | false | false |
| 2 | — | — | false | false |
| 3 | — | — | false | false |
| 4 | — | — | false | false |
| 5 | — | — | false | false |

Les verdicts descriptifs sont documentés ainsi: fort = Top-3 et percentile ≥95; modéré = Top-10 et percentile ≥75; faible sinon. `STABLE_UNIQUE_AT_1E-12` signifie absence d'ex-aequo numérique à 1e-12; ce n'est pas un test par perturbation. La compatibilité avec un futur pruning est décrite, sans créer de règle, par l'entrée simultanée des deux métriques dans le Top-10.

## 15. Complexité combinatoire

| Cycles | Préfixes valides |
| --- | --- |
| 1 | 1 |
| 2 | 25 |
| 3 | 1869 |
| 4 | 33600 |
| 5 | 176457 |

Maximum de chemins actifs observés (largeur d'une couche, comptage incomplet avant garde-fou): 176457. États explorés: 300000. Temps: 15520.036 ms. Mémoire cumulative approximative des représentations visitées: 51.263 MiB (ce n'est pas le pic du processus). Garde-fous: maxStates=300000, timeoutMs=30000.

## 16. Cas dégénérés ou limites

Un cycle ne permet ni CV inter-cycles Temporal ni similarité Shape inter-cycles. Limite atteinte: OUI (MAX_STATES).

## 17. Conclusion factuelle

Verdict final: **COMBINATORIAL_LIMIT_REACHED**. Premier contexte où Temporal et Shape sont simultanément Top-10: aucun cycle(s). Ce résultat porte sur un seul dataset annoté et ne constitue pas encore un seuil de production.

## 18. Étape suivante recommandée uniquement à partir des résultats

Augmenter prudemment le garde-fou ou réduire le problème par un rejet structurel déjà validé avant toute conclusion métrique.

## Validation finale

Aucun changement à DP V1, DP V2, `current_filters` ou au pipeline de production. Aucun pruning, Top-K expérimental ou score combiné n'a été ajouté. Les fonctions des expériences existantes sont inchangées; leur parité est conservée. Seul un mode diagnostique opt-in du runner Ground Truth a été ajouté.

Commande de reproduction (depuis `RepMotion/tools/calibration-runner`):

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DELAYED_CONTEXT_METRIC_RELIABILITY'; $env:DELAYED_CONTEXT_MAX_STATES='300000'; $env:DELAYED_CONTEXT_TIMEOUT_MS='30000'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```

