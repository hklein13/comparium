# Phase 4.4: Enhanced Profiles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Restructure Dashboard into tabbed interface with profile management, social features, and notification settings.

**Architecture:** Dashboard gets 3 main tabs (My Tanks, My Profile, Settings). My Profile has 3 sub-tabs (Overview, My Posts, Bookmarks). Profile data stored in user document with new `profile`, `social`, and `notificationPreferences` fields.

**Tech Stack:** Vanilla JS, Firebase Firestore, existing CSS patterns from naturalist.css

---

## Task 1: Add Dashboard Tab Navigation HTML

**Files:**
- Modify: `dashboard.html` (lines ~186-360 - restructure main content area)

**Step 1: Add tab navigation after hero section**

Find the closing `</section>` of `dashboard-hero` (around line 185) and add tab nav:

```html
<!-- Dashboard Tabs -->
<nav class="dashboard-tabs">
  <button class="dashboard-tab active" data-tab="tanks" onclick="switchDashboardTab('tanks')">
    My Tanks
  </button>
  <button class="dashboard-tab" data-tab="profile" onclick="switchDashboardTab('profile')">
    My Profile
  </button>
  <button class="dashboard-tab" data-tab="settings" onclick="switchDashboardTab('settings')">
    Settings
  </button>
</nav>

<!-- Tab Content Container -->
<div class="dashboard-tab-content">
```

**Step 2: Wrap existing tank/maintenance in tanks tab**

Wrap the `dashboard-main-row` div in a tab panel:

```html
<!-- My Tanks Tab -->
<div id="tab-tanks" class="dashboard-tab-panel active">
  <!-- existing dashboard-main-row content stays here -->
</div>
```

**Step 3: Remove activity row (comparisons + favorites)**

Delete the entire `dashboard-activity-row` section (lines ~335-360).

**Step 4: Remove bookmarked posts section from main area**

Delete the `dashboard-bookmarks-section` (lines ~363-373) - it moves to My Profile tab.

**Step 5: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add tab navigation structure"
```

---

## Task 2: Add My Profile Tab HTML Structure

**Files:**
- Modify: `dashboard.html`

**Step 1: Add My Profile tab panel after tanks tab**

```html
<!-- My Profile Tab -->
<div id="tab-profile" class="dashboard-tab-panel" style="display: none;">
  <!-- Profile Sub-tabs -->
  <nav class="dashboard-subtabs">
    <button class="dashboard-subtab active" data-subtab="overview" onclick="switchProfileSubtab('overview')">
      Overview
    </button>
    <button class="dashboard-subtab" data-subtab="posts" onclick="switchProfileSubtab('posts')">
      My Posts
    </button>
    <button class="dashboard-subtab" data-subtab="bookmarks" onclick="switchProfileSubtab('bookmarks')">
      Bookmarks
    </button>
  </nav>

  <!-- Overview Sub-tab -->
  <div id="subtab-overview" class="dashboard-subtab-panel active">
    <div class="profile-card">
      <div class="profile-card__avatar">
        <span id="profile-avatar-letter">U</span>
      </div>
      <div class="profile-card__info">
        <h2 id="profile-card-username">@username</h2>
        <p id="profile-card-details" class="profile-card__details">
          <!-- Experience · Location -->
        </p>
        <p id="profile-card-bio" class="profile-card__bio">
          <!-- Bio text -->
        </p>
        <div id="profile-card-stats" class="profile-card__stats">
          <span><strong id="profile-post-count">0</strong> posts</span>
          <span><strong id="profile-follower-count">0</strong> followers</span>
          <span><strong id="profile-following-count">0</strong> following</span>
        </div>
        <div class="profile-card__actions">
          <button class="btn btn-primary" onclick="openProfileEditModal()">Edit Profile</button>
          <button class="btn btn-ghost" onclick="viewMyProfile()">View Public Profile</button>
        </div>
      </div>
    </div>
  </div>

  <!-- My Posts Sub-tab -->
  <div id="subtab-posts" class="dashboard-subtab-panel" style="display: none;">
    <div id="my-posts-list" class="my-posts-list">
      <p>Loading your posts...</p>
    </div>
  </div>

  <!-- Bookmarks Sub-tab -->
  <div id="subtab-bookmarks" class="dashboard-subtab-panel" style="display: none;">
    <div id="my-bookmarks-list" class="my-bookmarks-list">
      <p>Loading bookmarks...</p>
    </div>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add My Profile tab with sub-tabs"
