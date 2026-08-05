# Delayed Context Path – Audit préalable 2 vs 3 cycles

## 1. Objectif et hypothèse

L'expérience proposée doit déterminer si le report du premier pruning biomécanique jusqu'à deux ou trois cycles complets permet au chemin Ground Truth de survivre jusqu'au rerank final Temporal + Shape, avec un coût combinatoire acceptable.

Cet audit s'arrête avant l'implémentation et la simulation, conformément à la consigne demandant de ne pas inventer une règle de pruning lorsqu'aucune règle existante ne peut être réutilisée sans ambiguïté.

## 2. Code DP V2 réutilisable identifié

Le runner Ground Truth contient déjà les éléments suivants :

- `buildInjectedCandidatePool` : pool contrôlé composé des candidats RAW, des injections Ground Truth individuelles et des parasites ;
- `searchSequencePossibilitiesV2` : construction progressive des chemins alternés et contraintes structurelles existantes ;
- `calculatePartialTemporalFeatures` et `calculatePartialTemporalScore` : métriques Temporal partielles disponibles à partir de deux cycles ;
- `retainTopKSequencePossibilities` : pruning intermédiaire DP V2 par bucket et limite K ;
- `calculateFinalTemporalFeatures`, `calculateCycleShapeFeatures` et `rerankCompleteSequences` : rerank final des chaînes terminales avec Temporal + Shape ;
- `traceGroundTruthSequence` et l'instrumentation DP V2 : correspondance et suivi des préfixes Ground Truth avec la tolérance existante de ±2 samples.

## 3. Logique qui devrait être désactivée avant le seuil

Avant le seuil de deux ou trois cycles, l'expérience devrait désactiver la sélection Top-K par bucket de DP V2. Actuellement, `retainTopKSequencePossibilities` peut réduire un bucket dès les premières étapes ; avant deux cycles, son ordre repose sur la diversité, le score legacy et l'identifiant stable. À partir de deux cycles, il donne priorité à `partialTemporalScore`.

Les contraintes structurelles existantes sont clairement réutilisables sans nouvelle formule : alternance B/T, indices strictement croissants, durée minimale de transition de 8 samples, durée minimale B-B de 45 samples et rejet des signatures dupliquées dans un bucket.

## 4. Métriques réellement disponibles aux seuils

| Seuil | Temporal partiel | Shape | Commentaire |
|---|---:|---:|---|
| 2 cycles (`B-T-B-T-B`) | Oui | Mathématiquement calculable après adaptation | Les trois CV de durée et `partialTemporalScore` existent déjà. Le code Shape existant refuse toutefois tout chemin autre qu'une chaîne terminale de 11 événements / 5 cycles. |
| 3 cycles (`B-T-B-T-B-T-B`) | Oui | Mathématiquement calculable après adaptation | Les mêmes métriques Temporal sont disponibles avec trois observations. Shape nécessiterait encore une adaptation du constructeur de cycles. |

Shape n'est donc pas « disponible » dans le moteur intermédiaire actuel, même si des corrélations entre deux ou trois cycles peuvent être définies mathématiquement.

## 5. Ambiguïté bloquante sur le premier pruning

DP V2 ne contient aucune règle existante qui combine Temporal et Shape lors d'un pruning intermédiaire :

- le pruning intermédiaire est effectué séparément dans chaque bucket et utilise `partialTemporalScore`, puis le nombre de répétitions, la diversité, le score legacy et l'identifiant stable ;
- Shape est calculé uniquement pour les chaînes terminales de cinq cycles ;
- les scores finaux Temporal et Shape sont des scores robustement normalisés relativement à toute la population terminale ;
- leur combinaison 50/50 n'existe que dans le rerank final.

Pour appliquer Shape au premier pruning, il faudrait décider au minimum :

1. si les métriques sont normalisées dans chaque bucket, dans toute la couche, ou dans toute la population active ;
2. si la combinaison 50/50 du rerank final s'applique aussi au pruning intermédiaire ;
3. comment traiter une métrique Shape constante ou dégénérée avec seulement deux cycles ;
4. si la diversité DP V2 reste prioritaire, secondaire ou disparaît à ce premier pruning ;
5. quelle valeur K utiliser pour la comparaison principale (le diagnostic existant balaie K = 5, 10, 20, 30 et 50).

Ces choix changent directement le rang et la survie de la Ground Truth. En sélectionner un constituerait une nouvelle formule ou une nouvelle stratégie implicite, ce que le protocole interdit.

## 6. État des résultats demandés

Les tableaux de survie, de complexité, l'évolution du nombre de chemins, le point du premier pruning et les scores finaux ne sont pas produits : une simulation exécutée avant résolution de l'ambiguïté ne serait pas une comparaison objective des variantes demandées.

Verdict provisoire pour les deux variantes : **données insuffisantes (règle de premier pruning non définie)**.

## 7. Décision minimale nécessaire pour poursuivre

Il faut fournir ou valider une règle exacte du premier pruning. Une spécification suffisante doit fixer :

- la population sur laquelle Temporal et Shape sont normalisés au seuil ;
- le comparateur complet et ses tie-breakers ;
- la limite K commune aux variantes ;
- le comportement explicite lorsque Shape est dégénéré à deux cycles.

Une autre décision cohérente serait d'autoriser explicitement le pruning DP V2 existant, fondé uniquement sur `partialTemporalScore`, au seuil configuré, et de réserver Shape au rerank terminal. Cette option réutilise une règle existante mais ne satisfait pas littéralement la demande d'utiliser Shape dès qu'il est mathématiquement calculable sans clarification du protocole.

## 8. Garanties de non-régression

- Aucune stratégie existante n'a été modifiée.
- DP V1, DP V2 et `current_filters` n'ont pas été modifiés.
- Le pipeline de production est inchangé.
- Aucun NMS, gyroscope ou nouveau score n'a été ajouté.
- Aucun résultat de référence DP V1 ou DP V2 n'a été régénéré ou altéré ; leur parité est donc préservée par absence de changement de code.

## 9. Fichiers et reproduction

Seul ce rapport d'audit a été ajouté :

`tools/ground-truth/output/delayed-context-path/delayed_context_path_audit.md`

Il n'existe volontairement pas encore de commande de simulation reproductible, puisque le runner expérimental n'a pas été modifié avant la décision requise.
