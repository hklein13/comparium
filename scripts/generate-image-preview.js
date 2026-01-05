/**
 * Generate Image Preview Page
 * Creates an HTML page showing all species without images, with Wikimedia results
 *
 * Usage: npm run images:preview
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Query Wikimedia Commons API
async function searchWikimedia(scientificName) {
  const searchQuery = encodeURIComponent(scientificName);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchQuery}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=400&format=json&origin=*`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Comparium/1.0 (https://comparium.net; contact@comparium.net) Node.js',
      },
    });

    // Check for valid JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`\n  Warning: Non-JSON response for ${scientificName}`);
      return [];
    }

    const data = await response.json();

    const pages = data.query?.pages;
    if (!pages) return [];

    const results = [];
    for (const page of Object.values(pages)) {
      const imageInfo = page.imageinfo?.[0];
      if (imageInfo?.url) {
        if (imageInfo.url.endsWith('.svg') || (imageInfo.width && imageInfo.width < 400)) {
          continue;
        }

        const license = imageInfo.extmetadata?.LicenseShortName?.value || 'Unknown';
        results.push({
          title: page.title.replace('File:', ''),
          thumbUrl: imageInfo.url,
          fullUrl: imageInfo.url,
          license: license,
        });
      }
    }

    return results;
  } catch (error) {
    console.error(`Error searching for ${scientificName}:`, error.message);
    return [];
  }
}

// Generate HTML preview page
function generateHTML(speciesData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comparium - Image Selection Preview</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #14b8a6, #1e3a8a);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 { margin: 0 0 10px 0; }
        .controls {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .controls button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        .btn-primary { background: #14b8a6; color: white; }
        .btn-primary:hover { background: #0d9488; }
        .btn-secondary { background: #e5e7eb; color: #374151; }
        .btn-secondary:hover { background: #d1d5db; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; }
        .stats {
            margin-left: auto;
            font-size: 14px;
            color: #666;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .card.selected {
            outline: 3px solid #14b8a6;
        }
        .card.no-image {
            opacity: 0.6;
        }
        .card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #e5e7eb;
        }
        .card-placeholder {
            width: 100%;
            height: 200px;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 14px;
        }
        .card-body {
            padding: 15px;
        }
        .card-title {
            font-weight: 600;
            font-size: 16px;
            margin: 0 0 5px 0;
        }
        .card-scientific {
            font-style: italic;
            color: #666;
            font-size: 14px;
            margin: 0 0 10px 0;
        }
        .card-license {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
        }
        .card-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card-checkbox input {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        .card-checkbox label {
            cursor: pointer;
            font-size: 14px;
        }
        .output-area {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .output-area.visible { display: block; }
        .output-area textarea {
            width: 100%;
            height: 150px;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
        }
        .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .instructions h3 { margin: 0 0 10px 0; color: #92400e; }
        .instructions ol { margin: 0; padding-left: 20px; }
        .instructions li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comparium Image Selection</h1>
        <p>Review and select images for ${speciesData.length} species</p>
    </div>

    <div class="instructions">
        <h3>Instructions</h3>
        <ol>
            <li>Review each image - check the box if it's a good quality photo of the correct species</li>
            <li>Click "Export Selected" when done</li>
            <li>Copy the JSON output</li>
            <li>Run: <code>npm run images:upload</code> and paste when prompted</li>
        </ol>
    </div>

    <div class="controls">
        <button class="btn-primary" onclick="selectAll()">Select All</button>
        <button class="btn-secondary" onclick="deselectAll()">Deselect All</button>
        <button class="btn-primary" onclick="exportSelected()">Export Selected</button>
        <div class="stats">
            Selected: <span id="selectedCount">0</span> / ${speciesData.length}
        </div>
    </div>

    <div class="grid">
        ${speciesData
          .map(
            species => `
            <div class="card ${species.images.length === 0 ? 'no-image' : ''}" data-key="${species.key}">
                ${
                  species.images.length > 0
                    ? `<img class="card-image" src="${species.images[0].thumbUrl}" alt="${species.commonName}" loading="lazy">`
                    : `<div class="card-placeholder">No image found</div>`
                }
                <div class="card-body">
                    <h3 class="card-title">${species.commonName}</h3>
                    <p class="card-scientific">${species.scientificName}</p>
                    ${
                      species.images.length > 0
                        ? `<p class="card-license">License: ${species.images[0].license}</p>
                           <div class="card-checkbox">
                               <input type="checkbox" id="check-${species.key}" data-key="${species.key}" data-url="${species.images[0].fullUrl}" onchange="updateStats()">
                               <label for="check-${species.key}">Use this image</label>
                           </div>`
                        : `<p class="card-license">No suitable image found on Wikimedia</p>`
                    }
                </div>
            </div>
        `
          )
          .join('')}
    </div>

    <div class="output-area" id="outputArea">
        <h3>Selected Species (copy this JSON)</h3>
        <textarea id="outputJson" readonly></textarea>
        <p style="margin-top:10px;font-size:14px;color:#666;">
            Now run: <code>npm run images:upload</code> and paste this JSON when prompted.
        </p>
    </div>

    <script>
        function updateStats() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            document.getElementById('selectedCount').textContent = checkboxes.length;

            // Update card styling
            document.querySelectorAll('.card').forEach(card => {
                const checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    card.classList.toggle('selected', checkbox.checked);
                }
            });
        }

        function selectAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
            updateStats();
        }

        function deselectAll() {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateStats();
        }

        function exportSelected() {
            const selected = [];
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                selected.push({
                    key: cb.dataset.key,
                    url: cb.dataset.url
                });
            });

            const json = JSON.stringify(selected, null, 2);
            document.getElementById('outputJson').value = json;
            document.getElementById('outputArea').classList.add('visible');

            // Copy to clipboard
            navigator.clipboard.writeText(json).then(() => {
                alert('Copied ' + selected.length + ' species to clipboard!\\n\\nNow run: npm run images:upload');
            });
        }

        // Initial stats
        updateStats();
    </script>
</body>
</html>`;
}

// Main function
async function main() {
  console.log('Loading fish database...');
  const fishDatabase = loadFishDatabase();

  // Get species without images
  const speciesWithoutImages = Object.entries(fishDatabase)
    .filter(([key, fish]) => !fish.imageUrl)
    .map(([key, fish]) => ({ key, ...fish }));

  console.log(`Found ${speciesWithoutImages.length} species without images\n`);

  if (speciesWithoutImages.length === 0) {
    console.log('All species already have images!');
    return;
  }

  // Query Wikimedia for each species
  const speciesData = [];
  for (let i = 0; i < speciesWithoutImages.length; i++) {
    const species = speciesWithoutImages[i];
    process.stdout.write(
      `\rSearching Wikimedia: ${i + 1}/${speciesWithoutImages.length} - ${species.commonName}...`
    );

    const images = await searchWikimedia(species.scientificName);
    speciesData.push({
      key: species.key,
      commonName: species.commonName,
      scientificName: species.scientificName,
      images: images,
    });

    // Delay to avoid Wikimedia rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n\nGenerating preview page...');

  // Generate HTML
  const html = generateHTML(speciesData);
  const outputPath = join(__dirname, '..', 'image-preview.html');
  writeFileSync(outputPath, html);

  console.log(`\nDone! Preview page created: image-preview.html`);
  console.log('\nNext steps:');
  console.log('1. Open image-preview.html in your browser');
  console.log('2. Check the images you want to use');
  console.log('3. Click "Export Selected"');
  console.log('4. Run: npm run images:upload');
}

main().catch(console.error);
