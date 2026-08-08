import fs from "fs";
import path from "path";
import zlib from "zlib";
import {
  calculateCalibration,
  type CalibrationDataset,
  type CalibrationDebugEvent,
  type RawCalibrationCandidateDebug,
} from "../../../mobile/RepMotion/analytics/calibration";
import {
  analyzeBottomTopBottomCycles,
  type SegmentationEvent,
} from "../../calibration-runner/cycleAnalyzer";

type Dataset = CalibrationDataset & { datasetName: string };
type Candidate = SegmentationEvent & { value: number };
type SelectedEvent = Candidate & {
  current: boolean;
  global: boolean;
  category: "COMMON" | "CURRENT_ONLY" | "GLOBAL_ONLY";
};
type RGB = [number, number, number];

const PARAMETERS = {
  rawDetectionStrategy: "local_extrema" as const,
  minimumDistanceSamples: 70,
  minimumProminenceRatio: 0.08,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
  prominenceWindowSize: 8,
};
const CYCLE_PARAMETERS = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
};
const OUTPUT_DIRECTORY = path.resolve(
  __dirname,
  "qualitative-global-path-report",
);

function key(event: SegmentationEvent): string {
  return `${event.type}:${event.index}`;
}

function unique<T extends SegmentationEvent>(events: T[]): T[] {
  return [...new Map(events.map((event) => [key(event), event])).values()];
}

function stage(
  events: CalibrationDebugEvent[],
  filter: CalibrationDebugEvent["filter"],
): Candidate[] {
  return unique(
    events
      .filter((event) => event.filter === filter && event.kept)
      .map((event) => ({
        type: event.type,
        index: event.index,
        value: event.value,
      })),
  );
}

function rawByType(
  events: RawCalibrationCandidateDebug[],
  type: SegmentationEvent["type"],
): RawCalibrationCandidateDebug[] {
  return unique(events.filter((event) => event.type === type));
}

function loadDatasets(): Dataset[] {
  const root = path.resolve(__dirname, "../../../datasets/calibration");
  const result: Dataset[] = [];

  for (const exercise of fs.readdirSync(root).sort()) {
    const directory = path.join(root, exercise);
    if (!fs.statSync(directory).isDirectory()) continue;

    for (const file of fs.readdirSync(directory).sort()) {
      if (!file.endsWith(".json")) continue;
      const dataset = JSON.parse(
        fs.readFileSync(path.join(directory, file), "utf8"),
      ) as CalibrationDataset;
      result.push({ ...dataset, datasetName: file });
    }
  }

  return result;
}

function selected(
  debug:
    | ReturnType<typeof calculateCalibration>["debug"]
    | undefined,
): Candidate[] {
  const values = new Map(
    (debug?.rawCandidateDebugEvents ?? []).map((event) => [
      key(event),
      event.value,
    ]),
  );
  return [
    ...(debug?.selectedBottomIndexes ?? []).map((index) => ({
      type: "BOTTOM" as const,
      index,
      value: values.get(`BOTTOM:${index}`) ?? Number.NaN,
    })),
    ...(debug?.selectedTopIndexes ?? []).map((index) => ({
      type: "TOP" as const,
      index,
      value: values.get(`TOP:${index}`) ?? Number.NaN,
    })),
  ].sort((a, b) => a.index - b.index);
}

function sequence(events: SegmentationEvent[]): string {
  return events
    .map((event) => `${event.type === "BOTTOM" ? "B" : "T"}(${event.index})`)
    .join(" -> ");
}

