# Rowing 5 reps 007 — DP score decomposition

## Formule exacte du score

- Score initial : `0`.
- BOTTOM : `candidateScoreContribution = -candidate.value`.
- TOP : `candidateScoreContribution = +candidate.value`.
- `nextScore = previousScore + candidateScoreContribution`.
- Contribution de transition : `0` (aucune dans le code réel).
- Bonus : `0` (aucun dans le code réel).
- Pénalité : `0` (aucune dans le code réel).
- Normalisation : aucune.

## Contraintes et dominance exactes

- Alternance imposée : BOTTOM puis TOP, sur 11 positions.
- Index strictement croissants.
- Durée concentrique minimale : 8 samples.
- Durée excentrique minimale : 8 samples.
- Durée minimale entre deux BOTTOM : 45 samples.
- Clé d'état : `step:candidateIndex:lastBottomIndex`.
- Pour une même clé, le nouvel état remplace l'existant uniquement si `nextScore > existingState.score`.
- Le terminal gagnant est le premier état de score strictement supérieur au meilleur rencontré.

## CURRENT_DP_WINNER

| pathName | positionInPath | eventLabel | type | sampleIndex | signalValue | candidateScoreContribution | transitionScoreContribution | bonusContribution | penaltyContribution | incrementalScore | cumulativeScore | predecessorIndex | phaseDurationSamples | repDurationSamples | dpStateKey | stateId |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | 1 | B1 | BOTTOM | 169 | 14604 | -14604 | 0 | 0 | 0 | -14604 | -14604 |  |  |  | 1:0:169 | 1:0:169 |
| CURRENT_DP_WINNER | 2 | T1 | TOP | 195 | 24256 | 24256 | 0 | 0 | 0 | 24256 | 9652 | 169 | 26 |  | 2:3:169 | 2:3:169 |
| CURRENT_DP_WINNER | 3 | B2 | BOTTOM | 228 | 14568 | -14568 | 0 | 0 | 0 | -14568 | -4916 | 195 | 33 | 59 | 3:7:228 | 3:7:228 |
| CURRENT_DP_WINNER | 4 | T2 | TOP | 291 | 26248 | 26248 | 0 | 0 | 0 | 26248 | 21332 | 228 | 63 |  | 4:13:228 | 4:13:228 |
| CURRENT_DP_WINNER | 5 | B3 | BOTTOM | 299 | 11676 | -11676 | 0 | 0 | 0 | -11676 | 9656 | 291 | 8 | 71 | 5:14:299 | 5:14:299 |
| CURRENT_DP_WINNER | 6 | T3 | TOP | 333 | 24424 | 24424 | 0 | 0 | 0 | 24424 | 34080 | 299 | 34 |  | 6:17:299 | 6:17:299 |
| CURRENT_DP_WINNER | 7 | B4 | BOTTOM | 391 | 9644 | -9644 | 0 | 0 | 0 | -9644 | 24436 | 333 | 58 | 92 | 7:24:391 | 7:24:391 |
| CURRENT_DP_WINNER | 8 | T4 | TOP | 467 | 26536 | 26536 | 0 | 0 | 0 | 26536 | 50972 | 391 | 76 |  | 8:33:391 | 8:33:391 |
| CURRENT_DP_WINNER | 9 | B5 | BOTTOM | 500 | 12564 | -12564 | 0 | 0 | 0 | -12564 | 38408 | 467 | 33 | 109 | 9:36:500 | 9:36:500 |
| CURRENT_DP_WINNER | 10 | T5 | TOP | 509 | 23212 | 23212 | 0 | 0 | 0 | 23212 | 61620 | 500 | 9 |  | 10:37:500 | 10:37:500 |
| CURRENT_DP_WINNER | 11 | B6 | BOTTOM | 564 | 13444 | -13444 | 0 | 0 | 0 | -13444 | 48176 | 509 | 55 | 64 | 11:45:564 | 11:45:564 |

## GROUND_TRUTH_PATH

