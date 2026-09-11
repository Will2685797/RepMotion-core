# Audit runtime READ-ONLY — Delayed Context Path legacy — 007 / 009 / 010

FACT — Trois exécutions sans instrumentation, puis deux passes instrumentées par dataset. Toutes les passes ont reproduit exactement les trajectoires, reconstructions ordonnées, Maps, segments, scores, classements, chemins D et provenances des runs sans instrumentation (SHA-256 et compteurs). Aucun changement des sources de production, Calibration, DP, scores, guards, GT ou tests. Seuls les scripts et résultats diagnostiques de ce dossier ont été créés. Les transformations TypeScript sont en mémoire. Aucun timeout n’a été déclenché.

FACT — Le protocole est celui du harness historique : historical007Input sur les samples complets de 007, et sur les samples après offset 174 / 177 pour 009 / 010. Un seul appel Calibration et DP naturel, avant lecture GT. Puis augmentation oracle du pool, tri index/type/ID, IDs neutres EXPERIMENTAL_type_index, aucun recalcul du bootstrap. La GT définit les injections explicitement demandées par le protocole ; aucune annotation ni distance GT n’est passée aux fonctions de décision. Les évaluations et recherches de preuves sont postérieures aux décisions observées.

## Définitions indispensables

- Tous les résultats oracle sont mesurés à la position ordinale correcte. Une occurrence du même type:index à une autre position ne compte pas.
- NATURAL_POOL = membre du pool naturel admissible historique, sans appartenance oracle ; ORACLE_INJECTED = absent du pool naturel et ajouté ; BOTH = déjà naturel ET membre de l’ensemble oracle (pas une double insertion). Les 22 candidats des witnesses 009/010 sont ORACLE_INJECTED. Aucun n’est présenté comme naturellement détecté.
- Ac/P/Q/R = Active / Promising / Conditional / partenaire de repair. Ce sont des rôles cumulés, non une partition. Un candidat hors top 3 peut être R. Q et R n’ont aucun score/rang de catégorie ; seul le classement des substitutions directes valides possède un rang.
- considered = candidat explicitement parcouru comme option de reconstruction, cible/partenaire couplé, seed ou option d’extension ; la simple présence ambiante dans un Active ne suffit pas. Compteurs d’occurrences, incluant essais partiels et échecs. Les présences dans les reconstructions comptent, elles, toute la chaîne valide, même hors fenêtre.
- A/C segment = segment distinct extrait séparément de chaque audit ; C inclut les segments également produits par A, et ne signifie pas C-only. D = segments dans l’union puis nombre de chemins uniques D contenant le candidat.
- Les scores des tableaux principaux sont le PREMIER score direct réellement calculé à cette position, avec cycle et rang. Ils ne représentent ni un score permanent ni la meilleure admission ultérieure. Les chronologies complètes ci-dessous et promotion-timeline.csv donnent tous les scores/rangs/cycles.
- Une absence intermédiaire n’est pas une perte irréversible. Les pertes d’exploration sont séparées de FINAL_WINNER_SELECTION : un candidat présent dans D mais absent du winner n’était pas perdu avant cette sélection finale. UNKNOWN signifie que la première instruction irréversible n’est pas démontrée.
- best generated = maximum de récupération parmi les chemins réellement enregistrés dans D. Pour 007 : exact historique. Pour 009/010 : appartenance aux ensembles discrets windowOracle, comprenant leurs approximations de résolution. Ce maximum ne prouve pas une chaîne complètement compatible. Le meilleur représentant est le mieux classé au score combiné parmi ceux de récupération maximale.

## 1. Populations et résultats

| Dataset | RAW | Pool naturel | Options oracle | BOTH | Ajouts | Pool augmenté | Bootstrap compatible | Distance moyenne au witness | Best A / C / D | Winner compatible |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | 46 | 46 | 11 | 2 | 9 | 55 | 2/11 | 29.818 | 7 / 5 / 10 | 5/11 |
| 009 | 35 | 35 | 19 | 0 | 19 | 54 | 0/11 | 30.545 | 7 / 5 / 7 | 1/11 |
| 010 | 35 | 35 | 46 | 0 | 46 | 81 | 0/11 | 44.273 | 3 / 6 / 6 | 0/11 |

FACT — La compatibilité discrète du winner 009 est 1/11, mais cela ne signifie pas un pivot dans une fenêtre continue GT : la discrétisation peut retenir des samples voisins d’une fenêtre sans entier. Les métriques de fenêtres continues et les witnesses exacts ne sont pas confondus ici.

## 2. Statistiques globales de candidats distincts

Chaque nombre ci-dessous compte des identités type:index uniques, à n’importe quelle position pour cette statistique globale. Les rôles se chevauchent. “Non retenus” = jamais Active, Promising, Conditional ni Repair dans ce run. Les tableaux oracle utilisent au contraire la position correcte.

| Dataset/run | Évalués promotion distincts | Visites promotion | Active au moins une fois | Promising | Conditional | Repair | Non retenus | Considérés | En reconstruction | En segment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 007/A | 55 | 925 | 21 | 30 | 33 | 37 | 3 | 52 | 51 | 48 |
| 007/C | 55 | 925 | 19 | 28 | 31 | 36 | 3 | 52 | 51 | 48 |
| 009/A | 54 | 905 | 17 | 36 | 30 | 40 | 1 | 53 | 52 | 49 |
| 009/C | 54 | 905 | 15 | 32 | 27 | 36 | 1 | 53 | 50 | 48 |
| 010/A | 81 | 1450 | 16 | 40 | 40 | 57 | 2 | 79 | 73 | 71 |
| 010/C | 81 | 1002 | 18 | 43 | 48 | 62 | 1 | 80 | 73 | 69 |

| Dataset | Candidats distincts union segments | Candidats distincts chemins D | Witness disponibles A / C | Oracle disponibles A / C |
| --- | --- | --- | --- | --- |
| 007 | 48 | 49 | 11 / 11 | 11 / 11 |
| 009 | 50 | 52 | 10 / 8 | 17 / 14 |
| 010 | 75 | 74 | 5 / 7 | 37 / 39 |

Un candidat du bootstrap peut atteindre D sans apparaître dans un segment (exemple B169). C’est pourquoi le nombre dans D peut dépasser celui des identités dans l’union des segments. Chaque Active final contient 11 pivots.

## 3. Tableaux obligatoires des witnesses

Les colonnes de classe regroupent les rôles observés sur tous les cycles ; les scores sont les premiers scores directs, pas des scores Conditional. Les raisons détaillées L009, C4 guard, D guard et UNKNOWN sont démontrées dans la section 5.

### 007

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B169 | oui / BOTH | oui | Ac / Ac | — ; — | 14 | 2649 | 0 | 85 | non exécuté | 3402 | 0 | 0 seg / 200001 chemins | — | Winner |
| T199 | oui / ORACLE_INJECTED | non | P / P | c1 -0.4164/2 ; c1 -0.4164/2 | 27 | 145 | 29 | 123 | non exécuté | 309 | 72 | 77 seg / 71828 chemins | — | Winner |
| B262 | oui / ORACLE_INJECTED | non | R+Q / R+Q | c1 0.3708/12 ; c1 0.3708/12 | 14 | 4 | 4 | 36 | c2:0; c3:0; c4:4; c5:4 | 56 | 12 | 12 seg / 0 chemins | UNKNOWN | B299−B262=37<45 ; ordre D |
| T291 | oui / BOTH | oui | Ac+P+R / Ac+R+P | c5 -0.1438/3 ; c4 -0.1451/4 | 247 | 708 | 109 | 291 | non exécuté | 415 | 97 | 151 seg / 92135 chemins | — | Winner |
| B353 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R+Ac | c2 0.7516/3 ; c2 0.7516/3 | 534 | 1071 | 88 | 1006 | c3:0 | 1606 | 91 | 158 seg / 54796 chemins | Final | Autre chemin classé premier |
| T383 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R | c3 0.5685/3 ; c3 0.5685/3 | 812 | 1109 | 88 | 871 | non exécuté | 425 | 71 | 117 seg / 39730 chemins | — | Winner |
| B445 | oui / ORACLE_INJECTED | non | R+P+Ac / R+P | c3 0.7738/4 ; c3 0.7738/4 | 773 | 1299 | 68 | 699 | non exécuté | 475 | 129 | 150 seg / 58818 chemins | Final | Autre chemin classé premier |
| T474 | oui / ORACLE_INJECTED | non | P / P | c4 1.3004/1 ; c4 1.3333/1 | 630 | 307 | 126 | 546 | non exécuté | 210 | 103 | 169 seg / 97360 chemins | Final | Autre chemin classé premier |
| B529 | oui / ORACLE_INJECTED | non | P+R / P+R | c4 1.0836/2 ; c4 1.4677/2 | 190 | 9 | 6 | 157 | c5:0 | 32 | 29 | 29 seg / 39384 chemins | Final | Autre chemin classé premier |
| T558 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 5 | 5 | 5 | 10 | c5:5 | 35 | 28 | 28 seg / 37800 chemins | Final | Autre chemin classé premier |
| B611 | oui / ORACLE_INJECTED | non | P+R / P+R | c5 0.4218/3 ; c5 0.5470/2 | 55 | 34 | 21 | 58 | non exécuté | 43 | 28 | 34 seg / 45792 chemins | — | Winner |

