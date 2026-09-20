/** Offline GT diagnostic only. No detector, signal correction, or GT adjustment. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { MotionSample } from "../../../mobile/RepMotion/analytics/calibration";
import { prepareLinearAcceleration1D } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/prepareLinearAcceleration1D";
import { estimateVelocity } from "../../../mobile/RepMotion/analytics/raw-generation/phase-blocks/estimateVelocity";

const ROOT = new URL("../../../", import.meta.url);
const OUTPUT = new URL("tools/benchmark/phase-blocks/output/velocity-diagnostic/", ROOT);
const CONFIG = {
  baselineWindow: { startIndex: 0, endIndex: 100 },
  axisStrategy: { method: "pca" as const, referenceAxis: { x: 0, y: 0, z: 1 } },
  countsPerG: 16384,
};
const DT_SECONDS = 0.05;
const SAMPLE_MICROSECONDS = 50000n;

type Event = {
  type: "BOTTOM" | "TOP";
  rep: number;
  arrivalTimeSeconds: number;
  departureTimeSeconds: number | null;
  arrivalSampleFloat?: number;
  departureSampleFloat?: number | null;
};
type GroundTruth = {
  annotationVersion?: number;
  dataset: string;
  samplingRateHz?: number;
  sync: { offsetSeconds?: number; videoTimeSeconds?: number; imuSampleIndex?: number };
  events: Event[];
};
type Crossing = {
  leftIndex: number;
  rightIndex: number;
  direction: "negative-to-positive" | "positive-to-negative";
  crossingIndex: number;
  location: "linear-interpolation" | "exact-zero-sample";
  zeroIndices: number[];
};

/** Parse annotated decimal seconds exactly, rather than rounding sample positions. */
export function decimalMicroseconds(seconds: number): bigint {
  assert.ok(Number.isFinite(seconds));
  const text = String(seconds);
  assert.match(text, /^-?\d+(\.\d{1,6})?$/, "GT times must have at most six decimal places");
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace(/^-/, "").split(".");
  const value = BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
  return negative ? -value : value;
}

export function samplePosition(videoSeconds: number, offsetMicroseconds: bigint): number {
  return Number(decimalMicroseconds(videoSeconds) - offsetMicroseconds) / Number(SAMPLE_MICROSECONDS);
}

/** Movement excludes pivot boundaries; transition windows include their boundaries. */
export function intervalIndices(start: number, end: number, closed: boolean): number[] {
  assert.ok(Number.isFinite(start) && Number.isFinite(end) && start <= end);
  const first = closed ? Math.ceil(start) : Math.floor(start) + 1;
  const last = closed ? Math.floor(end) : Math.ceil(end) - 1;
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);
}

/** Boundary readout only: no samples are replaced and no integration is changed. */
export function velocityAt(velocity: readonly number[], position: number): number {
  assert.ok(position >= 0 && position <= velocity.length - 1);
  const left = Math.floor(position);
  if (left === position) return velocity[left];
  const fraction = position - left;
  return velocity[left] * (1 - fraction) + velocity[left + 1] * fraction;
}

export function signCounts(velocity: readonly number[], indices: readonly number[]) {
  let positive = 0;
  let negative = 0;
  let zero = 0;
  for (const index of indices) {
    const value = velocity[index];
    assert.ok(Number.isFinite(value));
    if (value > 0) positive += 1;
    else if (value < 0) negative += 1;
    else zero += 1;
  }
  const n = indices.length;
  return { n, positive, negative, zero,
    positiveProportion: n ? positive / n : null,
    negativeProportion: n ? negative / n : null,
    zeroProportion: n ? zero / n : null };
}

/** Crossings require opposite nonzero signs with all bracketing samples inside the window. */
export function signCrossings(velocity: readonly number[], indices: readonly number[]): Crossing[] {
  const crossings: Crossing[] = [];
  let previous: number | undefined;
  let zeros: number[] = [];
  for (let offset = 0; offset < indices.length; offset += 1) {
    const index = indices[offset];
    if (offset > 0) assert.equal(index, indices[offset - 1] + 1);
    const value = velocity[index];
    assert.ok(Number.isFinite(value));
    if (value === 0) { if (previous !== undefined) zeros.push(index); continue; }
    if (previous !== undefined && Math.sign(value) !== Math.sign(velocity[previous])) {
      crossings.push({
        leftIndex: previous, rightIndex: index,
        direction: value > 0 ? "negative-to-positive" : "positive-to-negative",
        crossingIndex: zeros.length ? zeros[0] : previous + (-velocity[previous]) / (value - velocity[previous]),
        location: zeros.length ? "exact-zero-sample" : "linear-interpolation",
        zeroIndices: [...zeros],
      });
    }
    previous = index;
    zeros = [];
  }
  return crossings;
}

