# Calibration V2.5 — Séance H1 : test et réfutation

## Contexte
Suite au diagnostic qualitatif du 2026-07-11 (rupture d'alternance sur
rowing_5reps_005.json), une hypothèse structurelle a été formulée et
testée ce soir sur l'ensemble des datasets disponibles.

## Hypothèse testée (H1)
Lorsqu'un conflit MIN_DISTANCE compare deux candidats du même type alors
qu'un événement final confirmé du type opposé existe entre eux, ce conflit
est plus susceptible de contribuer à une rupture d'alternance finale.

H0 (nulle) : la présence d'un événement opposé confirmé entre les deux
candidats n'est pas associée à une fréquence différente de rupture.

## Protocole
- Runner de diagnostic en lecture seule (minDistanceH1Runner.ts), aucune
  modification de calibration.ts ni de la logique fonctionnelle.
- Population : tous les conflits MIN_DISTANCE réellement déclenchés
  (conflictWithIndex défini), dédupliqués par clé canonique
  `datasetName:type:minIndex:maxIndex`, sur tous les datasets disponibles.
- Configuration fixe : rawDetectionStrategy="local_extrema",
  minimumDistanceSamples=70, minimumProminenceRatio=0.08,
  peakWindowSize=8, smoothingWindowSize=2, prominenceWindowSize=8.
- Variables mesurées : crossesOppositeConfirmedEvent,
  winnerSurvivesFinalSelection, contributesToAlternationBreak (calculée
  uniquement si le gagnant survit dans la sélection finale).

## Résultat — Matrice globale (437 conflits uniques analysés)

| crossesOppositeConfirmedEvent | contributesToAlternationBreak | count |
|---|---|---|
| true  | true  | 31  |
| true  | false | 103 |
| false | true  | 95  |
| false | false | 208 |

Taux de rupture si crosses=true : 23.13%
Taux de rupture si crosses=false : 31.35%

## Conclusion
H1 est réfutée dans sa formulation actuelle. Le taux de rupture est même
légèrement plus faible quand un événement opposé confirmé est traversé,
soit l'inverse de ce que H1 prédisait. L'effet est faible en amplitude
(~8 points) et ne constitue pas un mécanisme causal démontré.

Observation notable non testée formellement : forte hétérogénéité par
dataset. rowing_5reps_002 et rowing_5reps_004 ont 0 cas true/true, alors
que rowing_5reps_005 (11) et rowing_5reps_003 (7) concentrent plus de la
moitié des cas. Suggère une cause spécifique à certains enregistrements
plutôt qu'un défaut structurel général du filtre.

## Bilan de la phase d'investigation (mise à jour)

### Réfuté
- ❌ Changer le générateur RAW (V2.5, smoothing) améliore le résultat
- ❌ MIN_DISTANCE choisit mal parmi ses candidats en conflit
- ❌ Toutes les ruptures d'alternance sont de simples petits rebonds
- ❌ H1 : traverser un événement opposé confirmé cause la rupture

### Confirmé / mesuré
- ✅ MIN_DISTANCE élimine l'immense majorité des candidats RAW (~95%)
- ✅ MIN_DISTANCE applique correctement sa propre règle (garde le meilleur
  extremum de sa fenêtre, systématiquement)
- ✅ PROMINENCE et DIRECTION_CHANGE ont un impact marginal sur plusieurs
  datasets testés
- ✅ Les ruptures d'alternance existent réellement dans la sélection finale
- ✅ La fréquence des cas suspects (true/true) varie fortement d'un
  dataset à l'autre, même pour le même exercice

### Reste ouvert
- ❓ Pourquoi des extrema individuellement cohérents produisent-ils une
  séquence finale incorrecte ?
- ❓ Le problème est-il dans la sélection, dans l'interaction entre
  filtres, ou plus loin dans le pipeline (Cycle Analyzer) ?
- ❓ Hypothèse à explorer : minimumDistanceSamples est une constante fixe
  (70) appliquée uniformément, alors que le tempo réel d'exécution varie
  entre séries et entre répétitions. Une valeur fixe pourrait être trop
  généreuse pour un tempo rapide et laisser passer des faux positifs
  qu'elle bloquerait sur un tempo plus lent.

## Prochaine séance — plan
Ne pas lancer de nouvelle hypothèse statistique formelle. Retour au cas
concret : raconter l'histoire complète de rowing_5reps_005.json à travers
tout le pipeline (RAW → MIN_DISTANCE → PROMINENCE → DIRECTION_CHANGE →
Selected → Cycle Analyzer), en expliquant en langage simple pourquoi
chaque événement excédentaire est encore présent à la fin.

En parallèle, sans lancer de nouveau protocole : noter l'espacement en
samples entre bottoms/tops valides à chaque endroit du signal, et
comparer le tempo global de rowing_5reps_005 (beaucoup de cas suspects)
à celui de rowing_5reps_002 (aucun cas suspect), pour vérifier si un
tempo plus rapide corrèle avec l'apparition de faux positifs sous
minimumDistanceSamples=70 fixe.