### 009

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B190 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 1.2044/1 ; c1 1.2044/1 | 18 | 542 | 88 | 128 | non exécuté | 617 | 100 | 100 seg / 43889 chemins | Final | Autre chemin classé premier |
| T218 | oui / ORACLE_INJECTED | non | P / P | c1 0.5952/2 ; c1 0.5952/2 | 55 | 625 | 90 | 138 | non exécuté | 717 | 101 | 101 seg / 15356 chemins | Final | Autre chemin classé premier |
| B270 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 0.8526/10 ; c1 0.8526/10 | 233 | 852 | 122 | 261 | non exécuté | 1012 | 142 | 148 seg / 19195 chemins | Final | Autre chemin classé premier |
| T278 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 6 | 6 | 2 | 16 | c2:2; c3:2; c4:2; c5:2 | 56 | 15 | 15 seg / 3406 chemins | Final | Autre chemin classé premier |
| B348 | oui / ORACLE_INJECTED | non | P+Ac / P+Ac | c2 1.0375/1 ; c2 1.0375/1 | 1968 | 4562 | 113 | 2046 | non exécuté | 4325 | 112 | 138 seg / 24477 chemins | Final | Autre chemin classé premier |
| T373 | oui / ORACLE_INJECTED | non | P+R / P+R | c3 0.3718/3 ; c3 0.3718/3 | 827 | 496 | 66 | 847 | non exécuté | 392 | 49 | 73 seg / 13553 chemins | Final | Autre chemin classé premier |
| B423 | oui / ORACLE_INJECTED | non | Q+Ac / Q | — ; — | 485 | 3591 | 39 | 36 | c3:6; c4:6; c5:6 | 105 | 28 | 61 seg / 17028 chemins | Final | Autre chemin classé premier |
| T449 | oui / ORACLE_INJECTED | non | P+R / — | c4 0.9428/2 ; — | 708 | 149 | 30 | 0 | c4:0; c5:0 | 0 | 0 | 30 seg / 8504 chemins | Final | Autre chemin classé premier |
| B501 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 4 | 4 | 4 | 0 | c4:0; c5:0 | 0 | 0 | 4 seg / 480 chemins | Final | Autre chemin classé premier |
| T527 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | c5:0 | 0 | 0 | 0 seg / 0 chemins | L009 | Zéro repair, dernière voie épuisée |
| B578 | oui / ORACLE_INJECTED | non | P / P | c5 0.5000/1 ; c5 0.0309/1 | 10 | 4 | 2 | 26 | non exécuté | 8 | 4 | 4 seg / 7792 chemins | Final | Autre chemin classé premier |

### 010

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B177 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R+Ac | c1 1.2176/1 ; c1 1.2176/1 | 38 | 1606 | 24 | 264 | non exécuté | 4438 | 26 | 43 seg / 4796 chemins | Final | Autre chemin classé premier |
| T221 | oui / ORACLE_INJECTED | non | Q+R / Q+P+R | c3 -0.0390/5 ; c2 0.1273/3 | 120 | 120 | 29 | 444 | c1:18 | 989 | 292 | 295 seg / 11251 chemins | Final | Autre chemin classé premier |
| B269 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.7691/7 | 19 | 19 | 5 | 178 | c1:2 | 370 | 144 | 145 seg / 4930 chemins | Final | Autre chemin classé premier |
| T301 | oui / ORACLE_INJECTED | non | — / P+R+Ac | — ; c2 0.7623/2 | 0 | 0 | 0 | 3359 | non exécuté | 3043 | 203 | 203 seg / 5473 chemins | Final | Autre chemin classé premier |
| B348 | oui / ORACLE_INJECTED | non | — / Q+P | — ; c3 0.7730/2 | 0 | 0 | 0 | 923 | c2:4 | 523 | 158 | 158 seg / 5567 chemins | Final | Autre chemin classé premier |
| T377 | oui / ORACLE_INJECTED | non | — / P+R | — ; c3 0.8795/1 | 0 | 0 | 0 | 567 | non exécuté | 214 | 86 | 86 seg / 4028 chemins | Final | Autre chemin classé premier |
| B418 | oui / ORACLE_INJECTED | non | — / Q | — ; — | 0 | 0 | 0 | 12 | c3:4; c4:4 | 52 | 12 | 12 seg / 240 chemins | Final | Autre chemin classé premier |
| T445 | oui / ORACLE_INJECTED | non | R / — | c4 -1.5539/5 ; — | 14 | 14 | 7 | 0 | c4:0 | 0 | 0 | 7 seg / 0 chemins | D guard | Continuation valide encore en file |
| B487 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 10 | 10 | 5 | 0 | c4:0 | 0 | 0 | 5 seg / 0 chemins | D guard | Continuation valide encore en file |
| T517 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | non exécuté | 0 | 0 | 0 seg / 0 chemins | C4 guard | C5 jamais exécuté |
| B563 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | non exécuté | 0 | 0 | 0 seg / 0 chemins | C4 guard | C5 jamais exécuté |

## 4. Guards et qualité des segments

| Dataset | A guard / cycle | C guard / cycle | A états / segments essayés | C états / segments essayés | Segments A / C / C-only / union | D chemins | D tentatives | D guard |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | aucun / 5 | aucun / 5 | 50026 / 9472 | 52292 / 11714 | 648 / 695 / 351 / 999 | 200001 | 865082 | MAX_UNIQUE_PATHS |
| 009 | MAX_SEGMENTS / 5 | aucun / 5 | 56571 / 20001 | 52877 / 15739 | 781 / 830 / 219 / 1000 | 92738 | 1000001 | MAX_COMPOSITIONS |
| 010 | aucun / 5 | MAX_SEGMENTS / 4 | 87445 / 12296 | 67081 / 20001 | 684 / 1850 / 1677 / 2361 | 60679 | 1000001 | MAX_COMPOSITIONS |

FACT — Aucun MAX_STATES, TIMEOUT ni progressiveGuard dans ces runs. 009 A atteint MAX_SEGMENTS au cycle 5, fenêtre start=6, longueur=4. 010 C atteint MAX_SEGMENTS au cycle 4, fenêtre start=1, longueur=4. Le bloc progressif C4 continue ensuite et produit encore 423 lignes valides ; il reste limité aux positions 0..8. Le cycle 5 n’est pas exécuté.

## 5. Premières pertes : preuves et limites

### 007 — B262 : blocage de composition prouvé, première instruction UNKNOWN

FACT — B262 est rank 12 au cycle 1 (score 0.37077967389403776), mais reste accessible comme repair. Il devient ensuite Conditional (A cycle 5 ; C cycles 4/5), apparaît dans 4 reconstructions A, 56 C, 4 segments A et 12 C. Les 12 segments de l’union arrivent à D. Il subit 180 tentatives : 28 rejets structurels et 152 incompatibilités, aucun chemin D.

FACT — Tous les segments portant B262 terminent à la position 3. Le bootstrap conserve B299 à la position 4 : 299−262=37<45. Pour chacun des 12 segments, la recherche exhaustive dans la liste des segments précédents constate zéro segment compatible modifiant la position 4. D impose des indices de segments croissants et une validité complète à chaque application. Cela exclut B262 même si le guard D n’intervenait pas. Le certificat est enregistré dans proof-certificates.json.

INFERENCE — Le contexte extérieur à la portion extraite, notamment le BOTTOM de position 4 qui avait rendu les reconstructions locales valides, ne peut pas être rétabli à temps par D. Ce n’est PAS une perte définitive au rang 12, une absence de reconstruction, ou un D_GUARD. Catégorie factuelle : NOT_COMPOSED_BY_D. FIRST_LOSS_STAGE reste UNKNOWN : ce run ne localise pas la toute première instruction irréversible entre la fin de génération des alternatives, leur extraction et leur admission ordonnée dans D.

### 009 — T527 et T528 : dernière voie de repair épuisée en promotion C5

FACT — Au cycle 5 de A comme C, le suffixe courant est T507 B532 T554 B599. Remplacer T554 par T527 inverse l’ordre B532→T527. Aucune des 50 réparations directes à un voisin ne valide le préfixe. T527 est aussi essayé 48 fois comme partenaire d’autres cibles, sans succès. Même résultat pour T528. Aucun rôle Active/P/Q/R à la position 9, aucun segment A ou C antérieur, aucune présence dans le bootstrap.

La substitution directe invalide n’est pas encore une perte irréversible : la recherche suivante pourrait introduire T527 comme partenaire. La DERNIÈRE tentative dans C5 est le repair de B560, position 10, par T527 à la position 9 (trace order 8807 ; T528 order 8808). Elle échoue. La seule substitution évaluée ensuite est B578, valide directement ; elle ne recherche aucun repair. B599 est l’Active et est ignoré. Il n’existe plus de cycle après C5, et la reconstruction ne lit pas RAW. FIRST_LOSS_STAGE = C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL ; catégorie ZERO_ONE_NEIGHBOR_REPAIRS.

FACT — Les recherches diagnostiques postérieures trouvent au minimum 2 autres positions à changer pour intégrer T527 dans l’Active A5, et 4 dans C5, en autorisant le pool complet et en exigeant une chaîne complète valide. Ces coûts sont distincts de repairs.length, qui compte seulement les réparations à UN voisin réellement testées.

T449 et B501 ne sont jamais considérés par C (zéro repair dans ce contexte), mais survivent grâce à A : respectivement 30 et 4 segments A, puis 8 504 et 480 chemins D. Leur absence de C n’est donc pas une perte irréversible. B578 survit aussi au guard A et apparaît dans 7 792 chemins D.

### 010 — T517 et B563 : MAX_SEGMENTS dans C4

FACT — Dans A5, T517 a 106 trials de repair comme cible et 106 comme voisin, tous invalides ; B563 a 26 trials comme cible et 25 comme voisin, tous invalides. Aucun des deux n’entre dans une reconstruction ou un segment A. Le minimum diagnostique pour chacun est de 2 changements supplémentaires dans l’Active A5.

FACT — Dans C, la position 9 et la position 10 ne sont jamais ouvertes : MAX_SEGMENTS se déclenche au cycle 4 à 20 001 tentatives. Les deux candidats sont hors du préfixe 0..8, absents du bootstrap et des segments A. La phase progressive restante ne peut pas les assigner et le guard supprime le cycle 5. FIRST_LOSS_STAGE = C_RECONSTRUCTION_C4_MAX_SEGMENTS ; catégorie MAX_SEGMENTS. Affirmer ZERO_ONE_NEIGHBOR_REPAIRS dans C serait faux : la recherche n’y a pas été exécutée.

### 010 — T445 et B487 : D_GUARD démontré par une continuation en attente

FACT — A conserve T445 comme repair malgré son rang direct 5, et B487 comme Conditional avec 5 repairs. T445 apparaît dans 14 reconstructions / 7 segments A ; B487 dans 10 / 5. Tous ces segments arrivent dans l’union D. Les tentatives observées sont structurellement invalides : 3 304 pour T445, 2 360 pour B487. Cela seul ne prouverait pas l’irréversibilité.

Preuve supplémentaire prise après la boucle de recherche, sans aucune insertion : l’état réellement présent à queue[1223], issu de S2253, peut recevoir S2323 avec un index croissant, sans conflit d’assignments et avec validatePath=true. Le chemin serait B217 T291 B333 T365 B385 T403 B436 T445 B487 T531 B589. Il est absent de uniquePaths. Cette continuation est encore légale lorsque MAX_COMPOSITIONS arrête D. FIRST_LOSS_STAGE = D_GUARD. Les autres options oracle T446, B488 et B489 ont la même preuve de continuation disponible.

