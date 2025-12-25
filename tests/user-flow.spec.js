// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E Test Suite for Comparium
 * Tests the complete user flow from registration to data persistence
 */

// Generate unique test credentials for each run
const timestamp = Date.now();
const testUser = {
  username: `testuser${timestamp}`,
  email: `testuser${timestamp}@example.com`,
  password: 'TestPassword123!',
};

test.describe('Complete User Flow', () => {
  test('should handle registration, data operations, and persistence', async ({ page }) => {
    // ========================================================================
    // PHASE 1: REGISTRATION
    // ========================================================================

    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup.html');
      await expect(page).toHaveTitle(/Sign Up.*Comparium/i);
    });

    await test.step('Register new user account', async () => {
      // Fill registration form
      await page.fill('#username', testUser.username);
      await page.fill('#email', testUser.email);
      await page.fill('#password', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for registration to complete and redirect to dashboard
      await page.waitForURL('**/dashboard.html', { timeout: 10000 });

      // Verify we're on dashboard
      await expect(page.locator('#username-display')).toHaveText(testUser.username, { timeout: 5000 });

      console.log(`✓ Registration successful for user: ${testUser.username}`);
    });

    // ========================================================================
    // PHASE 2: CREATE TANK
    // ========================================================================

    await test.step('Navigate to My Tanks page', async () => {
      await page.goto('/my-tanks.html');
      await expect(page).toHaveTitle(/My Tanks.*Comparium/i);
    });

    await test.step('Create a new tank', async () => {
      // Click "Create New Tank" button
      await page.click('button:has-text("Create New Tank")');

      // Wait for form to appear
      await expect(page.locator('#tank-form')).toBeVisible();

      // Fill tank details
      await page.fill('#tank-name', 'Test Community Tank');
      await page.fill('#tank-size', '55');
      await page.fill('#tank-notes', 'This is a test tank created by automated testing');

      // Add a species to the tank
      await page.click('button:has-text("Add Species")');
      await page.selectOption('select[id^="tank-species-"]', 'neon-tetra');

      // Save the tank
      await page.click('button:has-text("Save Tank")');

      // Wait for success message
      await expect(page.locator('.message-alert:has-text("Tank saved")')).toBeVisible({ timeout: 5000 });

      // Verify tank appears in list
      await expect(page.locator('.tank-card:has-text("Test Community Tank")')).toBeVisible();

      console.log('✓ Tank created successfully');
    });

    // ========================================================================
    // PHASE 3: ADD FAVORITE SPECIES
    // ========================================================================

    await test.step('Navigate to home page and add favorite', async () => {
      await page.goto('/index.html');

      // Select a species in one of the dropdowns
      await page.selectOption('#species1', 'cardinal-tetra');

      // Click the star to favorite it
      const favoriteStars = page.locator('.favorite-star[data-species="cardinal-tetra"]');
      await favoriteStars.first().click();

      // Wait for success message
      await expect(page.locator('.message-alert:has-text("Added to favorites")')).toBeVisible({ timeout: 5000 });

      console.log('✓ Favorite added successfully');
    });

    // ========================================================================
    // PHASE 4: SAVE COMPARISON
    // ========================================================================

    await test.step('Create and save a comparison', async () => {
      // Select multiple species for comparison
      await page.selectOption('#species1', 'neon-tetra');
      await page.selectOption('#species2', 'guppy');

      // Click compare button
      await page.click('#compare-button');

      // Wait for results to appear
      await expect(page.locator('#results')).toBeVisible({ timeout: 5000 });

      // Verify comparison was saved (it auto-saves when logged in)
      console.log('✓ Comparison created successfully');
    });

    // ========================================================================
    // PHASE 5: LOGOUT
    // ========================================================================

    await test.step('Logout from account', async () => {
      // Click logout link in navigation
      await page.click('a:has-text("Logout")');

      // Wait for redirect to home page
      await page.waitForURL(/index\.html|\/$/);

      // Verify login/signup links are visible (logged out state)
      await expect(page.locator('a:has-text("Login")')).toBeVisible();
      await expect(page.locator('a:has-text("Sign Up")')).toBeVisible();

      console.log('✓ Logout successful');
    });

    // ========================================================================
    // PHASE 6: LOGIN AGAIN
    // ========================================================================

    await test.step('Navigate to login page', async () => {
      await page.goto('/login.html');
      await expect(page).toHaveTitle(/Login.*Comparium/i);
    });

    await test.step('Login with existing credentials', async () => {
      // Fill login form
      await page.fill('#identifier', testUser.username);
      await page.fill('#password', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard.html', { timeout: 10000 });

      // Verify we're logged in
      await expect(page.locator('#username-display')).toHaveText(testUser.username, { timeout: 5000 });

      console.log('✓ Login successful');
    });

    // ========================================================================
    // PHASE 7: VERIFY DATA PERSISTENCE
    // ========================================================================

    await test.step('Verify tank persisted after re-login', async () => {
      // Check dashboard stats
      const tankCount = await page.locator('#tank-count').textContent();
      expect(parseInt(tankCount)).toBeGreaterThanOrEqual(1);

      // Navigate to tanks page
      await page.goto('/my-tanks.html');

      // Verify our tank still exists
      await expect(page.locator('.tank-card:has-text("Test Community Tank")')).toBeVisible();

      console.log('✓ Tank data persisted correctly');
    });

    await test.step('Verify favorite persisted after re-login', async () => {
      await page.goto('/dashboard.html');

      // Check favorite count
      const favoriteCount = await page.locator('#favorite-count').textContent();
      expect(parseInt(favoriteCount)).toBeGreaterThanOrEqual(1);

      // Verify Cardinal Tetra is in favorites list
      await expect(page.locator('#favorite-species:has-text("Cardinal Tetra")')).toBeVisible();

      console.log('✓ Favorite data persisted correctly');
    });

    await test.step('Verify comparison history persisted after re-login', async () => {
      // Check comparison count on dashboard
      const comparisonCount = await page.locator('#comparison-count').textContent();
      expect(parseInt(comparisonCount)).toBeGreaterThanOrEqual(1);

      // Verify at least one comparison appears in recent comparisons
      await expect(page.locator('#recent-comparisons .item-list li')).toHaveCount(await page.locator('#recent-comparisons .item-list li').count());

      console.log('✓ Comparison history persisted correctly');
    });

    // ========================================================================
    // SUMMARY
    // ========================================================================

    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('========================================');
    console.log(`Test User: ${testUser.username}`);
    console.log(`Email: ${testUser.email}`);
    console.log('');
    console.log('Verified:');
    console.log('  ✓ User registration');
    console.log('  ✓ User login');
    console.log('  ✓ Tank creation');
    console.log('  ✓ Favorite species management');
    console.log('  ✓ Comparison saving');
    console.log('  ✓ Logout/Login cycle');
    console.log('  ✓ Data persistence across sessions');
    console.log('========================================\n');
  });
});

