# Phase Blocks – Velocity 1D, diagnostics et décision gyro

**Date :** 2026-09-11

---

# Objectif

L’objectif de cette session était de préparer une nouvelle méthode de détection basée sur des phases physiques du mouvement :

```text
DOWN
→ BOTTOM TRANSITION
→ UP
→ TOP TRANSITION
→ DOWN
```

L’idée est de construire les futurs Bottom/Top à partir de blocs de mouvement plutôt que de dépendre uniquement de pivots locaux.

Pipeline visé :

```text
IMU
→ accélération linéaire utile
→ vitesse 1D
→ UP / DOWN / TRANSITION
→ blocs
→ Bottom / Top
→ reps + métriques
```

La méthode doit rester :

- simple
- robuste
- physiquement interprétable
- scalable
- réutilisable pour les futures métriques RepMotion

Fonctionnalités visées :

- nombre de répétitions
- phases concentrique / excentrique
- TUT
- vélocité
- sticking point
- ROM
- stabilité

---

# 1. Nouvelle stratégie RAW `phase_blocks`

Une nouvelle stratégie RAW a été préparée sans remplacer le legacy.

Architecture conceptuelle :

```text
Calibration
│
├── RAW legacy
│   ├── direction_change
│   └── local_extrema
│
└── RAW phase_blocks
```

Ajout dans `CalibrationParameters` :

```ts
rawGenerationStrategy?: "legacy" | "phase_blocks";
```

Le legacy reste la valeur par défaut.

Aucune modification de Delayed Context Path.

L’objectif est de pouvoir comparer :

```text
RAW legacy
→ mêmes stratégies de sélection

vs

RAW phase_blocks
→ mêmes stratégies de sélection
```

---

# 2. Première brique : accélération → vitesse

Création :

```text
analytics/raw-generation/phase-blocks/estimateVelocity.ts
```

La fonction utilise une intégration trapézoïdale :

```text
v[t] =
v[t-1]
+
((a[t-1] + a[t]) / 2) * dt
```

avec :

```text
velocity[0] = 0
```

Cette fonction est volontairement indépendante du reste du pipeline.

Elle reçoit :

```text
acceleration[]
dt
```

et retourne :

```text
velocity[]
```

Le vieux `computeVelocityProxy()` de Calibration a également été inspecté.

Il calcule :

```text
values[t] - values[t-1]
```

Il s’agit donc d’une différence entre samples et non d’une intégration de l’accélération.

`computeVelocityProxy()` n’est donc pas une vraie estimation de la vitesse de la barre.

---

# 3. Nature des valeurs IMU actuelles

Le pipeline actuel a été inspecté :

```text
MPU6050
→ firmware
→ BLE
→ mobile
→ datasets
```

Conclusion :

```text
ax / ay / az
```

sont des valeurs RAW `int16` provenant du MPU6050.

Elles ne sont ni en `g` ni en `m/s²`.

Pour une configuration nominale MPU6050 ±2 g :

```text
16384 counts / g
```

La conversion nominale est :

```text
acceleration_g = RAW / 16384

acceleration_mps2 =
RAW × 9.80665 / 16384
```

Important :

La valeur `16384 counts/g` est cohérente avec la configuration nominale ±2 g du MPU6050, mais cette configuration n’est pas enregistrée explicitement dans les anciens datasets.

---

# 4. Fréquence historique

Les datasets historiques 007 / 009 / 010 ne contiennent pas de timestamp par sample.

La capture était configurée autour de :

```text
20 Hz
```

donc :

```text
dt nominal = 0.05 s
```

Ce `dt` reste nominal.

Avec les anciens fichiers, il n’est pas possible de savoir précisément :

- si chaque intervalle faisait exactement 50 ms
- si certains samples ont été perdus
- si une notification BLE est arrivée en retard
- si la cadence a légèrement varié

Décision pour les futures captures :

```text
sampleIndex
+
timestamp
```

devront être enregistrés avec chaque sample.

---

# 5. Préparation physique de l’accélération 1D

Une couche physique modulaire a été créée :

