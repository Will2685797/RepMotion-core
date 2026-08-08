# TOP:558 Structural Eligibility Audit

## 1. Executive summary

Au cycle 5, TOP:558 est testé à la position logique 9 entre BOTTOM:500 et BOTTOM:564. La première condition qui échoue dans le flow réel est l’écart adjacent du pivot suivant: 564-558=6<8. Verdict: **TOP558_REQUIRES_COUPLED_MULTI_PIVOT_RECONSTRUCTION**.

## 2. État exact au cycle 5

ActivePath avant tentative: BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564. Pivot actif à la position 9: TOP:509. Candidat: TOP:558. Préfixe validé: BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:558|BOTTOM:564. Trace enregistrée: {"cycle":5,"position":9,"active":"TOP:509","candidate":"TOP:558","criteria":"ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL, SHAPE","eligible":false,"activeFeatures":"{\"ZERO_PROXY\":4112,\"JERK_PROXY\":2683.8337856067783,\"AMPLITUDE_PROXY\":[0.41894770604205295,4802,1752],\"TEMPORAL\":-0.43895055931141375,\"SHAPE\":[0.4749355427637565,0.35286071230703675,0.08759387859431611]}","candidateFeatures":"NOT_COMPUTED_AFTER_STRUCTURAL_FAILURE","comparisons":"NOT_COMPARABLE","promoted":false,"exactReason":"STRUCTURAL_ELIGIBILITY_FAILURE"}.

## 3. ActivePath autour de TOP:558

Contexte courant résultant: BOTTOM:500 → TOP:558 → BOTTOM:564. Contexte GT: BOTTOM:529 → TOP:558 → BOTTOM:611.

## 4. Toutes les contraintes

| constraint | currentContext | currentResult | gtContext | gtResult |
| --- | --- | --- | --- | --- |
| Candidate type gate | expected=TOP, candidate=TOP | PASS | expected=TOP, candidate=TOP | PASS |
| Candidate differs from active | 558 != 509 | PASS | 558 replaces target position | PASS |
| Expected alternation | BOTTOM:500 → TOP:558 → BOTTOM:564 | PASS | BOTTOM:529 → TOP:558 → BOTTOM:611 | PASS |
| Strictly increasing indices | 500 < 558 < 564 | PASS | 529 < 558 < 611 | PASS |
| Adjacent distance previous >= 8 | 558-500=58 | PASS | 558-529=29 | PASS |
| Adjacent distance next >= 8 | 564-558=6 | FAIL | 611-558=53 | PASS |
| BOTTOM-to-BOTTOM distance >= 45 | 564-500=64 | PASS | 611-529=82 | PASS |
| validPrefix compound result | BOTTOM:500 → TOP:558 → BOTTOM:564 | FAIL | BOTTOM:529 → TOP:558 → BOTTOM:611 | PASS |

## 5. Première condition qui échoue

L’ordre du code est: filtre de type → candidat différent de l’actif → `validPrefix(prefix)` → `isExpectedAlternation` → `isStrictlyIncreasing` → boucle positionnelle vérifiant distance adjacente ≥8, puis pour chaque BOTTOM distance au BOTTOM précédent ≥45. Alternance et ordre global passent. La boucle passe BOTTOM:500→TOP:558 (58), puis échoue en évaluant BOTTOM:564 car 564−558=6<8. La condition BOTTOM-à-BOTTOM 564−500=64 ne devient pas décisive, bien qu’elle soit vraie.

## 6. Trace code exacte

```text
TOP:558
→ candidate.type === active[9].type (TOP === TOP): PASS
→ candidate.index !== active[9].index (558 !== 509): PASS
→ isExpectedAlternation(prefix): PASS
→ isStrictlyIncreasing(indices): PASS
→ adjacent BOTTOM:500 → TOP:558 = 58 >= 8: PASS
→ adjacent TOP:558 → BOTTOM:564 = 6 >= 8: FAIL
→ STRUCTURAL_ELIGIBILITY_FAILURE
```

## 7. Current context vs GT context

