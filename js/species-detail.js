// ============================================================================
// SPECIES DETAIL PAGE GENERATOR
// ============================================================================

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

/**
 * Get related species from same origin
 * @param {string} currentKey - Current fish key to exclude
 * @param {string} origin - Origin to match
 * @param {number} limit - Max number of species to return
 * @returns {Array} Array of {key, fish} objects
 */
function getRelatedSpeciesByOrigin(currentKey, origin, limit = 4) {
  if (!origin) return [];

  const related = [];
  for (const [key, fish] of Object.entries(fishDatabase)) {
    if (key !== currentKey && fish.origin === origin && fish.imageUrl) {
      related.push({ key, fish });
      if (related.length >= limit) break;
    }
  }
  return related;
}

/**
 * Generate species detail page content
 * Call this when user clicks on a fish species
 */
function showSpeciesDetail(speciesKey) {
  const fish = fishDatabase[speciesKey];

  if (!fish) {
    console.error('Fish not found:', speciesKey);
    return;
  }

  // Create or navigate to species page
  window.location.href = `species.html?fish=${speciesKey}`;
}

/**
 * Load species detail on species.html page
 * This runs when species.html loads
 */
function loadSpeciesDetail() {
  // Get fish key from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const fishKey = urlParams.get('fish');

  if (!fishKey) {
    document.getElementById('species-content').innerHTML = `
            <div class="empty-state">
                <h2>No fish selected</h2>
                <p><a href="index.html">Return to comparison tool</a></p>
            </div>
        `;
    return;
  }

  const fish = fishDatabase[fishKey];

  if (!fish) {
    document.getElementById('species-content').innerHTML = `
            <div class="empty-state">
                <h2>Fish not found</h2>
                <p><a href="index.html">Return to comparison tool</a></p>
            </div>
        `;
    return;
  }

  // Update page title
  document.title = `${fish.commonName} - Comparium`;

  // Generate origin badge if origin exists
  const originBadge = fish.origin
    ? `<a href="glossary.html?origin=${fish.origin}" class="origin-badge species-origin-badge" data-origin="${fish.origin}">${getOriginDisplayName(fish.origin)}</a>`
    : '';

  // Generate alternate names display if alternateNames exist
  const alternateNamesDisplay =
    fish.alternateNames && fish.alternateNames.length > 0
      ? `<p class="alternate-names">Also known as: ${fish.alternateNames.join(', ')}</p>`
      : '';

  // Get related species from same origin
  const relatedSpecies = getRelatedSpeciesByOrigin(fishKey, fish.origin, 4);

  // Get description from fish-descriptions.js if available
  const description =
    typeof fishDescriptions !== 'undefined' && fishDescriptions[fishKey]
      ? fishDescriptions[fishKey]
      : '';

  // Generate content
  const content = `
        <div class="species-detail">
            <div class="species-header">
                <div class="species-title">
                    <h1>${fish.commonName}</h1>
                    <p class="scientific-name"><em>${fish.scientificName}</em></p>
                    ${alternateNamesDisplay}
                    ${originBadge}
                    ${generateFavoriteStar(fishKey)}
                </div>
                <div class="species-image-container">
                    ${
                      fish.imageUrl
                        ? `<img src="${fish.imageUrl}" alt="${fish.commonName}" class="species-image" loading="lazy">`
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
                    <h3>Size & Tank Requirements</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Maximum Size:</strong></td>
                            <td>${fish.maxSize}"</td>
                        </tr>
                        <tr>
                            <td><strong>Minimum Tank Size:</strong></td>
                            <td>${fish.tankSizeMin}+ gallons</td>
                        </tr>
                        ${
                          fish.tankSizeRecommended
                            ? `<tr>
                            <td><strong>Recommended Tank Size:</strong></td>
                            <td>${fish.tankSizeRecommended}+ gallons</td>
                        </tr>`
                            : ''
                        }
                    </table>
                </div>

                <div class="info-card">
                    <h3>Water Parameters</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Temperature:</strong></td>
                            <td>${fish.tempMin}-${fish.tempMax}°F</td>
                        </tr>
                        <tr>
                            <td><strong>pH Range:</strong></td>
                            <td>${fish.phMin}-${fish.phMax}</td>
                        </tr>
                        <tr>
                            <td><strong>Hardness:</strong></td>
                            <td>${fish.waterHardness}</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>Behavior & Care</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Aggression Level:</strong></td>
                            <td>${getAggressionBadge(fish.aggression)}</td>
                        </tr>
                        <tr>
                            <td><strong>Diet:</strong></td>
                            <td>${fish.diet}</td>
                        </tr>
                        <tr>
                            <td><strong>Social:</strong></td>
                            <td>${fish.schooling}</td>
                        </tr>
                        <tr>
                            <td><strong>Care Level:</strong></td>
                            <td>${fish.careLevel}</td>
                        </tr>
                        <tr>
                            <td><strong>Lifespan:</strong></td>
                            <td>${fish.lifespan}</td>
                        </tr>
                    </table>
                </div>

                ${
                  fish.breedingNeeds
                    ? `
                <div class="info-card">
                    <h3>Breeding</h3>
                    <p>${fish.breedingNeeds}</p>
                </div>
                `
                    : ''
                }

                ${
                  fish.genderDifferentiation
                    ? `
                <div class="info-card">
                    <h3>Gender Differentiation</h3>
                    <p>${fish.genderDifferentiation}</p>
                </div>
                `
                    : ''
                }

                ${
                  fish.specialCare
                    ? `
                <div class="info-card warning-card">
                    <h3>Special Care Notes</h3>
                    <p>${fish.specialCare}</p>
                </div>
                `
                    : ''
                }

                ${
                  fish.notes
                    ? `
                <div class="info-card">
                    <h3>Additional Notes</h3>
                    <p>${fish.notes}</p>
                </div>
                `
                    : ''
                }
            </div>

            <div class="species-actions">
                <button onclick="window.location.href='index.html'" class="btn-small">
                    Compare with Other Fish
                </button>
                ${
                  authManager && authManager.isLoggedIn()
                    ? `
                    <button onclick="addToTankPlan('${fishKey}')" class="btn-small">
                        Add to Tank Plan
                    </button>
                `
                    : ''
                }
            </div>

            ${
              relatedSpecies.length > 0
                ? `
            <div class="related-species-section">
                <h3>From the same waters</h3>
                <p class="related-species-subtitle">Other species from ${getOriginDisplayName(fish.origin)}</p>
                <div class="related-species-grid">
                    ${relatedSpecies
                      .map(
                        ({ key, fish: relatedFish }) => `
                        <a href="species.html?fish=${key}" class="related-species-card">
                            <div class="related-species-image">
                                <img src="${relatedFish.imageUrl}" alt="${relatedFish.commonName}" loading="lazy">
                            </div>
                            <span class="related-species-name">${relatedFish.commonName}</span>
                        </a>
                    `
                      )
                      .join('')}
                </div>
                <a href="glossary.html?origin=${fish.origin}" class="related-species-link">
                    View all ${getOriginDisplayName(fish.origin)} species &rarr;
                </a>
            </div>
            `
                : ''
            }

            <div class="species-footer">
                <a href="mailto:admin@comparium.net?subject=Error%20Report%3A%20${encodeURIComponent(fish.commonName)}&body=Species%3A%20${encodeURIComponent(fish.commonName)}%0AError%20Description%3A%20" class="report-error-link">Report an error</a>
            </div>
        </div>
    `;

  document.getElementById('species-content').innerHTML = content;

  // Load favorite state if logged in
  if (authManager && authManager.isLoggedIn()) {
    loadFavoriteStateForSpecies(fishKey);
  }
}

