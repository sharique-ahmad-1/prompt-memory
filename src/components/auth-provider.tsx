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
  setUser: (user: User | null) => void
  refreshUser: (updatedUser?: User) => Promise<void>
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
  inviteMember: async () => ({ success: false }),
  setUser: () => {},
  refreshUser: async () => {}
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
    const userId = user?.id || 'offline_user';
    let teamData: any = null;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({ name: teamName, created_by: userId })
        .select()
        .single();
      if (!error && data) {
        teamData = data;
        await supabase.from('team_members').insert({
          team_id: teamData.id, user_id: userId, email: user?.email || 'owner@team.com', role: 'owner', status: 'active'
        });
      }
    } catch {}

    if (!teamData) {
      teamData = {
        id: 'team_' + Date.now(),
        name: teamName,
        created_by: userId,
        created_at: new Date().toISOString()
      };
      try {
        await supabase.from('workspaces').insert({
          id: teamData.id,
          title: teamName,
          user_id: userId
        });
      } catch {}
    }

    const updatedTeams = [teamData, ...userTeams];
    setUserTeams(updatedTeams);
    setCurrentTeamState(teamData);
    localStorage.setItem('pm_current_team_id', teamData.id);
    if (user?.id) fetchTeams(user.id).catch(() => {});

    return { success: true, team: teamData };
  };

  const inviteMember = async (email: string, role = 'member') => {
    if (!currentTeam) return { success: false, error: 'No team selected' };
    try {
      await supabase.from('team_members').insert({
        team_id: currentTeam.id, email, role, status: 'invited'
      });
    } catch {}
    
    const newMember: TeamMember = {
      id: 'mem_' + Date.now(),
      team_id: currentTeam.id,
      user_id: 'invited_' + Date.now(),
      email,
      role: role as any,
      status: 'invited',
      created_at: new Date().toISOString()
    };
    
    setTeamMembers(prev => [...prev, newMember]);
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
    const checkAndSetAuth = (session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) fetchTeams(session.user.id);

      if (!session && pathname !== '/login') {
        router.push('/login')
      } else if (session && pathname === '/login') {
        router.push('/')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      checkAndSetAuth(session)
    })

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAndSetAuth(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const refreshUser = async (updatedUser?: User) => {
    if (updatedUser) {
      setUser(updatedUser)
    }
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      const { data: { session: newSession } } = await supabase.auth.getSession()
      if (newSession?.user) {
        setUser(newSession.user)
        setSession(newSession)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, workspace, setWorkspace,
      userTeams, currentTeam, teamMembers, setCurrentTeam,
      fetchTeams, createTeam, inviteMember, setUser, refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
