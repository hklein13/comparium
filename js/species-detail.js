// ============================================================================
// SPECIES DETAIL PAGE GENERATOR
// ============================================================================

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

    // Generate content
    const content = `
        <div class="species-detail">
            <div class="species-header">
                <div class="species-title">
                    <h1>${fish.commonName}</h1>
                    <p class="scientific-name"><em>${fish.scientificName}</em></p>
                    ${generateFavoriteStar(fishKey)}
                </div>
                <div class="species-image-container">
                    ${fish.imageUrl
                        ? `<img src="${fish.imageUrl}" alt="${fish.commonName}" class="species-image" loading="lazy">`
                        : `<div class="image-placeholder">🐠<p>Photo coming soon!</p></div>`
                    }
                </div>
            </div>

            <div class="species-info-grid">
                <div class="info-card">
                    <h3>📏 Size & Tank Requirements</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Maximum Size:</strong></td>
                            <td>${fish.maxSize}"</td>
                        </tr>
                        <tr>
                            <td><strong>Minimum Tank Size:</strong></td>
                            <td>${fish.tankSizeMin}+ gallons</td>
                        </tr>
                        <tr>
                            <td><strong>Recommended Tank Size:</strong></td>
                            <td>${fish.tankSizeRecommended}+ gallons</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>🌡️ Water Parameters</h3>
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
                            <td>${fish.hardness}</td>
                        </tr>
                    </table>
                </div>

                <div class="info-card">
                    <h3>🐟 Behavior & Care</h3>
                    <table class="info-table">
                        <tr>
                            <td><strong>Aggression Level:</strong></td>
                            <td>${getAggressionBadge(fish.aggression)}</td>
                        </tr>
                        <tr>
                            <td><strong>Tank Level:</strong></td>
                            <td>${fish.tankLevel}</td>
                        </tr>
                        <tr>
                            <td><strong>Diet:</strong></td>
                            <td>${fish.diet}</td>
                        </tr>
                        <tr>
                            <td><strong>Social:</strong></td>
                            <td>${fish.schooling ? 'Yes - keep in groups of 6+' : 'Can be kept individually'}</td>
                        </tr>
                    </table>
                </div>

                ${fish.specialCare ? `
                <div class="info-card warning-card">
                    <h3>⚠️ Special Care Notes</h3>
                    <p>${fish.specialCare}</p>
                </div>
                ` : ''}

                ${fish.notes ? `
                <div class="info-card">
                    <h3>📝 Additional Notes</h3>
                    <p>${fish.notes}</p>
                </div>
                ` : ''}
            </div>

            <div class="species-actions">
                <button onclick="window.location.href='index.html'" class="btn-small">
                    Compare with Other Fish
                </button>
                ${authManager && authManager.isLoggedIn() ? `
                    <button onclick="addToTankPlan('${fishKey}')" class="btn-small">
                        Add to Tank Plan
                    </button>
                ` : ''}
            </div>

            <div class="species-footer">
                <p><small>Data sourced from SeriouslyFish, Aquarium Co-Op, FishLore, and Aqueon. Always research thoroughly before adding fish to your tank.</small></p>
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
 */
function generateFavoriteStar(speciesKey) {
    if (!authManager || !authManager.isLoggedIn()) {
        return '';
    }
    
    return `<span class="favorite-star" data-species="${speciesKey}" onclick="toggleFavorite('${speciesKey}', this)">★</span>`;
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
        'Peaceful': '<span class="badge badge-success">Peaceful</span>',
        'Semi-Aggressive': '<span class="badge badge-warning">Semi-Aggressive</span>',
        'Aggressive': '<span class="badge badge-danger">Aggressive</span>'
    };
    return badges[level] || level;
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSpeciesDetail);
    } else {
        loadSpeciesDetail();
    }
}
