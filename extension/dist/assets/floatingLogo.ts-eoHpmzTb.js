(function(){console.log(`PromptMemory: Floating Logo Injected`);function e(){let e=window.location.href,t=``;return e.includes(`chatgpt.com`)?document.querySelectorAll(`[data-message-author-role]`).forEach(e=>{let n=e.getAttribute(`data-message-author-role`)===`user`?`[USER]`:`[ASSISTANT]`;t+=`${n}: ${e.innerText.trim()}\n\n`}):e.includes(`claude.ai`)?document.querySelectorAll(`.font-user, .font-claude`).forEach(e=>{let n=e.classList.contains(`font-user`)?`[USER]`:`[ASSISTANT]`;t+=`${n}: ${e.innerText.trim()}\n\n`}):e.includes(`gemini.google.com`)&&document.querySelectorAll(`message-content`).forEach(e=>{t+=`[MESSAGE]: ${e.innerText.trim()}\n\n`}),t.trim()}function t(){if(document.getElementById(`pm-floating-logo`))return;let e=document.createElement(`div`);e.id=`pm-floating-logo`,e.style.cssText=`
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
  `,e.innerHTML=`
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
  `;function t(){let t=document.getElementById(`pm-mini-dashboard-window`);if(t){t.remove();return}let n=e&&e.style.right?parseInt(e.style.right,10):24,r=e&&e.style.bottom?parseInt(e.style.bottom,10):24,i=Math.min(window.innerHeight-440,Math.max(10,r+58)),a=Math.min(window.innerWidth-365,Math.max(10,n)),o=document.createElement(`div`);o.id=`pm-mini-dashboard-window`,o.style.cssText=`
      position: fixed !important;
      bottom: ${i}px !important;
      right: ${a}px !important;
      width: 360px !important;
      max-width: 360px !important;
      height: 440px !important;
      max-height: 440px !important;
      background: rgba(30, 30, 47, 0.92) !important;
      backdrop-filter: blur(24px) !important;
      -webkit-backdrop-filter: blur(24px) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 40px rgba(168, 85, 247, 0.15) !important;
      z-index: 2147483647;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;let s=document.createElement(`div`);s.style.cssText=`
      padding: 8px 14px;
      background: rgba(30, 30, 47, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      font-size: 12px;
      font-weight: 700;
      font-family: -apple-system, sans-serif;
      flex-shrink: 0;
    `,s.innerHTML=`
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 14px;">✨</span>
        <span style="background: linear-gradient(to right, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">PromptMemory Vault</span>
      </div>
      <button id="pm-close-mini-win" style="background: rgba(255,255,255,0.1); border: none; color: #94a3b8; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s;">✕</button>
    `,o.appendChild(s);let c=document.createElement(`iframe`);c.src=chrome.runtime.getURL(`popup.html`),c.style.cssText=`width: 100%; height: 100%; flex: 1; border: none; margin: 0; padding: 0; background: transparent; overflow: hidden; display: block;`,o.appendChild(c),document.body.appendChild(o);let l=document.getElementById(`pm-close-mini-win`);l&&(l.onclick=()=>o.remove(),l.onmouseenter=()=>{l.style.background=`rgba(239, 68, 68, 0.3)`,l.style.color=`#fff`},l.onmouseleave=()=>{l.style.background=`rgba(255,255,255,0.1)`,l.style.color=`#94a3b8`});let u=t=>{!o.contains(t.target)&&(!e||!e.contains(t.target))&&(o.remove(),document.removeEventListener(`mousedown`,u))};setTimeout(()=>document.addEventListener(`mousedown`,u),100)}e.onmouseenter=()=>{n||(e.style.transform=`scale(1.1) rotate(5deg)`,e.style.boxShadow=`0 6px 16px rgba(168,85,247,0.5)`)},e.onmouseleave=()=>{n||(e.style.transform=`scale(1) rotate(0deg)`,e.style.boxShadow=`0 4px 12px rgba(99,102,241,0.3)`)},e.oncontextmenu=e=>{e.preventDefault(),t()};let n=!1,r=!1,i=0,a=0,o=24,s=24;e.addEventListener(`mousedown`,t=>{if(t.button!==0)return;n=!0,r=!1,i=t.clientX,a=t.clientY;let c=window.getComputedStyle(e);o=parseInt(c.right,10),s=parseInt(c.bottom,10),e.style.cursor=`grabbing`,e.style.transition=`none`,t.preventDefault()}),document.addEventListener(`mousemove`,t=>{if(!n)return;let c=t.clientX-i,l=t.clientY-a;if((Math.abs(c)>3||Math.abs(l)>3)&&(r=!0),r){let t=o-c,n=s-l;e.style.right=`${t}px`,e.style.bottom=`${n}px`;let r=document.getElementById(`pm-mini-dashboard-window`);if(r){let e=Math.min(window.innerHeight-440,Math.max(10,n+58)),i=Math.min(window.innerWidth-365,Math.max(10,t));r.style.setProperty(`bottom`,`${e}px`,`important`),r.style.setProperty(`right`,`${i}px`,`important`)}}}),document.addEventListener(`mouseup`,i=>{n&&i.button===0&&(n=!1,e.style.cursor=`grab`,e.style.transition=`transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease`,r||(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=`scale(1.1)`},100),t()))}),document.body.appendChild(e)}function n(){let e=document.createElement(`div`);e.id=`pm-selection-pill`,e.style.cssText=`
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
  `,e.innerHTML=`
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
    Save to PM
  `,document.body.appendChild(e);let t=``;document.addEventListener(`mouseup`,r=>{e.contains(r.target)||setTimeout(()=>{let r=window.getSelection(),i=r?.toString().trim();if(i&&i.length>0){t=i;let n=(r?.getRangeAt(0))?.getBoundingClientRect();if(n){let t=n.top+window.scrollY-40,r=n.left+window.scrollX+n.width/2-50;e.style.top=`${t}px`,e.style.left=`${r}px`,e.style.opacity=`1`,e.style.pointerEvents=`auto`,e.style.transform=`translateY(0) scale(1)`}}else n()},10)}),document.addEventListener(`mousedown`,t=>{e.contains(t.target)||n()});function n(){e.style.opacity=`0`,e.style.pointerEvents=`none`,e.style.transform=`translateY(10px) scale(0.95)`,t=``}e.addEventListener(`click`,r=>{if(r.stopPropagation(),t){let r=window.location.href,i=`Unknown`;r.includes(`chatgpt.com`)?i=`chatgpt`:r.includes(`claude.ai`)?i=`claude`:r.includes(`gemini.google.com`)&&(i=`gemini`),e.innerHTML=`
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Saving...
      `,chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:i,role:`user`,content:t}},t=>{chrome.runtime.lastError||!t||!t.success?(e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Error
          `,e.style.background=`#ef4444`):(e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Saved!
          `,e.style.background=`#10b981`),setTimeout(()=>{n(),setTimeout(()=>{e.innerHTML=`
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save to PM
            `,e.style.background=`linear-gradient(135deg, #6366f1, #8b5cf6)`},200)},1500)})}})}function r(e,t){let n=0,r=()=>{n++;let i=null,a=null;if(t===`chatgpt`?(i=document.querySelector(`#prompt-textarea`)||document.querySelector(`[contenteditable="true"]`),a=document.querySelector(`[data-testid="send-button"]`)):t===`claude`?(i=document.querySelector(`div[contenteditable="true"]`),a=document.querySelector(`button[aria-label="Send Message"]`)):t===`gemini`&&(i=document.querySelector(`rich-textarea div[contenteditable="true"]`),a=document.querySelector(`.send-button`)),i&&a){i.tagName===`TEXTAREA`?i.value=e:i.innerText=e,i.dispatchEvent(new Event(`input`,{bubbles:!0})),i.dispatchEvent(new Event(`change`,{bubbles:!0})),setTimeout(()=>{a?.click()},500);return}n<40&&setTimeout(r,250)};r()}function i(e,t){let n=new MutationObserver(()=>{let r=null;if(t===`chatgpt`){let e=window.location.pathname;if(e.length>5){let t=document.querySelectorAll(`a[href="${e}"]`);t.length>0&&(r=t[0].querySelector(`.relative.grow.overflow-hidden`)||t[0])}}else if(t===`claude`){let e=window.location.pathname;if(e.length>6){let t=document.querySelectorAll(`a[href="${e}"]`);t.length>0&&(r=t[0])}}else if(t===`gemini`){let e=document.querySelectorAll(`.recent-item.active, [aria-selected="true"]`);e.length>0&&(r=e[0])}r&&r.innerText!==e&&!r.innerText.includes(e)&&(n.disconnect(),r.innerText=e,n.observe(document.body,{childList:!0,subtree:!0,characterData:!0}))});n.observe(document.body,{childList:!0,subtree:!0,characterData:!0}),setTimeout(()=>n.disconnect(),18e4)}(function a(){document.body?(chrome.storage.local.get(`pendingContinuationPrompt`,e=>{if(e.pendingContinuationPrompt){let{platform:t,prompt:n,expectedTitle:a}=e.pendingContinuationPrompt;window.location.href.includes(t)&&(chrome.storage.local.remove(`pendingContinuationPrompt`),setTimeout(()=>{r(n,t),a&&i(a,t)},1e3))}}),t(),n(),chrome.runtime.onMessage.addListener((t,n,r)=>{if(t.action===`SCRAPE_CHAT`){let t=e();r({success:!0,data:{text:t,tokens:Math.floor(t.length/4),url:window.location.href,title:document.title}})}else if(t.action===`EXECUTE_CONTINUATION`){let{text:e,title:n}=t.payload;chrome.storage.local.get([`continuation_stats`,`maxTrimSize`],t=>{let r=t.continuation_stats||{},i=t.maxTrimSize||12e3,a=n.replace(` - ChatGPT`,``).replace(` - Claude`,``).trim();(!a||a===`ChatGPT`||a===`Claude`)&&(a=`Continued Chat`);let o=a.substring(0,20),s=(r[o]||0)+1;r[o]=s,chrome.storage.local.set({continuation_stats:r},()=>{let t=`${a} [Continuation ${s}]`,n=`CRITICAL INSTRUCTION: Please explicitly set the internal title of this new chat session to: "${t}".\n\n`,r=e.length>i?`... [earlier context trimmed] ...
`+e.slice(-i):e,o=n+`You are an expert AI continuing from a previous session. Below is the recent context from our last chat. Please read it and let me know you are ready to continue.

### Scraped Chat History:
`+r,c=window.location.href,l=`Unknown`,u=``;c.includes(`chatgpt.com`)?(l=`chatgpt`,u=`https://chatgpt.com/`):c.includes(`claude.ai`)?(l=`claude`,u=`https://claude.ai/new`):c.includes(`gemini.google.com`)&&(l=`gemini`,u=`https://gemini.google.com/app`),l!==`Unknown`&&chrome.storage.local.set({pendingContinuationPrompt:{platform:l,prompt:o,expectedTitle:t}},()=>{window.location.href=u})})}),r({success:!0})}return!0})):setTimeout(a,100)})();})()