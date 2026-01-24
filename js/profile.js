/**
 * Profile Page - Public User Profile
 * Phase 4 MVP: Display user's public tanks
 * Phase 4.3: Follow button and stats
 */

let profileUserId = null;

/**
 * Initialize profile page
 */
async function initProfile() {
  // Get user parameter from URL (could be username or userId)
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');

  if (!userParam) {
    showError();
    return;
  }

  // Wait for Firebase
  await waitForFirebase();

  // Resolve username to userId if needed
  const userId = await resolveUserId(userParam);

  if (!userId) {
    showError();
    return;
  }

  // Load profile and tanks
  await loadProfile(userId);
}

/**
 * Resolve a username or userId to an actual userId
 * @param {string} userParam - Could be a username or userId
 * @returns {Promise<string|null>} - The resolved userId or null
 */
async function resolveUserId(userParam) {
  // Firebase UIDs are typically 28 characters and alphanumeric
  // Usernames are typically shorter and may contain different characters
  const looksLikeUid = /^[a-zA-Z0-9]{20,}$/.test(userParam);

  if (looksLikeUid) {
    // Assume it's already a userId
    return userParam;
  }

  // It's a username - use the existing helper function to look it up
  // This preserves case sensitivity as usernames are stored with original case
  try {
    const userData = await window.firestoreGetUidByUsername(userParam);
    if (userData && userData.uid) {
      return userData.uid;
    }

    // Username not found
    return null;
  } catch (error) {
    console.error('Error resolving username:', error);
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error);
    }
    return null;
  }
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
      await renderEmptyProfile(userId);
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
    await renderProfileHeader(username, tanks[0], userId);
    renderTanks(tanks);

    // Store userId for follow functionality
    profileUserId = userId;

    // Load and display follow stats
    await loadFollowStats(userId);

    // Show follow button if not own profile
    await renderFollowButton(userId);
  } catch (error) {
    console.error('Error loading profile:', error);
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error);
    }
    showError();
  }
}

/**
 * Render profile header with bio, experience, and location
 */
async function renderProfileHeader(username, firstTank, userId) {
  // Username
  document.getElementById('profile-username').textContent = `@${username}`;

  // Avatar (placeholder for MVP - can be enhanced in Phase 4A)
  const avatarEl = document.getElementById('profile-avatar');
  avatarEl.innerHTML = '';
  const avatarPlaceholder = document.createElement('span');
  avatarPlaceholder.className = 'avatar-placeholder';
  avatarPlaceholder.textContent = username.charAt(0).toUpperCase();
  avatarEl.appendChild(avatarPlaceholder);

  // Try to get full profile data for bio/experience/location
  let profileData = {};
  if (userId && window.firestoreGetProfile) {
    const fullProfile = await window.firestoreGetProfile(userId);
    profileData = fullProfile?.profile || {};
  }

  // Build member info with experience and location
  const memberEl = document.getElementById('profile-member-since');
  const details = [];

  if (profileData.experience) {
    details.push(profileData.experience.charAt(0).toUpperCase() + profileData.experience.slice(1));
  }
  if (profileData.location) {
    details.push(profileData.location);
  }

  if (details.length > 0) {
    memberEl.textContent = details.join(' · ');
  } else if (firstTank?.created) {
    const date = new Date(firstTank.created);
    memberEl.textContent = `Member since ${date.getFullYear()}`;
  } else {
    memberEl.textContent = 'Community member';
  }

  // Add bio element if it doesn't exist
  let bioEl = document.getElementById('profile-bio');
  if (!bioEl) {
    bioEl = document.createElement('p');
    bioEl.id = 'profile-bio';
    bioEl.className = 'profile-bio';
    memberEl.parentNode.insertBefore(bioEl, memberEl.nextSibling);
  }

  if (profileData.bio) {
    bioEl.textContent = profileData.bio;
    bioEl.style.display = 'block';
  } else {
    bioEl.style.display = 'none';
  }
}

/**
 * Render empty profile (no public tanks)
 */
