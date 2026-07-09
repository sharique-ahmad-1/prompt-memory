console.log("PromptMemory: ChatGPT Content Script Injected");

function injectSaveButtons() {
  // Find all user and assistant messages
  const messages = document.querySelectorAll('[data-message-author-role]');
  
  messages.forEach((message) => {
    // Prevent duplicate injections
    if (message.querySelector('.pm-save-btn') || message.querySelector('[data-pm-injected="true"]')) {
      return;
    }

    const role = message.getAttribute('data-message-author-role') || 'unknown';
    if (role !== 'user') return;

    // Try to find the action bar or bottom of the message
    const container = document.createElement('div');
    container.setAttribute('data-pm-injected', 'true');
    container.style.cssText = `
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
      padding-right: 8px;
      width: 100%;
    `;

    const btn = document.createElement('button');
    btn.className = 'pm-save-btn';
    btn.innerText = '✨ Save to PM';
    
    // Indigo / Emerald styling
    btn.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); /* Indigo to Violet */
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(99,102,241,0.2);
      transition: all 0.2s ease;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    btn.onmouseover = () => {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 4px 6px rgba(99,102,241,0.3)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 2px 4px rgba(99,102,241,0.2)';
    };

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Extract the text of the message
      const textElement = message.querySelector('.whitespace-pre-wrap') || message;
      const textContent = textElement.textContent || '';
      
      const role = message.getAttribute('data-message-author-role') || 'unknown';

      // Send to background/sidepanel
      chrome.runtime.sendMessage({
        action: 'SAVE_PROMPT',
        payload: {
          platform: 'chatgpt',
          role: role,
          content: textContent.trim()
        }
      }, () => {
        void chrome.runtime.lastError;
      });

      // Provide visual feedback
      const originalText = btn.innerText;
      const originalBg = btn.style.background;
      
      btn.innerText = '✓ Saved';
      btn.style.background = '#10b981'; /* Emerald 500 */
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = originalBg;
      }, 2000);
    };

    container.appendChild(btn);
    
    // Append to the bottom of the message element
    message.appendChild(container);
  });
}

// Initial injection
(function init() {
  if (document.body) {
    injectSaveButtons();

    // Use a MutationObserver to detect when new messages are added to the chat
    const observer = new MutationObserver((mutations) => {
      let shouldInject = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldInject = true;
          break;
        }
      }
      if (shouldInject) {
        // Small debounce
        setTimeout(injectSaveButtons, 500);
      }
    });

    // Start observing the chat container
    const chatContainer = document.querySelector('main') || document.body;
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  } else {
    setTimeout(init, 100);
  }
})();
