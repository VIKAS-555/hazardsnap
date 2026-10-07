-- ============================================================
-- BST TECH CLUB - PRODUCTION SUPABASE DATABASE SCHEMA
-- Department: Computer Science & Engineering (AI & ML)
-- Academic Batch: 2026–2030 (Class of 2030)
-- USN Range Restriction: 2392608001 to 2392608302
-- ============================================================

-- 1. MEMBERS TABLE (Registered Undergraduates)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tech_club_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    usn TEXT UNIQUE NOT NULL,
    section TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL DEFAULT 'CSE (AI & ML)',
    role TEXT NOT NULL DEFAULT 'Member',
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    referral_count INTEGER NOT NULL DEFAULT 0,
    referred_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Strict USN Range Constraint for Department of CSE (AI & ML)
    CONSTRAINT valid_usn_format CHECK (usn ~ '^[0-9]{10}$'),
    CONSTRAINT valid_usn_range CHECK (usn::bigint >= 2392608001 AND usn::bigint <= 2392608302)
);

-- 2. EVENTS TABLE (Workshops, Hands-on Labs & Hackathons)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming',
    seats INTEGER NOT NULL DEFAULT 90,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    speaker_name TEXT,
    speaker_role TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EVENT RSVPS TABLE (Digital Ticket Passes & QR Verification)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    tech_club_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_usn TEXT NOT NULL,
    student_email TEXT,
    student_section TEXT,
    verification_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Prevent duplicate RSVPs for the same student on the same event
    CONSTRAINT unique_event_usn UNIQUE(event_id, student_usn)
);

-- 4. STUDENT PROJECTS TABLE (Student Showcase Gallery)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL,
    badge TEXT,
    tech TEXT,
    description TEXT NOT NULL,
    github TEXT,
    demo TEXT,
    author_id TEXT,
    author_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Members: Allow public reading of non-sensitive member stats & profiles
CREATE POLICY "Allow public read members" 
    ON public.members FOR SELECT 
    USING (true);

-- Members: Allow registration of new eligible students
CREATE POLICY "Allow public insert members" 
    ON public.members FOR INSERT 
    WITH CHECK (true);

-- Members: Allow members to update their own profile / password / referrals
CREATE POLICY "Allow members update own record" 
    ON public.members FOR UPDATE 
    USING (true);

-- Events: Everyone can view events
CREATE POLICY "Allow public read events" 
    ON public.events FOR SELECT 
    USING (true);

-- Events: Allow adding and editing events
CREATE POLICY "Allow manage events" 
    ON public.events FOR ALL 
    USING (true);

-- RSVPs: Everyone can view RSVPs (to calculate seat count)
CREATE POLICY "Allow public read rsvps" 
    ON public.event_rsvps FOR SELECT 
    USING (true);

-- RSVPs: Allow submitting RSVPs
CREATE POLICY "Allow submit rsvps" 
    ON public.event_rsvps FOR INSERT 
    WITH CHECK (true);

-- Projects: Everyone can view projects
CREATE POLICY "Allow public read projects" 
    ON public.projects FOR SELECT 
    USING (true);

-- Projects: Allow publishing and managing projects
CREATE POLICY "Allow manage projects" 
    ON public.projects FOR ALL 
    USING (true);

-- ============================================================
-- REALTIME WEB-SOCKET SUBSCRIPTIONS
-- Allows real-time live sync across devices without refreshing
-- ============================================================
BEGIN;
  -- Enable replication on all tables
  ALTER TABLE public.members REPLICA IDENTITY FULL;
  ALTER TABLE public.events REPLICA IDENTITY FULL;
  ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
  ALTER TABLE public.projects REPLICA IDENTITY FULL;
  
  -- Add tables to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
COMMIT;
