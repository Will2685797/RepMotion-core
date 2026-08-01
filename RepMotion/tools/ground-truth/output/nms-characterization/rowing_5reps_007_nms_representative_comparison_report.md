# NMS representative comparison — all annotated datasets

## Datasets testés

- rowing_5reps_007.json — annotations ponctuelles: rowing_5reps_007.annotations.json.
- Nombre total de datasets avec annotations ponctuelles disponibles: 1.
- Le fichier transition-annotations décrit le même dataset et ne constitue pas un second dataset indépendant.

## Paramètres

- Fenêtre de regroupement mono-type: ±2 samples, composantes connexes par écart entre voisins.
- Tolérance Ground Truth existante: ±2 samples.
- Pool: 46 candidats réels + 9 injections individuelles Ground Truth + parasites conservés.
- Aucun DP, partialTemporalScore ou stratégie de production n'est exécuté.

## Groupes discriminants

Nombre de groupes discriminants couvrant un pivot Ground Truth: 1.

| dataset | groupType | groupId | candidates | temporalCenter | associatedGroundTruth | MOST_EXTREME_representative | MOST_EXTREME_distance | MOST_EXTREME_withinTolerance | MOST_EXTREME_pivotPresent | MOST_EXTREME_chainReconstructible | BEST_PROMINENCE_representative | BEST_PROMINENCE_distance | BEST_PROMINENCE_withinTolerance | BEST_PROMINENCE_pivotPresent | BEST_PROMINENCE_chainReconstructible | GROUP_CENTER_representative | GROUP_CENTER_distance | GROUP_CENTER_withinTolerance | GROUP_CENTER_pivotPresent | GROUP_CENTER_chainReconstructible |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rowing_5reps_007.json | BOTTOM | BOTTOM_19 | BOTTOM:529 value=17976 prominence=1600 ; BOTTOM:530 value=17708 prominence=1868 | 529.5 | BOTTOM:529 | BOTTOM:530 | 1 | true | true | true | BOTTOM:530 | 1 | true | true | true | BOTTOM:529 | 0 | true | true | true |

## Agrégation par règle

| rule | discriminantGroupCount | representativesWithinTolerance | groundTruthPivotsDestroyed | fullyReconstructibleDatasetCount | meanAbsoluteDistanceToGroundTruth | maximumAbsoluteDistance | totalCandidatesRemoved | exactRegressions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MOST_EXTREME | 1 | 1 | 0 | 1 | 1 | 1 | 3 |  |
| BEST_PROMINENCE | 1 | 1 | 0 | 1 | 1 | 1 | 3 |  |
| GROUP_CENTER | 1 | 1 | 0 | 1 | 0 | 0 | 3 |  |

## Classement selon l'ordre de décision imposé

| rank | rule | discriminantGroupCount | representativesWithinTolerance | groundTruthPivotsDestroyed | fullyReconstructibleDatasetCount | meanAbsoluteDistanceToGroundTruth | maximumAbsoluteDistance | totalCandidatesRemoved | exactRegressions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | GROUP_CENTER | 1 | 1 | 0 | 1 | 0 | 0 | 3 |  |
| 2 | BEST_PROMINENCE | 1 | 1 | 0 | 1 | 1 | 1 | 3 |  |
| 3 | MOST_EXTREME | 1 | 1 | 0 | 1 | 1 | 1 | 3 |  |

## Conclusion

- Cas observé: INCONCLUSIVE_SINGLE_DATASET.
- Résultat local: GROUP_CENTER est strictement premier sur ce dataset selon l'ordre imposé, après égalité sur les pivots détruits et la reconstructibilité, grâce à une distance moyenne/maximale de 0 contre 1 sample.
- Ce résultat présente le profil métrique du CAS B sur le seul dataset disponible, mais ne peut pas déclencher la recommandation multi-dataset demandée.
- Choix: Aucun: un seul dataset ponctuellement annoté ne permet pas une recommandation multi-dataset.
- La demande exige une décision sur l'ensemble des datasets annotés; le dépôt n'en contient actuellement qu'un avec pivots ponctuels. Aucun résultat de ce rapport ne peut donc établir une domination multi-dataset.
- Aucune stratégie NMS complète n'a été implémentée.
