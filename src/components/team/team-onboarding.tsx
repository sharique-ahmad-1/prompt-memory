"use client"

import { useState } from 'react'
import { useAuth, Team, TeamMember } from '@/components/auth-provider'
import { Users, Plus, Mail, Shield, Check, Loader2, ArrowRight, Sparkles, Building2, UserCheck, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function TeamOnboarding() {
  const { createTeam, inviteMember, currentTeam, teamMembers, user } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [step, setStep] = useState<'create' | 'invite'>('create')

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    setIsCreating(true)
    const res = await createTeam(teamName.trim())
    setIsCreating(false)
    if (res.success) {
      toast.success(`Team "${teamName}" created successfully!`)
      setStep('invite')
    } else {
      toast.error(res.error || 'Failed to create team')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsInviting(true)
    const res = await inviteMember(inviteEmail.trim())
    setIsInviting(false)
    if (res.success) {
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } else {
      toast.error(res.error || 'Failed to invite member')
    }
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-900 shadow-xl rounded-2xl transition-all">
      {step === 'create' && !currentTeam ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Create a Team Workspace</h2>
              <p className="text-sm text-gray-600">Collaborate on prompt chains, system prompts, and media clips across your organization.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Workspace / Team Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp AI Team, Product Design Vault"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400 transition-all shadow-inner"
                required
              />
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                As the workspace creator, you will be assigned as the **Owner** with full administrative rights to manage members and collaboration.
              </span>
            </div>

            <button
              type="submit"
              disabled={isCreating || !teamName.trim()}
              className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Workspace
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">{currentTeam?.name || 'Team Workspace'}</h2>
                <p className="text-xs text-gray-600">Manage team members and collaboration access</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-bold uppercase tracking-wider">
              Active Team
            </span>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Invite Team Members
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shrink-0"
              >
                {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Send Invite
              </button>
            </div>
          </form>

          {/* Members List */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Workspace Members ({teamMembers.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 uppercase">
                      {m.email.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.email}</p>
                      <span className="text-[10px] text-gray-500 capitalize">{m.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.role === 'owner' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function TeamManagerModal() {
  const { currentTeam, teamMembers, inviteMember } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  if (!currentTeam) return null

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    const res = await inviteMember(email.trim())
    setLoading(false)
    if (res.success) {
      toast.success(`Invited ${email}`)
      setEmail('')
    } else {
      toast.error(res.error || 'Failed to invite')
    }
  }

  return (
    <Dialog>
      <DialogTrigger 
        render={
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-all cursor-pointer">
            <Users className="h-3.5 w-3.5" />
            Manage Team
          </button>
        } 
      />
      <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-2xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Manage {currentTeam.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <form onSubmit={onInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="Invite colleague by email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Invite
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800 max-h-60 overflow-y-auto">
            {teamMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/60 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{m.email}</p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 capitalize">{m.status}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TeamWorkspaceDashboard() {
  const { currentTeam, teamMembers, inviteMember } = useAuth()
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  if (!currentTeam) return null

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsInviting(true)
    const res = await inviteMember(inviteEmail.trim())
    setIsInviting(false)
    if (res.success) {
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } else {
      toast.error(res.error || 'Failed to invite member')
    }
  }

  return (
    <div className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-purple-100 dark:border-purple-900/50 rounded-2xl p-6 shadow-xl text-slate-900 dark:text-white space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{currentTeam.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                Team Vault
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">Manage workspace members, role assignments, and invitations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">
            {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'} Active
          </span>
        </div>
      </div>

      {/* Invite Member Section */}
      <div className="space-y-3 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
        <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
          Invite New Collaborative Member
        </label>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isInviting || !inviteEmail.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20 shrink-0"
          >
            {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Send Invitation
          </button>
        </form>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
          Team Members Directory ({teamMembers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 shadow-sm hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-purple-500/10 dark:bg-zinc-800 border border-purple-500/20 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400 uppercase shrink-0">
                  {m.email.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{m.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 capitalize font-medium">{m.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  m.role === 'owner' ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                }`}>
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
