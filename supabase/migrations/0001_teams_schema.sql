-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'invited',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, email)
);

-- 3. Add team_id to prompts table
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function for RLS (Prevents infinite recursion in Postgres policies)
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS TABLE (team_id UUID) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email')
    UNION
    SELECT id FROM public.teams WHERE created_by = auth.uid();
$$;

-- 6. Policies for Teams
DROP POLICY IF EXISTS "Users can view teams they belong to or created" ON public.teams;
CREATE POLICY "Users can view teams they belong to or created"
    ON public.teams FOR SELECT
    USING (id IN (SELECT public.get_my_team_ids()));

DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team owners can update teams" ON public.teams;
CREATE POLICY "Team owners can update teams"
    ON public.teams FOR UPDATE
    USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team owners can delete teams" ON public.teams;
CREATE POLICY "Team owners can delete teams"
    ON public.teams FOR DELETE
    USING (auth.uid() = created_by);

-- 7. Policies for Team Members
DROP POLICY IF EXISTS "Users can view members of their teams" ON public.team_members;
CREATE POLICY "Users can view members of their teams"
    ON public.team_members FOR SELECT
    USING (team_id IN (SELECT public.get_my_team_ids()));

DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
CREATE POLICY "Team owners can manage team members"
    ON public.team_members FOR ALL
    USING (
        team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
    );

DROP POLICY IF EXISTS "Members can update their own status" ON public.team_members;
CREATE POLICY "Members can update their own status"
    ON public.team_members FOR UPDATE
    USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
    WITH CHECK (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'));

-- 8. Trigger for updated_at timestamps on teams
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
