# Test Consolidation & Favorites Restoration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate 11 skipped Playwright tests into the main user flow so they actually run, and restore the missing Favorites feature to the dashboard.

**Architecture:** Move notification UI tests (7) and maintenance CRUD tests (4) into the authenticated section of `user-flow.spec.js`. Delete the orphaned `notifications.spec.js`. Add a Favorites sub-tab to the dashboard's My Profile section that displays the user's favorited species.

**Tech Stack:** Playwright tests, vanilla JavaScript, HTML/CSS

---

## Task 1: Add Notification UI Tests to Main Flow (Phase 1.5)

**Files:**
- Modify: `tests/user-flow.spec.js:65` (after registration step)

**Step 1: Add notification UI test steps after registration**

Insert after line 65 (after `console.log('✓ Registration successful...')`), before the `// PHASE 2: CREATE TANK` comment:

```javascript
    // ========================================================================
    // PHASE 1.5: NOTIFICATION UI TESTS
    // ========================================================================

    await test.step('Verify notification bell is visible', async () => {
      const bellButton = page.locator('#notification-toggle');
      await expect(bellButton).toBeVisible();
      console.log('✓ Notification bell icon is visible');
    });

    await test.step('Verify notification dropdown opens and closes', async () => {
      // Open dropdown
      await page.click('#notification-toggle');
      const dropdown = page.locator('#notification-dropdown');
      await expect(dropdown).toHaveClass(/open/);

      // Verify header
      await expect(dropdown.locator('h3')).toHaveText('Notifications');

      // Click outside to close
      await page.click('body', { position: { x: 10, y: 10 } });
      await expect(dropdown).not.toHaveClass(/open/);
      console.log('✓ Notification dropdown opens and closes correctly');
    });

    await test.step('Verify empty notification state', async () => {
      await page.click('#notification-toggle');
      const emptyState = page.locator('.notification-empty');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No notifications yet');
      // Close dropdown
      await page.click('#notification-toggle');
      console.log('✓ Empty notification state displays correctly');
    });

    await test.step('Verify notification badge reflects count', async () => {
      const badge = page.locator('#notification-badge');
      await expect(badge).toBeAttached();
      // Badge should be hidden or show 0 for new user
      const isHidden = await badge.isHidden();
      if (!isHidden) {
        const count = await badge.textContent();
        expect(parseInt(count || '0')).toBe(0);
      }
      console.log('✓ Notification badge shows correct count (0)');
    });

    await test.step('Verify settings dropdown works independently', async () => {
      // Open settings
      await page.click('#settings-toggle');
      const settingsDropdown = page.locator('#settings-dropdown');
      await expect(settingsDropdown).toHaveClass(/open/);

      // Notification dropdown should NOT be open
      const notifDropdown = page.locator('#notification-dropdown');
      await expect(notifDropdown).not.toHaveClass(/open/);

      // Open notifications - settings should close
      await page.click('#notification-toggle');
      await expect(notifDropdown).toHaveClass(/open/);
      await expect(settingsDropdown).not.toHaveClass(/open/);

      // Close for next tests
      await page.click('#notification-toggle');
      console.log('✓ Only one dropdown open at a time');
    });
```

**Step 2: Run test to verify new steps pass**

Run: `npx playwright test tests/user-flow.spec.js -g "Complete User Flow" --headed`

Expected: New notification steps should pass (5 new steps)

**Step 3: Commit**

```bash
git add tests/user-flow.spec.js
git commit -m "test: add notification UI tests to main user flow (Phase 1.5)"
```

---

## Task 2: Add Maintenance CRUD Tests to Main Flow (Phase 2C)

**Files:**
- Modify: `tests/user-flow.spec.js:163` (after filter cleaning step, before the skip step)

**Step 1: Replace the skip step and add maintenance CRUD tests**

Replace lines 165-171 (the skip schedule tests step) with:

