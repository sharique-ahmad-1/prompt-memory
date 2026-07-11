"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Database, FolderKanban, Sparkles, Settings, ChevronsUpDown, Search, Command, PanelLeftClose, PanelLeftOpen, Layers, Users, Check, Camera } from 'lucide-react'
import { useAuth } from '../auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/Logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Prompt Vault', href: '/vault', icon: Database },
  { name: 'Social Clips', href: '/clips', icon: Camera },
  { name: 'Saved Windows / Tabs', href: '/workspaces', icon: Layers },
  { name: 'Context Generator', href: '/generator', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ setGlobalSearchOpen }: { setGlobalSearchOpen?: (open: boolean) => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, workspace: activeWorkspace, setWorkspace: setActiveWorkspace } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className={`relative flex h-full flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground/70 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 ease-in-out shrink-0 ${
      isSidebarOpen ? 'w-64 min-w-[16rem]' : 'w-16 min-w-[4rem]'
    }`}>
      {/* Workspace Switcher / Header */}
      <div className={`flex h-14 items-center border-b border-sidebar-border transition-colors ${
        isSidebarOpen ? 'px-3 justify-between' : 'px-2 justify-center relative'
      }`}>
        <div className="flex items-center gap-2.5 overflow-hidden text-left min-w-0 flex-1">
          <Logo size={28} />
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="font-semibold text-sm text-sidebar-foreground truncate">
                  Personal Vault
                </span>
              </div>
              <span className="text-[10px] text-sidebar-foreground/50 truncate flex items-center gap-1">
                Private • Free
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className={`p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all shrink-0 cursor-pointer ${
            !isSidebarOpen ? 'absolute -right-3.5 top-3.5 bg-card border border-border shadow-md rounded-full z-30 hover:scale-110 text-primary' : ''
          }`}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Global Search */}
      <div className={`py-4 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        <button 
          onClick={() => setGlobalSearchOpen && setGlobalSearchOpen(true)}
          title={!isSidebarOpen ? "Search (Cmd+K)" : undefined}
          className={`flex items-center gap-2 w-full bg-sidebar-accent/50 hover:bg-sidebar-accent border border-sidebar-border rounded-md py-1.5 text-sm transition-colors text-sidebar-foreground/60 shadow-sm ${
            isSidebarOpen ? 'px-3 justify-between' : 'px-2 justify-center'
          }`}
        >
          <Search className="h-4 w-4 shrink-0" />
          {isSidebarOpen && (
            <>
              <span className="flex-1 text-left truncate">Search...</span>
              <div className="flex items-center gap-0.5">
                <Command className="h-3 w-3" />
                <span className="text-[10px]">K</span>
              </div>
            </>
          )}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        {isSidebarOpen ? (
          <div className="text-[11px] font-bold text-sidebar-foreground/40 mb-3 px-2 tracking-widest mt-2 uppercase">Menu</div>
        ) : (
          <div className="h-3" />
        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isSidebarOpen ? item.name : undefined}
              className={`flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-all ${
                isSidebarOpen ? 'px-2.5' : 'px-2 justify-center'
              } ${
                isActive 
                  ? 'bg-primary/10 text-primary shadow-sm' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-sidebar-foreground/50'}`} />
              {isSidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <Link 
        href="/settings"
        title={!isSidebarOpen ? `${user?.user_metadata?.full_name || 'User'} (${user?.email || ''})` : "Account Settings"}
        className={`block p-3 border-t border-sidebar-border bg-sidebar-accent/20 hover:bg-sidebar-accent/80 transition-all duration-200 cursor-pointer ${!isSidebarOpen ? 'flex justify-center' : ''}`}
      >
        <div className={`flex items-center gap-3 w-full rounded-md p-1.5 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <Avatar className="h-8 w-8 shrink-0 rounded-md border border-sidebar-border shadow-sm">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <div className="flex flex-col text-left flex-1 min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground group-hover:text-primary transition-colors truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'PromptMemory User'}</span>
              <span className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
