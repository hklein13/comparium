/**
 * Comparium Cloud Functions
 *
 * This file contains all Cloud Functions for the Comparium platform.
 * Functions are deployed to Firebase and run server-side.
 *
 * IMPORTANT: This uses CommonJS (require), not ES6 modules (import)
 *
 * Deployment: firebase deploy --only functions
 * Logs: firebase functions:log
 */

const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
// In Cloud Functions environment, this automatically uses project credentials
initializeApp();
const db = getFirestore();

/**
 * TEST FUNCTION: helloComparium
 *
 * Purpose: Verify Cloud Functions deployment and Firestore connection
 * Trigger: HTTP GET request
 * URL: https://us-central1-comparium-21b69.cloudfunctions.net/helloComparium
 *
 * Returns JSON with:
 * - success: boolean
 * - message: string
 * - firestoreConnected: boolean
 * - tankSchedulesExist: boolean (tests Firestore read)
 * - timestamp: ISO date string
 *
 * Usage: Visit the URL in a browser after deployment to verify everything works.
 */
exports.helloComparium = onRequest(async (req, res) => {
  // Enable CORS for requests from comparium.net (and localhost for testing)
  const allowedOrigins = ['https://comparium.net', 'http://localhost:8080'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Test Firestore connection by querying tankSchedules collection
    const schedulesSnap = await db.collection('tankSchedules').limit(1).get();

    res.json({
      success: true,
      message: 'Hello from Comparium Cloud Functions!',
      firestoreConnected: true,
      tankSchedulesExist: !schedulesSnap.empty,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in helloComparium:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================
// PHASE 2: NOTIFICATION FUNCTIONS
// ============================================================

/**
 * Format schedule type for display
 * Converts camelCase to readable text (e.g., "waterChange" -> "Water change")
 */
function formatScheduleType(type) {
  const types = {
    waterChange: 'Water change',
    parameterTest: 'Water test',
    filterMaintenance: 'Filter maintenance',
    glassClean: 'Glass cleaning',
  };
  return types[type] || type;
}

/**
 * checkDueSchedules
 *
 * Purpose: Find maintenance schedules that are due and create notifications
 * Trigger: Runs daily at 8:00 AM UTC
 *
 * How it works:
 * 1. Queries tankSchedules where enabled=true AND nextDue <= now
 * 2. Creates a notification for each due schedule
 * 3. Uses deterministic notification IDs to prevent duplicates
 *
 * Firestore Index Required:
 * Collection: tankSchedules
 * Fields: enabled ASC, nextDue ASC
 */
exports.checkDueSchedules = onSchedule(
  {
    schedule: '0 8 * * *', // 8:00 AM UTC daily
    timeZone: 'UTC',
    region: 'us-central1',
  },
  async () => {
    const now = Timestamp.now();

    // Query all enabled schedules that are due
    const dueSchedulesSnap = await db
      .collection('tankSchedules')
      .where('enabled', '==', true)
      .where('nextDue', '<=', now)
      .get();

    if (dueSchedulesSnap.empty) {
      console.log('checkDueSchedules: No due schedules found');
      return;
    }

    console.log(
      `checkDueSchedules: Found ${dueSchedulesSnap.size} due schedules`
    );

    // Date string for deterministic notification IDs
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Expiration date (30 days from now)
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);
    const expiresAt = Timestamp.fromDate(expiresDate);

    let createdCount = 0;

    for (const scheduleDoc of dueSchedulesSnap.docs) {
      const schedule = scheduleDoc.data();

      // Deterministic ID: one notification per schedule per day
      const notificationId = `${scheduleDoc.id}_${today}`;

      const typeLabel = formatScheduleType(schedule.type);
      const tankName = schedule.tankName || 'Your tank';

      await db
        .collection('notifications')
        .doc(notificationId)
        .set({
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
        });

      createdCount++;
    }

    console.log(`checkDueSchedules: Created ${createdCount} notifications`);
  }
);

// ============================================================
// FUTURE FUNCTIONS
// ============================================================
//
// cleanupExpiredNotifications
// - Trigger: Scheduled weekly
// - Purpose: Delete notifications where expiresAt < now
//
// sendPushNotification
// - Trigger: Firestore onCreate on notifications collection
// - Purpose: Send browser push notification via FCM
//
// onUserDelete
// - Trigger: Auth onDelete
// - Purpose: Cascade delete all user data (GDPR compliance)
//
// See DATA-MODEL.md for complete function specifications
