# Calibration V2.5 — Premiers résultats expérimentaux

**Date :** 2026-07-09

---

# Objectif de la séance

La première expérimentation de Calibration V2.5 a permis de valider l'architecture complète d'une stratégie basée sur le changement de direction d'un signal lissé.

Les premiers benchmarks ont cependant montré que cette nouvelle stratégie ne réduisait pas le nombre de candidats RAW. Au contraire, elle produisait davantage de Bottoms et de Tops que la stratégie actuelle basée sur les extrema locaux, tout en conservant un score final pratiquement identique grâce aux filtres de validation.

Cette observation marque un changement important dans notre compréhension du problème.

Jusqu'à présent, notre hypothèse principale était que la stratégie de détection (`detectBottomsAndTops()`) constituait la principale limitation de la Calibration.

Les résultats obtenus suggèrent désormais que la stratégie de détection n'est probablement pas le facteur dominant. La qualité du signal présenté à l'algorithme semble avoir un impact plus important que la méthode utilisée pour détecter les pivots.

L'objectif de cette nouvelle phase est donc d'étudier le prétraitement du signal afin de déterminer si une meilleure qualité de signal permettrait aux deux stratégies de détection (extrema locaux et changement de direction) de produire des candidats RAW plus représentatifs des véritables pivots biomécaniques.

## Décision expérimentale — smoothingWindowSize

Pour la prochaine campagne, une seule variable sera testée : `smoothingWindowSize`.

Cependant, `peakWindowSize` sera fixé volontairement à une valeur généreuse (`8`) afin de ne pas contraindre artificiellement le snap local lorsque le smoothing devient plus large.

Objectif :
- isoler l'effet du lissage ;
- éviter qu'un `peakWindowSize` trop faible produise un faux mauvais résultat ;
- reporter le tuning fin de `peakWindowSize` à une campagne séparée.





## Benchmark V2.5 — smoothingWindowSize

Campagne :
- `RAW_DETECTION_STRATEGY = "direction_change"`
- `peakWindowSize = 8`
- `smoothingWindowSize = [2, 3, 5, 7, 9, 11, 15]`

Résultat :
- Le meilleur score reste `9`.
- Le meilleur résultat apparaît avec `smoothingWindowSize = 2`.
- Les fenêtres de smoothing plus larges n'améliorent pas le score.
- Le nombre de candidats RAW reste très élevé, souvent supérieur à la V2 initiale.

Conclusion intermédiaire :
Le simple smoothing par moyenne mobile, dans cette plage de valeurs, ne suffit pas à rendre `direction_change` plus performant que `local_extrema`.

## Question méthodologique — sensibilité du benchmark

Les dernières campagnes montrent que le nombre de candidats RAW varie fortement selon la stratégie utilisée :

- V2 local extrema : environ 70–90 RAW candidates.
- V2.5 direction_change initiale : environ 90–120 RAW candidates.
- V2.5 smoothing campaign : environ 110–153 RAW candidates.

Malgré ces variations importantes, le meilleur score reste stable à `9`.

Cette observation ne permet pas encore de conclure définitivement que le smoothing est inefficace.

Il faut maintenant vérifier la chaîne complète :

```text
RAW candidates
↓
Selected candidates
↓
Score final