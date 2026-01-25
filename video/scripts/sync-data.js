/**
 * Sync Fish Data Script
 *
 * Copies and transforms fish data from the main Comparium codebase
 * into the video project's ES module format.
 *
 * Usage: npm run sync-data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const sourcePath = path.join(__dirname, "../../js/fish-data.js");
const destPath = path.join(__dirname, "../src/fish-data.js");

function parseSourceFile(content) {
  // Extract the fishDatabase object from the source file
  // The file uses `var fishDatabase = { ... }`
  const match = content.match(/var\s+fishDatabase\s*=\s*(\{[\s\S]*?\});?\s*$/m);
  if (!match) {
    throw new Error("Could not parse fishDatabase from fish-data.js");
  }

  // eslint-disable-next-line no-new-func
  return new Function(`return ${match[1]}`)();
}

function generateOutputFile(fishDatabase) {
  const species = Object.values(fishDatabase);

  return `/**
 * Fish Data for Video Generation
 *
 * This file imports data from the main Comparium fish-data.js
 * and formats it for video generation.
 *
 * To update: Run \`npm run sync-data\` from the video folder
 *
 * Last synced: ${new Date().toISOString()}
 * Species count: ${species.length}
 */

export const fishDatabase = ${JSON.stringify(fishDatabase, null, 2)};

// Helper to get all species as an array
export const getAllSpecies = () => Object.values(fishDatabase);

// Helper to get a species by key
export const getSpecies = (key) => fishDatabase[key];

// Helper to get species with images only (for video rendering)
export const getSpeciesWithImages = () =>
  Object.values(fishDatabase).filter((s) => s.imageUrl);
`;
}

async function main() {
  console.log("Syncing fish data...");
  console.log(`  Source: ${sourcePath}`);
  console.log(`  Dest: ${destPath}`);

  // Read source file
  const sourceContent = fs.readFileSync(sourcePath, "utf8");
  const fishDatabase = parseSourceFile(sourceContent);

  const speciesCount = Object.keys(fishDatabase).length;
  const withImages = Object.values(fishDatabase).filter((s) => s.imageUrl).length;

  console.log(`\nParsed ${speciesCount} species (${withImages} with images)`);

  // Generate and write output file
  const outputContent = generateOutputFile(fishDatabase);
  fs.writeFileSync(destPath, outputContent, "utf8");

  console.log(`\nSynced successfully!`);
  console.log(`  Output: ${destPath}`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
