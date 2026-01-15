# Phase 4.2: Comments & Likes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to comment on posts (with threaded replies) and like posts/comments.

**Architecture:** Comments stored in top-level `comments` collection with postId reference. Likes use compound document IDs (`{userId}_{targetId}_{targetType}`) to prevent duplicates. Cloud Functions maintain denormalized counts on posts/comments.

**Tech Stack:** Firebase Firestore, Firebase Cloud Functions (Node.js), Vanilla JavaScript, Playwright tests

---

## Task 1: Add Comments Collection Security Rules

**Files:**
- Modify: `firestore.rules`

**Step 1: Add comments security rules**

Add after the posts rules section (around line 248):

```javascript
    // Comments on posts
    match /comments/{commentId} {
      // Anyone can read comments on public posts
      allow read: if true;

      // Authenticated users can create comments
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.postId is string
                    && request.resource.data.content is string
                    && request.resource.data.content.size() > 0
                    && request.resource.data.content.size() <= 1000;

      // Only owner can update/delete their comments
      allow update, delete: if request.auth != null
                            && resource.data.userId == request.auth.uid;
    }
```

**Step 2: Verify rules syntax**

Run: `npm run test:rules`
Expected: PASS (rules parse correctly)

**Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(comments): add security rules for comments collection"
```

---

## Task 2: Add Likes Collection Security Rules

**Files:**
- Modify: `firestore.rules`

**Step 1: Add likes security rules**

Add after the comments rules:

```javascript
    // Likes on posts and comments
    // Document ID format: {userId}_{targetId}_{targetType}
    match /likes/{likeId} {
      // Anyone can read likes
      allow read: if true;

      // User can only create likes with their own userId prefix
      allow create: if request.auth != null
                    && likeId.matches(request.auth.uid + '_.*');

      // User can only delete their own likes
      allow delete: if request.auth != null
                    && likeId.matches(request.auth.uid + '_.*');

      // No updates allowed (likes are create/delete only)
      allow update: if false;
    }
```

**Step 2: Verify rules syntax**

Run: `npm run test:rules`
Expected: PASS

**Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(likes): add security rules for likes collection"
```

---

## Task 3: Add Firestore Indexes for Comments

**Files:**
- Modify: `firestore.indexes.json`

**Step 1: Add comment indexes**

Add to the `indexes` array:

```json
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "postId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "postId", "order": "ASCENDING" },
        { "fieldPath": "replyTo", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    }
```

**Step 2: Verify JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json')); console.log('Valid JSON')"`
Expected: "Valid JSON"

**Step 3: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat(comments): add Firestore indexes for comment queries"
```

---

## Task 4: Add Firestore Indexes for Likes

**Files:**
- Modify: `firestore.indexes.json`

**Step 1: Add like indexes**

Add to the `indexes` array:

```json
    {
      "collectionGroup": "likes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetId", "order": "ASCENDING" },
        { "fieldPath": "targetType", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "likes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    }
```

**Step 2: Verify JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json')); console.log('Valid JSON')"`
Expected: "Valid JSON"

**Step 3: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat(likes): add Firestore indexes for like queries"
```

---

## Task 5: Deploy Rules and Indexes

**Files:**
- None (deployment only)

**Step 1: Deploy Firestore rules**

Run: `firebase deploy --only firestore:rules`
Expected: "Deploy complete!"

**Step 2: Deploy Firestore indexes**

Run: `firebase deploy --only firestore:indexes`
Expected: Indexes start building (may take a few minutes)

**Step 3: Commit (if any changes were made)**

No commit needed for deployment step.

---

## Task 6: Create Comment Manager - Firebase Functions

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add comment Firestore functions**

Add after the post functions (around line 910):

```javascript
// ============================================================================
// COMMENTS - Firestore Operations
// ============================================================================

/**
 * Create a new comment on a post
 * @param {string} postId - Post to comment on
 * @param {string} content - Comment text (1-1000 chars)
 * @param {string|null} replyTo - Parent comment ID for replies (null for top-level)
 * @returns {Promise<{success: boolean, commentId?: string, error?: string}>}
 */
window.firestoreCreateComment = async (postId, content, replyTo = null) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };

  const user = auth?.currentUser;
  if (!user) return { success: false, error: 'Must be logged in to comment' };

  if (!postId) return { success: false, error: 'Post ID required' };
  if (!content || content.trim().length === 0) return { success: false, error: 'Comment cannot be empty' };
  if (content.length > 1000) return { success: false, error: 'Comment too long (max 1000 characters)' };

  try {
    const { collection, addDoc, Timestamp } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    // Get user profile for author info
    const profile = await window.firestoreGetProfile(user.uid);
    const username = profile?.profile?.username || 'anonymous';
    const avatarUrl = profile?.profile?.avatarUrl || null;

    const now = Timestamp.now();
    const commentData = {
      postId: postId,
      userId: user.uid,
      content: content.trim(),
      replyTo: replyTo,
      replyCount: 0,
      stats: {
        likeCount: 0
      },
      author: {
        username: username,
        avatarUrl: avatarUrl
      },
      created: now,
      updated: now
    };

    const docRef = await addDoc(collection(firestore, 'comments'), commentData);
    return { success: true, commentId: docRef.id };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to create comment' };
  }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, comments?: Array, error?: string}>}
 */
