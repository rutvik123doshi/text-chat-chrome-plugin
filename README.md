# ChatGPT Right-Click Assistant Chrome Extension

This Chrome extension allows you to interact with ChatGPT directly from any webpage. You can select text, right-click to ask questions about it, or get a summary of the entire page.

## Features

*   **Contextual Questions:** Select any text on a webpage, right-click, and choose "Ask ChatGPT about selected text" to get an instant answer or explanation.
*   **Page Summarization:** Right-click anywhere on a page and select "Summarize this page" to get a concise summary of the content.
*   **Follow-up Conversations:** A chat interface appears, allowing you to ask follow-up questions and continue the conversation with ChatGPT.
*   **Customizable API Key:** Easily set your OpenAI API key through the extension's options page.

## Installation

1.  **Download the Extension:**
    *   Clone this repository: `git clone git@github.com:rutvik123doshi/text-chat-chrome-plugin.git`
    *   Or download the ZIP file and extract it.

2.  **Load in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" using the toggle in the top right corner.
    *   Click on "Load unpacked" and select the directory where you cloned/extracted the extension.

## Configuration (Setting your OpenAI API Key)

1.  **Get an OpenAI API Key:** If you don't have one, sign up at [OpenAI](https://platform.openai.com/) and generate a new API key.
2.  **Open Extension Options:**
    *   Go to `chrome://extensions`.
    *   Find "ChatGPT Right-Click Assistant" and click on "Details".
    *   Click on "Extension options".
3.  **Enter API Key:** Paste your OpenAI API key into the input field and save it.

## Usage

1.  **Select Text:** Highlight any text on a webpage.
2.  **Right-Click:** Right-click on the selected text.
3.  **Choose Action:**
    *   Select "Ask ChatGPT about selected text" to query ChatGPT about the highlighted content.
    *   Select "Summarize this page" to get a summary of the current page.
4.  **Interact:** A chat window will appear on the right side of your screen. Type your follow-up questions in the input box and press Enter or click the send button.
5.  **Close Chat:** Click the 'X' button in the top right corner of the chat window to close it.

## Development

To make changes to the extension:

1.  Modify the relevant HTML, CSS, or JavaScript files.
2.  Go to `chrome://extensions`.
3.  Find "ChatGPT Right-Click Assistant" and click the refresh icon to reload the extension with your changes.

---

## How the Code Works

This Chrome extension essentially injects a chat interface into any webpage, allowing users to interact with ChatGPT based on selected text or the entire page content.

Here's a breakdown of the main files and their roles:

1.  **`manifest.json` (The Blueprint)**
    *   This is the most important file; it defines the extension's metadata, permissions, and how its different parts interact with Chrome.
    *   `"manifest_version": 3`: Specifies the Manifest V3, the latest standard for Chrome extensions.
    *   `"name"`, `"version"`, `"description"`: Basic information about your extension.
    *   `"permissions"`: Declares what the extension is allowed to do:
        *   `"storage"`: To save the user's API key and conversation history.
        *   `"contextMenus"`: To add options to the right-click menu.
        *   `"activeTab"`: To get information about the currently active tab (like its URL or content).
        *   `"scripting"`: To inject `content.js` into web pages.
    *   `"background"`: Points to `background.js`, which runs in the background and handles events.
    *   `"options_page"`: Links to `options.html`, where users can configure settings (like the API key).
    *   `"action"`: Defines the behavior of the extension icon in the toolbar (though it's empty here, implying it doesn't have a direct popup when clicked).
    *   `"icons"`: Specifies the icons for the extension.
    *   `"content_scripts"`: This is crucial. It tells Chrome to inject `content.js` and `overlay.css` into all web pages (`"<all_urls>"`). `all_frames: true` means it injects into iframes as well.
    *   `"web_accessible_resources"`: Declares which resources (like `popup.html`, `overlay.css`) can be loaded by web pages (specifically, by the `content.js` script that creates the iframe).

