import { strict as assert } from "node:assert";
import { writeFileSync, mkdirSync } from "node:fs";
import type { Candidate } from "../../mobile/RepMotion/analytics/delayed-context-path/types";
import type { DelayedContextPathInput, DelayedContextPathResult } from "../../mobile/RepMotion/analytics/delayed-context-path/delayedContextPath";
import { validatePath } from "../../mobile/RepMotion/analytics/delayed-context-path/validation/validatePath";
import { minConcentricDuration, minEccentricDuration, minRepDuration } from "../../mobile/RepMotion/analytics/delayed-context-path/validation/structuralRules";
import { scoreSequence } from "../../mobile/RepMotion/analytics/delayed-context-path/scoring/scoreSequence";
import { normalizeFeatures } from "../../mobile/RepMotion/analytics/delayed-context-path/scoring/normalizeFeatures";
import { calculateConfidence } from "../../mobile/RepMotion/analytics/delayed-context-path/scoring/calculateConfidence";
import { calculateWeights } from "../../mobile/RepMotion/analytics/delayed-context-path/scoring/weights";
import { scoreCandidate } from "../../mobile/RepMotion/analytics/delayed-context-path/promotion/scoreCandidate";
import { criteriaAtCycle, dynamicTopN } from "../../mobile/RepMotion/analytics/delayed-context-path/config";

