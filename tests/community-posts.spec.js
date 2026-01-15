// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Community Posts E2E Test Suite
 * Tests the community page structure and functionality
 *
 * Test Coverage:
 * - Community page loads and displays correctly
 * - Category filters work
 * - Sort dropdown works
 * - Post cards render with expected structure
 *
 * Note: Tank sharing -> post creation is tested via manual verification
 * due to the complexity of the edit modal flow in automated tests.
 */

test.describe('Community Page Structure', () => {
  test('community page should load and display posts feed', async ({ page }) => {
    await test.step('Navigate to community page', async () => {
      await page.goto('/community.html');
      await expect(page).toHaveTitle(/Community.*Comparium/i);
    });

    await test.step('Wait for Firebase to initialize', async () => {
      await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    });

    await test.step('Verify category filter buttons', async () => {
      // Should have All button (active by default)
      const allBtn = page.locator('button[data-category=""]');
      await expect(allBtn).toBeVisible();
      await expect(allBtn).toHaveClass(/active/);

      // Should have Tanks button
      const tanksBtn = page.locator('button[data-category="tanks"]');
      await expect(tanksBtn).toBeVisible();

      // Should have Help button
      const helpBtn = page.locator('button[data-category="help"]');
      await expect(helpBtn).toBeVisible();

      // Should have Tips button
      const tipsBtn = page.locator('button[data-category="tips"]');
      await expect(tipsBtn).toBeVisible();

      // Should have Fish ID button
      const fishIdBtn = page.locator('button[data-category="fishid"]');
      await expect(fishIdBtn).toBeVisible();

      // Should have Milestones button
      const milestonesBtn = page.locator('button[data-category="milestone"]');
      await expect(milestonesBtn).toBeVisible();

      console.log('✓ All category filter buttons present');
    });

    await test.step('Verify sort dropdown', async () => {
      const sortSelect = page.locator('#post-sort-select');
      await expect(sortSelect).toBeVisible();

      // Should have Newest and Top options
      const options = await sortSelect.locator('option').allTextContents();
      expect(options).toContain('Newest');
      expect(options).toContain('Top');

      console.log('✓ Sort dropdown present with correct options');
    });

    await test.step('Verify posts feed or empty state loads', async () => {
      // Wait for either posts or empty state (loading should complete)
      await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

      // Should not be in loading state
      const loading = page.locator('.community-loading');
      await expect(loading).not.toBeVisible({ timeout: 5000 });

      console.log('✓ Posts feed loaded (posts or empty state visible)');
    });

    console.log('\n✅ Community page structure tests passed\n');
  });
});

test.describe('Community Page Filtering', () => {
  test('category filter should update active state', async ({ page }) => {
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });

    // Wait for initial load
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    await test.step('Click Tanks filter', async () => {
      await page.click('button[data-category="tanks"]');

      // Verify button becomes active
      const tanksBtn = page.locator('button[data-category="tanks"]');
      await expect(tanksBtn).toHaveClass(/active/);

      // All button should not be active
      const allBtn = page.locator('button[data-category=""]');
      await expect(allBtn).not.toHaveClass(/active/);

      console.log('✓ Tanks filter activated');
    });

    await test.step('Click Help filter', async () => {
      await page.click('button[data-category="help"]');

      const helpBtn = page.locator('button[data-category="help"]');
      await expect(helpBtn).toHaveClass(/active/);

      // Tanks should no longer be active
      const tanksBtn = page.locator('button[data-category="tanks"]');
      await expect(tanksBtn).not.toHaveClass(/active/);

      console.log('✓ Help filter activated');
    });

    await test.step('Click All to reset', async () => {
      await page.click('button[data-category=""]');

      const allBtn = page.locator('button[data-category=""]');
      await expect(allBtn).toHaveClass(/active/);

      console.log('✓ All filter resets selection');
    });

    console.log('\n✅ Category filter tests passed\n');
  });

  test('sort dropdown should change sort order', async ({ page }) => {
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    await test.step('Change sort to Top', async () => {
      await page.selectOption('#post-sort-select', 'top');

      // Verify selection changed
      const sortSelect = page.locator('#post-sort-select');
      await expect(sortSelect).toHaveValue('top');

      console.log('✓ Sort changed to Top');
    });

    await test.step('Change sort back to Newest', async () => {
      await page.selectOption('#post-sort-select', 'newest');

      const sortSelect = page.locator('#post-sort-select');
      await expect(sortSelect).toHaveValue('newest');

      console.log('✓ Sort changed back to Newest');
    });

    console.log('\n✅ Sort dropdown tests passed\n');
  });
});

test.describe('Post Card Structure', () => {
  test('post cards should have expected elements when posts exist', async ({ page }) => {
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    const postCount = await page.locator('.post-card').count();

    if (postCount === 0) {
      console.log('⚠ No posts to verify structure - skipping detailed checks');
      return;
    }

    await test.step('Verify post card has header with avatar', async () => {
      const firstPost = page.locator('.post-card').first();
      const header = firstPost.locator('.post-card__header');
      await expect(header).toBeVisible();

      const avatar = firstPost.locator('.post-card__avatar');
      await expect(avatar).toBeVisible();

      console.log('✓ Post header and avatar present');
    });

    await test.step('Verify post card has author', async () => {
      const firstPost = page.locator('.post-card').first();
      const author = firstPost.locator('.post-card__author');
      await expect(author).toBeVisible();

      // Author should start with @
      const authorText = await author.textContent();
      expect(authorText).toMatch(/^@/);

      console.log('✓ Author present and formatted correctly');
    });

    await test.step('Verify post card has category badge', async () => {
      const firstPost = page.locator('.post-card').first();
      const category = firstPost.locator('.post-card__category');
      await expect(category).toBeVisible();

      console.log('✓ Category badge present');
    });

    await test.step('Verify post card has content', async () => {
      const firstPost = page.locator('.post-card').first();
      const content = firstPost.locator('.post-card__content');
      await expect(content).toBeVisible();

      console.log('✓ Content present');
    });

    await test.step('Verify post card has action buttons', async () => {
      const firstPost = page.locator('.post-card').first();
      const actions = firstPost.locator('.post-card__actions');
      await expect(actions).toBeVisible();

      // Should have like and comment buttons
      const actionButtons = firstPost.locator('.post-card__action');
      expect(await actionButtons.count()).toBeGreaterThanOrEqual(2);

      console.log('✓ Action buttons present');
    });

    console.log('\n✅ Post card structure tests passed\n');
  });

  test('tank posts should have tank preview component', async ({ page }) => {
    await page.goto('/community.html');
    await page.waitForFunction(() => window.firebaseFirestore !== undefined, { timeout: 10000 });
    await page.waitForSelector('.post-card, .community-empty', { timeout: 15000 });

    // Filter to Tanks category
    await page.click('button[data-category="tanks"]');
    await page.waitForTimeout(1000);

    const tankPostCount = await page.locator('.post-card').count();

    if (tankPostCount === 0) {
      console.log('⚠ No tank posts to verify preview - skipping');
      return;
    }

    await test.step('Verify tank preview component', async () => {
      const tankPreview = page.locator('.post-card__tank-preview').first();
      await expect(tankPreview).toBeVisible();

      // Should have tank name
      const tankName = page.locator('.post-card__tank-name').first();
      await expect(tankName).toBeVisible();

      // Should have "View Tank" link
      const viewLink = page.locator('.post-card__tank-link').first();
      await expect(viewLink).toBeVisible();

      console.log('✓ Tank preview component renders correctly');
    });

    console.log('\n✅ Tank preview tests passed\n');
  });
});
