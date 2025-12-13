// Constants for magic numbers and configuration
const CONFIG = {
    FETCH_TIMEOUT_MS: 2500,
    ANIMATION_DELAY_MS: 25,
    FADE_IN_DURATION: '0.5s'
};

const VPN_CONFIG = {
    DISMISS_KEY: 'collect_vpn_notice_dismissed',
    SESSION_CACHE_KEY: 'collect_vpn_check_result',
    API_URL: 'https://ipapi.co/json/',
    TARGET_COUNTRY_CODE: 'CN',
    TARGET_COUNTRY_NAME: 'china'
};

/**
 * Display user-visible error message
 * @param {string} message - Error message to display
 */
function showUserError(message) {
    const container = document.querySelector('.c-collection-tile-container');
    if (!container) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.color = '#ff6b6b';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

document.addEventListener("DOMContentLoaded", function () {
    const collectionNav = document.querySelector('.c-collection-nav-container');
    const collectionTiles = document.querySelector('.c-collection-tile-container');
    const navItems = collectionNav ? collectionNav.querySelectorAll('.o-collection-nav-icon') : null;
    const sections = document.querySelectorAll('.c-collection-section');
    const items = document.querySelectorAll('.o-collection-item');

    // Null checks for required elements
    if (!collectionNav || !collectionTiles) {
        console.error('[collect] Required container elements not found');
        return;
    }

    const theme = localStorage.getItem('mode');

    // Initialize pre-rendered items: theme, fade-in animation, and click/keyboard behavior
    items.forEach(itemElement => {
        if (theme) {
            itemElement.setAttribute('data-theme', theme); // reuse existing theme logic
        }
        itemElement.style.color = 'inherit';
        itemElement.style.opacity = '0';
        itemElement.style.transition = `opacity ${CONFIG.FADE_IN_DURATION}`;
        setTimeout(() => {
            itemElement.style.opacity = '1';
        }, CONFIG.ANIMATION_DELAY_MS);

        const activateItem = (e) => {
            e.preventDefault();
            const type = itemElement.dataset.type || 'video';
            const url = itemElement.getAttribute('href');
            if (type === 'audio') {
                renderAudioPlayer(url);
            } else {
                showVideoPopup(url);
            }
        };

        // Mouse click event
        itemElement.addEventListener('click', activateItem);

        // Keyboard event (Enter or Space)
        itemElement.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                activateItem(e);
            }
        });
    });

    const setActiveSection = (sectionName) => {
        if (!sections || sections.length === 0) return;
        sections.forEach(section => {
            if (section.dataset.section === sectionName) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    };

    if (navItems) {
        navItems.forEach(navItem => {
            const sectionName = navItem.dataset.section || navItem.dataset.fileName;

            const selectNavItem = () => {
                document.querySelectorAll('.o-collection-nav-icon').forEach(item => {
                    item.classList.remove('selected');
                    item.setAttribute('aria-pressed', 'false');
                });
                navItem.classList.add('selected');
                navItem.setAttribute('aria-pressed', 'true');
                if (sectionName) {
                    setActiveSection(sectionName);
                }
            };

            // Mouse click event
            navItem.addEventListener('click', selectNavItem);

            // Keyboard event (Enter or Space)
            navItem.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectNavItem();
                }
            });
        });

        // Set initial active section based on pre-selected nav or first nav item
        let defaultNav = document.querySelector('.o-collection-nav-icon.selected');
        if (!defaultNav && navItems.length > 0) {
            defaultNav = navItems[0];
        }
        if (defaultNav) {
            const defaultSection = defaultNav.dataset.section || defaultNav.dataset.fileName;
            defaultNav.setAttribute('aria-pressed', 'true');
            if (defaultSection) {
                setActiveSection(defaultSection);
            }
        }
    }

    function renderAudioPlayer(musicUrl) {
        const audioPlayerContainer = document.createElement('div');
        audioPlayerContainer.id = 'audioPlayerContainer';
        audioPlayerContainer.innerHTML = `
            <div class="meta-info">
                <h3>Dominant Color</h3>
                <div class="dominant-color-box" id="dominantColorBox"></div>
            </div>
            <div class="player-container" id="playerContainer">
                <img id="coverImage" class="cover-img" src="" alt="Cover Image" style="display: none;">
                <div class="audio-controls">
                    <audio id="audioPlayer" controls style="width: 100%;"></audio>
                </div>
            </div>
        `;

        // Create the canvas for image processing
        const imageCanvas = document.createElement('canvas');
        imageCanvas.id = 'imageCanvas';
        imageCanvas.style.display = 'none';
        document.body.appendChild(imageCanvas);
        document.body.appendChild(audioPlayerContainer);

        const audioPlayer = document.getElementById('audioPlayer');
        const coverImage = document.getElementById('coverImage');
        const playerContainer = document.getElementById('playerContainer');
        const dominantColorBox = document.getElementById('dominantColorBox');
        const ctx = imageCanvas.getContext('2d');

        audioPlayer.src = musicUrl;
        playerContainer.style.display = 'flex';

        fetch(musicUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                jsmediatags.read(blob, {
                    onSuccess: function (tag) {
                        const tags = tag.tags;

                        if (tags.picture) {
                            const picture = tags.picture;
                            const base64String = picture.data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                            const base64Data = btoa(base64String);
                            const imageUrl = `data:${picture.format};base64,${base64Data}`;

                            coverImage.src = imageUrl;
                            coverImage.style.display = 'block';

                            coverImage.onload = function () {
                                extractDominantColor(coverImage);
                            };
                        } else {
                            coverImage.style.display = 'none';
                        }
                    },
                    onError: function (error) {
                        console.warn('[collect] Error reading audio metadata:', error);
                        // Continue without cover image
                        coverImage.style.display = 'none';
                    }
                });
            })
            .catch(error => {
                console.error('[collect] Failed to fetch audio file:', error);
                // Audio player can still work without metadata
            });

        /**
         * Extract dominant color using sampling for better performance
         * Instead of checking every pixel, sample a subset for much faster processing
         */
        function extractDominantColor(img) {
            // Use smaller canvas for sampling to improve performance
            const maxDimension = 100;
            const scaleFactor = Math.min(maxDimension / img.width, maxDimension / img.height);
            const scaledWidth = Math.floor(img.width * scaleFactor);
            const scaledHeight = Math.floor(img.height * scaleFactor);
            
            imageCanvas.width = scaledWidth;
            imageCanvas.height = scaledHeight;

            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            // Sample every 5th pixel for even faster processing
            const sampleRate = 5;
            let sampledPixels = 0;

            for (let i = 0; i < data.length; i += 4 * sampleRate) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                sampledPixels++;
            }

            r = Math.floor(r / sampledPixels);
            g = Math.floor(g / sampledPixels);
            b = Math.floor(b / sampledPixels);

            const dominantColor = `rgb(${r}, ${g}, ${b})`;

            dominantColorBox.style.backgroundColor = dominantColor;

            const lighterColor = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
            const darkerColor = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
            playerContainer.style.background = `linear-gradient(to right, ${lighterColor}, ${darkerColor})`;
        }
    }

    function showVideoPopup(videoUrl) {
        // Store currently focused element to restore later
        const previousFocus = document.activeElement;
        
        // Create the iframe element
        const iframe = document.createElement('iframe');
        iframe.allowFullscreen = true;
        iframe.src = videoUrl;
        iframe.loading = "eager";
        iframe.className = 'c-video-popup-iframe';
        iframe.setAttribute('title', 'Video player');

        // Create the overlay
        const overlay = document.createElement('div');
        overlay.className = 'c-video-popup-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Video popup');
        overlay.setAttribute('aria-modal', 'true');
        
        // Function to close popup
        const closePopup = () => {
            if (iframe.parentNode) document.body.removeChild(iframe);
            if (overlay.parentNode) document.body.removeChild(overlay);
            // Restore focus
            if (previousFocus) previousFocus.focus();
            // Remove all event listeners
            document.removeEventListener('keydown', handleKeydown, true);
            window.removeEventListener('keydown', handleKeydown, true);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
        
        // Click overlay to close
        overlay.addEventListener('click', closePopup);
        
        // Track if we're in fullscreen
        let wasInFullscreen = false;
        
        // ESC key to close - use capture phase to intercept before iframe
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                closePopup();
            }
        };
        
        // Handle fullscreen changes - close popup when exiting fullscreen via ESC
        const handleFullscreenChange = () => {
            const isFullscreen = !!document.fullscreenElement;
            // If we were in fullscreen and now we're not, user likely pressed ESC
            if (wasInFullscreen && !isFullscreen) {
                // Small delay to let fullscreen exit complete
                setTimeout(closePopup, 100);
            }
            wasInFullscreen = isFullscreen;
        };
        
        // Listen on both document and window in capture phase
        document.addEventListener('keydown', handleKeydown, true);
        window.addEventListener('keydown', handleKeydown, true);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Append the iframe and overlay to the body
        document.body.appendChild(overlay);
        document.body.appendChild(iframe);
        
        // Focus iframe to allow video player keyboard controls
        iframe.focus();
    }

    // Detect if visitor is in China and suggest VPN via banner and icon
    (function checkAndSuggestVpnForChina() {
        // 1. Check dismissal
        if (localStorage.getItem(VPN_CONFIG.DISMISS_KEY) === '1') return;

        // 2. Check session cache
        const cachedResult = sessionStorage.getItem(VPN_CONFIG.SESSION_CACHE_KEY);
        if (cachedResult === 'CN') {
            renderVpnWarning();
            return;
        } else if (cachedResult === 'OTHER') {
            return; // Not in CN, previously checked
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);
        
        fetch(VPN_CONFIG.API_URL, { signal: controller.signal })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('ipapi.co non-OK')))
            .then(data => {
                clearTimeout(timeoutId);
                const countryCode = String((data && (data.country || data.country_code || data.countryCode)) || '').toUpperCase();
                const countryName = String((data && (data.country_name || data.countryName)) || '').toLowerCase();
                
                if (countryCode === VPN_CONFIG.TARGET_COUNTRY_CODE || countryName === VPN_CONFIG.TARGET_COUNTRY_NAME) {
                    sessionStorage.setItem(VPN_CONFIG.SESSION_CACHE_KEY, 'CN');
                    renderVpnWarning();
                } else {
                    sessionStorage.setItem(VPN_CONFIG.SESSION_CACHE_KEY, 'OTHER');
                }
            })
            .catch((err) => {
                // Silently ignore on failure
                try { console.warn('[collect] VPN check failed', (err && (err.name || err.message)) || err); } catch (_) { }
            });

        function renderVpnWarning() {
            // Banner
            const banner = document.createElement('div');
            banner.className = 'c-vpn-banner';
            banner.setAttribute('role', 'status');

            const icon = document.createElement('span');
            icon.textContent = '⚠️';
            icon.setAttribute('aria-hidden', 'true');

            const text = document.createElement('div');
            text.className = 'c-vpn-banner-text';
            text.textContent = 'Media may require VPN/Proxy to load properly.';

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'c-vpn-banner-close';
            closeBtn.textContent = '×';
            closeBtn.setAttribute('aria-label', 'Dismiss VPN notice');
            closeBtn.addEventListener('click', () => {
                localStorage.setItem(VPN_CONFIG.DISMISS_KEY, '1');
                if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
                document.body.style.paddingTop = '';
            });

            banner.appendChild(icon);
            banner.appendChild(text);
            banner.appendChild(closeBtn);
            document.body.appendChild(banner);

            // Prevent overlap with fixed banner
            const currentPaddingTop = parseInt(getComputedStyle(document.body).paddingTop || '0', 10) || 0;
            document.body.style.paddingTop = (currentPaddingTop + 40) + 'px'; // Approx height since offsetHeight is 0 before paint

            // Icon next to page title if exists
            try {
                const titleEl = document.querySelector('.o-collection-title');
                if (titleEl && !titleEl.querySelector('.vpn-hint-icon')) {
                    const hint = document.createElement('span');
                    hint.className = 'vpn-hint-icon';
                    hint.title = 'VPN recommended in China for media accessibility';
                    titleEl.appendChild(hint);
                }
            } catch (_) { }
        }
    })();
});
