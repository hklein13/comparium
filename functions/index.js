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
const { onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

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
    parameterTest: 'Parameter test',
    filterMaintenance: 'Filter maintenance',
    feeding: 'Special feeding',
    glassClean: 'Glass cleaning',
    gravel: 'Gravel vacuum',
    plantTrim: 'Plant trimming',
    custom: 'Custom task',
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
    try {
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

      console.log(`checkDueSchedules: Found ${dueSchedulesSnap.size} due schedules`);

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
    } catch (error) {
      console.error('checkDueSchedules failed:', error);
      throw error; // Re-throw so Firebase logs the failure
    }
  }
);

// ============================================================
// PUSH NOTIFICATION FUNCTION
// ============================================================

/**
 * sendPushNotification
 *
 * Purpose: Send browser push notification when a notification document is created
 * Trigger: Firestore onCreate on notifications collection
 *
 * How it works:
 * 1. When a notification document is created, this function fires
 * 2. Gets the user's FCM tokens from fcmTokens collection
 * 3. Sends push notification to all valid tokens
 * 4. Marks invalid tokens for cleanup
 */
exports.sendPushNotification = onDocumentCreated(
  {
    document: 'notifications/{notificationId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('sendPushNotification: No data in event');
      return;
    }

    const notification = snapshot.data();
    const notificationId = event.params.notificationId;
    const userId = notification.userId;

    if (!userId) {
      console.log('sendPushNotification: No userId in notification');
      return;
    }

    // Get user's valid FCM tokens
    const tokensSnap = await db
      .collection('fcmTokens')
      .where('userId', '==', userId)
      .where('valid', '==', true)
      .get();

    if (tokensSnap.empty) {
      console.log(`sendPushNotification: No FCM tokens for user ${userId}`);
      return;
    }

    const tokens = tokensSnap.docs.map(doc => doc.data().token);
    console.log(`sendPushNotification: Sending to ${tokens.length} device(s) for user ${userId}`);

    // Prepare the message
    const message = {
      notification: {
        title: notification.title || 'Comparium',
        body: notification.body || 'You have a new notification',
      },
      data: {
        notificationId: notificationId,
        url: notification.action?.url || '/dashboard.html',
        type: notification.type || 'general',
      },
      webpush: {
        fcmOptions: {
          link: notification.action?.url || '/dashboard.html',
        },
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        },
      },
    };

    // Send to all tokens in parallel for better performance
    const messaging = getMessaging();

    const sendPromises = tokens.map(token =>
      messaging
        .send({ ...message, token })
        .then(() => ({ token, success: true }))
        .catch(error => ({ token, success: false, error }))
    );

    const results = await Promise.all(sendPromises);

    // Process results
    const invalidTokens = [];
    let successCount = 0;

    for (const result of results) {
      const tokenDoc = tokensSnap.docs.find(d => d.data().token === result.token);

      if (result.success) {
        successCount++;
        // Update lastUsed timestamp
        if (tokenDoc) {
          await tokenDoc.ref.update({ lastUsed: Timestamp.now() });
        }
      } else {
        console.error(
          `sendPushNotification: Failed for token ${result.token.substring(0, 20)}...`,
          result.error?.code
        );

        // Mark token as invalid if it's a registration error
        if (
          result.error?.code === 'messaging/invalid-registration-token' ||
          result.error?.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(result.token);
        }
      }
    }

    console.log(`sendPushNotification: ${successCount}/${tokens.length} sent successfully`);

    // Mark invalid tokens
    if (invalidTokens.length > 0) {
      console.log(`sendPushNotification: Marking ${invalidTokens.length} invalid token(s)`);
      const invalidUpdates = invalidTokens.map(token => {
        const tokenDoc = tokensSnap.docs.find(d => d.data().token === token);
        return tokenDoc ? tokenDoc.ref.update({ valid: false }) : Promise.resolve();
      });
      await Promise.all(invalidUpdates);
    }

    console.log('sendPushNotification: Complete');
  }
);

