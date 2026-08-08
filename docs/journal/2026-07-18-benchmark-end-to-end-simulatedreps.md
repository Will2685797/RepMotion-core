# Calibration V2.5 — Benchmark end-to-end (simulatedReps) et bilan de phase

## Résumé de la séance
Correction du trou méthodologique majeur découvert le 16 juillet : le
Calibration Benchmark ne mesurait que l'écart de comptage Selected
(selectedCountScore), jamais le résultat réel du Cycle Analyzer. Le
benchmark a été étendu pour appeler calculateCalibration() puis
analyzeBottomTopBottomCycles() sur chaque dataset × chaque configuration,
et mesurer simulatedReps réellement.

## Ce qui était déjà établi avant cette séance
- Le Cycle Analyzer compte correctement en alternance stricte B→T→B→T.
- La Calibration retourne 13 événements (7 bottoms/6 tops) sur
  rowing_5reps_005.json au lieu des 11 attendus (6/5).
- Les graphes des 4 ruptures d'alternance montrent que ce ne sont pas de
  simples petits rebonds (ratios d'amplitude 42% à 104% d'un cycle normal).
- H1 (MIN_DISTANCE compare à travers un événement opposé confirmé entre
  deux candidats du même type) testée sur 437 conflits : pas de lien
  significatif global avec les ruptures (23% vs 31% de taux de rupture).
- MIN_DISTANCE élimine à lui seul ~95% des candidats RAW ; PROMINENCE et
  DIRECTION_CHANGE n'éliminent presque rien de plus après lui.
- MIN_DISTANCE choisit toujours l'extremum le plus marqué de sa fenêtre,
  jamais un choix incohérent — sa règle locale est correcte.
- Sur rowing_005 : le Cycle Analyzer ne trouve que 2 reps sur 5 (pas 6 sur
  5 comme on le croyait) — il rejette des cycles à cause de transitions
  devenues trop courtes après ses propres remplacements en cascade.
- Le score de benchmark historique (Selected) ne détecte pas ce problème :
  un écart Selected de seulement 2 peut cacher un effondrement complet du
  comptage réel de reps.
- rowing_002 (alternance propre dès la Calibration) : 11 Selected, 0
  remplacement, 0 rejet, 5/5 reps parfaites — le Cycle Analyzer fonctionne
  très bien quand la Calibration lui fournit une bonne alternance.
- Nuance H1 : globalement (437 conflits), le mécanisme "traverse un
  événement opposé confirmé" n'est pas un bon prédicteur de rupture. Mais
  localement, sur rowing_005 précisément, ce même mécanisme explique bien
  les 4 ruptures qui, elles, causent un vrai dégât (2 reps au lieu de 5).
  Les deux résultats ne sont pas contradictoires : unités d'analyse
  différentes (conflits individuels vs ruptures finales d'un seul dataset).
- Piste ouverte, non encore testée : hasLocalOppositeSelectedNeighbor
  (82/103 cas true/false ont un voisin protecteur du type opposé
  immédiatement adjacent au gagnant) pourrait être le vrai facteur
  discriminant entre conflit anodin et conflit qui casse l'alternance.
  À vérifier sur les 31 cas true/true pour comparaison.
- Analyse contrefactuelle sur les 103 cas true/false : 41 cas
  LOSER_WORSENS_ALTERNATION contre seulement 7 LOSER_IMPROVES_ALTERNATION.
  Sur rowing_002 (parfait), les 10 cas analysés sont TOUS
  LOSER_WORSENS_ALTERNATION. Conclusion : une règle simple "ne jamais
  mettre en concurrence si un opposé existe entre eux" serait dangereuse
  et casserait des cas qui fonctionnent actuellement bien.

## Nouveau benchmark end-to-end — ce qui a changé
Le Calibration Benchmark appelle maintenant, pour chaque dataset × chaque
configuration :
```
calculateCalibration()
→ selectedBottomIndexes / selectedTopIndexes
→ analyzeBottomTopBottomCycles()
→ simulatedReps
```
avec paramètres Cycle Analyzer fixes (minRepDuration=45,
minConcentricDuration=8, minEccentricDuration=8).

Nouvelles métriques par dataset/config : selectedCountScore (ancienne
métrique conservée), alternationBreakCount, simulatedReps, repDifference,
cycleAnalyzerStatus, usedBottoms, usedTops, ignoredEventsCount.

Nouveaux agrégats par configuration : totalRepDifference,
datasetsExactRepCount, datasetsMissing, datasetsTooMany,
totalAlternationBreaks, totalSelectedCountScore, avgSimulatedReps.

Nouveau classement principal : totalRepDifference (croissant) en premier
critère, plus totalSelectedCountScore en diagnostic secondaire.

## Résultat — découverte majeure de la séance

Volume exécuté : 588 configurations × 10 datasets = 5880 appels Calibration
+ 5880 appels Cycle Analyzer.

**Meilleure configuration end-to-end trouvée (identique à l'ancienne
meilleure selon selectedCountScore — ranking inchangé) :**
```
minimumDistanceSamples: 70
minimumProminenceRatio: 0.08
peakWindowSize: 8
prominenceWindowSize: 8
smoothingWindowSize: 2
```

**Agrégats de cette meilleure configuration :**
- totalRepDifference: 19
- datasetsExactRepCount: 1 seul dataset sur 10 compte exactement
- datasetsMissing: 9 sur 10
- datasetsTooMany: 0
- totalAlternationBreaks: 20
- avgSimulatedReps: 3.1 (sur 5 attendues en moyenne)

**Conclusion critique : même la meilleure configuration disponible dans
toute la grille testée jusqu'ici ne retrouve en moyenne que 3.1 reps sur 5.
9 datasets sur 10 sont en sous-comptage (MISSING). Le score historique de
"9" (qui semblait presque bon) cachait complètement cette réalité.**

Détail rowing_005 avec cette configuration : usedBottoms=3, usedTops=3,
ignoredEvents=7 — plus de la moitié des 13 Selected sont simplement jetés
par le Cycle Analyzer, jamais utilisés dans un cycle reconstruit.

## Ce que ça signifie pour la suite
Le fait que le classement ne change pas (la config qui minimise l'écart
Selected est aussi celle qui minimise le mieux l'écart de reps réel, même
si insuffisamment) suggère que le problème n'est pas un mauvais réglage
de paramètres. Aucune combinaison testée dans la grille actuelle ne
suffit à résoudre le problème — cohérent avec la découverte que la
logique de sélection est structurellement insuffisante (MIN_DISTANCE
correct localement, mais aveugle à la cohérence de séquence combinée).

## Prochaine étape
Étendre l'analyse candidat-par-candidat (comme celle faite sur rowing_005)
à 2-3 autres datasets en statut MISSING, pour vérifier si le même
mécanisme de rupture d'alternance domine partout ou si différents
datasets échouent pour des raisons différentes. En parallèle, vérifier
hasLocalOppositeSelectedNeighbor sur les 31 cas true/true (question
laissée ouverte depuis la dernière séance) pour clore la piste H1 avec
certitude avant de concevoir toute correction algorithmique.
