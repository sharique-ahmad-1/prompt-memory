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
  if (document.getElementById('pm-gemini-side-widget')) return;
  if (!document.body) return;

  const widget = document.createElement('div');
  widget.id = 'pm-gemini-side-widget';

  const menuPanel = document.createElement('div');
  menuPanel.id = 'pm-gemini-menu-panel';
  menuPanel.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 6px;">
      <span>✨ PromptMemory Action</span>
      <span id="pm-close-menu" style="cursor: pointer; font-size: 13px;">✕</span>
    </div>
    <div style="font-size: 12px; color: #1e293b; font-weight: 600; line-height: 1.3;">
      Save active Gemini conversation & prompts directly into your Vault.
    </div>
    <button id="pm-save-chat-btn" class="pm-menu-btn">
      <span>💾 Save Chat to Vault</span>
    </button>
  `;

  const triggerPill = document.createElement('div');
  triggerPill.id = 'pm-gemini-trigger-pill';
  triggerPill.innerHTML = `
    <span style="font-size: 14px;">✨</span>
    <span style="background: linear-gradient(to right, #ec4899, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Clip Chat</span>
  `;

  widget.appendChild(menuPanel);
  widget.appendChild(triggerPill);
  document.body.appendChild(widget);

  triggerPill.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuPanel.style.display === 'flex';
    menuPanel.style.display = isOpen ? 'none' : 'flex';
  });

  const closeBtn = menuPanel.querySelector('#pm-close-menu');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuPanel.style.display = 'none';
    });
  }

  const saveBtn = menuPanel.querySelector('#pm-save-chat-btn') as HTMLButtonElement;
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (saveBtn.disabled) return;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span>⏳ Saving to Vault...</span>`;
      showToast("Extracting and syncing Gemini conversation...", 'info');

      try {
        const chatContent = extractGeminiChat();
        let rawTitle = document.title.replace(/Gemini/i, '').replace(/[-–|]/g, '').trim();
        const title = rawTitle ? `Gemini: ${rawTitle}` : 'Gemini AI Conversation';

        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              title: title,
              platform: 'Gemini',
              content: chatContent,
              source_link: window.location.href,
              tags: ['#Gemini', '#AIChat', '#Conversation'],
              category: 'AI Chat'
            }
          }, (res) => {
            if (chrome.runtime.lastError || !res?.success) {
              reject(new Error(chrome.runtime.lastError?.message || res?.error || 'Failed to sync with PromptMemory Vault'));
            } else {
              resolve();
            }
          });
        });

        saveBtn.innerHTML = `<span>✅ Successfully Saved!</span>`;
        showToast("Gemini chat saved to PromptMemory Vault!", 'success');
        setTimeout(() => {
          menuPanel.style.display = 'none';
          saveBtn.disabled = false;
          saveBtn.innerHTML = `<span>💾 Save Chat to Vault</span>`;
        }, 2000);
      } catch (err: any) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span>❌ Error Saving</span>`;
        showToast("Error: " + (err.message || 'Could not reach Supabase'), 'error');
        setTimeout(() => {
          saveBtn.innerHTML = `<span>💾 Save Chat to Vault</span>`;
        }, 3000);
      }
    });
  }
}

// Clean any old duplicate injection buttons from previous versions
function removeLegacyButtons() {
  document.querySelectorAll('#pm-inject-btn, .pm-gemini-clip-btn').forEach(b => b.remove());
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