// ============================================================
// CLEANUP FUNCTION
// ============================================================

/**
 * cleanupExpiredNotifications
 *
 * Purpose: Delete notifications that have expired
 * Trigger: Runs weekly on Sunday at 2:00 AM UTC
 *
 * How it works:
 * 1. Queries notifications where expiresAt < now
 * 2. Deletes each expired notification
 * 3. Also cleans up invalid FCM tokens older than 90 days
 */
exports.cleanupExpiredNotifications = onSchedule(
  {
    schedule: '0 2 * * 0', // 2:00 AM UTC every Sunday
    timeZone: 'UTC',
    region: 'us-central1',
  },
  async () => {
    const now = Timestamp.now();

    // ---- Cleanup expired notifications ----
    console.log('cleanupExpiredNotifications: Starting notification cleanup');

    const expiredSnap = await db
      .collection('notifications')
      .where('expiresAt', '<', now)
      .limit(500) // Process in batches
      .get();

    if (expiredSnap.empty) {
      console.log('cleanupExpiredNotifications: No expired notifications');
    } else {
      console.log(
        `cleanupExpiredNotifications: Deleting ${expiredSnap.size} expired notifications`
      );

      const batch = db.batch();
      expiredSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`cleanupExpiredNotifications: Deleted ${expiredSnap.size} notifications`);
    }

    // ---- Cleanup invalid/old FCM tokens ----
    console.log('cleanupExpiredNotifications: Starting token cleanup');

    // Delete tokens marked invalid
    const invalidTokensSnap = await db
      .collection('fcmTokens')
      .where('valid', '==', false)
      .limit(500)
      .get();

    // Delete tokens not used in 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldTimestamp = Timestamp.fromDate(ninetyDaysAgo);

    const oldTokensSnap = await db
      .collection('fcmTokens')
      .where('lastUsed', '<', oldTimestamp)
      .limit(500)
      .get();

    const tokenDocsToDelete = new Set();
    invalidTokensSnap.docs.forEach(doc => tokenDocsToDelete.add(doc));
    oldTokensSnap.docs.forEach(doc => tokenDocsToDelete.add(doc));

    if (tokenDocsToDelete.size === 0) {
      console.log('cleanupExpiredNotifications: No tokens to clean up');
    } else {
      console.log(`cleanupExpiredNotifications: Deleting ${tokenDocsToDelete.size} stale tokens`);

      const batch = db.batch();
      tokenDocsToDelete.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`cleanupExpiredNotifications: Deleted ${tokenDocsToDelete.size} tokens`);
    }

    console.log('cleanupExpiredNotifications: Complete');
  }
);

// ============================================================
// PHASE 4.2: COMMENT & LIKE COUNT FUNCTIONS
// ============================================================

/**
 * onCommentCreated
 *
 * Purpose: Update comment counts when a new comment is created
 * Trigger: Firestore onCreate on comments collection
 *
 * How it works:
 * 1. When a comment is created, increment commentCount on the parent post
 * 2. If the comment is a reply (has replyTo), also increment replyCount on parent comment
 */
exports.onCommentCreated = onDocumentCreated(
  {
    document: 'comments/{commentId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('onCommentCreated: No data in event');
      return;
    }

    const comment = snapshot.data();
    const postId = comment.postId;

    if (!postId) {
      console.log('onCommentCreated: No postId in comment');
      return;
    }

    console.log(`onCommentCreated: Incrementing commentCount for post ${postId}`);

    // Increment comment count on the post
    await db
      .collection('posts')
      .doc(postId)
      .update({
        'stats.commentCount': FieldValue.increment(1),
      });

    // If this is a reply, also increment replyCount on the parent comment
    if (comment.replyTo) {
      console.log(`onCommentCreated: Incrementing replyCount for comment ${comment.replyTo}`);
      await db
        .collection('comments')
        .doc(comment.replyTo)
        .update({
          replyCount: FieldValue.increment(1),
        });
    }

    console.log('onCommentCreated: Complete');
  }
);

