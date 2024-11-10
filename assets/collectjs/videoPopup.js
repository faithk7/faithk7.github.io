// ! NOT WORKING YET
export function showVideoPopup(videoUrl) {
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