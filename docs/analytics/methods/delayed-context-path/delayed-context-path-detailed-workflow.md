# Delayed Context Path — Detailed Workflow

## Objectif du document

Ce document décrit le fonctionnement mécanique détaillé de **Delayed Context Path**.

Il complète `delayed-context-path.md`, qui décrit principalement :

- le concept général ;
- les motivations ;
- l'architecture ;
- les différentes mémoires ;
- les résultats expérimentaux ;
- les principes de la méthode.

Le présent document répond plutôt à la question :

> Que se passe-t-il exactement dans Delayed Context Path, depuis les données reçues jusqu'à la composition globale D ?

Une distinction est fondamentale :

**Delayed Context Path ne génère pas les candidats RAW.**

Il intervient après la génération RAW et travaille à partir de :

1. un chemin initial complet ;
2. un pool de candidats disponibles ;
3. le signal nécessaire au calcul des critères.

---

# 1. Entrées de Delayed Context Path

Delayed Context Path reçoit deux structures fondamentales.

## 1.1 Active Path

`activePath` est la première séquence complète sélectionnée par la Calibration.

Exemple :

```text
Position 0  → B169
Position 1  → T195
Position 2  → B228
Position 3  → T291
Position 4  → B299
Position 5  → T333
Position 6  → B391
Position 7  → T467
Position 8  → B500
Position 9  → T509
Position 10 → B564
```

Cette séquence respecte déjà la structure générale attendue :

```text
BOTTOM → TOP → BOTTOM → TOP → ...
```

Delayed Context Path ne considère cependant pas cette séquence comme une vérité définitive.

Elle constitue :

- le chemin de référence ;
- le contexte initial ;
- le support sur lequel les alternatives seront testées.

---

## 1.2 Pool de candidats RAW

En parallèle, Delayed Context Path reçoit les candidats disponibles issus de la génération RAW.

Exemple :

```text
BOTTOM

B169
B210
B228
B262
B299
B353
B391
B445
B500
B529
B530
B564
B611
...
```

et :

```text
TOP

T179
T195
T199
T265
T291
T333
T383
T467
T474
T509
T555
T558
...
```

Ces candidats constituent les pièces disponibles pour construire des hypothèses alternatives.

Delayed Context Path ne crée donc pas de nouveaux RAW pendant sa recherche.

Il réutilise ce pool.

---

# 2. Vue générale du début du traitement

Au démarrage, nous avons donc :

```text
ACTIVE PATH INITIAL
+
POOL RAW
+
SIGNAL
```

Par exemple :

```text
Active Path

B169 - T195 - B228 - T291 - B299 - ...
```

et :

```text
Pool RAW

TOP:
T179
T195
T199
T265
T291
...

BOTTOM:
B169
B210
B228
B262
B299
...
```

Delayed Context Path va parcourir progressivement le chemin initial et vérifier si certains candidats du pool pourraient remplacer les pivots actuellement présents.

---

# 3. Exploration progressive par nombre de cycles

Delayed Context Path n'analyse pas immédiatement les cinq cycles complets avec tous les critères.

Le contexte est augmenté progressivement.

Conceptuellement :

```text
D1 → 1 cycle
D2 → 2 cycles
D3 → 3 cycles
D4 → 4 cycles
D5 → 5 cycles
```

Avec une séquence :

```text
B0 - T1 - B2 - T3 - B4 - T5 - B6 - T7 - B8 - T9 - B10
```

cela donne :

```text
D1
[B0 - T1 - B2]

D2
[B0 - T1 - B2 - T3 - B4]

D3
[B0 - T1 - B2 - T3 - B4 - T5 - B6]

D4
[B0 - T1 - B2 - T3 - B4 - T5 - B6 - T7 - B8]

D5
[B0 - T1 - B2 - T3 - B4 - T5 - B6 - T7 - B8 - T9 - B10]
```

Le contexte est donc **cumulatif**.

À D2 :

```text
cycle 1 + cycle 2
```

sont considérés.

À D3 :

```text
cycle 1 + cycle 2 + cycle 3
```

sont considérés.

Le moteur ne recommence pas uniquement avec le nouveau cycle.

---

# 4. Activation progressive des critères

Tous les critères ne sont pas considérés comme suffisamment informatifs au même moment.

La stratégie actuelle utilise :

