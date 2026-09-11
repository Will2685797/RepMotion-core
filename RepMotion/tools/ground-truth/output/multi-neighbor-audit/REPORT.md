# Audit READ-ONLY — fréquence legacy, C multi_neighbor V2 et budgets

FACT — Aucun algorithme, score, filtre, constante, budget, Ground Truth ni test de comportement modifié. Les sources ont été vérifiées par SHA-256 contre le précédent audit. Les fréquences viennent des traces legacy intégrales déjà validées. Trois nouveaux runs V2 sans instrumentation et trois runs V2 instrumentés en mémoire ont été comparés : mêmes décisions legacy A/C, mêmes reconstructions, segments, scores, classements et chemins/provenances D pour chaque paire baseline/trace. Les scripts et résultats sont confinés à ce dossier diagnostique.

FACT — Entrées identiques à l’audit précédent : pool historique naturel augmenté oracle, offsets 0 / 174 / 177, mêmes bootstraps naturels et mêmes valeurs IMU. Les annotations ne pilotent aucune décision V2. Les preuves de faisabilité sont calculées APRÈS les décisions, sans appel du fallback avec un budget modifié.

## A. Fréquence du problème legacy

Une observation = une substitution réellement examinée dans C, pour un triplet (cycle, position, candidat), après filtre de type et exclusion de l’Active. “Sauvé” signifie au moins une repair validant le préfixe, pas nécessairement une reconstruction complète validée. Les classes ci-dessous sont exclusives et leur somme est vérifiée.

| Dataset | Candidats uniques examinés | Substitutions examinées | Directement valides | Invalides | Invalides avec repair | Invalides avec zéro repair | Zéro / examinées |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | 55 | 925 | 137 | 788 | 97 | 691 | 74.70 % |
| 009 | 54 | 905 | 141 | 764 | 98 | 666 | 73.59 % |
| 010 | 81 | 1002 | 220 | 782 | 96 | 686 | 68.46 % |

| Dataset | Identités ayant au moins un zéro | Couples candidat-position | Positions logiques concernées / observées | Couples position-cycle / observés |
| --- | --- | --- | --- | --- |
| 007 | 55/55 | 257 | 11/11 | 35/35 |
| 009 | 54/54 | 243 | 11/11 | 35/35 |
| 010 | 81/81 | 298 | 9/9 | 24/24 |

FACT — Le brut donne 2 043 zéro-repair / 2 832 substitutions (72.14 %), 190 identités-dataset concernées / 190, et 31 positions-dataset / 31 observées. Ce n’est pas la preuve de 190 problèmes indépendants : le pool complet est essayé à chaque position du bon type. Par exemple une détection tardive peut être tentée comme B1. Dans 010, seulement 9 des 11 positions sont ouvertes ; T5/B6 restent censurées.

### Zéro repair ne signifie pas automatiquement « besoin de plusieurs voisins »

Diagnostic exact : pour chaque échec, on recherche le minimum de changements supplémentaires dans un préfixe valide, target fixe, pool complet. On distingue impossibilité, un changement non adjacent et au moins deux autres changements. Un second diagnostic cherche une chaîne complète valide dans les fenêtres V2 de 3/4 positions, extérieur fixé à l’Active et au moins 3 positions changées, sans beam ni budget. Ce sont des preuves d’existence structurelle, pas une simulation de survie dans V2.

| Dataset | Zéro repair | Aucun préfixe valide possible à ce slot | Un autre changement, non adjacent | Au moins deux autres changements | Fenêtre V2 structurellement possible | Fenêtre possible / substitutions |
| --- | --- | --- | --- | --- | --- | --- |
| 007 | 691 | 364 | 4 | 323 | 73 | 7.89 % |
| 009 | 666 | 422 | 10 | 234 | 61 | 6.74 % |
| 010 | 686 | 445 | 14 | 227 | 62 | 6.19 % |

FACT — 1 231 échecs sont impossibles même avec un préfixe reconstruit librement ; 28 demandent un changement non adjacent ; 784 demandent au moins deux autres changements. Seules 196 observations, soit 6.92 % des substitutions examinées et 9.59 % des zéro-repair, possèdent une solution compatible avec les contraintes de fenêtre V2 (avant beam et budgets).

### Candidats oracle à leur position correcte : regroupement pertinent