## 6. Pourquoi 007 atteint 10/11

FACT — Un unique chemin D atteint 10/11, au rang combiné 148 598 sur 200 001 : B169 T199 B228 T291 B353 T383 B445 T474 B529 T558 B611. Le winner est B169 T199 B243 T291 B346 T383 B438 T467 B511 T555 B611, soit 5/11. Le score final sélectionne un autre chemin ; il ne mesure pas la GT.

Le chemin à 10/11 est construit par trois segments réellement disponibles : S0002=T199 (A+C), S0728=B353 T383 B445 T474 (A cycle 4), S0946=B529 T558 B611 (C cycle 5). B169 et T291 sont hérités du bootstrap. La seed T558+B611 est admissible ; C étend ensuite à gauche avec B529, déjà Promising depuis le cycle 4. Cette continuité locale existe dans 007.

Dans 009, T527 ne possède aucune seed à un voisin. Il manque aussi dans tous les segments, ce qui interdit 11/11 avant D. Dans 010, C réintroduit T301/B348/T377/B418 que A n’avait jamais reconstruits, mais s’arrête avant T517/B563 ; deux autres witnesses (T445/B487) sont ensuite perdus au guard D. Ce sont des mécanismes distincts : aucune cause unique “C mauvais” n’est justifiée.

## 7. Première différence observable et profondeur des corrections

FACT — La première différence est déjà dans l’entrée : 007 a 2 pivots exacts du bootstrap, 009 et 010 en ont 0. L’écart moyen au witness est 29.818 / 30.545 / 44.273 samples. 009 n’est donc pas nettement plus éloigné en moyenne que 007 ; cette moyenne ne suffit pas à expliquer l’écart de résultat.

FACT — Le sens des écarts diffère aussi : les 9 pivots non exacts de 007 sont tous avant leur cible ; les 11 pivots de 009 et les 11 de 010 sont tous après leur witness. Cela décrit les entrées mesurées ; aucune causalité indépendante de ce décalage n’est affirmée sans expérience supplémentaire.

À la première promotion : 007 conserve B169 Active et admet T199 rang 2 ; 009 admet B190 rang 1 et T218 rang 2 (pas de faiblesse générale de promotion) ; 010 doit déjà passer par Conditional pour T221 (221−217=4<8) et B269 (avant T291 du bootstrap). Les dépendances structurelles apparaissent plus tôt dans 010. Dans 009, la divergence A/C devient concrète après le cycle 3 : A choisit T374/B423, C reste inchangé sur égalité. Au cycle 4, A peut alors admettre T449 et réparer B501 ; C ne le peut pas.

Nombre MINIMAL de positions supplémentaires à changer pour intégrer chaque witness dans le bootstrap complet, pool augmenté libre, indépendamment des limites A/C. Ce diagnostic exhaustif par programmation dynamique est post-décision ; il ne modifie aucun chemin de production :

| Position | 007 candidat / changements supplémentaires | 009 candidat / changements supplémentaires | 010 candidat / changements supplémentaires |
| --- | --- | --- | --- |
| 0 | B169 / 0 | B190 / 0 | B177 / 0 |
| 1 | T199 / 0 | T218 / 0 | T221 / 1 |
| 2 | B262 / 1 | B270 / 0 | B269 / 1 |
| 3 | T291 / 0 | T278 / 1 | T301 / 2 |
| 4 | B353 / 2 | B348 / 0 | B348 / 3 |
| 5 | T383 / 0 | T373 / 0 | T377 / 4 |
| 6 | B445 / 0 | B423 / 1 | B418 / 4 |
| 7 | T474 / 0 | T449 / 2 | T445 / 2 |
| 8 | B529 / 2 | B501 / 3 | B487 / 3 |
| 9 | T558 / 1 | T527 / 4 | T517 / 2 |
| 10 | B611 / 0 | B578 / 0 | B563 / 2 |

INFERENCE — Le facteur explicatif est la compatibilité des corrections avec les contextes effectivement atteints, puis leur disponibilité en segments composables, pas seulement le nombre de candidats RAW ni leur qualité isolée. Les minima ci-dessus sont globaux : “1 autre changement” peut porter sur un voisin non adjacent, et ne garantit donc pas une repair legacy.

## 8. Comptabilité des pertes irréversibles

Les cases comptent des witnesses à leur position correcte, une seule fois, au premier stade prouvé. “0 prouvé” ne transforme pas un UNKNOWN en preuve d’absence. A et C sont indépendants : il n’existe pas de transfert de l’Active A vers C.

| Dataset | Avant A | Dans A | Entre A et C | Promotion C | Reconstruction/guard C | Après C avant D | D guard | UNKNOWN extraction/D | Sélection finale parmi survivants D | Winner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 007 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 5 |
| 009 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 10 | 0 |
| 010 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 7 | 0 |

Pour toutes les options oracle (pas seulement les witnesses) : 007 = 1 UNKNOWN, 5 exclusions finales, 5 winners ; 009 = 2 pertes d’admission C5, 16 exclusions finales, 1 winner ; 010 = 2 pertes au guard C4, 5 au guard D, 39 exclusions finales, 0 winner. Ces totaux portent respectivement sur 11, 19 et 46 candidats.

UNKNOWN — Pour B262, la première instruction irréversible n’est pas identifiée malgré la preuve du blocage structurel D. Aucun effet causal de déduplication n’est attribué sans preuve. Le potentiel d’amélioration du nombre de pivots conjointement compatibles au-delà des populations D générées n’est pas mesuré par un changement de budgets.

## 9. Toutes les options oracle — tableaux complets

### 007 — 11 candidats

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B169 | oui / BOTH | oui | Ac / Ac | — ; — | 14 | 2649 | 0 | 85 | non exécuté | 3402 | 0 | 0 seg / 200001 chemins | — | Winner |
| T199 | oui / ORACLE_INJECTED | non | P / P | c1 -0.4164/2 ; c1 -0.4164/2 | 27 | 145 | 29 | 123 | non exécuté | 309 | 72 | 77 seg / 71828 chemins | — | Winner |
| B262 | oui / ORACLE_INJECTED | non | R+Q / R+Q | c1 0.3708/12 ; c1 0.3708/12 | 14 | 4 | 4 | 36 | c2:0; c3:0; c4:4; c5:4 | 56 | 12 | 12 seg / 0 chemins | UNKNOWN | B299−B262=37<45 ; ordre D |
| T291 | oui / BOTH | oui | Ac+P+R / Ac+R+P | c5 -0.1438/3 ; c4 -0.1451/4 | 247 | 708 | 109 | 291 | non exécuté | 415 | 97 | 151 seg / 92135 chemins | — | Winner |
| B353 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R+Ac | c2 0.7516/3 ; c2 0.7516/3 | 534 | 1071 | 88 | 1006 | c3:0 | 1606 | 91 | 158 seg / 54796 chemins | Final | Autre chemin classé premier |
| T383 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R | c3 0.5685/3 ; c3 0.5685/3 | 812 | 1109 | 88 | 871 | non exécuté | 425 | 71 | 117 seg / 39730 chemins | — | Winner |
| B445 | oui / ORACLE_INJECTED | non | R+P+Ac / R+P | c3 0.7738/4 ; c3 0.7738/4 | 773 | 1299 | 68 | 699 | non exécuté | 475 | 129 | 150 seg / 58818 chemins | Final | Autre chemin classé premier |
| T474 | oui / ORACLE_INJECTED | non | P / P | c4 1.3004/1 ; c4 1.3333/1 | 630 | 307 | 126 | 546 | non exécuté | 210 | 103 | 169 seg / 97360 chemins | Final | Autre chemin classé premier |
| B529 | oui / ORACLE_INJECTED | non | P+R / P+R | c4 1.0836/2 ; c4 1.4677/2 | 190 | 9 | 6 | 157 | c5:0 | 32 | 29 | 29 seg / 39384 chemins | Final | Autre chemin classé premier |
| T558 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 5 | 5 | 5 | 10 | c5:5 | 35 | 28 | 28 seg / 37800 chemins | Final | Autre chemin classé premier |
| B611 | oui / ORACLE_INJECTED | non | P+R / P+R | c5 0.4218/3 ; c5 0.5470/2 | 55 | 34 | 21 | 58 | non exécuté | 43 | 28 | 34 seg / 45792 chemins | — | Winner |

