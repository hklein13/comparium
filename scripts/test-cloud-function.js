/**
 * Test Script: Cloud Function Simulation
 *
 * Simulates the checkDueSchedules Cloud Function locally.
 * Useful for testing the logic without waiting for the scheduled trigger.
 *
 * Run with: node scripts/test-cloud-function.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be created without actually creating notifications
 *   --create     Actually create the notifications (default)
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
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Same helper as in the Cloud Function
function formatScheduleType(type) {
  const types = {
    waterChange: 'Water change',
    parameterTest: 'Water test',
    filterMaintenance: 'Filter maintenance',
    glassClean: 'Glass cleaning',
  };
  return types[type] || type;
}

async function simulateCheckDueSchedules(dryRun = false) {
  console.log('='.repeat(60));
  console.log('Cloud Function Simulation: checkDueSchedules');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will create notifications)'}`);
  console.log('');

  const now = Timestamp.now();
  console.log(`Current time: ${now.toDate().toISOString()}`);
  console.log('');

  // Step 1: Query tankSchedules
  console.log('Step 1: Querying tankSchedules...');
  let dueSchedulesSnap;
  try {
    dueSchedulesSnap = await db
      .collection('tankSchedules')
      .where('enabled', '==', true)
      .where('nextDue', '<=', now)
      .get();
  } catch (error) {
    if (error.code === 9) {
      console.error('');
      console.error('ERROR: Firestore index not found.');
      console.error('The query requires a composite index on tankSchedules.');
      console.error('');
      console.error('To fix this:');
      console.error('1. Run: firebase deploy --only firestore:indexes');
      console.error('2. Wait a few minutes for the index to build');
      console.error('3. Run this script again');
      console.error('');
      console.error('Or visit the Firebase console and create the index manually:');
      console.error('Collection: tankSchedules');
      console.error('Fields: enabled ASC, nextDue ASC');
      process.exit(1);
    }
    throw error;
  }

  if (dueSchedulesSnap.empty) {
    console.log('  No due schedules found.');
    console.log('');
    console.log('This means either:');
    console.log('  1. No schedules exist in the database');
    console.log('  2. All schedules have nextDue in the future');
    console.log('  3. All schedules are disabled');
    console.log('');
    console.log('To test, create a tank with a schedule that has nextDue in the past.');
    return;
  }

  console.log(`  Found ${dueSchedulesSnap.size} due schedule(s)`);
  console.log('');

  // Step 2: Process each schedule
  console.log('Step 2: Processing schedules...');
  const today = new Date().toISOString().split('T')[0];
  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + 30);
  const expiresAt = Timestamp.fromDate(expiresDate);

  let createdCount = 0;

  for (const scheduleDoc of dueSchedulesSnap.docs) {
    const schedule = scheduleDoc.data();
    const notificationId = `${scheduleDoc.id}_${today}`;

    const typeLabel = formatScheduleType(schedule.type);
    const tankName = schedule.tankName || 'Your tank';

    console.log('');
    console.log(`  Schedule: ${scheduleDoc.id}`);
    console.log(`    User: ${schedule.userId}`);
    console.log(`    Tank: ${tankName}`);
    console.log(`    Type: ${schedule.type} (${typeLabel})`);
    console.log(`    Next Due: ${schedule.nextDue?.toDate?.()?.toISOString() || 'unknown'}`);
    console.log(`    Notification ID: ${notificationId}`);

    if (dryRun) {
      console.log(`    [DRY RUN] Would create notification`);
    } else {
      const notification = {
        userId: schedule.userId,
        type: 'maintenance',
        title: `${typeLabel} due`,
        body: `${tankName}: ${typeLabel} is due`,
        created: now,
        read: false,
        dismissed: false,
        expiresAt: expiresAt,
        action: {
          type: 'navigate',
          url: '/dashboard.html#my-tanks-section',
          data: { tankId: schedule.tankId },
        },
        source: {
          type: 'schedule',
          scheduleId: scheduleDoc.id,
          tankId: schedule.tankId,
          tankName: tankName,
        },
      };

      await db.collection('notifications').doc(notificationId).set(notification);
      console.log(`    ✓ Created notification`);
      createdCount++;
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`  Schedules processed: ${dueSchedulesSnap.size}`);
  if (dryRun) {
    console.log(`  Notifications that would be created: ${dueSchedulesSnap.size}`);
  } else {
    console.log(`  Notifications created: ${createdCount}`);
  }
  console.log('');

  if (!dryRun && createdCount > 0) {
    console.log('✓ Notifications created successfully!');
    console.log('  Refresh your dashboard to see them.');
  }
}

async function listSchedules() {
  console.log('Listing all tankSchedules...\n');

  const snap = await db.collection('tankSchedules').limit(20).get();

  if (snap.empty) {
    console.log('No schedules found in database.');
    return;
  }

  console.log(`Found ${snap.size} schedule(s):\n`);
  for (const doc of snap.docs) {
    const data = doc.data();
    const enabled = data.enabled ? '✓' : '✗';
    const nextDue = data.nextDue?.toDate?.()?.toISOString() || 'not set';
    console.log(`  ${enabled} [${doc.id}]`);
    console.log(`    Tank: ${data.tankName || data.tankId}`);
    console.log(`    Type: ${data.type}`);
    console.log(`    Interval: ${data.intervalDays} days`);
    console.log(`    Next Due: ${nextDue}`);
    console.log(`    Enabled: ${data.enabled}`);
    console.log('');
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
Cloud Function Test Script
==========================

Usage:
  node scripts/test-cloud-function.js              Run simulation (creates notifications)
  node scripts/test-cloud-function.js --dry-run    Show what would happen without changes
  node scripts/test-cloud-function.js list         List all schedules in database
  node scripts/test-cloud-function.js --help       Show this help

This script simulates the checkDueSchedules Cloud Function locally.
`);
  process.exit(0);
}

if (command === 'list') {
  await listSchedules();
} else {
  const dryRun = args.includes('--dry-run');
  await simulateCheckDueSchedules(dryRun);
}

process.exit(0);
