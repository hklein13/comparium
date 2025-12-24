# Phase 2: localStorage → Firestore Migration - Implementation Plan

## Executive Summary

**Goal**: Migrate existing localStorage users to Firestore seamlessly while fixing critical issues identified in code review.

**Scope**:
- Fix 5 critical bugs blocking migration
- Implement migration detection and prompt system
- Create safe, reversible migration flow
- Preserve all user data (tanks, favorites, comparisons)

**Timeline**: 4-5 days (with testing)

---

## Prerequisites (Critical Bug Fixes)

### Step 1: Fix Critical Issues FIRST
**Duration**: 1 day
**Branch**: Create `bugfix/pre-migration-critical-fixes`

#### 1.1 Fix Registration Atomicity (`storage-service.js`)
**Problem**: Orphaned username documents if profile save fails

**Solution**: Add cleanup logic
```javascript
async registerUser(username, password, email) {
    let uid = null;
    let usernameCreated = false;

    try {
        // ... existing validation ...

        // Create Firebase Auth user
        const userCredential = await window.firebaseSignUp(auth, email, password);
        uid = userCredential.user.uid;

        // Create username mapping
        const usernameMapped = await window.firestoreCreateUsername(username, uid, email);
        if (!usernameMapped) {
            // CLEANUP: Delete the auth user we just created
            await userCredential.user.delete();
            return { success: false, message: 'Username is already taken. Please try another.' };
        }
        usernameCreated = true;

        // Create user profile
        const user = { /* ... */ };
        const profileSaved = await window.firestoreSetProfile(uid, user);

        if (!profileSaved) {
            // CLEANUP: Delete username document
            await window.firestoreDeleteUsername(username);
            // CLEANUP: Delete auth user
            await window.firebaseAuth.currentUser?.delete();
            return { success: false, message: 'Failed to create account. Please try again.' };
        }

        return { success: true, message: 'Account created successfully!' };

    } catch (error) {
        // CLEANUP on any error
        if (usernameCreated) {
            await window.firestoreDeleteUsername(username);
        }
        if (uid) {
            await window.firebaseAuth.currentUser?.delete();
        }
        // ... existing error handling ...
    }
}
```

**Files to modify**:
- `js/storage-service.js` (lines 27-90)
- `js/firebase-init.js` (add `firestoreDeleteUsername` function)

---

#### 1.2 Fix Username Existence Check (`firebase-init.js`)
**Problem**: Returns `false` on network errors

**Solution**: Return error state instead
```javascript
window.firestoreUsernameExists = async (username) => {
  if (!firestore) return { error: true, exists: false };
  try {
    const ref = doc(firestore, 'usernames', username);
    const snap = await getDoc(ref);
    return { error: false, exists: snap.exists() };
  } catch (e) {
    console.error('firestoreUsernameExists error:', e);
    return { error: true, exists: false }; // Signal error state
  }
};
```

**Update callers** in `storage-service.js:36-40`:
```javascript
const result = await window.firestoreUsernameExists(username);
if (result.error) {
    return { success: false, message: 'Database connection unavailable. Please try again later.' };
}
if (result.exists) {
    return { success: false, message: 'Username already exists' };
}
```

**Files to modify**:
- `js/firebase-init.js` (lines 252-262)
- `js/storage-service.js` (lines 36-40)

---

#### 1.3 Fix isLoggedIn Sync Issue (`storage-service.js`)
**Problem**: Synchronous method calling async code

**Solution**: Only check Firebase auth state (synchronous)
```javascript
isLoggedIn() {
    const auth = window.firebaseAuth;
    return !!(auth && auth.currentUser);
}
```

**Files to modify**:
- `js/storage-service.js` (lines 216-220)

---

#### 1.4 Fix Page Load Race Conditions (`login.html`, `signup.html`)
**Problem**: Checking auth before Firebase initializes

**Solution**: Wait for Firebase ready
```javascript
// signup.html and login.html
(async () => {
    // Wait for Firebase to initialize
    while (!window.firebaseAuthReady) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    const user = await window.firebaseAuthReady;

    if (user) {
        // Already logged in - redirect
        window.location.href = 'dashboard.html';
    }
})();
```

**Files to modify**:
- `login.html` (replace line 86)
- `signup.html` (replace line 113)

