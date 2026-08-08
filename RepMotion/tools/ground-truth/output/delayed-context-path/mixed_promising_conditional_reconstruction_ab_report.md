# A/B — Mixed Promising + Conditional Local Reconstruction

## 1. Executive summary

Target generated=false; valid=false; exploitable segment=NO; full GT composable A/B=false/false; verdict=**MIXED_RECONSTRUCTION_CAUSES_REGRESSION**.

## 2. Hypothèse testée

Une seule extension additive: fixer une hypothèse conditional + une réparation adjacente, puis croiser active + promising sur les autres positions de la même fenêtre existante (longueur 2–4). Maximum un conditional par reconstruction.

## 3. Système A

Replay DYNAMIC_WEIGHTED_PROMOTION Top-3 strictement inchangé.

## 4. Système B

Système A plus la branche mixed locale; promotion, conditional, validPrefix, scoring, sélection et extraction inchangés.

## 5. Génération ciblée B529/T558

| system | b529T558 | exactTarget |
| --- | --- | --- |
| A | NO | 0 |
| B | YES | 0 |

Aucune trace cible.

## 6. Validation T474-B529-T558-B611

generated=false; validPrefix=NOT_TESTED_IN_B_FLOW; valid reconstruction=NO. Le garde MAX_SEGMENTS est atteint avant l’énumération cible; la validité diagnostique démontrée par l’autopsie précédente n’est pas utilisée pour injecter cette combinaison.

## 7. Extraction du nouveau segment

GT_MISSING_SEGMENT_NOW_GENERATED = NO. Forme canonique=NONE; dedup ID=NONE.

## 8. Oracle de composabilité GT

| system | fullGtComposable | minimumSegments | firstUncovered | allUncovered | oracleStates |
| --- | --- | --- | --- | --- | --- |
| A | NO | N/A | 8 | 8 | 74 |
| B | NO | N/A | 2 | 2,4,6,7,8,9,10 | 4 |

## 9. Couverture GT complète

| position | gtPivot | aGtCompatibleCoverage | bGtCompatibleCoverage | improved | baseAlreadyGt |
| --- | --- | --- | --- | --- | --- |
| 0 | BOTTOM:169 | NO | NO | NO | YES |
| 1 | TOP:199 | YES | YES | NO | NO |
| 2 | BOTTOM:262 | YES | NO | NO | NO |
| 3 | TOP:291 | YES | NO | NO | YES |
| 4 | BOTTOM:353 | YES | NO | NO | NO |
| 5 | TOP:383 | YES | YES | NO | NO |
| 6 | BOTTOM:445 | YES | NO | NO | NO |
| 7 | TOP:474 | YES | NO | NO | NO |
| 8 | BOTTOM:529 | NO | NO | NO | NO |
| 9 | TOP:558 | YES | NO | NO | NO |
| 10 | BOTTOM:611 | YES | NO | NO | NO |

## 10. Population de segments

| system | unique | gtCompatible | entirelyFalse |
| --- | --- | --- | --- |
| A | 648 | 15 | 246 |
| B | 83 | 2 | 45 |

## 11. Coût combinatoire

| system | states | generated | mixedGenerated | valid | mixedValid | maxAlternatives | uniqueSegments | compositions | compositionUniquePaths | runtimeMs | approximateBytes | guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 50026 | 12293 | 0 | 2649 | 0 | 1848 | 648 | 1000001 | 171301 | 325.3976 | 602592 | MAX_COMPOSITIONS |
| B | 36046 | 21418 | 18442 | 306 | 32 | 224 | 83 | 9938 | 877 | 80.02650000000006 | 125568 | MAX_SEGMENTS |

| stateRatio | reconstructionRatio | segmentRatio | compositionRatio | runtimeRatio |
| --- | --- | --- | --- | --- |
| 0.7205453164354536 | 1.7422923615065484 | 0.12808641975308643 | 0.009937990062009938 | 0.24593451211686887 |

## 12. Replay end-to-end

