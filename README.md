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
