/**
 * Post Detail Page - View single post
 * Phase 4 Full: Social features
 */

let currentPost = null;

/**
 * Initialize post detail page
 */
async function initPostDetail() {
  // Wait for Firebase
  await waitForFirebase();

  // Get post ID from URL
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  if (!postId) {
    showError('No post specified');
    return;
  }

  await loadPost(postId);
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
 * Load and display post
 */
async function loadPost(postId) {
  try {
    const result = await window.postManager.getPost(postId);

    if (!result.success || !result.post) {
      showError(result.error || 'Post not found');
      return;
    }

    currentPost = result.post;
    renderPost(currentPost);

    // Update page title
    document.title = `Post by @${currentPost.author?.username || 'anonymous'} | Comparium`;
  } catch (error) {
    showError('Failed to load post');
  }
}

/**
 * Render post content
 */
function renderPost(post) {
  const container = document.getElementById('post-container');
  const categoryLabel =
    window.postManager?.POST_CATEGORIES?.[post.category]?.label || post.category;

  let imagesHTML = '';
  if (post.imageUrls && post.imageUrls.length > 0) {
    const imageClass =
      post.imageUrls.length === 1
        ? 'single'
        : post.imageUrls.length === 2
          ? 'double'
          : post.imageUrls.length === 3
            ? 'triple'
            : 'quad';
    imagesHTML = `
      <div class="post-detail__images ${imageClass}">
        ${post.imageUrls
          .map(
            (url, i) => `
          <img src="${url}" alt="Post image ${i + 1}" onclick="window.open('${url}', '_blank')">
        `
          )
          .join('')}
      </div>
    `;
  }

  const safeUsername = (post.author?.username || '').replace(
    /[^a-zA-Z0-9_]/g,
    ''
  );

  container.innerHTML = `
    <article class="post-detail">
      <div class="post-detail__header">
        <div class="post-card__avatar">
          ${
            post.author?.avatarUrl
              ? `<img src="${post.author.avatarUrl}" alt="${safeUsername}">`
              : (post.author?.username || 'A').charAt(0).toUpperCase()
          }
        </div>
        <div class="post-detail__meta">
          <a href="profile.html?user=${encodeURIComponent(post.author?.username || '')}" class="post-detail__author">
            @${safeUsername || 'anonymous'}
          </a>
          <div class="post-detail__info">
            <span class="post-card__category">${categoryLabel}</span>
            <span>${formatDate(post.created)}</span>
          </div>
        </div>
      </div>

      <div class="post-detail__content">
        ${escapeHtml(post.content)}
      </div>

      ${imagesHTML}

      <div class="post-detail__actions">
        <button class="post-card__action" onclick="handleLike()">
          <span>&#9825;</span> ${post.stats?.likeCount || 0} likes
        </button>
        <span class="post-card__action">
          <span>&#128172;</span> ${post.stats?.commentCount || 0} comments
        </span>
      </div>

      <div class="post-detail__comments">
        <h3>Comments</h3>
        <p class="comments-placeholder">Comments coming in Phase 4.2</p>
      </div>
    </article>

    <a href="community.html" class="back-link">&larr; Back to Community</a>
  `;
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

/**
 * Handle like button click (placeholder)
 */
function handleLike() {
  alert('Likes coming in Phase 4.2!');
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('post-container');
  container.innerHTML = `
    <div class="community-error">
      <h3>Error</h3>
      <p>${message}</p>
      <a href="community.html" class="btn btn-primary">Back to Community</a>
    </div>
  `;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initPostDetail);
