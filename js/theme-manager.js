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
   * NOTE: Hidden for Phase 1 (Naturalist design). Re-enable in Phase 2.
   */
  createToggleButton() {
    // Temporarily disabled - dark mode deferred to Phase 2
    // const button = document.createElement('button');
    // button.className = 'theme-toggle';
    // button.setAttribute('aria-label', 'Toggle dark mode');
    // button.innerHTML = this.getIcon();
    // button.onclick = () => this.toggleTheme();
    // document.body.appendChild(button);
    // this.toggleButton = button;
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
      return '<span class="icon">Light</span>'; // Switch to light mode
    } else {
      return '<span class="icon">Dark</span>'; // Switch to dark mode
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
