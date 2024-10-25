// ! NOT WORKING YET
export function renderAudioPlayer(musicUrl) {
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