| Dataset | Options oracle exposées / totales | Substitutions oracle examinées | Épisodes zéro | Candidats oracle distincts concernés | Proportion des options exposées | Positions logiques concernées | Proportion des positions observées |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | 11/11 | 26 | 4 | 3 | 27.27 % | 3 | 27.27 % |
| 009 | 19/19 | 56 | 8 | 5 | 26.32 % | 3 | 27.27 % |
| 010 | 44/46 | 129 | 5 | 5 | 11.36 % | 2 | 22.22 % |

FACT — TOP527/TOP528 sont un seul slot logique T5, pas deux slots. Sur les trois datasets : 13 identités oracle-dataset, 17 épisodes, 8 positions-dataset concernées ; parmi elles, 7 positions nécessitent au moins deux autres changements. Le cas B262 est un changement non adjacent, pas obligatoirement deux voisins à changer. Les mêmes noms de slots sur des datasets différents ne sont pas fusionnés en une unique occurrence.

| Dataset | Position logique | Candidats | Cycles | Voisins / contrainte réelle | Minimum autres changements | Solution dans fenêtre V2 |
| --- | --- | --- | --- | --- | --- | --- |
| 007 | B2 | B262 | 2,3 | B299−B262=37<45 | 1, non adjacent | oui |
| 007 | B3 | B353 | 3 | T333 après B353 : −20 ; B391−B353=38<45 | 2 | oui |
| 007 | B5 | B529 | 5 | T509 après B529 : −20 ; B564−B529=35<45 | 2 | oui |
| 009 | T4 | T449 | 4,5 | B461→T449 : −12 | 2 | oui |
| 009 | B5 | B501/B502 | 4,5 | T507→B501/502 : −6/−5 ; depuis B461 : 40/41<45 | 3 | oui |
| 009 | T5 | T527/T528 | 5 | B532→T527/528 : −5/−4 | 4 | NON |
| 010 | T4 | T445/T446 | 4 | B445→T445/446 : 0/1<8 | 2 | oui |
| 010 | B5 | B487/B488/B489 | 4 | T501→B487/488/489 : −14/−13/−12 ; depuis B445 : 42/43/44<45 | 3 | oui |

FACT — Dans 007, ces candidats ne disparaissent pas automatiquement : B262 est encore disponible comme repair, B353 et B529 sont déjà Promising à la fin de ces promotions. Dans 009/010, les candidats oracle de ce tableau n’ont aucun rôle disponible à leur position dans C aux cycles concernés. Fréquence des appels fallback, besoin de multi-corrections et perte irréversible sont trois mesures différentes.

INFERENCE — « Fréquent » décrit raisonnablement le brut 68.46–74.70 %, mais ce brut est dominé par des essais hors contexte plausible. Pour les bons candidats à leur slot, les proportions 11.36–27.27 % des options exposées et 22.22–27.27 % des positions observées décrivent un phénomène récurrent, que l’on peut qualifier d’occasionnel/non exceptionnel. Aucun seuil rare/occasionnel/fréquent n’est défini par le code ou le protocole : ces mots restent interprétatifs. Trois datasets ne donnent pas une fréquence de population.

### Regroupement exhaustif par position logique

