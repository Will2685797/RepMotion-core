# RepMotion — Journal de recherche V2.2.1 (Calibration Robustness)

**Date :** 27 juin 2026

---

# Objectif de la séance

L'objectif de cette séance était de rendre la calibration plus robuste afin qu'elle fonctionne aussi bien sur le **Rowing** que sur le **Overhead Press (OHP)**, sans dégrader la précision du Rep Detector.

Cette séance avait également pour objectif de mieux comprendre les limites de l'algorithme actuel afin de guider les prochaines évolutions.

---

# État de départ

La version de départ était déjà relativement stable.

Fonctionnalités déjà en place :

- ✅ Détection dynamique de l'axe dominant
- ✅ Utilisation des percentiles (`p25` / `p75`)
- ✅ Détection des extrema via `detectBottomsAndTops()`
- ✅ Diagnostics détaillés (distribution, saturation, axes)

La validation d'une calibration reposait sur les conditions suivantes :

```ts
hasEnoughBottoms &&
hasEnoughTops &&
range >= 5000
```

## Résultats observés

### Rowing

- Calibration valide.
- Rep Detector généralement entre **4 et 5 répétitions sur 5**.

### Overhead Press

- Calibration presque toujours refusée.
- Valeur du `range` généralement comprise entre **4700 et 4900**.

La condition suivante échouait donc régulièrement :

```ts
hasValidRange = false
```

---

# Hypothèse 1 — Machine à états V2

## Objectif

Réduire les nombreux minima et maxima locaux détectés afin d'obtenir environ cinq cycles correspondant aux cinq répétitions de calibration.

## Principe

```text
WAITING_BOTTOM
        ↓
IN_BOTTOM
        ↓
WAITING_TOP
        ↓
IN_TOP
```

## Résultat

❌ Échec.

### Pourquoi ?

Le signal IMU entre et sort constamment des zones définies.

Exemple simplifié :

```text
bottom
↓
sort
↓
rentre
↓
sort
↓
rentre
```

La machine à états créait encore énormément de faux cycles.

Résultat observé :

- environ **30 à 45 cycles**
- alors que seulement **5 répétitions** avaient été réalisées.

## Décision

➡ Machine à états complètement retirée.

---

# Hypothèse 2 — Détection V3 par changement de direction

Une nouvelle approche proposée par Codex consistait à détecter les changements de direction du signal.

## Principe

```text
Signal brut
        ↓
Lissage
        ↓
Détection de direction
        ↓
Détection des extrema
        ↓
Filtrage par amplitude
        ↓
Alternance Bottom / Top
```

## Objectif

Détecter directement les véritables inversions de mouvement plutôt que de dépendre uniquement des zones percentile.

## Résultat

❌ Aucun gain significatif.

### Rowing

Toujours :

- 4 / 5
- ou 5 / 5

### OHP

Toujours incapable de résoudre correctement le problème de calibration.

## Décision

➡ V3 complètement retirée.

---

# Hypothèse 3 — Le problème provient du Rep Detector

Afin de vérifier cette hypothèse, des logs détaillés ont été ajoutés.

Logs instrumentés :

```text
BOTTOM_CONFIRMED

TOP_CONFIRMED_REP_COUNTED
```

## Objectif

Comprendre précisément à quel moment les répétitions étaient comptées.

## Découverte

Le Rep Detector fonctionne conformément à sa logique actuelle.

Une répétition est comptée uniquement lorsque le cycle suivant est confirmé :

```text
BOTTOM
    ↓
TOP
    ↓
rep++
```

Aucun bug majeur n'a été découvert.

Les logs temporaires ont ensuite été retirés.

---

# Hypothèse 4 — Le problème est le `MIN_VALID_RANGE`

Il s'agit de la découverte la plus importante de la journée.

La calibration utilisait auparavant :

```ts
const MIN_VALID_RANGE = 5000;
```

## Problème

Tous les exercices devaient dépasser exactement le même seuil.

Exemple :

### Rowing

```text
range ≈ 6200
```

→ Calibration valide.

### Overhead Press

```text
range ≈ 4800
```

→ Calibration rejetée.

Pourtant le mouvement était parfaitement valide.

Cette approche reposait donc sur une hypothèse erronée :

> Tous les exercices produisent naturellement une amplitude similaire.

Ce n'est pas le cas.

---

## Remarque importante

Une question fondamentale a été soulevée pendant cette séance :

> **Pourquoi l'axe est-il choisi dynamiquement, mais pas le range ?**

Cette réflexion a permis d'identifier que le problème était architectural et non simplement lié aux constantes.

---

# Solution retenue

Le seuil fixe :

```ts
MIN_VALID_RANGE
```

a été supprimé.

