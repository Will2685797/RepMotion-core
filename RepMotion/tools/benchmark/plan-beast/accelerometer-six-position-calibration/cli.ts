import { resolve } from "node:path";

import {
  analyzeSixPositionCaptures,
  loadV2CaptureFile,
  ORIENTATIONS,
  type Orientation,
} from "./calibrationTool";

const FLAG_BY_ORIENTATION: Record<Orientation, string> = {
  positiveX: "--positive-x",
  negativeX: "--negative-x",
  positiveY: "--positive-y",
  negativeY: "--negative-y",
  positiveZ: "--positive-z",
  negativeZ: "--negative-z",
};

function usage(): string {
  return [
    "Usage:",
    "  tsx cli.ts --positive-x <file> --negative-x <file> --positive-y <file> --negative-y <file> --positive-z <file> --negative-z <file>",
  ].join("\n");
}

function parsePaths(args: readonly string[]): Record<Orientation, string> {
  const paths = {} as Record<Orientation, string>;
  for (const orientation of ORIENTATIONS) {
    const flag = FLAG_BY_ORIENTATION[orientation];
    const flagIndex = args.indexOf(flag);
    if (flagIndex === -1 || !args[flagIndex + 1]) {
      throw new Error(`Missing required argument ${flag}.\n${usage()}`);
    }
    paths[orientation] = resolve(args[flagIndex + 1]);
  }
  return paths;
}

function formatVector(vector: { x: number; y: number; z: number }): string {
  return `(${vector.x.toFixed(6)}, ${vector.y.toFixed(6)}, ${vector.z.toFixed(6)})`;
}

try {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(usage());
  } else {
    const paths = parsePaths(process.argv.slice(2));
    const captures = Object.fromEntries(
      ORIENTATIONS.map((orientation) => [
        orientation,
        loadV2CaptureFile(paths[orientation], orientation),
      ]),
    ) as Record<Orientation, ReturnType<typeof loadV2CaptureFile>>;
    const report = analyzeSixPositionCaptures(captures);

    console.log("Accelerometer calibration (production estimator)");
    console.log(JSON.stringify(report.calibration, null, 2));
    console.log("Observed half-spans (m/s²)");
    console.log(JSON.stringify(report.observedHalfSpansMps2, null, 2));
    console.log("Validation by orientation");
    console.table(
      report.orientations.map((metrics) => ({
        orientation: metrics.orientation,
        samples: metrics.sampleCount,
        meanBefore: formatVector(metrics.meanNormalizedAccelMps2),
        normBefore: metrics.meanNormBeforeCalibrationMps2.toFixed(6),
        meanAfter: formatVector(metrics.meanCalibratedAccelMps2),
        normAfter: metrics.meanNormAfterCalibrationMps2.toFixed(6),
        normError: metrics.normErrorAfterCalibrationMps2.toFixed(6),
        vectorError: formatVector(metrics.vectorErrorMps2),
        vectorDeviationRms:
          metrics.quality.accelVectorDeviationRmsMps2.toFixed(6),
        normStd: metrics.quality.accelNormStdMps2.toFixed(6),
      })),
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