### 009 — 19 candidats

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B190 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 1.2044/1 ; c1 1.2044/1 | 18 | 542 | 88 | 128 | non exécuté | 617 | 100 | 100 seg / 43889 chemins | Final | Autre chemin classé premier |
| B191 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 1.1131/2 ; c1 1.1131/2 | 18 | 542 | 88 | 128 | non exécuté | 589 | 96 | 96 seg / 24457 chemins | Final | Autre chemin classé premier |
| T218 | oui / ORACLE_INJECTED | non | P / P | c1 0.5952/2 ; c1 0.5952/2 | 55 | 625 | 90 | 138 | non exécuté | 717 | 101 | 101 seg / 15356 chemins | Final | Autre chemin classé premier |
| T219 | oui / ORACLE_INJECTED | non | P+Ac / P+Ac | c1 0.8186/1 ; c1 0.8186/1 | 91 | 3964 | 54 | 240 | non exécuté | 3943 | 79 | 79 seg / 10817 chemins | — | Winner |
| B270 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 0.8526/10 ; c1 0.8526/10 | 233 | 852 | 122 | 261 | non exécuté | 1012 | 142 | 148 seg / 19195 chemins | Final | Autre chemin classé premier |
| B271 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 0.8722/9 ; c1 0.8722/9 | 230 | 849 | 121 | 253 | non exécuté | 989 | 136 | 142 seg / 17194 chemins | Final | Autre chemin classé premier |
| B272 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R+Ac | c1 0.8845/8 ; c1 0.8845/8 | 419 | 3235 | 74 | 457 | non exécuté | 2985 | 88 | 88 seg / 11917 chemins | Final | Autre chemin classé premier |
| T277 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 3 | 3 | 1 | 8 | c2:1; c3:1; c4:1; c5:1 | 28 | 8 | 8 seg / 1639 chemins | Final | Autre chemin classé premier |
| T278 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 6 | 6 | 2 | 16 | c2:2; c3:2; c4:2; c5:2 | 56 | 15 | 15 seg / 3406 chemins | Final | Autre chemin classé premier |
| B348 | oui / ORACLE_INJECTED | non | P+Ac / P+Ac | c2 1.0375/1 ; c2 1.0375/1 | 1968 | 4562 | 113 | 2046 | non exécuté | 4325 | 112 | 138 seg / 24477 chemins | Final | Autre chemin classé premier |
| T373 | oui / ORACLE_INJECTED | non | P+R / P+R | c3 0.3718/3 ; c3 0.3718/3 | 827 | 496 | 66 | 847 | non exécuté | 392 | 49 | 73 seg / 13553 chemins | Final | Autre chemin classé premier |
| T374 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R | c3 0.6883/1 ; c3 0.6883/1 | 1397 | 3269 | 44 | 847 | non exécuté | 395 | 52 | 63 seg / 10830 chemins | Final | Autre chemin classé premier |
| B423 | oui / ORACLE_INJECTED | non | Q+Ac / Q | — ; — | 485 | 3591 | 39 | 36 | c3:6; c4:6; c5:6 | 105 | 28 | 61 seg / 17028 chemins | Final | Autre chemin classé premier |
| T449 | oui / ORACLE_INJECTED | non | P+R / — | c4 0.9428/2 ; — | 708 | 149 | 30 | 0 | c4:0; c5:0 | 0 | 0 | 30 seg / 8504 chemins | Final | Autre chemin classé premier |
| B501 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 4 | 4 | 4 | 0 | c4:0; c5:0 | 0 | 0 | 4 seg / 480 chemins | Final | Autre chemin classé premier |
| B502 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 4 | 4 | 4 | 0 | c4:0; c5:0 | 0 | 0 | 4 seg / 480 chemins | Final | Autre chemin classé premier |
| T527 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | c5:0 | 0 | 0 | 0 seg / 0 chemins | L009 | Zéro repair, dernière voie épuisée |
| T528 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | c5:0 | 0 | 0 | 0 seg / 0 chemins | L009 | Zéro repair, dernière voie épuisée |
| B578 | oui / ORACLE_INJECTED | non | P / P | c5 0.5000/1 ; c5 0.0309/1 | 10 | 4 | 2 | 26 | non exécuté | 8 | 4 | 4 seg / 7792 chemins | Final | Autre chemin classé premier |

### 010 — 46 candidats

| Candidate | Pool / source | Bootstrap | Promotion class A / C | Promotion score/rank A ; C | A considered | A reconstruction | A segment | C considered | C repairs | C reconstruction | C segment | D | First loss | Exact reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B177 | oui / ORACLE_INJECTED | non | P+R+Ac / P+R+Ac | c1 1.2176/1 ; c1 1.2176/1 | 38 | 1606 | 24 | 264 | non exécuté | 4438 | 26 | 43 seg / 4796 chemins | Final | Autre chemin classé premier |
| B178 | oui / ORACLE_INJECTED | non | R+P / R | c1 1.1711/5 ; c1 1.1711/5 | 24 | 254 | 49 | 21 | non exécuté | 9 | 4 | 49 seg / 3612 chemins | Final | Autre chemin classé premier |
| B179 | oui / ORACLE_INJECTED | non | R+P / R+P | c1 1.1789/4 ; c1 1.1789/4 | 24 | 254 | 49 | 132 | non exécuté | 569 | 171 | 211 seg / 6014 chemins | Final | Autre chemin classé premier |
| B180 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 1.1946/2 ; c1 1.1946/2 | 29 | 294 | 60 | 153 | non exécuté | 617 | 179 | 225 seg / 6309 chemins | Final | Autre chemin classé premier |
| B181 | oui / ORACLE_INJECTED | non | R / R+P | c1 1.1678/6 ; c1 1.1678/6 | 15 | 15 | 3 | 58 | non exécuté | 248 | 109 | 109 seg / 3573 chemins | Final | Autre chemin classé premier |
| B182 | oui / ORACLE_INJECTED | non | P+R / P+R | c1 1.1790/3 ; c1 1.1790/3 | 29 | 294 | 60 | 153 | non exécuté | 560 | 168 | 217 seg / 6236 chemins | Final | Autre chemin classé premier |
| B183 | oui / ORACLE_INJECTED | non | R / R | c1 1.1556/7 ; c1 1.1556/7 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B184 | oui / ORACLE_INJECTED | non | R / R | c1 1.1485/8 ; c1 1.1485/8 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B185 | oui / ORACLE_INJECTED | non | R / R | c1 1.1259/10 ; c1 1.1259/10 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B186 | oui / ORACLE_INJECTED | non | R / R | c1 1.1304/9 ; c1 1.1304/9 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B187 | oui / ORACLE_INJECTED | non | R / R | c1 1.1230/11 ; c1 1.1230/11 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B188 | oui / ORACLE_INJECTED | non | R / R | c1 1.1011/14 ; c1 1.1011/14 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B189 | oui / ORACLE_INJECTED | non | R / R | c1 1.0935/15 ; c1 1.0935/15 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B190 | oui / ORACLE_INJECTED | non | R+P / R | c1 1.1076/12 ; c1 1.1076/12 | 18 | 118 | 49 | 21 | non exécuté | 9 | 4 | 49 seg / 3612 chemins | Final | Autre chemin classé premier |
| B191 | oui / ORACLE_INJECTED | non | R / R+P | c1 1.1035/13 ; c1 1.1035/13 | 15 | 15 | 3 | 95 | non exécuté | 427 | 109 | 109 seg / 6442 chemins | Final | Autre chemin classé premier |
| B192 | oui / ORACLE_INJECTED | non | R / R | c1 1.0577/17 ; c1 1.0577/17 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1540 chemins | Final | Autre chemin classé premier |
| B193 | oui / ORACLE_INJECTED | non | R / R | c1 1.0461/18 ; c1 1.0461/18 | 15 | 15 | 3 | 21 | non exécuté | 9 | 4 | 4 seg / 1354 chemins | Final | Autre chemin classé premier |
| B194 | oui / ORACLE_INJECTED | non | R+P / R | c1 1.0634/16 ; c1 1.0634/16 | 21 | 189 | 49 | 21 | non exécuté | 9 | 4 | 49 seg / 2485 chemins | Final | Autre chemin classé premier |
| T221 | oui / ORACLE_INJECTED | non | Q+R / Q+P+R | c3 -0.0390/5 ; c2 0.1273/3 | 120 | 120 | 29 | 444 | c1:18 | 989 | 292 | 295 seg / 11251 chemins | Final | Autre chemin classé premier |
| T222 | oui / ORACLE_INJECTED | non | Q+R+P / Q+P+R | c3 0.3604/4 ; c2 0.5916/2 | 153 | 275 | 85 | 444 | c1:18 | 1062 | 328 | 386 seg / 11627 chemins | Final | Autre chemin classé premier |
| B269 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.7691/7 | 19 | 19 | 5 | 178 | c1:2 | 370 | 144 | 145 seg / 4930 chemins | Final | Autre chemin classé premier |
| B270 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.7736/6 | 19 | 19 | 5 | 178 | c1:2 | 343 | 130 | 131 seg / 4709 chemins | Final | Autre chemin classé premier |
| B271 | oui / ORACLE_INJECTED | non | Q / Q+P+Ac | — ; c2 0.9315/1 | 19 | 19 | 5 | 769 | c1:2 | 2424 | 228 | 228 seg / 4415 chemins | Final | Autre chemin classé premier |
| B272 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.8598/5 | 19 | 19 | 5 | 332 | c1:2 | 737 | 195 | 196 seg / 6370 chemins | Final | Autre chemin classé premier |
| B273 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.9167/3 | 19 | 19 | 5 | 449 | c1:2 | 968 | 265 | 265 seg / 6881 chemins | Final | Autre chemin classé premier |
| B274 | oui / ORACLE_INJECTED | non | Q / Q | — ; c2 0.8850/4 | 19 | 19 | 5 | 14 | c1:2 | 30 | 10 | 13 seg / 932 chemins | Final | Autre chemin classé premier |
| B275 | oui / ORACLE_INJECTED | non | Q / Q+P | — ; c2 0.9221/2 | 19 | 19 | 5 | 449 | c1:2 | 933 | 245 | 245 seg / 6768 chemins | Final | Autre chemin classé premier |
| B276 | oui / ORACLE_INJECTED | non | Q / Q+Ac | — ; c3 0.7173/7 | 19 | 19 | 5 | 131 | c1:2 | 269 | 57 | 60 seg / 1151 chemins | Final | Autre chemin classé premier |
| T301 | oui / ORACLE_INJECTED | non | — / P+R+Ac | — ; c2 0.7623/2 | 0 | 0 | 0 | 3359 | non exécuté | 3043 | 203 | 203 seg / 5473 chemins | Final | Autre chemin classé premier |
| B348 | oui / ORACLE_INJECTED | non | — / Q+P | — ; c3 0.7730/2 | 0 | 0 | 0 | 923 | c2:4 | 523 | 158 | 158 seg / 5567 chemins | Final | Autre chemin classé premier |
| B349 | oui / ORACLE_INJECTED | non | — / Q+P | — ; c3 0.7954/1 | 0 | 0 | 0 | 928 | c2:5 | 641 | 199 | 199 seg / 7645 chemins | Final | Autre chemin classé premier |
| B350 | oui / ORACLE_INJECTED | non | — / Q+Ac | — ; — | 0 | 0 | 0 | 928 | c2:5 | 4108 | 93 | 93 seg / 5957 chemins | Final | Autre chemin classé premier |
| T377 | oui / ORACLE_INJECTED | non | — / P+R | — ; c3 0.8795/1 | 0 | 0 | 0 | 567 | non exécuté | 214 | 86 | 86 seg / 4028 chemins | Final | Autre chemin classé premier |
| B418 | oui / ORACLE_INJECTED | non | — / Q | — ; — | 0 | 0 | 0 | 12 | c3:4; c4:4 | 52 | 12 | 12 seg / 240 chemins | Final | Autre chemin classé premier |
| B419 | oui / ORACLE_INJECTED | non | — / Q | — ; — | 0 | 0 | 0 | 12 | c3:4; c4:4 | 52 | 12 | 12 seg / 240 chemins | Final | Autre chemin classé premier |
| T445 | oui / ORACLE_INJECTED | non | R / — | c4 -1.5539/5 ; — | 14 | 14 | 7 | 0 | c4:0 | 0 | 0 | 7 seg / 0 chemins | D guard | Continuation valide encore en file |
| T446 | oui / ORACLE_INJECTED | non | P+R / — | c4 0.0234/3 ; — | 216 | 38 | 9 | 0 | c4:0 | 0 | 0 | 9 seg / 0 chemins | D guard | Continuation valide encore en file |
| B487 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 10 | 10 | 5 | 0 | c4:0 | 0 | 0 | 5 seg / 0 chemins | D guard | Continuation valide encore en file |
| B488 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 10 | 10 | 5 | 0 | c4:0 | 0 | 0 | 5 seg / 0 chemins | D guard | Continuation valide encore en file |
| B489 | oui / ORACLE_INJECTED | non | Q / — | — ; — | 10 | 10 | 5 | 0 | c4:0 | 0 | 0 | 5 seg / 0 chemins | D guard | Continuation valide encore en file |
| B490 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 10 | 10 | 5 | 3 | c4:3 | 12 | 12 | 14 seg / 2826 chemins | Final | Autre chemin classé premier |
| B491 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 10 | 10 | 5 | 3 | c4:3 | 12 | 12 | 14 seg / 2826 chemins | Final | Autre chemin classé premier |
| B492 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 10 | 10 | 5 | 3 | c4:3 | 12 | 12 | 14 seg / 2826 chemins | Final | Autre chemin classé premier |
| B493 | oui / ORACLE_INJECTED | non | Q / Q | — ; — | 10 | 10 | 5 | 3 | c4:3 | 12 | 12 | 14 seg / 2826 chemins | Final | Autre chemin classé premier |
| T517 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | non exécuté | 0 | 0 | 0 seg / 0 chemins | C4 guard | C5 jamais exécuté |
| B563 | oui / ORACLE_INJECTED | non | — / — | — ; — | 0 | 0 | 0 | 0 | non exécuté | 0 | 0 | 0 seg / 0 chemins | C4 guard | C5 jamais exécuté |

