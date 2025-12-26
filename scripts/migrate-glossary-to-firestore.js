#!/usr/bin/env node
/**
 * Glossary Migration Script (Admin SDK Version)
 *
 * PURPOSE:
 * Migrates glossary data from js/glossary.js to Firestore
 *
 * WHAT IT DOES:
 * 1. Reads glossary data from js/glossary.js (4 categories × 3 entries = 12 entries)
 * 2. Creates Firestore documents for each entry in the 'glossary' collection
 * 3. Preserves all existing data exactly as-is
 * 4. Uses the entry ID (e.g., "neon-tetra") as the document ID
 *
 * SETUP (One-time):
 * 1. Download service account key from Firebase Console
 * 2. Save as: scripts/serviceAccountKey.json
 * 3. Add to .gitignore (NEVER commit this file!)
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

// Read and parse glossary.js
function loadGlossaryData() {
  const glossaryPath = join(__dirname, '../js/glossary.js');
  const content = readFileSync(glossaryPath, 'utf-8');

  // Extract the glossaryData from initializeGlossaryData method
  // This is a bit hacky but works for our use case
  const match = content.match(/return\s+({[\s\S]*?});[\s\S]*?}[\s\S]*?\/\*\*[\s\S]*?Load glossary entries from Firestore/);
  if (!match) {
    throw new Error('Could not find glossaryData in glossary.js');
  }

  // Parse the object (safe since it's our own code)
  // Replace new Date().toISOString() with a fixed date for eval
  const objectStr = match[1].replace(/new Date\(\)\.toISOString\(\)/g, '"2025-12-24T00:00:00.000Z"');
  const glossaryData = eval(`(${objectStr})`);
  return glossaryData;
}

// Main migration function
async function migrateGlossaryData() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Glossary Migration to Firestore             ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    console.log('📖 Loading glossary data from js/glossary.js...');
    const glossaryData = loadGlossaryData();

    // Count total entries
    const totalEntries = Object.values(glossaryData).reduce((sum, entries) => sum + entries.length, 0);
    console.log(`✅ Loaded ${totalEntries} entries across ${Object.keys(glossaryData).length} categories\n`);

    const glossaryCollection = db.collection('glossary');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🚀 Starting migration to Firestore...\n');

    // Use batching for better performance
    const batch = db.batch();

    // Iterate through each category
    for (const [category, entries] of Object.entries(glossaryData)) {
      console.log(`\n📁 Category: ${category.toUpperCase()}`);
      console.log('─'.repeat(50));

      for (const entry of entries) {
        try {
          // Add to batch
          const docRef = glossaryCollection.doc(entry.id);
          batch.set(docRef, entry);

          console.log(`  ✅ ${entry.id.padEnd(25)} → ${entry.title}`);
          successCount++;

        } catch (error) {
          console.error(`  ❌ ${entry.id.padEnd(25)} → ERROR: ${error.message}`);
          errorCount++;
          errors.push({ id: entry.id, error: error.message });
        }
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
    console.log('   2. Update Firestore rules to allow public read access');
    console.log('   3. Update glossary.js to set useFirestore = true');
    console.log('   4. (Optional) Delete serviceAccountKey.json for security');
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