| Dataset | Position | Substitutions C | Zéro repair | Candidats distincts | Épisodes oracle | Épisodes nécessitant ≥2 autres changements | Fenêtre V2 possible |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | B1 | 130 | 130 | 26 | 0 | 80 | 6 |
| 007 | T1 | 135 | 98 | 24 | 0 | 58 | 14 |
| 007 | B2 | 130 | 96 | 25 | 2 | 49 | 11 |
| 007 | T2 | 108 | 69 | 25 | 0 | 27 | 6 |
| 007 | B3 | 104 | 72 | 24 | 1 | 29 | 3 |
| 007 | T3 | 81 | 47 | 19 | 0 | 11 | 0 |
| 007 | B4 | 78 | 52 | 22 | 0 | 19 | 6 |
| 007 | T4 | 54 | 44 | 26 | 0 | 18 | 18 |
| 007 | B5 | 52 | 42 | 25 | 1 | 19 | 9 |
| 007 | T5 | 27 | 20 | 20 | 0 | 5 | 0 |
| 007 | B6 | 26 | 21 | 21 | 0 | 8 | 0 |
| 009 | B1 | 125 | 113 | 23 | 0 | 66 | 8 |
| 009 | T1 | 135 | 77 | 19 | 0 | 37 | 4 |
| 009 | B2 | 125 | 83 | 20 | 0 | 25 | 7 |
| 009 | T2 | 108 | 67 | 20 | 0 | 20 | 9 |
| 009 | B3 | 100 | 78 | 23 | 0 | 18 | 12 |
| 009 | T3 | 81 | 50 | 19 | 0 | 11 | 6 |
| 009 | B4 | 75 | 59 | 22 | 0 | 13 | 3 |
| 009 | T4 | 54 | 44 | 23 | 2 | 18 | 6 |
| 009 | B5 | 50 | 45 | 24 | 4 | 12 | 6 |
| 009 | T5 | 27 | 26 | 26 | 2 | 8 | 0 |
| 009 | B6 | 25 | 24 | 24 | 0 | 6 | 0 |
| 010 | B1 | 212 | 130 | 35 | 0 | 81 | 12 |
| 010 | T1 | 104 | 62 | 22 | 0 | 37 | 13 |
| 010 | B2 | 212 | 148 | 45 | 0 | 39 | 15 |
| 010 | T2 | 78 | 42 | 18 | 0 | 15 | 0 |
| 010 | B3 | 159 | 125 | 47 | 0 | 20 | 6 |
| 010 | T3 | 52 | 28 | 17 | 0 | 7 | 4 |
| 010 | B4 | 106 | 85 | 48 | 0 | 11 | 2 |
| 010 | T4 | 26 | 20 | 20 | 2 | 8 | 5 |
| 010 | B5 | 53 | 46 | 46 | 3 | 9 | 5 |
| 010 | T5 | 0 | 0 | 0 | 0 | 0 | 0 |
| 010 | B6 | 0 | 0 | 0 | 0 | 0 | 0 |

La liste exhaustive des 2 043 épisodes, avec candidat, type, position, cycle, voisins courants à ±1/±2 et toutes les violations structurelles, est dans zero-repairs.csv et les fichiers *.legacy-frequency.json.

## B. Ce que C multi_neighbor V2 exécute exactement

Références de production : mobile/RepMotion/analytics/delayed-context-path/reconstruction/system-c/buildMultiNeighborAlternatives.ts (lignes 22–112), config.ts (50–57), delayedContextPath.ts (102–155), promotion/promoteCandidates.ts (54–103), system-c/buildConditionalAlternatives.ts (69–87).

### Entrée, déclenchement et sortie

FACT — Signature : buildMultiNeighborAlternatives(active, pool, cycle, values, position, target, search). active est la chaîne courante de C, pool le tableau complet, values le signal, target un Candidate fixe. search contient {rows, stats, unique}. Il est créé une fois par cycle C, partagé entre tous les targets de ce cycle. L’option cStrategy=multi_neighbor est explicite.

Le callback est appelé synchroniquement dans la promotion, uniquement après substitution simple invalide et repairs.length===0 avec !context.limit. Il ne reçoit aucune Map Promising/Conditional ni aucun classement legacy. stats.targets est incrémenté même si un guard V2 empêche tout travail. Puis : retour immédiat si stats.guard ; vérification de position/type/appartenance au pool ; retour si substitution simple finalement valide.

Les seeds obtenues sont ajoutées à generatedAudit APRÈS la sélection locale legacy, avec chosen=false, et dédupliquées contre les chaînes legacy du cycle. Elles n’alimentent ni l’Active C suivant ni les Maps de promotion. Elles peuvent ensuite produire des segments pour D. Dans ces runs, les trajectoires legacy sont vérifiées identiques.

### Fenêtres et domaines

FACT — prefixLength=min(active.length,2*cycle+1). Fenêtres de longueur 3 puis 4. Pour chaque longueur : start croissant, depuis max(0,position-length+1), avec start<=position et start+length<=prefixLength. Le target est fixé à son slot. Chaque autre position de la fenêtre peut prendre n’importe quel candidat du pool ayant le type de active[p], y compris Active, Promising, Conditional, repair ou aucun rôle legacy. Seul le type est filtré. Le préfixe avant start et le suffixe après end restent ceux de l’Active.

Ordre : fenêtres longueur/start ; positions gauche→droite ; parents dans l’ordre du beam ; options dans l’ordre du pool filtré. Aucun sort des voisins dans V2. Le harness avait trié le pool par index, type, ID : c’est cet ordre d’entrée, pas un rang de qualité, qui gouverne les options.