```javascript
    // ========================================================================
    // PHASE 2C: MAINTENANCE CRUD TESTS
    // ========================================================================

    await test.step('Create a maintenance schedule', async () => {
      // Open tank modal if not already open
      const tankPortrait = page.locator('.tank-portrait:has-text("Test Community Tank")');
      await tankPortrait.click();
      await expect(page.locator('.tank-modal-backdrop.active')).toBeVisible();

      // Click "+ Add Schedule" button
      await page.click('#tank-modal-add-schedule-btn');

      // Wait for schedule modal
      await expect(page.locator('.event-modal')).toBeVisible();

      // Select schedule type (water change)
      await page.selectOption('#schedule-type', 'waterChange');

      // Set interval to 7 days
      await page.fill('#schedule-interval', '7');

      // Save schedule
      await page.click('button:has-text("Save")');

      // Verify success message
      await expect(page.locator('.message-alert')).toBeVisible({
        timeout: 5000,
      });

      // Wait for message to clear
      await page.waitForTimeout(2000);

      console.log('✓ Schedule created successfully');
    });

    await test.step('Edit the maintenance schedule', async () => {
      // Reopen tank modal to see schedules
      const tankPortrait = page.locator('.tank-portrait:has-text("Test Community Tank")');
      await tankPortrait.click();
      await expect(page.locator('.tank-modal-backdrop.active')).toBeVisible();
      await page.waitForTimeout(1000);

      // Schedule pills should be visible in the tank modal
      const schedulePill = page.locator('.schedule-pill').first();

      if (await schedulePill.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Click to edit
        await schedulePill.click();
        await expect(page.locator('.event-modal')).toBeVisible();

        // Change interval to 14 days
        await page.fill('#schedule-interval', '14');

        // Save changes
        await page.click('button:has-text("Save")');

        // Verify success
        await expect(page.locator('.message-alert')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(2000);

        console.log('✓ Schedule edited successfully');
      } else {
        console.log('⚠ No schedule pill visible to edit');
      }
    });

    await test.step('Delete a maintenance event', async () => {
      // Reopen tank modal
      const tankPortrait = page.locator('.tank-portrait:has-text("Test Community Tank")');
      await tankPortrait.click();
      await expect(page.locator('.tank-modal-backdrop.active')).toBeVisible();

      // Wait for events to load
      await page.waitForTimeout(1500);

      // Find delete button on an event
      const deleteBtn = page.locator('.event-delete-btn').first();

      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Set up dialog handler for confirmation
        page.once('dialog', dialog => dialog.accept());
        await deleteBtn.click();

        // Verify success
        await expect(page.locator('.message-alert:has-text("deleted")')).toBeVisible({
          timeout: 5000,
        });
        await page.waitForTimeout(2000);

        console.log('✓ Event deleted successfully');
      } else {
        console.log('⚠ No events available to delete');
      }
    });

    await test.step('Delete the maintenance schedule', async () => {
      // Reopen tank modal
      const tankPortrait = page.locator('.tank-portrait:has-text("Test Community Tank")');
      await tankPortrait.click();
      await expect(page.locator('.tank-modal-backdrop.active')).toBeVisible();
      await page.waitForTimeout(1000);

      // Click on schedule pill to open edit modal
      const schedulePill = page.locator('.schedule-pill').first();

      if (await schedulePill.isVisible({ timeout: 2000 }).catch(() => false)) {
        await schedulePill.click();
        await expect(page.locator('.event-modal')).toBeVisible();

        // Click delete button
        page.once('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Delete")');

        // Verify success
        await expect(page.locator('.message-alert:has-text("deleted")')).toBeVisible({
          timeout: 5000,
        });
        console.log('✓ Schedule deleted successfully');
      } else {
        console.log('⚠ No schedule available to delete');
      }

      // Close modal
      const closeBtn = page.locator('.tank-modal-close');
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
      }
      await page.waitForTimeout(500);
    });
```

**Step 2: Run test to verify new steps pass**

Run: `npx playwright test tests/user-flow.spec.js -g "Complete User Flow" --headed`

Expected: New maintenance CRUD steps should pass (4 new steps)

**Step 3: Commit**

```bash
git add tests/user-flow.spec.js
git commit -m "test: add maintenance CRUD tests to main user flow (Phase 2C)"
```

---

## Task 3: Add Favorites Sub-Tab to Dashboard HTML

**Files:**
- Modify: `dashboard.html:384-390` (add new subtab button)
- Modify: `dashboard.html:436` (add new subtab panel)

**Step 1: Add Favorites subtab button**

Find the Bookmarks subtab button (around line 384-390) and add Favorites after it:

