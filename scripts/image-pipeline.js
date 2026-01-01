/**
 * Image Pipeline Script
 * Fetches images from Wikimedia Commons, processes them, and uploads to Firebase Storage
 *
 * Usage: node scripts/image-pipeline.js
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
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

// Priority species for Phase 1 (most common beginner fish)
const PRIORITY_SPECIES = [
    'bettaFish',
    'neonTetra',
    'guppy',
    'molly',
    'platy',
    'corydoras',
    'angelfish',
    'cardinalTetra',
    'cherryBarb',
    'zebraDanio'
];

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
    console.log('\nMake sure serviceAccountKey.json is in the scripts folder.');
    process.exit(1);
}

// Create temp directory
if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
}

// Load fish database
function loadFishDatabase() {
    const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
    const content = readFileSync(fishDataPath, 'utf8');

    // Extract the fishDatabase object (handles var or const, with leading whitespace)
    const match = content.match(/(?:var|const|let)\s+fishDatabase\s*=\s*\{[\s\S]*?\n\s*\};/);
    if (!match) {
        throw new Error('Could not parse fish-data.js');
    }

    // Evaluate the object (simple approach for this known structure)
    const fishDbCode = match[0].replace(/(?:var|const|let)\s+fishDatabase\s*=\s*/, 'return ');
    const fishDatabase = new Function(fishDbCode)();

    return { fishDatabase, fullContent: content };
}

// Query Wikimedia Commons API - search for actual image files
async function searchWikimedia(scientificName) {
    // Search for images using the generator approach
    const searchQuery = encodeURIComponent(scientificName);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchQuery}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1200&format=json&origin=*`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const pages = data.query?.pages;
        if (!pages) {
            return [];
        }

        const results = [];
        for (const page of Object.values(pages)) {
            const imageInfo = page.imageinfo?.[0];
            if (imageInfo?.url) {
                // Skip SVG files and very small images
                if (imageInfo.url.endsWith('.svg') || (imageInfo.width && imageInfo.width < 400)) {
                    continue;
                }

                const license = imageInfo.extmetadata?.LicenseShortName?.value || 'Unknown';
                const title = page.title.replace('File:', '');

                results.push({
                    title: title,
                    url: imageInfo.thumburl || imageInfo.url, // Use thumbnail if available (already resized)
                    originalUrl: imageInfo.url,
                    license: license,
                    descriptionUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title)}`
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Wikimedia API error:', error.message);
        return [];
    }
}

// Download image
async function downloadImage(url, filename) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const filepath = join(TEMP_DIR, filename);
    writeFileSync(filepath, buffer);
    return filepath;
}

// Process and upload image (simple resize using canvas-like approach)
// For now, we'll upload the original and rely on Firebase/browser to handle sizing
async function processAndUpload(localPath, fishKey) {
    const destination = `${IMAGE_FOLDER}/${fishKey}.jpg`;

    await bucket.upload(localPath, {
        destination: destination,
        metadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000'
        }
    });

    // Get public URL
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future expiry
    });

    // Convert to public URL format
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destination)}?alt=media`;

    return publicUrl;
}

// Update fish-data.js with new imageUrl
function updateFishData(fishKey, imageUrl, fullContent) {
    // Find the entry and add/update imageUrl
    const entryRegex = new RegExp(`(${fishKey}:\\s*\\{[^}]*?)(commonName:)`, 's');

    if (fullContent.includes(`${fishKey}:`)) {
        // Check if imageUrl already exists
        const hasImageUrl = new RegExp(`${fishKey}:\\s*\\{[^}]*imageUrl:`).test(fullContent);

        if (hasImageUrl) {
            // Update existing imageUrl
            const updateRegex = new RegExp(`(${fishKey}:\\s*\\{[^}]*imageUrl:\\s*)(?:null|"[^"]*")`, 's');
            return fullContent.replace(updateRegex, `$1"${imageUrl}"`);
        } else {
            // Add imageUrl after the opening brace
            return fullContent.replace(entryRegex, `$1imageUrl: "${imageUrl}",\n        $2`);
        }
    }

    return fullContent;
}

// Interactive CLI
function createPrompt() {
    return createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function askUser(rl, question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

// Main pipeline
async function runPipeline() {
    console.log('='.repeat(60));
    console.log('  COMPARIUM IMAGE PIPELINE');
    console.log('='.repeat(60));
    console.log('\nThis script will help you add images for fish species.');
    console.log('For each species, it will show you the top Wikimedia result.');
    console.log('You can approve (y), skip (n), or quit (q).\n');

    const rl = createPrompt();
    const { fishDatabase, fullContent } = loadFishDatabase();
    let updatedContent = fullContent;
    let processedCount = 0;
    let addedCount = 0;

    // Process priority species first
    const speciesToProcess = PRIORITY_SPECIES.filter(key => {
        const fish = fishDatabase[key];
        return fish && !fish.imageUrl;
    });

    console.log(`Found ${speciesToProcess.length} species without images.\n`);

    for (const fishKey of speciesToProcess) {
        const fish = fishDatabase[fishKey];
        console.log('-'.repeat(50));
        console.log(`\n[${processedCount + 1}/${speciesToProcess.length}] ${fish.commonName}`);
        console.log(`Scientific name: ${fish.scientificName}`);

        // Search Wikimedia
        console.log('Searching Wikimedia Commons...');
        const results = await searchWikimedia(fish.scientificName);

        if (results.length === 0) {
            console.log('No images found on Wikimedia Commons. Skipping.\n');
            processedCount++;
            continue;
        }

        // Show top result
        const topResult = results[0];
        console.log(`\nTop result: ${topResult.title}`);
        console.log(`License: ${topResult.license}`);
        console.log(`Image URL: ${topResult.url}`);
        console.log(`\n^ Copy and paste that URL into your browser to preview the image`);

        const answer = await askUser(rl, '\nUse this image? (y/n/q): ');

        if (answer === 'q') {
            console.log('\nQuitting...');
            break;
        }

        if (answer === 'y') {
            console.log('Downloading and uploading...');

            try {
                // Download
                const tempFilename = `${fishKey}.jpg`;
                const localPath = await downloadImage(topResult.url, tempFilename);

                // Upload to Firebase Storage
                const publicUrl = await processAndUpload(localPath, fishKey);

                // Update fish-data.js content
                updatedContent = updateFishData(fishKey, publicUrl, updatedContent);

                console.log(`Uploaded: ${fishKey}`);
                addedCount++;
            } catch (error) {
                console.error(`Error processing ${fishKey}:`, error.message);
            }
        } else {
            console.log('Skipped.');
        }

        processedCount++;
    }

    rl.close();

    // Save updated fish-data.js
    if (addedCount > 0) {
        const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
        writeFileSync(fishDataPath, updatedContent);
        console.log(`\nUpdated fish-data.js with ${addedCount} new images.`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`  COMPLETE: ${addedCount} images added`);
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Test locally: http-server, then check species pages');
    console.log('2. Run: npm run migrate:glossary (to sync with Firestore)');
    console.log('3. Commit and push changes');
}

runPipeline().catch(console.error);