```text
phase-blocks/
├── estimateStaticBaseline.ts
├── estimateMovementAxis.ts
├── projectAcceleration1D.ts
├── prepareLinearAcceleration1D.ts
├── estimateVelocity.ts
└── types.ts
```

Pipeline :

```text
RAW ax/ay/az
→ baseline statique XYZ
→ retrait du baseline
→ accélération dynamique XYZ
→ estimation d’un axe de mouvement
→ projection signée 1D
→ conversion en m/s²
```

Puis séparément :

```text
prepareLinearAcceleration1D()
↓
estimateVelocity()
```

Cette séparation permet de faire évoluer la préparation physique sans modifier l’intégrateur.

---

# 6. Baseline vectorielle

Au lieu de soustraire arbitrairement :

```text
16384 sur Z
```

la méthode calcule une baseline réelle XYZ sur une fenêtre donnée.

Pour les diagnostics historiques :

```text
candidate rest window = [0,100)
```

Baselines observées :

```text
007 : (-277.72, -296.68, 18713.60)

009 : (-386.16, +205.96, 18529.68)

010 : (-376.96, +187.76, 18540.48)
```

009 et 010 sont très proches.

007 présente une baseline différente, particulièrement sur Z.

Il a ensuite été rappelé que :

- 007 a été enregistré environ un mois avant
- 009 et 010 ont été enregistrés beaucoup plus près l’un de l’autre

Cela peut expliquer certaines différences de conditions de capture, sans démontrer une cause précise.

---

# 7. Axe de mouvement 1D

Deux stratégies ont été préparées :

```text
explicit
pca
```

La PCA sert uniquement à déterminer un axe principal fixe du mouvement.

Elle ne reconstruit pas une trajectoire 3D.

Le pipeline reste :

```text
XYZ
→ axe principal
→ projection
→ signal 1D
```

Directions PCA observées :

```text
007 : angle avec Z ≈ 13.60°

009 : angle avec Z ≈ 3.87°

010 : angle avec Z ≈ 4.13°
```

Variance expliquée par l’axe principal :

```text
007 : 73.38 %

009 : 88.73 %

010 : 87.61 %
```

Important :

Cela ne prouve pas que le capteur tourne davantage sur 007.

Cela indique seulement que les variations de 007 sont moins concentrées sur un seul axe principal que celles de 009 et 010.

---

# 8. Accélération 1D obtenue

Après :

```text
baseline
+
projection
+
conversion physique
```

les moyennes obtenues sont :

```text
007 PCA mean ≈ -0.003878 m/s²

009 PCA mean ≈ +0.017181 m/s²

010 PCA mean ≈ -0.067605 m/s²
```

Le signal est donc beaucoup mieux centré qu’avec les valeurs RAW originales.

Cependant, même un très petit offset devient important lorsqu’il est intégré pendant plusieurs dizaines de secondes.

---

# 9. Premier diagnostic velocity

Configuration :

```text
baseline = [0,100)
axis = PCA
countsPerG = 16384
dt = 0.05 s
```

Vitesses finales :

```text
007 ≈ -0.130 m/s

009 ≈ +0.565 m/s

010 ≈ -2.197 m/s
```

Convention testée :

```text
UP   → velocity > 0
DOWN → velocity < 0
```

Résultats bruts :

```text
007

UP   ≈ 67.14 %
DOWN ≈ 51.96 %
```

```text
009

UP   ≈ 93.27 %
DOWN ≈ 61.19 %
```

```text
010

UP   ≈ 9.60 %
DOWN ≈ 100 %
```

Sur 010, la velocity devient progressivement fortement négative et finit par rester négative même pendant les montées.

---

# 10. Drift d’intégration

Une relation très nette a été observée :

```text
drift velocity
≈
meanAcceleration × durée
```

Exemple 010 :

```text
meanAcceleration ≈ -0.0676 m/s²

durée ≈ 32.45 s

-0.0676 × 32.45
≈ -2.19 m/s
```

Velocity finale observée :

```text
≈ -2.197 m/s
```

