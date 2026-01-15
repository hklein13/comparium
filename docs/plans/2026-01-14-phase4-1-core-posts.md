# Phase 4.1: Core Posts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to create and view text+photo posts in a community feed with category filtering.

**Architecture:** Extend existing `community.html` with Posts/Tanks tabs. Add `posts` Firestore collection with category-based filtering. Reuse existing patterns from `public-tank-manager.js` and `community.js`.

**Tech Stack:** Firestore, Firebase Storage, vanilla JS (no frameworks), existing naturalist.css

---

## Task 1: Add Posts Collection Security Rules

**Files:**
- Modify: `firestore.rules`

**Step 1: Read existing rules**

```bash
cat firestore.rules
```

Review current structure to understand where to add new rules.

**Step 2: Add posts collection rules**

Add after the `publicTanks` rules section:

```javascript
    // Posts - public read, owner write
    match /posts/{postId} {
      allow read: if resource.data.visibility == 'public';
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.userId;
    }
```

**Step 3: Validate rules syntax**

```bash
npm run test:rules
```

Expected: Rules analysis passes

**Step 4: Commit**

```bash
git add firestore.rules
git commit -m "feat(posts): add security rules for posts collection"
```

---

## Task 2: Add Firestore Indexes for Posts

**Files:**
- Modify: `firestore.indexes.json`

**Step 1: Read existing indexes**

```bash
cat firestore.indexes.json
```

**Step 2: Add posts indexes**

Add to the `indexes` array:

```json
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "visibility", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "visibility", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "visibility", "order": "ASCENDING" },
    { "fieldPath": "stats.likeCount", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "visibility", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "stats.likeCount", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "created", "order": "DESCENDING" }
  ]
}
```

**Step 3: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat(posts): add Firestore indexes for posts queries"
```

---

## Task 3: Create Post Manager Module

**Files:**
- Create: `js/post-manager.js`

**Step 1: Create the post manager file**

```javascript
/**
 * Post Manager - CRUD operations for community posts
 * Phase 4 Full: Social features
 */

// Post categories
const POST_CATEGORIES = {
  help: { label: 'Help / Questions', icon: '?' },
  showcase: { label: 'Tank Showcase', icon: '' },
  tips: { label: 'Tips & Guides', icon: '' },
  fishid: { label: 'Fish ID', icon: '' },
  milestone: { label: 'Milestones', icon: '' },
};

/**
 * Create a new post
 * @param {object} postData - { content, category, imageUrls }
 * @returns {Promise<{success: boolean, postId?: string, error?: string}>}
 */
