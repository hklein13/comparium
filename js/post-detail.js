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
    await renderPost(currentPost);

    // Update page title
    document.title = `Post by @${currentPost.author?.username || 'anonymous'} | Comparium`;

    // Load comments after post loads
    loadComments(postId);
  } catch (error) {
    showError('Failed to load post');
  }
}

/**
 * Render post content
 */
async function renderPost(post) {
  const container = document.getElementById('post-container');
  const categoryLabel =
    window.postManager?.POST_CATEGORIES?.[post.category]?.label || post.category;

  let imagesHTML = '';
  if (post.imageUrls && post.imageUrls.length > 0 && !post.linkedTank) {
    // Only show images section if no linked tank (tank posts show tank preview instead)
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
          <img src="${url}" alt="Post image ${i + 1}" onclick="window.open('${url.replace(/'/g, "\\'")}', '_blank')">
        `
          )
          .join('')}
      </div>
    `;
  }

  // Build linked tank preview HTML
  let linkedTankHTML = '';
  if (post.linkedTank) {
    const tank = post.linkedTank;

    // Fetch fresh tank data BEFORE rendering to avoid photo flash
    let freshCoverPhoto = tank.coverPhoto;
    if (tank.tankId && window.firebaseFirestore) {
      try {
        const { doc, getDoc } = await import(
          'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
        );
        const tankDoc = await getDoc(doc(window.firebaseFirestore, 'publicTanks', tank.tankId));
        if (tankDoc.exists() && tankDoc.data().coverPhoto) {
          freshCoverPhoto = tankDoc.data().coverPhoto;
        }
      } catch (error) {
        console.error('Error fetching fresh tank photo:', error);
      }
    }

    const tankStats = [];
    if (tank.size) {
      const unit = tank.sizeUnit === 'liters' ? 'L' : 'gal';
      tankStats.push(`${tank.size}${unit}`);
    }
    if (tank.speciesCount > 0) tankStats.push(`${tank.speciesCount} species`);
    if (tank.plantCount > 0) tankStats.push(`${tank.plantCount} plants`);

    linkedTankHTML = `
      <div class="post-detail__tank-preview" onclick="window.location.href='tank.html?id=${encodeURIComponent(tank.tankId)}'">
        <div class="post-detail__tank-image">
          ${
            freshCoverPhoto
              ? `<img src="${freshCoverPhoto}" alt="${escapeHtml(tank.name || 'Tank')}">`
              : `<div class="post-detail__tank-placeholder">${(tank.name || 'T').charAt(0).toUpperCase()}</div>`
          }
        </div>
        <div class="post-detail__tank-info">
          <span class="post-detail__tank-name">${escapeHtml(tank.name || 'Unnamed Tank')}</span>
          <span class="post-detail__tank-stats">${tankStats.join(' · ')}</span>
        </div>
        <span class="post-detail__tank-link">View Tank &rarr;</span>
      </div>
    `;
  }

  const safeUsername = (post.author?.username || '').replace(/[^a-zA-Z0-9_]/g, '');

  // Check if current user is the post owner
  const currentUserId = window.firebaseAuth?.currentUser?.uid;
  const isOwner = currentUserId && currentUserId === post.userId;
  const deleteButtonHTML = isOwner
    ? `<button class="post-detail__delete" onclick="deleteCurrentPost('${post.id}')" title="Delete post">Delete</button>`
    : '';

  // Check if current user has liked this post
  let hasLiked = false;
  if (currentUserId && window.socialManager) {
    hasLiked = await window.socialManager.hasLikedPost(post.id);
  }
  const likeIcon = hasLiked ? '&#9829;' : '&#9825;';
  const likedClass = hasLiked ? 'liked' : '';

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
        ${deleteButtonHTML}
      </div>

      <div class="post-detail__content">
        ${escapeHtml(post.content)}
      </div>

      ${imagesHTML}

      ${linkedTankHTML}

      <div class="post-detail__actions">
        <button class="post-detail__action ${likedClass}" onclick="togglePostLike('${post.id}', this)">
          <span class="like-icon">${likeIcon}</span> <span class="like-count">${post.stats?.likeCount || 0}</span> likes
        </button>
        <span class="post-detail__action">
          <span>&#128172;</span> ${post.stats?.commentCount || 0} comments
        </span>
      </div>

      <!-- Comments Section -->
      <section id="comments-section" class="comments-section">
        <p class="comments-loading">Loading comments...</p>
      </section>
    </article>

    <a href="community.html" class="back-link">&larr; Back to feed</a>
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
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('post-container');
  container.innerHTML = `
    <div class="community-error">
      <h3>Error</h3>
      <p>${message}</p>
      <a href="community.html" class="btn btn-primary">Back to feed</a>
    </div>
  `;
}