| system | gtAvailable | bestGenerated | bestGeneratedPath | finalExact | activePath | goodReplacements | neutral | bad | backtrackings | guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 11 | 7 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:611 | 6 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | 5 | 3 | 3 | 3 | NONE |
| B | 5 | 3 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 0 | 11 | 0 | 0 | MAX_SEGMENTS |

## 13. Non-régression

| baselineSegmentsPreserved | missingBaselineSegments | baselineGtCompatiblePreserved | missingBaselineGtSegments | baselineBestGtPathPreserved |
| --- | --- | --- | --- | --- |
| NO | 576 | NO | 13 | NO |

## 14. Audit fuite GT

| phase | groundTruthRead | detail |
| --- | --- | --- |
| mixed generation | NO | GT used only in post-hoc coverage/recall/oracle branch after both replays |
| validPrefix | NO | GT used only in post-hoc coverage/recall/oracle branch after both replays |
| valid reconstruction retention | NO | GT used only in post-hoc coverage/recall/oracle branch after both replays |
| segment extraction/deduplication | NO | GT used only in post-hoc coverage/recall/oracle branch after both replays |
| ranking/selection | NO | GT used only in post-hoc coverage/recall/oracle branch after both replays |

GROUND_TRUTH_USED_FOR_DECISION = NO.

## 15. Tableau A/B

| metric | a | b | delta |
| --- | --- | --- | --- |
| GT promotion availability | 11/11 | 5/11 | -6 |
| GT-compatible segment coverage | 9/11 | 2/11 | -7 |
| Full GT composable | NO | NO | false->false |
| Unique segments | 648 | 83 | -565 |
| GT-compatible segments | 15 | 2 | -13 |
| Generated reconstructions | 12293 | 21418 | 9125 |
| Valid reconstructions | 2649 | 306 | -2343 |
| States | 50026 | 36046 | -13980 |
| Compositions | 1000001 | 9938 | -990063 |
| Best generated GT path | 7/11 | 3/11 | -4 |
| Final activePath GT | 6/11 | 2/11 | -4 |
| Bad replacements | 3 | 0 | -3 |
| Guardrail reached | MAX_COMPOSITIONS | MAX_SEGMENTS | N/A |

## 16. Réponses Q1-Q15

| question | answer |
| --- | --- |
| Q1 B529/T558 énumérés ensemble | NON |
| Q2 T474-B529-T558-B611 généré | NON |
| Q3 validPrefix réel | NON TESTÉ — GARDE ATTEINTE AVANT ÉNUMÉRATION |
| Q4 Reconstruction valide | NON |
| Q5 Segment exploitable | NON |
| Q6 Couverture B529 GT-compatible | NON |
| Q7 Full GT composable | NON — uncovered=2,4,6,7,8,9,10 |
| Q8 Nouveaux segments | 11 |
| Q9 Nouveaux GT-compatibles | 0 (0) |
| Q10 Coût combinatoire | {"stateRatio":0.7205453164354536,"reconstructionRatio":1.7422923615065484,"segmentRatio":0.12808641975308643,"compositionRatio":0.009937990062009938,"runtimeRatio":0.24593451211686887} |
| Q11 Garde-fou | MAX_SEGMENTS |
| Q12 Capacités A préservées | NON — missing=576, missingGT=13, bestPreserved=false |
| Q13 Meilleur généré amélioré | NON 7->3 |
| Q14 ActivePath final amélioré | NON 6->2 |
| Q15 Génération vs sélection | generation best 7->3; final selection 6->2 |

## 17. Verdict

**MIXED_RECONSTRUCTION_CAUSES_REGRESSION**

## 18. Conclusion architecturale

Observation uniquement: le verdict distingue la récupération de la brique, la composabilité post-hoc, le coût et la sélection finale. Aucune optimisation ou correction supplémentaire n’est proposée.

## Reproduction

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='MIXED_PROMISING_CONDITIONAL_RECONSTRUCTION_AB'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
