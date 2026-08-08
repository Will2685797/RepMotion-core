# Oracle diagnostique de composabilité GT

## 1. Executive summary

FULL_GT_COMPOSABLE_FROM_EXISTING_SEGMENTS = NO. Population strictement vérifiée: 648; compatibles GT: 15; minimumSegmentCount=N/A.

## 2. Population des 648 segments

Population reconstruite par le replay identique et la canonisation identique à SEGMENT_COMPOSITION_TEMPORAL_SHAPE; assertion bloquante `segments.length === 648` passée.

| segmentId | positions | replacementPivots | gtCompatible | sourceDecision | provenance |
| --- | --- | --- | --- | --- | --- |
| S0001 | 1-1 | TOP:179 | NO | D1,D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0002 | 1-1 | TOP:199 | YES | D1,D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0003 | 1-2 | TOP:179 \| BOTTOM:243 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0004 | 1-2 | TOP:199 \| BOTTOM:243 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0005 | 1-2 | TOP:222 \| BOTTOM:243 | NO | D1,D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0006 | 1-3 | TOP:179 \| BOTTOM:228 \| TOP:236 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0007 | 1-3 | TOP:179 \| BOTTOM:228 \| TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0008 | 1-3 | TOP:179 \| BOTTOM:228 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0009 | 1-3 | TOP:179 \| BOTTOM:228 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0010 | 1-3 | TOP:179 \| BOTTOM:243 \| TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0011 | 1-3 | TOP:179 \| BOTTOM:243 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0012 | 1-3 | TOP:179 \| BOTTOM:243 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0013 | 1-3 | TOP:199 \| BOTTOM:228 \| TOP:236 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0014 | 1-3 | TOP:199 \| BOTTOM:228 \| TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0015 | 1-3 | TOP:199 \| BOTTOM:228 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0016 | 1-3 | TOP:199 \| BOTTOM:228 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0017 | 1-3 | TOP:199 \| BOTTOM:243 \| TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0018 | 1-3 | TOP:199 \| BOTTOM:243 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0019 | 1-3 | TOP:199 \| BOTTOM:243 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0020 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:236 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0021 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:236 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0022 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:236 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0023 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:236 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0024 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:265 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0025 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:265 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0026 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:265 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0027 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0028 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0029 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:291 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0030 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:291 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0031 | 1-4 | TOP:179 \| BOTTOM:228 \| TOP:291 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0032 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:265 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0033 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:265 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0034 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:265 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0035 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0036 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0037 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:291 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0038 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:291 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0039 | 1-4 | TOP:179 \| BOTTOM:243 \| TOP:291 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0040 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:236 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0041 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:236 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0042 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:236 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0043 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:236 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0044 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:265 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0045 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:265 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0046 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:265 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0047 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0048 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0049 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:291 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0050 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:291 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0051 | 1-4 | TOP:199 \| BOTTOM:228 \| TOP:291 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0052 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:265 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0053 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:265 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0054 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:265 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0055 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0056 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0057 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:291 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0058 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:291 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0059 | 1-4 | TOP:199 \| BOTTOM:243 \| TOP:291 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0060 | 2-2 | BOTTOM:243 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0061 | 2-3 | BOTTOM:243 \| TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0062 | 2-3 | BOTTOM:243 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0063 | 2-3 | BOTTOM:243 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0064 | 2-3 | BOTTOM:260 \| TOP:291 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0065 | 2-3 | BOTTOM:260 \| TOP:317 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0066 | 2-3 | BOTTOM:260 \| TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0067 | 2-3 | BOTTOM:260 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0068 | 2-3 | BOTTOM:262 \| TOP:291 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0069 | 2-3 | BOTTOM:262 \| TOP:317 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0070 | 2-3 | BOTTOM:262 \| TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0071 | 2-3 | BOTTOM:262 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0072 | 2-3 | BOTTOM:299 \| TOP:317 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0073 | 2-3 | BOTTOM:299 \| TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0074 | 2-3 | BOTTOM:299 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0075 | 2-4 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0076 | 2-4 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0077 | 2-4 | BOTTOM:243 \| TOP:265 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0078 | 2-4 | BOTTOM:243 \| TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0079 | 2-4 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0080 | 2-4 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0081 | 2-4 | BOTTOM:243 \| TOP:291 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0082 | 2-4 | BOTTOM:243 \| TOP:291 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0083 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0084 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0085 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0086 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0087 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:299 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0088 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0089 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0090 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0091 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0092 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:321 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0093 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:346 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0094 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:346 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0095 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:346 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0096 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:346 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0097 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:353 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0098 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0099 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:353 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0100 | 2-5 | BOTTOM:243 \| TOP:265 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0101 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0102 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0103 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0104 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0105 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:299 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0106 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0107 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0108 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0109 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0110 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:321 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0111 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:346 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0112 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:346 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0113 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:346 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0114 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:346 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0115 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:353 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0116 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0117 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:353 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0118 | 2-5 | BOTTOM:243 \| TOP:291 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0119 | 2-5 | BOTTOM:243 \| TOP:345 \| BOTTOM:353 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0120 | 2-5 | BOTTOM:243 \| TOP:345 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0121 | 2-5 | BOTTOM:243 \| TOP:345 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0122 | 3-3 | TOP:236 | NO | D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0123 | 3-3 | TOP:265 | NO | D2,D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0124 | 3-3 | TOP:291 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0125 | 3-3 | TOP:317 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0126 | 3-3 | TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0127 | 3-3 | TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0128 | 3-4 | TOP:236 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0129 | 3-4 | TOP:236 \| BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0130 | 3-4 | TOP:236 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0131 | 3-4 | TOP:236 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0132 | 3-4 | TOP:265 \| BOTTOM:321 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0133 | 3-4 | TOP:265 \| BOTTOM:346 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0134 | 3-4 | TOP:265 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0135 | 3-4 | TOP:291 \| BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0136 | 3-4 | TOP:291 \| BOTTOM:321 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0137 | 3-4 | TOP:291 \| BOTTOM:346 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0138 | 3-4 | TOP:317 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0139 | 3-4 | TOP:317 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0140 | 3-4 | TOP:317 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0141 | 3-4 | TOP:317 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0142 | 3-4 | TOP:333 \| BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0143 | 3-4 | TOP:333 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0144 | 3-4 | TOP:333 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0145 | 3-4 | TOP:333 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0146 | 3-4 | TOP:345 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0147 | 3-4 | TOP:345 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0148 | 3-4 | TOP:345 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0149 | 3-4 | TOP:365 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0150 | 3-4 | TOP:365 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0151 | 3-4 | TOP:379 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0152 | 3-4 | TOP:379 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0153 | 3-4 | TOP:383 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0154 | 3-4 | TOP:383 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0155 | 3-5 | TOP:236 \| BOTTOM:299 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0156 | 3-5 | TOP:236 \| BOTTOM:299 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0157 | 3-5 | TOP:236 \| BOTTOM:299 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0158 | 3-5 | TOP:236 \| BOTTOM:299 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0159 | 3-5 | TOP:236 \| BOTTOM:299 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0160 | 3-5 | TOP:236 \| BOTTOM:321 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0161 | 3-5 | TOP:236 \| BOTTOM:321 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0162 | 3-5 | TOP:236 \| BOTTOM:321 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0163 | 3-5 | TOP:236 \| BOTTOM:321 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0164 | 3-5 | TOP:236 \| BOTTOM:321 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0165 | 3-5 | TOP:236 \| BOTTOM:346 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0166 | 3-5 | TOP:236 \| BOTTOM:346 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0167 | 3-5 | TOP:236 \| BOTTOM:346 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0168 | 3-5 | TOP:236 \| BOTTOM:346 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0169 | 3-5 | TOP:236 \| BOTTOM:353 \| TOP:365 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0170 | 3-5 | TOP:236 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0171 | 3-5 | TOP:236 \| BOTTOM:353 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0172 | 3-5 | TOP:236 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0173 | 3-5 | TOP:265 \| BOTTOM:299 \| TOP:345 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0174 | 3-5 | TOP:265 \| BOTTOM:299 \| TOP:365 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0175 | 3-5 | TOP:265 \| BOTTOM:299 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0176 | 3-5 | TOP:265 \| BOTTOM:321 \| TOP:345 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0177 | 3-5 | TOP:265 \| BOTTOM:321 \| TOP:365 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0178 | 3-5 | TOP:265 \| BOTTOM:321 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0179 | 3-5 | TOP:265 \| BOTTOM:346 \| TOP:365 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0180 | 3-5 | TOP:265 \| BOTTOM:346 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0181 | 3-5 | TOP:265 \| BOTTOM:353 \| TOP:365 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0182 | 3-5 | TOP:265 \| BOTTOM:353 \| TOP:383 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0183 | 3-5 | TOP:291 \| BOTTOM:299 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0184 | 3-5 | TOP:291 \| BOTTOM:299 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0185 | 3-5 | TOP:291 \| BOTTOM:299 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0186 | 3-5 | TOP:291 \| BOTTOM:299 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0187 | 3-5 | TOP:291 \| BOTTOM:321 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0188 | 3-5 | TOP:291 \| BOTTOM:321 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0189 | 3-5 | TOP:291 \| BOTTOM:321 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0190 | 3-5 | TOP:291 \| BOTTOM:321 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0191 | 3-5 | TOP:291 \| BOTTOM:346 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0192 | 3-5 | TOP:291 \| BOTTOM:346 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0193 | 3-5 | TOP:291 \| BOTTOM:346 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0194 | 3-5 | TOP:291 \| BOTTOM:353 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0195 | 3-5 | TOP:291 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0196 | 3-5 | TOP:291 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0197 | 3-5 | TOP:345 \| BOTTOM:353 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0198 | 3-5 | TOP:345 \| BOTTOM:353 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0199 | 3-5 | TOP:345 \| BOTTOM:353 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0200 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0201 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0202 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0203 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0204 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0205 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0206 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0207 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0208 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0209 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0210 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0211 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0212 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0213 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0214 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0215 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0216 | 3-6 | TOP:236 \| BOTTOM:299 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0217 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0218 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0219 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0220 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0221 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0222 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0223 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0224 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0225 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0226 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0227 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0228 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0229 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0230 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0231 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0232 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0233 | 3-6 | TOP:236 \| BOTTOM:321 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0234 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0235 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0236 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0237 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0238 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0239 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0240 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0241 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0242 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0243 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0244 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0245 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0246 | 3-6 | TOP:236 \| BOTTOM:346 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0247 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0248 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0249 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0250 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0251 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0252 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0253 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0254 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0255 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0256 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0257 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0258 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0259 | 3-6 | TOP:236 \| BOTTOM:353 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0260 | 3-6 | TOP:265 \| BOTTOM:299 \| TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0261 | 3-6 | TOP:265 \| BOTTOM:299 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0262 | 3-6 | TOP:265 \| BOTTOM:299 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0263 | 3-6 | TOP:265 \| BOTTOM:299 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0264 | 3-6 | TOP:265 \| BOTTOM:321 \| TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0265 | 3-6 | TOP:265 \| BOTTOM:321 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0266 | 3-6 | TOP:265 \| BOTTOM:321 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0267 | 3-6 | TOP:265 \| BOTTOM:321 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0268 | 3-6 | TOP:265 \| BOTTOM:346 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0269 | 3-6 | TOP:265 \| BOTTOM:346 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0270 | 3-6 | TOP:265 \| BOTTOM:346 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0271 | 3-6 | TOP:265 \| BOTTOM:353 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0272 | 3-6 | TOP:265 \| BOTTOM:353 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0273 | 3-6 | TOP:265 \| BOTTOM:353 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0274 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0275 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0276 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0277 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0278 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0279 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0280 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0281 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0282 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0283 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0284 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0285 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0286 | 3-6 | TOP:291 \| BOTTOM:299 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0287 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0288 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0289 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0290 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0291 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0292 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0293 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0294 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0295 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0296 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0297 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0298 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0299 | 3-6 | TOP:291 \| BOTTOM:321 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0300 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0301 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0302 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0303 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0304 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0305 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0306 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0307 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0308 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0309 | 3-6 | TOP:291 \| BOTTOM:346 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0310 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0311 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0312 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0313 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0314 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0315 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0316 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0317 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0318 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0319 | 3-6 | TOP:291 \| BOTTOM:353 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0320 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0321 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0322 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0323 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0324 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0325 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0326 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0327 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0328 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0329 | 3-6 | TOP:345 \| BOTTOM:353 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0330 | 4-4 | BOTTOM:299 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0331 | 4-4 | BOTTOM:321 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0332 | 4-4 | BOTTOM:346 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0333 | 4-4 | BOTTOM:353 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0334 | 4-5 | BOTTOM:299 \| TOP:317 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0335 | 4-5 | BOTTOM:299 \| TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0336 | 4-5 | BOTTOM:299 \| TOP:345 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0337 | 4-5 | BOTTOM:299 \| TOP:365 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0338 | 4-5 | BOTTOM:299 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0339 | 4-5 | BOTTOM:299 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0340 | 4-5 | BOTTOM:321 \| TOP:333 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0341 | 4-5 | BOTTOM:321 \| TOP:345 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0342 | 4-5 | BOTTOM:321 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0343 | 4-5 | BOTTOM:321 \| TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0344 | 4-5 | BOTTOM:321 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0345 | 4-5 | BOTTOM:321 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0346 | 4-5 | BOTTOM:346 \| TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0347 | 4-5 | BOTTOM:346 \| TOP:379 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0348 | 4-5 | BOTTOM:346 \| TOP:383 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0349 | 4-5 | BOTTOM:346 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0350 | 4-5 | BOTTOM:353 \| TOP:365 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0351 | 4-5 | BOTTOM:353 \| TOP:383 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0352 | 4-5 | BOTTOM:391 \| TOP:411 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0353 | 4-5 | BOTTOM:391 \| TOP:421 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0354 | 4-5 | BOTTOM:391 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0355 | 4-6 | BOTTOM:299 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0356 | 4-6 | BOTTOM:299 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0357 | 4-6 | BOTTOM:299 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0358 | 4-6 | BOTTOM:299 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0359 | 4-6 | BOTTOM:299 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0360 | 4-6 | BOTTOM:299 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0361 | 4-6 | BOTTOM:299 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0362 | 4-6 | BOTTOM:299 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0363 | 4-6 | BOTTOM:299 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0364 | 4-6 | BOTTOM:299 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0365 | 4-6 | BOTTOM:299 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0366 | 4-6 | BOTTOM:299 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0367 | 4-6 | BOTTOM:299 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0368 | 4-6 | BOTTOM:321 \| TOP:345 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0369 | 4-6 | BOTTOM:321 \| TOP:345 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0370 | 4-6 | BOTTOM:321 \| TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0371 | 4-6 | BOTTOM:321 \| TOP:345 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0372 | 4-6 | BOTTOM:321 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0373 | 4-6 | BOTTOM:321 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0374 | 4-6 | BOTTOM:321 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0375 | 4-6 | BOTTOM:321 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0376 | 4-6 | BOTTOM:321 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0377 | 4-6 | BOTTOM:321 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0378 | 4-6 | BOTTOM:321 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0379 | 4-6 | BOTTOM:321 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0380 | 4-6 | BOTTOM:321 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0381 | 4-6 | BOTTOM:321 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0382 | 4-6 | BOTTOM:321 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0383 | 4-6 | BOTTOM:321 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0384 | 4-6 | BOTTOM:321 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0385 | 4-6 | BOTTOM:346 \| TOP:365 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0386 | 4-6 | BOTTOM:346 \| TOP:365 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0387 | 4-6 | BOTTOM:346 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0388 | 4-6 | BOTTOM:346 \| TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0389 | 4-6 | BOTTOM:346 \| TOP:379 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0390 | 4-6 | BOTTOM:346 \| TOP:379 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0391 | 4-6 | BOTTOM:346 \| TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0392 | 4-6 | BOTTOM:346 \| TOP:383 \| BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0393 | 4-6 | BOTTOM:346 \| TOP:383 \| BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0394 | 4-6 | BOTTOM:346 \| TOP:383 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0395 | 4-6 | BOTTOM:346 \| TOP:383 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0396 | 4-6 | BOTTOM:346 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0397 | 4-6 | BOTTOM:346 \| TOP:436 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0398 | 4-6 | BOTTOM:353 \| TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0399 | 4-6 | BOTTOM:353 \| TOP:383 \| BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0400 | 4-6 | BOTTOM:353 \| TOP:436 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0401 | 4-7 | BOTTOM:299 \| TOP:345 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0402 | 4-7 | BOTTOM:299 \| TOP:345 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0403 | 4-7 | BOTTOM:299 \| TOP:345 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0404 | 4-7 | BOTTOM:299 \| TOP:345 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0405 | 4-7 | BOTTOM:299 \| TOP:365 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0406 | 4-7 | BOTTOM:299 \| TOP:365 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0407 | 4-7 | BOTTOM:299 \| TOP:365 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0408 | 4-7 | BOTTOM:299 \| TOP:365 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0409 | 4-7 | BOTTOM:299 \| TOP:379 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0410 | 4-7 | BOTTOM:299 \| TOP:379 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0411 | 4-7 | BOTTOM:299 \| TOP:379 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0412 | 4-7 | BOTTOM:299 \| TOP:379 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0413 | 4-7 | BOTTOM:299 \| TOP:383 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0414 | 4-7 | BOTTOM:299 \| TOP:383 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0415 | 4-7 | BOTTOM:299 \| TOP:383 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0416 | 4-7 | BOTTOM:299 \| TOP:383 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0417 | 4-7 | BOTTOM:299 \| TOP:436 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0418 | 4-7 | BOTTOM:299 \| TOP:436 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0419 | 4-7 | BOTTOM:321 \| TOP:345 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0420 | 4-7 | BOTTOM:321 \| TOP:345 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0421 | 4-7 | BOTTOM:321 \| TOP:345 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0422 | 4-7 | BOTTOM:321 \| TOP:345 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0423 | 4-7 | BOTTOM:321 \| TOP:365 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0424 | 4-7 | BOTTOM:321 \| TOP:365 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0425 | 4-7 | BOTTOM:321 \| TOP:365 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0426 | 4-7 | BOTTOM:321 \| TOP:365 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0427 | 4-7 | BOTTOM:321 \| TOP:379 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0428 | 4-7 | BOTTOM:321 \| TOP:379 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0429 | 4-7 | BOTTOM:321 \| TOP:379 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0430 | 4-7 | BOTTOM:321 \| TOP:379 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0431 | 4-7 | BOTTOM:321 \| TOP:383 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0432 | 4-7 | BOTTOM:321 \| TOP:383 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0433 | 4-7 | BOTTOM:321 \| TOP:383 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0434 | 4-7 | BOTTOM:321 \| TOP:383 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0435 | 4-7 | BOTTOM:321 \| TOP:436 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0436 | 4-7 | BOTTOM:321 \| TOP:436 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0437 | 4-7 | BOTTOM:346 \| TOP:365 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0438 | 4-7 | BOTTOM:346 \| TOP:365 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0439 | 4-7 | BOTTOM:346 \| TOP:365 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0440 | 4-7 | BOTTOM:346 \| TOP:365 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0441 | 4-7 | BOTTOM:346 \| TOP:379 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0442 | 4-7 | BOTTOM:346 \| TOP:379 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0443 | 4-7 | BOTTOM:346 \| TOP:379 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0444 | 4-7 | BOTTOM:346 \| TOP:379 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0445 | 4-7 | BOTTOM:346 \| TOP:383 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0446 | 4-7 | BOTTOM:346 \| TOP:383 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0447 | 4-7 | BOTTOM:346 \| TOP:383 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0448 | 4-7 | BOTTOM:346 \| TOP:383 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0449 | 4-7 | BOTTOM:346 \| TOP:436 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0450 | 4-7 | BOTTOM:346 \| TOP:436 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0451 | 4-7 | BOTTOM:353 \| TOP:365 \| BOTTOM:445 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0452 | 4-7 | BOTTOM:353 \| TOP:365 \| BOTTOM:450 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0453 | 4-7 | BOTTOM:353 \| TOP:383 \| BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0454 | 4-7 | BOTTOM:353 \| TOP:383 \| BOTTOM:450 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0455 | 4-7 | BOTTOM:353 \| TOP:436 \| BOTTOM:445 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0456 | 4-7 | BOTTOM:353 \| TOP:436 \| BOTTOM:450 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0457 | 5-5 | TOP:345 | NO | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0458 | 5-5 | TOP:365 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0459 | 5-5 | TOP:379 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0460 | 5-5 | TOP:383 | YES | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0461 | 5-5 | TOP:411 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0462 | 5-5 | TOP:421 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0463 | 5-5 | TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0464 | 5-6 | TOP:317 \| BOTTOM:346 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0465 | 5-6 | TOP:317 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0466 | 5-6 | TOP:317 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0467 | 5-6 | TOP:317 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0468 | 5-6 | TOP:317 \| BOTTOM:426 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0469 | 5-6 | TOP:317 \| BOTTOM:438 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0470 | 5-6 | TOP:333 \| BOTTOM:346 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0471 | 5-6 | TOP:333 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0472 | 5-6 | TOP:333 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0473 | 5-6 | TOP:333 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0474 | 5-6 | TOP:333 \| BOTTOM:426 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0475 | 5-6 | TOP:333 \| BOTTOM:438 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0476 | 5-6 | TOP:345 \| BOTTOM:353 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0477 | 5-6 | TOP:345 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0478 | 5-6 | TOP:345 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0479 | 5-6 | TOP:345 \| BOTTOM:426 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0480 | 5-6 | TOP:345 \| BOTTOM:438 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0481 | 5-6 | TOP:345 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0482 | 5-6 | TOP:365 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0483 | 5-6 | TOP:365 \| BOTTOM:405 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0484 | 5-6 | TOP:365 \| BOTTOM:426 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0485 | 5-6 | TOP:365 \| BOTTOM:438 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0486 | 5-6 | TOP:365 \| BOTTOM:445 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0487 | 5-6 | TOP:365 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0488 | 5-6 | TOP:379 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0489 | 5-6 | TOP:379 \| BOTTOM:405 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0490 | 5-6 | TOP:379 \| BOTTOM:426 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0491 | 5-6 | TOP:379 \| BOTTOM:438 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0492 | 5-6 | TOP:379 \| BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0493 | 5-6 | TOP:383 \| BOTTOM:391 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0494 | 5-6 | TOP:383 \| BOTTOM:405 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0495 | 5-6 | TOP:383 \| BOTTOM:426 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0496 | 5-6 | TOP:383 \| BOTTOM:438 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0497 | 5-6 | TOP:383 \| BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0498 | 5-6 | TOP:411 \| BOTTOM:426 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=2 |
| S0499 | 5-6 | TOP:411 \| BOTTOM:438 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=2 |
| S0500 | 5-6 | TOP:411 \| BOTTOM:445 | NO | D3,D4 | sourcePaths=2; resultingPaths=1 |
| S0501 | 5-6 | TOP:411 \| BOTTOM:450 | NO | D3,D5 | sourcePaths=2; resultingPaths=2 |
| S0502 | 5-6 | TOP:421 \| BOTTOM:438 | NO | D3,D4,D5 | sourcePaths=3; resultingPaths=2 |
| S0503 | 5-6 | TOP:421 \| BOTTOM:445 | NO | D3,D4 | sourcePaths=2; resultingPaths=1 |
| S0504 | 5-6 | TOP:421 \| BOTTOM:450 | NO | D3,D5 | sourcePaths=2; resultingPaths=2 |
| S0505 | 5-6 | TOP:436 \| BOTTOM:445 | NO | D3 | sourcePaths=1; resultingPaths=1 |
| S0506 | 5-6 | TOP:436 \| BOTTOM:450 | NO | D3,D5 | sourcePaths=2; resultingPaths=2 |
| S0507 | 5-7 | TOP:345 \| BOTTOM:445 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0508 | 5-7 | TOP:345 \| BOTTOM:450 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0509 | 5-7 | TOP:365 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0510 | 5-7 | TOP:365 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0511 | 5-7 | TOP:365 \| BOTTOM:445 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0512 | 5-7 | TOP:365 \| BOTTOM:450 \| TOP:474 | NO | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0513 | 5-7 | TOP:379 \| BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0514 | 5-7 | TOP:379 \| BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0515 | 5-7 | TOP:379 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0516 | 5-7 | TOP:379 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0517 | 5-7 | TOP:383 \| BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0518 | 5-7 | TOP:383 \| BOTTOM:450 \| TOP:474 | NO | D4 | sourcePaths=1; resultingPaths=1 |
| S0519 | 5-7 | TOP:436 \| BOTTOM:445 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0520 | 5-7 | TOP:436 \| BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0521 | 6-6 | BOTTOM:405 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0522 | 6-6 | BOTTOM:426 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0523 | 6-6 | BOTTOM:438 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0524 | 6-6 | BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0525 | 6-6 | BOTTOM:450 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0526 | 6-7 | BOTTOM:405 \| TOP:421 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0527 | 6-7 | BOTTOM:405 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0528 | 6-7 | BOTTOM:426 \| TOP:436 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0529 | 6-7 | BOTTOM:426 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0530 | 6-7 | BOTTOM:438 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0531 | 6-7 | BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0532 | 6-7 | BOTTOM:450 \| TOP:474 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0533 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0534 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0535 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0536 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0537 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0538 | 6-9 | BOTTOM:426 \| TOP:467 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0539 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0540 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0541 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0542 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0543 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0544 | 6-9 | BOTTOM:426 \| TOP:474 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0545 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0546 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0547 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0548 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0549 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0550 | 6-9 | BOTTOM:438 \| TOP:467 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0551 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0552 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0553 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0554 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0555 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0556 | 6-9 | BOTTOM:438 \| TOP:474 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0557 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0558 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0559 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0560 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0561 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0562 | 6-9 | BOTTOM:450 \| TOP:467 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0563 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0564 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0565 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0566 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0567 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0568 | 6-9 | BOTTOM:450 \| TOP:474 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0569 | 7-7 | TOP:474 | YES | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0570 | 7-9 | TOP:474 \| BOTTOM:500 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0571 | 7-9 | TOP:474 \| BOTTOM:500 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0572 | 7-9 | TOP:474 \| BOTTOM:500 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0573 | 7-9 | TOP:474 \| BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0574 | 7-9 | TOP:474 \| BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0575 | 7-9 | TOP:474 \| BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0576 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:509 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0577 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:509 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0578 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:509 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0579 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:524 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0580 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:524 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0581 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:524 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0582 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:535 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0583 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:535 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0584 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:535 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0585 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0586 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0587 | 7-10 | TOP:474 \| BOTTOM:500 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0588 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:524 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0589 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:524 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0590 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:524 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0591 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:535 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0592 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:535 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0593 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:535 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0594 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0595 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0596 | 7-10 | TOP:474 \| BOTTOM:511 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0597 | 7-10 | TOP:474 \| BOTTOM:529 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0598 | 7-10 | TOP:474 \| BOTTOM:529 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0599 | 7-10 | TOP:474 \| BOTTOM:529 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0600 | 7-10 | TOP:474 \| BOTTOM:530 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0601 | 7-10 | TOP:474 \| BOTTOM:530 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0602 | 7-10 | TOP:474 \| BOTTOM:530 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0603 | 8-9 | BOTTOM:511 \| TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0604 | 8-9 | BOTTOM:511 \| TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0605 | 8-9 | BOTTOM:511 \| TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0606 | 8-10 | BOTTOM:511 \| TOP:524 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0607 | 8-10 | BOTTOM:511 \| TOP:524 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0608 | 8-10 | BOTTOM:511 \| TOP:524 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0609 | 8-10 | BOTTOM:511 \| TOP:535 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0610 | 8-10 | BOTTOM:511 \| TOP:535 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0611 | 8-10 | BOTTOM:511 \| TOP:535 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0612 | 8-10 | BOTTOM:511 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0613 | 8-10 | BOTTOM:511 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0614 | 8-10 | BOTTOM:511 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0615 | 8-10 | BOTTOM:529 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0616 | 8-10 | BOTTOM:529 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0617 | 8-10 | BOTTOM:529 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0618 | 8-10 | BOTTOM:530 \| TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0619 | 8-10 | BOTTOM:530 \| TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0620 | 8-10 | BOTTOM:530 \| TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0621 | 9-9 | TOP:524 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0622 | 9-9 | TOP:535 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0623 | 9-9 | TOP:555 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0624 | 9-10 | TOP:524 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0625 | 9-10 | TOP:524 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0626 | 9-10 | TOP:524 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0627 | 9-10 | TOP:535 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0628 | 9-10 | TOP:535 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0629 | 9-10 | TOP:535 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0630 | 9-10 | TOP:555 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0631 | 9-10 | TOP:555 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0632 | 9-10 | TOP:555 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0633 | 9-10 | TOP:558 \| BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0634 | 9-10 | TOP:558 \| BOTTOM:595 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0635 | 9-10 | TOP:558 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0636 | 9-10 | TOP:558 \| BOTTOM:611 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0637 | 9-10 | TOP:558 \| BOTTOM:641 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0638 | 9-10 | TOP:583 \| BOTTOM:595 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0639 | 9-10 | TOP:583 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0640 | 9-10 | TOP:583 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0641 | 9-10 | TOP:583 \| BOTTOM:641 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0642 | 9-10 | TOP:594 \| BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0643 | 9-10 | TOP:594 \| BOTTOM:611 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0644 | 9-10 | TOP:594 \| BOTTOM:641 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0645 | 9-10 | TOP:605 \| BOTTOM:641 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0646 | 10-10 | BOTTOM:585 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0647 | 10-10 | BOTTOM:609 | NO | D5 | sourcePaths=1; resultingPaths=1 |
| S0648 | 10-10 | BOTTOM:611 | YES | D5 | sourcePaths=1; resultingPaths=1 |

