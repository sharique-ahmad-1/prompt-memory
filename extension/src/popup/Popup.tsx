import React, { useEffect, useState } from 'react';
import { 
  Folder, Search, ExternalLink, Video, Sparkles, 
  RefreshCw, AlertCircle, FileText, Bookmark, Play, Layers
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage({ action: 'fetchWorkspaces' }, (response) => {
      if (response?.success && response.data) {
        setWorkspaces(response.data);
      }
    });

    chrome.runtime.sendMessage({ action: 'fetchDashboardData' }, (response) => {
      setLoading(false);
      if (chrome.runtime.lastError) {
        setError('Service Error: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response?.error || 'Could not connect to Supabase cloud.');
      }
    });
  };

  const openAppUrl = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
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
    <div className="w-[440px] min-h-[580px] max-h-[600px] bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Glass Header */}
      <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              PromptMemory Vault
              <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise Cloud Memory Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Sync with cloud vault"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-400' : ''}`} />
          </button>
          <button
            onClick={() => openAppUrl('https://prompt-memory.vercel.app/clips')}
            className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
          >
            <span>Theater</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Global Search vault clips, prompts or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all shadow-inner font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Distinct Dashboard Navigation Tabs */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'all' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'workspaces' ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Workspaces ({workspaces.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('clips')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'clips' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Social Clips ({recentClips.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === 'prompts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Prompts ({recentPrompts.length})</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mx-4 mt-2.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <span className="font-bold block">Sync Error</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading && items.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
            <span className="text-xs font-medium">Syncing active memory hub...</span>
          </div>
        ) : searchQuery.trim() ? (
          /* Live Search Results View */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-1.5">
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
                    className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-pink-500/40 transition-all cursor-pointer group flex items-start gap-3 shadow-sm"
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isClip ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
                      {isClip ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs text-slate-200 group-hover:text-pink-300 transition-colors truncate">
                          {item.title || 'Untitled Capture'}
                        </h4>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          {item.platform || (isClip ? 'Clip' : 'Prompt')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
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
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-pink-400" />
                    📑 Recent Windows & Tabs (Workspaces)
                  </span>
                  <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/workspaces')} className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-0.5">
                    <span>View All</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5">
                  {workspaces.slice(0, activeTab === 'all' ? 3 : 20).map((ws) => (
                    <div
                      key={ws.id}
                      onClick={() => openAppUrl(`https://prompt-memory.vercel.app/workspaces/${ws.id}`)}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-pink-500/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-slate-200 group-hover:text-pink-300 transition-colors truncate">
                            {ws.title || ws.name || 'Cloud Vault Workspace'}
                          </h4>
                          {ws.description && <p className="text-[10px] text-slate-400 truncate">{ws.description}</p>}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                  {workspaces.length === 0 && (
                    <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-[11px]">
                      No recent workspaces. Click below to open web dashboard!
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'clips') && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    📸 Recent Social Clips (Reels/Shorts)
                  </span>
                  <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/clips')} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5">
                    <span>Open Theater</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {recentClips.slice(0, activeTab === 'all' ? 3 : 20).map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => openAppUrl(`https://prompt-memory.vercel.app/clips?id=${clip.id}`)}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-slate-700/80 flex items-center justify-center">
                        {clip.image_url ? (
                          <img src={clip.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <Play className="w-4 h-4 text-purple-400 fill-current" />
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 text-white fill-current drop-shadow" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-semibold text-xs text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                            {clip.title || 'Untitled Reel / Short'}
                          </h4>
                          <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded uppercase shrink-0">
                            {clip.platform || 'Clip'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {clip.content || clip.source_link || 'Captured playable media item'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentClips.length === 0 && (
                    <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-[11px]">
                      No social clips yet. Visit YouTube or Instagram to clip!
                    </div>
                  )}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'prompts') && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    🧠 Recent Prompts
                  </span>
                  <button onClick={() => openAppUrl('https://prompt-memory.vercel.app/vault')} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                    <span>View Vault</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {recentPrompts.slice(0, activeTab === 'all' ? 3 : 20).map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => openAppUrl(`https://prompt-memory.vercel.app/vault?id=${prompt.id}`)}
                      className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex items-start gap-2.5 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                          {prompt.title || 'Untitled Prompt'}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-mono bg-slate-950/40 p-1.5 rounded border border-slate-800/50">
                          {prompt.content || 'No text content available.'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentPrompts.length === 0 && (
                    <div className="p-3 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-[11px]">
                      No AI prompts saved. Highlight any page text to clip!
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Launcher Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Cloud Synced</span>
        </div>
        <button
          onClick={() => openAppUrl('https://prompt-memory.vercel.app')}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
        >
          <span>🚀 Open Full Web Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
