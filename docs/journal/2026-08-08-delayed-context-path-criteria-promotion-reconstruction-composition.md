# Delayed Context Path — Investigation des critères jusqu'à la stratégie D

**Date :** 2026-08-08

---

# 1. Objectif de l'investigation

L'objectif était de comprendre comment mieux sélectionner les bons pivots et reconstruire la Ground Truth (GT), sans utiliser la GT pour prendre les décisions.

Ground Truth du dataset étudié :

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

Soit :

11 pivots GT.

Les critères étudiés pendant cette investigation sont :

- ZERO_PROXY
- JERK_PROXY
- AMPLITUDE / ROM
- TEMPORAL
- SHAPE

La Ground Truth est utilisée uniquement pour mesurer les résultats après les décisions.

---

# 2. TEST 1 — Est-ce que nos critères reconnaissent la GT sur des chaînes complètes ?

## Question

Avant d'utiliser ZERO, JERK, AMPLITUDE, TEMPORAL ou SHAPE pour prendre des décisions, nous voulions savoir :

"Si on donne des chaînes complètes aux critères, lesquels préfèrent réellement la Ground Truth ?"

Nous avons donc pris les chaînes terminales disponibles et comparé leur classement avec plusieurs familles de critères.

## Résultat

Le score historique basé sur la qualité locale des extrema ne reconnaissait pas correctement la GT.

La GT était même dernière selon la qualité locale des extrema.

Par contre :

TEMPORAL :
GT = rang 1

SHAPE :
GT = rang 1

Les combinaisons utilisant TEMPORAL + SHAPE plaçaient également la GT en première position.

## Conclusion

TEMPORAL et SHAPE sont très bons pour reconnaître une bonne séquence lorsqu'il y a suffisamment de contexte.

Mais cela ne répondait pas encore à une question importante :

"À partir de combien de cycles ces critères deviennent-ils fiables ?"

---

# 3. TEST 2 — À partir de quel cycle chaque critère devient-il utile ?

## Question

Une chaîne complète donne beaucoup de contexte.

Mais notre algorithme doit prendre des décisions progressivement.

Nous avons donc évalué les critères cycle par cycle pour déterminer :

- lesquels sont utiles tôt ;
- lesquels deviennent fiables plus tard ;
- à quel moment TEMPORAL et SHAPE commencent réellement à reconnaître la GT.

## Résultat général

Les critères ne deviennent pas tous pertinents au même moment.

L'ordre observé est :

### Très tôt

ZERO_PROXY

ZERO est le critère le plus intéressant au début.

### Ensuite

JERK_PROXY

JERK apporte une information supplémentaire, mais est moins fiable que ZERO.

### Avec davantage de contexte

AMPLITUDE / ROM

L'amplitude devient progressivement exploitable.

### Vers les cycles plus avancés

TEMPORAL

TEMPORAL devient réellement intéressant lorsque plusieurs cycles sont présents.

### Encore plus tard

SHAPE

SHAPE nécessite également plusieurs cycles pour devenir fortement discriminant.

Les observations historiques utilisées par la suite ont donné les rangs :

ZERO = 1
JERK = 4
AMPLITUDE = 9
TEMPORAL = 1
SHAPE = 1

## Conclusion

Il ne faut pas demander la même chose aux critères à tous les moments.

On possède maintenant deux catégories d'information :

1. critères utilisables tôt :
   ZERO, puis JERK, puis AMPLITUDE ;

2. critères très puissants lorsque la séquence devient suffisamment longue :
   TEMPORAL et SHAPE.

Cette observation servira ensuite à construire les poids.

---

# 4. TEST 3 — Pourquoi les pivots GT ne sont-ils pas promus ?

## Problème

Même avec de bons critères disponibles, plusieurs pivots GT n'arrivaient pas dans le pool de promotion.

Nous avons donc audité la logique de promotion existante.

## Ancienne logique

La promotion fonctionnait essentiellement avec des décisions du type :

BETTER
WORSE
CONFLICT

Un candidat pouvait être bon selon plusieurs critères mais être rejeté si un seul critère produisait un mauvais verdict.