/**
 * onCommentDeleted
 *
 * Purpose: Update comment counts and cascade delete replies when a comment is deleted
 * Trigger: Firestore onDelete on comments collection
 *
 * How it works:
 * 1. When a comment is deleted, decrement commentCount on the parent post
 * 2. If the comment was a reply, also decrement replyCount on parent comment
 * 3. Delete all replies to this comment (cascade delete)
 * 4. Delete all likes on this comment
 */
exports.onCommentDeleted = onDocumentDeleted(
  {
    document: 'comments/{commentId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('onCommentDeleted: No data in event');
      return;
    }

    const commentId = event.params.commentId;
    const comment = snapshot.data();
    const postId = comment.postId;

    if (!postId) {
      console.log('onCommentDeleted: No postId in comment');
      return;
    }

    console.log(`onCommentDeleted: Processing deletion of comment ${commentId}`);

    // Decrement comment count on the post
    try {
      await db
        .collection('posts')
        .doc(postId)
        .update({
          'stats.commentCount': FieldValue.increment(-1),
        });
    } catch (error) {
      // Post may have been deleted already
      console.log(`onCommentDeleted: Could not update post ${postId} - may be deleted`);
    }

    // If this was a reply, also decrement replyCount on the parent comment
    if (comment.replyTo) {
      console.log(`onCommentDeleted: Decrementing replyCount for comment ${comment.replyTo}`);
      try {
        await db
          .collection('comments')
          .doc(comment.replyTo)
          .update({
            replyCount: FieldValue.increment(-1),
          });
      } catch (error) {
        // Parent comment may have been deleted already
        console.log(
          `onCommentDeleted: Could not update parent comment ${comment.replyTo} - may be deleted`
        );
      }
    }

    // Cascade delete: Find and delete all replies to this comment
    const repliesSnap = await db.collection('comments').where('replyTo', '==', commentId).get();

    // Also delete likes on this comment
    const likesSnap = await db
      .collection('likes')
      .where('targetId', '==', commentId)
      .where('targetType', '==', 'comment')
      .get();

    const docsToDelete = [...repliesSnap.docs, ...likesSnap.docs];

    if (docsToDelete.length > 0) {
      console.log(
        `onCommentDeleted: Cascade deleting ${repliesSnap.docs.length} replies and ${likesSnap.docs.length} likes`
      );
      const batch = db.batch();
      docsToDelete.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    console.log('onCommentDeleted: Complete');
  }
);

/**
 * onLikeCreated
 *
 * Purpose: Update like counts when a new like is created
 * Trigger: Firestore onCreate on likes collection
 *
 * How it works:
 * 1. Determine the target collection (posts or comments) from targetType
 * 2. Increment likeCount on the target document
 */
exports.onLikeCreated = onDocumentCreated(
  {
    document: 'likes/{likeId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('onLikeCreated: No data in event');
      return;
    }

    const like = snapshot.data();
    const { targetId, targetType } = like;

    if (!targetId || !targetType) {
      console.log('onLikeCreated: Missing targetId or targetType');
      return;
    }

    // Determine collection based on targetType
    const collectionName = targetType === 'post' ? 'posts' : 'comments';

    console.log(`onLikeCreated: Incrementing likeCount for ${collectionName}/${targetId}`);

    await db
      .collection(collectionName)
      .doc(targetId)
      .update({
        'stats.likeCount': FieldValue.increment(1),
      });

    console.log('onLikeCreated: Complete');
  }
);

/**
 * onLikeDeleted
 *
 * Purpose: Update like counts when a like is deleted
 * Trigger: Firestore onDelete on likes collection
 *
 * How it works:
 * 1. Determine the target collection (posts or comments) from targetType
 * 2. Decrement likeCount on the target document
 */
