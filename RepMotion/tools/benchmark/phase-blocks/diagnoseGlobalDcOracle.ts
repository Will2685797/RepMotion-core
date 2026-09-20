/** ORACLE DIAGNOSTIC OFFLINE. Never used by the production pipeline. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { MotionSample } from "../../../mobile/RepMotion/analytics/calibration";
import { prepareLinearAcceleration1D } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import { estimateVelocity } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity";
import { signCounts, signCrossings, velocityAt } from "./diagnoseVelocity";

const ROOT = new URL("../../../", import.meta.url);
const OUTPUT = new URL("tools/benchmark/phase-blocks/output/global-dc-oracle/", ROOT);
const PRIOR = new URL("tools/benchmark/phase-blocks/output/velocity-diagnostic/velocity_diagnostic.json", ROOT);
const CONFIG = {
  baselineWindow: { startIndex: 0, endIndex: 100 },
  axisStrategy: { method: "pca" as const, referenceAxis: { x: 0, y: 0, z: 1 } },
  countsPerG: 16384,
};
const DT = 0.05;
type Source = { path: string; sha256: string };
type Interval = {
  label: string; start: number; end: number; indices: number[];
  startVideoSeconds: number; endVideoSeconds: number;
};
type PriorResult = {
  id: string; sampleCount: number; nominalDurationSeconds: number;
  datasetSource: Source; gtSource: Source & { annotationVersion: number | null };
  videoToImuOffsetSeconds: number;
  acceleration1D: number[]; velocity: number[];
  summary: { min: number; max: number; mean: number; final: number };
  movements: (Interval & { phase: "UP" | "DOWN"; correct: number; incorrect: number; zero: number; startVelocity: number; endVelocity: number })[];
  transitions: (Interval & { signChangeObserved: boolean | null })[];
  pivots: { label: string; arrival: number; departure: number | null }[];
};

function stats(values: readonly number[]) {
  if (!values.length) return null;
  let min = Infinity, max = -Infinity, sum = 0;
  for (const value of values) { assert.ok(Number.isFinite(value)); min = Math.min(min, value); max = Math.max(max, value); sum += value; }
  return { min, max, mean: sum / values.length };
}

function assertContainsPreviousMetrics(actual: object, expected: object) {
  for (const [key, value] of Object.entries(expected)) {
    assert.ok(key in actual, `Missing original diagnostic metric: ${key}`);
    assert.deepEqual(Reflect.get(actual, key), value, `Original diagnostic metric changed: ${key}`);
  }
}

/** Identical GT indices and shared sign/crossing/boundary rules for both variants. */
function evaluate(velocity: number[], prior: PriorResult) {
  const movements = prior.movements.map(p => {
    const counts = signCounts(velocity, p.indices);
    return { label: p.label, phase: p.phase, start: p.start, end: p.end, indices: p.indices,
      startVideoSeconds: p.startVideoSeconds, endVideoSeconds: p.endVideoSeconds,
      startVelocity: velocityAt(velocity, p.start), endVelocity: velocityAt(velocity, p.end),
      firstSampleVelocity: p.indices.length ? velocity[p.indices[0]] : null,
      lastSampleVelocity: p.indices.length ? velocity[p.indices[p.indices.length - 1]] : null,
      ...counts, correct: p.phase === "UP" ? counts.positive : counts.negative,
      incorrect: p.phase === "UP" ? counts.negative : counts.positive,
      sampleStatistics: stats(p.indices.map(i => velocity[i])), crossings: signCrossings(velocity, p.indices),
    };
  });
  const allCrossings = signCrossings(velocity, velocity.map((_, i) => i));
  const transitions = prior.transitions.map(p => {
    let closestIndex: number | null = null;
    for (const i of p.indices) if (closestIndex === null || Math.abs(velocity[i]) < Math.abs(velocity[closestIndex])) closestIndex = i;
    const crossings = signCrossings(velocity, p.indices);
    return { label: p.label, phase: "TRANSITION", start: p.start, end: p.end, indices: p.indices,
      startVideoSeconds: p.startVideoSeconds, endVideoSeconds: p.endVideoSeconds,
      n: p.indices.length, startVelocity: velocityAt(velocity, p.start), endVelocity: velocityAt(velocity, p.end),
      sampleStatistics: stats(p.indices.map(i => velocity[i])), closestIndex,
      closestVelocity: closestIndex === null ? null : velocity[closestIndex],
      signChangeObserved: p.indices.length < 2 ? null : crossings.length > 0, crossings,
      exactZeroIndices: p.indices.filter(i => velocity[i] === 0),
      // Supplementary readout only. Does not change the prior internal-window criterion.
      interpolatedRootsInWindow: allCrossings.filter(c => c.crossingIndex >= p.start && c.crossingIndex <= p.end),
    };
  });
  const firstArrivalVelocity = velocityAt(velocity, prior.pivots[0].arrival);
  let previous = firstArrivalVelocity;
  const pivots = prior.pivots.map(p => {
    const boundary = p.departure ?? p.arrival;
    const value = velocityAt(velocity, boundary);
    const firstAfterIndex = Math.floor(boundary) + 1;
    const result = { ...p, arrivalVelocity: velocityAt(velocity, p.arrival),
      departureVelocity: p.departure === null ? null : value,
      referenceBoundary: p.departure === null ? "final arrival; departure absent" : "departure",
      firstAfterIndex, firstAfterVelocity: velocity[firstAfterIndex] ?? null,
      apparentOffsetFromInitialZero: value - velocity[0],
      changeSincePreviousPivotBoundary: value - previous,
      cumulativeChangeSinceFirstArrival: value - firstArrivalVelocity,
    };
    previous = value;
    return result;
  });
  const aggregates = ["UP", "DOWN"].map(phase => {
    const counts = signCounts(velocity, movements.filter(p => p.phase === phase).flatMap(p => p.indices));
    const correct = phase === "UP" ? counts.positive : counts.negative;
    const incorrect = phase === "UP" ? counts.negative : counts.positive;
    return { phase, ...counts, correct, incorrect, correctProportion: correct / counts.n, incorrectProportion: incorrect / counts.n };
  });
  const pivotValues = pivots.map(p => p.departureVelocity ?? p.arrivalVelocity);
  return {
    summary: { ...stats(velocity)!, initial: velocity[0], final: velocity[velocity.length - 1],
      apparentCumulativeDrift: velocity[velocity.length - 1] - velocity[0],
      firstPivotArrivalVelocity: firstArrivalVelocity,
      finalPivotArrivalVelocity: pivots[pivots.length - 1].arrivalVelocity,
      pivotSpanApparentDrift: pivots[pivots.length - 1].arrivalVelocity - firstArrivalVelocity,
      meanAbsolutePivotResidual: pivotValues.reduce((s, v) => s + Math.abs(v), 0) / pivotValues.length,
      maxAbsolutePivotResidual: Math.max(...pivotValues.map(Math.abs)),
      balancedSignConcordance: (aggregates[0].correctProportion + aggregates[1].correctProportion) / 2,
    }, movements, transitions, pivots, aggregates, allCrossings,
    exactZeroIndices: velocity.flatMap((v, i) => v === 0 ? [i] : []), velocity,
  };
}

