console.log("PromptMemory: Auth Bridge Injected");

function syncSession() {
  try {
    // Find the Supabase auth token in localStorage
    // It usually looks like: sb-<project-ref>-auth-token
    let sessionRaw = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        sessionRaw = localStorage.getItem(key);
        break;
      }
    }

    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session && session.access_token) {
        chrome.runtime.sendMessage({
          action: 'SYNC_SESSION',
          payload: session
        });
      }
    }
  } catch (error) {
    console.error("PromptMemory: Error syncing session", error);
  }
}

// Sync on load
syncSession();

// Listen for storage changes in the same tab
window.addEventListener('storage', (event) => {
  if (event.key && event.key.startsWith('sb-') && event.key.endsWith('-auth-token')) {
    syncSession();
  }
});

// Also set up a small polling mechanism in case the auth library updates 
// localStorage without triggering a window 'storage' event in the same tab
setInterval(syncSession, 2000);