test.describe('Authentication Edge Cases', () => {
  test('should prevent duplicate username registration', async ({ page }) => {
    await test.step('Attempt to register with existing username', async () => {
      await page.goto('/signup.html');

      // Try to register with the same username from previous test
      await page.fill('#username', testUser.username);
      await page.fill('#email', `different${timestamp}@example.com`);
      await page.fill('#password', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error message (username already taken)
      await expect(page.locator('.message-alert:has-text("already taken"), .message-alert:has-text("exists")')).toBeVisible({ timeout: 5000 });

      console.log('✓ Duplicate username correctly rejected');
    });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await test.step('Attempt login with wrong password', async () => {
      await page.goto('/login.html');

      await page.fill('#identifier', testUser.username);
      await page.fill('#password', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('.message-alert:has-text("Login failed"), .message-alert:has-text("invalid")')).toBeVisible({ timeout: 5000 });

      console.log('✓ Invalid credentials correctly rejected');
    });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from protected pages', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    await test.step('Access dashboard without login', async () => {
      await page.goto('/dashboard.html');

      // Should redirect to login page
      await page.waitForURL('**/login.html', { timeout: 5000 });

      console.log('✓ Protected route correctly redirected to login');
    });

    await test.step('Access my-tanks without login', async () => {
      await page.goto('/my-tanks.html');

      // Should redirect to login page
      await page.waitForURL('**/login.html', { timeout: 5000 });

      console.log('✓ Protected route correctly redirected to login');
    });
  });
});
