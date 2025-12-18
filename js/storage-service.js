// ============================================================================
// STORAGE SERVICE - Single Point of Data Access
// ============================================================================
// This file is designed for easy migration to backend storage in the future.
// To switch to Firebase/Supabase: just modify the methods in this file.
// No other files in the project need to change!
// ============================================================================

class StorageService {
    constructor() {
        // Future: Add backend API endpoint here
        // this.apiUrl = 'https://your-backend.com/api';
        this.useBackend = false; // Toggle when ready for backend
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
            // If Firebase Auth is available, create the account there and store the profile in Firestore (preferred)
            const auth = window.firebaseAuth;
            if (auth && window.firebaseSignUp && window.firestoreSetProfile) {
                // Quick username uniqueness check against existing local mapping
                if (localStorage.getItem(`username_map_${username}`)) {
                    return { success: false, message: 'Username already exists' };
                }

                // Create Firebase user with email/password
                const userCredential = await window.firebaseSignUp(auth, email, password);
                const uid = userCredential.user.uid;

                // Create profile object and save to Firestore
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

                const saved = await window.firestoreSetProfile(uid, user);
                if (!saved) {
                    // fallback to local storage if Firestore write fails
                    localStorage.setItem(`user_${uid}`, JSON.stringify(user));
                }

                // Map username to uid for lookup
                localStorage.setItem(`username_map_${username}`, uid);
                // Store current session username for compatibility
                localStorage.setItem('currentUser', username);

                return { success: true, message: 'Account created successfully!' };
            }

            // Fallback: original localStorage behaviour (no Firebase)
            const existingUser = localStorage.getItem(`user_${username}`);
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }

            const user = {
                username: username,
                email: email,
                password: this._hashPassword(password), // Simple hash
                created: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                profile: {
                    favoriteSpecies: [],
                    comparisonHistory: [],
                    tanks: []
                }
            };

