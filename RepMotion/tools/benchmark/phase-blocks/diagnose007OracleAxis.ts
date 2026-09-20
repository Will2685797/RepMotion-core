/** 007 only: existing oracle, polarity and axis diagnostics. No new correction. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { MotionSample } from "../../../mobile/RepMotion/analytics/calibration";
import { prepareLinearAcceleration1D } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import { estimateVelocity } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity";
import { gtOracle, piecewiseValue } from "./compareSimpleDrift";
import { signCounts } from "./diagnoseVelocity";

const ROOT = new URL("../../../", import.meta.url);
const OUTPUT = new URL("tools/benchmark/phase-blocks/output/007-oracle-axis/", ROOT);
const dt = 0.05;
type Point = { index: number; value: number };
type Phase = { label: string; phase: "UP" | "DOWN"; start: number; end: number; indices: number[] };
type Source = { path: string; sha256: string };
type Prior = { id: string; datasetSource: Source; gtSource: Source; C: {
  velocity: number[]; curve: Point[]; movements: Phase[];
  pivots: { arrival: number; departure: number | null }[];
} };
function area(curve: readonly Point[], start: number, end: number) {
  const points = [{ index: start, value: piecewiseValue(curve, start) },
    ...curve.filter(p => p.index > start && p.index < end),
    { index: end, value: piecewiseValue(curve, end) }];
  return points.slice(1).reduce((sum, p, i) => sum + (points[i].value + p.value) / 2 * (p.index - points[i].index) * dt, 0);
}
// Exact trapezoid integration of the represented polyline, including partial edges.
assert.equal(area([{ index: 0, value: 0 }, { index: 1, value: 2 }, { index: 2, value: 0 }], 0, 2), 0.1);
assert.equal(area([{ index: 0, value: 2 }, { index: 2, value: 2 }], 0.5, 1.5), 0.1);
const priorBytes = readFileSync(new URL("tools/benchmark/phase-blocks/output/simple-drift-comparison/simple_drift_comparison.json", ROOT));
const prior = (JSON.parse(priorBytes.toString("utf8")) as { results: Prior[] }).results.find(r => r.id === "007")!;
assert.ok(prior);
for (const source of [prior.datasetSource, prior.gtSource]) {
  assert.equal(createHash("sha256").update(readFileSync(new URL(source.path, ROOT))).digest("hex"), source.sha256);
}
const samples = JSON.parse(readFileSync(new URL(prior.datasetSource.path, ROOT), "utf8")).samples as MotionSample[];
const common = { baselineWindow: { startIndex: 0, endIndex: 100 }, countsPerG: 16384 };
const pca = prepareLinearAcceleration1D(samples, { ...common, axisStrategy: { method: "pca", referenceAxis: { x: 0, y: 0, z: 1 } } });
const z = prepareLinearAcceleration1D(samples, { ...common, axisStrategy: { method: "explicit", axis: { x: 0, y: 0, z: 1 } } });
assert.deepEqual(pca.baseline, z.baseline);
const positions = prior.C.pivots.flatMap(p => p.departure === null ? [p.arrival] : [p.arrival, p.departure]);
const pcaOracle = gtOracle(estimateVelocity(pca.acceleration1D, dt), positions);
const zOracle = gtOracle(estimateVelocity(z.acceleration1D, dt), positions);
assert.deepEqual(pcaOracle.velocity, prior.C.velocity);
assert.deepEqual(pcaOracle.curve, prior.C.curve);

const variants = [
  { name: "PCA", oracle: pcaOracle }, { name: "Z", oracle: zOracle },
].flatMap(({ name, oracle }) => [false, true].map(flipped => {
  const velocity = flipped ? oracle.velocity.map(v => -v) : oracle.velocity;
  const curve = flipped ? oracle.curve.map(p => ({ index: p.index, value: -p.value })) : oracle.curve;
  const phases = prior.C.movements.map(p => {
    const counts = signCounts(velocity, p.indices);
    const values = p.indices.map(i => velocity[i]);
    const vertices = curve.filter(q => q.index >= p.start && q.index <= p.end).map(q => q.value);
    const signedAreaMeters = area(curve, p.start, p.end);
    const durationSeconds = (p.end - p.start) * dt;
    return { label: p.label, phase: p.phase, start: p.start, end: p.end, indices: p.indices, durationSeconds,
      ...counts, min: Math.min(...vertices), max: Math.max(...vertices), mean: values.reduce((s, v) => s + v, 0) / values.length,
      signedAreaMeters, timeMeanVelocity: signedAreaMeters / durationSeconds,
      correct: p.phase === "UP" ? counts.positive : counts.negative,
    };
  });
  const metrics = ["UP", "DOWN"].map(phase => {
    const rows = phases.filter(p => p.phase === phase);
    const n = rows.reduce((s, p) => s + p.n, 0);
    return { phase, n, positive: rows.reduce((s, p) => s + p.positive, 0), negative: rows.reduce((s, p) => s + p.negative, 0),
      zero: rows.reduce((s, p) => s + p.zero, 0), concordance: rows.reduce((s, p) => s + p.correct, 0) / n,
      signedAreaMeters: rows.reduce((s, p) => s + p.signedAreaMeters, 0) };
  });
  return { name: name + (flipped ? " inversée" : ""), flipped, phases, metrics,
    balanced: (metrics[0].concordance + metrics[1].concordance) / 2, velocity, curve };
}));
for (let pair = 0; pair < 4; pair += 2) {
  variants[pair].phases.forEach((p, i) => {
    const q = variants[pair + 1].phases[i];
    assert.equal(p.positive, q.negative); assert.equal(p.negative, q.positive);
    assert.equal(q.signedAreaMeters, -p.signedAreaMeters);
  });
}
const f = (v: number, digits = 6) => v.toFixed(digits);
const pct = (v: number) => `${f(v * 100, 2)} %`;
const table = (headers: string[], rows: (string | number)[][]) => [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map(row => `| ${row.join(" | ")} |`)].join("\n");
const report = [
  "# 007 — oracle zero-velocity, polarité et projection", "",
  "## FACT", "",
  "Diagnostic 007 uniquement. Aucun nouveau filtre, paramètre ou correction : réutilisation exacte de l'oracle existant. Baseline candidate [0,100), countsPerG=16384 nominal, dt=0.05 s nominal. PCA alignée géométriquement sur +Z ; comparaison à Z explicite. L'inversion applique uniquement vFlipped=−v, après oracle. Z inversée est aussi affichée pour rendre la comparaison symétrique, sans ajustement de signe par phase.", "",
  "Intervalles de mouvement : departure du pivot précédent → arrival du suivant, exactement comme avant. Proportions et moyenne arithmétique sur les samples strictement internes. Min/max sur la courbe oracle dans l'intervalle fermé, incluant ses bornes contraintes à zéro. Aucun seuil de signe. L'oracle impose zéro aux arrival/departure exacts, y compris fractionnaires ; B6 n'a pas de departure inventé.", "",
  "Aire signée : somme trapézoïdale sur les nœuds de la courbe oracle, bornes GT exactes incluses et pas réel de chaque segment égal à Δindex×0.05. Cette intégrale est exacte pour la courbe linéaire représentée, mais n'est qu'un déplacement relatif estimé en mètres sous les hypothèses physiques du signal. La moyenne temporelle aire/durée est aussi fournie ; elle diffère légèrement de la moyenne des samples internes.", "",
  `Baseline RAW = (${f(pca.baseline.x, 2)}, ${f(pca.baseline.y, 2)}, ${f(pca.baseline.z, 2)}). Axe PCA = (${f(pca.movementAxis.x, 9)}, ${f(pca.movementAxis.y, 9)}, ${f(pca.movementAxis.z, 9)}). Variance expliquée : **${pct(pca.pca!.explainedVarianceRatio)}**, contre **88.73 % pour 009** et **87.61 % pour 010** dans le diagnostic précédent. Ces deux autres datasets ne sont pas recalculés ici.`, "",
  table(["Projection / polarité", "UP correct", "DOWN correct", "Équilibré", "Aire totale UP (m)", "Aire totale DOWN (m)"], variants.map(v => [v.name, pct(v.metrics[0].concordance), pct(v.metrics[1].concordance), pct(v.balanced), f(v.metrics[0].signedAreaMeters), f(v.metrics[1].signedAreaMeters)])), "",
];
for (const v of variants) report.push(`### ${v.name}`, "",
  table(["Phase / trajet", "Début", "Fin", "Durée (s)", "N", "v min", "v max", "v moyenne samples", "Positive", "Négative", "Nulle", "Aire signée (m)", "v moyenne temporelle"], v.phases.map(p => [
    p.phase + " " + p.label, f(p.start, 3), f(p.end, 3), f(p.durationSeconds, 3), p.n, f(p.min), f(p.max), f(p.mean), pct(p.positive / p.n), pct(p.negative / p.n), pct(p.zero / p.n), f(p.signedAreaMeters), f(p.timeMeanVelocity),
  ])), "");
report.push(
  "## FACT — conclusion", "",
  "Les cinq UP sont majoritairement négatifs (82.76 à 93.10 % des samples), mais les cinq DOWN le sont également (75.81 à 98.04 %). Les dix vitesses moyennes et les dix aires signées sont négatives en PCA. Il n'y a donc pas deux familles de signe opposé simplement mal nommées : les sens GT se recouvrent dans le signe du signal, avec quelques portions positives dans chaque intervalle.", "",
  "A : oui, toutes les phases UP partagent le même signe dominant. B : non, DOWN ne présente pas le signe dominant opposé. C : oui, les étiquettes UP/DOWN se mélangent dans le même signe dominant négatif. Cette formulation décrit les proportions brutes ; aucun seuil de phase n'a été ajouté.", "",
  "PCA inversée : UP=89.29 %, DOWN=13.88 %, équilibré=51.58 %. L'inversion globale ne fait qu'échanger la famille favorisée. Les aires totales passent de −1.095997 m sur les montées et −4.001336 m sur les descentes à leurs opposés positifs : les deux sens conservent le même signe.", "",
  "Z explicite avec le même oracle : UP=9.29 %, DOWN=86.83 %, équilibré=48.06 %, contre 48.42 % pour PCA. Les dix moyennes et les dix aires restent négatives. Z inversée donne 51.94 % équilibré, sans séparer les sens.", "",
  "La variance expliquée de 007 est 73.38 %, inférieure aux 88.73 % et 87.61 % précédemment mesurés sur 009/010. Ce constat décrit une moindre concentration de variance sur l'axe principal, pas une preuve de cause de l'échec.", "",
  "## INFERENCE — conclusion", "",
  "L'échec de 007 ne s'explique pas simplement par la convention de signe, et remplacer la PCA actuelle par Z explicite ne le résout pas. Sous les contraintes zero-velocity et les GT inchangées de cette expérience, les deux projections testées restent incohérentes avec la séparation des mouvements annotés en sens opposés.", "",
  "Les déplacements relatifs estimés de même signe pour toutes les montées et descentes renforcent ce constat : il ne s'agit pas seulement de quelques samples de signe erroné près d'un pivot. L'oracle impose les vitesses nulles aux bornes mais ne garantit pas une cinématique cohérente entre elles.", "",
  "## UNKNOWN — conclusion", "",
  "La cause physique reste inconnue : orientation variable, projection fixe inadéquate, mesure non représentative du mouvement annoté, biais variable à l'intérieur des intervalles ou décalage des contraintes GT restent possibles. La comparaison de deux axes ne démontre pas qu'aucune autre représentation serait cohérente.", "",
  "+Z n'est toujours pas établi comme UP physique. Cette incertitude de polarité ne suffit toutefois pas à expliquer pourquoi les deux sens GT partagent le même signe. La baseline candidate, la sensibilité nominale, le dt nominal et l'exactitude de la synchronisation limitent l'interprétation ; aucune cause n'est isolée ici.", "",
  "Aucune nouvelle méthode proposée. Diagnostic terminé sans modification production, filtre, paramètre ou tuning.", "",
  "## Traçabilité", "", "PCA oracle est vérifiée identique, sample par sample et nœud par nœud, à C du diagnostic précédent. Même baseline et mêmes contraintes pour PCA et Z. Les signes et aires inversés sont vérifiés symétriques. Sources et ancien résultat identifiés par SHA-256 dans le JSON.", "",
  "Reproduction : `node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnose007OracleAxis.ts`", "");
mkdirSync(OUTPUT, { recursive: true });
writeFileSync(new URL("007_oracle_axis.json", OUTPUT), JSON.stringify({
  datasetSource: prior.datasetSource, gtSource: prior.gtSource, priorDiagnosticSha256: createHash("sha256").update(priorBytes).digest("hex"),
  configuration: { ...common, dtSeconds: dt }, baseline: pca.baseline, movementAxisPca: pca.movementAxis,
  explainedVarianceRatio: pca.pca!.explainedVarianceRatio, variants,
}, null, 2) + "\n");
writeFileSync(new URL("007_oracle_axis.md", OUTPUT), report.join("\n"));
console.log(JSON.stringify({ explainedVarianceRatio: pca.pca!.explainedVarianceRatio,
  variants: variants.map(v => ({ name: v.name, metrics: v.metrics, balanced: v.balanced })) }, null, 2));
