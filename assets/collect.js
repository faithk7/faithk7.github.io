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
        });
    }
});