/**
 * Generate Image Preview from iNaturalist
 * Searches iNaturalist API for CC-licensed photos of species without images
 *
 * Usage: npm run images:inaturalist
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Acceptable licenses (CC licenses that allow reuse)
const ALLOWED_LICENSES = [
  'cc0',        // Public domain
  'cc-by',      // Attribution
  'cc-by-sa',   // Attribution-ShareAlike
  'cc-by-nc',   // Attribution-NonCommercial (OK for non-profit site)
  'cc-by-nc-sa' // Attribution-NonCommercial-ShareAlike
];

// Load fish database
function loadFishDatabase() {
  const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
  const content = readFileSync(fishDataPath, 'utf8');

  const match = content.match(/(?:var|const|let)\s+fishDatabase\s*=\s*\{[\s\S]*?\n\s*\};/);
  if (!match) {
    throw new Error('Could not parse fish-data.js');
  }

  const fishDbCode = match[0].replace(/(?:var|const|let)\s+fishDatabase\s*=\s*/, 'return ');
  const fishDatabase = new Function(fishDbCode)();

  return fishDatabase;
}

// Query iNaturalist API for taxa
async function searchINaturalist(scientificName, commonName) {
  // Try scientific name first, then common name
  const queries = [scientificName, commonName];

  for (const query of queries) {
    if (!query) continue;

    const searchQuery = encodeURIComponent(query);
    const url = `https://api.inaturalist.org/v1/taxa?q=${searchQuery}&rank=species,genus,subfamily&per_page=5`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Comparium/1.0 (https://comparium.net) Node.js',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`  API error for "${query}": ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        continue;
      }

      // Process results and extract photos with valid licenses
      const photos = [];

      for (const taxon of data.results) {
        // Check default photo
        if (taxon.default_photo) {
          const photo = taxon.default_photo;
          const license = photo.license_code?.toLowerCase() || '';

          if (ALLOWED_LICENSES.includes(license) || license === '') {
            // Get medium-size URL (better quality than square)
            const mediumUrl = photo.medium_url || photo.url?.replace('square', 'medium');
            const originalUrl = photo.original_url || mediumUrl?.replace('medium', 'original');

            if (mediumUrl) {
              photos.push({
                thumbUrl: mediumUrl,
                fullUrl: originalUrl || mediumUrl,
                license: photo.license_code || 'Unknown',
                attribution: photo.attribution || 'iNaturalist',
                taxonName: taxon.name,
                matchedQuery: query,
              });
            }
          }
        }

        // Also check taxon_photos if available (more options)
        if (taxon.taxon_photos) {
          for (const tp of taxon.taxon_photos.slice(0, 3)) {
            const photo = tp.photo;
            if (!photo) continue;

            const license = photo.license_code?.toLowerCase() || '';

            if (ALLOWED_LICENSES.includes(license)) {
              const mediumUrl = photo.medium_url || photo.url?.replace('square', 'medium');
              const originalUrl = photo.original_url || mediumUrl?.replace('medium', 'original');

              if (mediumUrl && !photos.find(p => p.thumbUrl === mediumUrl)) {
                photos.push({
                  thumbUrl: mediumUrl,
                  fullUrl: originalUrl || mediumUrl,
                  license: photo.license_code || 'Unknown',
                  attribution: photo.attribution || 'iNaturalist',
                  taxonName: taxon.name,
                  matchedQuery: query,
                });
              }
            }
          }
        }
      }

      if (photos.length > 0) {
        return photos.slice(0, 3); // Return up to 3 photos
      }

    } catch (error) {
      console.error(`  Error searching for "${query}":`, error.message);
    }
  }

  return [];
}

