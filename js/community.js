/**
 * Community Gallery - Public Tank Browsing
 * Phase 4 MVP: Display and browse community-shared tanks
 */

// State
let currentSortBy = 'newest';
let lastDoc = null;
let isLoading = false;
let allTanksLoaded = false;

/**
 * Initialize community gallery on page load
 */
async function initCommunityGallery() {
  // Wait for Firebase to be ready
  await waitForFirebase();

  // Load initial tanks
  await loadPublicTanks();
}

/**
 * Wait for Firebase to initialize
 */
function waitForFirebase() {
  return new Promise((resolve, reject) => {
    const maxWait = 10000;
    const checkInterval = 100;
    let waited = 0;

    const check = () => {
      if (window.firebaseFirestore) {
        resolve();
      } else if (waited >= maxWait) {
        reject(new Error('Firebase initialization timeout'));
      } else {
        waited += checkInterval;
        setTimeout(check, checkInterval);
      }
    };

    check();
  });
}

/**
 * Load public tanks from Firestore
 */
async function loadPublicTanks(append = false) {
  if (isLoading || (allTanksLoaded && append)) return;

  isLoading = true;
  const gallery = document.getElementById('community-gallery');
  const loadMoreBtn = document.getElementById('load-more-container');
  const emptyState = document.getElementById('community-empty');

  if (!append) {
    gallery.innerHTML = '<div class="community-loading"><p>Loading community tanks...</p></div>';
    lastDoc = null;
    allTanksLoaded = false;
  }

  try {
    const result = await window.publicTankManager.getPublicTanks({
      limit: 12,
      sortBy: currentSortBy,
      lastDoc: append ? lastDoc : null,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to load tanks');
    }

    const tanks = result.tanks;
    lastDoc = result.lastDoc;

    // Check if we've loaded all tanks
    if (tanks.length < 12) {
      allTanksLoaded = true;
    }

    if (!append) {
      gallery.innerHTML = '';
    }

    if (tanks.length === 0 && !append) {
      // Show empty state
      gallery.style.display = 'none';
      emptyState.style.display = 'block';
      loadMoreBtn.style.display = 'none';
      updateTankCount(0);
    } else {
      gallery.style.display = '';
      emptyState.style.display = 'none';

      // Render tank cards
      tanks.forEach(tank => {
        const card = createTankCard(tank);
        gallery.appendChild(card);
      });

      // Show/hide load more button
      loadMoreBtn.style.display = allTanksLoaded ? 'none' : 'flex';

      // Update count (approximate since we're paginating)
      updateTankCount(gallery.querySelectorAll('.community-card').length);
    }
  } catch (error) {
    console.error('Error loading community tanks:', error);
    if (!append) {
      gallery.innerHTML = `
        <div class="community-error">
          <p>Unable to load community tanks.</p>
          <button class="btn btn-ghost" onclick="loadPublicTanks()">Try Again</button>
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

/**
 * Create a tank card element
 */
function createTankCard(tank) {
  const card = document.createElement('article');
  card.className = 'community-card';
  card.onclick = () => viewTankDetail(tank.id);

  // Create card image/mosaic
  const imageSection = document.createElement('div');
  imageSection.className = 'community-card__image';

  if (tank.coverPhoto) {
    const img = document.createElement('img');
    img.src = tank.coverPhoto;
    img.alt = tank.name || 'Tank photo';
    img.loading = 'lazy';
    imageSection.appendChild(img);
  } else {
    // Create species mosaic
    const mosaic = createSpeciesMosaic(tank.species || []);
    imageSection.appendChild(mosaic);
  }

  // Size badge
  if (tank.size) {
    const badge = document.createElement('span');
    badge.className = 'community-card__badge';
    badge.textContent = `${tank.size}${tank.sizeUnit === 'liters' ? 'L' : 'g'}`;
    imageSection.appendChild(badge);
  }

  card.appendChild(imageSection);

  // Card content
  const content = document.createElement('div');
  content.className = 'community-card__content';

  const title = document.createElement('h3');
  title.className = 'community-card__title';
  title.textContent = tank.name || 'Unnamed Tank';
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'community-card__meta';

  const owner = document.createElement('span');
  owner.className = 'community-card__owner';
  owner.textContent = `by ${tank.username || 'Anonymous'}`;
  meta.appendChild(owner);

  const stats = document.createElement('span');
  stats.className = 'community-card__stats';
  const speciesCount = tank.species?.length || 0;
  const plantCount = tank.plants?.length || 0;
  const parts = [`${speciesCount} species`];
  if (plantCount > 0) parts.push(`${plantCount} plants`);
  stats.textContent = parts.join(' · ');
  meta.appendChild(stats);

  content.appendChild(meta);
  card.appendChild(content);

  return card;
}

/**
 * Create a species mosaic for tanks without cover photos
 */
function createSpeciesMosaic(speciesKeys) {
  const mosaic = document.createElement('div');
  mosaic.className = 'community-card__mosaic';

  if (!speciesKeys || speciesKeys.length === 0) {
    mosaic.classList.add('empty');
    const placeholder = document.createElement('span');
    placeholder.textContent = 'No species';
    mosaic.appendChild(placeholder);
    return mosaic;
  }

  // Get up to 4 species images
  const images = speciesKeys
    .slice(0, 4)
    .map(key => window.fishDatabase?.[key]?.imageUrl)
    .filter(url => url);

  if (images.length === 0) {
    mosaic.classList.add('empty');
    const placeholder = document.createElement('span');
    placeholder.textContent = `${speciesKeys.length} species`;
    mosaic.appendChild(placeholder);
    return mosaic;
  }

  images.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Species';
    img.loading = 'lazy';
    mosaic.appendChild(img);
  });

  return mosaic;
}

/**
 * Navigate to tank detail page
 */
function viewTankDetail(tankId) {
  window.location.href = `tank.html?id=${encodeURIComponent(tankId)}`;
}

/**
 * Change sort order and reload
 */
function changeSortOrder() {
  const select = document.getElementById('sort-select');
  currentSortBy = select.value;
  loadPublicTanks(false);
}

/**
 * Load more tanks (pagination)
 */
function loadMoreTanks() {
  loadPublicTanks(true);
}

/**
 * Update the displayed tank count
 */
function updateTankCount(count) {
  const countEl = document.getElementById('tank-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCommunityGallery);