```text
1 cycle
→ ZERO_PROXY
→ JERK_PROXY

2 cycles
→ ZERO_PROXY
→ JERK_PROXY

3 cycles
→ ZERO_PROXY
→ JERK_PROXY
→ AMPLITUDE

4 cycles
→ ZERO_PROXY
→ JERK_PROXY
→ AMPLITUDE
→ TEMPORAL

5 cycles
→ ZERO_PROXY
→ JERK_PROXY
→ AMPLITUDE
→ TEMPORAL
→ SHAPE
```

Le principe est :

> Un critère global ne doit pas avoir une forte influence avant que suffisamment de contexte existe pour qu'il soit réellement informatif.

---

# 5. Premier cycle : que fait réellement la boucle ?

Prenons le premier cycle du chemin initial :

```text
B169 - T195 - B228
```

Delayed Context Path examine les positions appartenant à ce contexte.

Prenons :

```text
Position 1
```

Le pivot actuellement sélectionné est :

```text
T195
```

Puisque cette position doit contenir un `TOP`, le moteur consulte le pool RAW et recherche les autres `TOP` pouvant potentiellement occuper cette position.

Par exemple :

```text
T179
T199
T205
T265
...
```

Il ne génère aucun nouveau candidat.

Tous ces candidats existaient déjà dans le pool RAW reçu en entrée.

---

# 6. Un candidat n'est jamais évalué seul

C'est un principe fondamental de la méthode.

Delayed Context Path ne demande pas :

```text
"T199 est-il un bon pivot ?"
```

Nos critères décrivent principalement des cycles et des séquences.

Le moteur demande plutôt :

```text
"Que devient la séquence si T199 occupe cette position ?"
```

---

# 7. Construction d'une hypothèse pour un candidat

Le chemin actif est :

```text
B169 - T195 - B228
```

Pour tester `T199`, le moteur remplace temporairement le pivot de la position 1.

L'hypothèse devient :

```text
B169 - T199 - B228
```

La relation est donc :

```text
Candidat testé
     ↓
   T199

Hypothèse réellement évaluée
     ↓
B169 - T199 - B228
```

Le candidat est simplement responsable de la modification.

C'est la séquence résultante qui est réellement évaluée.

---

# 8. Tous les candidats pertinents sont essayés

Pour la position 1, le moteur peut donc produire :

```text
Active
B169 - T195 - B228

Alternative T179
B169 - T179 - B228

Alternative T199
B169 - T199 - B228

Alternative T205
B169 - T205 - B228
```

Chaque hypothèse correspond à un candidat possible pour la même position logique.

---

# 9. Validation structurelle avant scoring

Avant de scorer une hypothèse, Delayed Context Path vérifie les règles structurelles.

Notamment :

- alternance BOTTOM / TOP ;
- indices strictement croissants ;
- distance minimale entre pivots adjacents ;
- contrainte BOTTOM → BOTTOM ;
- autres règles de `validPrefix`.

Deux situations deviennent possibles :

```text
Hypothèse
   │
   ├── structure valide
   │       ↓
   │     scoring normal
   │
   └── structure invalide
           ↓
       recherche éventuelle
       d'une réparation
```

Le deuxième cas donnera plus tard les `conditional`.

---

# 10. Calcul des critères sur l'hypothèse

Supposons que nous soyons à D1.

Un seul cycle est disponible.

Les critères utilisés sont donc :

```text
ZERO_PROXY
JERK_PROXY
```

Pour chacune des hypothèses :

```text
B169 - T195 - B228
B169 - T179 - B228
B169 - T199 - B228
B169 - T205 - B228
```

le moteur calcule les caractéristiques disponibles.

Conceptuellement :

```text
Hypothèse avec T195

ZERO = ...
JERK = ...


Hypothèse avec T179

ZERO = ...
JERK = ...


Hypothèse avec T199

ZERO = ...
JERK = ...


Hypothèse avec T205

ZERO = ...
JERK = ...
```

Encore une fois :

**ZERO et JERK n'évaluent pas directement T199.**

Ils évaluent la séquence construite avec T199.

---

# 11. Population locale de comparaison

Les hypothèses d'une même position constituent une population comparable.

Exemple :

```text
Position 1

T195
T179
T199
T205
```

Cela signifie réellement :

```text
B169-T195-B228
B169-T179-B228
B169-T199-B228
B169-T205-B228
```

Les valeurs des critères de ces hypothèses vont être comparées entre elles.

