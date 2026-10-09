import { createClient } from '@supabase/supabase-js';
import { HazardReport } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vltpqzsonqqxxzysaxdv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHBxenNvbnFxeHh6eXNheGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODkxMjgsImV4cCI6MjEwNjk2NTEyOH0.nO1PEvIb3DH_gDstueJE9zOxvIEF8ozntRrU82E7IUg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_KEY = 'hazardsnap_reports_cache_v4';

// Seed mock data for realistic immediate live preview (Bangalore metro grid coordinates)
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
    voice_transcript: 'Attention, wire is dangling near the electric pole right across the pedestrian crossing!',
    upvotes_count: 24,
    reported_by: 'Rahul Sharma',
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
    address: 'Opposite State Bank junction, 100ft Road, Indiranagar',
    voice_transcript: 'Manhole cover smashed in, severe hazard for two-wheelers in evening rain.',
    upvotes_count: 18,
    reported_by: 'Ananya Mukherjee',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Deep Waterlogging Submerging Footpath & Curb',
    category: 'waterlogging',
    description: 'Over 2.5 feet of stagnant rainwater accumulated due to blocked storm drain pipe. Two scooters stalled.',
    severity: 'high',
    severity_score: 84,
    status: 'reported',
    latitude: 12.9698,
    longitude: 77.6085,
    address: 'Sony World Junction Underpass, Koramangala 80ft Road',
    voice_transcript: 'Entire underpass lane flooded, cars taking slow detours onto opposite divider.',
    upvotes_count: 31,
    reported_by: 'Karthik Venkat',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Exposed High-Voltage Junction Box with Burnt Insulation',
    category: 'live_wire',
    description: 'Metal casing torn off by collision. Sparking internal fuses directly accessible to schoolchildren.',
    severity: 'critical',
    severity_score: 96,
    status: 'reported',
    latitude: 12.9352,
    longitude: 77.6245,
    address: 'Near National Public School, 5th Block, Koramangala',
    voice_transcript: 'Transformer enclosure is wide open and humming loudly right beside sidewalk.',
    upvotes_count: 19,
    reported_by: 'Sneha Patel',
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Sunken Sewer Grate Forming 10-Inch Rim Hazard',
    category: 'open_manhole',
    description: 'Circular cast-iron ring caved into asphalt. Sharp jagged metal ring causing tyre bursts.',
    severity: 'high',
    severity_score: 87,
    status: 'in_progress',
    latitude: 12.9815,
    longitude: 77.5928,
    address: 'Cubbon Park Metro Gate 3 Exit, Kasturba Road',
    voice_transcript: 'Deep depression around the drain lid, cyclists nearly losing balance.',
    upvotes_count: 12,
    reported_by: 'Arun Nambiar',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-6',
    title: 'Severe Flash Flooding at Transit Underpass',
    category: 'waterlogging',
    description: '3 feet standing water trapped under railway bridge. Pumping station generator tripped.',
    severity: 'critical',
    severity_score: 92,
    status: 'in_progress',
    latitude: 12.9892,
    longitude: 77.6015,
    address: 'Cantonment Railway Station Underpass, Vasanth Nagar',
    voice_transcript: 'Underpass completely submerged, police barricade needed immediately.',
    upvotes_count: 42,
    reported_by: 'Syed Farhan',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-7',
    title: 'Fallen Gulmohar Tree Branch Entangling Internet & Power Cables',
    category: 'fallen_tree',
    description: 'Heavy 8-meter limb resting across telephone pole, sagging power lines within 5 feet of roadway.',
    severity: 'high',
    severity_score: 79,
    status: 'reported',
    latitude: 12.9298,
    longitude: 77.5834,
    address: '9th Main Road, Jayanagar 4th Block',
    voice_transcript: 'Large branch broke during storm, pulling optical cables across traffic.',
    upvotes_count: 9,
    reported_by: 'Pooja Hegde',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-8',
    title: 'Cracked Slab & Collapsed Trench on Pedestrian Walkway',
    category: 'broken_footpath',
    description: 'Reinforced concrete walkway slab collapsed into drainage chamber. Elderly commuters cannot pass.',
    severity: 'medium',
    severity_score: 68,
    status: 'reported',
    latitude: 12.9784,
    longitude: 77.6408,
    address: 'CMH Road near Metro Pillar 84, Indiranagar',
    voice_transcript: 'Footpath broken right outside hospital entrance, people forced to walk on road.',
    upvotes_count: 15,
    reported_by: 'Vikram Joshi',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-9',
    title: 'Unbarricaded Excavation Pit on Tech Park Service Lane',
    category: 'open_manhole',
    description: 'Gas pipeline utility trench left uncovered overnight without warning blinkers or reflective tape.',
    severity: 'high',
    severity_score: 86,
    status: 'reported',
    latitude: 12.9918,
    longitude: 77.7126,
    address: 'ITPL Main Road, Prestige Shantiniketan junction, Whitefield',
    voice_transcript: 'Open 6-foot trench on service road with no lighting or caution signs.',
    upvotes_count: 27,
    reported_by: 'Deepak Raj',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-10',
    title: 'Caved-in Paver Blocks & Broken Footpath',
    category: 'broken_footpath',
    description: 'Footpath collapsed into drainage trench. Elderly commuters forced onto rapid traffic lane.',
    severity: 'medium',
    severity_score: 64,
    status: 'verified_fixed',
    latitude: 12.9634,
    longitude: 77.5891,
    address: 'Near Government High School, 4th Main, Chamrajpet',
    fix_notes: 'Civil Maintenance Unit #4 repaved blocks, reinforced edge curb concrete, and cleared debris.',
    fixed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    upvotes_count: 11,
    reported_by: 'Divya P.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-11',
    title: 'Snapped BESCOM 440V Secondary Feeder Cable',
    category: 'live_wire',
    description: 'Low-slung insulated cable dragging across pedestrian zebra crossing near metro pillar.',
    severity: 'critical',
    severity_score: 95,
    status: 'verified_fixed',
    latitude: 12.9172,
    longitude: 77.6228,
    address: 'Silk Board Junction, Outer Ring Road Flyover Base',
    fix_notes: 'BESCOM Quick Response Squad #9 tightened tension wire, re-insulated junction, and cleared pavement.',
    fixed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes_count: 36,
    reported_by: 'Naveen Kumar',
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-12',
    title: 'Flooded Service Road Submerging Two-Wheeler Lane',
    category: 'waterlogging',
    description: 'Stormwater backflow from primary drain canal submerging 150-meter corridor.',
    severity: 'high',
    severity_score: 81,
    status: 'verified_fixed',
    latitude: 13.0358,
    longitude: 77.5971,
    address: 'Hebbal Flyover Service Ramp, Bellary Road',
    fix_notes: 'Emergency dewatering pump truck deployed. Drain silt obstruction dredged and cleared.',
    fixed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    upvotes_count: 28,
    reported_by: 'Manoj Gowda',
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
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
