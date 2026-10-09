import { HazardReport } from './types';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng]
  distanceMeters: number;
  durationSeconds: number;
  hazardsOnRoute: HazardReport[];
}

export interface SafeNavigationPlan {
  directRoute: RouteResult;
  safeRoute: RouteResult;
  hazardsAvoided: HazardReport[];
  isDetourRequired: boolean;
  extraTimeSeconds: number;
  safetyScore: number; // 0 - 100
}

/**
 * Calculates great-circle distance between two GPS coordinates in meters.
 */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a hazard point is within threshold meters of any segment in the route polyline.
 */
export function findHazardsOnPolyline(
  routeCoords: [number, number][],
  hazards: HazardReport[],
  bufferMeters: number = 65
): HazardReport[] {
  const activeHazards = hazards.filter((h) => h.status !== 'verified_fixed');
  const intercepted: HazardReport[] = [];

  for (const hazard of activeHazards) {
    let minDistance = Infinity;

    for (const [lat, lng] of routeCoords) {
      const d = getDistanceMeters(lat, lng, hazard.latitude, hazard.longitude);
      if (d < minDistance) {
        minDistance = d;
      }
    }

    if (minDistance <= bufferMeters) {
      intercepted.push(hazard);
    }
  }

  return intercepted;
}

/**
 * Fetches walking route geometry from public OSRM engine.
 */
async function fetchOSRMRoute(
  start: RouteCoordinate,
  end: RouteCoordinate,
  viaWaypoint?: RouteCoordinate
): Promise<{ coordinates: [number, number][]; distance: number; duration: number }> {
  try {
    let url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    if (viaWaypoint) {
      url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${viaWaypoint.lng},${viaWaypoint.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0];
      // Convert OSRM [lng, lat] to Leaflet [lat, lng]
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );
      return {
        coordinates: coords,
        distance: route.distance,
        duration: route.duration,
      };
    }
  } catch (err) {
    console.warn('OSRM routing request failed, computing geometric interpolation:', err);
  }

  // Graceful fallback: straight-line or multi-point interpolated geometry
  const steps = 15;
  const coords: [number, number][] = [];
  if (viaWaypoint) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      coords.push([
        start.lat + t * (viaWaypoint.lat - start.lat),
        start.lng + t * (viaWaypoint.lng - start.lng),
      ]);
    }
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      coords.push([
        viaWaypoint.lat + t * (end.lat - viaWaypoint.lat),
        viaWaypoint.lng + t * (end.lng - viaWaypoint.lng),
      ]);
    }
  } else {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      coords.push([
        start.lat + t * (end.lat - start.lat),
        start.lng + t * (end.lng - start.lng),
      ]);
    }
  }

  const dist = getDistanceMeters(start.lat, start.lng, end.lat, end.lng);
  return {
    coordinates: coords,
    distance: dist,
    duration: Math.round((dist / 1.4)), // Average walking speed ~1.4 m/s
  };
}

/**
 * Primary Hazard-Aware Navigation Engine:
 * Generates direct route, checks for hazardous intersections, and computes a safe detour if needed.
 */
export async function calculateSafeRoute(
  start: RouteCoordinate,
  end: RouteCoordinate,
  hazards: HazardReport[]
): Promise<SafeNavigationPlan> {
  // 1. Fetch standard direct path
  const directData = await fetchOSRMRoute(start, end);
  const directHazards = findHazardsOnPolyline(directData.coordinates, hazards, 70);

  const directResult: RouteResult = {
    coordinates: directData.coordinates,
    distanceMeters: directData.distance,
    durationSeconds: directData.duration,
    hazardsOnRoute: directHazards,
  };

  // If no hazards on direct path, direct path IS safe!
  if (directHazards.length === 0) {
    return {
      directRoute: directResult,
      safeRoute: directResult,
      hazardsAvoided: [],
      isDetourRequired: false,
      extraTimeSeconds: 0,
      safetyScore: 100,
    };
  }

  // 2. Compute Detour Waypoint around the highest-threat hazard
  // Pick the most critical hazard on the path
  const primaryHazard = directHazards.reduce((prev, curr) =>
    (curr.severity_score || 0) > (prev.severity_score || 0) ? curr : prev
  );

  // Compute perpendicular offset detour vector (~120 meters buffer away from hazard)
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const length = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001;

  // Normal vector
  const normalLat = -dLng / length;
  const normalLng = dLat / length;

  // Offset ~0.002 degrees (~200 meters)
  const offset = 0.0022;
  const detourWaypoint: RouteCoordinate = {
    lat: primaryHazard.latitude + normalLat * offset,
    lng: primaryHazard.longitude + normalLng * offset,
  };

  // 3. Fetch detour route
  const detourData = await fetchOSRMRoute(start, end, detourWaypoint);
  const detourHazards = findHazardsOnPolyline(detourData.coordinates, hazards, 40);

  const safeResult: RouteResult = {
    coordinates: detourData.coordinates,
    distanceMeters: detourData.distance,
    durationSeconds: detourData.duration,
    hazardsOnRoute: detourHazards,
  };

  const extraTime = Math.max(0, detourData.duration - directData.duration);
  const safetyScore = Math.max(
    60,
    100 - detourHazards.reduce((acc, h) => acc + (h.severity_score > 80 ? 25 : 10), 0)
  );

  return {
    directRoute: directResult,
    safeRoute: safeResult,
    hazardsAvoided: directHazards.filter(
      (dh) => !detourHazards.some((sh) => sh.id === dh.id)
    ),
    isDetourRequired: true,
    extraTimeSeconds: extraTime,
    safetyScore,
  };
}