/**
 * Load and render comments for the current post
 */
async function loadComments(postId) {
  const commentsSection = document.getElementById('comments-section');
  if (!commentsSection) return;

  commentsSection.innerHTML = '<p class="comments-loading">Loading comments...</p>';

  const result = await window.commentManager.getComments(postId);

  if (!result.success) {
    commentsSection.innerHTML = '<p class="comments-error">Failed to load comments.</p>';
    return;
  }

  await renderComments(result.comments, postId);
}

/**
 * Render comments list
 */
async function renderComments(comments, postId) {
  const commentsSection = document.getElementById('comments-section');
  const currentUserId = window.firebaseAuth?.currentUser?.uid;

  const commentCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  let html = `
    <div class="comments-header">
      <h3>Comments (${commentCount})</h3>
    </div>
  `;

  // Comment input (only for logged-in users)
  html += `
    <div id="comment-input-container" class="comment-input-container" style="display: none;">
      <textarea id="comment-input" class="comment-input" placeholder="Add a comment..." maxlength="1000"></textarea>
      <button id="submit-comment-btn" class="btn btn-primary btn-small" onclick="submitComment('${postId}')">Post</button>
    </div>
  `;

  if (comments.length === 0) {
    html += '<p class="comments-empty">No comments yet. Be the first!</p>';
  } else {
    html += '<div class="comments-list">';
    for (const comment of comments) {
      html += await renderComment(comment, postId, false, currentUserId);
    }
    html += '</div>';
  }

  commentsSection.innerHTML = html;

  // Show comment input if logged in
  if (currentUserId) {
    document.getElementById('comment-input-container').style.display = 'flex';
  }
}

/**
 * Render a single comment with its replies
 */