function replayFinalStates(candidates: Candidate[], expectedReps: number) {
  type State = {
    score: number;
    candidateIndex: number;
    lastBottomIndex: number | null;
  };
  const pooled = [...candidates].sort((a, b) => a.index - b.index);
  let states = new Map<string, State>([
    [
      "0:-1:-1",
      { score: 0, candidateIndex: -1, lastBottomIndex: null },
    ],
  ]);

  for (let step = 0; step < expectedReps * 2 + 1; step += 1) {
    const required = step % 2 === 0 ? "BOTTOM" : "TOP";
    const next = new Map<string, State>();
    for (const state of states.values()) {
      const previous =
        state.candidateIndex < 0 ? null : pooled[state.candidateIndex];
      for (let index = 0; index < pooled.length; index += 1) {
        const candidate = pooled[index];
        if (
          candidate.type !== required ||
          (previous && candidate.index <= previous.index)
        ) {
          continue;
        }
        if (previous) {
          const duration = candidate.index - previous.index;
          if (
            (required === "TOP" &&
              duration < CYCLE_PARAMETERS.minConcentricDuration) ||
            (required === "BOTTOM" &&
              duration < CYCLE_PARAMETERS.minEccentricDuration) ||
            (required === "BOTTOM" &&
              state.lastBottomIndex !== null &&
              candidate.index - state.lastBottomIndex <
                CYCLE_PARAMETERS.minRepDuration)
          ) {
            continue;
          }
        }
        const lastBottom =
          required === "BOTTOM" ? candidate.index : state.lastBottomIndex;
        const score =
          state.score +
          (candidate.type === "BOTTOM" ? -candidate.value : candidate.value);
        const stateKey = `${step + 1}:${index}:${lastBottom ?? -1}`;
        const existing = next.get(stateKey);
        if (!existing || score > existing.score) {
          next.set(stateKey, {
            score,
            candidateIndex: index,
            lastBottomIndex: lastBottom,
          });
        }
      }
    }
    states = next;
    if (states.size === 0) break;
  }
  return states.size;
}