function stats(values: readonly number[]) {
  assert.ok(values.length > 0);
  let min = Infinity, max = -Infinity, sum = 0;
  for (const value of values) { assert.ok(Number.isFinite(value)); min = Math.min(min, value); max = Math.max(max, value); sum += value; }
  return { min, max, mean: sum / values.length };
}

function readSource<T>(path: string): { value: T; path: string; sha256: string } {
  const bytes = readFileSync(new URL(path, ROOT));
  return { value: JSON.parse(bytes.toString("utf8")) as T, path, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function diagnose(id: string) {
  const filename = `rowing_5reps_${id}.json`;
  const source = readSource<{ samples: MotionSample[]; samplingRateHz: number; sampleCount: number }>(`datasets/calibration/rowing/${filename}`);
  const gt = readSource<GroundTruth>(`datasets/ground-truth/rowing_5reps_${id}.${id === "007" ? "transition-annotations" : "v2"}.json`);
  assert.equal(gt.value.dataset, filename);
  assert.equal(source.value.samplingRateHz, 20);
  assert.equal(source.value.samples.length, source.value.sampleCount);
  if (id !== "007") { assert.equal(gt.value.annotationVersion, 2); assert.equal(gt.value.samplingRateHz, 20); }
  const sync = gt.value.sync;
  const offset = sync.offsetSeconds !== undefined
    ? decimalMicroseconds(sync.offsetSeconds)
    : decimalMicroseconds(sync.videoTimeSeconds!) - BigInt(sync.imuSampleIndex!) * SAMPLE_MICROSECONDS;
  const prepared = prepareLinearAcceleration1D(source.value.samples, CONFIG);
  const velocity = estimateVelocity(prepared.acceleration1D, DT_SECONDS);
  assert.equal(velocity.length, source.value.samples.length);
  assert.equal(velocity[0], 0);
  const events = gt.value.events.map(event => {
    const arrival = samplePosition(event.arrivalTimeSeconds, offset);
    const departure = event.departureTimeSeconds === null ? null : samplePosition(event.departureTimeSeconds, offset);
    if (event.arrivalSampleFloat !== undefined) assert.equal(arrival, event.arrivalSampleFloat);
    if (event.departureSampleFloat !== undefined) assert.equal(departure, event.departureSampleFloat);
    assert.ok(arrival >= 0 && arrival <= velocity.length - 1);
    if (departure !== null) assert.ok(departure >= arrival && departure <= velocity.length - 1);
    return { ...event, label: `${event.type === "BOTTOM" ? "B" : "T"}${event.rep}`, arrival, departure };
  });
  assert.equal(events.length, 11);
  events.forEach((event, index) => {
    assert.equal(event.type, index % 2 === 0 ? "BOTTOM" : "TOP");
    assert.equal(event.rep, Math.floor(index / 2) + 1);
    if (index < events.length - 1) {
      assert.notEqual(event.departure, null);
      assert.ok(event.departure! < events[index + 1].arrival);
    } else assert.equal(event.departure, null);
  });

  const movements = events.slice(0, -1).map((event, index) => {
    const next = events[index + 1];
    const start = event.departure!;
    const end = next.arrival;
    const indices = intervalIndices(start, end, false);
    const counts = signCounts(velocity, indices);
    const phase = event.type === "BOTTOM" ? "UP" : "DOWN";
    return {
      label: `${event.label} → ${next.label}`, phase,
      startVideoSeconds: event.departureTimeSeconds!, endVideoSeconds: next.arrivalTimeSeconds,
      start, end, indices, startVelocity: velocityAt(velocity, start), endVelocity: velocityAt(velocity, end),
      firstSampleVelocity: indices.length ? velocity[indices[0]] : null,
      lastSampleVelocity: indices.length ? velocity[indices[indices.length - 1]] : null,
      ...counts,
      correct: phase === "UP" ? counts.positive : counts.negative,
      incorrect: phase === "UP" ? counts.negative : counts.positive,
      sampleStatistics: indices.length ? stats(indices.map(i => velocity[i])) : null,
      crossings: signCrossings(velocity, indices),
    };
  });
  const transitions = events.filter(event => event.departure !== null).map(event => {
    const indices = intervalIndices(event.arrival, event.departure!, true);
    let closestIndex: number | null = null;
    for (const index of indices) {
      if (closestIndex === null || Math.abs(velocity[index]) < Math.abs(velocity[closestIndex])) closestIndex = index;
    }
    const crossings = signCrossings(velocity, indices);
    return {
      label: event.label, phase: "TRANSITION", start: event.arrival, end: event.departure!, indices,
      startVideoSeconds: event.arrivalTimeSeconds, endVideoSeconds: event.departureTimeSeconds,
      startVelocity: velocityAt(velocity, event.arrival), endVelocity: velocityAt(velocity, event.departure!),
      n: indices.length, sampleStatistics: indices.length ? stats(indices.map(i => velocity[i])) : null,
      closestIndex, closestVelocity: closestIndex === null ? null : velocity[closestIndex],
      signChangeObserved: indices.length < 2 ? null : crossings.length > 0,
      crossings, exactZeroIndices: indices.filter(i => velocity[i] === 0),
    };
  });
  // Every integer sample in the annotated interval belongs to exactly one interval.
  const assigned = [...movements.flatMap(p => p.indices), ...transitions.flatMap(p => p.indices)];
  const expected = intervalIndices(events[0].arrival, events[events.length - 1].arrival, true)
    .filter(index => index !== events[events.length - 1].arrival);
  assert.equal(new Set(assigned).size, assigned.length);
  assert.deepEqual([...assigned].sort((a, b) => a - b), expected);

  const firstPivotVelocity = velocityAt(velocity, events[0].arrival);
  let previousPivotVelocity = firstPivotVelocity;
  const pivots = events.map(event => {
    const position = event.departure ?? event.arrival;
    const value = velocityAt(velocity, position);
    const firstAfterIndex = Math.floor(position) + 1;
    const result = {
      label: event.label, arrival: event.arrival, departure: event.departure,
      arrivalVelocity: velocityAt(velocity, event.arrival),
      departureVelocity: event.departure === null ? null : value,
      referenceBoundary: event.departure === null ? "final arrival; departure absent" : "departure",
      firstAfterIndex, firstAfterVelocity: velocity[firstAfterIndex] ?? null,
      apparentOffsetFromInitialZero: value - velocity[0],
      changeSincePreviousPivotBoundary: value - previousPivotVelocity,
      cumulativeChangeSinceFirstArrival: value - firstPivotVelocity,
    };
    previousPivotVelocity = value;
    return result;
  });
  const aggregates = ["UP", "DOWN"].map(phase => {
    const rows = movements.filter(p => p.phase === phase);
    const indices = rows.flatMap(p => p.indices);
    const counts = signCounts(velocity, indices);
    const correct = phase === "UP" ? counts.positive : counts.negative;
    const incorrect = phase === "UP" ? counts.negative : counts.positive;
    return { phase, ...counts, correct, incorrect, correctProportion: correct / counts.n, incorrectProportion: incorrect / counts.n };
  });
  const allCrossings = signCrossings(velocity, Array.from({ length: velocity.length }, (_, i) => i));
  return {
    id, sampleCount: velocity.length, nominalDurationSeconds: (velocity.length - 1) * DT_SECONDS,
    datasetSource: { path: source.path, sha256: source.sha256 },
    gtSource: { path: gt.path, sha256: gt.sha256, annotationVersion: gt.value.annotationVersion ?? null },
    videoToImuOffsetSeconds: Number(offset) / 1000000,
    baseline: prepared.baseline, movementAxis: prepared.movementAxis, signConvention: prepared.signConvention,
    summary: { ...stats(velocity), initial: velocity[0], final: velocity[velocity.length - 1],
      apparentCumulativeDrift: velocity[velocity.length - 1] - velocity[0],
      firstPivotArrivalVelocity: firstPivotVelocity,
      finalPivotArrivalVelocity: pivots[pivots.length - 1].arrivalVelocity,
      pivotSpanApparentDrift: pivots[pivots.length - 1].arrivalVelocity - firstPivotVelocity,
    },
    aggregates, movements, transitions, pivots, allCrossings,
    exactZeroIndices: velocity.flatMap((value, i) => value === 0 ? [i] : []),
    acceleration1D: prepared.acceleration1D, velocity,
  };
}

type Result = ReturnType<typeof diagnose>;
const f = (value: number | null | undefined, digits = 6) => value == null ? "N/D" : value.toFixed(digits);
const pct = (numerator: number, denominator: number) => denominator ? `${(100 * numerator / denominator).toFixed(2)} %` : "N/D";
const span = (indices: number[]) => indices.length ? `${indices[0]}–${indices[indices.length - 1]}` : "aucun";
const crossText = (crossings: Crossing[]) => crossings.length ? crossings.map(c => `${c.leftIndex}→${c.rightIndex} (${c.direction === "negative-to-positive" ? "−→+" : "+→−"}; i≈${f(c.crossingIndex, 3)})`).join(" ; ") : "aucun";
function table(headers: string[], rows: (string | number)[][]): string {
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map(row => `| ${row.join(" | ")} |`)].join("\n");
}

function chart(result: Result): string {
  const width = 1100, height = 320, left = 75, top = 35, plotWidth = 1000, plotHeight = 225;
  const minimum = Math.min(0, result.summary.min) - 0.15;
  const maximum = Math.max(0, result.summary.max) + 0.15;
  const x = (index: number) => left + index / (result.sampleCount - 1) * plotWidth;
  const y = (value: number) => top + (maximum - value) / (maximum - minimum) * plotHeight;
  const bands = [
    ...result.movements.map(p => ({ ...p, color: p.phase === "UP" ? "#cce7fa" : "#ffe2bd" })),
    ...result.transitions.map(p => ({ ...p, color: "#ddd5ec" })),
  ].map(p => `<rect x="${x(p.start)}" y="${top}" width="${x(p.end) - x(p.start)}" height="${plotHeight}" fill="${p.color}"/>`).join("");
  const ticks = Array.from({ length: 6 }, (_, i) => {
    const value = minimum + (maximum - minimum) * i / 5;
    return `<line x1="${left}" x2="${left + plotWidth}" y1="${y(value)}" y2="${y(value)}" stroke="#ddd"/><text x="65" y="${y(value) + 4}" text-anchor="end">${f(value, 2)}</text>`;
  }).join("");
  const timeTicks = Array.from({ length: 7 }, (_, i) => {
    const index = (result.sampleCount - 1) * i / 6;
    return `<text x="${x(index)}" y="282" text-anchor="middle">${f(index * DT_SECONDS, 1)} s</text>`;
  }).join("");
  const points = result.velocity.map((value, index) => `${f(x(index), 2)},${f(y(value), 2)}`).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Vitesse brute et intervalles GT du dataset ${result.id}"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif" font-size="12" fill="#222"><text x="${left}" y="20">${result.id} — vitesse (m/s) ; bleu : UP GT, orange : DOWN GT, violet : TRANSITION GT</text>${bands}${ticks}<line x1="${left}" x2="${left + plotWidth}" y1="${y(0)}" y2="${y(0)}" stroke="#111" stroke-dasharray="5 3"/><polyline fill="none" stroke="#17446b" stroke-width="1.5" points="${points}"/>${timeTicks}<text x="${left}" y="309">Temps IMU nominal ; v[0]=0 ; aucune correction. Bandes issues uniquement des GT.</text></g></svg>`;
}

function report(results: Result[]): string {
  const [r007, r009, r010] = results;
  const allTransitions = results.flatMap(r => r.transitions);
  const assessable = allTransitions.filter(t => t.n >= 2);
  const withCrossing = assessable.filter(t => t.signChangeObserved);
  const lines = [
    "# Diagnostic de vitesse — 007 / 009 / 010", "",
    "Diagnostic offline : préparation existante puis intégration trapézoïdale existante. Aucune correction du signal, aucun détecteur de phase ou de pivot. Les noms UP/DOWN/TRANSITION ci-dessous viennent exclusivement des annotations GT.", "",
    "## Protocole et conventions", "",
    "- Baseline `[0,100)` : **candidate rest window**, pas un repos certifié. PCA sur toute la capture ; référence +Z géométrique ; `countsPerG=16384` nominal ; `dtSeconds=0.05` nominal ; `velocity[0]=0` conservé.",
    "- Hypothèse évaluée, sans réorientation d'après la GT : UP → v>0 ; DOWN → v<0. « Correct/incorrect » désigne cette concordance, pas une certification du sens physique de +Z. v==0 est compté séparément, sans epsilon ni seuil.",
    "- Conversion : `sampleFloat = (videoTimeSeconds − offsetSeconds) / 0.05`. Calcul des temps décimaux en microsecondes entières pour éviter un arrondi flottant autour d'un index entier. Aucun arrondi au sample le plus proche, aucun recentrage. Les champs SampleRounded des GT ne sont pas utilisés ; les SampleFloat existants sont vérifiés exactement.",
    "- UP/DOWN : intervalle ouvert `(departure, arrival)` ; indices `floor(start)+1 … ceil(end)−1`. TRANSITION : intervalle fermé `[arrival, departure]` ; indices `ceil(start) … floor(end)`. Ainsi, un sample situé exactement sur un pivot appartient à sa transition et n'est pas compté deux fois. Aucun sample extérieur n'est ajouté à une fenêtre trop courte.",
    "- v début/fin : lecture au temps GT exact ; interpolation linéaire entre les deux vitesses échantillonnées si l'index est fractionnaire. Ces valeurs interpolées ne participent pas aux proportions, min/max de fenêtre ou recherche du sample le plus proche de zéro.",
    "- Crossing : signes non nuls opposés, avec les deux samples encadrants et les éventuels zéros intermédiaires à l'intérieur de la fenêtre. Index reporté comme paire entière ; localisation fractionnaire par interpolation linéaire, sans résolution physique supplémentaire. Un zéro touché sans inversion n'est pas un changement de signe. Si plusieurs samples nuls sont traversés, le premier index nul et la liste complète figurent dans le JSON.",
    "- Fenêtre de 0 sample : statistiques N/D. Fenêtre de moins de 2 samples : changement de signe N/D, pas « absent ». Avec davantage de samples, « aucun » signifie seulement aucune inversion observée sur les samples internes, pas absence prouvée entre les samples ou aux bords fractionnaires.",
    "- Après pivot : vitesse au departure exact et au premier sample strictement après ce departure. Pour B6, seul arrival est connu ; aucun intervalle suivant ni durée de transition n'est inventé.",
    "- « Dérive cumulative apparente » : v(t)−v(0). Les résidus aux pivots sont compatibles avec une dérive mais ne mesurent pas seuls une erreur de vitesse vraie connue. Aucun retrait de moyenne ni remise à zéro.", "",
    "- L'affichage arrondit les vitesses à six décimales ; les signes sont évalués sur les valeurs non arrondies. En cas d'égalité pour le sample le plus proche de zéro, le premier index est retenu.", "",
    "## Sources GT et synchronisation", "",
    table(["Dataset", "Source", "Version déclarée", "Offset vidéo−IMU (s)"], results.map(r => [r.id, `\`${r.gtSource.path}\``, r.gtSource.annotationVersion ?? "absente", f(r.videoToImuOffsetSeconds, 3)])), "",
    "007 utilise les fenêtres arrival/departure existantes de `transition-annotations.json` : aucun fichier `007.v2.json` n'existe dans le dépôt. Ce fichier n'est pas présenté comme explicitement versionné V2. 009/010 utilisent leurs fichiers V2. Aucune GT n'a été modifiée.", "",
    "## FACT — comparaison globale", "",
    table(["Dataset", "N", "v[0]", "v min", "v max", "v moyenne", "v finale = Δv apparent", "Crossings capture"], results.map(r => [r.id, r.sampleCount, f(r.summary.initial), f(r.summary.min), f(r.summary.max), f(r.summary.mean), f(r.summary.final), r.allCrossings.length])), "",
    "Vitesses en m/s. Moyennes calculées sur tous les samples de la capture.", "",
    table(["Dataset", "Phase GT", "N", "Corrects", "Incorrects", "Zéros"], results.flatMap(r => r.aggregates.map(a => [r.id, a.phase, a.n, `${a.correct} (${pct(a.correct, a.n)})`, `${a.incorrect} (${pct(a.incorrect, a.n)})`, `${a.zero} (${pct(a.zero, a.n)})`]))), "",
    "Agrégation pondérée par le nombre de samples, sans moyenne des pourcentages de phases et sans samples TRANSITION.", "",
    table(["Dataset", "Transitions ≥2 samples", "Transitions 1 sample", "Transitions 0 sample", "Avec crossing interne", "Δv arrival B1→B6 (m/s)"], results.map(r => [
      r.id, r.transitions.filter(t => t.n >= 2).length, r.transitions.filter(t => t.n === 1).length,
      r.transitions.filter(t => t.n === 0).length, r.transitions.filter(t => t.signChangeObserved).length, f(r.summary.pivotSpanApparentDrift),
    ])), "",
  ];
  for (const r of results) {
    lines.push(`## Dataset ${r.id}`, "",
      `Baseline RAW XYZ = (${f(r.baseline.x, 2)}, ${f(r.baseline.y, 2)}, ${f(r.baseline.z, 2)}). Axe PCA = (${f(r.movementAxis.x, 9)}, ${f(r.movementAxis.y, 9)}, ${f(r.movementAxis.z, 9)}), signe ${r.signConvention}. Durée nominale premier→dernier sample : ${f(r.nominalDurationSeconds, 2)} s.`, "",
      `![Vitesse ${r.id} et intervalles GT](velocity_${r.id}.svg)`, "",
      "### Phases de mouvement GT", "",
      table(["Phase / trajet", "Vidéo début→fin (s)", "Indices GT exacts", "Samples internes", "N", "v début", "v fin", "v moyenne interne", "v>0", "v<0", "v==0", "Correct / incorrect"], r.movements.map(p => [
        `${p.phase} ${p.label}`, `${f(p.startVideoSeconds, 3)}→${f(p.endVideoSeconds, 3)}`, `(${f(p.start, 3)}, ${f(p.end, 3)})`, span(p.indices), p.n,
        f(p.startVelocity), f(p.endVelocity), f(p.sampleStatistics?.mean),
        `${p.positive} (${pct(p.positive, p.n)})`, `${p.negative} (${pct(p.negative, p.n)})`, `${p.zero} (${pct(p.zero, p.n)})`, `${p.correct} / ${p.incorrect}`,
      ])), "",
      "### Transitions GT", "",
      table(["Pivot", "Vidéo arrival→departure (s)", "Indices GT exacts", "Samples internes", "N", "v arrival", "v departure", "v min", "v max", "v la plus proche de 0 @ index", "Inversion observée / crossing"], r.transitions.map(t => [
        t.label, `${f(t.startVideoSeconds, 3)}→${f(t.endVideoSeconds, 3)}`, `[${f(t.start, 3)}, ${f(t.end, 3)}]`, span(t.indices), t.n,
        f(t.startVelocity), f(t.endVelocity), f(t.sampleStatistics?.min), f(t.sampleStatistics?.max),
        t.closestIndex === null ? "N/D" : `${f(t.closestVelocity)} @ ${t.closestIndex}`,
        t.signChangeObserved === null ? "N/D (<2 samples)" : t.signChangeObserved ? crossText(t.crossings) : "non observée",
      ])), "",
      "B6 : departure absent, aucune transition finie ni phase suivante créée. Les valeurs interpolées aux limites restent disponibles même si une fenêtre ne contient aucun sample.", "",
      "### Résidus et dérive apparente aux pivots", "",
      table(["Pivot", "v arrival", "v departure", "Premier sample après la borne connue", "v à ce sample", "Δv depuis borne pivot précédente", "Δv depuis arrival B1"], r.pivots.map(p => [
        p.label, f(p.arrivalVelocity), f(p.departureVelocity), p.firstAfterIndex, f(p.firstAfterVelocity), f(p.changeSincePreviousPivotBoundary), f(p.cumulativeChangeSinceFirstArrival),
      ])), "",
      `Δv apparent sample 0→fin = **${f(r.summary.apparentCumulativeDrift)} m/s**. Δv arrival B1→arrival B6 = **${f(r.summary.pivotSpanApparentDrift)} m/s**. La première différence par pivot compare departure B1 à arrival B1 ; la dernière utilise arrival B6 faute de departure.`, "",
      `Moyennes des cinq UP, dans l'ordre : ${r.movements.filter(p => p.phase === "UP").map(p => f(p.sampleStatistics?.mean)).join(", ")} m/s.`, "",
      `Moyennes des cinq DOWN, dans l'ordre : ${r.movements.filter(p => p.phase === "DOWN").map(p => f(p.sampleStatistics?.mean)).join(", ")} m/s.`, "",
      "### Zero-crossings sur toute la capture", "",
      table(["Samples encadrants", "Sens", "Index du zéro", "Localisation", "Fenêtre GT contenant les deux bornes"], r.allCrossings.map(c => [
        `${c.leftIndex}→${c.rightIndex}`, c.direction === "negative-to-positive" ? "−→+" : "+→−", f(c.crossingIndex), c.location,
        [...r.movements, ...r.transitions].filter(p => p.indices.includes(c.leftIndex) && p.indices.includes(c.rightIndex)).map(p => `${p.phase} ${p.label}`).join(", ") || "hors intervalle GT interne / chevauche une frontière",
      ])), "",
      `Samples exactement nuls (sans seuil) : ${r.exactZeroIndices.join(", ") || "aucun"}. Le sample 0 est nul par initialisation, ce n'est pas une inversion observée.`, "",
    );
  }
  lines.push(
    "## Conclusion — FACT", "",
    `**Avec cette configuration, le signe brut ne suit pas fidèlement les phases GT sur les trois captures.** 007 : ${pct(r007.aggregates[0].correct, r007.aggregates[0].n)} de concordance UP et ${pct(r007.aggregates[1].correct, r007.aggregates[1].n)} DOWN. 009 : ${pct(r009.aggregates[0].correct, r009.aggregates[0].n)} UP et ${pct(r009.aggregates[1].correct, r009.aggregates[1].n)} DOWN. 010 : ${pct(r010.aggregates[0].correct, r010.aggregates[0].n)} UP et ${pct(r010.aggregates[1].correct, r010.aggregates[1].n)} DOWN.`, "",
    `007 : les deux dernières moyennes DOWN sont positives (${r007.movements.filter(p => p.phase === "DOWN").slice(-2).map(p => f(p.sampleStatistics?.mean)).join(" ; ")} m/s), comme les moyennes UP correspondantes. Les résidus aux TOP sont tous positifs et atteignent ${f(r007.pivots[9].departureVelocity)} m/s à T5 departure. Cette évolution n'est pas monotone ; la faible différence arrival B1→B6 (${f(r007.summary.pivotSpanApparentDrift)} m/s) ne décrit pas les écarts intermédiaires.`, "",
    `009 : UP B2→T2 est entièrement négatif (0/${r009.movements[2].n} samples positifs). La fenêtre de mouvement GT dure exactement ${f(r009.movements[2].endVideoSeconds - r009.movements[2].startVideoSeconds, 3)} s et n'a pas été élargie. La dernière descente comporte ${r009.movements[9].positive}/${r009.movements[9].n} samples positifs ; sa moyenne est positive (${f(r009.movements[9].sampleStatistics?.mean)} m/s), comme l'UP précédent. Les résidus changent de signe au cours de la capture, sans dérive monotone démontrée.`, "",
    `010 : ${pct(r010.aggregates[0].negative, r010.aggregates[0].n)} des samples UP sont négatifs ; toutes les descentes le sont aussi. Les UP 3, 4 et 5 sont entièrement négatifs. Après le dernier crossing ${crossText(r010.allCrossings.slice(-1))}, tous les samples restants sont négatifs. Les moyennes UP et DOWN se décalent globalement vers les valeurs négatives, avec des remontées intermédiaires : ce n'est pas une évolution monotone. Le résidu arrival B1→B6 évolue de ${f(r010.summary.firstPivotArrivalVelocity)} à ${f(r010.summary.finalPivotArrivalVelocity)} m/s, soit ${f(r010.summary.pivotSpanApparentDrift)} m/s.`, "",
    `${withCrossing.length}/${assessable.length} transitions contenant au moins deux samples présentent un crossing interne observé. ${allTransitions.length - assessable.length} transitions contiennent moins de deux samples, dont ${allTransitions.filter(t => t.n === 0).length} sans aucun sample. Sur l'ensemble des captures, il existe néanmoins ${results.map(r => `${r.allCrossings.length} crossings pour ${r.id}`).join(", ")}, listés avec leurs indices dans le rapport. Leurs positions interpolées ne tombent dans aucune des fenêtres de transition de ces captures.`, "",
    "## Conclusion — INFERENCE", "",
    "Le signe contient une information partielle de direction, notamment sur plusieurs montées de 009, mais il n'est pas suffisamment stable pour servir seul de fondation fiable à UP/DOWN dans l'état testé. Les 100 % de concordance DOWN de 010 ne démontrent pas une séparation des sens : le signal reste négatif pendant les trois dernières montées également. Une inversion globale de polarité ne séparerait pas ces intervalles de même signe.", "",
    "Les résidus non nuls aux pivots et le décalage négatif persistant de 010 sont compatibles avec une dérive apparente de l'intégration. Ce diagnostic n'attribue pas ces écarts à une cause unique et ne certifie pas une vitesse physique absolue.", "",
    "## Conclusion — UNKNOWN", "",
    "- La fenêtre [0,100) n'est pas un repos certifié. Un niveau statique résiduel, un biais variable ou une vitesse initiale non nulle restent possibles ; v[0]=0 est une condition imposée.",
    "- La sensibilité réelle et l'état de calibration ne sont pas connus. Une erreur uniforme de sensibilité positive multiplie la vitesse et ne change pas seule son signe ; elle n'explique donc pas à elle seule les discordances. Des biais d'axes et erreurs non uniformes restent distincts de ce simple facteur.",
    "- Le pas réel et les éventuels samples perdus ne sont pas disponibles. Remplacer un dt constant positif par un autre ne fait que multiplier les valeurs intégrées ; en revanche, un mauvais axe temporel GT/IMU ou des intervalles réels irréguliers peuvent modifier l'association aux phases et l'intégration physique.",
    "- L'orientation réelle pendant le mouvement n'est pas établie. Une baseline fixe et une PCA fixe ne prouvent pas le retrait de la gravité variable ; +Z reste une convention géométrique et non une certification du sens vertical physique.",
    "- Les limites et l'alignement des annotations, notamment les fenêtres sub-sample, bornent ce qui peut être observé à 20 Hz. Les GT ont été utilisées telles quelles, sans estimation d'un nouvel offset ni déplacement des frontières.", "",
    "## Traçabilité", "", "Le fichier JSON associé contient les vitesses et accélérations complètes, les proportions sans arrondi, tous les indices, les empreintes SHA-256 des sources et les paramètres. Les graphiques n'affichent que les intervalles GT et les vitesses intégrées ; ils ne génèrent aucune annotation.", "",
    "Reproduction depuis la racine du workspace :", "",
    "```powershell", "node tools/calibration-runner/node_modules/tsx/dist/cli.mjs tools/benchmark/phase-blocks/diagnoseVelocity.ts", "```", "",
  );
  return lines.join("\n");
}

