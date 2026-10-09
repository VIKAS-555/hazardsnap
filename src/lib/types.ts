export type HazardCategory =
  | 'live_wire'
  | 'open_manhole'
  | 'waterlogging'
  | 'broken_footpath'
  | 'sinkhole'
  | 'fallen_tree'
  | 'other';

export type HazardSeverity = 'critical' | 'high' | 'medium' | 'low';

export type HazardStatus = 'reported' | 'in_progress' | 'verified_fixed' | 'rejected';

export interface HazardReport {
  id: string;
  title: string;
  category: HazardCategory;
  description?: string;
  severity: HazardSeverity;
  severity_score: number; // 0 - 100
  status: HazardStatus;
  latitude: number;
  longitude: number;
  address?: string;
  photo_url?: string;
  voice_note_url?: string;
  voice_transcript?: string;
  fix_photo_url?: string;
  fix_notes?: string;
  fixed_at?: string;
  upvotes_count: number;
  reported_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface CategoryMeta {
  label: string;
  icon: string;
  baseSeverity: HazardSeverity;
  baseScore: number;
  description: string;
  badgeColor: string;
}

export const CATEGORY_METADATA: Record<HazardCategory, CategoryMeta> = {
  live_wire: {
    label: 'Dangling Live Wire',
    icon: '⚡',
    baseSeverity: 'critical',
    baseScore: 98,
    description: 'High electrocution hazard, immediate danger to pedestrians and motorists',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  open_manhole: {
    label: 'Open Manhole',
    icon: '🕳️',
    baseSeverity: 'critical',
    baseScore: 92,
    description: 'Severe fall & vehicle axle destruction risk, fatal in waterlogged areas',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  waterlogging: {
    label: 'Severe Waterlogging',
    icon: '🌊',
    baseSeverity: 'high',
    baseScore: 78,
    description: 'Submerged hazards, stalling traffic, breeding stagnant vector risks',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  broken_footpath: {
    label: 'Broken Footpath / Paver',
    icon: '🚧',
    baseSeverity: 'medium',
    baseScore: 62,
    description: 'Tripping hazard, forces pedestrians to walk on active roadway',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  sinkhole: {
    label: 'Road Sinkhole / Cavity',
    icon: '⚠️',
    baseSeverity: 'critical',
    baseScore: 95,
    description: 'Structural road collapse, immediate barrier & vehicle risk',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  fallen_tree: {
    label: 'Fallen Tree / Branch',
    icon: '🌳',
    baseSeverity: 'high',
    baseScore: 72,
    description: 'Blockage of road or pavement, tangled potential utility lines',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  other: {
    label: 'Other Danger',
    icon: '🚨',
    baseSeverity: 'medium',
    baseScore: 50,
    description: 'General commuter safety concern or municipal infrastructure defect',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};
