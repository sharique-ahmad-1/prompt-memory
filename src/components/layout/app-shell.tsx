"use client"

import { Sidebar } from "./sidebar"

import { useAuth } from "../auth-provider"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { GlobalSearch } from "../global-search"
import { useState } from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const pathname = usePathname()
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || pathname === '/login') {
    return <main className="min-h-screen bg-background flex flex-col">{children}</main>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar setGlobalSearchOpen={setGlobalSearchOpen} />
      <GlobalSearch open={globalSearchOpen} setOpen={setGlobalSearchOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto custom-scrollbar relative">
        {children}
      </div>
    </div>
  )
}
