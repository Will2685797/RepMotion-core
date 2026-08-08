# Fonctionnement actuel de Delayed Path avec la stratégie D

Delayed Path n'est plus simplement une méthode qui prend un `activePath`,
essaie quelques remplacements locaux, puis effectue du backtracking.

Après les différentes investigations, il est devenu un système de recherche
multi-hypothèses différée composé de plusieurs étages.

L'idée centrale est de ne plus prendre des décisions définitives trop tôt.

Lorsqu'une hypothèse semble moins bonne avec peu de contexte, Delayed Path
essaie autant que possible de la conserver sous une forme exploitable afin
de pouvoir la réévaluer plus tard avec davantage d'information.

---

## 1. ActivePath comme point de départ

Delayed Path commence avec un `activePath`.

L'activePath est une première hypothèse complète sur la séquence de pivots.

Il ne doit plus être considéré comme "la vérité" que l'algorithme corrige
définitivement à chaque étape.

Il sert plutôt de :

- chemin de départ ;
- contexte structurel ;
- support sur lequel différentes corrections peuvent être essayées.

En parallèle, le système possède un pool de candidats pouvant potentiellement
remplacer certains pivots de cet activePath.

---

## 2. Première mémoire : les candidats prometteurs

Les candidats sont évalués avec :

- ZERO_PROXY
- JERK_PROXY
- AMPLITUDE / ROM
- TEMPORAL
- SHAPE

selon la quantité de contexte disponible.

L'ancienne logique de veto a été remplacée par :

DYNAMIC_WEIGHTED_PROMOTION Top-3.

Chaque candidat reçoit un score composé de :

- contribution normalisée ;
- poids historique du critère ;
- confiance locale.

Un mauvais critère individuel ne peut plus éliminer automatiquement un
candidat.

Le système conserve plusieurs alternatives intéressantes au lieu de prendre
une décision unique prématurée.

Sur le dataset diagnostique étudié :

11/11 pivots Ground Truth deviennent disponibles.

Cette liste constitue la première mémoire de Delayed Path :

"À cette position, voici le pivot actif, mais voici également plusieurs
alternatives crédibles qu'il serait dangereux d'éliminer trop tôt."

---

## 3. Les alternatives conditionnelles

Certaines alternatives peuvent être intéressantes mais temporairement
incompatibles avec l'activePath actuel.

Exemple principal :

TOP:558

Avec le voisin actif BOTTOM:564 :

558 → 564 = 6 samples

La contrainte structurelle exige au moins 8 samples.

TOP:558 est donc invalide dans le contexte actuel.

Mais avec :

BOTTOM:611

558 → 611 = 53

la reconstruction devient valide.

Delayed Path peut donc conserver ce type de candidat comme :

conditional structural alternative.

Cela signifie :

"Ce candidat n'est pas exploitable seul maintenant, mais il pourrait devenir
valide si une autre partie du chemin est corrigée."

Cette capacité est importante parce qu'elle empêche de détruire une bonne
hypothèse uniquement à cause d'un mauvais voisin temporaire.

---

## 4. Reconstruction locale progressive

Les alternatives `promising` et `conditional` sont ensuite utilisées pour
construire des corrections locales.

Initialement, ces deux populations étaient séparées.

Cela empêchait par exemple la combinaison :

BOTTOM:529
TOP:558
BOTTOM:611

d'être essayée.

Une stratégie mixed a donc été ajoutée.

La version naïve créait trop de combinaisons.

La version retenue utilise donc une reconstruction progressive scorée.

Exemple :

TOP:558 + BOTTOM:611

est une hypothèse conditionnelle réparée.

Le moteur peut ensuite essayer :

BOTTOM:500 - TOP:558 - BOTTOM:611
BOTTOM:529 - TOP:558 - BOTTOM:611
BOTTOM:530 - TOP:558 - BOTTOM:611

Chaque extension est :

1. validée structurellement ;
2. scorée ;
3. classée ;
4. éventuellement conservée pour l'extension suivante.

Le système ne travaille donc plus uniquement avec des pivots individuels.

Il commence à raisonner sur de petites séquences de pivots.

Cette étape a notamment permis de produire :

BOTTOM:529 - TOP:558 - BOTTOM:611

qui était auparavant impossible à générer.

---

## 5. Deuxième mémoire : les segments

Lorsqu'une reconstruction locale valide est produite, elle n'est pas perdue.

Le système compare :

source activePath

avec :

resultingPath.

Il identifie :

- la première position modifiée ;
- la dernière position modifiée.

Cette zone devient un segment canonique.

Un segment représente donc :

"Une correction locale cohérente que Delayed Path a déjà réussi à construire."

Exemple :

S0946

positions 8 à 10 :

BOTTOM:529
TOP:558
BOTTOM:611

À ce niveau, le système ne travaille plus avec des RAW ou des pivots isolés.

Il possède maintenant une bibliothèque de corrections locales réutilisables.