/**
 * Generate favorite star for species detail page
 * Uses data-species attribute instead of inline onclick for XSS safety
 * Always renders the star - CSS uses body.logged-in to show/hide
 */
function generateFavoriteStar(speciesKey) {
  return `<span class="favorite-star" data-species="${speciesKey}">★</span>`;
}

/**
 * Load favorite state for species on detail page
 */
async function loadFavoriteStateForSpecies(speciesKey) {
  if (!authManager || !authManager.isLoggedIn()) return;

  const uid = authManager.getCurrentUid();
  const isFav = await storageService.isFavorite(uid, speciesKey);

  const star = document.querySelector(`.favorite-star[data-species="${speciesKey}"]`);
  if (star && isFav) {
    star.classList.add('active');
  }
}

/**
 * Get aggression badge HTML
 */
function getAggressionBadge(level) {
  const badges = {
    Peaceful: '<span class="badge badge-success">Peaceful</span>',
    'Semi-Aggressive': '<span class="badge badge-warning">Semi-Aggressive</span>',
    Aggressive: '<span class="badge badge-danger">Aggressive</span>',
  };
  return badges[level] || level;
}

/**
 * Toggle favorite status for a species
 */
async function toggleFavorite(speciesKey, element) {
  if (!authManager || !authManager.isLoggedIn()) {
    authManager?.showMessage('Please login to save favorites', 'info');
    return;
  }

  const uid = authManager.getCurrentUid();
  const isFavorite = await storageService.isFavorite(uid, speciesKey);

  if (isFavorite) {
    await storageService.removeFavorite(uid, speciesKey);
    element.classList.remove('active');
    authManager.showMessage('Removed from favorites', 'success');
  } else {
    await storageService.addFavorite(uid, speciesKey);
    element.classList.add('active');
    authManager.showMessage('Added to favorites!', 'success');
  }
}

/**
 * Add fish to tank plan (if logged in)
 */
function addToTankPlan(speciesKey) {
  if (!authManager || !authManager.isLoggedIn()) {
    authManager.showMessage('Please login to add fish to tank plans', 'info');
    return;
  }

  // Store in session for tank builder (read by tankManager on dashboard)
  sessionStorage.setItem('addToTank', speciesKey);
  window.location.href = 'dashboard.html#my-tanks-section';
}

// Initialize species detail page if we're on species.html
if (window.location.pathname.includes('species.html')) {
  // Set up delegated click handler for favorite stars (XSS-safe alternative to inline onclick)
  function setupFavoriteStarHandler() {
    const content = document.getElementById('species-content');
    if (content) {
      content.addEventListener('click', function (event) {
        const star = event.target.closest('.favorite-star');
        if (star && star.dataset.species) {
          toggleFavorite(star.dataset.species, star);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupFavoriteStarHandler();
      loadSpeciesDetail();
    });
  } else {
    setupFavoriteStarHandler();
    loadSpeciesDetail();
  }
}
