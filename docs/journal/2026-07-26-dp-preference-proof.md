# Calibration V2.5 — Preuve que le DP préfère une mauvaise chaîne même avec les vrais candidats disponibles

## Contexte
Suite à la séance précédente (25-26 juillet), deux problèmes distincts
avaient été identifiés sur rowing_5reps_007 : des écarts RAW de 3 à 7
samples sur plusieurs événements, et une divergence marquée entre le
meilleur candidat RAW disponible et la chaîne finalement choisie par
global_alternating_path (écarts de 26 à 53 samples pour B2, B3, B4, B5,
B6). Objectif de la séance : déterminer si la cause principale est la
génération RAW ou le mécanisme de sélection du DP.

## Partie 1 — Première expérience d'isolation (invalidée en cours de
séance)

### Protocole initial
Remplacer entièrement les candidats RAW par les 11 indices Ground Truth
(169, 199, 262, 291, 353, 383, 445, 474, 529, 558, 611) et observer si le
DP reconstruit la bonne chaîne.

### Résultat
MATCH_EXACT sur les 11 événements. Score final -11348, un seul état
terminal créé.

### Pourquoi ce résultat ne répond pas à la vraie question
Repéré en cours de séance : ce test ne présente au DP AUCUNE alternative
aux vrais candidats — il n'y avait qu'une seule chaîne possible à
construire. Le test prouve seulement que le DP sait assembler une chaîne
quand il n'y a aucune ambiguïté, ce qui ne dit rien sur son comportement
face à un choix réel entre bons et mauvais candidats.

## Partie 2 — Expérience corrigée : injection sans suppression

### Protocole
Garder tous les candidats RAW réels (46 candidats au total : 22 bottoms,
24 tops), et AJOUTER les 11 candidats Ground Truth par-dessus (sans
doublon — B169 et T291 existaient déjà). Les candidats injectés passent
par les mêmes étapes que les autres (PROMINENCE, DIRECTION_CHANGE) avant
d'atteindre le DP. Total après ajout : 55 candidats (27 bottoms, 28 tops).

### Résultat — la preuve la plus forte de toute l'investigation
Chaîne gagnante : B169 → T195 → B228 → T291 → B299 → T333 → B391 → T467 →
B500 → T509 → B564.

Sur les 11 candidats Ground Truth disponibles dans le pool, seuls 2 ont
été retenus (B169, T291 — qui étaient déjà les bons candidats avant même
l'injection). Les 9 autres (T199, B262, B353, T383, B445, T474, B529,
T558, B611) ont été purement et simplement ignorés au profit de candidats
moins proches de la vérité, malgré leur disponibilité et leur validité
dans le graphe DP (57 → 1207 états créés, 14 états terminaux avec le pool
enrichi).

### Conclusion
Le problème n'est ni un manque de disponibilité des bons candidats (RAW),
ni une incapacité structurelle à les inclure dans une chaîne (DP) — c'est
un problème de PRÉFÉRENCE : le score/mécanisme de sélection du DP choisit
activement une autre chaîne alors que la bonne est présente et valide.

## Partie 3 — Nuance sur le statut du RAW

### Question posée
Les écarts RAW de 3 à 6 samples (T1, T3, B4, T5 à 3-4 samples ; B3, T4 à
6-7 samples) peuvent-ils être expliqués par l'imprécision de l'annotation
vidéo manuelle (faite au doigt sur iPhone) plutôt que par un vrai défaut
de détection ?

### Réponse retenue
Partielle, pas définitive. Les écarts de 3-4 samples (~150-200ms) sont
plausiblement de l'imprécision humaine. Les écarts de 6-7 samples (B3,
T4, ~300-350ms) restent un peu au-dessus de cette marge et ne peuvent pas
être complètement écartés sans vérification supplémentaire.

### Statut formulé
- **RAW** : "innocent jusqu'à preuve du contraire" — pas acquitté, mais
  l'investigation actuelle ne fournit plus de preuve suffisamment forte
  pour en faire la cause principale.
- **DP** : responsabilité directement démontrée par l'expérience
  d'injection (Partie 2) — preuve la plus solide de toute l'investigation
  à ce jour, indépendante de toute incertitude d'annotation.

### Piste de vérification supplémentaire proposée (non exécutée)
Comparer la largeur des fenêtres de transition annotées (25 juillet) à
l'ampleur de l'écart RAW pour chaque événement. Si B3/T4 ont aussi les
fenêtres les plus larges/ambiguës de l'annotation elle-même, ça soutient
l'hypothèse d'imprécision humaine. Si leurs fenêtres sont étroites et
nettes malgré un écart RAW important, ça pointerait vers un vrai défaut
de détection à ces moments précis. Test à faire avec les données déjà
collectées, sans nouvel annotateur.

## Partie 4 — Décision sur l'outillage d'annotation

Constat : l'annotation actuelle se fait au doigt sur iPhone, précision
difficile à contrôler. Décision : basculer sur un lecteur vidéo
frame-by-frame sur PC (VLC ou MPV) pour les prochaines annotations —
précision exacte de 16,67ms par frame à 60 FPS, contre une précision
incertaine à l'estimation tactile actuelle. Noter les numéros de frame
plutôt que des secondes approximées, conversion frame/60 = temps exact.

Options plus lourdes envisagées mais reportées :
- Outil d'annotation dédié RepMotion (frame-by-frame + boutons Bottom/Top
  + export JSON automatique) — rentable seulement si plusieurs autres
  vidéos sont prévues à court terme.
- Tracking automatique de la barre par IA (extraction de position, pas de
  décision) — idée à fort potentiel à long terme, mais nécessiterait sa
  propre validation de précision avant d'être utilisée comme référence.

## Prochaine étape
Investiguer pourquoi le mécanisme de sélection du DP (score et/ou
dominance des états) préfère systématiquement des candidats plus extrêmes
mais plus éloignés de la vérité, plutôt que les vrais candidats
disponibles. Exemple concret à tracer en premier : pourquoi l'état
contenant B228 domine-t-il celui contenant B262 dans le graphe DP,
malgré la disponibilité de ce dernier.

Aucune modification de calibration.ts, cycleAnalyzer.ts, ni du DP durant
cette séance. Tout le travail est resté dans l'instrumentation et
l'expérimentation en lecture seule.






### Pipeline AVANT (current / MIN_DISTANCE)
```
Signal IMU
    ↓
Détection RAW
    ↓
Bottoms et Tops candidats
    ↓
MIN_DISTANCE
    ↓
PROMINENCE
    ↓
DIRECTION_CHANGE
    ↓
Liste finale de Bottoms/Tops
    ↓
Cycle Analyzer
    ↓
Nombre de répétitions
```

Problème structurel de MIN_DISTANCE : décision locale, sans vue sur la
chaîne complète.
```
B précédent
    ↓
T réel
    ↓
B réel

mais MIN_DISTANCE regarde surtout :

B précédent ↔ B réel

et peut supprimer B réel
```
C'est le mécanisme exact à l'origine des ruptures d'alternance observées
depuis plusieurs séances (rowing_5reps_005 notamment).

### Pipeline APRÈS (global_alternating_path / DP)
```
Signal IMU
    ↓
Détection RAW
    ↓
PROMINENCE
    ↓
DIRECTION_CHANGE
    ↓
Candidats admissibles
    ↓
GLOBAL ALTERNATING PATH — DP
    ↓
Chaîne complète B-T-B-T-B-T-B-T-B-T-B
    ↓
Cycle Analyzer
    ↓
5 répétitions
```