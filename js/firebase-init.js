// Firebase initialization (module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

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
  console.warn('Analytics not available:', e.message);
}

// Auth and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

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
      console.log('FCM not supported in this browser');
      return false;
    }

    // CRITICAL: Register service worker before getting messaging
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('FCM service worker registered');
      } catch (swError) {
        console.warn('Service worker registration failed:', swError.message);
        // Continue anyway - might already be registered
      }
    }

    messaging = getMessaging(app);
    console.log('FCM initialized successfully');
    return true;
  } catch (e) {
    console.warn('FCM initialization failed:', e.message);
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
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignUp = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseAuthState = onAuthStateChanged;

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
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

window.firestoreGetProfile = async uid => {
  if (!firestore) return null;
  try {
    const ref = doc(firestore, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('firestoreGetProfile error:', e);
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
    console.error('firestoreGetProfileByEmail error:', e);
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
    console.error('firestoreSetProfile error:', e);
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
    console.error('firestoreUpdateProfile error:', e);
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
    console.error('firestoreAddComparison error:', e);
    return { success: false };
  }
};

window.firestoreGetComparisons = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.comparisonHistory || [];
  } catch (e) {
    console.error('firestoreGetComparisons error:', e);
    return [];
  }
};

window.firestoreAddFavorite = async (uid, speciesKey) => {
  const ref = doc(firestore, 'users', uid);
  try {
    await updateDoc(ref, { 'profile.favoriteSpecies': arrayUnion(speciesKey) });
    return { success: true };
  } catch (e) {
    console.error('firestoreAddFavorite error:', e);
    return { success: false };
  }
};

window.firestoreRemoveFavorite = async (uid, speciesKey) => {
  const ref = doc(firestore, 'users', uid);
  try {
    await updateDoc(ref, { 'profile.favoriteSpecies': arrayRemove(speciesKey) });
    return { success: true };
  } catch (e) {
    console.error('firestoreRemoveFavorite error:', e);
    return { success: false };
  }
};

window.firestoreGetFavorites = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.favoriteSpecies || [];
  } catch (e) {
    console.error('firestoreGetFavorites error:', e);
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
      if (index !== -1) profile.profile.tanks[index] = tank;
    } else {
      tank.id = Date.now().toString();
      tank.created = new Date().toISOString();
      profile.profile.tanks.push(tank);
    }
    await setDoc(ref, profile, { merge: true });
    return { success: true, tankId: tank.id };
  } catch (e) {
    console.error('firestoreSaveTank error:', e);
    return { success: false };
  }
};

window.firestoreGetTanks = async uid => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    return profile?.profile?.tanks || [];
  } catch (e) {
    console.error('firestoreGetTanks error:', e);
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
    console.error('firestoreDeleteTank error:', e);
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
    console.error('firestoreExportUserData error:', e);
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
    console.error('firestoreImportUserData error:', e);
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
    console.error('firestoreAddTankEvent error:', e);
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
    console.error('firestoreGetTankEvents error:', e);
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
    console.error('firestoreGetAllUserEvents error:', e);
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
    console.error('firestoreDeleteTankEvent error:', e);
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
    console.error('firestoreSaveTankSchedule error:', e);
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
    console.error('firestoreGetTankSchedules error:', e);
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
    console.error('firestoreGetAllUserSchedules error:', e);
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
    console.error('firestoreCompleteSchedule error:', e);
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
    console.error('firestoreDeleteTankSchedule error:', e);
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
    console.error('firestoreUsernameExists error:', e);
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
    console.error('firestoreCreateUsername error:', e);
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
    console.error('firestoreGetUidByUsername error:', e);
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
    console.error('firestoreDeleteUsername error:', e);
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
    console.error('firestoreGetNotifications error:', e);
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
    console.error('firestoreMarkNotificationRead error:', e);
    return false;
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
    console.warn('FCM VAPID key not configured');
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

    console.log('FCM token obtained and saved');
    return { success: true, token };
  } catch (e) {
    console.error('fcmRequestPermission error:', e);
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
    console.error('fcmSaveToken: Missing required params', {
      firestore: !!firestore,
      uid: !!uid,
      token: !!token,
    });
    return false;
  }
  try {
    // Create a simple hash of the token for the document ID
    // This prevents duplicate tokens for the same device
    const tokenHash = await hashToken(token);
    console.log('fcmSaveToken: Saving token with hash', tokenHash.substring(0, 20) + '...');

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
    console.log('fcmSaveToken: Token saved successfully');
    return true;
  } catch (e) {
    console.error('fcmSaveToken error:', e.code, e.message);
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
    console.error('fcmGetUserTokens error:', e);
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
      console.log('No FCM tokens to disable');
      return true; // Nothing to disable, consider it success
    }

    // Mark all tokens as invalid
    for (const tokenDoc of snap.docs) {
      await updateDoc(tokenDoc.ref, { valid: false });
    }

    console.log(`Push notifications disabled (${snap.size} token(s))`);
    return true;
  } catch (e) {
    console.error('fcmDisableNotifications error:', e);
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
    console.error('fcmIsEnabled error:', e);
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
    console.log('FCM foreground message received:', payload);

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

export { app, auth, firestore, messaging };
