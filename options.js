document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('api-key');
  const saveButton = document.getElementById('save');
  const status = document.getElementById('status');
  const currentApiKeySpan = document.getElementById('current-api-key');
  const viewDeleteButton = document.getElementById('view-delete');

  let apiKey = "";

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  }

  function updateApiKeyDisplay() {
    if (apiKey) {
      currentApiKeySpan.textContent = "••••••••" + apiKey.slice(-4);
      viewDeleteButton.textContent = "View";
      viewDeleteButton.dataset.action = "view";
    } else {
      currentApiKeySpan.textContent = "Not set";
      viewDeleteButton.style.display = 'none';
    }
  }

  // Load the saved API key
  chrome.storage.sync.get('apiKey', (data) => {
    if (data.apiKey) {
      apiKey = data.apiKey;
      updateApiKeyDisplay();
    }
  });

  // Save the API key
  saveButton.addEventListener('click', () => {
    const newApiKey = apiKeyInput.value.trim();
    if (newApiKey) {
      apiKey = newApiKey;
      chrome.storage.sync.set({ apiKey }, () => {
        apiKeyInput.value = "";
        updateApiKeyDisplay();
        showStatus('API key saved successfully.');
      });
    } else {
      showStatus('Please enter a valid API key.', true);
    }
  });

  // View/Delete button handler
  viewDeleteButton.addEventListener('click', () => {
    if (viewDeleteButton.dataset.action === "view") {
      currentApiKeySpan.textContent = apiKey;
      viewDeleteButton.textContent = "Delete";
      viewDeleteButton.dataset.action = "delete";
    } else if (viewDeleteButton.dataset.action === "delete") {
      apiKey = "";
      chrome.storage.sync.remove('apiKey', () => {
        updateApiKeyDisplay();
        showStatus('API key deleted successfully.');
      });
    }
  });
});