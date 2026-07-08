"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { TeamOnboarding, TeamWorkspaceDashboard } from "@/components/team/team-onboarding";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  Database, 
  Cpu, 
  MessageSquare, 
  Bot, 
  TrendingUp, 
  Zap, 
  Search,
  Download,
  CheckCircle,
  Layers,
  Sparkles,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f97316", "#ec4899", "#06b6d4"];

export default function Dashboard() {
  const { user, workspace, currentTeam, userTeams } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContexts: 0,
    activeWorkspaces: 0,
    topPlatform: "None",
    activePlatforms: [] as { name: string; value: number }[],
    activityTimeline: [] as { date: string; count: number }[]
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      let query = supabase.from("prompts").select("*").order("created_at", { ascending: true });
      if (workspace === 'team' && currentTeam) {
        query = query.eq('team_id', currentTeam.id);
      } else {
        query = query.is('team_id', null);
      }
      const { data: prompts, error } = await query;
      
      if (prompts && !error) {
        // 1. Differentiate standard contexts vs active workspaces
        const standardPrompts = prompts.filter(
          p => !(p.category?.toLowerCase() === 'workspace' || p.platform?.toLowerCase() === 'workspace')
        );
        const workspaceSessions = prompts.filter(
          p => p.category?.toLowerCase() === 'workspace' || p.platform?.toLowerCase() === 'workspace'
        );

        const totalContexts = standardPrompts.length;
        const activeWorkspaces = workspaceSessions.length;
        
        // 2. Platform counts & Top Platform
        const platformCounts: Record<string, number> = {};
        let topPlatform = "None";
        let maxCount = 0;

        standardPrompts.forEach((p: any) => {
          let plat = p.platform?.toLowerCase() || "other";
          if (plat.includes("chatgpt") || plat.includes("openai")) plat = "ChatGPT";
          else if (plat.includes("claude") || plat.includes("anthropic")) plat = "Claude";
          else if (plat.includes("gemini") || plat.includes("google")) plat = "Gemini";
          else plat = plat.charAt(0).toUpperCase() + plat.slice(1);

          platformCounts[plat] = (platformCounts[plat] || 0) + 1;
          if (platformCounts[plat] > maxCount) {
            maxCount = platformCounts[plat];
            topPlatform = plat;
          }
        });

        const activePlatforms = Object.keys(platformCounts).map(k => ({
          name: k,
          value: platformCounts[k]
        }));

        // 3. Last 7 Days Timeline Aggregation
        const today = new Date();
        const last7DaysMap = new Map<string, { date: string; count: number }>();

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const isoDate = d.toISOString().split('T')[0];
          last7DaysMap.set(isoDate, { date: dateStr, count: 0 });
        }

        prompts.forEach((p: any) => {
          if (p.created_at) {
            const d = new Date(p.created_at);
            const isoDate = d.toISOString().split('T')[0];
            if (last7DaysMap.has(isoDate)) {
              last7DaysMap.get(isoDate)!.count += 1;
            }
          }
        });

        const activityTimeline = Array.from(last7DaysMap.values());

        setStats({
          totalContexts,
          activeWorkspaces,
          topPlatform: topPlatform || "None",
          activePlatforms,
          activityTimeline
        });
      }
      setLoading(false);
    }
    if (user) {
      fetchAnalytics();
    }
  }, [user, workspace, currentTeam]);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Triggering semantic expansion for query:", searchQuery);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
          <Logo size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 pt-12 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3.5">
            <Logo size={38} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="h-3 w-3" /> Live Supabase Metrics
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Analytics & Intelligence
              </h1>
            </div>
          </div>

          <form onSubmit={handleSemanticSearch} className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Semantic Smart Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/90 backdrop-blur-md border border-border rounded-xl pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-foreground placeholder:text-muted-foreground shadow-inner"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-secondary text-[10px] font-bold px-2 py-0.5 rounded text-muted-foreground border border-border">
              AI
            </div>
          </form>
        </header>

        {/* Extension Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-card/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Download PromptMemory Extension (Beta)
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">v1.0 MV3</span>
              </h3>
              <p className="text-sm text-zinc-300 mt-0.5 leading-relaxed">
                Connect ChatGPT, Claude, and Gemini directly to your cloud vault with cross-tab scraping & workspace saving.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDownloadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 relative z-10 cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <Download className="h-4 w-4" />
            Install Extension
          </button>
        </motion.div>

        {/* Team Management Section */}
        {workspace === 'team' && (
          userTeams.length === 0 || !currentTeam ? (
            <TeamOnboarding />
          ) : (
            <TeamWorkspaceDashboard />
          )
        )}

        {/* Premium KPI Cards (Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI 1: Total Contexts Saved */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass-card bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl group hover:border-indigo-500/40 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare className="h-24 w-24 text-indigo-500 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Total Contexts Saved</p>
            </div>
            <h3 className="text-4xl font-black text-foreground tracking-tight">{stats.totalContexts}</h3>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 font-medium flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Live Supabase Prompts
            </p>
          </motion.div>

          {/* KPI 2: Active Workspaces */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="glass-card bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl group hover:border-purple-500/40 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="h-24 w-24 text-purple-500 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Active Workspaces</p>
            </div>
            <h3 className="text-4xl font-black text-foreground tracking-tight">{stats.activeWorkspaces}</h3>
            <p className="text-xs text-purple-500 dark:text-purple-400 mt-2 font-medium flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Window & Tab Sessions
            </p>
          </motion.div>

          {/* KPI 3: Top Platform */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="glass-card bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border rounded-2xl p-6 relative overflow-hidden shadow-2xl group hover:border-emerald-500/40 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="h-24 w-24 text-emerald-500 -mr-4 -mt-4" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Top Platform</p>
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tight capitalize truncate">{stats.topPlatform}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Most Frequently Saved
            </p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-Time Activity Graph (Recharts AreaChart) */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border rounded-2xl p-6 lg:col-span-2 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  Activity Timeline (Last 7 Days)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time prompt ingestion across all connected platforms</p>
              </div>
              <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full border border-border text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Live Feed
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                    itemStyle={{ color: '#c084fc', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="count" name="Prompts Saved" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Platform Distribution */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                <Bot className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Platform Distribution
              </h3>
              <p className="text-xs text-muted-foreground mb-6">Breakdown by AI origin</p>
            </div>

            <div className="h-[260px] w-full flex items-center justify-center relative">
               {stats.activePlatforms.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.activePlatforms}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.activePlatforms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
               ) : (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                   <Database className="h-10 w-10 mb-2 opacity-30" />
                   <p className="text-sm">No platform data available.</p>
                 </div>
               )}
            </div>

            {/* Legend */}
            {stats.activePlatforms.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                {stats.activePlatforms.slice(0, 4).map((plat, idx) => (
                  <div key={plat.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate font-medium text-foreground">{plat.name}</span>
                    <span className="ml-auto font-bold text-muted-foreground">({plat.value})</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </div>

      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-xl bg-card border-border text-foreground shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Install PromptMemory Chrome Extension (MV3)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-muted-foreground">
            <p className="leading-relaxed">
              To connect your browser directly to your cloud prompt memory vault, load the production-ready build in Chrome Developer Mode:
            </p>
            <div className="space-y-3 bg-secondary p-4 rounded-xl border border-border font-mono text-xs">
              <div className="flex items-start gap-2.5">
                <span className="bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Step 1</span>
                <span>Open <code className="text-indigo-500 dark:text-indigo-400">chrome://extensions</code> in your browser address bar.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Step 2</span>
                <span>Enable <strong className="text-foreground">Developer mode</strong> using the toggle in the top right corner.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Step 3</span>
                <span>Click <strong className="text-foreground">Load unpacked</strong> and select the <code className="text-emerald-600 dark:text-emerald-400">prompt-memory-extension/dist</code> folder.</span>
              </div>
            </div>
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-600 dark:text-indigo-300 flex items-center gap-2.5 font-sans">
              <CheckCircle className="h-5 w-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Once installed, pin the extension to your toolbar to access your live scraper, DeepL micro-menu, and workspace session manager anywhere!</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
