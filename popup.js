document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send');

  let conversation = [];
  let loaderElement = null;

  // Basic Markdown rendering
  function renderMarkdown(text) {
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || ''}">${escapeHtml(code)}</code></pre>`;
    });
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return text;
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerHTML = renderMarkdown(escapeHtml(message)); // Render markdown and escape HTML
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function showLoader() {
    if (!loaderElement) {
      loaderElement = document.createElement('div');
      loaderElement.classList.add('message', 'assistant-message', 'loader');
      loaderElement.textContent = 'Loading...';
      chatContainer.appendChild(loaderElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function hideLoader() {
    if (loaderElement) {
      loaderElement.remove();
      loaderElement = null;
    }
  }

  async function callChatGPT(prompt) {
    const apiKey = await new Promise(resolve => chrome.storage.sync.get('apiKey', data => resolve(data.apiKey)));
    if (!apiKey) {
      addMessage('assistant', 'Please set your API key in the options page.');
      return;
    }

    showLoader();
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content.trim();
      addMessage('assistant', assistantMessage);
      conversation.push({ role: 'assistant', content: assistantMessage });
      chrome.storage.local.set({ conversation }); // Save conversation history
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      addMessage('assistant', `Sorry, I had trouble getting a response: ${error.message}`);
    } finally {
      hideLoader();
    }
  }

  // Load conversation history or start a new one
  chrome.storage.local.get(['conversation', 'selectedText', 'pageContent', 'summarize'], async (data) => {
    if (data.conversation) {
      conversation = data.conversation;
      conversation.forEach(msg => addMessage(msg.role, msg.content));
    } else {
      let initialUserMessage;
      if (data.pageContent) {
        conversation.push({ role: 'system', content: `The user is on a page with the following content: ${data.pageContent.substring(0, 4000)}` });
      }

      if (data.selectedText) {
        initialUserMessage = `Tell me more about "${data.selectedText}"`;
      } else if (data.summarize) {
        initialUserMessage = 'Summarize this page for me.';
      } else {
        initialUserMessage = 'I have some questions about this page.';
      }

      addMessage('user', initialUserMessage);
      conversation.push({ role: 'user', content: initialUserMessage });
      await callChatGPT(conversation);
    }

    chrome.storage.local.remove(['selectedText', 'pageContent', 'summarize']);
  });

  sendButton.addEventListener('click', async () => {
    const userMessage = userInput.value.trim();
    if (userMessage) {
      addMessage('user', userMessage);
      conversation.push({ role: 'user', content: userMessage });
      userInput.value = '';
      await callChatGPT(conversation);
    }
  });

  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendButton.click();
    }
  });

  // Listen for messages from the parent (content script) to update chat
  window.addEventListener('message', async (event) => {
    // Ensure the message is from a trusted source (your extension)
    if (event.source === window.parent && event.data.action === 'updateChat') {
      const payload = event.data.payload;
      let newUserMessage;

      // Determine the new user message based on the payload
      if (payload.selectedText) {
        newUserMessage = `Tell me more about "${payload.selectedText}"`;
      } else if (payload.summarize) {
        newUserMessage = 'Summarize this page for me.';
      } else {
        newUserMessage = 'I have some questions about this page.';
      }

      // Add system message if page content is provided
      if (payload.pageContent) {
        conversation.push({ role: 'system', content: `The user is on a page with the following content: ${payload.pageContent.substring(0, 4000)}` });
      }

      addMessage('user', newUserMessage);
      conversation.push({ role: 'user', content: newUserMessage });
      await callChatGPT(conversation);
    }
  });
});