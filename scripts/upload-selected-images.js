/**
 * Upload Selected Images
 * Reads JSON of selected species and uploads their images to Firebase Storage
 *
 * Usage: npm run images:upload
 */

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
        storageBucket: BUCKET_NAME
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

// Download image with proper headers and validation
async function downloadImage(url, filename) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Comparium/1.0 (https://comparium.net; contact@comparium.net) Node.js'
        }
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
}

// Upload image to Firebase Storage
async function uploadImage(localPath, fishKey) {
    const destination = `${IMAGE_FOLDER}/${fishKey}.jpg`;

    await bucket.upload(localPath, {
        destination: destination,
        metadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000'
        }
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

// Read JSON input
async function readJsonInput() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
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

    console.log(`\nUploading ${selectedSpecies.length} images...\n`);

    const updates = [];
    let successCount = 0;

    for (let i = 0; i < selectedSpecies.length; i++) {
        const species = selectedSpecies[i];
        process.stdout.write(`[${i + 1}/${selectedSpecies.length}] ${species.key}... `);

        try {
            // Add delay between requests to be polite to Wikimedia API
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
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
    console.log('\nNext steps:');
    console.log('1. Test locally: http-server -c-1');
    console.log('2. Sync Firestore: npm run migrate:glossary');
    console.log('3. Commit and push: git add . && git commit -m "Add species images" && git push');
}

main().catch(console.error);
