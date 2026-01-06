/**
 * Test Script: Create Test Notification
 *
 * Creates a test notification in Firestore to verify the dashboard UI works.
 * Run with: node scripts/test-create-notification.js <userId>
 *
 * Usage:
 *   node scripts/test-create-notification.js YOUR_USER_ID
 *
 * To find your userId:
 *   1. Open browser DevTools on comparium.net while logged in
 *   2. Run: window.firebaseAuth.currentUser.uid
 *   3. Copy that value as the argument
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('Error: Could not read serviceAccountKey.json');
  console.error('Make sure scripts/serviceAccountKey.json exists.');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function createTestNotification(userId) {
  const now = Timestamp.now();
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 30);

  // Create a unique ID for testing
  const testId = `test_${Date.now()}`;

  const notification = {
    userId: userId,
    type: 'maintenance',
    title: 'Water change due',
    body: 'Test Tank: Water change is due',
    created: now,
    read: false,
    dismissed: false,
    expiresAt: Timestamp.fromDate(expiresDate),
    action: {
      type: 'navigate',
      url: '/dashboard.html#my-tanks-section',
      data: { tankId: 'test-tank-id' },
    },
    source: {
      type: 'test',
      scheduleId: 'test-schedule',
      tankId: 'test-tank-id',
      tankName: 'Test Tank',
    },
  };

  try {
    await db.collection('notifications').doc(testId).set(notification);
    console.log('✓ Test notification created successfully!');
    console.log(`  ID: ${testId}`);
    console.log(`  Title: ${notification.title}`);
    console.log(`  Body: ${notification.body}`);
    console.log('');
    console.log('Now refresh your dashboard to see the notification.');
    console.log('The bell icon should show a badge with "1".');
  } catch (error) {
    console.error('Error creating notification:', error.message);
    process.exit(1);
  }
}

async function deleteTestNotifications(userId) {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('source.type', '==', 'test')
      .get();

    if (snapshot.empty) {
      console.log('No test notifications found to delete.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    console.log(`✓ Deleted ${snapshot.size} test notification(s)`);
  } catch (error) {
    console.error('Error deleting notifications:', error.message);
  }
}

async function listNotifications(userId) {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('created', 'desc')
      .limit(10)
      .get();

    if (snapshot.empty) {
      console.log('No notifications found for this user.');
      return;
    }

    console.log(`Found ${snapshot.size} notification(s):\n`);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const readStatus = data.read ? '✓' : '○';
      console.log(`  ${readStatus} [${doc.id}]`);
      console.log(`    Title: ${data.title}`);
      console.log(`    Body: ${data.body}`);
      console.log(`    Created: ${data.created.toDate().toISOString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing notifications:', error.message);
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];
const userId = args[1] || args[0];

if (!userId || userId === '--help' || userId === '-h') {
  console.log(`
Test Notification Script
========================

Usage:
  node scripts/test-create-notification.js <userId>           Create a test notification
  node scripts/test-create-notification.js list <userId>      List user's notifications
  node scripts/test-create-notification.js delete <userId>    Delete test notifications
  node scripts/test-create-notification.js --help             Show this help

To find your userId:
  1. Open browser DevTools on comparium.net while logged in
  2. Run: window.firebaseAuth.currentUser.uid
  3. Copy that value as the argument
`);
  process.exit(0);
}

if (command === 'list') {
  await listNotifications(userId);
} else if (command === 'delete') {
  await deleteTestNotifications(userId);
} else {
  await createTestNotification(command);
}

process.exit(0);
