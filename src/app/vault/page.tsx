"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { TeamOnboarding, TeamManagerModal } from '@/components/team/team-onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Copy, MoreVertical, Loader2, Edit, Trash2, Database, Command, Check, Heart, Layers, ExternalLink, Globe, FileText, GripVertical, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
    return <Globe className="h-3.5 w-3.5 shrink-0 text-purple-400" />
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

function VisionThumbnail({ url, onOpen }: { url: string; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) return null

  return (
    <div 
      onClick={onOpen}
      className="mb-3 rounded-xl overflow-hidden border border-border/60 bg-secondary/30 h-44 w-full relative group/img cursor-pointer transition-all hover:border-purple-500/40"
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-muted/60 to-secondary/40 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
            <span className="h-4 w-4 rounded-full border-2 border-primary/40 border-t-transparent animate-spin" />
            <span>Loading visual asset...</span>
          </div>
        </div>
      )}
      <img 
        src={url} 
        alt="Scraped visual clip" 
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-44 object-cover group-hover/img:scale-105 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {loaded && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
          <span>🔍 View Full Image</span>
        </div>
      )}
    </div>
  )
}

type Prompt = {
  id: string
  title: string
  category: string
  content: string
  platform?: string
  created_at: string
  is_favorite: boolean
  image_url?: string
  sequence_id?: string
}

const CATEGORIES = ["Video", "Image", "Coding", "Marketing", "Research", "Custom"]

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    Video: "text-blue-600 bg-blue-500/10 border-blue-500/20 shadow-sm",
    Image: "text-violet-600 bg-violet-500/10 border-violet-500/20 shadow-sm",
    Coding: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 shadow-sm",
    Marketing: "text-orange-600 bg-orange-500/10 border-orange-500/20 shadow-sm",
    Research: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20 shadow-sm",
    Workspace: "text-purple-600 bg-purple-500/10 border-purple-500/20 shadow-sm",
    Custom: "text-muted-foreground bg-secondary border-border shadow-sm"
  }
  return colors[cat] || colors.Custom
}

