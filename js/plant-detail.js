// ============================================================================
// PLANT DETAIL PAGE GENERATOR
// ============================================================================

/**
 * Get display name for origin/continent code
 * @param {string} originKey - Origin key from plant-data.js (e.g., 'southAmerica')
 * @returns {string} Human-readable continent name
 */
function getPlantOriginDisplayName(originKey) {
  const originNames = {
    southAmerica: 'South America',
    africa: 'Africa',
    asia: 'Asia',
    northCentralAmerica: 'N. & C. America',
    australiaOceania: 'Oceania',
    cosmopolitan: 'Cosmopolitan',
  };
  return originNames[originKey] || originKey;
}

/**
 * Get display name for position
 */
function getPositionDisplayName(position) {
  const positionNames = {
    foreground: 'Foreground',
    midground: 'Midground',
    background: 'Background',
    surface: 'Surface',
    any: 'Any Position',
  };
  return positionNames[position] || position;
}

/**
 * Get display name for planting style
 */
function getPlantingStyleDisplayName(style) {
  const styleNames = {
    substrate: 'Planted in Substrate',
    floating: 'Floating',
    attachToWood: 'Attach to Wood',
    attachToRock: 'Attach to Rock',
    freeFloating: 'Free Floating',
  };
  return styleNames[style] || style;
}

/**
 * Get difficulty badge HTML
 */
function getDifficultyBadge(level) {
  const badges = {
    Easy: '<span class="badge badge-success">Easy</span>',
    Moderate: '<span class="badge badge-warning">Moderate</span>',
    Difficult: '<span class="badge badge-danger">Difficult</span>',
  };
  return badges[level] || level;
}

/**
 * Get CO2 badge HTML
 */
function getCO2Badge(required) {
  if (required) {
    return '<span class="badge badge-warning">Recommended</span>';
  }
  return '<span class="badge badge-success">Not Required</span>';
}

/**
 * Get related plants from same origin
 * @param {string} currentKey - Current plant key to exclude
 * @param {string} origin - Origin to match
 * @param {number} limit - Max number of plants to return
 * @returns {Array} Array of {key, plant} objects
 */
function getRelatedPlantsByOrigin(currentKey, origin, limit = 4) {
  if (!origin) return [];

  const related = [];
  for (const [key, plant] of Object.entries(plantDatabase)) {
    if (key !== currentKey && plant.origin === origin) {
      related.push({ key, plant });
      if (related.length >= limit) break;
    }
  }
  return related;
}

/**
 * Navigate to plant detail page
 */
function showPlantDetail(plantKey) {
  const plant = plantDatabase[plantKey];

  if (!plant) {
    console.error('Plant not found:', plantKey);
    return;
  }

  window.location.href = `plant.html?plant=${plantKey}`;
}

/**
 * Load plant detail on plant.html page
 * This runs when plant.html loads
 */