---

# 12. Normalisation des critères

Les critères peuvent avoir des unités et des échelles complètement différentes.

Ils sont donc orientés puis normalisés.

La normalisation produit une valeur approximativement comprise entre :

```text
-1 → mauvais relativement aux autres hypothèses
 0 → intermédiaire
+1 → bon relativement aux autres hypothèses
```

La normalisation locale utilisée est :

```text
n = 2 × (x - min) / (max - min) - 1
```

avec orientation préalable selon le sens du critère.

Si la plage est nulle :

```text
n = 0
```

---

# 13. Confiance locale du critère

Un critère peut être disponible sans être réellement discriminant.

Exemple :

```text
10.00
10.01
10.02
10.03
```

Les valeurs sont pratiquement identiques.

Le critère apporte donc peu d'information.

À l'inverse :

```text
2
8
25
40
```

le critère sépare fortement les hypothèses.

Une confiance locale est donc calculée :

```text
confidence =
range / (range + MAD autour de la médiane)
```

Cette confiance vient moduler l'importance réelle du critère dans cette décision précise.

---

# 14. Pondération historique

Chaque critère possède également un poids historique.

Les poids actuellement dérivés des expérimentations sont :

```text
ZERO      = 1 / 1
JERK      = 1 / 4
AMPLITUDE = 1 / 9
TEMPORAL  = 1 / 1
SHAPE     = 1 / 1
```

La contribution d'un critère devient conceptuellement :

```text
contribution =
normalizedContribution
× historicalWeight
× localConfidence
```

Puis :

```text
promotionScore =
somme des contributions
```

Un critère individuel négatif ne possède donc plus un droit de veto automatique.

---

# 15. Ranking des candidats pour UNE position

Après calcul du score, les candidats sont classés pour la position actuellement étudiée.

Exemple :

```text
Position 1

T199 → score 0.88
T179 → score 0.71
T205 → score 0.41
T265 → score -0.12
...
```

La stratégie actuelle conserve les meilleurs candidats selon Dynamic Weighted Promotion Top-3.

Par exemple :

```text
T199
T179
T205
```

deviennent `promising`.

---

# 16. PromisingAlternatives est organisé par position

Les candidats prometteurs ne sont pas stockés dans une grande liste globale.

Ils sont rangés par **position logique du chemin**.

Exemple :

```text
Position 1
├── T179
├── T199
└── T205

Position 2
├── B228
└── B262

Position 3
├── T291
└── T303
```

La structure TypeScript correspondante est :

```ts
Map<Position, Map<CandidateKey, Candidate>>
```

Mentalement :

```text
Position
    ↓
CandidateKey
    ↓
Candidate
```

Exemple développé :

```text
{
  1: {
    "TOP:179": {
      candidateId: "...",
      type: "TOP",
      index: 179,
      value: ...
    },

    "TOP:199": {
      candidateId: "...",
      type: "TOP",
      index: 199,
      value: ...
    }
  },

  2: {
    "BOTTOM:262": {
      candidateId: "...",
      type: "BOTTOM",
      index: 262,
      value: ...
    }
  }
}
```

---

# 17. La promotion ne change pas immédiatement activePath

Supposons :

```text
activePath

B169 - T195 - B228
```

Après D1, on peut avoir :

```text
promising[position 1]

T179
T199
T205
```

Mais le chemin actif reste :

```text
B169 - T195 - B228
```

La promotion signifie uniquement :

> Ces candidats ont produit des hypothèses suffisamment intéressantes pour ne pas être oubliés.

Ils deviennent une mémoire d'alternatives.

Aucune décision globale définitive n'est encore prise.

---

# 18. Passage au deuxième cycle

À D2, le contexte devient :

```text
B169 - T195 - B228 - T291 - B299
```

Les deux cycles sont maintenant pris en considération.

Le moteur ne considère pas seulement :

```text
B228 - T291 - B299
```

Il considère tout le préfixe :

```text
B169 - T195 - B228 - T291 - B299
```

Le contexte est donc cumulatif.

---

# 19. Une modification peut maintenant influencer plusieurs cycles

Prenons :

```text
B228
```

et testons :

```text
B262
```

L'hypothèse devient :

```text
B169 - T195 - B262 - T291 - B299
```

Le pivot `B262` se trouve à la frontière de deux cycles.

Cycle 1 :

```text
B169 - T195 - B262
```

