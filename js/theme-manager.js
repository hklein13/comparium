// ============================================================================
// DARK MODE TOGGLE
// ============================================================================

class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        // Apply saved theme
        this.applyTheme(this.theme);
        
        // Create toggle button
        this.createToggleButton();
    }

    /**
     * Get saved theme from localStorage
     */
    getTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        this.saveTheme(theme);
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateToggleButton();
    }

    /**
     * Create floating toggle button
     */
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.innerHTML = this.getIcon();
        button.onclick = () => this.toggleTheme();
        
        document.body.appendChild(button);
        this.toggleButton = button;
    }

    /**
     * Update toggle button icon
     */
    updateToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.innerHTML = this.getIcon();
        }
    }

    /**
     * Get icon for current theme
     */
    getIcon() {
        if (this.theme === 'dark') {
            return '<span class="icon">☀️</span>'; // Sun for switching to light
        } else {
            return '<span class="icon">🌙</span>'; // Moon for switching to dark
        }
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}
