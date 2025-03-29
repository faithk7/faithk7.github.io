document.addEventListener("DOMContentLoaded", function () {
    const collectionNav = document.getElementById('collection-nav');
    const collectionTiles = document.getElementById('collection-tiles');
    const dataFiles = window.dataFiles;

    // TODO: remove music from dataFiles for now, fix it later
    delete dataFiles.music;
    delete dataFiles.essay;

    for (const fileName in dataFiles) {
        if (dataFiles.hasOwnProperty(fileName)) {
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
    if (dataFiles.hasOwnProperty('mv')) {
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
            itemElement.setAttribute('data-theme', ''); // this value will be dynamically adjusted by js, probably need a refactor
            // color to be inherited from parent
            itemElement.style.color = 'inherit';
            itemElement.target = '_blank';
            itemElement.textContent = item.title;
            itemElement.style.opacity = '0'; // Start with opacity 0
            itemElement.style.transition = 'opacity 0.5s'; // Add transition effect
            collectionTiles.appendChild(itemElement);
            // Use setTimeout to ensure the transition works in Firefox
            setTimeout(() => {
                itemElement.style.opacity = '1'; // Fade in
            }, 25);
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

    // TODO: might have a better way to do this e.g., include the iframe as a template
    function showVideoPopup(videoUrl) {
        // Create the iframe element
        const iframe = document.createElement('iframe');
        iframe.allowFullscreen = true;
        iframe.src = videoUrl;
        iframe.style.width = '80%';
        iframe.style.height = '80%';
        iframe.style.position = 'fixed';
        iframe.style.top = '50%';
        iframe.style.left = '50%';
        iframe.style.transform = 'translate(-50%, -50%)';
        iframe.style.zIndex = '1000';
        iframe.style.backgroundColor = '#fff';
        iframe.style.border = '1px solid #ccc';
        iframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        iframe.style.overflow = 'hidden';

        // Create the overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.addEventListener('click', function () {
            document.body.removeChild(iframe);
            document.body.removeChild(overlay);
        });

        // Append the iframe and overlay to the body
        document.body.appendChild(iframe);
        document.body.appendChild(overlay);
    }
});