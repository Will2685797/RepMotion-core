# System C — reconstruction conditionnelle et progressive

`buildConditionalAlternatives.ts` construit les alternatives conditionnelles.
Cette admission est utilisée lors de la promotion dans A comme dans C.

L'exécution C est `runDelayed(..., true)` dans `../../delayedContextPath.ts`.
Elle utilise le même moteur que A et active en plus le bloc progressif déjà
présent dans `../shared/reconstructLocalPaths.ts`.
La sélection et les types communs sont dans `../shared/`.

Le bloc progressif reste dans sa fonction existante : ce déplacement structurel
ne sépare pas les boucles et ne change ni leurs captures ni leur ordre.
