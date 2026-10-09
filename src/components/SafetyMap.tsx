'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HazardReport, CATEGORY_METADATA, HazardCategory } from '../lib/types';
import {
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';
import { upvoteHazard } from '../lib/supabase';
import SafeRoutePlanner from './SafeRoutePlanner';
import { SafeNavigationPlan } from '../lib/routing';

interface SafetyMapProps {
  hazards: HazardReport[];
  onSelectHazard?: (hazard: HazardReport) => void;
  onUpvote?: (hazardId: string) => void;
  onRequestReport?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  focusedHazard?: HazardReport | null;
}

type MapTheme = 'dark' | 'street' | 'satellite';

export default function SafetyMap({
  hazards,
  onSelectHazard,
  onUpvote,
  onRequestReport,
  isExpanded = false,
  onToggleExpand,
  focusedHazard,
}: SafetyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLayersRef = useRef<any[]>([]);
  const simulationMarkerRef = useRef<any>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [filterFixed, setFilterFixed] = useState<boolean>(false);
  const [selectedHazardModal, setSelectedHazardModal] = useState<HazardReport | null>(null);
  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [is3DView, setIs3DView] = useState<boolean>(false);

  // User location for navigation & centering
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  const [activeRoutePlan, setActiveRoutePlan] = useState<SafeNavigationPlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Handle focused hazard from feed click
  useEffect(() => {
    if (focusedHazard && mapInstanceRef.current) {
      setSelectedHazardModal(focusedHazard);
      mapInstanceRef.current.flyTo(
        [focusedHazard.latitude, focusedHazard.longitude],
        16,
        { animate: true, duration: 0.8 }
      );
    }
  }, [focusedHazard]);

  // Adjust size smoothly when expanded or 3D view changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, is3DView]);

  // Fetch initial user GPS
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapInstanceRef.current) {
            updateUserMarker(loc.lat, loc.lng);
          }
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Update user pulse marker
  const updateUserMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const userIcon = L.divIcon({
        className: 'user-gps-pulse',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: rgba(59, 130, 246, 0.45);
              animation: pulse-ring 2.2s infinite;
            "></div>
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #3b82f6;
              border: 2px solid #ffffff;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    });
  };

  // Center to user GPS
  const handleRecenterToUser = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          updateUserMarker(lat, lng);
          mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });
        },
        () => {
          mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { animate: true });
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Apply Tile Layer with dedicated configurations for Dark, Street, and Satellite
  const applyTileLayer = (L: any, map: any, theme: MapTheme) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (theme === 'satellite') {
      // 🛰️ Pristine Esri World Imagery Satellite Tiles
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          className: 'satellite-tiles',
          attribution: '&copy; Esri World Imagery',
          keepBuffer: 6,
          crossOrigin: true,
        }
      ).addTo(map);
    } else if (theme === 'street') {
      // 🗺️ Clean High-Contrast OpenStreetMap
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          className: 'street-tiles',
          attribution: '&copy; OpenStreetMap contributors',
          keepBuffer: 6,
          crossOrigin: true,
        }
      ).addTo(map);
    } else {
      // 🌙 Dark Civic OpenStreetMap
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          className: 'dark-tiles',
          attribution: '&copy; OpenStreetMap contributors',
          keepBuffer: 6,
          crossOrigin: true,
        }
      ).addTo(map);
    }
  };

  // Switch Theme on state change
  useEffect(() => {
    if (mapInstanceRef.current && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        applyTileLayer(L, mapInstanceRef.current, mapTheme);
      });
    }
  }, [mapTheme]);

  // Filter hazards
  const filteredHazards = hazards.filter((h) => {
    if (selectedCategoryFilter !== 'all' && h.category !== selectedCategoryFilter) return false;
    if (!filterFixed && h.status === 'verified_fixed') return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let map = mapInstanceRef.current;
    if (!map) {
      import('leaflet').then((L) => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultLat = hazards[0]?.latitude || userLocation.lat || 12.9716;
        const defaultLng = hazards[0]?.longitude || userLocation.lng || 77.5946;

        map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
        }).setView([defaultLat, defaultLng], 14);

        applyTileLayer(L, map, mapTheme);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        renderMarkers(L, map, filteredHazards);
        updateUserMarker(userLocation.lat, userLocation.lng);
      });
    } else {
      import('leaflet').then((L) => {
        renderMarkers(L, map, filteredHazards);
      });
    }
  }, [filteredHazards]);

  // Render Custom Hazard Markers
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

      // Safety perimeter ring
      if (isCritical && !isFixed) {
        const circle = L.circle([hazard.latitude, hazard.longitude], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 4',
          radius: 65,
        }).addTo(map);
        markersRef.current.push(circle);
      }

      // Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${
              isCritical && !isFixed
                ? `<div class="hazard-pulse-ring" style="background: rgba(239, 68, 68, 0.4);"></div>`
                : ''
            }
            <div style="
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              background: #0f172a; 
              border: 2px solid ${markerColor}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 15px; 
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              cursor: pointer;
            ">
              ${isFixed ? '✅' : meta.icon}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
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

      routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
      routeLayersRef.current = [];

      if (!activeRoutePlan) return;

      if (activeRoutePlan.isDetourRequired) {
        const directPolyline = L.polyline(activeRoutePlan.directRoute.coordinates, {
          color: '#ef4444',
          weight: 3.5,
          opacity: 0.75,
          dashArray: '6, 8',
        }).addTo(map);

        routeLayersRef.current.push(directPolyline);
      }

      const safePolyline = L.polyline(activeRoutePlan.safeRoute.coordinates, {
        color: '#10b981',
        weight: 5,
        opacity: 0.95,
      }).addTo(map);

      routeLayersRef.current.push(safePolyline);
      map.fitBounds(safePolyline.getBounds(), { padding: [50, 50] });
    });
  }, [activeRoutePlan]);

  // Walking simulation
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
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #10b981;
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.9);
          ">🚶</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
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
      }, 350);
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
    <div className="relative w-full h-full bg-slate-100 overflow-hidden map-3d-wrapper rounded-3xl border border-slate-200 shadow-sm">
      {/* 3D / 2D MAP CANVAS */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 transition-transform duration-500 ${
          is3DView ? 'map-3d-tilt' : 'map-2d-flat'
        }`}
      />

      {/* TOP UNIFIED CONTROL BAR */}
      <div className="absolute top-3.5 right-3.5 z-20 pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-2xl shadow-md text-slate-800">
        {/* Theme Toggles */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              mapTheme === 'dark'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Dark Grid"
          >
            🌙 Dark
          </button>
          <button
            onClick={() => setMapTheme('street')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              mapTheme === 'street'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Street Map"
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              mapTheme === 'satellite'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Esri Satellite Imagery"
          >
            🛰️ Satellite
          </button>
        </div>

        {/* 3D Perspective Toggle */}
        <button
          onClick={() => setIs3DView(!is3DView)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            is3DView
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Toggle 3D Drone Perspective"
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D View</span>
        </button>

        {/* Expand / Minimize */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title={isExpanded ? 'Collapse into Split View' : 'Expand to Fullscreen'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-slate-900" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-900" />
            )}
          </button>
        )}

        {/* Center GPS */}
        <button
          onClick={handleRecenterToUser}
          className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Center on My GPS"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* SAFE ROUTE PLANNER FLOATING PANEL */}
      <SafeRoutePlanner
        userLocation={userLocation}
        hazards={hazards}
        onRouteCalculated={setActiveRoutePlan}
        onStartSimulation={handleStartSimulation}
        isSimulating={isSimulating}
        onResetSimulation={handleResetSimulation}
      />

      {/* TOP-LEFT CATEGORY FILTER PILLS */}
      <div className="absolute top-3.5 left-3.5 right-64 sm:right-96 z-10 flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-md">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({hazards.length})
          </button>
          {(Object.keys(CATEGORY_METADATA) as HazardCategory[]).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const isSel = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{meta.icon}</span>
                <span className="hidden md:inline">{meta.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FLOATING ACTION: REPORT BUTTON */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={onRequestReport}
          className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-lg flex items-center gap-2 transition active:scale-95"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Report Hazard in 5s</span>
        </button>
      </div>

      {/* HAZARD DETAIL MODAL / POPUP */}
      {selectedHazardModal && (
        <div className="absolute bottom-16 left-3.5 right-3.5 sm:left-auto sm:right-5 sm:bottom-5 sm:w-96 z-30 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900">
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
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mt-1">
                  {selectedHazardModal.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedHazardModal(null)}
              className="text-slate-400 hover:text-slate-800 p-1"
            >
              ✕
            </button>
          </div>

          {selectedHazardModal.photo_url && (
            <div className="mt-3 rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
              <img
                src={selectedHazardModal.photo_url}
                alt={selectedHazardModal.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {selectedHazardModal.status === 'verified_fixed' && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Fixed by Municipal Team</span>
              </div>
              {selectedHazardModal.fix_photo_url && (
                <div className="rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-100">
                  <img
                    src={selectedHazardModal.fix_photo_url}
                    alt="Fix Verification"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {selectedHazardModal.fix_notes && (
                <p className="text-xs text-slate-600 italic">
                  "{selectedHazardModal.fix_notes}"
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {selectedHazardModal.description}
          </p>

          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>📍 {selectedHazardModal.address || 'Address logged'}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleUpvoteClick(selectedHazardModal.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Confirm Hazard ({selectedHazardModal.upvotes_count || 1})</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
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