| pathName | positionInPath | eventLabel | type | sampleIndex | signalValue | candidateScoreContribution | transitionScoreContribution | bonusContribution | penaltyContribution | incrementalScore | cumulativeScore | predecessorIndex | phaseDurationSamples | repDurationSamples | dpStateKey | stateId |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GROUND_TRUTH_PATH | 1 | B1 | BOTTOM | 169 | 14604 | -14604 | 0 | 0 | 0 | -14604 | -14604 |  |  |  | 1:0:169 | 1:0:169 |
| GROUND_TRUTH_PATH | 2 | T1 | TOP | 199 | 19844 | 19844 | 0 | 0 | 0 | 19844 | 5240 | 169 | 30 |  | 2:4:169 | 2:4:169 |
| GROUND_TRUTH_PATH | 3 | B2 | BOTTOM | 262 | 17972 | -17972 | 0 | 0 | 0 | -17972 | -12732 | 199 | 63 | 93 | 3:11:262 | 3:11:262 |
| GROUND_TRUTH_PATH | 4 | T2 | TOP | 291 | 26248 | 26248 | 0 | 0 | 0 | 26248 | 13516 | 262 | 29 |  |  |  |
| GROUND_TRUTH_PATH | 5 | B3 | BOTTOM | 353 | 20092 | -20092 | 0 | 0 | 0 | -20092 | -6576 | 291 | 62 | 91 |  |  |
| GROUND_TRUTH_PATH | 6 | T3 | TOP | 383 | 17804 | 17804 | 0 | 0 | 0 | 17804 | 11228 | 353 | 30 |  |  |  |
| GROUND_TRUTH_PATH | 7 | B4 | BOTTOM | 445 | 19300 | -19300 | 0 | 0 | 0 | -19300 | -8072 | 383 | 62 | 92 |  |  |
| GROUND_TRUTH_PATH | 8 | T4 | TOP | 474 | 15656 | 15656 | 0 | 0 | 0 | 15656 | 7584 | 445 | 29 |  |  |  |
| GROUND_TRUTH_PATH | 9 | B5 | BOTTOM | 529 | 17976 | -17976 | 0 | 0 | 0 | -17976 | -10392 | 474 | 55 | 84 |  |  |
| GROUND_TRUTH_PATH | 10 | T5 | TOP | 558 | 17932 | 17932 | 0 | 0 | 0 | 17932 | 7540 | 529 | 29 |  |  |  |
| GROUND_TRUTH_PATH | 11 | B6 | BOTTOM | 611 | 18888 | -18888 | 0 | 0 | 0 | -18888 | -11348 | 558 | 53 | 82 |  |  |

## Comparaison position par position

| position | expectedType | winnerIndex | groundTruthIndex | winnerIncrementalScore | groundTruthIncrementalScore | incrementalScoreDelta | winnerCumulativeScore | groundTruthCumulativeScore | cumulativeScoreDelta | firstPositionWhereWinnerLeads | firstPositionWhereGroundTruthStateDisappears |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BOTTOM | 169 | 169 | -14604 | -14604 | 0 | -14604 | -14604 | 0 | NON | NON |
| 2 | TOP | 195 | 199 | 24256 | 19844 | 4412 | 9652 | 5240 | 4412 | OUI | NON |
| 3 | BOTTOM | 228 | 262 | -14568 | -17972 | 3404 | -4916 | -12732 | 7816 | NON | OUI |
| 4 | TOP | 291 | 291 | 26248 | 26248 | 0 | 21332 | 13516 | 7816 | NON | NON |
| 5 | BOTTOM | 299 | 353 | -11676 | -20092 | 8416 | 9656 | -6576 | 16232 | NON | NON |
| 6 | TOP | 333 | 383 | 24424 | 17804 | 6620 | 34080 | 11228 | 22852 | NON | NON |
| 7 | BOTTOM | 391 | 445 | -9644 | -19300 | 9656 | 24436 | -8072 | 32508 | NON | NON |
| 8 | TOP | 467 | 474 | 26536 | 15656 | 10880 | 50972 | 7584 | 43388 | NON | NON |
| 9 | BOTTOM | 500 | 529 | -12564 | -17976 | 5412 | 38408 | -10392 | 48800 | NON | NON |
| 10 | TOP | 509 | 558 | 23212 | 17932 | 5280 | 61620 | 7540 | 54080 | NON | NON |
| 11 | BOTTOM | 564 | 611 | -13444 | -18888 | 5444 | 48176 | -11348 | 59524 | NON | NON |

## Focus B228 vs B262