const priorBytes = readFileSync(PRIOR);
const prior = JSON.parse(priorBytes.toString("utf8")) as { configuration: unknown; results: PriorResult[] };
assert.deepEqual(prior.configuration, { ...CONFIG, dtSeconds: DT });
const results = prior.results.map(p => {
  for (const source of [p.datasetSource, p.gtSource]) {
    assert.equal(createHash("sha256").update(readFileSync(new URL(source.path, ROOT))).digest("hex"), source.sha256, `Source changed: ${source.path}`);
  }
  const dataset = JSON.parse(readFileSync(new URL(p.datasetSource.path, ROOT), "utf8")) as { samples: MotionSample[] };
  const prepared = prepareLinearAcceleration1D(dataset.samples, CONFIG);
  // Exact reproducibility of the original preparation and integration is required.
  assert.deepEqual(prepared.acceleration1D, p.acceleration1D);
  const originalVelocity = estimateVelocity(prepared.acceleration1D, DT);
  assert.deepEqual(originalVelocity, p.velocity);
  const meanAcceleration = stats(prepared.acceleration1D)!.mean;
  const correctedAcceleration = prepared.acceleration1D.map(value => value - meanAcceleration);
  const correctedVelocity = estimateVelocity(correctedAcceleration, DT);
  assert.equal(correctedVelocity[0], 0);
  // Numerical consistency checks only, never used to classify a sign or a phase.
  correctedVelocity.forEach((v, i) => assert.ok(Math.abs(v - (originalVelocity[i] - meanAcceleration * i * DT)) < 1e-10));
  const endpointResidualExpected = DT * (meanAcceleration - (prepared.acceleration1D[0] + prepared.acceleration1D[prepared.acceleration1D.length - 1]) / 2);
  assert.ok(Math.abs(correctedVelocity[correctedVelocity.length - 1] - endpointResidualExpected) < 1e-10);
  const A = evaluate(originalVelocity, p);
  const B = evaluate(correctedVelocity, p);
  assertContainsPreviousMetrics(A.summary, p.summary);
  A.movements.forEach((row, i) => assertContainsPreviousMetrics(row, p.movements[i]));
  A.transitions.forEach((row, i) => assertContainsPreviousMetrics(row, p.transitions[i]));
  A.pivots.forEach((row, i) => assertContainsPreviousMetrics(row, p.pivots[i]));
  const movementIndices = p.movements.flatMap(row => row.indices);
  const flips = { correctToIncorrect: 0, incorrectToCorrect: 0, involvingExactZero: 0 };
  for (const row of p.movements) for (const i of row.indices) {
    const a = Math.sign(originalVelocity[i]), b = Math.sign(correctedVelocity[i]);
    if (a === b) continue;
    if (a === 0 || b === 0) { flips.involvingExactZero += 1; continue; }
    const expected = row.phase === "UP" ? 1 : -1;
    if (b === expected) flips.incorrectToCorrect += 1;
    else flips.correctToIncorrect += 1;
  }
  return { id: p.id, sampleCount: p.sampleCount, durationSeconds: p.nominalDurationSeconds,
    datasetSource: p.datasetSource, gtSource: p.gtSource, videoToImuOffsetSeconds: p.videoToImuOffsetSeconds,
    baseline: prepared.baseline, movementAxis: prepared.movementAxis, signConvention: prepared.signConvention,
    meanAccelerationRemoved: meanAcceleration, meanCorrectedAcceleration: stats(correctedAcceleration)!.mean,
    nominalMeanTimesDuration: meanAcceleration * p.nominalDurationSeconds,
    endpointResidualExpected, acceleration1D: prepared.acceleration1D, correctedAcceleration,
    movementSampleCount: movementIndices.length, flips, A, B,
  };
});

