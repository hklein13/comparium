// Firebase initialization (module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// NOTE: Keep the same config that's currently in index.html
const firebaseConfig = {
  apiKey: 'AIzaSyDExicgmY78u4NAWVJngqaZkhKdmAbebjM',
  authDomain: 'comparium-21b69.firebaseapp.com',
  projectId: 'comparium-21b69',
  storageBucket: 'comparium-21b69.firebasestorage.app',
  messagingSenderId: '925744346774',
  appId: '1:925744346774:web:77453c0374054d5b0d74b7',
  measurementId: 'G-WSR0CCKYEC',
};

const app = initializeApp(firebaseConfig);

// Optional: analytics
try {
  const analytics = getAnalytics(app);
  window.firebaseAnalytics = analytics;
} catch (e) {
  // Analytics may error in local file:// contexts; ignore
}

// Auth, Firestore, and Storage
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// ============================================================================
// FIREBASE CLOUD MESSAGING (FCM) - Push Notifications
// ============================================================================

let messaging = null;

/**
 * Initialize FCM if supported by the browser
 * FCM requires service workers which aren't supported everywhere
 */
async function initializeMessaging() {
  try {
    const supported = await isSupported();
    if (!supported) {
      return false;
    }

    // CRITICAL: Register service worker before getting messaging
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swError) {
        // Continue anyway - might already be registered
      }
    }

    messaging = getMessaging(app);
    return true;
  } catch (e) {
    return false;
  }
}

// Initialize messaging (don't await - let it happen in background)
initializeMessaging();

// PRODUCTION FIX: Promise that resolves when Firebase Auth completes initial state check
// This prevents race conditions where we check auth before Firebase restores the session
let resolveAuthReady;
window.firebaseAuthReady = new Promise(resolve => {
  resolveAuthReady = resolve;
});

// Auth state listener - fires when session is restored or user logs in/out
onAuthStateChanged(auth, user => {
  if (resolveAuthReady) {
    resolveAuthReady(user); // Resolve promise with user object (or null if not logged in)
    resolveAuthReady = null; // Only resolve once for initial page load state
  }
});

// Expose helpers globally for ease of migration
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseFirestore = firestore;
window.firebaseStorage = storage;
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignUp = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseAuthState = onAuthStateChanged;

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.firebaseSendPasswordReset = async email => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    const errorMap = {
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    // For security, don't reveal if email exists - return success for user-not-found
    if (error.code === 'auth/user-not-found') {
      return { success: true }; // Don't reveal email doesn't exist
    }
    return { success: false, error: errorMap[error.code] || 'Failed to send reset email' };
  }
};

// Simple helper to get current user uid
window.getFirebaseUid = () => (auth.currentUser ? auth.currentUser.uid : null);

// Firestore helper wrappers
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  addDoc,
  orderBy,
  Timestamp,
  limit,
  startAfter,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

window.firestoreGetProfile = async uid => {
  if (!firestore) return null;
  try {
    const ref = doc(firestore, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
};

window.firestoreGetProfileByEmail = async email => {
  if (!firestore) return null;
  try {
    const q = query(collection(firestore, 'users'), where('email', '==', email));
    const snaps = await getDocs(q);
    if (!snaps.empty) {
      const docSnap = snaps.docs[0];
      return docSnap.data();
    }
    return null;
  } catch (e) {
    return null;
  }
};

window.firestoreSetProfile = async (uid, data) => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'users', uid);
    await setDoc(ref, data, { merge: true });
    return true;
  } catch (e) {
    return false;
  }
};

window.firestoreUpdateProfile = async (uid, updates) => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'users', uid);
    await updateDoc(ref, updates);
    return true;
  } catch (e) {
    return false;
  }
};

window.firestoreAddComparison = async (uid, comparison) => {
  const ref = doc(firestore, 'users', uid);
  const record = { id: Date.now().toString(), date: new Date().toISOString(), ...comparison };
  try {
    await updateDoc(ref, { 'profile.comparisonHistory': arrayUnion(record) });
    return { success: true, id: record.id };
  } catch (e) {
    return { success: false };
  }
};

