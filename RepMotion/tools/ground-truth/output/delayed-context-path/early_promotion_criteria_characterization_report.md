# Delayed Context Path – Caractérisation des critères de promotion précoce

## 1. Question exacte

Parmi les caractéristiques déjà calculables à partir du signal actuel, lesquelles permettent d'identifier assez tôt la bonne alternative locale et de construire une petite `promisingAlternatives[]`, sans éliminer la Ground Truth ni conserver presque tous les candidats ?

## 2. Objectif

Séparer le jugement final sur une chaîne complète de la promotion précoce d'une alternative locale. L'objectif principal est la promotion précoce parmi toutes les alternatives unitaires compatibles, et non une comparaison où la bonne alternative est fournie à l'avance.

## 3. Limite de la direction

Cette caractérisation est le dernier audit de `delayed_context_path`. Les preuves existantes sont réutilisées ; aucune formule, combinaison, pondération, normalisation commune ou règle de promotion n'est inventée pour compléter les données manquantes.

## 4. Contexte déjà prouvé

- DP V1 construit une chaîne complète alternée.
- DP V2 peut construire le préfixe Ground Truth mais l'élimine avec `partialTemporalScore`.
- Une exploration sans pruning atteint le garde-fou à 300 000 états.
- Dans la paire contrôlée B260/B262, Temporal préfère B262 à quatre cycles, Shape seulement à cinq cycles.
- À cinq cycles, les deux préfèrent B262 et un remplacement unitaire reconstruit la GT exacte en cinq états de génération.

Le dernier point démontre qu'une correction locale connue est peu coûteuse. Il ne démontre pas que B262 aurait été découverte et promue automatiquement parmi toutes les alternatives.

## 5. Dataset et pool contrôlé

Dataset `rowing_5reps_007`. Le pool existant contient 46 candidats RAW et 9 candidats Ground Truth injectés individuellement, soit 55 candidats avec les parasites conservés. Aucune chaîne Ground Truth complète n'est injectée. La tolérance de matching existante est de ±2 samples.

La Ground Truth est utilisée uniquement pour évaluer après coup les résultats déjà obtenus.

## 6. Méthode de génération des alternatives locales

La génération locale existante peut remplacer un seul pivot par un candidat du même type issu du pool, situé entre ses voisins fixes et respectant :

- l'alternance B/T ;
- l'ordre strictement croissant ;
- une transition minimale de 8 samples ;
- une durée B-B minimale de 45 samples.

Elle n'utilise aucune fenêtre temporelle inventée et ne combine jamais plusieurs remplacements. Dans le cas du pivot B260, cette méthode produit quatre variantes structurellement valides pour cinq états de génération.

Cette méthode définit le voisinage, mais aucune trace existante ne fournit les valeurs et rangs de tous les critères demandés pour ces quatre variantes à chacun des cinq stades. Le diagnostic précédent ne comparait explicitement que B260 et B262.

## 7. Audit des caractéristiques

