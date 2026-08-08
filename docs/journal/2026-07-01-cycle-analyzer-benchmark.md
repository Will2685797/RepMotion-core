# Journal — Cycle Analyzer et naissance du Benchmark

**Date :** 2026-07-01

---

# Contexte

La Calibration V2 est devenue suffisamment robuste.

L'objectif de cette séance était de déterminer si les événements Bottom et Top produits par la Calibration étaient réellement exploitables pour construire correctement les répétitions.

Cette réflexion a finalement conduit à la création du Cycle Analyzer ainsi qu'à la naissance du Benchmark V1.

---

# Étape 1 — Construire une bonne Calibration

Au départ, notre objectif était simple.

Nous voulions :

> Détecter les meilleurs événements **Bottom** et **Top** possibles.

Nous avons donc travaillé sur plusieurs aspects de la Calibration :

- Axe dominant
- Thresholds dynamiques
- Robust Range
- Prominence
- Distance minimale entre les événements
- Détection de saturation
- etc.

La question que nous cherchions à répondre était simplement :

> **Est-ce que la Calibration détecte correctement les événements ?**

---

# Étape 2 — Writer + Calibration Runner

Une fois la Calibration suffisamment avancée, une difficulté est apparue.

Les tests étaient réalisés uniquement en temps réel.

Chaque séance étant différente, il devenait impossible de comparer objectivement deux versions de la Calibration.

Nous avons donc créé deux outils.

## Writer

Le Writer enregistre automatiquement les vraies séances d'entraînement dans des fichiers JSON.

Chaque fichier devient alors un dataset de référence.

## Calibration Runner

Le Calibration Runner relit exactement ces mêmes datasets.

Le pipeline devient :

Même dataset

↓

Même Calibration

↓

Même résultat

Grâce à cette approche, tous les tests deviennent parfaitement reproductibles.

Nous pouvons maintenant modifier un paramètre et observer exactement son effet sur les mêmes données.

---

# Étape 3 — Optimisation des filtres

Une fois le Runner en place, nous avons commencé à expérimenter différents paramètres de Calibration.

Par exemple :

- Prominence
- Distance minimale
- Thresholds

Nous avons rapidement découvert que le filtre :

**MIN_PEAK_DISTANCE**

avait énormément d'influence.

Il supprimait une très grande quantité de faux Bottom et de faux Top.

Cette amélioration a pu être observée très facilement grâce au Calibration Runner.

Jusqu'à cette étape, tout allait bien.

Nous améliorions progressivement la qualité de la Calibration.

---

# Étape 4 — Le vrai problème apparaît

Puis une nouvelle question est apparue.

Nous disions :

> "La Calibration est bonne."

Mais...

Comment pouvions-nous réellement l'affirmer ?

Réduire le nombre de faux Bottom et de faux Top ne garantit absolument pas que les répétitions seront correctement reconstruites.

Par exemple :

Avant filtrage :

- 40 Bottom
- 35 Top

Après filtrage :

- 15 Bottom
- 15 Top

Très bien.

Mais...

Ces Bottom et Top sont-ils réellement placés aux bons endroits ?

À cette étape, nous étions incapables de répondre à cette question.

---

# Étape 5 — Le problème du futur Rep Detector

C'est là que nous avons identifié le véritable problème.

Le futur Rep Detector devait fonctionner selon la logique suivante :

Bottom

↓

Top

↓

Bottom

=

Une répétition

Mais ce futur Rep Detector n'existait pas encore.

Nous ne pouvions donc pas répondre à la question la plus importante :

> **Les Bottom et Top détectés par la Calibration sont-ils réellement exploitables pour reconstruire correctement les répétitions ?**

La Calibration pouvait sembler excellente...

...sans que nous sachions réellement si elle produisait les bons événements.

---

# Étape 6 — Création du Cycle Analyzer

Pour répondre à cette question, nous avons créé un nouvel outil :

**Cycle Analyzer**

Le Cycle Analyzer est une **étape intermédiaire**.

Il ne fait pas partie du produit final.

Son rôle est uniquement de simuler la logique du futur Rep Detector.