```

---

## Task 3: Add Settings Tab HTML Structure

**Files:**
- Modify: `dashboard.html`

**Step 1: Add Settings tab panel**

```html
<!-- Settings Tab -->
<div id="tab-settings" class="dashboard-tab-panel" style="display: none;">
  <div class="settings-section">
    <h3>Notification Preferences</h3>
    <p class="settings-description">Control what appears in your notification bell.</p>

    <div class="settings-checkboxes">
      <label class="settings-checkbox">
        <input type="checkbox" id="pref-onComment" checked>
        <span>Someone comments on my post</span>
      </label>
      <label class="settings-checkbox">
        <input type="checkbox" id="pref-onReply" checked>
        <span>Someone replies to my comment</span>
      </label>
      <label class="settings-checkbox">
        <input type="checkbox" id="pref-onLike">
        <span>Someone likes my post or comment</span>
      </label>
      <label class="settings-checkbox">
        <input type="checkbox" id="pref-onFollow" checked>
        <span>Someone follows me</span>
      </label>
      <label class="settings-checkbox">
        <input type="checkbox" id="pref-onFollowingPost">
        <span>Someone I follow creates a post</span>
      </label>
    </div>

    <button class="btn btn-primary" onclick="saveNotificationPreferences()">
      Save Preferences
    </button>
  </div>

  <div class="settings-section">
    <h3>Account</h3>
    <div class="settings-account">
      <div class="settings-row">
        <span class="settings-label">Email</span>
        <span id="settings-email" class="settings-value">user@example.com</span>
      </div>
      <div class="settings-row">
        <span class="settings-label">Password</span>
        <span class="settings-value">••••••••</span>
        <a href="forgot-password.html" class="btn btn-ghost btn-small">Change Password</a>
      </div>
    </div>
  </div>
</div>

</div><!-- Close dashboard-tab-content -->
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add Settings tab with notification preferences"
```

---

## Task 4: Add Profile Edit Modal HTML

**Files:**
- Modify: `dashboard.html`

**Step 1: Add modal before closing body tag**

```html
<!-- Profile Edit Modal -->
<div id="profile-edit-modal" class="modal-backdrop" style="display: none;">
  <div class="modal profile-edit-modal">
    <div class="modal-header">
      <h3>Edit Profile</h3>
      <button class="modal-close" onclick="closeProfileEditModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="edit-bio">Bio</label>
        <textarea id="edit-bio" rows="4" maxlength="500" placeholder="Tell others about yourself..."></textarea>
        <small class="form-hint"><span id="bio-char-count">0</span>/500 characters</small>
      </div>

      <div class="form-group">
        <label for="edit-experience">Experience Level</label>
        <select id="edit-experience">
          <option value="">Select your experience level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div class="form-group">
        <label for="edit-location">Location</label>
        <input type="text" id="edit-location" maxlength="100" placeholder="e.g., California, USA">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeProfileEditModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveProfileChanges()">Save Changes</button>
    </div>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add profile edit modal"
```

---

## Task 5: Add CSS for Dashboard Tabs

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add dashboard tab styles**

```css
/* ============================================
   Dashboard Tabs (Phase 4.4)
   ============================================ */

.dashboard-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin: 0 2rem;
  padding: 0;
}

.dashboard-tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ink-secondary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dashboard-tab:hover {
  color: var(--ink);
}

.dashboard-tab.active {
  color: var(--forest);
  border-bottom-color: var(--forest);
}

.dashboard-tab-content {
  padding: 2rem;
}

.dashboard-tab-panel {
  display: none;
}

.dashboard-tab-panel.active {
  display: block;
}