## 10. Chronologie complète, candidat par candidat

Les valeurs numériques complètes sont dans les CSV/JSON (pas d’arrondi décisionnel). “Hors préfixe” et “Active non évalué” ne signifient pas rejet. Available décrit les Maps au début de reconstruction ; considered désigne les parcours effectifs. repairs=— signifie fonction non exécutée pour cette cible/cycle, pas zéro.

### 007 / position 0 / B169 — witness

SOURCE=BOTH. Bootstrap=oui. Disponible A/C=oui/oui. Dans best D=oui ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | non | — | Active | — | — | non | — | — |
| A | 2 | non | — | Active | — | — | non | — | — |
| A | 3 | non | — | Active | — | — | non | — | — |
| A | 4 | non | — | Active | — | — | non | — | — |
| A | 5 | non | — | Active | — | — | non | — | — |
| C | 1 | non | — | Active | — | — | non | — | — |
| C | 2 | non | — | Active | — | — | non | — | — |
| C | 3 | non | — | Active | — | — | non | — | — |
| C | 4 | non | — | Active | — | — | non | — | — |
| C | 5 | non | — | Active | — | — | non | — | — |

### 007 / position 1 / T199 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising | -0.41638225255972666 | 2 | oui | — | — |
| A | 2 | oui | oui | Promising | -0.4163822525597319 | 2 | oui | — | — |
| A | 3 | oui | oui | Promising | -0.4256585881410075 | 2 | oui | — | — |
| A | 4 | oui | oui | Promising | 0.41568672230291576 | 1 | oui | — | — |
| A | 5 | oui | oui | Promising | -0.12048434608316205 | 2 | oui | — | — |
| C | 1 | oui | oui | Promising | -0.41638225255972666 | 2 | oui | — | — |
| C | 2 | oui | oui | Promising | -0.4163822525597319 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising | -0.4256585881410075 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising | 0.56400968215089 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising | 0.5119824441261347 | 1 | oui | — | — |

### 007 / position 2 / B262 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=UNKNOWN. 12 exported B262 segments stop at slot 3. Bootstrap slot 4=B299 gives 299-262=37<45. No earlier compatible segment can change slot 4. Ordered composition + intermediate validity excludes B262 even without the guard. Earliest irreversible instruction between final reconstruction/extraction/D admission is not established; FIRST_LOSS remains UNKNOWN, not LOW_RANK or D_GUARD.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 0.37077967389403776 | 12 | non | — | — |
| A | 2 | oui | non | Repair | — | — | non | 0 | — |
| A | 3 | oui | non | Repair | — | — | non | 0 | — |
| A | 4 | oui | non | Repair | — | — | non | 0 | — |
| A | 5 | oui | non | Repair+Conditional | — | — | non | 4 | 3:T291; 3:T317; 3:T333; 3:T345 |
| C | 1 | oui | oui | Repair | 0.37077967389403776 | 12 | non | — | — |
| C | 2 | oui | non | Repair | — | — | non | 0 | — |
| C | 3 | oui | non | Repair | — | — | non | 0 | — |
| C | 4 | oui | non | Repair+Conditional | — | — | non | 4 | 3:T291; 3:T317; 3:T333; 3:T345 |
| C | 5 | oui | non | Repair+Conditional | — | — | non | 4 | 3:T291; 3:T317; 3:T333; 3:T345 |

### 007 / position 3 / T291 — witness

SOURCE=BOTH. Bootstrap=oui. Disponible A/C=oui/oui. Dans best D=oui ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | non | — | Active | — | — | non | — | — |
| A | 3 | non | — | Active | — | — | non | — | — |
| A | 4 | non | — | Active | — | — | non | — | — |
| A | 5 | oui | oui | Promising+Repair | -0.14383121923868847 | 3 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | non | — | Active | — | — | non | — | — |
| C | 3 | non | — | Active | — | — | non | — | — |
| C | 4 | oui | oui | Repair | -0.14514842927110605 | 4 | non | — | — |
| C | 5 | oui | oui | Promising+Repair | 0.10137741262918287 | 3 | oui | — | — |

### 007 / position 4 / B353 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | oui | Promising+Repair | 0.7515916133364602 | 3 | oui | — | — |
| A | 3 | oui | non | Promising+Repair | — | — | non | 0 | — |
| A | 4 | oui | oui | Promising+Repair | 1.3569485171881355 | 1 | oui | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 0.7515916133364602 | 3 | oui | — | — |
| C | 3 | oui | non | Promising+Repair | — | — | non | 0 | — |
| C | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |

### 007 / position 5 / T383 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | oui | Promising+Repair | 0.5685157814492106 | 3 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 1.2418377734940265 | 1 | oui | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.5685157814492106 | 3 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.5129443729589893 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 1.5361962240228455 | 1 | oui | — | — |

### 007 / position 6 / B445 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | oui | Repair | 0.7738383196555898 | 4 | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.1337448559670782 | 1 | oui | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | oui | Repair | 0.7738383196555898 | 4 | non | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.4670781893004115 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 1.2777777777777777 | 1 | oui | — | — |

### 007 / position 7 / T474 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | oui | Promising | 1.3004115226337447 | 1 | oui | — | — |
| A | 5 | oui | oui | Promising | -0.03292181069958844 | 1 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | oui | Promising | 1.3333333333333333 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising | 1.3333333333333333 | 1 | oui | — | — |

### 007 / position 8 / B529 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 1.0835607602715442 | 2 | oui | — | — |
| A | 5 | oui | non | Promising+Repair | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.4676708415535327 | 2 | oui | — | — |
| C | 5 | oui | non | Promising+Repair | — | — | non | 0 | — |

### 007 / position 9 / T558 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 10:B585; 10:B595; 10:B609; 10:B611; 10:B641 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |
| C | 5 | oui | non | Conditional | — | — | non | 5 | 10:B585; 10:B595; 10:B609; 10:B611; 10:B641 |

### 007 / position 10 / B611 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.42182200985728546 | 3 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |
| C | 5 | oui | oui | Promising+Repair | 0.547031297092336 | 2 | oui | — | — |

### 009 / position 0 / B190 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising+Repair | 1.204374435562492 | 1 | oui | — | — |
| A | 2 | oui | oui | Promising+Repair | 1.204374435562494 | 1 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.2398490187476718 | 1 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 2.1529159349932514 | 1 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 1.8540335881034642 | 2 | oui | — | — |
| C | 1 | oui | oui | Promising+Repair | 1.204374435562492 | 1 | oui | — | — |
| C | 2 | oui | oui | Promising+Repair | 1.204374435562494 | 1 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 1.2398490187476718 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 2.1136388273079607 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 1.434677093002989 | 1 | oui | — | — |

### 009 / position 0 / B191

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising+Repair | 1.1131233066874757 | 2 | oui | — | — |
| A | 2 | oui | oui | Promising+Repair | 1.113123306687482 | 2 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.1484384674008887 | 2 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 1.8897350266352948 | 2 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 2.383617220880306 | 1 | oui | — | — |
| C | 1 | oui | oui | Promising+Repair | 1.1131233066874757 | 2 | oui | — | — |
| C | 2 | oui | oui | Promising+Repair | 1.113123306687482 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 1.1484384674008887 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.8433693524292956 | 2 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 1.06538114318339 | 2 | oui | — | — |

### 009 / position 1 / T218 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising | 0.5951847704367301 | 2 | oui | — | — |
| A | 2 | oui | oui | Promising | 0.5951847704367301 | 2 | oui | — | — |
| A | 3 | oui | oui | Promising | 0.5951847704367301 | 1 | oui | — | — |
| A | 4 | oui | oui | Promising | 0.37140095993659805 | 2 | oui | — | — |
| A | 5 | oui | oui | Promising | 0.4102837112207609 | 2 | oui | — | — |
| C | 1 | oui | oui | Promising | 0.5951847704367301 | 2 | oui | — | — |
| C | 2 | oui | oui | Promising | 0.5951847704367301 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising | 0.5951847704367301 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising | 0.09305996332843197 | 2 | oui | — | — |
| C | 5 | oui | oui | Promising | 0.29912802186882825 | 2 | oui | — | — |

