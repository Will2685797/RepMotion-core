# Coupled Structural Eligibility A/B

## 1. Executive summary

Baseline preserved=true. TOP:558+BOTTOM:611 structurally valid=true. Best GT A/B=3/11→4/11. Final GT A/B=1/11→2/11. Verdict: **COUPLED_ELIGIBILITY_IMPROVES_END_TO_END**.

## 2. Hypothèse testée

Un candidat individuellement invalide peut être conservé séparément uniquement lorsqu’un remplacement avec exactement un voisin immédiat du pool rend le préfixe valide. Il ne devient jamais promising et ne peut jamais modifier activePath seul.

## 3. Baseline A / Variante B

| rule | initialGt | gtPromoted | gtConditional | gtAvailableForReconstruction | promisingTotal | conditionalTotal | maxSimultaneousAlternatives | reconstructionsGenerated | structurallyValidReconstructions | localGtSegments | bestGeneratedGt | bestGeneratedGtPivots | finalPath | finalGt | finalGtPivots | goodReplacements | neutralReplacements | badReplacements | backtrackings | states | guardReached | elapsedMs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SYSTEM_B | 2 | 1 | 0 | 3 | 17 | 0 | 17 | 1923 | 283 | 5 | 3 | BOTTOM:169, TOP:199, TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 1 | BOTTOM:169 | 0 | 0 | 1 | 1 | 2848 | NON | 54.7106 |
| SYSTEM_B_COUPLED | 2 | 1 | 1 | 4 | 15 | 75 | 90 | 4785 | 457 | 6 | 4 | BOTTOM:169, TOP:291, TOP:558, BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2 | BOTTOM:169, TOP:291 | 0 | 1 | 0 | 1 | 42572 | NON | 72.3587 |

## 4. Différence exacte

Aucune logique baseline n’est retirée. B ajoute `conditionalStructuralAlternatives` après l’échec individuel de `validPrefix`, mémorise uniquement des couples réparateurs adjacents de deux pivots, puis soumet leurs chemins complets à `validPrefix` et au Système B inchangé.

## 5. Non-régression

| metricEvent | baseline | coupled | regression |
| --- | --- | --- | --- |
| Initial activePath | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| TOP:199 promoted | true | true | false |
| Baseline GT local paths retained | 2 | 2 | false |
| Best generated GT count | 3 | 4 | false |
| Final active GT count | 1 | 2 | false |
| Bad replacements | 1 | 0 | false |

BASELINE_PRESERVED = OUI.

## 6. Audit TOP:558

| top558InvalidAlone | storedConditional | testedNeighbors | pair558_611Generated | pairStructurallyValid | entersValidReconstructions | improvesFullPathGt | selected | selectionReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| true | true | BOTTOM:585, BOTTOM:595, BOTTOM:609, BOTTOM:611, BOTTOM:641 | true | true | true | true | false | SYSTEM_B_COUPLED_SCORE_TIE |

## 7. Conditional alternatives

| conditionalTotal | gtConditional | falseConditional | conditionalProducingValidReconstruction | conditionalProducingNone | badCoupledSelected | additionalStates |
| --- | --- | --- | --- | --- | --- | --- |
| 75 | 1 | 74 | 22 | 53 | 0 | 39724 |

### Trace complète

