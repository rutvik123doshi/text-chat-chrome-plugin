chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-chatgpt",
    title: 'Ask Gemini about "%s"',
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "summarize-page",
    title: "Summarize Page",
    contexts: ["page"]
  });
});

function getPageContent() {
  return document.body.innerText;
}

function getSelection() {
    return window.getSelection().toString();
}

function openOverlay(tabId, data) {
  chrome.tabs.sendMessage(tabId, { action: "openOverlay", data: data }, (response) => {
    if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
      chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ['overlay.css'] }, () => {
        chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Failed to inject script: ${chrome.runtime.lastError.message}`);
            return;
          }
          chrome.tabs.sendMessage(tabId, { action: "openOverlay", data: data });
        });
      });
    }
  });
}


// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPageContent
    }, (results) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        const pageContent = results[0].result;
        if (info.menuItemId === "ask-chatgpt") {
            openOverlay(tab.id, { selectedText: info.selectionText, pageContent });
        } else if (info.menuItemId === "summarize-page") {
            openOverlay(tab.id, { pageContent, summarize: true });
        }
    });
});

// Listener for the extension icon click
chrome.action.onClicked.addListener((tab) => {
    Promise.all([
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getPageContent,
        }),
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSelection,
        })
    ]).then((results) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        const pageContent = results[0][0].result;
        const selectedText = results[1][0].result;
        openOverlay(tab.id, { pageContent, selectedText });
    }).catch(error => console.error(error));
});

// Listener for messages from content scripts (e.g., to clear conversation)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "clearConversation") {
        chrome.storage.local.remove('conversation', () => {
            // Optionally, send a response back to content script if needed
            sendResponse({ status: "Conversation cleared" });
        });
        return true; // Indicate that we want to send a response asynchronously
    }
});