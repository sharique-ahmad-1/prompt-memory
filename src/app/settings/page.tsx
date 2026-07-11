/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, CreditCard, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function Settings() {
  const { user, setUser, refreshUser } = useAuth()
  const [name, setName] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '')
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSaveProfile = async () => {
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      })
      if (error) throw error
      if (updatedUser) {
        setUser(updatedUser)
        if (refreshUser) await refreshUser(updatedUser)
      }
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to update profile: " + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and subscription preferences.</p>
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