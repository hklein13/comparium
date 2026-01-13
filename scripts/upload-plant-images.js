/**
 * Upload Plant Images
 * Uploads plant images to Firebase Storage and updates plant-data.js
 *
 * Usage: node scripts/upload-plant-images.js scripts/plant-selection.json
 */

/* global process, Buffer */

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BUCKET_NAME = 'comparium-21b69.firebasestorage.app';
const IMAGE_FOLDER = 'images/plants';
const TEMP_DIR = join(__dirname, 'temp-images');

// Initialize Firebase Admin
let bucket;
try {
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: BUCKET_NAME,
  });

  bucket = getStorage().bucket();
  console.log('Firebase initialized successfully\n');
} catch (error) {
  console.error('Failed to initialize Firebase:', error.message);
  process.exit(1);
}

// Create temp directory
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

// Configuration for rate limiting
const DELAY_BETWEEN_REQUESTS = 2500;

// Download image with proper headers and retry logic
async function downloadImage(url, filename, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Comparium/1.0 (https://comparium.net; contact@comparium.net) Node.js',
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid response: expected image, got ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.toString('utf8', 0, 50).includes('<!DOCTYPE')) {
        throw new Error('Received HTML error page instead of image');
      }

      const filepath = join(TEMP_DIR, filename);
      writeFileSync(filepath, buffer);
      return filepath;
    } catch (error) {
      if (attempt < retries) {
        const delay = attempt * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Upload image to Firebase Storage
async function uploadImage(localPath, plantKey) {
  const destination = `${IMAGE_FOLDER}/${plantKey}.jpg`;

  await bucket.upload(localPath, {
    destination: destination,
    metadata: {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    },
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destination)}?alt=media`;
  return publicUrl;
}

// Update plant-data.js
function updatePlantData(updates) {
  const plantDataPath = join(__dirname, '..', 'js', 'plant-data.js');
  let content = readFileSync(plantDataPath, 'utf8');

  for (const { key, url } of updates) {
    const regex = new RegExp(`(${key}:\\s*\\{[^}]*imageUrl:\\s*)null`, 's');
    if (regex.test(content)) {
      content = content.replace(regex, `$1'${url}'`);
    }
  }

  writeFileSync(plantDataPath, content);
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('  UPLOAD PLANT IMAGES');
  console.log('='.repeat(60));
  console.log('');

  // Read JSON from file argument
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/upload-plant-images.js <json-file>');
    console.error('Example: node scripts/upload-plant-images.js scripts/plant-selection.json');
    process.exit(1);
  }

  console.log(`Reading from file: ${fileArg}`);
  const jsonInput = readFileSync(fileArg, 'utf8');

  let selectedPlants;
  try {
    selectedPlants = JSON.parse(jsonInput);
  } catch (error) {
    console.error('Invalid JSON:', error.message);
    process.exit(1);
  }

  if (!Array.isArray(selectedPlants) || selectedPlants.length === 0) {
    console.log('No plants in selection. Exiting.');
    return;
  }

  console.log(`\nUploading ${selectedPlants.length} plant images...`);
  console.log(`Using ${DELAY_BETWEEN_REQUESTS}ms delay between requests.\n`);

  const updates = [];
  const failures = [];
  let successCount = 0;

  for (let i = 0; i < selectedPlants.length; i++) {
    const plant = selectedPlants[i];
    process.stdout.write(`[${i + 1}/${selectedPlants.length}] ${plant.key}... `);

    try {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }

      const tempFilename = `${plant.key}.jpg`;
      const localPath = await downloadImage(plant.url, tempFilename);
      const publicUrl = await uploadImage(localPath, plant.key);

      updates.push({ key: plant.key, url: publicUrl });
      successCount++;
      console.log('OK');
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
      failures.push({ key: plant.key, url: plant.url, error: error.message });
    }
  }

  // Update plant-data.js
  if (updates.length > 0) {
    console.log('\nUpdating plant-data.js...');
    updatePlantData(updates);
    console.log('Done!');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  COMPLETE: ${successCount}/${selectedPlants.length} images uploaded`);
  console.log('='.repeat(60));

  if (failures.length > 0) {
    console.log(`\nFAILURES (${failures.length}):`);
    failures.forEach(f => console.log(`   - ${f.key}: ${f.error}`));
  } else {
    console.log('\nAll plant images uploaded successfully!');
  }

  console.log('\nNext steps:');
  console.log('1. Test locally: http-server -c-1');
  console.log('2. Sync Firestore: npm run migrate:glossary');
  console.log('3. Commit and push');
}

main().catch(console.error);
