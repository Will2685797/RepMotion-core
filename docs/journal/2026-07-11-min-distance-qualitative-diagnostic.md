# Calibration V2.5 — Diagnostic qualitatif de MIN_DISTANCE

## Contexte
Suite au benchmark du 2026-07-09, nous avons établi que faire varier la
génération RAW (smoothing, direction_change vs local_extrema) ne change
presque jamais selectedBottoms/selectedTops ni le score final, tant que
minimumDistanceSamples et minimumProminenceRatio restent fixes.

## Ce qui est confirmé quantitativement (déjà démontré 3 fois)
- MIN_DISTANCE rejette environ 95% des candidats RAW.
- PROMINENCE et DIRECTION_CHANGE ont un impact marginal.
- Le score ne bouge presque pas entre les configurations de smoothing
  testées (score = 9 constant), alors que avgRawBottoms/avgRawTops varient.
- Le score bouge fortement (9 → 28) uniquement quand minimumDistanceSamples
  et minimumProminenceRatio changent significativement.

## Ce qui restait à vérifier (jusqu'à aujourd'hui)
Ces mesures étaient uniquement quantitatives (combien de candidats sont
rejetés). Elles ne disaient rien sur la qualité des décisions : est-ce
que MIN_DISTANCE conserve les bons pivots biomécaniques, ou choisit-il
arbitrairement parmi du bruit ?

## Règle exacte de MIN_DISTANCE (confirmée dans le code aujourd'hui)
Le filtre traite séparément les Bottoms et les Tops, dans l'ordre fourni.
Quand deux candidats du même type sont à moins de minimumDistanceSamples
l'un de l'autre :
- pour un Bottom : garde la valeur la plus basse
- pour un Top : garde la valeur la plus haute
Le nouveau candidat remplace le précédent seulement s'il est plus extrême ;
sinon il est rejeté.

Cette règle n'est pas arbitraire en soi (elle privilégie l'amplitude), mais
elle peut favoriser un pic de bruit local si celui-ci est légèrement plus
extrême que le vrai pivot biomécanique dans la même fenêtre de conflit.
C'est l'hypothèse à vérifier avec l'instrumentation.

## Instrumentation ajoutée (en cours)
Codex a ajouté des debugEvents dans les trois filtres
(MIN_DISTANCE, PROMINENCE, DIRECTION_CHANGE), sans modifier :
- les conditions existantes
- l'ordre de traitement
- les valeurs retournées par calculateCalibration()

Objectif : produire, pour rowing_5reps_005.json (RAW_DETECTION_STRATEGY =
"local_extrema"), un tableau chronologique par candidat RAW avec :
- index, type, valeur
- statut après chaque filtre (KEPT / REJECTED / NOT_REACHED)
- pour les rejets MIN_DISTANCE : l'index du candidat concurrent, la
  distance en samples, les deux valeurs, et lequel a gagné

## Prochaine étape
Analyser le tableau produit dès qu'il est disponible, pour déterminer si
les candidats conservés par MIN_DISTANCE correspondent visuellement aux
vrais pivots du mouvement, ou si du bruit local gagne parfois contre le
vrai pivot à cause de la règle "plus extrême gagne".

## Limite connue
Aucune vérité-terrain annotée (timestamps exacts des vrais bottoms/tops)
n'existe dans les datasets actuels. Le diagnostic sera donc visuel/inférentiel
sur le signal brut, pas une preuve formelle.