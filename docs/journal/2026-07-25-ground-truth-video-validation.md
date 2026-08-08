# Calibration V2.5 — Benchmark complet global_alternating_path et validation Ground Truth vidéo

## Contexte
Suite à la séance du 23 juillet (implémentation de global_alternating_path,
succès sur les 2 datasets sentinelles), deux lacunes ont été identifiées et
traitées aujourd'hui : le manque de test sur l'ensemble des 10 datasets, et
l'absence de toute vérité terrain indépendante pour juger si les événements
choisis sont les vrais pivots biomécaniques (pas seulement si le compte est
bon).

## Partie 1 — Benchmark complet sur les 10 datasets

Résultat :

| Stratégie | totalRepDifference | datasetsExactRepCount | avgSimulatedReps |
|---|---|---|---|
| current_filters | 19 | 1/10 | 3.1 |
| global_alternating_path | 0 | 10/10 | 5.0 |

Détails complémentaires global_alternating_path :
- globalPathFoundCount = 10 (une chaîne valide trouvée à chaque fois)
- avgGlobalFinalStatesCount = 13.9 (en moyenne ~14 chaînes valides possibles
  par dataset, avant sélection par le score)
- avgEligibleCandidatesCount = 54.6 (à clarifier — plus élevé que les 11-13
  candidats vus lors des tests sentinelles ; vérifier que tous les runners
  utilisent la même définition de "candidat admissible")

### Nuance importante
Ce résultat prouve que global_alternating_path peut TOUJOURS construire une
chaîne valide de la bonne longueur quand expectedReps est connu. Ce n'est
pas une preuve indépendante de justesse : le DP est conçu pour trouver une
telle chaîne, donc y parvenir démontre seulement que l'implémentation
fonctionne comme prévu, pas que les événements choisis sont les bons.

### Comparaison des événements choisis (premier test, avant la validation
vidéo)
Sur les premiers datasets comparés : 8 événements communs entre current et
global, 5 événements uniquement dans current, 3 événements uniquement dans
global. Global n'invente pas une séquence totalement différente — il ajuste
un sous-ensemble ciblé de choix.

## Partie 2 — Validation contre vérité terrain vidéo (rowing_5reps_007)

### Protocole de synchronisation vidéo-IMU
Décision : ne pas refilmer la vidéo existante pour éviter tout biais de
confirmation inconscient (adapter le mouvement à ce que l'algorithme
attend). rowing_5reps_007 est conservé comme référence, imperfections
comprises. Le protocole d'acquisition sera amélioré uniquement pour les
prochaines vidéos (rebond de synchronisation net + pause avant la série).

### Calcul du point de synchronisation
Mesures vidéo :
- SYNC TOP (rebond visible) : 14,47 s
- BOTTOM 1 : 15,07 s
- Écart : 0,60 s → 12 samples à 20 Hz

Point de synchronisation dérivé : 169 (index du premier Bottom Global) - 12
= sample 157, confirmé par un maximum local réel présent exactement à cet
index dans les données.

Validation croisée : l'offset vidéo-IMU calculé via le sample 157 (14,47 -
7,85 = 6,62 s) est identique à celui calculé via Bottom 1 (15,07 - 8,45 =
6,62 s). Les deux méthodes indépendantes convergent — la synchronisation
globale vidéo/IMU est confirmée correcte. Toute erreur trouvée ensuite ne
peut pas être attribuée à un décalage de synchronisation.

Annotation enregistrée :
```json
"sync": {
  "type": "VIDEO_IMU_MANUAL_ANCHOR",
  "videoTimeSeconds": 14.47,
  "imuSampleIndex": 157,
  "selectionReason": "Le SYNC TOP précède Bottom 1 de 0,60 s dans la vidéo, soit exactement 12 samples à 20 Hz; 169 - 12 = 157."
}
```

## Partie 3 — Comparaison des 11 chaînes terminales du DP à la Ground Truth

Le DP a produit 11 chaînes terminales valides pour rowing_5reps_007.
Chacune comparée à la Ground Truth vidéo (erreur totale en samples).

- Meilleure chaîne possible (parmi les 11) : erreur totale = 283 samples
- Chaîne réellement choisie par le score actuel : erreur totale = 328
  samples

### Découverte critique
Les 11 chaînes sont presque identiques entre elles : les 10 premiers
événements sont strictement identiques dans toutes les chaînes
(B169, T195, B228, T291, B299, T333, B391, T467, B500, T509). Seul le
dernier événement diffère (B609 vs B564).

Aucune des 11 chaînes ne contient les vrais pivots visibles dans la vidéo
(attendus : B169, T199, B262, T291, B353, T383...). Le DP n'a jamais eu
accès à une chaîne ressemblant réellement à la Ground Truth.

### Conclusion de la séance
Améliorer uniquement le score du DP ne réglerait qu'une petite partie du
problème (328 → 283 samples, soit 45 samples de gain). L'essentiel de
l'erreur est déjà présent avant la sélection finale — les bons candidats
(B262, B353...) ne sont disponibles dans aucune des chaînes explorées par
le DP.

## Trois hypothèses pour expliquer la disparition des vrais pivots

Pour un événement Ground Truth donné (ex. B262), trois causes possibles,
non encore départagées :

- **A — Détection RAW** : le candidat n'a jamais été détecté dans RAW.
- **B — Filtrage qualité** : le candidat existe dans RAW mais est éliminé
  par PROMINENCE ou DIRECTION_CHANGE avant d'atteindre le DP.
- **C — Incompatibilité de transition** : le candidat existe et survit
  jusqu'aux candidats admissibles du DP, mais aucune transition valide
  (respectant les contraintes de durée concentrique/excentrique/totale) ne
  permet de l'inclure dans une chaîne complète — il est structurellement
  invisible au DP malgré sa présence.

La possibilité C n'avait pas été envisagée initialement et est jugée aussi
plausible que A et B, vu tout le travail déjà fait sur les contraintes de
durée et de transition du DP.

## Prochaine étape — runner de traçabilité par événement

Objectif : pour chaque événement Ground Truth (B262, B353, T383...),
déterminer précisément et sans supposition à quelle étape il disparaît :

1. Existe-t-il dans RAW ? Oui/Non
2. Existe-t-il après PROMINENCE ? Oui/Non
3. Existe-t-il après DIRECTION_CHANGE ? Oui/Non
4. Existe-t-il parmi les candidats admissibles du DP ? Oui/Non
5. Appartient-il à au moins une des chaînes terminales du DP ? Oui/Non
   — et si non, existe-t-il au moins une transition structurellement
   valide vers/depuis lui (respectant les contraintes de durée), même si
   elle n'a pas été retenue dans les 11 chaînes trouvées ?

Cette dernière vérification (ajoutée suite à la découverte de la
possibilité C) permet de distinguer "transition structurellement
impossible" de "transition possible mais jamais choisie par le score" —
deux causes qui appelleraient des corrections très différentes.

Pas de modification d'algorithme prévue avant ce résultat. L'objectif est
de localiser avec certitude l'étape exacte de disparition avant de décider
quoi corriger (génération RAW, filtres PROMINENCE/DIRECTION_CHANGE, ou
structure de transitions du DP).