### Une expansion, exactement

FACT — Une expansion est UN passage du couple (prefix parent du beam, option de la position courante) après les checks de budget, à la ligne 69 : targetStates++; stats.states++; puis partial=[...prefix,option]. Elle est comptée même si la validation échoue, même si le partial est un doublon et même si l’option est le target fixe ou l’Active. Réessayer dans une autre fenêtre consomme de nouvelles expansions. states est précisément ce compteur d’expansions, pas le nombre de chemins uniques, de parents du beam, ni de seeds.

### Validation, score et beam

FACT — Après consommation de l’expansion : validatePath(partial), puis borne nécessaire vers le target : si p<position, option.index + somme des durées minimales adjacentes restantes doit être <=target.index. La validation applique alternance B/T, indices croissants, phases >=8 et BOTTOM→BOTTOM>=45. Cette borne et cette validation sont après le débit du budget.

Les partials valides sont dédupliqués par signature type:index dans next. S’il reste des positions, rank(next) les classe, puis le beam conserve les 32 premiers. Le beam initial est [active.slice(0,start)], sans classement. Après la dernière position, le suffixe Active est recollé ; generated augmente AVANT validation de la chaîne entière. Les chemins entiers invalides sont rejetés ; ceux avec moins de 3 indices changés dans la fenêtre sont ignorés. Les autres entrent dans complete, dédupliqué par chemin, première fenêtre conservée.

rank réutilise les fonctions de score de promotion, mais RECALCULE les scores des chemins courants. effectiveCycle=min(cycle,floor((path.length-1)/2)). Si <1 : uniquement sort lexicographique de signature. Sinon scoreSequence, critères disponibles non-null pour Active et tous les concurrents, normalizeFeatures, calculateConfidence et calculateWeights. Le score est somme(normalisé×poids×confiance), sans synergie. Normalisation par composante orientée dans [-1,1] (0 si étendue nulle), confiance=étendue/(étendue+MAD) (0 si étendue nulle), moyenne des composantes, poids ZERO=1, JERK=1/4, AMPLITUDE=1/9, TEMPORAL=1, SHAPE=1. Tri score décroissant, puis signature localeCompare. Le parameter candidate de scoreCandidate n’ajoute aucun score individuel : les features du chemin déterminent le score.

FACT — Un dernier TOP d’un préfixe incomplet est ignoré par scoreSequence : seules les reps B-T-B complètes entrent dans effectiveCycle. Deux extensions TOP du même parent peuvent donc avoir le même score et être départagées lexicalement. L’effet causal sur un candidat particulier reste UNKNOWN sans trace de cette branche ; T527 n’y entre pas.

Les survivors classés d’une profondeur deviennent les parents de la suivante : il existe donc une priorisation DES PARENTS après expansion, mais pas de présélection des meilleurs VOISINS avant expansion. À la fin du target, tous les complete sont à nouveau classés avec la chaîne complète et le cycle courant ; les 3 premiers sont candidats à l’export.

| Limite | Portée exacte | Déclenchement / effet |
| --- | --- | --- |
| beamWidth=32 | par profondeur de chaque fenêtre | après expansion, validation et déduplication ; conserve 32 chemins partiels |
| maxSeedsPerTarget=3 | ensemble des fenêtres du target | ordered.slice(0,3) avant déduplication inter-target ; pas de repêchage du 4e |
| maxStatesPerTarget=4096 | toutes les fenêtres du target cumulées | check >= avant chaque expansion ; arrête ce target ; targetBudgetHits augmente à >=4096 |
| maxStatesPerCycle=65536 | tous les targets du cycle | check >= avant expansion ; MULTI_MAX_STATES arrête les targets suivants |
| maxSeedsPerCycle=64 | rows du search du cycle | guard MULTI_MAX_SEEDS lors d’une tentative de nouveau seed si rows.length>=64 ; atteindre 64 seul ne déclenche pas forcément le guard |

FACT — Le ranking final du target peut encore exporter des seeds déjà trouvées après l’atteinte de MULTI_MAX_STATES. Le Set unique est partagé par cycle ; les doublons ne prennent pas de nouvelle place, mais ont déjà pu consommer des expansions et des places du top 3. Aucun timeout propre à V2. Son temps peut cependant contribuer aux timers legacy de C, dont le départ précède la promotion. legacyAdmissionBudgetHits est initialisé mais jamais incrémenté par ce code.

