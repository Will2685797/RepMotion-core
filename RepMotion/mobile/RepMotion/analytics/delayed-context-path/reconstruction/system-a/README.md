# System A — reconstruction locale

L'exécution A est `runDelayed(..., false)` dans `../../delayedContextPath.ts`.
Elle utilise l'énumération locale de longueurs 2/3/4 et les réparations couplées
de `../shared/reconstructLocalPaths.ts`, puis la sélection partagée dans
`../shared/selectLocalReconstruction.ts`.

Ces fonctions sont également appelées par C : elles restent dans `shared/`.
Ce dossier identifie la responsabilité A sans dupliquer le moteur, extraire
des boucles ni introduire une nouvelle façade d'exécution.
