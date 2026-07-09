console.log("PromptMemory: Floating Logo Injected");

function scrapeCurrentChat() {
  const url = window.location.href;
  let text = '';
  if (url.includes('chatgpt.com')) {
    const messages = document.querySelectorAll('[data-message-author-role]');
    messages.forEach(m => {
      const role = m.getAttribute('data-message-author-role');
      const roleName = role === 'user' ? '[USER]' : '[ASSISTANT]';
      text += `${roleName}: ${(m as HTMLElement).innerText.trim()}\n\n`;
    });
  } else if (url.includes('claude.ai')) {
    const messages = document.querySelectorAll('.font-user, .font-claude');
    messages.forEach(m => {
      const isUser = m.classList.contains('font-user');
      const roleName = isUser ? '[USER]' : '[ASSISTANT]';
      text += `${roleName}: ${(m as HTMLElement).innerText.trim()}\n\n`;
    });
  } else if (url.includes('gemini.google.com')) {
    const messages = document.querySelectorAll('message-content');
    messages.forEach(m => {
      text += `[MESSAGE]: ${(m as HTMLElement).innerText.trim()}\n\n`;
    });
  }
  return text.trim();
}



function injectFloatingLogo() {
  if (document.getElementById('pm-floating-logo')) return;

  const container = document.createElement('div');
  container.id = 'pm-floating-logo';
  
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    cursor: grab;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
    user-select: none;
  `;

  container.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <defs>
        <linearGradient id="pm-grad-float-pri" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ffffff" />
          <stop offset="0.5" stop-color="#e0e7ff" />
          <stop offset="1" stop-color="#f3e8ff" />
        </linearGradient>
        <linearGradient id="pm-grad-float-acc" x1="30" y1="2" x2="2" y2="30" gradientUnits="userSpaceOnUse">
          <stop stop-color="#38BDF8" />
          <stop offset="1" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pm-grad-float-pri)" fill-opacity="0.2" stroke="url(#pm-grad-float-pri)" stroke-width="1.5" />
      <path d="M8 22V12C8 10.3431 9.34315 9 11 9C12.6569 9 14 10.3431 14 12V18L16 15L18 18V12C18 10.3431 19.3431 9 21 9C22.6569 9 24 10.3431 24 12V22" stroke="url(#pm-grad-float-pri)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="16" cy="11" r="2.5" fill="url(#pm-grad-float-acc)" />
      <circle cx="8" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="24" cy="22" r="1.5" fill="#ffffff" />
    </svg>
  `;

  const popover = document.createElement('div');
  popover.style.cssText = `
    position: absolute;
    bottom: 60px;
    right: 0;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 10px;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px) scale(0.95);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: bottom right;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 220px;
    z-index: 2147483647;
  `;

  const createMenuItem = (icon: string, text: string, theme: 'default' | 'purple' | 'indigo', onClick: () => void, keepOpen = false) => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      color: #e4e4e7;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 600;
      cursor: pointer;
      background: transparent;
      border: 1px solid transparent;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    `;

    item.onmouseenter = () => {
      if (theme === 'purple') {
        item.style.background = 'rgba(168, 85, 247, 0.18)';
        item.style.borderColor = 'rgba(168, 85, 247, 0.35)';
        item.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.25)';
        item.style.color = '#f3e8ff';
      } else if (theme === 'indigo') {
        item.style.background = 'rgba(99, 102, 241, 0.18)';
        item.style.borderColor = 'rgba(99, 102, 241, 0.35)';
        item.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.25)';
        item.style.color = '#e0e7ff';
      } else {
        item.style.background = 'rgba(255, 255, 255, 0.1)';
        item.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
        item.style.color = '#ffffff';
      }
    };

    item.onmouseleave = () => {
      item.style.background = 'transparent';
      item.style.borderColor = 'transparent';
      item.style.boxShadow = 'none';
      item.style.color = '#e4e4e7';
      item.style.transform = 'scale(1)';
    };

    item.onmousedown = (e) => {
      e.stopPropagation();
      item.style.transform = 'scale(0.98)';
    };

    item.onmouseup = () => {
      item.style.transform = 'scale(1)';
    };

    item.onclick = (e) => {
      e.stopPropagation();
      onClick();
      if (!keepOpen) {
        closePopover();
      }
    };

    item.innerHTML = `<span>${icon}</span><span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${text}</span>`;
    return item;
  };

  const createSeparator = () => {
    const sep = document.createElement('div');
    sep.style.cssText = 'height: 1px; background: rgba(255, 255, 255, 0.08); margin: 2px 0;';
    return sep;
  };

  const showToastMsg = (msg: string, isErr = false) => {
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; bottom: 24px; right: 24px; background: ${isErr ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)'}; color: white; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 2147483647; box-shadow: 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s; font-family: -apple-system, sans-serif;`;
    toast.innerHTML = `<span>${isErr ? '❌' : '✅'}</span><span style="margin-left: 8px;">${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const itemSaveMedia = createMenuItem('🎬', 'Save Media', 'purple', async () => {
    itemSaveMedia.innerHTML = `<span>⏳</span><span style="flex: 1;">Extracting Media...</span>`;
    
    try {
      const extractionResult = await Promise.race([
        new Promise<{ embedUrl: string; imageUrl: string | null }>((resolve) => {
          let embedUrl = window.location.href;
          let imageUrl: string | null = null;
          
          if (document.querySelector('video')) {
            const vid = document.querySelector('video');
            embedUrl = vid?.src || window.location.href;
          } else if (document.querySelector('img[src*="instagram"], img[src*="ytimg"]')) {
            const img = document.querySelector('img[src*="instagram"], img[src*="ytimg"]') as HTMLImageElement;
            imageUrl = img?.src || null;
          }

          if (!imageUrl && embedUrl === window.location.href) {
            const ogImg = document.querySelector('meta[property="og:image"], meta[name="og:image"]')?.getAttribute('content');
            if (ogImg && !ogImg.startsWith('data:')) imageUrl = ogImg;
          }

          if (imageUrl || (embedUrl && embedUrl !== window.location.href)) {
            resolve({ embedUrl, imageUrl });
          } else {
            // Check once more after brief DOM yield
            setTimeout(() => {
              const anyImg = document.querySelector('img') as HTMLImageElement;
              if (anyImg && anyImg.src && !anyImg.src.startsWith('data:') && (anyImg.naturalWidth || 0) > 100) {
                resolve({ embedUrl: window.location.href, imageUrl: anyImg.src });
              } else {
                resolve({ embedUrl: window.location.href, imageUrl: null });
              }
            }, 500);
          }
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_NO_MEDIA')), 3000))
      ]);

      if (!extractionResult.imageUrl && extractionResult.embedUrl === window.location.href) {
        throw new Error('TIMEOUT_NO_MEDIA');
      }

      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'SAVE_PROMPT',
          payload: {
            title: `Captured Media: ${document.title.slice(0, 30)}`,
            content: `Media captured from ${window.location.href}`,
            image_url: extractionResult.imageUrl,
            embed_url: extractionResult.embedUrl,
            source_link: window.location.href,
            category: 'Social Clip',
            platform: window.location.hostname,
            tags: ['#Media', '#Clipped']
          }
        }, (res) => {
          if (chrome.runtime.lastError || !res?.success) {
            reject(new Error(chrome.runtime.lastError?.message || res?.error || 'Save failed'));
          } else {
            resolve();
          }
        });
      });

      itemSaveMedia.innerHTML = `<span>✅</span><span style="flex: 1; color:#10b981;">Media Saved!</span>`;
      showToastMsg("Media saved to PromptMemory Vault!");
    } catch (err: any) {
      if (err.message === 'TIMEOUT_NO_MEDIA' || err.message?.includes('TIMEOUT')) {
        itemSaveMedia.innerHTML = `<span>🎬</span><span style="flex: 1;">Save Media</span>`;
        showToastMsg("No media found on this page.", true);
        return;
      }
      const errMsg = err.message || 'Save failed';
      itemSaveMedia.innerHTML = `<span>❌</span><span style="flex: 1; color:#ef4444; font-size:11px;">Error</span>`;
      showToastMsg(`Error: ${errMsg.slice(0, 35)}`, true);
    } finally {
      setTimeout(() => {
        itemSaveMedia.innerHTML = `<span>🎬</span><span style="flex: 1;">Save Media</span>`;
      }, 2500);
    }
  }, true);

  const itemSavePageText = createMenuItem('📄', 'Save Page Text', 'indigo', () => {
    itemSavePageText.innerHTML = `<span>⏳</span><span style="flex: 1;">Saving Text...</span>`;
    const selection = window.getSelection()?.toString() || document.body?.innerText?.slice(0, 5000) || '';
    
    chrome.runtime.sendMessage({
      action: 'SAVE_PROMPT',
      payload: {
        title: document.title || 'Page Text Capture',
        content: selection,
        source_link: window.location.href,
        category: 'Web Clip',
        platform: window.location.hostname,
        tags: ['#PageText', '#Highlight']
      }
    }, (res) => {
      if (chrome.runtime.lastError || !res?.success) {
        const errMsg = chrome.runtime.lastError?.message || res?.error || 'Save failed';
        itemSavePageText.innerHTML = `<span>❌</span><span style="flex: 1; color:#ef4444; font-size:11px;">Error</span>`;
        showToastMsg(`Error: ${errMsg.slice(0, 35)}`, true);
      } else {
        itemSavePageText.innerHTML = `<span>✅</span><span style="flex: 1; color:#10b981;">Text Saved!</span>`;
        showToastMsg("Page text saved to Vault!");
      }
      setTimeout(() => {
        itemSavePageText.innerHTML = `<span>📄</span><span style="flex: 1;">Save Page Text</span>`;
      }, 2500);
    });
  }, true);

  const itemSaveSelection = createMenuItem('✂️', 'Save Selection', 'purple', () => {
    const sel = window.getSelection()?.toString() || '';
    if (!sel.trim()) {
      showToastMsg("No text selected!", true);
      return;
    }
    itemSaveSelection.innerHTML = `<span>⏳</span><span style="flex: 1;">Saving...</span>`;
    chrome.runtime.sendMessage({
      action: 'SAVE_PROMPT',
      payload: {
        title: sel.slice(0, 40) + '...',
        content: sel,
        source_link: window.location.href,
        category: 'Highlight',
        platform: window.location.hostname,
        tags: ['#Highlight', '#Selected']
      }
    }, (res) => {
      if (chrome.runtime.lastError || !res?.success) {
        showToastMsg("Error saving selection", true);
      } else {
        itemSaveSelection.innerHTML = `<span>✅</span><span style="flex: 1; color:#10b981;">Saved!</span>`;
        showToastMsg("Selection saved to Vault!");
      }
      setTimeout(() => {
        itemSaveSelection.innerHTML = `<span>✂️</span><span style="flex: 1;">Save Selection</span>`;
      }, 2500);
    });
  }, true);

  function toggleMiniDashboardWindow() {
    const existing = document.getElementById('pm-mini-dashboard-window');
    if (existing) {
      existing.remove();
      return;
    }

    const win = document.createElement('div');
    win.id = 'pm-mini-dashboard-window';
    win.style.cssText = `
      position: fixed;
      bottom: 82px;
      right: 24px;
      width: 440px;
      height: 600px;
      background: #0b0f19;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.18);
      z-index: 2147483647;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const closeHeader = document.createElement('div');
    closeHeader.style.cssText = `
      padding: 10px 16px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      font-size: 13px;
      font-weight: 700;
      font-family: -apple-system, sans-serif;
    `;
    closeHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">✨</span>
        <span style="background: linear-gradient(to right, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">PromptMemory Mini-Dashboard</span>
      </div>
      <button id="pm-close-mini-win" style="background: rgba(255,255,255,0.1); border: none; color: #94a3b8; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s;">✕</button>
    `;
    win.appendChild(closeHeader);

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('popup.html');
    iframe.style.cssText = 'width: 100%; flex: 1; border: none; background: #0b0f19;';
    win.appendChild(iframe);

    document.body.appendChild(win);

    const closeBtn = document.getElementById('pm-close-mini-win');
    if (closeBtn) {
      closeBtn.onclick = () => win.remove();
      closeBtn.onmouseenter = () => { closeBtn.style.background = 'rgba(239, 68, 68, 0.3)'; closeBtn.style.color = '#fff'; };
      closeBtn.onmouseleave = () => { closeBtn.style.background = 'rgba(255,255,255,0.1)'; closeBtn.style.color = '#94a3b8'; };
    }

    const clickOutside = (e: MouseEvent) => {
      if (!win.contains(e.target as Node) && !container.contains(e.target as Node)) {
        win.remove();
        document.removeEventListener('mousedown', clickOutside);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', clickOutside), 100);
  }

  const itemOpenMiniDashboard = createMenuItem('✨', 'Open Mini-Dashboard', 'purple', () => {
    toggleMiniDashboardWindow();
  });

  const itemOpenVault = createMenuItem('💎', 'Open Full Vault', 'default', () => {
    window.open('https://prompt-memory-prompt-memory-1.vercel.app/clips', '_blank');
  });

  const headerEl = document.createElement('div');
  headerEl.style.cssText = 'padding: 6px 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 4px; display:flex; align-items:center; justify-content:space-between;';
  headerEl.innerHTML = `<span style="font-size: 11px; font-weight: 700; color: #a855f7; letter-spacing: 0.5px; text-transform: uppercase;">Quick Actions</span><span style="font-size: 10px; color: #71717a;">PromptMemory</span>`;

  popover.appendChild(headerEl);
  popover.appendChild(itemOpenMiniDashboard);
  popover.appendChild(createSeparator());
  popover.appendChild(itemSaveMedia);
  popover.appendChild(createSeparator());
  popover.appendChild(itemSavePageText);
  popover.appendChild(createSeparator());
  popover.appendChild(itemSaveSelection);
  popover.appendChild(createSeparator());
  popover.appendChild(itemOpenVault);
  container.appendChild(popover);

  let isPopoverOpen = false;

  const closePopover = () => {
    isPopoverOpen = false;
    popover.style.opacity = '0';
    popover.style.pointerEvents = 'none';
    popover.style.transform = 'translateY(10px) scale(0.95)';
  };

  const openPopover = () => {
    isPopoverOpen = true;
    popover.style.opacity = '1';
    popover.style.pointerEvents = 'auto';
    popover.style.transform = 'translateY(0) scale(1)';
  };

  document.addEventListener('mousedown', (e) => {
    if (isPopoverOpen && !container.contains(e.target as Node)) {
      closePopover();
    }
  });

  container.onmouseenter = () => {
    if (!isDragging && !isPopoverOpen) {
      container.style.transform = 'scale(1.1) rotate(5deg)';
      container.style.boxShadow = '0 6px 16px rgba(99,102,241,0.4)';
    }
  };
  
  container.onmouseleave = () => {
    if (!isDragging && !isPopoverOpen) {
      container.style.transform = 'scale(1) rotate(0deg)';
      container.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
    }
  };

  container.oncontextmenu = (e) => {
    e.preventDefault();
    if (isPopoverOpen) {
      closePopover();
    } else {
      openPopover();
    }
  };

  let isDragging = false;
  let hasDragged = false;
  let startX = 0, startY = 0;
  let initialRight = 24, initialBottom = 24;

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click drags
    isDragging = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    
    const style = window.getComputedStyle(container);
    initialRight = parseInt(style.right, 10);
    initialBottom = parseInt(style.bottom, 10);

    container.style.cursor = 'grabbing';
    container.style.transition = 'none'; 
    if (isPopoverOpen) closePopover();
    
    e.preventDefault(); 
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDragged = true;
    }

    if (hasDragged) {
      const newRight = initialRight - dx;
      const newBottom = initialBottom - dy;
      container.style.right = `${newRight}px`;
      container.style.bottom = `${newBottom}px`;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging && e.button === 0) {
      isDragging = false;
      container.style.cursor = 'grab';
      container.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease'; 
      
      if (!hasDragged) {
        container.style.transform = 'scale(0.9)';
        setTimeout(() => {
          container.style.transform = 'scale(1.1)';
        }, 100);
        
        toggleMiniDashboardWindow();
      }
    }
  });

  document.body.appendChild(container);
}

function initSelectionTooltip() {
  const selectionPill = document.createElement('div');
  selectionPill.id = 'pm-selection-pill';
  selectionPill.style.cssText = `
    position: absolute;
    z-index: 999998;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-family: system-ui, sans-serif;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(10px) scale(0.95);
  `;
  
  selectionPill.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    Save to PM
  `;

  document.body.appendChild(selectionPill);

  let activeText = '';

  document.addEventListener('mouseup', (e) => {
    if (selectionPill.contains(e.target as Node)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        activeText = text;
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          const top = rect.top + window.scrollY - 40;
          const left = rect.left + window.scrollX + (rect.width / 2) - 50;

          selectionPill.style.top = `${top}px`;
          selectionPill.style.left = `${left}px`;
          selectionPill.style.opacity = '1';
          selectionPill.style.pointerEvents = 'auto';
          selectionPill.style.transform = 'translateY(0) scale(1)';
        }
      } else {
        hidePill();
      }
    }, 10);
  });

  document.addEventListener('mousedown', (e) => {
    if (!selectionPill.contains(e.target as Node)) {
      hidePill();
    }
  });

  function hidePill() {
    selectionPill.style.opacity = '0';
    selectionPill.style.pointerEvents = 'none';
    selectionPill.style.transform = 'translateY(10px) scale(0.95)';
    activeText = '';
  }

  selectionPill.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeText) {
      const url = window.location.href;
      let platform = 'Unknown';
      if (url.includes('chatgpt.com')) platform = 'chatgpt';
      else if (url.includes('claude.ai')) platform = 'claude';
      else if (url.includes('gemini.google.com')) platform = 'gemini';

      selectionPill.innerHTML = `
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Saving...
      `;

      chrome.runtime.sendMessage({
        action: 'SAVE_PROMPT',
        payload: {
          platform,
          role: 'user', 
          content: activeText
        }
      }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          selectionPill.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Error
          `;
          selectionPill.style.background = '#ef4444'; 
        } else {
          selectionPill.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Saved!
          `;
          selectionPill.style.background = '#10b981'; 
        }

        setTimeout(() => {
          hidePill();
          setTimeout(() => {
            selectionPill.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save to PM
            `;
            selectionPill.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
          }, 200); 
        }, 1500);
      });
    }
  });
}

function autoSubmitPrompt(prompt: string, platform: string) {
  const maxAttempts = 40;
  let attempts = 0;

  const tryInject = () => {
    attempts++;
    let textarea: HTMLElement | null = null;
    let submitBtn: HTMLElement | null = null;

    if (platform === 'chatgpt') {
      textarea = document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]');
      submitBtn = document.querySelector('[data-testid="send-button"]');
    } else if (platform === 'claude') {
      textarea = document.querySelector('div[contenteditable="true"]');
      submitBtn = document.querySelector('button[aria-label="Send Message"]');
    } else if (platform === 'gemini') {
      textarea = document.querySelector('rich-textarea div[contenteditable="true"]');
      submitBtn = document.querySelector('.send-button');
    }

    if (textarea && submitBtn) {
      if (textarea.tagName === 'TEXTAREA') {
        (textarea as HTMLTextAreaElement).value = prompt;
      } else {
        textarea.innerText = prompt;
      }
      
      // Native React override mechanics
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      setTimeout(() => {
        submitBtn?.click();
      }, 500);
      return;
    }

    if (attempts < maxAttempts) {
      setTimeout(tryInject, 250);
    }
  };

  tryInject();
}

function monitorAndRenameTitle(expectedTitle: string, platform: string) {
  // Use a MutationObserver to aggressively enforce our chosen title in the sidebar
  // This visually overwrites whatever the LLM or auto-namer comes up with locally.
  const observer = new MutationObserver(() => {
    let targetEl: HTMLElement | null = null;
    
    if (platform === 'chatgpt') {
      const path = window.location.pathname; // /c/...
      if (path.length > 5) {
        const links = document.querySelectorAll(`a[href="${path}"]`);
        if (links.length > 0) {
          const titleDiv = links[0].querySelector('.relative.grow.overflow-hidden');
          targetEl = (titleDiv as HTMLElement) || (links[0] as HTMLElement);
        }
      }
    } else if (platform === 'claude') {
      const path = window.location.pathname; // /chat/...
      if (path.length > 6) {
        const links = document.querySelectorAll(`a[href="${path}"]`);
        if (links.length > 0) targetEl = links[0] as HTMLElement;
      }
    } else if (platform === 'gemini') {
      const activeItems = document.querySelectorAll('.recent-item.active, [aria-selected="true"]');
      if (activeItems.length > 0) targetEl = activeItems[0] as HTMLElement;
    }

    if (targetEl && targetEl.innerText !== expectedTitle && !targetEl.innerText.includes(expectedTitle)) {
      // Disconnect briefly to avoid infinite loops when changing innerText
      observer.disconnect();
      targetEl.innerText = expectedTitle;
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  
  // Clean up observer after 3 minutes just in case
  setTimeout(() => observer.disconnect(), 180000);
}

(function init() {
  if (document.body) {
    chrome.storage.local.get('pendingContinuationPrompt', (result) => {
      if (result.pendingContinuationPrompt) {
        const { platform, prompt, expectedTitle } = result.pendingContinuationPrompt as { platform: string, prompt: string, expectedTitle?: string };
        if (window.location.href.includes(platform)) {
          chrome.storage.local.remove('pendingContinuationPrompt');
          setTimeout(() => {
            autoSubmitPrompt(prompt, platform);
            if (expectedTitle) monitorAndRenameTitle(expectedTitle, platform);
          }, 1000);
        }
      }
    });

    injectFloatingLogo();
    initSelectionTooltip();

    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === 'SCRAPE_CHAT') {
        const text = scrapeCurrentChat();
        const tokens = Math.floor(text.length / 4);
        sendResponse({ success: true, data: { text, tokens, url: window.location.href, title: document.title } });
      } else if (request.action === 'EXECUTE_CONTINUATION') {
        const { text, title } = request.payload;
        chrome.storage.local.get(['continuation_stats', 'maxTrimSize'], (res) => {
          const stats = (res.continuation_stats || {}) as Record<string, number>;
          const trimSize = (res.maxTrimSize as number) || 12000;
          let baseTitle = title.replace(' - ChatGPT', '').replace(' - Claude', '').trim();
          if (!baseTitle || baseTitle === 'ChatGPT' || baseTitle === 'Claude') baseTitle = 'Continued Chat';
          const titleKey = baseTitle.substring(0, 20);
          let count = (stats[titleKey] || 0) + 1;
          stats[titleKey] = count;
          chrome.storage.local.set({ continuation_stats: stats }, () => {
            const expectedTitle = `${baseTitle} [Continuation ${count}]`;
            const systemPrefix = `CRITICAL INSTRUCTION: Please explicitly set the internal title of this new chat session to: "${expectedTitle}".\n\n`;
            const trimmedChat = text.length > trimSize ? "... [earlier context trimmed] ...\n" + text.slice(-trimSize) : text;
            const prompt = systemPrefix + "You are an expert AI continuing from a previous session. Below is the recent context from our last chat. Please read it and let me know you are ready to continue.\n\n### Scraped Chat History:\n" + trimmedChat;
            
            const url = window.location.href;
            let platform = 'Unknown';
            let redirectUrl = '';
            if (url.includes('chatgpt.com')) { platform = 'chatgpt'; redirectUrl = 'https://chatgpt.com/'; }
            else if (url.includes('claude.ai')) { platform = 'claude'; redirectUrl = 'https://claude.ai/new'; }
            else if (url.includes('gemini.google.com')) { platform = 'gemini'; redirectUrl = 'https://gemini.google.com/app'; }

            if (platform !== 'Unknown') {
              chrome.storage.local.set({ pendingContinuationPrompt: { platform, prompt, expectedTitle } }, () => {
                window.location.href = redirectUrl;
              });
            }
          });
        });
        sendResponse({ success: true });
      }
      return true;
    });

  } else {
    setTimeout(init, 100);
  }
})();
