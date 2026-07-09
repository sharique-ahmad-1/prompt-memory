console.log("PromptMemory: Auth Bridge Injected");

function syncSession() {
  try {
    let sessionRaw: string | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth-token') || key.includes('supabase.auth.token') || (key.startsWith('sb-') && key.endsWith('-token')))) {
        sessionRaw = localStorage.getItem(key);
        break;
      }
    }

    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      const session = parsed?.access_token ? parsed : (parsed?.session || parsed?.currentSession || null);
      if (session && session.access_token) {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.set({ 
            pm_session: session,
            pm_web_origin: window.location.origin 
          }).catch(() => {});
        }
        chrome.runtime.sendMessage({
          action: 'SYNC_SESSION',
          payload: {
            ...session,
            origin: window.location.origin
          }
        }, () => {
          void chrome.runtime.lastError;
        });
      }
    }
  } catch (error) {
    console.error("PromptMemory: Error syncing session", error);
  }
}

// Sync immediately on load and DOM ready
syncSession();
window.addEventListener('DOMContentLoaded', syncSession);

// Listen for storage changes in the same tab
window.addEventListener('storage', (event) => {
  if (event.key && (event.key.includes('auth-token') || event.key.startsWith('sb-'))) {
    syncSession();
  }
});

// Polling interval to catch internal Supabase state refreshes cleanly
setInterval(syncSession, 1500);