window.firestoreGetPostComments = async (postId) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };
  if (!postId) return { success: false, error: 'Post ID required' };

  try {
    const { collection, query, where, orderBy, getDocs } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    const q = query(
      collection(firestore, 'comments'),
      where('postId', '==', postId),
      orderBy('created', 'asc')
    );

    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created: doc.data().created?.toDate?.()?.toISOString() || null,
      updated: doc.data().updated?.toDate?.()?.toISOString() || null
    }));

    return { success: true, comments };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to load comments' };
  }
};

/**
 * Delete a comment (owner only)
 * @param {string} commentId - Comment ID to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.firestoreDeleteComment = async (commentId) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };

  const user = auth?.currentUser;
  if (!user) return { success: false, error: 'Must be logged in' };
  if (!commentId) return { success: false, error: 'Comment ID required' };

  try {
    const { doc, getDoc, deleteDoc } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    const commentRef = doc(firestore, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return { success: false, error: 'Comment not found' };
    }

    if (commentSnap.data().userId !== user.uid) {
      return { success: false, error: 'Not authorized to delete this comment' };
    }

    await deleteDoc(commentRef);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to delete comment' };
  }
};
```

**Step 2: Verify no syntax errors**

Run: `npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(comments): add Firestore functions for comment CRUD"
```

---

## Task 7: Create Like Manager - Firebase Functions

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add like Firestore functions**

Add after the comment functions:

```javascript
// ============================================================================
// LIKES - Firestore Operations
// ============================================================================

/**
 * Like a post or comment
 * @param {string} targetId - Post or comment ID
 * @param {string} targetType - "post" or "comment"
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.firestoreLike = async (targetId, targetType) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };

  const user = auth?.currentUser;
  if (!user) return { success: false, error: 'Must be logged in to like' };

  if (!targetId) return { success: false, error: 'Target ID required' };
  if (!['post', 'comment'].includes(targetType)) {
    return { success: false, error: 'Invalid target type' };
  }

  try {
    const { doc, setDoc, Timestamp } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    // Compound ID prevents duplicate likes
    const likeId = `${user.uid}_${targetId}_${targetType}`;
    const likeRef = doc(firestore, 'likes', likeId);

    await setDoc(likeRef, {
      userId: user.uid,
      targetId: targetId,
      targetType: targetType,
      created: Timestamp.now()
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to like' };
  }
};

/**
 * Unlike a post or comment
 * @param {string} targetId - Post or comment ID
 * @param {string} targetType - "post" or "comment"
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.firestoreUnlike = async (targetId, targetType) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };

  const user = auth?.currentUser;
  if (!user) return { success: false, error: 'Must be logged in' };

  if (!targetId) return { success: false, error: 'Target ID required' };
  if (!['post', 'comment'].includes(targetType)) {
    return { success: false, error: 'Invalid target type' };
  }

  try {
    const { doc, deleteDoc } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    const likeId = `${user.uid}_${targetId}_${targetType}`;
    const likeRef = doc(firestore, 'likes', likeId);

    await deleteDoc(likeRef);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to unlike' };
  }
};

/**
 * Check if current user has liked a target
 * @param {string} targetId - Post or comment ID
 * @param {string} targetType - "post" or "comment"
 * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
 */
