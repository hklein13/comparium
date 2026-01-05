// ============================================================================
// STORAGE SERVICE - Single Point of Data Access
// ============================================================================
// This file is designed for easy migration to backend storage in the future.
// To switch to Firebase/Supabase: just modify the methods in this file.
// No other files in the project need to change!
// ============================================================================

class StorageService {
  constructor() {
    // Firestore is now the primary storage backend
    // localStorage is only used for UI preferences (theme)
    this.useBackend = true; // Firestore enabled
  }

  // ========================================================================
  // USER AUTHENTICATION
  // ========================================================================

  /**
   * Register a new user
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async registerUser(username, password, email) {
    let uid = null;
    let usernameCreated = false;

    try {
      const auth = window.firebaseAuth;

      // Require Firebase Auth and Firestore
      if (
        !auth ||
        !window.firebaseSignUp ||
        !window.firestoreSetProfile ||
        !window.firestoreUsernameExists ||
        !window.firestoreCreateUsername ||
        !window.firestoreDeleteUsername
      ) {
        return {
          success: false,
          message: 'Database connection unavailable. Please try again later.',
        };
      }

      // Check username uniqueness in Firestore
      const usernameCheck = await window.firestoreUsernameExists(username);
      if (usernameCheck.error) {
        return {
          success: false,
          message: 'Database connection unavailable. Please try again later.',
        };
      }
      if (usernameCheck.exists) {
        return { success: false, message: 'Username already exists' };
      }

      // Create Firebase Auth user with email/password
      const userCredential = await window.firebaseSignUp(auth, email, password);
      uid = userCredential.user.uid;

      // Create username mapping FIRST (must exist before profile due to Firestore rules)
      const usernameMapped = await window.firestoreCreateUsername(username, uid, email);
      if (!usernameMapped) {
        console.error('Failed to create username mapping');
        // CLEANUP: Delete the auth user we just created
        try {
          await userCredential.user.delete();
        } catch (deleteError) {
          console.error('Failed to cleanup auth user:', deleteError);
        }
        return { success: false, message: 'Username is already taken. Please try another.' };
      }
      usernameCreated = true;

      // Create user profile object
      const user = {
        uid: uid,
        username: username,
        email: email,
        created: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profile: {
          favoriteSpecies: [],
          comparisonHistory: [],
          tanks: [],
        },
      };

      // Save profile to Firestore users collection (username exists now, so rules pass)
      const profileSaved = await window.firestoreSetProfile(uid, user);
      if (!profileSaved) {
        console.error('Failed to save profile to Firestore');
        // CLEANUP: Delete username document and auth user
        try {
          await window.firestoreDeleteUsername(username);
          await auth.currentUser?.delete();
        } catch (deleteError) {
          console.error('Failed to cleanup after profile save failure:', deleteError);
        }
        return { success: false, message: 'Failed to create account. Please try again.' };
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      console.error('Registration error:', error);

      // CLEANUP: If we created username or auth user, clean them up
      if (usernameCreated) {
        try {
          await window.firestoreDeleteUsername(username);
        } catch (deleteError) {
          console.error('Failed to cleanup username on error:', deleteError);
        }
      }
      if (uid) {
        try {
          const auth = window.firebaseAuth;
          await auth.currentUser?.delete();
        } catch (deleteError) {
          console.error('Failed to cleanup auth user on error:', deleteError);
        }
      }

      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'Email address is already in use' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, message: 'Invalid email address' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, message: 'Password should be at least 6 characters' };
      }

      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, message: string, user?: object}>}
   */
  async loginUser(identifier, password) {
    try {
      const auth = window.firebaseAuth;

      // Require Firebase Auth and Firestore
      if (!auth || !window.firebaseSignIn || !window.firestoreGetProfile) {
        return {
          success: false,
          message: 'Database connection unavailable. Please try again later.',
        };
      }

      let email = null;
      let uid = null;

      if (identifier.includes('@')) {
        // identifier is an email
        email = identifier;
      } else {
        // identifier is a username - look up UID and email from Firestore
        if (!window.firestoreGetUidByUsername) {
          return {
            success: false,
            message: 'Database connection unavailable. Please try again later.',
          };
        }

        const userData = await window.firestoreGetUidByUsername(identifier);
        if (!userData || !userData.uid || !userData.email) {
          return { success: false, message: 'Username not found' };
        }

        uid = userData.uid;
        email = userData.email;
      }

      // Sign in with Firebase Auth using email/password
      const userCredential = await window.firebaseSignIn(auth, email, password);
      uid = uid || userCredential.user.uid;

      // Fetch user profile from Firestore
      const profile = await window.firestoreGetProfile(uid);
      if (!profile) {
        return { success: false, message: 'User profile not found' };
      }

      // Update lastLogin timestamp
      profile.lastLogin = new Date().toISOString();
      await window.firestoreSetProfile(uid, profile);

      return {
        success: true,
        message: 'Login successful!',
        user: {
          username: profile.username,
          email: profile.email,
          created: profile.created,
        },
      };
    } catch (error) {
      console.error('Login error:', error);

      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        return { success: false, message: 'User not found' };
      } else if (error.code === 'auth/wrong-password') {
        return { success: false, message: 'Incorrect password' };
      } else if (error.code === 'auth/invalid-email') {
        return { success: false, message: 'Invalid email address' };
      } else if (error.code === 'auth/user-disabled') {
        return { success: false, message: 'This account has been disabled' };
      }

      return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
  }

