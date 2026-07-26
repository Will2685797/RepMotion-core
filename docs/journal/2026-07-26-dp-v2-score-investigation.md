# DP V2 – Identification objective des critères du futur score

**Date :** 2026-07-26

---

# Objectif

L'objectif de cette séance n'était pas de développer DP V2.

L'objectif était d'identifier objectivement quelles propriétés distinguent réellement la bonne chaîne (Ground Truth) des autres chaînes possibles construites par le Dynamic Programming.

Après avoir démontré que :

- le DP V1 est capable de reconstruire exactement la Ground Truth lorsqu'il ne reçoit que ses candidats ;
- mais qu'il choisit une autre chaîne lorsqu'on lui fournit également les candidats concurrents ;

la question devenait :

> Pourquoi le score actuel préfère-t-il une mauvaise chaîne ?

---

# Décomposition du score DP actuel

Le score actuel a été entièrement instrumenté.

Résultat :

- aucune pénalité ;
- aucun bonus ;
- aucune contribution des transitions ;
- aucune normalisation.

Le score est uniquement :

BOTTOM -> -candidate.value
TOP -> +candidate.value

Le DP maximise donc uniquement les extrema locaux.

---

# Première découverte

Le score actuel favorise très fortement la qualité locale des candidats.

Cela explique pourquoi des candidats légèrement plus hauts ou plus bas remplacent les véritables pivots biomécaniques.

Le problème ne vient donc plus de la reconstruction de la chaîne, mais du critère utilisé pour comparer les chaînes concurrentes.

---

# Analyse des caractéristiques des chaînes

Nous avons ensuite comparé :

- la chaîne gagnante actuelle ;
- la Ground Truth.

Puis :

- les 14 chaînes terminales générées par le DP ;
- la Ground Truth comme référence externe.

Chaque chaîne a été analysée selon plusieurs familles de métriques :

- qualité locale ;
- cohérence temporelle ;
- cohérence des amplitudes ;
- couverture ;
- similarité de forme des cycles.

---

# Résultat majeur

La Ground Truth termine :

- dernière sur la qualité locale (rang 15) ;
- première sur la cohérence temporelle ;
- première sur la similarité de forme des cycles.

Ces deux familles classent systématiquement la Ground Truth devant toutes les autres chaînes terminales.

Toutes les combinaisons expérimentales construites à partir de ces familles placent également la Ground Truth au premier rang.

---

# Conséquences

Le score actuel optimise une propriété qui ne caractérise pas la véritable séquence biomécanique.

Les résultats suggèrent que la sélection d'une chaîne devrait plutôt être basée sur :

1. la régularité temporelle des répétitions ;
2. la similarité entre les cycles.

La qualité locale des candidats semble rester utile, mais uniquement comme information secondaire.

---

# Décision

Aucun changement n'a été apporté au pipeline de production.

La prochaine étape sera la conception expérimentale de **DP V2**, en conservant l'architecture du bloc **Selection Strategy**.

Le développement commencera par une validation indépendante d'un mécanisme **Top-K**, avant l'ajout d'un reranker basé sur les nouvelles métriques identifiées.

Toutes les expérimentations resteront isolées dans le runner tant que la nouvelle stratégie n'aura pas été validée sur plusieurs datasets annotés.