const FONT: Record<string, string[]> = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "-": ["000", "000", "000", "111", "000", "000", "000"],
  "_": ["000", "000", "000", "000", "000", "000", "111"],
  ".": ["000", "000", "000", "000", "000", "110", "110"],
  ":": ["000", "110", "110", "000", "110", "110", "000"],
  "(": ["010", "100", "100", "100", "100", "100", "010"],
  ")": ["010", "001", "001", "001", "001", "001", "010"],
  "0": ["111", "101", "101", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["111", "001", "001", "111", "100", "100", "111"],
  "3": ["111", "001", "001", "111", "001", "001", "111"],
  "4": ["101", "101", "101", "111", "001", "001", "001"],
  "5": ["111", "100", "100", "111", "001", "001", "111"],
  "6": ["111", "100", "100", "111", "101", "101", "111"],
  "7": ["111", "001", "001", "010", "010", "010", "010"],
  "8": ["111", "101", "101", "111", "101", "101", "111"],
  "9": ["111", "101", "101", "111", "001", "001", "111"],
};
const LETTERS: Record<string, string[]> = {
  A: ["010", "101", "101", "111", "101", "101", "101"],
  B: ["110", "101", "101", "110", "101", "101", "110"],
  C: ["111", "100", "100", "100", "100", "100", "111"],
  D: ["110", "101", "101", "101", "101", "101", "110"],
  E: ["111", "100", "100", "110", "100", "100", "111"],
  F: ["111", "100", "100", "110", "100", "100", "100"],
  G: ["111", "100", "100", "101", "101", "101", "111"],
  H: ["101", "101", "101", "111", "101", "101", "101"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  L: ["100", "100", "100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101", "101", "101"],
  N: ["101", "111", "111", "111", "111", "111", "101"],
  O: ["111", "101", "101", "101", "101", "101", "111"],
  P: ["110", "101", "101", "110", "100", "100", "100"],
  R: ["110", "101", "101", "110", "101", "101", "101"],
  S: ["111", "100", "100", "111", "001", "001", "111"],
  T: ["111", "010", "010", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "101", "101", "010"],
  W: ["101", "101", "101", "101", "111", "111", "101"],
  X: ["101", "101", "010", "010", "010", "101", "101"],
  Y: ["101", "101", "101", "010", "010", "010", "010"],
  Z: ["111", "001", "001", "010", "100", "100", "111"],
};
Object.assign(FONT, LETTERS);

class Raster {
  readonly pixels: Uint8Array;
  constructor(
    readonly width: number,
    readonly height: number,
    background: RGB = [255, 255, 255],
  ) {
    this.pixels = new Uint8Array(width * height * 3);
    for (let index = 0; index < width * height; index += 1) {
      this.pixels.set(background, index * 3);
    }
  }
  point(x: number, y: number, color: RGB) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.pixels.set(color, (y * this.width + x) * 3);
  }
  line(x0: number, y0: number, x1: number, y1: number, color: RGB) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let step = 0; step <= steps; step += 1) {
      const ratio = step / steps;
      this.point(x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio, color);
    }
  }
  rectangle(x: number, y: number, width: number, height: number, color: RGB) {
    for (let yy = y; yy < y + height; yy += 1) {
      for (let xx = x; xx < x + width; xx += 1) this.point(xx, yy, color);
    }
  }
  marker(x: number, y: number, shape: "circle" | "square" | "up" | "down", color: RGB) {
    for (let yy = -6; yy <= 6; yy += 1) {
      for (let xx = -6; xx <= 6; xx += 1) {
        const inside =
          shape === "circle"
            ? xx * xx + yy * yy <= 36
            : shape === "square"
              ? true
              : shape === "up"
                ? yy >= -6 && yy <= 6 && Math.abs(xx) <= (yy + 6) / 2
                : yy >= -6 && yy <= 6 && Math.abs(xx) <= (6 - yy) / 2;
        if (inside) this.point(x + xx, y + yy, color);
      }
    }
  }
  text(x: number, y: number, value: string, color: RGB, scale = 2) {
    let cursor = x;
    for (const character of value.toUpperCase()) {
      const glyph = FONT[character] ?? FONT[" "];
      glyph.forEach((row, rowIndex) =>
        [...row].forEach((bit, columnIndex) => {
          if (bit === "1") {
            this.rectangle(
              cursor + columnIndex * scale,
              y + rowIndex * scale,
              scale,
              scale,
              color,
            );
          }
        }),
      );
      cursor += 4 * scale;
    }
  }
  write(filePath: string) {
    const scanlines = Buffer.alloc((this.width * 3 + 1) * this.height);
    for (let y = 0; y < this.height; y += 1) {
      const destination = y * (this.width * 3 + 1);
      scanlines[destination] = 0;
      Buffer.from(
        this.pixels.subarray(y * this.width * 3, (y + 1) * this.width * 3),
      ).copy(scanlines, destination + 1);
    }
    const signature = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.width, 0);
    ihdr.writeUInt32BE(this.height, 4);
    ihdr.set([8, 2, 0, 0, 0], 8);
    fs.writeFileSync(
      filePath,
      Buffer.concat([
        signature,
        pngChunk("IHDR", ihdr),
        pngChunk("IDAT", zlib.deflateSync(scanlines)),
        pngChunk("IEND", Buffer.alloc(0)),
      ]),
    );
  }
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const name = Buffer.from(type);
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length, 0);
  name.copy(result, 4);
  data.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([name, data])), data.length + 8);
  return result;
}

