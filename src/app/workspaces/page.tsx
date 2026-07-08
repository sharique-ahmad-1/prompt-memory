"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Search, Layers, MoreVertical, Edit, Trash2, ExternalLink, Globe, Loader2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { TeamOnboarding } from '@/components/team/team-onboarding'

function TabIcon({ url, favIconUrl }: { url?: string; favIconUrl?: string }) {
  const [error, setError] = useState(false)
  let primaryUrl = null
  if (url) {
    try {
      const hostname = new URL(url).hostname
      primaryUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      primaryUrl = favIconUrl || null
    }
  } else {
    primaryUrl = favIconUrl || null
  }

  if (!primaryUrl || error) {
    return <Layers className="h-3.5 w-3.5 shrink-0 text-purple-400" />
  }
  return (
    <img 
      src={primaryUrl} 
      alt="" 
      className="h-4 w-4 rounded shrink-0 object-contain" 
      onError={() => setError(true)} 
    />
  )
}

type Prompt = {
  id: string
  title: string
  category: string
  content: string
  platform: string
  role: string
  created_at: string
  image_url?: string
  sequence_id?: string
}

export default function WorkspacesPage() {
  const { user, workspace, currentTeam, userTeams } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Rename modal state
  const [renamePrompt, setRenamePrompt] = useState<Prompt | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchWorkspaces()
    } else {
      setLoading(false)
    }
  }, [user, workspace, currentTeam])

  const fetchWorkspaces = async () => {
    setLoading(true)
    let query = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
    if (workspace === 'team') {
      if (!currentTeam) {
        setPrompts([])
        setLoading(false)
        return
      }
      query = query.eq('team_id', currentTeam.id)
    } else {
      query = query.is('team_id', null)
    }
    const { data, error } = await query

    if (error) {
      toast.error("Failed to load workspace sessions")
      console.error(error)
    } else {
      setPrompts(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('prompts').delete().eq('id', deleteId)
    if (error) {
      toast.error("Failed to delete workspace session")
      return
    }
    toast.success("Workspace Deleted")
    setPrompts(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
  }

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renamePrompt || !renameTitle.trim()) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('prompts').update({ title: renameTitle.trim() }).eq('id', renamePrompt.id)
      if (error) throw error
      toast.success("Renamed Successfully")
      setPrompts(prev => prev.map(p => p.id === renamePrompt.id ? { ...p, title: renameTitle.trim() } : p))
      setRenamePrompt(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to rename workspace")
    } finally {
      setIsSubmitting(false)
    }
  }

  const workspaceSessions = prompts.filter(p => {
    const isW = p.category?.toLowerCase() === 'workspace' || p.platform?.toLowerCase() === 'workspace'
    if (!isW) return false

    if (workspace === 'team') {
      if (!currentTeam || (p as any).team_id !== currentTeam.id) return false
    } else {
      if ((p as any).team_id) return false
    }

    const s = search.toLowerCase()
    const titleMatch = p.title ? p.title.toLowerCase().includes(s) : false
    const contentMatch = p.content ? p.content.toLowerCase().includes(s) : false
    return s === '' || titleMatch || contentMatch
  })

  return (
    <div className="min-h-full w-full max-w-[100vw] overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8 pb-24 text-foreground relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="space-y-8 w-full max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Layers className="h-3.5 w-3.5" />
              Productivity Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Workspace Recall
            </h1>
            <p className="text-muted-foreground mt-2 text-base max-w-2xl font-medium">
              Explore and manage your captured browser window sessions. Instantly recall tab groups across devices or open individual links.
            </p>
          </div>
        </div>

        {/* Rename Modal */}
        <Dialog open={!!renamePrompt} onOpenChange={(open) => !open && setRenamePrompt(null)}>
          <DialogContent className="max-w-md bg-card border-border text-foreground shadow-xl">
            <form onSubmit={handleRenameSubmit}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Rename Workspace Session</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label className="text-foreground font-semibold">Title</Label>
                <Input 
                  value={renameTitle} 
                  onChange={e => setRenameTitle(e.target.value)} 
                  required 
                  className="bg-secondary border-border text-foreground focus-visible:ring-purple-500" 
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRenamePrompt(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Title
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="max-w-md bg-card border-border text-foreground shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Delete Workspace Session?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground font-medium py-2">
              Are you sure you want to delete this captured workspace? All saved tab URLs and window context will be permanently removed.
            </p>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                Delete Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search Bar & Grid */}
        {workspace === 'team' && userTeams.length === 0 ? (
          <TeamOnboarding />
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-4 bg-card/50 border border-border p-2 rounded-xl backdrop-blur-md shadow-sm"
            >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search workspaces by session title or tab URL..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-12 bg-transparent border-none text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>
        </motion.div>

        {/* Responsive Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-5 border border-border bg-card h-[240px] animate-pulse flex flex-col shadow-sm w-full min-w-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-24 h-5 bg-secondary rounded-full" />
                  <div className="w-8 h-8 bg-secondary rounded-md" />
                </div>
                <div className="w-3/4 h-6 bg-secondary rounded-md mb-4" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-8 bg-secondary rounded-lg" />
                  <div className="w-full h-8 bg-secondary rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : workspaceSessions.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-card shadow-sm w-full">
            <Layers className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-foreground font-semibold text-lg">No workspace sessions recorded yet.</p>
            <p className="text-muted-foreground font-medium mt-1">Use your PromptMemory Chrome Extension side panel to click &quot;Save Current Window&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <AnimatePresence>
              {workspaceSessions.map((prompt) => {
                let workspaceTabs: { title?: string; url?: string; favIconUrl?: string }[] = []
                try {
                  workspaceTabs = JSON.parse(prompt.content || '[]')
                } catch (e) {}

                return (
                <motion.div 
                  key={prompt.id}
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="w-full min-w-0 h-full flex flex-col"
                >
                  <div className="glass-card rounded-2xl p-5 bg-card transition-all group border border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/10 relative overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-lg">
                    {/* Glowing Accent Top */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 shadow-sm">
                          <Layers className="h-3 w-3" />
                          {workspaceTabs.length} {workspaceTabs.length === 1 ? 'Tab' : 'Tabs'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <button className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            }
                          />
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground min-w-[160px] font-medium">
                            <DropdownMenuItem 
                              onClick={() => {
                                setRenamePrompt(prompt)
                                setRenameTitle(prompt.title)
                              }} 
                              className="focus:bg-secondary cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename Session
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => setDeleteId(prompt.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-1 line-clamp-2 leading-snug">{prompt.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 font-medium">
                      <Calendar className="h-3 w-3" />
                      {new Date(prompt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <div className="bg-secondary/40 border border-border/60 rounded-xl p-3 mb-4 flex-1 max-h-56 overflow-y-auto space-y-2 custom-scrollbar">
                      {workspaceTabs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">No tab details recorded</p>
                      ) : (
                        workspaceTabs.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs p-2 rounded-lg bg-card/80 border border-border/40 hover:border-purple-500/40 transition-colors shadow-2xs">
                            <TabIcon url={t.url} favIconUrl={t.favIconUrl} />
                            <span className="truncate flex-1 font-medium text-foreground">{t.title || t.url}</span>
                            {t.url && (
                              <a 
                                href={t.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()}
                                title="Open tab in browser"
                                className="text-muted-foreground hover:text-purple-400 transition-colors shrink-0 p-0.5"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                      onClick={() => {
                        workspaceTabs.forEach(t => {
                          if (t.url) window.open(t.url, '_blank');
                        });
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md hover:shadow-purple-500/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {workspaceTabs.length === 1 ? 'Open Saved Tab' : `Restore All ${workspaceTabs.length} Tabs`}
                    </motion.button>
                  </div>
                </motion.div>
                )}
              )}
            </AnimatePresence>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
