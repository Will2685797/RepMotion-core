# DP V2 – Localisation exacte de l'élimination de la Ground Truth

**Date :** 2026-08-01

---

# Objectif

L'objectif de cette séance n'était pas de modifier DP V2.

L'objectif était de déterminer avec certitude où la branche correspondant à la Ground Truth disparaît pendant l'exécution complète de DP V2.

Lors de la séance précédente, nous avions démontré que :

- le score **Temporal** classait correctement la Ground Truth ;
- le score **Cycle Shape** classait également correctement la Ground Truth ;
- le reranking des chaînes terminales plaçait systématiquement la Ground Truth en première position.

Une question fondamentale restait cependant ouverte :

> Pourquoi DP V2 échoue-t-il malgré ces nouveaux critères ?

---

# Mise en place de l'expérience

Cette expérience avait pour objectif d'isoler exclusivement **Selection Strategy**.

La génération RAW n'a volontairement pas été testée.

Les candidats Ground Truth ont été injectés individuellement parmi les candidats RAW afin de garantir que la bonne séquence soit bien reconstructible.

Aucune séquence complète n'a été injectée.

DP V2 devait donc reconstruire lui-même la Ground Truth à partir des candidats disponibles.

Une instrumentation complète a ensuite été ajoutée afin de suivre la branche Ground Truth pendant toute l'exécution de `searchSequencePossibilitiesV2()`.

Pour chaque état du Dynamic Programming, les informations suivantes étaient enregistrées :

- état DP ;
- longueur du chemin ;
- score temporel partiel ;
- rang de la branche ;
- chemins concurrents ;
- décision de conservation ou d'élimination.

---

# Résultat principal

La Ground Truth est correctement reconstruite pendant les premières étapes de la recherche.

Elle n'est donc pas absente des hypothèses générées.

En revanche, elle est éliminée avant même que les chaînes terminales ne soient produites.

Elle n'atteint donc jamais :

- `calculateFinalTemporalScore()`
- `calculateCycleShapeScore()`
- `rerankCompleteSequences()`

Ces fonctions ne sont donc pas responsables de l'échec observé.

---

# Localisation exacte

Pour :

- K = 5
- K = 10
- K = 20
- K = 30

la Ground Truth disparaît :

- à l'itération **7** ;
- dans l'état DP **7:31:445**.

La décision est prise lors de la sélection du représentant du groupe de diversité.

La Ground Truth est remplacée par une branche concurrente possédant un **partialTemporalScore** légèrement meilleur.

Les deux branches ne diffèrent pourtant que de quelques samples.

---

# Validation avec un Top-K plus grand

Une seconde expérience a été réalisée avec :

- K = 50.

La Ground Truth survit davantage.

Elle est finalement éliminée :

- à l'itération **11** ;
- dans l'état **11:52:611**.

La règle responsable reste exactement la même :

**partialTemporalScore**

L'augmentation de K ne corrige donc pas le problème.

Elle ne fait que repousser son apparition.

---

# Découverte majeure

Cette séance démontre que :

les critères **Temporal** et **Shape** ne sont pas responsables de l'échec de DP V2.

Ils fonctionnent correctement lorsqu'ils évaluent des chaînes complètes.

Le problème apparaît plus tôt.

La branche Ground Truth est éliminée pendant la construction du Dynamic Programming à cause du **partialTemporalScore**, avant même d'atteindre le reranking final.

Autrement dit :

> Un bon critère de jugement final n'est pas nécessairement un bon critère de survie pour des chaînes partielles.

Cette distinction n'avait jamais été démontrée objectivement auparavant.

---

# Conséquences

Cette expérience clôt définitivement plusieurs hypothèses.

Le problème ne provient pas :

- de `calculateFinalTemporalScore()`;
- de `calculateCycleShapeScore()`;
- de `rerankCompleteSequences()`.

Le véritable point critique de DP V2 est désormais identifié :

la stratégie de sélection des représentants pendant la recherche.

---

# Décision

Aucune modification n'a été apportée à DP V2.

L'instrumentation développée durant cette séance sera conservée comme outil de diagnostic.

La prochaine étape sera l'implémentation et l'évaluation expérimentale d'une nouvelle stratégie de sélection (**NMS**) afin de réduire les candidats concurrents avant la recherche globale.

Les résultats de NMS seront ensuite comparés à ceux de DP V2 à l'aide de cette même instrumentation.


---

# Préparation expérimentale de NMS

Une fois l'origine de l'échec de DP V2 identifiée, la séance s'est poursuivie par une première caractérisation expérimentale de la future stratégie **NMS (Non-Maximum Suppression)**.

L'objectif n'était pas encore de développer NMS.

L'objectif était de déterminer objectivement :

- quelle fenêtre de regroupement utiliser ;
- quel critère utiliser pour choisir le représentant d'un groupe de candidats concurrents.

Aucune logique de production n'a été modifiée.

Toutes les expérimentations ont été réalisées uniquement dans le runner expérimental.

---

# Fenêtre de regroupement

Plusieurs fenêtres temporelles ont été évaluées :

- ±1 sample ;
- ±2 samples ;
- ±3 samples ;
- ±5 samples.

Résultat :

- ±1 conserve pratiquement tous les candidats ;
- ±2 supprime davantage de redondance tout en conservant la Ground Truth reconstructible ;
- ±3 détruit déjà un pivot Ground Truth ;
- ±5 détruit plusieurs pivots Ground Truth.

La meilleure fenêtre observée est donc :

**±2 samples.**

---

# Comparaison des représentants

Trois règles de sélection ont ensuite été comparées :

- candidat le plus extrême ;
- candidat ayant la meilleure prominence ;
- candidat le plus proche du centre temporel du groupe.

L'objectif était de déterminer laquelle conservait le mieux les véritables pivots biomécaniques.

---

# Résultat

Sur le seul dataset actuellement annoté (`rowing_5reps_007`) :

- les trois règles conservent la Ground Truth ;
- les trois règles produisent exactement le même nombre de suppressions ;
- aucun pivot Ground Truth n'est perdu.

Un seul groupe discriminant a été identifié.

Dans ce groupe :

- le centre temporel sélectionne exactement le pivot Ground Truth ;
- les deux autres règles sélectionnent un candidat situé à seulement un sample de celui-ci.

Le centre temporel obtient donc la meilleure distance locale.

---

# Conclusion

Cette expérience permet de valider objectivement une fenêtre de regroupement de **±2 samples** pour ce dataset.

En revanche, elle ne permet pas encore de démontrer qu'une règle de représentant est supérieure aux autres.

Le dépôt ne contient actuellement qu'un seul dataset ponctuellement annoté.

Le résultat est donc considéré comme **scientifiquement insuffisant** pour choisir définitivement un critère de représentant.

À ce stade, aucune preuve ne permet de conclure qu'une règle domine les autres de manière générale.

---

# Décision

La conception de NMS peut désormais s'appuyer sur les résultats suivants :

- le regroupement local est expérimentalement viable ;
- une fenêtre de **±2 samples** constitue le meilleur compromis observé ;
- le choix du représentant reste provisoire tant qu'un plus grand nombre de datasets annotés ne sera pas disponible.

Le choix définitif du représentant sera donc réévalué lorsque davantage de Ground Truth auront été annotées.