function drawPlot(
  filePath: string,
  title: string,
  signal: number[],
  current: Candidate[],
  global: Candidate[],
  globalReps: ReturnType<typeof analyzeBottomTopBottomCycles>["reconstructedReps"],
  bounds: [number, number] = [0, signal.length - 1],
) {
  const image = new Raster(1600, 900);
  const left = 90;
  const right = 1540;
  const top = 110;
  const bottom = 820;
  const [start, end] = bounds;
  const visible = signal.slice(start, end + 1);
  const minimum = Math.min(...visible);
  const maximum = Math.max(...visible);
  const padding = Math.max((maximum - minimum) * 0.05, 1);
  const yMin = minimum - padding;
  const yMax = maximum + padding;
  const x = (index: number) =>
    left + ((index - start) / Math.max(end - start, 1)) * (right - left);
  const y = (value: number) =>
    bottom - ((value - yMin) / (yMax - yMin)) * (bottom - top);

  image.text(90, 25, title, [20, 20, 20], 3);
  image.text(90, 65, `X ${start}-${end}  Y ${Math.round(yMin)}-${Math.round(yMax)}`, [50, 50, 50], 2);
  image.line(left, top, left, bottom, [0, 0, 0]);
  image.line(left, bottom, right, bottom, [0, 0, 0]);

  for (const rep of globalReps) {
    if (rep.bottomEnd < start || rep.bottomStart > end) continue;
    image.line(x(rep.bottomStart), top, x(rep.bottomStart), bottom, [220, 220, 220]);
    image.text(x(rep.bottomStart) + 3, top + 5, `REP ${rep.repNumber}`, [120, 120, 120], 1);
  }
  image.line(x(Math.max(start, 0)), y(signal[Math.max(start, 0)]), x(Math.max(start, 0)), y(signal[Math.max(start, 0)]), [90, 90, 90]);
  for (let index = start + 1; index <= end; index += 1) {
    image.line(x(index - 1), y(signal[index - 1]), x(index), y(signal[index]), [90, 90, 90]);
  }

  const styles = [
    { events: current.filter((event) => event.type === "BOTTOM"), shape: "circle" as const, color: [210, 35, 35] as RGB, label: "BOTTOM CURRENT" },
    { events: current.filter((event) => event.type === "TOP"), shape: "square" as const, color: [30, 80, 210] as RGB, label: "TOP CURRENT" },
    { events: global.filter((event) => event.type === "BOTTOM"), shape: "up" as const, color: [235, 135, 20] as RGB, label: "BOTTOM GLOBAL" },
    { events: global.filter((event) => event.type === "TOP"), shape: "down" as const, color: [20, 150, 70] as RGB, label: "TOP GLOBAL" },
  ];
  styles.forEach((style, legendIndex) => {
    image.marker(1030 + (legendIndex % 2) * 260, 45 + Math.floor(legendIndex / 2) * 28, style.shape, style.color);
    image.text(1045 + (legendIndex % 2) * 260, 38 + Math.floor(legendIndex / 2) * 28, style.label, style.color, 1);
    for (const event of style.events) {
      if (event.index < start || event.index > end) continue;
      const markerY = y(signal[event.index]);
      image.marker(x(event.index), markerY, style.shape, style.color);
      image.text(x(event.index) - 12, markerY + (event.type === "BOTTOM" ? 12 : -24), String(event.index), style.color, 1);
    }
  });
  image.write(filePath);
}