Conclusion :

```text
petit offset résiduel d’accélération
→ accumulation pendant l’intégration
→ forte dérive de velocity
```

L’intégrateur ne fait donc pas n’importe quoi.

Il intègre correctement un signal contenant encore un petit biais.

---

# 11. Test oracle : suppression du DC global

Une expérience diagnostique offline a été réalisée :

```text
correctedAcceleration[t]
=
acceleration1D[t]
-
mean(acceleration1D)
```

Résultats équilibrés :

```text
007
59.55 % → 62.42 %

009
77.23 % → 84.36 %

010
54.80 % → 74.37 %
```

Amélioration particulièrement importante sur 010 :

```text
UP
9.60 % → 88.00 %
```

Cependant, la correction ne généralise pas parfaitement.

Certaines phases s’améliorent et d’autres se détériorent.

Conclusion :

```text
un biais constant explique une partie importante du problème

mais

un biais constant n’explique pas tout
```

Cette correction globale n’est pas une solution production.

Elle utilise toute la capture et impose indirectement un retour de velocity près de zéro en fin de set.

---

# 12. Comparaison de corrections simples

Trois approches ont été comparées :

```text
A. intégration actuelle

B. estimation de biais lente par EMA

C. contraintes oracle zero-velocity aux vrais pivots GT
```

## B — EMA

Trois constantes de temps ont été comparées.

Meilleure variante globale :

```text
EMA 10 s
```

Scores équilibrés :

```text
007 : 62.75 %

009 : 76.24 %

010 : 62.52 %
```

Conclusion :

```text
EMA lente seule = insuffisante
```

Elle améliore certains cas mais ne règle pas le problème général.

---

# 13. Oracle zero-velocity

Une expérience plus forte a ensuite été réalisée.

Aux vrais Bottom/Top GT :

```text
velocity = 0
```

La velocity entre deux pivots est ensuite corrigée sous cette contrainte.

Résultats :

```text
007 : 48.42 %

009 : 87.49 %

010 : 89.72 %
```

Résultats détaillés :

```text
009

UP   = 93.27 %
DOWN = 81.72 %
```

```text
010

UP   = 87.20 %
DOWN = 92.24 %
```

009 et 010 deviennent donc très cohérents lorsque les vrais changements de direction sont connus.

007 reste complètement différent.

---

# 14. Investigation spécifique de 007

Pour comprendre 007, plusieurs variantes ont été testées :

```text
PCA
PCA inversée
Z explicite
Z inversée
```

Résultats :

```text
PCA
48.42 %

PCA inversée
51.58 %

Z
48.06 %

Z inversée
51.94 %
```

Conclusion :

L’échec de 007 n’est pas expliqué par :

```text
- une simple inversion de polarité
- PCA vs Z
- uniquement une dérive longue durée
```

Observation critique :

Avec PCA et oracle zero-velocity :

```text
les 5 phases UP sont majoritairement négatives

ET

les 5 phases DOWN sont également majoritairement négatives
```

Proportions négatives :

```text
UP :
≈ 82.76 % à 93.10 %

DOWN :
≈ 75.81 % à 98.04 %
```

Les dix aires signées sont également négatives.

Donc :

```text
UP et DOWN
ne deviennent pas deux familles opposées
dans la velocity reconstruite de 007
```

Même avec les vrais pivots connus.

---

# 15. Conclusion sur 007

Le problème n’est donc plus seulement :

```text
velocity qui dérive
```

Pour 007 :

```text
acceleration1D actuelle
→ intégration
→ ne représente pas correctement les deux sens physiques opposés
```

La cause exacte reste inconnue.

Hypothèses encore possibles :

```text
- différence d’orientation
- projection de gravité différente
- orientation variable
- différences entre séances de capture
- limites de l’accel-only
- biais variable
- timing historique imprécis
```

Cependant, aucune de ces causes n’a été démontrée avec certitude.

---

# 16. Ce que cela signifie pour la méthode des blocs

Les résultats ne réfutent PAS le concept des blocs.

Le modèle physique reste très pertinent :

