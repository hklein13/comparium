/**
 * Upload Selected Images
 * Reads JSON of selected species and uploads their images to Firebase Storage
 *
 * Usage: npm run images:upload
 */

/* global process, Buffer */

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BUCKET_NAME = 'comparium-21b69.firebasestorage.app';
const IMAGE_FOLDER = 'images/species';
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
const DELAY_BETWEEN_REQUESTS = 2500; // 2.5 seconds between downloads to avoid Wikimedia rate limits
const FAILED_UPLOADS_PATH = join(__dirname, 'failed-uploads.json');

// Download image with proper headers, validation, and retry logic
async function downloadImage(url, filename, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Comparium/1.0 (https://comparium.net; contact@comparium.net) Node.js',
        },
      });

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid response: expected image, got ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Validate it's not an error page (images don't start with <!DOCTYPE)
      if (buffer.toString('utf8', 0, 50).includes('<!DOCTYPE')) {
        throw new Error('Received HTML error page instead of image');
      }

      const filepath = join(TEMP_DIR, filename);
      writeFileSync(filepath, buffer);
      return filepath;
    } catch (error) {
      if (attempt < retries) {
        // Wait longer between retries (1s, 2s, 3s)
        const delay = attempt * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Final attempt failed
      }
    }
  }
}

// Upload image to Firebase Storage
async function uploadImage(localPath, fishKey) {
  const destination = `${IMAGE_FOLDER}/${fishKey}.jpg`;

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

// Update fish-data.js
function updateFishData(updates) {
  const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
  let content = readFileSync(fishDataPath, 'utf8');

  for (const { key, url } of updates) {
    // Find the entry and update imageUrl
    const regex = new RegExp(`(${key}:\\s*\\{[^}]*imageUrl:\\s*)null`, 's');
    if (regex.test(content)) {
      content = content.replace(regex, `$1"${url}"`);
    }
  }

  writeFileSync(fishDataPath, content);
}

// Read JSON input (from file argument or interactive)
async function readJsonInput() {
  // Check for file argument: node script.js path/to/file.json
  const fileArg = process.argv[2];
  if (fileArg) {
    console.log(`Reading from file: ${fileArg}`);
    return readFileSync(fileArg, 'utf8');
  }

  // Fall back to interactive input
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    console.log('Paste the JSON from image-preview.html (then press Enter twice):');
    console.log('');

    let input = '';
    let emptyLineCount = 0;

    rl.on('line', line => {
      if (line === '') {
        emptyLineCount++;
        if (emptyLineCount >= 1 && input.trim()) {
          rl.close();
          resolve(input.trim());
        }
      } else {
        emptyLineCount = 0;
        input += line + '\n';
      }
    });
  });
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('  UPLOAD SELECTED IMAGES');
  console.log('='.repeat(60));
  console.log('');

  // Read JSON input
  const jsonInput = await readJsonInput();

  let selectedSpecies;
  try {
    selectedSpecies = JSON.parse(jsonInput);
  } catch (error) {
    console.error('Invalid JSON. Please copy the exact output from image-preview.html');
    process.exit(1);
  }

  if (!Array.isArray(selectedSpecies) || selectedSpecies.length === 0) {
    console.log('No species selected. Exiting.');
    return;
  }

  console.log(`\nUploading ${selectedSpecies.length} images...`);
  console.log(`Using ${DELAY_BETWEEN_REQUESTS}ms delay between requests to avoid rate limiting.\n`);

  const updates = [];
  const failures = [];
  let successCount = 0;

  for (let i = 0; i < selectedSpecies.length; i++) {
    const species = selectedSpecies[i];
    process.stdout.write(`[${i + 1}/${selectedSpecies.length}] ${species.key}... `);

    try {
      // Add delay between requests to avoid Wikimedia rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }

      // Download image
      const tempFilename = `${species.key}.jpg`;
      const localPath = await downloadImage(species.url, tempFilename);

      // Upload to Firebase
      const publicUrl = await uploadImage(localPath, species.key);

      updates.push({ key: species.key, url: publicUrl });
      successCount++;
      console.log('OK');
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
      failures.push({ key: species.key, url: species.url, error: error.message });
    }
  }

  // Update fish-data.js
  if (updates.length > 0) {
    console.log('\nUpdating fish-data.js...');
    updateFishData(updates);
    console.log('Done!');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  COMPLETE: ${successCount}/${selectedSpecies.length} images uploaded`);
  console.log('='.repeat(60));

  // Report and save failures
  if (failures.length > 0) {
    console.log(`\n⚠️  FAILURES (${failures.length}):`);
    failures.forEach(f => console.log(`   - ${f.key}: ${f.error}`));

    // Save failures to JSON for easy retry
    writeFileSync(FAILED_UPLOADS_PATH, JSON.stringify(failures, null, 2));
    console.log(`\nFailures saved to: scripts/failed-uploads.json`);
    console.log('To retry: Copy the JSON array and run npm run images:upload again.');
  } else {
    console.log('\n✓ All images uploaded successfully!');
  }

  console.log('\nNext steps:');
  console.log('1. Test locally: http-server -c-1');
  console.log('2. Sync Firestore: npm run migrate:glossary');
  console.log('3. Commit and push: git add . && git commit -m "Add species images" && git push');
}

main().catch(console.error);
