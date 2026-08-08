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

## Correction en cours de route
Premier patch de Codex modifiait par erreur la constante globale
RAW_DETECTION_STRATEGY ("direction_change" → "local_extrema"), ce qui
aurait fait repasser toute l'app mobile de V2.5 à V2, pas seulement le
diagnostic ciblé. Corrigé : rawDetectionStrategy est maintenant un
paramètre optionnel de CalibrationParameters (fallback vers la constante
globale inchangée). Le runner de diagnostic passe "local_extrema"
localement, sans toucher au comportement par défaut de l'app.

## Résultat du diagnostic — rowing_5reps_005.json

Résumé :
| Étape | Candidats |
|---|---|
| RAW | 55 |
| Après MIN_DISTANCE | 13 |
| Après PROMINENCE | 13 |
| Après DIRECTION_CHANGE | 13 |

PROMINENCE et DIRECTION_CHANGE n'éliminent aucun candidat supplémentaire
sur ce dataset : tout le filtrage est fait par MIN_DISTANCE.

Décisions de MIN_DISTANCE inspectées candidat par candidat : dans tous
les conflits observés, le filtre garde bien l'extremum le plus marqué
de sa fenêtre (le plus bas pour un bottom, le plus haut pour un top).
Aucune décision incohérente ou arbitraire identifiée.

Malgré ça, le résultat final reste faux : 7 bottoms / 6 tops sélectionnés
au lieu des 6/5 attendus.

## Découverte clé : rupture d'alternance
En ordonnant chronologiquement les 13 survivants, la séquence de types
n'alterne pas parfaitement (B,T,B,T...). Quatre ruptures identifiées :
deux types identiques consécutifs sans passage par l'autre type entre eux,
à 4 endroits dans le signal. Chaque rupture correspond probablement à un
"vrai" extremum local (donc jamais rejeté par MIN_DISTANCE, car espacé de
plus de minimumDistanceSamples) qui n'est pourtant pas un vrai nouveau
pivot de répétition — probablement un double rebond ou une vibration
(dépôt de la barre, hésitation en haut du mouvement).

## Nouvelle hypothèse (changement de paradigme)
Le problème n'est plus "MIN_DISTANCE choisit-il le bon candidat dans une
fenêtre ?" (réponse : oui, il le fait bien). Le problème devient :
"qu'est-ce qui définit un vrai pivot biomécanique, au-delà d'être un bon
extremum local ?"

Hypothèse formulée : un pivot valide n'est peut-être pas seulement un
extremum, mais l'extrémité d'un mouvement complet — c'est-à-dire précédé
et suivi d'un déplacement suffisamment ample dans le sens opposé, pas
juste d'un petit aller-retour local (rebond).

## Prochaine étape (non commencée)
Avant d'implémenter un nouveau critère, valider l'hypothèse sur les
données déjà obtenues aujourd'hui : pour les 4 ruptures d'alternance
identifiées, calculer l'amplitude du mouvement entre les deux candidats
consécutifs de même type, et la comparer à l'amplitude d'un vrai cycle
complet (ex: entre 133 et 154). Si l'amplitude intermédiaire est nettement
plus faible, ça confirme l'hypothèse sans avoir à coder de nouveau filtre.

## Commit
Instrumentation diagnostique des filtres poussée ce soir. Message court,
détails conservés dans ce journal. Note : le debug logging détaillé des
filtres est maintenant actif même hors diagnostic ciblé — à conditionner
(ex: enableDetailedFilterDebug) avant tout merge vers main.