type Result = typeof results[number];
type Variant = Result["A"];
const f = (v: number | null | undefined, digits = 6) => v == null ? "N/D" : v.toFixed(digits);
const pct = (n: number, total: number) => total ? `${f(n / total * 100, 2)} %` : "N/D";
const span = (indices: number[]) => indices.length ? `${indices[0]}–${indices[indices.length - 1]}` : "aucun";
const crossText = (crossings: ReturnType<typeof signCrossings>) => crossings.length ? crossings.map(c => `${c.leftIndex}→${c.rightIndex} (${c.direction === "negative-to-positive" ? "−→+" : "+→−"}; i≈${f(c.crossingIndex, 3)})`).join(" ; ") : "aucun";
const table = (headers: string[], rows: (string | number)[][]) => [
  `| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map(row => `| ${row.join(" | ")} |`),
].join("\n");

function comparisonChart(r: Result): string {
  const left = 75, top = 35, w = 1000, h = 225;
  const lo = Math.min(0, r.A.summary.min, r.B.summary.min) - 0.15;
  const hi = Math.max(0, r.A.summary.max, r.B.summary.max) + 0.15;
  const x = (i: number) => left + i / (r.sampleCount - 1) * w;
  const y = (v: number) => top + (hi - v) / (hi - lo) * h;
  const bands = [...r.A.movements.map(p => ({ ...p, color: p.phase === "UP" ? "#dbeafa" : "#ffe8c9" })), ...r.A.transitions.map(p => ({ ...p, color: "#e3d5ed" }))]
    .map(p => `<rect x="${x(p.start)}" y="${top}" width="${x(p.end) - x(p.start)}" height="${h}" fill="${p.color}"/>`).join("");
  const traces = [[r.A, "#273b53"], [r.B, "#c1272d"]] as const;
  const paths = traces.map(([v, color]) => `<polyline fill="none" stroke="${color}" stroke-width="1.6" points="${v.velocity.map((value, i) => `${f(x(i), 2)},${f(y(value), 2)}`).join(" ")}"/>`).join("");
  const ticks = Array.from({ length: 6 }, (_, i) => {
    const v = lo + (hi - lo) * i / 5;
    return `<line x1="${left}" x2="${left + w}" y1="${y(v)}" y2="${y(v)}" stroke="#ddd"/><text x="65" y="${y(v) + 4}" text-anchor="end">${f(v, 2)}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="330" viewBox="0 0 1100 330" role="img" aria-label="Comparaison oracle DC ${r.id}"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="12" fill="#222"><text x="75" y="20">${r.id} — ORACLE DIAGNOSTIC OFFLINE — vitesse en m/s ; A originale : bleu foncé ; B sans DC global : rouge</text>${bands}${ticks}<line x1="${left}" x2="${left + w}" y1="${y(0)}" y2="${y(0)}" stroke="#111" stroke-dasharray="5 3"/>${paths}${Array.from({ length: 7 }, (_, i) => `<text x="${x((r.sampleCount - 1) * i / 6)}" y="283" text-anchor="middle">${f(r.durationSeconds * i / 6, 1)} s</text>`).join("")}<text x="75" y="310">Bandes GT uniquement : bleu clair UP ; orange DOWN ; violet TRANSITION. Temps IMU nominal.</text></g></svg>`;
}

function variantRows(r: Result, render: (v: Variant, name: string) => (string | number)[]) {
  return [render(r.A, "A"), render(r.B, "B")];
}

const report = [
  "# Suppression du biais DC global — ORACLE DIAGNOSTIC OFFLINE", "",
  "A = vitesse originale. B = intégration de `acceleration1D − moyenneGlobale(acceleration1D)`. Cette expérience utilise toute la capture future ; elle n'est pas une solution temps réel. Aucun algorithme de production, aucune constante existante ni GT n'a été modifié.", "",
  "## Protocole inchangé", "",
  "Préparation identique : baseline `[0,100)` (**candidate rest window**, pas repos certifié), PCA sur toute la capture, référence géométrique +Z, 16384 counts/g nominal, dt=0.05 s nominal. `velocity[0]=0` pour A et B. La moyenne retirée est la moyenne arithmétique des N accélérations préparées, sans pondération ni ajustement d'après les GT.", "",
  "Les sources et indices GT proviennent du diagnostic précédent, vérifié par empreintes SHA-256 ; préparation et vitesse A reproduites exactement. 007 utilise `transition-annotations.json` sans version déclarée ; 009/010 utilisent leurs fichiers V2. Aucune nouvelle annotation ni réorientation d'axe à partir des GT.", "",
  "UP/DOWN : samples strictement dans `(departure, arrival)`. TRANSITION : samples dans `[arrival, departure]`. Indices entiers internes, sans arrondi au plus proche et sans élargissement ; mêmes temps vidéo et offsets. Vitesses aux frontières fractionnaires interpolées linéairement uniquement pour leur lecture, sans modifier le signal ni les proportions. Pour B6 sans departure, aucun intervalle suivant n'est créé.", "",
  "Concordance conventionnelle : UP avec v>0, DOWN avec v<0 ; v==0 séparé, sans epsilon. Crossing interne : deux signes opposés encadrants entièrement dans la fenêtre, éventuellement via des samples exactement nuls. Index fractionnaire du crossing par interpolation linéaire. Une fenêtre de moins de deux samples a un résultat N/D pour l'inversion, pas une absence prouvée. Les racines interpolées dans la fenêtre sont fournies séparément comme information complémentaire.", "",
  "Les affichages sont arrondis ; tous les calculs de signe emploient les valeurs non arrondies. Les tolérances des assertions servent uniquement à vérifier les identités numériques, jamais à définir une phase ou un signe.", "",
  "## FACT — moyenne retirée et fermeture de l'intégrale", "",
  table(["Dataset", "Moyenne retirée (m/s²)", "Durée (s)", "Moyenne × durée (m/s)", "v finale A", "v finale B"], results.map(r => [r.id, f(r.meanAccelerationRemoved, 9), f(r.durationSeconds, 2), f(r.nominalMeanTimesDuration, 9), f(r.A.summary.final, 9), f(r.B.summary.final, 9)])), "",
  "Identité vérifiée à chaque sample : `vB[i] = vA[i] − meanAcceleration × i × dt`. La proximité de la vitesse finale B avec zéro est donc largement imposée par l'expérience, pas une validation indépendante de la fidélité à la GT.", "",
  "La moyenne est arithmétique et l'intégration trapézoïdale : vB finale n'est pas forcément exactement nulle. Le résidu attendu est `dt × (meanAcceleration − (acceleration1D[0] + acceleration1D[N−1])/2)`. Cette identité est vérifiée, sans correction supplémentaire.", "",
  "## FACT — comparaison globale", "",
  table(["Dataset", "Variante", "v min", "v max", "v moyenne", "v finale", "UP correct", "DOWN correct", "Concordance équilibrée UP/DOWN"], results.flatMap(r => variantRows(r, (v, name) => [r.id, name, f(v.summary.min), f(v.summary.max), f(v.summary.mean), f(v.summary.final), pct(v.aggregates[0].correct, v.aggregates[0].n), pct(v.aggregates[1].correct, v.aggregates[1].n), `${f(v.summary.balancedSignConcordance * 100, 2)} %`]))), "",
  "La concordance équilibrée est la moyenne des deux proportions UP et DOWN, pour éviter qu'une longue descente masque un échec des montées. Les pourcentages par direction sont pondérés par les samples, pas par les phases.", "",
  table(["Dataset", "Variante", "Phase", "N", "Corrects", "Incorrects", "Zéros"], results.flatMap(r => [r.A, r.B].flatMap((v, i) => v.aggregates.map(a => [r.id, i ? "B" : "A", a.phase, a.n, `${a.correct} (${pct(a.correct, a.n)})`, `${a.incorrect} (${pct(a.incorrect, a.n)})`, `${a.zero} (${pct(a.zero, a.n)})`])))), "",
  table(["Dataset", "Samples incorrects A → corrects B", "Samples corrects A → incorrects B", "Changements impliquant zéro exact"], results.map(r => [r.id, r.flips.incorrectToCorrect, r.flips.correctToIncorrect, r.flips.involvingExactZero])), "",
  table(["Dataset", "Variante", "Crossings capture", "Transitions avec crossing / évaluables", "Transitions <2 samples", "Moyenne |résidu pivot|", "Max |résidu pivot|", "Δv arrival B1→B6"], results.flatMap(r => variantRows(r, (v, name) => [r.id, name, v.allCrossings.length, `${v.transitions.filter(t => t.signChangeObserved).length}/${v.transitions.filter(t => t.n >= 2).length}`, v.transitions.filter(t => t.n < 2).length, f(v.summary.meanAbsolutePivotResidual), f(v.summary.maxAbsolutePivotResidual), f(v.summary.pivotSpanApparentDrift)]))), "",
  "Résidus aux pivots : departure de chacun des dix pivots avec départ, puis arrival B6 ; agrégats non pondérés sur ces onze valeurs, en m/s. Leur valeur absolue est une métrique de résidu, pas un traitement du signal.", "",
];

for (const r of results) {
  report.push(`## Dataset ${r.id}`, "", `![A et B face aux GT](velocity_dc_${r.id}.svg)`, "",
    `Baseline RAW XYZ = (${f(r.baseline.x, 2)}, ${f(r.baseline.y, 2)}, ${f(r.baseline.z, 2)}). Axe PCA = (${f(r.movementAxis.x, 9)}, ${f(r.movementAxis.y, 9)}, ${f(r.movementAxis.z, 9)}). Offset vidéo−IMU = ${f(r.videoToImuOffsetSeconds, 3)} s. Moyenne après soustraction = ${r.meanCorrectedAcceleration} m/s² (arrondi flottant).`, "",
    "### Phases de mouvement — A/B", "",
    table(["Phase / trajet", "A/B", "Vidéo début→fin (s)", "Indices GT", "Samples / N", "v début", "v fin", "v moyenne interne", "v>0", "v<0", "v==0", "Correct / incorrect"], r.A.movements.flatMap((p, i) => [p, r.B.movements[i]].map((q, k) => [
      `${q.phase} ${q.label}`, k ? "B" : "A", `${f(q.startVideoSeconds, 3)}→${f(q.endVideoSeconds, 3)}`, `(${f(q.start, 3)}, ${f(q.end, 3)})`, `${span(q.indices)} / ${q.n}`,
      f(q.startVelocity), f(q.endVelocity), f(q.sampleStatistics?.mean), `${q.positive} (${pct(q.positive, q.n)})`, `${q.negative} (${pct(q.negative, q.n)})`, `${q.zero} (${pct(q.zero, q.n)})`, `${q.correct} / ${q.incorrect}`,
    ]))), "",
    "### Transitions — A/B", "",
    table(["Pivot", "A/B", "Vidéo arrival→departure (s)", "Indices GT", "Samples / N", "v arrival", "v departure", "v min", "v max", "v la plus proche de 0 @ index", "Crossing interne", "Racines interpolées dans fenêtre"], r.A.transitions.flatMap((p, i) => [p, r.B.transitions[i]].map((q, k) => [
      q.label, k ? "B" : "A", `${f(q.startVideoSeconds, 3)}→${f(q.endVideoSeconds, 3)}`, `[${f(q.start, 3)}, ${f(q.end, 3)}]`, `${span(q.indices)} / ${q.n}`, f(q.startVelocity), f(q.endVelocity), f(q.sampleStatistics?.min), f(q.sampleStatistics?.max),
      q.closestIndex === null ? "N/D" : `${f(q.closestVelocity)} @ ${q.closestIndex}`, q.signChangeObserved === null ? "N/D (<2 samples)" : crossText(q.crossings), crossText(q.interpolatedRootsInWindow),
    ]))), "",
    "### Résidus aux pivots — A → B", "",
    table(["Pivot", "arrival (index)", "departure (index)", "v arrival A → B", "v departure A → B", "1er sample après borne", "v après A → B", "Δv depuis pivot précédent A → B", "Δv depuis arrival B1 A → B"], r.A.pivots.map((p, i) => {
      const q = r.B.pivots[i];
      return [p.label, f(p.arrival, 3), f(p.departure, 3), `${f(p.arrivalVelocity)} → ${f(q.arrivalVelocity)}`, `${f(p.departureVelocity)} → ${f(q.departureVelocity)}`, p.firstAfterIndex, `${f(p.firstAfterVelocity)} → ${f(q.firstAfterVelocity)}`, `${f(p.changeSincePreviousPivotBoundary)} → ${f(q.changeSincePreviousPivotBoundary)}`, `${f(p.cumulativeChangeSinceFirstArrival)} → ${f(q.cumulativeChangeSinceFirstArrival)}`];
    })), "",
    `v[0] A/B = ${f(r.A.summary.initial)} / ${f(r.B.summary.initial)}. v finale A/B = ${f(r.A.summary.final)} / ${f(r.B.summary.final)} m/s. B6 utilise arrival uniquement, sans phase suivante.`, "",
    "### Tous les crossings — A/B", "",
    table(["Variante", "Samples encadrants", "Sens", "Index fractionnaire", "Localisation", "Intervalle GT contenant les deux bornes"], [r.A, r.B].flatMap((v, i) => v.allCrossings.map(c => [i ? "B" : "A", `${c.leftIndex}→${c.rightIndex}`, c.direction === "negative-to-positive" ? "−→+" : "+→−", f(c.crossingIndex), c.location, [...v.movements, ...v.transitions].filter(p => p.indices.includes(c.leftIndex) && p.indices.includes(c.rightIndex)).map(p => `${p.phase} ${p.label}`).join(" ; ") || "hors intervalle interne / frontière"]))), "",
    `Samples exactement nuls : A = ${r.A.exactZeroIndices.join(", ") || "aucun"} ; B = ${r.B.exactZeroIndices.join(", ") || "aucun"}. Le sample 0 est imposé nul, pas un crossing.`, "",
  );
}

