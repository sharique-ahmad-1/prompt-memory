// YouTube & Shorts SPA-Aware Content Script for PromptMemory
// Uses MutationObserver, setInterval, and locationchange with strict deduplication (#pm-inject-btn)

console.log("PromptMemory: Dedicated YouTube & Shorts SPA-Aware Clipper loaded.");

let lastInjectedUrl = '';

// Inject CSS styles for YouTube button
const styleEl = document.createElement('style');
styleEl.textContent = `
  #pm-inject-btn, .pm-yt-clip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 16px;
    height: 36px;
    background: var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1));
    color: var(--yt-spec-text-primary, #f1f1f1);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 18px;
    font-family: Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    z-index: 10000;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    margin-left: 8px;
    user-select: none;
    white-space: nowrap;
  }
  #pm-inject-btn:hover, .pm-yt-clip-btn:hover {
    background: var(--yt-spec-button-chip-background-hover, rgba(255, 255, 255, 0.2));
    border-color: #8b5cf6;
    transform: translateY(-1px);
  }
  #pm-inject-btn.pm-shorts, .pm-yt-clip-btn.pm-shorts {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    padding: 0 !important;
    margin-top: 16px !important;
    background: rgba(255, 255, 255, 0.15) !important;
  }
  #pm-inject-btn.pm-shorts:hover, .pm-yt-clip-btn.pm-shorts:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: scale(1.05);
  }
  #pm-inject-btn.pm-saving {
    background: rgba(99, 102, 241, 0.9) !important;
    border-color: #6366f1 !important;
    color: #fff !important;
    cursor: wait !important;
  }
  #pm-inject-btn.pm-saved {
    background: rgba(16, 185, 129, 0.95) !important;
    border-color: #10b981 !important;
    color: #fff !important;
  }
  #pm-inject-btn.pm-error {
    background: rgba(239, 68, 68, 0.95) !important;
    border-color: #ef4444 !important;
    color: #fff !important;
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
      right: 24px;
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
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
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
  }, 3000);
}

function cleanDuplicates() {
  const allBtns = document.querySelectorAll('#pm-inject-btn, .pm-yt-clip-btn');
  if (allBtns.length > 1) {
    // Keep only the last valid one in active view
    for (let i = 0; i < allBtns.length - 1; i++) {
      allBtns[i].remove();
    }
  }
}

function injectYouTubeButton() {
  const currentUrl = window.location.href;
  
  if (currentUrl !== lastInjectedUrl) {
    document.querySelectorAll('#pm-inject-btn, .pm-yt-clip-btn').forEach(btn => btn.remove());
    lastInjectedUrl = currentUrl;
  }

  const isShorts = window.location.pathname.includes('/shorts/');

  if (isShorts) {
    const shortsSelectors = [
      'ytd-reel-video-renderer[is-active] #actions',
      'ytd-reel-video-renderer #actions',
      'ytd-shorts #actions',
      '#shorts-container #actions',
      'ytd-reel-player-overlay-renderer #actions',
      '#actions.ytd-reel-player-overlay-renderer'
    ];
    let actionsBar: Element | null = null;
    for (const sel of shortsSelectors) {
      actionsBar = document.querySelector(sel);
      if (actionsBar) break;
    }

    if (!actionsBar) return;
    if (actionsBar.querySelector('#pm-inject-btn')) return;

    // Clean up any stray buttons outside active bar
    document.querySelectorAll('#pm-inject-btn.pm-shorts').forEach(btn => {
      if (!actionsBar?.contains(btn)) btn.remove();
    });

    const btn = document.createElement('button');
    btn.id = 'pm-inject-btn';
    btn.className = 'pm-yt-clip-btn pm-shorts';
    btn.title = 'Clip YouTube Short to PromptMemory';
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;

    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); e.preventDefault();
      if (btn.classList.contains('pm-saving')) return;
      btn.classList.add('pm-saving');
      btn.innerHTML = `<span style="font-size: 16px;">⏳</span>`;
      showToast("Saving YouTube Short to PromptMemory...", 'info');

      try {
        const match = currentUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
        const videoId = match ? match[1] : '';
        const titleEl = document.querySelector('ytd-reel-video-renderer[is-active] h2, ytd-reel-video-renderer[is-active] .title, #video-title');
        const title = titleEl?.textContent?.trim() || document.title || 'YouTube Short';
        const imageUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null;
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              platform: 'youtube',
              role: 'user',
              content: title,
              image_url: imageUrl,
              embed_url: embedUrl,
              source_link: currentUrl,
              tags: ['#YouTubeShort', '#Video', '#Shorts'],
              category: 'Social Clip'
            }
          }, (res) => {
            if (chrome.runtime.lastError || !res?.success) reject(new Error(chrome.runtime.lastError?.message || res?.error || 'Failed to save'));
            else resolve();
          });
        });

        btn.classList.remove('pm-saving'); btn.classList.add('pm-saved');
        btn.innerHTML = `<span style="font-size: 16px;">✅</span>`;
        showToast("YouTube Short saved to PromptMemory Vault!", 'success');
        setTimeout(() => {
          btn.classList.remove('pm-saved');
          btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        }, 2000);
      } catch (err: any) {
        btn.classList.remove('pm-saving'); btn.classList.add('pm-error');
        btn.innerHTML = `<span style="font-size: 16px;">❌</span>`;
        showToast("Error: " + err.message, 'error');
        setTimeout(() => {
          btn.classList.remove('pm-error');
          btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        }, 3000);
      }
    });

    actionsBar.insertBefore(btn, actionsBar.children[1] || actionsBar.firstChild);
    cleanDuplicates();
    return;
  }

  // Regular Watch Page (`/watch`)
  if (window.location.pathname.includes('/watch')) {
    const watchSelectors = [
      '#actions-inner #menu ytd-menu-renderer #top-level-buttons-computed',
      'ytd-watch-metadata #actions #top-level-buttons-computed',
      'ytd-watch-metadata #actions-inner #menu ytd-menu-renderer',
      'ytd-watch-metadata #actions-inner',
      '#top-level-buttons-computed',
      '#owner-and-teaser #actions ytd-menu-renderer',
      'ytd-watch-metadata #actions',
      '#actions.ytd-watch-metadata'
    ];
    let topButtons: Element | null = null;
    for (const sel of watchSelectors) {
      topButtons = document.querySelector(sel);
      if (topButtons) break;
    }

    if (!topButtons) return;
    if (topButtons.querySelector('#pm-inject-btn')) return;

    // Clean up any stray buttons outside active topButtons container
    document.querySelectorAll('#pm-inject-btn').forEach(btn => {
      if (!topButtons?.contains(btn)) btn.remove();
    });

    const btn = document.createElement('button');
    btn.id = 'pm-inject-btn';
    btn.className = 'pm-yt-clip-btn';
    btn.title = 'Save video to PromptMemory Vault';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>Clip to PromptMemory</span>`;

    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); e.preventDefault();
      if (btn.classList.contains('pm-saving')) return;
      btn.classList.add('pm-saving');
      btn.innerHTML = `<span>⏳</span><span>Saving...</span>`;
      showToast("Saving YouTube Video to PromptMemory...", 'info');

      try {
        const match = currentUrl.match(/\/watch\?v=([a-zA-Z0-9_-]+)/);
        const videoId = match ? match[1] : new URLSearchParams(window.location.search).get('v') || '';
        const titleEl = document.querySelector('ytd-watch-metadata #title h1, h1.title, #video-title');
        const title = titleEl?.textContent?.trim() || document.title || 'YouTube Video';
        const imageUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null;
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              platform: 'youtube',
              role: 'user',
              content: title,
              image_url: imageUrl,
              embed_url: embedUrl,
              source_link: currentUrl,
              tags: ['#YouTube', '#Video', '#Clip'],
              category: 'Social Clip'
            }
          }, (res) => {
            if (chrome.runtime.lastError || !res?.success) reject(new Error(chrome.runtime.lastError?.message || res?.error || 'Failed to save'));
            else resolve();
          });
        });

        btn.classList.remove('pm-saving'); btn.classList.add('pm-saved');
        btn.innerHTML = `<span>✅</span><span>Saved to PM</span>`;
        showToast("Saved YouTube Video to Media Hub!", 'success');
        setTimeout(() => {
          btn.classList.remove('pm-saved');
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>Clip to PromptMemory</span>`;
        }, 2500);
      } catch (err: any) {
        btn.classList.remove('pm-saving'); btn.classList.add('pm-error');
        btn.innerHTML = `<span>❌</span><span>Error</span>`;
        showToast("Error: " + err.message, 'error');
        setTimeout(() => {
          btn.classList.remove('pm-error');
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg><span>Clip to PromptMemory</span>`;
        }, 3000);
      }
    });

    topButtons.appendChild(btn);
    cleanDuplicates();
  }
}

// SPA Routing Interception (pushState, replaceState, popstate, locationchange)
const originalPush = history.pushState;
history.pushState = function (...args) {
  const result = originalPush.apply(this, args);
  window.dispatchEvent(new Event('locationchange'));
  return result;
};

const originalReplace = history.replaceState;
history.replaceState = function (...args) {
  const result = originalReplace.apply(this, args);
  window.dispatchEvent(new Event('locationchange'));
  return result;
};

window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
window.addEventListener('locationchange', () => {
  document.querySelectorAll('#pm-inject-btn, .pm-yt-clip-btn').forEach(btn => btn.remove());
  setTimeout(injectYouTubeButton, 300);
  setTimeout(injectYouTubeButton, 1000);
});

// Periodic observer and interval loop watching ytd-app and body
const ytObserver = new MutationObserver(() => injectYouTubeButton());
const targetRoot = document.querySelector('ytd-app') || document.body;
ytObserver.observe(targetRoot, { childList: true, subtree: true });
setInterval(injectYouTubeButton, 500);
injectYouTubeButton();
