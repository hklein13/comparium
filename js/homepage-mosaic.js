/**
 * Homepage - Featured Tank Section
 *
 * Displays a featured community tank on the homepage.
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================
// FEATURED TANK SECTION
// ============================================

/**
 * Build and render the featured tank section
 */
async function buildFeaturedTank() {
  const container = document.getElementById('featured-tank');
  if (!container) return;

  try {
    // Check if publicTankManager is available
    if (typeof window.publicTankManager === 'undefined') {
      container.style.display = 'none';
      return;
    }

    const result = await window.publicTankManager.getPublicTanks({ limit: 1 });
    if (!result.success || result.tanks.length === 0) {
      container.style.display = 'none';
      return;
    }

    const tank = result.tanks[0];
    if (!tank.coverPhoto) {
      container.style.display = 'none';
      return;
    }

    // Build species list (species are stored as keys like "cardinalTetra")
    const speciesList = (tank.species || [])
      .slice(0, 5)
      .map(key => {
        if (typeof fishDatabase !== 'undefined' && fishDatabase[key]) {
          return fishDatabase[key].commonName;
        }
        return key; // fallback to key if database not available
      })
      .join(', ');
    const speciesMore =
      tank.species && tank.species.length > 5 ? ` +${tank.species.length - 5} more` : '';

    // Build plants list (plants are stored as keys like "javaFern")
    const plantsList = (tank.plants || [])
      .slice(0, 5)
      .map(key => {
        if (typeof plantDatabase !== 'undefined' && plantDatabase[key]) {
          return plantDatabase[key].commonName;
        }
        return key; // fallback to key if database not available
      })
      .join(', ');
    const plantsMore =
      tank.plants && tank.plants.length > 5 ? ` +${tank.plants.length - 5} more` : '';

    container.innerHTML = `
      <div class="featured-tank animate-on-scroll">
        <div class="featured-tank__image">
          <a href="/tank?id=${escapeHTML(tank.id)}">
            <img src="${escapeHTML(tank.coverPhoto)}" alt="${escapeHTML(tank.name || 'Featured Tank')}" />
          </a>
        </div>
        <div class="featured-tank__info">
          <div class="featured-tank__label">Featured Tank</div>
          <h3 class="featured-tank__name">
            <a href="/tank?id=${escapeHTML(tank.id)}">${escapeHTML(tank.name || 'Unnamed Tank')}</a>
          </h3>
          <p class="featured-tank__author">by <a href="/profile?user=${escapeHTML(tank.owner?.username || '')}">${escapeHTML(tank.owner?.username || 'Anonymous')}</a></p>
          ${tank.description ? `<p class="featured-tank__description">${escapeHTML(tank.description)}</p>` : ''}
          <div class="featured-tank__stats">
            <span>${tank.size || '?'} ${tank.sizeUnit || 'gallons'}</span>
            <span>${tank.species?.length || 0} species</span>
            ${tank.plants?.length ? `<span>${tank.plants.length} plants</span>` : ''}
          </div>
          ${speciesList ? `<p class="featured-tank__species"><strong>Species:</strong> ${escapeHTML(speciesList)}${speciesMore}</p>` : ''}
          ${plantsList ? `<p class="featured-tank__plants"><strong>Plants:</strong> ${escapeHTML(plantsList)}${plantsMore}</p>` : ''}
          <a href="/tank?id=${escapeHTML(tank.id)}" class="btn btn-ghost">View Tank</a>
        </div>
      </div>
    `;

    // Trigger animation
    setTimeout(() => {
      const el = container.querySelector('.animate-on-scroll');
      if (el) el.classList.add('animate-in');
    }, 100);
  } catch (error) {
    console.error('Error loading featured tank:', error);
    container.style.display = 'none';
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize homepage sections
 */
function initHomepage() {
  // Wait for DOM and Firebase to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure Firebase is initialized
      setTimeout(buildFeaturedTank, 100);
    });
  } else {
    setTimeout(buildFeaturedTank, 100);
  }
}

// Auto-initialize
initHomepage();