| cycle | position | candidate | individuallyValid | retainedConditional | repairPartners |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | BOTTOM:210 | false | false | aucun |
| 1 | 0 | BOTTOM:228 | false | false | aucun |
| 1 | 0 | BOTTOM:243 | false | false | aucun |
| 1 | 0 | BOTTOM:260 | false | false | aucun |
| 1 | 0 | BOTTOM:262 | false | false | aucun |
| 1 | 0 | BOTTOM:299 | false | false | aucun |
| 1 | 0 | BOTTOM:321 | false | false | aucun |
| 1 | 0 | BOTTOM:346 | false | false | aucun |
| 1 | 0 | BOTTOM:353 | false | false | aucun |
| 1 | 0 | BOTTOM:391 | false | false | aucun |
| 1 | 0 | BOTTOM:405 | false | false | aucun |
| 1 | 0 | BOTTOM:426 | false | false | aucun |
| 1 | 0 | BOTTOM:438 | false | false | aucun |
| 1 | 0 | BOTTOM:445 | false | false | aucun |
| 1 | 0 | BOTTOM:450 | false | false | aucun |
| 1 | 0 | BOTTOM:480 | false | false | aucun |
| 1 | 0 | BOTTOM:500 | false | false | aucun |
| 1 | 0 | BOTTOM:511 | false | false | aucun |
| 1 | 0 | BOTTOM:529 | false | false | aucun |
| 1 | 0 | BOTTOM:530 | false | false | aucun |
| 1 | 0 | BOTTOM:564 | false | false | aucun |
| 1 | 0 | BOTTOM:585 | false | false | aucun |
| 1 | 0 | BOTTOM:595 | false | false | aucun |
| 1 | 0 | BOTTOM:609 | false | false | aucun |
| 1 | 0 | BOTTOM:611 | false | false | aucun |
| 1 | 0 | BOTTOM:641 | false | false | aucun |
| 1 | 1 | TOP:170 | false | false | aucun |
| 1 | 1 | TOP:222 | false | true | 2:BOTTOM:243, 2:BOTTOM:260, 2:BOTTOM:262, 2:BOTTOM:299, 2:BOTTOM:321, 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:236 | false | true | 2:BOTTOM:260, 2:BOTTOM:262, 2:BOTTOM:299, 2:BOTTOM:321, 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:265 | false | true | 2:BOTTOM:299, 2:BOTTOM:321, 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:291 | false | true | 2:BOTTOM:299, 2:BOTTOM:321, 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:317 | false | true | 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:333 | false | true | 2:BOTTOM:346, 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:345 | false | true | 2:BOTTOM:353, 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:365 | false | true | 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:379 | false | true | 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:383 | false | true | 2:BOTTOM:391, 2:BOTTOM:405, 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:411 | false | true | 2:BOTTOM:426, 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:421 | false | true | 2:BOTTOM:438, 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:436 | false | true | 2:BOTTOM:445, 2:BOTTOM:450, 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:467 | false | true | 2:BOTTOM:480, 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:474 | false | true | 2:BOTTOM:500, 2:BOTTOM:511, 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:509 | false | true | 2:BOTTOM:529, 2:BOTTOM:530, 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:524 | false | true | 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:535 | false | true | 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:555 | false | true | 2:BOTTOM:564, 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:558 | false | true | 2:BOTTOM:585, 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:583 | false | true | 2:BOTTOM:595, 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:594 | false | true | 2:BOTTOM:609, 2:BOTTOM:611, 2:BOTTOM:641 |
| 1 | 1 | TOP:605 | false | true | 2:BOTTOM:641 |
| 1 | 1 | TOP:640 | false | false | aucun |
| 1 | 2 | BOTTOM:169 | false | false | aucun |
| 1 | 2 | BOTTOM:210 | false | false | aucun |
| 2 | 0 | BOTTOM:210 | false | false | aucun |
| 2 | 0 | BOTTOM:228 | false | false | aucun |
| 2 | 0 | BOTTOM:243 | false | false | aucun |
| 2 | 0 | BOTTOM:260 | false | false | aucun |
| 2 | 0 | BOTTOM:262 | false | false | aucun |
| 2 | 0 | BOTTOM:299 | false | false | aucun |
| 2 | 0 | BOTTOM:321 | false | false | aucun |
| 2 | 0 | BOTTOM:346 | false | false | aucun |
| 2 | 0 | BOTTOM:353 | false | false | aucun |
| 2 | 0 | BOTTOM:391 | false | false | aucun |
| 2 | 0 | BOTTOM:405 | false | false | aucun |
| 2 | 0 | BOTTOM:426 | false | false | aucun |
| 2 | 0 | BOTTOM:438 | false | false | aucun |
| 2 | 0 | BOTTOM:445 | false | false | aucun |
| 2 | 0 | BOTTOM:450 | false | false | aucun |
| 2 | 0 | BOTTOM:480 | false | false | aucun |
| 2 | 0 | BOTTOM:500 | false | false | aucun |
| 2 | 0 | BOTTOM:511 | false | false | aucun |
| 2 | 0 | BOTTOM:529 | false | false | aucun |
| 2 | 0 | BOTTOM:530 | false | false | aucun |
| 2 | 0 | BOTTOM:564 | false | false | aucun |
| 2 | 0 | BOTTOM:585 | false | false | aucun |
| 2 | 0 | BOTTOM:595 | false | false | aucun |
| 2 | 0 | BOTTOM:609 | false | false | aucun |
| 2 | 0 | BOTTOM:611 | false | false | aucun |
| 2 | 0 | BOTTOM:641 | false | false | aucun |
| 2 | 1 | TOP:170 | false | false | aucun |
| 2 | 1 | TOP:222 | false | true | 2:BOTTOM:243 |
| 2 | 1 | TOP:236 | false | false | aucun |
| 2 | 1 | TOP:265 | false | false | aucun |
| 2 | 1 | TOP:291 | false | false | aucun |
| 2 | 1 | TOP:317 | false | false | aucun |
| 2 | 1 | TOP:333 | false | false | aucun |
| 2 | 1 | TOP:345 | false | false | aucun |
| 2 | 1 | TOP:365 | false | false | aucun |
| 2 | 1 | TOP:379 | false | false | aucun |
| 2 | 1 | TOP:383 | false | false | aucun |
| 2 | 1 | TOP:411 | false | false | aucun |
| 2 | 1 | TOP:421 | false | false | aucun |
| 2 | 1 | TOP:436 | false | false | aucun |
| 2 | 1 | TOP:467 | false | false | aucun |
| 2 | 1 | TOP:474 | false | false | aucun |
| 2 | 1 | TOP:509 | false | false | aucun |
| 2 | 1 | TOP:524 | false | false | aucun |
| 2 | 1 | TOP:535 | false | false | aucun |
| 2 | 1 | TOP:555 | false | false | aucun |
| 2 | 1 | TOP:558 | false | false | aucun |
| 2 | 1 | TOP:583 | false | false | aucun |
| 2 | 1 | TOP:594 | false | false | aucun |
| 2 | 1 | TOP:605 | false | false | aucun |
| 2 | 1 | TOP:640 | false | false | aucun |
| 2 | 2 | BOTTOM:169 | false | false | aucun |
| 2 | 2 | BOTTOM:210 | false | false | aucun |
| 2 | 2 | BOTTOM:260 | false | false | aucun |
| 2 | 2 | BOTTOM:262 | false | false | aucun |
| 2 | 2 | BOTTOM:299 | false | false | aucun |
| 2 | 2 | BOTTOM:321 | false | false | aucun |
| 2 | 2 | BOTTOM:346 | false | false | aucun |
| 2 | 2 | BOTTOM:353 | false | false | aucun |
| 2 | 2 | BOTTOM:391 | false | false | aucun |
| 2 | 2 | BOTTOM:405 | false | false | aucun |
| 2 | 2 | BOTTOM:426 | false | false | aucun |
| 2 | 2 | BOTTOM:438 | false | false | aucun |
| 2 | 2 | BOTTOM:445 | false | false | aucun |
| 2 | 2 | BOTTOM:450 | false | false | aucun |
| 2 | 2 | BOTTOM:480 | false | false | aucun |
| 2 | 2 | BOTTOM:500 | false | false | aucun |
| 2 | 2 | BOTTOM:511 | false | false | aucun |
| 2 | 2 | BOTTOM:529 | false | false | aucun |
| 2 | 2 | BOTTOM:530 | false | false | aucun |
| 2 | 2 | BOTTOM:564 | false | false | aucun |
| 2 | 2 | BOTTOM:585 | false | false | aucun |
| 2 | 2 | BOTTOM:595 | false | false | aucun |
| 2 | 2 | BOTTOM:609 | false | false | aucun |
| 2 | 2 | BOTTOM:611 | false | false | aucun |
| 2 | 2 | BOTTOM:641 | false | false | aucun |
| 2 | 3 | TOP:170 | false | false | aucun |
| 2 | 3 | TOP:179 | false | false | aucun |
| 2 | 3 | TOP:195 | false | false | aucun |
| 2 | 3 | TOP:199 | false | false | aucun |
| 2 | 3 | TOP:222 | false | false | aucun |
| 2 | 3 | TOP:317 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:333 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:345 | false | true | 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:365 | false | true | 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:379 | false | true | 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:383 | false | true | 4:BOTTOM:391, 4:BOTTOM:405, 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:411 | false | true | 4:BOTTOM:426, 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:421 | false | true | 4:BOTTOM:438, 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:436 | false | true | 4:BOTTOM:445, 4:BOTTOM:450, 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:467 | false | true | 4:BOTTOM:480, 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:474 | false | true | 4:BOTTOM:500, 4:BOTTOM:511, 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:509 | false | true | 4:BOTTOM:529, 4:BOTTOM:530, 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:524 | false | true | 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:535 | false | true | 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:555 | false | true | 4:BOTTOM:564, 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:558 | false | true | 4:BOTTOM:585, 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:583 | false | true | 4:BOTTOM:595, 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:594 | false | true | 4:BOTTOM:609, 4:BOTTOM:611, 4:BOTTOM:641 |
| 2 | 3 | TOP:605 | false | true | 4:BOTTOM:641 |
| 2 | 3 | TOP:640 | false | false | aucun |
| 2 | 4 | BOTTOM:169 | false | false | aucun |
| 2 | 4 | BOTTOM:210 | false | false | aucun |
| 2 | 4 | BOTTOM:228 | false | false | aucun |
| 2 | 4 | BOTTOM:243 | false | false | aucun |
| 2 | 4 | BOTTOM:260 | false | false | aucun |
| 2 | 4 | BOTTOM:262 | false | false | aucun |
| 3 | 0 | BOTTOM:210 | false | false | aucun |
| 3 | 0 | BOTTOM:228 | false | false | aucun |
| 3 | 0 | BOTTOM:243 | false | false | aucun |
| 3 | 0 | BOTTOM:260 | false | false | aucun |
| 3 | 0 | BOTTOM:262 | false | false | aucun |
| 3 | 0 | BOTTOM:299 | false | false | aucun |
| 3 | 0 | BOTTOM:321 | false | false | aucun |
| 3 | 0 | BOTTOM:346 | false | false | aucun |
| 3 | 0 | BOTTOM:353 | false | false | aucun |
| 3 | 0 | BOTTOM:391 | false | false | aucun |
| 3 | 0 | BOTTOM:405 | false | false | aucun |
| 3 | 0 | BOTTOM:426 | false | false | aucun |
| 3 | 0 | BOTTOM:438 | false | false | aucun |
| 3 | 0 | BOTTOM:445 | false | false | aucun |
| 3 | 0 | BOTTOM:450 | false | false | aucun |
| 3 | 0 | BOTTOM:480 | false | false | aucun |
| 3 | 0 | BOTTOM:500 | false | false | aucun |
| 3 | 0 | BOTTOM:511 | false | false | aucun |
| 3 | 0 | BOTTOM:529 | false | false | aucun |
| 3 | 0 | BOTTOM:530 | false | false | aucun |
| 3 | 0 | BOTTOM:564 | false | false | aucun |
| 3 | 0 | BOTTOM:585 | false | false | aucun |
| 3 | 0 | BOTTOM:595 | false | false | aucun |
| 3 | 0 | BOTTOM:609 | false | false | aucun |
| 3 | 0 | BOTTOM:611 | false | false | aucun |
| 3 | 0 | BOTTOM:641 | false | false | aucun |
| 3 | 1 | TOP:170 | false | false | aucun |
| 3 | 1 | TOP:222 | false | true | 2:BOTTOM:243 |
| 3 | 1 | TOP:236 | false | false | aucun |
| 3 | 1 | TOP:265 | false | false | aucun |
| 3 | 1 | TOP:291 | false | false | aucun |
| 3 | 1 | TOP:317 | false | false | aucun |
| 3 | 1 | TOP:333 | false | false | aucun |
| 3 | 1 | TOP:345 | false | false | aucun |
| 3 | 1 | TOP:365 | false | false | aucun |
| 3 | 1 | TOP:379 | false | false | aucun |
| 3 | 1 | TOP:383 | false | false | aucun |
| 3 | 1 | TOP:411 | false | false | aucun |
| 3 | 1 | TOP:421 | false | false | aucun |
| 3 | 1 | TOP:436 | false | false | aucun |
| 3 | 1 | TOP:467 | false | false | aucun |
| 3 | 1 | TOP:474 | false | false | aucun |
| 3 | 1 | TOP:509 | false | false | aucun |
| 3 | 1 | TOP:524 | false | false | aucun |
| 3 | 1 | TOP:535 | false | false | aucun |
| 3 | 1 | TOP:555 | false | false | aucun |
| 3 | 1 | TOP:558 | false | false | aucun |
| 3 | 1 | TOP:583 | false | false | aucun |
| 3 | 1 | TOP:594 | false | false | aucun |
| 3 | 1 | TOP:605 | false | false | aucun |
| 3 | 1 | TOP:640 | false | false | aucun |
| 3 | 2 | BOTTOM:169 | false | false | aucun |
| 3 | 2 | BOTTOM:210 | false | false | aucun |
| 3 | 2 | BOTTOM:260 | false | false | aucun |
| 3 | 2 | BOTTOM:262 | false | false | aucun |
| 3 | 2 | BOTTOM:299 | false | false | aucun |
| 3 | 2 | BOTTOM:321 | false | false | aucun |
| 3 | 2 | BOTTOM:346 | false | false | aucun |
| 3 | 2 | BOTTOM:353 | false | false | aucun |
| 3 | 2 | BOTTOM:391 | false | false | aucun |
| 3 | 2 | BOTTOM:405 | false | false | aucun |
| 3 | 2 | BOTTOM:426 | false | false | aucun |
| 3 | 2 | BOTTOM:438 | false | false | aucun |
| 3 | 2 | BOTTOM:445 | false | false | aucun |
| 3 | 2 | BOTTOM:450 | false | false | aucun |
| 3 | 2 | BOTTOM:480 | false | false | aucun |
| 3 | 2 | BOTTOM:500 | false | false | aucun |
| 3 | 2 | BOTTOM:511 | false | false | aucun |
| 3 | 2 | BOTTOM:529 | false | false | aucun |
| 3 | 2 | BOTTOM:530 | false | false | aucun |
| 3 | 2 | BOTTOM:564 | false | false | aucun |
| 3 | 2 | BOTTOM:585 | false | false | aucun |
| 3 | 2 | BOTTOM:595 | false | false | aucun |
| 3 | 2 | BOTTOM:609 | false | false | aucun |
| 3 | 2 | BOTTOM:611 | false | false | aucun |
| 3 | 2 | BOTTOM:641 | false | false | aucun |
| 3 | 3 | TOP:170 | false | false | aucun |
| 3 | 3 | TOP:179 | false | false | aucun |
| 3 | 3 | TOP:195 | false | false | aucun |
| 3 | 3 | TOP:199 | false | false | aucun |
| 3 | 3 | TOP:222 | false | false | aucun |
| 3 | 3 | TOP:317 | false | false | aucun |
| 3 | 3 | TOP:333 | false | false | aucun |
| 3 | 3 | TOP:345 | false | false | aucun |
| 3 | 3 | TOP:365 | false | false | aucun |
| 3 | 3 | TOP:379 | false | false | aucun |
| 3 | 3 | TOP:383 | false | false | aucun |
| 3 | 3 | TOP:411 | false | false | aucun |
| 3 | 3 | TOP:421 | false | false | aucun |
| 3 | 3 | TOP:436 | false | false | aucun |
| 3 | 3 | TOP:467 | false | false | aucun |
| 3 | 3 | TOP:474 | false | false | aucun |
| 3 | 3 | TOP:509 | false | false | aucun |
| 3 | 3 | TOP:524 | false | false | aucun |
| 3 | 3 | TOP:535 | false | false | aucun |
| 3 | 3 | TOP:555 | false | false | aucun |
| 3 | 3 | TOP:558 | false | false | aucun |
| 3 | 3 | TOP:583 | false | false | aucun |
| 3 | 3 | TOP:594 | false | false | aucun |
| 3 | 3 | TOP:605 | false | false | aucun |
| 3 | 3 | TOP:640 | false | false | aucun |
| 3 | 4 | BOTTOM:169 | false | false | aucun |
| 3 | 4 | BOTTOM:210 | false | false | aucun |
| 3 | 4 | BOTTOM:228 | false | false | aucun |
| 3 | 4 | BOTTOM:243 | false | false | aucun |
| 3 | 4 | BOTTOM:260 | false | false | aucun |
| 3 | 4 | BOTTOM:262 | false | false | aucun |
| 3 | 4 | BOTTOM:346 | false | true | 5:TOP:365, 5:TOP:379, 5:TOP:383 |
| 3 | 4 | BOTTOM:353 | false | false | aucun |
| 3 | 4 | BOTTOM:391 | false | false | aucun |
| 3 | 4 | BOTTOM:405 | false | false | aucun |
| 3 | 4 | BOTTOM:426 | false | false | aucun |
| 3 | 4 | BOTTOM:438 | false | false | aucun |
| 3 | 4 | BOTTOM:445 | false | false | aucun |
| 3 | 4 | BOTTOM:450 | false | false | aucun |
| 3 | 4 | BOTTOM:480 | false | false | aucun |
| 3 | 4 | BOTTOM:500 | false | false | aucun |
| 3 | 4 | BOTTOM:511 | false | false | aucun |
| 3 | 4 | BOTTOM:529 | false | false | aucun |
| 3 | 4 | BOTTOM:530 | false | false | aucun |
| 3 | 4 | BOTTOM:564 | false | false | aucun |
| 3 | 4 | BOTTOM:585 | false | false | aucun |
| 3 | 4 | BOTTOM:595 | false | false | aucun |
| 3 | 4 | BOTTOM:609 | false | false | aucun |
| 3 | 4 | BOTTOM:611 | false | false | aucun |
| 3 | 4 | BOTTOM:641 | false | false | aucun |
| 3 | 5 | TOP:170 | false | false | aucun |
| 3 | 5 | TOP:179 | false | false | aucun |
| 3 | 5 | TOP:195 | false | false | aucun |
| 3 | 5 | TOP:199 | false | false | aucun |
| 3 | 5 | TOP:222 | false | false | aucun |
| 3 | 5 | TOP:236 | false | false | aucun |
| 3 | 5 | TOP:265 | false | false | aucun |
| 3 | 5 | TOP:291 | false | false | aucun |
| 3 | 5 | TOP:411 | false | true | 6:BOTTOM:426, 6:BOTTOM:438, 6:BOTTOM:445, 6:BOTTOM:450, 6:BOTTOM:480, 6:BOTTOM:500, 6:BOTTOM:511, 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:421 | false | true | 6:BOTTOM:438, 6:BOTTOM:445, 6:BOTTOM:450, 6:BOTTOM:480, 6:BOTTOM:500, 6:BOTTOM:511, 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:436 | false | true | 6:BOTTOM:445, 6:BOTTOM:450, 6:BOTTOM:480, 6:BOTTOM:500, 6:BOTTOM:511, 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:467 | false | true | 6:BOTTOM:480, 6:BOTTOM:500, 6:BOTTOM:511, 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:474 | false | true | 6:BOTTOM:500, 6:BOTTOM:511, 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:509 | false | true | 6:BOTTOM:529, 6:BOTTOM:530, 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:524 | false | true | 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:535 | false | true | 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:555 | false | true | 6:BOTTOM:564, 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:558 | false | true | 6:BOTTOM:585, 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:583 | false | true | 6:BOTTOM:595, 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:594 | false | true | 6:BOTTOM:609, 6:BOTTOM:611, 6:BOTTOM:641 |
| 3 | 5 | TOP:605 | false | true | 6:BOTTOM:641 |
| 3 | 5 | TOP:640 | false | false | aucun |
| 3 | 6 | BOTTOM:169 | false | false | aucun |
| 3 | 6 | BOTTOM:210 | false | false | aucun |
| 3 | 6 | BOTTOM:228 | false | false | aucun |
| 3 | 6 | BOTTOM:243 | false | false | aucun |
| 3 | 6 | BOTTOM:260 | false | false | aucun |
| 3 | 6 | BOTTOM:262 | false | false | aucun |
| 3 | 6 | BOTTOM:299 | false | false | aucun |
| 3 | 6 | BOTTOM:321 | false | false | aucun |
| 4 | 0 | BOTTOM:210 | false | false | aucun |
| 4 | 0 | BOTTOM:228 | false | false | aucun |
| 4 | 0 | BOTTOM:243 | false | false | aucun |
| 4 | 0 | BOTTOM:260 | false | false | aucun |
| 4 | 0 | BOTTOM:262 | false | false | aucun |
| 4 | 0 | BOTTOM:299 | false | false | aucun |
| 4 | 0 | BOTTOM:321 | false | false | aucun |
| 4 | 0 | BOTTOM:346 | false | false | aucun |
| 4 | 0 | BOTTOM:353 | false | false | aucun |
| 4 | 0 | BOTTOM:391 | false | false | aucun |
| 4 | 0 | BOTTOM:405 | false | false | aucun |
| 4 | 0 | BOTTOM:426 | false | false | aucun |
| 4 | 0 | BOTTOM:438 | false | false | aucun |
| 4 | 0 | BOTTOM:445 | false | false | aucun |
| 4 | 0 | BOTTOM:450 | false | false | aucun |
| 4 | 0 | BOTTOM:480 | false | false | aucun |
| 4 | 0 | BOTTOM:500 | false | false | aucun |
| 4 | 0 | BOTTOM:511 | false | false | aucun |
| 4 | 0 | BOTTOM:529 | false | false | aucun |
| 4 | 0 | BOTTOM:530 | false | false | aucun |
| 4 | 0 | BOTTOM:564 | false | false | aucun |
| 4 | 0 | BOTTOM:585 | false | false | aucun |
| 4 | 0 | BOTTOM:595 | false | false | aucun |
| 4 | 0 | BOTTOM:609 | false | false | aucun |
| 4 | 0 | BOTTOM:611 | false | false | aucun |
| 4 | 0 | BOTTOM:641 | false | false | aucun |
| 4 | 1 | TOP:170 | false | false | aucun |
| 4 | 1 | TOP:222 | false | true | 2:BOTTOM:243 |
| 4 | 1 | TOP:236 | false | false | aucun |
| 4 | 1 | TOP:265 | false | false | aucun |
| 4 | 1 | TOP:291 | false | false | aucun |
| 4 | 1 | TOP:317 | false | false | aucun |
| 4 | 1 | TOP:333 | false | false | aucun |
| 4 | 1 | TOP:345 | false | false | aucun |
| 4 | 1 | TOP:365 | false | false | aucun |
| 4 | 1 | TOP:379 | false | false | aucun |
| 4 | 1 | TOP:383 | false | false | aucun |
| 4 | 1 | TOP:411 | false | false | aucun |
| 4 | 1 | TOP:421 | false | false | aucun |
| 4 | 1 | TOP:436 | false | false | aucun |
| 4 | 1 | TOP:467 | false | false | aucun |
| 4 | 1 | TOP:474 | false | false | aucun |
| 4 | 1 | TOP:509 | false | false | aucun |
| 4 | 1 | TOP:524 | false | false | aucun |
| 4 | 1 | TOP:535 | false | false | aucun |
| 4 | 1 | TOP:555 | false | false | aucun |
| 4 | 1 | TOP:558 | false | false | aucun |
| 4 | 1 | TOP:583 | false | false | aucun |
| 4 | 1 | TOP:594 | false | false | aucun |
| 4 | 1 | TOP:605 | false | false | aucun |
| 4 | 1 | TOP:640 | false | false | aucun |
| 4 | 2 | BOTTOM:169 | false | false | aucun |
| 4 | 2 | BOTTOM:210 | false | false | aucun |
| 4 | 2 | BOTTOM:260 | false | false | aucun |
| 4 | 2 | BOTTOM:262 | false | false | aucun |
| 4 | 2 | BOTTOM:299 | false | false | aucun |
| 4 | 2 | BOTTOM:321 | false | false | aucun |
| 4 | 2 | BOTTOM:346 | false | false | aucun |
| 4 | 2 | BOTTOM:353 | false | false | aucun |
| 4 | 2 | BOTTOM:391 | false | false | aucun |
| 4 | 2 | BOTTOM:405 | false | false | aucun |
| 4 | 2 | BOTTOM:426 | false | false | aucun |
| 4 | 2 | BOTTOM:438 | false | false | aucun |
| 4 | 2 | BOTTOM:445 | false | false | aucun |
| 4 | 2 | BOTTOM:450 | false | false | aucun |
| 4 | 2 | BOTTOM:480 | false | false | aucun |
| 4 | 2 | BOTTOM:500 | false | false | aucun |
| 4 | 2 | BOTTOM:511 | false | false | aucun |
| 4 | 2 | BOTTOM:529 | false | false | aucun |
| 4 | 2 | BOTTOM:530 | false | false | aucun |
| 4 | 2 | BOTTOM:564 | false | false | aucun |
| 4 | 2 | BOTTOM:585 | false | false | aucun |
| 4 | 2 | BOTTOM:595 | false | false | aucun |
| 4 | 2 | BOTTOM:609 | false | false | aucun |
| 4 | 2 | BOTTOM:611 | false | false | aucun |
| 4 | 2 | BOTTOM:641 | false | false | aucun |
| 4 | 3 | TOP:170 | false | false | aucun |
| 4 | 3 | TOP:179 | false | false | aucun |
| 4 | 3 | TOP:195 | false | false | aucun |
| 4 | 3 | TOP:199 | false | false | aucun |
| 4 | 3 | TOP:222 | false | false | aucun |
| 4 | 3 | TOP:317 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:333 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:345 | false | true | 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:365 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:379 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:383 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 4 | 3 | TOP:411 | false | false | aucun |
| 4 | 3 | TOP:421 | false | false | aucun |
| 4 | 3 | TOP:436 | false | false | aucun |
| 4 | 3 | TOP:467 | false | false | aucun |
| 4 | 3 | TOP:474 | false | false | aucun |
| 4 | 3 | TOP:509 | false | false | aucun |
| 4 | 3 | TOP:524 | false | false | aucun |
| 4 | 3 | TOP:535 | false | false | aucun |
| 4 | 3 | TOP:555 | false | false | aucun |
| 4 | 3 | TOP:558 | false | false | aucun |
| 4 | 3 | TOP:583 | false | false | aucun |
| 4 | 3 | TOP:594 | false | false | aucun |
| 4 | 3 | TOP:605 | false | false | aucun |
| 4 | 3 | TOP:640 | false | false | aucun |
| 4 | 4 | BOTTOM:169 | false | false | aucun |
| 4 | 4 | BOTTOM:210 | false | false | aucun |
| 4 | 4 | BOTTOM:228 | false | false | aucun |
| 4 | 4 | BOTTOM:243 | false | false | aucun |
| 4 | 4 | BOTTOM:260 | false | false | aucun |
| 4 | 4 | BOTTOM:262 | false | false | aucun |
| 4 | 4 | BOTTOM:426 | false | false | aucun |
| 4 | 4 | BOTTOM:438 | false | false | aucun |
| 4 | 4 | BOTTOM:445 | false | false | aucun |
| 4 | 4 | BOTTOM:450 | false | false | aucun |
| 4 | 4 | BOTTOM:480 | false | false | aucun |
| 4 | 4 | BOTTOM:500 | false | false | aucun |
| 4 | 4 | BOTTOM:511 | false | false | aucun |
| 4 | 4 | BOTTOM:529 | false | false | aucun |
| 4 | 4 | BOTTOM:530 | false | false | aucun |
| 4 | 4 | BOTTOM:564 | false | false | aucun |
| 4 | 4 | BOTTOM:585 | false | false | aucun |
| 4 | 4 | BOTTOM:595 | false | false | aucun |
| 4 | 4 | BOTTOM:609 | false | false | aucun |
| 4 | 4 | BOTTOM:611 | false | false | aucun |
| 4 | 4 | BOTTOM:641 | false | false | aucun |
| 4 | 5 | TOP:170 | false | false | aucun |
| 4 | 5 | TOP:179 | false | false | aucun |
| 4 | 5 | TOP:195 | false | false | aucun |
| 4 | 5 | TOP:199 | false | false | aucun |
| 4 | 5 | TOP:222 | false | false | aucun |
| 4 | 5 | TOP:236 | false | false | aucun |
| 4 | 5 | TOP:265 | false | false | aucun |
| 4 | 5 | TOP:291 | false | false | aucun |
| 4 | 5 | TOP:467 | false | false | aucun |
| 4 | 5 | TOP:474 | false | false | aucun |
| 4 | 5 | TOP:509 | false | false | aucun |
| 4 | 5 | TOP:524 | false | false | aucun |
| 4 | 5 | TOP:535 | false | false | aucun |
| 4 | 5 | TOP:555 | false | false | aucun |
| 4 | 5 | TOP:558 | false | false | aucun |
| 4 | 5 | TOP:583 | false | false | aucun |
| 4 | 5 | TOP:594 | false | false | aucun |
| 4 | 5 | TOP:605 | false | false | aucun |
| 4 | 5 | TOP:640 | false | false | aucun |
| 4 | 6 | BOTTOM:169 | false | false | aucun |
| 4 | 6 | BOTTOM:210 | false | false | aucun |
| 4 | 6 | BOTTOM:228 | false | false | aucun |
| 4 | 6 | BOTTOM:243 | false | false | aucun |
| 4 | 6 | BOTTOM:260 | false | false | aucun |
| 4 | 6 | BOTTOM:262 | false | false | aucun |
| 4 | 6 | BOTTOM:299 | false | false | aucun |
| 4 | 6 | BOTTOM:321 | false | false | aucun |
| 4 | 6 | BOTTOM:346 | false | true | 5:TOP:317, 5:TOP:333 |
| 4 | 6 | BOTTOM:353 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345 |
| 4 | 6 | BOTTOM:391 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383 |
| 4 | 6 | BOTTOM:405 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383 |
| 4 | 6 | BOTTOM:426 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383, 5:TOP:411 |
| 4 | 6 | BOTTOM:438 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383, 5:TOP:411, 5:TOP:421 |
| 4 | 6 | BOTTOM:480 | false | false | aucun |
| 4 | 6 | BOTTOM:500 | false | false | aucun |
| 4 | 6 | BOTTOM:511 | false | false | aucun |
| 4 | 6 | BOTTOM:529 | false | false | aucun |
| 4 | 6 | BOTTOM:530 | false | false | aucun |
| 4 | 6 | BOTTOM:564 | false | false | aucun |
| 4 | 6 | BOTTOM:585 | false | false | aucun |
| 4 | 6 | BOTTOM:595 | false | false | aucun |
| 4 | 6 | BOTTOM:609 | false | false | aucun |
| 4 | 6 | BOTTOM:611 | false | false | aucun |
| 4 | 6 | BOTTOM:641 | false | false | aucun |
| 4 | 7 | TOP:170 | false | false | aucun |
| 4 | 7 | TOP:179 | false | false | aucun |
| 4 | 7 | TOP:195 | false | false | aucun |
| 4 | 7 | TOP:199 | false | false | aucun |
| 4 | 7 | TOP:222 | false | false | aucun |
| 4 | 7 | TOP:236 | false | false | aucun |
| 4 | 7 | TOP:265 | false | false | aucun |
| 4 | 7 | TOP:291 | false | false | aucun |
| 4 | 7 | TOP:317 | false | false | aucun |
| 4 | 7 | TOP:333 | false | false | aucun |
| 4 | 7 | TOP:345 | false | false | aucun |
| 4 | 7 | TOP:365 | false | false | aucun |
| 4 | 7 | TOP:379 | false | false | aucun |
| 4 | 7 | TOP:383 | false | false | aucun |
| 4 | 7 | TOP:411 | false | false | aucun |
| 4 | 7 | TOP:421 | false | false | aucun |
| 4 | 7 | TOP:436 | false | false | aucun |
| 4 | 7 | TOP:509 | false | true | 8:BOTTOM:529, 8:BOTTOM:530, 8:BOTTOM:564, 8:BOTTOM:585, 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:524 | false | true | 8:BOTTOM:564, 8:BOTTOM:585, 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:535 | false | true | 8:BOTTOM:564, 8:BOTTOM:585, 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:555 | false | true | 8:BOTTOM:564, 8:BOTTOM:585, 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:558 | false | true | 8:BOTTOM:585, 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:583 | false | true | 8:BOTTOM:595, 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:594 | false | true | 8:BOTTOM:609, 8:BOTTOM:611, 8:BOTTOM:641 |
| 4 | 7 | TOP:605 | false | true | 8:BOTTOM:641 |
| 4 | 7 | TOP:640 | false | false | aucun |
| 4 | 8 | BOTTOM:169 | false | false | aucun |
| 4 | 8 | BOTTOM:210 | false | false | aucun |
| 4 | 8 | BOTTOM:228 | false | false | aucun |
| 4 | 8 | BOTTOM:243 | false | false | aucun |
| 4 | 8 | BOTTOM:260 | false | false | aucun |
| 4 | 8 | BOTTOM:262 | false | false | aucun |
| 4 | 8 | BOTTOM:299 | false | false | aucun |
| 4 | 8 | BOTTOM:321 | false | false | aucun |
| 4 | 8 | BOTTOM:346 | false | false | aucun |
| 4 | 8 | BOTTOM:353 | false | false | aucun |
| 4 | 8 | BOTTOM:391 | false | false | aucun |
| 4 | 8 | BOTTOM:405 | false | false | aucun |
| 4 | 8 | BOTTOM:426 | false | false | aucun |
| 4 | 8 | BOTTOM:438 | false | false | aucun |
| 4 | 8 | BOTTOM:445 | false | false | aucun |
| 4 | 8 | BOTTOM:450 | false | false | aucun |
| 4 | 8 | BOTTOM:480 | false | false | aucun |
| 5 | 0 | BOTTOM:210 | false | false | aucun |
| 5 | 0 | BOTTOM:228 | false | false | aucun |
| 5 | 0 | BOTTOM:243 | false | false | aucun |
| 5 | 0 | BOTTOM:260 | false | false | aucun |
| 5 | 0 | BOTTOM:262 | false | false | aucun |
| 5 | 0 | BOTTOM:299 | false | false | aucun |
| 5 | 0 | BOTTOM:321 | false | false | aucun |
| 5 | 0 | BOTTOM:346 | false | false | aucun |
| 5 | 0 | BOTTOM:353 | false | false | aucun |
| 5 | 0 | BOTTOM:391 | false | false | aucun |
| 5 | 0 | BOTTOM:405 | false | false | aucun |
| 5 | 0 | BOTTOM:426 | false | false | aucun |
| 5 | 0 | BOTTOM:438 | false | false | aucun |
| 5 | 0 | BOTTOM:445 | false | false | aucun |
| 5 | 0 | BOTTOM:450 | false | false | aucun |
| 5 | 0 | BOTTOM:480 | false | false | aucun |
| 5 | 0 | BOTTOM:500 | false | false | aucun |
| 5 | 0 | BOTTOM:511 | false | false | aucun |
| 5 | 0 | BOTTOM:529 | false | false | aucun |
| 5 | 0 | BOTTOM:530 | false | false | aucun |
| 5 | 0 | BOTTOM:564 | false | false | aucun |
| 5 | 0 | BOTTOM:585 | false | false | aucun |
| 5 | 0 | BOTTOM:595 | false | false | aucun |
| 5 | 0 | BOTTOM:609 | false | false | aucun |
| 5 | 0 | BOTTOM:611 | false | false | aucun |
| 5 | 0 | BOTTOM:641 | false | false | aucun |
| 5 | 1 | TOP:170 | false | false | aucun |
| 5 | 1 | TOP:222 | false | true | 2:BOTTOM:243 |
| 5 | 1 | TOP:236 | false | false | aucun |
| 5 | 1 | TOP:265 | false | false | aucun |
| 5 | 1 | TOP:291 | false | false | aucun |
| 5 | 1 | TOP:317 | false | false | aucun |
| 5 | 1 | TOP:333 | false | false | aucun |
| 5 | 1 | TOP:345 | false | false | aucun |
| 5 | 1 | TOP:365 | false | false | aucun |
| 5 | 1 | TOP:379 | false | false | aucun |
| 5 | 1 | TOP:383 | false | false | aucun |
| 5 | 1 | TOP:411 | false | false | aucun |
| 5 | 1 | TOP:421 | false | false | aucun |
| 5 | 1 | TOP:436 | false | false | aucun |
| 5 | 1 | TOP:467 | false | false | aucun |
| 5 | 1 | TOP:474 | false | false | aucun |
| 5 | 1 | TOP:509 | false | false | aucun |
| 5 | 1 | TOP:524 | false | false | aucun |
| 5 | 1 | TOP:535 | false | false | aucun |
| 5 | 1 | TOP:555 | false | false | aucun |
| 5 | 1 | TOP:558 | false | false | aucun |
| 5 | 1 | TOP:583 | false | false | aucun |
| 5 | 1 | TOP:594 | false | false | aucun |
| 5 | 1 | TOP:605 | false | false | aucun |
| 5 | 1 | TOP:640 | false | false | aucun |
| 5 | 2 | BOTTOM:169 | false | false | aucun |
| 5 | 2 | BOTTOM:210 | false | false | aucun |
| 5 | 2 | BOTTOM:260 | false | false | aucun |
| 5 | 2 | BOTTOM:262 | false | false | aucun |
| 5 | 2 | BOTTOM:299 | false | false | aucun |
| 5 | 2 | BOTTOM:321 | false | false | aucun |
| 5 | 2 | BOTTOM:346 | false | false | aucun |
| 5 | 2 | BOTTOM:353 | false | false | aucun |
| 5 | 2 | BOTTOM:391 | false | false | aucun |
| 5 | 2 | BOTTOM:405 | false | false | aucun |
| 5 | 2 | BOTTOM:426 | false | false | aucun |
| 5 | 2 | BOTTOM:438 | false | false | aucun |
| 5 | 2 | BOTTOM:445 | false | false | aucun |
| 5 | 2 | BOTTOM:450 | false | false | aucun |
| 5 | 2 | BOTTOM:480 | false | false | aucun |
| 5 | 2 | BOTTOM:500 | false | false | aucun |
| 5 | 2 | BOTTOM:511 | false | false | aucun |
| 5 | 2 | BOTTOM:529 | false | false | aucun |
| 5 | 2 | BOTTOM:530 | false | false | aucun |
| 5 | 2 | BOTTOM:564 | false | false | aucun |
| 5 | 2 | BOTTOM:585 | false | false | aucun |
| 5 | 2 | BOTTOM:595 | false | false | aucun |
| 5 | 2 | BOTTOM:609 | false | false | aucun |
| 5 | 2 | BOTTOM:611 | false | false | aucun |
| 5 | 2 | BOTTOM:641 | false | false | aucun |
| 5 | 3 | TOP:170 | false | false | aucun |
| 5 | 3 | TOP:179 | false | false | aucun |
| 5 | 3 | TOP:195 | false | false | aucun |
| 5 | 3 | TOP:199 | false | false | aucun |
| 5 | 3 | TOP:222 | false | false | aucun |
| 5 | 3 | TOP:317 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:333 | false | true | 4:BOTTOM:346, 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:345 | false | true | 4:BOTTOM:353, 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:365 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:379 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:383 | false | true | 4:BOTTOM:391, 4:BOTTOM:405 |
| 5 | 3 | TOP:411 | false | false | aucun |
| 5 | 3 | TOP:421 | false | false | aucun |
| 5 | 3 | TOP:436 | false | false | aucun |
| 5 | 3 | TOP:467 | false | false | aucun |
| 5 | 3 | TOP:474 | false | false | aucun |
| 5 | 3 | TOP:509 | false | false | aucun |
| 5 | 3 | TOP:524 | false | false | aucun |
| 5 | 3 | TOP:535 | false | false | aucun |
| 5 | 3 | TOP:555 | false | false | aucun |
| 5 | 3 | TOP:558 | false | false | aucun |
| 5 | 3 | TOP:583 | false | false | aucun |
| 5 | 3 | TOP:594 | false | false | aucun |
| 5 | 3 | TOP:605 | false | false | aucun |
| 5 | 3 | TOP:640 | false | false | aucun |
| 5 | 4 | BOTTOM:169 | false | false | aucun |
| 5 | 4 | BOTTOM:210 | false | false | aucun |
| 5 | 4 | BOTTOM:228 | false | false | aucun |
| 5 | 4 | BOTTOM:243 | false | false | aucun |
| 5 | 4 | BOTTOM:260 | false | false | aucun |
| 5 | 4 | BOTTOM:262 | false | false | aucun |
| 5 | 4 | BOTTOM:426 | false | false | aucun |
| 5 | 4 | BOTTOM:438 | false | false | aucun |
| 5 | 4 | BOTTOM:445 | false | false | aucun |
| 5 | 4 | BOTTOM:450 | false | false | aucun |
| 5 | 4 | BOTTOM:480 | false | false | aucun |
| 5 | 4 | BOTTOM:500 | false | false | aucun |
| 5 | 4 | BOTTOM:511 | false | false | aucun |
| 5 | 4 | BOTTOM:529 | false | false | aucun |
| 5 | 4 | BOTTOM:530 | false | false | aucun |
| 5 | 4 | BOTTOM:564 | false | false | aucun |
| 5 | 4 | BOTTOM:585 | false | false | aucun |
| 5 | 4 | BOTTOM:595 | false | false | aucun |
| 5 | 4 | BOTTOM:609 | false | false | aucun |
| 5 | 4 | BOTTOM:611 | false | false | aucun |
| 5 | 4 | BOTTOM:641 | false | false | aucun |
| 5 | 5 | TOP:170 | false | false | aucun |
| 5 | 5 | TOP:179 | false | false | aucun |
| 5 | 5 | TOP:195 | false | false | aucun |
| 5 | 5 | TOP:199 | false | false | aucun |
| 5 | 5 | TOP:222 | false | false | aucun |
| 5 | 5 | TOP:236 | false | false | aucun |
| 5 | 5 | TOP:265 | false | false | aucun |
| 5 | 5 | TOP:291 | false | false | aucun |
| 5 | 5 | TOP:467 | false | false | aucun |
| 5 | 5 | TOP:474 | false | false | aucun |
| 5 | 5 | TOP:509 | false | false | aucun |
| 5 | 5 | TOP:524 | false | false | aucun |
| 5 | 5 | TOP:535 | false | false | aucun |
| 5 | 5 | TOP:555 | false | false | aucun |
| 5 | 5 | TOP:558 | false | false | aucun |
| 5 | 5 | TOP:583 | false | false | aucun |
| 5 | 5 | TOP:594 | false | false | aucun |
| 5 | 5 | TOP:605 | false | false | aucun |
| 5 | 5 | TOP:640 | false | false | aucun |
| 5 | 6 | BOTTOM:169 | false | false | aucun |
| 5 | 6 | BOTTOM:210 | false | false | aucun |
| 5 | 6 | BOTTOM:228 | false | false | aucun |
| 5 | 6 | BOTTOM:243 | false | false | aucun |
| 5 | 6 | BOTTOM:260 | false | false | aucun |
| 5 | 6 | BOTTOM:262 | false | false | aucun |
| 5 | 6 | BOTTOM:299 | false | false | aucun |
| 5 | 6 | BOTTOM:321 | false | false | aucun |
| 5 | 6 | BOTTOM:346 | false | true | 5:TOP:317, 5:TOP:333 |
| 5 | 6 | BOTTOM:353 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345 |
| 5 | 6 | BOTTOM:391 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383 |
| 5 | 6 | BOTTOM:405 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383 |
| 5 | 6 | BOTTOM:426 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383, 5:TOP:411 |
| 5 | 6 | BOTTOM:438 | false | true | 5:TOP:317, 5:TOP:333, 5:TOP:345, 5:TOP:365, 5:TOP:379, 5:TOP:383, 5:TOP:411, 5:TOP:421 |
| 5 | 6 | BOTTOM:480 | false | false | aucun |
| 5 | 6 | BOTTOM:500 | false | false | aucun |
| 5 | 6 | BOTTOM:511 | false | false | aucun |
| 5 | 6 | BOTTOM:529 | false | false | aucun |
| 5 | 6 | BOTTOM:530 | false | false | aucun |
| 5 | 6 | BOTTOM:564 | false | false | aucun |
| 5 | 6 | BOTTOM:585 | false | false | aucun |
| 5 | 6 | BOTTOM:595 | false | false | aucun |
| 5 | 6 | BOTTOM:609 | false | false | aucun |
| 5 | 6 | BOTTOM:611 | false | false | aucun |
| 5 | 6 | BOTTOM:641 | false | false | aucun |
| 5 | 7 | TOP:170 | false | false | aucun |
| 5 | 7 | TOP:179 | false | false | aucun |
| 5 | 7 | TOP:195 | false | false | aucun |
| 5 | 7 | TOP:199 | false | false | aucun |
| 5 | 7 | TOP:222 | false | false | aucun |
| 5 | 7 | TOP:236 | false | false | aucun |
| 5 | 7 | TOP:265 | false | false | aucun |
| 5 | 7 | TOP:291 | false | false | aucun |
| 5 | 7 | TOP:317 | false | false | aucun |
| 5 | 7 | TOP:333 | false | false | aucun |
| 5 | 7 | TOP:345 | false | false | aucun |
| 5 | 7 | TOP:365 | false | false | aucun |
| 5 | 7 | TOP:379 | false | false | aucun |
| 5 | 7 | TOP:383 | false | false | aucun |
| 5 | 7 | TOP:411 | false | false | aucun |
| 5 | 7 | TOP:421 | false | false | aucun |
| 5 | 7 | TOP:436 | false | false | aucun |
| 5 | 7 | TOP:509 | false | false | aucun |
| 5 | 7 | TOP:524 | false | false | aucun |
| 5 | 7 | TOP:535 | false | false | aucun |
| 5 | 7 | TOP:555 | false | false | aucun |
| 5 | 7 | TOP:558 | false | false | aucun |
| 5 | 7 | TOP:583 | false | false | aucun |
| 5 | 7 | TOP:594 | false | false | aucun |
| 5 | 7 | TOP:605 | false | false | aucun |
| 5 | 7 | TOP:640 | false | false | aucun |
| 5 | 8 | BOTTOM:169 | false | false | aucun |
| 5 | 8 | BOTTOM:210 | false | false | aucun |
| 5 | 8 | BOTTOM:228 | false | false | aucun |
| 5 | 8 | BOTTOM:243 | false | false | aucun |
| 5 | 8 | BOTTOM:260 | false | false | aucun |
| 5 | 8 | BOTTOM:262 | false | false | aucun |
| 5 | 8 | BOTTOM:299 | false | false | aucun |
| 5 | 8 | BOTTOM:321 | false | false | aucun |
| 5 | 8 | BOTTOM:346 | false | false | aucun |
| 5 | 8 | BOTTOM:353 | false | false | aucun |
| 5 | 8 | BOTTOM:391 | false | false | aucun |
| 5 | 8 | BOTTOM:405 | false | false | aucun |
| 5 | 8 | BOTTOM:426 | false | false | aucun |
| 5 | 8 | BOTTOM:438 | false | false | aucun |
| 5 | 8 | BOTTOM:445 | false | false | aucun |
| 5 | 8 | BOTTOM:450 | false | false | aucun |
| 5 | 8 | BOTTOM:480 | false | false | aucun |
| 5 | 8 | BOTTOM:511 | false | true | 9:TOP:524, 9:TOP:535, 9:TOP:555 |
| 5 | 8 | BOTTOM:529 | false | false | aucun |
| 5 | 8 | BOTTOM:530 | false | false | aucun |
| 5 | 8 | BOTTOM:564 | false | false | aucun |
| 5 | 8 | BOTTOM:585 | false | false | aucun |
| 5 | 8 | BOTTOM:595 | false | false | aucun |
| 5 | 8 | BOTTOM:609 | false | false | aucun |
| 5 | 8 | BOTTOM:611 | false | false | aucun |
| 5 | 8 | BOTTOM:641 | false | false | aucun |
| 5 | 9 | TOP:170 | false | false | aucun |
| 5 | 9 | TOP:179 | false | false | aucun |
| 5 | 9 | TOP:195 | false | false | aucun |
| 5 | 9 | TOP:199 | false | false | aucun |
| 5 | 9 | TOP:222 | false | false | aucun |
| 5 | 9 | TOP:236 | false | false | aucun |
| 5 | 9 | TOP:265 | false | false | aucun |
| 5 | 9 | TOP:291 | false | false | aucun |
| 5 | 9 | TOP:317 | false | false | aucun |
| 5 | 9 | TOP:333 | false | false | aucun |
| 5 | 9 | TOP:345 | false | false | aucun |
| 5 | 9 | TOP:365 | false | false | aucun |
| 5 | 9 | TOP:379 | false | false | aucun |
| 5 | 9 | TOP:383 | false | false | aucun |
| 5 | 9 | TOP:411 | false | false | aucun |
| 5 | 9 | TOP:421 | false | false | aucun |
| 5 | 9 | TOP:436 | false | false | aucun |
| 5 | 9 | TOP:467 | false | false | aucun |
| 5 | 9 | TOP:474 | false | false | aucun |
| 5 | 9 | TOP:558 | false | true | 10:BOTTOM:585, 10:BOTTOM:595, 10:BOTTOM:609, 10:BOTTOM:611, 10:BOTTOM:641 |
| 5 | 9 | TOP:583 | false | true | 10:BOTTOM:595, 10:BOTTOM:609, 10:BOTTOM:611, 10:BOTTOM:641 |
| 5 | 9 | TOP:594 | false | true | 10:BOTTOM:609, 10:BOTTOM:611, 10:BOTTOM:641 |
| 5 | 9 | TOP:605 | false | true | 10:BOTTOM:641 |
| 5 | 9 | TOP:640 | false | false | aucun |
| 5 | 10 | BOTTOM:169 | false | false | aucun |
| 5 | 10 | BOTTOM:210 | false | false | aucun |
| 5 | 10 | BOTTOM:228 | false | false | aucun |
| 5 | 10 | BOTTOM:243 | false | false | aucun |
| 5 | 10 | BOTTOM:260 | false | false | aucun |
| 5 | 10 | BOTTOM:262 | false | false | aucun |
| 5 | 10 | BOTTOM:299 | false | false | aucun |
| 5 | 10 | BOTTOM:321 | false | false | aucun |
| 5 | 10 | BOTTOM:346 | false | false | aucun |
| 5 | 10 | BOTTOM:353 | false | false | aucun |
| 5 | 10 | BOTTOM:391 | false | false | aucun |
| 5 | 10 | BOTTOM:405 | false | false | aucun |
| 5 | 10 | BOTTOM:426 | false | false | aucun |
| 5 | 10 | BOTTOM:438 | false | false | aucun |
| 5 | 10 | BOTTOM:445 | false | false | aucun |
| 5 | 10 | BOTTOM:450 | false | false | aucun |
| 5 | 10 | BOTTOM:480 | false | false | aucun |
| 5 | 10 | BOTTOM:500 | false | false | aucun |
| 5 | 10 | BOTTOM:511 | false | false | aucun |
| 5 | 10 | BOTTOM:529 | false | false | aucun |
| 5 | 10 | BOTTOM:530 | false | false | aucun |

