#!/usr/bin/env node
/**
 * Fish Database Migration Script (Admin SDK Version)
 *
 * PURPOSE:
 * Migrates existing fish species data from js/fish-data.js to Firestore
 *
 * WHAT IT DOES:
 * 1. Reads fish data from js/fish-data.js (99 species)
 * 2. Creates Firestore documents for each species in the 'species' collection
 * 3. Preserves all existing data exactly as-is
 * 4. Uses the fish key (e.g., "neonTetra") as the document ID
 *
 * SETUP (One-time):
 * 1. Download service account key from Firebase Console
 * 2. Save as: scripts/serviceAccountKey.json
 * 3. Add to .gitignore (NEVER commit this file!)
 *
 * RUN:
 * npm run migrate:fish
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
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('\n❌ ERROR: Could not load service account key\n');
  console.error('Make sure you have downloaded serviceAccountKey.json to scripts/ folder');
  console.error('See MIGRATION_GUIDE.md for instructions\n');
  process.exit(1);
}

const db = admin.firestore();

// Read and parse fish-data.js
function loadFishDatabase() {
  const fishDataPath = join(__dirname, '../js/fish-data.js');
  const content = readFileSync(fishDataPath, 'utf-8');

  // Extract the fishDatabase object
  const match = content.match(/(const|let|var) fishDatabase = ({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find fishDatabase in fish-data.js');
  }

  // Parse the object (safe since it's our own code)
  const fishDatabase = eval(`(${match[2]})`);
  return fishDatabase;
}

// Main migration function
async function migrateFishData() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Fish Database Migration to Firestore        ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    console.log('📖 Loading fish data from js/fish-data.js...');
    const fishDatabase = loadFishDatabase();
    const speciesCount = Object.keys(fishDatabase).length;
    console.log(`✅ Loaded ${speciesCount} species\n`);

    const speciesCollection = db.collection('species');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🚀 Starting migration to Firestore...\n');

    // Use batching for better performance
    const batch = db.batch();
    const entries = Object.entries(fishDatabase);

    for (const [key, fishData] of entries) {
      try {
        const docRef = speciesCollection.doc(key);
        batch.set(docRef, fishData);

        console.log(`  ✅ ${key.padEnd(25)} → ${fishData.commonName}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ ${key.padEnd(25)} → ERROR: ${error.message}`);
        errorCount++;
        errors.push({ key, error: error.message });
      }
    }

    // Commit the batch
    if (successCount > 0) {
      console.log('\n💾 Committing batch write to Firestore...');
      await batch.commit();
      console.log('✅ Batch committed successfully');
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║            Migration Complete!                 ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Successfully migrated: ${successCount} species`);
    console.log(`❌ Errors:               ${errorCount} species`);

    if (errorCount > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(({ key, error }) => {
        console.log(`   - ${key}: ${error}`);
      });
    }

    console.log('\n📋 Next Steps:');
    console.log('   1. Verify data in Firebase Console → Firestore → species collection');
    console.log('   2. Test your website - species should load from Firestore');
    console.log('   3. (Optional) Delete serviceAccountKey.json for security');
    console.log('\n✨ Migration complete!\n');

  } catch (error) {
    console.error('\n💥 Migration failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateFishData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
