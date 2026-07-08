"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export type Team = {
  id: string
  name: string
  created_by: string
  created_at: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string | null
  email: string
  role: string
  status: string
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  workspace: 'personal' | 'team'
  setWorkspace: (ws: 'personal' | 'team') => void
  userTeams: Team[]
  currentTeam: Team | null
  teamMembers: TeamMember[]
  setCurrentTeam: (team: Team | null) => void
  fetchTeams: () => Promise<void>
  createTeam: (name: string) => Promise<{ success: boolean; team?: Team; error?: string }>
  inviteMember: (email: string, role?: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  loading: true, 
  workspace: 'personal', 
  setWorkspace: () => {},
  userTeams: [],
  currentTeam: null,
  teamMembers: [],
  setCurrentTeam: () => {},
  fetchTeams: async () => {},
  createTeam: async () => ({ success: false }),
  inviteMember: async () => ({ success: false })
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspaceState] = useState<'personal' | 'team'>('personal')
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeamState] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const router = useRouter()
  const pathname = usePathname()

  const fetchTeams = async (targetUserId?: string) => {
    const uid = targetUserId || user?.id;
    if (!uid) return;
    const { data: teamsData, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (teamsData && !error) {
      setUserTeams(teamsData);
      if (teamsData.length > 0) {
        const savedTeamId = localStorage.getItem('pm_current_team_id');
        const found = teamsData.find(t => t.id === savedTeamId) || teamsData[0];
        setCurrentTeamState(found);
        
        const { data: membersData } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', found.id);
        if (membersData) setTeamMembers(membersData);
      } else {
        setCurrentTeamState(null);
        setTeamMembers([]);
      }
    }
  };

  const setCurrentTeam = async (team: Team | null) => {
    setCurrentTeamState(team);
    if (team) {
      localStorage.setItem('pm_current_team_id', team.id);
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id);
      if (membersData) setTeamMembers(membersData);
    } else {
      localStorage.removeItem('pm_current_team_id');
      setTeamMembers([]);
    }
  };

  const createTeam = async (teamName: string) => {
    if (!user) return { success: false, error: 'Not logged in' };
    const { data: teamData, error: teamErr } = await supabase
      .from('teams')
      .insert({ name: teamName, created_by: user.id })
      .select()
      .single();
      
    if (teamErr || !teamData) return { success: false, error: teamErr?.message || 'Failed to create team' };
    
    await supabase.from('team_members').insert({
      team_id: teamData.id, user_id: user.id, email: user.email || '', role: 'owner', status: 'active'
    });
    
    await fetchTeams(user.id);
    return { success: true, team: teamData };
  };

  const inviteMember = async (email: string, role = 'member') => {
    if (!currentTeam) return { success: false, error: 'No team selected' };
    const { error } = await supabase.from('team_members').insert({
      team_id: currentTeam.id, email, role, status: 'invited'
    });
    if (error) return { success: false, error: error.message };
    
    const { data: membersData } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', currentTeam.id);
    if (membersData) setTeamMembers(membersData);
    
    return { success: true };
  };

  useEffect(() => {
    const savedWs = localStorage.getItem('pm_workspace') as 'personal' | 'team'
    if (savedWs === 'personal' || savedWs === 'team') {
      setWorkspaceState(savedWs)
    }
  }, [])

  const setWorkspace = (ws: 'personal' | 'team') => {
    setWorkspaceState(ws)
    localStorage.setItem('pm_workspace', ws)
    window.dispatchEvent(new CustomEvent('workspace-change', { detail: ws }))
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      if (u) fetchTeams(u.id);

      if (!session && pathname !== '/login') {
        router.push('/login')
      } else if (session && pathname === '/login') {
        router.push('/')
      }
    })

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const u = session?.user ?? null
      setUser(u)
      setLoading(false)
      if (u) fetchTeams(u.id);
      
      if (!session && pathname !== '/login') {
        router.push('/login')
      } else if (session && pathname === '/login') {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, workspace, setWorkspace,
      userTeams, currentTeam, teamMembers, setCurrentTeam,
      fetchTeams, createTeam, inviteMember 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
