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

// ============================================================================
// GLOSSARY GENERATOR FUNCTIONS (Inlined for simplicity)
// ============================================================================
// These functions are copied from glossary-generator.js to avoid module loading issues
// This is a one-time migration script, so some duplication is acceptable (KISS principle)

function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
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
  return {
    id: toKebabCase(key),
    fishKey: key, // Original camelCase key for fishDatabase lookups and species.html links
    title: fish.commonName,
    scientificName: fish.scientificName,
    description: generateFishDescription(key, fish, descriptions),
    imageUrl: fish.imageUrl || null,
    tags: generateFishTags(fish),
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

// Load diseases, equipment, and terminology from glossary.js
function loadOtherGlossaryData() {
  const glossaryPath = join(__dirname, '../js/glossary.js');
  const content = readFileSync(glossaryPath, 'utf-8');

  // Extract diseases array
  const diseasesMatch = content.match(/diseases:\s*\[([\s\S]*?)\],?\s*equipment:/);
  const equipmentMatch = content.match(/equipment:\s*\[([\s\S]*?)\],?\s*terminology:/);
  const terminologyMatch = content.match(/terminology:\s*\[([\s\S]*?)\]\s*};?\s*}/);

  const diseases = diseasesMatch ? eval(`[${diseasesMatch[1]}]`) : [];
  const equipment = equipmentMatch ? eval(`[${equipmentMatch[1]}]`) : [];
  const terminology = terminologyMatch ? eval(`[${terminologyMatch[1]}]`) : [];

  return { diseases, equipment, terminology };
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

    console.log('📖 Loading other glossary data (diseases, equipment, terminology)...');
    const { diseases, equipment, terminology } = loadOtherGlossaryData();
    console.log(
      `✅ Loaded ${diseases.length} diseases, ${equipment.length} equipment, ${terminology.length} terminology\n`
    );

    console.log('🔄 Generating species entries dynamically...');
    const speciesEntries = generateGlossaryEntries(fishDatabase, fishDescriptions);
    console.log(`✅ Generated ${speciesEntries.length} species entries\n`);

    // Combine all entries
    const allEntries = [...speciesEntries, ...diseases, ...equipment, ...terminology];

    console.log(`📊 Total entries to migrate: ${allEntries.length}`);
    console.log(`   - Species: ${speciesEntries.length}`);
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

    // Summary
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║            Migration Complete!                 ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Successfully migrated: ${successCount} entries`);
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
