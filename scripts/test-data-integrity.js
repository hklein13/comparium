/**
 * Test Script: Data Integrity
 *
 * Validates the structure and content of fish-data.js
 * Run with: node scripts/test-data-integrity.js
 *
 * Checks:
 * - All required fields are present
 * - Data types are correct
 * - Values are within valid ranges
 * - No duplicate keys
 * - Image URLs are properly formatted
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Required fields for each species (based on actual fish-data.js structure)
const REQUIRED_FIELDS = [
  'commonName',
  'scientificName',
  'tempMin',
  'tempMax',
  'phMin',
  'phMax',
  'tankSizeMin',
  'maxSize',
];

// Valid values for enum fields
const VALID_AGGRESSIONS = [
  'Peaceful',
  'Semi-aggressive',
  'Aggressive',
  'peaceful',
  'semi-aggressive',
  'aggressive',
];
const VALID_CARE_LEVELS = [
  'Easy',
  'Moderate',
  'Difficult',
  'Expert',
  'easy',
  'moderate',
  'difficult',
  'expert',
];
const VALID_DIETS = [
  'Omnivore',
  'Herbivore',
  'Carnivore',
  'Insectivore',
  'omnivore',
  'herbivore',
  'carnivore',
  'insectivore',
];

// Test results
let passed = 0;
let failed = 0;
let warnings = 0;

function pass(message) {
  passed++;
  console.log(`  ✓ ${message}`);
}

function fail(message) {
  failed++;
  console.log(`  ✗ ${message}`);
}

function warn(message) {
  warnings++;
  console.log(`  ⚠ ${message}`);
}

function validateSpecies(key, species) {
  const errors = [];
  const warns = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (species[field] === undefined || species[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate string fields
  if (typeof species.commonName !== 'string' || species.commonName.length === 0) {
    errors.push('commonName must be a non-empty string');
  }

  if (typeof species.scientificName !== 'string' || species.scientificName.length === 0) {
    errors.push('scientificName must be a non-empty string');
  }

  // Validate numeric fields
  if (typeof species.maxSize !== 'number' || species.maxSize <= 0) {
    errors.push('maxSize must be a positive number');
  }

  if (typeof species.tankSizeMin !== 'number' || species.tankSizeMin <= 0) {
    errors.push('tankSizeMin must be a positive number');
  }

  // Validate temperature range
  if (typeof species.tempMin !== 'number' || species.tempMin < 32 || species.tempMin > 100) {
    errors.push('tempMin must be between 32-100°F');
  }

  if (typeof species.tempMax !== 'number' || species.tempMax < 32 || species.tempMax > 100) {
    errors.push('tempMax must be between 32-100°F');
  }

  if (species.tempMin > species.tempMax) {
    errors.push('tempMin cannot be greater than tempMax');
  }

  // Validate pH range
  if (typeof species.phMin !== 'number' || species.phMin < 0 || species.phMin > 14) {
    errors.push('phMin must be between 0-14');
  }

  if (typeof species.phMax !== 'number' || species.phMax < 0 || species.phMax > 14) {
    errors.push('phMax must be between 0-14');
  }

  if (species.phMin > species.phMax) {
    errors.push('phMin cannot be greater than phMax');
  }

  // Validate enum fields (optional - aggression field)
  if (species.aggression && !VALID_AGGRESSIONS.includes(species.aggression)) {
    warns.push(`aggression '${species.aggression}' is not standard`);
  }

  if (species.careLevel && !VALID_CARE_LEVELS.includes(species.careLevel)) {
    warns.push(`careLevel '${species.careLevel}' is not standard`);
  }

  if (species.diet && !VALID_DIETS.includes(species.diet)) {
    warns.push(`diet '${species.diet}' is not standard`);
  }

  // Validate imageUrl if present
  if (species.imageUrl) {
    if (typeof species.imageUrl !== 'string') {
      errors.push('imageUrl must be a string');
    } else if (!species.imageUrl.startsWith('https://')) {
      warns.push('imageUrl should use HTTPS');
    }
  } else {
    warns.push('No imageUrl (species will show placeholder)');
  }

  return { errors, warns };
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Fish Data Integrity Tests');
  console.log('='.repeat(60));
  console.log('');

  // Load fish-data.js
  console.log('Loading fish-data.js...');
  const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
  let fishDataContent;

  try {
    fishDataContent = readFileSync(fishDataPath, 'utf8');
  } catch (error) {
    fail(`Could not read fish-data.js: ${error.message}`);
    return;
  }

  // Extract the fishDatabase object using regex (since it's not a module we can import directly)
  // The file uses: var fishDatabase = { ... };
  const fishDataMatch = fishDataContent.match(/var\s+fishDatabase\s*=\s*(\{[\s\S]*?\n\};)/);
  if (!fishDataMatch) {
    fail('Could not parse fishDatabase object from fish-data.js');
    return;
  }

  let fishData;
  try {
    // Use Function constructor to evaluate the object
    fishData = new Function(`return ${fishDataMatch[1]}`)();
  } catch (error) {
    fail(`Could not evaluate fishDatabase: ${error.message}`);
    return;
  }

  pass(`Loaded fish-data.js successfully`);

  // Get all species keys
  const speciesKeys = Object.keys(fishData);
  console.log(`\nFound ${speciesKeys.length} species\n`);

  // Test 1: Check for duplicate common names
  console.log('Test 1: Checking for duplicate common names...');
  const commonNames = new Map();
  for (const [key, species] of Object.entries(fishData)) {
    const name = species.commonName?.toLowerCase();
    if (commonNames.has(name)) {
      warn(`Duplicate common name: "${species.commonName}" (${key} and ${commonNames.get(name)})`);
    } else if (name) {
      commonNames.set(name, key);
    }
  }
  pass(`Checked ${speciesKeys.length} species for duplicates`);

  // Test 2: Check for duplicate scientific names
  console.log('\nTest 2: Checking for duplicate scientific names...');
  const scientificNames = new Map();
  for (const [key, species] of Object.entries(fishData)) {
    const name = species.scientificName?.toLowerCase();
    if (scientificNames.has(name)) {
      warn(
        `Duplicate scientific name: "${species.scientificName}" (${key} and ${scientificNames.get(name)})`
      );
    } else if (name) {
      scientificNames.set(name, key);
    }
  }
  pass(`Checked ${speciesKeys.length} species for duplicate scientific names`);

  // Test 3: Validate each species
  console.log('\nTest 3: Validating species data...');
  let speciesWithErrors = 0;
  let speciesWithWarnings = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [key, species] of Object.entries(fishData)) {
    const { errors, warns } = validateSpecies(key, species);

    if (errors.length > 0) {
      speciesWithErrors++;
      totalErrors += errors.length;
      console.log(`\n  ${key} (${species.commonName || 'unknown'}):`);
      errors.forEach(e => fail(e));
    }

    if (warns.length > 0) {
      speciesWithWarnings++;
      totalWarnings += warns.length;
      if (errors.length === 0) {
        // Only show key if we haven't already for errors
        // console.log(`\n  ${key}:`);
      }
      warns.forEach(w => warn(w));
    }
  }

  if (speciesWithErrors === 0) {
    pass(`All ${speciesKeys.length} species have valid required fields`);
  }

  // Test 4: Check image coverage
  console.log('\nTest 4: Checking image coverage...');
  const withImages = speciesKeys.filter(k => fishData[k].imageUrl).length;
  const withoutImages = speciesKeys.length - withImages;
  const coverage = ((withImages / speciesKeys.length) * 100).toFixed(1);

  console.log(`  ${withImages}/${speciesKeys.length} species have images (${coverage}%)`);
  if (withoutImages > 0) {
    warn(`${withoutImages} species are missing images`);
  } else {
    pass('All species have images');
  }

  // Test 5: Check key format
  console.log('\nTest 5: Checking key format (camelCase)...');
  const invalidKeys = speciesKeys.filter(k => !/^[a-z][a-zA-Z0-9]*$/.test(k));
  if (invalidKeys.length > 0) {
    invalidKeys.forEach(k => warn(`Non-standard key format: ${k}`));
  } else {
    pass('All keys use valid camelCase format');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`  Total species: ${speciesKeys.length}`);
  console.log(`  Species with images: ${withImages}`);
  console.log(`  Tests passed: ${passed}`);
  console.log(`  Tests failed: ${failed}`);
  console.log(`  Warnings: ${warnings}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ Some tests failed. Please fix the errors above.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  All tests passed with warnings.');
    process.exit(0);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

runTests();