const [r007, r009, r010] = results;
report.push(
  "## Conclusion — FACT", "",
  "**Non, retirer seulement la moyenne globale ne restaure pas fortement et uniformément la correspondance velocity/GT. L'effet est important sur certaines erreurs, surtout l'effondrement des montées de 010, mais les erreurs restantes sont substantielles et certaines augmentent.**", "",
  `007 : concordance équilibrée ${f(r007.A.summary.balancedSignConcordance * 100, 2)} → ${f(r007.B.summary.balancedSignConcordance * 100, 2)} %. UP s'améliore et DOWN se dégrade. Le nombre total de samples de mouvement corrects passe de ${r007.A.aggregates.reduce((s, a) => s + a.correct, 0)} à ${r007.B.aggregates.reduce((s, a) => s + a.correct, 0)} sur ${r007.movementSampleCount}. Le résidu absolu moyen aux pivots augmente (${f(r007.A.summary.meanAbsolutePivotResidual)} → ${f(r007.B.summary.meanAbsolutePivotResidual)} m/s). Après soustraction, UP2 ne comporte que 4/25 samples positifs ; DOWN4 et DOWN5 ne comportent que 7/51 et 5/51 samples négatifs.`, "",
  `009 : concordance équilibrée ${f(r009.A.summary.balancedSignConcordance * 100, 2)} → ${f(r009.B.summary.balancedSignConcordance * 100, 2)} %. Gain net : ${r009.flips.incorrectToCorrect} samples deviennent corrects, ${r009.flips.correctToIncorrect} deviennent incorrects. DOWN progresse, mais UP recule. UP2 reste entièrement négatif (0/4 corrects), sur la fenêtre GT de 0.25 s inchangée. Le résidu absolu moyen aux pivots baisse à ${f(r009.B.summary.meanAbsolutePivotResidual)} m/s, mais le maximum augmente à ${f(r009.B.summary.maxAbsolutePivotResidual)} m/s.`, "",
  `010 : concordance équilibrée ${f(r010.A.summary.balancedSignConcordance * 100, 2)} → ${f(r010.B.summary.balancedSignConcordance * 100, 2)} %. Les montées passent de 9.60 % à 88.00 % de concordance et leur vitesse moyenne devient positive pour chacune des cinq répétitions. Les descentes passent de 100 % à 60.73 % ; DOWN2 reste négatif seulement sur 2/46 samples et DOWN4 sur 3/41. Le résidu absolu moyen aux pivots diminue de ${f(r010.A.summary.meanAbsolutePivotResidual)} à ${f(r010.B.summary.meanAbsolutePivotResidual)} m/s, sans devenir nul.`, "",
  "Transitions : A n'avait aucun crossing interne dans les 16 fenêtres évaluables. B en présente un seul, à B4 de 007, entre 442 et 443 (−→+, index interpolé 442.318928). Pour 009, deux racines interpolées se trouvent dans T1 et T4 (218.365761 et 448.570998), mais ces fenêtres contiennent respectivement zéro et un sample : ce ne sont pas deux inversions internes observables au critère original. 010 n'a aucun crossing interne ni racine interpolée dans ses transitions. Les 14 fenêtres trop courtes restent N/D pour l'inversion interne.", "",
  "Les vitesses finales proches de zéro après soustraction ne sont pas une preuve indépendante d'un biais capteur constant : c'est l'effet attendu de la suppression de la moyenne sur la même capture intégrée. Les écarts restants aux pivots et les erreurs de signe au milieu des captures démontrent que fermer presque l'intégrale finale ne suffit pas à reproduire le mouvement GT.", "",
  "## Conclusion — INFERENCE", "",
  "Un décalage constant de l'accélération est un facteur important de l'offset séculaire observé, particulièrement pour 010 : sa suppression rétablit une grande partie des montées positives et réduit fortement les résidus aux pivots. L'expérience soutient donc l'importance de l'estimation du zéro d'accélération, sans établir que ce soit l'unique problème ni le problème principal commun aux trois captures.", "",
  "La correspondance restant faible sur certaines descentes, et la suppression pouvant dégrader 007, un unique biais DC égal à la moyenne globale ne suffit pas à expliquer les échecs du signe. La relation drift≈meanAcceleration×duration est en grande partie une identité de l'intégration, pas une identification causale du biais.", "",
  "## Conclusion — UNKNOWN", "",
  "- La moyenne globale n'est pas une mesure indépendante du biais statique. Elle peut inclure une vraie variation nette de vitesse, des mouvements avant/après la série et des contributions dues à l'orientation ; cette expérience ne les sépare pas.",
  "- La candidate rest window n'est pas certifiée et v[0]=0 reste imposé. Le niveau initial réel et le biais aux différents instants ne sont pas connus.",
  "- Les résidus variables, leurs changements de signe entre pivots et les erreurs locales persistantes sont compatibles avec un biais non constant, une orientation variable, une direction fixe insuffisante ou une autre différence entre mesure et mouvement annoté. Ils ne permettent pas d'identifier lequel de ces phénomènes domine.",
  "- Les limites du dt nominal, des samples éventuellement perdus et de l'alignement GT/IMU demeurent. La sensibilité est nominale ; une simple erreur d'échelle positive uniforme ne change pas seule les signes.",
  "- Les fenêtres sub-sample limitent l'observation des crossings. Les racines interpolées ne constituent pas une mesure temporelle plus précise et ne remplacent pas des samples acquis.", "",
  "Aucune correction supplémentaire, aucun seuil ni traitement de phase n'est proposé ou ajouté. Fin de l'expérience offline.", "",
  "## Traçabilité", "", "Les données JSON associées contiennent A et B, les accélérations avant/après, tous les indices et métriques non arrondies. Les sources sont vérifiées par SHA-256 ; A est comparée bit pour bit au diagnostic précédent, et la transformation B est vérifiée à chaque sample par l'identité vB=vA−mean×t. Tous les champs des anciens résumés, phases, transitions et pivots sont vérifiés identiques pour A.", "",
  "Reproduction depuis la racine :", "", "```powershell", "node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnoseGlobalDcOracle.ts", "```", "");