---

#### 1.5 Fix Login Form Field Type (`login.html`)
**Problem**: Email-type field rejects username input

**Solution**: Change to text type, update validation
```html
<label for="identifier">Email or Username</label>
<input
    type="text"
    id="identifier"
    name="identifier"
    required
    autocomplete="username"
    placeholder="username or email@example.com"
>
```

**Update JS validation**:
```javascript
async function handleLogin(e) {
    e.preventDefault();

    const messageDisplay = document.getElementById('message-display');
    const submitButton = e.target.querySelector('button[type="submit"]');
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous messages
    messageDisplay.innerHTML = '';

    // Disable button during login
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
        const result = await authManager.login(identifier, password);

        if (result.success) {
            messageDisplay.innerHTML = `<div class="success-message">${result.message} Redirecting...</div>`;
            setTimeout(() => {
                authManager.redirectAfterLogin();
            }, 1000);
        } else {
            messageDisplay.innerHTML = `<div class="error-message">${result.message}</div>`;
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageDisplay.innerHTML = `<div class="error-message">Login failed. Please try again.</div>`;
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}
```

**Files to modify**:
- `login.html` (lines 44-51, 90-107)

---

#### 1.6 Remove Dead localStorage Code (`storage-service.js`)
**Problem**: Confusing localStorage code in Firestore-only system

**Solution**: Delete lines 525-543, keep only Firestore path
```javascript
async importUserData(uid, importData) {
    try {
        if (!uid) return { success: false };

        if (window.firebaseFirestore && window.firestoreImportUserData) {
            return await window.firestoreImportUserData(uid, importData);
        }

        return { success: false, message: 'Database connection unavailable' };
    } catch (error) {
        console.error('Error importing data:', error);
        return { success: false };
    }
}
```

**Files to modify**:
- `js/storage-service.js` (lines 517-544)

---

### Testing Checklist for Bug Fixes

- [ ] Test registration failure scenarios (network error, duplicate username, etc.)
- [ ] Test username availability check with network errors
- [ ] Test `isLoggedIn()` returns correct value immediately
- [ ] Test login/signup redirect when already logged in
- [ ] Test login with both username and email
- [ ] Verify no localStorage references remain (except theme)

---

## Phase 2A: Migration Detection System

### Step 2: Detect Legacy localStorage Data
**Duration**: 0.5 days
**Branch**: Same as above or `feature/migration-detection`

#### 2.1 Create Migration Detector (`js/migration-detector.js`)

```javascript
// ============================================================================
// MIGRATION DETECTOR - Detect localStorage users needing migration
// ============================================================================

class MigrationDetector {
    constructor() {
        this.legacyUserKeys = [];
        this.currentUserKey = null;
    }

    /**
     * Scan localStorage for legacy user data
     * @returns {Object} { hasLegacyData: boolean, users: Array<string>, currentUser: string|null }
     */
    detectLegacyData() {
        const legacyUsers = [];
        let currentUser = null;

        // Scan for user_{username} patterns
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            // Match user_{username} pattern
            if (key && key.startsWith('user_')) {
                const username = key.substring(5); // Remove "user_" prefix
                legacyUsers.push(username);
            }

            // Check for currentUser
            if (key === 'currentUser') {
                currentUser = localStorage.getItem('currentUser');
            }
        }

        return {
            hasLegacyData: legacyUsers.length > 0,
            users: legacyUsers,
            currentUser: currentUser
        };
    }

    /**
     * Get legacy user profile from localStorage
     * @param {string} username
     * @returns {Object|null}
     */
    getLegacyUserProfile(username) {
        try {
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return null;
            return JSON.parse(userJson);
        } catch (e) {
            console.error('Error parsing legacy user data:', e);
            return null;
        }
    }

    /**
     * Check if current logged-in user has legacy data
     * @param {string} username - Current Firestore username
     * @returns {boolean}
     */
    hasLegacyDataForUser(username) {
        return localStorage.getItem(`user_${username}`) !== null;
    }

    /**
     * Clean up legacy data after successful migration
     * @param {string} username
     */
    cleanupLegacyData(username) {
        localStorage.removeItem(`user_${username}`);
        localStorage.removeItem(`username_map_${username}`);
        localStorage.removeItem('currentUser');
        console.log(`Cleaned up legacy data for ${username}`);
    }

    /**
     * Get summary of legacy data for display
     * @param {string} username
     * @returns {Object|null}
     */
    getLegacyDataSummary(username) {
        const profile = this.getLegacyUserProfile(username);
        if (!profile) return null;

        const tanks = profile.profile?.tanks || [];
        const favorites = profile.profile?.favoriteSpecies || [];
        const comparisons = profile.profile?.comparisonHistory || [];

        return {
            username: username,
            tanksCount: tanks.length,
            favoritesCount: favorites.length,
            comparisonsCount: comparisons.length,
            created: profile.created || 'Unknown',
            hasTanks: tanks.length > 0,
            hasFavorites: favorites.length > 0,
            hasComparisons: comparisons.length > 0
        };
    }
}

// Create singleton
const migrationDetector = new MigrationDetector();
```

