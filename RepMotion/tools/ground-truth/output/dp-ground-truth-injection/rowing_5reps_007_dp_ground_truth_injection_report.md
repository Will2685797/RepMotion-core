# Rowing 5 reps 007 — DP Ground Truth injection

## Population avant injection

| population | bottoms | tops | total |
| --- | --- | --- | --- |
| REAL_DP_INPUT | 22 | 24 | 46 |

## Population après injection

| population | bottoms | tops | total |
| --- | --- | --- | --- |
| REAL_DP_INPUT_PLUS_GROUND_TRUTH | 27 | 28 | 55 |

## Candidats Ground Truth

| order | display | type | index | value | alreadyPresentInRealPopulation |
| --- | --- | --- | --- | --- | --- |
| 1 | B169 | BOTTOM | 169 | 14604 | true |
| 2 | T199 | TOP | 199 | 19844 | false |
| 3 | B262 | BOTTOM | 262 | 17972 | false |
| 4 | T291 | TOP | 291 | 26248 | true |
| 5 | B353 | BOTTOM | 353 | 20092 | false |
| 6 | T383 | TOP | 383 | 17804 | false |
| 7 | B445 | BOTTOM | 445 | 19300 | false |
| 8 | T474 | TOP | 474 | 15656 | false |
| 9 | B529 | BOTTOM | 529 | 17976 | false |
| 10 | T558 | TOP | 558 | 17932 | false |
| 11 | B611 | BOTTOM | 611 | 18888 | false |

## Chaîne gagnante

- Chaîne: B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564)
- Score final: 48176
- Nombre total d'états DP: 1207
- Nombre d'états terminaux: 14

## Comparaison Ground Truth / Winner

| eventNumber | groundTruth | winnerDp | exactPositionMatch | presentInWinningChain | sameTypeCandidateChosenInstead |
| --- | --- | --- | --- | --- | --- |
| 1 | B169 | B169 | MATCH_EXACT | OUI |  |
| 2 | T199 | T195 | DIFFERENT | NON | T195 |
| 3 | B262 | B228 | DIFFERENT | NON | B228 |
| 4 | T291 | T291 | MATCH_EXACT | OUI |  |
| 5 | B353 | B299 | DIFFERENT | NON | B299 |
| 6 | T383 | T333 | DIFFERENT | NON | T333 |
| 7 | B445 | B391 | DIFFERENT | NON | B391 |
| 8 | T474 | T467 | DIFFERENT | NON | T467 |
| 9 | B529 | B500 | DIFFERENT | NON | B500 |
| 10 | T558 | T509 | DIFFERENT | NON | T509 |
| 11 | B611 | B564 | DIFFERENT | NON | B564 |

## Candidats Ground Truth sélectionnés

| eventNumber | groundTruth | winnerDp | exactPositionMatch | presentInWinningChain | sameTypeCandidateChosenInstead |
| --- | --- | --- | --- | --- | --- |
| 1 | B169 | B169 | MATCH_EXACT | OUI |  |
| 4 | T291 | T291 | MATCH_EXACT | OUI |  |

## Candidats Ground Truth ignorés

| eventNumber | groundTruth | winnerDp | exactPositionMatch | presentInWinningChain | sameTypeCandidateChosenInstead |
| --- | --- | --- | --- | --- | --- |
| 2 | T199 | T195 | DIFFERENT | NON | T195 |
| 3 | B262 | B228 | DIFFERENT | NON | B228 |
| 5 | B353 | B299 | DIFFERENT | NON | B299 |
| 6 | T383 | T333 | DIFFERENT | NON | T333 |
| 7 | B445 | B391 | DIFFERENT | NON | B391 |
| 8 | T474 | T467 | DIFFERENT | NON | T467 |
| 9 | B529 | B500 | DIFFERENT | NON | B500 |
| 10 | T558 | T509 | DIFFERENT | NON | T509 |
| 11 | B611 | B564 | DIFFERENT | NON | B564 |

## États terminaux

| rank | stateId | score | chain |
| --- | --- | --- | --- |
| 1 | 11:45:564 | 48176 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| 2 | 11:54:641 | 48164 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| 3 | 11:47:585 | 47108 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| 4 | 11:49:595 | 46992 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| 5 | 11:51:609 | 45088 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| 6 | 11:36:500 | 44872 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| 7 | 11:35:480 | 44112 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| 8 | 11:41:530 | 43152 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| 9 | 11:38:511 | 43124 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| 10 | 11:40:529 | 42884 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| 11 | 11:52:611 | 42732 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| 12 | 11:30:438 | 35772 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| 13 | 11:32:450 | 35648 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| 14 | 11:31:445 | 34284 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