À partir des événements produits par la Calibration :

- selectedBottomIndexes
- selectedTopIndexes

il tente de reconstruire une chaîne biomécanique :

Bottom

↓

Top

↓

Bottom

↓

Top

↓

Bottom

Le Cycle Analyzer répond uniquement à une seule question :

> **Les Bottom et Top détectés sont-ils suffisamment bons pour reconstruire correctement les répétitions ?**

Il ne compte pas officiellement les répétitions.

Il ne remplace pas le futur Rep Detector.

Il sert uniquement à valider la qualité des événements produits par la Calibration.

Lorsque le vrai Rep Detector sera développé, cette logique sera directement intégrée à celui-ci.

Le Cycle Analyzer pourra éventuellement rester comme outil de test ou de debug.

---

# Étape 7 — Deuxième découverte

Pendant le développement du Cycle Analyzer, plusieurs nouvelles constantes ont été introduites.

Par exemple :

- minRepDuration
- minConcentricDuration
- minEccentricDuration

Nous avons commencé à les modifier manuellement.

Par exemple :

45

↓

50

↓

40

Puis :

8

↓

10

↓

6

Et nous avons rapidement réalisé quelque chose.

Nous étions exactement en train de reproduire le problème que nous voulions éviter.

Nous choisissions encore des constantes "au feeling".

Cette approche n'était pas acceptable.

---

# Étape 8 — Naissance du Benchmark

C'est cette découverte qui a conduit à la création du Benchmark.

Cependant, il est très important de comprendre son objectif.

Le Benchmark **n'optimise pas la Calibration.**

La Calibration V2 est maintenant considérée comme suffisamment mature.

Le Benchmark optimise uniquement les paramètres du futur Rep Detector.

Aujourd'hui, les paramètres concernés sont :

- minRepDuration
- minConcentricDuration
- minEccentricDuration

Le Benchmark générera automatiquement plusieurs combinaisons de paramètres afin de déterminer lesquelles reconstruisent le mieux les répétitions.

Par exemple :

- 45 / 8 / 8
- 45 / 8 / 10
- 50 / 8 / 8
- 50 / 10 / 10

L'objectif est de répondre objectivement à la question :

> **Quelle combinaison fonctionne le mieux sur l'ensemble des datasets ?**

---

# Situation actuelle

Aujourd'hui, notre pipeline de validation est le suivant :

Calibration

↓

Bottom / Top

↓

Cycle Analyzer (temporaire)

↓

Benchmark

Le Benchmark servira uniquement à sélectionner objectivement les meilleurs paramètres du futur Rep Detector.

---

# Ce qui a changé

Au début du projet, nous optimisions uniquement la Calibration.

Aujourd'hui, cette étape est pratiquement terminée.

Nous sommes maintenant en train d'optimiser le futur Rep Detector.

Ce n'est plus la même problématique.

---

# Point important

Une confusion est apparue pendant le développement.

Au départ, nous pouvions croire que le Benchmark allait optimiser des paramètres comme :

- Prominence
- Distance minimale
- Thresholds
- Robust Range

En réalité, ce n'est pas son rôle.

Ces paramètres appartiennent à la Calibration.

Le Benchmark actuel optimise uniquement les paramètres liés à la reconstruction des cycles :

- minRepDuration
- minConcentricDuration
- minEccentricDuration

Autrement dit :

La Calibration cherche à produire les meilleurs événements possibles.

Le Benchmark cherche ensuite à déterminer objectivement les meilleures règles permettant de transformer ces événements en répétitions.

Les deux étapes sont volontairement séparées afin de pouvoir optimiser chaque composant indépendamment.

---

# Prochaine étape

Finaliser le Benchmark V1 afin qu'il puisse :

- parcourir tous les datasets enregistrés ;
- tester automatiquement toutes les configurations ;
- classer objectivement les paramètres du futur Rep Detector ;
- figer les meilleures valeurs avant l'implémentation du Rep Detector V1.

Une fois cette étape terminée, le vrai Rep Detector pourra être développé sur des paramètres validés objectivement plutôt que choisis empiriquement.