window.firestoreHasLiked = async (targetId, targetType) => {
  if (!firestore) return { success: false, error: 'Database not initialized' };

  const user = auth?.currentUser;
  if (!user) return { success: true, liked: false }; // Not logged in = not liked

  if (!targetId || !targetType) return { success: true, liked: false };

  try {
    const { doc, getDoc } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    const likeId = `${user.uid}_${targetId}_${targetType}`;
    const likeRef = doc(firestore, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);

    return { success: true, liked: likeSnap.exists() };
  } catch (e) {
    return { success: false, error: e.message || 'Failed to check like status' };
  }
};

/**
 * Toggle like on a post or comment
 * @param {string} targetId - Post or comment ID
 * @param {string} targetType - "post" or "comment"
 * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
 */
window.firestoreToggleLike = async (targetId, targetType) => {
  const hasLiked = await window.firestoreHasLiked(targetId, targetType);
  if (!hasLiked.success) return hasLiked;

  if (hasLiked.liked) {
    const result = await window.firestoreUnlike(targetId, targetType);
    return { ...result, liked: false };
  } else {
    const result = await window.firestoreLike(targetId, targetType);
    return { ...result, liked: true };
  }
};
```

**Step 2: Verify no syntax errors**

Run: `npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(likes): add Firestore functions for like/unlike toggle"
```

---

## Task 8: Create Comment Manager Module

**Files:**
- Create: `js/comment-manager.js`

**Step 1: Create comment-manager.js**

```javascript
/**
 * Comment Manager
 * Phase 4.2: Handle comments on community posts
 *
 * Provides high-level API for comment operations.
 * Uses firebase-init.js for Firestore operations.
 */