Avec les stratégies A + C :

999 segments sont disponibles.

La couverture Ground Truth positionnelle devient complète :

chaque position GT possède au moins une brique locale compatible.

Cette population de segments constitue la deuxième mémoire de Delayed Path.

---

## 6. Stratégie D : recomposition globale

La stratégie D commence lorsque les segments ont déjà été construits.

D ne retourne pas chercher les RAW.

D ne rescrore pas non plus les 999 segments avant de commencer.

Les critères pondérés ont déjà influencé la population en amont :

1. promotion des pivots ;
2. reconstruction locale progressive.

D prend ensuite les 999 segments et cherche quelles corrections locales
peuvent coexister dans une même hypothèse globale.

C'est ici que Delayed Path devient réellement un moteur de recherche
multi-hypothèses global.

---

## 7. Composition des segments

Chaque segment possède :

- une position de début ;
- une position de fin ;
- les pivots qu'il propose.

Les segments ne sont donc pas permutés arbitrairement.

Ils sont appliqués dans leur ordre naturel le long du chemin.

Deux segments peuvent être combinés si :

1. ils sont disjoints ;

OU

2. ils se chevauchent et proposent exactement les mêmes pivots sur les
positions communes.

Si deux segments proposent deux pivots différents pour la même position :

la combinaison est rejetée.

---

## 8. Validation du chemin global

Lorsque plusieurs segments sont combinés, ils sont appliqués sur le chemin
de base.

Le resultingPath complet doit ensuite respecter toutes les contraintes
structurelles existantes :

- alternance BOTTOM / TOP ;
- ordre strict des indices ;
- distances adjacentes minimales ;
- contraintes BOTTOM-BOTTOM ;
- validPrefix / validation complète.

Une combinaison de segments peut donc être localement cohérente mais être
rejetée si son chemin global est impossible.

---

## 9. Déduplication

Plusieurs ensembles différents de segments peuvent produire exactement le
même chemin global.

Delayed Path crée donc une signature complète :

BOTTOM:index | TOP:index | BOTTOM:index | ...

Si deux compositions produisent la même signature :

le chemin global n'est conservé qu'une seule fois.

Les différentes provenances peuvent toutefois être conservées pour le
diagnostic.

---

## 10. Troisième mémoire : les hypothèses globales

Après composition, validation et déduplication, Delayed Path possède une
population de chemins complets possibles.

Cette population représente la troisième mémoire du système :

"Voici plusieurs explications globales possibles du mouvement, construites
à partir de corrections découvertes à différents moments."

Avec la stratégie D, le meilleur chemin observé est :

BOTTOM:169
TOP:199
BOTTOM:228
TOP:291
BOTTOM:353
TOP:383
BOTTOM:445
TOP:474
BOTTOM:529
TOP:558
BOTTOM:611

La Ground Truth est :

BOTTOM:169
TOP:199
BOTTOM:262
TOP:291
BOTTOM:353
TOP:383
BOTTOM:445
TOP:474
BOTTOM:529
TOP:558
BOTTOM:611

Une seule position diffère.

Résultat :

10/11 pivots exacts.

---

## 11. TEMPORAL et SHAPE arrivent tard

Dans la stratégie D retenue, TEMPORAL et SHAPE ne servent pas à tuer
prématurément les compositions.

Ils sont utilisés lorsque les chemins possèdent enfin suffisamment de
contexte global.

Les expériences E et F ont essayé de les utiliser plus tôt pour réduire
l'espace de recherche.

Résultat :

les bonnes branches ont été éliminées trop tôt.

Cela confirme le principe fondamental de Delayed Path :

retarder les décisions difficiles tant que le contexte n'est pas suffisant.

---

# Vision conceptuelle finale

Delayed Path possède maintenant trois niveaux de mémoire.

## Mémoire 1 — pivots

`promising + conditional`

"Quels pivots pourraient encore être les bons ?"

## Mémoire 2 — corrections locales

segments

"Quelles petites corrections cohérentes avons-nous déjà réussi à construire ?"

## Mémoire 3 — hypothèses globales

chemins composés par D

"Quelles combinaisons de ces corrections peuvent expliquer l'ensemble du
mouvement ?"

L'activePath sert principalement de support initial et de contexte de
reconstruction.

Il n'est plus considéré comme une vérité qui doit être corrigée
irréversiblement à chaque décision.

---

# Principe fondamental

Delayed Path est désormais un système de recherche multi-hypothèses
différée.

Son principe est :

"Ne pas détruire une hypothèse uniquement parce qu'elle semble moins bonne
avec trop peu de contexte."

Le système conserve les alternatives crédibles, construit progressivement
des corrections locales, mémorise ces corrections, puis les recombine plus
tard lorsqu'une vision globale devient disponible.

C'est cette logique qui a permis de passer d'une stratégie locale très
limitée à une reconstruction déterministe observée à 10/11 sur le dataset
diagnostique.