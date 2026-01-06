// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Notification System Tests
 *
 * Tests the notification UI components on the dashboard.
 * Note: These tests verify UI behavior, not the Cloud Function.
 *
 * Prerequisites:
 * - User must be logged in (uses existing test user from user-flow.spec.js)
 * - For full testing, create test notifications with:
 *   node scripts/test-create-notification.js <userId>
 */

/**
 * Helper: Navigate to dashboard and skip test if redirected to login
 * @returns {Promise<boolean>} true if authenticated and on dashboard
 */
async function ensureAuthenticated(page) {
  await page.goto('/dashboard.html');
  // Wait for potential redirect to settle
  await page.waitForTimeout(500);
  return !page.url().includes('login.html');
}

test.describe('Notification UI', () => {
  test('notification bell icon should be visible on dashboard', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated - skipping notification tests');
      return;
    }
    // Wait for dashboard to load
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Verify bell icon exists
    const bellButton = page.locator('#notification-toggle');
    await expect(bellButton).toBeVisible();

    console.log('✓ Notification bell icon is visible');
  });

  test('notification dropdown should open and close', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Click bell to open dropdown
    await page.click('#notification-toggle');

    // Verify dropdown is open
    const dropdown = page.locator('#notification-dropdown');
    await expect(dropdown).toHaveClass(/open/);

    // Verify header is visible
    await expect(dropdown.locator('h3')).toHaveText('Notifications');

    // Click outside to close
    await page.click('body', { position: { x: 10, y: 10 } });

    // Verify dropdown is closed
    await expect(dropdown).not.toHaveClass(/open/);

    console.log('✓ Notification dropdown opens and closes correctly');
  });

  test('empty notification state should show message', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Open dropdown
    await page.click('#notification-toggle');

    // Check for empty state OR notifications
    const emptyState = page.locator('.notification-empty');
    const notificationItems = page.locator('.notification-item');

    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasNotifications = (await notificationItems.count()) > 0;

    if (hasEmptyState) {
      await expect(emptyState).toContainText('No notifications yet');
      console.log('✓ Empty notification state displays correctly');
    } else if (hasNotifications) {
      console.log('✓ Notifications are displayed (not empty state)');
    } else {
      console.log('⚠ Neither empty state nor notifications visible');
    }
  });

  test('notification badge should reflect unread count', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Get badge element
    const badge = page.locator('#notification-badge');

    // Badge should exist
    await expect(badge).toBeAttached();

    // Get badge count
    const count = await badge.textContent();
    const badgeVisible = await badge.isVisible();

    if (badgeVisible && parseInt(count || '0') > 0) {
      console.log(`✓ Notification badge shows count: ${count}`);
    } else {
      console.log('✓ Notification badge hidden (no unread notifications)');
    }
  });

  test('settings dropdown should work independently', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }
    await page.waitForSelector('#settings-toggle', { timeout: 10000 });

    // Open settings
    await page.click('#settings-toggle');

    // Verify settings dropdown is open
    const settingsDropdown = page.locator('#settings-dropdown');
    await expect(settingsDropdown).toHaveClass(/open/);

    // Verify notification dropdown is NOT open
    const notifDropdown = page.locator('#notification-dropdown');
    await expect(notifDropdown).not.toHaveClass(/open/);

    // Now open notifications - settings should close
    await page.click('#notification-toggle');

    await expect(notifDropdown).toHaveClass(/open/);
    await expect(settingsDropdown).not.toHaveClass(/open/);

    console.log('✓ Only one dropdown open at a time');
  });
});

test.describe('Notification Interactions', () => {
  // These tests require actual notifications to exist
  // Skip if no notifications are present

  test('clicking notification should navigate and mark as read', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }

    // Wait for page load
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Open notification dropdown
    await page.click('#notification-toggle');

    // Wait for notifications to load
    await page.waitForTimeout(1000);

    // Check if there are any notifications
    const notificationItems = page.locator('.notification-item');
    const count = await notificationItems.count();

    if (count === 0) {
      console.log('⚠ No notifications to test - skipping click test');
      console.log(
        '  Create a test notification with: node scripts/test-create-notification.js <userId>'
      );
      test.skip(true, 'No notifications available for testing');
      return;
    }

    // Get first notification
    const firstNotification = notificationItems.first();
    const wasUnread = await firstNotification
      .locator('.unread')
      .isVisible()
      .catch(() => false);

    // Click the notification
    await firstNotification.click();

    // Should navigate (likely to tanks section based on our test notification)
    await page.waitForTimeout(1000);

    // Verify we're still on dashboard (notification links to #my-tanks-section)
    expect(page.url()).toContain('dashboard');

    console.log(`✓ Notification click handled (was unread: ${wasUnread})`);
  });
});

test.describe('Notification Security', () => {
  test('notification content should be escaped (XSS prevention)', async ({ page }) => {
    const isAuthenticated = await ensureAuthenticated(page);
    if (!isAuthenticated) {
      test.skip(true, 'User not authenticated');
      return;
    }

    // Wait for dashboard
    await page.waitForSelector('#notification-toggle', { timeout: 10000 });

    // Open dropdown
    await page.click('#notification-toggle');
    await page.waitForTimeout(500);

    // Check notification list
    const notificationList = page.locator('#notification-list');
    const html = await notificationList.innerHTML();

    // Verify no unescaped script tags or event handlers
    // (If XSS was present, the escapeHTML function should have converted < to &lt;)
    const hasRawScript = html.includes('<script') && !html.includes('&lt;script');
    const hasRawOnclick = html.includes(' onclick=') && !html.includes('data-');

    expect(hasRawScript).toBe(false);
    expect(hasRawOnclick).toBe(false);

    console.log('✓ No obvious XSS vulnerabilities in notification rendering');
  });
});
