document.addEventListener("DOMContentLoaded", function () {
    const collectionNav = document.getElementById('collection-nav');
    const collectionTiles = document.getElementById('collection-tiles');
    const dataFiles = window.dataFiles;

    for (const fileName in dataFiles) {
        if (dataFiles.hasOwnProperty(fileName)) {
            const navItem = document.createElement('div');
            navItem.className = 'o-collection-nav-icon';
            navItem.innerHTML = `🎵 ${fileName}`;
            navItem.dataset.fileName = fileName;
            navItem.addEventListener('click', function () {
                renderCollectionItems(dataFiles[fileName]);
            });
            collectionNav.appendChild(navItem);
        }
    }

    function renderCollectionItems(items) {
        collectionTiles.innerHTML = ''; // Clear previous items
        items.forEach(item => {
            const itemElement = document.createElement('a');
            itemElement.className = 'o-collection-item';
            itemElement.href = item.url;
            itemElement.target = '_blank';
            itemElement.textContent = item.title;
            collectionTiles.appendChild(itemElement);
            itemElement.addEventListener('click', function (e) {
                e.preventDefault();
                showVideoPopup(item.url);
            });
        });
    }

    function showVideoPopup(videoUrl) {
        // Create the iframe element
        const iframe = document.createElement('iframe');
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