/* Profile Sub-tabs */
.dashboard-subtabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.dashboard-subtab {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 2rem;
  color: var(--ink-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dashboard-subtab:hover {
  border-color: var(--ink-secondary);
}

.dashboard-subtab.active {
  background: var(--forest);
  border-color: var(--forest);
  color: white;
}

.dashboard-subtab-panel {
  display: none;
}

.dashboard-subtab-panel.active {
  display: block;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(dashboard): Add tab navigation CSS"
```

---

## Task 6: Add CSS for Profile Card and Settings

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add profile card styles**

```css
/* Profile Card */
.profile-card {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  max-width: 600px;
}

.profile-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--forest);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.profile-card__info {
  flex: 1;
}

.profile-card__info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.profile-card__details {
  color: var(--ink-secondary);
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.profile-card__bio {
  margin: 0 0 1rem 0;
  font-style: italic;
  color: var(--ink-secondary);
}

.profile-card__stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.profile-card__stats strong {
  color: var(--ink);
}

.profile-card__actions {
  display: flex;
  gap: 0.75rem;
}

/* Settings */
.settings-section {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 600px;
}

.settings-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.settings-description {
  color: var(--ink-secondary);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.settings-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.settings-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.settings-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--forest);
}

.settings-account {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-label {
  width: 80px;
  color: var(--ink-secondary);
  font-size: 0.9rem;
}

.settings-value {
  flex: 1;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(dashboard): Add profile card and settings CSS"
```

---

## Task 7: Add CSS for Profile Edit Modal

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add modal styles (if not already present)**

```css
/* Profile Edit Modal */
.profile-edit-modal {
  max-width: 480px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--ink-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(dashboard): Add profile edit modal CSS"
```

---

## Task 8: Add Tab Switching JavaScript

**Files:**
- Modify: `dashboard.html` (inline script section)

**Step 1: Add tab switching functions**

Add after the existing script section starts:

```javascript
// ============================================
// Dashboard Tab Navigation
// ============================================

function switchDashboardTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab panels
  document.querySelectorAll('.dashboard-tab-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  const activePanel = document.getElementById(`tab-${tabName}`);
  if (activePanel) {
    activePanel.classList.add('active');
    activePanel.style.display = 'block';
  }

  // Load tab-specific data
  if (tabName === 'profile') {
    loadProfileTab();
  } else if (tabName === 'settings') {
    loadSettingsTab();
  }
}

function switchProfileSubtab(subtabName) {
  // Update subtab buttons
  document.querySelectorAll('.dashboard-subtab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subtab === subtabName);
  });

  // Update subtab panels
  document.querySelectorAll('.dashboard-subtab-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });

  const activePanel = document.getElementById(`subtab-${subtabName}`);
  if (activePanel) {
    activePanel.classList.add('active');
    activePanel.style.display = 'block';
  }

  // Load subtab-specific data
  if (subtabName === 'posts') {
    loadMyPosts();
  } else if (subtabName === 'bookmarks') {
    loadMyBookmarks();
  }
}
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add tab switching JavaScript"
```

---

## Task 9: Add Profile Data Loading Functions

**Files:**
- Modify: `dashboard.html` (inline script section)

**Step 1: Add profile loading functions**

```javascript
// ============================================
// Profile Tab Data Loading
// ============================================

async function loadProfileTab() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return;

  const profile = await window.firestoreGetProfile(uid);
  if (!profile) return;

  // Update avatar
  const username = profile.username || 'User';
  document.getElementById('profile-avatar-letter').textContent = username.charAt(0).toUpperCase();
  document.getElementById('profile-card-username').textContent = `@${username}`;

  // Update details (experience + location)
  const profileData = profile.profile || {};
  const details = [];
  if (profileData.experience) {
    details.push(profileData.experience.charAt(0).toUpperCase() + profileData.experience.slice(1));
  }
  if (profileData.location) {
    details.push(profileData.location);
  }
  document.getElementById('profile-card-details').textContent = details.join(' · ') || 'No details set';

  // Update bio
  const bioEl = document.getElementById('profile-card-bio');
  if (profileData.bio) {
    bioEl.textContent = `"${profileData.bio}"`;
    bioEl.style.display = 'block';
  } else {
    bioEl.style.display = 'none';
  }

  // Update stats
  const social = profile.social || {};
  document.getElementById('profile-post-count').textContent = social.postCount || 0;
  document.getElementById('profile-follower-count').textContent = social.followerCount || 0;
  document.getElementById('profile-following-count').textContent = social.followingCount || 0;
}

async function loadMyPosts() {
  const container = document.getElementById('my-posts-list');
  const uid = window.getFirebaseUid?.();

  if (!uid) {
    container.innerHTML = '<p>Please log in to view your posts.</p>';
    return;
  }

  container.innerHTML = '<p>Loading your posts...</p>';

  try {
    const result = await window.postManager?.getUserPosts(uid);

    if (!result?.success || !result.posts?.length) {
      container.innerHTML = `
        <div class="activity-empty">
          <p>You haven't created any posts yet.</p>
          <a href="community.html" class="btn btn-primary">Create Your First Post</a>
        </div>
      `;
      return;
    }

    container.innerHTML = result.posts.map(post => `
      <div class="my-post-card" onclick="window.location.href='post.html?id=${post.id}'">
        <div class="my-post-card__content">
          <span class="my-post-card__category">${escapeHTML(post.category)}</span>
          <p class="my-post-card__text">${escapeHTML(post.content?.substring(0, 150))}${post.content?.length > 150 ? '...' : ''}</p>
          <span class="my-post-card__meta">${formatTimeAgo(post.created)} · ${post.stats?.likeCount || 0} likes · ${post.stats?.commentCount || 0} comments</span>
        </div>
        <button class="my-post-card__delete" onclick="event.stopPropagation(); deleteMyPost('${post.id}')" title="Delete post">&times;</button>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = '<p>Failed to load posts.</p>';
  }
}

async function deleteMyPost(postId) {
  if (!confirm('Delete this post? This cannot be undone.')) return;

  const result = await window.postManager?.deletePost(postId);
  if (result?.success) {
    loadMyPosts(); // Refresh list
  } else {
    alert(result?.error || 'Failed to delete post');
  }
}

async function loadMyBookmarks() {
  const container = document.getElementById('my-bookmarks-list');
  const uid = window.getFirebaseUid?.();

  if (!uid) {
    container.innerHTML = '<p>Please log in to view bookmarks.</p>';
    return;
  }

  container.innerHTML = '<p>Loading bookmarks...</p>';

  try {
    const bookmarks = await window.socialManager?.getBookmarkedPosts();

    if (!bookmarks?.length) {
      container.innerHTML = `
        <div class="activity-empty">
          <p>No bookmarked posts yet.</p>
          <a href="community.html" class="btn btn-ghost">Browse Community</a>
        </div>
      `;
      return;
    }

    container.innerHTML = bookmarks.map(post => `
      <div class="my-post-card" onclick="window.location.href='post.html?id=${post.id}'">
        <div class="my-post-card__content">
          <span class="my-post-card__author">@${escapeHTML(post.author?.username || 'unknown')}</span>
          <span class="my-post-card__category">${escapeHTML(post.category)}</span>
          <p class="my-post-card__text">${escapeHTML(post.content?.substring(0, 150))}${post.content?.length > 150 ? '...' : ''}</p>
        </div>
        <button class="my-post-card__bookmark bookmarked" onclick="event.stopPropagation(); toggleBookmarkFromList('${post.id}')" title="Remove bookmark">&#9733;</button>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = '<p>Failed to load bookmarks.</p>';
  }
}

async function toggleBookmarkFromList(postId) {
  await window.socialManager?.toggleBookmark(postId);
  loadMyBookmarks(); // Refresh list
}
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add profile data loading functions"
```

---

## Task 10: Add Profile Edit Modal JavaScript

**Files:**
- Modify: `dashboard.html` (inline script section)

**Step 1: Add modal functions**

```javascript
// ============================================
// Profile Edit Modal
// ============================================

function openProfileEditModal() {
  const modal = document.getElementById('profile-edit-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Load current values
  loadProfileEditData();

  // Set up bio character counter
  const bioInput = document.getElementById('edit-bio');
  bioInput.addEventListener('input', updateBioCharCount);
}

function closeProfileEditModal() {
  const modal = document.getElementById('profile-edit-modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

async function loadProfileEditData() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return;

  const profile = await window.firestoreGetProfile(uid);
  const profileData = profile?.profile || {};

  document.getElementById('edit-bio').value = profileData.bio || '';
  document.getElementById('edit-experience').value = profileData.experience || '';
  document.getElementById('edit-location').value = profileData.location || '';

  updateBioCharCount();
}

function updateBioCharCount() {
  const bio = document.getElementById('edit-bio').value;
  document.getElementById('bio-char-count').textContent = bio.length;
}

async function saveProfileChanges() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return;

  const bio = document.getElementById('edit-bio').value.trim();
  const experience = document.getElementById('edit-experience').value;
  const location = document.getElementById('edit-location').value.trim();

  // Validation
  if (bio.length > 500) {
    alert('Bio must be 500 characters or less');
    return;
  }
  if (location.length > 100) {
    alert('Location must be 100 characters or less');
    return;
  }

  try {
    const result = await window.firestoreUpdateProfile(uid, {
      profile: { bio, experience, location }
    });

    if (result.success) {
      closeProfileEditModal();
      loadProfileTab(); // Refresh display
      authManager?.showMessage?.('Profile updated', 'success');
    } else {
      alert(result.error || 'Failed to save profile');
    }
  } catch (error) {
    alert('Failed to save profile');
  }
}

// Close modal on backdrop click
document.getElementById('profile-edit-modal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeProfileEditModal();
  }
});
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add profile edit modal JavaScript"
```

---

## Task 11: Add Settings Tab JavaScript

**Files:**
- Modify: `dashboard.html` (inline script section)

**Step 1: Add settings functions**

```javascript
// ============================================
// Settings Tab
// ============================================

async function loadSettingsTab() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return;

  const profile = await window.firestoreGetProfile(uid);

  // Load email
  const user = window.firebaseAuth?.currentUser;
  document.getElementById('settings-email').textContent = user?.email || 'Not available';

  // Load notification preferences (with defaults)
  const prefs = profile?.notificationPreferences || {
    onComment: true,
    onReply: true,
    onLike: false,
    onFollow: true,
    onFollowingPost: false
  };

  document.getElementById('pref-onComment').checked = prefs.onComment;
  document.getElementById('pref-onReply').checked = prefs.onReply;
  document.getElementById('pref-onLike').checked = prefs.onLike;
  document.getElementById('pref-onFollow').checked = prefs.onFollow;
  document.getElementById('pref-onFollowingPost').checked = prefs.onFollowingPost;
}

async function saveNotificationPreferences() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return;

  const prefs = {
    onComment: document.getElementById('pref-onComment').checked,
    onReply: document.getElementById('pref-onReply').checked,
    onLike: document.getElementById('pref-onLike').checked,
    onFollow: document.getElementById('pref-onFollow').checked,
    onFollowingPost: document.getElementById('pref-onFollowingPost').checked
  };

  try {
    const result = await window.firestoreUpdateProfile(uid, {
      notificationPreferences: prefs
    });

    if (result.success) {
      authManager?.showMessage?.('Preferences saved', 'success');
    } else {
      alert(result.error || 'Failed to save preferences');
    }
  } catch (error) {
    alert('Failed to save preferences');
  }
}
```

**Step 2: Commit**

```bash
git add dashboard.html
git commit -m "feat(dashboard): Add settings tab JavaScript"
```

---

## Task 12: Add Firestore Profile Update Function

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add profile update function**

Add after `firestoreGetProfile`:

```javascript
/**
 * Update user profile fields
 * @param {string} uid - User ID
 * @param {object} updates - Fields to update (profile, social, notificationPreferences)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.firestoreUpdateProfile = async (uid, updates) => {
  if (!firestore || !uid) {
    return { success: false, error: 'Not initialized' };
  }

  try {
    const userRef = doc(firestore, 'users', uid);

    // Build update object with dot notation for nested fields
    const updateData = {};

    if (updates.profile) {
      if (updates.profile.bio !== undefined) updateData['profile.bio'] = updates.profile.bio;
      if (updates.profile.experience !== undefined) updateData['profile.experience'] = updates.profile.experience;
      if (updates.profile.location !== undefined) updateData['profile.location'] = updates.profile.location;
    }

    if (updates.social) {
      if (updates.social.postCount !== undefined) updateData['social.postCount'] = updates.social.postCount;
      if (updates.social.followerCount !== undefined) updateData['social.followerCount'] = updates.social.followerCount;
      if (updates.social.followingCount !== undefined) updateData['social.followingCount'] = updates.social.followingCount;
    }

    if (updates.notificationPreferences) {
      updateData['notificationPreferences'] = updates.notificationPreferences;
    }

    await updateDoc(userRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
};
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(firebase): Add firestoreUpdateProfile function"
```

---

## Task 13: Add getUserPosts to post-manager.js

**Files:**
- Modify: `js/post-manager.js`

**Step 1: Add getUserPosts function**

Find the `getFeedPosts` function and add after it:

```javascript
/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} limit - Max posts to return (default 50)
 * @returns {Promise<{success: boolean, posts: array}>}
 */
async function getUserPosts(userId, limit = 50) {
  if (!userId) {
    return { success: false, posts: [], error: 'User ID required' };
  }

  try {
    const result = await window.firestoreGetUserPosts(userId, limit);
    return result;
  } catch (error) {
    return { success: false, posts: [], error: error.message };
  }
}
```

**Step 2: Export the function in the window.postManager object**

Find the `window.postManager` assignment and add `getUserPosts`:

```javascript
window.postManager = {
  createPost,
  getFeedPosts,
  getUserPosts,  // Add this line
  getPost,
  deletePost,
  POST_CATEGORIES,
};
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Commit**

```bash
git add js/post-manager.js
git commit -m "feat(posts): Add getUserPosts function"
```

---

## Task 14: Add firestoreGetUserPosts to firebase-init.js

**Files:**
- Modify: `js/firebase-init.js`

**Step 1: Add Firestore query function**

Add after `firestoreGetPosts`:

```javascript
/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<{success: boolean, posts: array}>}
 */
window.firestoreGetUserPosts = async (userId, limit = 50) => {
  if (!firestore) return { success: false, posts: [] };

  try {
    const postsRef = collection(firestore, 'posts');
    const q = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('created', 'desc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, posts };
  } catch (error) {
    console.error('Error getting user posts:', error);
    return { success: false, posts: [], error: error.message };
  }
};
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add js/firebase-init.js
git commit -m "feat(firebase): Add firestoreGetUserPosts query"
```

---

## Task 15: Add getBookmarkedPosts to social-manager.js

**Files:**
- Modify: `js/social-manager.js`

**Step 1: Add getBookmarkedPosts function**

Find the bookmark-related functions and add:

```javascript
/**
 * Get all bookmarked posts for current user (with full post data)
 * @returns {Promise<array>} - Array of post objects
 */
async function getBookmarkedPosts() {
  const uid = window.getFirebaseUid?.();
  if (!uid) return [];

  try {
    const { collection, query, where, orderBy, getDocs, doc, getDoc } =
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // Get user's bookmarks
    const bookmarksRef = collection(window.firebaseFirestore, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', uid),
      orderBy('created', 'desc')
    );

    const snapshot = await getDocs(q);
    const bookmarks = snapshot.docs.map(d => d.data());

    // Fetch full post data for each bookmark
    const posts = [];
    for (const bookmark of bookmarks) {
      const postRef = doc(window.firebaseFirestore, 'posts', bookmark.postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        posts.push({ id: postDoc.id, ...postDoc.data() });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error getting bookmarked posts:', error);
    return [];
  }
}
```

**Step 2: Export the function in window.socialManager**

```javascript
window.socialManager = {
  // ... existing exports ...
  getBookmarkedPosts,
};
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Commit**

```bash
git add js/social-manager.js
git commit -m "feat(social): Add getBookmarkedPosts function"
```

---

## Task 16: Add CSS for My Posts Cards

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add my-post-card styles**

```css
/* My Posts Cards */
.my-posts-list,
.my-bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.my-post-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.my-post-card:hover {
  border-color: var(--forest);
}

.my-post-card__content {
  flex: 1;
}

.my-post-card__author {
  font-size: 0.85rem;
  color: var(--forest);
  margin-right: 0.5rem;
}

.my-post-card__category {
  font-size: 0.8rem;
  color: var(--ink-secondary);
  background: var(--ivory);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.my-post-card__text {
  margin: 0.5rem 0;
  color: var(--ink);
  line-height: 1.4;
}

.my-post-card__meta {
  font-size: 0.85rem;
  color: var(--ink-secondary);
}

.my-post-card__delete,
.my-post-card__bookmark {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--ink-secondary);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.my-post-card__delete:hover {
  color: #dc3545;
}

.my-post-card__bookmark.bookmarked {
  color: var(--forest);
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(dashboard): Add my posts card CSS"
```

---

## Task 17: Update Public Profile to Show New Fields

**Files:**
- Modify: `js/profile.js`

**Step 1: Update renderProfileHeader to show bio/experience/location**

Find `renderProfileHeader` function and update:

```javascript
/**
 * Render profile header with bio, experience, location
 */
async function renderProfileHeader(username, firstTank, userId) {
  // Username
  document.getElementById('profile-username').textContent = `@${username}`;

  // Avatar
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
```

**Step 2: Update the loadProfile call to pass userId**

In `loadProfile`, update the `renderProfileHeader` call:

```javascript
// Render profile
await renderProfileHeader(username, tanks[0], userId);
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Commit**

```bash
git add js/profile.js
git commit -m "feat(profile): Display bio, experience, location on public profile"
```

---

## Task 18: Add Profile Bio CSS to Profile Page

**Files:**
- Modify: `css/naturalist.css`

**Step 1: Add profile bio style**

```css
/* Profile Bio */
.profile-bio {
  font-style: italic;
  color: var(--ink-secondary);
  margin: 0.5rem 0 1rem 0;
  max-width: 500px;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(profile): Add profile bio CSS"
```

---

## Task 19: Update Hero Stats to Remove Favorites

**Files:**
- Modify: `dashboard.html`

**Step 1: Remove favorites from hero stats**

Find the `dashboard-hero-stats` div and update to remove favorites:

```html
<div class="dashboard-hero-stats">
  <span class="hero-stat"><span id="tank-count">0</span> tanks</span>
  <span class="hero-stat-divider">·</span>
  <span class="hero-stat"><span id="species-total-count">0</span> species</span>
  <span class="hero-stat-divider">·</span>
  <span class="hero-stat"><span id="follower-count">0</span> followers</span>
  <span class="hero-stat-divider">·</span>
  <span class="hero-stat"><span id="following-count">0</span> following</span>
</div>
```

**Step 2: Remove favorites-related JavaScript**

Remove `loadFavorites` function and references.

**Step 3: Remove `removeFavorite` function and event listener.

**Step 4: Commit**

```bash
git add dashboard.html
git commit -m "refactor(dashboard): Remove favorites section"
```

---

## Task 20: Run Full Test Suite and Fix Any Issues

**Step 1: Run lint**

```bash
npm run lint
```

**Step 2: Run tests**

```bash
npm test
```

**Step 3: Fix any failures**

**Step 4: Final commit if needed**

```bash
git add -A
git commit -m "fix: Address test failures and lint issues"
```

---

## Task 21: Push Branch and Create PR

**Step 1: Push branch**

```bash
git push -u origin claude/phase4-4-enhanced-profiles
```

**Step 2: Report PR ready**

Tell user the branch is ready for PR creation.

---

## Verification Checklist

After implementation, test:

- [ ] Tab navigation works (My Tanks, My Profile, Settings)
- [ ] My Tanks tab shows existing content correctly
- [ ] My Profile > Overview shows profile card
- [ ] Edit Profile modal opens and saves changes
- [ ] My Profile > My Posts shows user's posts
- [ ] My Profile > Bookmarks shows bookmarked posts
- [ ] Settings tab loads notification preferences
- [ ] Save Preferences updates Firestore
- [ ] Public profile shows bio/experience/location
- [ ] Old sections removed (comparisons, favorites)
- [ ] All tests pass
- [ ] No lint errors