exports.onLikeDeleted = onDocumentDeleted(
  {
    document: 'likes/{likeId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('onLikeDeleted: No data in event');
      return;
    }

    const like = snapshot.data();
    const { targetId, targetType } = like;

    if (!targetId || !targetType) {
      console.log('onLikeDeleted: Missing targetId or targetType');
      return;
    }

    // Determine collection based on targetType
    const collectionName = targetType === 'post' ? 'posts' : 'comments';

    console.log(`onLikeDeleted: Decrementing likeCount for ${collectionName}/${targetId}`);

    try {
      await db
        .collection(collectionName)
        .doc(targetId)
        .update({
          'stats.likeCount': FieldValue.increment(-1),
        });
    } catch (error) {
      // Target may have been deleted already
      console.log(`onLikeDeleted: Could not update ${collectionName}/${targetId} - may be deleted`);
    }

    console.log('onLikeDeleted: Complete');
  }
);

/**
 * onPostDeleted
 *
 * Purpose: Cascade delete comments, likes, and bookmarks when a post is deleted
 * Trigger: Firestore onDelete on posts collection
 *
 * How it works:
 * 1. Delete all comments associated with this post
 * 2. Delete all likes on this post and its comments
 * 3. Delete all bookmarks pointing to this post
 */
exports.onPostDeleted = onDocumentDeleted(
  {
    document: 'posts/{postId}',
    region: 'us-central1',
  },
  async event => {
    const postId = event.params.postId;

    if (!postId) {
      console.log('onPostDeleted: No postId in event');
      return;
    }

    console.log(`onPostDeleted: Cascade deleting comments and likes for post ${postId}`);

    // Get all comments for this post
    const commentsSnap = await db.collection('comments').where('postId', '==', postId).get();

    // Get all likes for this post
    const postLikesSnap = await db
      .collection('likes')
      .where('targetId', '==', postId)
      .where('targetType', '==', 'post')
      .get();

    // Get all bookmarks for this post
    const bookmarksSnap = await db.collection('bookmarks').where('postId', '==', postId).get();

    // Collect all comment IDs to also delete their likes
    const commentIds = commentsSnap.docs.map(doc => doc.id);

    // Get likes on all comments of this post
    let commentLikesDocs = [];
    if (commentIds.length > 0) {
      // Firestore 'in' queries limited to 30 items, so batch if needed
      for (let i = 0; i < commentIds.length; i += 30) {
        const batch = commentIds.slice(i, i + 30);
        const likesSnap = await db
          .collection('likes')
          .where('targetId', 'in', batch)
          .where('targetType', '==', 'comment')
          .get();
        commentLikesDocs = commentLikesDocs.concat(likesSnap.docs);
      }
    }

    // Delete everything in batches (Firestore batch limit is 500)
    const allDocs = [
      ...commentsSnap.docs,
      ...postLikesSnap.docs,
      ...commentLikesDocs,
      ...bookmarksSnap.docs,
    ];

    if (allDocs.length === 0) {
      console.log('onPostDeleted: No associated data to delete');
      return;
    }

    console.log(
      `onPostDeleted: Deleting ${commentsSnap.docs.length} comments, ${postLikesSnap.docs.length} post likes, ${commentLikesDocs.length} comment likes, ${bookmarksSnap.docs.length} bookmarks`
    );

    // Process in batches of 500
    for (let i = 0; i < allDocs.length; i += 500) {
      const batchDocs = allDocs.slice(i, i + 500);
      const batch = db.batch();
      batchDocs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    console.log('onPostDeleted: Complete');
  }
);

// ============================================================
// FUTURE FUNCTIONS
// ============================================================
//
// onUserDelete
// - Trigger: Auth onDelete
// - Purpose: Cascade delete all user data (GDPR compliance)
//
// See DATA-MODEL.md for complete function specifications
