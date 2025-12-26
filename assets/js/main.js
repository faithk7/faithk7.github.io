function applyMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[target="_blank"]').forEach((a) => {
        const rel = (a.getAttribute('rel') || '').toLowerCase();
        if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
            a.setAttribute('rel', 'noopener noreferrer');
        }
    });

    const toggleButton = document.getElementById('dark-mode-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            let currentMode = document.documentElement.getAttribute('data-theme');
            
            if (!currentMode) {
                currentMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const newMode = currentMode === 'light' ? 'dark' : 'light';
            applyMode(newMode);
            localStorage.setItem('mode', newMode);
        });
    }

    const navToggle = document.getElementById('nav-toggle');
    const navbar = document.querySelector('.c-navbar');
    
    if (navToggle && navbar) {
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

    const favicon = document.getElementById('favicon');
    if (favicon) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        function updateFavicon() {
            if (prefersDark.matches) {
                favicon.href = '/assets/site-logo.png'; 
            } else {
                favicon.href = '/assets/site-logo-dark-font.png';
            }
        }

        updateFavicon();

        prefersDark.addEventListener('change', updateFavicon);
    }
});

