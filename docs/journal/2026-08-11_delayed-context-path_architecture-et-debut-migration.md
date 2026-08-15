# Delayed Context Path — Architecture complète et début de migration

**Date :** 2026-08-11

---

# Objectif de la séance

L'objectif principal de cette séance était de poursuivre l'intégration de Delayed Context Path dans le vrai pipeline RepMotion.

Avant de continuer à migrer le code du runner expérimental, une clarification importante était nécessaire :

- comprendre exactement où Delayed Context Path se situe par rapport à DPV1 ;
- reconstruire l'historique des stratégies A, B, C, D, E et F ;
- identifier la stratégie réellement retenue ;
- comprendre les structures de données avant de migrer la logique ;
- commencer l'extraction fidèle du runner vers le module production.

La règle de migration reste :

> Reproduire d'abord fidèlement le comportement expérimental validé avant toute optimisation, simplification ou refactor algorithmique.

---

# 1. Position de Delayed Context Path dans le pipeline

Delayed Context Path n'est pas une quatrième stratégie indépendante située au même niveau que Current Filter, DPV1 et DPV2.

Dans l'implémentation expérimentale actuelle, DPV1 sert de bootstrap.

```text
Pool de candidats admissibles
        ↓
selectGlobalAlternatingPath()
        ↓
DPV1
        ↓
activePath initial complet
        ↓
Delayed Context Path
```

Delayed reçoit principalement l'`activePath` complet produit par DPV1, le pool de candidats disponibles et le signal nécessaire au calcul des critères.

L'activePath n'est pas considéré comme la vérité : il sert de squelette initial que Delayed peut remettre en question.

---

# 2. Architecture générale retenue de Delayed

```text
activePath DPV1 + candidatePool
              ↓
DynamicWeightedPromotion()
              ↓
    Promising + Conditional
              ↓
      ┌───────┴───────┐
      ↓               ↓
ReconstructionA() ReconstructionC()
      ↓               ↓
  segments A      segments C
      └───────┬───────┘
              ↓
       ExtractSegments()
              ↓
        segments A + C
              ↓
   GlobalCompositionD()
              ↓
       chemins globaux
              ↓
      déduplication
              ↓
   scoring/ranking tardif
              ↓
       meilleur chemin
```

La stratégie expérimentale retenue est donc essentiellement :

> Promotion + Reconstruction A + Reconstruction C + Global Composition D

D est la stratégie finale de composition globale, mais elle dépend des segments construits en amont par A et C.

---

# 3. Pourquoi A, B, C et D ont été développées

## A — Reconstruction locale initiale

A reconstruisait localement certaines portions de l'activePath à partir des alternatives prometteuses.

Résultat observé : environ 648 segments uniques.

Limite : certaines bonnes corrections nécessitaient de combiner un candidat `Promising` avec un candidat `Conditional` et sa réparation.

Exemple :

```text
BOTTOM:529
TOP:558
BOTTOM:611
```

Cette combinaison ne pouvait pas être correctement construite par A seule.

## B — Reconstruction mixte

B a été introduite pour permettre davantage de combinaisons entre `Promising` et `Conditional`.

Problème : explosion combinatoire, avec environ 18 442 hypothèses progressives dans l'expérience diagnostique.

## C — Reconstruction mixte progressive scorée

C conserve l'idée de B mais construit progressivement les hypothèses.

À chaque extension :

1. validation structurelle ;
2. scoring ;
3. classement ;
4. conservation des meilleures branches.

Résultat :

```text
B ≈ 18 442 hypothèses
C ≈ 5 119 hypothèses
```

C a notamment permis de produire :

```text
BOTTOM:529
TOP:558
BOTTOM:611
```

Le Top-K local de C peut néanmoins éliminer une branche qui deviendrait intéressante avec davantage de contexte. C sert donc à générer des briques locales supplémentaires, pas comme solution globale finale.

## D — Composition globale

A et C produisent ensemble une bibliothèque de corrections locales.

```text
A seul ≈ 648 segments
A + C  ≈ 999 segments
```

D cherche quelles corrections peuvent coexister dans une même séquence globale et vérifie notamment les chevauchements, l'alternance BOTTOM/TOP, l'ordre des indices, les distances structurelles, la validité du chemin et la déduplication.

Résultat diagnostique :

```text
10 / 11 pivots Ground Truth exacts
```

D reste actuellement la meilleure baseline déterministe observée.

---

# 4. Expériences E et F

E et F ont tenté de réduire le coût de D avec du pruning progressif pendant la composition globale.

## E

Forte réduction du nombre d'états, mais seulement 7/11 GT. Les bonnes branches étaient éliminées trop tôt.

## F

