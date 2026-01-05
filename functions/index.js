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
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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
// FUTURE FUNCTIONS (Phase 2+)
// ============================================================
//
// Phase 2A: checkDueSchedules
// - Trigger: Scheduled daily at 8:00 AM UTC (cron: "0 8 * * *")
// - Purpose: Query tankSchedules where nextDue is today, create notifications
// - Requires: Composite Firestore index on tankSchedules
//
// Phase 2C: cleanupExpiredNotifications
// - Trigger: Scheduled weekly
// - Purpose: Delete notifications older than 30 days
//
// Phase 2D: sendPushNotification
// - Trigger: Firestore onCreate on notifications collection
// - Purpose: Send browser push notification via FCM
//
// onUserDelete
// - Trigger: Auth onDelete
// - Purpose: Cascade delete all user data (GDPR compliance)
//
// See DATA-MODEL.md for complete function specifications
