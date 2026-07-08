"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Trash2, ExternalLink, Copy, Check, Filter, Search, 
  Sparkles, Video, Camera, Globe, Tag, Play, Film, Layers, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { TheaterPlayer, TheaterClip } from '@/components/clips/theater-player'

export default function ClipsPage() {
  const [clips, setClips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filtering & Search
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Full-res image view modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = useState<string>('')

  // Theater Mode player state
  const [activeTheaterClipId, setActiveTheaterClipId] = useState<string | null>(null)

  useEffect(() => {
    fetchClips()

    // Real-time Supabase Subscription for multi-tab sync and live background clipper updates
    const channel = supabase
      .channel('clips_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClips((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setClips((prev) => prev.filter((item) => item.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setClips((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchClips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workspace_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClips(data || [])
    } catch (err) {
      console.error('Error fetching clips:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const { error } = await supabase.from('workspace_items').delete().eq('id', deleteId)
      if (error) throw error
      setClips(clips.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete media clip:', err)
    }
  }

  const deleteClipById = async (id: string) => {
    try {
      const { error } = await supabase.from('workspace_items').delete().eq('id', id)
      if (error) throw error
      setClips((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Failed to delete media clip:', err)
    }
  }

  const handleCopy = (text: string, id: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Helper to determine media classification tags and formatting
  const getMediaMeta = (item: any) => {
    const isVid = !!item.embed_url || (item.source_link && (item.source_link.includes('youtube.com') || item.source_link.includes('youtu.be') || item.source_link.includes('/shorts/')))
    const isVertical = item.platform?.toLowerCase() === 'instagram' || item.source_link?.includes('instagram.com') || item.source_link?.includes('/shorts/') || item.embed_url?.includes('/shorts/')
    const isImg = !!item.image_url && !isVid

    let badge = 'Web Note'
    let Icon = Globe
    let badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20'

    if (item.platform?.toLowerCase() === 'youtube' || isVid) {
      badge = isVertical ? 'YouTube Short' : 'YouTube Video'
      Icon = Video
      badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    } else if (item.platform?.toLowerCase() === 'instagram' || item.source_link?.includes('instagram.com')) {
      badge = 'Instagram Reel'
      Icon = Camera
      badgeClass = 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    } else if (isImg) {
      badge = 'Visual Capture'
      Icon = Camera
      badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }

    return { isVid, isVertical, isImg, badge, Icon, badgeClass }
  }

  // Filter and search computation
  const filteredClips = clips.filter((clip) => {
    const matchesPlatform = 
      filterPlatform === 'all' ||
      (filterPlatform === 'youtube' && (clip.platform?.toLowerCase() === 'youtube' || clip.embed_url)) ||
      (filterPlatform === 'instagram' && (clip.platform?.toLowerCase() === 'instagram' || clip.source_link?.includes('instagram.com'))) ||
      (filterPlatform === 'images' && clip.image_url && !clip.embed_url)

    const matchesSearch = 
      !searchQuery ||
      (clip.title && clip.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clip.content && clip.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (clip.tags && clip.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))

    return matchesPlatform && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 select-none">
      {/* Header Banner & Stats */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-xl p-6 rounded-3xl border border-border/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>THEATER VAULT & CAPTURED MEDIA</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Media Vault
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                {clips.length} {clips.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Inspect your saved YouTube Shorts, Instagram Reels, embedded visual cards, and prompt inspirations in high-fidelity native playback.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="flex bg-secondary/80 p-1.5 rounded-2xl border border-border/40 gap-1">
              <button
                onClick={() => setFilterPlatform('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filterPlatform === 'all' 
                    ? 'bg-card text-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Media
              </button>
              <button
                onClick={() => setFilterPlatform('youtube')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  filterPlatform === 'youtube' 
                    ? 'bg-rose-500 text-white shadow-md' 
                    : 'text-muted-foreground hover:text-rose-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => setFilterPlatform('instagram')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  filterPlatform === 'instagram' 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:text-pink-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
              <button
                onClick={() => setFilterPlatform('images')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  filterPlatform === 'images' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:text-purple-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Images</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, caption or #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card/60 backdrop-blur-md border-border/60 rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Clock className="w-4 h-4 text-pink-400" />
            <span>Synced in real-time with Chrome Extension & Suapabase Vault</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-96 rounded-3xl bg-card/40 border border-border/40 animate-pulse flex flex-col justify-between p-5"
              >
                <div className="space-y-3">
                  <div className="h-44 rounded-2xl bg-secondary/50" />
                  <div className="h-5 w-3/4 rounded-lg bg-secondary/70" />
                  <div className="h-4 w-1/2 rounded-lg bg-secondary/40" />
                </div>
                <div className="h-10 rounded-xl bg-secondary/40 w-full" />
              </div>
            ))}
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-20 bg-card/40 backdrop-blur-xl rounded-3xl border border-border/40 p-8 space-y-4 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground shadow-inner">
              <Film className="h-8 w-8 text-pink-500 opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Media Clips Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {searchQuery || filterPlatform !== 'all'
                ? "No saved items match your active filters. Try resetting your search query."
                : "Your media vault is waiting for its first spark. Use the Antigravity Chrome Extension on YouTube Shorts or Instagram Reels to capture media instantly!"}
            </p>
            {(searchQuery || filterPlatform !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(''); setFilterPlatform('all'); }}
                className="rounded-xl font-semibold hover:bg-secondary cursor-pointer"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClips.map((clip) => {
                const { isVid, isVertical, isImg, badge, Icon, badgeClass } = getMediaMeta(clip)
                const isShortOrReel = isVertical

                return (
                  <motion.div
                    key={clip.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-card/80 hover:bg-card backdrop-blur-xl border border-border/60 hover:border-border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Card Top Media Player / Preview */}
                    <div className="relative w-full bg-black/40 overflow-hidden border-b border-border/40 aspect-video flex items-center justify-center">
                      {/* Badge overlay */}
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border backdrop-blur-md shadow-lg ${badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          {badge}
                        </span>
                      </div>

                      {/* Floating Theater Play Trigger Overlay */}
                      <div className="absolute inset-0 z-10 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <button
                          onClick={() => setActiveTheaterClipId(clip.id)}
                          className="pointer-events-auto bg-pink-600 hover:bg-pink-500 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 cursor-pointer hover:scale-105"
                          title="Launch Theater Mode"
                        >
                          <Play className="h-4 w-4 fill-white" />
                          <span className="text-xs">Play in Theater</span>
                        </button>
                      </div>

                      {/* Native Embedded Player vs Image Preview */}
                      {clip.platform?.toLowerCase() === 'instagram' || clip.source_link?.includes('instagram.com') ? (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <iframe
                            src={`${(clip.source_link || clip.embed_url || '').split('?')[0].replace(/\/$/, '')}/embed`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            className="border-0 w-full h-full transform scale-[0.85] pointer-events-none"
                            scrolling="no"
                            allowTransparency={true}
                          />
                        </div>
                      ) : isVid ? (
                        <div className={`w-full h-full flex items-center justify-center bg-black ${isShortOrReel ? 'max-w-[220px] mx-auto' : ''}`}>
                          <iframe
                            src={clip.embed_url}
                            title={clip.title || 'Embedded Video'}
                            className="w-full h-full border-0 pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : isImg ? (
                        <div 
                          className="w-full h-full overflow-hidden cursor-pointer relative group/img"
                          onClick={() => {
                            setSelectedImage(clip.image_url)
                            setSelectedTitle(clip.title || 'Visual Capture')
                          }}
                        >
                          <img
                            src={clip.image_url}
                            alt={clip.title || 'Captured Media'}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-secondary/40 to-card/60">
                          <Sparkles className="w-8 h-8 text-pink-500/60 mb-2" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Prompt Text Note</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 
                            className="font-bold text-base text-foreground line-clamp-1 hover:text-pink-400 transition-colors cursor-pointer"
                            onClick={() => setActiveTheaterClipId(clip.id)}
                            title={clip.title || 'Untitled Media'}
                          >
                            {clip.title || 'Captured Media Note'}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {clip.content || 'No text content or caption extracted for this media item.'}
                        </p>
                      </div>

                      {/* Tags Bar */}
                      <div className="flex flex-wrap gap-1.5 items-center pt-2">
                        {(clip.tags && clip.tags.length > 0 ? clip.tags : ['#Captured', `#${clip.platform || 'Web'}`]).map((tag: string, i: number) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary/80 text-secondary-foreground text-[10px] font-bold"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setActiveTheaterClipId(clip.id)}
                            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-pink-600 hover:bg-pink-500 text-white shadow-sm transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Theater</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(clip.content || clip.title || '', clip.id)}
                            className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-secondary cursor-pointer"
                            title="Copy prompt text or caption"
                          >
                            {copiedId === clip.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span>{copiedId === clip.id ? 'Copied' : 'Copy'}</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          {(clip.source_link || clip.embed_url) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => window.open(clip.source_link || clip.embed_url || '#', '_blank')}
                              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                              title="Open original source URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(clip.id)}
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Remove media clip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full-Resolution Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl bg-card/95 border-border text-foreground shadow-2xl backdrop-blur-xl p-3 sm:p-6 rounded-3xl overflow-hidden">
          <DialogHeader className="px-2 pb-2">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-pink-500" />
              <span>{selectedTitle}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full max-h-[80vh] flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden border border-border/40">
              <img 
                src={selectedImage} 
                alt="Full resolution inspection" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md bg-card border-border text-foreground shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Remove Media Clip?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this captured media clip and its embedded player from your hub.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl bg-rose-600 hover:bg-rose-700 font-semibold shadow-md">
              Delete Clip
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theater Mode Native Player Overlay */}
      <TheaterPlayer
        clips={filteredClips}
        activeClipId={activeTheaterClipId}
        onClose={() => setActiveTheaterClipId(null)}
        onSelectClip={(id) => setActiveTheaterClipId(id)}
        onDelete={(id) => deleteClipById(id)}
        onCopyText={(text, id) => handleCopy(text || '', id)}
        copiedId={copiedId}
      />
    </div>
  )
}
