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
  `;let t=document.createElement(`div`);t.style.cssText=`
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
  `;let n=(e,t,n,r,i=!1)=>{let a=document.createElement(`div`);return a.style.cssText=`
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
    `,a.onmouseenter=()=>{n===`purple`?(a.style.background=`rgba(168, 85, 247, 0.18)`,a.style.borderColor=`rgba(168, 85, 247, 0.35)`,a.style.boxShadow=`0 0 20px rgba(168, 85, 247, 0.25)`,a.style.color=`#f3e8ff`):n===`indigo`?(a.style.background=`rgba(99, 102, 241, 0.18)`,a.style.borderColor=`rgba(99, 102, 241, 0.35)`,a.style.boxShadow=`0 0 20px rgba(99, 102, 241, 0.25)`,a.style.color=`#e0e7ff`):(a.style.background=`rgba(255, 255, 255, 0.1)`,a.style.borderColor=`rgba(255, 255, 255, 0.15)`,a.style.boxShadow=`0 4px 12px rgba(0, 0, 0, 0.25)`,a.style.color=`#ffffff`)},a.onmouseleave=()=>{a.style.background=`transparent`,a.style.borderColor=`transparent`,a.style.boxShadow=`none`,a.style.color=`#e4e4e7`,a.style.transform=`scale(1)`},a.onmousedown=e=>{e.stopPropagation(),a.style.transform=`scale(0.98)`},a.onmouseup=()=>{a.style.transform=`scale(1)`},a.onclick=e=>{e.stopPropagation(),r(),i||d()},a.innerHTML=`<span>${e}</span><span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t}</span>`,a},r=()=>{let e=document.createElement(`div`);return e.style.cssText=`height: 1px; background: rgba(255, 255, 255, 0.08); margin: 2px 0;`,e},i=(e,t=!1)=>{let n=document.createElement(`div`);n.style.cssText=`position: fixed; bottom: 24px; right: 24px; background: ${t?`rgba(239, 68, 68, 0.95)`:`rgba(16, 185, 129, 0.95)`}; color: white; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 2147483647; box-shadow: 0 10px 25px rgba(0,0,0,0.4); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s; font-family: -apple-system, sans-serif;`,n.innerHTML=`<span>${t?`❌`:`✅`}</span><span style="margin-left: 8px;">${e}</span>`,document.body.appendChild(n),setTimeout(()=>n.remove(),3500)},a=n(`🎬`,`Save Media`,`purple`,async()=>{a.innerHTML=`<span>⏳</span><span style="flex: 1;">Extracting Media...</span>`;try{let e=await Promise.race([new Promise(e=>{let t=window.location.href,n=null;if(document.querySelector(`video`)?t=document.querySelector(`video`)?.src||window.location.href:document.querySelector(`img[src*="instagram"], img[src*="ytimg"]`)&&(n=document.querySelector(`img[src*="instagram"], img[src*="ytimg"]`)?.src||null),!n&&t===window.location.href){let e=document.querySelector(`meta[property="og:image"], meta[name="og:image"]`)?.getAttribute(`content`);e&&!e.startsWith(`data:`)&&(n=e)}n||t&&t!==window.location.href?e({embedUrl:t,imageUrl:n}):setTimeout(()=>{let t=document.querySelector(`img`);t&&t.src&&!t.src.startsWith(`data:`)&&(t.naturalWidth||0)>100?e({embedUrl:window.location.href,imageUrl:t.src}):e({embedUrl:window.location.href,imageUrl:null})},500)}),new Promise((e,t)=>setTimeout(()=>t(Error(`TIMEOUT_NO_MEDIA`)),3e3))]);if(!e.imageUrl&&e.embedUrl===window.location.href)throw Error(`TIMEOUT_NO_MEDIA`);await new Promise((t,n)=>{chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{title:`Captured Media: ${document.title.slice(0,30)}`,content:`Media captured from ${window.location.href}`,image_url:e.imageUrl,embed_url:e.embedUrl,source_link:window.location.href,category:`Social Clip`,platform:window.location.hostname,tags:[`#Media`,`#Clipped`]}},e=>{chrome.runtime.lastError||!e?.success?n(Error(chrome.runtime.lastError?.message||e?.error||`Save failed`)):t()})}),a.innerHTML=`<span>✅</span><span style="flex: 1; color:#10b981;">Media Saved!</span>`,i(`Media saved to PromptMemory Vault!`)}catch(e){if(e.message===`TIMEOUT_NO_MEDIA`||e.message?.includes(`TIMEOUT`)){a.innerHTML=`<span>🎬</span><span style="flex: 1;">Save Media</span>`,i(`No media found on this page.`,!0);return}let t=e.message||`Save failed`;a.innerHTML=`<span>❌</span><span style="flex: 1; color:#ef4444; font-size:11px;">Error</span>`,i(`Error: ${t.slice(0,35)}`,!0)}finally{setTimeout(()=>{a.innerHTML=`<span>🎬</span><span style="flex: 1;">Save Media</span>`},2500)}},!0),o=n(`📄`,`Save Page Text`,`indigo`,()=>{o.innerHTML=`<span>⏳</span><span style="flex: 1;">Saving Text...</span>`;let e=window.getSelection()?.toString()||document.body?.innerText?.slice(0,5e3)||``;chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{title:document.title||`Page Text Capture`,content:e,source_link:window.location.href,category:`Web Clip`,platform:window.location.hostname,tags:[`#PageText`,`#Highlight`]}},e=>{if(chrome.runtime.lastError||!e?.success){let t=chrome.runtime.lastError?.message||e?.error||`Save failed`;o.innerHTML=`<span>❌</span><span style="flex: 1; color:#ef4444; font-size:11px;">Error</span>`,i(`Error: ${t.slice(0,35)}`,!0)}else o.innerHTML=`<span>✅</span><span style="flex: 1; color:#10b981;">Text Saved!</span>`,i(`Page text saved to Vault!`);setTimeout(()=>{o.innerHTML=`<span>📄</span><span style="flex: 1;">Save Page Text</span>`},2500)})},!0),s=n(`✂️`,`Save Selection`,`purple`,()=>{let e=window.getSelection()?.toString()||``;if(!e.trim()){i(`No text selected!`,!0);return}s.innerHTML=`<span>⏳</span><span style="flex: 1;">Saving...</span>`,chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{title:e.slice(0,40)+`...`,content:e,source_link:window.location.href,category:`Highlight`,platform:window.location.hostname,tags:[`#Highlight`,`#Selected`]}},e=>{chrome.runtime.lastError||!e?.success?i(`Error saving selection`,!0):(s.innerHTML=`<span>✅</span><span style="flex: 1; color:#10b981;">Saved!</span>`,i(`Selection saved to Vault!`)),setTimeout(()=>{s.innerHTML=`<span>✂️</span><span style="flex: 1;">Save Selection</span>`},2500)})},!0),c=n(`💎`,`Open Vault`,`default`,()=>{window.open(`https://prompt-memory.vercel.app/clips`,`_blank`)}),l=document.createElement(`div`);l.style.cssText=`padding: 6px 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 4px; display:flex; align-items:center; justify-content:space-between;`,l.innerHTML=`<span style="font-size: 11px; font-weight: 700; color: #a855f7; letter-spacing: 0.5px; text-transform: uppercase;">Quick Actions</span><span style="font-size: 10px; color: #71717a;">PromptMemory</span>`,t.appendChild(l),t.appendChild(a),t.appendChild(r()),t.appendChild(o),t.appendChild(r()),t.appendChild(s),t.appendChild(r()),t.appendChild(c),e.appendChild(t);let u=!1,d=()=>{u=!1,t.style.opacity=`0`,t.style.pointerEvents=`none`,t.style.transform=`translateY(10px) scale(0.95)`},f=()=>{u=!0,t.style.opacity=`1`,t.style.pointerEvents=`auto`,t.style.transform=`translateY(0) scale(1)`};document.addEventListener(`mousedown`,t=>{u&&!e.contains(t.target)&&d()}),e.onmouseenter=()=>{!p&&!u&&(e.style.transform=`scale(1.1) rotate(5deg)`,e.style.boxShadow=`0 6px 16px rgba(99,102,241,0.4)`)},e.onmouseleave=()=>{!p&&!u&&(e.style.transform=`scale(1) rotate(0deg)`,e.style.boxShadow=`0 4px 12px rgba(99,102,241,0.3)`)};let p=!1,m=!1,h=0,g=0,_=24,v=24;e.addEventListener(`mousedown`,t=>{p=!0,m=!1,h=t.clientX,g=t.clientY;let n=window.getComputedStyle(e);_=parseInt(n.right,10),v=parseInt(n.bottom,10),e.style.cursor=`grabbing`,e.style.transition=`none`,u&&d(),t.preventDefault()}),document.addEventListener(`mousemove`,t=>{if(!p)return;let n=t.clientX-h,r=t.clientY-g;if((Math.abs(n)>3||Math.abs(r)>3)&&(m=!0),m){let t=_-n,i=v-r;e.style.right=`${t}px`,e.style.bottom=`${i}px`}}),document.addEventListener(`mouseup`,()=>{p&&(p=!1,e.style.cursor=`grab`,e.style.transition=`transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease`,m||(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=`scale(1.1)`},100),u?d():f()))}),document.body.appendChild(e)}function n(){let e=document.createElement(`div`);e.id=`pm-selection-pill`,e.style.cssText=`
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