"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { supabase } from "@/lib/supabase"
import { FolderKanban, Database, Sparkles, LayoutDashboard, BrainCircuit } from "lucide-react"

export function GlobalSearch({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [prompts, setPrompts] = useState<any[]>([])
  const [memories, setMemories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [semanticResults, setSemanticResults] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true)
        const [projRes, promptRes, memRes] = await Promise.all([
          supabase.from('projects').select('id, title, status'),
          supabase.from('prompts').select('id, title, project_id'),
          supabase.from('project_memories').select('id, project_id, projects(title)')
        ])
        
        setProjects(projRes.data || [])
        setPrompts(promptRes.data || [])
        setMemories(memRes.data || [])
        setLoading(false)
      }
      fetchData()
    }
  }, [open])

  useEffect(() => {
    if (!searchQuery) {
      setSemanticResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const json = await res.json()
        if (json.data) {
          setSemanticResults(json.data)
        }
      } catch (err) {
        console.error("Semantic search failed:", err)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command shouldFilter={!searchQuery} className="[&_[data-slot=command-input-wrapper]]:border-b [&_[data-slot=command-input-wrapper]]:px-2 [&_[data-slot=command-input-wrapper]_svg]:opacity-100">
          <CommandInput 
            placeholder="Type a command or search across your workspace..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>
            
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/vault'))}>
                <Database className="mr-2 h-4 w-4" />
                <span>Prompt Vault</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/generator'))}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>AI Context Engine</span>
              </CommandItem>
            </CommandGroup>

            {(projects.length > 0 || prompts.length > 0 || memories.length > 0) && <CommandSeparator />}

            {projects.length > 0 && (
              <CommandGroup heading="Projects">
                {projects.map((project) => (
                  <CommandItem
                    key={`project-${project.id}`}
                    value={`project ${project.title}`}
                    onSelect={() => runCommand(() => router.push(`/workspaces`))}
                  >
                    <FolderKanban className="mr-2 h-4 w-4 text-blue-400" />
                    <span>{project.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {prompts.length > 0 && (
              <CommandGroup heading="Prompts">
                {prompts.map((prompt) => (
                  <CommandItem
                    key={`prompt-${prompt.id}`}
                    value={`prompt ${prompt.title}`}
                    onSelect={() => runCommand(() => router.push(`/vault`))}
                  >
                    <Database className="mr-2 h-4 w-4 text-emerald-600" />
                    <span>{prompt.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {memories.length > 0 && (
              <CommandGroup heading="Memories">
                {memories.map((mem) => (
                  <CommandItem
                    key={`mem-${mem.id}`}
                    value={`memory ${mem.projects?.title}`}
                    onSelect={() => runCommand(() => router.push(`/workspaces`))}
                  >
                    <BrainCircuit className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Memory for {mem.projects?.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {semanticResults.length > 0 && (
              <CommandGroup heading="Semantic Matches">
                {semanticResults.map((result) => (
                  <CommandItem
                    key={`semantic-${result.id}`}
                    value={`semantic ${result.title}`}
                    onSelect={() => runCommand(() => router.push(`/vault`))}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                    <span>{result.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{Math.round(result.similarity * 100)}% match</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