## C. Priorisation : réponse à la question critique

FACT — Le chemin est : pool complet filtré par type → combinaisons parent/option → débit budget → validation → score des partials survivants → top32 → profondeur suivante → validation complète → score final → top3. Il ne passe PAS par les classements legacy pour ordonner les voisins. Les targets sont ceux rencontrés dans les boucles position croissante / ordre du pool de promoteCandidates, avec fallback immédiat avant même le classement final des substitutions directes valides de cette position.

INFERENCE — Dire « V2 ne score qu’à la fin » serait inexact : le score pilote le beam entre les profondeurs. Dire « V2 explore les meilleurs voisins Promising d’abord » serait également inexact. Il réutilise les fonctions de scoring, pas les listes classées ou les rangs déjà produits par la promotion.

## D. 009 — consommation chronologique des 65 536 expansions du cycle 5

FACT — 242 appels target dans C5 ; 34 consomment des expansions ; 208 sont bloqués à l’entrée par le guard. Les 34 consommateurs occupent seulement les positions B1 et T1. B1 consomme 30 754 expansions, T1 les 34 782 restantes. T527 est le 215e appel du cycle, T528 le 216e : chacun arrive avec 65 536 expansions de targets PRÉCÉDENTS et consomme exactement 0 expansion propre.

Survivants beam = somme des tailles des beams retenus aux étapes intermédiaires du target, pas des candidats uniques ; complets = chemins uniques valides avec >=3 changements avant top3. states du target est identique à ses expansions. Les colonnes séparent le budget déjà consommé avant le target et son coût propre.

| Ordre | Target | Position | Cycle | Avant : autres targets | Expansions propres = states | Cumul cycle | Rejets structurels | Survivants beam (somme) | Complets uniques | Seeds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | B231 | B1 | 5 | 0 | 2150 | 2150 | 1872 | 80 | 7 | 3 |
| 2 | B249 | B1 | 5 | 2150 | 2098 | 4248 | 1846 | 78 | 3 | 3 |
| 3 | B270 | B1 | 5 | 4248 | 2046 | 6294 | 1820 | 76 | 0 | 0 |
| 4 | B271 | B1 | 5 | 6294 | 1994 | 8288 | 1785 | 74 | 0 | 0 |
| 5 | B272 | B1 | 5 | 8288 | 1994 | 10282 | 1785 | 74 | 0 | 0 |
| 6 | B291 | B1 | 5 | 10282 | 1942 | 12224 | 1751 | 72 | 0 | 0 |
| 7 | B302 | B1 | 5 | 12224 | 1942 | 14166 | 1751 | 72 | 0 | 0 |
| 8 | B311 | B1 | 5 | 14166 | 1890 | 16056 | 1716 | 70 | 0 | 0 |
| 9 | B331 | B1 | 5 | 16056 | 1890 | 17946 | 1717 | 70 | 0 | 0 |
| 10 | B348 | B1 | 5 | 17946 | 1838 | 19784 | 1682 | 68 | 0 | 0 |
| 11 | B365 | B1 | 5 | 19784 | 1786 | 21570 | 1643 | 66 | 0 | 0 |
| 12 | B384 | B1 | 5 | 21570 | 1578 | 23148 | 1488 | 58 | 0 | 0 |
| 13 | B423 | B1 | 5 | 23148 | 1526 | 24674 | 1450 | 56 | 0 | 0 |
| 14 | B436 | B1 | 5 | 24674 | 1474 | 26148 | 1410 | 54 | 0 | 0 |
| 15 | B461 | B1 | 5 | 26148 | 1202 | 27350 | 1158 | 44 | 0 | 0 |
| 16 | B476 | B1 | 5 | 27350 | 1010 | 28360 | 973 | 37 | 0 | 0 |
| 17 | B501 | B1 | 5 | 28360 | 734 | 29094 | 707 | 27 | 0 | 0 |
| 18 | B502 | B1 | 5 | 29094 | 734 | 29828 | 707 | 27 | 0 | 0 |
| 19 | B532 | B1 | 5 | 29828 | 326 | 30154 | 314 | 12 | 0 | 0 |
| 20 | B545 | B1 | 5 | 30154 | 270 | 30424 | 260 | 10 | 0 | 0 |
| 21 | B560 | B1 | 5 | 30424 | 162 | 30586 | 156 | 6 | 0 | 0 |
| 22 | B578 | B1 | 5 | 30586 | 110 | 30696 | 106 | 4 | 0 | 0 |
| 23 | B599 | B1 | 5 | 30696 | 58 | 30754 | 56 | 2 | 0 | 0 |
| 24 | T318 | T1 | 5 | 30754 | 3214 | 33968 | 2874 | 136 | 0 | 0 |
| 25 | T340 | T1 | 5 | 33968 | 3266 | 37234 | 2921 | 142 | 0 | 0 |
| 26 | T360 | T1 | 5 | 37234 | 3208 | 40442 | 2906 | 142 | 0 | 0 |
| 27 | T373 | T1 | 5 | 40442 | 3262 | 43704 | 2945 | 146 | 0 | 0 |
| 28 | T374 | T1 | 5 | 43704 | 3262 | 46966 | 2945 | 146 | 0 | 0 |
| 29 | T381 | T1 | 5 | 46966 | 3206 | 50172 | 2915 | 144 | 0 | 0 |
| 30 | T390 | T1 | 5 | 50172 | 3206 | 53378 | 2915 | 144 | 0 | 0 |
| 31 | T413 | T1 | 5 | 53378 | 3260 | 56638 | 2955 | 148 | 0 | 0 |
| 32 | T431 | T1 | 5 | 56638 | 3202 | 59840 | 2939 | 148 | 0 | 0 |
| 33 | T449 | T1 | 5 | 59840 | 3256 | 63096 | 2982 | 152 | 0 | 0 |
| 34 | T463 | T1 | 5 | 63096 | 2440 | 65536 | 2191 | 146 | 0 | 0 |