Il existait donc une forme de veto.

## Résultat de l'audit

Avec la stratégie historique :

GT disponibles :
3/11

Donc le problème se produisait AVANT la reconstruction globale.

La majorité des pivots GT n'étaient même pas disponibles pour les étapes suivantes.

## Conclusion

Le problème principal était alors :

PROMOTION DES PIVOTS.

Il fallait remplacer la logique de veto par une méthode capable de combiner les informations provenant des différents critères.

---

# 5. TEST 4 — Promotion dynamique avec poids

## Hypothèse

Au lieu de dire :

"un mauvais critère peut éliminer le candidat",

nous avons décidé de donner une contribution à chaque critère.

Un candidat peut donc être :

très bon selon ZERO,
moyen selon JERK,
moins bon selon AMPLITUDE,

sans être automatiquement rejeté.

## Construction du score

Chaque critère est :

1. calculé ;
2. normalisé ;
3. pondéré ;
4. ajusté selon la confiance locale ;
5. ajouté au score total.

Formule :

promotionScore =
Σ(
    normalizedContribution
    × historicalWeight
    × localConfidence
)

Les poids proviennent des rangs observés pendant les tests précédents :

ZERO :
1 / 1 = 1.0

JERK :
1 / 4 = 0.25

AMPLITUDE :
1 / 9 ≈ 0.111

TEMPORAL :
1 / 1 = 1.0

SHAPE :
1 / 1 = 1.0

Il n'y a plus de veto individuel.

## Variantes testées

Nous avons comparé :

Dynamic Top-1
Dynamic Top-3
Dynamic Top-5

### Top-1

GT disponibles :
9/11

### Top-3

GT disponibles :
11/11

### Top-5

GT disponibles :
11/11

mais beaucoup plus de bruit est conservé et le downstream régresse.

## Résultat

Top-3 donne le meilleur compromis.

Résultat fondamental :

11/11 PIVOTS GT SONT MAINTENANT DISPONIBLES.

## Conclusion

Le problème de promotion des pivots est résolu sur ce dataset.

À ce moment de l'investigation, il devient inutile de continuer à chercher pourquoi les pivots GT disparaissent à la promotion :

ils sont tous disponibles.

Nouveau problème :

"Pourquoi, avec 11/11 pivots GT disponibles, le moteur ne reconstruit-il toujours pas la GT ?"

---

# 6. TEST 5 — End-to-end avec les 11 pivots disponibles

## Question

Maintenant que tous les pivots GT sont disponibles, nous avons rejoué le système complet.

Nous voulions savoir :

"Si les bonnes pièces sont toutes présentes, le reconstructeur est-il capable de les assembler ?"

## Résultat

GT disponibles :
11/11

Mais :

meilleur chemin généré :
7/11

ActivePath final :
6/11

## Observation importante

Les pivots manquants du meilleur chemin n'étaient pas absents du système.

Ils existaient individuellement dans des reconstructions valides.

Donc :

PROMOTION = OK

mais :

RECONSTRUCTION = encore limitée.

## Conclusion

Le problème s'est déplacé.

Avant :
les bonnes pièces manquaient.

Maintenant :
les bonnes pièces existent, mais elles ne sont pas correctement combinées.

---

# 7. TEST 6 — Est-ce que tous les segments nécessaires à la GT existent ?

## Question

Nous avons ensuite regardé les segments produits par les reconstructions locales.

Population observée :

648 segments uniques.

La question était :

"Est-ce que la GT complète peut être reconstruite en combinant simplement ces 648 segments ?"

## Résultat

NON.

Verdict :

FULL_GT_COMPOSABLE_FROM_EXISTING_SEGMENTS = NO

Une position importante n'avait aucune couverture GT-compatible :

BOTTOM:529

Cela signifie qu'il existait beaucoup de segments contenant différents pivots, mais aucune brique GT-compatible permettant de couvrir correctement B529 dans la composition de la GT.

## Conclusion

Le problème n'était donc pas seulement :

"on agence mal les segments".

Il manquait réellement au moins une bonne brique locale dans la population de segments.

Il fallait comprendre pourquoi cette brique n'était jamais créée.

