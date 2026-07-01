import { analyzeBottomTopBottomCycles } from "../calibration-runner/cycleAnalyzer";
import { generateParameterGrid } from "./parameterGrid";

// Lance un premier benchmark simple sur une chaîne Bottom -> Top -> Bottom connue.
function main() {
  const parameterGrid = generateParameterGrid();

  const bottoms = [100, 200, 300, 400, 500, 600];
  const tops = [150, 250, 350, 450, 550];
  const expectedReps = 5;

  const results = parameterGrid.map((parameters) => {
    const analysis = analyzeBottomTopBottomCycles(
      bottoms,
      tops,
      expectedReps,
      parameters,
    );

    return {
      ...parameters,
      simulatedReps: analysis.simulatedReps,
      status: analysis.status,
      chain: analysis.chain,
    };
  });

  console.table(results);
}

main();