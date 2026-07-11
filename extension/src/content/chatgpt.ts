// ChatGPT SPA-Aware Content Script for PromptMemory
// Includes robust message selectors and anchored floating side widget

console.log("PromptMemory: ChatGPT Content Script Injected");

function showToast(message: string, type: 'info' | 'success' | 'error') {
  let container = document.getElementById('pm-clipper-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pm-clipper-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = {
    info: 'rgba(99, 102, 241, 0.95)',
    success: 'rgba(16, 185, 129, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)'
  };
  const icons = { info: '⏳', success: '✅', error: '❌' };

  toast.style.cssText = `
    background: ${bgColors[type]};
    color: white;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.25);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s ease;
  `;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function extractChatGPTConversation(): string {
  const turns: string[] = [];
  const allTurns = Array.from(document.querySelectorAll('[data-message-author-role], article[data-testid*="turn"], div[data-testid*="user-message"], .group\\/conversation-turn'));
  allTurns.forEach(turn => {
    const role = turn.getAttribute('data-message-author-role') || (turn.getAttribute('data-testid') || '').includes('user') ? 'user' : 'assistant';
    const prefix = role === 'user' ? '### User:\n' : '### ChatGPT:\n';
    const textElement = turn.querySelector('.whitespace-pre-wrap') || turn;
    const text = textElement.textContent?.trim() || '';
    if (text && !turns.includes(prefix + text)) {
      turns.push(`${prefix}${text}`);
    }
  });

  if (turns.length === 0) {
    const mainText = document.querySelector('main')?.innerText?.trim() || document.body.innerText?.trim() || '';
    return mainText.substring(0, 8000);
  }

  return turns.join('\n\n---\n\n') || document.title || 'ChatGPT Conversation';
}

function injectSideWidget() {
  if (document.getElementById('pm-chatgpt-side-widget')) return;
  if (!document.body) return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #pm-chatgpt-side-widget {
      position: fixed !important;
      right: 20px !important;
      bottom: 90px !important;
      z-index: 2147483640 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      pointer-events: none !important;
    }
    #pm-chatgpt-trigger-pill {
      pointer-events: auto !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 14px !important;
      background: rgba(255, 255, 255, 0.92) !important;
      color: #1e293b !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      border-radius: 9999px !important;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.12), 0 0 12px rgba(99, 102, 241, 0.1) !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      user-select: none !important;
    }
    #pm-chatgpt-trigger-pill:hover {
      transform: translateY(-2px) scale(1.02) !important;
      box-shadow: 0 8px 25px -4px rgba(0, 0, 0, 0.15), 0 0 16px rgba(236, 72, 153, 0.15) !important;
      border-color: rgba(236, 72, 153, 0.3) !important;
    }
  `;
  document.head.appendChild(styleEl);

  const container = document.createElement('div');
  container.id = 'pm-chatgpt-buttons-container';
  container.style.cssText = `
    position: fixed !important;
    right: 20px !important;
    bottom: 24px !important;
    z-index: 2147483640 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  `;

  const copyBtn = document.createElement('button');
  copyBtn.id = 'pm-chatgpt-copy-btn';
  copyBtn.style.cssText = `
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    padding: 10px 16px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    color: #1e293b !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    backdrop-filter: blur(12px) !important;
    transition: all 0.2s !important;
  `;
  copyBtn.innerHTML = `<span>📋</span><span>Copy Context</span>`;

  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); e.preventDefault();
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      alert("PromptMemory Extension updated. Please refresh this page to continue saving.");
      return;
    }
    try {
      const contextText = extractChatGPTConversation();
      await navigator.clipboard.writeText(contextText);
      copyBtn.innerHTML = `<span>✅</span><span>Copied!</span>`;
      showToast("Context copied to clipboard!", 'success');
      setTimeout(() => { copyBtn.innerHTML = `<span>📋</span><span>Copy Context</span>`; }, 2000);
    } catch (err: any) {
      showToast("Failed to copy context.", 'error');
    }
  });

  const automateBtn = document.createElement('button');
  automateBtn.id = 'pm-chatgpt-automate-btn';
  automateBtn.style.cssText = `
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    padding: 10px 16px !important;
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    color: white !important;
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s !important;
  `;
  automateBtn.innerHTML = `<span>⚡</span><span>Automate New Context</span>`;

  automateBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); e.preventDefault();
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      alert("PromptMemory Extension updated. Please refresh this page to continue saving.");
      return;
    }
    if (automateBtn.disabled) return;
    automateBtn.disabled = true;
    automateBtn.innerHTML = `<span>⏳ Automating...</span>`;
    showToast("Copying context & starting new chat...", 'info');

    try {
      const copiedContext = extractChatGPTConversation();
      await navigator.clipboard.writeText(copiedContext).catch(() => {});

      // Query DOM for New Chat button
      const newChatBtn = document.querySelector<HTMLElement>('a[href="/"], a[href="/chat"], button[aria-label*="New chat" i], [data-testid="compose-new-chat-button"]');
      if (newChatBtn && newChatBtn.getAttribute('href') === '/') {
        newChatBtn.click();
      } else {
        window.location.href = 'https://chatgpt.com/';
        return;
      }

      // Initialize a setInterval (polling every 300ms, max 15 attempts) to look for the primary <textarea> in the new chat.
      let attempts = 0;
      const checkInput = setInterval(() => {
        attempts++;
        const inputArea = document.querySelector<HTMLElement>('#prompt-textarea, div[role="textbox"][contenteditable="true"], textarea');
        if (inputArea) {
          clearInterval(checkInput);
          inputArea.focus();
          const fullPrompt = copiedContext + "\n\n - Chat 2";
          
          if (inputArea instanceof HTMLTextAreaElement) {
            inputArea.value = fullPrompt;
            inputArea.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            inputArea.innerText = fullPrompt;
            inputArea.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: fullPrompt }));
          }

          setTimeout(() => {
            // Finally, simulate Enter key to submit
            const sendBtn = document.querySelector<HTMLElement>('button[data-testid="send-button"], button[aria-label*="Send" i]');
            if (sendBtn && !sendBtn.hasAttribute('disabled')) {
              sendBtn.click();
            } else {
              inputArea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
            }
            automateBtn.disabled = false;
            automateBtn.innerHTML = `<span>✅ Context Sent!</span>`;
            showToast("Automated new context successfully!", 'success');
            setTimeout(() => { automateBtn.innerHTML = `<span>⚡</span><span>Automate New Context</span>`; }, 2500);
          }, 300);
        } else if (attempts >= 15) {
          clearInterval(checkInput);
          automateBtn.disabled = false;
          automateBtn.innerHTML = `<span>⚡</span><span>Automate New Context</span>`;
          showToast("Failed to locate new chat text area after 15 attempts.", 'error');
        }
      }, 300);
    } catch (err: any) {
      automateBtn.disabled = false;
      automateBtn.innerHTML = `<span>❌ Error</span>`;
      showToast("Error during automation: " + err.message, 'error');
      setTimeout(() => { automateBtn.innerHTML = `<span>⚡</span><span>Automate New Context</span>`; }, 3000);
    }
  });

  container.appendChild(copyBtn);
  container.appendChild(automateBtn);
  document.body.appendChild(container);
}

function injectSaveButtons() {
  const messages = document.querySelectorAll('[data-message-author-role], article[data-testid*="turn"], div[data-testid*="user-message"], .group\\/conversation-turn');
  
  messages.forEach((message) => {
    if (message.querySelector('.pm-save-btn') || message.querySelector('[data-pm-injected="true"]')) {
      return;
    }

    const role = message.getAttribute('data-message-author-role') || (message.getAttribute('data-testid') || '').includes('user') ? 'user' : 'assistant';
    if (role !== 'user') return;

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
    btn.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
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

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        alert("PromptMemory Extension updated. Please refresh this page to continue saving.");
        return;
      }
      
      const textElement = message.querySelector('.whitespace-pre-wrap') || message;
      const textContent = textElement.textContent || '';
      
      chrome.runtime.sendMessage({
        action: 'SAVE_PROMPT',
        payload: {
          platform: 'chatgpt',
          content: textContent.trim()
        }
      }, () => {
        void chrome.runtime.lastError;
      });

      const originalText = btn.innerText;
      const originalBg = btn.style.background;
      
      btn.innerText = '✓ Saved';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = originalBg;
      }, 2000);
    };

    container.appendChild(btn);
    message.appendChild(container);
  });
}

(function init() {
  if (document.body) {
    injectSaveButtons();
    injectSideWidget();

    const observer = new MutationObserver(() => {
      injectSaveButtons();
      injectSideWidget();
    });

    const chatContainer = document.querySelector('main') || document.body;
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
    setInterval(() => {
      injectSaveButtons();
      injectSideWidget();
    }, 1500);
  } else {
    setTimeout(init, 100);
  }
})();
