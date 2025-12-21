#!/usr/bin/env node
/**
 * Fish Database Migration Script
 *
 * PURPOSE:
 * Migrates existing fish species data from js/fish-data.js to Firestore
 *
 * WHAT IT DOES:
 * 1. Reads hardcoded fish data (99 species)
 * 2. Creates Firestore documents for each species
 * 3. Preserves all existing data
 * 4. Adds new fields with intelligent defaults
 *
 * RUN ONCE:
 * npm run migrate:fish
 *
 * SAFE TO RE-RUN:
 * Will overwrite existing documents (useful for updates)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Import fish database (need to read file since it's not a module)
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase configuration
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
  // This is a bit hacky but works for our use case
  const match = content.match(/const fishDatabase = ({[\s\S]*?});/);
  if (!match) {
    throw new Error('Could not find fishDatabase in fish-data.js');
  }

  // Use eval to parse the object (safe since it's our own code)
  const fishDatabase = eval(`(${match[1]})`);
  return fishDatabase;
}

// Helper functions to infer data from existing fields

function inferDifficulty(fishData) {
  // Heuristic based on water parameter flexibility
  const phRange = fishData.phMax - fishData.phMin;
  const tempRange = fishData.tempMax - fishData.tempMin;

  // Wide tolerance = easier fish
  if (phRange >= 2 && tempRange >= 15) return "beginner";

  // Aggressive fish are typically harder
  if (fishData.aggression && fishData.aggression.toLowerCase().includes("aggressive")) {
    return "intermediate";
  }

  // Narrow parameters = more challenging
  if (phRange < 1 || tempRange < 8) return "advanced";

  return "beginner";
}

function inferAdultSize(fishData) {
  const name = fishData.commonName.toLowerCase();

  // Size keywords
  if (name.includes("dwarf") || name.includes("pygmy") || name.includes("micro")) return 1.0;
  if (name.includes("giant") || name.includes("large") || name.includes("pleco")) return 8.0;

  // Based on minimum tank size (rough estimate)
  if (fishData.tankSizeMin <= 5) return 1.5;
  if (fishData.tankSizeMin <= 10) return 2.0;
  if (fishData.tankSizeMin <= 20) return 3.0;
  if (fishData.tankSizeMin <= 40) return 5.0;

  return 6.0;
}

function inferSchoolSize(fishData) {
  const name = fishData.commonName.toLowerCase();

  // Known schooling fish
  const schoolingTypes = {
    "tetra": 6,
    "rasbora": 6,
    "danio": 6,
    "barb": 5,
    "cory": 4,
    "loach": 3,
    "guppy": 3,
    "molly": 3,
    "platy": 3
  };

  for (const [type, minSize] of Object.entries(schoolingTypes)) {
    if (name.includes(type)) return minSize;
  }

  return undefined; // Not a schooling fish
}

function shouldSchool(commonName) {
  const name = commonName.toLowerCase();
  const schoolingTypes = ["tetra", "rasbora", "danio", "barb", "cory", "loach", "guppy", "molly", "platy", "rainbowfish"];
  return schoolingTypes.some(type => name.includes(type));
}

function inferZone(commonName) {
  const name = commonName.toLowerCase();

  // Bottom dwellers
  if (name.includes("cory") || name.includes("pleco") || name.includes("loach") ||
      name.includes("catfish") || name.includes("snail") || name.includes("shrimp")) {
    return "bottom";
  }

  // Surface feeders
  if (name.includes("hatchet") || name.includes("betta")) {
    return "top";
  }

  // Default to middle
  return "middle";
}

function inferTerritoriality(fishData) {
  const aggression = (fishData.aggression || "").toLowerCase();
  return aggression.includes("aggressive") || aggression.includes("territorial");
}

function inferActivityLevel(fishData) {
  const name = fishData.commonName.toLowerCase();

  // High activity fish
  if (name.includes("danio") || name.includes("barb") || name.includes("rainbow")) {
    return "high";
  }

  // Low activity fish
  if (name.includes("pleco") || name.includes("snail") || name.includes("shrimp") ||
      name.includes("cory")) {
    return "low";
  }

  return "moderate";
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
        // Create Firestore document with enhanced data
        const speciesDoc = {
          // ========== EXISTING DATA (preserved exactly) ==========
          commonName: fishData.commonName,
          scientificName: fishData.scientificName,
          tempMin: fishData.tempMin,
          tempMax: fishData.tempMax,
          tempUnit: fishData.tempUnit,
          phMin: fishData.phMin,
          phMax: fishData.phMax,
          waterHardness: fishData.waterHardness,
          tankSizeMin: fishData.tankSizeMin,
          tankSizeUnit: fishData.tankSizeUnit,
          maxSize: fishData.maxSize,
          sizeUnit: fishData.sizeUnit,
          aggression: fishData.aggression,
          diet: fishData.diet,
          schooling: fishData.schooling,
          lifespan: fishData.lifespan,
          careLevel: fishData.careLevel,

          // ========== NEW FIELDS (intelligent defaults) ==========
          careSheet: {
            difficulty: inferDifficulty(fishData),
            adultSize: inferAdultSize(fishData),
            minimumSchoolSize: inferSchoolSize(fishData),
            bioloadFactor: 1.0 // Default - will refine later
          },

          behavior: {
            temperament: fishData.aggression || "peaceful",
            schooling: shouldSchool(fishData.commonName),
            territorial: inferTerritoriality(fishData),
            activeLevel: inferActivityLevel(fishData),
            preferredZone: inferZone(fishData.commonName)
          },

          tankSetup: {
            plants: "recommended",
            hidingSpots: "recommended",
            openSwimming: "recommended",
            substrate: undefined, // To be added manually
            lighting: "moderate"
          },

          // Metadata for tracking
          metadata: {
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            dataVersion: 1,
            source: "migration-script",
            needsReview: true // Flag for manual review/enhancement
          }
        };

        // Write to Firestore using same key as fishDatabase
        await setDoc(doc(speciesCollection, key), speciesDoc);

        console.log(`  ✅ ${key.padEnd(25)} → ${fishData.commonName}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ ${key.padEnd(25)} → ERROR`);
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
    console.log('   1. Verify data in Firebase Console → Firestore');
    console.log('   2. Review species marked needsReview: true');
    console.log('   3. Manually add detailed care sheets for top species');
    console.log('   4. Update Firestore rules to allow public read access');
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