### 009 / position 1 / T219

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=oui. FIRST_LOSS_STAGE=NONE. Present in final winner.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising | 0.8185890257558791 | 1 | oui | — | — |
| A | 2 | oui | oui | Promising | 0.8185890257558791 | 1 | oui | — | — |
| A | 3 | non | — | Active+Promising | — | — | non | — | — |
| A | 4 | non | — | Active+Promising | — | — | non | — | — |
| A | 5 | non | — | Active+Promising | — | — | non | — | — |
| C | 1 | oui | oui | Promising | 0.8185890257558791 | 1 | oui | — | — |
| C | 2 | oui | oui | Promising | 0.8185890257558791 | 1 | oui | — | — |
| C | 3 | non | — | Active+Promising | — | — | non | — | — |
| C | 4 | non | — | Active+Promising | — | — | non | — | — |
| C | 5 | non | — | Active+Promising | — | — | non | — | — |

### 009 / position 2 / B270 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | — | 0.8525589444692795 | 10 | non | — | — |
| A | 2 | oui | oui | Promising+Repair | 0.8201743979653415 | 3 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 0.7944109006401289 | 2 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 1.6391052621475677 | 2 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 1.00749525236711 | 2 | oui | — | — |
| C | 1 | oui | oui | — | 0.8525589444692795 | 10 | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 0.8201743979653415 | 3 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.7944109006401289 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.55565055312826 | 1 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 0.8726914292132371 | 2 | oui | — | — |

### 009 / position 2 / B271

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | — | 0.8722001044435348 | 9 | non | — | — |
| A | 2 | oui | oui | Promising+Repair | 0.8440299325949852 | 2 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 0.8110281087055407 | 1 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 1.6503403323191321 | 1 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 1.1224695532563933 | 1 | oui | — | — |
| C | 1 | oui | oui | — | 0.8722001044435348 | 9 | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 0.8440299325949852 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.8110281087055407 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.547211084224733 | 2 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 1.0517186622037926 | 1 | oui | — | — |

### 009 / position 2 / B272

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | — | 0.884457714535447 | 8 | non | — | — |
| A | 2 | oui | oui | Promising+Repair | 0.8547874428031648 | 1 | oui | — | — |
| A | 3 | non | — | Active+Promising+Repair | — | — | non | — | — |
| A | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | oui | oui | — | 0.884457714535447 | 8 | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 0.8547874428031648 | 1 | oui | — | — |
| C | 3 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |

### 009 / position 3 / T277

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| A | 3 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| A | 4 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| A | 5 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| C | 3 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| C | 4 | oui | non | Conditional | — | — | non | 1 | 2:B249 |
| C | 5 | oui | non | Conditional | — | — | non | 1 | 2:B249 |

### 009 / position 3 / T278 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| A | 3 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| A | 4 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| A | 5 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| C | 3 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| C | 4 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |
| C | 5 | oui | non | Conditional | — | — | non | 2 | 2:B249; 2:B270 |

### 009 / position 4 / B348 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | oui | Promising | 1.0375328619173 | 1 | oui | — | — |
| A | 3 | non | — | Active+Promising | — | — | non | — | — |
| A | 4 | non | — | Active+Promising | — | — | non | — | — |
| A | 5 | non | — | Active+Promising | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | oui | Promising | 1.0375328619173 | 1 | oui | — | — |
| C | 3 | non | — | Active+Promising | — | — | non | — | — |
| C | 4 | non | — | Active+Promising | — | — | non | — | — |
| C | 5 | non | — | Active+Promising | — | — | non | — | — |

### 009 / position 5 / T373 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | oui | Promising+Repair | 0.3718308893803422 | 3 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.5885077734596958 | 1 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.6407385310773517 | 1 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.3718308893803422 | 3 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 0.24272760959445247 | 4 | non | — | — |
| C | 5 | oui | oui | Promising+Repair | 0.2913314917183224 | 3 | oui | — | — |

### 009 / position 5 / T374

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | oui | Promising+Repair | 0.6882961461779256 | 1 | oui | — | — |
| A | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.6882961461779256 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 0.6041713374673934 | 2 | oui | — | — |
| C | 5 | oui | oui | Promising+Repair | 0.6555123813672863 | 2 | oui | — | — |

### 009 / position 6 / B423 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | non | Conditional | — | — | non | 6 | 5:T360; 5:T373; 5:T374; 5:T381; 5:T390; 5:T413 |
| A | 4 | non | — | Active+Conditional | — | — | non | — | — |
| A | 5 | non | — | Active+Conditional | — | — | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | non | Conditional | — | — | non | 6 | 5:T360; 5:T373; 5:T374; 5:T381; 5:T390; 5:T413 |
| C | 4 | oui | non | Conditional | — | — | non | 6 | 5:T360; 5:T373; 5:T374; 5:T381; 5:T390; 5:T413 |
| C | 5 | oui | non | Conditional | — | — | non | 6 | 5:T360; 5:T373; 5:T374; 5:T381; 5:T390; 5:T413 |

### 009 / position 7 / T449 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.9428194986442132 | 2 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.9236849692817112 | 2 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |
| C | 5 | oui | non | — | — | — | non | 0 | — |

### 009 / position 8 / B501 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 4 | 7:T431; 7:T449; 7:T463; 7:T477 |
| A | 5 | oui | non | Conditional | — | — | non | 4 | 7:T431; 7:T449; 7:T463; 7:T477 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |
| C | 5 | oui | non | — | — | — | non | 0 | — |

### 009 / position 8 / B502

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 4 | 7:T431; 7:T449; 7:T463; 7:T477 |
| A | 5 | oui | non | Conditional | — | — | non | 4 | 7:T431; 7:T449; 7:T463; 7:T477 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |
| C | 5 | oui | non | — | — | — | non | 0 | — |

### 009 / position 9 / T527 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL. Last possible admission: invalid repair trial for B560 at slot 10 using T527 at slot 9 (trace order 8807). Subsequent B578 substitution is valid and does not search repairs; active B599 is skipped. No stored role, no A/earlier C segment, no bootstrap occurrence at this slot, no later cycle. Direct target rejection alone was NOT irreversible.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |
| C | 5 | oui | non | — | — | — | non | 0 | — |

### 009 / position 9 / T528

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL. Last possible admission: invalid repair trial for B560 at slot 10 using T528 at slot 9 (trace order 8808). Subsequent B578 substitution is valid and does not search repairs; active B599 is skipped. No stored role, no A/earlier C segment, no bootstrap occurrence at this slot, no later cycle. Direct target rejection alone was NOT irreversible.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |
| C | 5 | oui | non | — | — | — | non | 0 | — |

### 009 / position 10 / B578 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | oui | Promising | 0.5 | 1 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |
| C | 5 | oui | oui | Promising | 0.030864197530864224 | 1 | oui | — | — |

### 010 / position 0 / B177 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising+Repair | 1.2175838566360182 | 1 | oui | — | — |
| A | 2 | oui | oui | Promising+Repair | 1.217583856636018 | 1 | oui | — | — |
| A | 3 | non | — | Active+Promising+Repair | — | — | non | — | — |
| A | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |
| A | 5 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 1 | oui | oui | Promising+Repair | 1.2175838566360182 | 1 | oui | — | — |
| C | 2 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 3 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |

### 010 / position 0 / B178

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1711241375002104 | 5 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1711241375002106 | 5 | non | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.0949122908971778 | 1 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.19056017070198428 | 19 | non | — | — |
| A | 5 | oui | oui | Promising+Repair | -0.13418493809034304 | 15 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1711241375002104 | 5 | non | — | — |
| C | 2 | oui | oui | Repair | 1.0057076468956987 | 4 | non | — | — |
| C | 3 | oui | oui | Repair | -0.499113409216016 | 15 | non | — | — |
| C | 4 | oui | oui | Repair | 0.20871145379725253 | 8 | non | — | — |

### 010 / position 0 / B179

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1788545826445405 | 4 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1788545826445405 | 4 | non | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.0923463854828674 | 3 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.23609138695181286 | 18 | non | — | — |
| A | 5 | oui | oui | Promising+Repair | -0.16811370578107243 | 17 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1788545826445405 | 4 | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 1.0239482287262343 | 3 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.03685652061611877 | 10 | non | — | — |
| C | 4 | oui | oui | Promising+Repair | 0.7247805308254355 | 4 | non | — | — |

### 010 / position 0 / B180

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising+Repair | 1.1946453046390755 | 2 | oui | — | — |
| A | 2 | oui | oui | Promising+Repair | 1.1946453046390753 | 2 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.0935913853684887 | 2 | oui | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.28371155058857556 | 17 | non | — | — |
| A | 5 | oui | oui | Promising+Repair | -0.15931548954814562 | 16 | non | — | — |
| C | 1 | oui | oui | Promising+Repair | 1.1946453046390755 | 2 | oui | — | — |
| C | 2 | oui | oui | Promising+Repair | 1.0607294040478887 | 1 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.8972986960131879 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.5214058704639086 | 1 | oui | — | — |

### 010 / position 0 / B181

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.167849093257936 | 6 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1678490932579353 | 6 | non | — | — |
| A | 3 | oui | oui | Repair | 1.0553833864020712 | 4 | non | — | — |
| A | 4 | oui | oui | Repair | 0.2932431243523357 | 16 | non | — | — |
| A | 5 | oui | oui | Repair | 0.09196221677406641 | 13 | non | — | — |
| C | 1 | oui | oui | Repair | 1.167849093257936 | 6 | non | — | — |
| C | 2 | oui | oui | Repair | 0.9989185166524965 | 5 | non | — | — |
| C | 3 | oui | oui | Repair | 0.1480512798765319 | 9 | non | — | — |
| C | 4 | oui | oui | Promising+Repair | 0.7360079465443313 | 3 | oui | — | — |

### 010 / position 0 / B182

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Promising+Repair | 1.1789634518322036 | 3 | oui | — | — |
| A | 2 | oui | oui | Promising+Repair | 1.1789634518322034 | 3 | oui | — | — |
| A | 3 | oui | oui | Promising+Repair | 1.051658543987302 | 5 | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.3358383824258948 | 15 | non | — | — |
| A | 5 | oui | oui | Promising+Repair | -0.36098891754842477 | 19 | non | — | — |
| C | 1 | oui | oui | Promising+Repair | 1.1789634518322036 | 3 | oui | — | — |
| C | 2 | oui | oui | Promising+Repair | 1.0246774265523202 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.8382970635630398 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.3533885678883157 | 2 | oui | — | — |

