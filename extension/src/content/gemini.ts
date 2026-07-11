// Gemini Chat SPA-Aware Content Script for PromptMemory
// Anchored floating side widget that never disturbs native Gemini DOM layout

console.log("PromptMemory: Dedicated Gemini Chat Side-Anchored Clipper loaded.");

// Inject CSS styles for the side widget
const styleEl = document.createElement('style');
styleEl.textContent = `
  #pm-gemini-side-widget {
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
  #pm-gemini-trigger-pill {
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
  #pm-gemini-trigger-pill:hover {
    transform: translateY(-2px) scale(1.02) !important;
    box-shadow: 0 8px 25px -4px rgba(0, 0, 0, 0.15), 0 0 16px rgba(236, 72, 153, 0.15) !important;
    border-color: rgba(236, 72, 153, 0.3) !important;
  }
  #pm-gemini-trigger-pill:active {
    transform: translateY(0) scale(0.98) !important;
  }
  #pm-gemini-menu-panel {
    pointer-events: auto !important;
    margin-bottom: 10px !important;
    width: 260px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    border-radius: 16px !important;
    box-shadow: 0 12px 36px -6px rgba(0, 0, 0, 0.15) !important;
    backdrop-filter: blur(24px) !important;
    -webkit-backdrop-filter: blur(24px) !important;
    padding: 12px !important;
    display: none;
    flex-direction: column !important;
    gap: 8px !important;
    animation: pmFadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }
  @keyframes pmFadeInUp {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pm-menu-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    width: 100% !important;
    padding: 8px 12px !important;
    background: linear-gradient(135deg, #ec4899, #8b5cf6) !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: opacity 0.2s !important;
  }
  .pm-menu-btn:hover {
    opacity: 0.9 !important;
  }
  .pm-menu-btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
`;
document.head.appendChild(styleEl);

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

function extractGeminiChat(): string {
  const turns: string[] = [];
  const allTurns = Array.from(document.querySelectorAll('user-query, model-response, .user-query, .model-response, message-content'));
  allTurns.forEach(turn => {
    const isUser = turn.tagName.toLowerCase().includes('user') || turn.className.toLowerCase().includes('user') || turn.getAttribute('role') === 'user';
    const prefix = isUser ? '### User:\n' : '### Gemini:\n';
    const text = turn.textContent?.trim() || '';
    if (text && !turns.includes(prefix + text)) {
      turns.push(`${prefix}${text}`);
    }
  });

  if (turns.length === 0) {
    const mainText = document.querySelector('main')?.innerText?.trim() || document.body.innerText?.trim() || '';
    return mainText.substring(0, 8000);
  }

  return turns.join('\n\n---\n\n') || document.title || 'Gemini Chat Conversation';
}

function injectSideWidget() {
  if (document.getElementById('pm-gemini-buttons-container')) return;
  if (!document.body) return;

  const container = document.createElement('div');
  container.id = 'pm-gemini-buttons-container';
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
  copyBtn.id = 'pm-gemini-copy-btn';
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
      const contextText = extractGeminiChat();
      await navigator.clipboard.writeText(contextText);
      copyBtn.innerHTML = `<span>✅</span><span>Copied!</span>`;
      showToast("Context copied to clipboard!", 'success');
      setTimeout(() => { copyBtn.innerHTML = `<span>📋</span><span>Copy Context</span>`; }, 2000);
    } catch (err: any) {
      showToast("Failed to copy context.", 'error');
    }
  });

  const automateBtn = document.createElement('button');
  automateBtn.id = 'pm-gemini-automate-btn';
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
      const copiedContext = extractGeminiChat();
      await navigator.clipboard.writeText(copiedContext).catch(() => {});

      // Click Gemini's New Chat button
      const newChatBtn = document.querySelector<HTMLElement>('a[href="/app"], button[aria-label*="New chat" i], [data-test-id="new-chat-button"], side-navigation-button');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        window.location.href = 'https://gemini.google.com/app';
        return;
      }

      // Initialize a setInterval (polling every 300ms, max 15 attempts) to look for the primary <textarea> in the new chat.
      let attempts = 0;
      const checkInput = setInterval(() => {
        attempts++;
        const inputArea = document.querySelector<HTMLElement>('rich-textarea [contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea');
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
            // Finally, simulate the Enter key to submit
            const sendBtn = document.querySelector<HTMLElement>('button[aria-label*="Send" i], button.send-button, [data-test-id="send-button"]');
            if (sendBtn) {
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

// Clean any old duplicate injection buttons from previous versions
function removeLegacyButtons() {
  document.querySelectorAll('#pm-inject-btn, .pm-gemini-clip-btn, #pm-gemini-side-widget').forEach(b => b.remove());
}

window.addEventListener('popstate', () => {
  removeLegacyButtons();
  injectSideWidget();
});

const observer = new MutationObserver(() => {
  removeLegacyButtons();
  injectSideWidget();
});
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}
setInterval(() => {
  removeLegacyButtons();
  injectSideWidget();
}, 1500);

removeLegacyButtons();
injectSideWidget();
