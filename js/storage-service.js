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
        try {
            const auth = window.firebaseAuth;

            // Require Firebase Auth and Firestore
            if (!auth || !window.firebaseSignUp || !window.firestoreSetProfile || !window.firestoreUsernameExists || !window.firestoreCreateUsername) {
                return { success: false, message: 'Database connection unavailable. Please try again later.' };
            }

            // Check username uniqueness in Firestore
            const usernameExists = await window.firestoreUsernameExists(username);
            if (usernameExists) {
                return { success: false, message: 'Username already exists' };
            }

            // Create Firebase Auth user with email/password
            const userCredential = await window.firebaseSignUp(auth, email, password);
            const uid = userCredential.user.uid;

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
                    tanks: []
                }
            };

            // Save profile to Firestore users collection
            const profileSaved = await window.firestoreSetProfile(uid, user);
            if (!profileSaved) {
                // Clean up Auth user if Firestore save failed
                console.error('Failed to save profile to Firestore');
                return { success: false, message: 'Failed to create account. Please try again.' };
            }

            // Create username mapping in Firestore usernames collection
            const usernameMapped = await window.firestoreCreateUsername(username, uid);
            if (!usernameMapped) {
                console.error('Failed to create username mapping');
                // Profile is saved, so account is usable, just log the error
            }

            return { success: true, message: 'Account created successfully!' };

        } catch (error) {
            console.error('Registration error:', error);

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
                return { success: false, message: 'Database connection unavailable. Please try again later.' };
            }

            let email = null;
            let uid = null;

            if (identifier.includes('@')) {
                // identifier is an email
                email = identifier;
            } else {
                // identifier is a username - look up UID from Firestore
                if (!window.firestoreGetUidByUsername) {
                    return { success: false, message: 'Database connection unavailable. Please try again later.' };
                }

                uid = await window.firestoreGetUidByUsername(identifier);
                if (!uid) {
                    return { success: false, message: 'Username not found' };
                }

                // Get email from user profile
                const profile = await window.firestoreGetProfile(uid);
                if (!profile || !profile.email) {
                    return { success: false, message: 'User profile not found' };
                }
                email = profile.email;
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
                    created: profile.created
                }
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
        if (auth && auth.currentUser) return true;
        return this.getCurrentUser() !== null;
    }

    // ========================================================================
    // USER PROFILE
    // ========================================================================

    /**
     * Get user profile data
     * @param {string} username
     * @returns {Promise<object|null>}
     */
    async getUserProfile(username) {
        try {
            if (!window.firebaseFirestore || !window.firestoreGetProfile) {
                return null;
            }

            let uid = null;

            // If username looks like an email, look up by email
            if (username && username.includes('@')) {
                if (window.firestoreGetProfileByEmail) {
                    const profileByEmail = await window.firestoreGetProfileByEmail(username);
                    if (profileByEmail) return profileByEmail;
                }
                return null;
            }

            // Look up UID from username
            if (window.firestoreGetUidByUsername) {
                uid = await window.firestoreGetUidByUsername(username);
            }

            if (!uid) {
                // Maybe username is actually a UID, try directly
                uid = username;
            }

            const profile = await window.firestoreGetProfile(uid);
            return profile;

        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    /**
     * Update user profile
     * @param {string} username
     * @param {object} updates
     * @returns {Promise<{success: boolean}>}
     */
    async updateUserProfile(username, updates) {
        try {
            if (!window.firebaseFirestore || !window.firestoreUpdateProfile) {
                return { success: false };
            }

            // Resolve username -> UID
            let uid = null;
            if (window.firestoreGetUidByUsername && !username.includes('@')) {
                uid = await window.firestoreGetUidByUsername(username);
            } else {
                uid = username; // Assume it's a UID or handle email lookup
            }

            if (!uid) {
                return { success: false };
            }

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
     * @param {string} username
     * @param {object} comparison
     * @returns {Promise<{success: boolean}>}
     */
    async saveComparison(username, comparison) {
        try {
            if (!window.firebaseFirestore || !window.firestoreAddComparison) {
                return { success: false };
            }

            const uid = await this._resolveUid(username);
            if (!uid) return { success: false };

            return await window.firestoreAddComparison(uid, comparison);

        } catch (error) {
            console.error('Error saving comparison:', error);
            return { success: false };
        }
    }

    /**
     * Get comparison history
     * @param {string} username
     * @returns {Promise<array>}
     */
    async getComparisonHistory(username) {
        try {
            if (!window.firebaseFirestore || !window.firestoreGetComparisons) {
                return [];
            }

            const uid = await this._resolveUid(username);
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
     * @param {string} username
     * @param {string} speciesKey
     * @returns {Promise<{success: boolean}>}
     */
    async addFavorite(username, speciesKey) {
        try {
            if (!window.firebaseFirestore || !window.firestoreAddFavorite) {
                return { success: false };
            }

            const uid = await this._resolveUid(username);
            if (!uid) return { success: false };

            return await window.firestoreAddFavorite(uid, speciesKey);

        } catch (error) {
            console.error('Error adding favorite:', error);
            return { success: false };
        }
    }

    /**
     * Remove species from favorites
     * @param {string} username
     * @param {string} speciesKey
     * @returns {Promise<{success: boolean}>}
     */
    async removeFavorite(username, speciesKey) {
        try {
            if (!window.firebaseFirestore || !window.firestoreRemoveFavorite) {
                return { success: false };
            }

            const uid = await this._resolveUid(username);
            if (!uid) return { success: false };

            return await window.firestoreRemoveFavorite(uid, speciesKey);

        } catch (error) {
            console.error('Error removing favorite:', error);
            return { success: false };
        }
    }

    /**
     * Get favorite species
     * @param {string} username
     * @returns {Promise<array>}
     */
    async getFavorites(username) {
        try {
            if (!window.firebaseFirestore || !window.firestoreGetFavorites) {
                return [];
            }

            const uid = await this._resolveUid(username);
            if (!uid) return [];

            return await window.firestoreGetFavorites(uid);

        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    }

    /**
     * Check if species is favorited
     * @param {string} username 
     * @param {string} speciesKey 
     * @returns {Promise<boolean>}
     */
    async isFavorite(username, speciesKey) {
        const favorites = await this.getFavorites(username);
        return favorites.includes(speciesKey);
    }

    // ========================================================================
    // TANK MANAGEMENT
    // ========================================================================

    /**
     * Save a tank configuration
     * @param {string} username
     * @param {object} tank
     * @returns {Promise<{success: boolean, tankId?: string}>}
     */
    async saveTank(username, tank) {
        try {
            if (!window.firebaseFirestore || !window.firestoreSaveTank) {
                return { success: false };
            }

            const uid = await this._resolveUid(username);
            if (!uid) return { success: false };

            return await window.firestoreSaveTank(uid, tank);

        } catch (error) {
            console.error('Error saving tank:', error);
            return { success: false };
        }
    }

    /**
     * Get all tanks for user
     * @param {string} username
     * @returns {Promise<array>}
     */
    async getTanks(username) {
        try {
            if (!window.firebaseFirestore || !window.firestoreGetTanks) {
                return [];
            }

            const uid = await this._resolveUid(username);
            if (!uid) return [];

            return await window.firestoreGetTanks(uid);

        } catch (error) {
            console.error('Error getting tanks:', error);
            return [];
        }
    }

    /**
     * Get single tank by ID
     * @param {string} username
     * @param {string} tankId
     * @returns {Promise<object|null>}
     */
    async getTank(username, tankId) {
        try {
            const tanks = await this.getTanks(username);
            return tanks.find(t => t.id === tankId) || null;
        } catch (error) {
            console.error('Error getting tank:', error);
            return null;
        }
    }

    /**
     * Delete a tank
     * @param {string} username
     * @param {string} tankId
     * @returns {Promise<{success: boolean}>}
     */
    async deleteTank(username, tankId) {
        try {
            if (!window.firebaseFirestore || !window.firestoreDeleteTank) {
                return { success: false };
            }

            const uid = await this._resolveUid(username);
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
     * @param {string} username 
     * @returns {Promise<object|null>}
     */
    async exportUserData(username) {
        try {
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreExportUserData) {
                return await window.firestoreExportUserData(uid);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return null;

            const user = JSON.parse(userJson);
            
            // Remove sensitive data
            const exportData = {
                username: user.username,
                email: user.email,
                created: user.created,
                profile: user.profile,
                exportDate: new Date().toISOString()
            };

            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Import user data from JSON
     * @param {string} username 
     * @param {object} importData 
     * @returns {Promise<{success: boolean}>}
     */
    async importUserData(username, importData) {
        try {
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreImportUserData) {
                return await window.firestoreImportUserData(uid, importData);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            
            // Merge imported data with existing
            if (importData.profile) {
                user.profile = {
                    ...user.profile,
                    ...importData.profile
                };
            }

            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false };
        }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Resolve username to UID
     * @param {string} username - Username or UID
     * @returns {Promise<string|null>} - UID or null
     * @private
     */
    async _resolveUid(username) {
        if (!username) return null;

        // If it looks like an email, don't try username lookup
        if (username.includes('@')) {
            // Try to get profile by email
            if (window.firestoreGetProfileByEmail) {
                const profile = await window.firestoreGetProfileByEmail(username);
                return profile?.uid || null;
            }
            return null;
        }

        // Try to look up UID from username
        if (window.firestoreGetUidByUsername) {
            const uid = await window.firestoreGetUidByUsername(username);
            if (uid) return uid;
        }

        // Assume it's already a UID
        return username;
    }
}

// Create singleton instance
const storageService = new StorageService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
