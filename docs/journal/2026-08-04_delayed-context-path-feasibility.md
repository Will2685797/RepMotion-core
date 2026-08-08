# Delayed Context Path – Étude de faisabilité

**Date :** 2026-08-04

---

# Objectif

L'objectif de cette séance n'était pas de développer immédiatement une nouvelle stratégie de sélection.

L'objectif était de vérifier objectivement si le problème principal de DP V2 pouvait être résolu en retardant les premières décisions de sélection afin de disposer d'un contexte biomécanique plus riche.

Cette idée a été nommée provisoirement **Delayed Context Path**.

---

# Contexte

Les séances précédentes avaient permis de démontrer que :

- DP V1 est capable de reconstruire exactement la Ground Truth lorsqu'il ne reçoit que les bons candidats.
- DP V2 élimine la Ground Truth pendant le pruning Top-K basé sur `partialTemporalScore`.
- Le problème ne provient donc pas de la reconstruction de la chaîne, mais d'une décision prise trop tôt avec une information encore incomplète.

L'hypothèse formulée était donc :

> Ne plus décider immédiatement, mais attendre d'avoir davantage de contexte avant de sélectionner définitivement les meilleurs chemins.

---

# Première expérience

Une première expérience a consisté à supprimer complètement le pruning intermédiaire afin de conserver toutes les hypothèses jusqu'à plusieurs cycles.

Résultat :

- environ 300 000 états explorés ;
- arrêt sur limite combinatoire ;
- plus de 15 secondes d'exploration ;
- environ 51 Mo de représentations mémoire.

Conclusion :

Conserver toutes les hypothèses jusqu'à obtenir suffisamment de contexte est irréaliste sur ce dataset.

Le problème de l'explosion combinatoire est donc confirmé expérimentalement.

---

# Deuxième expérience

Une expérience locale a ensuite été réalisée sur le cas :

- BOTTOM:260
- BOTTOM:262

L'objectif était d'observer à partir de quel nombre de cycles les différentes métriques deviennent réellement discriminantes.

Résultats :

- Temporal préfère BOTTOM:262 à partir de 4 cycles.
- Shape préfère encore BOTTOM:260 à 4 cycles.
- Temporal et Shape convergent tous les deux vers BOTTOM:262 uniquement à 5 cycles.

Première observation importante :

Les deux métriques ne deviennent pas fiables au même moment.

---

# Troisième expérience

Une simulation locale de remplacement d'un seul pivot a ensuite été réalisée.

Résultat :

Le remplacement :

BOTTOM:260

↓

BOTTOM:262

permet de reconstruire exactement la Ground Truth.

Seulement :

- 4 variantes valides
- 5 états explorés

ont été nécessaires.

Cette expérience montre qu'une correction locale est potentiellement beaucoup moins coûteuse qu'une reconstruction complète de tous les chemins.

---

# Tentative de règle de décision

Une réflexion a ensuite été menée afin d'utiliser Temporal et Shape avec des pondérations évoluant selon le nombre de cycles.

Exemple envisagé :

- davantage de poids sur Temporal au début ;
- augmentation progressive de Shape lorsque davantage de cycles sont disponibles.

Cette approche n'a cependant pas pu être évaluée objectivement.

---

# Pourquoi cette approche n'a pas pu être testée

Les expériences ont montré que :

- Temporal et Shape ne sont pas directement comparables ;
- leurs échelles sont différentes ;
- la normalisation utilisée actuellement dépend uniquement des chaînes terminales du rerank final ;
- aucune population de normalisation objective n'existe actuellement pour les chaînes partielles (2 à 4 cycles).

Il aurait donc été nécessaire d'inventer une normalisation arbitraire.

Cette possibilité a volontairement été rejetée.

---

# Découverte importante

Cette séance a permis d'identifier que le véritable problème n'est probablement pas :

> Comment pondérer Temporal et Shape ?

mais plutôt :

> Comment caractériser objectivement ce que deviennent Temporal et Shape lorsqu'une correction rapproche réellement la chaîne de la Ground Truth ?

Autrement dit :

avant de construire une nouvelle règle de décision, il est nécessaire de comprendre expérimentalement le comportement individuel de chaque métrique.

Cette démarche reste cohérente avec la méthode scientifique utilisée depuis le début de l'investigation.

---

# État actuel de Delayed Context Path

La version consistant à conserver tous les chemins jusqu'à plusieurs cycles est désormais considérée comme non viable.

En revanche, l'idée consistant à :

- construire une première chaîne ;
- conserver les candidats RAW ;
- effectuer ensuite des corrections locales lorsque davantage de contexte est disponible ;

reste une piste prometteuse qui mérite une investigation supplémentaire.

Cette idée devra cependant être validée expérimentalement avant toute implémentation dans le pipeline.

---

# Prochaine étape

La prochaine expérimentation ne cherchera plus à définir une nouvelle règle de décision.

Elle cherchera uniquement à répondre à la question suivante :

> Lorsqu'une correction locale rapproche réellement une chaîne de la Ground Truth, comment évoluent individuellement les métriques Temporal et Shape ?

L'objectif est d'observer les données avant de concevoir une nouvelle stratégie de sélection.