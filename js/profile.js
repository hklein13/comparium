/**
 * Profile Page - Public User Profile
 * Phase 4 MVP: Display user's public tanks
 */

/**
 * Initialize profile page
 */
async function initProfile() {
  // Get user ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');

  if (!userId) {
    showError();
    return;
  }

  // Wait for Firebase
  await waitForFirebase();

  // Load profile and tanks
  await loadProfile(userId);
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
 * Load and display user profile with their public tanks
 */
async function loadProfile(userId) {
  const loadingEl = document.getElementById('profile-loading');
  const errorEl = document.getElementById('profile-error');
  const contentEl = document.getElementById('profile-content');

  try {
    // Get user's public tanks
    const result = await window.publicTankManager.getPublicTanksByUser(userId);

    if (!result.success) {
      showError();
      return;
    }

    const tanks = result.tanks;

    // If no tanks, we need to get username from at least one tank
    // For MVP, we'll show what we can from the tanks data
    if (tanks.length === 0) {
      // No public tanks - still show profile but with empty state
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      renderEmptyProfile(userId);
      return;
    }

    // Get username from first tank (denormalized)
    const username = tanks[0].username || 'User';

    // Update page title
    document.title = `@${username} | Comparium Community`;

    // Hide loading, show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';

    // Render profile
    renderProfileHeader(username, tanks[0]);
    renderTanks(tanks);
  } catch (error) {
    console.error('Error loading profile:', error);
    showError();
  }
}

/**
 * Render profile header
 */
function renderProfileHeader(username, firstTank) {
  // Username
  document.getElementById('profile-username').textContent = `@${username}`;

  // Avatar (placeholder for MVP - can be enhanced in Phase 4A)
  const avatarEl = document.getElementById('profile-avatar');
  avatarEl.innerHTML = '';
  const avatarPlaceholder = document.createElement('span');
  avatarPlaceholder.className = 'avatar-placeholder';
  avatarPlaceholder.textContent = username.charAt(0).toUpperCase();
  avatarEl.appendChild(avatarPlaceholder);

  // Member since (from first tank's created date if available)
  const memberEl = document.getElementById('profile-member-since');
  if (firstTank?.created) {
    const date = new Date(firstTank.created);
    const year = date.getFullYear();
    memberEl.textContent = `Member since ${year}`;
  } else {
    memberEl.textContent = 'Community member';
  }
}

/**
 * Render empty profile (no public tanks)
 */
function renderEmptyProfile(userId) {
  document.getElementById('profile-username').textContent = 'User';
  document.getElementById('profile-member-since').textContent = 'Community member';

  const avatarEl = document.getElementById('profile-avatar');
  avatarEl.innerHTML = '<span class="avatar-placeholder">?</span>';

  document.getElementById('profile-tank-count').textContent = '(0)';
  document.getElementById('profile-tanks-grid').style.display = 'none';
  document.getElementById('profile-no-tanks').style.display = 'block';
}

/**
 * Render user's public tanks
 */
function renderTanks(tanks) {
  const gridEl = document.getElementById('profile-tanks-grid');
  const countEl = document.getElementById('profile-tank-count');
  const noTanksEl = document.getElementById('profile-no-tanks');

  countEl.textContent = `(${tanks.length})`;

  if (tanks.length === 0) {
    gridEl.style.display = 'none';
    noTanksEl.style.display = 'block';
    return;
  }

  gridEl.style.display = '';
  noTanksEl.style.display = 'none';
  gridEl.innerHTML = '';

  tanks.forEach(tank => {
    const card = createTankCard(tank);
    gridEl.appendChild(card);
  });
}

/**
 * Create a tank card (similar to community gallery)
 */
function createTankCard(tank) {
  const card = document.createElement('article');
  card.className = 'community-card';
  card.onclick = () => {
    window.location.href = `tank.html?id=${encodeURIComponent(tank.id)}`;
  };

  // Image section
  const imageSection = document.createElement('div');
  imageSection.className = 'community-card__image';

  if (tank.coverPhoto) {
    const img = document.createElement('img');
    img.src = tank.coverPhoto;
    img.alt = tank.name || 'Tank photo';
    img.loading = 'lazy';
    imageSection.appendChild(img);
  } else {
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

  // Content section
  const content = document.createElement('div');
  content.className = 'community-card__content';

  const title = document.createElement('h3');
  title.className = 'community-card__title';
  title.textContent = tank.name || 'Unnamed Tank';
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'community-card__meta';

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
 * Create species mosaic
 */
function createSpeciesMosaic(speciesKeys) {
  const mosaic = document.createElement('div');
  mosaic.className = 'community-card__mosaic';

  if (!speciesKeys || speciesKeys.length === 0) {
    mosaic.classList.add('empty');
    mosaic.innerHTML = '<span>No species</span>';
    return mosaic;
  }

  const images = speciesKeys
    .slice(0, 4)
    .map(key => window.fishDatabase?.[key]?.imageUrl)
    .filter(url => url);

  if (images.length === 0) {
    mosaic.classList.add('empty');
    mosaic.innerHTML = `<span>${speciesKeys.length} species</span>`;
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
 * Show error state
 */
function showError() {
  document.getElementById('profile-loading').style.display = 'none';
  document.getElementById('profile-content').style.display = 'none';
  document.getElementById('profile-error').style.display = 'block';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initProfile);