  /**
   * Logout current user
   */
  async logoutUser() {
    try {
      const auth = window.firebaseAuth;
      if (auth && window.firebaseSignOut) {
        await window.firebaseSignOut(auth);
      }
      return { success: true };
    } catch (e) {
      console.error('Logout failed:', e);
      return { success: false, message: 'Logout failed' };
    }
  }

  /**
   * Get currently logged in user
   * @returns {Promise<string|null>} username
   */
  async getCurrentUser() {
    // Check Firebase Auth state
    const auth = window.firebaseAuth;
    if (!auth || !auth.currentUser) {
      return null;
    }

    // Get username from Firestore profile
    const uid = auth.currentUser.uid;
    if (window.firestoreGetProfile) {
      try {
        const profile = await window.firestoreGetProfile(uid);
        return profile?.username || auth.currentUser.email || null;
      } catch (e) {
        console.error('Error getting current user:', e);
      }
    }

    // Fallback to email if Firestore unavailable
    return auth.currentUser.email || null;
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    const auth = window.firebaseAuth;
    return !!(auth && auth.currentUser);
  }

  // ========================================================================
  // USER PROFILE
  // ========================================================================

  /**
   * Get user profile data
   * NOTE: Currently unused - dashboard loads profile directly with firestoreGetProfile()
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<object|null>}
   */
  async getUserProfile(uid) {
    try {
      if (!window.firebaseFirestore || !window.firestoreGetProfile) {
        return null;
      }

      if (!uid) return null;

      const profile = await window.firestoreGetProfile(uid);
      return profile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * NOTE: Currently unused - kept for future profile editing features
   * @param {string} uid - Firebase Auth UID
   * @param {object} updates - Profile fields to update
   * @returns {Promise<{success: boolean}>}
   */
  async updateUserProfile(uid, updates) {
    try {
      if (!window.firebaseFirestore || !window.firestoreUpdateProfile) {
        return { success: false };
      }

      if (!uid) return { success: false };

      // Update in Firestore
      const success = await window.firestoreUpdateProfile(uid, updates);
      return { success };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false };
    }
  }

  // ========================================================================
  // COMPARISON HISTORY
  // ========================================================================

  /**
   * Save a comparison to history
   * @param {string} uid - Firebase Auth UID
   * @param {object} comparison
   * @returns {Promise<{success: boolean}>}
   */
  async saveComparison(uid, comparison) {
    try {
      if (!window.firebaseFirestore || !window.firestoreAddComparison) {
        return { success: false };
      }

      if (!uid) return { success: false };

      return await window.firestoreAddComparison(uid, comparison);
    } catch (error) {
      console.error('Error saving comparison:', error);
      return { success: false };
    }
  }

  /**
   * Get comparison history
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<array>}
   */
  async getComparisonHistory(uid) {
    try {
      if (!window.firebaseFirestore || !window.firestoreGetComparisons) {
        return [];
      }

      if (!uid) return [];

      return await window.firestoreGetComparisons(uid);
    } catch (error) {
      console.error('Error getting comparison history:', error);
      return [];
    }
  }

  // ========================================================================
  // FAVORITE SPECIES
  // ========================================================================

  /**
   * Add species to favorites
   * @param {string} uid - Firebase Auth UID
   * @param {string} speciesKey
   * @returns {Promise<{success: boolean}>}
   */
  async addFavorite(uid, speciesKey) {
    try {
      if (!window.firebaseFirestore || !window.firestoreAddFavorite) {
        return { success: false };
      }

      if (!uid) return { success: false };

      return await window.firestoreAddFavorite(uid, speciesKey);
    } catch (error) {
      console.error('Error adding favorite:', error);
      return { success: false };
    }
  }

  /**
   * Remove species from favorites
   * @param {string} uid - Firebase Auth UID
   * @param {string} speciesKey
   * @returns {Promise<{success: boolean}>}
   */
  async removeFavorite(uid, speciesKey) {
    try {
      if (!window.firebaseFirestore || !window.firestoreRemoveFavorite) {
        return { success: false };
      }

      if (!uid) return { success: false };

      return await window.firestoreRemoveFavorite(uid, speciesKey);
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { success: false };
    }
  }

  /**
   * Get favorite species
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<array>}
   */
  async getFavorites(uid) {
    try {
      if (!window.firebaseFirestore || !window.firestoreGetFavorites) {
        return [];
      }

      if (!uid) return [];

      return await window.firestoreGetFavorites(uid);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Check if species is favorited
   * @param {string} uid - Firebase Auth UID
   * @param {string} speciesKey
   * @returns {Promise<boolean>}
   */
  async isFavorite(uid, speciesKey) {
    const favorites = await this.getFavorites(uid);
    return favorites.includes(speciesKey);
  }

  // ========================================================================
  // TANK MANAGEMENT
  // ========================================================================

  /**
   * Save a tank configuration
   * @param {string} uid - Firebase Auth UID
   * @param {object} tank
   * @returns {Promise<{success: boolean, tankId?: string}>}
   */
  async saveTank(uid, tank) {
    try {
      if (!window.firebaseFirestore || !window.firestoreSaveTank) {
        return { success: false };
      }

      if (!uid) return { success: false };

      return await window.firestoreSaveTank(uid, tank);
    } catch (error) {
      console.error('Error saving tank:', error);
      return { success: false };
    }
  }

  /**
   * Get all tanks for user
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<array>}
   */
  async getTanks(uid) {
    try {
      if (!window.firebaseFirestore || !window.firestoreGetTanks) {
        return [];
      }

      if (!uid) return [];

      return await window.firestoreGetTanks(uid);
    } catch (error) {
      console.error('Error getting tanks:', error);
      return [];
    }
  }

  /**
   * Get single tank by ID
   * @param {string} uid - Firebase Auth UID
   * @param {string} tankId
   * @returns {Promise<object|null>}
   */
  async getTank(uid, tankId) {
    try {
      const tanks = await this.getTanks(uid);
      return tanks.find(t => t.id === tankId) || null;
    } catch (error) {
      console.error('Error getting tank:', error);
      return null;
    }
  }

  /**
   * Delete a tank
   * @param {string} uid - Firebase Auth UID
   * @param {string} tankId
   * @returns {Promise<{success: boolean}>}
   */
  async deleteTank(uid, tankId) {
    try {
      if (!window.firebaseFirestore || !window.firestoreDeleteTank) {
        return { success: false };
      }

      if (!uid) return { success: false };

      return await window.firestoreDeleteTank(uid, tankId);
    } catch (error) {
      console.error('Error deleting tank:', error);
      return { success: false };
    }
  }

  // ========================================================================
  // EXPORT / IMPORT (For Data Portability)
  // ========================================================================

  /**
   * Export user data as JSON
   * @param {string} uid - Firebase Auth UID
   * @returns {Promise<object|null>}
   */
  async exportUserData(uid) {
    try {
      if (!uid) return null;

      if (window.firebaseFirestore && window.firestoreExportUserData) {
        return await window.firestoreExportUserData(uid);
      }

      // Firestore not available
      return null;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import user data from JSON
   * @param {string} uid - Firebase Auth UID
   * @param {object} importData
   * @returns {Promise<{success: boolean}>}
   */
  async importUserData(uid, importData) {
    try {
      if (!uid) return { success: false };

      if (window.firebaseFirestore && window.firestoreImportUserData) {
        return await window.firestoreImportUserData(uid, importData);
      }

      return { success: false, message: 'Database connection unavailable' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false };
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
}

// Create singleton instance
const storageService = new StorageService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