function main() {
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  const all = loadDatasets();
  const measured = all.map((dataset) => {
    const expected = dataset.performedReps ?? dataset.expectedReps;
    const current = calculateCalibration(dataset.samples, undefined, {
      ...PARAMETERS,
      minDistanceStrategy: "current",
      selectionStrategy: "current_filters",
    }, expected);
    const global = calculateCalibration(dataset.samples, undefined, {
      ...PARAMETERS,
      selectionStrategy: "global_alternating_path",
    }, expected);
    const currentEvents = selected(current.debug);
    const globalEvents = selected(global.debug);
    const currentAnalysis = analyzeBottomTopBottomCycles(
      current.debug?.selectedBottomIndexes ?? [],
      current.debug?.selectedTopIndexes ?? [],
      expected,
      CYCLE_PARAMETERS,
    );
    return {
      dataset,
      expected,
      current,
      global,
      currentEvents,
      globalEvents,
      currentAnalysis,
      currentDifference: Math.abs(currentAnalysis.simulatedReps - expected),
    };
  });

  const overhead = measured
    .filter((item) => item.dataset.exercise === "overhead_press")
    .sort(
      (a, b) =>
        b.currentDifference - a.currentDifference ||
        a.dataset.datasetName.localeCompare(b.dataset.datasetName),
    )[0];
  const targets = [
    measured.find((item) => item.dataset.datasetName === "rowing_5reps_005.json"),
    measured.find((item) => item.dataset.datasetName === "rowing_5reps_002.json"),
    overhead,
  ];
  if (targets.some((target) => !target)) throw new Error("Target dataset missing.");

  const report: string[] = [
    "# Global alternating path — qualitative validation",
    "",
    "Rapport descriptif d’instrumentation. Aucune modification de calibration, du DP, du score, des seuils ou des datasets.",
    "",
    "## Définition de `eligibleCandidatesCount`",
    "",
    "- `calibration.ts`, branche `global_alternating_path` : candidats RAW, puis filtre `PROMINENCE`, puis filtre `DIRECTION_CHANGE`; `admissibleCandidateCount = bottoms.length + tops.length`. Aucun filtre `MIN_DISTANCE` n’est appliqué dans cette branche.",
    "- `globalPathComparisonRunner.ts` : événements de debug uniques où `filter === DIRECTION_CHANGE && kept`, dédupliqués par `(type,index)`; le total est `globalEligibleCandidatesCount`.",
    "- `inspectGlobalPath.ts` : applique la même extraction syntaxique, mais sur `current.debug`. Cette population a auparavant traversé `MIN_DISTANCE`, contrairement à la branche globale. Elle ne mesure donc pas la même population.",
    "- Dans les données auditées ci-dessous, le total dédupliqué du runner qualitatif est comparé à `admissibleCandidateCount` exposé par la calibration; toute différence est affichée explicitement.",
    "",
    "La moyenne 54.6 du benchmark porte sur les survivants `PROMINENCE + DIRECTION_CHANGE` de la branche globale sur les 10 datasets. Les anciens chiffres d’`inspectGlobalPath.ts` portent sur les survivants de `MIN_DISTANCE + PROMINENCE + DIRECTION_CHANGE` de `current_filters` pour deux datasets.",
    "",
    `Dataset overhead_press déterminé automatiquement : **${overhead.dataset.datasetName}** (` +
      `currentRepDifference=${overhead.currentDifference}).`,
  ];

  for (const item of targets as NonNullable<(typeof targets)[number]>[]) {
    const { dataset, current, global, currentEvents, globalEvents } = item;
    const globalDebug = global.debug!;
    const currentDebug = current.debug!;
    const rawBottoms = rawByType(globalDebug.rawCandidateDebugEvents, "BOTTOM");
    const rawTops = rawByType(globalDebug.rawCandidateDebugEvents, "TOP");
    const prominence = stage(globalDebug.filterDebugEvents, "PROMINENCE");
    const direction = stage(globalDebug.filterDebugEvents, "DIRECTION_CHANGE");
    const inspectDirection = stage(currentDebug.filterDebugEvents, "DIRECTION_CHANGE");
    const currentKeys = new Set(currentEvents.map(key));
    const globalKeys = new Set(globalEvents.map(key));
    const valueLookup = new Map(
      [...globalDebug.rawCandidateDebugEvents, ...currentDebug.rawCandidateDebugEvents].map(
        (event) => [key(event), event.value],
      ),
    );
    const allSelected = unique([...currentEvents, ...globalEvents])
      .sort((a, b) => a.index - b.index)
      .map<SelectedEvent>((event) => {
        const inCurrent = currentKeys.has(key(event));
        const inGlobal = globalKeys.has(key(event));
        return {
          ...event,
          value: valueLookup.get(key(event)) ?? event.value,
          current: inCurrent,
          global: inGlobal,
          category: inCurrent && inGlobal ? "COMMON" : inCurrent ? "CURRENT_ONLY" : "GLOBAL_ONLY",
        };
      });
    const common = allSelected.filter((event) => event.category === "COMMON").length;
    const currentOnly = allSelected.filter((event) => event.category === "CURRENT_ONLY").length;
    const globalOnly = allSelected.filter((event) => event.category === "GLOBAL_ONLY").length;
    const globalAnalysis = analyzeBottomTopBottomCycles(
      globalDebug.selectedBottomIndexes,
      globalDebug.selectedTopIndexes,
      item.expected,
      CYCLE_PARAMETERS,
    );
    const axis = global.axis;
    const signal = dataset.samples.map((sample) => sample[axis]);
    const baseName = dataset.datasetName.replace(".json", "");
    const fullPng = `${baseName}_full_comparison.png`;
    const zoomPng = `${baseName}_divergence_windows.png`;

    drawPlot(
      path.join(OUTPUT_DIRECTORY, fullPng),
      `${dataset.datasetName} AXIS ${axis}`,
      signal,
      currentEvents,
      globalEvents,
      globalAnalysis.reconstructedReps,
    );
    const divergentIndexes = allSelected
      .filter((event) => event.category !== "COMMON")
      .map((event) => event.index);
    const zoomStart = Math.max(0, Math.min(...divergentIndexes) - 40);
    const zoomEnd = Math.min(
      signal.length - 1,
      Math.max(...divergentIndexes) + 40,
    );
    drawPlot(
      path.join(OUTPUT_DIRECTORY, zoomPng),
      `${dataset.datasetName} DIVERGENCES AXIS ${axis}`,
      signal,
      currentEvents,
      globalEvents,
      globalAnalysis.reconstructedReps,
      [zoomStart, zoomEnd],
    );

    report.push(
      "",
      `## ${dataset.datasetName}`,
      "",
      `![Comparaison complète](./${fullPng})`,
      "",
      `![Fenêtres de divergences](./${zoomPng})`,
      "",
      "### Comptes de candidats",
      "",
      "| Population unique par (type,index) | Bottoms | Tops | Total |",
      "|---|---:|---:|---:|",
      `| RAW | ${rawBottoms.length} | ${rawTops.length} | ${rawBottoms.length + rawTops.length} |`,
      `| après PROMINENCE | ${prominence.filter((e) => e.type === "BOTTOM").length} | ${prominence.filter((e) => e.type === "TOP").length} | ${prominence.length} |`,
      `| après DIRECTION_CHANGE / eligible Global | ${direction.filter((e) => e.type === "BOTTOM").length} | ${direction.filter((e) => e.type === "TOP").length} | ${direction.length} |`,
      `| population appelée eligible par inspectGlobalPath.ts (current.debug) | ${inspectDirection.filter((e) => e.type === "BOTTOM").length} | ${inspectDirection.filter((e) => e.type === "TOP").length} | ${inspectDirection.length} |`,
      `| Global selected | ${globalEvents.filter((e) => e.type === "BOTTOM").length} | ${globalEvents.filter((e) => e.type === "TOP").length} | ${globalEvents.length} |`,
      "",
      `Calibration \`admissibleCandidateCount\`: ${globalDebug.admissibleCandidateCount}; total eligible dédupliqué: ${direction.length}; cohérence: **${globalDebug.admissibleCandidateCount === direction.length ? "OUI" : "NON"}**.`,
      "",
      "### Divergences",
      "",
      "| index | type | value | current | global | catégorie |",
      "|---:|---|---:|---|---|---|",
      ...allSelected.map(
        (event) =>
          `| ${event.index} | ${event.type} | ${event.value} | ${event.current ? "YES" : "NO"} | ${event.global ? "YES" : "NO"} | ${event.category} |`,
      ),
      "",
      `- commonSelectedEventsCount: ${common}`,
      `- currentOnlyEventsCount: ${currentOnly}`,
      `- globalOnlyEventsCount: ${globalOnly}`,
      `- overlapRate (intersection / union): ${(common / allSelected.length).toFixed(4)}`,
      `- current sequence: ${sequence(currentEvents)}`,
      `- global sequence: ${sequence(globalEvents)}`,
      `- current simulatedReps: ${item.currentAnalysis.simulatedReps}`,
      `- global simulatedReps: ${globalAnalysis.simulatedReps}`,
      `- globalPathScore: ${globalDebug.selectionScore}`,
      `- globalFinalStatesCount: ${replayFinalStates(direction, item.expected)}`,
      "",
      "### Contexte local des événements divergents",
      "",
      "| index | type | value | selected précédent | distance | selected suivant | distance | amplitude locale disponible | autres RAW candidats à ±40 samples | fenêtre locale |",
      "|---:|---|---:|---|---:|---|---:|---:|---|---|",
    );
    const raw = unique(globalDebug.rawCandidateDebugEvents);
    for (const event of allSelected.filter((candidate) => candidate.category !== "COMMON")) {
      const position = allSelected.findIndex((candidate) => key(candidate) === key(event));
      const previous = allSelected[position - 1];
      const next = allSelected[position + 1];
      const rawEvent = raw.find((candidate) => key(candidate) === key(event));
      const nearby = raw
        .filter(
          (candidate) =>
            key(candidate) !== key(event) &&
            Math.abs(candidate.index - event.index) <= 40,
        )
        .map((candidate) => `${candidate.type[0]}(${candidate.index})`)
        .join(", ");
      const localPng = `${baseName}_zoom_${event.index}_${event.type.toLowerCase()}.png`;
      drawPlot(
        path.join(OUTPUT_DIRECTORY, localPng),
        `${dataset.datasetName} ${event.type} ${event.index} AXIS ${axis}`,
        signal,
        currentEvents,
        globalEvents,
        globalAnalysis.reconstructedReps,
        [
          Math.max(0, event.index - 40),
          Math.min(signal.length - 1, event.index + 40),
        ],
      );
      report.push(
        `| ${event.index} | ${event.type} | ${event.value} | ${previous ? `${previous.type[0]}(${previous.index})` : "—"} | ${previous ? event.index - previous.index : "—"} | ${next ? `${next.type[0]}(${next.index})` : "—"} | ${next ? next.index - event.index : "—"} | ${rawEvent?.localAmplitude ?? "—"} | ${nearby || "—"} | [PNG](./${localPng}) |`,
      );
    }
    report.push(
      "",
      "### Durées Global",
      "",
      "| repNumber | bottomStartIndex | topIndex | bottomEndIndex | concentricDuration | eccentricDuration | totalDuration |",
      "|---:|---:|---:|---:|---:|---:|---:|",
      ...globalAnalysis.reconstructedReps.map(
        (rep) =>
          `| ${rep.repNumber} | ${rep.bottomStart} | ${rep.top} | ${rep.bottomEnd} | ${rep.concentricDuration} | ${rep.eccentricDuration} | ${rep.totalDuration} |`,
      ),
    );
  }

  report.push(
    "",
    "## Fichiers PNG générés",
    "",
    ...fs
      .readdirSync(OUTPUT_DIRECTORY)
      .filter((file) => file.endsWith(".png"))
      .sort()
      .map((file) => `- \`${file}\``),
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIRECTORY, "REPORT.md"),
    `${report.join("\n")}\n`,
    "utf8",
  );
  console.log(`Report: ${path.join(OUTPUT_DIRECTORY, "REPORT.md")}`);
  console.log(`Selected overhead_press: ${overhead.dataset.datasetName}`);
  console.log(`PNG files: ${fs.readdirSync(OUTPUT_DIRECTORY).filter((file) => file.endsWith(".png")).length}`);
}

main();
