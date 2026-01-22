#!/usr/bin/env node
/**
 * Glossary Migration Script - Updated for Dynamic Generation
 *
 * PURPOSE:
 * Migrates glossary data from dynamically generated entries to Firestore
 *
 * WHAT IT DOES:
 * 1. Loads fish-data.js (143 species)
 * 2. Loads fish-descriptions.js (63 curated descriptions)
 * 3. Uses glossary-generator.js to create glossary entries dynamically
 * 4. Creates Firestore documents in 'glossary' collection
 * 5. Uses Admin SDK - bypasses all security rules
 *
 * SETUP (One-time):
 * 1. Go to: https://console.firebase.google.com/project/comparium-21b69/settings/serviceaccounts/adminsdk
 * 2. Click "Generate new private key"
 * 3. Save as: scripts/serviceAccountKey.json
 * 4. Add to .gitignore (NEVER commit this file!)
 *
 * RUN:
 * npm run migrate:glossary
 *
 * SAFE TO RE-RUN:
 * Will overwrite existing documents
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('\n❌ ERROR: Could not load service account key\n');
  console.error('SETUP INSTRUCTIONS:');
  console.error(
    '1. Go to: https://console.firebase.google.com/project/comparium-21b69/settings/serviceaccounts/adminsdk'
  );
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the downloaded file as: scripts/serviceAccountKey.json');
  console.error('4. Run this script again\n');
  process.exit(1);
}

const db = admin.firestore();

// Load fish database from fish-data.js
function loadFishDatabase() {
  const fishDataPath = join(__dirname, '../js/fish-data.js');
  const content = readFileSync(fishDataPath, 'utf-8');

  // Extract the fishDatabase object
  const match = content.match(/(?:var|let|const)\s+fishDatabase\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find fishDatabase in fish-data.js');
  }

  // Parse the object
  const fishDatabase = eval(`(${match[1]})`);
  return fishDatabase;
}

// Load fish descriptions from fish-descriptions.js
function loadFishDescriptions() {
  const descriptionsPath = join(__dirname, '../js/fish-descriptions.js');
  const content = readFileSync(descriptionsPath, 'utf-8');

  // Extract the fishDescriptions object
  const match = content.match(/const\s+fishDescriptions\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find fishDescriptions in fish-descriptions.js');
  }

  // Parse the object
  const fishDescriptions = eval(`(${match[1]})`);
  return fishDescriptions;
}

// Load plant database from plant-data.js
function loadPlantDatabase() {
  const plantDataPath = join(__dirname, '../js/plant-data.js');
  const content = readFileSync(plantDataPath, 'utf-8');

  // Extract the plantDatabase object
  const match = content.match(/(?:var|let|const)\s+plantDatabase\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find plantDatabase in plant-data.js');
  }

  // Parse the object
  const plantDatabase = eval(`(${match[1]})`);
  return plantDatabase;
}

// Load plant descriptions from plant-descriptions.js
function loadPlantDescriptions() {
  const descriptionsPath = join(__dirname, '../js/plant-descriptions.js');
  const content = readFileSync(descriptionsPath, 'utf-8');

  // Extract the plantDescriptions object
  const match = content.match(/(?:var|let|const)\s+plantDescriptions\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find plantDescriptions in plant-descriptions.js');
  }

  // Parse the object
  const plantDescriptions = eval(`(${match[1]})`);
  return plantDescriptions;
}

// ============================================================================
// GLOSSARY GENERATOR FUNCTIONS (Inlined for simplicity)
// ============================================================================
// These functions are copied from glossary-generator.js to avoid module loading issues
// This is a one-time migration script, so some duplication is acceptable (KISS principle)

function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function getOriginDisplayName(originKey) {
  const originNames = {
    southAmerica: 'South America',
    africa: 'Africa',
    asia: 'Asia',
    northCentralAmerica: 'N. & C. America',
    australiaOceania: 'Oceania',
  };
  return originNames[originKey] || originKey;
}

function generateFishTags(fish) {
  const tags = [];

  // Care level tags
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    tags.push('Beginner Friendly');
  } else if (fish.careLevel === 'Moderate') {
    tags.push('Intermediate');
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    tags.push('Advanced');
  }

  // Temperament tag
  if (fish.aggression) {
    tags.push(fish.aggression);
  }

  // Schooling tag
  if (fish.schooling && (fish.schooling.includes('School') || fish.schooling.includes('Group'))) {
    tags.push('Schooling Fish');
  }

  // Size tags
  const sizeNum = parseFloat(fish.maxSize);
  if (!isNaN(sizeNum)) {
    if (sizeNum < 2) {
      tags.push('Small');
    } else if (sizeNum <= 5) {
      tags.push('Medium');
    } else {
      tags.push('Large');
    }
  }

  // Diet tag
  if (fish.diet) {
    tags.push(fish.diet);
  }

  return tags;
}

function generateFishDescription(key, fish, descriptions) {
  // Use curated description if available
  if (descriptions && descriptions[key]) {
    return descriptions[key];
  }

  // Generate basic description from attributes
  const tempRange = `${fish.tempMin}-${fish.tempMax}°F`;
  const phRange = `${fish.phMin}-${fish.phMax}`;

  let careDesc = 'moderate care';
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    careDesc = 'easy to care for';
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    careDesc = 'challenging to maintain';
  }

  let tempDesc = 'peaceful community fish';
  if (fish.aggression === 'Semi-aggressive') {
    tempDesc = 'semi-aggressive species requiring careful tankmate selection';
  } else if (fish.aggression === 'Aggressive') {
    tempDesc = 'aggressive species best in species-only tanks';
  }

  const schoolingDesc =
    fish.schooling && (fish.schooling.includes('School') || fish.schooling.includes('Group'))
      ? ` Best kept in groups (${fish.schooling}).`
      : ' Can be kept individually or in compatible groups.';

  return `${tempDesc} reaching ${fish.maxSize} inches, ${careDesc}. Thrives in ${tempRange} water with pH ${phRange} and minimum tank size of ${fish.tankSizeMin} gallons.${schoolingDesc} Lifespan of ${fish.lifespan}.`.replace(
    /\s+/g,
    ' '
  );
}

function generateGlossaryEntry(key, fish, descriptions = {}) {
  // Normalize care level for sorting (beginner, intermediate, advanced)
  let normalizedCareLevel = 'intermediate';
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    normalizedCareLevel = 'beginner';
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    normalizedCareLevel = 'advanced';
  }

  return {
    id: toKebabCase(key),
    fishKey: key, // Original camelCase key for fishDatabase lookups and species.html links
    title: fish.commonName,
    scientificName: fish.scientificName,
    description: generateFishDescription(key, fish, descriptions),
    imageUrl: fish.imageUrl || null,
    origin: fish.origin || null,
    originDisplayName: fish.origin ? getOriginDisplayName(fish.origin) : null,
    careLevel: normalizedCareLevel, // For sorting: beginner, intermediate, advanced
    tags: generateFishTags(fish),
    alternateNames: fish.alternateNames || [], // Alternate common names for this species
    category: 'species',
    author: 'System',
    firestoreId: null,
    userId: null,
    upvotes: 0,
    verified: true,
  };
}

function generateGlossaryEntries(fishDatabase, descriptions = {}) {
  const entries = [];

  for (const [key, fish] of Object.entries(fishDatabase)) {
    entries.push(generateGlossaryEntry(key, fish, descriptions));
  }

  return entries;
}

// ============================================================================
// PLANT GENERATOR FUNCTIONS
// ============================================================================

function generatePlantTags(plant) {
  const tags = [];

  // Difficulty tags
  if (plant.difficulty === 'Easy') {
    tags.push('Beginner Friendly');
  } else if (plant.difficulty === 'Moderate') {
    tags.push('Intermediate');
  } else if (plant.difficulty === 'Difficult') {
    tags.push('Advanced');
  }

  // Light needs tag
  if (plant.lightNeeds) {
    tags.push(plant.lightNeeds + ' Light');
  }

  // Position tag
  if (plant.position) {
    const positionLabels = {
      foreground: 'Foreground',
      midground: 'Midground',
      background: 'Background',
      surface: 'Floating',
    };
    tags.push(positionLabels[plant.position] || plant.position);
  }

  // Planting style tag
  if (plant.plantingStyle) {
    const styleLabels = {
      substrate: 'Plant in Substrate',
      floating: 'Floating',
      attachToWood: 'Attach to Wood',
      attachToRock: 'Attach to Rock',
    };
    if (plant.plantingStyle !== 'floating' || plant.position !== 'surface') {
      tags.push(styleLabels[plant.plantingStyle] || plant.plantingStyle);
    }
  }

  // CO2 requirement
  if (plant.co2Required) {
    tags.push('CO2 Required');
  }

  // Growth rate tag
  if (plant.growthRate) {
    tags.push(plant.growthRate + ' Growth');
  }

  return tags;
}

function generatePlantDescription(key, plant, descriptions) {
  // Use curated description if available
  if (descriptions && descriptions[key]) {
    return descriptions[key];
  }

  // Generate basic description from attributes
  const tempRange = `${plant.tempMin}-${plant.tempMax}°F`;
  const phRange = `${plant.phMin}-${plant.phMax}`;

  let difficultyDesc = 'moderately easy to grow';
  if (plant.difficulty === 'Easy') {
    difficultyDesc = 'easy to grow and beginner-friendly';
  } else if (plant.difficulty === 'Difficult') {
    difficultyDesc = 'challenging to grow and requires attention';
  }

  const co2Desc = plant.co2Required
    ? ' CO2 supplementation recommended.'
    : ' Does not require CO2 supplementation.';

  return `A ${plant.position} plant that is ${difficultyDesc}. Grows to ${plant.maxHeight} ${plant.heightUnit} with ${plant.growthRate.toLowerCase()} growth rate. Thrives in ${tempRange} water with pH ${phRange}. Requires ${plant.lightNeeds.toLowerCase()} lighting.${co2Desc}`.replace(
    /\s+/g,
    ' '
  );
}

function generatePlantEntry(key, plant, descriptions = {}) {
  // Normalize difficulty level for sorting
  let normalizedDifficulty = 'intermediate';
  if (plant.difficulty === 'Easy') {
    normalizedDifficulty = 'beginner';
  } else if (plant.difficulty === 'Difficult') {
    normalizedDifficulty = 'advanced';
  }

  return {
    id: toKebabCase(key),
    plantKey: key, // Original camelCase key for plantDatabase lookups
    title: plant.commonName,
    scientificName: plant.scientificName,
    description: generatePlantDescription(key, plant, descriptions),
    imageUrl: plant.imageUrl || null,
    origin: plant.origin || null,
    originDisplayName: plant.origin ? getOriginDisplayName(plant.origin) : null,
    difficulty: normalizedDifficulty,
    position: plant.position,
    plantingStyle: plant.plantingStyle,
    lightNeeds: plant.lightNeeds,
    co2Required: plant.co2Required,
    growthRate: plant.growthRate,
    tags: generatePlantTags(plant),
    category: 'plants',
    author: 'System',
    firestoreId: null,
    userId: null,
    upvotes: 0,
    verified: true,
  };
}

function generatePlantEntries(plantDatabase, descriptions = {}) {
  const entries = [];

  for (const [key, plant] of Object.entries(plantDatabase)) {
    entries.push(generatePlantEntry(key, plant, descriptions));
  }

  return entries;
}

// Load diseases, equipment, and terminology from glossary.js
function loadOtherGlossaryData() {
  const glossaryPath = join(__dirname, '../js/glossary.js');
  const content = readFileSync(glossaryPath, 'utf-8');

  // Extract diseases array
  const diseasesMatch = content.match(/diseases:\s*\[([\s\S]*?)\],?\s*equipment:/);
  const equipmentMatch = content.match(/equipment:\s*\[([\s\S]*?)\],?\s*terminology:/);
  const terminologyMatch = content.match(/terminology:\s*\[([\s\S]*?)\],?\s*};?\s*}/);

  const diseases = diseasesMatch ? eval(`[${diseasesMatch[1]}]`) : [];
  const equipment = equipmentMatch ? eval(`[${equipmentMatch[1]}]`) : [];
  const terminology = terminologyMatch ? eval(`[${terminologyMatch[1]}]`) : [];

  return { diseases, equipment, terminology };
}

// Cleanup function to remove orphaned Firestore documents
async function cleanupOrphanedDocuments(glossaryCollection, validIds) {
  console.log('🧹 Checking for stale Firestore entries...\n');

  // Get all existing document IDs from Firestore
  const existingDocs = await glossaryCollection.listDocuments();
  const existingIds = existingDocs.map(doc => doc.id);

  // Find orphaned IDs (exist in Firestore but not in source data)
  const orphanedIds = existingIds.filter(id => !validIds.has(id));

  if (orphanedIds.length === 0) {
    console.log('✅ No stale entries found\n');
    return 0;
  }

  console.log(`⚠️  Found ${orphanedIds.length} stale entries to remove:`);
  orphanedIds.forEach(id => console.log(`   - ${id}`));
  console.log('');

  // Delete orphaned documents in batches
  const batchSize = 500;
  for (let i = 0; i < orphanedIds.length; i += batchSize) {
    const batch = db.batch();
    const batchIds = orphanedIds.slice(i, i + batchSize);

    for (const id of batchIds) {
      const docRef = glossaryCollection.doc(id);
      batch.delete(docRef);
    }

    await batch.commit();
    console.log(`🗑️  Deleted batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log(`\n✅ Removed ${orphanedIds.length} stale entries\n`);
  return orphanedIds.length;
}

// Main migration function
async function migrateGlossaryData() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Glossary Migration to Firestore             ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    console.log('📖 Loading fish data...');
    const fishDatabase = loadFishDatabase();
    console.log(`✅ Loaded ${Object.keys(fishDatabase).length} fish species\n`);

    console.log('📖 Loading fish descriptions...');
    const fishDescriptions = loadFishDescriptions();
    console.log(`✅ Loaded ${Object.keys(fishDescriptions).length} curated descriptions\n`);

    console.log('📖 Loading plant data...');
    const plantDatabase = loadPlantDatabase();
    console.log(`✅ Loaded ${Object.keys(plantDatabase).length} plants\n`);

    console.log('📖 Loading plant descriptions...');
    const plantDescriptions = loadPlantDescriptions();
    console.log(`✅ Loaded ${Object.keys(plantDescriptions).length} plant descriptions\n`);

    console.log('📖 Loading other glossary data (diseases, equipment, terminology)...');
    const { diseases, equipment, terminology } = loadOtherGlossaryData();
    console.log(
      `✅ Loaded ${diseases.length} diseases, ${equipment.length} equipment, ${terminology.length} terminology\n`
    );

    console.log('🔄 Generating species entries dynamically...');
    const speciesEntries = generateGlossaryEntries(fishDatabase, fishDescriptions);
    console.log(`✅ Generated ${speciesEntries.length} species entries\n`);

    console.log('🔄 Generating plant entries dynamically...');
    const plantEntries = generatePlantEntries(plantDatabase, plantDescriptions);
    console.log(`✅ Generated ${plantEntries.length} plant entries\n`);

    // Combine all entries
    const allEntries = [
      ...speciesEntries,
      ...plantEntries,
      ...diseases,
      ...equipment,
      ...terminology,
    ];

    console.log(`📊 Total entries to migrate: ${allEntries.length}`);
    console.log(`   - Species: ${speciesEntries.length}`);
    console.log(`   - Plants: ${plantEntries.length}`);
    console.log(`   - Diseases: ${diseases.length}`);
    console.log(`   - Equipment: ${equipment.length}`);
    console.log(`   - Terminology: ${terminology.length}\n`);

    const glossaryCollection = db.collection('glossary');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🚀 Starting migration to Firestore...\n');

    // Migrate in batches of 500 (Firestore limit)
    const batchSize = 500;
    for (let i = 0; i < allEntries.length; i += batchSize) {
      const batch = db.batch();
      const batchEntries = allEntries.slice(i, i + batchSize);

      for (const entry of batchEntries) {
        try {
          const docRef = glossaryCollection.doc(entry.id);

          // Add timestamps for Firestore
          const entryWithTimestamps = {
            ...entry,
            created: admin.firestore.FieldValue.serverTimestamp(),
            updated: admin.firestore.FieldValue.serverTimestamp(),
          };

          batch.set(docRef, entryWithTimestamps);

          console.log(`  ✅ ${entry.id.padEnd(30)} → ${entry.title}`);
          successCount++;
        } catch (error) {
          console.error(`  ❌ ${entry.id.padEnd(30)} → ERROR: ${error.message}`);
          errorCount++;
          errors.push({ id: entry.id, error: error.message });
        }
      }

      // Commit the batch
      if (batchEntries.length > 0) {
        console.log(`\n💾 Committing batch ${Math.floor(i / batchSize) + 1}...`);
        await batch.commit();
        console.log('✅ Batch committed\n');
      }
    }

    // Cleanup orphaned documents
    const validIds = new Set(allEntries.map(entry => entry.id));
    const deletedCount = await cleanupOrphanedDocuments(glossaryCollection, validIds);

    // Summary
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║            Migration Complete!                 ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Successfully migrated: ${successCount} entries`);
    console.log(`🗑️  Stale entries removed: ${deletedCount} entries`);
    console.log(`❌ Errors:               ${errorCount} entries`);

    if (errorCount > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(({ id, error }) => {
        console.log(`   - ${id}: ${error}`);
      });
    }

    console.log('\n📋 Next Steps:');
    console.log('   1. Verify data in Firebase Console → Firestore → glossary collection');
    console.log('   2. Visit your website and check the glossary page');
    console.log('   3. (Optional) Delete serviceAccountKey.json for security');
    console.log('\n✨ Migration complete!\n');
  } catch (error) {
    console.error('\n💥 Migration failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateGlossaryData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
