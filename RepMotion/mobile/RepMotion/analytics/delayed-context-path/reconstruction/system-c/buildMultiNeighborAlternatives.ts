import { criteriaAtCycle, multiNeighborConfig as limits } from '../../config';
import { scoreCandidate } from '../../promotion/scoreCandidate';
import { calculateConfidence } from '../../scoring/calculateConfidence';
import { normalizeFeatures } from '../../scoring/normalizeFeatures';
import { scoreSequence } from '../../scoring/scoreSequence';
import { calculateWeights } from '../../scoring/weights';
import type { Candidate, DelayedContextPath } from '../../types';
import { minConcentricDuration, minEccentricDuration } from '../../validation/structuralRules';
import { validatePath } from '../../validation/validatePath';
import type { LocalReconstructionCandidate } from '../shared/types';

export type MultiNeighborDiagnostics = {
  targets: number; states: number; generated: number; structurallyRejected: number;
  duplicates: number; beamPruned: number; rankingPruned: number; retained: number;
  targetBudgetHits: number; legacyAdmissionBudgetHits: number;
  guard: 'MULTI_MAX_STATES' | 'MULTI_MAX_SEEDS' | null;
};
const signature = (path: DelayedContextPath) => path.map(c => `${c.type}:${c.index}`).join('|');

// Only validated assigned prefixes (or validated full paths) enter scoring.
// This is the existing promotion score, with unavailable criteria omitted.
function rank(paths: DelayedContextPath[], active: DelayedContextPath, cycle: number, values: number[]) {
  if (!paths.length) return [];
  // scoreSequence requires completed B-T-B triples. Until one exists there
  // is no score: retain deterministic signature order, without inventing one.
  cycle = Math.min(cycle, Math.floor((paths[0].length - 1) / 2));
  if (cycle < 1) return [...paths].sort((a, b) => signature(a).localeCompare(signature(b)));
  const features = paths.map(p => scoreSequence(p, cycle, values));
  const activeFeatures = scoreSequence(active, cycle, values);
  const criteria = criteriaAtCycle[cycle].filter(k => activeFeatures[k] !== null && features.every(f => f[k] !== null));
  const normalized = normalizeFeatures(activeFeatures, features, criteria);
  const confidence = calculateConfidence(activeFeatures, features, criteria);
  const weights = calculateWeights(criteria);
  return paths.map((p, i) => ({ path: p, score: scoreCandidate(p[p.length - 1], features[i], normalized[i], weights, confidence, criteria).score }))
    .sort((a, b) => b.score - a.score || signature(a.path).localeCompare(signature(b.path)))
    .map(row => row.path);
}

export function createMultiNeighborSearch() {
  const stats: MultiNeighborDiagnostics = { targets: 0, states: 0, generated: 0, structurallyRejected: 0, duplicates: 0, beamPruned: 0, rankingPruned: 0, retained: 0, targetBudgetHits: 0, legacyAdmissionBudgetHits: 0, guard: null };
  const rows: LocalReconstructionCandidate[] = [];
  const unique = new Set<string>();
  return { rows, stats, unique };
}

// Called synchronously only after the caller proves zero legacy repairs.
// The session is shared for the cycle: invoking a new target never resets budgets.
export function buildMultiNeighborAlternatives(active: DelayedContextPath, pool: Candidate[], cycle: number, values: number[], position: number, target: Candidate, search = createMultiNeighborSearch()) {
  const { rows, stats, unique } = search;
  const prefixLength = Math.min(active.length, cycle * 2 + 1);
  stats.targets++;
  if (stats.guard) return search;
  if (position < 0 || position >= prefixLength || target.type !== active[position].type || !pool.some(c => c.type === target.type && c.index === target.index)) throw new Error("INVALID_MULTI_TARGET");
  const single = [...active]; single[position] = target;
  if (validatePath(single.slice(0, prefixLength))) return search;
      let targetStates = 0;
      const complete = new Map<string, { path: DelayedContextPath; start: number; end: number }>();
      for (let length = 3; length <= limits.maxWindowPositions; length++) {
        for (let start = Math.max(0, position - length + 1); start <= position && start + length <= prefixLength; start++) {
          if (stats.guard || targetStates >= limits.maxStatesPerTarget) break;
          const end = start + length - 1;
          let beam: DelayedContextPath[] = [active.slice(0, start)];
          for (let p = start; p <= end && beam.length; p++) {
            const next = new Map<string, DelayedContextPath>();
            const options = p === position ? [target] : pool.filter(c => c.type === active[p].type);
            for (const prefix of beam) {
              for (const option of options) {
                if (targetStates >= limits.maxStatesPerTarget || stats.states >= limits.maxStatesPerCycle) break;
                targetStates++; stats.states++;
                const partial = [...prefix, option];
                // Necessary bound to the fixed target, before building/scoring
                // any prefix that cannot reach it under minimum phase lengths.
                let minimumToTarget = 0;
                for (let q = p + 1; q <= position; q++) minimumToTarget += active[q].type === 'TOP' ? minConcentricDuration : minEccentricDuration;
                if (!validatePath(partial) || (p < position && option.index + minimumToTarget > target.index)) { stats.structurallyRejected++; continue; }
                const key = signature(partial);
                if (next.has(key)) stats.duplicates++; else next.set(key, partial);
              }
              if (targetStates >= limits.maxStatesPerTarget || stats.states >= limits.maxStatesPerCycle) break;
            }
            if (p === end) {
              for (const prefix of next.values()) {
                const path = [...prefix, ...active.slice(end + 1)]; stats.generated++;
                if (!validatePath(path)) { stats.structurallyRejected++; continue; }
                if (path.slice(start, end + 1).filter((c, i) => c.index !== active[start + i].index).length < 3) continue;
                const key = signature(path);
                if (complete.has(key)) stats.duplicates++; else complete.set(key, { path, start, end });
              }
              beam = [];
            } else {
              const ordered = rank([...next.values()], active.slice(0, p + 1), cycle, values);
              stats.beamPruned += Math.max(0, ordered.length - limits.beamWidth);
              beam = ordered.slice(0, limits.beamWidth);
            }
            if (stats.states >= limits.maxStatesPerCycle) { stats.guard = 'MULTI_MAX_STATES'; break; }
            if (targetStates >= limits.maxStatesPerTarget) break;
          }
        }
      }
      if (targetStates >= limits.maxStatesPerTarget) stats.targetBudgetHits++;
      const ordered = rank([...complete.values()].map(r => r.path), active, cycle, values);
      stats.rankingPruned += Math.max(0, ordered.length - limits.maxSeedsPerTarget);
      for (const path of ordered.slice(0, limits.maxSeedsPerTarget)) {
        const key = signature(path);
        if (unique.has(key)) { stats.duplicates++; continue; }
        if (rows.length >= limits.maxSeedsPerCycle) { stats.guard = 'MULTI_MAX_SEEDS'; break; }
        unique.add(key);
        const source = complete.get(key)!;
        rows.push({ start: source.start, candidates: path.slice(source.start, source.end + 1), chain: path, f: scoreSequence(path, cycle, values) });
      }
  stats.retained = rows.length;
  return { rows, stats };
}
