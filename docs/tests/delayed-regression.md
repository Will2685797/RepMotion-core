# Delayed Context Path – Regression Baseline

## Objectif

Protéger le comportement historique de `Delayed Context Path` avant toute modification importante.

Cette baseline sert à vérifier qu’un changement dans les analytics ne casse pas un comportement déjà validé.

Elle représente donc un point de référence stable pour Delayed.

---

## Test

Fichier :

```text
RepMotion/tools/ground-truth/tests/delayed-context-path/regression.test.ts
```

---

## Commande

Depuis le dossier :

```text
RepMotion/
```

Exécuter :

```powershell
.\tools\calibration-runner\node_modules\.bin\tsx.cmd --test tools/ground-truth/tests/delayed-context-path/regression.test.ts
```

---

## Ce que cette baseline protège

Elle protège le comportement historique de Delayed, notamment :

- la construction des séquences
- la logique d’alternance
- les règles structurelles
- le comportement historique des datasets de référence
- les guards et limites importantes
- le comportement général de reconstruction

L’objectif n’est pas de garantir que Delayed est parfait.

L’objectif est de garantir qu’un changement futur ne modifie pas silencieusement son comportement historique.

---

## Quand l’exécuter

Exécuter cette baseline :

- avant une modification importante de Delayed
- après une modification de Delayed
- après une modification d’une dépendance directe utilisée par Delayed
- avant une PR qui touche Delayed
- lors d’un refactor important des analytics associés

---

## Règle

Avant modification :

```text
baseline Delayed
→ doit passer
```

Après modification :

```text
même baseline
→ doit toujours passer
```

Si le résultat change volontairement, le changement doit être compris, documenté et accompagné de tests adaptés.

---

## Statut

```text
Baseline historique stable
```

Delayed est actuellement conservé comme :

```text
baseline historique
+
méthode globale de reconstruction
+
référence pour les benchmarks
```