async function renderComment(comment, postId, isReply = false, currentUserId = null) {
  const safeUsername = (comment.author?.username || 'anonymous').replace(/[^a-zA-Z0-9_]/g, '');
  const encodedUsername = encodeURIComponent(comment.author?.username || 'anonymous');
  const timeAgo = window.commentManager.formatTimeAgo(comment.created);
  const likeCount = comment.stats?.likeCount || 0;

  // Check if current user has liked this comment
  let hasLiked = false;
  if (currentUserId && window.socialManager) {
    hasLiked = await window.socialManager.hasLikedComment(comment.id);
  }
  const likeIcon = hasLiked ? '&#9829;' : '&#9825;';
  const likedClass = hasLiked ? 'liked' : '';

  // Check if current user is the comment owner
  const isOwner = currentUserId && currentUserId === comment.userId;
  const deleteButtonHTML = isOwner
    ? `<button class="comment__action comment__action--delete" onclick="deleteComment('${comment.id}')">Delete</button>`
    : '';

  let html = `
    <div class="comment ${isReply ? 'comment--reply' : ''}" data-comment-id="${comment.id}">
      <div class="comment__header">
        <div class="comment__avatar">
          ${
            comment.author?.avatarUrl
              ? `<img src="${comment.author.avatarUrl}" alt="${safeUsername}">`
              : safeUsername.charAt(0).toUpperCase()
          }
        </div>
        <div class="comment__meta">
          <a href="profile.html?user=${encodedUsername}" class="comment__author">@${safeUsername}</a>
          <span class="comment__time">${timeAgo}</span>
        </div>
      </div>
      <div class="comment__content">${escapeHtml(comment.content)}</div>
      <div class="comment__actions">
        <button class="comment__action ${likedClass}" onclick="toggleCommentLike('${comment.id}', this)">
          <span class="like-icon">${likeIcon}</span> <span class="like-count">${likeCount}</span>
        </button>
        ${!isReply ? `<button class="comment__action" onclick="showReplyInput('${comment.id}')">Reply</button>` : ''}
        ${deleteButtonHTML}
      </div>
      <div id="reply-input-${comment.id}" class="reply-input-container" style="display: none;">
        <textarea class="comment-input comment-input--reply" placeholder="Write a reply..." maxlength="1000"></textarea>
        <button class="btn btn-ghost btn-small" onclick="submitReply('${postId}', '${comment.id}')">Reply</button>
      </div>
  `;

  // Render replies
  if (comment.replies && comment.replies.length > 0) {
    html += '<div class="comment__replies">';
    for (const reply of comment.replies) {
      html += await renderComment(reply, postId, true, currentUserId);
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Submit a new top-level comment
 */
async function submitComment(postId) {
  const input = document.getElementById('comment-input');
  const content = input.value.trim();

  if (!content) return;

  const btn = document.getElementById('submit-comment-btn');
  btn.disabled = true;
  btn.textContent = 'Posting...';

  const result = await window.commentManager.createComment(postId, content);

  if (result.success) {
    input.value = '';
    await loadComments(postId);
  } else {
    alert(result.error || 'Failed to post comment');
  }

  btn.disabled = false;
  btn.textContent = 'Post';
}

/**
 * Show reply input for a comment
 */
function showReplyInput(commentId) {
  const container = document.getElementById(`reply-input-${commentId}`);
  if (container) {
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
    if (container.style.display === 'flex') {
      container.querySelector('textarea').focus();
    }
  }
}

/**
 * Submit a reply to a comment
 */
async function submitReply(postId, parentCommentId) {
  const container = document.getElementById(`reply-input-${parentCommentId}`);
  const textarea = container.querySelector('textarea');
  const content = textarea.value.trim();

  if (!content) return;

  const btn = container.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Posting...';

  const result = await window.commentManager.createComment(postId, content, parentCommentId);

  if (result.success) {
    textarea.value = '';
    container.style.display = 'none';
    await loadComments(postId);
  } else {
    alert(result.error || 'Failed to post reply');
  }

  btn.disabled = false;
  btn.textContent = 'Reply';
}

/**
 * Toggle like on a comment
 */
async function toggleCommentLike(commentId, buttonElement) {
  // Prevent race conditions - disable button during async operation
  if (buttonElement.disabled) return;
  buttonElement.disabled = true;

  try {
    const result = await window.socialManager.toggleCommentLike(commentId);

    if (result.success) {
      const countSpan = buttonElement.querySelector('.like-count');
      const iconSpan = buttonElement.querySelector('.like-icon');
      let count = parseInt(countSpan.textContent) || 0;

      if (result.liked) {
        count++;
        iconSpan.innerHTML = '&#9829;'; // Filled heart
        buttonElement.classList.add('liked');
      } else {
        count = Math.max(0, count - 1);
        iconSpan.innerHTML = '&#9825;'; // Empty heart
        buttonElement.classList.remove('liked');
      }

      countSpan.textContent = count;
    }
  } finally {
    buttonElement.disabled = false;
  }
}

/**
 * Toggle like on the current post
 */
async function togglePostLike(postId, buttonElement) {
  // Prevent race conditions - disable button during async operation
  if (buttonElement.disabled) return;
  buttonElement.disabled = true;

  try {
    const result = await window.socialManager.togglePostLike(postId);

    if (result.success) {
      const countSpan = buttonElement.querySelector('.like-count');
      const iconSpan = buttonElement.querySelector('.like-icon');
      let count = parseInt(countSpan.textContent) || 0;

      if (result.liked) {
        count++;
        iconSpan.innerHTML = '&#9829;'; // Filled heart
        buttonElement.classList.add('liked');
      } else {
        count = Math.max(0, count - 1);
        iconSpan.innerHTML = '&#9825;'; // Empty heart
        buttonElement.classList.remove('liked');
      }

      countSpan.textContent = count;
    }
  } finally {
    buttonElement.disabled = false;
  }
}

/**
 * Delete the current post (owner only)
 */
async function deleteCurrentPost(postId) {
  if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
    return;
  }

  const result = await window.postManager.deletePost(postId);

  if (result.success) {
    alert('Post deleted successfully');
    window.location.href = 'community.html';
  } else {
    alert(result.error || 'Failed to delete post');
  }
}

/**
 * Delete a comment (owner only)
 */
async function deleteComment(commentId) {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  const result = await window.commentManager.deleteComment(commentId);

  if (result.success) {
    // Reload comments to reflect the deletion
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    if (postId) {
      await loadComments(postId);
    }
  } else {
    alert(result.error || 'Failed to delete comment');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initPostDetail);