```text
DOWN
→ BOTTOM TRANSITION
→ UP
→ TOP TRANSITION
→ DOWN
```

Le principal défi identifié est maintenant :

```text
IMU RAW
→ produire une représentation fiable du mouvement physique
```

Si cette information est propre :

```text
velocity / mouvement fiable
→ blocs simples
```

L’objectif est précisément d’éviter :

```text
mauvais signal
→ heuristiques
→ scores
→ réparations
→ budgets
→ complexité
```

afin de ne pas recréer un système comparable à Delayed Context Path.

---

# 17. Velocity comme colonne vertébrale

La velocity 1D reste considérée comme la meilleure information centrale pour caractériser le sens physique du mouvement.

Idéalement :

```text
velocity > 0
→ UP

velocity < 0
→ DOWN

velocity proche de 0
→ TRANSITION
```

Mais les futurs blocs ne devront probablement pas dépendre exclusivement d’un unique nombre.

Une architecture possible :

```text
velocity1D
+
acceleration1D
+
gyro / orientation
+
jerk
+
continuité temporelle
↓
Motion State Estimator
↓
UP / DOWN / TRANSITION
↓
blocs
```

Le nombre de caractéristiques doit rester limité.

Le but n’est pas d’ajouter beaucoup de règles.

---

# 18. Confidence par bloc

Les futurs blocs pourront porter un niveau de confiance.

Exemple :

```ts
{
  type: "UP",
  startIndex: 120,
  endIndex: 148,
  confidence: 0.93
}
```

L’objectif n’est pas que chaque sample soit correct à 100 %.

Un bloc peut rester très fiable même si quelques samples autour des transitions sont ambigus.

La cohérence globale devient importante :

```text
DOWN
0.94

BOTTOM TRANSITION
0.70

UP
0.95
```

Puis la séquence complète peut renforcer la confiance de la répétition.

---

# 19. ML comme plan futur possible

Si les signaux physiques simples ne suffisent pas complètement, un petit modèle temporel pourra éventuellement servir de Motion State Estimator.

Exemple :

```text
fenêtre IMU
[ax ay az gx gy gz]
↓
modèle temporel léger
↓
P(UP)
P(DOWN)
P(TRANSITION)
```

Puis :

```text
probabilités
→ blocs continus
→ reps + métriques
```

Le ML n’est toutefois pas la prochaine étape.

La priorité reste d’améliorer la mesure physique disponible.

---

# 20. Décision gyroscope

Les datasets historiques ne contiennent pas de vraies données gyroscope exploitables.

Les valeurs gyro actuellement présentes sont nulles / artificielles.

Il est donc impossible de reconstruire après coup :

```text
orientation réelle de 007
orientation réelle de 009
orientation réelle de 010
```

Décision :

Les prochaines captures doivent enregistrer :

```text
ax
ay
az

gx
gy
gz

sampleIndex

timestamp
```

Le gyro doit permettre d’estimer :

```text
orientation(t)
```

et donc potentiellement :

```text
accel mesurée
+
orientation
↓
repère fixe
↓
retrait dynamique de la gravité
↓
accélération linéaire
↓
velocity plus robuste
```

---

# 21. BLE et payload

Le BLE n’est pas considéré comme un obstacle structurel.

Les six axes en `int16` représentent :

```text
6 × 2 bytes
=
12 bytes
```

Un payload binaire compact pourrait donc contenir :

```text
ax ay az
gx gy gz
sampleIndex
timestamp
```

sans nécessiter un payload énorme.

Il faudra toutefois inspecter précisément :

```text
- format BLE actuel
- MTU actuel
- fréquence de notification
- capacité mobile
```

avant de modifier la configuration.

Le format texte CSV actuel peut devenir plus problématique qu’un format binaire compact.

---

# 22. Fréquence d’échantillonnage

Historique :

```text
20 Hz
=
50 ms / sample
```

20 Hz reste exploitable pour :

```text
- rep count
- phases générales
- TUT
```

mais devient limité pour :

