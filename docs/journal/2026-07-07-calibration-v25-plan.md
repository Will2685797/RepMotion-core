# Calibration V2.5 — Plan expérimental

## Hypothèse

La Calibration V2 détecte correctement les extrema locaux, mais cette définition génère trop de candidats RAW ambigus.

L'hypothèse de cette expérimentation est qu'une stratégie basée sur le changement de direction d'un signal lissé pourrait produire des candidats RAW plus représentatifs des véritables pivots biomécaniques.

---

## Objectif

Remplacer uniquement la génération des candidats RAW par une nouvelle stratégie expérimentale, sans modifier le reste du pipeline.

---

## Diagnostic baseline (ajout méthodologique)

Avant de développer la V2.5, mesurer l'espacement réel (en samples et, si possible, en millisecondes) entre les candidats RAW rapprochés produits par la V2 actuelle.

Objectif :

- confirmer ou infirmer l'hypothèse d'un bruit capteur important ;
- établir une baseline quantitative avant toute modification.

---

## Contraintes de la séance

Ne pas modifier :

- le Cycle Analyzer ;
- `validateCalibrationEvents()` ;
- les filtres existants (`MIN_DISTANCE`, `PROMINENCE`, `DIRECTION_CHANGE`) ;
- les benchmarks ;
- les runners ;
- le pipeline de simulation.

Le livrable principal est `detectBottomsAndTopsV25()` avec exactement le même contrat de retour que la V2 :

```ts
{
  bottoms,
  tops,
  rawDebugEvents,
}
```

---

## Cas de décision

### Cas A

La V2.5 améliore clairement les résultats.

→ Continuer le développement.

### Cas B

Les résultats sont similaires.

→ Ajuster les paramètres de smoothing et poursuivre l'expérimentation.

### Cas C

La V2.5 dégrade les résultats.

→ Rollback et conserver uniquement le journal expérimental.

### Cas D

L'amélioration provient principalement du smoothing et non de la logique `direction_change`.

→ Isoler cette conclusion et évaluer l'ajout d'un prétraitement sur la V2 actuelle plutôt que de remplacer entièrement la stratégie de détection.

---

## Question de recherche

Cette séance doit répondre à la question suivante :

> Une génération RAW basée sur le changement de direction d'un signal lissé réduit-elle l'ambiguïté des candidats sans casser le pipeline existant ? Si oui, cette amélioration provient-elle principalement du smoothing ou de la nouvelle logique de détection ?