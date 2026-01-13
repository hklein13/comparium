/**
 * Deep iNaturalist Search
 * Searches observations (not just taxa) for more photo options
 * Uses multiple query strategies for hard-to-find species
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Species to search (natural species only, not morphs/hybrids)
const SPECIES_TO_SEARCH = [
  { key: 'otocinclus', queries: ['Otocinclus', 'Otocinclus affinis', 'Otocinclus vittatus', 'Oto catfish'] },
  { key: 'dawnTetra', queries: ['Aphyocharax paraguayensis', 'Dawn tetra'] },
  { key: 'tBarb', queries: ['Puntius lateristriga', 'Striuntius lateristriga', 'T-barb', 'Spanner barb'] },
  { key: 'cumingsBarb', queries: ['Pethia cumingii', 'Puntius cumingii', 'Cuming barb'] },
  { key: 'glowlightDanio', queries: ['Danio choprae', 'Glowlight danio'] },
  { key: 'axelrodiRainbowfish', queries: ['Chilatherina axelrodi', 'Axelrod rainbowfish'] },
  { key: 'banjoCatfish', queries: ['Bunocephalus', 'Bunocephalus coracoideus', 'Banjo catfish'] },
];

const ALLOWED_LICENSES = ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa'];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Search iNaturalist observations for photos
async function searchObservations(query) {
  const url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(query)}&photos=true&quality_grade=research&per_page=10&order_by=votes`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Comparium/1.0 (https://comparium.net) Node.js',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const photos = [];

    for (const obs of data.results || []) {
      for (const photo of obs.photos || []) {
        const license = photo.license_code?.toLowerCase() || '';
        if (ALLOWED_LICENSES.includes(license)) {
          const mediumUrl = photo.url?.replace('square', 'medium');
          const largeUrl = photo.url?.replace('square', 'large');
          if (mediumUrl) {
            photos.push({
              thumbUrl: mediumUrl,
              fullUrl: largeUrl || mediumUrl,
              license: photo.license_code,
              attribution: photo.attribution || 'iNaturalist',
              query: query,
            });
          }
        }
      }
    }

    return photos;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

// Search iNaturalist taxa with photos
async function searchTaxaPhotos(query) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(query)}&per_page=5`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Comparium/1.0 (https://comparium.net) Node.js',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const photos = [];

    for (const taxon of data.results || []) {
      // Get taxon photos endpoint for more options
      if (taxon.id) {
        try {
          const photosUrl = `https://api.inaturalist.org/v1/taxa/${taxon.id}?per_page=1`;
          const photosResponse = await fetch(photosUrl, {
            headers: {
              'User-Agent': 'Comparium/1.0 (https://comparium.net) Node.js',
            },
          });

          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            const taxonData = photosData.results?.[0];

            // Check taxon_photos array
            for (const tp of taxonData?.taxon_photos || []) {
              const photo = tp.photo;
              if (!photo) continue;

              const license = photo.license_code?.toLowerCase() || '';
              if (ALLOWED_LICENSES.includes(license)) {
                const mediumUrl = photo.medium_url || photo.url?.replace('square', 'medium');
                const largeUrl = photo.large_url || photo.url?.replace('square', 'large');
                if (mediumUrl) {
                  photos.push({
                    thumbUrl: mediumUrl,
                    fullUrl: largeUrl || mediumUrl,
                    license: photo.license_code,
                    attribution: photo.attribution || 'iNaturalist',
                    query: query,
                    taxonName: taxon.name,
                  });
                }
              }
            }
          }
        } catch (e) {
          // Ignore individual taxon fetch errors
        }
      }

      // Also check default photo
      if (taxon.default_photo) {
        const photo = taxon.default_photo;
        const license = photo.license_code?.toLowerCase() || '';
        if (ALLOWED_LICENSES.includes(license)) {
          const mediumUrl = photo.medium_url || photo.url?.replace('square', 'medium');
          const largeUrl = photo.large_url || photo.url?.replace('square', 'large');
          if (mediumUrl && !photos.find(p => p.thumbUrl === mediumUrl)) {
            photos.push({
              thumbUrl: mediumUrl,
              fullUrl: largeUrl || mediumUrl,
              license: photo.license_code,
              attribution: photo.attribution || 'iNaturalist',
              query: query,
              taxonName: taxon.name,
            });
          }
        }
      }
    }

    return photos;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

// Generate HTML preview
function generateHTML(results) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deep Search Results - iNaturalist</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; margin: 0; }
        h1 { color: #4ecca3; text-align: center; }
        .subtitle { text-align: center; color: #888; margin-bottom: 30px; }
        .controls { background: #16213e; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; position: sticky; top: 0; z-index: 100; }
        .controls button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #4ecca3; color: #1a1a2e; }
        .btn-export { background: #e94560; color: white; }
        .stats { margin-left: auto; color: #888; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .card { background: #16213e; border-radius: 12px; overflow: hidden; border: 3px solid transparent; }
        .card.selected { border-color: #4ecca3; }
        .card.no-image { opacity: 0.5; }
        .card-images { display: flex; flex-wrap: wrap; gap: 2px; background: #0f0f23; min-height: 150px; }
        .card-images img { width: calc(33.33% - 2px); height: 120px; object-fit: cover; cursor: pointer; }
        .card-images img.selected-img { outline: 3px solid #4ecca3; outline-offset: -3px; }
        .card-placeholder { width: 100%; height: 150px; background: #0f0f23; display: flex; align-items: center; justify-content: center; color: #666; }
        .card-body { padding: 15px; }
        .card-title { font-weight: 600; font-size: 18px; color: #4ecca3; margin: 0 0 5px; }
        .card-meta { font-size: 13px; color: #888; margin-bottom: 10px; }
        .card-queries { font-size: 11px; color: #666; }
        .output-area { background: #16213e; padding: 20px; border-radius: 8px; margin-top: 20px; display: none; }
        .output-area.visible { display: block; }
        .output-area h3 { color: #4ecca3; }
        .output-area textarea { width: 100%; height: 200px; background: #0f0f23; color: #4ecca3; border: 1px solid #333; border-radius: 4px; padding: 10px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>Deep Search Results</h1>
    <p class="subtitle">Found ${results.filter(r => r.photos.length > 0).length} of ${results.length} species with CC-licensed photos</p>

    <div class="controls">
        <button class="btn-primary" onclick="selectAllFirst()">Select All (First)</button>
        <button class="btn-primary" onclick="deselectAll()">Clear All</button>
        <button class="btn-export" onclick="exportSelected()">Export Selected</button>
        <div class="stats">Selected: <span id="count">0</span> / ${results.length}</div>
    </div>

    <div class="grid">
        ${results.map(species => `
            <div class="card ${species.photos.length === 0 ? 'no-image' : ''}" id="card-${species.key}">
                ${species.photos.length > 0
                    ? `<div class="card-images">
                        ${species.photos.slice(0, 6).map((p, i) => `
                            <img src="${p.thumbUrl}" data-key="${species.key}" data-url="${p.fullUrl}" onclick="selectImg(this)" title="${p.query}">
                        `).join('')}
                       </div>`
                    : `<div class="card-placeholder">No CC images found</div>`
                }
                <div class="card-body">
                    <div class="card-title">${species.key}</div>
                    <div class="card-meta">${species.photos.length} photo(s) found</div>
                    <div class="card-queries">Searched: ${species.queriesSearched.join(', ')}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="output-area" id="output">
        <h3>Export JSON</h3>
        <textarea id="json" readonly></textarea>
        <button class="btn-primary" style="margin-top:10px" onclick="copy()">Copy & Close</button>
    </div>

    <script>
        const sel = {};
        function selectImg(img) {
            const key = img.dataset.key;
            const card = document.getElementById('card-' + key);
            card.querySelectorAll('img').forEach(i => i.classList.remove('selected-img'));
            img.classList.add('selected-img');
            card.classList.add('selected');
            sel[key] = img.dataset.url;
            document.getElementById('count').textContent = Object.keys(sel).length;
        }
        function selectAllFirst() {
            document.querySelectorAll('.card:not(.no-image)').forEach(card => {
                const img = card.querySelector('img');
                if (img) selectImg(img);
            });
        }
        function deselectAll() {
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('selected');
                c.querySelectorAll('img').forEach(i => i.classList.remove('selected-img'));
            });
            Object.keys(sel).forEach(k => delete sel[k]);
            document.getElementById('count').textContent = 0;
        }
        function exportSelected() {
            const data = Object.entries(sel).map(([key, url]) => ({ key, url }));
            if (data.length === 0) { alert('Nothing selected!'); return; }
            document.getElementById('json').value = JSON.stringify(data, null, 2);
            document.getElementById('output').classList.add('visible');
        }
        function copy() {
            document.getElementById('json').select();
            document.execCommand('copy');
            alert('Copied! Run: npm run images:upload');
            document.getElementById('output').classList.remove('visible');
        }
    </script>
</body>
</html>`;
}

async function main() {
  console.log('Deep iNaturalist Search');
  console.log('=======================\n');

  const results = [];

  for (const species of SPECIES_TO_SEARCH) {
    console.log(`\nSearching: ${species.key}`);
    const allPhotos = [];
    const queriesSearched = [];

    for (const query of species.queries) {
      process.stdout.write(`  - "${query}"... `);
      queriesSearched.push(query);

      // Search both observations and taxa
      const [obsPhotos, taxaPhotos] = await Promise.all([
        searchObservations(query),
        searchTaxaPhotos(query),
      ]);

      const combined = [...obsPhotos, ...taxaPhotos];
      const newPhotos = combined.filter(p => !allPhotos.find(existing => existing.thumbUrl === p.thumbUrl));
      allPhotos.push(...newPhotos);

      console.log(`${newPhotos.length} new photos`);

      await delay(300); // Rate limiting

      // If we have enough photos, stop searching more queries
      if (allPhotos.length >= 6) break;
    }

    results.push({
      key: species.key,
      photos: allPhotos.slice(0, 6), // Max 6 options
      queriesSearched,
    });

    console.log(`  Total: ${allPhotos.length} photos`);
  }

  // Generate HTML
  console.log('\n\nGenerating preview...');
  const html = generateHTML(results);
  const outputPath = join(__dirname, '..', 'image-preview-deep.html');
  writeFileSync(outputPath, html);

  const found = results.filter(r => r.photos.length > 0).length;
  console.log(`\nDone! Created: image-preview-deep.html`);
  console.log(`Found images for ${found} of ${results.length} species`);
  console.log('\nOpen the file in your browser to review and select images.');
}

main().catch(console.error);