---

# 8. TEST 7 — Pourquoi le bon segment autour de B529 n'est-il jamais créé ?

## Autopsie

Nous avons suivi :

BOTTOM:529
TOP:558
BOTTOM:611

Résultat :

B529 appartient au pool :

promising

T558 appartient au pool :

conditional

B611 permet de réparer T558.

Le moteur savait générer :

B529 + T555

et séparément :

T558 + B611

Mais il ne générait jamais :

B529 + T558 + B611

## Pourquoi ?

Le système avait deux mécanismes séparés :

### Reconstruction normale

activePath
+
promising

### Reconstruction conditionnelle

conditional
+
réparation adjacente

Ces deux mécanismes n'étaient jamais croisés.

Donc :

B529 + T558 + B611

n'était pas rejeté.

Cette combinaison n'était simplement jamais essayée.

## Vérification structurelle

La combinaison diagnostique :

T474-B529-T558-B611

passe les contraintes structurelles.

## Verdict

GT_PAIR_NOT_ENUMERATED

## Conclusion

Nous avons trouvé une deuxième limitation structurelle :

PROMISING et CONDITIONAL doivent parfois pouvoir participer à la même reconstruction.

---

# 9. TEST 8 — Mélanger directement promising + conditional

## Hypothèse

Nous avons essayé de croiser les deux populations.

Donc permettre :

promising
+
conditional
+
repair

dans la même reconstruction locale.

## Résultat

Explosion combinatoire.

Mixed reconstructions :
18 442

Mixed valides :
32

Garde-fou :
MAX_SEGMENTS

La bonne combinaison n'est pas atteinte avant le garde.

## Conclusion

L'idée de mélanger promising et conditional est logique.

Mais tout mélanger brutalement produit beaucoup trop de déchets.

Il fallait réduire les possibilités AVANT que l'explosion se produise.

---

# 10. TEST 9 — Scorer les reconstructions locales progressivement

## Idée

Nous avions déjà une méthode de score pondérée efficace pour la promotion.

Nous avons donc appliqué la même philosophie aux petites reconstructions.

Au lieu de :

générer toutes les possibilités

nous faisons :

générer
→ valider
→ scorer
→ garder les meilleures
→ étendre
→ scorer à nouveau

## Fonctionnement

Les critères disponibles évaluent les petites hypothèses.

Le score utilise à nouveau :

contribution normalisée
× poids du critère
× confiance locale

Puis un Top-3 conserve les hypothèses les plus intéressantes.

## Résultat sur la combinaison recherchée

T558 + B611

→ générée
→ rang 1
→ conservée

Puis :

B529 + T558 + B611

→ générée
→ valide
→ rang 3
→ conservée

Puis :

T474 + B529 + T558 + B611

→ générée
→ valide
→ rang 4
→ éliminée par Top-3

## Résultat fondamental

Même si la dernière extension est éliminée, nous obtenons maintenant une nouvelle brique exploitable :

S0946

BOTTOM:529
TOP:558
BOTTOM:611

## Population

Avant :

648 segments

Après ajout des nouveaux segments :

999 segments

Nouveaux segments :
351

Nouveaux segments GT-compatibles :
4

## Résultat majeur

Toutes les positions de la Ground Truth possèdent maintenant une couverture segmentaire GT-compatible.

## Conclusion

Deuxième problème important résolu :

PROMOTION :
11/11 pivots GT disponibles

SEGMENTS :
couverture GT complète

Il reste maintenant à savoir si ces bonnes briques peuvent être agencées pour reconstruire une bonne séquence globale.

---

# 11. TEST 10 — Stratégie D : agencer globalement les 999 segments

## Objectif

Maintenant que toutes les bonnes briques locales existent, nous voulons les assembler.

C'est la stratégie D :

GLOBAL SEGMENT COMPOSITION.

## Entrée de D

D reçoit :

648 segments historiques
+
351 nouveaux segments

=

999 segments.

IMPORTANT :

Les poids ont déjà joué un rôle avant D :

1. pour sélectionner/promouvoir les bons pivots ;
2. pour sélectionner les bonnes reconstructions locales qui produisent les nouveaux segments.

