const V2_SENSOR_FIELDS = ["ax", "ay", "az", "gx", "gy", "gz"];
const UINT32_MAX = 0xffffffff;

function validateCalibrationDataset(dataset) {
  if (!dataset || !dataset.exercise || !Array.isArray(dataset.samples)) {
    return "Invalid CalibrationDataset payload.";
  }

  if (dataset.schemaVersion === undefined) {
    return null;
  }

  if (dataset.schemaVersion !== 2) {
    return "Unsupported CalibrationDataset schemaVersion.";
  }

  for (let index = 0; index < dataset.samples.length; index += 1) {
    const sample = dataset.samples[index];

    if (!sample || typeof sample !== "object") {
      return `Invalid V2 sample at index ${index}.`;
    }

    for (const field of V2_SENSOR_FIELDS) {
      const value = sample[field];

      if (
        !Number.isFinite(value) ||
        !Number.isInteger(value) ||
        value < -32768 ||
        value > 32767
      ) {
        return `Invalid V2 sample field ${field} at index ${index}.`;
      }
    }

    for (const field of ["sampleIndex", "timestampMs"]) {
      const value = sample[field];

      if (
        !Number.isFinite(value) ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > UINT32_MAX
      ) {
        return `Invalid V2 sample field ${field} at index ${index}.`;
      }
    }
  }

  return null;
}

module.exports = { validateCalibrationDataset };