| Critère | Disponibilité honnête | Définition réellement disponible | Limite pour la promotion |
|---|---|---|---|
| Temporal | À partir de 2 cycles | opposé de la moyenne des CV B-B, B-T et T-B | élimine déjà la GT dans DP V2 ; paire contrôlée seulement pour le cas local |
| Shape | À partir de 2 cycles via adaptation diagnostique ; final natif à 5 cycles | corrélations de cycles rééchantillonnés au profil médian | score scalaire dépendant d'une population ; préfère B260 à 4 cycles |
| Cohérence des phases | À partir de 2 cycles | CV séparés B-T et T-B, composantes de Temporal | redondante avec Temporal |
| Ratio concentrique/excentrique | Calculable | ratio des durées B-T / T-B par cycle | aucune agrégation ni direction de préférence validée pour la promotion |
| ROM / amplitude | Proxy seulement | amplitude du signal entre Bottom et Top, CV/MAD d'amplitude existants | pas un déplacement physique ; orientation et gravité non corrigées |
| Vitesse proxy | Disponible localement | différence première du signal lissé | utilisée pour trouver les changements de direction, pas comme score de chemin |
| Qualité du passage par zéro | `NOT_AVAILABLE` | changement de signe/direction booléen seulement | aucune proximité graduelle à zéro ni confiance de pivot |
| Jerk / fluidité | `NOT_AVAILABLE` | aucune métrique existante dans le runner | nécessiterait une nouvelle formule |
| Énergie du signal | `NOT_AVAILABLE` | aucune métrique existante dans le runner | nécessiterait une nouvelle formule et une fenêtre définie |
| Stabilité inter-cycles | Partiellement disponible | CV temporels, CV d'amplitude, dispersion des corrélations | familles déjà couvertes par Temporal/Shape/amplitude |
| Prominence | Disponible comme référence historique | prominence de calibration ou recomputation descriptive | filtre local, pas preuve de cohérence biomécanique multi-cycle |
| Valeur extrême locale | Disponible comme référence historique | valeur du signal au candidat | score legacy déjà connu pour favoriser de mauvais pivots |

Le runner ne contient ni vrai ROM ni déplacement fiable. L'amplitude de l'accélération sur l'axe choisi est seulement un proxy sensible à l'orientation et à la gravité. Aucune intégration n'est ajoutée afin d'éviter dérive et fausse interprétation physique.

## 8. Analyse A — Jugement final

Les analyses terminales existantes montrent que Temporal et Shape reconnaissent la Ground Truth avec cinq cycles dans le cas contrôlé. L'analyse de caractéristiques DP V2 calcule aussi durées, ratios de phases, amplitudes, dérive des Bottom, prominence et corrélations pour le gagnant DP et la GT.

Elle compare cependant deux chaînes choisies ; elle ne constitue pas une population exhaustive de chaînes terminales permettant de produire honnêtement rangs et percentiles pour tous les critères. L'exploration exhaustive a précisément échoué au garde-fou.

Verdicts de jugement final :

- Temporal : `FINAL_ONLY` pour la confirmation conjointe observée ;
- Shape : `FINAL_ONLY` ;
- cohérence des phases : `REDUNDANT_WITH_TEMPORAL` ;
- stabilité des corrélations : `REDUNDANT_WITH_SHAPE` ;
- amplitude proxy, prominence et extrême : `PROMISING_BUT_INSUFFICIENT_DATA` uniquement comme descriptions, pas comme validateurs démontrés ;
- autres critères : `NOT_AVAILABLE` ou `NOT_RELIABLE`.

## 9. Analyse B — Promotion à 1 cycle

Temporal inter-cycles et Shape sont `NOT_AVAILABLE`/`NOT_COMPARABLE`. Les critères locaux historiques peuvent ordonner des pivots, mais les diagnostics précédents montrent qu'une valeur extrême ou une forte prominence ne suffit pas à identifier la Ground Truth. Aucun critère démontré ne promeut automatiquement B262 dans une petite liste stable.

## 10. Analyse B — Promotion à 2 cycles

Dans la paire contrôlée, Temporal et Shape préfèrent B260. Ils auraient donc classé B262 derrière l'actif. Le rang de B262 parmi toutes les alternatives unitaires n'a pas été mesuré. Toute affirmation Top-1/2/3/5 serait inventée.

## 11. Analyse B — Promotion à 3 cycles

Dans la paire contrôlée, Temporal et Shape préfèrent encore B260. Aucun signal utile de promotion précoce n'est démontré.

## 12. Analyse B — Promotion à 4 cycles

Temporal préfère B262, mais Shape préfère toujours B260. Temporal fournit un signal précoce dans la paire contrôlée, sans preuve que B262 entre dans Top-1, Top-2, Top-3 ou Top-5 parmi toutes les alternatives locales. La préférence est un trade-off, pas un critère convergent.

## 13. Analyse B — Promotion à 5 cycles