Il a été remplacé par une validation dynamique basée sur le signal réellement capturé.

```ts
robustRange = p90 - p10

dynamicMinRange =
max(
    1500,
    robustRange * 0.25
)

hasValidRange =
range >= dynamicMinRange
```

---

## Résultat

### Rowing

✅ Calibration valide.

### Overhead Press

✅ Calibration valide.

Il s'agit du principal gain de cette séance.

---

# Hypothèse 5 — Validation par nombre minimal de samples

Une proposition consistait à imposer un nombre minimal de samples avant d'autoriser la calibration.

Exemple :

```text
Minimum 300 samples
```

## Problème identifié

Il suffit d'attendre plusieurs secondes tout en effectuant de petits mouvements.

La calibration deviendrait alors valide sans que cinq véritables répétitions aient été réalisées.

Les samples ne représentent donc pas les répétitions.

## Décision

❌ Hypothèse rejetée.

---

# Hypothèse 6 — Validation par cycles

Objectif :

Empêcher qu'un petit mouvement permette une calibration valide.

Une nouvelle structure a été ajoutée :

- `CalibrationExtreme`
- `CalibrationPeakResult`
- `countCalibrationCycles()`

Principe :

```text
Bottom
    ↓
Top
    ↓
Cycle
```

## Résultat

Le petit mouvement ne validait effectivement plus la calibration.

Cependant un nouveau problème est apparu.

Une seule véritable répétition pouvait produire :

```text
9 cycles
```

Le concept est donc intéressant, mais l'implémentation actuelle ne représente pas correctement les véritables répétitions.

## Décision

➡ Fonction complètement retirée.

---

# Ce que cette séance nous a appris

La calibration ne devrait probablement pas être validée par :

```text
5 minima

+

5 maxima
```

Ces informations ne représentent pas directement les répétitions réalisées.

À terme, la calibration devrait plutôt être validée par :

```text
5 véritables répétitions
```

Cette distinction est probablement la découverte conceptuelle la plus importante de la journée.

---

# État actuel

## Fonctionnalités conservées

- ✅ Axe dominant dynamique
- ✅ Percentiles (`p25` / `p75`)
- ✅ Diagnostics détaillés
- ✅ Validation dynamique du `range`
- ✅ Calibration fonctionnelle sur Rowing
- ✅ Calibration fonctionnelle sur Overhead Press

---

## Fonctionnalités rejetées

- ❌ Machine à états V2
- ❌ Détection V3 par changement de direction
- ❌ Validation basée sur un nombre minimal de samples
- ❌ Première implémentation de validation par cycles

---

# Questions ouvertes

## 1. Comment définir une véritable répétition ?

Aujourd'hui, la calibration repose principalement sur :

```text
Bottoms

Tops
```

À terme, elle devrait probablement reposer sur une véritable segmentation biomécanique des répétitions.

---

## 2. Comment segmenter correctement une répétition ?

Objectif :

```text
Bottom
    ↓
Top
    ↓
Bottom
```

sans générer plusieurs faux cycles pour une seule répétition réelle.

---

## 3. Comment rendre le Rep Detector déterministe ?

Aujourd'hui, selon les essais :

```text
5
4
6
5
```

Objectif recherché :

```text
5
5
5
5
```

avec un comportement stable et reproductible.

---

# Conclusion

Cette séance a permis d'explorer de nombreuses pistes, dont plusieurs ont finalement été abandonnées.

Même si peu de code a été conservé, une découverte architecturale importante a été réalisée.

Le principal progrès est le remplacement du seuil fixe :

```ts
MIN_VALID_RANGE = 5000;
```

par une validation dynamique basée sur le signal réellement capturé.

Cette modification permet désormais de calibrer correctement aussi bien le **Rowing** que le **Overhead Press**, sans utiliser de seuils fixes.

En revanche, cette séance a également montré que le véritable problème restant n'est probablement plus la calibration du signal, mais la définition même d'une répétition.

La prochaine séance ne devrait donc pas commencer par écrire du code.

Elle devrait commencer par répondre à une question fondamentale :

> **Biomécaniquement, qu'est-ce qu'une véritable répétition pour RepMotion ?**

Une fois cette définition clairement établie, il sera possible de concevoir une segmentation robuste des répétitions qui servira non seulement à la calibration, mais également au **Rep Count**, au **Temps Sous Tension (TUT)**, à la **ROM**, à la **Velocity** et au **Sticking Point**.

Cette réflexion représente probablement la prochaine grande étape de l'architecture analytics de RepMotion.





















# Brainstorming — Définition biomécanique d'une répétition

## Objectif

Avant de continuer à modifier l'algorithme, nous avons voulu répondre à une question fondamentale :