async function createPost(postData) {
  const uid = window.getFirebaseUid();
  if (!uid) {
    return { success: false, error: 'Must be logged in to post' };
  }

  // Validate content
  if (!postData.content || postData.content.trim().length === 0) {
    return { success: false, error: 'Post content is required' };
  }
  if (postData.content.length > 2000) {
    return { success: false, error: 'Post content must be under 2000 characters' };
  }

  // Validate category
  if (!postData.category || !POST_CATEGORIES[postData.category]) {
    return { success: false, error: 'Invalid category' };
  }

  // Validate images (max 4)
  const imageUrls = postData.imageUrls || [];
  if (imageUrls.length > 4) {
    return { success: false, error: 'Maximum 4 images allowed' };
  }

  try {
    // Get user profile for author info
    const profile = await window.firestoreGetProfile(uid);
    const username = profile?.username || 'Anonymous';

    const post = {
      userId: uid,
      content: postData.content.trim(),
      category: postData.category,
      imageUrls: imageUrls,
      visibility: 'public',
      stats: {
        likeCount: 0,
        commentCount: 0,
      },
      author: {
        username: username,
        avatarUrl: profile?.profile?.avatarUrl || null,
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    const result = await window.firestoreCreatePost(post);
    return result;
  } catch (error) {
    return { success: false, error: error.message || 'Failed to create post' };
  }
}

/**
 * Get posts for the community feed
 * @param {object} options - { category, sortBy, limit, lastDoc }
 * @returns {Promise<{success: boolean, posts: array, lastDoc: any}>}
 */
async function getFeedPosts(options = {}) {
  const {
    category = null,
    sortBy = 'newest',
    limit = 20,
    lastDoc = null,
  } = options;

  try {
    const result = await window.firestoreGetPosts({
      category,
      sortBy,
      limit,
      lastDoc,
    });
    return result;
  } catch (error) {
    return { success: false, posts: [], error: error.message };
  }
}

/**
 * Get a single post by ID
 * @param {string} postId
 * @returns {Promise<{success: boolean, post?: object, error?: string}>}
 */
async function getPost(postId) {
  if (!postId) {
    return { success: false, error: 'Post ID required' };
  }

  try {
    const result = await window.firestoreGetPost(postId);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a post (owner only)
 * @param {string} postId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deletePost(postId) {
  const uid = window.getFirebaseUid();
  if (!uid) {
    return { success: false, error: 'Must be logged in' };
  }

  try {
    const result = await window.firestoreDeletePost(uid, postId);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<{success: boolean, posts: array}>}
 */
async function getUserPosts(userId, limit = 20) {
  try {
    const result = await window.firestoreGetUserPosts(userId, limit);
    return result;
  } catch (error) {
    return { success: false, posts: [], error: error.message };
  }
}

// Expose globally
window.postManager = {
  POST_CATEGORIES,
  createPost,
  getFeedPosts,
  getPost,
  deletePost,
  getUserPosts,
};
```

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add js/post-manager.js
git commit -m "feat(posts): add post-manager.js with CRUD operations"
```

---

## Task 4: Add Firestore Post Functions to firebase-init.js

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add imports for startAfter**

Find the existing Firestore imports and add `startAfter`:

```javascript
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  addDoc,
  orderBy,
  Timestamp,
  limit,
  startAfter,  // ADD THIS
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
```

**Step 2: Add post Firestore functions**

Add after the notification functions (around line 752):

```javascript
// ============================================================================
// POSTS (Phase 4 Full - Social Features)
// ============================================================================

/**
 * Create a new post
 * @param {object} postData - Post data object
 * @returns {Promise<{success: boolean, postId?: string}>}
 */
window.firestoreCreatePost = async (postData) => {
  if (!firestore) return { success: false, error: 'Firestore not initialized' };
  try {
    const post = {
      ...postData,
      created: Timestamp.now(),
      updated: Timestamp.now(),
    };
    const ref = await addDoc(collection(firestore, 'posts'), post);
    return { success: true, postId: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Get posts for community feed
 * @param {object} options - { category, sortBy, limit, lastDoc }
 * @returns {Promise<{success: boolean, posts: array, lastDoc: any}>}
 */
window.firestoreGetPosts = async (options = {}) => {
  if (!firestore) return { success: false, posts: [] };

  const {
    category = null,
    sortBy = 'newest',
    limit: maxResults = 20,
    lastDoc = null,
  } = options;

  try {
    let constraints = [
      where('visibility', '==', 'public'),
    ];

    // Add category filter if specified
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Add sort order
    if (sortBy === 'top') {
      constraints.push(orderBy('stats.likeCount', 'desc'));
    } else {
      constraints.push(orderBy('created', 'desc'));
    }

    // Add limit
    constraints.push(limit(maxResults));

    // Add pagination cursor
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(firestore, 'posts'), ...constraints);
    const snap = await getDocs(q);

    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
      updated: d.data().updated?.toDate?.()?.toISOString() || d.data().updated,
    }));

    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { success: true, posts, lastDoc: newLastDoc };
  } catch (e) {
    return { success: false, posts: [], error: e.message };
  }
};

/**
 * Get a single post by ID
 * @param {string} postId
 * @returns {Promise<{success: boolean, post?: object}>}
 */
window.firestoreGetPost = async (postId) => {
  if (!firestore || !postId) return { success: false };
  try {
    const ref = doc(firestore, 'posts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Post not found' };
    }
    const data = snap.data();
    return {
      success: true,
      post: {
        id: snap.id,
        ...data,
        created: data.created?.toDate?.()?.toISOString() || data.created,
        updated: data.updated?.toDate?.()?.toISOString() || data.updated,
      },
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Delete a post (verifies ownership)
 * @param {string} uid - User's UID
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean}>}
 */
window.firestoreDeletePost = async (uid, postId) => {
  if (!firestore || !uid || !postId) return { success: false };
  try {
    const ref = doc(firestore, 'posts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== uid) {
      return { success: false, error: 'Not authorized' };
    }
    await deleteDoc(ref);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} maxResults
 * @returns {Promise<{success: boolean, posts: array}>}
 */
window.firestoreGetUserPosts = async (userId, maxResults = 20) => {
  if (!firestore || !userId) return { success: false, posts: [] };
  try {
    const q = query(
      collection(firestore, 'posts'),
      where('userId', '==', userId),
      orderBy('created', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
      updated: d.data().updated?.toDate?.()?.toISOString() || d.data().updated,
    }));
    return { success: true, posts };
  } catch (e) {
    return { success: false, posts: [], error: e.message };
  }
};
```

**Step 3: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 4: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(posts): add Firestore functions for posts CRUD"
```

---

## Task 5: Add Post Image Upload Function

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add image upload function**

Add after the post functions:

```javascript
/**
 * Upload a post image to Firebase Storage
 * @param {string} postId - Post ID (used in path)
 * @param {File} file - Image file
 * @param {number} index - Image index (0-3)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
window.storageUploadPostImage = async (postId, file, index) => {
  if (!storage || !postId || !file) {
    return { success: false, error: 'Missing required parameters' };
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Use JPEG, PNG, or WebP.' };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: 'File too large. Maximum 5MB.' };
  }

  try {
    const storageRef = ref(storage, `images/posts/${postId}/${index}.jpg`);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
    });
    const url = await getDownloadURL(snapshot.ref);
    return { success: true, url };
  } catch (e) {
    return { success: false, error: e.message || 'Upload failed' };
  }
};
```

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(posts): add post image upload to Firebase Storage"
```

---

## Task 6: Update community.html with Posts/Tanks Tabs

**Files:**
- Modify: `community.html`

**Step 1: Update the hero section with tabs**

Replace the existing `community-toolbar` section with:

```html
    <!-- View Toggle Tabs -->
    <div class="community-tabs">
      <button class="community-tab active" data-view="tanks" onclick="switchView('tanks')">
        Tanks
      </button>
      <button class="community-tab" data-view="posts" onclick="switchView('posts')">
        Posts
      </button>
    </div>

    <!-- Main Content -->
    <main class="community-main">
      <!-- Tanks View -->
      <div id="tanks-view" class="community-view">
        <!-- Filter/Sort Bar -->
        <div class="community-toolbar">
          <div class="community-sort">
            <label for="tank-sort-select">Sort by:</label>
            <select id="tank-sort-select" onchange="changeTankSortOrder()">
              <option value="newest">Newest First</option>
              <option value="size">Largest Tanks</option>
            </select>
          </div>
          <div class="community-count">
            <span id="tank-count">0</span> shared tanks
          </div>
        </div>

        <!-- Tank Gallery Grid -->
        <div id="community-gallery" class="community-gallery">
          <div class="community-loading">
            <p>Loading community tanks...</p>
          </div>
        </div>

        <!-- Load More Button -->
        <div id="load-more-container" class="load-more-container" style="display: none">
          <button id="load-more-btn" class="btn btn-ghost" onclick="loadMoreTanks()">
            Load More Tanks
          </button>
        </div>

        <!-- Empty State -->
        <div id="community-empty" class="community-empty" style="display: none">
          <h3>No tanks shared yet</h3>
          <p>Be the first to share your setup with the community!</p>
          <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
        </div>
      </div>

      <!-- Posts View -->
      <div id="posts-view" class="community-view" style="display: none">
        <!-- Category Filter + Sort -->
        <div class="community-toolbar">
          <div class="post-categories">
            <button class="category-btn active" data-category="" onclick="filterByCategory('')">All</button>
            <button class="category-btn" data-category="help" onclick="filterByCategory('help')">Help</button>
            <button class="category-btn" data-category="showcase" onclick="filterByCategory('showcase')">Showcase</button>
            <button class="category-btn" data-category="tips" onclick="filterByCategory('tips')">Tips</button>
            <button class="category-btn" data-category="fishid" onclick="filterByCategory('fishid')">Fish ID</button>
            <button class="category-btn" data-category="milestone" onclick="filterByCategory('milestone')">Milestones</button>
          </div>
          <div class="community-sort">
            <label for="post-sort-select">Sort:</label>
            <select id="post-sort-select" onchange="changePostSortOrder()">
              <option value="newest">Newest</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        <!-- New Post Button (logged in only) -->
        <div id="new-post-container" class="new-post-container" style="display: none">
          <button class="btn btn-primary" onclick="openPostComposer()">
            New Post
          </button>
        </div>

        <!-- Posts Feed -->
        <div id="posts-feed" class="posts-feed">
          <div class="community-loading">
            <p>Loading posts...</p>
          </div>
        </div>

        <!-- Load More Posts -->
        <div id="load-more-posts-container" class="load-more-container" style="display: none">
          <button class="btn btn-ghost" onclick="loadMorePosts()">
            Load More Posts
          </button>
        </div>

        <!-- Empty Posts State -->
        <div id="posts-empty" class="community-empty" style="display: none">
          <h3>No posts yet</h3>
          <p>Be the first to share with the community!</p>
        </div>
      </div>
    </main>
```

**Step 2: Add post-manager.js script**

Before the closing `</body>` tag, add post-manager.js:

```html
    <!-- Scripts -->
    <script type="module" src="js/firebase-init.js"></script>
    <script src="js/storage-service.js"></script>
    <script src="js/auth-manager.js"></script>
    <script src="js/fish-data.js"></script>
    <script src="js/public-tank-manager.js"></script>
    <script src="js/post-manager.js"></script>
    <script src="js/community.js"></script>
```

**Step 3: Commit**

```bash
git add community.html
git commit -m "feat(posts): add Posts/Tanks tabs to community page"
```

---

## Task 7: Add Posts CSS Styles

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add community tabs and posts feed styles**

Add at the end of the file:

```css
/* ============================================
   COMMUNITY TABS & POSTS FEED (Phase 4 Full)
   ============================================ */

/* View Toggle Tabs */
.community-tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  margin: 2rem auto 0;
  max-width: 300px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ivory);
}

.community-tab {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.community-tab:hover {
  background: rgba(35, 74, 58, 0.05);
}

.community-tab.active {
  background: var(--forest);
  color: white;
}

/* Category Filter Buttons */
.post-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: transparent;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: var(--forest);
  color: var(--forest);
}

.category-btn.active {
  background: var(--forest);
  border-color: var(--forest);
  color: white;
}

/* New Post Container */
.new-post-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

/* Posts Feed */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 700px;
  margin: 0 auto;
}

/* Post Card */
.post-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.post-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--forest);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.post-card__avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.post-card__meta {
  flex: 1;
}

.post-card__author {
  font-weight: 600;
  color: var(--ink);
}

.post-card__info {
  font-size: 0.875rem;
  color: var(--ink-secondary);
}

.post-card__category {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(35, 74, 58, 0.1);
  color: var(--forest);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.post-card__content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-card__images {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.post-card__images.single {
  grid-template-columns: 1fr;
}

.post-card__images.double {
  grid-template-columns: 1fr 1fr;
}

.post-card__images.triple,
.post-card__images.quad {
  grid-template-columns: 1fr 1fr;
}

.post-card__images img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
}

.post-card__actions {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.post-card__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--ink-secondary);
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.post-card__action:hover {
  color: var(--forest);
}

.post-card__action.liked {
  color: #e74c3c;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .community-tabs {
    margin: 1rem auto 0;
  }

  .post-categories {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .category-btn {
    flex-shrink: 0;
  }

  .post-card {
    padding: 1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .post-card__images img {
    height: 150px;
  }
}
```

**Step 2: Run format check**

```bash
npm run format:check
```

If issues, run `npm run format` to fix.

**Step 3: Commit**

```bash
git add css/naturalist.css
git commit -m "feat(posts): add CSS styles for posts feed and cards"
```

---

## Task 8: Update community.js for Posts/Tanks Views

**Files:**
- Modify: `js/community.js`

**Step 1: Rewrite community.js to handle both views**

Replace the entire file content:

```javascript
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

  // Check if user is logged in to show new post button
  const uid = window.getFirebaseUid();
  const newPostContainer = document.getElementById('new-post-container');
  if (newPostContainer && uid) {
    newPostContainer.style.display = 'flex';
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
  document.querySelectorAll('.community-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });

  // Show/hide views
  document.getElementById('tanks-view').style.display = view === 'tanks' ? 'block' : 'none';
  document.getElementById('posts-view').style.display = view === 'posts' ? 'block' : 'none';

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
    gallery.innerHTML = '<div class="community-loading"><p>Loading community tanks...</p></div>';
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

      tanks.forEach(tank => {
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

function openPostComposer() {
  // Will be implemented in Task 9
  alert('Post composer coming soon!');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initCommunityGallery);
```

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add js/community.js
git commit -m "feat(posts): update community.js for posts/tanks dual view"
```

---

## Task 9: Create Post Composer Component

**Files:**
- Create: `js/post-composer.js`

**Step 1: Create the post composer**

```javascript
/**
 * Post Composer - Create new posts with images
 * Phase 4 Full: Social features
 */

let composerModal = null;
let selectedImages = [];
let isSubmitting = false;

/**
 * Open the post composer modal
 */
function openPostComposer() {
  const uid = window.getFirebaseUid();
  if (!uid) {
    alert('Please log in to create a post');
    window.location.href = 'login.html';
    return;
  }

  // Create modal if it doesn't exist
  if (!composerModal) {
    createComposerModal();
  }

  // Reset state
  selectedImages = [];
  isSubmitting = false;

  // Reset form
  document.getElementById('post-content').value = '';
  document.getElementById('post-category').value = 'help';
  document.getElementById('image-preview-container').innerHTML = '';
  document.getElementById('char-count').textContent = '0';
  updateImageCount();

  // Show modal
  composerModal.style.display = 'flex';
  document.getElementById('post-content').focus();
}

/**
 * Close the post composer modal
 */
function closePostComposer() {
  if (composerModal) {
    composerModal.style.display = 'none';
  }
  selectedImages = [];
}

/**
 * Create the composer modal DOM structure
 */
function createComposerModal() {
  composerModal = document.createElement('div');
  composerModal.className = 'modal-overlay';
  composerModal.id = 'post-composer-modal';
  composerModal.onclick = (e) => {
    if (e.target === composerModal) closePostComposer();
  };

  const categories = window.postManager?.POST_CATEGORIES || {
    help: { label: 'Help / Questions' },
    showcase: { label: 'Tank Showcase' },
    tips: { label: 'Tips & Guides' },
    fishid: { label: 'Fish ID' },
    milestone: { label: 'Milestones' },
  };

  const categoryOptions = Object.entries(categories)
    .map(([key, val]) => `<option value="${key}">${val.label}</option>`)
    .join('');

  composerModal.innerHTML = `
    <div class="modal composer-modal">
      <div class="modal-header">
        <h2>Create Post</h2>
        <button class="modal-close" onclick="closePostComposer()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="composer-form">
          <div class="form-group">
            <label for="post-category">Category</label>
            <select id="post-category" class="form-select">
              ${categoryOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="post-content">What's on your mind?</label>
            <textarea
              id="post-content"
              class="form-textarea"
              rows="5"
              maxlength="2000"
              placeholder="Share a question, tip, or update..."
              oninput="updateCharCount()"
            ></textarea>
            <div class="char-counter">
              <span id="char-count">0</span> / 2000
            </div>
          </div>
          <div class="form-group">
            <label>Images (optional, max 4)</label>
            <div id="image-preview-container" class="image-preview-container"></div>
            <div class="image-upload-area">
              <input
                type="file"
                id="image-input"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style="display: none"
                onchange="handleImageSelect(event)"
              >
              <button type="button" class="btn btn-ghost" onclick="document.getElementById('image-input').click()">
                Add Images (<span id="image-count">0</span>/4)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closePostComposer()">Cancel</button>
        <button class="btn btn-primary" id="submit-post-btn" onclick="submitPost()">Post</button>
      </div>
    </div>
  `;

  document.body.appendChild(composerModal);
}

/**
 * Update character count display
 */
function updateCharCount() {
  const content = document.getElementById('post-content');
  const count = document.getElementById('char-count');
  if (content && count) {
    count.textContent = content.value.length;
  }
}

/**
 * Update image count display
 */
function updateImageCount() {
  const countEl = document.getElementById('image-count');
  if (countEl) {
    countEl.textContent = selectedImages.length;
  }
}

/**
 * Handle image file selection
 */
function handleImageSelect(event) {
  const files = Array.from(event.target.files);

  // Check total count
  if (selectedImages.length + files.length > 4) {
    alert('Maximum 4 images allowed');
    return;
  }

  // Validate and add each file
  files.forEach(file => {
    if (selectedImages.length >= 4) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`${file.name}: Invalid file type. Use JPEG, PNG, or WebP.`);
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: File too large. Maximum 5MB.`);
      return;
    }

    selectedImages.push(file);
    addImagePreview(file);
  });

  updateImageCount();
  event.target.value = ''; // Reset input
}

/**
 * Add image preview to the container
 */
function addImagePreview(file) {
  const container = document.getElementById('image-preview-container');
  const index = selectedImages.indexOf(file);

  const preview = document.createElement('div');
  preview.className = 'image-preview';
  preview.dataset.index = index;

  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  preview.appendChild(img);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'image-preview-remove';
  removeBtn.innerHTML = '&times;';
  removeBtn.onclick = () => removeImage(index);
  preview.appendChild(removeBtn);

  container.appendChild(preview);
}

/**
 * Remove an image from selection
 */
function removeImage(index) {
  selectedImages.splice(index, 1);

  // Rebuild previews
  const container = document.getElementById('image-preview-container');
  container.innerHTML = '';
  selectedImages.forEach((file) => {
    addImagePreview(file);
  });

  updateImageCount();
}

/**
 * Submit the post
 */
async function submitPost() {
  if (isSubmitting) return;

  const content = document.getElementById('post-content').value.trim();
  const category = document.getElementById('post-category').value;

  // Validate
  if (!content) {
    alert('Please enter some content');
    return;
  }

  isSubmitting = true;
  const submitBtn = document.getElementById('submit-post-btn');
  submitBtn.textContent = 'Posting...';
  submitBtn.disabled = true;

  try {
    // If we have images, we need to create post first to get ID, then upload images
    let imageUrls = [];

    if (selectedImages.length > 0) {
      // Generate a temporary post ID for image paths
      const tempPostId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Upload images
      for (let i = 0; i < selectedImages.length; i++) {
        const result = await window.storageUploadPostImage(tempPostId, selectedImages[i], i);
        if (result.success) {
          imageUrls.push(result.url);
        } else {
          throw new Error(`Failed to upload image ${i + 1}: ${result.error}`);
        }
      }
    }

    // Create the post
    const result = await window.postManager.createPost({
      content,
      category,
      imageUrls,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create post');
    }

    // Success - close modal and refresh feed
    closePostComposer();

    // If we're on the posts view, refresh it
    if (typeof loadPosts === 'function') {
      loadPosts(false);
    }

  } catch (error) {
    alert('Error creating post: ' + error.message);
  } finally {
    isSubmitting = false;
    submitBtn.textContent = 'Post';
    submitBtn.disabled = false;
  }
}

// Expose functions globally
window.openPostComposer = openPostComposer;
window.closePostComposer = closePostComposer;
```

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add js/post-composer.js
git commit -m "feat(posts): add post composer modal component"
```

---

## Task 10: Add Post Composer Styles

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add composer modal styles**

Add after the post card styles:

```css
/* Post Composer Modal */
.composer-modal {
  max-width: 600px;
  width: 95%;
}

.composer-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--forest);
}

.char-counter {
  text-align: right;
  font-size: 0.875rem;
  color: var(--ink-secondary);
  margin-top: 0.5rem;
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-remove:hover {
  background: rgba(0, 0, 0, 0.8);
}

.image-upload-area {
  display: flex;
  justify-content: center;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "feat(posts): add post composer modal styles"
```

---

## Task 11: Add Post Composer Script to community.html

**Files:**
- Modify: `community.html`

**Step 1: Add post-composer.js script**

Update the scripts section to include post-composer.js:

```html
    <!-- Scripts -->
    <script type="module" src="js/firebase-init.js"></script>
    <script src="js/storage-service.js"></script>
    <script src="js/auth-manager.js"></script>
    <script src="js/fish-data.js"></script>
    <script src="js/public-tank-manager.js"></script>
    <script src="js/post-manager.js"></script>
    <script src="js/post-composer.js"></script>
    <script src="js/community.js"></script>
```

**Step 2: Commit**

```bash
git add community.html
git commit -m "feat(posts): add post-composer.js to community page"
```

---

## Task 12: Create Post Detail Page

**Files:**
- Create: `post.html`

**Step 1: Create the post detail page**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Post | Comparium</title>
    <meta name="description" content="View community post on Comparium" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="favicon.ico" />

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600&display=swap"
      rel="stylesheet"
    />

    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/naturalist.css" />
  </head>
  <body>
    <!-- Header -->
    <header class="header">
      <a href="index.html" class="logo">Comparium</a>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="compare.html">Compare</a>
        <a href="glossary.html">Glossary</a>
        <a href="community.html">Community</a>
        <a href="faq.html">FAQ</a>
        <a href="dashboard.html">Dashboard</a>
        <div id="auth-links">
          <a href="login.html">Login</a>
          <a href="signup.html" class="nav-cta">Sign Up</a>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="post-detail-main">
      <div id="post-container" class="post-detail-container">
        <div class="community-loading">
          <p>Loading post...</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>Comparium &copy; 2026 | Built for aquarium enthusiasts</p>
    </footer>

    <!-- Scripts -->
    <script type="module" src="js/firebase-init.js"></script>
    <script src="js/storage-service.js"></script>
    <script src="js/auth-manager.js"></script>
    <script src="js/post-manager.js"></script>
    <script src="js/post-detail.js"></script>
  </body>
</html>
```

**Step 2: Commit**

```bash
git add post.html
git commit -m "feat(posts): add post detail page structure"
```

---

## Task 13: Create Post Detail JavaScript

**Files:**
- Create: `js/post-detail.js`

**Step 1: Create post detail logic**

```javascript
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
  const container = document.getElementById('post-container');

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
  const categoryLabel = window.postManager?.POST_CATEGORIES?.[post.category]?.label || post.category;

  let imagesHTML = '';
  if (post.imageUrls && post.imageUrls.length > 0) {
    const imageClass = post.imageUrls.length === 1 ? 'single' :
                       post.imageUrls.length === 2 ? 'double' :
                       post.imageUrls.length === 3 ? 'triple' : 'quad';
    imagesHTML = `
      <div class="post-detail__images ${imageClass}">
        ${post.imageUrls.map((url, i) => `
          <img src="${url}" alt="Post image ${i + 1}" onclick="window.open('${url}', '_blank')">
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <article class="post-detail">
      <div class="post-detail__header">
        <div class="post-card__avatar" onclick="viewProfile('${post.author?.username}')">
          ${post.author?.avatarUrl
            ? `<img src="${post.author.avatarUrl}" alt="${post.author.username}">`
            : (post.author?.username || 'A').charAt(0).toUpperCase()
          }
        </div>
        <div class="post-detail__meta">
          <a href="profile.html?user=${encodeURIComponent(post.author?.username || '')}" class="post-detail__author">
            @${post.author?.username || 'anonymous'}
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
```

**Step 2: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 3: Commit**

```bash
git add js/post-detail.js
git commit -m "feat(posts): add post detail page logic"
```

---

## Task 14: Add Post Detail Styles

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add post detail page styles**

```css
/* Post Detail Page */
.post-detail-main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.post-detail-container {
  min-height: 400px;
}

.post-detail {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.post-detail__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.post-detail__meta {
  flex: 1;
}

.post-detail__author {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  font-size: 1.1rem;
}

.post-detail__author:hover {
  color: var(--forest);
}

.post-detail__info {
  font-size: 0.875rem;
  color: var(--ink-secondary);
  margin-top: 0.25rem;
}

.post-detail__content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--ink);
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-detail__images {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
}

.post-detail__images.single {
  grid-template-columns: 1fr;
}

.post-detail__images.single img {
  max-height: 500px;
  object-fit: contain;
  background: var(--ivory);
}

.post-detail__images.double,
.post-detail__images.triple,
.post-detail__images.quad {
  grid-template-columns: 1fr 1fr;
}

.post-detail__images img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  cursor: pointer;
}

.post-detail__actions {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}

.post-detail__comments {
  margin-top: 1.5rem;
}

.post-detail__comments h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.comments-placeholder {
  color: var(--ink-secondary);
  font-style: italic;
  padding: 2rem;
  text-align: center;
  background: var(--ivory);
  border-radius: 8px;
}

.back-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--forest);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "feat(posts): add post detail page styles"
```

---

## Task 15: Manual Testing Checklist

**No code changes - verification only**

**Step 1: Start local server**

```bash
http-server -c-1
```

**Step 2: Test in browser at http://localhost:8080/community.html**

Verify the following:

- [ ] Community page loads without errors (check console F12)
- [ ] Tanks/Posts tabs appear and switch views correctly
- [ ] Tanks view shows existing shared tanks (or empty state)
- [ ] Posts view shows category filter buttons
- [ ] "New Post" button appears when logged in
- [ ] Post composer modal opens when clicking "New Post"
- [ ] Can select category in composer
- [ ] Can type content in composer
- [ ] Character counter updates
- [ ] Can select images (up to 4)
- [ ] Can remove selected images
- [ ] Can submit a post (creates in Firestore)
- [ ] New post appears in feed after refresh
- [ ] Clicking post navigates to post.html?id=xxx
- [ ] Post detail page displays correctly
- [ ] Back to Community link works
- [ ] Category filtering works
- [ ] Sort toggle (Newest/Top) works

**Step 3: Commit test completion note**

```bash
git commit --allow-empty -m "test(posts): Phase 4.1 manual testing complete"
```

---

## Task 16: Deploy Security Rules and Indexes

**Files:**
- Deploy: `firestore.rules`
- Deploy: `firestore.indexes.json`

**Step 1: Deploy security rules**

```bash
firebase deploy --only firestore:rules
```

Expected: Deployment successful

**Step 2: Deploy indexes**

```bash
firebase deploy --only firestore:indexes
```

Expected: Indexes building (may take a few minutes)

**Step 3: Commit deployment note**

```bash
git commit --allow-empty -m "deploy(posts): security rules and indexes deployed"
```

---

## Summary

After completing all 16 tasks, Phase 4.1 Core Posts is complete:

**Created:**
- `js/post-manager.js` - Post CRUD operations
- `js/post-composer.js` - Modal for creating posts
- `js/post-detail.js` - Post detail page logic
- `post.html` - Post detail page

**Modified:**
- `firestore.rules` - Added posts security rules
- `firestore.indexes.json` - Added posts indexes
- `js/firebase-init.js` - Added Firestore post functions
- `community.html` - Added Posts/Tanks tabs
- `js/community.js` - Added posts view logic
- `css/naturalist.css` - Added posts styles

**Deployed:**
- Security rules
- Firestore indexes

---

## Next Phase: 4.2 Comments & Likes

The comments and likes functionality builds on this foundation.
