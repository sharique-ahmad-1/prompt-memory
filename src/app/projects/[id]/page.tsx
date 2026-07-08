/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Save, Copy, Check, Hash, Sparkles, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'

type Project = { id: string, title: string, description: string }
type MemoryDoc = {
  id?: string
  project_id: string
  context: string
  goals: string
  constraints: string
  key_decisions: string
  completed_tasks: string
  pending_tasks: string
}
type Prompt = { id: string, title: string, content: string }


export default function ProjectMemoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const [project, setProject] = useState<Project | null>(null)
  const [memory, setMemory] = useState<MemoryDoc>({
    project_id: id as string,
    context: '',
    goals: '',
    constraints: '',
    key_decisions: '',
    completed_tasks: '',
    pending_tasks: ''
  })
  const [prompts, setPrompts] = useState<Prompt[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)



  const [activeTab, setActiveTab] = useState('overview')
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals' },
    { id: 'memory', label: 'Memory & Decisions' },
    { id: 'prompts', label: 'Linked Prompts' },
    { id: 'tasks', label: 'Tasks' },
  ]



  async function fetchData() {
    setLoading(true)
    
    // 1. Fetch Project
    const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
    if (proj) setProject(proj)
    
    // 2. Fetch Memory Doc
    const { data: mem } = await supabase.from('project_memories').select('*').eq('project_id', id).maybeSingle()
    if (mem) {
      setMemory({
        id: mem.id,
        project_id: mem.project_id,
        context: mem.context || '',
        goals: mem.goals || '',
        constraints: mem.constraints || '',
        key_decisions: mem.key_decisions || '',
        completed_tasks: mem.completed_tasks || '',
        pending_tasks: mem.pending_tasks || '',
      })
    }
    
    // 3. Fetch Linked Prompts
    const { data: prmpts } = await supabase.from('prompts').select('id, title, content').eq('project_id', id)
    if (prmpts) setPrompts(prmpts)
      
    setLoading(false)
  }

  useEffect(() => {
    if (user && id) {
      fetchData()
    }
  }, [user, id])

  const handleSave = async () => {
    setSaving(true)
    
    const payload = {
      project_id: memory.project_id,
      context: memory.context,
      goals: memory.goals,
      constraints: memory.constraints,
      key_decisions: memory.key_decisions,
      completed_tasks: memory.completed_tasks,
      pending_tasks: memory.pending_tasks
    }

    try {
      if (memory.id) {
        const { error } = await supabase.from('project_memories').update(payload).eq('id', memory.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('project_memories').insert(payload).select().single()
        if (error) throw error
        if (data) setMemory(prev => ({ ...prev, id: data.id }))
      }
      toast.success("Memory Saved")
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to save memory")
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const promptString = `
You are an expert AI resuming an ongoing project. Please review the following project memory carefully and continue from where we left off.

# Project: ${project?.title}

## Important Context
${memory.context || 'None provided.'}

## Goals
${memory.goals || 'None provided.'}

## Constraints
${memory.constraints || 'None provided.'}

## Key Decisions
${memory.key_decisions || 'None provided.'}

## Completed Tasks
${memory.completed_tasks || 'None provided.'}

## Pending Tasks
${memory.pending_tasks || 'None provided.'}

## Linked Reusable Prompts
${prompts.map(p => `### ${p.title}\n${p.content}`).join('\n\n') || 'None'}

Please acknowledge you have read this and let me know what you need from me to tackle the Pending Tasks.
    `.trim()

    navigator.clipboard.writeText(promptString)
    setCopied(true)
    toast.success("Memory Exported to Clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-background text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-foreground mb-2">Project not found</h2>
        <p>The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
        <Button variant="outline" className="mt-6 border-border" onClick={() => router.push('/projects')}>Go back to Projects</Button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col relative pb-24">
      {/* Background glow constrained */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Sticky Action Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/projects')}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{project.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={saving} 
              className="gap-2 bg-transparent border-border text-foreground hover:bg-secondary transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-muted-foreground" />}
              Save Memory
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleExport} 
              className="gap-2 bg-gradient-to-r from-primary to-violet-600 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-primary/20 border border-transparent"
            >
              {copied ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {copied ? 'Copied to Clipboard!' : 'Export Context'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Document Workspace */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-8 lg:p-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Your living project memory. Update this document as your project evolves, and export it instantly to give any AI absolute context.
          </p>

          {/* Custom Tabs */}
          <div className="flex items-center gap-2 mb-8 border-b border-border pb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-12 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-foreground mb-2">Important Context</h2>
                      <p className="text-sm text-muted-foreground mb-4">Background information, architecture, target audience.</p>
                      <TextareaAutosize
                        value={memory.context}
                        onChange={e => setMemory(m => ({...m, context: e.target.value}))}
                        placeholder="Start typing context..."
                        className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary/50 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                        minRows={4}
                      />
                    </div>
                    <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-foreground mb-2">Constraints & Rules</h2>
                      <p className="text-sm text-muted-foreground mb-4">Strict technical limits, required libraries, or things to avoid.</p>
                      <TextareaAutosize
                        value={memory.constraints}
                        onChange={e => setMemory(m => ({...m, constraints: e.target.value}))}
                        placeholder="Start typing constraints..."
                        className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary/50 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                        minRows={4}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'goals' && (
                  <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-2">Primary Goals</h2>
                    <p className="text-sm text-muted-foreground mb-4">What are we trying to achieve? What is the MVP?</p>
                    <TextareaAutosize
                      value={memory.goals}
                      onChange={e => setMemory(m => ({...m, goals: e.target.value}))}
                      placeholder="Start typing goals..."
                      className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary/50 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                      minRows={8}
                    />
                  </div>
                )}

                {activeTab === 'memory' && (
                  <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-2">Key Decisions Log</h2>
                    <p className="text-sm text-muted-foreground mb-4">Major architectural choices and why they were made.</p>
                    <TextareaAutosize
                      value={memory.key_decisions}
                      onChange={e => setMemory(m => ({...m, key_decisions: e.target.value}))}
                      placeholder="Log your decisions here..."
                      className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary/50 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                      minRows={8}
                    />
                  </div>
                )}

                {activeTab === 'prompts' && (
                  <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-2">Linked Prompts</h2>
                    <p className="text-sm text-muted-foreground mb-6">These prompts are automatically appended to your export payload.</p>
                    {prompts.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/50">
                        <p className="text-muted-foreground font-medium">No linked prompts found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prompts.map(p => (
                          <div key={p.id} className="p-5 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                            <h4 className="font-bold text-foreground mb-2">{p.title}</h4>
                            <p className="text-sm text-muted-foreground font-mono line-clamp-4 leading-relaxed">{p.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-foreground mb-6">Task Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-emerald-600 mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4" /> Completed Tasks
                        </h3>
                        <TextareaAutosize
                          value={memory.completed_tasks}
                          onChange={e => setMemory(m => ({...m, completed_tasks: e.target.value}))}
                          placeholder="- [x] Setup database..."
                          className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                          minRows={8}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-amber-600 mb-3 flex items-center gap-2">
                          Pending Tasks
                        </h3>
                        <TextareaAutosize
                          value={memory.pending_tasks}
                          onChange={e => setMemory(m => ({...m, pending_tasks: e.target.value}))}
                          placeholder="- [ ] Implement feature X..."
                          className="w-full bg-secondary border border-border rounded-xl outline-none focus:ring-1 focus:ring-amber-500 p-4 text-foreground placeholder:text-muted-foreground font-mono text-sm leading-relaxed"
                          minRows={8}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
