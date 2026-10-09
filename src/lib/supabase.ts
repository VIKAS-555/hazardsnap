import { createClient } from '@supabase/supabase-js';
import { HazardReport } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vltpqzsonqqxxzysaxdv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHBxenNvbnFxeHh6eXNheGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODkxMjgsImV4cCI6MjEwNjk2NTEyOH0.nO1PEvIb3DH_gDstueJE9zOxvIEF8ozntRrU82E7IUg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_KEY = 'hazardsnap_reports_cache_v2';

// Seed mock data for realistic immediate live preview (e.g. Bangalore / Tech Hub coordinates)
const INITIAL_DEMO_HAZARDS: HazardReport[] = [
  {
    id: 'demo-1',
    title: 'High-Tension Live Wire Hanging Over Pavement',
    category: 'live_wire',
    description: '11kV wire snapped from transformer post, sparking near puddle. Pedestrians actively taking detour.',
    severity: 'critical',
    severity_score: 98,
    status: 'reported',
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Near Central Metro Station, MG Road, Ward 112',
    photo_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    voice_transcript: 'Attention, wire is dangling near the electric pole right across the pedestrian crossing!',
    upvotes_count: 14,
    reported_by: 'Rahul S. (Commuter)',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Uncovered 4ft Stormwater Drain / Manhole',
    category: 'open_manhole',
    description: 'Concrete lid broke during heavy truck turn. Completely exposed right next to bus stop curb.',
    severity: 'critical',
    severity_score: 94,
    status: 'in_progress',
    latitude: 12.9752,
    longitude: 77.6012,
    address: 'Opposite State Bank junction, 100ft Road',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861568?auto=format&fit=crop&w=600&q=80',
    voice_transcript: 'Manhole cover smashed in, severe hazard for two-wheelers in evening rain.',
    upvotes_count: 8,
    reported_by: 'Ananya M.',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Deep Waterlogging Submerging Footpath & Curb',
    category: 'waterlogging',
    description: 'Over 2 feet of stagnant rainwater accumulated due to blocked storm drain pipe. Two scooters stalled.',
    severity: 'high',
    severity_score: 82,
    status: 'reported',
    latitude: 12.9698,
    longitude: 77.6085,
    address: 'Underpass entrance, Outer Ring Road link',
    photo_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    upvotes_count: 22,
    reported_by: 'Karthik V.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Caved-in Paver Blocks & Broken Footpath',
    category: 'broken_footpath',
    description: 'Footpath collapsed into drainage trench. Elderly commuters forced onto rapid traffic lane.',
    severity: 'medium',
    severity_score: 64,
    status: 'verified_fixed',
    latitude: 12.9634,
    longitude: 77.5891,
    address: 'Near Government High School, 4th Main',
    photo_url: 'https://images.unsplash.com/photo-1584463699042-3a3782b5fae5?auto=format&fit=crop&w=600&q=80',
    fix_photo_url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80',
    fix_notes: 'Civil Maintenance Unit #4 repaved blocks, reinforced edge curb concrete, and cleared debris.',
    fixed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    upvotes_count: 5,
    reported_by: 'Divya P.',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to get local fallback storage
export function getLocalHazards(): HazardReport[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_HAZARDS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_HAZARDS));
      return INITIAL_DEMO_HAZARDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read from localStorage, using memory defaults', err);
    return INITIAL_DEMO_HAZARDS;
  }
}

export function saveLocalHazards(hazards: HazardReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hazards));
  } catch (err) {
    console.warn('Could not save to localStorage', err);
  }
}

// Fetch all hazards (Supabase with automatic local fallback)
export async function getHazards(): Promise<HazardReport[]> {
  try {
    const { data, error } = await supabase
      .from('hazards')
      .select('*')
      .order('severity_score', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalHazards();
    }
    return data as HazardReport[];
  } catch {
    return getLocalHazards();
  }
}

// Create new hazard report
export async function createHazard(hazard: Omit<HazardReport, 'id' | 'created_at' | 'upvotes_count'>): Promise<HazardReport> {
  const newId = `hz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const fullHazard: HazardReport = {
    ...hazard,
    id: newId,
    created_at: now,
    upvotes_count: 1,
    status: 'reported',
  };

  // Optimistically update local storage
  const current = getLocalHazards();
  saveLocalHazards([fullHazard, ...current]);

  try {
    const { data, error } = await supabase.from('hazards').insert([fullHazard]).select();
    if (error) {
      console.warn('Supabase insert fallback to local:', error.message);
    } else if (data && data[0]) {
      return data[0] as HazardReport;
    }
  } catch (e) {
    console.warn('Supabase offline, saved to local cache:', e);
  }

  return fullHazard;
}

// Upvote / Confirm hazard
export async function upvoteHazard(hazardId: string): Promise<number> {
  const current = getLocalHazards();
  let updatedCount = 1;
  const updated = current.map((h) => {
    if (h.id === hazardId) {
      updatedCount = (h.upvotes_count || 1) + 1;
      // Also slightly boost severity score if community upvotes
      const boostedScore = Math.min(100, (h.severity_score || 50) + 2);
      return { ...h, upvotes_count: updatedCount, severity_score: boostedScore };
    }
    return h;
  });
  saveLocalHazards(updated);

  try {
    await supabase.rpc('increment_upvotes', { row_id: hazardId });
  } catch (e) {
    console.warn('RPC not configured or offline, using local increment', e);
  }

  return updatedCount;
}

// Update hazard status (Municipal actions)
export async function updateHazardStatus(
  hazardId: string,
  status: HazardReport['status'],
  fixData?: { fix_photo_url?: string; fix_notes?: string }
): Promise<HazardReport | null> {
  const current = getLocalHazards();
  let modified: HazardReport | null = null;

  const updated = current.map((h) => {
    if (h.id === hazardId) {
      modified = {
        ...h,
        status,
        ...(fixData?.fix_photo_url ? { fix_photo_url: fixData.fix_photo_url } : {}),
        ...(fixData?.fix_notes ? { fix_notes: fixData.fix_notes } : {}),
        ...(status === 'verified_fixed' ? { fixed_at: new Date().toISOString() } : {}),
      };
      return modified;
    }
    return h;
  });

  saveLocalHazards(updated);

  try {
    await supabase
      .from('hazards')
      .update({
        status,
        ...(fixData || {}),
        ...(status === 'verified_fixed' ? { fixed_at: new Date().toISOString() } : {}),
      })
      .eq('id', hazardId);
  } catch (e) {
    console.warn('Supabase update status failed, cached locally', e);
  }

  return modified;
}
