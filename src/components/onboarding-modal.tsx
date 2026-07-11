"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Bookmark, Film, PlayCircle, CheckCircle2, ArrowRight, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'

export function OnboardingModal() {
  const { user, setUser, refreshUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      const hasName = Boolean(user.user_metadata?.full_name && user.user_metadata.full_name.trim())
      const isCompletedLocally = localStorage.getItem(`pm_onboarding_done_${user.id}`) === 'true'

      if (!hasName && (!isCompletedLocally || !user.user_metadata?.onboarding_done)) {
        setIsOpen(true)
        setStep(1)
      } else if (hasName && !isCompletedLocally && !user.user_metadata?.onboarding_done) {
        setFullName(user.user_metadata.full_name)
        setIsOpen(true)
        setStep(2)
      }
    } else {
      setIsOpen(false)
    }
  }, [user])

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error("Please enter your name to personalize your Vault")
      return
    }
    setIsSaving(true)
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      })
      if (error) throw error
      if (updatedUser) {
        setUser(updatedUser)
        if (refreshUser) await refreshUser()
      }
      toast.success(`Welcome to PromptMemory Vault, ${fullName.trim()}!`)
      setStep(2)
    } catch (err: any) {
      console.error(err)
      toast.error("Error saving profile name: " + (err.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteTutorial = async () => {
    if (user) {
      localStorage.setItem(`pm_onboarding_done_${user.id}`, 'true')
      supabase.auth.updateUser({
        data: { onboarding_done: true }
      }).then(({ data: { user: updatedUser } }) => {
        if (updatedUser) setUser(updatedUser)
      }).catch(() => {})
    }
    setIsOpen(false)
    toast.success("You are all set to supercharge your workflow!")
  }

  if (!user || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing until completed or at least name saved
      if (!open && step === 2) {
        handleCompleteTutorial()
      }
    }}>
      <DialogContent className="sm:max-w-[500px] bg-card border border-border/80 shadow-2xl p-6 rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {step === 1 ? (
          <form onSubmit={handleSaveName} className="space-y-6">
            <DialogHeader className="space-y-2 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                <User className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Welcome to PromptMemory Vault ✨</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Let&apos;s get your workspace set up. What should we call you inside your personal context hub?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="fullNameInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Full Name
              </Label>
              <Input
                id="fullNameInput"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="h-11 text-base bg-secondary/40 border-border/80 focus-visible:ring-primary shadow-inner"
                autoFocus
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSaving || !fullName.trim()} className="w-full h-11 font-semibold gap-2 shadow-lg shadow-primary/20">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Continue to Quick Tutorial
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <DialogHeader className="space-y-2 text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">3-Step Power Workflow</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Here is how PromptMemory turns your browser sessions into actionable engineering assets:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-secondary/30 border border-border/60 hover:border-primary/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">1. Save Prompts & Open Tabs</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Highlight text anywhere on ChatGPT, Claude, or Google to save high-value prompts instantly, or snapshot all browser tabs with one click.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-secondary/30 border border-border/60 hover:border-purple-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">2. Clip Media Vault</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Click the floating &apos;M&apos; icon button on YouTube or Instagram to save video clips, timestamps, and images directly into your Vault.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-secondary/30 border border-border/60 hover:border-pink-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">3. Theater & AI Continuation</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Generate instant continuity briefs with AI or launch immersive Theater mode to replay your saved media alongside prompt workflows.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={handleCompleteTutorial} className="w-full h-11 font-semibold gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Get Started in My Vault
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