export function main() {
  const results = ["007", "009", "010"].map(diagnose);
  mkdirSync(OUTPUT, { recursive: true });
  for (const result of results) {
    writeFileSync(new URL(`velocity_${result.id}.svg`, OUTPUT), chart(result));
    // Source files must remain byte-identical throughout the diagnostic.
    for (const source of [result.datasetSource, result.gtSource]) {
      assert.equal(createHash("sha256").update(readFileSync(new URL(source.path, ROOT))).digest("hex"), source.sha256);
    }
  }
  writeFileSync(new URL("velocity_diagnostic.json", OUTPUT), JSON.stringify({ configuration: { ...CONFIG, dtSeconds: DT_SECONDS }, results }, null, 2) + "\n");
  writeFileSync(new URL("velocity_diagnostic.md", OUTPUT), report(results));
  console.log(JSON.stringify(results.map(r => ({ id: r.id, summary: r.summary, aggregates: r.aggregates,
    transitions: r.transitions.map(t => ({ label: t.label, n: t.n, signChangeObserved: t.signChangeObserved, crossings: t.crossings })),
    pivots: r.pivots, phaseMeans: r.movements.map(p => ({ phase: p.phase, mean: p.sampleStatistics?.mean, correct: p.correct, n: p.n })),
  })), null, 2));
  console.log(`Report: ${fileURLToPath(new URL("velocity_diagnostic.md", OUTPUT))}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
