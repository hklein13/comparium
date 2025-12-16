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
            // Check if username already exists
            const existingUser = localStorage.getItem(`user_${username}`);
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }

            // Create user object
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

            // Save to localStorage
            localStorage.setItem(`user_${username}`, JSON.stringify(user));
            
            return { success: true, message: 'Account created successfully!' };

            // FUTURE BACKEND VERSION:
            // const response = await fetch(`${this.apiUrl}/users/register`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ username, password, email })
            // });
            // return await response.json();

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
    async loginUser(username, password) {
        try {
            const userJson = localStorage.getItem(`user_${username}`);
            
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
            localStorage.setItem(`user_${username}`, JSON.stringify(user));

            // Set current session
            localStorage.setItem('currentUser', username);

            return { 
                success: true, 
                message: 'Login successful!',
                user: {
                    username: user.username,
                    email: user.email,
                    created: user.created
                }
            };

            // FUTURE BACKEND VERSION:
            // const response = await fetch(`${this.apiUrl}/users/login`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ username, password })
            // });
            // return await response.json();

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    /**
     * Logout current user
     */
    async logoutUser() {
        localStorage.removeItem('currentUser');
        return { success: true };
    }

    /**
     * Get currently logged in user
     * @returns {string|null} username
     */
    getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return null;

            const user = JSON.parse(userJson);
            return {
                username: user.username,
                email: user.email,
                created: user.created,
                lastLogin: user.lastLogin,
                profile: user.profile
            };

            // FUTURE BACKEND VERSION:
            // const response = await fetch(`${this.apiUrl}/users/${username}`);
            // return await response.json();

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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            
            // Merge updates
            if (updates.email) user.email = updates.email;
            if (updates.profile) {
                user.profile = { ...user.profile, ...updates.profile };
            }

            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
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

            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.favoriteSpecies = user.profile.favoriteSpecies || [];
            
            if (!user.profile.favoriteSpecies.includes(speciesKey)) {
                user.profile.favoriteSpecies.push(speciesKey);
                localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.favoriteSpecies = user.profile.favoriteSpecies || [];
            
            user.profile.favoriteSpecies = user.profile.favoriteSpecies.filter(
                key => key !== speciesKey
            );
            
            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
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

            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            user.profile.tanks = user.profile.tanks || [];
            
            user.profile.tanks = user.profile.tanks.filter(t => t.id !== tankId);
            
            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
            const userJson = localStorage.getItem(`user_${username}`);
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
            const userJson = localStorage.getItem(`user_${username}`);
            if (!userJson) return { success: false };

            const user = JSON.parse(userJson);
            
            // Merge imported data with existing
            if (importData.profile) {
                user.profile = {
                    ...user.profile,
                    ...importData.profile
                };
            }

            localStorage.setItem(`user_${username}`, JSON.stringify(user));
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
