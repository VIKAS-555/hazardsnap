-- =========================================================================
-- HAZARDSNAP (CIVIC ALERT) - SUPABASE PRODUCTION DATABASE SCHEMA
-- Hyper-local, photo-first civic hazard logging, real-time safety map &
-- municipal severity triage queue with photographic fix verification.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HAZARDS TABLE
CREATE TABLE IF NOT EXISTS public.hazards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('live_wire', 'open_manhole', 'waterlogging', 'broken_footpath', 'sinkhole', 'fallen_tree', 'other')),
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    severity_score INTEGER NOT NULL DEFAULT 70 CHECK (severity_score >= 0 AND severity_score <= 100),
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'verified_fixed', 'rejected')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    photo_url TEXT,
    voice_note_url TEXT,
    voice_transcript TEXT,
    fix_photo_url TEXT,
    fix_notes TEXT,
    fixed_at TIMESTAMPTZ,
    upvotes_count INTEGER NOT NULL DEFAULT 1,
    reported_by TEXT DEFAULT 'Anonymous Commuter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for ultra-fast spatial search & priority queue sorting
CREATE INDEX IF NOT EXISTS idx_hazards_status ON public.hazards(status);
CREATE INDEX IF NOT EXISTS idx_hazards_severity_score ON public.hazards(severity_score DESC);
CREATE INDEX IF NOT EXISTS idx_hazards_created_at ON public.hazards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hazards_coords ON public.hazards(latitude, longitude);

-- 2. HAZARD CONFIRMATIONS / UPVOTES TABLE (Community validation)
CREATE TABLE IF NOT EXISTS public.hazard_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_id UUID NOT NULL REFERENCES public.hazards(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_hazard_device_vote UNIQUE (hazard_id, device_id)
);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hazards_updated_at ON public.hazards;
CREATE TRIGGER set_hazards_updated_at
    BEFORE UPDATE ON public.hazards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hazard_upvotes ENABLE ROW LEVEL SECURITY;

-- Permissions: Public access for citizen reporting & viewing
CREATE POLICY "Allow public read hazards"
    ON public.hazards FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert hazards"
    ON public.hazards FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update hazards"
    ON public.hazards FOR UPDATE
    USING (true);

CREATE POLICY "Allow public read upvotes"
    ON public.hazard_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert upvotes"
    ON public.hazard_upvotes FOR INSERT
    WITH CHECK (true);

-- Grant privileges to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
