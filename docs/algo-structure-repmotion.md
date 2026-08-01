# RepMotion — Structure des algorithmes du pipeline

## Principe général : des poupées russes d'algorithmes

Chaque bloc du pipeline est lui-même composé de plus petits algorithmes.
Un "gros algo" n'est jamais qu'un assemblage de petits algos qui
communiquent entre eux par une interface simple : une entrée, une
sortie.

```
Signal IMU
    ↓
[ALGO NIVEAU 2 : Génération RAW]
    ↓
candidats bruts (Bottoms/Tops)
    ↓
[ALGO NIVEAU 2 : Selection Strategy]
    ↓
séquence finale alternée (B-T-B-T-B-T-B-T-B-T-B)
    ↓
[ALGO NIVEAU 2 : Cycle Analyzer]
    ↓
Nombre de répétitions
```

Ce document décompose chacun de ces trois blocs en leurs sous-algos
internes, tels qu'ils existent aujourd'hui dans le projet.

---

## NIVEAU 3 — Le pipeline complet

Le pipeline complet est lui-même "un algo", au sens où c'est une
séquence fixe d'étapes qui transforme un signal en un nombre de
répétitions. Il combine les trois blocs de Niveau 2 les uns après les
autres. C'est le niveau le plus haut, celui qu'on regarde quand on
pense "l'algorithme de RepMotion".

---

## NIVEAU 2 — Bloc 1 : Génération RAW

Rôle : transformer le signal brut en une première liste de candidats
(des Bottoms et des Tops potentiels), sans encore juger de leur
qualité.

### Sous-algos internes (Niveau 1)

- `smoothSignal()` — lisse le signal pour réduire le bruit
- `detectLocalMinimum()` / `detectLocalMaximum()` — trouve les
  extrema locaux (stratégie `local_extrema`)
- `computeVelocityProxy()` + détection de changement de signe —
  stratégie alternative `direction_change` (V2.5)
- `snapToLocalExtremum()` — ajuste un candidat approximatif vers le
  vrai extremum le plus proche

### Variantes disponibles (choix au niveau du bloc)
- `local_extrema` (stratégie historique, celle actuellement utilisée
  en production)
- `direction_change` (V2.5, testée, n'a pas amélioré les résultats)

### Statut au 26-27 juillet 2026
Non modifié récemment. Suspecté un temps d'être la cause principale du
problème de comptage, puis largement disculpé par l'expérience
d'injection de Ground Truth (le DP échoue même quand on lui fournit les
bons candidats RAW).

---

## NIVEAU 2 — Bloc 2 : Filtres qualité

Rôle : éliminer les candidats RAW de mauvaise qualité, indépendamment
de leur position dans la séquence.

### Sous-algos internes
- `filterByProminence()` — élimine les candidats dont l'amplitude
  locale est trop faible par rapport à un seuil basé sur le range
  global du signal
- `filterByDirectionChange()` — élimine les candidats qui ne sont pas
  suivis d'un vrai changement de direction du mouvement

### Statut
Peu de rejets supplémentaires observés sur les datasets testés — la
majorité du filtrage est faite ailleurs (historiquement par
MIN_DISTANCE).

---

## NIVEAU 2 — Bloc 3 : Selection Strategy

Rôle : à partir des candidats filtrés, construire la séquence finale
alternée qui représente les vraies répétitions. C'est le bloc le plus
travaillé et le plus central de l'investigation actuelle.

### Variante A — `current_filters` (historique, MIN_DISTANCE)

Sous-algos internes :
- `filterByMinimumDistanceCurrent()` — pour chaque paire de candidats
  du même type trop proches en temps, garde le plus extrême (Bottom le
  plus bas, Top le plus haut)

Défaut structurel identifié : traite les Bottoms et les Tops
séparément, sans jamais vérifier ce qui se passe entre les deux côté
type opposé. Peut casser l'alternance de la séquence finale.

### Variante B — `global_alternating_path` (DP V1)

Sous-algos internes :
- Recherche par programmation dynamique (DP) qui construit
  progressivement des chaînes alternées B-T-B-T...