function loadPlantDetail() {
  // Get plant key from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const rawKey = urlParams.get('plant');

  // Validate plantKey to prevent XSS - only allow alphanumeric characters
  const plantKey = rawKey ? rawKey.replace(/[^a-zA-Z0-9]/g, '') : null;

  if (!plantKey) {
    document.getElementById('plant-content').innerHTML = `
            <div class="empty-state">
                <h2>No plant selected</h2>
                <p><a href="glossary.html">Return to glossary</a></p>
            </div>
        `;
    return;
  }

  const plant = plantDatabase[plantKey];

  if (!plant) {
    document.getElementById('plant-content').innerHTML = `
            <div class="empty-state">
                <h2>Plant not found</h2>
                <p><a href="glossary.html">Return to glossary</a></p>
            </div>
        `;
    return;
  }

  // Get description from plantDescriptions
  const description = plantDescriptions[plantKey] || '';

  // Update page title
  document.title = `${plant.commonName} - Comparium`;

  // Generate origin badge if origin exists
  const originBadge = plant.origin
    ? `<span class="origin-badge species-origin-badge" data-origin="${plant.origin}">${getPlantOriginDisplayName(plant.origin)}</span>`
    : '';

  // Get related plants from same origin
  const relatedPlants = getRelatedPlantsByOrigin(plantKey, plant.origin, 4);

  // Generate content
  const content = `
        <div class="species-detail">
            <div class="species-header">
                <div class="species-title">
                    <h1>${plant.commonName}</h1>
                    <p class="scientific-name"><em>${plant.scientificName}</em></p>
                    ${originBadge}
                </div>
                <div class="species-image-container">
                    ${
                      plant.imageUrl
                        ? `<img src="${plant.imageUrl}" alt="${plant.commonName}" class="species-image" loading="lazy">`
                        : `<div class="image-placeholder"><p>Photo coming soon</p></div>`
                    }
                </div>
            </div>

            ${
              description
                ? `
            <div class="species-description">
                <p>${description}</p>
            </div>
            `
                : ''
            }

            <div class="species-info-grid">
                <div class="info-card">
                    <h3>Placement & Style</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Position:</strong></td>
                            <td>${getPositionDisplayName(plant.position)}</td>
                        </tr>
                        <tr>
                            <td><strong>Planting Style:</strong></td>
                            <td>${getPlantingStyleDisplayName(plant.plantingStyle)}</td>
                        </tr>
                        <tr>
                            <td><strong>Maximum Height:</strong></td>
                            <td>${plant.maxHeight} ${plant.heightUnit}</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>Care Requirements</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Difficulty:</strong></td>
                            <td>${getDifficultyBadge(plant.difficulty)}</td>
                        </tr>
                        <tr>
                            <td><strong>Lighting:</strong></td>
                            <td>${plant.lightNeeds}</td>
                        </tr>
                        <tr>
                            <td><strong>CO2:</strong></td>
                            <td>${getCO2Badge(plant.co2Required)}</td>
                        </tr>
                        <tr>
                            <td><strong>Growth Rate:</strong></td>
                            <td>${plant.growthRate}</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>Water Parameters</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Temperature:</strong></td>
                            <td>${plant.tempMin}-${plant.tempMax}${plant.tempUnit}</td>
                        </tr>
                        <tr>
                            <td><strong>pH Range:</strong></td>
                            <td>${plant.phMin}-${plant.phMax}</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>Propagation</h3>
                    <p>${plant.propagation}</p>
                </div>
            </div>

            <div class="species-actions">
                <button onclick="window.location.href='glossary.html'" class="btn-small">
                    Back to Glossary
                </button>
            </div>

            ${
              relatedPlants.length > 0
                ? `
            <div class="related-species-section">
                <h3>From the same region</h3>
                <p class="related-species-subtitle">Other plants from ${getPlantOriginDisplayName(plant.origin)}</p>
                <div class="related-species-grid">
                    ${relatedPlants
                      .map(
                        ({ key, plant: relatedPlant }) => `
                        <a href="plant.html?plant=${key}" class="related-species-card">
                            <div class="related-species-image">
                                ${
                                  relatedPlant.imageUrl
                                    ? `<img src="${relatedPlant.imageUrl}" alt="${relatedPlant.commonName}" loading="lazy">`
                                    : `<div class="image-placeholder-small"></div>`
                                }
                            </div>
                            <span class="related-species-name">${relatedPlant.commonName}</span>
                        </a>
                    `
                      )
                      .join('')}
                </div>
            </div>
            `
                : ''
            }

            <div class="species-footer">
                <a href="mailto:admin@comparium.net?subject=Error%20Report%3A%20${encodeURIComponent(plant.commonName)}&body=Plant%3A%20${encodeURIComponent(plant.commonName)}%0AError%20Description%3A%20" class="report-error-link">Report an error</a>
            </div>
        </div>
    `;

  document.getElementById('plant-content').innerHTML = content;
}

// Initialize plant detail page if we're on plant.html
if (window.location.pathname.includes('plant.html')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPlantDetail);
  } else {
    loadPlantDetail();
  }
}
