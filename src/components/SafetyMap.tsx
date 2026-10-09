'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HazardReport, CATEGORY_METADATA, HazardCategory } from '../lib/types';
import { ThumbsUp, CheckCircle2, AlertTriangle, Filter, Navigation, Eye } from 'lucide-react';
import { upvoteHazard } from '../lib/supabase';
import SafeRoutePlanner from './SafeRoutePlanner';
import { SafeNavigationPlan } from '../lib/routing';

interface SafetyMapProps {
  hazards: HazardReport[];
  onSelectHazard?: (hazard: HazardReport) => void;
  onUpvote?: (hazardId: string) => void;
  onRequestReport?: () => void;
}

export default function SafetyMap({
  hazards,
  onSelectHazard,
  onUpvote,
  onRequestReport,
}: SafetyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayersRef = useRef<any[]>([]);
  const simulationMarkerRef = useRef<any>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [filterFixed, setFilterFixed] = useState<boolean>(false);
  const [selectedHazardModal, setSelectedHazardModal] = useState<HazardReport | null>(null);

  // User location for navigation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  const [activeRoutePlan, setActiveRoutePlan] = useState<SafeNavigationPlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch initial user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (selectedCategoryFilter !== 'all' && h.category !== selectedCategoryFilter) return false;
    if (!filterFixed && h.status === 'verified_fixed') return false;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let map = mapInstanceRef.current;
    if (!map) {
      import('leaflet').then((L) => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultLat = userLocation.lat || hazards[0]?.latitude || 12.9716;
        const defaultLng = userLocation.lng || hazards[0]?.longitude || 77.5946;

        map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([defaultLat, defaultLng], 14);

        // Dark theme tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        renderMarkers(L, map, filteredHazards);
      });
    } else {
      import('leaflet').then((L) => {
        renderMarkers(L, map, filteredHazards);
      });
    }
  }, [filteredHazards]);

  // Render Custom Hazard Markers & Danger Zones
  const renderMarkers = (L: any, map: any, items: HazardReport[]) => {
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    items.forEach((hazard) => {
      const isCritical = hazard.severity === 'critical';
      const isFixed = hazard.status === 'verified_fixed';
      const meta = CATEGORY_METADATA[hazard.category] || CATEGORY_METADATA.other;

      const markerColor = isFixed
        ? '#10b981'
        : isCritical
        ? '#ef4444'
        : hazard.severity === 'high'
        ? '#f97316'
        : '#eab308';

      // 1. Add Danger Buffer Circle for critical items
      if (isCritical && !isFixed) {
        const circle = L.circle([hazard.latitude, hazard.longitude], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          weight: 1,
          dashArray: '4, 4',
          radius: 65, // 65-meter safety buffer
        }).addTo(map);
        markersRef.current.push(circle);
      }

      // 2. Add Custom Icon
      const customIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            ${
              isCritical && !isFixed
                ? `<div class="hazard-pulse-ring" style="background: rgba(239, 68, 68, 0.4);"></div>`
                : ''
            }
            <div style="
              width: 34px; 
              height: 34px; 
              border-radius: 50%; 
              background: #18181b; 
              border: 2px solid ${markerColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 16px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              cursor: pointer;
            ">
              ${isFixed ? '✅' : meta.icon}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([hazard.latitude, hazard.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedHazardModal(hazard);
        if (onSelectHazard) onSelectHazard(hazard);
      });

      markersRef.current.push(marker);
    });
  };

  // Render Route Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear previous route layers
      routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
      routeLayersRef.current = [];

      if (!activeRoutePlan) return;

      // 1. Direct Unsafe Path (Dashed Red Line) if detour was required
      if (activeRoutePlan.isDetourRequired) {
        const directPolyline = L.polyline(activeRoutePlan.directRoute.coordinates, {
          color: '#ef4444',
          weight: 3.5,
          opacity: 0.7,
          dashArray: '6, 8',
        }).addTo(map);

        routeLayersRef.current.push(directPolyline);
      }

      // 2. Safe Avoidance Path (Solid Glowing Emerald / Teal)
      const safePolyline = L.polyline(activeRoutePlan.safeRoute.coordinates, {
        color: '#10b981',
        weight: 5.5,
        opacity: 0.9,
      }).addTo(map);

      routeLayersRef.current.push(safePolyline);

      // Fit map bounds to encompass the safe route
      map.fitBounds(safePolyline.getBounds(), { padding: [60, 60] });
    });
  }, [activeRoutePlan]);

  // Handle Walking Simulation
  const handleStartSimulation = () => {
    if (!activeRoutePlan || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const coords = activeRoutePlan.safeRoute.coordinates;
      if (!coords || coords.length === 0) return;

      setIsSimulating(true);

      if (simulationMarkerRef.current) {
        map.removeLayer(simulationMarkerRef.current);
      }

      const walkerIcon = L.divIcon({
        className: 'simulation-walker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #10b981;
            border: 3px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.9);
          ">🚶</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const startPos = coords[0];
      const marker = L.marker(startPos, { icon: walkerIcon }).addTo(map);
      simulationMarkerRef.current = marker;

      let step = 0;
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

      simulationIntervalRef.current = setInterval(() => {
        step++;
        if (step >= coords.length) {
          if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
          setIsSimulating(false);
          return;
        }
        marker.setLatLng(coords[step]);
      }, 400);
    });
  };

  const handleResetSimulation = () => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (simulationMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(simulationMarkerRef.current);
      simulationMarkerRef.current = null;
    }
    setIsSimulating(false);
  };

  const handleUpvoteClick = async (hazardId: string) => {
    await upvoteHazard(hazardId);
    if (onUpvote) onUpvote(hazardId);
    if (selectedHazardModal && selectedHazardModal.id === hazardId) {
      setSelectedHazardModal((prev) =>
        prev ? { ...prev, upvotes_count: (prev.upvotes_count || 1) + 1 } : null
      );
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-zinc-950 overflow-hidden">
      {/* MAP CANVAS */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* SAFE ROUTE PLANNER FLOATING PANEL */}
      <SafeRoutePlanner
        userLocation={userLocation}
        hazards={hazards}
        onRouteCalculated={setActiveRoutePlan}
        onStartSimulation={handleStartSimulation}
        isSimulating={isSimulating}
        onResetSimulation={handleResetSimulation}
      />

      {/* TOP FLOATING CONTROLS: CATEGORY CHIPS */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Category Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none bg-zinc-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedCategoryFilter === 'all'
                ? 'bg-red-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Hazards ({hazards.length})
          </button>
          {(Object.keys(CATEGORY_METADATA) as HazardCategory[]).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const isSel = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-zinc-800 text-white border border-red-500 shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle Show Fixed */}
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-800 shadow-xl text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={filterFixed}
              onChange={(e) => setFilterFixed(e.target.checked)}
              className="rounded accent-emerald-500 w-3.5 h-3.5"
            />
            <span>Show Fixed ({hazards.filter((h) => h.status === 'verified_fixed').length})</span>
          </label>
        </div>
      </div>

      {/* FLOATING ACTION: REPORT BUTTON */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={onRequestReport}
          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-2xl shadow-red-950/80 flex items-center gap-2.5 transition active:scale-95 border border-red-400/30"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-300" />
          <span>Report Hazard (5 Seconds)</span>
        </button>
      </div>

      {/* HAZARD DETAIL MODAL / POPUP */}
      {selectedHazardModal && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-30 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-2xl text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {CATEGORY_METADATA[selectedHazardModal.category]?.icon || '⚠️'}
              </span>
              <div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    CATEGORY_METADATA[selectedHazardModal.category]?.badgeColor
                  }`}
                >
                  {selectedHazardModal.severity} (Score {selectedHazardModal.severity_score}/100)
                </span>
                <h4 className="font-bold text-sm text-zinc-100 line-clamp-1 mt-1">
                  {selectedHazardModal.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedHazardModal(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Photo */}
          {selectedHazardModal.photo_url && (
            <div className="mt-3 rounded-2xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800">
              <img
                src={selectedHazardModal.photo_url}
                alt={selectedHazardModal.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Fixed Verification Badge */}
          {selectedHazardModal.status === 'verified_fixed' && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Fixed by Municipal Team</span>
              </div>
              {selectedHazardModal.fix_photo_url && (
                <div className="rounded-xl overflow-hidden border border-emerald-800/40 aspect-video">
                  <img
                    src={selectedHazardModal.fix_photo_url}
                    alt="Fix Verification"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {selectedHazardModal.fix_notes && (
                <p className="text-xs text-zinc-300 italic">
                  "{selectedHazardModal.fix_notes}"
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-zinc-300 mt-2 line-clamp-2">
            {selectedHazardModal.description}
          </p>

          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
            <span>📍 {selectedHazardModal.address || 'Address logged'}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              onClick={() => handleUpvoteClick(selectedHazardModal.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Confirm Hazard ({selectedHazardModal.upvotes_count || 1})</span>
            </button>

            <span className="text-[11px] text-zinc-500 font-mono">
              {new Date(selectedHazardModal.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
