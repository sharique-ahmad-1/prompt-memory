/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react/no-unescaped-entities */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Sparkles, AlertCircle, Loader2, Quote, Zap, Database, Mail, Lock, KeyRound, ArrowRight, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/Logo"
import { useRouter } from "next/navigation"

export default function Login() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const errorDesc = params.get('error_description')
      if (errorDesc) {
        setError(errorDesc.replace(/\+/g, ' '))
      } else {
        setError('Authentication failed. Please try again.')
      }
    }
  }, [])

  // Email & Password Sign In / Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (authMode === 'signin') {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInErr) throw signInErr
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      } else {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpErr) throw signUpErr
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication error occurred.'
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password. If you are a new user, please switch to the "Create Account" tab above.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  // Continue with Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      })
      if (error) throw error
    } catch (err: any) {
      const msg = err.message || 'An error occurred during Google login.'
      if (msg.toLowerCase().includes('unsupported provider') || msg.toLowerCase().includes('provider is not enabled')) {
        setError('Google Auth is not enabled in the Supabase Dashboard. Please contact the administrator or sign in with Email/Password.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side: Premium Animated Banner */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-zinc-950 p-12 flex-col justify-between border-r border-border">
        {/* Animated glowing orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" 
        />
        
        {/* Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <Logo size={36} />
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            PromptMemory
            <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">PRO</span>
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 max-w-lg mt-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Never Lose Your AI Context Again
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400"
          >
            Save prompts, preserve project memory, and clip interactive media across sessions effortlessly. Built for enterprise AI power users.
          </motion.p>
        </div>

        {/* Floating Feature Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-3 shadow-2xl hover:border-indigo-500/40 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Database className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Cloud Vault Sync</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">Keep prompts, workspaces, and media clips synced instantly across browser extensions.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-3 shadow-2xl hover:border-pink-500/40 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Custom Theater Mode</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">Explore your saved YouTube Reels and Shorts in an infinite TikTok-style player.</p>
          </motion.div>
        </div>

        {/* Trust Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="relative z-10 flex items-center gap-4 mt-auto pt-8 text-sm text-zinc-500"
        >
          <Quote className="h-5 w-5 text-zinc-700" />
          <p>"The ultimate memory hub for enterprise AI workflows and productivity."</p>
        </motion.div>
      </div>

      {/* Right side: Multi-Option Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center lg:hidden flex flex-col items-center">
            <Logo size={48} className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight">PromptMemory Vault</h1>
          </div>
          
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Sign In / Access Hub</h2>
            <p className="text-sm text-muted-foreground">Select how you want to enter your cloud productivity vault.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-destructive/15 text-destructive border border-destructive/30 rounded-xl py-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <AlertDescription className="ml-2 text-xs font-medium leading-relaxed">{error}</AlertDescription>
            </Alert>
          )}

          {/* Email / Password Tabs */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setError(null); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(null); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Authenticating...' : authMode === 'signin' ? 'Sign In to Workspace' : 'Create Free Workspace'}
              </Button>
            </form>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-xs font-semibold text-muted-foreground">Optional OAuth</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Continue with Google */}
          <div className="space-y-2">
            <Button 
              variant="outline"
              className="w-full h-11 text-xs font-bold rounded-xl border-border hover:bg-muted/50 transition-all flex items-center justify-center gap-3" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 bg-white rounded-full p-[1px]" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google OAuth</span>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground px-4">
              Note: If Google login says <code className="text-pink-400 bg-muted px-1 rounded">Unsupported provider</code>, please make sure Google Auth is enabled in the Supabase Dashboard.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit Encrypted Supabase Cloud Session</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