| constraint | currentContext | currentResult | gtContext | gtResult |
| --- | --- | --- | --- | --- |
| Candidate type gate | expected=TOP, candidate=TOP | PASS | expected=TOP, candidate=TOP | PASS |
| Candidate differs from active | 558 != 509 | PASS | 558 replaces target position | PASS |
| Expected alternation | BOTTOM:500 → TOP:558 → BOTTOM:564 | PASS | BOTTOM:529 → TOP:558 → BOTTOM:611 | PASS |
| Strictly increasing indices | 500 < 558 < 564 | PASS | 529 < 558 < 611 | PASS |
| Adjacent distance previous >= 8 | 558-500=58 | PASS | 558-529=29 | PASS |
| Adjacent distance next >= 8 | 564-558=6 | FAIL | 611-558=53 | PASS |
| BOTTOM-to-BOTTOM distance >= 45 | 564-500=64 | PASS | 611-529=82 | PASS |
| validPrefix compound result | BOTTOM:500 → TOP:558 → BOTTOM:564 | FAIL | BOTTOM:529 → TOP:558 → BOTTOM:611 | PASS |

## 8. Dépendance aux voisins

| replacePreviousWithGt | replaceNextWithGt | context | previousDistance | nextDistance | bottomToBottomDistance | structurallyValid |
| --- | --- | --- | --- | --- | --- | --- |
| false | false | BOTTOM:500 → TOP:558 → BOTTOM:564 | 58 | 6 | 64 | false |
| false | true | BOTTOM:500 → TOP:558 → BOTTOM:611 | 58 | 53 | 111 | true |
| true | false | BOTTOM:529 → TOP:558 → BOTTOM:564 | 29 | 6 | 35 | false |
| true | true | BOTTOM:529 → TOP:558 → BOTTOM:611 | 29 | 53 | 82 | true |

## 9. Reconstruction/backtracking

La promotion précède la reconstruction. Comme TOP:558 échoue contre le voisin actif BOTTOM:564, il n’entre pas dans `promisingAlternatives[9]`. Le reconstructeur, limité à `{actif + promus}`, ne peut donc pas former le remplacement couplé TOP:558 + BOTTOM:611 qui serait structurellement valide.

## 10. Réponses Q1–Q7

| question | answer | proof |
| --- | --- | --- |
| Q1 Condition exacte | Adjacent distance from TOP:558 to following BOTTOM must be >=8 | 564-558=6<8 |
| Q2 Voisins responsables | BOTTOM:564 suivant; BOTTOM:500 précédent ne bloque pas | 500→558=58; 558→564=6 |
| Q3 Valide avec voisins GT | OUI | 529→558=29; 558→611=53; B-B=82 |
| Q4 Pivot ou activePath | MAUVAIS ACTIVEPATH | Le même TOP:558 passe toutes les contraintes avec BOTTOM:529/BOTTOM:611. |
| Q5 Reconstruction multi-pivots théorique | OUI | Remplacer conjointement TOP:558 et le suivant BOTTOM:564→BOTTOM:611 rend le préfixe valide. |
| Q6 Minimum voisins corrigés | 1 | Le seul remplacement du voisin suivant par BOTTOM:611 suffit; remplacer seulement le précédent ne suffit pas. |
| Q7 Limite single activePath/local replacement | OUI | TOP:558 doit être promu avant reconstruction, mais sa promotion unitaire échoue contre BOTTOM:564; il ne peut donc jamais participer au segment couplé qui corrigerait simultanément BOTTOM:611. |

## 11. Verdict

**TOP558_REQUIRES_COUPLED_MULTI_PIVOT_RECONSTRUCTION**

## Validation

Audit réellement exécuté. Aucun changement à la règle structurelle, activePath, promotion, critères, reconstruction, sélection, DP V1, DP V2, current_filters ou pipeline; aucun ML, MHT ou poids. Les voisins GT sont testés uniquement dans une branche mathématique DIAGNOSTIC ONLY.

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='TOP558_STRUCTURAL_ELIGIBILITY_AUDIT'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