async function renderEmptyProfile(userId) {
  // Try to get full profile data including username, bio, experience, location
  let profileData = {};
  let username = 'User';
  if (userId && window.firestoreGetProfile) {
    const fullProfile = await window.firestoreGetProfile(userId);
    username = fullProfile?.username || 'User';
    profileData = fullProfile?.profile || {};
  }

  document.getElementById('profile-username').textContent = `@${username}`;

  // Avatar
  const avatarEl = document.getElementById('profile-avatar');
  avatarEl.innerHTML = '';
  const avatarPlaceholder = document.createElement('span');
  avatarPlaceholder.className = 'avatar-placeholder';
  avatarPlaceholder.textContent = username.charAt(0).toUpperCase();
  avatarEl.appendChild(avatarPlaceholder);

  // Build member info with experience and location
  const memberEl = document.getElementById('profile-member-since');
  const details = [];

  if (profileData.experience) {
    details.push(profileData.experience.charAt(0).toUpperCase() + profileData.experience.slice(1));
  }
  if (profileData.location) {
    details.push(profileData.location);
  }

  if (details.length > 0) {
    memberEl.textContent = details.join(' · ');
  } else {
    memberEl.textContent = 'Community member';
  }

  // Add bio element if it doesn't exist
  let bioEl = document.getElementById('profile-bio');
  if (!bioEl) {
    bioEl = document.createElement('p');
    bioEl.id = 'profile-bio';
    bioEl.className = 'profile-bio';
    memberEl.parentNode.insertBefore(bioEl, memberEl.nextSibling);
  }

  if (profileData.bio) {
    bioEl.textContent = profileData.bio;
    bioEl.style.display = 'block';
  } else {
    bioEl.style.display = 'none';
  }

  // Update page title
  document.title = `@${username} | Comparium Community`;

  document.getElementById('profile-tank-count').textContent = '(0)';
  document.getElementById('profile-tanks-grid').style.display = 'none';
  document.getElementById('profile-no-tanks').style.display = 'block';

  // Store userId and load follow functionality
  profileUserId = userId;
  loadFollowStats(userId);
  renderFollowButton(userId);
}

/**
 * Load and display follower/following counts
 */
async function loadFollowStats(userId) {
  const statsEl = document.getElementById('profile-stats');
  const followersEl = document.getElementById('profile-followers');
  const followingEl = document.getElementById('profile-following');

  if (!statsEl || !followersEl || !followingEl) return;

  const [followerCount, followingCount] = await Promise.all([
    window.socialManager.getFollowerCount(userId),
    window.socialManager.getFollowingCount(userId),
  ]);

  followersEl.textContent = `${followerCount} follower${followerCount !== 1 ? 's' : ''}`;
  followingEl.textContent = `${followingCount} following`;
  statsEl.style.display = 'flex';
}

/**
 * Render follow button if viewing another user's profile
 */
async function renderFollowButton(userId) {
  const btnContainer = document.getElementById('profile-follow-btn');
  if (!btnContainer) return;

  const auth = window.firebaseAuth;

  // Don't show follow button if not logged in or viewing own profile
  if (!auth.currentUser || auth.currentUser.uid === userId) {
    btnContainer.style.display = 'none';
    return;
  }

  // Check if already following
  const isFollowing = await window.socialManager.isFollowing(userId);

  // Create button
  const btn = document.createElement('button');
  btn.className = `btn ${isFollowing ? 'btn--following' : 'btn-primary'}`;
  btn.textContent = isFollowing ? 'Following' : 'Follow';
  btn.onclick = handleFollowClick;

  btnContainer.innerHTML = '';
  btnContainer.appendChild(btn);
  btnContainer.style.display = 'block';
}

/**
 * Handle follow button click
 */
async function handleFollowClick(event) {
  const btn = event.target;
  btn.disabled = true;

  const result = await window.socialManager.toggleFollow(profileUserId);

  if (result.success) {
    // Update button state
    if (result.following) {
      btn.className = 'btn btn--following';
      btn.textContent = 'Following';
    } else {
      btn.className = 'btn btn-primary';
      btn.textContent = 'Follow';
    }

    // Refresh follower count
    await loadFollowStats(profileUserId);
  } else {
    alert(result.error || 'Failed to update follow status');
  }

  btn.disabled = false;
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
    window.location.href = `/tank?id=${encodeURIComponent(tank.id)}`;
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
