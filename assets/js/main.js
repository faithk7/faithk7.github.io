/**
 * Main JavaScript file for theme toggling, navigation, and site interactions.
 */

// Function to apply the light/dark mode
function applyMode(mode) {
    // Only set data-theme on :root, CSS cascade handles the rest
    document.documentElement.setAttribute('data-theme', mode);
}

document.addEventListener('DOMContentLoaded', function () {
    // --- External link safety ---
    // Ensure rel is set for any target=_blank links to prevent reverse tabnabbing
    document.querySelectorAll('a[target="_blank"]').forEach((a) => {
        const rel = (a.getAttribute('rel') || '').toLowerCase();
        if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
            a.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // --- Theme Toggle Logic ---
    // Note: The initial mode application is handled by a blocking inline script in <head> to prevent FOUC.
    // This block handles the interactions.
    
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            let currentMode = document.documentElement.getAttribute('data-theme');
            
            // If no attribute is set, fallback to system preference
            if (!currentMode) {
                currentMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const newMode = currentMode === 'light' ? 'dark' : 'light';
            applyMode(newMode);
            localStorage.setItem('mode', newMode);
        });
    }

    // --- Navigation Toggle Logic ---
    const navToggle = document.getElementById('nav-toggle');
    const navbar = document.querySelector('.c-navbar');
    
    if (navToggle && navbar) {
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.c-navbar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'c-navbar-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function () {
                navbar.classList.remove('show');
            });
        }

        navToggle.addEventListener('click', function () {
            const isOpen = navbar.classList.toggle('show');
            if (navToggle.setAttribute) {
                navToggle.setAttribute('aria-expanded', String(isOpen));
            }
        });

        navbar.addEventListener('click', function () {
            navbar.classList.remove('show');
            if (navToggle.setAttribute) {
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- Favicon Logic ---
    // Updates favicon based on system color scheme (not user theme toggle, to match original behavior)
    const favicon = document.getElementById('favicon');
    if (favicon) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        function updateFavicon() {
            if (prefersDark.matches) {
                favicon.href = '/assets/site-logo.png'; // Light favicon for dark theme
            } else {
                favicon.href = '/assets/site-logo-dark-font.png'; // Dark favicon for light theme
            }
        }

        // Initial check
        updateFavicon();

        // Listen for changes in theme preference
        prefersDark.addEventListener('change', updateFavicon);
    }
});