| path | candidate | value | candidateContribution | transitionContribution | phaseDurationSamples | repDurationSamples | cumulativeScore | stateCreated | stateKey | dominanceKey | status | dominantState | competingStatePath | dominantScore | dominatedScore | exactDifference | mechanicalReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | T195 | 24256 | 24256 | 0 | 26 |  | 9652 | OUI | 2:3:169 | 2:3:169 | STATE_CREATED_AND_KEPT |  |  |  |  |  | state_retained_for_key |
| CURRENT_DP_WINNER | B228 | 14568 | -14568 | 0 | 33 | 59 | -4916 | OUI | 3:7:228 | 3:7:228 | STATE_CREATED_AND_KEPT |  |  |  |  |  | state_retained_for_key |
| GROUND_TRUTH_PATH | T199 | 19844 | 19844 | 0 | 30 |  | 5240 | OUI | 2:4:169 | 2:4:169 | STATE_CREATED_AND_KEPT |  |  |  |  |  | state_retained_for_key |
| GROUND_TRUTH_PATH | B262 | 17972 | -17972 | 0 | 63 | 93 | -12732 | OUI | 3:11:262 | 3:11:262 | STATE_NOT_KEPT_LOWER_OR_EQUAL_SCORE | 3:11:262 | B169-T195-B262 | -8320 | -12732 | 4412 | higher_score_same_key |

## Trace de dominance Ground Truth

| position | prefix | stateCreated | score | dpKey | attemptOutcome | dominantState | dominantPath | dominantScore | delta | momentOfRemoval | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | B169 | OUI | -14604 | 1:0:169 | STATE_CREATED_AND_KEPT |  |  |  |  |  | survived_to_terminal |
| 2 | B169-T199 | OUI | 5240 | 2:4:169 | STATE_CREATED_AND_KEPT |  |  |  |  |  | diagnostic_unavailable |
| 3 | B169-T199-B262 | OUI | -12732 | 3:11:262 | STATE_NOT_KEPT_LOWER_OR_EQUAL_SCORE | 3:11:262 | B169-T195-B262 | -8320 | 4412 | 3 | lower_score_same_key |
| 4 | B169-T199-B262-T291 | NON | 13516 |  | STATE_NOT_CREATED |  |  |  |  |  | transition_not_created |
| 5 | B169-T199-B262-T291-B353 | NON | -6576 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 6 | B169-T199-B262-T291-B353-T383 | NON | 11228 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 7 | B169-T199-B262-T291-B353-T383-B445 | NON | -8072 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 8 | B169-T199-B262-T291-B353-T383-B445-T474 | NON | 7584 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 9 | B169-T199-B262-T291-B353-T383-B445-T474-B529 | NON | -10392 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 10 | B169-T199-B262-T291-B353-T383-B445-T474-B529-T558 | NON | 7540 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |
| 11 | B169-T199-B262-T291-B353-T383-B445-T474-B529-T558-B611 | NON | -11348 |  | STATE_NOT_CREATED |  |  |  |  |  | structurally_unreachable |

## Totaux par composante

| path | totalCandidateContribution | totalTransitionContribution | totalBonusContribution | totalPenaltyContribution | finalScore |
| --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | 48176 | 0 | 0 | 0 | 48176 |
| GROUND_TRUTH_PATH | -11348 | 0 | 0 | 0 | -11348 |

| winnerMinusGroundTruthCandidateScore | winnerMinusGroundTruthTransitionScore | winnerMinusGroundTruthBonus | winnerMinusGroundTruthPenalty | winnerMinusGroundTruthFinalScore |
| --- | --- | --- | --- | --- |
| 59524 | 0 | 0 | 0 | 59524 |

## Statut terminal Ground Truth

- GROUND_TRUTH_TERMINAL_STATUS: GROUND_TRUTH_PATH_DOMINATED_BEFORE_TERMINAL
- État terminal Ground Truth: absent
- Rang terminal: non applicable
- Dernier préfixe survivant: B169-T199

## Résumé mécanique

| currentWinnerScore | groundTruthPathScore | finalScoreDelta | firstDivergencePosition | firstPositionWinnerLeads | firstGroundTruthDominanceLoss | groundTruthTerminalStatus | lastSurvivingGroundTruthPrefix | dominantScoreComponentExplainingDelta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 48176 | -11348 | 59524 | 2 | 2 | 3 | GROUND_TRUTH_PATH_DOMINATED_BEFORE_TERMINAL | B169-T199 | CANDIDATE_CONTRIBUTION |
