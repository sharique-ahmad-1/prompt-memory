/**
 * background/index.ts
 * Enterprise background worker supporting direct cloud synchronization with Supabase,
 * clean 3-item context menus, forced Popup action on icon click, and robust SPA clip handlers.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || (globalThis as any).process?.env?.VITE_SUPABASE_URL || 'https://udteyshcbrhhjuhkvzwl.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tS7R5MmCnYFlr9_Jiczhxg_zqAC6J61';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Force Manifest V3 to open popup.html on action click instead of side panel
function ensurePopupBehavior() {
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
  if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setPopup) {
    chrome.action.setPopup({ popup: 'popup.html' }).catch(() => {});
  }
}

ensurePopupBehavior();

// Setup clean 3-item context menus on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Antigravity Background] Extension installed/updated. Creating Context Menus & forcing popup behavior...');
  ensurePopupBehavior();

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'pm-save-media',
      title: 'Save Media to PromptMemory Vault',
      contexts: ['image', 'video']
    });
    chrome.contextMenus.create({
      id: 'pm-save-page',
      title: 'Save Page / Text to PromptMemory Vault',
      contexts: ['page', 'selection']
    });
    chrome.contextMenus.create({
      id: 'pm-open-vault',
      title: 'Open PromptMemory Vault',
      contexts: ['all']
    });
  });
});

// Helper: Get active authenticated user session
async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) return user;

    // Restore from storage if available
    const storage = (await chrome.storage.local.get(['pm_session'])) as Record<string, any>;
    const pmSession = storage?.pm_session;
    if (pmSession && pmSession.access_token && pmSession.refresh_token) {
      const { data: sessionData } = await supabase.auth.setSession({
        access_token: pmSession.access_token,
        refresh_token: pmSession.refresh_token
      });
      if (sessionData?.user) return sessionData.user;
    }

    // Check storage user ID direct
    if (pmSession?.user?.id) {
      return pmSession.user;
    }
  } catch (err) {
    console.warn('[Antigravity Background] Auth get user warning:', err);
  }
  return null;
}

// Handle Context Menu item clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  try {
    if (info.menuItemId === 'pm-open-vault') {
      const storage = (await chrome.storage.local.get(['pm_web_origin'])) as Record<string, any>;
      const origin = storage?.pm_web_origin || 'https://prompt-memory-prompt-memory-1.vercel.app';
      chrome.tabs.create({ url: `${origin}/clips` });
      return;
    }

    const user = await getCurrentUser();
    if (!user || !user.id) {
      console.error('[Antigravity Background] Context menu save failed: User not logged in.');
      return;
    }

    let title = tab.title || 'Untitled Capture';
    let content = '';
    let imageUrl: string | null = null;
    let embedUrl: string | null = null;
    let tags: string[] = ['#WebCapture'];
    let platform = 'Web';

    if (info.menuItemId === 'pm-save-media') {
      imageUrl = info.srcUrl || null;
      content = `Captured media from: ${tab.url}`;
      title = `Media Note: ${tab.title?.slice(0, 30) || 'Clip'}`;
      tags.push('#Media', '#VisualNote');
    } else if (info.menuItemId === 'pm-save-page') {
      if (info.selectionText) {
        content = info.selectionText.trim();
        title = `${tab.title?.slice(0, 45) || 'Text Capture'}...`;
        tags.push('#Highlight', '#TextPrompt');
      } else {
        content = `Full page reference saved from: ${tab.url}`;
        title = tab.title || 'Page Capture';
        tags.push('#Bookmark', '#Page');
      }
    }

    if (tab.url?.includes('youtube.com') || tab.url?.includes('youtu.be')) {
      platform = 'YouTube';
      if (tab.url.includes('/shorts/')) {
        const shortId = tab.url.split('/shorts/')[1]?.split('?')[0];
        embedUrl = shortId ? `https://www.youtube.com/embed/${shortId}` : tab.url;
        tags.push('#YouTubeShort');
      }
    } else if (tab.url?.includes('instagram.com')) {
      platform = 'Instagram';
      embedUrl = tab.url;
      tags.push('#InstagramReel');
    }

    const insertPayload = {
      user_id: user.id,
      title,
      content,
      image_url: imageUrl,
      embed_url: embedUrl,
      source_link: tab.url || null,
      platform,
      category: imageUrl || embedUrl ? 'Social Clip' : 'Web Clip',
      tags
    };

    const { error: insertErr } = await supabase.from('prompts').insert([insertPayload]);
    if (insertErr) {
      console.error('[Antigravity Background] Context menu insert error:', insertErr);
    } else {
      console.log('[Antigravity Background] Successfully clipped item via Context Menu!');
    }
  } catch (err) {
    console.error('[Antigravity Background] Context menu exception:', err);
  }
});

// Runtime Message Handling from Popup & Content Scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      if (request.action === 'SYNC_SESSION') {
        const { payload } = request;
        if (payload && payload.access_token && payload.refresh_token) {
          await supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token
          });
          const storageUpdate: Record<string, any> = { pm_session: payload };
          if (payload.origin || (_sender?.tab?.url && _sender.tab.url.startsWith('http'))) {
            try {
              storageUpdate.pm_web_origin = payload.origin || new URL(_sender.tab!.url!).origin;
            } catch {}
          }
          await chrome.storage.local.set(storageUpdate);
        }
        sendResponse({ success: true });
        return;
      } else if (request.action === 'fetchWorkspaces') {
        try {
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 3200));
          const fetchPromise = (async () => {
            let { data, error } = await supabase
              .from('workspaces')
              .select('*')
              .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
              const { data: projData } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
              if (projData && projData.length > 0) {
                data = projData;
              }
            }
            return { data: data || [], error: null };
          })();

          const res = (await Promise.race([fetchPromise, timeoutPromise])) as any;
          sendResponse({ success: true, data: res.data || [] });
        } catch (err: any) {
          sendResponse({ success: true, data: [] });
        }
      } else if (request.action === 'fetchItems' || request.action === 'fetchDashboardData') {
        try {
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Cloud sync timed out.' }), 3200));
          const fetchPromise = (async () => {
            const user = await getCurrentUser();
            if (!user || !user.id) {
              return { success: false, error: 'Offline Mode: Please log into your PromptMemory web dashboard to sync.' };
            }
            let query = supabase.from('prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
            const { data: promptsData, error } = await query;
            let clipsQuery = supabase.from('workspace_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
            const { data: clipsData } = await clipsQuery;

            if (error && !clipsData) {
              return { success: false, error: error.message };
            }
            const combined = [...(promptsData || []), ...(clipsData || [])].sort((a, b) => {
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
            const seen = new Set();
            const deduped = combined.filter(item => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
            return { success: true, data: deduped };
          })();

          const result = (await Promise.race([fetchPromise, timeoutPromise])) as any;
          sendResponse(result);
        } catch (err: any) {
          console.error('[Antigravity Background] fetchDashboardData exception:', err);
          sendResponse({ success: false, error: err.message || 'Error syncing data.' });
        }
      } else if (request.action === 'deleteItem') {
        const { itemId } = request;
        await supabase.from('prompts').delete().eq('id', itemId).then(() => {}, () => {});
        await supabase.from('workspace_items').delete().eq('id', itemId).then(() => {}, () => {});
        sendResponse({ success: true });
      } else if (request.action === 'SAVE_WINDOW') {
        try {
          const user = await getCurrentUser();
          const userId = user && user.id ? user.id : 'offline';
          const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
            chrome.tabs.query({ currentWindow: true }, (t) => resolve(t || []));
          });
          const tabList = tabs.map(t => `- [${t.title || t.url}](${t.url})`).join('\n');
          const insertPayload = {
            user_id: userId,
            title: `Browser Window Snapshot (${tabs.length} Tabs)`,
            content: `All active tabs saved from browser session:\n\n${tabList}`,
            category: 'Workspace Snapshot',
            platform: 'Chrome Window',
            tags: ['#SavedWindow', '#Tabs']
          };
          if (userId !== 'offline') {
            supabase.from('prompts').insert([insertPayload]).then(() => {}, () => {});
          }
          const localItem = { ...insertPayload, id: 'win_' + Date.now(), created_at: new Date().toISOString() };
          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.get(['pm_cached_dashboard_items'], (res) => {
              const list: any[] = Array.isArray(res?.pm_cached_dashboard_items) ? res.pm_cached_dashboard_items : [];
              chrome.storage.local.set({ pm_cached_dashboard_items: [localItem, ...list] }).catch(() => {});
            });
          }
          sendResponse({ success: true, data: localItem });
        } catch (winErr: any) {
          sendResponse({ success: false, error: winErr.message });
        }
      } else if (request.action === 'SAVE_PROMPT' || request.action === 'clipCurrentPage' || request.action === 'SAVE_CONTEXT_PROMPT') {
        try {
          const { payload } = request;
          const user = (await Promise.race([
            getCurrentUser(),
            new Promise<any>((resolve) => setTimeout(() => resolve(null), 2200))
          ])) as any;
          
          if (!user || !user.id) {
            const localId = 'local_' + Date.now();
            const localItem = {
              id: localId,
              user_id: 'offline',
              title: payload.title || (payload.content ? payload.content.slice(0, 50) : 'Untitled Capture'),
              content: payload.content || '',
              image_url: payload.image_url || null,
              embed_url: payload.embed_url || null,
              source_link: payload.source_link || null,
              platform: payload.platform || 'Social',
              category: payload.category || (payload.embed_url || payload.image_url ? 'Social Clip' : 'Prompt'),
              tags: payload.tags || ['#SocialClip'],
              created_at: new Date().toISOString()
            };
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.get(['pm_cached_dashboard_items'], (res) => {
                const list: any[] = Array.isArray(res?.pm_cached_dashboard_items) ? res.pm_cached_dashboard_items : [];
                chrome.storage.local.set({ pm_cached_dashboard_items: [localItem, ...list] }).catch(() => {});
              });
            }
            sendResponse({ success: true, data: localItem });
            return;
          }

          const insertPayload = {
            user_id: user.id,
            title: payload.title || (payload.content ? payload.content.slice(0, 50) : 'Untitled Capture'),
            content: payload.content || '',
            image_url: payload.image_url || null,
            embed_url: payload.embed_url || null,
            source_link: payload.source_link || null,
            platform: payload.platform || 'Social',
            category: payload.category || (payload.embed_url || payload.image_url ? 'Social Clip' : 'Prompt'),
            tags: payload.tags || ['#SocialClip']
          };

          const insertPromise = supabase.from('prompts').insert([insertPayload]).select().single();
          const timeoutPromise = new Promise<any>((resolve) => setTimeout(() => resolve({ error: { message: 'CLOUD_TIMEOUT' } }), 2600));
          const { data, error } = (await Promise.race([insertPromise, timeoutPromise])) as any;

          if (error) {
            if (error.message === 'CLOUD_TIMEOUT') {
              const localItem = { ...insertPayload, id: 'local_' + Date.now(), created_at: new Date().toISOString() };
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.get(['pm_cached_dashboard_items'], (res) => {
                  const list: any[] = Array.isArray(res?.pm_cached_dashboard_items) ? res.pm_cached_dashboard_items : [];
                  chrome.storage.local.set({ pm_cached_dashboard_items: [localItem, ...list] }).catch(() => {});
                });
              }
              sendResponse({ success: true, data: localItem });
              return;
            }
            console.error('[Antigravity Background] Supabase insert error:', error);
            sendResponse({ success: false, error: error.message || 'Database insertion failed.' });
            return;
          }

          if (insertPayload.category === 'Social Clip' || insertPayload.image_url || insertPayload.embed_url) {
            supabase.from('workspace_items').insert([{
              user_id: user.id,
              title: insertPayload.title,
              content: insertPayload.content,
              image_url: insertPayload.image_url,
              embed_url: insertPayload.embed_url,
              source_link: insertPayload.source_link,
              platform: insertPayload.platform,
              category: insertPayload.category,
              tags: insertPayload.tags
            }]).then(() => {}, () => {});
          }

          if (typeof chrome !== 'undefined' && chrome.storage?.local && data) {
            chrome.storage.local.get(['pm_cached_dashboard_items'], (res) => {
              const list: any[] = Array.isArray(res?.pm_cached_dashboard_items) ? res.pm_cached_dashboard_items : [];
              chrome.storage.local.set({ pm_cached_dashboard_items: [data, ...list] }).catch(() => {});
            });
          }

          sendResponse({ success: true, data });
        } catch (insertEx: any) {
          console.error('[Antigravity Background] SAVE_PROMPT exception:', insertEx);
          sendResponse({ success: false, error: insertEx.message || 'Failed to save item to PromptMemory Vault.' });
        }
      } else if (request.action === 'OPEN_SIDE_PANEL') {
        // If user explicitly requests opening side panel from floating logo / menu
        if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.open && _sender.tab?.id) {
          chrome.sidePanel.open({ tabId: _sender.tab.id }).catch(() => {});
        }
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: `Unknown action requested: ${request.action}` });
      }
    } catch (err: any) {
      console.error('[Antigravity Background] Error inside handler:', err);
      sendResponse({ success: false, error: err.message || 'Background service error.' });
    }
  };

  handleAsync();
  return true;
});