Temporal et Shape préfèrent tous deux B262 dans la paire contrôlée. Ce stade confirme la correction, mais il correspond au contexte final et ne répond pas à l'objectif de promotion précoce.

## 14. Simulation Top-1 / Top-2 / Top-3 / Top-5

Non produite. Une simulation valide exige les valeurs d'un critère pour la totalité du voisinage local généré automatiquement à chaque pivot et à chaque stade. Les données existantes ne contiennent que la paire B260/B262 aux cinq stades. Insérer les autres candidats sans définir honnêtement les critères manquants, leurs agrégations et leurs sens d'optimisation introduirait une nouvelle règle importante.

En conséquence, rappel, faux candidats, réduction et stabilité de composition sont `NOT_AVAILABLE` plutôt que déduits d'une paire présélectionnée.

## 15. Résultats du cas BOTTOM:260 / BOTTOM:262

| Cycles | Temporal | Shape | Promotion automatique démontrée ? |
|---:|---|---|---|
| 1 | non comparable | non comparable | non |
| 2 | B260 | B260 | non |
| 3 | B260 | B260 | non |
| 4 | B262 | B260 | non : désaccord et rang global inconnu |
| 5 | B262 | B262 | confirmation finale seulement |

B262 existe dans le pool et la génération locale sait la produire sans règle spéciale sur son indice. L'expérience contrôlée antérieure l'avait toutefois fournie explicitement à la comparaison ; elle ne prouve donc pas sa découverte comme alternative prometteuse.

L'existence de B264 dans le pool n'est pas établie par les rapports actuels et n'est pas supposée.

## 16. Résultats des autres pivots

Les traces connues B228/B262 et T195/T199 modifient plusieurs durées ou appartiennent à des évictions différentes. Elles ne fournissent pas des réplications unitaires complètes avec valeurs de tous les critères aux cinq stades. Aucune généralisation n'est revendiquée.

## 17. Faux positifs et faux négatifs

- Faux négatif observé : `partialTemporalScore` élimine la branche GT dans DP V2 avant le contexte terminal.
- Risque de faux positif : extrême local et score legacy favorisent des pivots non-GT dans les diagnostics existants.
- Faux positifs Top-N : `NOT_AVAILABLE`, faute de classement complet des alternatives locales.
- À deux et trois cycles, prendre le gagnant de la paire Temporal/Shape éliminerait B262.

## 18. Stabilité des critères

Temporal change de préférence entre trois et quatre cycles. Shape change entre quatre et cinq cycles. La convergence n'arrive qu'à cinq cycles et ne peut pas être testée à un stade suivant. Aucune petite liste précoce stable n'est démontrée.

## 19. Redondance entre critères

- Cohérence des phases est directement incluse dans Temporal.
- CV temporels et stabilité des durées sont Temporal.
- Dispersion des corrélations est Shape.
- Stabilité d'amplitude est distincte en principe, mais son pouvoir de promotion n'est pas mesuré.
- Prominence et valeur extrême recouvrent les heuristiques locales historiques, pas le contexte biomécanique recherché.

## 20. Coût de calcul

- Remplacement unitaire B260/B262 : 5 états de génération.
- Quatre profondeurs locales du diagnostic précédent : 25 178 états.
- Exploration exhaustive : garde-fou atteint à 300 000 états.

Le coût du voisinage à un pivot est raisonnable. Le blocage est discriminatif et expérimental, pas computationnel pour le cas ciblé. Produire les populations complètes manquantes pour tous les pivots et stades constituerait toutefois une nouvelle expérience et nécessiterait les règles métriques absentes.

## 21. Classement final des critères

| Rang | Critère | Motif principal |
|---:|---|---|
| 1 | Temporal | seul signal pré-final observé, mais instable et déjà responsable d'un faux négatif DP V2 |
| 2 | Shape | confirme au contexte final, trop tard dans le cas contrôlé |
| 3 | amplitude proxy | information potentiellement distincte, mais aucune preuve de promotion |
| 4 | prominence | peu coûteuse, historiquement insuffisante |
| 5 | valeur extrême | historiquement trompeuse pour la GT |
| — | zéro gradué, jerk, énergie | non disponibles |

