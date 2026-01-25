/**
 * Guides Listing Page JavaScript
 *
 * Handles:
 * - Rendering guide cards from guides-data.js
 * - Category filtering
 * - Featured guide display
 */

/* global guidesData, guideCategories */

let currentCategory = 'all';

/**
 * Initialize guides page
 */
function initGuides() {
  renderFeaturedGuide();
  renderGuideCards();
}

/**
 * Render the featured guide section
 */
function renderFeaturedGuide() {
  // Find featured guide
  const featured = Object.values(guidesData).find(g => g.featured);
  if (!featured) {
    document.getElementById('featuredSection').style.display = 'none';
    return;
  }

  const category = guideCategories[featured.category] || { label: featured.category };

  document.getElementById('featuredTitle').textContent = featured.title;
  document.getElementById('featuredDescription').textContent = featured.description;
  document.getElementById('featuredTime').textContent = `${featured.readTime} min read`;
  document.getElementById('featuredCategory').textContent = category.label;
  document.getElementById('featuredCategory').style.color = category.color;
  document.getElementById('featuredLink').href = `/guide?guide=${featured.slug}`;
}

/**
 * Render guide cards in the grid
 */
function renderGuideCards() {
  const grid = document.getElementById('guidesGrid');
  const empty = document.getElementById('guidesEmpty');

  // Get guides sorted by date (newest first), excluding featured from main grid
  const guides = Object.values(guidesData)
    .filter(g => !g.featured)
    .filter(g => currentCategory === 'all' || g.category === currentCategory)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (guides.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = guides.map(guide => createGuideCard(guide)).join('');
}

/**
 * Create HTML for a guide card
 */
function createGuideCard(guide) {
  const category = guideCategories[guide.category] || { label: guide.category, color: '#4a4a4a' };

  return `
    <a href="/guide?guide=${guide.slug}" class="guide-card" data-category="${guide.category}">
      <div class="guide-card__content">
        <span class="guide-card__category" style="color: ${category.color}">${category.label}</span>
        <h3 class="guide-card__title">${guide.title}</h3>
        <p class="guide-card__description">${guide.description}</p>
        <div class="guide-card__meta">
          <span class="guide-card__time">${guide.readTime} min read</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Filter guides by category
 */
function filterGuides(category) {
  currentCategory = category;

  // Update active tab
  document.querySelectorAll('.guides-nav__tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });

  // Show/hide featured section based on category
  const featuredSection = document.getElementById('featuredSection');
  const featured = Object.values(guidesData).find(g => g.featured);

  if (category === 'all' || (featured && featured.category === category)) {
    featuredSection.style.display = 'block';
  } else {
    featuredSection.style.display = 'none';
  }

  renderGuideCards();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initGuides);
