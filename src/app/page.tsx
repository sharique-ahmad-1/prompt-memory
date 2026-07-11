/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { FolderKanban, Database, BrainCircuit, Activity, Loader2, ArrowUpRight, Plus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Project = { id: string, title: string, updated_at: string, created_at?: string }
type Prompt = { id: string, title: string, project_id: string, created_at?: string, category?: string }

export default function Dashboard() {
  const router = useRouter()
  const { user, workspace, currentTeam, userTeams } = useAuth()
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ projects: 0, prompts: 0, memories: 0, generatorUsage: 0 })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [chartData, setChartData] = useState<{ name: string; active: number; prompts: number }[]>([])

  async function fetchDashboardData() {
    setLoading(true)
    
    let projsQuery = supabase.from('projects').select('*', { count: 'exact', head: true })
    let promptsQuery = supabase.from('prompts').select('*', { count: 'exact', head: true })
    let memsQuery = supabase.from('project_memories').select('*', { count: 'exact', head: true })
    let allPromptsQuery = supabase.from('prompts').select('id, created_at, category, team_id')
    let allProjectsQuery = supabase.from('projects').select('id, title, updated_at, created_at, team_id').order('updated_at', { ascending: false })
    let allMemoriesQuery = supabase.from('project_memories').select('id, updated_at')

    if (workspace === 'team' && currentTeam) {
      projsQuery = projsQuery.eq('team_id', currentTeam.id)
      promptsQuery = promptsQuery.eq('team_id', currentTeam.id)
      allPromptsQuery = allPromptsQuery.eq('team_id', currentTeam.id)
      allProjectsQuery = allProjectsQuery.eq('team_id', currentTeam.id)
    } else {
      projsQuery = projsQuery.is('team_id', null)
      promptsQuery = promptsQuery.is('team_id', null)
      allPromptsQuery = allPromptsQuery.is('team_id', null)
      allProjectsQuery = allProjectsQuery.is('team_id', null)
    }

    const [
      { count: projCount }, 
      { count: promptCount }, 
      { count: memCount },
      { data: allPrompts },
      { data: allProjects },
      { data: allMemories }
    ] = await Promise.all([
      projsQuery,
      promptsQuery,
      memsQuery,
      allPromptsQuery,
      allProjectsQuery,
      allMemoriesQuery
    ])

    // Calculate generator usage exact count (memories + generator/continuation prompts)
    const genPromptsCount = (allPrompts || []).filter(p => p.category?.toLowerCase() === 'generator' || p.category?.toLowerCase() === 'continuation' || p.category?.toLowerCase() === 'chained').length;
    const generatorUsageCount = (memCount || 0) + genPromptsCount;

    setCounts({
      projects: projCount || 0,
      prompts: promptCount || 0,
      memories: memCount || 0,
      generatorUsage: generatorUsageCount
    })

    if (allProjects) {
      setRecentProjects(allProjects.slice(0, 4))
    }

    // Build 7-day timeline from real created_at / updated_at timestamps
    const today = new Date();
    const last7DaysMap = new Map<string, { name: string; active: number; prompts: number }>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const isoDate = d.toISOString().split('T')[0];
      last7DaysMap.set(isoDate, { name: dateStr, active: 0, prompts: 0 });
    }

    (allPrompts || []).forEach(p => {
      if (p.created_at) {
        const iso = new Date(p.created_at).toISOString().split('T')[0];
        if (last7DaysMap.has(iso)) {
          const entry = last7DaysMap.get(iso)!;
          entry.prompts += 1;
          entry.active += 1;
        }
      }
    });

    (allProjects || []).forEach(p => {
      if (p.updated_at || p.created_at) {
        const iso = new Date(p.updated_at || p.created_at!).toISOString().split('T')[0];
        if (last7DaysMap.has(iso)) {
          last7DaysMap.get(iso)!.active += 1;
        }
      }
    });

    (allMemories || []).forEach(m => {
      if (m.updated_at) {
        const iso = new Date(m.updated_at).toISOString().split('T')[0];
        if (last7DaysMap.has(iso)) {
          last7DaysMap.get(iso)!.active += 1;
        }
      }
    });

    setChartData(Array.from(last7DaysMap.values()));
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, workspace, currentTeam])

  const stats = [
    { name: 'Windows / Tabs', value: counts.projects, icon: FolderKanban, trend: 'Live DB', href: '/workspaces' },
    { name: 'Saved Prompts', value: counts.prompts, icon: Database, trend: 'Live DB', href: '/vault' },
    { name: 'Total Memories', value: counts.memories, icon: BrainCircuit, trend: 'Live DB', href: '/workspaces' },
    { name: 'Generator Usage', value: counts.generatorUsage, icon: Activity, trend: 'Live DB', href: '/generator' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-full w-full bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="min-h-full bg-background text-foreground p-8 pt-12 pb-24 relative flex flex-col">
      {/* Background glow constrained by an absolute inset wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Workspace Active</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Good morning, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}.
            </h1>
            <p className="text-muted-foreground text-lg">Here's what's happening in your AI workspace.</p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            onClick={() => router.push('/generator')}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-primary/20 border border-transparent"
          >
            <Sparkles className="h-4 w-4" />
            Launch Context Generator
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.name}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => router.push(stat.href)}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between h-32 hover:bg-card hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold tracking-tight px-1">Activity Overview</h2>
            <div className="glass-card rounded-2xl p-6 h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrompts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="prompts" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrompts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