Cycle 2 :

```text
B262 - T291 - B299
```

Modifier ce pivot peut donc affecter les caractéristiques des deux cycles.

Cela illustre pourquoi :

**le candidat n'est jamais évalué comme un point isolé.**

Il est évalué à travers son impact sur la séquence.

---

# 20. La mémoire promising est cumulative

Les alternatives découvertes à D1 ne sont pas automatiquement supprimées à D2.

Exemple :

```text
Après D1

Position 1
├── T179
└── T199
```

Puis :

```text
Après D2

Position 1
├── T179
├── T199
└── éventuellement une nouvelle alternative
```

Le système accumule progressivement les possibilités intéressantes.

Cette accumulation est une partie fondamentale du principe Delayed Context.

---

# 21. D3, D4 et D5

Le même principe continue.

## D3

Contexte :

```text
3 cycles
```

AMPLITUDE devient disponible.

## D4

Contexte :

```text
4 cycles
```

TEMPORAL devient disponible.

TEMPORAL peut maintenant comparer la régularité des durées :

```text
BOTTOM → TOP
TOP → BOTTOM
BOTTOM → BOTTOM
```

sur plusieurs cycles.

## D5

Contexte :

```text
5 cycles
```

SHAPE devient disponible.

Les cycles peuvent maintenant être comparés selon leur forme.

---

# 22. Comment un pivot peut bénéficier de TEMPORAL ou SHAPE

Prenons un candidat :

```text
B529
```

B529 n'obtient pas directement un score SHAPE.

Le moteur construit une hypothèse complète où B529 occupe une position.

Cette modification change un ou plusieurs cycles.

Puis :

```text
hypothèse avec B529
        ↓
cycles résultants
        ↓
TEMPORAL / SHAPE
        ↓
score de l'hypothèse
        ↓
B529 est responsable de cette hypothèse
        ↓
B529 peut devenir promising
```

C'est ainsi que des critères de séquence peuvent servir à promouvoir des pivots individuels.

---

# 23. Cas d'un candidat structurellement invalide

Prenons maintenant le cas réel important :

```text
Position 9
active = T509
```

Le contexte local contient :

```text
B500 - T509 - B564
```

Le pool contient aussi :

```text
T558
```

Le moteur teste donc :

```text
B500 - T558 - B564
```

Mais :

```text
558 → 564 = 6 samples
```

La contrainte structurelle demande au moins 8 samples.

T558 est donc invalide seul dans le contexte actuel.

---

# 24. Pourquoi T558 n'est pas simplement supprimé

Le problème peut venir du voisin actuel plutôt que du candidat lui-même.

Delayed Context Path cherche donc si une modification voisine pourrait rendre T558 valide.

Il teste par exemple :

```text
B500 - T558 - B611
```

Cette fois :

```text
558 → 611 = 53
```

La structure devient valide.

Delayed Path conclut alors :

```text
T558 n'est pas exploitable seul maintenant,
mais pourrait devenir exploitable si la position voisine est réparée.
```

T558 devient une :

```text
ConditionalAlternative
```

et B611 une :

```text
ConditionalRepair
```

---

# 25. ConditionalRepair

Une réparation conditionnelle représente :

```text
"Quel candidat voisin peut réparer mon candidat conditionnel ?"
```

Exemple :

```text
position 10
→ B611
```

Structure conceptuelle :

```text
ConditionalRepair

position
→ 10

candidate
→ B611
```

---

# 26. ConditionalAlternative

Une alternative conditionnelle représente :

```text
un candidat temporairement invalide
+
les réparations capables de le rendre valide
```

Exemple :

```text
T558
│
├── repair B595
├── repair B609
└── repair B611
```

Conceptuellement :

```text
ConditionalAlternative

candidate
→ T558

repairs
→ {
     B595,
     B609,
     B611
   }
```

---

# 27. ConditionalAlternatives est aussi organisé par position

Comme `promising`, les candidats conditionnels sont rangés par position.

Exemple :

```text
Position 9

T555
└── repairs ...

T558
├── B595
├── B609
└── B611
```

Plus globalement :

```text
Position 3
└── conditionals...

Position 6
└── conditionals...

Position 9
├── T555
└── T558
```

La structure mentale est :

```text
Position
    ↓
Conditional Candidate
    ↓
Possible Repairs
```

---

# 28. État après la phase de promotion progressive