**Files to create**:
- `js/migration-detector.js` (new file)

---

## Phase 2B: Migration UI and Flow

### Step 3: Create Migration Prompt UI
**Duration**: 0.5 days

#### 3.1 Create Migration Modal Component

Create `css/migration-modal.css`:
```css
.migration-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.migration-modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    padding: 2rem;
    animation: slideUp 0.3s ease;
}

.migration-modal h2 {
    margin-top: 0;
    color: #333;
    font-size: 1.5rem;
}

.migration-modal p {
    color: #666;
    line-height: 1.6;
}

.migration-data-summary {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
}

.migration-data-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ddd;
}

.migration-data-item:last-child {
    border-bottom: none;
}

.migration-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.migration-buttons button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-migrate {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-migrate:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-skip {
    background: #e0e0e0;
    color: #666;
}

.btn-skip:hover {
    background: #d0d0d0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
```

Create `js/migration-ui.js`:
```javascript
// ============================================================================
// MIGRATION UI - Modal and progress display
// ============================================================================

class MigrationUI {
    constructor() {
        this.modal = null;
    }

    /**
     * Show migration prompt modal
     * @param {Object} summary - Data summary from migrationDetector
     * @param {Function} onMigrate - Callback when user clicks Migrate
     * @param {Function} onSkip - Callback when user clicks Skip
     */
    showMigrationPrompt(summary, onMigrate, onSkip) {
        // Create modal HTML
        const modalHTML = `
            <div class="migration-modal-overlay" id="migration-modal">
                <div class="migration-modal">
                    <h2>🔄 Migrate Your Data to Cloud Storage</h2>
                    <p>We've detected local data in your browser. Would you like to migrate it to secure cloud storage?</p>

                    <div class="migration-data-summary">
                        <h3>What will be migrated:</h3>
                        <div class="migration-data-item">
                            <span>🏠 Tanks</span>
                            <strong>${summary.tanksCount}</strong>
                        </div>
                        <div class="migration-data-item">
                            <span>⭐ Favorite Species</span>
                            <strong>${summary.favoritesCount}</strong>
                        </div>
                        <div class="migration-data-item">
                            <span>📊 Comparison History</span>
                            <strong>${summary.comparisonsCount}</strong>
                        </div>
                    </div>

                    <p><strong>Benefits:</strong></p>
                    <ul>
                        <li>✅ Access your data from any device</li>
                        <li>✅ Automatic cloud backup</li>
                        <li>✅ Never lose your tank plans</li>
                    </ul>

                    <div class="migration-buttons">
                        <button class="btn-migrate" id="btn-migrate">Migrate Now</button>
                        <button class="btn-skip" id="btn-skip">Skip for Now</button>
                    </div>

                    <p style="font-size: 0.85rem; color: #999; margin-top: 1rem;">
                        Your local data will be safely preserved until migration completes.
                    </p>
                </div>
            </div>
        `;

        // Append to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('migration-modal');

        // Attach event listeners
        document.getElementById('btn-migrate').onclick = () => {
            this.closeModal();
            onMigrate();
        };

        document.getElementById('btn-skip').onclick = () => {
            this.closeModal();
            onSkip();
        };
    }

    /**
     * Show migration progress
     */
    showMigrationProgress() {
        if (this.modal) this.closeModal();

        const progressHTML = `
            <div class="migration-modal-overlay" id="migration-progress">
                <div class="migration-modal">
                    <h2>🔄 Migrating Your Data...</h2>
                    <p>Please wait while we transfer your data to cloud storage.</p>
                    <div style="text-align: center; padding: 2rem;">
                        <div class="spinner"></div>
                        <p style="margin-top: 1rem; color: #666;">This should only take a few seconds.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', progressHTML);
        this.modal = document.getElementById('migration-progress');
    }

    /**
     * Show migration success
     */
    showMigrationSuccess() {
        if (this.modal) this.closeModal();

        const successHTML = `
            <div class="migration-modal-overlay" id="migration-success">
                <div class="migration-modal">
                    <h2>✅ Migration Complete!</h2>
                    <p>Your data has been successfully migrated to cloud storage.</p>
                    <p>You can now access your tanks, favorites, and comparisons from any device.</p>
                    <div class="migration-buttons">
                        <button class="btn-migrate" id="btn-continue">Continue to Dashboard</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);
        this.modal = document.getElementById('migration-success');

        document.getElementById('btn-continue').onclick = () => {
            this.closeModal();
            window.location.reload();
        };
    }

    /**
     * Show migration error
     * @param {string} errorMessage
     */
    showMigrationError(errorMessage) {
        if (this.modal) this.closeModal();

        const errorHTML = `
            <div class="migration-modal-overlay" id="migration-error">
                <div class="migration-modal">
                    <h2>❌ Migration Failed</h2>
                    <p>We encountered an error while migrating your data:</p>
                    <div style="background: #ffebee; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                        <code>${errorMessage}</code>
                    </div>
                    <p><strong>Don't worry!</strong> Your local data is safe and unchanged.</p>
                    <div class="migration-buttons">
                        <button class="btn-migrate" id="btn-retry">Try Again</button>
                        <button class="btn-skip" id="btn-close">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', errorHTML);
        this.modal = document.getElementById('migration-error');

        document.getElementById('btn-retry').onclick = () => {
            this.closeModal();
            // Trigger retry - implementation depends on where this is called from
        };

        document.getElementById('btn-close').onclick = () => {
            this.closeModal();
        };
    }

    /**
     * Close and remove modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

// Create singleton
const migrationUI = new MigrationUI();
```

**Files to create**:
- `css/migration-modal.css` (new file)
- `js/migration-ui.js` (new file)

---

## Phase 2C: Migration Logic

### Step 4: Implement Migration Service
**Duration**: 1 day

Create `js/migration-service.js`:
```javascript
// ============================================================================
// MIGRATION SERVICE - Handle localStorage to Firestore migration
// ============================================================================

class MigrationService {
    constructor() {
        this.detector = migrationDetector;
        this.ui = migrationUI;
    }

    /**
     * Main migration orchestrator
     * Checks for legacy data and prompts user to migrate
     */
    async checkAndPromptMigration() {
        // Wait for Firebase to be ready
        while (!window.firebaseAuthReady) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const user = await window.firebaseAuthReady;
        if (!user) {
            // Not logged in, skip migration check
            return;
        }

        // Get username from Firestore profile
        const profile = await window.firestoreGetProfile(user.uid);
        if (!profile || !profile.username) {
            console.warn('No profile found for migration check');
            return;
        }

        const username = profile.username;

        // Check if user has legacy data
        if (!this.detector.hasLegacyDataForUser(username)) {
            // No legacy data, nothing to migrate
            return;
        }

        // Check if user has already been prompted (use sessionStorage to avoid annoying them)
        if (sessionStorage.getItem(`migration_prompted_${username}`)) {
            return;
        }

        // Get summary of legacy data
        const summary = this.detector.getLegacyDataSummary(username);
        if (!summary) {
            console.warn('Could not load legacy data summary');
            return;
        }

        // Mark as prompted (for this session)
        sessionStorage.setItem(`migration_prompted_${username}`, 'true');

        // Show migration prompt
        this.ui.showMigrationPrompt(
            summary,
            () => this.performMigration(user.uid, username),
            () => this.skipMigration(username)
        );
    }

    /**
     * Perform the actual migration
     * @param {string} uid - Firebase Auth UID
     * @param {string} username - Username
     */
    async performMigration(uid, username) {
        this.ui.showMigrationProgress();

        try {
            // 1. Get legacy data
            const legacyProfile = this.detector.getLegacyUserProfile(username);
            if (!legacyProfile) {
                throw new Error('Could not load legacy profile data');
            }

            // 2. Get current Firestore profile
            const firestoreProfile = await window.firestoreGetProfile(uid);
            if (!firestoreProfile) {
                throw new Error('Could not load Firestore profile');
            }

            // 3. Merge data (Firestore takes precedence for duplicates)
            const mergedProfile = this.mergeProfiles(firestoreProfile, legacyProfile);

            // 4. Save merged profile to Firestore
            const saveSuccess = await window.firestoreSetProfile(uid, mergedProfile);
            if (!saveSuccess) {
                throw new Error('Failed to save merged profile to Firestore');
            }

            // 5. Verify save by reading back
            const verifyProfile = await window.firestoreGetProfile(uid);
            if (!verifyProfile) {
                throw new Error('Migration verification failed');
            }

            // 6. Clean up localStorage
            this.detector.cleanupLegacyData(username);

            // 7. Mark migration as complete (in localStorage for persistence)
            localStorage.setItem(`migration_completed_${username}`, new Date().toISOString());

            // 8. Show success
            this.ui.showMigrationSuccess();

            console.log(`✅ Migration successful for ${username}`);

        } catch (error) {
            console.error('Migration failed:', error);
            this.ui.showMigrationError(error.message || 'Unknown error occurred');
        }
    }

    /**
     * Merge legacy and Firestore profiles
     * Strategy: Firestore takes precedence, but add legacy items that don't exist in Firestore
     * @param {Object} firestoreProfile - Current Firestore profile
     * @param {Object} legacyProfile - Legacy localStorage profile
     * @returns {Object} - Merged profile
     */
    mergeProfiles(firestoreProfile, legacyProfile) {
        const merged = JSON.parse(JSON.stringify(firestoreProfile)); // Deep clone

        const legacyTanks = legacyProfile.profile?.tanks || [];
        const legacyFavorites = legacyProfile.profile?.favoriteSpecies || [];
        const legacyComparisons = legacyProfile.profile?.comparisonHistory || [];

        // Merge tanks (avoid duplicates by tank name or ID)
        const existingTankIds = new Set(merged.profile.tanks.map(t => t.id));
        const existingTankNames = new Set(merged.profile.tanks.map(t => t.name.toLowerCase()));

        for (const tank of legacyTanks) {
            if (!existingTankIds.has(tank.id) && !existingTankNames.has(tank.name.toLowerCase())) {
                merged.profile.tanks.push(tank);
            }
        }

        // Merge favorites (simple array union)
        const existingFavorites = new Set(merged.profile.favoriteSpecies);
        for (const species of legacyFavorites) {
            if (!existingFavorites.has(species)) {
                merged.profile.favoriteSpecies.push(species);
            }
        }

        // Merge comparisons (avoid duplicates by ID)
        const existingComparisonIds = new Set(merged.profile.comparisonHistory.map(c => c.id));
        for (const comparison of legacyComparisons) {
            if (!existingComparisonIds.has(comparison.id)) {
                merged.profile.comparisonHistory.push(comparison);
            }
        }

        return merged;
    }

    /**
     * User chose to skip migration (for now)
     * @param {string} username
     */
    skipMigration(username) {
        console.log(`User ${username} skipped migration`);
        // Set flag in localStorage to not prompt again for 7 days
        const skipUntil = new Date();
        skipUntil.setDate(skipUntil.getDate() + 7);
        localStorage.setItem(`migration_skip_until_${username}`, skipUntil.toISOString());
    }

    /**
     * Check if we should prompt for migration (respects skip period)
     * @param {string} username
     * @returns {boolean}
     */
    shouldPromptMigration(username) {
        // Check if user completed migration
        if (localStorage.getItem(`migration_completed_${username}`)) {
            return false;
        }

        // Check if user skipped and skip period hasn't expired
        const skipUntil = localStorage.getItem(`migration_skip_until_${username}`);
        if (skipUntil) {
            const skipDate = new Date(skipUntil);
            if (new Date() < skipDate) {
                return false; // Still in skip period
            }
        }

        return true;
    }
}

