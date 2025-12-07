/**
 * Main JavaScript file for theme toggling, navigation, and site interactions.
 */

/**
 * Theme Manager - Handles light/dark mode switching
 */
const ThemeManager = {
    STORAGE_KEY: 'mode',
    ATTR_NAME: 'data-theme',
    
    /**
     * Apply theme mode to document
     * @param {string} mode - 'light' or 'dark'
     */
    apply(mode) {
        try {
            document.documentElement.setAttribute(this.ATTR_NAME, mode);
        } catch (error) {
            console.warn('[theme] Failed to apply theme:', error);
        }
    },
    
    /**
     * Get current theme mode
     * @returns {string} - Current theme mode
     */
    getCurrent() {
        const attr = document.documentElement.getAttribute(this.ATTR_NAME);
        if (attr) return attr;
        
        // Fallback to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    /**
     * Toggle between light and dark mode
     */
    toggle() {
        const currentMode = this.getCurrent();
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        
        this.apply(newMode);
        
        try {
            localStorage.setItem(this.STORAGE_KEY, newMode);
        } catch (error) {
            console.warn('[theme] Failed to save theme preference:', error);
        }
    },
    
    /**
     * Initialize theme toggle button
     * @param {string} buttonId - ID of toggle button
     */
    initToggle(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) {
            console.warn('[theme] Toggle button not found:', buttonId);
            return;
        }
        
        button.addEventListener('click', () => this.toggle());
    }
};

/**
 * Navigation Manager - Handles mobile navigation
 */
const NavManager = {
    OVERLAY_CLASS: 'c-navbar-overlay',
    SHOW_CLASS: 'show',
    
    /**
     * Create overlay element for mobile navigation
     * @param {HTMLElement} nav - Navigation element
     * @returns {HTMLElement} - Overlay element
     */
    createOverlay(nav) {
        let overlay = document.querySelector(`.${this.OVERLAY_CLASS}`);
        if (overlay) return overlay;
        
        overlay = document.createElement('div');
        overlay.className = this.OVERLAY_CLASS;
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            nav.classList.remove(this.SHOW_CLASS);
        });
        
        return overlay;
    },
    
    /**
     * Initialize navigation toggle
     * @param {string} toggleId - ID of toggle button
     * @param {string} navSelector - Selector for navigation element
     */
    init(toggleId, navSelector) {
        const toggle = document.getElementById(toggleId);
        const nav = document.querySelector(navSelector);
        
        if (!toggle || !nav) {
            console.warn('[nav] Toggle or nav element not found');
            return;
        }
        
        // Create overlay
        this.createOverlay(nav);
        
        // Toggle button click
        toggle.addEventListener('click', () => {
            nav.classList.toggle(this.SHOW_CLASS);
        });
        
        // Close on nav click
        nav.addEventListener('click', () => {
            nav.classList.remove(this.SHOW_CLASS);
        });
    }
};

/**
 * Favicon Manager - Updates favicon based on system color scheme
 */
const FaviconManager = {
    FAVICON_LIGHT: '/assets/site-logo-dark-font.png',
    FAVICON_DARK: '/assets/site-logo.png',
    
    /**
     * Initialize favicon switching
     * @param {string} faviconId - ID of favicon element
     */
    init(faviconId) {
        const favicon = document.getElementById(faviconId);
        if (!favicon) {
            console.warn('[favicon] Favicon element not found');
            return;
        }
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateFavicon = () => {
            favicon.href = prefersDark.matches ? this.FAVICON_DARK : this.FAVICON_LIGHT;
        };
        
        // Initial update
        updateFavicon();
        
        // Listen for changes
        prefersDark.addEventListener('change', updateFavicon);
    }
};

// Initialize all modules on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Note: Initial theme is applied by inline script in <head> to prevent FOUC
    ThemeManager.initToggle('dark-mode-toggle');
    NavManager.init('nav-toggle', '.c-navbar');
    FaviconManager.init('favicon');
});

