import { BenchmarkParameters } from "./types";

// Génère toutes les combinaisons possibles entre les valeurs de durée de rep, concentrique et excentrique.
export function generateParameterGrid(): BenchmarkParameters[] {
  const minRepDurations = [35, 40, 45, 50, 55];
  const minConcentricDurations = [6, 8, 10];
  const minEccentricDurations = [6, 8, 10];

  const grid: BenchmarkParameters[] = [];

  for (const minRepDuration of minRepDurations) {
    for (const minConcentricDuration of minConcentricDurations) {
      for (const minEccentricDuration of minEccentricDurations) {
        grid.push({
          minRepDuration,
          minConcentricDuration,
          minEccentricDuration,
        });
      }
    }
  }

  return grid;
}