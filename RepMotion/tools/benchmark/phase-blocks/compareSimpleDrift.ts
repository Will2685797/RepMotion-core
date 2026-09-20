/** Isolated offline comparison: A unchanged, B slow EMA, C GT zero-velocity oracle. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { MotionSample } from "../../../mobile/RepMotion/analytics/calibration";
import { prepareLinearAcceleration1D } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import { estimateVelocity } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity";
import { signCounts, signCrossings, velocityAt } from "./diagnoseVelocity";

const ROOT = new URL("../../../", import.meta.url);
const OUTPUT = new URL("tools/benchmark/phase-blocks/output/simple-drift-comparison/", ROOT);
const DT = 0.05;
// Chosen before evaluating GT scores. Same three values for all captures.
const TIME_CONSTANTS = [10, 20, 40];
const CONFIG = {
  baselineWindow: { startIndex: 0, endIndex: 100 },
  axisStrategy: { method: "pca" as const, referenceAxis: { x: 0, y: 0, z: 1 } },
  countsPerG: 16384,
};
type Point = { index: number; value: number };
type Crossing = { start: number; end: number; left: number; right: number; direction: string };
type Interval = { label: string; start: number; end: number; indices: number[] };
type Prior = {
  id: string; sampleCount: number;
  datasetSource: { path: string; sha256: string }; gtSource: { path: string; sha256: string; annotationVersion: number | null };
  acceleration1D: number[]; velocity: number[];
  movements: (Interval & { phase: "UP" | "DOWN"; correct: number })[];
  transitions: Interval[];
  pivots: { label: string; arrival: number; departure: number | null }[];
};

/** Causal low-frequency estimate, not a proven physical bias measurement. */
export function slowEma(acceleration: readonly number[], dt: number, tau: number) {
  assert.ok(dt > 0 && tau > 0);
  const alpha = -Math.expm1(-dt / tau);
  const bias = acceleration.map(() => 0);
  for (let i = 1; i < acceleration.length; i += 1) {
    bias[i] = bias[i - 1] + alpha * (acceleration[i] - bias[i - 1]);
  }
  return { bias, correctedAcceleration: acceleration.map((a, i) => a - bias[i]), alpha };
}

export function piecewiseValue(points: readonly Point[], index: number): number {
  assert.ok(points.length && index >= points[0].index);
  if (index >= points[points.length - 1].index) return points[points.length - 1].value;
  let low = 0, high = points.length - 1;
  while (high - low > 1) { const mid = Math.floor((low + high) / 2); if (points[mid].index <= index) low = mid; else high = mid; }
  if (index === points[low].index) return points[low].value;
  if (index === points[high].index) return points[high].value;
  const fraction = (index - points[low].index) / (points[high].index - points[low].index);
  return points[low].value * (1 - fraction) + points[high].value * fraction;
}

/** Original velocity minus a linearly interpolated drift passing through GT constraints. */
export function gtOracle(original: readonly number[], positions: readonly number[]) {
  const anchors = [...new Set([0, ...positions])].sort((a, b) => a - b).map(index => ({ index, value: velocityAt(original, index) }));
  const grid = [...new Set([...original.map((_, i) => i), ...positions])].sort((a, b) => a - b);
  const constraintIndices = new Set(anchors.map(p => p.index));
  const curve = grid.map(index => ({ index, value: constraintIndices.has(index) ? 0 : velocityAt(original, index) - piecewiseValue(anchors, index) }));
  // An explicit value of zero at a constraint avoids arithmetic roundoff sign artifacts.
  const velocity = original.map((v, i) => constraintIndices.has(i) ? 0 : v - piecewiseValue(anchors, i));
  return { anchors, curve, velocity };
}

/** Sign reversal on a piecewise-linear curve; touching zero alone is not a crossing. */
export function curveCrossings(curve: readonly Point[]): Crossing[] {
  let previous: Point | undefined;
  let zeros: number[] = [];
  const result: Crossing[] = [];
  for (const point of curve) {
    assert.ok(Number.isFinite(point.value));
    if (point.value === 0) { if (previous) zeros.push(point.index); continue; }
    if (previous && Math.sign(point.value) !== Math.sign(previous.value)) {
      const root = previous.index - previous.value * (point.index - previous.index) / (point.value - previous.value);
      result.push({ start: zeros.length ? zeros[0] : root, end: zeros.length ? zeros[zeros.length - 1] : root,
        left: previous.index, right: point.index, direction: point.value > 0 ? "negative-to-positive" : "positive-to-negative" });
    }
    previous = point;
    zeros = [];
  }
  return result;
}

