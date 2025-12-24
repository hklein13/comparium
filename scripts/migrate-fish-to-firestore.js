#!/usr/bin/env node
/**
 * Fish Database Migration Script
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
 * RUN:
 * npm run migrate:fish
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

// Read and parse fish-data.js
function loadFishDatabase() {
  const fishDataPath = join(__dirname, '../js/fish-data.js');
  const content = readFileSync(fishDataPath, 'utf-8');

  // Extract the fishDatabase object
  const match = content.match(/const fishDatabase = ({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find fishDatabase in fish-data.js');
  }

  // Parse the object (safe since it's our own code)
  const fishDatabase = eval(`(${match[1]})`);
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

    const speciesCollection = collection(db, 'species');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log('🚀 Starting migration to Firestore...\n');

    for (const [key, fishData] of Object.entries(fishDatabase)) {
      try {
        // Migrate data exactly as-is from fish-data.js
        await setDoc(doc(speciesCollection, key), fishData);

        console.log(`  ✅ ${key.padEnd(25)} → ${fishData.commonName}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ ${key.padEnd(25)} → ERROR: ${error.message}`);
        errorCount++;
        errors.push({ key, error: error.message });
      }
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
    console.log('   2. Update Firestore rules to allow public read access');
    console.log('   3. Update app.js to fetch species from Firestore');
    console.log('\n✨ Migration script complete!\n');

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
