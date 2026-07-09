(function(){console.log(`PromptMemory: ChatGPT Content Script Injected`);function e(){document.querySelectorAll(`[data-message-author-role]`).forEach(e=>{if(e.querySelector(`.pm-save-btn`)||e.querySelector(`[data-pm-injected="true"]`)||(e.getAttribute(`data-message-author-role`)||`unknown`)!==`user`)return;let t=document.createElement(`div`);t.setAttribute(`data-pm-injected`,`true`),t.style.cssText=`
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
      padding-right: 8px;
      width: 100%;
    `;let n=document.createElement(`button`);n.className=`pm-save-btn`,n.innerText=`✨ Save to PM`,n.style.cssText=`
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
    `,n.onmouseover=()=>{n.style.transform=`translateY(-1px)`,n.style.boxShadow=`0 4px 6px rgba(99,102,241,0.3)`},n.onmouseout=()=>{n.style.transform=`translateY(0)`,n.style.boxShadow=`0 2px 4px rgba(99,102,241,0.2)`},n.onclick=t=>{t.preventDefault(),t.stopPropagation();let r=(e.querySelector(`.whitespace-pre-wrap`)||e).textContent||``,i=e.getAttribute(`data-message-author-role`)||`unknown`;chrome.runtime.sendMessage({action:`SAVE_PROMPT`,payload:{platform:`chatgpt`,role:i,content:r.trim()}},()=>{chrome.runtime.lastError});let a=n.innerText,o=n.style.background;n.innerText=`✓ Saved`,n.style.background=`#10b981`,setTimeout(()=>{n.innerText=a,n.style.background=o},2e3)},t.appendChild(n),e.appendChild(t)})}(function t(){if(document.body){e();let t=new MutationObserver(t=>{let n=!1;for(let e of t)if(e.addedNodes.length>0){n=!0;break}n&&setTimeout(e,500)}),n=document.querySelector(`main`)||document.body;t.observe(n,{childList:!0,subtree:!0})}else setTimeout(t,100)})();})()