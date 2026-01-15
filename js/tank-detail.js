/**
 * Tank Detail Page - Public Tank Viewing
 * Phase 4 MVP: Display a single shared tank's details
 */

/**
 * Initialize tank detail page
 */
async function initTankDetail() {
  // Get tank ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tankId = urlParams.get('id');

  if (!tankId) {
    showError();
    return;
  }

  // Wait for Firebase
  await waitForFirebase();

  // Load tank
  await loadTankDetail(tankId);
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
 * Load and display tank details
 */
async function loadTankDetail(tankId) {
  const loadingEl = document.getElementById('tank-loading');
  const errorEl = document.getElementById('tank-error');
  const contentEl = document.getElementById('tank-content');

  try {
    const result = await window.publicTankManager.getPublicTank(tankId);

    if (!result.success || !result.tank) {
      showError();
      return;
    }

    const tank = result.tank;

    // Update page title
    document.title = `${tank.name || 'Tank'} | Comparium Community`;

    // Hide loading, show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';

    // Populate tank details
    renderTankHero(tank);
    renderTankInfo(tank);
    renderSpecies(tank.species || []);
    renderPlants(tank.plants || []);
    renderMeta(tank);
  } catch (error) {
    console.error('Error loading tank:', error);
    showError();
  }
}

/**
 * Render tank hero (cover photo or mosaic)
 */
function renderTankHero(tank) {
  const heroEl = document.getElementById('tank-hero');
  heroEl.innerHTML = '';

  if (tank.coverPhoto) {
    const img = document.createElement('img');
    img.src = tank.coverPhoto;
    img.alt = tank.name || 'Tank photo';
    img.className = 'tank-detail-hero-image';
    heroEl.appendChild(img);
  } else {
    // Create species mosaic
    const mosaic = document.createElement('div');
    mosaic.className = 'tank-detail-hero-mosaic';

    const speciesImages = (tank.species || [])
      .slice(0, 6)
      .map(key => window.fishDatabase?.[key]?.imageUrl)
      .filter(url => url);

    if (speciesImages.length > 0) {
      speciesImages.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Species';
        mosaic.appendChild(img);
      });
    } else {
      mosaic.classList.add('empty');
      mosaic.innerHTML = '<span>No photos available</span>';
    }

    heroEl.appendChild(mosaic);
  }
}

/**
 * Render basic tank info
 */
function renderTankInfo(tank) {
  document.getElementById('tank-name').textContent = tank.name || 'Unnamed Tank';

  const sizeEl = document.getElementById('tank-size');
  sizeEl.textContent = tank.size ? `${tank.size}${tank.sizeUnit === 'liters' ? 'L' : 'g'}` : '';

  const ownerLink = document.getElementById('tank-owner-link');
  ownerLink.textContent = `@${tank.username || 'Anonymous'}`;
  ownerLink.href = `profile.html?user=${encodeURIComponent(tank.userId)}`;

  const descEl = document.getElementById('tank-description');
  if (tank.description) {
    descEl.textContent = tank.description;
    descEl.style.display = 'block';
  } else {
    descEl.style.display = 'none';
  }
}

/**
 * Render species grid
 */
function renderSpecies(speciesKeys) {
  const gridEl = document.getElementById('species-grid');
  const countEl = document.getElementById('species-count');

  countEl.textContent = `(${speciesKeys.length})`;
  gridEl.innerHTML = '';

  if (speciesKeys.length === 0) {
    gridEl.innerHTML = '<p class="empty-message">No species added</p>';
    return;
  }

  speciesKeys.forEach(key => {
    const fish = window.fishDatabase?.[key];
    if (!fish) return;

    const card = document.createElement('a');
    card.href = `species.html?fish=${encodeURIComponent(key)}`;
    card.className = 'species-mini-card';

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'species-mini-card__image';
    if (fish.imageUrl) {
      const img = document.createElement('img');
      img.src = fish.imageUrl;
      img.alt = fish.commonName;
      img.loading = 'lazy';
      imgWrapper.appendChild(img);
    }
    card.appendChild(imgWrapper);

    const name = document.createElement('span');
    name.className = 'species-mini-card__name';
    name.textContent = fish.commonName;
    card.appendChild(name);

    gridEl.appendChild(card);
  });
}

/**
 * Render plants list
 */
function renderPlants(plantKeys) {
  const sectionEl = document.getElementById('plants-section');
  const listEl = document.getElementById('plants-list');
  const countEl = document.getElementById('plants-count');

  if (!plantKeys || plantKeys.length === 0) {
    sectionEl.style.display = 'none';
    return;
  }

  sectionEl.style.display = 'block';
  countEl.textContent = `(${plantKeys.length})`;
  listEl.innerHTML = '';

  plantKeys.forEach(key => {
    const plant = window.plantDatabase?.[key];
    if (!plant) return;

    const item = document.createElement('a');
    item.href = `plant.html?plant=${encodeURIComponent(key)}`;
    item.className = 'plant-list-item';

    const name = document.createElement('span');
    name.className = 'plant-list-item__name';
    name.textContent = plant.commonName;
    item.appendChild(name);

    const meta = document.createElement('span');
    meta.className = 'plant-list-item__meta';
    meta.textContent = `${plant.position} · ${plant.difficulty}`;
    item.appendChild(meta);

    listEl.appendChild(item);
  });
}

/**
 * Render metadata (shared date)
 */
function renderMeta(tank) {
  const metaEl = document.getElementById('tank-shared-date');

  if (tank.sharedAt) {
    const date = new Date(tank.sharedAt);
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    metaEl.textContent = `Shared on ${formatted}`;
  } else {
    metaEl.textContent = 'Shared recently';
  }
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('tank-loading').style.display = 'none';
  document.getElementById('tank-content').style.display = 'none';
  document.getElementById('tank-error').style.display = 'block';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initTankDetail);