FACT — Les 6 seeds proviennent uniquement des deux premiers targets : B231 et B249, essayés comme B1. Les 32 targets suivants consomment 61 288 expansions sans nouveau seed. T449, oracle T4, consomme notamment 3 256 expansions lorsqu’il est essayé comme T1. B501, oracle B5, en consomme 734 comme B1. Le budget s’épuise dans T463 à T1 : 63 096 expansions étaient déjà consommées, puis ce target en utilise 2 440.

Bilan C5 : 59 641 rejets structurels, 3 154 partials écartés par le beam, 8 914 chemins complets générés avant validation, 10 complets uniques admissibles au classement final des targets, 6 seeds. Aucun target n’atteint 4 096 expansions ; le plafond de 64 seeds est loin d’être atteint. Le guard contraignant est MULTI_MAX_STATES global au cycle. Les premiers travaux sont réexécutés aux cycles 3, 4 et 5, avec les mêmes compteurs observés.

## E. T449 / B501 / B578 autour de T527

| Voisin | Position | Source | Rôle legacy C5 | Score/rang legacy C5 | Ordre pool | Ordre options du type | Éligible individuellement V2 | Score/rang V2 sous T527 | Budget autres targets / propre |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T449 | T4 | ORACLE_INJECTED | no retained role | non calculé, substitution invalide | 36 | 19/28 | oui | non calculé | 65536 / 0 |
| B501 | B5 | ORACLE_INJECTED | no retained role | non calculé, substitution invalide | 41 | 20/26 | oui | non calculé | 65536 / 0 |
| B578 | B6 | ORACLE_INJECTED | Promising | 0.030864197530864224 / 1 | 52 | 25/26 | oui | non calculé | 65536 / 0 |

FACT — Les trois candidats sont présents dans le pool augmenté, de type attendu, et passent donc le filtre de domaine V2. Ils sont tous ORACLE_INJECTED. T449/B501 ne sont ni Promising ni Conditional dans C5 ; cela n’empêche pas leur présence dans pool.filter. B578 est Promising rang 1, mais ce rang n’est pas utilisé pour l’avancer dans la liste : il reste 25e BOTTOM sur 26.

Le runtime ne crée aucune fenêtre sous T527/T528 : aucun voisin n’y est exploré, classé ou pruné. Le guard bloque le target entier avant la construction des listes. Les ordres 19/28, 20/26 et 25/26 sont les positions déterministes dans les listes que le code construirait, pas des rangs de qualité ni des temps d’exploration mesurés. À une position atteinte, le code parcourt tous les parents selon le beam et ces options dans cet ordre ; le nombre total d’expansions précédant un voisin dépend des fenêtres et parents survivants. Aucun budget propre hypothétique n’a été réinitialisé pour simuler leur exploration.

