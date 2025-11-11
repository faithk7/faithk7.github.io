// Constants for magic numbers and configuration
const CONFIG = {
    FETCH_TIMEOUT_MS: 2500,
    ANIMATION_DELAY_MS: 25,
    FADE_IN_DURATION: '0.5s'
};

const VPN_CONFIG = {
    DISMISS_KEY: 'collect_vpn_notice_dismissed',
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
    
    // Null checks for required elements
    if (!collectionNav || !collectionTiles) {
        console.error('[collect] Required container elements not found');
        return;
    }
    
    // Use data attribute instead of global variable
    const dataFilesElement = document.getElementById('collection-data');
    let dataFiles = {};
    
    try {
        dataFiles = dataFilesElement ? JSON.parse(dataFilesElement.textContent) : window.dataFiles || {};
    } catch (e) {
        console.error('[collect] Failed to parse collection data:', e);
        showUserError('Failed to load collection data. Please refresh the page.');
        return;
    }
    
    if (!dataFiles || Object.keys(dataFiles).length === 0) {
        console.warn('[collect] No collection data available');
        showUserError('No collections available.');
        return;
    }

    // TODO: remove music from dataFiles for now, fix it later
    delete dataFiles.music;
    delete dataFiles.essay;

    for (const fileName in dataFiles) {
        // Use Object.hasOwn() for safer property checking
        if (Object.hasOwn(dataFiles, fileName)) {
            const navItem = document.createElement('div');
            navItem.className = 'o-collection-nav-icon';
            navItem.innerHTML = `${fileName}`;
            navItem.dataset.fileName = fileName;
            
            // Make keyboard accessible
            navItem.setAttribute('role', 'button');
            navItem.setAttribute('tabindex', '0');
            navItem.setAttribute('aria-label', `View ${fileName} collection`);

            // Function to handle selection
            const selectNavItem = () => {
                if (!navItem.classList.contains('selected')) {
                    // Remove 'selected' class from all nav items
                    document.querySelectorAll('.o-collection-nav-icon').forEach(item => {
                        item.classList.remove('selected');
                        item.setAttribute('aria-selected', 'false');
                    });
                    // Add 'selected' class to clicked nav item
                    navItem.classList.add('selected');
                    navItem.setAttribute('aria-selected', 'true');
                    renderCollectionItems(dataFiles[fileName], fileName);
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
            
            collectionNav.appendChild(navItem);
        }
    }

    // Display "mv" collect by default
    if (Object.hasOwn(dataFiles, 'mv')) {
        renderCollectionItems(dataFiles['mv'], 'mv');
        document.querySelector(`[data-file-name="mv"]`).classList.add('selected');
    } else {
        // If "mv" doesn't exist, display the first available collect
        const firstCollect = Object.keys(dataFiles)[0];
        if (firstCollect) {
            renderCollectionItems(dataFiles[firstCollect], firstCollect);
            document.querySelector(`[data-file-name="${firstCollect}"]`).classList.add('selected');
        }
    }

    function renderCollectionItems(items, fileName) {
        collectionTiles.innerHTML = ''; // Clear previous items
        items.forEach(item => {
            const itemElement = document.createElement('a');
            itemElement.className = 'o-collection-item';
            itemElement.href = item.url;
            itemElement.dataset.type = item.type; // Add type data attribute
            itemElement.dataset.url = item.url; // Add URL data attribute
            
            // Keyboard accessibility
            itemElement.setAttribute('role', 'button');
            itemElement.setAttribute('tabindex', '0');
            itemElement.setAttribute('aria-label', `Play ${item.title}`);
            
            const theme = localStorage.getItem('mode');
            if (theme) {
                itemElement.setAttribute('data-theme', theme); // this value will be dynamically adjusted by js, probably need a refactor
            }
            // color to be inherited from parent
            itemElement.style.color = 'inherit';
            itemElement.target = '_blank';
            itemElement.textContent = item.title;
            itemElement.style.opacity = '0'; // Start with opacity 0
            itemElement.style.transition = `opacity ${CONFIG.FADE_IN_DURATION}`; // Add transition effect
            collectionTiles.appendChild(itemElement);
            // Use setTimeout to ensure the transition works in Firefox
            setTimeout(() => {
                itemElement.style.opacity = '1'; // Fade in
            }, CONFIG.ANIMATION_DELAY_MS);
            
            // Function to handle item activation
            const activateItem = (e) => {
                e.preventDefault();
                if (fileName === 'music') {
                    renderAudioPlayer(item.url);
                } else {
                    showVideoPopup(item.url);
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

            // const currentMode = document.body.classList.contains('light') ? 'light' : 'dark';
            // applyMode(currentMode); // manually apply mode to each item, probably need a refactor
        });
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

        console.log(audioPlayerContainer);

        const audioPlayer = document.getElementById('audioPlayer');
        console.log(audioPlayer);
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

    // Refactored: use CSS classes instead of inline styles
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
        if (localStorage.getItem(VPN_CONFIG.DISMISS_KEY) === '1') return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);
        fetch(VPN_CONFIG.API_URL, { signal: controller.signal })
            .then(res => res.ok ? res.json() : Promise.reject(new Error('ipapi.co non-OK')))
            .then(data => {
                clearTimeout(timeoutId);
                try { if (VPN_DEBUG) console.log('[collect] VPN check response', data); } catch (_) { }
                const countryCode = String((data && (data.country || data.country_code || data.countryCode)) || '').toUpperCase();
                const countryName = String((data && (data.country_name || data.countryName)) || '').toLowerCase();
                if (countryCode === VPN_CONFIG.TARGET_COUNTRY_CODE || countryName === VPN_CONFIG.TARGET_COUNTRY_NAME) {
                    renderVpnWarning();
                    try { if (VPN_DEBUG) console.log('[collect] VPN banner rendered (CN detected)'); } catch (_) { }
                } else {
                    try { if (VPN_DEBUG) console.log('[collect] Non-CN detected:', countryCode || countryName); } catch (_) { }
                }
            })
            .catch((err) => {
                try { console.warn('[collect] VPN check failed', (err && (err.name || err.message)) || err); } catch (_) { }
                // Silently ignore on failure
            });

        function renderVpnWarning() {
            // Banner
            const banner = document.createElement('div');
            banner.setAttribute('role', 'status');
            banner.style.position = 'fixed';
            banner.style.top = '0';
            banner.style.left = '0';
            banner.style.right = '0';
            banner.style.zIndex = '2000';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.gap = '8px';
            banner.style.padding = '8px 12px';
            banner.style.background = '#FEF3C7'; // amber-100
            banner.style.borderBottom = '1px solid #F59E0B'; // amber-500
            banner.style.color = '#92400E'; // amber-700
            banner.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

            const icon = document.createElement('span');
            icon.textContent = '⚠️';
            icon.setAttribute('aria-hidden', 'true');

            const text = document.createElement('div');
            text.style.flex = '1';
            text.textContent = 'Media may require VPN/Proxy to load properly.';

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.textContent = '×';
            closeBtn.style.border = 'none';
            closeBtn.style.background = 'transparent';
            closeBtn.style.fontSize = '18px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = 'inherit';
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
            document.body.style.paddingTop = (currentPaddingTop + banner.offsetHeight) + 'px';

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