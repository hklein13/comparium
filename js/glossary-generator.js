// ============================================================================
// GLOSSARY GENERATOR - Dynamic Entry Builder
// ============================================================================
// Generates glossary entries dynamically from fish-data.js (single source of truth)
// Merges with curated descriptions from fish-descriptions.js
// Follows DRY, SOLID, KISS principles
// Firebase-ready architecture
// ============================================================================

/**
 * Convert camelCase to kebab-case
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generate tags based on fish attributes
 * Reusable, testable, single source of truth for tag logic
 *
 * @param {Object} fish - Fish object from fish-data.js
 * @returns {Array<string>} Array of tag strings
 */
function generateFishTags(fish) {
  const tags = [];

  // Care level tags
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    tags.push('Beginner Friendly');
  } else if (fish.careLevel === 'Moderate') {
    tags.push('Intermediate');
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    tags.push('Advanced');
  }

  // Temperament tag
  if (fish.aggression) {
    tags.push(fish.aggression);
  }

  // Schooling tag
  if (fish.schooling && (fish.schooling.includes('School') || fish.schooling.includes('Group'))) {
    tags.push('Schooling Fish');
  }

  // Size tags
  const sizeNum = parseFloat(fish.maxSize);
  if (!isNaN(sizeNum)) {
    if (sizeNum < 2) {
      tags.push('Small');
    } else if (sizeNum <= 5) {
      tags.push('Medium');
    } else {
      tags.push('Large');
    }
  }

  // Diet tag
  if (fish.diet) {
    tags.push(fish.diet);
  }

  return tags;
}

/**
 * Generate description for a fish
 * Uses curated description if available, otherwise generates from attributes
 *
 * @param {string} key - Fish key from fish-data.js
 * @param {Object} fish - Fish object from fish-data.js
 * @param {Object} descriptions - Curated descriptions object
 * @returns {string} Description text
 */
function generateFishDescription(key, fish, descriptions) {
  // Use curated description if available
  if (descriptions && descriptions[key]) {
    return descriptions[key];
  }

  // Generate basic description from attributes
  const tempRange = `${fish.tempMin}-${fish.tempMax}°F`;
  const phRange = `${fish.phMin}-${fish.phMax}`;

  let careDesc = 'moderate care';
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    careDesc = 'easy to care for';
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    careDesc = 'challenging to maintain';
  }

  let tempDesc = 'peaceful community fish';
  if (fish.aggression === 'Semi-aggressive') {
    tempDesc = 'semi-aggressive species requiring careful tankmate selection';
  } else if (fish.aggression === 'Aggressive') {
    tempDesc = 'aggressive species best in species-only tanks';
  }

  const schoolingDesc =
    fish.schooling && (fish.schooling.includes('School') || fish.schooling.includes('Group'))
      ? ` Best kept in groups (${fish.schooling}).`
      : ' Can be kept individually or in compatible groups.';

  return `${tempDesc} reaching ${fish.maxSize} inches, ${careDesc}. Thrives in ${tempRange} water with pH ${phRange} and minimum tank size of ${fish.tankSizeMin} gallons.${schoolingDesc} Lifespan of ${fish.lifespan}.`.replace(
    /\s+/g,
    ' '
  );
}

/**
 * Generate glossary entry from fish data
 *
 * @param {string} key - Fish key from fish-data.js
 * @param {Object} fish - Fish object from fish-data.js
 * @param {Object} descriptions - Curated descriptions object (optional)
 * @returns {Object} Glossary entry object
 */
function generateGlossaryEntry(key, fish, descriptions = {}) {
  return {
    id: toKebabCase(key),
    fishKey: key, // Original camelCase key for fishDatabase lookups and species.html links
    title: fish.commonName,
    scientificName: fish.scientificName,
    description: generateFishDescription(key, fish, descriptions),
    imageUrl: fish.imageUrl || null,
    tags: generateFishTags(fish),
    category: 'species',
    author: 'System',
    // Firestore fields - populated when saved to Firestore
    firestoreId: null,
    userId: null,
    upvotes: 0,
    verified: true,
  };
}

/**
 * Generate all glossary entries from fish database
 * Single source of truth: fish-data.js
 *
 * @param {Object} fishDatabase - The fishDatabase object from fish-data.js
 * @param {Object} descriptions - Curated descriptions object from fish-descriptions.js (optional)
 * @returns {Array<Object>} Array of glossary entry objects
 */
function generateGlossaryEntries(fishDatabase, descriptions = {}) {
  const entries = [];

  for (const [key, fish] of Object.entries(fishDatabase)) {
    entries.push(generateGlossaryEntry(key, fish, descriptions));
  }

  return entries;
}

// Export functions for use in glossary.js and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toKebabCase,
    generateFishTags,
    generateFishDescription,
    generateGlossaryEntry,
    generateGlossaryEntries,
  };
}