### Coexistence dans une même branche

FACT — Les fenêtres autour du slot 9 (T5), au cycle 5, sont dans cet ordre : [7,9], [8,10], [6,9], [7,10]. Seule [7,10] contient simultanément T449, B501, T527 et B578. Elle fixe les slots 0..6 à l’Active C5, notamment B461 en slot 6. Le premier ajout T449 donne 449−461=−12 : ordre invalide. B501 donne aussi 501−461=40<45. Cette branche ne peut donc pas conserver les quatre candidats ensemble.

Le witness complet est valide parce qu’il emploie B423 avant T449, et un contexte antérieur compatible ; ce B423 n’est pas substituable dans [7,10]. Inclure à la fois le slot 6 et le slot 10 demanderait une fenêtre de 5 positions. Plus généralement, le diagnostic exact trouve un minimum de 4 AUTRES changements pour T527/T528 dans l’Active C5 : au moins 5 indices doivent changer, contre au plus 4 dans V2. Aucune des quatre fenêtres ne contient une solution, même avant beam et budget. C’est une preuve indépendante du guard, sans exécuter une variante optimisée.

INFERENCE — Le budget est le premier obstacle réellement rencontré dans ce run, mais « donner enfin du budget à T527 suffirait » n’est pas soutenu : sa solution est aussi hors de la portée structurelle des fenêtres actuelles. L’éligibilité individuelle des trois voisins ne démontre pas leur coexistence.

## F. 010 — deux censures distinctes

FACT — C traite 1 002 substitutions aux cycles 1..4 : 132, 211, 290 puis 369. Toutes les positions 0..8 passent par la promotion C4 avant le guard de reconstruction. Le cycle 5 est absent. Cela laisse non réévalués les anciens slots et non ouverts T5/B6 : 26 alternatives TOP pour T5 et 53 BOTTOM pour B6, soit 79 substitutions correspondant aux deux nouveaux slots. Un C5 sans interruption aurait au départ 448 alternatives type/index admissibles à la boucle ; ce chiffre décrit le domaine, pas une exécution contrefactuelle.

Le MAX_SEGMENTS C4 arrive à 20 001 feuilles modifiées, fenêtre start=1, longueur=4. Le bloc couplé C4 est ensuite sauté ; le progressif C4 continue et ajoute 423 lignes valides, toujours dans le préfixe 0..8. Il ne peut pas atteindre T517/B563 à leurs positions finales.

Le problème multi-neighbor EST observable avant cette censure : T445/T446 (T4) et B487/B488/B489 (B5) ont zéro repair et demandent respectivement 2/3 autres changements. Des fenêtres V2 structurellement valides existent. Mais leurs appels V2 C4 arrivent tous avec 65 536 expansions déjà consommées et 0 expansion propre. Ce budget a été consommé par 25 targets à la seule position B1 ; le dernier, B487 essayé comme B1, arrive à 64 956 et consomme les 580 restantes. Il n’est pas à sa position oracle B5 lors de cette consommation.

UNKNOWN — 010 ne permet pas d’observer les admissions legacy ou expansions V2 de T517/B563 à T5/B6 au cycle 5 : MAX_SEGMENTS empêche ces étapes. Il ne faut pas les compter comme zéro-repair C. 010 permet d’observer des cas antérieurs et leur blocage budgétaire V2, pas de conclure sur un cycle 5 inexécuté.

## Comparaison des budgets V2 par cycle

