(function(){console.log(`PromptMemory: Universal Social Web Clipper (SPA-Aware Media Hub) loaded.`);var e=document.createElement(`style`);e.textContent=`
  .pm-social-clip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(24, 24, 27, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 9999px;
    color: #f4f4f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10000;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    line-height: 1;
    text-decoration: none;
    user-select: none;
    white-space: nowrap;
    margin-left: 6px;
    margin-right: 6px;
  }
  .pm-social-clip-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  .pm-social-clip-btn:active {
    transform: translateY(0) scale(0.98);
  }

  /* 💼 LinkedIn Native Matching */
  .pm-social-clip-btn.pm-btn-linkedin {
    background: transparent;
    color: #0a66c2;
    border: 1.5px solid #0a66c2;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 14px;
    box-shadow: none;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .pm-social-clip-btn.pm-btn-linkedin:hover {
    background: rgba(10, 102, 194, 0.08);
    border-color: #004182;
    color: #004182;
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-linkedin {
      color: #70b5f9;
      border-color: #70b5f9;
    }
    .pm-social-clip-btn.pm-btn-linkedin:hover {
      background: rgba(112, 181, 249, 0.1);
      border-color: #93c5fd;
      color: #93c5fd;
    }
  }

  /* 🐦 X / Twitter Native Matching */
  .pm-social-clip-btn.pm-btn-twitter {
    background: transparent;
    color: #0f1419;
    border: 1px solid rgba(15, 20, 25, 0.3);
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    box-shadow: none;
    font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-twitter {
      color: rgb(239, 243, 244);
      border-color: rgba(239, 243, 244, 0.3);
    }
  }
  .pm-social-clip-btn.pm-btn-twitter:hover {
    background: rgba(15, 20, 25, 0.1);
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-twitter:hover {
      background: rgba(239, 243, 244, 0.1);
      border-color: rgb(239, 243, 244);
    }
  }

  /* 📸 Instagram Native Matching (Strict Icon-Only Sibling) */
  .pm-social-clip-btn.pm-btn-instagram {
    background: transparent !important;
    color: inherit !important;
    border: none !important;
    border-radius: 50% !important;
    padding: 8px !important;
    margin: 0 !important;
    box-shadow: none !important;
    width: 40px !important;
    height: 40px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    backdrop-filter: none !important;
  }
  .pm-social-clip-btn.pm-btn-instagram:hover {
    opacity: 0.7;
    background: transparent !important;
    transform: scale(1.08);
    box-shadow: none !important;
  }
  .pm-social-clip-btn.pm-btn-instagram:active {
    transform: scale(0.95);
  }
  .pm-social-clip-btn.pm-btn-instagram svg.pm-ig-icon {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    fill: none;
  }

  /* 📱 YouTube Shorts Native Matching */
  .pm-social-clip-btn.pm-shorts-btn {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    background: var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1)) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-top: 16px !important;
    cursor: pointer !important;
    border: none !important;
    padding: 0 !important;
    color: #fff !important;
    transition: background 0.2s, transform 0.2s !important;
  }
  .pm-social-clip-btn.pm-shorts-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    transform: scale(1.05);
  }
  .pm-social-clip-btn.pm-shorts-btn svg {
    width: 24px !important;
    height: 24px !important;
    stroke: currentColor;
    fill: none;
  }
  .pm-social-clip-btn.pm-btn-instagram.pm-ig-reel {
    margin: 8px 0 !important;
    display: flex !important;
  }

  /* 📺 YouTube Watch & Shorts Native Matching */
  .pm-social-clip-btn.pm-btn-youtube {
    background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.05));
    color: var(--yt-spec-text-primary, #0f0f0f);
    border: none;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 500;
    height: 36px;
    padding: 0 16px;
    box-shadow: none;
    font-family: "Roboto", "Arial", sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-left: 8px;
    cursor: pointer;
  }
  html[dark] .pm-social-clip-btn.pm-btn-youtube,
  [dark] .pm-social-clip-btn.pm-btn-youtube,
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-youtube {
      background: var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1));
      color: var(--yt-spec-text-primary, #f1f1f1);
    }
  }
  .pm-social-clip-btn.pm-btn-youtube:hover {
    background: var(--yt-spec-button-chip-background-hover, rgba(0, 0, 0, 0.1));
  }
  html[dark] .pm-social-clip-btn.pm-btn-youtube:hover,
  [dark] .pm-social-clip-btn.pm-btn-youtube:hover {
    background: var(--yt-spec-button-chip-background-hover, rgba(255, 255, 255, 0.2));
  }

  /* Status Overrides */
  .pm-social-clip-btn.pm-saving {
    background: rgba(99, 102, 241, 0.9) !important;
    border-color: #6366f1 !important;
    color: #fff !important;
    cursor: wait !important;
  }
  .pm-social-clip-btn.pm-btn-instagram.pm-saving {
    background: transparent !important;
    color: #6366f1 !important;
  }
  .pm-social-clip-btn.pm-saved {
    background: rgba(16, 185, 129, 0.95) !important;
    border-color: #10b981 !important;
    color: #fff !important;
  }
  .pm-social-clip-btn.pm-btn-instagram.pm-saved {
    background: transparent !important;
    color: #10b981 !important;
  }
  .pm-social-clip-btn.pm-error {
    background: rgba(239, 68, 68, 0.95) !important;
    border-color: #ef4444 !important;
    color: #fff !important;
  }
  .pm-social-clip-btn.pm-btn-instagram.pm-error {
    background: transparent !important;
    color: #ef4444 !important;
  }
  .pm-clipper-wrapper {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    z-index: 10000;
  }
`,document.head.appendChild(e);function t(){let e=window.location.hostname.toLowerCase();return e.includes(`linkedin`)?`linkedin`:e.includes(`twitter`)||e.includes(`x.com`)?`twitter`:e.includes(`instagram`)?`instagram`:e.includes(`youtube`)?`youtube`:`web`}function n(e){switch(e){case`youtube`:return[`#top-level-buttons-computed`];case`instagram`:return[];case`twitter`:return[`article[data-testid="tweet"] [role="group"]`,`[data-testid="tweet"] [role="group"]`];case`linkedin`:return[`.feed-shared-social-action-bar`,`.feed-shared-update-v2__action-bar`,`.social-details-social-activity`];default:return[`article`]}}function r(e,t){let n=document.getElementById(`pm-clipper-toast-container`);n||(n=document.createElement(`div`),n.id=`pm-clipper-toast-container`,n.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `,document.body.appendChild(n));let r=document.createElement(`div`),i={info:`rgba(99, 102, 241, 0.95)`,success:`rgba(16, 185, 129, 0.95)`,error:`rgba(239, 68, 68, 0.95)`},a={info:`⏳`,success:`✅`,error:`❌`};return r.style.cssText=`
    background: ${i[t]};
    color: white;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
  `,r.innerHTML=`<span style="font-size: 16px;">${a[t]}</span><span>${e}</span>`,n.appendChild(r),requestAnimationFrame(()=>{r.style.transform=`translateY(0)`,r.style.opacity=`1`}),setTimeout(()=>{r.style.transform=`translateY(10px)`,r.style.opacity=`0`,setTimeout(()=>r.remove(),300)},t===`info`?1500:3500),r}function i(e,t){try{let n=``,r=null,i=null,a=window.location.href,o=a,s=[`#Media`];if(t===`youtube`){s.push(`#YouTube`,`#Video`);let t=null;if(t=new URLSearchParams(window.location.search).get(`v`),!t&&a.includes(`/shorts/`)){s.push(`#Short`,`#Vertical`);let e=a.match(/\/shorts\/([a-zA-Z0-9_-]+)/);e&&(t=e[1])}if(!t){let n=e.querySelector(`a[href*="watch?v="], a[href*="/shorts/"]`);if(n){let e=n.getAttribute(`href`)||``,r=e.match(/watch\?v=([a-zA-Z0-9_-]+)/),i=e.match(/\/shorts\/([a-zA-Z0-9_-]+)/);r?t=r[1]:i&&(t=i[1],s.push(`#Short`,`#Vertical`))}}t&&(i=`https://www.youtube.com/embed/${t}`,r=`https://img.youtube.com/vi/${t}/maxresdefault.jpg`,o=a.includes(`watch?v=`)||a.includes(`/shorts/`)?a:`https://www.youtube.com/watch?v=${t}`);let c=document.querySelector(`h1.ytd-watch-metadata, h1.title, ytd-video-primary-info-renderer h1`);return c&&c.textContent?.trim()?n=c.textContent.trim():document.title&&(n=document.title.replace(` - YouTube`,``).trim()),n||=`YouTube Video (${t||`Clip`})`,{text:n,imageUrl:r,embedUrl:i,sourceLink:o,tags:Array.from(new Set(s))}}if(t===`instagram`){s.push(`#Instagram`,`#Social`);try{let t=null;if(a.includes(`/p/`)||a.includes(`/reel/`)||a.includes(`/reels/`)){a.includes(`/reel`)?s.push(`#Reel`,`#Video`):s.push(`#Post`,`#Photo`);let e=a.match(/\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);e&&(t=e[1])}else{let n=e.querySelector(`a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]`);if(n){let e=n.getAttribute(`href`)||``;e.includes(`/reel`)?s.push(`#Reel`,`#Video`):s.push(`#Post`,`#Photo`);let r=e.match(/\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);r&&(t=r[1],o=`https://www.instagram.com${e.startsWith(`/`)?e:`/`+e}`)}}t?(i=`https://www.instagram.com/p/${t}/embed/`,o.includes(t)||(o=`https://www.instagram.com/p/${t}/`)):o=window.location.href;let c=e.querySelector(`video`);if(c&&(c.poster?r=c.poster:c.src&&!c.src.startsWith(`blob:`)&&(r=c.src),s.push(`#Video`)),!r){let t=Array.from(e.querySelectorAll(`img`)),n=-1;for(let e of t){let t=e.src||e.getAttribute(`data-src`)||e.getAttribute(`srcset`)?.split(` `)[0]||``;if(!t||t.startsWith(`data:`)||t.includes(`profile`)||t.includes(`avatar`)||t.includes(`icon`)||t.includes(`logo`))continue;let i=e.getBoundingClientRect(),a=(e.naturalWidth||i.width||0)*(e.naturalHeight||i.height||0);a>n&&a>1e3?(n=a,r=t):!r&&!t.includes(`emoji`)&&(r=t)}}if(!r){let e=document.querySelector(`meta[property="og:image"], meta[name="og:image"]`)?.getAttribute(`content`);e&&!e.startsWith(`data:`)&&(r=e)}(!o||o===`about:blank`||!o.startsWith(`http`))&&(o=window.location.href);let l=e.querySelector(`h1, span._aacl, div._a9zs, ul._a9z6 span, article span, article h1`);n=l&&l.textContent?.trim()?l.textContent.trim():document.querySelector(`meta[property="og:title"], meta[name="og:title"]`)?.getAttribute(`content`)||`Instagram Media (${t||`Clip`})`}catch(e){console.warn(`PromptMemory: IG extraction error caught, falling back to safe DOM/meta attributes:`,e),r=document.querySelector(`meta[property="og:image"], meta[name="og:image"]`)?.getAttribute(`content`)||null,o=window.location.href,n=document.title||`Instagram Media Clip`}return r&&!s.includes(`#Image`)&&!s.includes(`#Video`)&&!s.includes(`#Reel`)&&s.push(`#Image`),{text:n||`Instagram Media Clip`,imageUrl:r,embedUrl:i,sourceLink:o,tags:Array.from(new Set(s))}}let c=e.cloneNode(!0),l=c.querySelector(`.pm-clipper-wrapper, .pm-social-clip-btn`);l&&l.remove();let u=-1e4,d=Array.from(c.querySelectorAll(`p, span, h1, h2, h3, h4, div, blockquote, section`));for(let e of d){let t=e.innerText?.trim()||``;if(t.length<10||/^(like|comment|share|reply|follow|send|save|repost|view all|more|less|verified|promote|subscribe)$/i.test(t))continue;let r=e.querySelectorAll(`button, input, select, [role="button"], [role="menuitem"], nav, ul, ol`).length,i=t.length;[`P`,`SPAN`,`H1`,`H2`,`H3`,`BLOCKQUOTE`].includes(e.tagName)&&(i+=300),i-=r*200,i>u&&i<8e3&&(u=i,n=t)}if(n||=c.innerText?.trim()||``,n=n.replace(/\s+/g,` `).trim(),n.length>1500&&(n=n.substring(0,1500)+`...`),n||=`Saved media from ${t.toUpperCase()}`,t===`twitter`){s.push(`#Twitter`,`#X`,`#Post`,`#Social`);let t=null;if(a.includes(`/status/`)){let e=a.match(/\/status\/([0-9]+)/);e&&(t=e[1])}else{let n=e.querySelector(`a[href*="/status/"]`);if(n){let e=n.getAttribute(`href`)||``,r=e.match(/\/status\/([0-9]+)/);r&&(t=r[1],o=`https://x.com${e.startsWith(`/`)?e:`/`+e}`)}}t&&(i=`https://platform.twitter.com/embed/Tweet.html?id=${t}`,o.includes(t)||(o=`https://x.com/i/status/${t}`))}else if(t===`linkedin`){s.push(`#LinkedIn`,`#Professional`,`#Post`);let t=e.querySelector(`a[href*="/posts/"], a[href*="/activity/"]`);if(t){let e=t.getAttribute(`href`)||``;o=e.startsWith(`http`)?e:`https://www.linkedin.com${e.startsWith(`/`)?e:`/`+e}`}}if(!r){let t=Array.from(e.querySelectorAll(`img`)),n=-1;for(let e of t){let t=e.src||e.getAttribute(`data-src`)||e.getAttribute(`srcset`)?.split(` `)[0]||``;if(!t||t.startsWith(`data:`)||t.includes(`emoji`)||t.includes(`profile`)||t.includes(`avatar`)||t.includes(`icon`)||t.includes(`logo`))continue;let i=e.getBoundingClientRect(),a=e.naturalWidth||e.width||i.width||0,o=e.naturalHeight||e.height||i.height||0,s=a*o;s>n&&(a>=100||o>=100||s===0)?(n=s,r=t):r||=t}}if(!r){let t=e.querySelector(`video`);t&&t.poster&&(r=t.poster,s.push(`#Video`))}if(!r){let e=document.querySelector(`meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"], meta[name="twitter:image"]`)?.getAttribute(`content`);e&&!e.startsWith(`data:`)&&(r=e)}return r&&!s.includes(`#Image`)&&!s.includes(`#Video`)&&!s.includes(`#Reel`)&&s.push(`#Image`),{text:n,imageUrl:r,embedUrl:i,sourceLink:o,tags:Array.from(new Set(s))}}catch(e){console.warn(`PromptMemory: Universal extraction error caught, returning safe meta fallback:`,e);let n=document.querySelector(`meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"]`)?.getAttribute(`content`)||null;return{text:document.title||`Saved media from ${t.toUpperCase()}`,imageUrl:n,embedUrl:null,sourceLink:window.location.href,tags:[`#Media`,`#${t.charAt(0).toUpperCase()+t.slice(1)}`,`#Clip`]}}}var a=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,o=`<svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pm-ig-icon"><path d="M8 22V12C8 10.3431 9.34315 9 11 9C12.6569 9 14 10.3431 14 12V18L16 15L18 18V12C18 10.3431 19.3431 9 21 9C22.6569 9 24 10.3431 24 12V22"></path><circle cx="16" cy="11" r="2.5" fill="currentColor"></circle></svg>`;function s(e,t,n=500,r=20){let i=0,a=setInterval(()=>{i++;let n=document.querySelector(e);n?(clearInterval(a),t(n)):i>=r&&(clearInterval(a),console.log(`PromptMemory: pollForElement gave up after ${r} attempts for: ${e.substring(0,80)}`))},n)}function c(){let e=t();if(e===`youtube`&&!window.location.pathname.includes(`/shorts/`)&&document.getElementById(`pm-save-btn`))return;if(e===`instagram`){if(document.querySelector(`.pm-btn-instagram`))return;s(`svg[aria-label="Save"], svg[aria-label="Remove"], svg[aria-label*="Save" i], svg[aria-label*="Bookmark" i]`,t=>{document.querySelectorAll(`svg[aria-label="Save"], svg[aria-label="Remove"], svg[aria-label*="Save" i], svg[aria-label*="Bookmark" i], [role="button"] svg[aria-label*="Save" i], [role="button"] svg[aria-label*="Bookmark" i]`).forEach(t=>{let n=t.closest(`article`)||t.closest(`[role="article"]`),a=t.closest(`div[role="dialog"], div[role="presentation"]`);if(!n&&!a&&!window.location.pathname.includes(`/reel/`))return;let s=t.closest(`section`);if(!s||s.querySelector(`.pm-btn-instagram`))return;let c=null;for(let e of Array.from(s.children))if(!e.contains(t)){c=e;break}if(!c){let e=t.closest(`button`)||t.closest(`[role="button"]`)||t.parentElement?.parentElement||t.parentElement;e&&e.parentElement&&(c=e.parentElement)}if(!c)return;let l=document.createElement(`button`);l.className=`pm-social-clip-btn pm-btn-instagram`,l.title=`Save to PromptMemory Vault`,l.innerHTML=o,l.addEventListener(`click`,async t=>{if(t.stopPropagation(),t.preventDefault(),l.classList.contains(`pm-saving`))return;l.classList.add(`pm-saving`),l.innerHTML=`<span style="font-size: 16px;">⏳</span>`;let n=r(`Saving Playable Media to PromptMemory...`,`info`);try{let{text:t,imageUrl:a,embedUrl:c,sourceLink:u,tags:d}=i(s.closest(`article`)||s.closest(`[role="article"]`)||s.closest(`div[role="dialog"], div[role="presentation"]`)||s.closest(`section`)||document.body,e),f=await Promise.race([new Promise(n=>{chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:e,role:`user`,content:t,image_url:a,embed_url:c,source_link:u,tags:d,category:`Social Clip`}},e=>{chrome.runtime.lastError?n({success:!1,error:chrome.runtime.lastError.message}):n(e||{success:!0})})}),new Promise(e=>setTimeout(()=>e({success:!0,localQueue:!0}),2800))]);if(n&&n.parentNode&&n.remove(),f&&f.success)l.classList.remove(`pm-saving`),l.classList.add(`pm-saved`),l.innerHTML=`<span style="font-size: 16px;">✅</span>`,r(`Saved to Media Hub! Playable embed ready in PromptMemory.`,`success`),setTimeout(()=>{l.classList.remove(`pm-saved`),l.innerHTML=o},2500);else throw Error(f?.error||`Failed to save clip.`)}catch(e){n&&n.parentNode&&n.remove(),l.classList.remove(`pm-saving`),l.classList.add(`pm-error`),l.innerHTML=`<span style="font-size: 16px;">❌</span>`,r(`Error: `+(e.message||`Could not save clip.`),`error`),setTimeout(()=>{l.classList.remove(`pm-error`),l.innerHTML=o},3e3)}}),c.appendChild(l)})},500,20);return}if(e===`youtube`&&window.location.pathname.includes(`/shorts/`)){if(document.querySelector(`.pm-shorts-btn`))return;let e=[`ytd-reel-video-renderer #actions`,`ytd-reel-video-renderer[is-active] #actions`,`ytd-reel-player-overlay-renderer #actions`,`#actions.ytd-reel-player-overlay-renderer`,`ytd-shorts #actions`,`#shorts-container #actions`,`#shorts-inner-container #actions`].join(`, `);s(e,()=>{let t=Array.from(document.querySelectorAll(e));if(t.length===0&&document.querySelectorAll(`#actions`).forEach(e=>{(e.closest(`ytd-reel-video-renderer`)||e.closest(`ytd-shorts`)||e.closest(`[is-active]`))&&t.push(e)}),t.length===0){let e=document.querySelector(`ytd-reel-video-renderer #like-button, ytd-reel-video-renderer ytd-like-button-renderer, ytd-reel-video-renderer ytd-toggle-button-renderer`);if(e){let n=e.closest(`#actions`);n&&t.push(n)}}t.forEach(e=>{if(e.querySelector(`.pm-shorts-btn`))return;let t=document.createElement(`button`);t.className=`pm-social-clip-btn pm-shorts-btn`,t.title=`Save Short to PromptMemory Hub`,t.innerHTML=o,t.addEventListener(`click`,async n=>{if(n.stopPropagation(),n.preventDefault(),t.classList.contains(`pm-saving`))return;t.classList.add(`pm-saving`),t.innerHTML=`<span style="font-size: 16px;">⏳</span>`;let i=r(`Saving YouTube Short to PromptMemory...`,`info`);try{let n=e.closest(`ytd-reel-video-renderer, ytd-shorts, ytd-player, ytd-watch-flexy`)||document.body,a=window.location.href,s=``,c=a.match(/\/shorts\/([a-zA-Z0-9_-]+)/);c&&(s=c[1]);let l=n.querySelector(`h2, .title, #video-title`)?.textContent?.trim()||document.title||`YouTube Short`,u=s?`https://i.ytimg.com/vi/${s}/maxresdefault.jpg`:null,d=s?`https://www.youtube.com/embed/${s}`:null,f=await Promise.race([new Promise(e=>{chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:`youtube`,role:`user`,content:l,image_url:u,embed_url:d,source_link:a,tags:[`#YouTube`,`#Short`,`#Video`,`#Vertical`],category:`Social Clip`}},t=>{chrome.runtime.lastError?e({success:!1,error:chrome.runtime.lastError.message}):e(t||{success:!0})})}),new Promise(e=>setTimeout(()=>e({success:!0,localQueue:!0}),2800))]);if(i&&i.parentNode&&i.remove(),f&&f.success)t.classList.remove(`pm-saving`),t.classList.add(`pm-saved`),t.innerHTML=`<span style="font-size: 16px;">✅</span>`,r(`Saved YouTube Short to Media Hub!`,`success`),setTimeout(()=>{t.classList.remove(`pm-saved`),t.innerHTML=o},2500);else throw Error(f?.error||`Failed to save Short.`)}catch(e){i&&i.parentNode&&i.remove(),t.classList.remove(`pm-saving`),t.classList.add(`pm-error`),t.innerHTML=`<span style="font-size: 16px;">❌</span>`,r(`Error: `+(e.message||`Failed to save Short`),`error`),setTimeout(()=>{t.classList.remove(`pm-error`),t.innerHTML=o},3e3)}}),e.appendChild(t)})},500,20);return}if(e===`instagram`||e===`youtube`&&window.location.pathname.includes(`/shorts/`))return;let c=n(e).join(`, `);document.querySelectorAll(c).forEach(t=>{let n=t;if(n.querySelector(`#pm-save-btn`)||n.querySelector(`.pm-clipper-wrapper`))return;let o=n.closest(`article`)||n.closest(`[role="article"]`)||n.closest(`ytd-watch-flexy, ytd-reel-video-renderer, ytd-video-renderer, ytd-rich-item-renderer`)||n.closest(`.feed-shared-update-v2, .occludable-update, div._aabd, main section`)||n.closest(`article, section, div[role="main"]`)||n;if(o.hasAttribute(`data-pm-injected`))return;o.setAttribute(`data-pm-injected`,`true`);let s=document.createElement(`div`);s.className=`pm-clipper-wrapper`;let c=document.createElement(`button`);c.id=`pm-save-btn`,c.className=`pm-social-clip-btn pm-btn-${e}`,c.innerHTML=`${a}<span>Save to PM</span>`,c.title=`Clip Playable Media & Text to PromptMemory Vault`,c.addEventListener(`click`,async t=>{if(t.stopPropagation(),t.preventDefault(),c.classList.contains(`pm-saving`))return;c.classList.add(`pm-saving`),c.innerHTML=`<span>⏳</span><span>Saving...</span>`;let o=r(`Saving Playable Media to PromptMemory...`,`info`);try{let t=c.closest(`article`)||c.closest(`[role="article"]`)||c.closest(`ytd-watch-flexy, ytd-reel-video-renderer, ytd-video-renderer, ytd-rich-item-renderer`)||c.closest(`.feed-shared-update-v2, .occludable-update, div._aabd, main section`)||n.closest(`article, section, div[role="main"]`)||document.body,s=await Promise.race([new Promise(n=>{let r=i(t,e);r.imageUrl||r.embedUrl&&r.embedUrl!==window.location.href?n(r):setTimeout(()=>{n(i(t,e))},500)}),new Promise((e,t)=>setTimeout(()=>t(Error(`TIMEOUT_NO_MEDIA`)),3e3))]);if(!s.imageUrl&&(!s.embedUrl||s.embedUrl===window.location.href))throw Error(`TIMEOUT_NO_MEDIA`);let{text:l,imageUrl:u,embedUrl:d,sourceLink:f,tags:p}=s;console.log(`PM Social Clipper extracting:`,{platform:e,text:l.substring(0,50),imageUrl:u,embedUrl:d,sourceLink:f,tags:p});let m=await Promise.race([new Promise(t=>{chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:e,role:`user`,content:l,image_url:u,embed_url:d,source_link:f,tags:p,category:`Social Clip`}},e=>{chrome.runtime.lastError?t({success:!1,error:chrome.runtime.lastError.message}):t(e||{success:!0})})}),new Promise(e=>setTimeout(()=>e({success:!0,localQueue:!0}),2800))]);if(o&&o.parentNode&&o.remove(),m&&m.success)c.classList.remove(`pm-saving`),c.classList.add(`pm-saved`),c.innerHTML=`<span>✅</span><span>Saved!</span>`,r(`Saved to Media Hub! Playable embed ready in PromptMemory.`,`success`),setTimeout(()=>{c.classList.remove(`pm-saved`),c.innerHTML=`${a}<span>Save to PM</span>`},2500);else throw Error(m?.error||`Failed to save media clip.`)}catch(e){if(console.error(`PM Social Clipper Error:`,e),o&&o.parentNode&&o.remove(),c.classList.remove(`pm-saving`),e.message===`TIMEOUT_NO_MEDIA`||e.message?.includes(`TIMEOUT`)){c.innerHTML=`${a}<span>Save to PM</span>`,r(`No media found on this page.`,`error`);return}c.classList.add(`pm-error`),c.innerHTML=`<span>❌</span><span>Error</span>`,r(`Error: `+(e.message||`Could not save clip.`),`error`),setTimeout(()=>{c.classList.remove(`pm-error`),c.innerHTML=`${a}<span>Save to PM</span>`},3e3)}}),s.appendChild(c),n.appendChild(s)})}var l=null;window.addEventListener(`click`,e=>{let t=e.target.closest(`ytd-menu-renderer, [aria-label*="Action menu" i], [aria-label*="More" i]`);if(t){let e=t.closest(`ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer`);e&&(l=e)}},!0),new MutationObserver(()=>{t()===`youtube`&&document.querySelectorAll(`ytd-menu-popup-renderer #items, ytd-menu-popup-renderer tp-yt-paper-listbox`).forEach(e=>{if(e.querySelector(`#pm-yt-menu-item`)||!l)return;let t=document.createElement(`div`);t.id=`pm-yt-menu-item`,t.className=`style-scope ytd-menu-service-item-renderer`,t.style.cssText=`display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; font-family: Roboto, Arial, sans-serif; font-size: 14px; color: var(--yt-spec-text-primary, #0f0f0f); width: 100%; box-sizing: border-box; transition: background 0.2s;`,t.innerHTML=`<span style="font-size: 18px;">💾</span><span style="font-weight: 500;">Save to PromptMemory</span>`,t.addEventListener(`mouseenter`,()=>{t.style.background=`var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1))`}),t.addEventListener(`mouseleave`,()=>{t.style.background=`transparent`}),t.addEventListener(`click`,async e=>{e.stopPropagation(),e.preventDefault();let t=r(`Saving video from homepage to PromptMemory...`,`info`);try{let e=(l?.querySelector(`a[href*="/watch?v="], a[href*="/shorts/"]`))?.getAttribute(`href`)||``,n=``,i=e.match(/\/watch\?v=([a-zA-Z0-9_-]+)/),a=e.match(/\/shorts\/([a-zA-Z0-9_-]+)/);if(i?n=i[1]:a&&(n=a[1]),!n)throw Error(`Could not extract Video ID from card.`);let o=`https://www.youtube.com/watch?v=${n}`,s=`https://www.youtube.com/embed/${n}`,c=`https://i.ytimg.com/vi/${n}/maxresdefault.jpg`,u=l?.querySelector(`#video-title, #title, h3, a[title]`),d=u?.textContent?.trim()||u?.getAttribute(`title`)||`YouTube Video`,f=await new Promise(e=>{chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:`youtube`,role:`user`,content:d,image_url:c,embed_url:s,source_link:o,tags:[`#YouTube`,`#Video`,`#SavedFromHome`],category:`Social Clip`}},t=>{chrome.runtime.lastError?e({success:!1,error:chrome.runtime.lastError.message}):e(t||{success:!1})})});if(t&&t.parentNode&&t.remove(),f&&f.success)r(`Saved YouTube Video to Media Hub!`,`success`);else throw Error(`Failed to save clip.`)}catch(e){t&&t.parentNode&&t.remove(),r(`Error: `+e.message,`error`)}}),e.insertBefore(t,e.firstChild)})}).observe(document.body,{childList:!0,subtree:!0}),c(),setInterval(c,1500),new MutationObserver(()=>{c()}).observe(document.body,{childList:!0,subtree:!0});var u=history.pushState;history.pushState=function(...e){let t=u.apply(this,e);return window.dispatchEvent(new Event(`locationchange`)),t};var d=history.replaceState;history.replaceState=function(...e){let t=d.apply(this,e);return window.dispatchEvent(new Event(`locationchange`)),t},window.addEventListener(`popstate`,()=>{window.dispatchEvent(new Event(`locationchange`))}),window.addEventListener(`locationchange`,()=>{console.log(`PM Social Clipper: SPA navigation detected, re-injecting action buttons...`),setTimeout(c,500),setTimeout(c,1500)});})()