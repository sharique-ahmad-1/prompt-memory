'use client'

import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronUp, ChevronDown, ExternalLink, Copy, Check, 
  Trash2, Video, Camera, Globe, Sparkles, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface TheaterClip {
  id: string
  title?: string | null
  content?: string | null
  image_url?: string | null
  embed_url?: string | null
  source_link?: string | null
  platform?: string | null
  created_at: string
  tags?: string[]
}

interface TheaterPlayerProps {
  clips: TheaterClip[]
  activeClipId: string | null
  onClose: () => void
  onSelectClip: (clipId: string) => void
  onDelete: (clipId: string) => void
  onCopyText: (text: string | null | undefined, id: string) => void
  copiedId: string | null
}

export const TheaterPlayer: React.FC<TheaterPlayerProps> = ({
  clips,
  activeClipId,
  onClose,
  onSelectClip,
  onDelete,
  onCopyText,
  copiedId,
}) => {
  const currentIndex = clips.findIndex((c) => c.id === activeClipId)
  const currentClip = clips[currentIndex]

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectClip(clips[currentIndex - 1].id)
    }
  }, [currentIndex, clips, onSelectClip])

  const handleNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      onSelectClip(clips[currentIndex + 1].id)
    }
  }, [currentIndex, clips, onSelectClip])

  useEffect(() => {
    if (!activeClipId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeClipId, handlePrev, handleNext, onClose])

  if (!activeClipId || !currentClip) return null

  const isVertical = 
    currentClip.platform?.toLowerCase() === 'instagram' ||
    currentClip.source_link?.includes('instagram.com') ||
    currentClip.source_link?.includes('/shorts/') ||
    currentClip.embed_url?.includes('/shorts/') ||
    currentClip.tags?.some((t) => t.toLowerCase() === '#short' || t.toLowerCase() === '#reel' || t.toLowerCase() === '#vertical')

  const getPlatformIcon = (p?: string | null) => {
    const pl = (p || '').toLowerCase()
    if (pl.includes('youtube')) return <Video className="h-4 w-4 text-rose-500" />
    if (pl.includes('instagram')) return <Camera className="h-4 w-4 text-pink-500" />
    return <Globe className="h-4 w-4 text-indigo-500" />
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-hidden"
        onClick={onClose}
      >
        {/* Top Header Bar */}
        <div 
          className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto bg-card/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-border/40 flex items-center gap-3 shadow-xl max-w-md sm:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 rounded-xl bg-secondary flex items-center justify-center">
              {getPlatformIcon(currentClip.platform)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-foreground truncate">
                {currentClip.title || 'Playable Media Clip'}
              </h3>
              <p className="text-[11px] text-muted-foreground capitalize">
                {currentClip.platform || 'Web Capture'} • {new Date(currentClip.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="pointer-events-auto bg-card/80 hover:bg-rose-600 hover:text-white text-foreground transition-all duration-200 p-3 rounded-2xl border border-border/40 shadow-xl flex items-center gap-2 cursor-pointer group"
            title="Close Theater Mode (Esc)"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-xs font-bold hidden sm:inline">Esc</span>
          </motion.button>
        </div>

        {/* Floating Up/Down Infinite Scroll Controls on Right */}
        <div 
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="secondary"
            disabled={currentIndex <= 0}
            onClick={handlePrev}
            className="h-12 w-12 rounded-2xl bg-card/80 hover:bg-card text-foreground border border-border/60 shadow-xl disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 transition-all cursor-pointer"
            title="Previous Clip (Arrow Up / K)"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>

          <div className="px-3 py-1.5 rounded-xl bg-card/80 backdrop-blur-md border border-border/40 text-[11px] font-extrabold text-foreground shadow-md">
            {currentIndex + 1} / {clips.length}
          </div>

          <Button
            size="icon"
            variant="secondary"
            disabled={currentIndex >= clips.length - 1}
            onClick={handleNext}
            className="h-12 w-12 rounded-2xl bg-card/80 hover:bg-card text-foreground border border-border/60 shadow-xl disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 transition-all cursor-pointer"
            title="Next Clip (Arrow Down / J)"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Center Stage Player */}
        <div 
          className="relative w-full max-w-6xl h-[82vh] flex items-center justify-center my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentClip.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`bg-black rounded-3xl border border-border/40 overflow-hidden shadow-2xl relative flex items-center justify-center ${
                isVertical 
                  ? 'w-full max-w-[420px] h-[75vh]' 
                  : 'w-full max-w-4xl aspect-video max-h-[75vh]'
              }`}
            >
              {currentClip.platform?.toLowerCase() === 'instagram' || currentClip.source_link?.includes('instagram.com') ? (
                <iframe
                  src={`${(currentClip.source_link || currentClip.embed_url || '').split('?')[0].replace(/\/$/, '')}/embed`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="border-0 w-full h-full bg-white dark:bg-black"
                  scrolling="no"
                  allowTransparency={true}
                />
              ) : currentClip.embed_url ? (
                <iframe
                  src={currentClip.embed_url}
                  title={currentClip.title || 'Embedded Media'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : currentClip.image_url ? (
                <img
                  src={currentClip.image_url}
                  alt={currentClip.title || 'Captured media'}
                  className="w-full h-full object-contain bg-black/60"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-card via-background to-card">
                  <Sparkles className="h-12 w-12 text-pink-500 mb-4 animate-pulse" />
                  <h4 className="font-bold text-lg text-foreground mb-2">{currentClip.title || 'Text Capture'}</h4>
                  <p className="text-sm text-muted-foreground max-w-md whitespace-pre-wrap overflow-y-auto max-h-60 p-4 bg-secondary/50 rounded-2xl border border-border/40">
                    {currentClip.content || 'No text extracted'}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Info & Action Bar */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-full sm:max-w-2xl z-30 bg-card/90 backdrop-blur-2xl border border-border/60 rounded-3xl p-4 sm:px-6 shadow-2xl flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs sm:text-sm text-foreground/90 font-medium line-clamp-2 leading-relaxed flex-1">
              {currentClip.content || "No caption text extracted for this media clip."}
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCopyText(currentClip.content, currentClip.id)}
              className="shrink-0 h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-secondary hover:bg-secondary/80 cursor-pointer"
            >
              {copiedId === currentClip.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedId === currentClip.id ? 'Copied' : 'Copy Text'}</span>
            </Button>
          </div>

          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              {(currentClip.tags && currentClip.tags.length > 0 ? currentClip.tags : ['#Media', `#${currentClip.platform || 'Web'}`]).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary/80 text-secondary-foreground text-[10px] font-bold">
                  <Tag className="h-2.5 w-2.5 opacity-60" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {(currentClip.source_link || currentClip.embed_url) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(currentClip.source_link || currentClip.embed_url || '#', '_blank')}
                  className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-border/80 hover:bg-secondary cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Original URL</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onDelete(currentClip.id)
                  if (clips.length <= 1) onClose()
                }}
                className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-md"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
