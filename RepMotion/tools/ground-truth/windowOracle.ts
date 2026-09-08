import { validatePath } from "../../mobile/RepMotion/analytics/delayed-context-path/validation/validatePath";
import type { Candidate } from "../../mobile/RepMotion/analytics/delayed-context-path/types";
import type { DelayedContextPathResult } from "../../mobile/RepMotion/analytics/delayed-context-path/delayedContextPath";
type Event = { type: string; rep: number; arrivalSampleFloat: number; departureSampleFloat: number | null };
export function windowOracle(events: Event[], start: number, values: number[]) {
  const groups = events.map(e => {
    const first = Math.ceil(Math.max(start, e.arrivalSampleFloat));
    const last = e.departureSampleFloat === null ? first - 1 : Math.min(start + values.length - 1, Math.floor(e.departureSampleFloat));
    let indices = Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);
    const approximatedBecauseSamplingResolution = e.departureSampleFloat !== null && Math.ceil(e.arrivalSampleFloat) > Math.floor(e.departureSampleFloat);
    if (!indices.length) {
      if (e.departureSampleFloat !== null && !approximatedBecauseSamplingResolution) throw new Error("WINDOW_OUTSIDE_RETAINED_SIGNAL");
      const distance = (i: number) => Number((e.departureSampleFloat === null ? Math.abs(i - e.arrivalSampleFloat) : Math.max(e.arrivalSampleFloat - i, 0, i - e.departureSampleFloat)).toFixed(10));
      const all = Array.from({ length: values.length }, (_, i) => start + i);
      const minimum = Math.min(...all.map(distance)); indices = all.filter(i => distance(i) === minimum);
    }
    return { event: `${e.type === "BOTTOM" ? "B" : "T"}${e.rep}`, ...e, indices, approximatedBecauseSamplingResolution,
      candidates: indices.map(i => ({ type: e.type as "BOTTOM" | "TOP", index: i - start, value: values[i - start], candidateId: `WINDOW_ORACLE_${e.type}_${i - start}` })) };
  });
  let visited = 0;
  function search(path: Candidate[]): Candidate[] | null {
    if (path.length === groups.length) return path;
    for (const c of groups[path.length].candidates) { visited++; const next = [...path, c]; if (validatePath(next)) { const found = search(next); if (found) return found; } }
    return null;
  }
  const witness = search([]);
  return { groups, existence: { exists: witness !== null, witnessOriginal: witness?.map(c => ({ type: c.type, index: c.index + start })) ?? null,
    visited, method: "Exhaustive depth-first search, pruning only prefixes rejected by production validatePath; stops on first witness. Not a score optimum." } };
}
export function traceWindowOracle(oracle: ReturnType<typeof windowOracle>, result: DelayedContextPathResult, start: number) {
  const compatible = (path: {type:string;index:number}[]) => path.length === oracle.groups.length && path.every((c,i) => oracle.groups[i].candidates.some(o => o.type === c.type && o.index === c.index));
  const a = result.systemA.generatedAudit.filter(r => compatible(r.chain));
  const c = result.systemC.generatedAudit.filter(r => compatible(r.chain));
  const d = result.composition.combinedRanking.filter(row => compatible(row.path.split('|').map(s => ({type:s.split(':')[0],index:Number(s.split(':')[1])}))));
  const coverage = oracle.groups.map((g, position) => ({ event:g.event,
    base: g.candidates.some(o => result.initialPath[position]?.type === o.type && result.initialPath[position]?.index === o.index),
    A: result.systemA.generatedAudit.some(r=>g.candidates.some(o=>r.chain[position]?.type===o.type&&r.chain[position]?.index===o.index)),
    C: result.systemC.generatedAudit.some(r=>g.candidates.some(o=>r.chain[position]?.type===o.type&&r.chain[position]?.index===o.index)),
    segments: result.extractedSegments.segments.some(s=> position>=s.start&&position<=s.end&&g.candidates.some(o=>s.replacements[position-s.start]?.type===o.type&&s.replacements[position-s.start]?.index===o.index)),
    D: [...result.composition.uniquePaths.values()].some(r=>g.candidates.some(o=>r.state.path[position]?.type===o.type&&r.state.path[position]?.index===o.index)) }));
  return { completeCompatibleA:a.length,completeCompatibleC:c.length,completeCompatibleD:d.length,
    bestCompatibleInD:d[0]??null, bestCompatibleRankInD:d.length?result.composition.combinedRanking.indexOf(d[0])+1:null,
    winner:result.composition.combinedWinner??null, coverage,
    scoreIndexSpace:"local", indexOffset:start,
    note:"Coverage at the correct ordinal position, not arbitrary occurrence. Missing complete A/C paths alone does not prove loss: D composes partial segments. D results are limited by its guard." };
}