> Qu'est-ce qu'une véritable répétition pour RepMotion ?

L'objectif est de définir un modèle qui servira non seulement au Rep Count, mais également au TUT, à la ROM, à la Velocity et au Sticking Point.

---

# 1. Une répétition est un cycle complet

Première conclusion importante :

Une répétition ne devrait probablement pas être définie comme :

```text
Bottom
↓
Top
↓
Rep +1
```

Cette logique est suffisante pour compter des répétitions, mais elle ne représente pas un cycle biomécanique complet.

Une véritable répétition est plutôt :

```text
Position de départ
↓
Phase concentrique
↓
Position opposée
↓
Phase excentrique
↓
Retour à la position de départ
↓
Rep +1
```

Pour les exercices qui commencent en position basse (Rowing, OHP, Curl, etc.) :

```text
Bottom
↓
Top
↓
Bottom
↓
Rep +1
```

---

# 2. Les cycles ne sont pas indépendants

Deuxième découverte importante :

Les répétitions ne sont pas des blocs indépendants.

Exemple :

```text
B1
↓
T1
↓
B2
↓
T2
↓
B3
↓
T3
↓
B4
```

Les répétitions deviennent :

```text
Rep 1

B1
↓
T1
↓
B2

Rep 2

B2
↓
T2
↓
B3

Rep 3

B3
↓
T3
↓
B4
```

Observation fondamentale :

Le dernier Bottom d'une répétition est simultanément le premier Bottom de la répétition suivante.

Le mouvement est donc continu.

Il ne faut probablement pas penser en "répétitions", mais en chaîne d'événements.

---

# 3. Analogie avec la marche

Cette logique ressemble au cycle de la marche.

Exemple :

```text
Pied gauche
↓
Pied droit
↓
Pied gauche
↓
Pied droit
```

Le pied gauche suivant représente :

- la fin du pas précédent
- le début du pas suivant

Le mouvement est continu.

Une répétition de musculation semble suivre exactement le même principe.

---

# 4. Conséquence architecturale

Le Rep Detector actuel fonctionne essentiellement ainsi :

```text
WAITING_BOTTOM
↓
Bottom confirmé
↓
WAITING_TOP
↓
Top confirmé
↓
Rep +1
```

Cette logique oublie complètement le retour au Bottom.

Si notre définition biomécanique est correcte, le modèle devrait plutôt être basé sur une chaîne continue d'événements :

```text
Bottom
↓
Top
↓
Bottom
↓
Top
↓
Bottom
↓
...
```

Les répétitions seraient ensuite déduites de cette chaîne.

---

# 5. Intérêt pour les futures métriques

Cette approche ne sert pas uniquement au Rep Count.

Elle fournit directement les événements nécessaires pour :

Temps sous tension (TUT)

```text
Bottom
↓
Top
↓
Bottom
```

Temps concentrique

```text
Bottom
↓
Top
```

Temps excentrique

```text
Top
↓
Bottom
```

ROM

```text
Amplitude Bottom ↔ Top
```

Velocity

```text
Variation entre Bottom et Top
divisée par le temps
```

Sticking Point

```text
Analyse de la vitesse
pendant la phase concentrique
```

Toutes les futures métriques semblent naturellement découler de cette segmentation.

---

# 6. Observation importante

Nous avons réalisé qu'il est probablement préférable de raisonner en événements biomécaniques plutôt qu'en compteur de répétitions.

Autrement dit :

Le Rep Count devient une conséquence de la segmentation du mouvement.

Et non l'inverse.

---

# Questions encore ouvertes

Même si cette vision semble cohérente, plusieurs questions restent à résoudre.

## Comment détecter un véritable Bottom ?

Aujourd'hui, nous utilisons principalement :

- zones percentiles
- minima locaux

Mais ces méthodes détectent parfois plusieurs faux bottoms pour une seule répétition.

Il faudra trouver une définition plus robuste.

---

## Comment détecter un véritable Top ?

Même problématique.

Les plateaux et le bruit du signal peuvent générer plusieurs faux tops.

---

## Comment rendre cette chaîne d'événements déterministe ?

Objectif final :

```text
5 répétitions réelles

↓

Toujours

↓

5 répétitions détectées
```

Peu importe :

- la vitesse
- le bruit
- les petites pauses
- les légères variations techniques

---

# Piste de réflexion

La prochaine séance ne devrait probablement pas commencer par modifier le code.

Elle devrait commencer par répondre à une question plus fondamentale :

> Comment reconnaître de manière fiable un événement biomécanique (Bottom ou Top) dans un signal IMU bruité ?

Une fois cette réponse trouvée, la calibration, le Rep Count, le TUT, la ROM, la Velocity et le Sticking Point devraient naturellement partager la même logique de détection.