2.  **`background.js` (The Event Handler)**
    *   This script runs in the background and listens for browser events.
    *   It creates two context menu items (right-click options): "Ask ChatGPT about selected text" and "Summarize this page".
    *   When a user clicks one of these context menu items, `background.js` gets the selected text or the entire page content.
    *   It then sends a message to the `content.js` script in the active tab, instructing it to open the chat overlay and pass the relevant data (selected text, page content, or a "summarize" flag).
    *   It also listens for a "clearConversation" message from `content.js` to clear the stored conversation history when the chat overlay is closed.

3.  **`content.js` (The Page Injector & Overlay Manager)**
    *   This script is injected into every webpage.
    *   Its primary role is to create and manage the chat overlay.
    *   When it receives a message from `background.js` to "openOverlay":
        *   It checks if the overlay already exists. If not, it creates a `div` element (`#chatgpt-overlay`) and an `iframe` inside it.
        *   The `iframe`'s `src` is set to `popup.html`, effectively loading your chat interface within the current webpage.
        *   It also creates the "X" close button for the overlay.
        *   If the overlay already exists, it sends a message *to the iframe* (which contains `popup.html`) to update the chat with new data (e.g., a new selected text).
    *   The close button's `onclick` handler removes the overlay from the page and sends a message to `background.js` to clear the conversation history.

4.  **`popup.html`, `popup.js`, `popup.css` (The Chat Interface)**
    *   **`popup.html`**: This is the HTML structure for the chat window itself, containing the chat display area (`#chat-container`), the user input field (`#user-input`), and the send button (`#send`).
    *   **`popup.css`**: Styles the chat interface, including messages, input box, and send button. It uses flexbox for layout to ensure the chat container scrolls and the input box remains at the bottom.
    *   **`popup.js`**: This is the core logic for the chat:
        *   It handles loading and saving conversation history to `chrome.storage.local`.
        *   It listens for messages from `content.js` (via `window.addEventListener('message')`) to initialize the chat with selected text or page content.
        *   It manages the UI: adding user and assistant messages to the `chat-container`, showing/hiding a "Loading..." indicator.
        *   It contains the `callChatGPT` function, which fetches the OpenAI API key from `chrome.storage.sync`, constructs the API request, sends it to OpenAI, and displays the response.
        *   It handles user input: when the user types in the input field and presses Enter or clicks the send button, it adds the user's message to the conversation and calls `callChatGPT`.
        *   It includes basic Markdown rendering for the assistant's responses.

5.  **`options.html`, `options.js`, `options.css` (The Settings Page)**
    *   **`options.html`**: Provides the UI for users to enter and save their OpenAI API key. It also includes instructions on how to obtain the key.
    *   **`options.css`**: Styles the options page.
    *   **`options.js`**: Handles the logic for the options page:
        *   Loads the saved API key from `chrome.storage.sync` when the page opens.
        *   Saves the entered API key to `chrome.storage.sync` when the "Save" button is clicked.
        *   Includes functionality to view/hide and delete the stored API key.

6.  **`overlay.css` (Overlay Styling)**
    *   This CSS file specifically styles the `#chatgpt-overlay` and its close button, controlling its position, size, and appearance on the webpage.

**In summary, the flow is:**

1.  User right-clicks on a webpage.
2.  `background.js` detects the right-click, gets the context (selected text/page content), and sends a message to `content.js`.
3.  `content.js` receives the message, creates an overlay with an iframe (loading `popup.html`), and sends the context data to the iframe.
4.  `popup.js` (inside the iframe) receives the context, initiates a conversation with ChatGPT (via the OpenAI API), and displays the responses.
5.  User interacts with the chat in the overlay.
6.  When the user closes the overlay, `content.js` removes it and tells `background.js` to clear the conversation history.

This modular design allows different parts of the extension to handle specific responsibilities and communicate effectively.