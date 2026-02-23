-- 1. Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Company Members
-- Links Auth.Users to companies. user_id references auth.users
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- 3. Pipeline Stages
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.pipeline_stages(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lead Timeline Events
CREATE TABLE public.lead_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users
  type TEXT NOT NULL CHECK (type IN ('note', 'stage_change', 'email', 'call', 'meeting')),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI Outputs (Cache)
CREATE TABLE public.ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  input_hash TEXT NOT NULL,
  output_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, input_hash)
);

-- 8. Audit Log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Setup

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper Function to get current user's companies
CREATE OR REPLACE FUNCTION public.user_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
$$;

-- RLS Policies

-- Companies: Users can only see companies they belong to
CREATE POLICY "Users can view their companies"
ON public.companies FOR SELECT
USING (id IN (SELECT public.user_company_ids()));

-- Companies: Only service_role or trigger can insert directly (handled via edge functions/RPC usually)
-- For now, allow authenticated users to create companies. In a real app we'd restrict and use an RPC to ensure members are created too.
CREATE POLICY "Users can create companies"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Companies: Owners/Admins can update
CREATE POLICY "Owners and admins can update companies"
ON public.companies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = id 
    AND company_members.user_id = auth.uid() 
    AND company_members.role IN ('owner', 'admin')
  )
);

-- Company Members: Users can view members of their companies
CREATE POLICY "Users can view members of their companies"
ON public.company_members FOR SELECT
USING (company_id IN (SELECT public.user_company_ids()));

-- Company Members: Users can insert themselves when they create a company 
-- (This policy is needed if they insert themselves directly from the client, though usually done via trigger)
CREATE POLICY "Users can insert members"
ON public.company_members FOR INSERT
TO authenticated
WITH CHECK (true);

-- Company Members: Owners/admins can update
CREATE POLICY "Owners and admins can update members"
ON public.company_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid() 
    AND company_members.role IN ('owner', 'admin')
  )
);

-- Company Members: Owners/admins can delete
CREATE POLICY "Owners and admins can delete members"
ON public.company_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = company_id 
    AND company_members.user_id = auth.uid() 
    AND company_members.role IN ('owner', 'admin')
  )
);

-- Generic Policies for the rest of the tables: "Users can access their company data"

-- Pipeline Stages
CREATE POLICY "Users can access their company pipeline stages"
ON public.pipeline_stages FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));

-- Leads
CREATE POLICY "Users can access their company leads"
ON public.leads FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));

-- Lead Timeline Events
CREATE POLICY "Users can access their company lead timeline events"
ON public.lead_timeline_events FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));

-- Reminders
CREATE POLICY "Users can access their company reminders"
ON public.reminders FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));

-- AI Outputs
CREATE POLICY "Users can access their company ai outputs"
ON public.ai_outputs FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));

-- Audit Log
CREATE POLICY "Users can access their company audit logs"
ON public.audit_log FOR ALL
USING (company_id IN (SELECT public.user_company_ids()));
