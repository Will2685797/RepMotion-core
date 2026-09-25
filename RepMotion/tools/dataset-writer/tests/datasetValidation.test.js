const assert = require("node:assert/strict");
const test = require("node:test");

const { validateCalibrationDataset } = require("../datasetValidation");

function makeV2Dataset() {
  return {
    schemaVersion: 2,
    exercise: "rowing",
    samples: [
      {
        ax: 1,
        ay: -2,
        az: 3,
        gx: -4,
        gy: 5,
        gz: -6,
        sampleIndex: 42,
        timestampMs: 2100,
      },
    ],
  };
}

test("accepts a complete V2 calibration dataset", () => {
  assert.equal(validateCalibrationDataset(makeV2Dataset()), null);
});

test("accepts a historical dataset without inventing V2 requirements", () => {
  assert.equal(
    validateCalibrationDataset({
      exercise: "rowing",
      samples: [{ ax: 1, ay: 2, az: 3 }],
    }),
    null,
  );
});

test("rejects an explicitly unsupported schema version", () => {
  const dataset = makeV2Dataset();
  dataset.schemaVersion = 3;

  assert.match(validateCalibrationDataset(dataset), /schemaVersion/);
});

test("rejects a V2 sample with a missing field", () => {
  const dataset = makeV2Dataset();
  delete dataset.samples[0].timestampMs;

  assert.match(validateCalibrationDataset(dataset), /timestampMs/);
});

test("rejects non-finite V2 sensor data", () => {
  const dataset = makeV2Dataset();
  dataset.samples[0].gx = Number.POSITIVE_INFINITY;

  assert.match(validateCalibrationDataset(dataset), /gx/);
});

test("rejects a V2 sampleIndex outside uint32", () => {
  const dataset = makeV2Dataset();
  dataset.samples[0].sampleIndex = 0x100000000;

  assert.match(validateCalibrationDataset(dataset), /sampleIndex/);
});