## 8. Reconstructions couplées

| cycle | conditionalPosition | conditionalCandidate | neighborPosition | neighborCandidate | resultingPath | structurallyValid |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | TOP:222 | 2 | BOTTOM:243 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 1 | 1 | TOP:222 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:222\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:222\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:222\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:222\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:222\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:222\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:222\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:222\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:222\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:222\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:222\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:222\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:222\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:222\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:222\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:222\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:222\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:222\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:222\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:222\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:222\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:222\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:222 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:222\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:236\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:236\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:236\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:236\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:236\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:236\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:236\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:236\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:236\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:236\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:236\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:236\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:236\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:236\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:236\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:236\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:236\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:236\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:236\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:236\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:236\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:236\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:236 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:236\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:265\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:265\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:265\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:265\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:265\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:265\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:265\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:265\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:265\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:265\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:265\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:265\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:265\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:265\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:265\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:265\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:265\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:265\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:265\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:265\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:265 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:265\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:291\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:291\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:291\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:291\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:291\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:291\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:291\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:291\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:291\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:291\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:291\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:291\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:291\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:291\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:291\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:291\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:291\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:291\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:291\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:291\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:291 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:291\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:317\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:317\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:317\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:317\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:317\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:317\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:317\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:317\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:317\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:317\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:317\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:317\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:317\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:317\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:317\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:317\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:317\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:317\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:317 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:317\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:333\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:333\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:333\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:333\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:333\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:333\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:333\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:333\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:333\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:333\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:333\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:333\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:333\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:333\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:333\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:333\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:333\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:333\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:333 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:333\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:345\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:345\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:345\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:345\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:345\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:345\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:345\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:345\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:345\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:345\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:345\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:345\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:345\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:345\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:345\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:345\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:345\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:345 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:345\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:365\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:365\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:365\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:365\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:365\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:365\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:365\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:365\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:365\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:365\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:365\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:365\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:365\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:365\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:365\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:365\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:365 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:365\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:379\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:379\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:379\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:379\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:379\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:379\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:379\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:379\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:379\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:379\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:379\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:379\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:379\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:379\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:379\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:379\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:379 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:379\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:383\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:383\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:383\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:383\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:383\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:383\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:383\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:383\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:383\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:383\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:383\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:383\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:383\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:383\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:383\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:383\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:383 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:383\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:411\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:411\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:411\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:411\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:411\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:411\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:411\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:411\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:411\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:411\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:411\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:411\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:411\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:411\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:411 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:411\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:421\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:421\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:421\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:421\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:421\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:421\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:421\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:421\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:421\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:421\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:421\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:421\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:421\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:421 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:421\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:436\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:436\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:436\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:436\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:436\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:436\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:436\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:436\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:436\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:436\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:436\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:436\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:436 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:436\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:467\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:467\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:467\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:467\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:467\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:467\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:467\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:467\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:467\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:467\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:467 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:467\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:474\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:474\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:474\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:474\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:474\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:474\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:474\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:474\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:474\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:474 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:474\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:509\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:509\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:509\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:509\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:509\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:509\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:509\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:509 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:509\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:524\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:524\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:524\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:524\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:524\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:524 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:524\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:535\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:535\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:535\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:535\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:535\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:535 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:535\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:555\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:555\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:555\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:555\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:555\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:555 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:555\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:558 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:558\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:558 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:558\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:558 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:558\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:558 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:558\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:558 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:558\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:583 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:583\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:583 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:583\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:583 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:583\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:583 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:583\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:594 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:594\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:594 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:594\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:594 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:594\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 1 | 1 | TOP:605 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:605\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:243 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 2 | 1 | TOP:222 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:222\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:222\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:222\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:222\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:222\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:222\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:222\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:222\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:222\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:222\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:222\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:222\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:222\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:222\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:222\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:222\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:222\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:222\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:222\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:222\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:222\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:222\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:222 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:222\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:236\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:236\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:236\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:236\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:236\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:236\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:236\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:236\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:236\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:236\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:236\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:236\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:236\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:236\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:236\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:236\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:236\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:236\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:236\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:236\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:236\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:236\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:236 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:236\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:265\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:265\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:265\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:265\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:265\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:265\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:265\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:265\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:265\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:265\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:265\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:265\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:265\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:265\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:265\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:265\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:265\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:265\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:265\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:265\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:265 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:265\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:291\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:291\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:291\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:291\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:291\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:291\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:291\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:291\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:291\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:291\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:291\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:291\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:291\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:291\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:291\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:291\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:291\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:291\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:291\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:291\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:291 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:291\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:317\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:317\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:317\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:317\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:317\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:317\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:317\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:317\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:317\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:317\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:317\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:317\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:317\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:317\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:317\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:317\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:317\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:317\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:317 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:317\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:333\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:333\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:333\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:333\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:333\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:333\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:333\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:333\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:333\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:333\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:333\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:333\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:333\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:333\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:333\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:333\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:333\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:333\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:333 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:333\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:345\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:345\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:345\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:345\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:345\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:345\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:345\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:345\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:345\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:345\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:345\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:345\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:345\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:345\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:345\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:345\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:345\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:345 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:345\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:365\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:365\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:365\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:365\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:365\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:365\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:365\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:365\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:365\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:365\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:365\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:365\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:365\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:365\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:365\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:365\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:365 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:365\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:379\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:379\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:379\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:379\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:379\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:379\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:379\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:379\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:379\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:379\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:379\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:379\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:379\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:379\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:379\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:379\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:379 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:379\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:383\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:383\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:383\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:383\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:383\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:383\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:383\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:383\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:383\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:383\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:383\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:383\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:383\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:383\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:383\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:383\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:383 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:383\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:411\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:411\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:411\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:411\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:411\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:411\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:411\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:411\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:411\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:411\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:411\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:411\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:411\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:411\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:411 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:411\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:421\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:421\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:421\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:421\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:421\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:421\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:421\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:421\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:421\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:421\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:421\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:421\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:421\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:421 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:421\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:436\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:436\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:436\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:436\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:436\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:436\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:436\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:436\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:436\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:436\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:436\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:436\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:436 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:436\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:467\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:467\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:467\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:467\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:467\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:467\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:467\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:467\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:467\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:467\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:467 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:467\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:474\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:474\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:474\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:474\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:474\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:474\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:474\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:474\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:474\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:474 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:474\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:509\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:509\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:509\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:509\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:509\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:509\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:509\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:509 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:509\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:524\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:524\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:524\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:524\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:524\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:524 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:524\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:535\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:535\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:535\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:535\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:535\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:535 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:535\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:555\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:555\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:555\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:555\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:555\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:555 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:555\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:558 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:558\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:558 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:558\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:558 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:558\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:558 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:558\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:558 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:558\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:583 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:583\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:583 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:583\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:583 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:583\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:583 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:583\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:594 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:594\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:594 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:594\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:594 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:594\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 1 | TOP:605 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:605\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:346\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:317 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:346\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:333 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:345 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:365 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:379 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:383 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:411 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:421 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:436 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:467 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:474 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:509 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:524 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:535 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:555 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:558 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:558 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:558 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:558 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:558 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:583 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:583 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:583 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:583 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:594 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:594 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:594 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 2 | 3 | TOP:605 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:605\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:243 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 1 | TOP:222 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:222\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:222\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:222\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:222\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:222\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:222\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:222\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:222\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:222\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:222\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:222\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:222\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:222\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:222\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:222\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:222\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:222\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:222\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:222\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:222\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:222\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:222\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:222 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:222\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:236\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:236\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:236\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:236\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:236\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:236\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:236\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:236\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:236\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:236\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:236\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:236\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:236\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:236\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:236\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:236\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:236\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:236\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:236\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:236\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:236\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:236\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:236 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:236\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:265\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:265\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:265\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:265\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:265\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:265\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:265\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:265\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:265\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:265\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:265\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:265\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:265\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:265\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:265\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:265\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:265\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:265\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:265\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:265\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:265 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:265\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:291\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:291\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:291\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:291\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:291\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:291\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:291\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:291\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:291\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:291\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:291\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:291\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:291\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:291\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:291\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:291\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:291\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:291\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:291\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:291\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:291 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:291\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:317\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:317\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:317\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:317\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:317\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:317\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:317\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:317\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:317\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:317\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:317\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:317\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:317\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:317\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:317\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:317\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:317\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:317\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:317 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:317\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:333\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:333\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:333\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:333\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:333\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:333\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:333\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:333\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:333\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:333\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:333\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:333\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:333\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:333\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:333\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:333\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:333\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:333\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:333 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:333\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:345\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:345\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:345\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:345\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:345\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:345\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:345\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:345\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:345\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:345\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:345\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:345\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:345\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:345\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:345\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:345\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:345\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:345 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:345\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:365\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:365\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:365\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:365\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:365\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:365\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:365\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:365\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:365\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:365\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:365\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:365\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:365\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:365\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:365\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:365\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:365 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:365\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:379\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:379\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:379\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:379\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:379\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:379\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:379\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:379\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:379\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:379\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:379\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:379\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:379\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:379\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:379\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:379\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:379 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:379\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:383\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:383\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:383\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:383\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:383\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:383\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:383\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:383\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:383\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:383\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:383\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:383\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:383\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:383\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:383\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:383\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:383 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:383\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:411\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:411\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:411\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:411\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:411\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:411\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:411\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:411\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:411\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:411\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:411\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:411\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:411\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:411\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:411 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:411\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:421\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:421\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:421\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:421\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:421\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:421\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:421\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:421\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:421\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:421\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:421\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:421\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:421\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:421 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:421\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:436\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:436\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:436\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:436\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:436\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:436\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:436\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:436\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:436\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:436\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:436\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:436\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:436 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:436\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:467\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:467\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:467\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:467\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:467\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:467\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:467\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:467\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:467\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:467\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:467 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:467\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:474\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:474\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:474\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:474\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:474\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:474\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:474\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:474\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:474\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:474 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:474\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:509\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:509\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:509\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:509\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:509\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:509\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:509\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:509 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:509\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:524\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:524\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:524\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:524\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:524\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:524 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:524\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:535\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:535\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:535\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:535\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:535\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:535 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:535\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:555\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:555\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:555\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:555\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:555\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:555 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:555\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:558 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:558\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:558 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:558\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:558 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:558\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:558 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:558\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:558 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:558\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:583 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:583\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:583 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:583\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:583 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:583\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:583 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:583\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:594 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:594\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:594 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:594\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:594 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:594\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 1 | TOP:605 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:605\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:346\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:317 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:346\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:333 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:345 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:365 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:379 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:391\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:405\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:383 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:426\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:411 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:438\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:421 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:445\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:450\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:436 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:480\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:467 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:500\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:511\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:474 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:529\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:530\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:509 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:524 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:535 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:564\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:555 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:558 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:585\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:558 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:558 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:558 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:558 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:583 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:595\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:583 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:583 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:583 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:594 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:609\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:594 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:611\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:594 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 3 | TOP:605 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:605\|BOTTOM:641\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 4 | BOTTOM:346 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:365\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 4 | BOTTOM:346 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:379\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 4 | BOTTOM:346 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:383\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:411 | 6 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:411 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:411 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:411 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:411 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:411 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:421 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:421 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:421 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:421 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:436 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 3 | 5 | TOP:436 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:436 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:467 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:474 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:509 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:524 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:535 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:555 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:558 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:558 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:558 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:558 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:558 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:583 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:583 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:583 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:583 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:594 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:594 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:594 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 3 | 5 | TOP:605 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:605\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:243 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 1 | TOP:222 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:222\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:222\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:222\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:222\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:222\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:222\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:222\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:222\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:222\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:222\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:222\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:222\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:222\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:222\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:222\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:222\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:222\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:222\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:222\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:222\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:222\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:222\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:222 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:222\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:236\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:236\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:236\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:236\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:236\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:236\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:236\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:236\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:236\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:236\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:236\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:236\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:236\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:236\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:236\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:236\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:236\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:236\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:236\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:236\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:236\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:236\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:236 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:236\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:265\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:265\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:265\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:265\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:265\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:265\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:265\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:265\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:265\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:265\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:265\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:265\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:265\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:265\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:265\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:265\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:265\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:265\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:265\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:265\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:265 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:265\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:291\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:291\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:291\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:291\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:291\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:291\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:291\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:291\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:291\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:291\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:291\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:291\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:291\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:291\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:291\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:291\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:291\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:291\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:291\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:291\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:291 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:291\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:317\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:317\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:317\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:317\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:317\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:317\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:317\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:317\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:317\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:317\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:317\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:317\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:317\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:317\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:317\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:317\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:317\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:317\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:317 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:317\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:333\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:333\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:333\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:333\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:333\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:333\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:333\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:333\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:333\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:333\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:333\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:333\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:333\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:333\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:333\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:333\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:333\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:333\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:333 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:333\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:345\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:345\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:345\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:345\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:345\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:345\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:345\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:345\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:345\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:345\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:345\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:345\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:345\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:345\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:345\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:345\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:345\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:345 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:345\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:365\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:365\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:365\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:365\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:365\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:365\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:365\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:365\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:365\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:365\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:365\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:365\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:365\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:365\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:365\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:365\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:365 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:365\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:379\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:379\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:379\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:379\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:379\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:379\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:379\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:379\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:379\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:379\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:379\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:379\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:379\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:379\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:379\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:379\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:379 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:379\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:383\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:383\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:383\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:383\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:383\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:383\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:383\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:383\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:383\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:383\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:383\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:383\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:383\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:383\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:383\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:383\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:383 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:383\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:411\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:411\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:411\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:411\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:411\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:411\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:411\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:411\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:411\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:411\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:411\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:411\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:411\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:411\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:411 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:411\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:421\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:421\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:421\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:421\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:421\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:421\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:421\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:421\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:421\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:421\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:421\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:421\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:421\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:421 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:421\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:436\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:436\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:436\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:436\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:436\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:436\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:436\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:436\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:436\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:436\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:436\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:436\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:436 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:436\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:467\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:467\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:467\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:467\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:467\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:467\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:467\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:467\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:467\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:467\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:467 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:467\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:474\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:474\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:474\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:474\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:474\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:474\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:474\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:474\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:474\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:474 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:474\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:509\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:509\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:509\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:509\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:509\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:509\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:509\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:509 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:509\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:524\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:524\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:524\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:524\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:524\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:524 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:524\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:535\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:535\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:535\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:535\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:535\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:535 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:535\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:555\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:555\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:555\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:555\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:555\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:555 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:555\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:558 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:558\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:558 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:558\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:558 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:558\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:558 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:558\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:558 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:558\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:583 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:583\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:583 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:583\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:583 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:583\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:583 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:583\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:594 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:594\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:594 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:594\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:594 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:594\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 1 | TOP:605 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:605\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:346\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:317 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:317 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:317 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:317 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:317 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:346\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:333 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:333 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:333 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:333 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:333 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:345 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:345 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:345 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:345 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:365 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:365 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:365 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:379 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:379 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:379 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:383 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 3 | TOP:383 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:383 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:411 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:421 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:436 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:467 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:474 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:509 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:524 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:535 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:555 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:558 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:558 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:558 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:558 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:558 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:583 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:583 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:583 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:583 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:594 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:594 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:594 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 3 | TOP:605 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:605\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 4 | BOTTOM:346 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:365\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 4 | BOTTOM:346 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:379\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 4 | BOTTOM:346 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:383\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:411 | 6 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:411 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:411 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:411 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:411 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:411 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:421 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:421 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:421 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:421 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:436 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 5 | TOP:436 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:436 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:467 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:474 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:509 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:524 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:535 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:555 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:558 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:558 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:558 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:558 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:558 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:583 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:583 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:583 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:583 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:594 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:594 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:594 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 5 | TOP:605 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:605\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 4 | 6 | BOTTOM:346 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:346\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:346 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:346\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:353 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:353 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:353 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:391 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:405 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:426 | 5 | TOP:411 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:411 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 6 | BOTTOM:438 | 5 | TOP:421 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 4 | 7 | TOP:509 | 8 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:529\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:530\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:509 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:524 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:535 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:555 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:558 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:558 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:558 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:558 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:558 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:583 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:583 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:583 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:583 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:594 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:594 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:594 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 4 | 7 | TOP:605 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:605\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:243 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 1 | TOP:222 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:222\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:222\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:222\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:222\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:222\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:222\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:222\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:222\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:222\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:222\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:222\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:222\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:222\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:222\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:222\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:222\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:222\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:222\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:222\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:222\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:222\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:222\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:222 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:222\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:260 | BOTTOM:169\|TOP:236\|BOTTOM:260\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:262 | BOTTOM:169\|TOP:236\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:236\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:236\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:236\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:236\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:236\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:236\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:236\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:236\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:236\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:236\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:236\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:236\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:236\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:236\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:236\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:236\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:236\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:236\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:236\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:236\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:236 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:236\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:265\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:265\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:265\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:265\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:265\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:265\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:265\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:265\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:265\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:265\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:265\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:265\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:265\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:265\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:265\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:265\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:265\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:265\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:265\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:265\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:265 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:265\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:299 | BOTTOM:169\|TOP:291\|BOTTOM:299\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:321 | BOTTOM:169\|TOP:291\|BOTTOM:321\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:291\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:291\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:291\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:291\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:291\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:291\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:291\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:291\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:291\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:291\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:291\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:291\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:291\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:291\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:291\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:291\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:291\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:291\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:291 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:291\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:317\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:317\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:317\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:317\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:317\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:317\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:317\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:317\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:317\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:317\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:317\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:317\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:317\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:317\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:317\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:317\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:317\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:317\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:317 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:317\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:346 | BOTTOM:169\|TOP:333\|BOTTOM:346\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:333\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:333\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:333\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:333\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:333\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:333\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:333\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:333\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:333\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:333\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:333\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:333\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:333\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:333\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:333\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:333\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:333\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:333 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:333\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:353 | BOTTOM:169\|TOP:345\|BOTTOM:353\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:345\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:345\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:345\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:345\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:345\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:345\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:345\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:345\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:345\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:345\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:345\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:345\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:345\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:345\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:345\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:345\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:345 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:345\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:365\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:365\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:365\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:365\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:365\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:365\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:365\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:365\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:365\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:365\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:365\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:365\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:365\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:365\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:365\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:365\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:365 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:365\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:379\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:379\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:379\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:379\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:379\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:379\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:379\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:379\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:379\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:379\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:379\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:379\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:379\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:379\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:379\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:379\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:379 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:379\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:391 | BOTTOM:169\|TOP:383\|BOTTOM:391\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:405 | BOTTOM:169\|TOP:383\|BOTTOM:405\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:383\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:383\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:383\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:383\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:383\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:383\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:383\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:383\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:383\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:383\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:383\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:383\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:383\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:383\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:383 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:383\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:426 | BOTTOM:169\|TOP:411\|BOTTOM:426\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:411\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:411\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:411\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:411\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:411\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:411\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:411\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:411\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:411\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:411\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:411\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:411\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:411\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:411 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:411\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:438 | BOTTOM:169\|TOP:421\|BOTTOM:438\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:421\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:421\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:421\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:421\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:421\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:421\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:421\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:421\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:421\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:421\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:421\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:421\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:421 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:421\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:445 | BOTTOM:169\|TOP:436\|BOTTOM:445\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:450 | BOTTOM:169\|TOP:436\|BOTTOM:450\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:436\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:436\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:436\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:436\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:436\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:436\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:436\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:436\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:436\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:436\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:436 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:436\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:480 | BOTTOM:169\|TOP:467\|BOTTOM:480\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:467\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:467\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:467\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:467\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:467\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:467\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:467\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:467\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:467\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:467 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:467\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:500 | BOTTOM:169\|TOP:474\|BOTTOM:500\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:511 | BOTTOM:169\|TOP:474\|BOTTOM:511\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:474\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:474\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:474\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:474\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:474\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:474\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:474\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:474 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:474\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:529 | BOTTOM:169\|TOP:509\|BOTTOM:529\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:530 | BOTTOM:169\|TOP:509\|BOTTOM:530\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:509\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:509\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:509\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:509\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:509\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:509 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:509\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:524\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:524\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:524\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:524\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:524\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:524 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:524\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:535\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:535\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:535\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:535\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:535\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:535 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:535\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:564 | BOTTOM:169\|TOP:555\|BOTTOM:564\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:555\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:555\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:555\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:555\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:555 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:555\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:558 | 2 | BOTTOM:585 | BOTTOM:169\|TOP:558\|BOTTOM:585\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:558 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:558\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:558 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:558\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:558 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:558\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:558 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:558\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:583 | 2 | BOTTOM:595 | BOTTOM:169\|TOP:583\|BOTTOM:595\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:583 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:583\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:583 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:583\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:583 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:583\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:594 | 2 | BOTTOM:609 | BOTTOM:169\|TOP:594\|BOTTOM:609\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:594 | 2 | BOTTOM:611 | BOTTOM:169\|TOP:594\|BOTTOM:611\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:594 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:594\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 1 | TOP:605 | 2 | BOTTOM:641 | BOTTOM:169\|TOP:605\|BOTTOM:641\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:346\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:317 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:317 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:317 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:317 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:317 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:317\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:346 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:346\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:333 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:333 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:333 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:333 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:333 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:333\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:353 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:353\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:345 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:345 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:345 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:345 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:345\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:365 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:365 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:365 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:365\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:379 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:379 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:379 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:379\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:391 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:391\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:383 | 4 | BOTTOM:405 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:405\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 3 | TOP:383 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:383 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:383\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:426\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:411 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:411\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:438\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:421 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:421\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:445\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:450\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:436 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:436\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:480\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:467 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:467\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:500\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:511\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:474 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:474\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:529\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:530\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:509 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:509\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:524 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:524\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:535 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:535\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:564\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:555 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:555\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:558 | 4 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:585\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:558 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:558 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:558 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:558 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:558\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:583 | 4 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:595\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:583 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:583 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:583 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:583\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:594 | 4 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:609\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:594 | 4 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:611\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:594 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:594\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 3 | TOP:605 | 4 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:605\|BOTTOM:641\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 4 | BOTTOM:346 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:365\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 4 | BOTTOM:346 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:379\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 4 | BOTTOM:346 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:346\|TOP:383\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:411 | 6 | BOTTOM:426 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:411 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:411 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:411 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:411 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:411 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:438 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:421 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:421 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:421 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:421 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:445 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:436 | 6 | BOTTOM:450 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 5 | TOP:436 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:436 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:480 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:480\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:467 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:467\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:500 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:500\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:511 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:511\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:474 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:474\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:529\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:530\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:509 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:509\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:524 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:524\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:535 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:535\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:564\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:555 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:555\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:558 | 6 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:585\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:558 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:558 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:558 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:558 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:558\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:583 | 6 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:595\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:583 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:583 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:583 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:583\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:594 | 6 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:609\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:594 | 6 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:611\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:594 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:594\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 5 | TOP:605 | 6 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:605\|BOTTOM:641\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false |
| 5 | 6 | BOTTOM:346 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:346\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:346 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:346\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:353 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:353 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:353 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:353\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:391 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:405 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:405\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:426 | 5 | TOP:411 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:426\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:317 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:317\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:333 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:345 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:345\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:365 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:365\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:379 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:379\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:383 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:383\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:411 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:411\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 6 | BOTTOM:438 | 5 | TOP:421 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:421\|BOTTOM:438\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | true |
| 5 | 7 | TOP:509 | 8 | BOTTOM:529 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:529\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:530 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:530\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:509 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:509\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:524 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:524\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:535 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:535\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:564\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:555 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:555\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:558 | 8 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:585\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:558 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:558 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:558 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:558 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:558\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:583 | 8 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:595\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:583 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:583 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:583 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:583\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:594 | 8 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:609\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:594 | 8 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:611\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:594 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:594\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 7 | TOP:605 | 8 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:605\|BOTTOM:641\|TOP:509\|BOTTOM:564 | false |
| 5 | 8 | BOTTOM:511 | 9 | TOP:524 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:511\|TOP:524\|BOTTOM:564 | true |
| 5 | 8 | BOTTOM:511 | 9 | TOP:535 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:511\|TOP:535\|BOTTOM:564 | true |
| 5 | 8 | BOTTOM:511 | 9 | TOP:555 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:511\|TOP:555\|BOTTOM:564 | true |
| 5 | 9 | TOP:558 | 10 | BOTTOM:585 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:558\|BOTTOM:585 | true |
| 5 | 9 | TOP:558 | 10 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:558\|BOTTOM:595 | true |
| 5 | 9 | TOP:558 | 10 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:558\|BOTTOM:609 | true |
| 5 | 9 | TOP:558 | 10 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:558\|BOTTOM:611 | true |
| 5 | 9 | TOP:558 | 10 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:558\|BOTTOM:641 | true |
| 5 | 9 | TOP:583 | 10 | BOTTOM:595 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:583\|BOTTOM:595 | true |
| 5 | 9 | TOP:583 | 10 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:583\|BOTTOM:609 | true |
| 5 | 9 | TOP:583 | 10 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:583\|BOTTOM:611 | true |
| 5 | 9 | TOP:583 | 10 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:583\|BOTTOM:641 | true |
| 5 | 9 | TOP:594 | 10 | BOTTOM:609 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:594\|BOTTOM:609 | true |
| 5 | 9 | TOP:594 | 10 | BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:594\|BOTTOM:611 | true |
| 5 | 9 | TOP:594 | 10 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:594\|BOTTOM:641 | true |
| 5 | 9 | TOP:605 | 10 | BOTTOM:641 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:605\|BOTTOM:641 | true |