- Score de sélection : `Σ(TOPS.value) − Σ(BOTTOMS.value)` (le plus
  extrême gagne, exactement comme MIN_DISTANCE mais appliqué à la
  chaîne complète plutôt qu'à des paires locales)
- Mécanisme de dominance : quand deux chaînes partielles arrivent au
  même "état" (même position, même dernier Bottom), seule celle au
  meilleur score legacy survit — l'autre est supprimée définitivement

Résultat prouvé : reconstruit correctement les 5 reps sur 10/10
datasets (comptage), mais choisit souvent les mauvais événements
individuels (vérifié contre Ground Truth vidéo).

Défaut structurel identifié : le score ne mesure que la qualité locale
brute de chaque candidat, jamais la cohérence de la séquence complète.
Une bonne séquence peut être éliminée trop tôt par la dominance, avant
même d'avoir pu montrer sa cohérence d'ensemble.

### Variante C — `global_alternating_path_v2_experimental` (DP V2, en
construction)

Sous-algos internes prévus/en cours de validation :
- `searchSequencePossibilitiesV2()` — même recherche DP que V1, mais
  conserve plusieurs chaînes partielles par état (Top-K) au lieu d'une
  seule
- `calculatePartialTemporalScore()` — dès qu'une chaîne partielle a
  au moins 2 répétitions complètes, mesure la régularité de leurs
  durées
- `calculateFinalTemporalScore()` — sur une chaîne complète (5 reps),
  mesure la régularité des durées (coefficient de variation)
- `calculateCycleShapeScore()` — sur une chaîne complète, mesure à
  quel point les 5 cycles se ressemblent en forme (corrélation avec un
  profil médian)
- `rerankCompleteSequences()` — classe les chaînes complètes selon
  Temporal + Shape (50/50 dans le prototype actuel)

### Statut au 26-27 juillet 2026 — EN COURS, NON RÉSOLU
Découverte importante : juger des chaînes complètes avec Temporal +
Shape fonctionne très bien (prouvé : la Ground Truth se classe 1ère sur
14 chaînes terminales). Mais utiliser ces mêmes critères pour décider
quelles chaînes partielles survivent PENDANT la construction (via
Top-K) ne donne pas encore le même bon résultat — la Ground Truth ne
gagne plus dans cette version du prototype.

Hypothèse actuelle à vérifier : Temporal + Shape sont de bons critères
de jugement final (chaînes complètes), mais pas nécessairement de bons
critères de survie en cours de construction (chaînes partielles, peu
d'information disponible). Ce sont deux problèmes différents qui ont
été traités avec le même outil sans vérifier que ça marche pour les
deux.

Prochaine étape : vérifier si le problème vient de l'implémentation
(le prototype ne fait pas exactement ce que l'analyse avait mesuré) ou
de l'endroit où les critères sont appliqués dans l'algorithme (utiliser
Temporal + Shape seulement à la fin, sur les chaînes complètes, pas
pendant la construction).

---

## NIVEAU 2 — Bloc 4 : Cycle Analyzer

Rôle : à partir de la séquence finale alternée, reconstruire les
cycles B-T-B et compter les répétitions valides.

### Sous-algos internes
- Vérification des durées minimales (`minConcentricDuration`,
  `minEccentricDuration`, `minRepDuration`)
- Rejet des transitions trop courtes
- Comptage final (`simulatedReps`)

### Statut
Non modifié. Prouvé fonctionner correctement quand il reçoit une bonne
séquence en entrée (ex: rowing_5reps_002, 5/5 parfait).

---

## Ce qui reste hors de cette structure (outils de recherche, pas le
pipeline lui-même)

- `groundTruthValidationRunner.ts` — outil de diagnostic qui compare
  le pipeline à une vérité terrain annotée manuellement à partir de
  vidéo. N'est jamais exécuté en production, sert uniquement à
  l'investigation.
- `calibrationBenchmarkRunner.ts` — outil qui teste plusieurs
  configurations de paramètres sur plusieurs datasets, mesure
  `simulatedReps` réel (pas juste un compte approximatif).

## Résumé visuel de l'état actuel (fin juillet 2026)

```
Génération RAW        [OK — non suspecté comme cause principale]
        ↓
Filtres qualité        [OK — impact marginal observé]
        ↓
Selection Strategy      [EN COURS — c'est ici que se joue tout le problème]
    ├── current_filters (MIN_DISTANCE)     : casse l'alternance
    ├── global_alternating_path (DP V1)    : bon compte, mauvais événements
    └── global_alternating_path_v2 (DP V2) : en construction, pas encore validé
        ↓
Cycle Analyzer          [OK — fonctionne bien avec une bonne séquence en entrée]
```
