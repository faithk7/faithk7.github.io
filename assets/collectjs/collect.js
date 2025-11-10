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

document.addEventListener("DOMContentLoaded", function () {
    const collectionNav = document.querySelector('.c-collection-nav-container');
    const collectionTiles = document.querySelector('.c-collection-tile-container');
    
    // Use data attribute instead of global variable
    const dataFilesElement = document.getElementById('collection-data');
    const dataFiles = dataFilesElement ? JSON.parse(dataFilesElement.textContent) : window.dataFiles || {};

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

            // add click event listener to nav item
            navItem.addEventListener('click', function () {
                if (!this.classList.contains('selected')) {
                    // Remove 'selected' class from all nav items
                    document.querySelectorAll('.o-collection-nav-icon').forEach(item => {
                        item.classList.remove('selected');
                    });
                    // Add 'selected' class to clicked nav item
                    this.classList.add('selected');
                    renderCollectionItems(dataFiles[fileName], fileName);
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
            const theme = localStorage.getItem('mode');
            if (theme) {
                console.log("theme", theme);
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
            itemElement.addEventListener('click', function (e) {
                e.preventDefault();
                if (fileName === 'music') {
                    renderAudioPlayer(item.url);
                } else {
                    showVideoPopup(item.url);
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
            .then(response => response.blob())
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
                        console.log('Error reading metadata:', error);
                    }
                });
            });

        function extractDominantColor(img) {
            imageCanvas.width = img.width;
            imageCanvas.height = img.height;

            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            const totalPixels = img.width * img.height;

            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            r = Math.floor(r / totalPixels);
            g = Math.floor(g / totalPixels);
            b = Math.floor(b / totalPixels);

            const dominantColor = `rgb(${r}, ${g}, ${b})`;

            dominantColorBox.style.backgroundColor = dominantColor;

            const lighterColor = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
            const darkerColor = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
            playerContainer.style.background = `linear-gradient(to right, ${lighterColor}, ${darkerColor})`;
        }
    }

    // Refactored: use CSS classes instead of inline styles
    function showVideoPopup(videoUrl) {
        // Create the iframe element
        const iframe = document.createElement('iframe');
        iframe.allowFullscreen = true;
        iframe.src = videoUrl;
        iframe.loading = "eager";
        iframe.className = 'c-video-popup-iframe';

        // Create the overlay
        const overlay = document.createElement('div');
        overlay.className = 'c-video-popup-overlay';
        overlay.addEventListener('click', function () {
            document.body.removeChild(iframe);
            document.body.removeChild(overlay);
        });

        // Append the iframe and overlay to the body
        document.body.appendChild(iframe);
        document.body.appendChild(overlay);
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