mkdirSync(OUTPUT, { recursive: true });
for (const r of results) writeFileSync(new URL(`velocity_dc_${r.id}.svg`, OUTPUT), comparisonChart(r));
writeFileSync(new URL("global_dc_oracle.json", OUTPUT), JSON.stringify({
  experiment: "ORACLE DIAGNOSTIC OFFLINE; arithmetic global mean subtraction only",
  configuration: { ...CONFIG, dtSeconds: DT }, priorDiagnosticSha256: createHash("sha256").update(priorBytes).digest("hex"), results,
}, null, 2) + "\n");
writeFileSync(new URL("global_dc_oracle.md", OUTPUT), report.join("\n"));
console.log(JSON.stringify(results.map(r => ({ id: r.id, meanRemoved: r.meanAccelerationRemoved, endpointResidualExpected: r.endpointResidualExpected,
  A: { summary: r.A.summary, aggregates: r.A.aggregates, crossings: r.A.allCrossings.length, transitionCrossings: r.A.transitions.filter(t => t.signChangeObserved).map(t => t.label) },
  B: { summary: r.B.summary, aggregates: r.B.aggregates, crossings: r.B.allCrossings.length, transitionCrossings: r.B.transitions.filter(t => t.signChangeObserved).map(t => t.label) }, flips: r.flips,
})), null, 2));
console.log(`Report: ${fileURLToPath(new URL("global_dc_oracle.md", OUTPUT))}`);
