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
/**
 * Get display name for origin/continent code
 * @param {string} originKey - Origin key from fish-data.js (e.g., 'southAmerica')
 * @returns {string} Human-readable continent name
 */
function getOriginDisplayName(originKey) {
  const originNames = {
    southAmerica: 'South America',
    africa: 'Africa',
    asia: 'Asia',
    northCentralAmerica: 'N. & C. America',
    australiaOceania: 'Oceania',
  };
  return originNames[originKey] || originKey;
}

function generateGlossaryEntry(key, fish, descriptions = {}) {
  // Normalize care level for sorting (beginner, intermediate, advanced)
  let normalizedCareLevel = 'intermediate';
  if (fish.careLevel === 'Very Easy' || fish.careLevel === 'Easy') {
    normalizedCareLevel = 'beginner';
  } else if (fish.careLevel === 'Difficult' || fish.careLevel === 'Very Difficult') {
    normalizedCareLevel = 'advanced';
  }

  return {
    id: toKebabCase(key),
    fishKey: key, // Original camelCase key for fishDatabase lookups and /species links
    title: fish.commonName,
    scientificName: fish.scientificName,
    description: generateFishDescription(key, fish, descriptions),
    imageUrl: fish.imageUrl || null,
    origin: fish.origin || null, // Continent origin
    originDisplayName: fish.origin ? getOriginDisplayName(fish.origin) : null,
    careLevel: normalizedCareLevel, // For sorting: beginner, intermediate, advanced
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

// ============================================================================
// PLANT ENTRY GENERATORS
// ============================================================================

/**
 * Generate tags based on plant attributes
 *
 * @param {Object} plant - Plant object from plant-data.js
 * @returns {Array<string>} Array of tag strings
 */
function generatePlantTags(plant) {
  const tags = [];

  // Difficulty tags
  if (plant.difficulty === 'Easy') {
    tags.push('Beginner Friendly');
  } else if (plant.difficulty === 'Moderate') {
    tags.push('Intermediate');
  } else if (plant.difficulty === 'Difficult') {
    tags.push('Advanced');
  }

  // Light needs tag
  if (plant.lightNeeds) {
    tags.push(plant.lightNeeds + ' Light');
  }

  // Position tag
  if (plant.position) {
    const positionLabels = {
      foreground: 'Foreground',
      midground: 'Midground',
      background: 'Background',
      surface: 'Floating',
    };
    tags.push(positionLabels[plant.position] || plant.position);
  }

  // Planting style tag
  if (plant.plantingStyle) {
    const styleLabels = {
      substrate: 'Plant in Substrate',
      floating: 'Floating',
      attachToWood: 'Attach to Wood',
      attachToRock: 'Attach to Rock',
    };
    if (plant.plantingStyle !== 'floating' || plant.position !== 'surface') {
      tags.push(styleLabels[plant.plantingStyle] || plant.plantingStyle);
    }
  }

  // CO2 requirement
  if (plant.co2Required) {
    tags.push('CO2 Required');
  }

  // Growth rate tag
  if (plant.growthRate) {
    tags.push(plant.growthRate + ' Growth');
  }

  return tags;
}

/**
 * Generate description for a plant
 * Uses curated description if available, otherwise generates from attributes
 *
 * @param {string} key - Plant key from plant-data.js
 * @param {Object} plant - Plant object from plant-data.js
 * @param {Object} descriptions - Curated descriptions object
 * @returns {string} Description text
 */
function generatePlantDescription(key, plant, descriptions) {
  // Use curated description if available
  if (descriptions && descriptions[key]) {
    return descriptions[key];
  }

  // Generate basic description from attributes
  const tempRange = `${plant.tempMin}-${plant.tempMax}°F`;
  const phRange = `${plant.phMin}-${plant.phMax}`;

  let difficultyDesc = 'moderately easy to grow';
  if (plant.difficulty === 'Easy') {
    difficultyDesc = 'easy to grow and beginner-friendly';
  } else if (plant.difficulty === 'Difficult') {
    difficultyDesc = 'challenging to grow and requires attention';
  }

  const co2Desc = plant.co2Required
    ? ' CO2 supplementation recommended.'
    : ' Does not require CO2 supplementation.';

  return `A ${plant.position} plant that is ${difficultyDesc}. Grows to ${plant.maxHeight} ${plant.heightUnit} with ${plant.growthRate.toLowerCase()} growth rate. Thrives in ${tempRange} water with pH ${phRange}. Requires ${plant.lightNeeds.toLowerCase()} lighting.${co2Desc}`.replace(
    /\s+/g,
    ' '
  );
}

/**
 * Generate glossary entry from plant data
 *
 * @param {string} key - Plant key from plant-data.js
 * @param {Object} plant - Plant object from plant-data.js
 * @param {Object} descriptions - Curated descriptions object (optional)
 * @returns {Object} Glossary entry object
 */
function generatePlantEntry(key, plant, descriptions = {}) {
  // Normalize difficulty level for sorting
  let normalizedDifficulty = 'intermediate';
  if (plant.difficulty === 'Easy') {
    normalizedDifficulty = 'beginner';
  } else if (plant.difficulty === 'Difficult') {
    normalizedDifficulty = 'advanced';
  }

  return {
    id: toKebabCase(key),
    plantKey: key, // Original camelCase key for plantDatabase lookups
    title: plant.commonName,
    scientificName: plant.scientificName,
    description: generatePlantDescription(key, plant, descriptions),
    imageUrl: plant.imageUrl || null,
    origin: plant.origin || null,
    originDisplayName: plant.origin ? getOriginDisplayName(plant.origin) : null,
    difficulty: normalizedDifficulty, // For sorting: beginner, intermediate, advanced
    position: plant.position,
    plantingStyle: plant.plantingStyle,
    lightNeeds: plant.lightNeeds,
    co2Required: plant.co2Required,
    growthRate: plant.growthRate,
    tags: generatePlantTags(plant),
    category: 'plants',
    author: 'System',
    firestoreId: null,
    userId: null,
    upvotes: 0,
    verified: true,
  };
}

/**
 * Generate all glossary entries from plant database
 *
 * @param {Object} plantDatabase - The plantDatabase object from plant-data.js
 * @param {Object} descriptions - Curated descriptions object from plant-descriptions.js (optional)
 * @returns {Array<Object>} Array of glossary entry objects
 */
function generatePlantEntries(plantDatabase, descriptions = {}) {
  const entries = [];

  for (const [key, plant] of Object.entries(plantDatabase)) {
    entries.push(generatePlantEntry(key, plant, descriptions));
  }

  return entries;
}

// Export functions for use in glossary.js and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toKebabCase,
    generateFishTags,
    generateFishDescription,
    getOriginDisplayName,
    generateGlossaryEntry,
    generateGlossaryEntries,
    // Plant functions
    generatePlantTags,
    generatePlantDescription,
    generatePlantEntry,
    generatePlantEntries,
  };
}