| Dataset | Cycle | Appels targets | Targets ayant expansé | Expansions | Rejets structurels | Beam pruned | Seeds cumulées | Target cap hits | Guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | 1 | 30 | 30 | 9856 | 9469 | 0 | 0 | 0 | aucun |
| 007 | 2 | 87 | 36 | 65536 | 59042 | 4009 | 0 | 0 | MULTI_MAX_STATES |
| 007 | 3 | 141 | 36 | 65536 | 59042 | 4009 | 0 | 0 | MULTI_MAX_STATES |
| 007 | 4 | 188 | 36 | 65536 | 58999 | 4009 | 18 | 0 | MULTI_MAX_STATES |
| 007 | 5 | 245 | 36 | 65536 | 58999 | 4009 | 18 | 0 | MULTI_MAX_STATES |
| 009 | 1 | 27 | 27 | 8272 | 7924 | 0 | 3 | 0 | aucun |
| 009 | 2 | 79 | 34 | 65536 | 59715 | 3055 | 3 | 0 | MULTI_MAX_STATES |
| 009 | 3 | 131 | 34 | 65536 | 59641 | 3154 | 6 | 0 | MULTI_MAX_STATES |
| 009 | 4 | 187 | 34 | 65536 | 59641 | 3154 | 6 | 0 | MULTI_MAX_STATES |
| 009 | 5 | 242 | 34 | 65536 | 59641 | 3154 | 6 | 0 | MULTI_MAX_STATES |
| 010 | 1 | 47 | 47 | 17689 | 17069 | 103 | 6 | 0 | aucun |
| 010 | 2 | 130 | 25 | 65536 | 60064 | 3798 | 30 | 0 | MULTI_MAX_STATES |
| 010 | 3 | 213 | 25 | 65536 | 60113 | 3798 | 0 | 0 | MULTI_MAX_STATES |
| 010 | 4 | 296 | 25 | 65536 | 60113 | 3798 | 0 | 0 | MULTI_MAX_STATES |

## Conclusion — réponses aux neuf questions

1. FACT — 691 / 666 / 686 épisodes zéro-repair dans C legacy, soit 2 043 au total. À leur slot oracle correct : 4 / 8 / 5 épisodes et 3 / 5 / 5 candidats distincts.
2. FACT — Brut : 11 / 11 / 9 positions ouvertes concernées. Oracle correct : 3 / 3 / 2 positions-dataset, soit 8 ; 7 nécessitent réellement au moins deux autres changements.
3. FACT — Répartition et proportions détaillées en partie A. 010 est censuré après C4 : 44 options oracle exposées sur 46.
4. INFERENCE — Les cas récurrents et structurellement prouvés justifient d’étudier la limite one-neighbor. UNKNOWN — Leur fréquence seule ne justifie pas l’efficacité/coût de cette implémentation V2 : beaucoup de zéro-repair sont impossibles, certains candidats survivent déjà via les Maps legacy, et les targets intéressants sont souvent bloqués par le budget.
5. FACT — V2 réutilise les fonctions de score pour classer les préfixes et les complets. Il ne réutilise pas les rangs legacy ni les meilleurs voisins en premier ; les options suivent le pool.
6. FACT — Sur 009 C5, 34 targets B1/T1 consomment 65 536 expansions avant T527. Le target courant en consomme zéro. Aucun plafond par target ou par seeds ne cause cet arrêt.
7. FACT — T449/B501/B578 sont individuellement dans les domaines ; ils ne sont pas explorés dans ce run. Ils ne peuvent pas coexister dans la fenêtre autorisée avec le préfixe Active courant. T527 demande 4 autres changements, hors span maximal 4.
8. FACT — 010 révèle le problème à T4/B5 avant le guard et l’épuisement V2 à B1. UNKNOWN — Les positions T5/B6 ne sont pas évaluées dans C5 ; cette hypothèse finale reste censurée.
9. FACT / INFERENCE — Le goulot runtime de V2 est le budget partagé du cycle consommé par les premiers targets, dans l’ordre position/pool, avec de nombreux rejets et peu de seeds. La portée des fenêtres constitue un second obstacle indépendant sur T527/T528. Aucun effet spécifique du beam sur ces targets non expansés n’est démontré.

## Artefacts et reproduction

- zero-repairs.csv : chaque épisode legacy, voisins et raisons ; *.legacy-frequency.json : détails et preuves de faisabilité ; frequency-summary.json : agrégats.
- 009-cycle5-budget.csv : attribution des 65 536 expansions ; all-v2-targets.csv : tous les targets/cycles/datasets, incluant ceux bloqués à zéro.
- *.baseline.json / *.trace.json : empreintes et traces en mémoire ; fenêtres, options, compteurs avant/après ; 009-witness-neighbors.json : preuve de domaines/coexistence.
- trace.cjs : replay exact de l’entrée précédente, cStrategy multi_neighbor ; frequency.cjs : diagnostics post-décision ; report.cjs : ce rapport.

Les fichiers de run utilisent flag wx et ne sont pas écrasés. Aucun replay avec budget changé, aucun classement oracle, aucune optimisation. Les minima diagnostiques utilisent exactement les contraintes structurales de validatePath et sont vérifiés avec cette fonction. L’existence sans beam/budget est distinguée de l’exploration runtime.