Mais D ne filtre pas à nouveau les 999 segments avec ZERO/JERK/etc. avant de les assembler.

## Ce que D fait

D essaye différentes combinaisons de segments qui ont du sens.

Il ne teste pas des permutations arbitraires.

Les segments possèdent des positions dans le chemin.

Ils doivent donc être compatibles positionnellement.

### Compatibilité

Deux segments peuvent être combinés si :

- ils ne se chevauchent pas ;

OU

- ils se chevauchent mais proposent exactement les mêmes pivots sur leurs positions communes.

Sinon :

combinaison rejetée.

### Validation structurelle

Après assemblage, le chemin doit encore respecter :

- ordre des pivots ;
- alternance BOTTOM/TOP ;
- distances minimales ;
- contraintes BOTTOM-BOTTOM ;
- validPrefix.

### Déduplication

Si plusieurs ensembles de segments produisent exactement le même chemin final :

le chemin n'est conservé qu'une fois.

---

# 12. Résultat de D

Segments d'entrée :

999

Compositions examinées :

865 082

Chemins globaux uniques :

200 001

Chevauchements incompatibles rejetés :

585 322

Rejets structurels :

2 093

Doublons :

68 082

Meilleur chemin trouvé :

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

Ground Truth :

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

Une seule erreur :

B228 au lieu de B262.

Résultat :

10/11 GT.

Soit :

90,9 % des pivots exacts.

C'est le meilleur résultat déterministe obtenu pendant toute l'investigation.

---

# 13. TEMPORAL + SHAPE sur les séquences globales de D

Après avoir créé les chemins globaux, nous avons voulu revenir à notre toute première observation :

TEMPORAL et SHAPE sont très bons pour reconnaître la GT sur une chaîne complète.

D calcule donc ces critères sur les chemins complets APRÈS leur génération.

IMPORTANT :

TEMPORAL et SHAPE ne servent pas à décider quelles branches D doit explorer.

Ils servent à classer les chemins complets déjà produits.

La GT 11/11 n'ayant pas été générée avant le garde-fou expérimental, nous ne pouvons pas encore démontrer son rang final dans cette population.

---

# 14. TEST 11 — Peut-on utiliser les critères plus tôt pour réduire D ?

D fonctionne très bien en qualité :

10/11.

Nous avons néanmoins voulu tester si nous pouvions réduire son espace de recherche.

Idée :

au lieu d'attendre la fin pour scorer les chemins,

scorer les chemins partiels pendant leur construction.

C'est l'expérience E.

---

# 15. Expérience E — pruning agressif

Beam :

K=5

Les meilleures hypothèses selon le score progressif sont conservées.

## Résultat

États :

50 196

Chemins complets :

3

Meilleur résultat :

7/11

La recherche est énormément réduite.

Mais la bonne branche est détruite très tôt.

Préfixe GT :

B169-T199-B262-T291

À 1 cycle :

rang = 17

K = 5

→ éliminé.

Même le chemin 10/11 trouvé par D :

rang ≈ 9

→ éliminé.

## Conclusion

Les critères précoces ne sont pas suffisamment fiables pour faire un pruning aussi agressif.

---

# 16. Expérience F — pruning plus conservateur

Nous avons fait un dernier test.

Au lieu de K=5 immédiatement :

0 cycle :
aucun pruning

1 cycle :
K=25

2 cycles :
K=20

3 cycles :
K=15

4 cycles :
K=10

5 cycles :
K=5

## Résultat

Au premier cycle :

la GT survit.

Mais à deux cycles :

GT rank = 104
K = 20

→ éliminée.

Le chemin 10/11 de D est également éliminé :

rank ≈ 77
K = 20

Résultat final :

9/11.

## Conclusion

F est meilleure que E :

E = 7/11
F = 9/11

Mais toujours moins bonne que D :

D = 10/11.

Cela démontre que le problème n'est pas simplement un K=5 trop petit.

Avec peu de cycles, nos critères ne classent pas encore suffisamment bien les bonnes branches pour permettre un pruning déterministe agressif.