```text
- transitions rapides
- Bottom / Top précis
- peak velocity
- sticking point
- ROM
- fusion accel + gyro
```

Prochaine cible :

```text
50 Hz
```

soit :

```text
20 ms / sample
```

100 Hz pourra également être testé si :

```text
firmware
+
BLE
+
mobile
```

restent stables.

Décision :

```text
50 Hz = objectif raisonnable

100 Hz = test supplémentaire si la chaîne le supporte
```

---

# 23. Prochaine séance de développement

La prochaine séance ne doit PAS encore construire les blocs.

Objectif :

# Capture IMU V2

Étapes prévues :

```text
1. Cartographier le pipeline actuel

MPU6050
→ firmware
→ BLE
→ mobile
→ store
→ dataset JSON
```

Puis :

```text
2. Activer la lecture réelle de :

gx
gy
gz
```

Puis :

```text
3. Définir un payload propre :

ax ay az
gx gy gz
sampleIndex
timestamp
```

Puis :

```text
4. Vérifier BLE / MTU / débit
```

Puis :

```text
5. Ajouter parser + stockage mobile
```

Puis :

```text
6. Tester 50 Hz
```

Puis éventuellement :

```text
7. Tester 100 Hz
```

Puis :

```text
8. Faire une capture test :

repos
→ mouvement
→ repos
```

et vérifier :

```text
- accel valides
- gyro valides
- timestamps cohérents
- sampleIndex cohérent
- fréquence réelle
- absence de pertes importantes
```

---

# 24. Séance suivante : 5 nouvelles Ground Truth

Une fois la Capture IMU V2 validée :

```text
5 nouvelles séries
```

doivent être enregistrées avec :

```text
vidéo
+
ax ay az
+
gx gy gz
+
sampleIndex
+
timestamp
```

Conditions aussi constantes que possible :

```text
- même exercice
- même Smith
- même position du module
- même firmware
- même fréquence
- même payload
```

Mais avec suffisamment de variation naturelle pour vérifier la généralisation.

Chaque dataset devra être contrôlé immédiatement après la capture afin de vérifier que les données gyro et timing ont réellement été enregistrées.

---

# 25. Après les 5 nouvelles GT

Seulement après ces nouvelles données :

```text
accel + gyro
↓
orientation(t)
↓
gravity removal
↓
acceleration1D
↓
velocity1D
↓
comparaison GT
```

Le but sera de déterminer si l’ajout du gyro et d’un timing fiable améliore réellement la généralisation.

Si oui :

```text
velocity fiable
↓
UP / DOWN / TRANSITION
↓
blocs
↓
confidence
↓
reps + métriques
```

---

# Décision finale

Ne pas continuer à complexifier les corrections sur 007 / 009 / 010.

Ne pas ajouter de nouvelles heuristiques de drift.

Ne pas construire immédiatement les blocs sur une information physique encore incertaine.

Priorité :

```text
améliorer la mesure
avant
d’améliorer la logique
```

Roadmap retenue :

```text
SÉANCE 1
Capture IMU V2

accel
+
gyro
+
sampleIndex
+
timestamp
+
50 Hz / test 100 Hz
```

```text
SÉANCE 2
5 nouvelles Ground Truth complètes
```

```text
SÉANCE 3
orientation
→ gravity removal
→ acceleration1D
→ velocity1D
→ benchmark GT
```

```text
SÉANCE 4
UP / DOWN / TRANSITION
→ blocs
→ confidence
```

---

# État actuel

La méthode velocity 1D n’est PAS rejetée.

Les résultats oracle montrent :

```text
009 ≈ 87.49 %

010 ≈ 89.72 %
```

Ces résultats démontrent que la velocity reconstruite peut contenir une information directionnelle très forte.

Cependant :

```text
007 ≈ 48–52 %
```

même avec les vrais pivots, la polarité inversée et différentes projections.

007 démontre donc que la préparation `accel-only` actuelle ne généralise pas encore suffisamment entre différentes séances de capture.

La prochaine étape doit améliorer l’information IMU disponible plutôt que complexifier l’algorithme.