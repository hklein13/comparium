# Phase 4.3: Follows & Bookmarks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to follow other users and bookmark posts for later viewing.

**Architecture:** Compound document IDs (`{userId}_{targetId}`) for both follows and bookmarks collections to enable efficient queries and security rule validation. Cloud Function maintains denormalized follower/following counts on user documents.

**Tech Stack:** Firebase Firestore, Cloud Functions, vanilla JavaScript

---

## Task 1: Add Firestore Security Rules for Follows and Bookmarks

**Files:**
- Modify: `firestore.rules`

**Step 1: Write the test case comments**

Add test expectations as comments before implementing:

```javascript
// follows: public read, owner create/delete (followerId must match auth.uid)
// bookmarks: private to owner (userId must match auth.uid)
```

**Step 2: Add follows collection rules**

In `firestore.rules`, add after the `likes` collection rules:

```javascript
    // Follows collection - compound ID: {followerId}_{followingId}
    match /follows/{followId} {
      allow read: if true;
      allow create: if isAuthenticated() && followId.matches(request.auth.uid + '_.*');
      allow delete: if isAuthenticated() && followId.matches(request.auth.uid + '_.*');
    }
```

**Step 3: Add bookmarks collection rules**

```javascript
    // Bookmarks collection - compound ID: {userId}_{postId}
    match /bookmarks/{bookmarkId} {
      allow read, write: if isAuthenticated() && bookmarkId.matches(request.auth.uid + '_.*');
    }
```

**Step 4: Run security rules test**

Run: `npm run test:rules`
Expected: PASS with new rules validated

**Step 5: Deploy rules**

Run: `firebase deploy --only firestore:rules`
Expected: Rules deployed successfully

**Step 6: Commit**

```bash
git add firestore.rules
git commit -m "$(cat <<'EOF'
feat(phase4.3): add security rules for follows and bookmarks

- follows: public read, owner create/delete via compound ID
- bookmarks: private to owner via compound ID

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add Firestore Helper Functions for Follows

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Write the failing test (manual verification)**

We'll verify by checking browser console. Expected functions:
- `firestoreToggleFollow(targetUserId)` - returns `{success, following}`
- `firestoreIsFollowing(targetUserId)` - returns `{success, following}`
- `firestoreGetFollowerCount(userId)` - returns `{success, count}`
- `firestoreGetFollowingCount(userId)` - returns `{success, count}`

**Step 2: Add firestoreToggleFollow function**

Add after the existing `firestoreToggleLike` function in `js/firebase-init.js`:

```javascript
/**
 * Toggle follow on a user
 * @param {string} targetUserId - User ID to follow/unfollow
 * @returns {Promise<{success: boolean, following?: boolean, error?: string}>}
 */
