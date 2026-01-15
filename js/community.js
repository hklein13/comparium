/**
 * Community Page - Posts Feed
 * Phase 4 Full: Social features
 */

// State
let postSortBy = 'newest';
let postCategory = '';
let postLastDoc = null;
let isPostsLoading = false;
let allPostsLoaded = false;

/**
 * Initialize community page on load
 */
async function initCommunityPage() {
  await waitForFirebase();

  // Listen for auth state changes to show/hide new post button
  if (window.firebaseAuthState && window.firebaseAuth) {
    window.firebaseAuthState(window.firebaseAuth, user => {
      const newPostContainer = document.getElementById('new-post-container');
      if (newPostContainer) {
        newPostContainer.style.display = user ? 'flex' : 'none';
      }
    });
  }

  // Load initial posts
  await loadPosts();
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
 * Load posts for the feed
 */
async function loadPosts(append = false) {
  if (isPostsLoading || (allPostsLoaded && append)) return;

  isPostsLoading = true;
  const feed = document.getElementById('posts-feed');
  const loadMoreBtn = document.getElementById('load-more-posts-container');
  const emptyState = document.getElementById('posts-empty');

  if (!append) {
    feed.innerHTML = '<div class="community-loading"><p>Loading posts...</p></div>';
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

      posts.forEach(post => {
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

  const categoryLabel = window.postManager.POST_CATEGORIES[post.category]?.label || post.category;
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

  // Linked tank preview (for tanks category posts)
  if (post.linkedTank) {
    const tankPreview = document.createElement('div');
    tankPreview.className = 'post-card__tank-preview';
    tankPreview.onclick = e => {
      e.stopPropagation();
      window.location.href = `tank.html?id=${encodeURIComponent(post.linkedTank.tankId)}`;
    };

    // Tank photo or placeholder
    const tankImage = document.createElement('div');
    tankImage.className = 'post-card__tank-image';
    if (post.linkedTank.coverPhoto) {
      const img = document.createElement('img');
      img.src = post.linkedTank.coverPhoto;
      img.alt = post.linkedTank.name;
      img.loading = 'lazy';
      tankImage.appendChild(img);
    } else {
      tankImage.classList.add('placeholder');
      tankImage.textContent = post.linkedTank.name.charAt(0).toUpperCase();
    }
    tankPreview.appendChild(tankImage);

    // Tank info
    const tankInfo = document.createElement('div');
    tankInfo.className = 'post-card__tank-info';

    const tankName = document.createElement('span');
    tankName.className = 'post-card__tank-name';
    tankName.textContent = post.linkedTank.name;
    tankInfo.appendChild(tankName);

    const tankStats = document.createElement('span');
    tankStats.className = 'post-card__tank-stats';
    const parts = [];
    if (post.linkedTank.size) {
      const unit = post.linkedTank.sizeUnit === 'liters' ? 'L' : 'gal';
      parts.push(`${post.linkedTank.size}${unit}`);
    }
    if (post.linkedTank.speciesCount > 0) {
      parts.push(`${post.linkedTank.speciesCount} species`);
    }
    if (post.linkedTank.plantCount > 0) {
      parts.push(`${post.linkedTank.plantCount} plants`);
    }
    tankStats.textContent = parts.join(' · ');
    tankInfo.appendChild(tankStats);

    tankPreview.appendChild(tankInfo);

    const viewLink = document.createElement('span');
    viewLink.className = 'post-card__tank-link';
    viewLink.textContent = 'View Tank →';
    tankPreview.appendChild(viewLink);

    card.appendChild(tankPreview);
  }

  // Images (if any) - skip for tank posts since we show the tank preview
  if (post.imageUrls && post.imageUrls.length > 0 && !post.linkedTank) {
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
      img.onclick = e => {
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
  likeBtn.innerHTML = `<span class="like-icon">&#9825;</span> <span class="like-count">${post.stats?.likeCount || 0}</span>`;
  likeBtn.onclick = async e => {
    e.stopPropagation();

    if (!window.firebaseAuth?.currentUser) {
      window.location.href = 'login.html';
      return;
    }

    const result = await window.socialManager.togglePostLike(post.id);
    if (result.success) {
      const countSpan = likeBtn.querySelector('.like-count');
      const iconSpan = likeBtn.querySelector('.like-icon');
      let count = parseInt(countSpan.textContent) || 0;

      if (result.liked) {
        count++;
        iconSpan.innerHTML = '&#9829;';
        likeBtn.classList.add('liked');
      } else {
        count = Math.max(0, count - 1);
        iconSpan.innerHTML = '&#9825;';
        likeBtn.classList.remove('liked');
      }

      countSpan.textContent = count;
    }
  };
  actions.appendChild(likeBtn);

  const commentBtn = document.createElement('button');
  commentBtn.className = 'post-card__action';
  commentBtn.innerHTML = `<span>&#128172;</span> ${post.stats?.commentCount || 0}`;
  commentBtn.onclick = e => {
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
  document.querySelectorAll('.category-btn').forEach(btn => {
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
document.addEventListener('DOMContentLoaded', initCommunityPage);