window.firestoreGetComparisons = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.comparisonHistory || [];
  } catch (e) {
    return [];
  }
};

window.firestoreAddFavorite = async (uid, speciesKey) => {
  const ref = doc(firestore, 'users', uid);
  try {
    await updateDoc(ref, { 'profile.favoriteSpecies': arrayUnion(speciesKey) });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

window.firestoreRemoveFavorite = async (uid, speciesKey) => {
  const ref = doc(firestore, 'users', uid);
  try {
    await updateDoc(ref, { 'profile.favoriteSpecies': arrayRemove(speciesKey) });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

window.firestoreGetFavorites = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.favoriteSpecies || [];
  } catch (e) {
    return [];
  }
};

window.firestoreSaveTank = async (uid, tank) => {
  try {
    const ref = doc(firestore, 'users', uid);
    const profile = (await window.firestoreGetProfile(uid)) || { profile: { tanks: [] } };
    profile.profile.tanks = profile.profile.tanks || [];
    if (tank.id) {
      const index = profile.profile.tanks.findIndex(t => t.id === tank.id);
      if (index !== -1) {
        // Update existing tank
        profile.profile.tanks[index] = tank;
      } else {
        // New tank with pre-generated ID (e.g., for photo upload)
        tank.created = tank.created || new Date().toISOString();
        profile.profile.tanks.push(tank);
      }
    } else {
      // New tank without pre-generated ID
      tank.id = Date.now().toString();
      tank.created = new Date().toISOString();
      profile.profile.tanks.push(tank);
    }
    await setDoc(ref, profile, { merge: true });
    return { success: true, tankId: tank.id };
  } catch (e) {
    return { success: false };
  }
};

window.firestoreGetTanks = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.tanks || [];
  } catch (e) {
    return [];
  }
};

window.firestoreDeleteTank = async (uid, tankId) => {
  try {
    const ref = doc(firestore, 'users', uid);
    const profile = (await window.firestoreGetProfile(uid)) || { profile: { tanks: [] } };
    profile.profile.tanks = (profile.profile.tanks || []).filter(t => t.id !== tankId);
    await setDoc(ref, profile, { merge: true });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

window.firestoreExportUserData = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    if (!profile) return null;
    return {
      username: profile.username,
      email: profile.email,
      created: profile.created,
      profile: profile.profile,
      exportDate: new Date().toISOString(),
    };
  } catch (e) {
    return null;
  }
};