window.commentManager = {
  /**
   * Create a new comment on a post
   * @param {string} postId - Post to comment on
   * @param {string} content - Comment text
   * @param {string|null} replyTo - Parent comment ID for replies
   * @returns {Promise<{success: boolean, commentId?: string, error?: string}>}
   */
  async createComment(postId, content, replyTo = null) {
    return window.firestoreCreateComment(postId, content, replyTo);
  },

  /**
   * Get all comments for a post (organized for threaded display)
   * @param {string} postId - Post ID
   * @returns {Promise<{success: boolean, comments?: Array, error?: string}>}
   */
  async getComments(postId) {
    const result = await window.firestoreGetPostComments(postId);
    if (!result.success) return result;

    // Organize into threaded structure
    const topLevel = [];
    const replies = {};

    result.comments.forEach(comment => {
      if (comment.replyTo) {
        if (!replies[comment.replyTo]) {
          replies[comment.replyTo] = [];
        }
        replies[comment.replyTo].push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    // Attach replies to their parent comments
    topLevel.forEach(comment => {
      comment.replies = replies[comment.id] || [];
    });

    return { success: true, comments: topLevel };
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteComment(commentId) {
    return window.firestoreDeleteComment(commentId);
  },

  /**
   * Format relative time for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted time (e.g., "2h ago")
   */
  formatTimeAgo(dateStr) {
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
};
```

**Step 2: Verify no syntax errors**

Run: `npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add js/comment-manager.js
git commit -m "feat(comments): add comment-manager.js module"
```

---

## Task 9: Create Social Manager Module (Likes)

**Files:**
- Create: `js/social-manager.js`

**Step 1: Create social-manager.js**

```javascript
/**
 * Social Manager
 * Phase 4.2: Handle likes on posts and comments
 * Phase 4.3: Will add follows and bookmarks
 *
 * Provides high-level API for social interactions.
 */

window.socialManager = {
  /**
   * Toggle like on a post
   * @param {string} postId - Post ID
   * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
   */
  async togglePostLike(postId) {
    return window.firestoreToggleLike(postId, 'post');
  },

  /**
   * Toggle like on a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
   */
  async toggleCommentLike(commentId) {
    return window.firestoreToggleLike(commentId, 'comment');
  },

  /**
   * Check if current user has liked a post
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async hasLikedPost(postId) {
    const result = await window.firestoreHasLiked(postId, 'post');
    return result.success && result.liked;
  },

  /**
   * Check if current user has liked a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<boolean>}
   */
  async hasLikedComment(commentId) {
    const result = await window.firestoreHasLiked(commentId, 'comment');
    return result.success && result.liked;
  }
};
```

**Step 2: Verify no syntax errors**

Run: `npm run lint`
Expected: 0 errors

**Step 3: Commit**

```bash
git add js/social-manager.js
git commit -m "feat(likes): add social-manager.js module for like operations"
```

---

## Task 10: Update Post Detail Page - Comments Section HTML

**Files:**
- Modify: `post.html`

**Step 1: Add script tags for new managers**

Add before `</body>`:

```html
    <script src="js/comment-manager.js"></script>
    <script src="js/social-manager.js"></script>
```

**Step 2: Verify HTML loads**

Run: `http-server -c-1` and open `http://localhost:8080/post.html?id=test`
Expected: Page loads (may show "Post not found" - that's OK)

**Step 3: Commit**

```bash
git add post.html
git commit -m "feat(post): add comment and social manager scripts"
```

---

## Task 11: Update Post Detail JS - Comments Loading

**Files:**
- Modify: `js/post-detail.js`

**Step 1: Add loadComments function**

Add after the existing loadPost function:

```javascript
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

  renderComments(result.comments, postId);
}

/**
 * Render comments list
 */
function renderComments(comments, postId) {
  const commentsSection = document.getElementById('comments-section');

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
    comments.forEach(comment => {
      html += renderComment(comment, postId);
    });
    html += '</div>';
  }

  commentsSection.innerHTML = html;

  // Show comment input if logged in
  if (window.firebaseAuth?.currentUser) {
    document.getElementById('comment-input-container').style.display = 'flex';
  }
}

/**
 * Render a single comment with its replies
 */
function renderComment(comment, postId, isReply = false) {
  const safeUsername = (comment.author?.username || 'anonymous').replace(/[^a-zA-Z0-9_]/g, '');
  const timeAgo = window.commentManager.formatTimeAgo(comment.created);
  const likeCount = comment.stats?.likeCount || 0;

  let html = `
    <div class="comment ${isReply ? 'comment--reply' : ''}" data-comment-id="${comment.id}">
      <div class="comment__header">
        <div class="comment__avatar">
          ${comment.author?.avatarUrl
            ? `<img src="${comment.author.avatarUrl}" alt="${safeUsername}">`
            : safeUsername.charAt(0).toUpperCase()}
        </div>
        <div class="comment__meta">
          <a href="profile.html?user=${safeUsername}" class="comment__author">@${safeUsername}</a>
          <span class="comment__time">${timeAgo}</span>
        </div>
      </div>
      <div class="comment__content">${escapeHtml(comment.content)}</div>
      <div class="comment__actions">
        <button class="comment__action" onclick="toggleCommentLike('${comment.id}', this)">
          <span class="like-icon">&#9825;</span> <span class="like-count">${likeCount}</span>
        </button>
        ${!isReply ? `<button class="comment__action" onclick="showReplyInput('${comment.id}')">Reply</button>` : ''}
      </div>
      <div id="reply-input-${comment.id}" class="reply-input-container" style="display: none;">
        <textarea class="comment-input comment-input--reply" placeholder="Write a reply..." maxlength="1000"></textarea>
        <button class="btn btn-ghost btn-small" onclick="submitReply('${postId}', '${comment.id}')">Reply</button>
      </div>
  `;

  // Render replies
  if (comment.replies && comment.replies.length > 0) {
    html += '<div class="comment__replies">';
    comment.replies.forEach(reply => {
      html += renderComment(reply, postId, true);
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**Step 2: Add comment interaction functions**

Add after the render functions:

```javascript
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
}
```

**Step 3: Update loadPost to call loadComments**

Find the existing `loadPost` function and add at the end (before the closing brace):

```javascript
  // Load comments after post loads
  loadComments(postId);
```

**Step 4: Verify no syntax errors**

Run: `npm run lint`
Expected: 0 errors

**Step 5: Commit**

```bash
git add js/post-detail.js
git commit -m "feat(comments): add comment rendering and interaction functions"
```

---

## Task 12: Update Post Detail HTML - Comments Container

**Files:**
- Modify: `post.html`

**Step 1: Add comments section container**

Find the main content area and add after the post content:

```html
      <!-- Comments Section -->
      <section id="comments-section" class="comments-section">
        <p class="comments-loading">Loading comments...</p>
      </section>
```

**Step 2: Commit**

```bash
git add post.html
git commit -m "feat(post): add comments section container"
```

---

## Task 13: Add Post Like Button to Detail Page

**Files:**
- Modify: `js/post-detail.js`

**Step 1: Add like button to post actions**

Find where post actions are rendered and update to include functional like button:

```javascript
/**
 * Toggle like on the current post
 */
async function togglePostLike(postId, buttonElement) {
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
}
```

**Step 2: Update post rendering to use like button**

In the post rendering section, update the like action:

```javascript
    <button class="post-detail__action" onclick="togglePostLike('${post.id}', this)">
      <span class="like-icon">&#9825;</span> <span class="like-count">${post.stats?.likeCount || 0}</span>
    </button>
```

**Step 3: Commit**

```bash
git add js/post-detail.js
git commit -m "feat(likes): add functional like button to post detail"
```

---

## Task 14: Add Like Button to Post Cards in Feed

**Files:**
- Modify: `js/community.js`

**Step 1: Update createPostCard function**

Find the like button in the `createPostCard` function and update:

```javascript
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
```

**Step 2: Add social-manager.js script to community.html**

Add before `</body>`:

```html
    <script src="js/social-manager.js"></script>
```

**Step 3: Commit**

```bash
git add js/community.js community.html
git commit -m "feat(likes): add functional like button to post cards in feed"
```

---

## Task 15: Add Comments/Likes CSS Styles

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add comment styles**

Add to the end of the CSS file:

```css
/* ============================================================================
   COMMENTS - Phase 4.2
   ============================================================================ */

.comments-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.comments-header {
  margin-bottom: 1rem;
}

.comments-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ink);
}

.comments-loading,
.comments-empty,
.comments-error {
  color: var(--ink-secondary);
  font-style: italic;
  padding: 1rem 0;
}

.comment-input-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.comment-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  min-height: 60px;
  max-height: 200px;
}

.comment-input:focus {
  outline: none;
  border-color: var(--forest);
}

.comment-input--reply {
  min-height: 40px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment {
  padding: 1rem;
  background: var(--stone);
  border-radius: 8px;
}

.comment--reply {
  margin-left: 2rem;
  background: var(--ivory);
  border-left: 2px solid var(--border);
}

.comment__header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--forest);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
}

.comment__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment__meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.comment__author {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  font-size: 0.875rem;
}

.comment__author:hover {
  color: var(--forest);
}

.comment__time {
  font-size: 0.75rem;
  color: var(--ink-secondary);
}

.comment__content {
  color: var(--ink);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment__actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.comment__action {
  background: none;
  border: none;
  color: var(--ink-secondary);
  cursor: pointer;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.comment__action:hover {
  color: var(--forest);
}

.comment__action.liked {
  color: #e74c3c;
}

.comment__action.liked .like-icon {
  color: #e74c3c;
}

.comment__replies {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reply-input-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: flex-start;
}

/* Like button states */
.post-card__action.liked,
.post-detail__action.liked {
  color: #e74c3c;
}

.post-card__action.liked .like-icon,
.post-detail__action.liked .like-icon {
  color: #e74c3c;
}

.like-icon {
  transition: transform 0.15s ease;
}

.post-card__action:active .like-icon,
.post-detail__action:active .like-icon,
.comment__action:active .like-icon {
  transform: scale(1.2);
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "feat(styles): add CSS for comments and like buttons"
```

---

## Task 16: Create Cloud Function for Comment Counts

**Files:**
- Modify: `functions/index.js`

**Step 1: Add onCommentWrite Cloud Function**

Add to the Cloud Functions file:

```javascript
const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Update post commentCount when comment is created
 */
exports.onCommentCreated = onDocumentCreated('comments/{commentId}', async event => {
  const comment = event.data.data();
  const postId = comment.postId;

  if (!postId) return;

  const db = admin.firestore();
  const postRef = db.collection('posts').doc(postId);

  await postRef.update({
    'stats.commentCount': FieldValue.increment(1)
  });

  // If this is a reply, increment replyCount on parent comment
  if (comment.replyTo) {
    const parentRef = db.collection('comments').doc(comment.replyTo);
    await parentRef.update({
      replyCount: FieldValue.increment(1)
    });
  }
});

/**
 * Update post commentCount when comment is deleted
 */
exports.onCommentDeleted = onDocumentDeleted('comments/{commentId}', async event => {
  const comment = event.data.data();
  const postId = comment.postId;

  if (!postId) return;

  const db = admin.firestore();
  const postRef = db.collection('posts').doc(postId);

  await postRef.update({
    'stats.commentCount': FieldValue.increment(-1)
  });

  // If this was a reply, decrement replyCount on parent comment
  if (comment.replyTo) {
    const parentRef = db.collection('comments').doc(comment.replyTo);
    await parentRef.update({
      replyCount: FieldValue.increment(-1)
    }).catch(() => {}); // Parent may be deleted too
  }
});
```

**Step 2: Verify function syntax**

Run: `cd functions && npm run lint` (or `node -c index.js`)
Expected: No syntax errors

**Step 3: Commit**

```bash
git add functions/index.js
git commit -m "feat(functions): add Cloud Functions for comment count updates"
```

---

## Task 17: Create Cloud Function for Like Counts

**Files:**
- Modify: `functions/index.js`

**Step 1: Add onLikeWrite Cloud Functions**

Add to the Cloud Functions file:

```javascript
/**
 * Update like count when like is created
 */
exports.onLikeCreated = onDocumentCreated('likes/{likeId}', async event => {
  const like = event.data.data();
  const { targetId, targetType } = like;

  if (!targetId || !targetType) return;

  const db = admin.firestore();
  const collectionName = targetType === 'post' ? 'posts' : 'comments';
  const targetRef = db.collection(collectionName).doc(targetId);

  await targetRef.update({
    'stats.likeCount': FieldValue.increment(1)
  });
});

/**
 * Update like count when like is deleted
 */
exports.onLikeDeleted = onDocumentDeleted('likes/{likeId}', async event => {
  const like = event.data.data();
  const { targetId, targetType } = like;

  if (!targetId || !targetType) return;

  const db = admin.firestore();
  const collectionName = targetType === 'post' ? 'posts' : 'comments';
  const targetRef = db.collection(collectionName).doc(targetId);

  await targetRef.update({
    'stats.likeCount': FieldValue.increment(-1)
  }).catch(() => {}); // Target may be deleted
});
```

**Step 2: Verify function syntax**

Run: `cd functions && npm run lint`
Expected: No syntax errors

**Step 3: Commit**

```bash
git add functions/index.js
git commit -m "feat(functions): add Cloud Functions for like count updates"
```

---

## Task 18: Deploy Cloud Functions

**Files:**
- None (deployment only)

**Step 1: Install function dependencies**

Run: `cd functions && npm install`

**Step 2: Deploy functions**

Run: `firebase deploy --only functions`
Expected: "Deploy complete!" with 4 new functions listed

**Step 3: Verify deployment**

Run: `firebase functions:list`
Expected: Should show onCommentCreated, onCommentDeleted, onLikeCreated, onLikeDeleted

---

## Task 19: Add E2E Tests for Comments

**Files:**
- Modify: `tests/community-posts.spec.js`

**Step 1: Add comment tests**

Add new test describe block:

```javascript
test.describe('Comments', () => {
  test('comment section should display on post detail', async ({ page }) => {
    // Navigate to a post (assumes at least one exists)
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    const postCount = await page.locator('.post-card').count();
    if (postCount === 0) {
      console.log('⚠ No posts to test comments - skipping');
      return;
    }

    // Click first post to go to detail
    await page.click('.post-card');
    await page.waitForURL(/post\.html\?id=/);

    await test.step('Verify comments section exists', async () => {
      const commentsSection = page.locator('#comments-section');
      await expect(commentsSection).toBeVisible({ timeout: 10000 });

      // Should have comments header
      const header = page.locator('.comments-header');
      await expect(header).toBeVisible();

      console.log('✓ Comments section visible');
    });

    console.log('\\n✅ Comment display tests passed\\n');
  });
});
```

**Step 2: Add like button tests**

```javascript
test.describe('Like Buttons', () => {
  test('like button should be present on post cards', async ({ page }) => {
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    const postCount = await page.locator('.post-card').count();
    if (postCount === 0) {
      console.log('⚠ No posts to test likes - skipping');
      return;
    }

    await test.step('Verify like button exists', async () => {
      const firstPost = page.locator('.post-card').first();
      const likeBtn = firstPost.locator('.post-card__action').first();
      await expect(likeBtn).toBeVisible();

      // Should have like icon
      const likeIcon = likeBtn.locator('.like-icon');
      await expect(likeIcon).toBeVisible();

      console.log('✓ Like button present on post cards');
    });

    console.log('\\n✅ Like button tests passed\\n');
  });
});
```

**Step 3: Run tests**

Run: `npx playwright test tests/community-posts.spec.js`
Expected: All tests pass

**Step 4: Commit**

```bash
git add tests/community-posts.spec.js
git commit -m "test: add E2E tests for comments and likes"
```

---

## Task 20: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update Phase 4.2 status**

Update the roadmap table:

```markdown
| **Phase 4.2** | ✅ Complete | Comments & likes on posts |
```

**Step 2: Add new files to Key Files section**

```markdown
- `js/comment-manager.js` - Comment CRUD and threading (Phase 4.2)
- `js/social-manager.js` - Likes/follows/bookmarks (Phase 4.2+)
```

**Step 3: Add new collections to Firestore Collections**

```markdown
- `comments` - Comments on posts with threading (public read, owner write) - **Phase 4.2**
- `likes` - User likes on posts/comments (public read, owner create/delete) - **Phase 4.2**
```

**Step 4: Update Cloud Functions table**

Add new functions:
```markdown
| `onCommentCreated` | Firestore onCreate (comments) | Increment post/comment counts |
| `onCommentDeleted` | Firestore onDelete (comments) | Decrement post/comment counts |
| `onLikeCreated` | Firestore onCreate (likes) | Increment like counts |
| `onLikeDeleted` | Firestore onDelete (likes) | Decrement like counts |
```

**Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Phase 4.2 Comments & Likes"
```

---

## Task 21: Final Verification

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: 0 errors

**Step 3: Format code**

Run: `npm run format`
Expected: Files formatted

**Step 4: Final commit if needed**

```bash
git add -A
git commit -m "chore: final formatting for Phase 4.2"
```

**Step 5: Push branch**

```bash
git push -u origin claude/phase4-2-comments-likes
```

---

## Validation Checklist

After all tasks complete, verify:

- [ ] Can add top-level comment on a post
- [ ] Can reply to a comment (threaded)
- [ ] Can like/unlike posts (button toggles, count updates)
- [ ] Can like/unlike comments
- [ ] Like counts persist after page refresh
- [ ] Comment counts persist after page refresh
- [ ] Comments display in chronological order
- [ ] Replies display nested under parent
- [ ] All 12+ Playwright tests pass
- [ ] ESLint shows 0 errors
- [ ] Cloud Functions deployed (4 new functions)