### 010 / position 0 / B183

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1556281146660992 | 7 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1556281146660994 | 7 | non | — | — |
| A | 3 | oui | oui | Repair | 1.015983565494621 | 6 | non | — | — |
| A | 4 | oui | oui | Repair | 0.3475513974229071 | 14 | non | — | — |
| A | 5 | oui | oui | Repair | 0.3745180534407904 | 9 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1556281146660992 | 7 | non | — | — |
| C | 2 | oui | oui | Repair | 0.9706538002059839 | 6 | non | — | — |
| C | 3 | oui | oui | Repair | 0.22686569450613023 | 6 | non | — | — |
| C | 4 | oui | oui | Repair | 0.6903269405645474 | 5 | non | — | — |

### 010 / position 0 / B184

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1484947219470691 | 8 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1484947219470683 | 8 | non | — | — |
| A | 3 | oui | oui | Repair | 0.991183068359989 | 7 | non | — | — |
| A | 4 | oui | oui | Repair | 0.3678977868717048 | 13 | non | — | — |
| A | 5 | oui | oui | Repair | 0.10599535307294666 | 12 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1484947219470691 | 8 | non | — | — |
| C | 2 | oui | oui | Repair | 0.9539860031241851 | 7 | non | — | — |
| C | 3 | oui | oui | Repair | 0.2508180732832662 | 5 | non | — | — |
| C | 4 | oui | oui | Repair | 0.6071676874806412 | 6 | non | — | — |

### 010 / position 0 / B185

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1259092266740436 | 10 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1259092266740436 | 10 | non | — | — |
| A | 3 | oui | oui | Repair | 0.9482494115470609 | 8 | non | — | — |
| A | 4 | oui | oui | Repair | 0.3689677409255544 | 12 | non | — | — |
| A | 5 | oui | oui | Repair | -0.375092251415053 | 20 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1259092266740436 | 10 | non | — | — |
| C | 2 | oui | oui | Repair | 0.9014656715498696 | 9 | non | — | — |
| C | 3 | oui | oui | Repair | -0.2897445372196178 | 12 | non | — | — |
| C | 4 | oui | oui | Repair | -0.07001419090931607 | 12 | non | — | — |

### 010 / position 0 / B186

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1303718004368226 | 9 | non | — | — |
| A | 2 | oui | oui | Repair | 1.130371800436823 | 9 | non | — | — |
| A | 3 | oui | oui | Repair | 0.9344213193980165 | 9 | non | — | — |
| A | 4 | oui | oui | Repair | 0.39995869870846196 | 11 | non | — | — |
| A | 5 | oui | oui | Repair | -0.35960911743870705 | 18 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1303718004368226 | 9 | non | — | — |
| C | 2 | oui | oui | Repair | 0.9113710998163903 | 8 | non | — | — |
| C | 3 | oui | oui | Repair | 0.17531761443129948 | 7 | non | — | — |
| C | 4 | oui | oui | Repair | 0.2746410233951143 | 7 | non | — | — |

### 010 / position 0 / B187

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.1229905460240466 | 11 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1229905460240466 | 11 | non | — | — |
| A | 3 | oui | oui | Repair | 0.9141075690608017 | 10 | non | — | — |
| A | 4 | oui | oui | Repair | 0.4266494612638855 | 10 | non | — | — |
| A | 5 | oui | oui | Repair | -0.02675762544889354 | 14 | non | — | — |
| C | 1 | oui | oui | Repair | 1.1229905460240466 | 11 | non | — | — |
| C | 2 | oui | oui | Repair | 0.8937530967190278 | 10 | non | — | — |
| C | 3 | oui | oui | Repair | 0.17279092174609265 | 8 | non | — | — |
| C | 4 | oui | oui | Repair | 0.1997335681641063 | 9 | non | — | — |

### 010 / position 0 / B188

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.101057288200942 | 14 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1010572882009424 | 14 | non | — | — |
| A | 3 | oui | oui | Repair | 0.8713374508890658 | 11 | non | — | — |
| A | 4 | oui | oui | Repair | 0.4274991500628677 | 9 | non | — | — |
| A | 5 | oui | oui | Repair | 0.2530180390504143 | 11 | non | — | — |
| C | 1 | oui | oui | Repair | 1.101057288200942 | 14 | non | — | — |
| C | 2 | oui | oui | Repair | 0.8423474122075114 | 13 | non | — | — |
| C | 3 | oui | oui | Repair | -0.33550971316264216 | 13 | non | — | — |
| C | 4 | oui | oui | Repair | -0.4610357863172846 | 13 | non | — | — |

### 010 / position 0 / B189

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.093509532144377 | 15 | non | — | — |
| A | 2 | oui | oui | Repair | 1.0935095321443764 | 15 | non | — | — |
| A | 3 | oui | oui | Repair | 0.8527578601189358 | 12 | non | — | — |
| A | 4 | oui | oui | Repair | 0.45653212408299126 | 8 | non | — | — |
| A | 5 | oui | oui | Repair | 0.5249606155916474 | 6 | non | — | — |
| C | 1 | oui | oui | Repair | 1.093509532144377 | 15 | non | — | — |
| C | 2 | oui | oui | Repair | 0.824068357091141 | 14 | non | — | — |
| C | 3 | oui | oui | Repair | -0.3493805344548187 | 14 | non | — | — |
| C | 4 | oui | oui | Repair | -0.5368297616028397 | 14 | non | — | — |

### 010 / position 0 / B190

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.107574428935552 | 12 | non | — | — |
| A | 2 | oui | oui | Repair | 1.1075744289355514 | 12 | non | — | — |
| A | 3 | oui | oui | Repair | 0.849780863667242 | 13 | non | — | — |
| A | 4 | oui | oui | Repair | 0.49852915659692976 | 7 | non | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.9380088725547004 | 3 | oui | — | — |
| C | 1 | oui | oui | Repair | 1.107574428935552 | 12 | non | — | — |
| C | 2 | oui | oui | Repair | 0.8556183699004524 | 11 | non | — | — |
| C | 3 | oui | oui | Repair | 0.4777524388372196 | 4 | non | — | — |
| C | 4 | oui | oui | Repair | 0.1665476463592046 | 11 | non | — | — |

### 010 / position 0 / B191

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.103457491272286 | 13 | non | — | — |
| A | 2 | oui | oui | Repair | 1.103457491272285 | 13 | non | — | — |
| A | 3 | oui | oui | Repair | 0.8295403551590363 | 14 | non | — | — |
| A | 4 | oui | oui | Repair | 0.5235057908287595 | 4 | non | — | — |
| A | 5 | oui | oui | Repair | 0.6010079105221078 | 5 | non | — | — |
| C | 1 | oui | oui | Repair | 1.103457491272286 | 13 | non | — | — |
| C | 2 | oui | oui | Repair | 0.8449612649001614 | 12 | non | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.6211433346568376 | 3 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 0.19144367923781785 | 10 | non | — | — |

### 010 / position 0 / B192

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.0576548793886238 | 17 | non | — | — |
| A | 2 | oui | oui | Repair | 1.057654879388624 | 17 | non | — | — |
| A | 3 | oui | oui | Repair | 0.7738969406713193 | 15 | non | — | — |
| A | 4 | oui | oui | Repair | 0.5155376899927389 | 6 | non | — | — |
| A | 5 | oui | oui | Repair | 0.49396806054265086 | 7 | non | — | — |
| C | 1 | oui | oui | Repair | 1.0576548793886238 | 17 | non | — | — |
| C | 2 | oui | oui | Repair | 0.737743427555487 | 16 | non | — | — |
| C | 3 | oui | oui | Repair | -0.8266201362333296 | 16 | non | — | — |
| C | 4 | oui | oui | Repair | -1.3175283638477089 | 16 | non | — | — |

### 010 / position 0 / B193

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.0461349918883127 | 18 | non | — | — |
| A | 2 | oui | oui | Repair | 1.0461349918883123 | 18 | non | — | — |
| A | 3 | oui | oui | Repair | 0.7386807900415399 | 17 | non | — | — |
| A | 4 | oui | oui | Repair | 0.5219858210587123 | 5 | non | — | — |
| A | 5 | oui | oui | Repair | 0.2840968314847388 | 10 | non | — | — |
| C | 1 | oui | oui | Repair | 1.0461349918883127 | 18 | non | — | — |
| C | 2 | oui | oui | Repair | 0.7096442020383017 | 17 | non | — | — |
| C | 3 | oui | oui | Repair | -0.9201290180136241 | 17 | non | — | — |
| C | 4 | oui | oui | Repair | -1.6104127654401872 | 17 | non | — | — |

### 010 / position 0 / B194

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | oui | Repair | 1.0634499757075757 | 16 | non | — | — |
| A | 2 | oui | oui | Repair | 1.063449975707575 | 16 | non | — | — |
| A | 3 | oui | oui | Repair | 0.7417360201430575 | 16 | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.5704267686477377 | 3 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.6355677005960008 | 4 | non | — | — |
| C | 1 | oui | oui | Repair | 1.0634499757075757 | 16 | non | — | — |
| C | 2 | oui | oui | Repair | 0.7480419080900138 | 15 | non | — | — |
| C | 3 | oui | oui | Repair | 0.023945017251211495 | 11 | non | — | — |
| C | 4 | oui | oui | Repair | -0.7777175268740159 | 15 | non | — | — |

### 010 / position 1 / T221 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| A | 2 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| A | 3 | oui | oui | Conditional+Repair | -0.03903488067276871 | 5 | non | — | — |
| A | 4 | oui | oui | Conditional+Repair | -0.32520755823038294 | 8 | non | — | — |
| A | 5 | oui | oui | Conditional+Repair | 0.31418636260109767 | 5 | non | — | — |
| C | 1 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| C | 2 | oui | oui | Promising+Conditional+Repair | 0.12730414746543783 | 3 | oui | — | — |
| C | 3 | oui | oui | Promising+Conditional+Repair | 0.1317322458525415 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional+Repair | 0.538383844015619 | 3 | oui | — | — |

