/**
 * Export Social Content Script
 *
 * Generates CSV/JSON content from fish-data.js for social media posts.
 * Outputs: species name, 3 key facts, image URL, suggested hashtags
 *
 * Usage: node scripts/export-social-content.js [--csv|--json] [--limit N]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse fish-data.js to extract fishDatabase
function loadFishDatabase() {
  const fishDataPath = join(__dirname, '..', 'js', 'fish-data.js');
  const content = readFileSync(fishDataPath, 'utf8');

  // Extract the fishDatabase object using regex
  const match = content.match(/var fishDatabase = (\{[\s\S]*\});?\s*$/);
  if (!match) {
    throw new Error('Could not parse fishDatabase from fish-data.js');
  }

  // Use Function constructor to safely evaluate the object
  const evalCode = `return ${match[1]}`;
  const fishDatabase = new Function(evalCode)();

  return fishDatabase;
}

// Parse fish-descriptions.js to extract descriptions
function loadFishDescriptions() {
  const descriptionsPath = join(__dirname, '..', 'js', 'fish-descriptions.js');
  const content = readFileSync(descriptionsPath, 'utf8');

  // Extract the fishDescriptions object
  const match = content.match(/const fishDescriptions = (\{[\s\S]*?\n\};)/);
  if (!match) {
    // Fallback: return empty object if parsing fails
    console.warn('Warning: Could not parse fishDescriptions, using empty descriptions');
    return {};
  }

  try {
    const evalCode = `return ${match[1]}`;
    return new Function(evalCode)();
  } catch {
    console.warn('Warning: Could not evaluate fishDescriptions');
    return {};
  }
}

// Generate 3 key facts for a species
function generateFacts(key, fish, description) {
  const facts = [];

  // Fact 1: Temperature and pH requirements
  facts.push(
    `Thrives in ${fish.tempMin}-${fish.tempMax}${fish.tempUnit} water with pH ${fish.phMin}-${fish.phMax}`
  );

  // Fact 2: Tank size and social behavior
  const socialInfo = fish.schooling || 'Community fish';
  facts.push(`Needs ${fish.tankSizeMin}+ gallon tank. ${socialInfo}`);

  // Fact 3: Extract unique trait from description or use care level
  if (description) {
    // Try to extract an interesting trait from the first sentence
    const firstSentence = description.split('.')[0];
    if (firstSentence.length < 120) {
      facts.push(firstSentence);
    } else {
      // Truncate if too long
      facts.push(firstSentence.slice(0, 117) + '...');
    }
  } else {
    // Fallback to care level and diet
    facts.push(`${fish.careLevel} care, ${fish.diet.toLowerCase()} diet`);
  }

  return facts;
}

// Generate hashtags for a species
function generateHashtags(fish) {
  const hashtags = ['#fishtok', '#aquarium', '#fishkeeping', '#aquariumhobby'];

  // Add species-specific hashtag (cleaned name)
  const speciesTag =
    '#' +
    fish.commonName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
  hashtags.push(speciesTag);

  // Add category-based hashtags
  if (fish.aggression === 'Peaceful') {
    hashtags.push('#peacefulfish');
  }
  if (fish.careLevel === 'Easy') {
    hashtags.push('#beginnerfish');
  }
  if (fish.schooling && fish.schooling.includes('School')) {
    hashtags.push('#schoolingfish');
  }
  if (fish.origin === 'southAmerica') {
    hashtags.push('#southamericanfish');
  } else if (fish.origin === 'asia') {
    hashtags.push('#asianfish');
  } else if (fish.origin === 'africa') {
    hashtags.push('#africanfish');
  }

  return hashtags.slice(0, 8).join(' '); // Limit to 8 hashtags
}

// Convert to CSV format
function toCSV(entries) {
  const headers = [
    'key',
    'commonName',
    'scientificName',
    'fact1',
    'fact2',
    'fact3',
    'imageUrl',
    'hashtags',
    'careLevel',
    'aggression',
  ];

  const csvRows = [headers.join(',')];

  for (const entry of entries) {
    const row = [
      entry.key,
      `"${entry.commonName}"`,
      `"${entry.scientificName}"`,
      `"${entry.fact1.replace(/"/g, '""')}"`,
      `"${entry.fact2.replace(/"/g, '""')}"`,
      `"${entry.fact3.replace(/"/g, '""')}"`,
      entry.imageUrl || '',
      `"${entry.hashtags}"`,
      entry.careLevel,
      entry.aggression,
    ];
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

// Main export function
function exportSocialContent(options = {}) {
  const { format = 'csv', limit = null } = options;

  const fishDatabase = loadFishDatabase();
  const fishDescriptions = loadFishDescriptions();

  const entries = [];

  for (const [key, fish] of Object.entries(fishDatabase)) {
    // Skip species without images (can't use them for social content)
    if (!fish.imageUrl) continue;

    const description = fishDescriptions[key] || '';
    const facts = generateFacts(key, fish, description);
    const hashtags = generateHashtags(fish);

    entries.push({
      key,
      commonName: fish.commonName,
      scientificName: fish.scientificName,
      fact1: facts[0],
      fact2: facts[1],
      fact3: facts[2],
      imageUrl: fish.imageUrl,
      hashtags,
      careLevel: fish.careLevel,
      aggression: fish.aggression,
    });

    if (limit && entries.length >= limit) break;
  }

  console.log(`Generated content for ${entries.length} species`);

  if (format === 'json') {
    return JSON.stringify(entries, null, 2);
  } else {
    return toCSV(entries);
  }
}

// CLI handling
const args = process.argv.slice(2);
const format = args.includes('--json') ? 'json' : 'csv';
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;

const output = exportSocialContent({ format, limit });

// Write to file
const outputPath = join(__dirname, `social-content.${format}`);
writeFileSync(outputPath, output, 'utf8');
console.log(`Output written to: ${outputPath}`);

// Also output first 5 entries as preview
console.log('\nPreview (first 5 entries):');
const entries = format === 'json' ? JSON.parse(output) : output.split('\n').slice(1, 6);
if (format === 'json') {
  console.log(JSON.stringify(entries.slice(0, 5), null, 2));
} else {
  entries.forEach((row) => console.log(row.slice(0, 100) + '...'));
}