## 9. Comparaison GT A/B par cycle

| cycle | bestGtA | bestGtB | delta |
| --- | --- | --- | --- |
| 1 | 3/11 | 3/11 | 0 |
| 2 | 3/11 | 3/11 | 0 |
| 3 | 3/11 | 3/11 | 0 |
| 4 | 2/11 | 3/11 | 1 |
| 5 | 2/11 | 4/11 | 2 |

## 10. Coût combinatoire

| statesRatio | reconstructionRatio | elapsedRatio | additionalStates | additionalReconstructions |
| --- | --- | --- | --- | --- |
| 14.948033707865168 | 2.488299531981279 | 1.322571859932079 | 39724 | 2862 |

## 11. Résultat end-to-end

Meilleur GT: 3/11→4/11. Active final: 1/11→2/11. TOP:558 structural recovery=true; final selection=false.

## 12. Réponses Q1–Q12

| question | answer | proof |
| --- | --- | --- |
| Q1 Baseline conservée | OUI | 0 régression(s) |
| Q2 TOP:558 invalide seul | OUI | trace promotion cycle 5 position 9 |
| Q3 TOP:558 récupéré en couple | OUI | 1 reconstruction(s) valide(s) |
| Q4 TOP:558+BOTTOM:611 valide | OUI | 1/15 essais valides |
| Q5 Améliore GT count | OUI | comparaison au activePath avant reconstruction |
| Q6 Sélection choisit amélioration | NON | SYSTEM_B_COUPLED_SCORE_TIE |
| Q7 Best GT B supérieur | OUI | 3/11→4/11 |
| Q8 ActivePath final B | MEILLEUR | 1/11→2/11 |
| Q9 Faux conditionnels | 74 | 75 total, 1 GT |
| Q10 Coût | +39724 états; +2862 reconstructions | ratios états=14.948033707865168, reconstructions=2.488299531981279 |
| Q11 Autres GT structurels récupérés | NON | 9:TOP:558 |
| Q12 Valider parfois au segment | OUI | TOP:558 invalide seul produit un chemin couplé valide sans suppression des garde-fous. |

## 13. Verdict

**COUPLED_ELIGIBILITY_IMPROVES_END_TO_END**

## 14. Recommandation expérimentale

Approfondir sur plusieurs datasets avant toute décision de production; ne rien promouvoir ici.

## Validation

A et B réellement exécutés. Aucun changement de critères, veto, poids, vote, sélection, DP V1, DP V2, current_filters, RAW detector ou pipeline. La validation structurelle finale reste obligatoire; aucune génération cartésienne RAW globale.

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='COUPLED_STRUCTURAL_ELIGIBILITY_AB'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
