import { readFileSync } from 'fs';
import path from 'path';
import {
  calculateCalibration,
  type CalibrationDebugEvent,
  type RawCalibrationCandidateDebug,
} from '../../mobile/RepMotion/analytics/calibration';
import { analyzeBottomTopBottomCycles } from './cycleAnalyzer';

const datasets = ['rowing_5reps_005.json', 'rowing_5reps_002.json'];
const root = path.join(process.cwd(), 'datasets', 'calibration', 'rowing');

const REFERENCE_PARAMETERS = {
  minDistanceStrategy: 'current' as const,
  selectionStrategy: 'current_filters' as const,
  rawDetectionStrategy: 'local_extrema' as const,
  prominenceWindowSize: 8,
  minimumProminenceRatio: 0.08,
  minimumDistanceSamples: 70,
  peakWindowSize: 8,
  smoothingWindowSize: 2,
};

const CYCLE_ANALYZER_PARAMETERS = {
  minRepDuration: 45,
  minConcentricDuration: 8,
  minEccentricDuration: 8,
};

const formatChain = (
  bottoms: Array<{ index: number }>,
  tops: Array<{ index: number }>,
) => {
  const events = [
    ...bottoms.map((event) => ({ type: 'BOTTOM' as const, index: event.index })),
    ...tops.map((event) => ({ type: 'TOP' as const, index: event.index })),
  ].sort((left, right) => left.index - right.index);

  return events.map((event) => `${event.type[0]}(${event.index})`).join(' -> ');
};

const uniqueCandidates = (
  candidates: Array<{ type: 'BOTTOM' | 'TOP'; index: number }>,
) => {
  const seen = new Set<string>();
  const unique: Array<{ type: 'BOTTOM' | 'TOP'; index: number }> = [];

  for (const candidate of candidates) {
    const key = `${candidate.type}:${candidate.index}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(candidate);
  }

  return unique;
};

const getUniqueStageCounts = (
  stageBottoms: Array<{ type: 'BOTTOM' | 'TOP'; index: number }>,
  stageTops: Array<{ type: 'BOTTOM' | 'TOP'; index: number }>,
) => {
  const uniqueBottoms = uniqueCandidates(stageBottoms);
  const uniqueTops = uniqueCandidates(stageTops);

  return {
    bottoms: uniqueBottoms.length,
    tops: uniqueTops.length,
    total: uniqueBottoms.length + uniqueTops.length,
  };
};

const toStageCandidates = (
  events: RawCalibrationCandidateDebug[] | CalibrationDebugEvent[],
  type: 'BOTTOM' | 'TOP',
) => {
  return events
    .filter((event) => event.type === type)
    .map((event) => ({ type, index: event.index }));
};

for (const file of datasets) {
  const raw = readFileSync(path.join(root, file), 'utf8');
  const dataset = JSON.parse(raw) as { samples: Array<{ ax: number; ay: number; az: number }> };

  const current = calculateCalibration(dataset.samples, undefined, REFERENCE_PARAMETERS, 5);
  const global = calculateCalibration(dataset.samples, undefined, {
    ...REFERENCE_PARAMETERS,
    selectionStrategy: 'global_alternating_path',
  }, 5);

  const currentAnalysis = analyzeBottomTopBottomCycles(
    current.debug?.selectedBottomIndexes ?? [],
    current.debug?.selectedTopIndexes ?? [],
    5,
    CYCLE_ANALYZER_PARAMETERS,
  );
  const globalAnalysis = analyzeBottomTopBottomCycles(
    global.debug?.selectedBottomIndexes ?? [],
    global.debug?.selectedTopIndexes ?? [],
    5,
    CYCLE_ANALYZER_PARAMETERS,
  );

  const rawCandidates = (current.debug?.rawCandidateDebugEvents ?? []).map((event) => ({
    type: event.type,
    index: event.index,
  }));

  const rawBottomCandidates = uniqueCandidates(rawCandidates.filter((candidate) => candidate.type === 'BOTTOM'));
  const rawTopCandidates = uniqueCandidates(rawCandidates.filter((candidate) => candidate.type === 'TOP'));

  const filterEvents = current.debug?.filterDebugEvents ?? [];
  const afterProminenceBottoms = uniqueCandidates(
    toStageCandidates(filterEvents.filter((event) => event.filter === 'PROMINENCE' && event.kept), 'BOTTOM'),
  );
  const afterProminenceTops = uniqueCandidates(
    toStageCandidates(filterEvents.filter((event) => event.filter === 'PROMINENCE' && event.kept), 'TOP'),
  );

  const afterDirectionChangeBottoms = uniqueCandidates(
    toStageCandidates(filterEvents.filter((event) => event.filter === 'DIRECTION_CHANGE' && event.kept), 'BOTTOM'),
  );
  const afterDirectionChangeTops = uniqueCandidates(
    toStageCandidates(filterEvents.filter((event) => event.filter === 'DIRECTION_CHANGE' && event.kept), 'TOP'),
  );

  const eligibleCandidates = uniqueCandidates([
    ...afterDirectionChangeBottoms,
    ...afterDirectionChangeTops,
  ]);

  console.log(`DATASET ${file}`);
  console.log(`- calibrationSelectionStrategy (current): ${REFERENCE_PARAMETERS.selectionStrategy}`);
  console.log(`- minDistanceStrategy (current): ${REFERENCE_PARAMETERS.minDistanceStrategy}`);
  console.log(`- calibration parameters: ${JSON.stringify(REFERENCE_PARAMETERS)}`);
  console.log(`- cycle analyzer parameters: ${JSON.stringify(CYCLE_ANALYZER_PARAMETERS)}`);
  console.log(`- baseline current (simulatedReps): ${currentAnalysis.simulatedReps} (from analyzeBottomTopBottomCycles(...).simulatedReps)`);
  console.log(`- rawBottomCandidates uniques: ${rawBottomCandidates.length}`);
  console.log(`- rawTopCandidates uniques: ${rawTopCandidates.length}`);
  console.log(`- afterProminence Bottoms/Tops uniques: ${afterProminenceBottoms.length}/${afterProminenceTops.length}`);
  console.log(`- afterDirectionChange Bottoms/Tops uniques: ${afterDirectionChangeBottoms.length}/${afterDirectionChangeTops.length}`);
  console.log(`- eligibleCandidates finaux uniques: ${eligibleCandidates.length}`);
  console.log(`- global chain: ${formatChain(global.debug?.selectedBottomIndexes?.map((index) => ({ index })) ?? [], global.debug?.selectedTopIndexes?.map((index) => ({ index })) ?? [])}`);
  console.log(`- global simulatedReps: ${globalAnalysis.simulatedReps}`);
  console.log(`- cycle durations: ${globalAnalysis.reconstructedReps.map((rep) => rep.totalDuration).join(', ')}`);
  console.log(`- current chain: ${formatChain(current.debug?.selectedBottomIndexes?.map((index) => ({ index })) ?? [], current.debug?.selectedTopIndexes?.map((index) => ({ index })) ?? [])}`);
  console.log('');
}