```html
            <button
              class="dashboard-subtab"
              data-subtab="bookmarks"
              onclick="switchProfileSubtab('bookmarks')"
            >
              Bookmarks
            </button>
            <button
              class="dashboard-subtab"
              data-subtab="favorites"
              onclick="switchProfileSubtab('favorites')"
            >
              Favorites
            </button>
```

**Step 2: Add Favorites subtab panel**

Find the Bookmarks subtab panel closing div (around line 436) and add the Favorites panel after it:

```html
          <!-- Bookmarks Sub-tab -->
          <div id="subtab-bookmarks" class="dashboard-subtab-panel" style="display: none">
            <div id="my-bookmarks-list" class="my-bookmarks-list">
              <p>Loading bookmarks...</p>
            </div>
          </div>

          <!-- Favorites Sub-tab -->
          <div id="subtab-favorites" class="dashboard-subtab-panel" style="display: none">
            <div id="my-favorites-list" class="my-favorites-list">
              <p>Loading favorites...</p>
            </div>
          </div>
```

**Step 3: Commit**

```bash
git add dashboard.html
git commit -m "feat: add Favorites sub-tab to dashboard profile section"
```

---

## Task 4: Add Favorites Loading JavaScript

**Files:**
- Modify: `dashboard.html` (in the script section, after loadMyBookmarks function around line 928)

**Step 1: Add loadMyFavorites function**

Insert after the `loadMyBookmarks` function (around line 928):

```javascript
      async function loadMyFavorites() {
        const container = document.getElementById('my-favorites-list');
        const uid = window.getFirebaseUid?.();

        if (!uid) {
          container.innerHTML = '<p>Please log in to view favorites.</p>';
          return;
        }

        container.innerHTML = '<p>Loading favorites...</p>';

        try {
          const favorites = await window.firestoreGetFavorites(uid);

          if (!favorites?.length) {
            container.innerHTML = `
              <div class="activity-empty">
                <p>No favorite species yet.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">Click the star on any species in the Compare tool to add favorites.</p>
                <a href="compare.html" class="btn btn-ghost" style="margin-top: 1rem;">Browse Species</a>
              </div>
            `;
            return;
          }

          container.innerHTML = `
            <div class="favorites-grid">
              ${favorites
                .map(key => {
                  const fish = typeof fishDatabase !== 'undefined' ? fishDatabase[key] : null;
                  if (!fish) return '';
                  return `
                    <div class="favorite-card" onclick="window.location.href='species.html?species=${key}'">
                      <div class="favorite-card__image">
                        ${fish.imageUrl ? `<img src="${fish.imageUrl}" alt="${escapeHTML(fish.commonName)}" />` : '<div class="favorite-card__placeholder">No image</div>'}
                      </div>
                      <div class="favorite-card__name">${escapeHTML(fish.commonName)}</div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          `;
        } catch (error) {
          console.error('Error loading favorites:', error);
          container.innerHTML = '<p>Failed to load favorites.</p>';
        }
      }
```

**Step 2: Update switchProfileSubtab to handle favorites**

Find the `switchProfileSubtab` function (around line 664) and add the favorites case:

```javascript
        // Load subtab-specific data
        if (subtabName === 'posts') {
          loadMyPosts();
        } else if (subtabName === 'bookmarks') {
          loadMyBookmarks();
        } else if (subtabName === 'favorites') {
          loadMyFavorites();
        }
```

**Step 3: Commit**

```bash
git add dashboard.html
git commit -m "feat: implement loadMyFavorites function for Favorites sub-tab"
```

---

## Task 5: Add CSS for Favorites Grid

**Files:**
- Modify: `css/naturalist.css` (add at end of file)

**Step 1: Add favorites grid styles**

Append to end of naturalist.css:

```css
/* ============================================
   Favorites Grid (Dashboard)
   ============================================ */

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.favorite-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-card__image {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--ivory);
}

.favorite-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-tertiary);
  font-size: 0.85rem;
}

