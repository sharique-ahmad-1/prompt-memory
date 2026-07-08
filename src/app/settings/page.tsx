/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, CreditCard, LogOut, Webhook, Plus, Trash2, Loader2, Globe, Zap, Cpu, Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function Settings() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [webhooks, setWebhooks] = useState<string[]>([])
  const [newWebhook, setNewWebhook] = useState('')
  const [savingWebhooks, setSavingWebhooks] = useState(false)
  const [testingUrl, setTestingUrl] = useState<string | null>(null)

  // AI Provider (Mesh API) state
  const [meshApiKey, setMeshApiKey] = useState('')
  const [meshApiBaseUrl, setMeshApiBaseUrl] = useState('https://api.aifiesta.ai/v1')
  const [meshApiModel, setMeshApiModel] = useState('gpt-4o')
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingAiConfig, setSavingAiConfig] = useState(false)
  const [testingAiConnection, setTestingAiConnection] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '')
      const savedWebhooks = user.user_metadata?.webhooks || []
      setWebhooks(Array.isArray(savedWebhooks) ? savedWebhooks : [])

      const savedKey = user.user_metadata?.mesh_api_key || localStorage.getItem('pm_mesh_api_key') || ''
      const savedBaseUrl = user.user_metadata?.mesh_api_base_url || localStorage.getItem('pm_mesh_api_base_url') || 'https://api.aifiesta.ai/v1'
      const savedModel = user.user_metadata?.mesh_api_model || localStorage.getItem('pm_mesh_api_model') || 'gpt-4o'

      setMeshApiKey(savedKey)
      setMeshApiBaseUrl(savedBaseUrl)
      setMeshApiModel(savedModel)
    } else {
      const localKey = localStorage.getItem('pm_mesh_api_key') || ''
      const localBaseUrl = localStorage.getItem('pm_mesh_api_base_url') || 'https://api.aifiesta.ai/v1'
      const localModel = localStorage.getItem('pm_mesh_api_model') || 'gpt-4o'
      if (localKey) setMeshApiKey(localKey)
      if (localBaseUrl) setMeshApiBaseUrl(localBaseUrl)
      if (localModel) setMeshApiModel(localModel)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      })
      if (error) throw error
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to update profile: " + (err.message || 'Unknown error'))
    }
  }

  const handleSaveAiConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSavingAiConfig(true)
    try {
      localStorage.setItem('pm_mesh_api_key', meshApiKey.trim())
      localStorage.setItem('pm_mesh_api_base_url', meshApiBaseUrl.trim())
      localStorage.setItem('pm_mesh_api_model', meshApiModel.trim())

      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            mesh_api_key: meshApiKey.trim(),
            mesh_api_base_url: meshApiBaseUrl.trim(),
            mesh_api_model: meshApiModel.trim()
          }
        })
        if (error) throw error
      }
      toast.success("AI Fiesta Mesh API configuration saved successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to sync AI configuration to cloud: " + (err.message || 'Unknown error'))
    } finally {
      setSavingAiConfig(false)
    }
  }

  const handleTestAiConnection = async () => {
    if (!meshApiKey.trim()) {
      toast.error("Please enter your Mesh API Key first (`rsk_...`)")
      return
    }
    setTestingAiConnection(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: "User: Test connection to Mesh API.\nAI: Connection verified successfully.",
          provider: 'mesh-api',
          meshConfig: {
            apiKey: meshApiKey.trim(),
            baseUrl: meshApiBaseUrl.trim(),
            model: meshApiModel.trim()
          }
        })
      })
      const data = await res.json()
      if (res.ok && data.executiveSummary) {
        toast.success("Test connection successful! Mesh API is responding.")
      } else {
        toast.error(data.message || data.error || `Connection failed (${res.status})`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error("Network error testing AI connection: " + (err.message || 'Unknown error'))
    } finally {
      setTestingAiConnection(false)
    }
  }

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWebhook.trim() || !newWebhook.startsWith('http')) {
      toast.error("Please enter a valid HTTP/HTTPS URL")
      return
    }
    if (webhooks.includes(newWebhook.trim())) {
      toast.error("Webhook URL already added")
      return
    }
    const updated = [...webhooks, newWebhook.trim()]
    await saveWebhooksToSupabase(updated)
    setNewWebhook('')
  }

  const handleRemoveWebhook = async (urlToRemove: string) => {
    const updated = webhooks.filter(u => u !== urlToRemove)
    await saveWebhooksToSupabase(updated)
  }

  const handleTestWebhook = async (urlToTest: string) => {
    setTestingUrl(urlToTest)
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Test payload fired to ${new URL(urlToTest).hostname}!`)
      } else {
        toast.error(data.error || `Failed with status ${res.status}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to fire test webhook: " + (err.message || 'Network error'))
    } finally {
      setTestingUrl(null)
    }
  }

  const saveWebhooksToSupabase = async (updatedList: string[]) => {
    setSavingWebhooks(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { webhooks: updatedList }
      })
      if (error) throw error
      setWebhooks(updatedList)
      localStorage.setItem('pm_webhooks', JSON.stringify(updatedList))
      toast.success("Webhooks updated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to update webhooks: " + (err.message || 'Unknown error'))
    } finally {
      setSavingWebhooks(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings, AI provider connections, webhooks, and subscription preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/50 border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Details
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="max-w-md bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled className="max-w-md bg-muted/50" />
              <p className="text-[10px] text-muted-foreground">Email is managed through your Auth provider.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 px-6 py-4">
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* AI Fiesta Mesh API Configuration Card */}
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-indigo-500/40 shadow-lg backdrop-blur-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2.5 text-indigo-500 dark:text-indigo-400 text-lg">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              Mesh API Configuration (AI Fiesta)
            </CardTitle>
            <CardDescription>
              Configure your custom OpenAI-compatible Mesh API gateway to power Context Generation across your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meshApiKey" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Mesh API Key</span>
                  <span className="text-[10px] font-normal text-indigo-500">Required (`rsk_...`)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="meshApiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={meshApiKey}
                    onChange={e => setMeshApiKey(e.target.value)}
                    placeholder="rsk_01KX0S7DEE4FETF3TMVW9TC1HH"
                    className="pr-10 font-mono text-xs bg-background/80 border-border/80 focus-visible:ring-indigo-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meshApiModel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Target Model Name
                </Label>
                <Input
                  id="meshApiModel"
                  value={meshApiModel}
                  onChange={e => setMeshApiModel(e.target.value)}
                  placeholder="gpt-4o"
                  className="font-mono text-xs bg-background/80 border-border/80 focus-visible:ring-indigo-500 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meshApiBaseUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gateway Base URL
              </Label>
              <Input
                id="meshApiBaseUrl"
                value={meshApiBaseUrl}
                onChange={e => setMeshApiBaseUrl(e.target.value)}
                placeholder="https://api.aifiesta.ai/v1"
                className="font-mono text-xs bg-background/80 border-border/80 focus-visible:ring-indigo-500 shadow-inner"
              />
              <p className="text-[11px] text-muted-foreground/80 leading-normal">
                OpenAI-compatible gateway endpoint (`process.env.MESH_API_BASE_URL`).
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 px-6 py-4 flex items-center justify-between bg-secondary/10 relative z-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAiConnection}
              disabled={testingAiConnection || savingAiConfig}
              className="gap-2 font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              {testingAiConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-current" />}
              Test Connection
            </Button>
            <Button
              type="button"
              onClick={handleSaveAiConfig}
              disabled={savingAiConfig || testingAiConnection}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20"
            >
              {savingAiConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save AI Configuration
            </Button>
          </CardFooter>
        </Card>

        {/* Webhooks Management Card */}
        <Card className="bg-card/50 border-purple-500/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-500">
              <Webhook className="h-5 w-5" />
              Workflow Automation Webhooks
            </CardTitle>
            <CardDescription>
              Automatically send real-time POST payloads to Zapier, Make, n8n, or custom servers whenever a prompt or visual clip is saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddWebhook} className="flex items-center gap-3 max-w-xl">
              <Input
                value={newWebhook}
                onChange={e => setNewWebhook(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="bg-background/80 font-mono text-xs flex-1 border border-gray-300 focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
              />
              <Button type="submit" disabled={savingWebhooks} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md gap-1.5 shrink-0 transition-all">
                {savingWebhooks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Webhook
              </Button>
            </form>

            <div className="space-y-2.5 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Endpoints ({webhooks.length})</Label>
              {webhooks.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border text-center bg-secondary/20">
                  <Globe className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">No automated webhooks configured</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">Add an endpoint above to start triggering automated workflows on save.</p>
                </div>
              ) : (
                <div className="space-y-2 max-w-xl">
                  {webhooks.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/80 hover:border-purple-500/40 transition-colors group">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" title="Active" />
                        <span className="font-mono text-xs text-foreground truncate">{url}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(url)}
                          disabled={savingWebhooks || testingUrl === url}
                          className="h-8 px-2.5 text-[11px] font-semibold gap-1 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 transition-all shadow-sm"
                          title="Send test payload to verify field mapping"
                        >
                          {testingUrl === url ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWebhook(url)}
                          disabled={savingWebhooks || testingUrl === url}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription Plan
            </CardTitle>
            <CardDescription>You are currently on the Free plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Tier</p>
                  <p className="text-sm text-muted-foreground mt-1">Unlimited usage for now.</p>
                </div>
                <Button variant="outline" className="text-primary border-primary/50 hover:bg-primary/10">Upgrade to Pro</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="destructive" className="gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}