### 010 / position 1 / T222

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| A | 2 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| A | 3 | oui | oui | Conditional+Repair | 0.36037047116073045 | 4 | non | — | — |
| A | 4 | oui | oui | Conditional+Repair | 0.09866606175883161 | 4 | non | — | — |
| A | 5 | oui | oui | Promising+Conditional+Repair | 0.7376672707156144 | 2 | oui | — | — |
| C | 1 | oui | non | Conditional | — | — | non | 18 | 0:B177; 0:B178; 0:B179; 0:B180; 0:B181; 0:B182; 0:B183; 0:B184; 0:B185; 0:B186; 0:B187; 0:B188; 0:B189; 0:B190; 0:B191; 0:B192; 0:B193; 0:B194 |
| C | 2 | oui | oui | Promising+Conditional+Repair | 0.5915898617511521 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising+Conditional+Repair | 0.5915898617511519 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional+Repair | 1.0093224889220946 | 1 | oui | — | — |

### 010 / position 2 / B269 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Conditional | 0.7690579319016108 | 7 | non | — | — |
| C | 3 | oui | oui | Conditional | 0.7293139917823522 | 6 | non | — | — |
| C | 4 | oui | oui | Promising+Conditional | 0.7189715755821452 | 2 | oui | — | — |

### 010 / position 2 / B270

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Conditional | 0.7736452383441282 | 6 | non | — | — |
| C | 3 | oui | oui | Conditional | 0.7087205698731749 | 8 | non | — | — |
| C | 4 | oui | oui | Promising+Conditional | 0.6130418186598701 | 3 | oui | — | — |

### 010 / position 2 / B271

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Promising+Conditional | 0.931493166644515 | 1 | oui | — | — |
| C | 3 | non | — | Active+Promising+Conditional | — | — | non | — | — |
| C | 4 | non | — | Active+Promising+Conditional | — | — | non | — | — |

### 010 / position 2 / B272

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Conditional | 0.859822143871762 | 5 | non | — | — |
| C | 3 | oui | oui | Promising+Conditional | 0.7593639251246321 | 3 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional | 0.4324611319369356 | 4 | non | — | — |

### 010 / position 2 / B273

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Promising+Conditional | 0.916681870261173 | 3 | oui | — | — |
| C | 3 | oui | oui | Promising+Conditional | 0.7892775626071723 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional | 0.3381686444393021 | 5 | non | — | — |

### 010 / position 2 / B274

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Conditional | 0.8849857509840208 | 4 | non | — | — |
| C | 3 | oui | oui | Conditional | 0.7336372375791623 | 5 | non | — | — |
| C | 4 | oui | oui | Conditional | 0.1579597018600345 | 6 | non | — | — |

### 010 / position 2 / B275

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | oui | oui | Promising+Conditional | 0.922120944179264 | 2 | oui | — | — |
| C | 3 | oui | oui | Promising+Conditional | 0.7436057665329607 | 4 | non | — | — |
| C | 4 | oui | oui | Promising+Conditional | 0.03729539545643057 | 7 | non | — | — |

### 010 / position 2 / B276

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 2 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| A | 3 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 1:T204; 1:T221; 1:T222; 1:T233; 1:T243 |
| C | 1 | oui | non | Conditional | — | — | non | 2 | 1:T233; 1:T243 |
| C | 2 | non | — | Active+Conditional | — | — | non | — | — |
| C | 3 | oui | oui | Conditional | 0.717339209459598 | 7 | non | — | — |
| C | 4 | oui | oui | Conditional | -0.12224479345019945 | 8 | non | — | — |

### 010 / position 3 / T301 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | — | — | — | non | 0 | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | oui | Promising+Repair | 0.7623400365630716 | 2 | oui | — | — |
| C | 3 | non | — | Active+Promising+Repair | — | — | non | — | — |
| C | 4 | non | — | Active+Promising+Repair | — | — | non | — | — |

### 010 / position 4 / B348 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | — | — | — | non | 0 | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | non | Conditional | — | — | non | 4 | 3:T291; 3:T301; 3:T316; 3:T325 |
| C | 3 | oui | oui | Promising+Conditional | 0.7730001338148798 | 2 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional | 1.3339414110742147 | 2 | oui | — | — |

### 010 / position 4 / B349

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | — | — | — | non | 0 | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | non | Conditional | — | — | non | 5 | 3:T291; 3:T301; 3:T316; 3:T325; 3:T341 |
| C | 3 | oui | oui | Promising+Conditional | 0.7953501193883865 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Conditional | 1.43047858022346 | 1 | oui | — | — |

### 010 / position 4 / B350

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | oui | non | — | — | — | non | 0 | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | oui | non | Conditional | — | — | non | 5 | 3:T291; 3:T301; 3:T316; 3:T325; 3:T341 |
| C | 3 | non | — | Active+Conditional | — | — | non | — | — |
| C | 4 | non | — | Active+Conditional | — | — | non | — | — |

### 010 / position 5 / T377 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=oui ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | oui | Promising+Repair | 0.8795362805512614 | 1 | oui | — | — |
| C | 4 | oui | oui | Promising+Repair | 1.3929847072680126 | 1 | oui | — | — |

### 010 / position 6 / B418 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | non | Conditional | — | — | non | 4 | 5:T365; 5:T377; 5:T389; 5:T403 |
| C | 4 | oui | non | Conditional | — | — | non | 4 | 5:T365; 5:T377; 5:T389; 5:T403 |

### 010 / position 6 / B419

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | oui | non | — | — | — | non | 0 | — |
| A | 4 | oui | non | — | — | — | non | 0 | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | oui | non | Conditional | — | — | non | 4 | 5:T365; 5:T377; 5:T389; 5:T403 |
| C | 4 | oui | non | Conditional | — | — | non | 4 | 5:T365; 5:T377; 5:T389; 5:T403 |

### 010 / position 7 / T445 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=D_GUARD. At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | oui | Repair | -1.5538505962168876 | 5 | non | — | — |
| A | 5 | oui | oui | Repair | -1.5423855296785556 | 5 | non | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |

### 010 / position 7 / T446

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=D_GUARD. At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | oui | Promising+Repair | 0.02339568925837643 | 3 | oui | — | — |
| A | 5 | oui | oui | Promising+Repair | 0.040239053190678775 | 3 | oui | — | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |

### 010 / position 8 / B487 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=D_GUARD. At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |

### 010 / position 8 / B488

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=D_GUARD. At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |

### 010 / position 8 / B489

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=D_GUARD. At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | — | — | — | non | 0 | — |

### 010 / position 8 / B490

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | Conditional | — | — | non | 3 | 7:T454; 7:T466; 7:T479 |

### 010 / position 8 / B491

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | Conditional | — | — | non | 3 | 7:T454; 7:T466; 7:T479 |

### 010 / position 8 / B492

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | Conditional | — | — | non | 3 | 7:T454; 7:T466; 7:T479 |

### 010 / position 8 / B493

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=oui/oui. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=FINAL_WINNER_SELECTION. Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| A | 5 | oui | non | Conditional | — | — | non | 5 | 7:T445; 7:T446; 7:T454; 7:T466; 7:T479 |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | oui | non | Conditional | — | — | non | 3 | 7:T454; 7:T466; 7:T479 |

### 010 / position 9 / T517 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=C_RECONSTRUCTION_C4_MAX_SEGMENTS. A exported no matching segment; candidate absent from bootstrap; C guard prevents remaining cycles. Remaining progressive block is restricted to current prefix and cannot assign this position.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |

### 010 / position 10 / B563 — witness

SOURCE=ORACLE_INJECTED. Bootstrap=non. Disponible A/C=non/non. Dans best D=non ; winner=non. FIRST_LOSS_STAGE=C_RECONSTRUCTION_C4_MAX_SEGMENTS. A exported no matching segment; candidate absent from bootstrap; C guard prevents remaining cycles. Remaining progressive block is restricted to current prefix and cannot assign this position.

| Run | Cycle | Évalué | Substitution directe valide | Rôles disponibles | Score | Rang | Top3 ce cycle | repairs.length | Partenaires |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 1 | hors préfixe | — | — | — | — | non | — | — |
| A | 2 | hors préfixe | — | — | — | — | non | — | — |
| A | 3 | hors préfixe | — | — | — | — | non | — | — |
| A | 4 | hors préfixe | — | — | — | — | non | — | — |
| A | 5 | oui | non | — | — | — | non | 0 | — |
| C | 1 | hors préfixe | — | — | — | — | non | — | — |
| C | 2 | hors préfixe | — | — | — | — | non | — | — |
| C | 3 | hors préfixe | — | — | — | — | non | — | — |
| C | 4 | hors préfixe | — | — | — | — | non | — | — |

## 11. Fichiers et reproduction

- audit.cjs : instrumentation en mémoire, exécution de référence, parité stricte, assertions de validité et manifests SHA-256 des sources.
- summarize.cjs : agrégats et recherche diagnostique exacte du minimum de corrections ; jamais appelée par la production.
- render.cjs : génération de ce rapport, CSV et vérification des certificats.
- *.baseline.json : runs non instrumentés ; *.trace.json puis *.trace2.json : observations, ordres, listes, compteurs et signatures de sorties.
- *.lifecycle.json : les 21 dimensions demandées, par candidat et cycle, et les preuves de continuation.
- candidate-lifecycle.csv : 76 candidats oracle ; pool-sources.csv : toutes les identités de tous les pools ; all-promotion-visits.csv : chaque substitution effectivement évaluée, même non oracle.
- promotion-timeline.csv : scores/rangs complets des candidats oracle, tous cycles ; minimum-repairs-posthoc.csv : certificats de corrections minimales des witnesses.
- proof-certificates.json : impossibilité ordonnée B262 et continuations valides interrompues dans D.

Reproduction depuis la racine du workspace : `node tools/ground-truth/output/candidate-lifecycle-audit/audit.cjs 009 trace nouveau-label`. Les fichiers de run utilisent flag wx : ils ne sont jamais écrasés. Baseline et trace sont comparées ; toute variation des sorties décisionnelles échoue. Les étapes summarize/render ne touchent qu’aux artefacts de ce dossier.

Code de décision vérifié : promotion/promoteCandidates.ts:54–158 ; system-c/buildConditionalAlternatives.ts:31–87 ; shared/reconstructLocalPaths.ts:65–163 et 238–368 ; shared/selectLocalReconstruction.ts:139–177 ; composition/system-d/extractSegments.ts:16–59 ; composeGlobalPaths.ts:58–133 et 171–192. Racine : mobile/RepMotion/analytics/delayed-context-path/. Entrées : tools/ground-truth/historical007Input.ts:11–35, historical007Injection.ts:12–91 et windowOracle.ts:7–31.