Ce classement privilégie l'absence d'élimination et la promotion précoce. Aucun critère ne satisfait ces deux priorités avec les données présentes.

## 22. Verdict par critère

| Critère | Verdict |
|---|---|
| Temporal | `EARLY_PROMOTION_DANGEROUS` |
| Shape | `FINAL_ONLY` |
| Cohérence des phases | `REDUNDANT_WITH_TEMPORAL` |
| Ratio concentrique/excentrique | `PROMISING_BUT_INSUFFICIENT_DATA` |
| Amplitude / ROM proxy | `PROMISING_BUT_INSUFFICIENT_DATA` |
| Vitesse proxy | `NOT_RELIABLE` |
| Qualité graduelle du zéro | `NOT_AVAILABLE` |
| Jerk / fluidité | `NOT_AVAILABLE` |
| Énergie | `NOT_AVAILABLE` |
| Stabilité inter-cycles | `REDUNDANT_WITH_TEMPORAL` / `REDUNDANT_WITH_SHAPE` |
| Prominence | `EARLY_PROMOTION_DANGEROUS` |
| Valeur extrême | `EARLY_PROMOTION_DANGEROUS` |

## 23. Verdict global

**`NO_RELIABLE_EARLY_PROMOTION_CRITERION`**

Temporal signale B262 à quatre cycles dans une paire contrôlée, mais ce résultat ne démontre ni son rang dans une petite liste générée automatiquement, ni l'absence de faux candidats, et Temporal a déjà éliminé la GT plus tôt. Shape ne confirme qu'au cinquième cycle. Les autres critères sont indisponibles, redondants ou sans règle de promotion validée.

## 24. Décision de roadmap : prototype trois listes ou MHT

Ne pas poursuivre un prototype `delayed_context_path` à trois listes sur la base actuelle. La condition de viabilité fixée par le protocole n'est pas satisfaite : aucune petite `promisingAlternatives[]` précoce, stable et sûre n'est démontrée sans nouvelle règle arbitraire ou caractérisation combinatoire.

La direction `delayed_context_path` doit être arrêtée à ce stade. Recommandation explicite : passer à **`mht_experimental`**, où la conservation structurée de plusieurs hypothèses est l'objet même du modèle expérimental plutôt qu'une promotion locale fondée sur un critère non démontré.

## 25. Limites liées au dataset unique

Le verdict porte sur la faisabilité démontrée avec `rowing_5reps_007`, pas sur une impossibilité universelle. Un dataset unique empêche de valider des taux généraux. Cependant, le protocole définit cette caractérisation comme limite de la direction et interdit une nouvelle série indéfinie d'expériences ; la décision de roadmap suit donc les preuves disponibles.

## Validation finale

- Aucune modification de DP V1, DP V2 ou `current_filters`.
- Aucun changement au pipeline de production.
- Aucune nouvelle stratégie officielle ni implémentation des trois listes.
- Aucun score combiné, pondération ou normalisation commune.
- Aucun pruning ni remplacement automatique.
- Aucun NMS, MHT ou gyroscope implémenté.
- Aucun nouveau mode exécutable ajouté : le rapport réutilise les diagnostics opt-in existants et reste désactivé par défaut.

Fichier ajouté :

`RepMotion/tools/ground-truth/output/delayed-context-path/early_promotion_criteria_characterization_report.md`

Commande de reproduction des observations locales B260/B262 utilisées (depuis `RepMotion/tools/calibration-runner`) :

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DELAYED_CONTEXT_TRIGGER_AND_DEPTH'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```

Cette commande régénère le diagnostic source `delayed_context_trigger_and_depth_report.md`. Le présent rapport de décision n'ajoute aucun calcul non reproductible au runner.
