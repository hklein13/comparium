/**
 * Community Seeding Script
 *
 * Creates seed users, posts, comments, and likes to make the community
 * feel active before launching marketing.
 *
 * Usage:
 *   node scripts/seed-community.js              # Dry run (preview only)
 *   node scripts/seed-community.js --execute    # Actually create data
 *
 * Requires: scripts/serviceAccountKey.json
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('ERROR: scripts/serviceAccountKey.json not found');
  console.error('Download from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// Load seed content
const contentPath = path.join(__dirname, 'seed-content.json');
if (!fs.existsSync(contentPath)) {
  console.error('ERROR: scripts/seed-content.json not found');
  process.exit(1);
}
const seedContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Generate a password for seed accounts
const SEED_PASSWORD = 'Comparium2026!';

/**
 * Convert "daysAgo" to a Firestore Timestamp in the past
 */
function daysAgoToTimestamp(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Add some random hours/minutes for realism
  date.setHours(Math.floor(Math.random() * 12) + 8); // 8am-8pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return admin.firestore.Timestamp.fromDate(date);
}

/**
 * Create a Firebase Auth user
 */
async function createAuthUser(user) {
  try {
    const userRecord = await auth.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      displayName: user.username,
    });
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      // User exists, get their UID
      const existingUser = await auth.getUserByEmail(user.email);
      console.log(`  User ${user.username} already exists, using existing UID`);
      return existingUser.uid;
    }
    throw error;
  }
}

/**
 * Create Firestore user profile and username mapping
 */
async function createUserProfile(user, uid) {
  const now = admin.firestore.Timestamp.now();

  // Create username mapping
  await db.collection('usernames').doc(user.username.toLowerCase()).set({
    uid: uid,
    email: user.email,
    created: now,
  });

  // Create user profile
  await db.collection('users').doc(uid).set({
    uid: uid,
    username: user.username,
    email: user.email,
    created: now,
    lastLogin: now,
    profile: {
      favoriteSpecies: [],
      comparisonHistory: [],
      tanks: [],
      bio: user.bio || '',
      experience: user.experienceLevel || 'beginner',
      location: user.location || '',
    },
    social: {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
    },
    settings: {
      emailNotifications: true,
      pushNotifications: false,
      theme: 'system',
    },
  });
}

/**
 * Create a post
 */
async function createPost(post, authorUid, authorUsername) {
  const created = daysAgoToTimestamp(post.daysAgo);

  const postData = {
    userId: authorUid,
    content: post.content,
    category: post.category.toLowerCase(),
    imageUrls: post.imageUrls || [],
    visibility: 'public',
    stats: {
      likeCount: 0,
      commentCount: 0,
    },
    author: {
      username: authorUsername,
      avatarUrl: null,
    },
    created: created,
    updated: created,
  };

  const docRef = await db.collection('posts').add(postData);
  return docRef.id;
}

/**
 * Create a comment on a post
 */
async function createComment(comment, postId, authorUid, authorUsername) {
  const created = daysAgoToTimestamp(comment.daysAgo);

  const commentData = {
    postId: postId,
    userId: authorUid,
    content: comment.content,
    replyTo: null,
    replyCount: 0,
    stats: {
      likeCount: 0,
    },
    author: {
      username: authorUsername,
      avatarUrl: null,
    },
    created: created,
    updated: created,
  };

  const docRef = await db.collection('comments').add(commentData);
  return docRef.id;
}

/**
 * Create a like
 */
async function createLike(userId, targetId, targetType) {
  const likeId = `${userId}_${targetId}_${targetType}`;
  await db.collection('likes').doc(likeId).set({
    userId: userId,
    targetId: targetId,
    targetType: targetType,
    created: admin.firestore.Timestamp.now(),
  });
}

/**
 * Update post stats (likeCount, commentCount)
 */
async function updatePostStats(postId, likeCount, commentCount) {
  await db.collection('posts').doc(postId).update({
    'stats.likeCount': likeCount,
    'stats.commentCount': commentCount,
  });
}

/**
 * Update user post count
 */
async function updateUserPostCount(uid, postCount) {
  await db.collection('users').doc(uid).update({
    'social.postCount': postCount,
  });
}

/**
 * Main seeding function
 */
