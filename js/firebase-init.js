// Firebase initialization (module)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// NOTE: Keep the same config that's currently in index.html
const firebaseConfig = {
  apiKey: "AIzaSyDExicgmY78u4NAWVJngqaZkhKdmAbebjM",
  authDomain: "comparium-21b69.firebaseapp.com",
  projectId: "comparium-21b69",
  storageBucket: "comparium-21b69.firebasestorage.app",
  messagingSenderId: "925744346774",
  appId: "1:925744346774:web:77453c0374054d5b0d74b7",
  measurementId: "G-WSR0CCKYEC"
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

// Expose helpers globally for ease of migration
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseFirestore = firestore;
window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignUp = createUserWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseAuthState = onAuthStateChanged;

// Simple helper to get current user uid
window.getFirebaseUid = () => auth.currentUser ? auth.currentUser.uid : null;

// Firestore helper wrappers
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

window.firestoreGetProfile = async (uid) => {
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

window.firestoreGetProfileByEmail = async (email) => {
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

window.firestoreGetComparisons = async (uid) => {
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

window.firestoreGetFavorites = async (uid) => {
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

window.firestoreGetTanks = async (uid) => {
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

window.firestoreExportUserData = async (uid) => {
  try {
    const profile = await window.firestoreGetProfile(uid);
    if (!profile) return null;
    return {
      username: profile.username,
      email: profile.email,
      created: profile.created,
      profile: profile.profile,
      exportDate: new Date().toISOString()
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
// USERNAME MANAGEMENT (for username uniqueness and UID lookups)
// ============================================================================

/**
 * Check if a username already exists in the usernames collection
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - True if username exists, false otherwise
 */
window.firestoreUsernameExists = async (username) => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'usernames', username);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (e) {
    console.error('firestoreUsernameExists error:', e);
    return false;
  }
};

/**
 * Create a username mapping (username -> UID) in Firestore
 * @param {string} username - Username to register
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<boolean>} - True if created successfully, false otherwise
 */
window.firestoreCreateUsername = async (username, uid) => {
  if (!firestore) return false;
  try {
    const ref = doc(firestore, 'usernames', username);
    await setDoc(ref, {
      uid: uid,
      created: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('firestoreCreateUsername error:', e);
    return false;
  }
};

/**
 * Get UID from username by querying the usernames collection
 * @param {string} username - Username to lookup
 * @returns {Promise<string|null>} - UID if found, null otherwise
 */
window.firestoreGetUidByUsername = async (username) => {
  if (!firestore) return null;
  try {
    const ref = doc(firestore, 'usernames', username);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().uid : null;
  } catch (e) {
    console.error('firestoreGetUidByUsername error:', e);
    return null;
  }
};

export { app, auth, firestore };
