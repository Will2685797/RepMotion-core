# Accelerometer six-position calibration

This offline diagnostic reads six RepMotion V2 JSON captures, calls the
production normalization and accelerometer calibration functions, and prints
the calibration and validation metrics. It does not write output files.

## Run

From the repository root:

```powershell
.\tools\calibration-runner\node_modules\.bin\tsx.cmd tools\benchmark\plan-beast\accelerometer-six-position-calibration\cli.ts `
  --positive-x .\captures\accelerometer_6pos_positive_x.json `
  --negative-x .\captures\accelerometer_6pos_negative_x.json `
  --positive-y .\captures\accelerometer_6pos_positive_y.json `
  --negative-y .\captures\accelerometer_6pos_negative_y.json `
  --positive-z .\captures\accelerometer_6pos_positive_z.json `
  --negative-z .\captures\accelerometer_6pos_negative_z.json
```

Each file must use the existing V2 envelope with `schemaVersion: 2`,
`sensorDataUnit: "raw_counts"`, and an array of complete V2 samples.

## Diagnostic capture quality limits

- minimum 60 samples;
- acceleration vector RMS deviation at most 0.20 m/s²;
- acceleration norm standard deviation at most 0.15 m/s².

These are diagnostic rejection limits, not production motion thresholds. The
dispersion limits leave roughly three times the margin observed in the static
windows from the rowing 011-020 audit.

## Physical positions

The repository preserves the MPU register axes as `ax`, `ay`, and `az`, but it
does not document how those axes map to faces of the assembled enclosure.
Determine the faces empirically before capture:

- `positiveX`: stationary face for which `ax` is strongly positive and `ay`,
  `az` are close to their offsets;
- `negativeX`: the opposite face, with `ax` strongly negative;
- repeat the same check for Y and Z.

Do not assign top, bottom, left, or right labels without checking the live
numeric readings on the actual assembly.

For each empirically identified position, place the assembly on a rigid, level,
non-vibrating surface and route any cable so it cannot pull on the enclosure.
Wait three seconds after positioning, then record five static seconds without
touching the assembly. At the nominal 20 Hz rate this gives about 100 samples;
the diagnostic rejects fewer than 60. Save each capture under the matching
filename shown in the command above. Repeat a capture if the tool reports too
much vector dispersion or norm variation.