async function seedCommunity() {
  console.log('========================================');
  console.log('Comparium Community Seeding Script');
  console.log('========================================');
  console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'EXECUTE (creating data)'}`);
  console.log('');

  // Map username -> uid
  const userMap = {};
  // Map username -> post count
  const userPostCounts = {};
  // Map postIndex -> postId
  const postIds = [];
  // Map postIndex -> { likeCount, commentCount }
  const postStats = [];

  // Initialize post stats
  seedContent.posts.forEach(() => {
    postStats.push({ likeCount: 0, commentCount: 0 });
  });

  // ========== STEP 1: Create Users ==========
  console.log('STEP 1: Creating users...');
  console.log('-'.repeat(40));

  for (const user of seedContent.users) {
    console.log(`  ${user.username}`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Bio: ${user.bio || '(none)'}`);
    console.log(`    Experience: ${user.experienceLevel || 'beginner'}`);

    if (!dryRun) {
      const uid = await createAuthUser(user);
      await createUserProfile(user, uid);
      userMap[user.username] = uid;
      console.log(`    UID: ${uid}`);
    } else {
      userMap[user.username] = `fake-uid-${user.username}`;
    }
    userPostCounts[user.username] = 0;
    console.log('');
  }

  // ========== STEP 2: Create Posts ==========
  console.log('STEP 2: Creating posts...');
  console.log('-'.repeat(40));

  for (let i = 0; i < seedContent.posts.length; i++) {
    const post = seedContent.posts[i];
    const authorUid = userMap[post.author];

    console.log(`  Post ${i + 1}: [${post.category}] by ${post.author}`);
    console.log(`    "${post.content.substring(0, 60)}..."`);
    console.log(`    Posted: ${post.daysAgo} days ago`);

    if (!dryRun) {
      const postId = await createPost(post, authorUid, post.author);
      postIds.push(postId);
      console.log(`    ID: ${postId}`);
    } else {
      postIds.push(`fake-post-${i}`);
    }

    userPostCounts[post.author]++;

    // Create comments for this post
    if (post.comments && post.comments.length > 0) {
      console.log(`    Comments (${post.comments.length}):`);
      for (const comment of post.comments) {
        const commentAuthorUid = userMap[comment.author];
        console.log(`      - ${comment.author}: "${comment.content.substring(0, 40)}..."`);

        if (!dryRun) {
          await createComment(comment, postIds[i], commentAuthorUid, comment.author);
        }
        postStats[i].commentCount++;
      }
    }
    console.log('');
  }

  // ========== STEP 3: Create Likes ==========
  console.log('STEP 3: Creating likes...');
  console.log('-'.repeat(40));

  for (const like of seedContent.likes) {
    const userId = userMap[like.user];
    const postId = postIds[like.postIndex];

    console.log(`  ${like.user} liked post ${like.postIndex + 1}`);

    if (!dryRun) {
      await createLike(userId, postId, 'post');
    }
    postStats[like.postIndex].likeCount++;
  }
  console.log('');

  // ========== STEP 4: Update Stats ==========
  console.log('STEP 4: Updating stats...');
  console.log('-'.repeat(40));

  // Update post stats
  for (let i = 0; i < postIds.length; i++) {
    const stats = postStats[i];
    console.log(`  Post ${i + 1}: ${stats.likeCount} likes, ${stats.commentCount} comments`);

    if (!dryRun) {
      await updatePostStats(postIds[i], stats.likeCount, stats.commentCount);
    }
  }
  console.log('');

  // Update user post counts
  for (const [username, count] of Object.entries(userPostCounts)) {
    if (count > 0) {
      console.log(`  ${username}: ${count} posts`);
      if (!dryRun) {
        const uid = userMap[username];
        await updateUserPostCount(uid, count);
      }
    }
  }

  // ========== Summary ==========
  console.log('');
  console.log('========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Users created: ${seedContent.users.length}`);
  console.log(`Posts created: ${seedContent.posts.length}`);
  console.log(`Comments created: ${postStats.reduce((sum, p) => sum + p.commentCount, 0)}`);
  console.log(`Likes created: ${seedContent.likes.length}`);
  console.log('');

  if (dryRun) {
    console.log('This was a DRY RUN. No data was created.');
    console.log('Run with --execute to actually create the data:');
    console.log('  node scripts/seed-community.js --execute');
  } else {
    console.log('Community seeded successfully!');
    console.log('');
    console.log('Seed account password (same for all): ' + SEED_PASSWORD);
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit https://comparium.net/community to verify posts');
    console.log('2. Update featured tank on homepage (remove @harrison)');
  }
}

// Run
seedCommunity()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
