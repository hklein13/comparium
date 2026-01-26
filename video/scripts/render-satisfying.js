/**
 * Batch render satisfying aquarium videos with different palettes
 *
 * Usage:
 *   npm run render:satisfying:batch           # Render all palettes
 *   npm run render:satisfying:batch -- --palette deepOcean  # Render specific palette
 *   npm run render:satisfying:batch -- --square  # Render square format
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Available palettes from colors.js
const PALETTES = [
  "deepOcean",
  "tropical",
  "plantedTank",
  "golden",
  "midnight",
  "coral",
];

// Parse command line arguments
const args = process.argv.slice(2);
const specificPalette = args.find((a) => !a.startsWith("--"));
const isSquare = args.includes("--square");

async function renderSatisfying() {
  console.log("Bundling Remotion project...");

  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, "../src/index.js"),
    webpackOverride: (config) => config,
  });

  // Ensure output directory exists
  const outputDir = path.resolve(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const compositionId = isSquare ? "SatisfyingAquariumSquare" : "SatisfyingAquarium";
  const suffix = isSquare ? "-square" : "";

  // Determine which palettes to render
  const palettesToRender = specificPalette ? [specificPalette] : PALETTES;

  console.log(`\nRendering ${palettesToRender.length} variation(s)...`);
  console.log(`Composition: ${compositionId}`);
  console.log(`Palettes: ${palettesToRender.join(", ")}\n`);

  for (const palette of palettesToRender) {
    if (!PALETTES.includes(palette)) {
      console.error(`Unknown palette: ${palette}`);
      console.log(`Available palettes: ${PALETTES.join(", ")}`);
      continue;
    }

    const outputPath = path.resolve(
      outputDir,
      `satisfying-${palette}${suffix}.mp4`
    );

    console.log(`Rendering ${palette}...`);
    const startTime = Date.now();

    try {
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {
          palette,
          bubbleCount: isSquare ? 25 : 35,
          bubbleSpeed: 1,
          lightRayCount: isSquare ? 4 : 5,
          lightIntensity: 0.8,
        },
      });

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
          palette,
          bubbleCount: isSquare ? 25 : 35,
          bubbleSpeed: 1,
          lightRayCount: isSquare ? 4 : 5,
          lightIntensity: 0.8,
        },
        onProgress: ({ progress }) => {
          const pct = Math.round(progress * 100);
          process.stdout.write(`\r  Progress: ${pct}%`);
        },
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n  Complete: ${outputPath} (${elapsed}s)\n`);
    } catch (error) {
      console.error(`\n  Error rendering ${palette}:`, error.message);
    }
  }

  console.log("Batch rendering complete!");
  console.log(`Output directory: ${outputDir}`);
}

renderSatisfying().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
