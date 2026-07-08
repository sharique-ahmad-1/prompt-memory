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
      chrome.tabs.create({ url: 'http://localhost:3000/clips' });
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
          await chrome.storage.local.set({ pm_session: payload });
        }
        sendResponse({ success: true });
        return;
      } else if (request.action === 'fetchWorkspaces') {
        // Try workspaces table, if fail or empty try projects
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
            error = null;
          }
        }

        sendResponse({ success: true, data: data || [] });
      } else if (request.action === 'fetchItems' || request.action === 'fetchDashboardData') {
        const user = await getCurrentUser();
        let query = supabase.from('prompts').select('*').order('created_at', { ascending: false }).limit(30);
        if (user && user.id) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (error) {
          console.error('[Antigravity Background] fetchDashboardData error:', error);
          sendResponse({ success: false, error: error.message });
        } else {
          sendResponse({ success: true, data: data || [] });
        }
      } else if (request.action === 'deleteItem') {
        const { itemId } = request;
        const { error } = await supabase.from('prompts').delete().eq('id', itemId);
        if (error) throw error;
        sendResponse({ success: true });
      } else if (request.action === 'SAVE_PROMPT' || request.action === 'clipCurrentPage' || request.action === 'SAVE_CONTEXT_PROMPT') {
        // High-fidelity clipping from socialClipper.ts, floatingLogo.ts, or chatgpt.ts
        try {
          const { payload } = request;
          const user = await getCurrentUser();
          
          if (!user || !user.id) {
            sendResponse({ success: false, error: 'User session not synced. Please log in at http://localhost:3000 to authenticate your extension.' });
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

          const { data, error } = await supabase.from('prompts').insert([insertPayload]).select().single();
          if (error) {
            console.error('[Antigravity Background] Supabase insert error:', error);
            sendResponse({ success: false, error: error.message || 'Database insertion failed.' });
            return;
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
