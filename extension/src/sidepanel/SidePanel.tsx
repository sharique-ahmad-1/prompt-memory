import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Copy, CheckCircle2, LogIn, Sparkles, MessageSquare, Bot, Cpu, Database, Wand2, Play, Settings, LogOut, Layers, ExternalLink, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Logo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Prompt = {
  id: string;
  title?: string;
  category?: string;
  content: string;
  platform: string;
  role: string;
  created_at: string;
  image_url?: string;
  sequence_id?: string;
};

function TabIcon({ url, favIconUrl }: { url?: string; favIconUrl?: string }) {
  const [error, setError] = useState(false);
  let primaryUrl = null;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      primaryUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
      primaryUrl = favIconUrl || null;
    }
  } else {
    primaryUrl = favIconUrl || null;
  }

  if (!primaryUrl || error) {
    return <Layers className="h-3.5 w-3.5 shrink-0 text-purple-400" />;
  }
  return (
    <img 
      src={primaryUrl} 
      alt="" 
      className="h-3.5 w-3.5 rounded shrink-0 object-contain" 
      onError={() => setError(true)} 
    />
  );
}

export function SidePanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Vault State
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filter, setFilter] = useState<string>('All');
  
  // UI State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vault' | 'generator' | 'workspace' | 'settings'>('vault');
  const [maxTrimSize, setMaxTrimSize] = useState<number>(12000);
  
  // Generator State
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingSingleTab, setSavingSingleTab] = useState(false);
  const [activeTabInfo, setActiveTabInfo] = useState<{ text: string; tokens: number; url: string; title: string } | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const res = await chrome.storage.local.get(['session', 'sidePanelActiveTab', 'maxTrimSize']);
      const session = res.session as Session | undefined;
      
      if (res.sidePanelActiveTab) {
        setActiveTab(res.sidePanelActiveTab as any);
        chrome.storage.local.remove('sidePanelActiveTab');
      }
      if (res.maxTrimSize) {
        setMaxTrimSize(res.maxTrimSize as number);
      }

      if (session && session.access_token) {
        setSession(session);
        await Promise.all([
          fetchPrompts(session)
        ]);
      }
      setLoading(false);
    }
    loadSession();

    // Listen for auth changes
    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.session) {
        const newSession = changes.session.newValue as Session | undefined;
        setSession(newSession || null);
        if (newSession) {
          fetchPrompts(newSession);
        } else {
          setPrompts([]);
        }
      }
      if (changes.sidePanelActiveTab && changes.sidePanelActiveTab.newValue) {
        setActiveTab(changes.sidePanelActiveTab.newValue as any);
        chrome.storage.local.remove('sidePanelActiveTab');
      }
    };
    chrome.storage.onChanged.addListener(storageListener);

    const messageListener = (message: any) => {
      if (message.action === 'PROMPT_SAVED_REFRESH') {
        chrome.storage.local.get('session').then((res: any) => {
          if (res.session && res.session.access_token) {
            fetchPrompts(res.session);
          }
        });
      }
      if (message.action === 'SWITCH_SIDE_PANEL_TAB' && message.tab) {
        setActiveTab(message.tab as any);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  async function fetchPrompts(activeSession: Session) {
    try {
      await supabase.auth.setSession({
        access_token: activeSession.access_token,
        refresh_token: activeSession.refresh_token
      });

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        const sanitized = (data as Prompt[]).map(p => {
          let strictPlatform = p.platform?.toLowerCase() || 'unknown';
          if (strictPlatform.includes('chatgpt') || strictPlatform.includes('openai')) strictPlatform = 'chatgpt';
          else if (strictPlatform.includes('claude') || strictPlatform.includes('anthropic')) strictPlatform = 'claude';
          else if (strictPlatform.includes('gemini') || strictPlatform.includes('google')) strictPlatform = 'gemini';
          
          return { ...p, platform: strictPlatform };
        });
        setPrompts(sanitized);
      }
    } catch (err) {
      console.error("Error fetching prompts:", err);
    }
  }

  const handleScrapeActive = async () => {
    setIsGenerating(true);
    setScrapeError(null);
    setActiveTabInfo(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error("No active tab found");
      
      const res = await new Promise<any>((resolve) => {
        chrome.tabs.sendMessage(tab.id!, { action: 'SCRAPE_CHAT' }, (response) => {
          if (chrome.runtime.lastError) resolve(null);
          else resolve(response);
        });
      });
      
      if (!res || !res.success) {
        throw new Error("Could not scrape chat. Make sure you are on an active ChatGPT, Claude, or Gemini tab.");
      }
      setActiveTabInfo(res.data);
      setIsGenerating(false);
    } catch (err: any) {
      setScrapeError(err.message || "Failed to scrape chat.");
      setIsGenerating(false);
    }
  };

  const handleExecuteContinuation = () => {
    if (!activeTabInfo) return;
    setIsGenerating(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'EXECUTE_CONTINUATION', 
          payload: { text: activeTabInfo.text, title: activeTabInfo.title } 
        }, () => {
          setIsGenerating(false);
        });
      }
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const BASE_WEB_URL = import.meta.env.VITE_WEB_APP_URL || 'https://prompt-memory.vercel.app';

  const handleLogin = () => {
    chrome.tabs.create({ url: `${BASE_WEB_URL}/login` });
  };

  const handleLogout = () => {
    chrome.storage.local.remove('session');
    setSession(null);
  };

  const saveMaxTrimSize = (val: number) => {
    setMaxTrimSize(val);
    chrome.storage.local.set({ maxTrimSize: val });
  };

  const handleSaveWorkspace = () => {
    setSavingWorkspace(true);
    try {
      chrome.runtime.sendMessage({ action: 'SAVE_WORKSPACE' }, (res) => {
        setSavingWorkspace(false);
        if (chrome.runtime.lastError || !res?.success) {
          alert('Failed to save. Check connection.');
        } else if (res && res.success && session) {
          fetchPrompts(session);
        }
      });
    } catch (err) {
      setSavingWorkspace(false);
      alert('Failed to save. Check connection.');
    }
  };

  const handleSaveSingleTab = () => {
    setSavingSingleTab(true);
    try {
      chrome.runtime.sendMessage({ action: 'SAVE_SINGLE_TAB' }, (res) => {
        setSavingSingleTab(false);
        if (chrome.runtime.lastError || !res?.success) {
          alert('Failed to save. Check connection.');
        } else if (res && res.success && session) {
          fetchPrompts(session);
        }
      });
    } catch (err) {
      setSavingSingleTab(false);
      alert('Failed to save. Check connection.');
    }
  };

  const workspacePrompts = (prompts || []).filter(p => p?.category?.toLowerCase() === 'workspace' || p?.platform?.toLowerCase() === 'workspace');

  const filteredPrompts = (prompts || []).filter(p => {
    const isW = p?.category?.toLowerCase() === 'workspace' || p?.platform?.toLowerCase() === 'workspace' || p?.category?.toLowerCase() === 'social clip';
    if (isW) return false;
    if (filter === 'All') return true;
    return p?.platform?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
           <Logo size={40} />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-screen bg-background text-foreground p-8 items-center justify-center text-center">
        <Logo size={56} className="mb-6" />
        <h1 className="text-2xl font-bold mb-3 tracking-tight">Welcome to PromptMemory</h1>
        <p className="text-sm text-secondary-foreground max-w-xs mb-8 leading-relaxed">
          Your intelligent vault for capturing, organizing, and reusing AI conversations across the web.
        </p>
        <button onClick={handleLogin} className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium shadow-md w-full justify-center hover:scale-[1.02] active:scale-95 transition-transform">
          <LogIn className="h-4 w-4" /> Login with PromptMemory Account
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground custom-scrollbar overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-border bg-card/50 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none">PromptMemory</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 gap-4 mt-2">
          <button 
            onClick={() => setActiveTab('vault')}
            className={`pb-2 text-sm font-semibold transition-colors relative ${activeTab === 'vault' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Vault
            {activeTab === 'vault' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`pb-2 text-sm font-semibold transition-colors relative flex items-center gap-1.5 ${activeTab === 'generator' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            Generator
            {activeTab === 'generator' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`pb-2 text-sm font-semibold transition-colors relative flex items-center gap-1.5 ${activeTab === 'workspace' ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Layers className="h-3.5 w-3.5" />
            Workspace
            {activeTab === 'workspace' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`pb-2 text-sm font-semibold transition-colors relative flex items-center gap-1.5 ml-auto ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
            {activeTab === 'settings' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'vault' && (
        <motion.div 
          key="vault-view"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Filters */}
          <div className="px-4 py-3 border-b border-border flex gap-2 overflow-x-auto custom-scrollbar shrink-0 items-center justify-between">
            <div className="flex gap-2">
              {['All', 'ChatGPT', 'Claude', 'Gemini'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    filter === f 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {f === 'ChatGPT' && <MessageSquare className="h-3 w-3" />}
                  {f === 'Claude' && <Bot className="h-3 w-3" />}
                  {f === 'Gemini' && <Cpu className="h-3 w-3" />}
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/20">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center p-8 mt-12">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                     <Database className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No prompts found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Click the "Save to PM" button on supported AI platforms to start building your vault.
                  </p>
                </motion.div>
              ) : (
                filteredPrompts.map((prompt) => {
                  const isWorkspace = prompt?.category?.toLowerCase() === 'workspace' || prompt?.platform?.toLowerCase() === 'workspace';
                  return (
                    <motion.div 
                      key={prompt.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider">
                          {isWorkspace ? (
                            <><Layers className="h-3 w-3 text-purple-500" /> Workspace</>
                          ) : (
                            <>
                              {prompt.platform === 'chatgpt' && <MessageSquare className="h-3 w-3 text-emerald-500" />}
                              {prompt.platform === 'claude' && <Bot className="h-3 w-3 text-orange-500" />}
                              {prompt.platform === 'gemini' && <Cpu className="h-3 w-3 text-blue-500" />}
                              {prompt.platform}
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(prompt.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {prompt.title && (
                        <h4 className="text-xs font-bold text-foreground mb-1 truncate">{prompt.title}</h4>
                      )}
                      {prompt.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-border/60 bg-black/40 max-h-40 flex items-center justify-center">
                          <img src={prompt.image_url} alt="Saved visual clip" className="w-full h-auto object-cover max-h-40 hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <p className="text-sm text-foreground mb-4 line-clamp-4 leading-relaxed whitespace-pre-wrap font-mono">
                        {prompt.content}
                      </p>
                      <div className="flex justify-end gap-2">
                        {isWorkspace && (
                          <button
                            onClick={() => chrome.runtime.sendMessage({ action: 'RESTORE_WORKSPACE', payload: { content: prompt.content } })}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-purple-600 px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Reopen Workspace
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(prompt.id, prompt.content)}
                          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/50 hover:bg-primary/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          {copiedId === prompt.id ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-500">Copied</span></>
                          ) : (
                            <><Copy className="h-3.5 w-3.5" />Copy</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      {activeTab === 'generator' && (
        <motion.div 
          key="generator-view"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
          className="flex flex-col flex-1 overflow-hidden bg-secondary/10"
        >
          <div className="p-5 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center text-center px-4">
                 <Wand2 className="h-10 w-10 text-primary mb-3" />
                 <h2 className="text-lg font-bold">Live Context Generator</h2>
                 <p className="text-sm text-muted-foreground mt-2">
                   Instantly scrape the conversation on your active tab and execute an automated continuation.
                 </p>
              </div>

              <button 
                onClick={handleScrapeActive}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <><Sparkles className="h-4 w-4 animate-pulse" /> Scraping...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Scrape Active Conversation</>
                )}
              </button>

              {scrapeError && (
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-lg text-sm font-medium text-center mt-2">
                  {scrapeError}
                </div>
              )}

              {activeTabInfo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-6">
                  <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tab Info</span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
                        SUCCESS
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate mb-3">{activeTabInfo.title}</p>
                    <div className="flex items-center justify-between text-xs bg-secondary/50 p-2.5 rounded-lg">
                      <span className="text-muted-foreground">Est. Tokens</span>
                      <span className={`font-mono font-bold ${activeTabInfo.tokens > 8000 ? 'text-red-400' : 'text-primary'}`}>
                        ~{activeTabInfo.tokens.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleExecuteContinuation}
                    disabled={isGenerating}
                    className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-violet-600 text-white shadow-primary/20 shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Play className="h-4 w-4 fill-white" /> 🚀 Execute Smart Continuation
                  </button>
                </motion.div>
              )}
            </div>
            
          </div>
        </motion.div>
      )}
      {activeTab === 'workspace' && (
        <motion.div 
          key="workspace-view"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/20"
        >
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">Workspace Session Recall</h2>
                <p className="text-xs text-muted-foreground">Capture & restore entire window tab groups</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              onClick={handleSaveWorkspace}
              disabled={savingWorkspace || savingSingleTab}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              <Layers className="h-4 w-4" />
              {savingWorkspace ? 'Saving Current Window Tabs...' : '🚀 Save Current Window (All Tabs)'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              onClick={handleSaveSingleTab}
              disabled={savingSingleTab || savingWorkspace}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Bookmark className="h-3.5 w-3.5" />
              {savingSingleTab ? 'Saving Current Tab...' : '🔖 Save Current Tab Only'}
            </motion.button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Saved Sessions ({workspacePrompts.length})</h3>
            {workspacePrompts.length === 0 ? (
              <div className="text-center py-10 bg-card border border-border rounded-xl p-6 text-muted-foreground text-xs space-y-2">
                <Layers className="h-8 w-8 mx-auto text-purple-400/40 mb-2" />
                <p className="font-semibold text-foreground">No workspace sessions saved yet</p>
                <p className="text-muted-foreground">Click the button above to capture all your active tabs into a unified recall session!</p>
              </div>
            ) : (
              workspacePrompts.map(prompt => {
                let tabsList: { title: string; url: string; favIconUrl?: string }[] = [];
                try {
                  tabsList = JSON.parse(prompt.content || '[]');
                } catch (e) {}
                return (
                  <div key={prompt.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 hover:border-purple-500/40 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{prompt.title}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">{new Date(prompt.created_at).toLocaleDateString()}</span>
                    </div>
                    {tabsList && tabsList.length > 0 && (
                      <div className="bg-secondary/40 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar border border-border/40">
                        {tabsList.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <TabIcon url={t.url} favIconUrl={t.favIconUrl} />
                            <span className="truncate text-foreground font-medium">{t.title || t.url}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => chrome.runtime.sendMessage({ action: 'RESTORE_WORKSPACE', payload: { content: prompt.content } })}
                      className="w-full py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-purple-500/20"
                    >
                      <Play className="h-3.5 w-3.5 fill-purple-400" /> Reopen Workspace Window ({tabsList.length} tabs)
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
      {activeTab === 'settings' && (
        <motion.div 
          key="settings-view"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
          className="flex flex-col flex-1 overflow-y-auto bg-secondary/10 p-5 custom-scrollbar"
        >
          <div className="space-y-6">
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" /> Profile
              </h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">{session.user?.email?.[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[200px]">{session.user?.email}</p>
                  <p className="text-xs text-emerald-500 font-medium">Active Session</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Context Configurations
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Set the maximum character limit for the automated live scraper to prevent token overflow during mega-context generation.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Max Trimming Size</span>
                  <span className="text-xs font-mono font-bold text-primary">{maxTrimSize.toLocaleString()} chars</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max="24000" 
                  step="1000" 
                  value={maxTrimSize} 
                  onChange={(e) => saveMaxTrimSize(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>2k</span>
                  <span>12k</span>
                  <span>24k</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Appearance State
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Visual toggle options for extension layout configurations.
              </p>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/50">
                <span className="text-sm font-medium">Dark Mode</span>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-not-allowed opacity-80">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