export function nearestCrossing(crossings: readonly Crossing[], center: number, dt: number) {
  if (!crossings.length) return null;
  let best = crossings[0];
  let position = Math.max(best.start, Math.min(best.end, center));
  for (const crossing of crossings.slice(1)) {
    const candidate = Math.max(crossing.start, Math.min(crossing.end, center));
    if (Math.abs(candidate - center) < Math.abs(position - center)) { best = crossing; position = candidate; }
  }
  return { ...best, nearestPosition: position, signedErrorMs: (position - center) * dt * 1000, absoluteErrorMs: Math.abs(position - center) * dt * 1000 };
}

function evaluate(name: string, velocity: number[], curve: Point[], p: Prior) {
  const crossings = curveCrossings(curve);
  const movements = p.movements.map(phase => {
    const counts = signCounts(velocity, phase.indices);
    return { label: phase.label, phase: phase.phase, start: phase.start, end: phase.end, indices: phase.indices,
      ...counts, correct: phase.phase === "UP" ? counts.positive : counts.negative,
      startVelocity: piecewiseValue(curve, phase.start), endVelocity: piecewiseValue(curve, phase.end) };
  });
  const proportions = ["UP", "DOWN"].map(phase => {
    const rows = movements.filter(row => row.phase === phase);
    const n = rows.reduce((sum, row) => sum + row.n, 0);
    return { phase, n, correct: rows.reduce((sum, row) => sum + row.correct, 0),
      proportion: rows.reduce((sum, row) => sum + row.correct, 0) / n };
  });
  const transitions = p.transitions.map(t => {
    const center = (t.start + t.end) / 2;
    return { label: t.label, start: t.start, end: t.end, indices: t.indices,
      center, crossings: crossings.filter(c => c.end >= t.start && c.start <= t.end),
      nearestCrossing: nearestCrossing(crossings, center, DT),
      internalSampleCrossings: signCrossings(velocity, t.indices),
      startVelocity: piecewiseValue(curve, t.start), endVelocity: piecewiseValue(curve, t.end),
    };
  });
  const pivots = p.pivots.map(pivot => ({ label: pivot.label, arrival: pivot.arrival, departure: pivot.departure,
    arrivalVelocity: piecewiseValue(curve, pivot.arrival),
    departureVelocity: pivot.departure === null ? null : piecewiseValue(curve, pivot.departure),
    metricVelocity: piecewiseValue(curve, pivot.departure ?? pivot.arrival),
  }));
  const errors = transitions.flatMap(t => t.nearestCrossing === null ? [] : [t.nearestCrossing.absoluteErrorMs]);
  const [first, last] = [p.pivots[0].arrival, p.pivots[p.pivots.length - 1].arrival];
  return { name, velocity, curve, movements, proportions, transitions, pivots, crossings,
    metrics: {
      min: Math.min(...curve.map(q => q.value)), max: Math.max(...curve.map(q => q.value)), final: velocity[velocity.length - 1],
      meanAbsolutePivotVelocity: pivots.reduce((sum, q) => sum + Math.abs(q.metricVelocity), 0) / pivots.length,
      up: proportions[0].proportion, down: proportions[1].proportion, balanced: (proportions[0].proportion + proportions[1].proportion) / 2,
      zeroCrossings: crossings.length, zeroCrossingsAnnotatedSpan: crossings.filter(c => c.end >= first && c.start <= last).length,
      transitionsWithCrossing: transitions.filter(t => t.crossings.length > 0).length,
      transitionCount: transitions.length,
      transitionsWithInternalSampleCrossing: transitions.filter(t => t.internalSampleCrossings.length > 0).length,
      nearestCrossingMeanAbsoluteErrorMs: errors.length ? errors.reduce((sum, e) => sum + e, 0) / errors.length : null,
      nearestCrossingMaxAbsoluteErrorMs: errors.length ? Math.max(...errors) : null,
      nearestCrossingEvaluatedTransitions: errors.length,
    },
  };
}

type Evaluation = ReturnType<typeof evaluate>;
const f = (x: number | null, digits = 6) => x === null ? "N/D" : x.toFixed(digits);
const percent = (x: number) => `${f(x * 100, 2)} %`;
const table = (headers: string[], rows: (string | number)[][]) => [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map(row => `| ${row.join(" | ")} |`)].join("\n");

