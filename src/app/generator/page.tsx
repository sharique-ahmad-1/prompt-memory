/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2, Check, Copy, Wand2, Send, Play, TerminalSquare, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

export default function ContinuationGenerator() {
  const { user } = useAuth()
  const [transcript, setTranscript] = useState('')
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('none')
  const [provider, setProvider] = useState<string>('mesh-api')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [projectMemories, setProjectMemories] = useState<any>({})
  const [projectPrompts, setProjectPrompts] = useState<any>({})
  const [apiError, setApiError] = useState<{message: string, provider: string} | null>(null)

  useEffect(() => {
    if (user) {
      supabase.from('projects').select('id, title').order('title').then(({ data }) => {
        if (data) setProjects(data)
      })
      supabase.from('project_memories').select('*').then(({ data }) => {
        if (data) {
          const mems: any = {}
          data.forEach(m => mems[m.project_id] = m)
          setProjectMemories(mems)
        }
      })
      supabase.from('prompts').select('project_id, title, content').not('project_id', 'is', null).then(({ data }) => {
        if (data) {
          const prmpts: any = {}
          data.forEach(p => {
             if (!prmpts[p.project_id]) prmpts[p.project_id] = []
             prmpts[p.project_id].push(p)
          })
          setProjectPrompts(prmpts)
        }
      })
    }
  }, [user])

  const handleGenerate = async () => {
    if (!transcript.trim()) return
    setIsGenerating(true)
    setIsSaved(false)
    setResult(null)
    setApiError(null)
    
    try {
      const projectData = selectedProjectId !== 'none' 
        ? { 
            title: projects.find(p => p.id === selectedProjectId)?.title, 
            ...projectMemories[selectedProjectId],
            prompts: projectPrompts[selectedProjectId] || []
          }
        : null

      const meshConfig = {
        apiKey: localStorage.getItem('pm_mesh_api_key') || user?.user_metadata?.mesh_api_key || '',
        baseUrl: localStorage.getItem('pm_mesh_api_base_url') || user?.user_metadata?.mesh_api_base_url || '',
        model: localStorage.getItem('pm_mesh_api_model') || user?.user_metadata?.mesh_api_model || 'gpt-4o'
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, provider, projectData, meshConfig })
      })
      const data = await res.json()
      
      if (res.ok) {
        setResult(data)
        
        if (selectedProjectId !== 'none') {
          const { error } = await supabase.from('project_memories').upsert({
            project_id: selectedProjectId,
            summary: data.executiveSummary,
            goals: data.projectGoal,
            key_decisions: data.keyDecisions,
            completed_tasks: data.completedWork,
            pending_tasks: data.pendingWork,
            context: data.currentStatus + "\n\nAI Context:\n" + data.aiContinuationContext,
            constraints: "Active Problems:\n" + data.activeProblems + "\n\nRisks:\n" + data.risks,
            continuation_prompt: data.readyToPasteContinuationPrompt,
          }, { onConflict: 'project_id' })
          
          if (error) throw error

          setIsSaved(true)
          toast.success("Saved to Project Memory")
        } else {
          toast.success("Context Generated")
        }
      } else {
        if (data.error === 'API_KEY_MISSING') {
          setApiError({ message: data.message, provider: data.provider })
        } else {
          const errorMsg = data.error || "Failed to generate context. The AI model may be overloaded or timed out. Please try again."
          toast.error(errorMsg)
          setApiError({ message: errorMsg, provider: provider })
          console.error(data.error)
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
      setApiError({ message: "An unexpected error occurred while communicating with the AI service. Please check your internet connection and try again.", provider: provider })
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyOutput = () => {
    if (!result) return
    const text = `
**Executive Summary:**
${result.executiveSummary}

**Project Goal:**
${result.projectGoal}

**Current Status:**
${result.currentStatus}

**Key Decisions:**
${result.keyDecisions}

**Completed Work:**
${result.completedWork}

**Active Problems:**
${result.activeProblems}

**Pending Work:**
${result.pendingWork}

**Risks:**
${result.risks}

**Recommended Next Actions:**
${result.recommendedNextActions}

**AI Continuation Context:**
${result.aiContinuationContext}

**Continuation Prompt:**
${result.readyToPasteContinuationPrompt}
    `.trim()
    
    navigator.clipboard.writeText(text)
    toast.success("Full Context Copied")
  }

  const copyPromptOnly = () => {
    if (!result) return
    navigator.clipboard.writeText(result.readyToPasteContinuationPrompt)
    toast.success("Prompt Copied")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setTranscript(event.target.result as string)
          toast.success("Transcript loaded from file")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-full bg-background flex flex-col text-foreground">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">AI Context Engine</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProjectId} onValueChange={(v) => v && setSelectedProjectId(v)}>
            <SelectTrigger className="w-[180px] h-9 bg-secondary border-border text-xs text-foreground font-semibold focus:ring-primary/30">
              <SelectValue placeholder="Save to Project..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="none" className="text-muted-foreground italic focus:bg-secondary">Don't Save to DB</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id} className="focus:bg-secondary">{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={provider} onValueChange={(v) => v && setProvider(v)}>
            <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-xs text-foreground font-semibold focus:ring-primary/30">
              <SelectValue placeholder="AI Provider" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="mesh-api" className="focus:bg-secondary">AI Fiesta Mesh API</SelectItem>
              <SelectItem value="openai" className="focus:bg-secondary">OpenAI Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Input Workspace */}
        <div className="w-full lg:w-[45%] border-r border-border flex flex-col bg-background">
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <TerminalSquare className="h-4 w-4" />
              Raw Transcript
            </div>
            {transcript.length > 0 && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                {transcript.length} chars
              </span>
            )}
          </div>
          <div 
            className="flex-1 relative p-6 transition-all"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Dropzone overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity">
               <div className="border-2 border-dashed border-primary rounded-xl w-full h-full bg-primary/10" />
            </div>
            
            <TextareaAutosize
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste your raw AI conversation here, or drag & drop a text file...&#10;&#10;User: Help me refactor this codebase...&#10;AI: Sure! Let's start with the database schema..."
              className="w-full h-full min-h-[400px] bg-transparent border-none resize-none outline-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/60 font-mono text-sm leading-relaxed custom-scrollbar"
            />
          </div>
          <div className="p-6 pt-0">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !transcript.trim()}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-violet-600 text-white shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Conversation...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-white" />
                  Generate Context
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Output Results */}
        <div className="flex-1 flex flex-col bg-secondary/10 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          {apiError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative z-10">
              <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-sm">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                {apiError.message.includes('API_KEY_MISSING') ? 'API Key Required' : 'Generation Failed'}
              </h3>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-6">
                {apiError.message}
              </p>
              
              {apiError.message.includes('API_KEY_MISSING') || apiError.message.includes('not configured') ? (
                <div className="space-y-4 max-w-md w-full">
                  <div className="bg-card border border-border p-4 rounded-xl text-left shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Fastest fix: Configure your AI Fiesta Mesh API key directly in your workspace settings.</p>
                  </div>
                  <Button onClick={() => window.location.href = '/settings'} className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                    Go to AI Settings (`/settings`) &rarr;
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGenerate} className="gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5">
                  <Play className="h-4 w-4 fill-white" /> Try Again
                </Button>
              )}
            </div>
          ) : !result && !isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="h-20 w-20 rounded-full bg-card border border-border flex items-center justify-center mb-6 shadow-sm">
                <Wand2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Context</h3>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                Paste a conversation transcript on the left and click generate to distill it into actionable memory and a continuation prompt.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-8 relative z-10 w-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 w-full max-w-sm">
                  <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse flex items-center justify-center shrink-0">
                     <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="h-5 bg-secondary rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-secondary rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 w-full">
                <div className="grid lg:grid-cols-2 gap-6 w-full">
                  <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm h-32 flex flex-col justify-between">
                    <div className="h-3 bg-primary/20 rounded w-1/4 animate-pulse mb-4" />
                    <div className="space-y-2">
                      <div className="h-2 bg-secondary rounded w-full animate-pulse" />
                      <div className="h-2 bg-secondary rounded w-5/6 animate-pulse" />
                      <div className="h-2 bg-secondary rounded w-4/6 animate-pulse" />
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm h-32 flex flex-col justify-between">
                    <div className="h-3 bg-violet-500/20 rounded w-1/4 animate-pulse mb-4" />
                    <div className="space-y-2">
                      <div className="h-2 bg-secondary rounded w-full animate-pulse" />
                      <div className="h-2 bg-secondary rounded w-4/5 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm h-24 flex flex-col justify-between">
                  <div className="h-3 bg-muted rounded w-1/6 animate-pulse mb-4" />
                  <div className="space-y-2">
                    <div className="h-2 bg-secondary rounded w-full animate-pulse" />
                    <div className="h-2 bg-secondary rounded w-1/2 animate-pulse" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 w-full">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm h-36 flex flex-col justify-between">
                      <div className="h-3 bg-secondary rounded w-1/3 animate-pulse mb-4" />
                      <div className="space-y-2">
                        <div className="h-2 bg-secondary rounded w-full animate-pulse" />
                        <div className="h-2 bg-secondary rounded w-5/6 animate-pulse" />
                        <div className="h-2 bg-secondary rounded w-full animate-pulse" />
                        <div className="h-2 bg-secondary rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-8 relative z-10">
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Extracted Memory
                        {isSaved && <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded text-[10px] uppercase tracking-wider font-bold"><Check className="h-3 w-3"/> Saved to DB</span>}
                      </h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyOutput} className="gap-2 bg-transparent border-border text-foreground hover:bg-secondary/50 transition-colors">
                      <Copy className="h-4 w-4" /> Copy Full Context
                    </Button>
                  </div>

                  <div className="grid gap-6">
                    {/* Summary & Goal */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Executive Summary</h3>
                        <MarkdownRenderer content={result.executiveSummary} />
                      </div>
                      <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-3">Project Goal</h3>
                        <MarkdownRenderer content={result.projectGoal} />
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Current Status</h3>
                      <MarkdownRenderer content={result.currentStatus} />
                    </div>

                    {/* Decisions & Tasks */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-3">Key Decisions</h3>
                        <MarkdownRenderer content={result.keyDecisions} />
                      </div>
                      <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-3">Completed Work</h3>
                        <MarkdownRenderer content={result.completedWork} />
                      </div>
                      <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest mb-3">Pending Work</h3>
                        <MarkdownRenderer content={result.pendingWork} />
                      </div>
                    </div>

                    {/* Problems & Risks */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="glass-card p-6 rounded-2xl border border-border bg-red-500/5 hover:bg-red-500/10 transition-colors shadow-sm">
                        <h3 className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-3">Active Problems</h3>
                        <MarkdownRenderer content={result.activeProblems} />
                      </div>
                      <div className="glass-card p-6 rounded-2xl border border-border bg-orange-500/5 hover:bg-orange-500/10 transition-colors shadow-sm">
                        <h3 className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-3">Risks</h3>
                        <MarkdownRenderer content={result.risks} />
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Recommended Next Actions</h3>
                      <MarkdownRenderer content={result.recommendedNextActions} />
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-3">AI Continuation Context</h3>
                      <MarkdownRenderer content={result.aiContinuationContext} />
                    </div>

                    {/* Continuation Prompt Card */}
                    <div className="relative mt-8 group">
                      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 to-violet-500/50 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative bg-card p-6 rounded-2xl border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Send className="h-4 w-4 text-primary" />
                            Continuation Prompt
                          </h3>
                          <Button size="sm" onClick={copyPromptOnly} className="h-8 gap-1.5 bg-gradient-to-r from-primary to-violet-600 text-white font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                            <Copy className="h-3.5 w-3.5" /> Copy Prompt
                          </Button>
                        </div>
                        <div className="p-4 bg-secondary rounded-xl border border-border text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                          {result.readyToPasteContinuationPrompt}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}