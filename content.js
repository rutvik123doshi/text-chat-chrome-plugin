(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function createOverlay() {
    if (document.getElementById('chatgpt-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'chatgpt-overlay';

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('popup.html');
    overlay.appendChild(iframe);

    document.body.appendChild(overlay);

    const closeButton = document.createElement('button');
    closeButton.id = 'chatgpt-overlay-close-button';
    closeButton.textContent = 'X';
    closeButton.onclick = () => {
      // Send message to background script to clear conversation
      chrome.runtime.sendMessage({ action: "clearConversation" });
      overlay.remove();
    };
    overlay.appendChild(closeButton);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openOverlay") {
      const overlay = document.getElementById('chatgpt-overlay');
      if (overlay) {
        // If overlay exists, send data to the iframe
        const iframe = overlay.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ action: 'updateChat', payload: request.data }, '*');
        }
      } else {
        // Otherwise, create the overlay
        createOverlay();
        // Store data in local storage for the new popup to pick up
        chrome.storage.local.set(request.data);
      }
      sendResponse({ status: "Overlay handled" });
    }
  });
})();