Pruning plus conservateur : 9/11 GT. Meilleur que E, mais inférieur à D.

Conclusion :

> Ne pas utiliser de pruning global agressif tant que le contexte nécessaire pour distinguer correctement les chemins n'est pas disponible.

D reste la référence.

---

# 5. Structures de données migrées

```text
delayed-context-path/
├── types.ts
├── promotion/
│   └── types.ts
├── reconstruction/
│   └── types.ts
└── composition/
    └── types.ts
```

`Candidate` représente un candidat pivot.

`DelayedContextPath = Candidate[]` représente une séquence complète de pivots utilisée par Delayed.

`PromisingAlternatives` mémorise les candidats suffisamment bien classés à une position donnée.

`ConditionalAlternatives` mémorise les candidats non exploitables seuls dans l'activePath courant mais pouvant devenir valides avec une réparation voisine.

`DSegment` représente une correction locale valide produite par A ou C.

`DState` représente une hypothèse globale partielle pendant la composition D.

`DUnique` représente un chemin global unique après déduplication avec ses provenances.

---

# 6. Dynamic Weighted Promotion

Pour chaque cycle de contexte :

```text
D1 → positions 0..2
D2 → positions 0..4
D3 → positions 0..6
D4 → positions 0..8
D5 → positions 0..10
```

Pour chaque position :

```text
position active
      ↓
parcours du candidatePool
      ↓
candidats du bon type
      ↓
essai du remplacement
      ↓
validation structurelle
      ├── valide → features → scoring → ranking → Top-3 → Promising
      └── invalide mais réparable → Conditional
```

Les anciennes positions sont réévaluées lorsque davantage de contexte devient disponible. D2 ne traite donc pas uniquement les nouvelles positions 3 et 4.

---

# 7. Mémoire cumulative Promising

`PromisingAlternatives` est cumulative.

Si un candidat devient Top-3 à un cycle donné, il est mémorisé. S'il n'est plus Top-3 lors d'un cycle ultérieur, sa promotion précédente n'est pas supprimée.

Cela correspond au principe fondamental de Delayed :

> Ne pas éliminer définitivement une hypothèse crédible simplement parce qu'un contexte particulier la rend momentanément moins intéressante.

---

# 8. Rôle du pivot actif pendant la promotion

Le pivot actuellement présent dans `activePath` n'occupe pas une place du Top-3 des alternatives.

Il sert cependant de référence dans plusieurs calculs, notamment la normalisation, la confidence et la comparaison de la population.

---

# 9. Création de config.ts

Le fichier `delayed-context-path/config.ts` a été extrait avec :

- `CriterionName`
- `CriterionDirection`
- `criteriaAtCycle`
- `directions`
- `characterizationRanks`
- `dynamicTopN`
- `maxStates`
- `maxAlternatives`

Les critères actifs sont :

```text
D1 → ZERO + JERK
D2 → ZERO + JERK
D3 → + AMPLITUDE
D4 → + TEMPORAL
D5 → + SHAPE
```

Les directions sont :

```text
ZERO_PROXY      → LOWER
JERK_PROXY      → LOWER
AMPLITUDE_PROXY → LOWER, LOWER, LOWER
TEMPORAL        → HIGHER
SHAPE           → HIGHER, HIGHER, LOWER
```

Les characterization ranks sont :

```text
ZERO_PROXY       → 1
JERK_PROXY       → 4
AMPLITUDE_PROXY  → 9
TEMPORAL         → 1
SHAPE            → 1
```

Le poids futur est calculé avec :

```text
weight = 1 / characterizationRank
```

Donc environ :

```text
ZERO       → 1.000
JERK       → 0.250
AMPLITUDE  → 0.111
TEMPORAL   → 1.000
SHAPE      → 1.000
```

`dynamicTopN = 3`.

Les guards communs extraits sont `maxStates` avec défaut 100000 et `maxAlternatives` avec défaut 1000.

---

# 10. Origine réelle des characterizationRanks

Les ranks ne représentent PAS un classement direct des critères entre eux.

La characterization utilisait :

```text
14 chemins complets produits par DPV2
+
1 Ground Truth
=
15 chemins complets
```

Chaque critère était évalué indépendamment avec la question :

> Si les 15 chaînes complètes sont classées uniquement avec ce critère, à quelle position arrive la Ground Truth ?

Résultats :

```text
ZERO       → GT #1 / 15
JERK       → GT #4 / 15
AMPLITUDE  → GT #9 / 15
TEMPORAL   → GT #1 / 15
SHAPE      → GT #1 / 15
```

Cette characterization travaillait sur des chaînes complètes. Les niveaux progressifs D1 → D5 ont été introduits ensuite dans Delayed Context Path.

---