Après D1 → D5, Delayed Context Path possède donc trois choses importantes :

```text
1. activePath

2. PromisingAlternatives

3. ConditionalAlternatives
```

Par exemple :

```text
ACTIVE PATH

...
B500 - T509 - B564
```

Promising :

```text
Position 8
├── B500
├── B529
└── B530
```

Conditional :

```text
Position 9
└── T558
      ├── repair B595
      ├── repair B609
      └── repair B611
```

À ce stade, beaucoup de possibilités ont été mémorisées, mais elles n'ont pas encore été combinées en corrections plus larges.

---

# 29. Début de la reconstruction locale

La reconstruction va maintenant utiliser les mémoires accumulées.

Prenons :

```text
T558
```

avec :

```text
repair B611
```

Une première petite reconstruction est :

```text
T558 - B611
```

Puis le moteur regarde la position précédente.

Grâce à `PromisingAlternatives`, il sait que cette position possède :

```text
B500
B529
B530
```

Il peut donc essayer :

```text
B500 - T558 - B611

B529 - T558 - B611

B530 - T558 - B611
```

---

# 30. ProgressiveReconstructionState

Chaque branche en cours de construction doit être mémorisée.

Exemple :

```text
T558 - B611
```

puis :

```text
B529 - T558 - B611
```

Un `ProgressiveReconstructionState` représente une photographie de cette branche.

Il peut contenir conceptuellement :

```text
path
→ chemin complet actuellement produit

start
→ première position modifiée

end
→ dernière position modifiée

conditionalCandidate
→ T558

repairCandidate
→ B611

depth
→ profondeur actuelle d'extension

score
→ qualité actuelle de la branche
```

Donc :

```text
ProgressiveReconstructionState
=
état courant d'une hypothèse pendant sa construction
```

---

# 31. Reconstruction progressive C

C part généralement d'une paire conditionnelle réparée.

Exemple :

```text
T558 - B611
```

Puis l'étend progressivement vers la gauche avec les possibilités disponibles.

```text
Étape 1

T558 - B611
```

Puis :

```text
Étape 2

B529 - T558 - B611
```

Puis éventuellement :

```text
Étape 3

T474 - B529 - T558 - B611
```

Chaque extension est :

1. générée ;
2. validée structurellement ;
3. scorée ;
4. comparée aux extensions concurrentes ;
5. conservée ou non selon la stratégie.

---

# 32. LocalReconstructionCandidate

Lorsqu'une reconstruction locale valide existe réellement, elle devient une hypothèse locale complète.

Exemple :

```text
B529 - T558 - B611
```

Elle contient conceptuellement :

```text
start
→ position 8

candidates
→ B529
→ T558
→ B611

chain
→ chemin complet obtenu après application

features
→ caractéristiques calculées sur cette reconstruction
```

La différence importante est :

```text
Promising
= possibilité mémorisée

Conditional
= possibilité nécessitant une réparation

ProgressiveState
= branche actuellement en construction

LocalReconstruction
= reconstruction réellement produite
```

---

# 33. Conservation du chemin avant et après

Pour transformer une reconstruction locale en brique réutilisable, le moteur conserve :

```text
activeBefore
```

et :

```text
chain
```

Exemple :

```text
AVANT

... T467 - B500 - T509 - B564
```

Après reconstruction :

```text
APRÈS

... T474 - B529 - T558 - B611
```

Le moteur peut alors déterminer exactement quelles positions ont changé.

---

# 34. Extraction d'un segment

Le moteur cherche :

```text
première position différente
```

puis :

```text
dernière position différente
```

La zone comprise entre les deux devient une correction locale canonique.

Exemple important :

```text
positions 8 → 10

B529 - T558 - B611
```

Cette correction devient un `Segment`.

Un segment signifie désormais :

> Cette combinaison précise de pivots a déjà été construite et validée comme correction locale cohérente.

---

# 35. Passage de pivots individuels à des briques de reconstruction

Le niveau d'abstraction a maintenant changé.

Au départ :

```text
RAW individuels
```

Puis :

```text
alternatives par position
```

Puis :

```text
reconstructions locales
```

Puis :

```text
segments
```

Le moteur dispose maintenant d'une bibliothèque de corrections locales déjà cohérentes.

---

# 36. Segments provenant de A et C

Les reconstructions locales A et C produisent des segments.

Dans le dataset diagnostique utilisé pendant le développement :