// Generate HTML preview page
function generateHTML(speciesData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comparium - iNaturalist Image Selection</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a2e;
            color: #eee;
            margin: 0;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4ecca3, #234a3a);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 { margin: 0 0 10px 0; }
        .header p { margin: 0; opacity: 0.9; }
        .instructions {
            background: #2a2a4a;
            border-left: 4px solid #4ecca3;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 20px;
        }
        .instructions h3 { margin: 0 0 10px 0; color: #4ecca3; }
        .instructions ol { margin: 0; padding-left: 20px; }
        .instructions li { margin-bottom: 5px; }
        .instructions code { background: #16213e; padding: 2px 6px; border-radius: 3px; }
        .controls {
            background: #16213e;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .controls button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }
        .btn-primary { background: #4ecca3; color: #1a1a2e; }
        .btn-primary:hover { background: #3db892; }
        .btn-secondary { background: #444; color: #eee; }
        .btn-secondary:hover { background: #555; }
        .btn-export { background: #e94560; color: white; }
        .btn-export:hover { background: #d63850; }
        .stats {
            margin-left: auto;
            font-size: 14px;
            color: #888;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
        .card {
            background: #16213e;
            border-radius: 12px;
            overflow: hidden;
            border: 3px solid transparent;
            transition: all 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
        }
        .card.selected {
            border-color: #4ecca3;
        }
        .card.no-image {
            opacity: 0.5;
        }
        .card-images {
            display: flex;
            gap: 2px;
            background: #0f0f23;
            min-height: 180px;
        }
        .card-images img {
            flex: 1;
            height: 180px;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .card-images img:hover {
            opacity: 0.8;
        }
        .card-images img.selected-img {
            outline: 3px solid #4ecca3;
            outline-offset: -3px;
        }
        .card-placeholder {
            width: 100%;
            height: 180px;
            background: #0f0f23;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
        }
        .card-body {
            padding: 15px;
        }
        .card-title {
            font-weight: 600;
            font-size: 16px;
            margin: 0 0 5px 0;
            color: #4ecca3;
        }
        .card-scientific {
            font-style: italic;
            color: #888;
            font-size: 14px;
            margin: 0 0 8px 0;
        }
        .card-meta {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
        }
        .card-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .card-actions button {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        }
        .btn-select { background: #4ecca3; color: #1a1a2e; }
        .btn-skip { background: #444; color: #aaa; }
        .output-area {
            background: #16213e;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        .output-area.visible { display: block; }
        .output-area h3 { color: #4ecca3; margin: 0 0 15px 0; }
        .output-area textarea {
            width: 100%;
            height: 200px;
            font-family: monospace;
            font-size: 12px;
            background: #0f0f23;
            color: #4ecca3;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 10px;
        }
        .legend {
            display: flex;
            gap: 20px;
            font-size: 13px;
            color: #888;
            margin-bottom: 15px;
        }
        .legend span { display: flex; align-items: center; gap: 5px; }
        .legend .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        .legend .dot.green { background: #4ecca3; }
        .legend .dot.gray { background: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>iNaturalist Image Selection</h1>
        <p>Found ${speciesData.filter(s => s.images.length > 0).length} of ${speciesData.length} species with CC-licensed photos</p>
    </div>

    <div class="instructions">
        <h3>Instructions</h3>
        <ol>
            <li>Click on an image to select it (green border = selected)</li>
            <li>If multiple images shown, pick the best quality one</li>
            <li>Skip species with poor quality or wrong fish</li>
            <li>Click "Export Selected" when done</li>
            <li>Run: <code>npm run images:upload</code> and paste the JSON</li>
        </ol>
    </div>

    <div class="controls">
        <button class="btn-primary" onclick="selectAllFirst()">Select All (First Image)</button>
        <button class="btn-secondary" onclick="deselectAll()">Deselect All</button>
        <button class="btn-export" onclick="exportSelected()">Export Selected</button>
        <div class="stats">
            Selected: <span id="selectedCount">0</span> / ${speciesData.length}
        </div>
    </div>

    <div class="legend">
        <span><span class="dot green"></span> Selected</span>
        <span><span class="dot gray"></span> Not selected</span>
    </div>

    <div class="grid">
        ${speciesData.map(species => `
            <div class="card ${species.images.length === 0 ? 'no-image' : ''}" data-key="${species.key}" id="card-${species.key}">
                ${species.images.length > 0
                    ? `<div class="card-images">
                        ${species.images.map((img, i) => `
                            <img src="${img.thumbUrl}"
                                 alt="${species.commonName}"
                                 data-key="${species.key}"
                                 data-url="${img.fullUrl}"
                                 data-index="${i}"
                                 onclick="selectImage(this)"
                                 title="Click to select"
                                 loading="lazy">
                        `).join('')}
                       </div>`
                    : `<div class="card-placeholder">No CC-licensed image found</div>`
                }
                <div class="card-body">
                    <h3 class="card-title">${species.commonName}</h3>
                    <p class="card-scientific">${species.scientificName}</p>
                    ${species.images.length > 0
                        ? `<p class="card-meta">
                            License: ${species.images[0].license} |
                            ${species.images.length} option${species.images.length > 1 ? 's' : ''}
                           </p>
                           <div class="card-actions">
                               <button class="btn-select" onclick="selectFirst('${species.key}')">Select Best</button>
                               <button class="btn-skip" onclick="deselect('${species.key}')">Skip</button>
                           </div>`
                        : `<p class="card-meta">No suitable image found on iNaturalist</p>`
                    }
                </div>
            </div>
        `).join('')}
    </div>

    <div class="output-area" id="outputArea">
        <h3>Selected Species JSON</h3>
        <textarea id="outputJson" readonly></textarea>
        <p style="margin-top:10px;font-size:14px;color:#888;">
            Copy this JSON, then run: <code>npm run images:upload</code>
        </p>
        <button class="btn-primary" style="margin-top:10px;" onclick="copyToClipboard()">Copy to Clipboard</button>
    </div>

    <script>
        const selections = {}; // key -> url

        function selectImage(img) {
            const key = img.dataset.key;
            const url = img.dataset.url;
            const card = document.getElementById('card-' + key);

            // Deselect all images in this card
            card.querySelectorAll('img').forEach(i => i.classList.remove('selected-img'));

            // Select this image
            img.classList.add('selected-img');
            card.classList.add('selected');
            selections[key] = url;

            updateStats();
        }

        function selectFirst(key) {
            const card = document.getElementById('card-' + key);
            const firstImg = card.querySelector('img');
            if (firstImg) {
                selectImage(firstImg);
            }
        }

        function deselect(key) {
            const card = document.getElementById('card-' + key);
            card.querySelectorAll('img').forEach(i => i.classList.remove('selected-img'));
            card.classList.remove('selected');
            delete selections[key];
            updateStats();
        }

        function selectAllFirst() {
            document.querySelectorAll('.card:not(.no-image)').forEach(card => {
                const firstImg = card.querySelector('img');
                if (firstImg) {
                    selectImage(firstImg);
                }
            });
        }

        function deselectAll() {
            document.querySelectorAll('.card').forEach(card => {
                card.querySelectorAll('img').forEach(i => i.classList.remove('selected-img'));
                card.classList.remove('selected');
            });
            Object.keys(selections).forEach(k => delete selections[k]);
            updateStats();
        }

        function updateStats() {
            document.getElementById('selectedCount').textContent = Object.keys(selections).length;
        }

        function exportSelected() {
            const selected = Object.entries(selections).map(([key, url]) => ({ key, url }));

            if (selected.length === 0) {
                alert('No images selected! Click on images to select them.');
                return;
            }

            const json = JSON.stringify(selected, null, 2);
            document.getElementById('outputJson').value = json;
            document.getElementById('outputArea').classList.add('visible');
            document.getElementById('outputArea').scrollIntoView({ behavior: 'smooth' });
        }

        function copyToClipboard() {
            const textarea = document.getElementById('outputJson');
            textarea.select();
            document.execCommand('copy');
            alert('Copied to clipboard! Now run: npm run images:upload');
        }

        // Initialize
        updateStats();
    </script>
</body>
</html>`;
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('Loading fish database...');
  const fishDatabase = loadFishDatabase();

  // Find species without images
  const speciesWithoutImages = Object.entries(fishDatabase)
    .filter(([key, data]) => !data.imageUrl)
    .map(([key, data]) => ({
      key,
      commonName: data.commonName,
      scientificName: data.scientificName,
    }));

  console.log(`Found ${speciesWithoutImages.length} species without images\n`);

  // Search iNaturalist for each species
  const results = [];
  for (let i = 0; i < speciesWithoutImages.length; i++) {
    const species = speciesWithoutImages[i];
    process.stdout.write(`Searching iNaturalist: ${i + 1}/${speciesWithoutImages.length} - ${species.commonName}...`);

    const images = await searchINaturalist(species.scientificName, species.commonName);

    results.push({
      ...species,
      images,
    });

    if (images.length > 0) {
      console.log(` Found ${images.length} image(s)`);
    } else {
      console.log(' No CC images found');
    }

    // Rate limiting - be nice to iNaturalist API
    await delay(500);
  }

  // Generate HTML
  console.log('\nGenerating preview page...');
  const html = generateHTML(results);

  const outputPath = join(__dirname, '..', 'image-preview-inaturalist.html');
  writeFileSync(outputPath, html);

  // Summary
  const withImages = results.filter(r => r.images.length > 0).length;
  const withoutImages = results.filter(r => r.images.length === 0).length;

  console.log(`\nDone! Preview page created: image-preview-inaturalist.html`);
  console.log(`\nResults:`);
  console.log(`  - Found images: ${withImages} species`);
  console.log(`  - No images: ${withoutImages} species`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open image-preview-inaturalist.html in your browser`);
  console.log(`  2. Click on images to select the best ones`);
  console.log(`  3. Click "Export Selected"`);
  console.log(`  4. Run: npm run images:upload`);
}

main().catch(console.error);