window.firestoreToggleFollow = async function(targetUserId) {
  const auth = window.firebaseAuth;
  const db = window.firebaseFirestore;

  if (!auth.currentUser) {
    return { success: false, error: 'Must be logged in to follow' };
  }

  const currentUserId = auth.currentUser.uid;

  // Can't follow yourself
  if (currentUserId === targetUserId) {
    return { success: false, error: 'Cannot follow yourself' };
  }

  const followId = `${currentUserId}_${targetUserId}`;
  const followRef = db.collection('follows').doc(followId);

  try {
    const doc = await followRef.get();

    if (doc.exists) {
      // Unfollow
      await followRef.delete();
      return { success: true, following: false };
    } else {
      // Follow
      await followRef.set({
        followerId: currentUserId,
        followingId: targetUserId,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, following: true };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 3: Add firestoreIsFollowing function**

```javascript
/**
 * Check if current user is following a user
 * @param {string} targetUserId - User ID to check
 * @returns {Promise<{success: boolean, following?: boolean, error?: string}>}
 */
window.firestoreIsFollowing = async function(targetUserId) {
  const auth = window.firebaseAuth;
  const db = window.firebaseFirestore;

  if (!auth.currentUser) {
    return { success: true, following: false };
  }

  const currentUserId = auth.currentUser.uid;
  const followId = `${currentUserId}_${targetUserId}`;

  try {
    const doc = await db.collection('follows').doc(followId).get();
    return { success: true, following: doc.exists };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 4: Add firestoreGetFollowerCount function**

```javascript
/**
 * Get follower count for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
window.firestoreGetFollowerCount = async function(userId) {
  const db = window.firebaseFirestore;

  try {
    const snapshot = await db.collection('follows')
      .where('followingId', '==', userId)
      .get();
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error getting follower count:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 5: Add firestoreGetFollowingCount function**

```javascript
/**
 * Get following count for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
window.firestoreGetFollowingCount = async function(userId) {
  const db = window.firebaseFirestore;

  try {
    const snapshot = await db.collection('follows')
      .where('followerId', '==', userId)
      .get();
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error getting following count:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 6: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 7: Commit**

```bash
git add js/firebase-init.js
git commit -m "$(cat <<'EOF'
feat(phase4.3): add Firestore helper functions for follows

- firestoreToggleFollow: follow/unfollow users
- firestoreIsFollowing: check follow status
- firestoreGetFollowerCount: count followers
- firestoreGetFollowingCount: count following

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add Firestore Helper Functions for Bookmarks

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Write the failing test (manual verification)**

Expected functions:
- `firestoreToggleBookmark(postId)` - returns `{success, bookmarked}`
- `firestoreIsBookmarked(postId)` - returns `{success, bookmarked}`
- `firestoreGetUserBookmarks()` - returns `{success, bookmarks}`

**Step 2: Add firestoreToggleBookmark function**

```javascript
/**
 * Toggle bookmark on a post
 * @param {string} postId - Post ID to bookmark/unbookmark
 * @returns {Promise<{success: boolean, bookmarked?: boolean, error?: string}>}
 */
window.firestoreToggleBookmark = async function(postId) {
  const auth = window.firebaseAuth;
  const db = window.firebaseFirestore;

  if (!auth.currentUser) {
    return { success: false, error: 'Must be logged in to bookmark' };
  }

  const userId = auth.currentUser.uid;
  const bookmarkId = `${userId}_${postId}`;
  const bookmarkRef = db.collection('bookmarks').doc(bookmarkId);

  try {
    const doc = await bookmarkRef.get();

    if (doc.exists) {
      // Unbookmark
      await bookmarkRef.delete();
      return { success: true, bookmarked: false };
    } else {
      // Bookmark
      await bookmarkRef.set({
        userId: userId,
        postId: postId,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 3: Add firestoreIsBookmarked function**

```javascript
/**
 * Check if current user has bookmarked a post
 * @param {string} postId - Post ID to check
 * @returns {Promise<{success: boolean, bookmarked?: boolean, error?: string}>}
 */
window.firestoreIsBookmarked = async function(postId) {
  const auth = window.firebaseAuth;
  const db = window.firebaseFirestore;

  if (!auth.currentUser) {
    return { success: true, bookmarked: false };
  }

  const userId = auth.currentUser.uid;
  const bookmarkId = `${userId}_${postId}`;

  try {
    const doc = await db.collection('bookmarks').doc(bookmarkId).get();
    return { success: true, bookmarked: doc.exists };
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 4: Add firestoreGetUserBookmarks function**

```javascript
/**
 * Get current user's bookmarked posts
 * @returns {Promise<{success: boolean, bookmarks?: Array, error?: string}>}
 */
window.firestoreGetUserBookmarks = async function() {
  const auth = window.firebaseAuth;
  const db = window.firebaseFirestore;

  if (!auth.currentUser) {
    return { success: false, error: 'Must be logged in to view bookmarks' };
  }

  const userId = auth.currentUser.uid;

  try {
    const snapshot = await db.collection('bookmarks')
      .where('userId', '==', userId)
      .orderBy('created', 'desc')
      .get();

    const bookmarks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created: doc.data().created?.toDate?.() || new Date()
    }));

    return { success: true, bookmarks };
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 5: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 6: Commit**

```bash
git add js/firebase-init.js
git commit -m "$(cat <<'EOF'
feat(phase4.3): add Firestore helper functions for bookmarks

- firestoreToggleBookmark: bookmark/unbookmark posts
- firestoreIsBookmarked: check bookmark status
- firestoreGetUserBookmarks: get user's saved posts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add Social Manager API for Follows and Bookmarks

**Files:**
- Modify: `js/social-manager.js`

**Step 1: Read current social-manager.js**

Run: Read `js/social-manager.js` to see current structure

**Step 2: Add follow methods to socialManager**

Add after the existing like methods:

```javascript
  // ===== FOLLOWS =====

  /**
   * Toggle follow on a user
   * @param {string} userId - User ID to follow/unfollow
   * @returns {Promise<{success: boolean, following?: boolean, error?: string}>}
   */
  async toggleFollow(userId) {
    return window.firestoreToggleFollow(userId);
  },

  /**
   * Check if current user is following a user
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isFollowing(userId) {
    const result = await window.firestoreIsFollowing(userId);
    return result.success && result.following;
  },

  /**
   * Get follower count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowerCount(userId) {
    const result = await window.firestoreGetFollowerCount(userId);
    return result.success ? result.count : 0;
  },

  /**
   * Get following count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowingCount(userId) {
    const result = await window.firestoreGetFollowingCount(userId);
    return result.success ? result.count : 0;
  },
```

**Step 3: Add bookmark methods to socialManager**

```javascript
  // ===== BOOKMARKS =====

  /**
   * Toggle bookmark on a post
   * @param {string} postId - Post ID to bookmark/unbookmark
   * @returns {Promise<{success: boolean, bookmarked?: boolean, error?: string}>}
   */
  async toggleBookmark(postId) {
    return window.firestoreToggleBookmark(postId);
  },

  /**
   * Check if current user has bookmarked a post
   * @param {string} postId - Post ID to check
   * @returns {Promise<boolean>}
   */
  async isBookmarked(postId) {
    const result = await window.firestoreIsBookmarked(postId);
    return result.success && result.bookmarked;
  },

  /**
   * Get current user's bookmarked posts
   * @returns {Promise<Array>}
   */
  async getBookmarks() {
    const result = await window.firestoreGetUserBookmarks();
    return result.success ? result.bookmarks : [];
  },
```

**Step 4: Update file header comment**

Change line 3-4 from:
```javascript
 * Phase 4.2: Handle likes on posts and comments
 * Phase 4.3: Will add follows and bookmarks
```
to:
```javascript
 * Phase 4.2: Handle likes on posts and comments
 * Phase 4.3: Handle follows and bookmarks
```

**Step 5: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 6: Commit**

```bash
git add js/social-manager.js
git commit -m "$(cat <<'EOF'
feat(phase4.3): add social manager API for follows and bookmarks

- toggleFollow, isFollowing, getFollowerCount, getFollowingCount
- toggleBookmark, isBookmarked, getBookmarks

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add Follow Button to Profile Page

**Files:**
- Modify: `js/profile.js`
- Modify: `profile.html`
- Modify: `css/naturalist.css`

**Step 1: Add follow button container to profile.html**

In `profile.html`, find the profile header section and add a follow button container after the username:

```html
<div id="profile-follow-btn" class="profile-follow-btn" style="display: none;"></div>
```

**Step 2: Add follower/following counts display to profile.html**

Add after member-since element:

```html
<div id="profile-stats" class="profile-stats" style="display: none;">
  <span id="profile-followers">0 followers</span>
  <span class="profile-stats__divider">·</span>
  <span id="profile-following">0 following</span>
</div>
```

**Step 3: Add CSS styles for follow button and stats**

In `css/naturalist.css`, add:

```css
/* Profile Follow Button */
.profile-follow-btn {
  margin-top: 1rem;
}

.profile-follow-btn .btn {
  min-width: 100px;
}

.profile-follow-btn .btn--following {
  background: var(--forest);
  color: white;
}

.profile-follow-btn .btn--following:hover {
  background: #c0392b;
}

/* Profile Stats */
.profile-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: var(--ink-secondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.profile-stats__divider {
  color: var(--border);
}
```

**Step 4: Store profile userId for follow functionality**

In `js/profile.js`, add a module-level variable at the top:

```javascript
let profileUserId = null;
```

**Step 5: Update loadProfile to show follow button and stats**

In `js/profile.js`, modify the `loadProfile` function to:
1. Store the userId
2. Load and display follower/following counts
3. Show follow button if viewing another user's profile

Add after `renderProfileHeader(username, tanks[0]);`:

```javascript
    // Store userId for follow functionality
    profileUserId = userId;

    // Load and display follow stats
    await loadFollowStats(userId);

    // Show follow button if not own profile
    await renderFollowButton(userId);
```

**Step 6: Add loadFollowStats function**

```javascript
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
    window.socialManager.getFollowingCount(userId)
  ]);

  followersEl.textContent = `${followerCount} follower${followerCount !== 1 ? 's' : ''}`;
  followingEl.textContent = `${followingCount} following`;
  statsEl.style.display = 'flex';
}
```

**Step 7: Add renderFollowButton function**

```javascript
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
```

**Step 8: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 9: Test manually**

Run: `http-server -c-1`
Test: Visit profile.html?user=<userId>, verify:
- Follower/following counts display
- Follow button appears for other users
- Button toggles between "Follow" and "Following"
- Counts update after following/unfollowing

**Step 10: Commit**

```bash
git add js/profile.js profile.html css/naturalist.css
git commit -m "$(cat <<'EOF'
feat(phase4.3): add follow button and stats to profile page

- Follow/Following button for other users' profiles
- Follower and following counts display
- Button state updates on click

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Add Bookmark Button to Post Cards

**Files:**
- Modify: `js/community.js`
- Modify: `css/naturalist.css`

**Step 1: Read current community.js**

Run: Read `js/community.js` to find the `createPostCard` function

**Step 2: Add bookmark button to post card**

In the `createPostCard` function, add a bookmark button to the card actions section (alongside the like button). Find where actions are added and include:

```javascript
// Bookmark button (only show for logged-in users)
if (window.firebaseAuth?.currentUser) {
  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.className = 'post-card__action post-card__bookmark';
  bookmarkBtn.setAttribute('aria-label', 'Bookmark post');
  bookmarkBtn.innerHTML = '<span class="bookmark-icon"></span>';
  bookmarkBtn.onclick = async (e) => {
    e.stopPropagation();
    const result = await window.socialManager.toggleBookmark(post.id);
    if (result.success) {
      bookmarkBtn.classList.toggle('bookmarked', result.bookmarked);
    }
  };

  // Check initial bookmark state
  window.socialManager.isBookmarked(post.id).then(isBookmarked => {
    if (isBookmarked) {
      bookmarkBtn.classList.add('bookmarked');
    }
  });

  actionsEl.appendChild(bookmarkBtn);
}
```

**Step 3: Add CSS styles for bookmark button**

In `css/naturalist.css`, add:

```css
/* Bookmark Button */
.post-card__bookmark {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--ink-secondary);
  transition: color 0.2s;
}

.post-card__bookmark:hover {
  color: var(--forest);
}

.post-card__bookmark.bookmarked {
  color: var(--forest);
}

.bookmark-icon {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'/%3E%3C/svg%3E");
  background-size: contain;
}

.post-card__bookmark.bookmarked .bookmark-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3E%3Cpath d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'/%3E%3C/svg%3E");
}
```

**Step 4: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 5: Test manually**

Run: `http-server -c-1`
Test: Visit community.html, verify:
- Bookmark button appears on post cards (when logged in)
- Clicking toggles filled/outline state
- State persists on page reload

**Step 6: Commit**

```bash
git add js/community.js css/naturalist.css
git commit -m "$(cat <<'EOF'
feat(phase4.3): add bookmark button to post cards

- Bookmark icon on post cards for logged-in users
- Toggle between outline and filled states
- Persists bookmark state in Firestore

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Add Bookmarks Tab to Profile Page

**Files:**
- Modify: `profile.html`
- Modify: `js/profile.js`
- Modify: `css/naturalist.css`

**Step 1: Add tabs HTML to profile.html**

Add tabs structure after the profile header, before the tanks section:

```html
<div id="profile-tabs" class="profile-tabs" style="display: none;">
  <button class="profile-tab active" data-tab="tanks">Tanks</button>
  <button class="profile-tab" data-tab="bookmarks">Bookmarks</button>
</div>

<div id="profile-tab-content">
  <!-- Tanks tab content (existing) -->
  <section id="tanks-tab" class="profile-tab-panel active">
    <!-- Move existing tanks section content here -->
  </section>

  <!-- Bookmarks tab content -->
  <section id="bookmarks-tab" class="profile-tab-panel" style="display: none;">
    <div id="bookmarks-loading" class="loading-spinner"></div>
    <div id="bookmarks-grid" class="community-grid"></div>
    <p id="bookmarks-empty" class="empty-state" style="display: none;">No bookmarked posts yet</p>
  </section>
</div>
```

**Step 2: Add CSS for tabs**

```css
/* Profile Tabs */
.profile-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.profile-tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--ink-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.profile-tab:hover {
  color: var(--ink);
}

.profile-tab.active {
  color: var(--forest);
  border-bottom-color: var(--forest);
}

.profile-tab-panel {
  display: none;
}

.profile-tab-panel.active {
  display: block;
}
```

**Step 3: Add tab switching logic to profile.js**

```javascript
/**
 * Initialize profile tabs (only for own profile)
 */
function initProfileTabs(isOwnProfile) {
  const tabsEl = document.getElementById('profile-tabs');
  if (!tabsEl) return;

  // Only show tabs on own profile (bookmarks are private)
  if (!isOwnProfile) {
    tabsEl.style.display = 'none';
    return;
  }

  tabsEl.style.display = 'flex';

  // Add click handlers
  const tabs = tabsEl.querySelectorAll('.profile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab panels
  document.querySelectorAll('.profile-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tabName}-tab`);
  });

  // Load bookmarks if switching to bookmarks tab
  if (tabName === 'bookmarks') {
    loadBookmarks();
  }
}
```

**Step 4: Add loadBookmarks function**

```javascript
/**
 * Load and display user's bookmarked posts
 */
async function loadBookmarks() {
  const loadingEl = document.getElementById('bookmarks-loading');
  const gridEl = document.getElementById('bookmarks-grid');
  const emptyEl = document.getElementById('bookmarks-empty');

  if (!gridEl) return;

  loadingEl.style.display = 'block';
  gridEl.innerHTML = '';
  emptyEl.style.display = 'none';

  try {
    const bookmarks = await window.socialManager.getBookmarks();

    loadingEl.style.display = 'none';

    if (bookmarks.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }

    // Load the actual posts for each bookmark
    const db = window.firebaseFirestore;
    for (const bookmark of bookmarks) {
      const postDoc = await db.collection('posts').doc(bookmark.postId).get();
      if (postDoc.exists) {
        const post = { id: postDoc.id, ...postDoc.data() };
        const card = createBookmarkCard(post);
        gridEl.appendChild(card);
      }
    }
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    loadingEl.style.display = 'none';
    emptyEl.textContent = 'Error loading bookmarks';
    emptyEl.style.display = 'block';
  }
}
```

**Step 5: Add createBookmarkCard function**

```javascript
/**
 * Create a card for a bookmarked post
 */
function createBookmarkCard(post) {
  const card = document.createElement('article');
  card.className = 'community-card';
  card.onclick = () => {
    window.location.href = `post.html?id=${encodeURIComponent(post.id)}`;
  };

  // Image section
  const imageSection = document.createElement('div');
  imageSection.className = 'community-card__image';

  if (post.imageUrl) {
    const img = document.createElement('img');
    img.src = post.imageUrl;
    img.alt = post.title || 'Post image';
    img.loading = 'lazy';
    imageSection.appendChild(img);
  } else {
    imageSection.classList.add('empty');
    imageSection.innerHTML = '<span>No image</span>';
  }

  card.appendChild(imageSection);

  // Content section
  const content = document.createElement('div');
  content.className = 'community-card__content';

  const title = document.createElement('h3');
  title.className = 'community-card__title';
  title.textContent = post.title || 'Untitled Post';
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'community-card__meta';
  meta.innerHTML = `<span>@${post.username || 'Unknown'}</span>`;
  content.appendChild(meta);

  card.appendChild(content);

  return card;
}
```

**Step 6: Update loadProfile to check if viewing own profile**

In `loadProfile`, after loading the profile, add:

```javascript
    // Check if viewing own profile
    const auth = window.firebaseAuth;
    const isOwnProfile = auth.currentUser && auth.currentUser.uid === userId;

    // Initialize tabs (only show for own profile)
    initProfileTabs(isOwnProfile);
```

**Step 7: Run lint check**

Run: `npm run lint`
Expected: PASS with no errors

**Step 8: Test manually**

Run: `http-server -c-1`
Test:
- Visit own profile: tabs should appear (Tanks, Bookmarks)
- Visit other profile: no tabs (only tanks visible)
- Click Bookmarks tab: shows bookmarked posts
- Bookmark a post on community page, verify it appears in Bookmarks tab

**Step 9: Commit**

```bash
git add profile.html js/profile.js css/naturalist.css
git commit -m "$(cat <<'EOF'
feat(phase4.3): add bookmarks tab to own profile

- Tabs UI: Tanks | Bookmarks (own profile only)
- Load and display bookmarked posts
- Empty state for no bookmarks

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Create Firestore Indexes for Follows and Bookmarks

**Files:**
- Modify: `firestore.indexes.json`

**Step 1: Read current indexes file**

Run: Read `firestore.indexes.json` to see existing indexes

**Step 2: Add indexes for follows queries**

Add index for querying followers (where followingId equals):
```json
{
  "collectionGroup": "follows",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "followingId", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
}
```

Add index for querying following (where followerId equals):
```json
{
  "collectionGroup": "follows",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "followerId", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
}
```

**Step 3: Add index for bookmarks query**

```json
{
  "collectionGroup": "bookmarks",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
}
```

**Step 4: Deploy indexes**

Run: `firebase deploy --only firestore:indexes`
Expected: Indexes deployed (may take a few minutes to build)

**Step 5: Commit**

```bash
git add firestore.indexes.json
git commit -m "$(cat <<'EOF'
feat(phase4.3): add Firestore indexes for follows and bookmarks

- follows: index on followingId and followerId for count queries
- bookmarks: index on userId for user's bookmarks list

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Run Full Test Suite and Fix Issues

**Files:**
- Various (depending on test failures)

**Step 1: Run Playwright tests**

Run: `npm test`
Expected: All tests pass (some may be skipped)

**Step 2: Run lint check**

Run: `npm run lint`
Expected: No errors

**Step 3: Run format check**

Run: `npm run format:check`
Expected: All files formatted

**Step 4: Fix any issues**

If any tests fail or lint errors occur, fix them before proceeding.

**Step 5: Commit fixes if needed**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix(phase4.3): address test and lint issues

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Manual Integration Testing

**Files:**
- None (testing only)

**Step 1: Start local server**

Run: `http-server -c-1`

**Step 2: Test follow functionality**

1. Log in as User A
2. Visit User B's profile
3. Verify Follow button appears
4. Click Follow - button changes to "Following"
5. Verify follower count increases
6. Click Following - button changes back to "Follow"
7. Verify follower count decreases

**Step 3: Test bookmark functionality**

1. Log in as any user
2. Visit community.html
3. Click bookmark icon on a post
4. Verify icon fills in
5. Visit own profile
6. Click Bookmarks tab
7. Verify bookmarked post appears
8. Return to community.html
9. Click bookmark icon again to unbookmark
10. Verify post removed from Bookmarks tab

**Step 4: Test edge cases**

1. Verify can't follow yourself (button shouldn't appear on own profile)
2. Verify bookmarks tab only visible on own profile
3. Verify follow state persists after page reload
4. Verify bookmark state persists after page reload

**Step 5: Document any issues found**

Note any bugs or UX issues for fixing.

---

## Task 11: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update current phase status**

Change "Phase 4.3 Follows & Bookmarks (starting)" to "Phase 4.3 Follows & Bookmarks (in progress)" or "(complete)" depending on status.

**Step 2: Add Phase 4.3 key files**

Add to Key Files section:
```
- `js/social-manager.js` - High-level API for follows, bookmarks, likes
```

**Step 3: Update Firestore Collections**

Add to collections list:
```
- `follows` - User follow relationships (public read, owner write)
- `bookmarks` - User bookmarked posts (private to owner)
```

**Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: update CLAUDE.md for Phase 4.3 follows and bookmarks

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Validation Checklist

Before marking Phase 4.3 complete, verify:

- [ ] Can follow/unfollow users from their profile
- [ ] Follow button state persists after page reload
- [ ] Follower/following counts display and update correctly
- [ ] Can bookmark/unbookmark posts from community gallery
- [ ] Bookmarks tab shows on own profile only
- [ ] Bookmarks tab displays saved posts correctly
- [ ] Bookmarks only visible to owner (private)
- [ ] All tests pass (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Security rules deployed and working
- [ ] Indexes deployed and queries work

---

## Final Steps

After all tasks complete:

1. Push branch: `git push -u origin claude/phase4-3-follows-bookmarks`
2. Notify user that Phase 4.3 is ready for review
3. User creates PR and merges to main
4. Use superpowers:finishing-a-development-branch to clean up worktree
