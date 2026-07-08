"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, MoreVertical, Loader2, Edit, Trash2, FolderKanban, Heart, Database, BrainCircuit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { TeamOnboarding } from '@/components/team/team-onboarding'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  promptsCount?: number
  memoriesCount?: number
}

export default function Projects() {
  const { user, workspace, currentTeam, userTeams } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, workspace, currentTeam])

  async function fetchProjects() {
    setLoading(true)
    // Fetch projects
    let query = supabase
      .from('projects')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false })
    if (workspace === 'team') {
      if (!currentTeam) {
        setProjects([])
        setLoading(false)
        return
      }
      query = query.eq('team_id', currentTeam.id)
    } else {
      query = query.is('team_id', null)
    }
    const { data: projs } = await query
    
    if (projs) {
      // Mock or fetch counts
      // For simplicity in this UI, we will do a fast count fetch for all
      const { data: prompts } = await supabase.from('prompts').select('project_id')
      const { data: memories } = await supabase.from('project_memories').select('project_id')
      
      const enriched = projs.map(p => ({
        ...p,
        promptsCount: prompts?.filter(pr => pr.project_id === p.id).length || 0,
        memoriesCount: memories?.filter(m => m.project_id === p.id).length || 0
      }))
      setProjects(enriched)
    }
    setLoading(false)
  }

  const openCreateModal = () => {
    setIsEditMode(false)
    setEditingId(null)
    setNewTitle('')
    setNewDesc('')
    setIsOpen(true)
  }

  const openEditModal = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setIsEditMode(true)
    setEditingId(project.id)
    setNewTitle(project.title)
    setNewDesc(project.description)
    setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTitle.trim()) return
    setIsSubmitting(true)
    
    const payload: { user_id: string; title: string; description: string; team_id?: string } = {
      user_id: user.id,
      title: newTitle.trim(),
      description: newDesc.trim()
    }
    if (workspace === 'team' && currentTeam) {
      payload.team_id = currentTeam.id
    }

    try {
      if (isEditMode && editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success("Project Updated")
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
        toast.success("Project Created")
      }
      setIsOpen(false)
      fetchProjects()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to save project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    // Manually delete dependents to avoid FK constraint errors if cascade is missing
    await supabase.from('project_memories').delete().eq('project_id', deleteId)
    await supabase.from('prompts').delete().eq('project_id', deleteId)

    const { error } = await supabase.from('projects').delete().eq('id', deleteId)
    if (error) {
      toast.error("Failed to delete project")
      console.error(error)
      return
    }
    
    toast.success("Project Deleted")
    setProjects(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
  }

  const toggleFavorite = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    const newStatus = !project.is_favorite
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_favorite: newStatus } : p))
    await supabase.from('projects').update({ is_favorite: newStatus }).eq('id', project.id)
    if (newStatus) {
      toast.success("Project added to favorites")
    }
  }

  const filteredProjects = projects.filter(p => {
    if (workspace === 'team') {
      if (!currentTeam || (p as any).team_id !== currentTeam.id) return false
    } else {
      if ((p as any).team_id) return false
    }
    const s = search.toLowerCase()
    const titleMatch = p.title ? p.title.toLowerCase().includes(s) : false
    const descMatch = p.description ? p.description.toLowerCase().includes(s) : false
    const matchesSearch = s === '' || titleMatch || descMatch
    const matchesFilter = filter === 'favorites' ? p.is_favorite : true
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-full bg-background p-8 max-w-[1600px] mx-auto text-foreground relative pb-24">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="space-y-8 max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm mb-4">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground text-lg max-w-md">Organize your AI workflows, prompts, and memory into dedicated workspaces.</p>
          </motion.div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger 
              render={
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all shadow-primary/20 border border-transparent shrink-0 hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                New Project
              </motion.button>
              }
            />
            <DialogContent className="bg-card border-border text-foreground">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Project' : 'Create Project'}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isEditMode ? 'Update your workspace details.' : 'Start a new AI project space.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground font-semibold">Project Title</Label>
                    <Input 
                      id="title" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)} 
                      placeholder="e.g. Alien Hunters 2" 
                      required 
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-foreground font-semibold">Description</Label>
                    <Input 
                      id="desc" 
                      value={newDesc} 
                      onChange={e => setNewDesc(e.target.value)} 
                      placeholder="Optional description" 
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-violet-600 text-white hover:shadow-lg transition-all font-semibold hover:-translate-y-0.5">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isEditMode ? 'Save Changes' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        {workspace === 'team' && userTeams.length === 0 ? (
          <TeamOnboarding />
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-4 bg-card border border-border p-2 rounded-xl shadow-sm"
            >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-12 bg-transparent border-none text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground font-medium text-foreground"
            />
          </div>
          <div className="w-full sm:w-[200px] border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-2">
            <Select value={filter} onValueChange={(val) => setFilter(val || 'all')}>
              <SelectTrigger className="h-12 bg-transparent border-none shadow-none focus:ring-0 text-foreground font-semibold">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all" className="focus:bg-secondary">All Projects</SelectItem>
                <SelectItem value="favorites" className="focus:bg-secondary text-amber-500 font-semibold">Favorites Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 h-[220px] animate-pulse border border-border flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-xl" />
                    <div className="w-32 h-6 bg-secondary rounded-md" />
                  </div>
                </div>
                <div className="w-full h-12 bg-secondary rounded-md mt-2" />
                <div className="w-full h-8 bg-secondary rounded-md mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-secondary/10">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No projects found.</p>
            <p className="text-muted-foreground/70 mt-1">Adjust your search or create your first workspace!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="glass-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:bg-card hover:shadow-lg transition-all cursor-pointer group flex flex-col h-[240px] relative overflow-hidden hover:-translate-y-1"
                >
                  {/* Glowing Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                        <FolderKanban className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 z-20">
                      <button 
                        onClick={(e) => toggleFavorite(e, project)}
                        className={`h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center transition-all ${project.is_favorite ? 'text-amber-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                      >
                        <Heart className="h-4 w-4" fill={project.is_favorite ? "currentColor" : "none"} />
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger 
                          render={
                            <button onClick={e => e.stopPropagation()} className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground min-w-[160px]">
                          <DropdownMenuItem onClick={(e) => openEditModal(e as unknown as React.MouseEvent, project)} className="focus:bg-secondary cursor-pointer font-medium">
                            <Edit className="h-4 w-4 mr-2" /> Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-medium">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description || <span className="italic opacity-50">No description provided.</span>}
                    </p>
                  </div>
                  
                  {/* Progress / Stats Footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Database className="h-3.5 w-3.5 text-emerald-600" />
                        {project.promptsCount} Prompts
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <BrainCircuit className="h-3.5 w-3.5 text-purple-500" />
                        {project.memoriesCount} Memories
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar visual effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-secondary">
                    <div className="h-full bg-primary/40 w-[45%]" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
          </>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this project and all its data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="bg-transparent border-border text-foreground hover:bg-secondary">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700 shadow-sm">Delete Project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