## 3. Segments compatibles GT

| segmentId | positions | replacementPivots | gtCompatible | sourceDecision | provenance |
| --- | --- | --- | --- | --- | --- |
| S0002 | 1-1 | TOP:199 | YES | D1,D2,D3,D4,D5 | sourcePaths=3; resultingPaths=3 |
| S0068 | 2-3 | BOTTOM:262 \| TOP:291 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0124 | 3-3 | TOP:291 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0333 | 4-4 | BOTTOM:353 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0351 | 4-5 | BOTTOM:353 \| TOP:383 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0399 | 4-6 | BOTTOM:353 \| TOP:383 \| BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0453 | 4-7 | BOTTOM:353 \| TOP:383 \| BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0460 | 5-5 | TOP:383 | YES | D3,D4 | sourcePaths=2; resultingPaths=2 |
| S0497 | 5-6 | TOP:383 \| BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0517 | 5-7 | TOP:383 \| BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0524 | 6-6 | BOTTOM:445 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0531 | 6-7 | BOTTOM:445 \| TOP:474 | YES | D4 | sourcePaths=1; resultingPaths=1 |
| S0569 | 7-7 | TOP:474 | YES | D4,D5 | sourcePaths=2; resultingPaths=2 |
| S0636 | 9-10 | TOP:558 \| BOTTOM:611 | YES | D5 | sourcePaths=1; resultingPaths=1 |
| S0648 | 10-10 | BOTTOM:611 | YES | D5 | sourcePaths=1; resultingPaths=1 |

