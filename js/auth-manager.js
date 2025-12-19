// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================
// Handles all login/signup UI interactions and user session management
// ============================================================================

class AuthManager {
    constructor() {
        this.storage = storageService;
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize authentication state
     */
    async init() {
        // If Firebase auth is available, listen for auth state changes and keep currentUser in sync
        if (window.firebaseAuthState && window.firebaseAuth) {
            window.firebaseAuthState(window.firebaseAuth, async (user) => {
                if (user) {
                    // Load username from Firestore profile
                    const uid = user.uid;
                    if (window.firestoreGetProfile) {
                        try {
                            const profile = await window.firestoreGetProfile(uid);
                            this.currentUser = profile?.username || user.email;
                        } catch (e) {
                            console.error('Error loading username:', e);
                            this.currentUser = user.email;
                        }
                    } else {
                        // Firestore not available, use email
                        this.currentUser = user.email;
                    }
                    this.updateUIForLoggedInUser();
                } else {
                    // Signed out
                    this.currentUser = null;
                    this.updateUIForLoggedOutUser();
                }
            });
            return;
        }

        // Fallback: check if user is already logged in via local storage
        const username = await this.storage.getCurrentUser();
        if (username) {
            this.currentUser = username;
            this.updateUIForLoggedInUser();
        }
    }

    /**
     * Handle user registration
     * @param {string} username 
     * @param {string} password 
     * @param {string} email 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async register(username, password, email) {
        // Validation
        if (!username || username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }

        if (!password || password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        if (!email || !this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        // Attempt registration
        const result = await this.storage.registerUser(username, password, email);
        
        if (result.success) {
            // Auto-login after successful registration
            await this.login(username, password);
        }

        return result;
    }

    /**
     * Handle user login
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async login(username, password) {
        // Validation
        if (!username || !password) {
            return { success: false, message: 'Please enter username and password' };
        }

        // Attempt login
        const result = await this.storage.loginUser(username, password);
        
        if (result.success) {
            this.currentUser = username;
            this.updateUIForLoggedInUser();
        }

        return result;
    }

    /**
     * Handle user logout
     */
    async logout() {
        await this.storage.logoutUser();
        this.currentUser = null;
        this.updateUIForLoggedOutUser();
        
        // Redirect to home page
        if (window.location.pathname !== '/index.html' && 
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Check if user is currently logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Get current username
     * @returns {string|null}
     */
    getCurrentUsername() {
        return this.currentUser;
    }

    /**
     * Update UI elements for logged-in state
     */
    updateUIForLoggedInUser() {
        // Update navigation
        const authLinks = document.getElementById('auth-links');
        if (authLinks) {
            authLinks.innerHTML = `
                <span style="opacity: 0.8;">Welcome, ${this.currentUser}!</span>
                <a href="#" onclick="authManager.logout(); return false;">Logout</a>
            `;
        }

        // Show user-specific features
        const userFeatures = document.querySelectorAll('.user-feature');
        userFeatures.forEach(feature => {
            feature.style.display = 'block';
        });

        // Hide login prompts
        const loginPrompts = document.querySelectorAll('.login-prompt');
        loginPrompts.forEach(prompt => {
            prompt.style.display = 'none';
        });
    }

    /**
     * Update UI elements for logged-out state
     */
    updateUIForLoggedOutUser() {
        // Update navigation
        const authLinks = document.getElementById('auth-links');
        if (authLinks) {
            authLinks.innerHTML = `
                <a href="login.html">Login</a>
                <a href="signup.html">Sign Up</a>
            `;
        }

        // Hide user-specific features
        const userFeatures = document.querySelectorAll('.user-feature');
        userFeatures.forEach(feature => {
            feature.style.display = 'none';
        });

        // Show login prompts
        const loginPrompts = document.querySelectorAll('.login-prompt');
        loginPrompts.forEach(prompt => {
            prompt.style.display = 'block';
        });
    }

    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Require authentication (redirect to login if not logged in)
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            // Store intended destination
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Redirect after login (to originally intended page)
     */
    redirectAfterLogin() {
        const redirect = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        
        if (redirect && redirect !== '/login.html') {
            window.location.href = redirect;
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    /**
     * Show message to user
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info'
     */
    showMessage(message, type = 'info') {
        // Look for message container
        let messageContainer = document.getElementById('message-container');
        
        if (!messageContainer) {
            // Create if doesn't exist
            messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message-alert message-${type}`;
        messageEl.textContent = message;
        
        // Style based on type
        let bgColor = '#e7f3ff';
        let borderColor = '#667eea';
        if (type === 'success') {
            bgColor = '#d4edda';
            borderColor = '#28a745';
        } else if (type === 'error') {
            bgColor = '#f8d7da';
            borderColor = '#dc3545';
        }
        
        messageEl.style.cssText = `
            background: ${bgColor};
            border-left: 4px solid ${borderColor};
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;

        messageContainer.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 5000);
    }
}

// Create global instance
const authManager = new AuthManager();

// Add CSS animation for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