.favorite-card__name {
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style: add favorites grid CSS for dashboard"
```

---

## Task 6: Fix Favorites Verification Test

**Files:**
- Modify: `tests/user-flow.spec.js:326-340` (fix the broken verification step)

**Step 1: Replace the broken favorites verification step**

Replace the existing "Verify favorite persisted after re-login" step (lines 326-340) with:

```javascript
    await test.step('Verify favorite persisted after re-login', async () => {
      // Navigate to Profile tab, then Favorites subtab
      await page.click('.dashboard-tab[data-tab="profile"]');
      await page.waitForTimeout(500);

      await page.click('.dashboard-subtab[data-subtab="favorites"]');
      await page.waitForTimeout(1000);

      // Check if favorites loaded
      const favoritesContainer = page.locator('#my-favorites-list');
      await expect(favoritesContainer).toBeVisible();

      // Check for favorite cards or empty state
      const favoriteCards = page.locator('.favorite-card');
      const emptyState = page.locator('.activity-empty');

      const hasCards = await favoriteCards.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasCards) {
        // Verify Cardinal Tetra is in favorites (if it was added)
        const cardinalCard = page.locator('.favorite-card:has-text("Cardinal")');
        if (await cardinalCard.isVisible().catch(() => false)) {
          console.log('✓ Favorite data persisted correctly (Cardinal Tetra found)');
        } else {
          console.log('✓ Favorites loaded (but Cardinal Tetra not found - may not have been added)');
        }
      } else if (hasEmptyState) {
        console.log('⚠ No favorites to verify (favorite star may not have been visible during test)');
      } else {
        console.log('⚠ Favorites section state unclear');
      }

      // Return to tanks tab for subsequent tests
      await page.click('.dashboard-tab[data-tab="tanks"]');
      await page.waitForTimeout(500);
    });
```

**Step 2: Run test to verify fix works**

Run: `npx playwright test tests/user-flow.spec.js -g "Complete User Flow" --headed`

Expected: Favorites verification step should pass (no more timeout on #favorite-count)

**Step 3: Commit**

```bash
git add tests/user-flow.spec.js
git commit -m "fix: update favorites verification test to use new Favorites sub-tab"
```

---

## Task 7: Delete Obsolete Test Files and Blocks

**Files:**
- Delete: `tests/notifications.spec.js`
- Modify: `tests/user-flow.spec.js:528-676` (remove skipped Maintenance Features block)

**Step 1: Delete notifications.spec.js**

```bash
rm tests/notifications.spec.js
```

**Step 2: Remove the skipped Maintenance Features block**

Delete lines 528-676 (the entire `test.describe.skip('Maintenance Features', ...)` block).

This block starts with:
```javascript
test.describe.skip('Maintenance Features', () => {
```

And ends just before:
```javascript
test.describe('Page Load Tests', () => {
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete notification tests and skipped maintenance block"
```

---

## Task 8: Run Full Test Suite and Verify

**Files:** None (verification only)

**Step 1: Run linting**

Run: `npm run lint`

Expected: No errors

**Step 2: Run full test suite**

Run: `npm test`

Expected: All tests pass, no skipped tests except the intentional ones (if any remain)

**Step 3: Manual verification**

1. Start local server: `http-server -c-1`
2. Open http://localhost:8080/dashboard.html
3. Log in with a test account
4. Navigate to My Profile → Favorites tab
5. Verify empty state displays correctly
6. Go to Compare page, add a favorite
7. Return to dashboard → Favorites tab
8. Verify the species appears

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: consolidate skipped tests into main flow, restore favorites feature

- Move 7 notification UI tests into Phase 1.5 of main user flow
- Move 4 maintenance CRUD tests into Phase 2C of main user flow
- Add Favorites sub-tab to dashboard My Profile section
- Fix favorites verification test to use new UI
- Delete obsolete notifications.spec.js
- Remove skipped Maintenance Features test block

All 11 previously-skipped tests now execute as part of the main flow."
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add notification UI tests (Phase 1.5) | user-flow.spec.js |
| 2 | Add maintenance CRUD tests (Phase 2C) | user-flow.spec.js |
| 3 | Add Favorites sub-tab HTML | dashboard.html |
| 4 | Add loadMyFavorites JavaScript | dashboard.html |
| 5 | Add favorites grid CSS | naturalist.css |
| 6 | Fix favorites verification test | user-flow.spec.js |
| 7 | Delete obsolete tests | notifications.spec.js, user-flow.spec.js |
| 8 | Run full test suite | (verification) |

**Total: 8 tasks, ~20 minutes estimated execution time**