## 4. Couverture position par position

| position | gtPivot | compatibleSegmentIds | segmentCoverageCount | baseAlreadyGt | effectiveCoverage |
| --- | --- | --- | --- | --- | --- |
| 0 | BOTTOM:169 | NONE | 0 | YES | YES |
| 1 | TOP:199 | S0002 | 1 | NO | YES |
| 2 | BOTTOM:262 | S0068 | 1 | NO | YES |
| 3 | TOP:291 | S0068, S0124 | 2 | YES | YES |
| 4 | BOTTOM:353 | S0333, S0351, S0399, S0453 | 4 | NO | YES |
| 5 | TOP:383 | S0351, S0399, S0453, S0460, S0497, S0517 | 6 | NO | YES |
| 6 | BOTTOM:445 | S0399, S0453, S0497, S0517, S0524, S0531 | 6 | NO | YES |
| 7 | TOP:474 | S0453, S0517, S0531, S0569 | 4 | NO | YES |
| 8 | BOTTOM:529 | NONE | 0 | NO | NO |
| 9 | TOP:558 | S0636 | 1 | NO | YES |
| 10 | BOTTOM:611 | S0636, S0648 | 2 | NO | YES |

Positions sans segment brut: 0, 8. Positions sans couverture effective segment ou base: 8.

