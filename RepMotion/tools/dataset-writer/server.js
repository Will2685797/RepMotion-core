// Ce serveur local reçoit un CalibrationDataset et l’écrit dans le dossier datasets du repo.
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 4000;

// Autorise l’app mobile à envoyer du JSON vers ce serveur local.
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Nettoie le nom d’exercice pour éviter les noms de dossiers invalides.
function sanitizeFolderName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

// Génère automatiquement le prochain nom de fichier disponible
// sous la forme : overhead_press_5reps_001.json
async function buildDatasetFilename(dataset, outputDir) {
  const exercise = sanitizeFolderName(dataset.exercise || "unknown_exercise");
  const reps = dataset.expectedReps || dataset.performedReps || "unknown";

  // Lire tous les fichiers déjà présents dans le dossier.
  const files = await fs.readdir(outputDir).catch(() => []);

  // Conserver uniquement les fichiers correspondant à cet exercice
  // et à ce nombre de répétitions.
  const prefix = `${exercise}_${reps}reps_`;

  const matchingFiles = files.filter(
    (file) => file.startsWith(prefix) && file.endsWith(".json"),
  );

  // Trouver le plus grand numéro déjà utilisé.
  let highestNumber = 0;

  for (const file of matchingFiles) {
    const match = file.match(/_(\d{3})\.json$/);

    if (!match) continue;

    const number = Number(match[1]);

    if (number > highestNumber) {
      highestNumber = number;
    }
  }

  // Générer le prochain numéro.
  const nextNumber = String(highestNumber + 1).padStart(3, "0");

  return `${prefix}${nextNumber}.json`;
}


// Reçoit le dataset de calibration et l’écrit automatiquement dans /datasets/calibration/<exercise>.
app.post("/datasets/calibration", async (req, res) => {
  try {
    const dataset = req.body;

    if (!dataset || !dataset.exercise || !Array.isArray(dataset.samples)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid CalibrationDataset payload.",
      });
    }

    const exercise = sanitizeFolderName(dataset.exercise);

    // __dirname = RepMotion/tools/dataset-writer
    // ../../datasets = RepMotion/datasets
    const outputDir = path.resolve(
      __dirname,
      "../../datasets/calibration",
      exercise
    );

    // Crée le dossier de l’exercice s’il n’existe pas encore.
    await fs.mkdir(outputDir, { recursive: true });

    // Génère le prochain nom disponible : overhead_press_5reps_001.json
    const filename = await buildDatasetFilename(dataset, outputDir);

    const outputPath = path.join(outputDir, filename);

    // Écrit le JSON formaté pour qu’il soit lisible dans Git.
    await fs.writeFile(outputPath, JSON.stringify(dataset, null, 2), "utf8");

    return res.json({
      ok: true,
      path: outputPath,
      filename,
    });
  } catch (error) {
    console.error("Failed to save calibration dataset:", error);

    return res.status(500).json({
      ok: false,
      error: "Failed to save calibration dataset.",
    });
  }
});

// Démarre le serveur local.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dataset writer running on http://localhost:${PORT}`);
});