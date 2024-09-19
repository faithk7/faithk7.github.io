document.addEventListener("DOMContentLoaded", function () {
    const collectionNav = document.getElementById('collection-nav');
    const collectionTiles = document.getElementById('collection-tiles');
    const dataFiles = window.dataFiles;

    // TODO: fix later; fitler out music from the collection nav for now
    delete dataFiles.music;

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
                    renderCollectionItems(dataFiles[fileName]);
                }
            });
            collectionNav.appendChild(navItem);
        }
    }

    // Display "mv" collect by default
    if (dataFiles.hasOwnProperty('mv')) {
        renderCollectionItems(dataFiles['mv']);
        document.querySelector(`[data-file-name="mv"]`).classList.add('selected');
    } else {
        // If "mv" doesn't exist, display the first available collect
        const firstCollect = Object.keys(dataFiles)[0];
        if (firstCollect) {
            renderCollectionItems(dataFiles[firstCollect]);
            document.querySelector(`[data-file-name="${firstCollect}"]`).classList.add('selected');
        }
    }

    function renderCollectionItems(items) {
        collectionTiles.innerHTML = ''; // Clear previous items
        items.forEach(item => {
            const itemElement = document.createElement('a');
            itemElement.className = 'o-collection-item';
            itemElement.href = item.url;
            itemElement.setAttribute('data-theme', ''); // this value will be dynamically adjusted by js, probably need a refactor
            // color to be inherited from parent
            itemElement.style.color = 'inherit';
            itemElement.target = '_blank';
            itemElement.textContent = item.title;
            itemElement.style.opacity = '0'; // Start with opacity 0
            itemElement.style.transition = 'opacity 0.5s'; // Add transition effect
            collectionTiles.appendChild(itemElement);
            // Trigger reflow to apply transition
            requestAnimationFrame(() => {
                itemElement.style.opacity = '1'; // Fade in
            });
            itemElement.addEventListener('click', function (e) {
                e.preventDefault();
                showVideoPopup(item.url);
            });

            const currentMode = document.body.classList.contains('light') ? 'light' : 'dark';
            applyMode(currentMode); // manually apply mode to each item, probably need a refactor
        });
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