#!/usr/bin/env node
/**
 * One-time script to add imageUrl field to all species and glossary entries
 *
 * This script:
 * 1. Reads fish-data.js and glossary.js
 * 2. Adds imageUrl: null to each entry
 * 3. Writes the updated files back
 *
 * SAFE TO RUN: Only adds the field if it doesn't already exist
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// UPDATE FISH-DATA.JS
// ============================================================================

console.log('📝 Updating fish-data.js...\n');

const fishDataPath = join(__dirname, '../js/fish-data.js');
let fishDataContent = readFileSync(fishDataPath, 'utf-8');

// Add imageUrl field after scientificName for each species
// Pattern: scientificName: "...",\n (without imageUrl following)
const updatedFishData = fishDataContent.replace(
  /(scientificName: "[^"]+",)\n(\s+)(?!imageUrl:)/g,
  '$1\n$2imageUrl: null,\n$2'
);

// Count how many additions were made
const additionsCount =
  (updatedFishData.match(/imageUrl: null,/g) || []).length -
  (fishDataContent.match(/imageUrl: null,/g) || []).length;

writeFileSync(fishDataPath, updatedFishData, 'utf-8');
console.log(`✅ Added imageUrl field to ${additionsCount} species in fish-data.js\n`);

// ============================================================================
// UPDATE GLOSSARY.JS
// ============================================================================

console.log('📝 Updating glossary.js...\n');

const glossaryPath = join(__dirname, '../js/glossary.js');
let glossaryContent = readFileSync(glossaryPath, 'utf-8');

// Add imageUrl field after description for each glossary entry
// Pattern: description: '...',\n (without imageUrl following)
const updatedGlossary = glossaryContent.replace(
  /(description: '[^']+',)\n(\s+)(?!imageUrl:)/g,
  '$1\n$2imageUrl: null,\n$2'
);

// Count additions
const glossaryAdditionsCount =
  (updatedGlossary.match(/imageUrl: null,/g) || []).length -
  (glossaryContent.match(/imageUrl: null,/g) || []).length;

writeFileSync(glossaryPath, updatedGlossary, 'utf-8');
console.log(
  `✅ Added imageUrl field to ${glossaryAdditionsCount} glossary entries in glossary.js\n`
);

console.log('╔════════════════════════════════════════════════╗');
console.log('║         Image URL Fields Added!                ║');
console.log('╚════════════════════════════════════════════════╝');
console.log(`\n✅ Total changes:`);
console.log(`   - ${additionsCount} species updated`);
console.log(`   - ${glossaryAdditionsCount} glossary entries updated`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Review the updated files`);
console.log(`   2. Run: npm run migrate:fish`);
console.log(`   3. Run: npm run migrate:glossary`);
console.log(`   4. Delete this script (no longer needed)\n`);
