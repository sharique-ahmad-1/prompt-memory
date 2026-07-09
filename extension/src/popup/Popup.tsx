import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, Search, ExternalLink, Video, 
  RefreshCw, AlertCircle, FileText, Bookmark, Play, Layers, Scissors, CheckCircle, Sparkles
} from 'lucide-react';

interface Workspace {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  created_at: string;
}

interface VaultItem {
  id: string;
  user_id: string;
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  embed_url?: string | null;
  source_link?: string | null;
  platform?: string | null;
  category?: string | null;
  created_at: string;
  tags?: string[];
}

export const Popup: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'workspaces' | 'clips' | 'prompts'>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((prev) => (prev && prev.text === text ? null : prev));
    }, 3200);
  };

  const fetchDashboardData = () => {
    setError(null);

    // Instant local cache restoration so user never sees blank screen or spinners if cached
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pm_cached_dashboard_items', 'pm_cached_workspaces'], (res) => {
        if (res?.pm_cached_dashboard_items && Array.isArray(res.pm_cached_dashboard_items)) {
          setItems(res.pm_cached_dashboard_items);
        }
        if (res?.pm_cached_workspaces && Array.isArray(res.pm_cached_workspaces)) {
          setWorkspaces(res.pm_cached_workspaces);
        }
      });
    }

    setLoading(true);
    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        finished = true;
        setLoading(false);
        setItems((currentItems) => {
          if (currentItems.length === 0) {
            setError('Offline Mode: Cloud sync delayed. Please log in at prompt-memory.vercel.app to sync.');
          }
          return currentItems;
        });
      }
    }, 6500);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'fetchWorkspaces' }, (response) => {
        if (response?.success && response.data) {
          setWorkspaces(response.data);
          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.set({ pm_cached_workspaces: response.data }).catch(() => {});
          }
        }
      });

      chrome.runtime.sendMessage({ action: 'fetchDashboardData' }, (response) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        setLoading(false);

        if (chrome.runtime.lastError) {
          setItems((currentItems) => {
            if (currentItems.length === 0) {
              setError('Service Notice: ' + chrome.runtime.lastError?.message);
            }
            return currentItems;
          });
          return;
        }
        if (response && response.success && response.data) {
          setItems(response.data);
          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.set({ pm_cached_dashboard_items: response.data }).catch(() => {});
          }
        } else {
          setItems((currentItems) => {
            if (currentItems.length === 0) {
              setError(response?.error || 'Could not connect to Supabase cloud. Please log into dashboard.');
            }
            return currentItems;
          });
        }
      });
    } else {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const openAppUrl = async (pathOrUrl: string) => {
    let target = pathOrUrl;
    if (pathOrUrl.startsWith('https://prompt-memory.vercel.app')) {
      const storage = typeof chrome !== 'undefined' && chrome.storage?.local
        ? (await chrome.storage.local.get(['pm_web_origin'])) as Record<string, any>
        : null;
      const origin = storage?.pm_web_origin || 'https://prompt-memory-prompt-memory-1.vercel.app';
      target = pathOrUrl.replace('https://prompt-memory.vercel.app', origin);
    }
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: target });
    } else {
      window.open(target, '_blank');
    }
  };

  const handleQuickAction = async (actionType: 'tab' | 'window' | 'selection' | 'media') => {
    if (activeAction) return;
    setActiveAction(actionType);

    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        showToast('Extension messaging unavailable in this context.', 'error');
        setActiveAction(null);
        return;
      }

      if (actionType === 'window') {
        chrome.runtime.sendMessage({ action: 'SAVE_WINDOW' }, (res) => {
          setActiveAction(null);
          if (chrome.runtime.lastError || !res?.success) {
            showToast(res?.error || 'Error saving window tabs', 'error');
          } else {
            showToast('All active window tabs saved to Vault!');
            if (res.data) setItems((prev) => [res.data, ...prev]);
          }
        });
        return;
      }

      // For tab, selection, and media we query current tab or send prompt request
      if (typeof chrome.tabs !== 'undefined' && chrome.tabs.query && chrome.tabs.sendMessage) {
        const [activeTabObj] = await new Promise<chrome.tabs.Tab[]>((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (t) => resolve(t || []));
        });

        if (actionType === 'tab') {
          const title = activeTabObj?.title || 'Saved Tab';
          const url = activeTabObj?.url || window.location.href;
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              title,
              content: `Bookmark URL: ${url}`,
              source_link: url,
              category: 'Bookmark',
              platform: 'Chrome Tab',
              tags: ['#SavedTab', '#Bookmark']
            }
          }, (res) => {
            setActiveAction(null);
            if (chrome.runtime.lastError || !res?.success) {
              showToast('Error saving current tab', 'error');
            } else {
              showToast('Current tab saved to Vault!');
              if (res.data) setItems((prev) => [res.data, ...prev]);
            }
          });
        } else if (actionType === 'selection') {
          if (activeTabObj && activeTabObj.id) {
            chrome.tabs.sendMessage(activeTabObj.id, { action: 'GET_SELECTION_TEXT' }, (resp) => {
              const selectionText = resp?.selectionText || '';
              if (!selectionText.trim()) {
                setActiveAction(null);
                showToast('No text currently selected on page!', 'error');
                return;
              }
              chrome.runtime.sendMessage({
                action: 'SAVE_PROMPT',
                payload: {
                  title: selectionText.slice(0, 40) + '...',
                  content: selectionText,
                  source_link: activeTabObj.url || '',
                  category: 'Highlight',
                  platform: 'Web Selection',
                  tags: ['#Highlight', '#Selected']
                }
              }, (res) => {
                setActiveAction(null);
                if (chrome.runtime.lastError || !res?.success) {
                  showToast('Error saving selection', 'error');
                } else {
                  showToast('Selected text saved to Vault!');
                  if (res.data) setItems((prev) => [res.data, ...prev]);
                }
              });
            });
          } else {
            setActiveAction(null);
            showToast('No active web tab detected for selection', 'error');
          }
        } else if (actionType === 'media') {
          if (activeTabObj && activeTabObj.id) {
            chrome.tabs.sendMessage(activeTabObj.id, { action: 'GET_MEDIA_INFO' }, (resp) => {
              const imageUrl = resp?.imageUrl || null;
              const embedUrl = resp?.embedUrl || activeTabObj.url || '';
              chrome.runtime.sendMessage({
                action: 'SAVE_PROMPT',
                payload: {
                  title: `Captured Media: ${activeTabObj?.title?.slice(0, 30) || 'Clip'}`,
                  content: `Media captured from ${activeTabObj?.url || 'page'}`,
                  image_url: imageUrl,
                  embed_url: embedUrl,
                  source_link: activeTabObj.url || '',
                  category: 'Social Clip',
                  platform: 'Media Extractor',
                  tags: ['#Media', '#Clipped']
                }
              }, (res) => {
                setActiveAction(null);
                if (chrome.runtime.lastError || !res?.success) {
                  showToast('Error saving media clip', 'error');
                } else {
                  showToast('Media clip saved to Vault!');
                  if (res.data) setItems((prev) => [res.data, ...prev]);
                }
              });
            });
          } else {
            setActiveAction(null);
            showToast('No active web tab detected for media extraction', 'error');
          }
        }
      } else {
        setActiveAction(null);
      }
    } catch (err: any) {
      setActiveAction(null);
      showToast(err?.message || 'Quick action error', 'error');
    }
  };

  // Compute categorized items
  const recentClips = items.filter(
    (item) => !!item.image_url || !!item.embed_url || item.category === 'Social Clip' || (item.source_link && (item.source_link.includes('youtube') || item.source_link.includes('instagram')))
  );

  const recentPrompts = items.filter(
    (item) => !item.image_url && !item.embed_url && item.category !== 'Social Clip'
  );

  // Filtered search items when query is entered
  const searchResults = items.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
      (item.platform && item.platform.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ width: '100%', height: '100%', maxWidth: '360px', maxHeight: '440px', overflow: 'hidden' }} className="w-full h-full bg-[#1e1e2f]/90 backdrop-blur-2xl text-slate-100 flex flex-row font-sans selection:bg-pink-500 selection:text-white border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden flex-1 m-0 p-0 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-xl border backdrop-blur-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 ${toastMsg.type === 'error' ? 'bg-rose-950/95 border-rose-500/40 text-rose-200' : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'}`}
        >
          {toastMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>{toastMsg.text}</span>
        </motion.div>
      )}

      {/* Sleek, Narrow Vertical Icon-Only Sidebar on the LEFT */}
      <div className="w-13 bg-slate-900/70 backdrop-blur-2xl border-r border-white/10 flex flex-col items-center py-2.5 gap-2 shrink-0 z-30">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-md shadow-pink-500/20 mb-1 cursor-default shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="w-6 h-[1px] bg-white/10 my-0.5 shrink-0" />

        {/* Save Current Tab */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAction('tab')}
            disabled={!!activeAction}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeAction === 'tab' ? 'bg-indigo-500 text-white animate-pulse shadow-lg shadow-indigo-500/40' : 'bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30'}`}
          >
            <Bookmark className="w-4 h-4" />
          </motion.button>
          <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-950/95 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl flex items-center gap-1.5">
            <span>Bookmark Current Tab</span>
          </span>
        </div>

        {/* Save Window Tabs */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAction('window')}
            disabled={!!activeAction}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeAction === 'window' ? 'bg-purple-500 text-white animate-pulse shadow-lg shadow-purple-500/40' : 'bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/5 hover:border-purple-500/30'}`}
          >
            <Folder className="w-4 h-4" />
          </motion.button>
          <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-950/95 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl flex items-center gap-1.5">
            <span>Save All Window Tabs</span>
          </span>
        </div>

        {/* Save Selection */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAction('selection')}
            disabled={!!activeAction}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeAction === 'selection' ? 'bg-pink-500 text-white animate-pulse shadow-lg shadow-pink-500/40' : 'bg-white/5 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 border border-white/5 hover:border-pink-500/30'}`}
          >
            <Scissors className="w-4 h-4" />
          </motion.button>
          <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-950/95 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl flex items-center gap-1.5">
            <span>Save Selected Text</span>
          </span>
        </div>

        {/* Save Media */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAction('media')}
            disabled={!!activeAction}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeAction === 'media' ? 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-500/40' : 'bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/5 hover:border-amber-500/30'}`}
          >
            <Video className="w-4 h-4" />
          </motion.button>
          <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-950/95 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl flex items-center gap-1.5">
            <span>Extract & Save Media</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Sync Button at bottom of sidebar */}
        <div className="relative group shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchDashboardData}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-400' : ''}`} />
          </motion.button>
          <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-950/95 text-purple-200 border border-purple-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl">
            Sync Cloud Vault
          </span>
        </div>
      </div>

      {/* Main Dashboard Panel on the Right */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Compact Global Search Bar */}
        <div className="px-3 py-2 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 flex items-center gap-2 flex-shrink-0 sticky top-0 z-20">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clips, prompts, #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Distinct Dashboard Navigation Tabs */}
        <div className="px-2.5 py-1.5 bg-slate-900/40 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'all' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('workspaces')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'workspaces' ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Workspaces ({workspaces.length})</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('clips')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'clips' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Clips ({recentClips.length})</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('prompts')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'prompts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Prompts ({recentPrompts.length})</span>
          </motion.button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mx-2.5 mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between gap-2 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span className="font-medium leading-tight">{error}</span>
            </div>
            <button
              onClick={() => openAppUrl('https://prompt-memory.vercel.app/login')}
              className="px-2 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 font-bold text-[10px] flex items-center gap-1 shrink-0 transition-all border border-rose-500/40"
            >
              Log In
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar min-h-0">
          {loading && items.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
              <span className="text-xs font-medium">Syncing cloud memory hub...</span>
            </div>
          ) : searchQuery.trim() ? (
            /* Live Search Results View */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1">
                <span>Search Results ({searchResults.length})</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  No matching clips or prompts found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((item) => {
                  const isClip = !!item.image_url || !!item.embed_url || item.category === 'Social Clip';
                  return (
                    <div
                      key={item.id}
                      onClick={() => openAppUrl(isClip ? `https://prompt-memory.vercel.app/clips?id=${item.id}` : `https://prompt-memory.vercel.app/vault?id=${item.id}`)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer group flex items-start gap-2.5 shadow-sm"
                    >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isClip ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                        {isClip ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-xs text-slate-200 group-hover:text-pink-300 transition-colors truncate">
                            {item.title || 'Untitled Capture'}
                          </h4>
                          <span className="text-[9px] text-slate-400 bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                            {item.platform || (isClip ? 'Clip' : 'Prompt')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          {item.content || 'Playable media & embed ready.'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Multi-Section Dashboard View or Tabbed View */
            <>
              {(activeTab === 'all' || activeTab === 'workspaces') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Folder className="w-3.5 h-3.5 text-pink-400" />
                      Workspaces ({workspaces.length})
                    </span>
                    <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/workspaces')} className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-0.5 font-bold">
                      <span>View All</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    {workspaces.slice(0, activeTab === 'all' ? 2 : 20).map((ws, idx) => (
                      <motion.div
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        key={ws.id}
                        onClick={() => openAppUrl(`https://prompt-memory.vercel.app/workspaces/${ws.id}`)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 text-pink-300 flex items-center justify-center shrink-0">
                            <Folder className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-slate-200 group-hover:text-pink-300 transition-colors truncate">
                              {ws.title || ws.name || 'Cloud Vault Workspace'}
                            </h4>
                            {ws.description && <p className="text-[10px] text-slate-400 truncate">{ws.description}</p>}
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400 shrink-0 transition-colors" />
                      </motion.div>
                    ))}
                    {workspaces.length === 0 && (
                      <div className="p-3 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-[11px]">
                        No workspaces found. Click Open Web Dashboard below!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'clips') && (
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      Social Clips ({recentClips.length})
                    </span>
                    <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/clips')} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-bold">
                      <span>Open Theater</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {recentClips.slice(0, activeTab === 'all' ? 2 : 20).map((clip, idx) => (
                      <motion.div
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        key={clip.id}
                        onClick={() => openAppUrl(`https://prompt-memory.vercel.app/clips?id=${clip.id}`)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-2.5 group shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative border border-white/10 flex items-center justify-center">
                          {clip.image_url ? (
                            <img src={clip.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <Play className="w-4 h-4 text-purple-400 fill-current" />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3.5 h-3.5 text-white fill-current drop-shadow" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-semibold text-xs text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                              {clip.title || 'Untitled Reel / Short'}
                            </h4>
                            <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded uppercase shrink-0">
                              {clip.platform || 'Clip'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                            {clip.content || clip.source_link || 'Playable video media item'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {recentClips.length === 0 && (
                      <div className="p-3 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-[11px]">
                        No social clips yet. Click left sidebar video icon to clip media!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'prompts') && (
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                      AI Prompts ({recentPrompts.length})
                    </span>
                    <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/vault')} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-bold">
                      <span>View Vault</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {recentPrompts.slice(0, activeTab === 'all' ? 2 : 20).map((prompt, idx) => (
                      <motion.div
                        whileHover={{ scale: 1.015, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        key={prompt.id}
                        onClick={() => openAppUrl(`https://prompt-memory.vercel.app/vault?id=${prompt.id}`)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer flex items-start gap-2.5 group shadow-sm"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                            {prompt.title || 'Untitled Prompt'}
                          </h4>
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 font-mono bg-slate-950/40 p-1.5 rounded border border-white/5">
                            {prompt.content || 'No text content available.'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {recentPrompts.length === 0 && (
                      <div className="p-3 text-center rounded-xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-[11px]">
                        No prompts yet. Highlight web text or use bookmark quick action!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Launcher Bar */}
        <div className="p-2 bg-slate-900/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openAppUrl('https://prompt-memory.vercel.app')}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>🚀 Open Full Web Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

