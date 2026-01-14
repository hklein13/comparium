/**
 * Community Gallery - Public Tanks and Posts
 * Phase 4 Full: Social features
 */

// State
let currentView = 'tanks';
let tankSortBy = 'newest';
let postSortBy = 'newest';
let postCategory = '';
let tankLastDoc = null;
let postLastDoc = null;
let isTanksLoading = false;
let isPostsLoading = false;
let allTanksLoaded = false;
let allPostsLoaded = false;

/**
 * Initialize community page on load
 */
async function initCommunityGallery() {
  await waitForFirebase();

  // Listen for auth state changes to show/hide new post button
  if (window.firebaseAuthState && window.firebaseAuth) {
    window.firebaseAuthState(window.firebaseAuth, (user) => {
      const newPostContainer = document.getElementById('new-post-container');
      if (newPostContainer) {
        newPostContainer.style.display = user ? 'flex' : 'none';
      }
    });
  }

  // Load initial tanks (default view)
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
 * Switch between Tanks and Posts views
 */
function switchView(view) {
  currentView = view;

  // Update tab buttons
  document.querySelectorAll('.community-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });

  // Show/hide views
  document.getElementById('tanks-view').style.display =
    view === 'tanks' ? 'block' : 'none';
  document.getElementById('posts-view').style.display =
    view === 'posts' ? 'block' : 'none';

  // Load data if not already loaded
  if (view === 'posts' && !document.querySelector('.post-card')) {
    loadPosts();
  }
}

// ============================================================================
// TANKS VIEW
// ============================================================================

/**
 * Load public tanks
 */
async function loadPublicTanks(append = false) {
  if (isTanksLoading || (allTanksLoaded && append)) return;

  isTanksLoading = true;
  const gallery = document.getElementById('community-gallery');
  const loadMoreBtn = document.getElementById('load-more-container');
  const emptyState = document.getElementById('community-empty');

  if (!append) {
    gallery.innerHTML =
      '<div class="community-loading"><p>Loading community tanks...</p></div>';
    tankLastDoc = null;
    allTanksLoaded = false;
  }

  try {
    const result = await window.publicTankManager.getPublicTanks({
      limit: 12,
      sortBy: tankSortBy,
      lastDoc: append ? tankLastDoc : null,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to load tanks');
    }

    const tanks = result.tanks;
    tankLastDoc = result.lastDoc;

    if (tanks.length < 12) {
      allTanksLoaded = true;
    }

    if (!append) {
      gallery.innerHTML = '';
    }

    if (tanks.length === 0 && !append) {
      gallery.style.display = 'none';
      emptyState.style.display = 'block';
      loadMoreBtn.style.display = 'none';
      updateTankCount(0);
    } else {
      gallery.style.display = '';
      emptyState.style.display = 'none';

      tanks.forEach((tank) => {
        const card = createTankCard(tank);
        gallery.appendChild(card);
      });

      loadMoreBtn.style.display = allTanksLoaded ? 'none' : 'flex';
      updateTankCount(gallery.querySelectorAll('.community-card').length);
    }
  } catch (error) {
    if (!append) {
      gallery.innerHTML = `
        <div class="community-error">
          <p>Unable to load community tanks.</p>
          <button class="btn btn-ghost" onclick="loadPublicTanks()">Try Again</button>
        </div>
      `;
    }
  } finally {
    isTanksLoading = false;
  }
}

/**
 * Create a tank card element
 */
function createTankCard(tank) {
  const card = document.createElement('article');
  card.className = 'community-card';
  card.onclick = () => viewTankDetail(tank.id);

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

  if (tank.size) {
    const badge = document.createElement('span');
    badge.className = 'community-card__badge';
    badge.textContent = `${tank.size}${tank.sizeUnit === 'liters' ? 'L' : 'g'}`;
    imageSection.appendChild(badge);
  }

  card.appendChild(imageSection);

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
 * Create species mosaic for tanks without photos
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

  const images = speciesKeys
    .slice(0, 4)
    .map((key) => window.fishDatabase?.[key]?.imageUrl)
    .filter((url) => url);

  if (images.length === 0) {
    mosaic.classList.add('empty');
    const placeholder = document.createElement('span');
    placeholder.textContent = `${speciesKeys.length} species`;
    mosaic.appendChild(placeholder);
    return mosaic;
  }

  images.forEach((url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Species';
    img.loading = 'lazy';
    mosaic.appendChild(img);
  });

  return mosaic;
}

function viewTankDetail(tankId) {
  window.location.href = `tank.html?id=${encodeURIComponent(tankId)}`;
}

function changeTankSortOrder() {
  const select = document.getElementById('tank-sort-select');
  tankSortBy = select.value;
  loadPublicTanks(false);
}

function loadMoreTanks() {
  loadPublicTanks(true);
}

function updateTankCount(count) {
  const countEl = document.getElementById('tank-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

// ============================================================================
// POSTS VIEW
// ============================================================================

/**
 * Load posts for the feed
 */
async function loadPosts(append = false) {
  if (isPostsLoading || (allPostsLoaded && append)) return;

  isPostsLoading = true;
  const feed = document.getElementById('posts-feed');
  const loadMoreBtn = document.getElementById('load-more-posts-container');
  const emptyState = document.getElementById('posts-empty');

  if (!append) {
    feed.innerHTML =
      '<div class="community-loading"><p>Loading posts...</p></div>';
    postLastDoc = null;
    allPostsLoaded = false;
  }

  try {
    const result = await window.postManager.getFeedPosts({
      category: postCategory || null,
      sortBy: postSortBy,
      limit: 20,
      lastDoc: append ? postLastDoc : null,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to load posts');
    }

    const posts = result.posts;
    postLastDoc = result.lastDoc;

    if (posts.length < 20) {
      allPostsLoaded = true;
    }

    if (!append) {
      feed.innerHTML = '';
    }

    if (posts.length === 0 && !append) {
      feed.style.display = 'none';
      emptyState.style.display = 'block';
      loadMoreBtn.style.display = 'none';
    } else {
      feed.style.display = '';
      emptyState.style.display = 'none';

      posts.forEach((post) => {
        const card = createPostCard(post);
        feed.appendChild(card);
      });

      loadMoreBtn.style.display = allPostsLoaded ? 'none' : 'flex';
    }
  } catch (error) {
    if (!append) {
      feed.innerHTML = `
        <div class="community-error">
          <p>Unable to load posts.</p>
          <button class="btn btn-ghost" onclick="loadPosts()">Try Again</button>
        </div>
      `;
    }
  } finally {
    isPostsLoading = false;
  }
}

/**
 * Create a post card element
 */
function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  // Header with avatar and meta
  const header = document.createElement('div');
  header.className = 'post-card__header';

  const avatar = document.createElement('div');
  avatar.className = 'post-card__avatar';
  if (post.author?.avatarUrl) {
    const img = document.createElement('img');
    img.src = post.author.avatarUrl;
    img.alt = post.author.username;
    avatar.appendChild(img);
  } else {
    avatar.textContent = (post.author?.username || 'A').charAt(0).toUpperCase();
  }
  header.appendChild(avatar);

  const meta = document.createElement('div');
  meta.className = 'post-card__meta';

  const author = document.createElement('span');
  author.className = 'post-card__author';
  author.textContent = '@' + (post.author?.username || 'anonymous');
  meta.appendChild(author);

  const info = document.createElement('div');
  info.className = 'post-card__info';

  const categoryLabel =
    window.postManager.POST_CATEGORIES[post.category]?.label || post.category;
  const categorySpan = document.createElement('span');
  categorySpan.className = 'post-card__category';
  categorySpan.textContent = categoryLabel;
  info.appendChild(categorySpan);

  const timeSpan = document.createElement('span');
  timeSpan.textContent = formatTimeAgo(post.created);
  info.appendChild(timeSpan);

  meta.appendChild(info);
  header.appendChild(meta);
  card.appendChild(header);

  // Content
  const content = document.createElement('div');
  content.className = 'post-card__content';
  content.textContent = post.content;
  card.appendChild(content);

  // Images (if any)
  if (post.imageUrls && post.imageUrls.length > 0) {
    const images = document.createElement('div');
    images.className = 'post-card__images';

    const count = post.imageUrls.length;
    if (count === 1) images.classList.add('single');
    else if (count === 2) images.classList.add('double');
    else if (count === 3) images.classList.add('triple');
    else images.classList.add('quad');

    post.imageUrls.forEach((url, idx) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Post image ${idx + 1}`;
      img.loading = 'lazy';
      img.onclick = (e) => {
        e.stopPropagation();
        window.open(url, '_blank');
      };
      images.appendChild(img);
    });

    card.appendChild(images);
  }

  // Actions
  const actions = document.createElement('div');
  actions.className = 'post-card__actions';

  const likeBtn = document.createElement('button');
  likeBtn.className = 'post-card__action';
  likeBtn.innerHTML = `<span>&#9825;</span> ${post.stats?.likeCount || 0}`;
  likeBtn.onclick = (e) => {
    e.stopPropagation();
    // Like functionality will be added in Phase 4.2
  };
  actions.appendChild(likeBtn);

  const commentBtn = document.createElement('button');
  commentBtn.className = 'post-card__action';
  commentBtn.innerHTML = `<span>&#128172;</span> ${post.stats?.commentCount || 0}`;
  commentBtn.onclick = (e) => {
    e.stopPropagation();
    viewPostDetail(post.id);
  };
  actions.appendChild(commentBtn);

  card.appendChild(actions);

  // Click card to view detail
  card.onclick = () => viewPostDetail(post.id);

  return card;
}

/**
 * Format timestamp as relative time
 */
function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function viewPostDetail(postId) {
  window.location.href = `post.html?id=${encodeURIComponent(postId)}`;
}

function filterByCategory(category) {
  postCategory = category;

  // Update button states
  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  loadPosts(false);
}

function changePostSortOrder() {
  const select = document.getElementById('post-sort-select');
  postSortBy = select.value;
  loadPosts(false);
}

function loadMorePosts() {
  loadPosts(true);
}

// Expose loadPosts for post-composer.js to call after creating a post
window.loadPosts = loadPosts;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCommunityGallery);