const same = (a: Candidate, b: Candidate) => a.type === b.type && a.index === b.index;
export function assertOracleInput(input: DelayedContextPathInput, targets: Candidate[]) {
  for (const gt of targets) assert(input.candidatePool.some(c => same(c, gt)), `ORACLE_MISSING ${gt.type}:${gt.index}`);
}
function violations(path: Candidate[]) {
  return path.flatMap((c, i) => {
    const errors: string[] = [];
    if (c.type !== (i % 2 ? "TOP" : "BOTTOM")) errors.push(`position ${i}: alternation`);
    if (i) {
      const duration = c.index - path[i - 1].index;
      if (duration <= 0) errors.push(`position ${i}: non-increasing ${duration}`);
      const minimum = c.type === "TOP" ? minConcentricDuration : minEccentricDuration;
      if (duration < minimum) errors.push(`position ${i}: adjacent ${duration} < ${minimum}`);
      if (c.type === "BOTTOM" && i >= 2 && c.index - path[i - 2].index < minRepDuration)
        errors.push(`position ${i}: rep ${c.index - path[i - 2].index} < ${minRepDuration}`);
    }
    return errors;
  });
}
export function auditInjectedCandidates(id: string, input: DelayedContextPathInput, targets: Candidate[], result: DelayedContextPathResult, offset: number) {
  assertOracleInput(input, targets);
  const traces: unknown[] = [];
  const rows = targets.map((gt, ordinal) => {
    const systemRows = [result.systemA, result.systemC].map((system, si) => {
      const scores: { cycle: number; position: number; score: number; rank: number; topN: boolean }[] = [];
      for (const cycle of system.cycles) {
        const active = cycle.activeBefore, length = cycle.cycle * 2 + 1, criteria = criteriaAtCycle[cycle.cycle];
        for (let position = 0; position < length; position++) {
          if (active[position].type !== gt.type) continue;
          if (same(active[position], gt)) { traces.push({ event: ordinal, system: si, cycle: cycle.cycle, position, status: "ACTIVE" }); continue; }
          const path = [...active]; path[position] = gt;
          if (!validatePath(path.slice(0, length))) {
            const repairs = [position - 1, position + 1].filter(p => p >= 0 && p < length).flatMap(p =>
              input.candidatePool.filter(c => c.type === active[p].type && c.index !== active[p].index).flatMap(c => {
                const repaired = [...path]; repaired[p] = c;
                return validatePath(repaired.slice(0, length)) ? [{ position: p, type: c.type, index: c.index + offset, fullPathValid: validatePath(repaired), fullPathViolations: violations(repaired) }] : [];
              }));
            traces.push({ event: ordinal, system: si, cycle: cycle.cycle, position, status: "INVALID_PREFIX_CONDITIONAL_ROUTE", violations: violations(path.slice(0, length)), repairs });
            continue;
          }
          const cohort = input.candidatePool.filter(c => {
            if (c.type !== active[position].type || c.index === active[position].index) return false;
            const p = [...active]; p[position] = c; return validatePath(p.slice(0, length));
          });
          const features = cohort.map(c => { const p = [...active]; p[position] = c; return scoreSequence(p, cycle.cycle, input.values); });
          const af = scoreSequence(active, cycle.cycle, input.values);
          const norm = normalizeFeatures(af, features, criteria), confidence = calculateConfidence(af, features, criteria), weights = calculateWeights(criteria);
          const ranking = cohort.map((c, i) => scoreCandidate(c, features[i], norm[i], weights, confidence, criteria))
            .sort((a,b) => b.score-a.score || a.candidate.index-b.candidate.index || a.candidate.candidateId.localeCompare(b.candidate.candidateId));
          const rank = ranking.findIndex(r => same(r.candidate, gt));
          const score = { cycle: cycle.cycle, position, score: ranking[rank].score, rank: rank + 1, topN: rank < dynamicTopN };
          scores.push(score); traces.push({ event: ordinal, system: si, ...score, status: "SCORED_RECOMPUTED", fullPathViolations: violations(path) });
        }
      }
      const promisingPositions = [...system.promisingAlternatives].filter(([, bucket]) => [...bucket.values()].some(c => same(c, gt))).map(([p]) => p);
      const conditionalPositions = [...system.conditionalAlternatives].filter(([, bucket]) => [...bucket.values()].some(r => same(r.candidate, gt) || [...r.repairs.values()].some(rp => same(rp.candidate, gt)))).map(([p]) => p);
      return { system: si === 0 ? "A" : "C", scores, promisingPositions, conditionalPositions,
        active: system.cycles.some(c => [...c.activeBefore, ...c.activeAfter].some(p => same(p, gt))),
        inAlternative: system.generatedAudit.some(r => r.candidates.some(c => same(c, gt))),
        inGeneratedChain: system.generatedAudit.some(r => r.chain.some(c => same(c, gt))),
        limit: system.context.limit };
    });
    const segments = result.extractedSegments.segments.filter(s => s.replacements.some(c => same(c, gt)));
    const inD = [...result.composition.uniquePaths.values()].some(r => r.state.path.some(c => same(c, gt)));
    return { event: `${gt.type === "BOTTOM" ? "B" : "T"}${Math.floor(ordinal / 2) + 1}`, type: gt.type,
      originalIndex: gt.index + offset, localIndex: gt.index, candidateId: input.candidatePool.find(c => same(c, gt))!.candidateId,
      value: gt.value, available: true, systems: systemRows,
      A: systemRows[0].inAlternative, C: systemRows[1].inAlternative,
      segments: segments.length, D: inD, final: result.finalPath?.some(c => same(c, gt)) ?? false };
  });
  const report = { dataset: id, offset, poolSize: input.candidatePool.length, bootstrap: input.selectedDpV1Chain,
    finalPool: input.candidatePool, notes: "Scores recomputed after execution with production functions from recorded activeBefore. Not live instrumentation. A/C mean candidate occurs in replacements; inGeneratedChain also records unchanged active occurrences. No disappearance inferred from promising alone.",
    rows, traces, targetChainValid: validatePath(targets), targetChainViolations: violations(targets),
    diagnostics: { A: result.systemA.context, C: result.systemC.context, D: result.composition.context } };
  const dir = new URL("./output/oracle-audit/", import.meta.url); mkdirSync(dir, { recursive: true });
  writeFileSync(new URL(`${id}.json`, dir), JSON.stringify(report, null, 2) + "\n");
  console.table(rows.map(({ event, originalIndex, available, A, C, segments, D, final }) => ({ event, originalIndex, available, A, C, segments, D, final })));
}
