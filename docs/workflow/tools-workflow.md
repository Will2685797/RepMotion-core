# Tools Workflow

## Objectif

Le dossier `tools/` regroupe tous les utilitaires utilisés pendant le développement de RepMotion.

Contrairement au code de production (`mobile/`, `firmware/`, `api/`), ces outils ne sont pas utilisés par l'utilisateur final.

Ils servent à :

- créer des datasets ;
- diagnostiquer un algorithme ;
- comparer plusieurs stratégies ;
- visualiser les résultats ;
- valider objectivement les performances.

---

# Vue d'ensemble

```
              Nouvel enregistrement
                      │
                      ▼
             Dataset Writer
                      │
                      ▼
              Dataset JSON
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
Calibration Runner            Benchmark
(Diagnostic)             (Comparaison globale)
        │                           │
        └─────────────┬─────────────┘
                      ▼
               Visualization
                      │
                      ▼
                 Graphiques
```

---

# tools/dataset-writer

## Rôle

Le Dataset Writer reçoit les datasets générés par l'application mobile et les sauvegarde sur le disque.

Il ne réalise aucune analyse.

Il agit simplement comme un serveur HTTP.

Workflow :

```
Application mobile
        │
        ▼
saveCalibrationDataset()
        │
HTTP POST
        │
        ▼
Dataset Writer
        │
        ▼
datasets/calibration/
```

Commande :

```bash
cd tools/dataset-writer
npm start
```

---

# tools/calibration-runner

## Rôle

Le Calibration Runner est un laboratoire de développement.

Il permet d'exécuter la Calibration sur un dataset précis afin d'observer son comportement en détail.

Il sert notamment à :

- afficher les Bottoms détectés ;
- afficher les Tops détectés ;
- analyser les candidats ;
- inspecter les filtres ;
- comprendre pourquoi un dataset fonctionne ou échoue.

Il ne compare pas plusieurs stratégies.

Il aide à comprendre une stratégie.

---

## runner.ts

Runner principal.

Exécute la Calibration sur un dataset unique.

---

## inspectGlobalPath.ts

Outil de diagnostic du Dynamic Programming.

Il permet d'observer :

- les candidats admissibles ;
- les états du DP ;
- la chaîne sélectionnée.

---

## minDistanceStrategyVerifier.ts

Runner spécialisé utilisé pour valider le comportement de la stratégie MIN_DISTANCE.

Il répond à une hypothèse précise.

---

# tools/benchmark

## Rôle

Le Benchmark permet de comparer objectivement plusieurs algorithmes.

Contrairement au Calibration Runner, il travaille sur une bibliothèque complète de datasets.

Il répond à des questions comme :

- Quelle stratégie est la meilleure ?
- Quel paramètre est optimal ?
- Quel score est obtenu ?

Le Benchmark sert à prendre des décisions.

---

# tools/benchmark/calibration

Regroupe les benchmarks de la Calibration.

Exemples :

- Calibration Benchmark
- Global Path Comparison
- Qualitative Validation

---

## globalPathComparisonRunner.ts

Compare :

- current_filters
- global_alternating_path

sur tous les datasets.

Produit uniquement des statistiques quantitatives.

---

## globalPathQualitativeValidationRunner.ts

Produit une validation qualitative.

Il génère notamment :

- graphiques complets ;
- zooms ;
- comparaison Current / Global.

Son objectif est de comprendre pourquoi deux stratégies sélectionnent des événements différents.

---

# tools/benchmark/cycle-analyzer

Même philosophie que le Benchmark Calibration.

Appliquée au Cycle Analyzer.

Il permet de comparer différentes versions du Cycle Analyzer sur les mêmes datasets.

---

# tools/visualization

## Rôle

Les outils de visualisation transforment les résultats des benchmarks en graphiques.

Ils ne prennent aucune décision.

Ils permettent simplement de voir les données.

Exemples :

- comparaison de stratégies ;
- analyse des cycles ;
- graphiques PNG.

Workflow :

```
Dataset
      │
      ▼
Benchmark
      │
      ▼
Visualization
      │
      ▼
PNG
```

---

# Philosophie générale

Chaque catégorie d'outil possède un rôle précis.

## Dataset Writer

Créer des datasets.

## Calibration Runner

Comprendre un dataset.

## Benchmark

Comparer plusieurs algorithmes.

## Visualization

Visualiser les résultats.

Cette séparation permet de conserver une architecture claire et d'éviter qu'un même outil remplisse plusieurs responsabilités.