## 5. Recherche de combinaison

Recherche oracle limitée aux segments GT-compatibles, en ordre canonique croissant. Aucun TEMPORAL, SHAPE, ranking, nouveau segment ou exploration des faux segments. BFS par nombre de segments avec déduplication masque/dernier segment; chaque état appliqué au chemin de base et validé par `validPrefix`.

États oracle examinés=74. Cause si échec=MISSING_GT_SEGMENT_FOR_POSITION.

## 6. Nombre minimal de segments

minimumSegmentCount = N/A

Aucune combinaison exacte.

## 7. Provenance de la combinaison

Sans objet.

## 8. Validation structurelle

| basePath | targetPath | exactPathEqualsGroundTruth | fullStructuralValidation |
| --- | --- | --- | --- |
| BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:558\|BOTTOM:611 | NO | FAIL |

Aucun ajout rejoué.

## 9. Réponses Q1-Q9

| question | answer |
| --- | --- |
| Q1 Segments GT-compatibles | 15/648 |
| Q2 Chaque position couverte | NON — positions 8 |
| Q3 Combinaison exacte GT 11/11 | NON |
| Q4 Nombre minimal de segments | SANS OBJET |
| Q5 Segment IDs | SANS OBJET |
| Q6 Ordre chronologique sans conflit | NON |
| Q7 Validation structurelle finale | FAIL |
| Q8 Première impossibilité | MISSING_GT_SEGMENT_FOR_POSITION: positions 8 |
| Q9 Interprétation du garde précédent | TRUE_NON_COMPOSABILITY |

## 10. Verdict

**FULL_GT_BLOCKED_BY_MISSING_SEGMENT_COVERAGE**

FULL_GT_COMPOSABLE_FROM_EXISTING_SEGMENTS = NO

## 11. Conséquence pour la prochaine expérience

Observation uniquement: échec oracle classé MISSING_GT_SEGMENT_FOR_POSITION.

## Reproduction

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='FULL_GT_SEGMENT_COMPOSABILITY_ORACLE'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