window.firestoreImportUserData = async (uid, importData) => {
  try {
    const ref = doc(firestore, 'users', uid);
    const base = (await window.firestoreGetProfile(uid)) || { profile: {} };
    base.profile = { ...base.profile, ...(importData.profile || {}) };
    await setDoc(ref, base, { merge: true });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

// ============================================================================
// TANK EVENTS (Phase 1 - Maintenance Tracking)
// ============================================================================

/**
 * Add a new tank event
 * @param {string} uid - User's UID
 * @param {object} eventData - Event data (tankId, type, date, notes, data)
 * @returns {Promise<{success: boolean, eventId?: string}>}
 */
window.firestoreAddTankEvent = async (uid, eventData) => {
  if (!firestore || !uid) return { success: false };
  try {
    const event = {
      userId: uid,
      tankId: eventData.tankId,
      type: eventData.type,
      date: eventData.date ? Timestamp.fromDate(new Date(eventData.date)) : Timestamp.now(),
      created: Timestamp.now(),
      notes: eventData.notes || '',
      data: eventData.data || {},
    };
    const ref = await addDoc(collection(firestore, 'tankEvents'), event);
    return { success: true, eventId: ref.id };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Get tank events for a specific tank
 * @param {string} uid - User's UID
 * @param {string} tankId - Tank ID
 * @param {number} maxResults - Maximum number of results (default 50)
 * @returns {Promise<array>} - Array of events sorted by date descending
 */
window.firestoreGetTankEvents = async (uid, tankId, maxResults = 50) => {
  if (!firestore || !uid) return [];
  try {
    const q = query(
      collection(firestore, 'tankEvents'),
      where('userId', '==', uid),
      where('tankId', '==', tankId),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(d => ({
      id: d.id,
      ...d.data(),
      // Convert Timestamps to ISO strings for easier handling
      date: d.data().date?.toDate?.()?.toISOString() || d.data().date,
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Get all tank events for a user (across all tanks)
 * @param {string} uid - User's UID
 * @param {number} maxResults - Maximum number of results (default 100)
 * @returns {Promise<array>} - Array of events sorted by date descending
 */
window.firestoreGetAllUserEvents = async (uid, maxResults = 100) => {
  if (!firestore || !uid) return [];
  try {
    const q = query(
      collection(firestore, 'tankEvents'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limit(maxResults)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data().date?.toDate?.()?.toISOString() || d.data().date,
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Delete a tank event
 * @param {string} uid - User's UID (for verification)
 * @param {string} eventId - Event document ID
 * @returns {Promise<{success: boolean}>}
 */
window.firestoreDeleteTankEvent = async (uid, eventId) => {
  if (!firestore || !uid || !eventId) return { success: false };
  try {
    // First verify the event belongs to this user
    const eventRef = doc(firestore, 'tankEvents', eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists() || eventSnap.data().userId !== uid) {
      return { success: false };
    }
    await deleteDoc(eventRef);
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

// ============================================================================
// TANK SCHEDULES (Phase 1 - Recurring Maintenance)
// ============================================================================

/**
 * Add or update a tank schedule
 * @param {string} uid - User's UID
 * @param {object} scheduleData - Schedule data
 * @returns {Promise<{success: boolean, scheduleId?: string}>}
 */
window.firestoreSaveTankSchedule = async (uid, scheduleData) => {
  if (!firestore || !uid) return { success: false };
  try {
    const schedule = {
      userId: uid,
      tankId: scheduleData.tankId,
      tankName: scheduleData.tankName || '',
      type: scheduleData.type,
      customLabel: scheduleData.customLabel || '',
      intervalDays: scheduleData.intervalDays || 7,
      enabled: scheduleData.enabled !== false, // default true
      created: scheduleData.created
        ? Timestamp.fromDate(new Date(scheduleData.created))
        : Timestamp.now(),
      lastCompleted: scheduleData.lastCompleted
        ? Timestamp.fromDate(new Date(scheduleData.lastCompleted))
        : null,
      nextDue: null, // Will be set below
      reminder: {
        enabled: scheduleData.reminder?.enabled !== false,
        daysBefore: scheduleData.reminder?.daysBefore || 1,
        lastSent: scheduleData.reminder?.lastSent
          ? Timestamp.fromDate(new Date(scheduleData.reminder.lastSent))
          : null,
      },
      notes: scheduleData.notes || '',
    };

    // Set nextDue: use provided value, or default to intervalDays from now
    if (scheduleData.nextDue) {
      schedule.nextDue = Timestamp.fromDate(new Date(scheduleData.nextDue));
    } else {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + schedule.intervalDays);
      schedule.nextDue = Timestamp.fromDate(defaultDate);
    }

    // Update existing or create new
    if (scheduleData.id) {
      const ref = doc(firestore, 'tankSchedules', scheduleData.id);
      await setDoc(ref, schedule, { merge: true });
      return { success: true, scheduleId: scheduleData.id };
    } else {
      const ref = await addDoc(collection(firestore, 'tankSchedules'), schedule);
      return { success: true, scheduleId: ref.id };
    }
  } catch (e) {
    return { success: false };
  }
};

/**
 * Get schedules for a specific tank
 * @param {string} uid - User's UID
 * @param {string} tankId - Tank ID
 * @returns {Promise<array>}
 */
window.firestoreGetTankSchedules = async (uid, tankId) => {
  if (!firestore || !uid) return [];
  try {
    const q = query(
      collection(firestore, 'tankSchedules'),
      where('userId', '==', uid),
      where('tankId', '==', tankId)
    );
    const snaps = await getDocs(q);
    return snaps.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created: data.created?.toDate?.()?.toISOString() || data.created,
        lastCompleted: data.lastCompleted?.toDate?.()?.toISOString() || null,
        nextDue: data.nextDue?.toDate?.()?.toISOString() || null,
        reminder: {
          ...data.reminder,
          lastSent: data.reminder?.lastSent?.toDate?.()?.toISOString() || null,
        },
      };
    });
  } catch (e) {
    return [];
  }
};

/**
 * Get all schedules for a user, optionally filtered by enabled status
 * @param {string} uid - User's UID
 * @param {boolean} enabledOnly - If true, only return enabled schedules
 * @returns {Promise<array>}
 */
window.firestoreGetAllUserSchedules = async (uid, enabledOnly = false) => {
  if (!firestore || !uid) return [];
  try {
    let q;
    if (enabledOnly) {
      q = query(
        collection(firestore, 'tankSchedules'),
        where('userId', '==', uid),
        where('enabled', '==', true),
        orderBy('nextDue', 'asc')
      );
    } else {
      q = query(
        collection(firestore, 'tankSchedules'),
        where('userId', '==', uid),
        orderBy('nextDue', 'asc')
      );
    }
    const snaps = await getDocs(q);
    return snaps.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created: data.created?.toDate?.()?.toISOString() || data.created,
        lastCompleted: data.lastCompleted?.toDate?.()?.toISOString() || null,
        nextDue: data.nextDue?.toDate?.()?.toISOString() || null,
        reminder: {
          ...data.reminder,
          lastSent: data.reminder?.lastSent?.toDate?.()?.toISOString() || null,
        },
      };
    });
  } catch (e) {
    return [];
  }
};

/**
 * Mark a schedule as completed (updates lastCompleted and nextDue)
 * @param {string} uid - User's UID
 * @param {string} scheduleId - Schedule ID
 * @param {Date} completedDate - When the task was completed (default: now)
 * @returns {Promise<{success: boolean}>}
 */
window.firestoreCompleteSchedule = async (uid, scheduleId, completedDate = new Date()) => {
  if (!firestore || !uid || !scheduleId) return { success: false };
  try {
    const scheduleRef = doc(firestore, 'tankSchedules', scheduleId);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists() || scheduleSnap.data().userId !== uid) {
      return { success: false };
    }

    const scheduleData = scheduleSnap.data();
    const completedTimestamp = Timestamp.fromDate(completedDate);

    // Calculate new nextDue
    const nextDate = new Date(completedDate);
    nextDate.setDate(nextDate.getDate() + scheduleData.intervalDays);

    await updateDoc(scheduleRef, {
      lastCompleted: completedTimestamp,
      nextDue: Timestamp.fromDate(nextDate),
      'reminder.lastSent': null, // Reset reminder so it can fire again
    });

    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Delete a schedule
 * @param {string} uid - User's UID
 * @param {string} scheduleId - Schedule ID
 * @returns {Promise<{success: boolean}>}
 */
window.firestoreDeleteTankSchedule = async (uid, scheduleId) => {
  if (!firestore || !uid || !scheduleId) return { success: false };
  try {
    const scheduleRef = doc(firestore, 'tankSchedules', scheduleId);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists() || scheduleSnap.data().userId !== uid) {
      return { success: false };
    }

    await deleteDoc(scheduleRef);
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

// ============================================================================
// USERNAME MANAGEMENT (for username uniqueness and UID lookups)
// ============================================================================

/**
 * Check if a username already exists in the usernames collection
 * @param {string} username - Username to check
 * @returns {Promise<{error: boolean, exists: boolean}>} - Object with error state and existence
 */
window.firestoreUsernameExists = async username => {
  if (!firestore) return { error: true, exists: false };
  try {
    const ref = doc(firestore, 'usernames', username);
    const snap = await getDoc(ref);
    return { error: false, exists: snap.exists() };
  } catch (e) {
    return { error: true, exists: false };
  }
};

/**
 * Create a username mapping (username -> UID + email) in Firestore
 * @param {string} username - Username to register
 * @param {string} uid - Firebase Auth UID
 * @param {string} email - User email (for login lookup)
 * @returns {Promise<boolean>} - True if created successfully, false otherwise
 */
window.firestoreCreateUsername = async (username, uid, email) => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'usernames', username);
    await setDoc(ref, {
      uid: uid,
      email: email,
      created: new Date().toISOString(),
    });
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get user data from username by querying the usernames collection
 * @param {string} username - Username to lookup
 * @returns {Promise<{uid: string, email: string}|null>} - User data if found, null otherwise
 */
window.firestoreGetUidByUsername = async username => {
  if (!firestore) return null;
  try {
    const ref = doc(firestore, 'usernames', username);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return { uid: data.uid, email: data.email };
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Delete a username mapping (for cleanup during failed registration)
 * @param {string} username - Username to delete
 * @returns {Promise<boolean>} - True if deleted successfully, false otherwise
 */
window.firestoreDeleteUsername = async username => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'usernames', username);
    await deleteDoc(ref);
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================
// NOTIFICATIONS (Phase 2)
// ============================================================

/**
 * Get notifications for a user
 * Returns notifications ordered by created DESC
 */
window.firestoreGetNotifications = async (uid, maxResults = 20) => {
  if (!firestore || !uid) return [];
  try {
    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', uid),
      orderBy('created', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
};

/**
 * Mark a notification as read
 */
window.firestoreMarkNotificationRead = async notificationId => {
  if (!firestore || !notificationId) return false;
  try {
    const ref = doc(firestore, 'notifications', notificationId);
    await updateDoc(ref, { read: true });
    return true;
  } catch (e) {
    return false;
  }
};

// ============================================================================
// POSTS (Phase 4 Full - Social Features)
// ============================================================================

/**
 * Create a new post
 * @param {object} postData - Post data object
 * @returns {Promise<{success: boolean, postId?: string}>}
 */
window.firestoreCreatePost = async postData => {
  if (!firestore) return { success: false, error: 'Firestore not initialized' };
  try {
    const post = {
      ...postData,
      created: Timestamp.now(),
      updated: Timestamp.now(),
    };
    const ref = await addDoc(collection(firestore, 'posts'), post);
    return { success: true, postId: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Get posts for community feed
 * @param {object} options - { category, sortBy, limit, lastDoc }
 * @returns {Promise<{success: boolean, posts: array, lastDoc: any}>}
 */
window.firestoreGetPosts = async (options = {}) => {
  if (!firestore) return { success: false, posts: [] };

  const {
    category = null,
    sortBy = 'newest',
    limit: maxResults = 20,
    lastDoc = null,
  } = options;

  try {
    let constraints = [where('visibility', '==', 'public')];

    // Add category filter if specified
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Add sort order
    if (sortBy === 'top') {
      constraints.push(orderBy('stats.likeCount', 'desc'));
    } else {
      constraints.push(orderBy('created', 'desc'));
    }

    // Add limit
    constraints.push(limit(maxResults));

    // Add pagination cursor
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(firestore, 'posts'), ...constraints);
    const snap = await getDocs(q);

    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
      updated: d.data().updated?.toDate?.()?.toISOString() || d.data().updated,
    }));

    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { success: true, posts, lastDoc: newLastDoc };
  } catch (e) {
    return { success: false, posts: [], error: e.message };
  }
};

/**
 * Get a single post by ID
 * @param {string} postId
 * @returns {Promise<{success: boolean, post?: object}>}
 */
window.firestoreGetPost = async postId => {
  if (!firestore || !postId) return { success: false };
  try {
    const ref = doc(firestore, 'posts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, error: 'Post not found' };
    }
    const data = snap.data();
    return {
      success: true,
      post: {
        id: snap.id,
        ...data,
        created: data.created?.toDate?.()?.toISOString() || data.created,
        updated: data.updated?.toDate?.()?.toISOString() || data.updated,
      },
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Delete a post (verifies ownership)
 * @param {string} uid - User's UID
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean}>}
 */
window.firestoreDeletePost = async (uid, postId) => {
  if (!firestore || !uid || !postId) return { success: false };
  try {
    const ref = doc(firestore, 'posts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== uid) {
      return { success: false, error: 'Not authorized' };
    }
    await deleteDoc(ref);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} maxResults
 * @returns {Promise<{success: boolean, posts: array}>}
 */
window.firestoreGetUserPosts = async (userId, maxResults = 20) => {
  if (!firestore || !userId) return { success: false, posts: [] };
  try {
    const q = query(
      collection(firestore, 'posts'),
      where('userId', '==', userId),
      orderBy('created', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      created: d.data().created?.toDate?.()?.toISOString() || d.data().created,
      updated: d.data().updated?.toDate?.()?.toISOString() || d.data().updated,
    }));
    return { success: true, posts };
  } catch (e) {
    return { success: false, posts: [], error: e.message };
  }
};

// ============================================================================
// FCM TOKEN MANAGEMENT (Phase 2 - Push Notifications)
// ============================================================================

/**
 * VAPID Key for FCM Web Push
 * This key is generated in Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
 * The user must generate this key and replace the placeholder below.
 *
 * To generate:
 * 1. Go to Firebase Console: https://console.firebase.google.com/project/comparium-21b69/settings/cloudmessaging
 * 2. Scroll to "Web Push certificates"
 * 3. Click "Generate key pair"
 * 4. Copy the key and paste it below
 */
const VAPID_KEY =
  'BAb0vWcFTq_ZvVVWvKVTRnHm2pgmFhsa6Tf2KQYkxhDSDXkn7ibl669FSXfdLD0GoSjKK-vICY3ObfTVWpXuqAw';

/**
 * Request notification permission and get FCM token
 * @param {string} uid - User's UID (required to save token)
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
window.fcmRequestPermission = async uid => {
  if (!messaging) {
    const supported = await initializeMessaging();
    if (!supported) {
      return { success: false, error: 'Push notifications not supported in this browser' };
    }
  }

  if (!VAPID_KEY) {
    return { success: false, error: 'Push notifications not configured' };
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied' };
    }

    // Get the FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      return { success: false, error: 'Failed to get notification token' };
    }

    // Save token to Firestore
    const saved = await window.fcmSaveToken(uid, token);
    if (!saved) {
      return { success: false, error: 'Failed to save notification token' };
    }
    return { success: true, token };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

/**
 * Save FCM token to Firestore
 * Uses a hash of the token as document ID to prevent duplicates
 * @param {string} uid - User's UID
 * @param {string} token - FCM token
 * @returns {Promise<boolean>}
 */
window.fcmSaveToken = async (uid, token) => {
  if (!firestore || !uid || !token) {
    return false;
  }
  try {
    // Create a simple hash of the token for the document ID
    // This prevents duplicate tokens for the same device
    const tokenHash = await hashToken(token);

    const tokenDoc = {
      token: token,
      userId: uid,
      device: 'web',
      browser: detectBrowser(),
      created: Timestamp.now(),
      lastUsed: Timestamp.now(),
      valid: true,
    };

    await setDoc(doc(firestore, 'fcmTokens', tokenHash), tokenDoc);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get user's FCM tokens from Firestore
 * @param {string} uid - User's UID
 * @returns {Promise<array>}
 */
window.fcmGetUserTokens = async uid => {
  if (!firestore || !uid) return [];
  try {
    const q = query(
      collection(firestore, 'fcmTokens'),
      where('userId', '==', uid),
      where('valid', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
};

/**
 * Disable push notifications for current device
 * Marks the token as invalid in Firestore
 * @param {string} uid - User's UID
 * @returns {Promise<boolean>}
 */
window.fcmDisableNotifications = async uid => {
  if (!firestore || !uid) return false;
  try {
    // Query for user's tokens and mark them invalid
    const q = query(
      collection(firestore, 'fcmTokens'),
      where('userId', '==', uid),
      where('valid', '==', true)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return true; // Nothing to disable, consider it success
    }

    // Mark all tokens as invalid
    for (const tokenDoc of snap.docs) {
      await updateDoc(tokenDoc.ref, { valid: false });
    }

    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if push notifications are enabled for current user
 * Source of truth is Firestore (do we have valid tokens?), not browser permission
 * @param {string} uid - User's UID
 * @returns {Promise<boolean>}
 */
window.fcmIsEnabled = async uid => {
  if (!firestore || !uid) return false;
  try {
    const q = query(
      collection(firestore, 'fcmTokens'),
      where('userId', '==', uid),
      where('valid', '==', true),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    return false;
  }
};

/**
 * Set up foreground message handler
 * Shows a notification when a message arrives while the app is in focus
 * @param {function} callback - Optional callback for custom handling
 */
window.fcmSetupForegroundHandler = callback => {
  if (!messaging) return;

  onMessage(messaging, payload => {
    // Show browser notification
    if (Notification.permission === 'granted') {
      const title = payload.notification?.title || 'Comparium';
      const body = payload.notification?.body || 'You have a new notification';

      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: payload.data?.notificationId || 'comparium-notification',
      });
    }

    // Call custom callback if provided
    if (callback && typeof callback === 'function') {
      callback(payload);
    }
  });
};

/**
 * Create a simple hash of the token for use as document ID
 * Uses SubtleCrypto if available, falls back to simple hash
 * @param {string} token - FCM token
 * @returns {Promise<string>}
 */
async function hashToken(token) {
  try {
    if (crypto && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fall through to simple hash
  }

  // Simple fallback hash
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'fcm_' + Math.abs(hash).toString(16);
}

/**
 * Detect browser for token metadata
 * Order matters: Edge contains "Chrome", so check Edge first
 * @returns {string}
 */
function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/') || ua.includes('Edge')) return 'edge';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';
  return 'unknown';
}

// ============================================================================
// FIREBASE STORAGE - Tank Photo Uploads
// ============================================================================

/**
 * Upload a tank cover photo to Firebase Storage
 * @param {string} tankId - Tank ID (used as filename)
 * @param {File} file - Image file to upload
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
window.storageUploadTankPhoto = async (tankId, file) => {
  if (!storage || !tankId || !file) {
    return { success: false, error: 'Missing required parameters' };
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please use JPEG, PNG, or WebP.' };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' };
  }

  try {
    // Create storage reference
    const storageRef = ref(storage, `images/tanks/${tankId}.jpg`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000', // 1-year cache
    });

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    return { success: true, url };
  } catch (e) {
    return { success: false, error: e.message || 'Upload failed' };
  }
};

/**
 * Delete a tank cover photo from Firebase Storage
 * @param {string} tankId - Tank ID (filename without extension)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
window.storageDeleteTankPhoto = async tankId => {
  if (!storage || !tankId) {
    return { success: false, error: 'Missing tank ID' };
  }

  try {
    const storageRef = ref(storage, `images/tanks/${tankId}.jpg`);
    await deleteObject(storageRef);
    return { success: true };
  } catch (e) {
    // If file doesn't exist, consider it a success (nothing to delete)
    if (e.code === 'storage/object-not-found') {
      return { success: true };
    }
    return { success: false, error: e.message || 'Delete failed' };
  }
};

export { app, auth, firestore, storage, messaging };