export function main() {
  const priorBytes = readFileSync(new URL("tools/benchmark/phase-blocks/output/velocity-diagnostic/velocity_diagnostic.json", ROOT));
  const prior = JSON.parse(priorBytes.toString("utf8")) as { configuration: unknown; results: Prior[] };
  assert.deepEqual(prior.configuration, { ...CONFIG, dtSeconds: DT });
  const results = prior.results.map(p => {
    for (const source of [p.datasetSource, p.gtSource]) assert.equal(createHash("sha256").update(readFileSync(new URL(source.path, ROOT))).digest("hex"), source.sha256);
    const samples = JSON.parse(readFileSync(new URL(p.datasetSource.path, ROOT), "utf8")).samples as MotionSample[];
    const prepared = prepareLinearAcceleration1D(samples, CONFIG);
    assert.deepEqual(prepared.acceleration1D, p.acceleration1D);
    const velocity = estimateVelocity(prepared.acceleration1D, DT);
    assert.deepEqual(velocity, p.velocity);
    const A = evaluate("A", velocity, velocity.map((value, index) => ({ index, value })), p);
    A.movements.forEach((phase, i) => assert.equal(phase.correct, p.movements[i].correct));
    const B = TIME_CONSTANTS.map(tau => {
      const ema = slowEma(prepared.acceleration1D, DT, tau);
      const v = estimateVelocity(ema.correctedAcceleration, DT);
      return { tauSeconds: tau, ...ema, ...evaluate(`B τ=${tau}s`, v, v.map((value, index) => ({ index, value })), p) };
    });
    const positions = p.pivots.flatMap(q => q.departure === null ? [q.arrival] : [q.arrival, q.departure]);
    const oracle = gtOracle(velocity, positions);
    const C = { ...evaluate("C oracle", oracle.velocity, oracle.curve, p), anchors: oracle.anchors };
    assert.equal(C.metrics.meanAbsolutePivotVelocity, 0);
    assert.equal(C.velocity[0], 0);
    return { id: p.id, baseline: prepared.baseline, movementAxis: prepared.movementAxis,
      datasetSource: p.datasetSource, gtSource: p.gtSource, A, B, C };
  });
  // Selection fixed before inspecting scores: equal-weight mean balanced score across datasets.
  const ranking = TIME_CONSTANTS.map(tau => {
    const rows = results.map(r => ({ a: r.A.metrics, b: r.B.find(b => b.tauSeconds === tau)!.metrics }));
    return { tauSeconds: tau, meanBalanced: rows.reduce((sum, r) => sum + r.b.balanced, 0) / rows.length,
      worstBalanced: Math.min(...rows.map(r => r.b.balanced)),
      worstDeltaBalanced: Math.min(...rows.map(r => r.b.balanced - r.a.balanced)),
      datasetScores: results.map((r, i) => ({ id: r.id, ...rows[i].b, deltaBalanced: rows[i].b.balanced - rows[i].a.balanced })),
    };
  }).sort((a, b) => b.meanBalanced - a.meanBalanced || b.worstBalanced - a.worstBalanced || b.tauSeconds - a.tauSeconds);
  const bestTau = ranking[0].tauSeconds;
  const mainRows = results.flatMap(r => [r.A, r.B.find(b => b.tauSeconds === bestTau)!, r.C].map(v => ({ id: r.id, v })));
  const metricRow = (id: string, v: Evaluation) => [id, v.name, f(v.metrics.min), f(v.metrics.max), f(v.metrics.final), f(v.metrics.meanAbsolutePivotVelocity), percent(v.metrics.up), percent(v.metrics.down), percent(v.metrics.balanced), v.metrics.zeroCrossings, `${v.metrics.transitionsWithCrossing}/10`, f(v.metrics.nearestCrossingMeanAbsoluteErrorMs, 2)];
  const headers = ["Dataset", "Variante", "v min", "v max", "v finale", "Moyenne |v pivot|", "UP", "DOWN", "Équilibré", "Crossings capture", "Transitions avec crossing", "Erreur moyenne centre (ms)"];
  const report = [
    "# Comparaison simple de dérive — diagnostic A / EMA B / oracle GT C", "",
    "## Méthodes et hypothèses", "",
    "A : préparation et intégration existantes reproduites exactement. Baseline `[0,100)` candidate rest window, PCA sur toute la capture, référence +Z géométrique, countsPerG=16384 nominal et dt=0.05 s nominal. Aucune production, GT ou constante existante modifiée.", "",
    "B : EMA causale lente : `alpha=1−exp(−dt/tau)`, `bias[0]=0`, `bias[i]=bias[i−1]+alpha*(a[i]−bias[i−1])` pour i≥1 ; `aB[i]=a[i]−bias[i]`, puis intégration existante. Trois tau seulement : **10, 20, 40 s**, identiques pour tous les datasets, choisis avant les scores. Mémoire constante. Cet estimateur retire de la basse fréquence, pas un biais physiquement identifiable sans autre hypothèse. Il suppose que les accélérations de mouvement se compensent sur une durée longue. Une composante réelle lente peut aussi être retirée. La référence initiale nulle vient de la baseline déjà soustraite.", "",
    "Le filtre B est causal, mais l'expérience complète reste offline car la PCA commune est calculée sur toute la capture. Les tau sont plus longs que les répétitions usuelles de ces captures ; ce choix réduit le suivi des accélérations rapides sans garantir une séparation parfaite mouvement/biais.", "",
    "C : **ORACLE DIAGNOSTIC OFFLINE**, correction de vitesse uniquement. Aux arrival et departure GT exacts, une correction linéaire par morceaux prend la valeur de la vitesse A, imposant vC=0 à ces points. Entre contraintes, `vC(t)=vA(t)−interpolationLinéaire(vA aux contraintes)`. On ne force pas toute la transition à zéro et on ne modifie pas acceleration1D. Arrival B6 est la dernière contrainte ; aucun departure B6 n'est inventé.", "",
    "Bords de C : v[0]=0 est conservé avec une ancre initiale ; correction linéaire jusqu'à la première arrival. Après arrival B6, maintien constant de la dernière correction (aucune pente extrapolée ni fermeture de fin forcée). La vitesse finale et les crossings hors série dépendent de cette convention, pas de contraintes GT supplémentaires.", "",
    "## Mesures communes", "",
    "Signes UP/DOWN : mêmes samples entiers strictement dans (departure,arrival) que le diagnostic précédent, sans seuil. Zéro exact ne compte dans aucun des deux signes. Score équilibré=(UP+DOWN)/2. Moyenne absolue aux pivots : departure des dix pivots avec départ puis arrival B6. Pour C cette métrique est nulle par construction et ne constitue pas une validation indépendante.", "",
    "Crossings et erreurs temporelles : même définition pour A/B/C sur leur courbe linéaire par morceaux. A/B ont les samples acquis comme nœuds ; C ajoute les frontières GT exactes comme nœuds, indispensables pour représenter ses contraintes fractionnaires sans déplacer les GT. Les proportions de signe restent calculées uniquement aux samples acquis. Une inversion exige des signes non nuls opposés ; toucher zéro ne suffit pas. Si un plateau nul sépare deux signes opposés, le crossing est un intervalle, pas une localisation unique.", "",
    "Une transition contient un crossing si l'intervalle du zéro intersecte [arrival,departure], bornes incluses. C'est une métrique interpolée commune, distincte de l'ancien critère exigeant deux samples internes : ce dernier est conservé séparément dans le JSON. Pour C, les crossings peuvent être créés ou localisés par les contraintes GT ; ils ne mesurent pas une détection indépendante.", "",
    "Erreur temporelle : distance signée puis absolue entre le centre exact (arrival+departure)/2 et le crossing le plus proche sur toute la capture, sans distance limite ni appariement un-à-un. Sur un plateau nul, on prend le point le plus proche du centre. Les erreurs signées par transition et les paires encadrantes sont détaillées ci-dessous. Sans crossing : N/D. Ce calcul n'arrondit ni ne recentre les GT ; les sous-samples n'ajoutent aucune précision physique.", "",
    "GT : 007 utilise les annotations arrival/departure de transition-annotations.json sans version déclarée ; 009/010 leurs V2. Empreintes et indices vérifiés contre le diagnostic précédent. Les 14 transitions avec moins de deux samples restent insuffisantes pour une observation interne, même si l'interpolation ou l'oracle localise un zéro.", "",
    "## Tableau global A / meilleure B / C", "", table(headers, mainRows.map(({ id, v }) => metricRow(id, v))), "",
    "Vitesses en m/s. Les min/max incluent les nœuds de la courbe, donc les contraintes exactes pour C. Le nombre de crossings sur la seule série GT est également fourni dans le JSON.", "",
    "## Trois variantes B — aucun réglage par dataset", "", table(headers, results.flatMap(r => r.B.map(v => metricRow(r.id, v)))), "",
    "## Sélection B globale", "",
    "Critère fixé avant comparaison : maximiser la moyenne des scores équilibrés, avec poids égal pour chaque dataset. En cas d'égalité : meilleur minimum par dataset, puis tau le plus lent. Le pire écart à A est affiché pour ne pas masquer une régression. Ce classement sur trois captures n'est pas une validation hors échantillon.", "",
    table(["tau (s)", "Score équilibré moyen", "Pire dataset", "Pire variation vs A (points)"], ranking.map(r => [r.tauSeconds, percent(r.meanBalanced), percent(r.worstBalanced), f(r.worstDeltaBalanced * 100, 2)])), "",
    `Meilleure variante parmi les trois testées : **tau=${bestTau} s**. Aucun quatrième réglage ni réglage spécifique par dataset n'a été essayé.`, "",
  ];
  for (const r of results) {
    report.push(`## Détails ${r.id}`, "",
      "### Phases GT : concordance de signe", "",
      table(["Phase", "Indices GT", "N", "A", ...r.B.map(b => b.name), "C"], r.A.movements.map((p, i) => [p.phase + " " + p.label, `(${p.start}, ${p.end})`, p.n, ...[r.A, ...r.B, r.C].map(v => percent(v.movements[i].correct / p.n))])), "",
      "### Résidus aux pivots — toutes variantes", "",
      table(["Pivot", "Arrival", "Departure", "A", ...r.B.map(b => b.name), "C"], r.A.pivots.map((p, i) => [p.label, p.arrival, p.departure ?? "absent", ...[r.A, ...r.B, r.C].map(v => f(v.pivots[i].metricVelocity))])), "",
      "### Transitions : nearest crossing et erreur au centre", "",
      table(["Transition", "Fenêtre GT", "Centre", "Variante", "Crossings dans fenêtre", "Nearest crossing [début,fin]", "Paire encadrante", "Erreur signée (ms)", "Erreur absolue (ms)"], r.A.transitions.flatMap((t, i) => [r.A, ...r.B, r.C].map(v => {
        const q = v.transitions[i], c = q.nearestCrossing;
        return [t.label, `[${t.start}, ${t.end}]`, f(t.center, 3), v.name, q.crossings.length, c ? `[${f(c.start, 6)}, ${f(c.end, 6)}]` : "N/D", c ? `${c.left}→${c.right}` : "N/D", f(c?.signedErrorMs ?? null, 3), f(c?.absoluteErrorMs ?? null, 3)];
      }))), "",
    );
  }
  report.push(
    "## Conclusion — FACT", "",
    `**B ne stabilise pas suffisamment le signe sur les trois datasets. C améliore nettement 009 et 010, mais échoue sur 007. Aucune des corrections testées ne constitue donc une fondation générale validée sur ces trois captures.**`, "",
    `La meilleure EMA globale est tau=${bestTau} s. Son score équilibré moyen est ${percent(ranking[0].meanBalanced)}, contre ${percent(results.reduce((s, r) => s + r.A.metrics.balanced, 0) / results.length)} pour A. Les variations par dataset sont ${ranking[0].datasetScores.map(r => `${r.id} : ${f(r.deltaBalanced * 100, 2)} points`).join(" ; ")}. Il y a un gain sur deux datasets et un recul limité sur 009, donc pas une amélioration des trois simultanément. Sur 010, seulement 26.40 % des samples UP sont positifs avec B10, malgré la réduction de la vitesse finale de −2.197384 à −0.592907 m/s. Sur 007, la vitesse finale s'éloigne davantage de zéro avec B10 (−0.215934 au lieu de −0.130232 m/s).`, "",
    "C donne 48.42 % / 87.49 % / 89.72 % de score équilibré sur 007/009/010. Il devient nettement meilleur que A et B sur 009/010, mais plus mauvais sur 007. Sur 007, chacune des cinq montées reste majoritairement négative : seulement 3/29, 2/25, 3/28, 5/29 et 2/29 samples positifs. Sur 009, la deuxième descente reste mal signée (23/69 samples négatifs). Sur 010, la quatrième montée ne donne encore que 15/26 samples positifs.", "",
    "L'erreur moyenne au centre des transitions passe, de B10 à C, de 661.27 à 43.07 ms sur 007, de 568.57 à 177.97 ms sur 009 et de 954.20 à 111.26 ms sur 010. Mais C utilise ces mêmes GT pour construire ses contraintes : les zéros aux pivots sont imposés, et leur proximité temporelle avec les GT n'est pas une détection indépendante. Les inversions dans 9/10, 6/10 et 9/10 transitions ne suffisent pas à valider le signe entre les pivots ; 007 en est le contre-exemple.", "",
    "## Conclusion — INFERENCE", "",
    "Un simple estimateur basse fréquence ne suffit pas, dans les trois variantes lentes testées, à rendre la vitesse fiable pour la suite. Sa meilleure variante réduit une partie de l'offset de 010 sans restaurer les montées. Cela ne prouve pas que toute méthode simple échouerait ; aucune autre variante n'a été testée.", "",
    "Les contraintes physiques de vitesse nulle ont un potentiel nettement supérieur à cette EMA sur 009/010. Elles constituent une piste architecturale crédible dans ces deux captures, mais l'expérience ne permet pas de conclure qu'elles suffiraient globalement : même avec des contraintes GT exactes, 007 reste incohérent entre les pivots.", "",
    "Réponse à la question de décision : **la stabilisation suffisante par une correction simple seule n'est pas démontrée. Les contraintes de transition sont prometteuses, mais leur nécessité et leur suffisance générales ne sont pas établies ; l'échec de C sur 007 empêche de valider cette fondation pour RepMotion.** Le problème de 007 ne se résume pas à un offset de vitesse supprimable par une droite entre les frontières GT utilisées.", "",
    "## Conclusion — UNKNOWN", "",
    "- Le biais physique n'est pas séparé de l'accélération lente réelle par une EMA seule. Les trois tau évaluent une famille limitée, avec bias[0]=0 ; ce résultat ne couvre pas d'autres initialisations ou familles et aucun réglage supplémentaire n'a été essayé.",
    "- Restent possibles : biais non constant à l'intérieur d'un intervalle, orientation variable, projection fixe inadéquate, accélérations de rotation ou mesure non représentative du mouvement annoté. L'échec de 007 sous C indique un problème résiduel, sans en identifier la cause.",
    "- La validité de v≈0 aux frontières GT, l'alignement vidéo/IMU et la résolution des fenêtres doivent rester distincts d'une vérité instrumentale. Les GT existantes n'ont pas été déplacées ni corrigées ; leur exactitude physique n'est pas démontrée par cet oracle.",
    "- La baseline est candidate, la sensibilité et dt sont nominaux, et les éventuelles irrégularités de temps ne sont pas connues. +Z demeure une convention géométrique, pas une certification indépendante du sens UP.",
    "- C reçoit des contraintes futures et des positions de transition connues. Cette expérience n'évalue ni leur découverte automatique, ni la sensibilité à des contraintes erronées, ni un fonctionnement temps réel. Le choix B est évalué sur les mêmes trois captures qui servent à le sélectionner, sans jeu de validation indépendant.", "",
    "Fin du diagnostic : aucune proposition d'implémentation production, aucune phase automatique et aucun bloc ajoutés.", "",
    "## Traçabilité", "", "Le JSON contient les courbes A/B/C, biais EMA, accélérations B, contraintes C, métriques, phases, pivots et crossings. A et acceleration1D sont vérifiés identiques au diagnostic précédent. C ne modifie aucune accélération. Aucun filtre ou estimateur n'est branché en production.", "",
    "Reproduction : `node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/compareSimpleDrift.ts`", "");
  mkdirSync(OUTPUT, { recursive: true });
  writeFileSync(new URL("simple_drift_comparison.json", OUTPUT), JSON.stringify({ configuration: { ...CONFIG, dtSeconds: DT }, timeConstants: TIME_CONSTANTS, bestTau, ranking, priorDiagnosticSha256: createHash("sha256").update(priorBytes).digest("hex"), results }, null, 2) + "\n");
  writeFileSync(new URL("simple_drift_comparison.md", OUTPUT), report.join("\n"));
  console.log(JSON.stringify({ bestTau, ranking, results: results.map(r => ({ id: r.id, A: r.A.metrics, B: r.B.map(b => ({ tau: b.tauSeconds, ...b.metrics })), C: r.C.metrics })) }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
