#!/usr/bin/env node
/**
 * Glossary Migration Script
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
 * RUN:
 * npm run migrate:glossary
 *
 * SAFE TO RE-RUN:
 * Will overwrite existing documents
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase configuration (from firebase-init.js)
const firebaseConfig = {
  apiKey: "AIzaSyDExicgmY78u4NAWVJngqaZkhKdmAbebjM",
  authDomain: "comparium-21b69.firebaseapp.com",
  projectId: "comparium-21b69",
  storageBucket: "comparium-21b69.firebasestorage.app",
  messagingSenderId: "925744346774",
  appId: "1:925744346774:web:77453c0374054d5b0d74b7",
  measurementId: "G-WSR0CCKYEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

    const glossaryCollection = collection(db, 'glossary');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🚀 Starting migration to Firestore...\n');

    // Iterate through each category
    for (const [category, entries] of Object.entries(glossaryData)) {
      console.log(`\n📁 Category: ${category.toUpperCase()}`);
      console.log('─'.repeat(50));

      for (const entry of entries) {
        try {
          // Migrate entry exactly as-is
          await setDoc(doc(glossaryCollection, entry.id), entry);

          console.log(`  ✅ ${entry.id.padEnd(25)} → ${entry.title}`);
          successCount++;

        } catch (error) {
          console.error(`  ❌ ${entry.id.padEnd(25)} → ERROR: ${error.message}`);
          errorCount++;
          errors.push({ id: entry.id, error: error.message });
        }
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
    console.log('   2. Update Firestore rules to allow public read access');
    console.log('   3. Update glossary.js to set useFirestore = true');
    console.log('\n✨ Migration script complete!\n');

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
