/**
 * Test Script: Firestore Security Rules
 *
 * Tests that Firestore security rules are working correctly.
 * Uses Firebase Admin SDK (bypasses rules) to set up test data,
 * then uses client SDK concepts to verify rule behavior.
 *
 * Run with: node scripts/test-firestore-rules.js
 *
 * Note: This script tests the LOGIC of the rules by examining
 * the rule file. For full integration testing, use the Firebase
 * Emulator Suite with @firebase/rules-unit-testing.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(message) {
  passed++;
  console.log(`  ✓ ${message}`);
}

function fail(message) {
  failed++;
  console.log(`  ✗ ${message}`);
}

function warn(message) {
  warnings++;
  console.log(`  ⚠ ${message}`);
}

function checkRule(rules, pattern, description) {
  if (rules.includes(pattern)) {
    pass(description);
    return true;
  } else {
    fail(`Missing: ${description}`);
    return false;
  }
}

async function analyzeSecurityRules() {
  console.log('='.repeat(60));
  console.log('Firestore Security Rules Analysis');
  console.log('='.repeat(60));
  console.log('');

  // Load firestore.rules
  const rulesPath = join(__dirname, '..', 'firestore.rules');
  let rules;

  try {
    rules = readFileSync(rulesPath, 'utf8');
  } catch (error) {
    fail(`Could not read firestore.rules: ${error.message}`);
    return;
  }

  pass('Loaded firestore.rules');

  // Test 1: Check version and basic structure
  console.log('\nTest 1: Basic Structure');
  checkRule(rules, "rules_version = '2'", 'Uses rules_version 2');
  checkRule(rules, 'service cloud.firestore', 'Defines cloud.firestore service');
  checkRule(rules, 'match /databases/{database}/documents', 'Matches database documents');

  // Test 2: Check helper functions
  console.log('\nTest 2: Helper Functions');
  checkRule(rules, 'function isAuthenticated()', 'Has isAuthenticated helper');
  checkRule(rules, 'request.auth != null', 'isAuthenticated checks for auth');
  checkRule(rules, 'function isOwner(', 'Has isOwner helper');

  // Test 3: Check users collection rules
  console.log('\nTest 3: Users Collection');
  checkRule(rules, 'match /users/{uid}', 'Users collection defined');
  checkRule(rules, 'allow read: if isOwner(uid)', 'Users: owner can read');
  checkRule(rules, 'allow delete: if false', 'Users: delete disabled');

  // Test 4: Check usernames collection rules
  console.log('\nTest 4: Usernames Collection');
  checkRule(rules, 'match /usernames/{username}', 'Usernames collection defined');
  checkRule(rules, 'allow read: if true', 'Usernames: public read for uniqueness check');

  // Test 5: Check tankEvents collection rules
  console.log('\nTest 5: Tank Events Collection');
  checkRule(rules, 'match /tankEvents/{eventId}', 'tankEvents collection defined');
  checkRule(
    rules,
    'resource.data.userId == request.auth.uid',
    'tankEvents: owner check on read/write'
  );

  // Test 6: Check tankSchedules collection rules
  console.log('\nTest 6: Tank Schedules Collection');
  checkRule(rules, 'match /tankSchedules/{scheduleId}', 'tankSchedules collection defined');

  // Test 7: Check notifications collection rules
  console.log('\nTest 7: Notifications Collection');
  const hasNotifications = checkRule(
    rules,
    'match /notifications/{notificationId}',
    'Notifications collection defined'
  );

  if (hasNotifications) {
    checkRule(
      rules,
      "// CREATE: Blocked for clients - Cloud Functions create notifications",
      'Notifications: create blocked for clients (comment present)'
    );
    checkRule(rules, 'allow create: if false', 'Notifications: create blocked');
    checkRule(
      rules,
      "hasOnly(['read', 'dismissed'])",
      'Notifications: update limited to read/dismissed fields'
    );
  }

  // Test 8: Check glossary/species (public read, admin write)
  console.log('\nTest 8: Public Collections');
  checkRule(rules, 'match /glossary/{termId}', 'Glossary collection defined');
  checkRule(rules, 'match /species/{speciesId}', 'Species collection defined');

  // Test 9: Check default deny
  console.log('\nTest 9: Default Deny Rule');
  checkRule(rules, 'match /{document=**}', 'Has catch-all rule');
  checkRule(rules, 'allow read, write: if false', 'Default deny all');

  // Test 10: Security best practices
  console.log('\nTest 10: Security Best Practices');

  // Check for userId validation on creates
  const hasUserIdValidation =
    rules.includes('request.resource.data.userId == request.auth.uid') ||
    rules.includes('request.resource.data.uid == request.auth.uid');
  if (hasUserIdValidation) {
    pass('Creates validate userId matches auth');
  } else {
    fail('Missing userId validation on creates');
  }

  // Check for no dangerous patterns
  // Count public read rules - some are intentional (usernames, species, glossary)
  const publicReadMatches = rules.match(/allow read: if true/g) || [];
  // Expected public collections: usernames, species, glossary (3 collections)
  if (publicReadMatches.length <= 3) {
    pass(`Public read rules: ${publicReadMatches.length} (expected for public reference data)`);
  } else {
    warn(`${publicReadMatches.length} public read rules - verify all are intentional`);
  }

  // Check for dangerous "allow write: if true" (should never exist)
  const publicWriteMatches = rules.match(/allow write: if true/g) || [];
  if (publicWriteMatches.length === 0) {
    pass('No public write rules (good)');
  } else {
    fail('DANGEROUS: Public write rules detected!');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`  Tests passed: ${passed}`);
  console.log(`  Tests failed: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ Some security checks failed. Review the rules above.');
    process.exit(1);
  } else {
    console.log('✅ All security checks passed!');
    console.log('');
    console.log('Note: This is a static analysis. For full testing, use the');
    console.log('Firebase Emulator Suite with @firebase/rules-unit-testing.');
    process.exit(0);
  }
}

analyzeSecurityRules();