```text
A + C
→ 999 segments uniques
```

La Ground Truth possédait alors une couverture segmentaire complète :

```text
chaque position GT
→ au moins une brique locale compatible
```

La question suivante devient donc :

> Comment combiner correctement ces différentes briques ?

C'est le rôle de D.

---

# 37. Entrée dans Global Composition D

D reçoit :

```text
activePath
+
bibliothèque de segments
```

À ce stade :

**D ne retourne pas chercher les RAW.**

Il ne travaille plus principalement avec les pivots individuels.

Il travaille avec des corrections locales déjà construites.

Son problème devient :

> Quelles corrections locales découvertes à différents moments peuvent coexister dans un même chemin global ?

---

# 38. Structure d'un segment

Un segment possède conceptuellement :

```text
start
→ position de départ

end
→ position de fin

replacements
→ pivots proposés sur cette zone
```

Exemple :

```text
Segment S0946

start = 8
end   = 10

replacements:

B529
T558
B611
```

---

# 39. Compatibilité entre deux segments

Deux segments peuvent être combinés lorsqu'ils sont disjoints.

Exemple :

```text
Segment A
positions 2 → 4

Segment B
positions 8 → 10
```

Ils ne se chevauchent pas.

Ils peuvent donc être appliqués ensemble.

---

# 40. Compatibilité avec overlap

Deux segments peuvent également se chevaucher si les positions communes proposent exactement les mêmes pivots.

Exemple :

```text
Segment A

position 7 → T474
position 8 → B529
position 9 → T558
```

et :

```text
Segment B

position 8  → B529
position 9  → T558
position 10 → B611
```

Overlap :

```text
position 8
A = B529
B = B529

position 9
A = T558
B = T558
```

Les segments sont compatibles.

---

# 41. Exemple d'overlap incompatible

Si :

```text
Segment A
position 9 → T558
```

et :

```text
Segment B
position 9 → T555
```

les deux segments proposent des pivots différents pour la même position.

Ils ne peuvent pas coexister.

La combinaison est rejetée.

---

# 42. Construction d'une hypothèse globale

D prend plusieurs segments compatibles et les applique au chemin de base.

Conceptuellement :

```text
activePath
      +
segment 1
      +
segment 2
      +
segment 28
      ↓
nouveau chemin complet
```

C'est exactement le principe de recomposition globale :

plusieurs bonnes corrections locales, découvertes séparément, peuvent être réunies dans une seule hypothèse globale.

---

# 43. Validation structurelle globale

Une combinaison de segments compatible au niveau des overlaps n'est pas automatiquement un chemin valide.

Le chemin complet résultant doit encore respecter :

- alternance ;
- ordre strict ;
- distances minimales ;
- règles BOTTOM → BOTTOM ;
- validation structurelle générale.

Ainsi :

```text
segments individuellement valides
```

ne garantit pas automatiquement :

```text
combinaison globale valide
```

---

# 44. Déduplication des chemins globaux

Plusieurs ensembles différents de segments peuvent produire exactement le même chemin final.

Exemple :

```text
S1 + S4 + S20
```

peut produire exactement le même chemin que :

```text
S7 + S30
```

Le moteur crée donc une signature du chemin.

Exemple :

```text
BOTTOM:169
|TOP:199
|BOTTOM:262
|TOP:291
...
```

Si la signature existe déjà :

```text
chemin dupliqué
→ ne pas le conserver une deuxième fois
```

---

# 45. Pourquoi D ne score pas agressivement pendant la génération

Les expériences E et F ont tenté de réduire fortement l'espace de recherche en scorant les branches partielles pendant leur construction.

Le résultat a montré que de bonnes branches pouvaient sembler relativement faibles lorsqu'elles ne possédaient encore que peu de contexte.

Elles étaient alors supprimées avant de pouvoir devenir de très bonnes séquences complètes.

La stratégie D retenue préfère donc :

```text
générer
→ vérifier la compatibilité
→ valider la structure
→ dédupliquer
→ conserver
→ attendre davantage de contexte
```

plutôt que :

```text
générer partiellement
→ scorer agressivement
→ supprimer tôt
```

Cette décision est directement cohérente avec le principe fondamental de Delayed Context Path.

---

# 46. TEMPORAL et SHAPE sur les chemins globaux

Une fois que les chemins complets ont été générés, les critères globaux possèdent enfin beaucoup de contexte.

