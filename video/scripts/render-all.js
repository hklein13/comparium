/**
 * Batch Render Script for Species Spotlight Videos
 *
 * Renders videos ONLY for species with curated facts in video-facts.js.
 * Output: video/output/{speciesKey}.mp4
 *
 * Usage:
 *   npm run render:all              # Render all species with video facts
 *   npm run render:all -- --limit 5 # Render first 5 only
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getVideoSpeciesKeys } from "../src/video-facts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const limitIndex = args.indexOf("--limit");
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;

// Import fish data from main codebase
async function loadFishData() {
  const fishDataPath = path.join(__dirname, "../../js/fish-data.js");
  const content = fs.readFileSync(fishDataPath, "utf8");

  // Extract the fishDatabase object from the file
  // The file uses `var fishDatabase = { ... }`
  const match = content.match(/var\s+fishDatabase\s*=\s*(\{[\s\S]*?\});?\s*$/m);
  if (!match) {
    throw new Error("Could not parse fishDatabase from fish-data.js");
  }

  // Use Function constructor to safely evaluate the object
  // eslint-disable-next-line no-new-func
  const fishDatabase = new Function(`return ${match[1]}`)();
  return fishDatabase;
}

async function main() {
  console.log("Loading fish data...");
  const fishDatabase = await loadFishData();

  // Only render species that have curated video facts
  const videoSpeciesKeys = getVideoSpeciesKeys();
  const availableKeys = videoSpeciesKeys.filter((key) => fishDatabase[key]);

  console.log(`Found ${availableKeys.length} species with video facts`);

  const toRender = limit ? availableKeys.slice(0, limit) : availableKeys;
  console.log(`Rendering ${toRender.length} videos...`);

  // Create output directory
  const outputDir = path.join(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Bundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, "../src/index.js"),
    webpackOverride: (config) => config,
  });

  let completed = 0;
  let failed = 0;

  for (const key of toRender) {
    const species = { ...fishDatabase[key], key };  // Include key for video-facts lookup
    const outputPath = path.join(outputDir, `${key}.mp4`);

    // Skip if already rendered
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${key} (already exists)`);
      completed++;
      continue;
    }

    console.log(`\nRendering ${key} (${completed + failed + 1}/${toRender.length})...`);
    console.log(`  ${species.commonName}`);

    try {
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "SpeciesSpotlight",
        inputProps: { species },
      });

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: { species },
      });

      console.log(`  Saved: ${outputPath}`);
      completed++;
    } catch (error) {
      console.error(`  Failed: ${error.message}`);
      failed++;
    }
  }

  console.log("\n========================================");
  console.log(`Rendering complete!`);
  console.log(`  Completed: ${completed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Output: ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