// Create singleton
const migrationService = new MigrationService();
```

**Files to create**:
- `js/migration-service.js` (new file)

---

## Phase 2D: Integration

### Step 5: Integrate Migration into Dashboard
**Duration**: 0.5 days

Update `dashboard.html` to trigger migration check:

```html
<!-- Add after firebase-init.js -->
<script src="js/migration-detector.js"></script>
<script src="js/migration-ui.js"></script>
<script src="js/migration-service.js"></script>
<link rel="stylesheet" href="css/migration-modal.css">
```

In dashboard's init script (after line 126):
```javascript
async function loadDashboard(user) {
    // FIRST: Check for migration
    await migrationService.checkAndPromptMigration();

    // THEN: Load profile (might be updated after migration)
    const profile = await window.firestoreGetProfile(user.uid);
    // ... rest of existing code ...
}
```

**Files to modify**:
- `dashboard.html` (add script imports and call migration)

---

## Phase 2E: Testing & Deployment

### Step 6: Comprehensive Testing
**Duration**: 1 day

#### Test Scenarios

1. **Fresh User (No localStorage)**
   - Create new account
   - Verify no migration prompt
   - Add some tanks/favorites
   - Logout and login - verify data persists

2. **Legacy User with Data**
   - Manually create localStorage data for testing
   - Login with Firestore account
   - Verify migration prompt appears
   - Click "Migrate Now"
   - Verify progress modal
   - Verify success modal
   - Verify data appears in dashboard
   - Verify localStorage cleaned up
   - Logout and login - verify data still there (from Firestore)

3. **Legacy User - Skip Migration**
   - Have localStorage data
   - Login
   - Click "Skip for Now"
   - Verify no prompt for 7 days (check localStorage flag)
   - Clear skip flag manually
   - Reload page
   - Verify prompt reappears

4. **Merge Scenario (User has both localStorage and Firestore data)**
   - Create Firestore account with 2 tanks
   - Add localStorage data with 2 different tanks
   - Login
   - Migrate
   - Verify dashboard shows all 4 tanks
   - Verify no duplicates

5. **Migration Failure Scenarios**
   - Simulate network error during save
   - Verify error modal
   - Verify localStorage NOT cleaned up
   - Retry migration
   - Verify success

6. **Edge Cases**
   - Empty localStorage profile (no tanks/favorites/comparisons)
   - Corrupted localStorage JSON
   - Missing profile fields
   - Very large datasets (100+ tanks)

---

### Step 7: Create Playwright Tests
**Duration**: 0.5 days

Add to `tests/migration.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Data Migration Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Set up localStorage with legacy data
        await page.goto('http://localhost:3000');
        await page.evaluate(() => {
            const legacyUser = {
                username: 'testuser',
                email: 'test@example.com',
                created: '2024-01-01T00:00:00Z',
                profile: {
                    tanks: [
                        {
                            id: '1234567890',
                            name: 'Test Tank',
                            size: 20,
                            species: ['neonTetra', 'guppy'],
                            created: '2024-01-01T00:00:00Z'
                        }
                    ],
                    favoriteSpecies: ['neonTetra'],
                    comparisonHistory: []
                }
            };
            localStorage.setItem('user_testuser', JSON.stringify(legacyUser));
        });
    });

    test('should detect legacy data and show migration prompt', async ({ page }) => {
        // Login to Firestore account
        await page.goto('http://localhost:3000/login.html');
        await page.fill('#email', 'test@example.com');
        await page.fill('#password', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/dashboard.html');

        // Verify migration modal appears
        await expect(page.locator('#migration-modal')).toBeVisible();
        await expect(page.locator('.migration-modal h2')).toContainText('Migrate Your Data');
    });

    test('should migrate data successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard.html');

        // Wait for migration prompt
        await page.waitForSelector('#migration-modal');

        // Click migrate button
        await page.click('#btn-migrate');

        // Wait for progress modal
        await page.waitForSelector('#migration-progress');

        // Wait for success modal
        await page.waitForSelector('#migration-success', { timeout: 10000 });
        await expect(page.locator('.migration-modal h2')).toContainText('Migration Complete');

        // Click continue
        await page.click('#btn-continue');

        // Verify localStorage cleaned up
        const hasLegacyData = await page.evaluate(() => {
            return localStorage.getItem('user_testuser') !== null;
        });
        expect(hasLegacyData).toBe(false);

        // Verify data appears in dashboard
        await expect(page.locator('#tank-count')).toContainText('1');
    });

    test('should handle skip migration', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard.html');

        await page.waitForSelector('#migration-modal');
        await page.click('#btn-skip');

        // Verify modal closed
        await expect(page.locator('#migration-modal')).not.toBeVisible();

        // Verify skip flag set
        const skipFlag = await page.evaluate(() => {
            return localStorage.getItem('migration_skip_until_testuser');
        });
        expect(skipFlag).not.toBeNull();
    });
});
```

---

## Deployment Strategy

### Step 8: Phased Rollout
**Duration**: 1 day monitoring

#### Phase 1: Deploy Bug Fixes (Day 1)
1. Create branch: `bugfix/pre-migration-critical-fixes`
2. Implement fixes from Prerequisites section
3. Test thoroughly in local environment
4. Deploy to production
5. Monitor for 24 hours
6. Verify no regressions

#### Phase 2: Deploy Migration (Day 2)
1. Merge bug fixes to main
2. Create branch: `feature/firestore-migration-phase2`
3. Implement migration detection, UI, and service
4. Test all scenarios locally
5. Run Playwright tests
6. Deploy to production
7. Monitor Firestore usage
8. Check for error logs

#### Phase 3: Monitor & Iterate (Days 3-7)
1. Monitor migration success rate
2. Track Firestore read/write usage
3. Gather user feedback
4. Fix any edge cases discovered
5. Optimize performance if needed

---

## Rollback Plan

If migration causes issues:

1. **Immediate (< 5 minutes)**:
   - Set `const MIGRATION_ENABLED = false;` in migration-service.js
   - Deploy hotfix

2. **Full Rollback (< 30 minutes)**:
   - Revert to previous commit
   - Deploy
   - Investigate issues offline

3. **Data Recovery**:
   - Users' localStorage is NEVER deleted until migration succeeds
   - Users can manually export data via dashboard
   - Firebase Firestore data is append-only (no deletes during migration)

---

## Success Metrics

Track these metrics:

- **Migration Attempts**: How many users see the prompt
- **Migration Success Rate**: % of attempts that succeed
- **Migration Failures**: Errors and their causes
- **Skip Rate**: % of users who skip migration
- **Data Integrity**: Compare localStorage vs Firestore after migration
- **Firestore Usage**: Reads/writes per day (should stay under free tier)

---

## Post-Migration Cleanup (Phase 3)

After 30 days of stable operation:

1. Remove localStorage reading code entirely
2. Remove migration detection/UI code
3. Update documentation
4. Simplify storage-service.js
5. Deploy simplified version

---

## Questions to Resolve Before Starting

1. ❓ Do you want users to be able to manually trigger migration from settings?
2. ❓ Should we email users about the migration?
3. ❓ What's the skip period? (Currently: 7 days)
4. ❓ Should we export a backup before migration automatically?
5. ❓ Do you want analytics/telemetry on migration success/failure?

---

## Estimated Timeline

| Phase | Task | Duration | Cumulative |
|-------|------|----------|------------|
| Pre-req | Fix 6 critical bugs | 1 day | Day 1 |
| 2A | Migration detection | 0.5 days | Day 1.5 |
| 2B | Migration UI | 0.5 days | Day 2 |
| 2C | Migration service | 1 day | Day 3 |
| 2D | Integration | 0.5 days | Day 3.5 |
| 2E | Testing | 1 day | Day 4.5 |
| 2E | Playwright tests | 0.5 days | Day 5 |

**Total: 5 days** (with buffer: 6-7 days)

---

## Dependencies

- ✅ Firestore rules deployed (already done)
- ✅ Firebase Auth working (already done)
- ✅ Phase 1 complete (Firestore enabled)
- ⚠️ Critical bugs fixed (must do first)

---

## Notes

- All migration code is non-destructive (localStorage kept until success)
- Migration is user-initiated (they must click "Migrate Now")
- Users can skip migration indefinitely
- All changes are reversible
- No data is ever deleted without user confirmation