---

# 17. Résumé de toute l'investigation

## Étape 1 — Tester les critères sur les chaînes complètes

Résultat :

TEMPORAL et SHAPE reconnaissent extrêmement bien la GT.

GT = rang 1 pour les deux critères.

---

## Étape 2 — Tester les critères cycle par cycle

Résultat :

les critères n'ont pas tous la même valeur au même moment.

ZERO est utile tôt.

JERK apporte ensuite de l'information.

AMPLITUDE devient utile avec davantage de contexte.

TEMPORAL et SHAPE deviennent très puissants lorsque plusieurs cycles sont présents.

---

## Étape 3 — Auditer la promotion

Résultat :

ancienne promotion = seulement 3/11 GT disponibles.

Cause :

logique de veto trop agressive.

---

## Étape 4 — Ajouter Dynamic Weighted Promotion

Résultat :

Top-3 = 11/11 pivots GT disponibles.

PROBLÈME DE PROMOTION RÉSOLU SUR CE DATASET.

---

## Étape 5 — Rejouer end-to-end

Résultat :

11/11 disponibles

mais seulement :

7/11 meilleur chemin généré.

Donc le nouveau problème est la reconstruction.

---

## Étape 6 — Auditer les segments

Résultat :

648 segments.

Mais aucune couverture GT-compatible pour B529.

Donc la GT complète est impossible à composer avec ces briques.

---

## Étape 7 — Comprendre pourquoi B529 manque

Résultat :

B529 = promising

T558 = conditional

B611 = repair

La combinaison :

B529-T558-B611

n'est jamais essayée.

---

## Étape 8 — Mélanger promising + conditional

Résultat :

bonne idée structurelle,

mais explosion combinatoire.

---

## Étape 9 — Ajouter le scoring progressif local

Résultat :

B529-T558-B611 est enfin généré.

Population finale :

999 segments.

Couverture segmentaire GT :

11/11 positions couvertes.

PROBLÈME DE COUVERTURE LOCALE RÉSOLU.

---

## Étape 10 — Stratégie D

Les 999 segments sont composés globalement.

Résultat :

10/11 GT.

MEILLEUR RÉSULTAT DÉTERMINISTE ACTUEL.

---

## Étape 11 — E

Pruning précoce agressif.

Résultat :

7/11.

Rejeté.

---

## Étape 12 — F

Pruning plus conservateur.

Résultat :

9/11.

Meilleur que E, mais inférieur à D.

Rejeté comme remplacement de D.

---

# 18. Architecture retenue actuellement

RAW / candidats
↓
Dynamic Weighted Promotion Top-3
↓
11/11 pivots GT disponibles
↓
promising + conditional
↓
Mixed Progressive Scored Reconstruction
↓
999 segments
↓
GLOBAL SEGMENT COMPOSITION D
↓
10/11 GT observé
↓
TEMPORAL + SHAPE sur les chemins complets

---

# 19. Conclusion

Nous avons progressivement résolu deux problèmes différents.

PROBLÈME 1 :

Les bons pivots n'étaient pas promus.

Résolu avec :

DYNAMIC WEIGHTED PROMOTION TOP-3.

Résultat :

11/11 pivots GT disponibles.

PROBLÈME 2 :

Les bonnes briques locales n'étaient pas toutes créées.

Résolu avec :

MIXED PROGRESSIVE SCORED RECONSTRUCTION.

Résultat :

couverture segmentaire GT complète.

Une fois ces deux problèmes corrigés, D est capable de reconstruire :

10/11 pivots GT.

Les expériences E et F montrent qu'essayer de réduire agressivement la recherche de D avec nos critères actuels fait perdre les bonnes branches avant qu'elles disposent d'assez de contexte.

Décision actuelle :

D reste la meilleure stratégie déterministe.

Ne pas continuer à tuner K ou les poids sur ce dataset.

Prochaines directions :

1. valider D sur d'autres datasets Ground Truth ;
2. envisager le ML pour apprendre à ranker/pruner les hypothèses ;
3. continuer en parallèle les autres mécanismes du Delayed Context Path, notamment rétention/backtracking.