# 11. Interprétation de la characterization

La question expérimentale était :

> Qu'est-ce qui différencie une séquence correspondant réellement au mouvement humain des autres séquences mathématiquement plausibles ?

Sur le dataset diagnostique :

- ZERO discrimine fortement la Ground Truth ;
- TEMPORAL discrimine fortement la Ground Truth ;
- SHAPE discrimine fortement la Ground Truth ;
- JERK apporte du signal mais est moins discriminant seul ;
- AMPLITUDE seule est beaucoup moins discriminante.

Cette expérience fournit une première estimation de l'importance relative des propriétés du mouvement.

---

# 12. Limite scientifique actuelle

La transformation `characterizationRank → weight = 1 / rank` est une décision expérimentale.

Les poids n'ont pas encore été identifiés ou optimisés sur un grand ensemble de datasets indépendants.

Le dataset diagnostique ayant servi à caractériser les critères a également été utilisé pendant le développement de Delayed.

Cela ne rend pas le résultat 10/11 invalide.

Il démontre que les propriétés sélectionnées contiennent du signal, que Delayed peut retrouver presque toute la Ground Truth sans recevoir directement les indices GT et que l'architecture multi-hypothèses fonctionne sur ce dataset.

La généralisation reste cependant à démontrer sur de nouvelles Ground Truth.

---

# 13. Stratégie de validation future

Une fois Delayed complètement intégré :

```text
figer l'algorithme
      ↓
figer les poids
      ↓
tester de nouvelles Ground Truth jamais utilisées
      ↓
observer où les bonnes hypothèses survivent ou disparaissent
```

Les poids `1 / {1, 4, 9, 1, 1}` ne devront pas être réajustés après chaque nouveau dataset.

Cela permettra de distinguer une architecture réellement généralisable d'une configuration trop adaptée au dataset diagnostique.

---

# 14. Pourquoi la migration continue maintenant

Les résultats actuels sont suffisamment encourageants pour justifier l'intégration dans le vrai pipeline.

L'objectif immédiat n'est pas d'optimiser Delayed, mais de transformer l'expérience validée du runner en une implémentation propre, modulaire et reproductible.

Une fois cette baseline reproduite fidèlement, les nouveaux datasets permettront de déterminer précisément quel étage échoue :

```text
RAW
 ↓
DPV1
 ↓
Promotion
 ↓
Promising / Conditional
 ↓
Reconstruction A/C
 ↓
Segments
 ↓
Composition D
 ↓
Ranking final
```

---

# 15. État de la migration à la fin de la séance

Implémenté / extrait :

```text
delayed-context-path/
├── types.ts                         ✅
├── config.ts                        ✅
├── promotion/
│   └── types.ts                     ✅
├── reconstruction/
│   └── types.ts                     ✅
└── composition/
    └── types.ts                     ✅
```

Audit effectué :

```text
Dynamic Weighted Promotion           ✅
origine des characterizationRanks    ✅
architecture A + C + D               ✅
relation DPV1 → Delayed              ✅
```

---

# 16. Dernière étape lancée ce soir

Un prompt a été envoyé à Codex pour extraire uniquement :

```text
validation/structuralRules.ts
```

L'objectif est de récupérer fidèlement les règles structurelles utilisées par le runner, notamment :

```text
minConcentricDuration = 8
minEccentricDuration = 8
minRepDuration / Bottom-to-Bottom = 45
```

ainsi que toute autre constante réellement utilisée par `validPrefix()`.

Aucune fonction de validation complète ne doit encore être migrée à cette étape.

---

# Prochaine séance

Commencer par examiner le résultat Codex pour `validation/structuralRules.ts`.

Puis poursuivre dans cet ordre :

```text
structuralRules.ts
        ↓
validatePath.ts
        ↓
features / scoring
        ↓
scoreCandidate.ts
        ↓
promoteCandidates.ts
        ↓
reconstruction A/C
        ↓
composition D
```

À chaque étape :

1. retrouver la logique exacte du runner ;
2. comprendre son rôle ;
3. extraire sans modification algorithmique ;
4. vérifier la parité ;
5. seulement ensuite passer au bloc suivant.

---

# Décision de fin de séance

La direction actuelle est conservée.

Nous ne retournons pas immédiatement modifier les poids ou multiplier les expériences Ground Truth.

La priorité reste :

> terminer une implémentation production fidèle de la baseline expérimentale qui a obtenu 10/11 sur le dataset diagnostique.

Une fois cette baseline intégrée et reproductible, elle sera figée puis évaluée sur plusieurs nouvelles Ground Truth afin de mesurer sa véritable capacité de généralisation.

---

**FIN DU DOCUMENT — 2026-08-11**