TEMPORAL peut mesurer la régularité temporelle globale.

SHAPE peut mesurer la cohérence de forme entre plusieurs cycles.

Ces critères deviennent donc particulièrement intéressants pour comparer des hypothèses complètes.

---

# 47. Résultat diagnostique obtenu avec D

Sur le dataset contrôlé utilisé pour développer la méthode, le meilleur chemin observé avec D est :

```text
B169
T199
B228
T291
B353
T383
B445
T474
B529
T558
B611
```

La Ground Truth est :

```text
B169
T199
B262
T291
B353
T383
B445
T474
B529
T558
B611
```

Une seule position diffère :

```text
position 2

D  = B228
GT = B262
```

Résultat observé :

```text
10 / 11 pivots exacts
```

Ce résultat constitue la meilleure baseline déterministe obtenue pendant cette investigation sur ce dataset.

Il ne constitue pas à lui seul une mesure de généralisation sur tous les datasets.

---

# 48. Les trois niveaux de mémoire

Delayed Context Path peut être compris comme trois mémoires successives.

## Mémoire 1 — possibilités par position

```text
Promising
+
Conditional
```

Question :

> Quels pivots devons-nous éviter de détruire trop tôt ?

---

## Mémoire 2 — corrections locales

```text
Segments
```

Question :

> Quelles petites combinaisons de pivots avons-nous réellement réussi à construire de manière cohérente ?

---

## Mémoire 3 — hypothèses globales

```text
Global Paths
```

Question :

> Quelles combinaisons de corrections locales peuvent expliquer toute la série ?

---

# 49. Workflow complet

```text
GENERATION RAW
      │
      ├───────────────────────┐
      │                       │
      ▼                       ▼
candidate pool         activePath initial
      │                       │
      └───────────┬───────────┘
                  ▼
         DELAYED CONTEXT PATH
                  │
                  ▼
             D1 : 1 cycle
                  │
                  ▼
          boucle par position
                  │
                  ▼
       candidats RAW du bon type
                  │
                  ▼
        remplacement temporaire
                  │
                  ▼
         hypothèse de séquence
                  │
          ┌───────┴────────┐
          │                │
        valide          invalide
          │                │
          ▼                ▼
      critères       chercher repair
          │                │
          ▼                ▼
    normalisation      conditional
          │
          ▼
      confidence
          │
          ▼
   poids historiques
          │
          ▼
        score
          │
          ▼
       ranking
          │
          ▼
        Top-3
          │
          ▼
      promising
          │
          ▼
 D2 → D3 → D4 → D5
 contexte cumulatif
          │
          ▼
promising + conditional
          │
          ▼
reconstruction locale A + C
          │
          ▼
reconstructions valides
          │
          ▼
 comparaison avant / après
          │
          ▼
  extraction des segments
          │
          ▼
 bibliothèque de segments
          │
          ▼
    GLOBAL COMPOSITION D
          │
          ▼
 combinaisons compatibles
          │
          ▼
   chemins globaux
          │
          ▼
validation + déduplication
          │
          ▼
évaluation globale tardive
TEMPORAL / SHAPE
          │
          ▼
 meilleures hypothèses
```

---

# 50. Principe fondamental à retenir

Delayed Context Path ne cherche pas simplement à répondre :

```text
"Quel pivot est le meilleur maintenant ?"
```

Il cherche progressivement à répondre à trois questions.

## Question 1

```text
Quels pivots restent plausibles ?
```

Réponse :

```text
Promising + Conditional
```

## Question 2

```text
Quelles petites combinaisons de ces pivots
forment des corrections locales cohérentes ?
```

Réponse :

```text
Segments
```

## Question 3

```text
Quelles combinaisons de ces corrections
forment une séquence globale cohérente ?
```

Réponse :

```text
Global Composition D
```

Le candidat RAW n'est donc jamais considéré uniquement comme un point isolé.

Il est :

1. inséré dans une hypothèse de séquence ;
2. évalué dans le contexte disponible ;
3. mémorisé s'il produit une hypothèse intéressante ;
4. éventuellement combiné avec d'autres alternatives ;
5. transformé en correction locale ;
6. puis utilisé dans des reconstructions globales.

Le cœur de Delayed Context Path est donc :

> **Retarder autant que possible les décisions irréversibles afin de laisser le contexte futur résoudre les ambiguïtés présentes.**