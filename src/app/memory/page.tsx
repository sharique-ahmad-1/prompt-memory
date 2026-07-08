/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, BrainCircuit, History, ArrowRight, Loader2 } from 'lucide-react'

type Memory = {
  id: string
  project_id: string
  summary: string
  updated_at: string
  projects: { title: string }
}

export default function MemoryVault() {
  const { user } = useAuth()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')


  async function fetchMemories() {
    setLoading(true)
    const { data } = await supabase
      .from('project_memories')
      .select('*, projects(title)')
      .order('updated_at', { ascending: false })
      
    if (data) setMemories(data as unknown as Memory[])
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchMemories()
  }, [user])

  const filteredMemories = memories.filter(m => 
    m.summary?.toLowerCase().includes(search.toLowerCase()) || 
    m.projects?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Memory</h1>
          <p className="text-muted-foreground mt-1">Access the living project memory documents for all your workspaces.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search memories..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-muted/60"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No memory documents found. Start a project or run the generator.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMemories.map((memory) => (
            <Card key={memory.id} onClick={() => router.push(`/projects/${memory.project_id}`)} className="flex flex-col bg-card/50 backdrop-blur-sm border-muted/60 hover:bg-card hover:border-primary/30 transition-all cursor-pointer">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full line-clamp-1">
                    {memory.projects?.title || 'Unknown Project'}
                  </span>
                </div>
                <CardTitle className="text-base line-clamp-1">Conversation Context</CardTitle>
              </CardHeader>
              <CardContent className="p-5 py-2 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {memory.summary || "No summary provided."}
                </p>
              </CardContent>
              <CardFooter className="p-5 pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <History className="h-3 w-3" />
                  {new Date(memory.updated_at).toLocaleDateString()}
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 hover:bg-primary/20 hover:text-primary transition-colors">
                  View Full
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
