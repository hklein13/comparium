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
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('\n❌ ERROR: Could not load service account key\n');
  console.error('SETUP INSTRUCTIONS:');
  console.error('1. Go to: https://console.firebase.google.com/project/comparium-21b69/settings/serviceaccounts/adminsdk');
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

// Load generator functions
function loadGeneratorFunctions() {
  const generatorPath = join(__dirname, '../js/glossary-generator.js');

  // Use require to load CommonJS module (via createRequire)
  const loaded = require(generatorPath);

  // Debug: Check what was loaded
  console.log('DEBUG: Loaded module keys:', Object.keys(loaded));
  console.log('DEBUG: generateGlossaryEntries type:', typeof loaded.generateGlossaryEntries);

  return loaded;
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

    console.log('📖 Loading glossary generator...');
    const generator = loadGeneratorFunctions();
    console.log('✅ Generator functions loaded\n');

    console.log('📖 Loading other glossary data (diseases, equipment, terminology)...');
    const { diseases, equipment, terminology } = loadOtherGlossaryData();
    console.log(`✅ Loaded ${diseases.length} diseases, ${equipment.length} equipment, ${terminology.length} terminology\n`);

    console.log('🔄 Generating species entries dynamically...');
    const speciesEntries = generator.generateGlossaryEntries(fishDatabase, fishDescriptions);
    console.log(`✅ Generated ${speciesEntries.length} species entries\n`);

    // Combine all entries
    const allEntries = [
      ...speciesEntries,
      ...diseases,
      ...equipment,
      ...terminology
    ];

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
            updated: admin.firestore.FieldValue.serverTimestamp()
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
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