            localStorage.setItem(`user_${username}`, JSON.stringify(user));
            return { success: true, message: 'Account created successfully!' };

        } catch (error) {
            console.error('Registration error:', error);
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
            // identifier may be an email or a username
            const auth = window.firebaseAuth;

            // If Firebase Auth available, try using it
            if (auth && window.firebaseSignIn) {
                let email = null;
                let uid = null;

                if (identifier.includes('@')) {
                    email = identifier;
                    // attempt to find profile by email to get uid
                    if (window.firestoreGetProfileByEmail) {
                        const profile = await window.firestoreGetProfileByEmail(email);
                        if (profile && profile.uid) uid = profile.uid;
                    }
                } else {
                    // Treat identifier as username; map to uid then to stored profile
                    uid = localStorage.getItem(`username_map_${identifier}`);
                    if (uid) {
                        const localUserJson = localStorage.getItem(`user_${uid}`);
                        if (localUserJson) {
                            const localUser = JSON.parse(localUserJson);
                            email = localUser.email;
                        } else if (window.firestoreGetProfile) {
                            const profile = await window.firestoreGetProfile(uid);
                            if (profile && profile.email) email = profile.email;
                        }
                    }
                    if (!email) {
                        return { success: false, message: 'Username not found' };
                    }
                }

                // Sign in using Firebase
                const userCredential = await window.firebaseSignIn(auth, email, password);
                uid = uid || userCredential.user.uid;

                // Try to fetch profile from Firestore
                let profile = null;
                if (window.firestoreGetProfile && uid) profile = await window.firestoreGetProfile(uid);

                if (profile) {
                    // Update lastLogin
                    profile.lastLogin = new Date().toISOString();
                    await window.firestoreSetProfile(uid, profile);

                    // Ensure local mapping
                    if (profile.username) localStorage.setItem(`username_map_${profile.username}`, uid);
                    localStorage.setItem(`user_${uid}`, JSON.stringify(profile));
                    localStorage.setItem('currentUser', profile.username);

                    return {
                        success: true,
                        message: 'Login successful!',
                        user: {
                            username: profile.username,
                            email: profile.email,
                            created: profile.created
                        }
                    };
                }

                // If we don't have a Firestore profile, fallback to email as username
                localStorage.setItem('currentUser', email);
                return { success: true, message: 'Login successful!', user: { username: email, email } };
            }

            // Fallback to localStorage auth
            const userJson = localStorage.getItem(`user_${identifier}`);
            if (!userJson) {
                return { success: false, message: 'Username not found' };
            }

            const user = JSON.parse(userJson);
            const hashedPassword = this._hashPassword(password);

            if (user.password !== hashedPassword) {
                return { success: false, message: 'Incorrect password' };
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem(`user_${identifier}`, JSON.stringify(user));

            // Set current session
            localStorage.setItem('currentUser', identifier);

            return {
                success: true,
                message: 'Login successful!',
                user: {
                    username: user.username,
                    email: user.email,
                    created: user.created
                }
            };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: (error && error.message) ? error.message : 'Login failed. Please try again.' };
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
        } catch (e) {
            console.warn('Firebase signOut failed:', e.message || e);
        }
        localStorage.removeItem('currentUser');
        return { success: true };
    }

    /**
     * Get currently logged in user
     * @returns {string|null} username
     */
    getCurrentUser() {
        // Prefer Firebase auth current user if present
        const auth = window.firebaseAuth;
        if (auth && auth.currentUser) {
            // Try to return mapped username if available
            const uid = auth.currentUser.uid;
            const localJson = localStorage.getItem(`user_${uid}`);
            if (localJson) {
                try { return JSON.parse(localJson).username; } catch(e){ }
            }
            return auth.currentUser.email || null;
        }

        // Fallback to legacy currentUser
        return localStorage.getItem('currentUser');
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
            // If Firestore is available, prefer to fetch profile from there
            if (window.firebaseFirestore && window.firestoreGetProfile) {
                let uid = localStorage.getItem(`username_map_${username}`) || username;

                // If username looks like an email, try lookup by email
                if (username && username.includes('@') && window.firestoreGetProfileByEmail) {
                    const profileByEmail = await window.firestoreGetProfileByEmail(username);
                    if (profileByEmail) return profileByEmail;
                }

                const profile = await window.firestoreGetProfile(uid);
                if (profile) return profile;
            }

            // Fallback to localStorage
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return null;

            const user = JSON.parse(userJson);
            return {
                username: user.username,
                email: user.email,
                created: user.created,
                lastLogin: user.lastLogin,
                profile: user.profile
            };
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
            // Resolve username->uid mapping
            const uid = localStorage.getItem(`username_map_${username}`) || username;

            // If Firestore available, update there
            if (window.firebaseFirestore && window.firestoreUpdateProfile) {
                const success = await window.firestoreUpdateProfile(uid, updates);
                if (success) {
                    // Keep a local copy in sync as fallback
                    const profile = await window.firestoreGetProfile(uid);
                    if (profile) localStorage.setItem(`user_${uid}`, JSON.stringify(profile));
                    return { success: true };
                }
                return { success: false };
            }

            // Fallback to localStorage update
            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            // Merge updates
            if (updates.email) user.email = updates.email;
            if (updates.profile) {
                user.profile = { ...user.profile, ...updates.profile };
            }

            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true };
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreAddComparison) {
                // Firestore will append using arrayUnion
                return await window.firestoreAddComparison(uid, comparison);
            }

            // Fallback: localStorage
            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            
            const comparisonRecord = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                species: comparison.species,
                compatible: comparison.compatible
            };

            user.profile.comparisonHistory = user.profile.comparisonHistory || [];
            user.profile.comparisonHistory.unshift(comparisonRecord); // Add to beginning
            
            // Keep only last 50 comparisons
            if (user.profile.comparisonHistory.length > 50) {
                user.profile.comparisonHistory = user.profile.comparisonHistory.slice(0, 50);
            }

            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true, id: comparisonRecord.id };

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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreGetComparisons) {
                return await window.firestoreGetComparisons(uid);
            }
            const profile = await this.getUserProfile(username);
            return profile?.profile?.comparisonHistory || [];
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreAddFavorite) {
                return await window.firestoreAddFavorite(uid, speciesKey);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.favoriteSpecies = user.profile.favoriteSpecies || [];
            
            if (!user.profile.favoriteSpecies.includes(speciesKey)) {
                user.profile.favoriteSpecies.push(speciesKey);
                localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            }

            return { success: true };
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreRemoveFavorite) {
                return await window.firestoreRemoveFavorite(uid, speciesKey);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.favoriteSpecies = user.profile.favoriteSpecies || [];
            
            user.profile.favoriteSpecies = user.profile.favoriteSpecies.filter(
                key => key !== speciesKey
            );
            
            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true };
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreGetFavorites) {
                return await window.firestoreGetFavorites(uid);
            }
            const profile = await this.getUserProfile(username);
            return profile?.profile?.favoriteSpecies || [];
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreSaveTank) {
                return await window.firestoreSaveTank(uid, tank);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.tanks = user.profile.tanks || [];

            if (tank.id) {
                // Update existing tank
                const index = user.profile.tanks.findIndex(t => t.id === tank.id);
                if (index !== -1) {
                    user.profile.tanks[index] = tank;
                }
            } else {
                // Create new tank
                tank.id = Date.now().toString();
                tank.created = new Date().toISOString();
                user.profile.tanks.push(tank);
            }

            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true, tankId: tank.id };

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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreGetTanks) {
                return await window.firestoreGetTanks(uid);
            }
            const profile = await this.getUserProfile(username);
            return profile?.profile?.tanks || [];
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
            const uid = localStorage.getItem(`username_map_${username}`) || username;
            if (window.firebaseFirestore && window.firestoreDeleteTank) {
                return await window.firestoreDeleteTank(uid, tankId);
            }

            const userJson = localStorage.getItem(`user_${uid}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.tanks = user.profile.tanks || [];
            
            user.profile.tanks = user.profile.tanks.filter(t => t.id !== tankId);
            
            localStorage.setItem(`user_${uid}`, JSON.stringify(user));
            return { success: true };
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
     * Simple password hashing (NOT secure for production - use bcrypt with backend)
     * @private
     */
    _hashPassword(password) {
        // This is a simple hash for demo purposes
        // With backend, use proper bcrypt/argon2
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    /**
     * Clear all user data (for testing)
     */
    clearAllData() {
        if (confirm('This will delete ALL user data. Are you sure?')) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('user_') || key === 'currentUser') {
                    localStorage.removeItem(key);
                }
            });
            return true;
        }
        return false;
    }
}

// Create singleton instance
const storageService = new StorageService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