export default function PromptVault() {
  const { user, workspace, setWorkspace, userTeams, currentTeam } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [renamePrompt, setRenamePrompt] = useState<Prompt | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  
  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Multi-Modal & Chaining State
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [chainedPrompts, setChainedPrompts] = useState<Prompt[]>([])
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchPrompts()
    }
  }, [user, workspace, currentTeam])

  async function fetchPrompts() {
    setLoading(true)
    let query = supabase.from('prompts').select('*').order('is_favorite', { ascending: false }).order('created_at', { ascending: false })
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
    const { data } = await query
    if (data) setPrompts(data)
    setLoading(false)
  }

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId(null)
    setNewTitle('')
    setNewCategory('')
    setNewContent('')
    setNewImageUrl('')
    setIsOpen(true)
  }

  const openEditModal = (prompt: Prompt) => {
    setIsEditMode(true)
    setEditingId(prompt.id)
    setNewTitle(prompt.title)
    setNewCategory(prompt.category)
    setNewContent(prompt.content)
    setNewImageUrl(prompt.image_url || '')
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTitle.trim() || !newContent.trim()) return
    setIsSubmitting(true)
    
    const payload: any = {
      user_id: user.id,
      title: newTitle.trim(),
      category: newCategory || 'Custom',
      content: newContent.trim(),
      image_url: newImageUrl.trim() || null,
    }
    if (workspace === 'team' && currentTeam) {
      payload.team_id = currentTeam.id
    }
    
    try {
      if (isEditMode && editingId) {
        const { error } = await supabase.from('prompts').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success("Prompt Updated")
      } else {
        const { error } = await supabase.from('prompts').insert(payload)
        if (error) throw error
        toast.success("Prompt Created")
      }
      setIsOpen(false)
      fetchPrompts()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to save prompt")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('prompts').delete().eq('id', deleteId)
    if (error) {
      toast.error("Failed to delete prompt")
      return
    }
    toast.success("Prompt Deleted")
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
      toast.error(error?.message || "Failed to rename item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success("Prompt Copied Successfully", {
      description: "You can now paste it anywhere.",
    })
    setTimeout(() => {
      if (copiedId === id) setCopiedId(null)
    }, 2000)
  }

  const toggleFavorite = async (prompt: Prompt) => {
    const newStatus = !prompt.is_favorite
    setPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, is_favorite: newStatus } : p))
    await supabase.from('prompts').update({ is_favorite: newStatus }).eq('id', prompt.id)
    if (newStatus) {
      toast.success("Added to favorites")
    }
  }

  const filteredPrompts = prompts.filter(p => {
    const isW = p.category?.toLowerCase() === 'workspace' || p.platform?.toLowerCase() === 'workspace' || p.category?.toLowerCase() === 'social clip'
    if (isW) return false

    if (workspace === 'team') {
      if (!currentTeam || (p as any).team_id !== currentTeam.id) return false
    } else {
      if ((p as any).team_id) return false
    }

    const s = search.toLowerCase()
    const titleMatch = p.title ? p.title.toLowerCase().includes(s) : false
    const contentMatch = p.content ? p.content.toLowerCase().includes(s) : false
    const matchesSearch = s === '' || titleMatch || contentMatch
    
    if (filterCategory === 'favorites') {
      return matchesSearch && p.is_favorite
    }
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-full w-full max-w-[100vw] overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8 pb-24 text-foreground relative">
      {/* Background glow constrained by an absolute inset wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="space-y-8 w-full max-w-6xl mx-auto relative z-10">
        
        {/* Collaborative Team Banner */}
        {workspace === 'team' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>Enterprise Team Vault</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Shared</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Collaborative prompts and snippets shared across your organization.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary/80 text-foreground border border-border">
                {user?.user_metadata?.team_members_count || 1} {user?.user_metadata?.team_members_count === 1 ? 'Member' : 'Members'} Active
              </span>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm mb-4">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{workspace === 'team' ? 'Team Prompt Vault' : 'Prompt Vault'}</h1>
            <p className="text-muted-foreground font-medium text-lg max-w-md">{workspace === 'team' ? "Your team's shared library of reusable, context-rich AI prompts." : "Your personal library of reusable, context-rich AI prompts."}</p>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {workspace === 'team' && currentTeam && <TeamManagerModal />}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger 
              render={
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all shadow-sm shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  New Prompt
                </motion.button>
              } 
            />
            <DialogContent className="max-w-2xl bg-card border-border text-foreground shadow-xl">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{isEditMode ? 'Edit Prompt' : 'Create Prompt'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-semibold">Title</Label>
                      <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. System Architect Persona" required className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-semibold" htmlFor="category">Category</Label>
                      <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                        <SelectTrigger className="bg-secondary border-border text-foreground focus:ring-primary">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="focus:bg-secondary focus:text-foreground cursor-pointer">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Image URL (Optional)</Label>
                    <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://... (or scraped visual clip)" className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Prompt Content</Label>
                    <Textarea 
                      value={newContent} 
                      onChange={e => setNewContent(e.target.value)} 
                      placeholder="You are an expert..." 
                      className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary font-mono text-sm leading-relaxed"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-violet-600 text-white font-semibold hover:shadow-lg transition-all w-full sm:w-auto">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isEditMode ? 'Save Changes' : 'Save Prompt'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {workspace === 'team' && userTeams.length === 0 ? (
          <TeamOnboarding />
        ) : (
          <>
            {/* Command Bar / Search */}
            <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center gap-4 bg-card/50 border border-border p-2 rounded-xl backdrop-blur-md shadow-sm"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by title, content, or tag..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-12 bg-transparent border-none text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 text-foreground"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-secondary px-2 py-1 rounded text-muted-foreground text-xs font-mono font-semibold border border-border">
              <Command className="h-3 w-3" /> F
            </div>
          </div>
          <div className="w-full sm:w-[200px] border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-2">
            <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
              <SelectTrigger className="h-12 bg-transparent border-none shadow-none focus:ring-0 text-foreground font-semibold">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all" className="focus:bg-secondary font-semibold">All Categories</SelectItem>
                <SelectItem value="favorites" className="focus:bg-secondary text-amber-500 font-bold">Favorites Only</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="focus:bg-secondary font-medium">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Responsive Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="glass-card rounded-2xl p-5 border border-border bg-card h-[200px] animate-pulse flex flex-col shadow-sm w-full min-w-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-4 bg-secondary rounded-full" />
                  <div className="w-8 h-8 bg-secondary rounded-md" />
                </div>
                <div className="w-3/4 h-6 bg-secondary rounded-md mb-3" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 bg-secondary rounded-md" />
                  <div className="w-full h-3 bg-secondary rounded-md" />
                  <div className="w-2/3 h-3 bg-secondary rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          workspace === 'team' ? (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/80 p-8 max-w-xl mx-auto my-12">
              <div className="h-16 w-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-inner">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No team prompts found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                You are currently in "{currentTeam?.name || 'Team Workspace'}". Create a new prompt above or switch to your personal vault.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setWorkspace('personal')} variant="outline" className="rounded-xl font-semibold">
                  Switch to Personal Vault
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-card shadow-sm w-full">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-semibold text-lg">No prompts found.</p>
              <p className="text-muted-foreground font-medium mt-1">Adjust your search or create a new prompt.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            <AnimatePresence>
              {filteredPrompts.map((prompt) => {
                const isWorkspace = prompt.category?.toLowerCase() === 'workspace';
                let workspaceTabs: { title?: string; url?: string; favIconUrl?: string }[] = [];
                if (isWorkspace) {
                  try {
                    workspaceTabs = JSON.parse(prompt.content || '[]');
                  } catch (e) {}
                }

                return (
                <motion.div 
                  key={prompt.id}
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="w-full min-w-0 h-full flex flex-col"
                >
                  <div className={`glass-card rounded-2xl p-5 bg-card transition-all group border relative overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-lg ${isWorkspace ? 'border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/10' : 'border-border hover:border-primary/30 hover:shadow-primary/5'}`}>
                    {/* Glowing Accent Top */}
                    <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity ${isWorkspace ? 'from-transparent via-purple-500/50 to-transparent' : 'from-transparent via-primary/30 to-transparent'}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold tracking-wider uppercase border px-2.5 py-0.5 rounded-full ${getCategoryColor(prompt.category)}`}>
                          {prompt.category || 'Custom'}
                        </span>
                        {isWorkspace && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 shadow-sm">
                            <Layers className="h-3 w-3" />
                            {workspaceTabs.length} {workspaceTabs.length === 1 ? 'Tab' : 'Tabs'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => toggleFavorite(prompt)}
                          className={`h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center transition-all ${prompt.is_favorite ? 'text-amber-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                        >
                          <Heart className="h-4 w-4" fill={prompt.is_favorite ? "currentColor" : "none"} />
                        </button>
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
                              Rename
                            </DropdownMenuItem>
                            {!isWorkspace && (
                              <DropdownMenuItem onClick={() => openEditModal(prompt)} className="focus:bg-secondary cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Edit Content
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer" onClick={() => setDeleteId(prompt.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-3 line-clamp-2 leading-snug">{prompt.title}</h3>
                    
                    {isWorkspace ? (
                      <div className="bg-secondary/40 border border-border/60 rounded-xl p-3 mb-6 flex-1 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
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
                                  title="Open single tab"
                                  className="text-muted-foreground hover:text-purple-400 transition-colors shrink-0 p-0.5"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="relative mb-6 flex-1">
                        {prompt.image_url && (
                          <VisionThumbnail url={prompt.image_url} onOpen={() => setSelectedImage(prompt.image_url || null)} />
                        )}
                        <p className="text-sm text-muted-foreground font-mono font-medium leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {prompt.content}
                        </p>
                        {/* Fade out for long text */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {new Date(prompt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2">
                        {isWorkspace ? (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              try {
                                const tabs = JSON.parse(prompt.content);
                                if (Array.isArray(tabs)) {
                                  tabs.forEach(t => {
                                    const u = typeof t === 'string' ? t : t.url;
                                    if (u) window.open(u, '_blank');
                                  });
                                }
                              } catch (e) {
                                toast.error('Failed to reopen workspace URLs');
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:opacity-95"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            🔗 Open Workspace ({workspaceTabs.length})
                          </motion.button>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (!chainedPrompts.some(p => p.id === prompt.id)) {
                                  setChainedPrompts(prev => [...prev, prompt]);
                                  toast.success(`Added "${prompt.title}" to sequence!`);
                                } else {
                                  toast.info('Prompt is already in your chain');
                                }
                                setIsSequenceModalOpen(true);
                              }}
                              title="Link to execution sequence"
                              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition-colors shadow-sm"
                            >
                              <span>🔗</span>
                              <span>Chain</span>
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCopy(prompt.id, prompt.content)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors border ${copiedId === prompt.id ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm' : 'bg-secondary hover:bg-secondary/80 text-foreground border-border shadow-sm'}`}
                            >
                              {copiedId === prompt.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copiedId === prompt.id ? 'Copied' : 'Copy'}
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}
          </>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-card border-border text-foreground shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Delete Prompt</DialogTitle>
            <div className="text-muted-foreground font-medium text-sm mt-2">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="bg-transparent border-border text-foreground hover:bg-secondary">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 hover:shadow-md transition-all">Delete Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renamePrompt} onOpenChange={(open) => !open && setRenamePrompt(null)}>
        <DialogContent className="max-w-md bg-card border-border text-foreground shadow-xl">
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold">Rename {renamePrompt?.category?.toLowerCase() === 'workspace' ? 'Workspace Session' : 'Prompt'}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label className="font-semibold">Title</Label>
              <Input 
                value={renameTitle} 
                onChange={e => setRenameTitle(e.target.value)} 
                placeholder="Enter new title..." 
                required 
                className="bg-secondary border-border text-foreground focus-visible:ring-primary" 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenamePrompt(null)} className="bg-transparent border-border text-foreground hover:bg-secondary">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold shadow-sm">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Chain Bar */}
      <AnimatePresence>
        {chainedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-card border border-purple-500/40 p-3 rounded-2xl shadow-2xl shadow-purple-500/20 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 px-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">🔗</span>
              <div>
                <h4 className="text-xs font-bold text-foreground">Active Chain</h4>
                <p className="text-[10px] text-muted-foreground">{chainedPrompts.length} {chainedPrompts.length === 1 ? 'step' : 'steps'} linked</p>
              </div>
            </div>
            <Button
              onClick={() => setIsSequenceModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 h-auto rounded-xl shadow-md hover:opacity-95 cursor-pointer"
            >
              Open Builder
            </Button>
            <button
              onClick={() => setChainedPrompts([])}
              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              title="Clear sequence"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Chaining Sequence Modal */}
      <Dialog open={isSequenceModalOpen} onOpenChange={setIsSequenceModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">🔗</span>
              Prompt Chaining Sequence Builder
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Link multiple prompts together to execute multi-step AI reasoning workflows in order.
            </p>
          </DialogHeader>

          <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {chainedPrompts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl bg-secondary/20">
                <p className="text-sm font-medium text-muted-foreground mb-1">Your prompt sequence is empty</p>
                <p className="text-xs text-muted-foreground/70">Click the "🔗 Chain" button on any prompt card in your vault to add steps.</p>
              </div>
            ) : (
              chainedPrompts.map((step, idx) => (
                <motion.div 
                  key={`${step.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  draggable={true}
                  onDragStart={() => setDraggedIdx(idx)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => {
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      const newArr = [...chainedPrompts];
                      const [removed] = newArr.splice(draggedIdx, 1);
                      newArr.splice(idx, 0, removed);
                      setChainedPrompts(newArr);
                      setDraggedIdx(null);
                      toast.success(`Moved "${removed.title}" to Step ${idx + 1}`);
                    }
                  }}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border relative group cursor-grab active:cursor-grabbing transition-all duration-200 ${
                    draggedIdx === idx 
                      ? 'bg-purple-500/20 border-purple-500 shadow-2xl scale-[0.98] opacity-60 ring-2 ring-purple-500/30 z-50' 
                      : 'bg-secondary/30 border-border/80 hover:border-purple-500/40 hover:shadow-md hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center justify-center text-muted-foreground/40 group-hover:text-purple-500 transition-colors pt-1">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                    {idx < chainedPrompts.length - 1 && (
                      <div className="w-0.5 h-8 bg-primary/30 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-foreground truncate">{step.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-card border border-border font-semibold text-muted-foreground uppercase">{step.category || 'Custom'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono line-clamp-2 bg-card/60 p-2 rounded border border-border/50">
                      {step.content}
                    </p>
                  </div>
                  <button 
                    onClick={() => setChainedPrompts(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove from chain"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-border pt-4">
            <Button 
              variant="outline" 
              onClick={() => setChainedPrompts([])}
              disabled={chainedPrompts.length === 0}
              className="text-xs bg-transparent border-border text-foreground hover:bg-secondary cursor-pointer"
            >
              Clear Chain
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSequenceModalOpen(false)}
                className="bg-transparent border-border text-foreground hover:bg-secondary cursor-pointer"
              >
                Close
              </Button>
              <Button
                disabled={chainedPrompts.length === 0}
                onClick={() => {
                  const sequenceText = chainedPrompts
                    .map((p, i) => `### Step ${i + 1}: ${p.title}\n${p.content}`)
                    .join('\n\n---\n\n');
                  navigator.clipboard.writeText(sequenceText);
                  toast.success("Complete prompt sequence copied to clipboard!");
                }}
                className="bg-gradient-to-r from-primary to-purple-600 text-white font-bold gap-2 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Copy Full Sequence ({chainedPrompts.length})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-card border-border p-2 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          {selectedImage && (
            <img src={selectedImage} alt="Full resolution clip preview" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
