import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Gauge,
  Crosshair,
  Plus,
  Minus,
  Key,
  CheckCircle2,
  Car,
  Compass,
  Radio,
  Layers,
} from 'lucide-react';
import { VehicleProfile, AccidentEvent } from '../../types';

interface GoogleMapViewProps {
  currentCoords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  vehicle: VehicleProfile;
  currentSpeed: number;
  speedLimit: number;
  isDriving: boolean;
  sosCrashEvent?: AccidentEvent | null;
  theme?: 'dark' | 'light';
}

// Child component inside APIProvider to handle map-level interactions (camera pan, traffic layer)
const MapController: React.FC<{
  currentCoords: { latitude: number; longitude: number };
  showTraffic: boolean;
  autoCenter: boolean;
}> = ({ currentCoords, showTraffic, autoCenter }) => {
  const map = useMap();

  // Traffic layer management
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;
    const trafficLayer = new google.maps.TrafficLayer();
    if (showTraffic) {
      trafficLayer.setMap(map);
    } else {
      trafficLayer.setMap(null);
    }
    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, showTraffic]);

  // Smooth pan to coordinates when autoCenter is enabled
  useEffect(() => {
    if (!map || !autoCenter) return;
    map.panTo({
      lat: currentCoords.latitude,
      lng: currentCoords.longitude,
    });
  }, [map, currentCoords.latitude, currentCoords.longitude, autoCenter]);

  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  currentCoords,
  vehicle,
  currentSpeed,
  speedLimit,
  isDriving,
  sosCrashEvent,
  theme = 'dark',
}) => {
  // Configured Map ID provided by user
  const VITE_MAP_ID =
    (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string) ||
    '1455812f5d8a07fd66ac29be';

  // API Key from environment or localStorage fallback
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
      localStorage.getItem('safedrive_google_maps_api_key') ||
      ''
    );
  });

  const [keyInput, setKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [autoCenter, setAutoCenter] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(16);

  const isDark = theme === 'dark';
  const isOverSpeed = currentSpeed > speedLimit;

  // Breadcrumb trace of recent coordinates for telemetry route history
  const [breadcrumbPoints, setBreadcrumbPoints] = useState<
    Array<{ lat: number; lng: number }>
  >([]);

  useEffect(() => {
    if (currentCoords.latitude && currentCoords.longitude) {
      setBreadcrumbPoints((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          Math.abs(last.lat - currentCoords.latitude) < 0.00005 &&
          Math.abs(last.lng - currentCoords.longitude) < 0.00005
        ) {
          return prev;
        }
        return [
          ...prev.slice(-30),
          { lat: currentCoords.latitude, lng: currentCoords.longitude },
        ];
      });
    }
  }, [currentCoords.latitude, currentCoords.longitude]);

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem('safedrive_google_maps_api_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setShowKeyModal(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 20));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 5));

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border shadow-lg transition-colors flex flex-col"
      style={{
        height: '460px',
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Top Telematics Status & Map Controls Ribbon */}
      <div
        className="flex items-center justify-between px-3.5 py-2 text-xs font-telematics z-10 border-b select-none shrink-0"
        style={{
          backgroundColor: isDark ? 'rgba(10, 15, 29, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {apiKey && (
              <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[11px] tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
              Google Maps Live 3D Vector
            </span>
            <span className="text-[9px] font-mono opacity-80">
              Map ID: {VITE_MAP_ID.slice(0, 10)}… • Live GPS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Traffic Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 border transition-all ${
              showTraffic
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'border-white/10 hover:border-white/20'
            }`}
            style={{
              backgroundColor: showTraffic ? undefined : 'var(--color-card)',
              color: showTraffic ? undefined : 'var(--color-text-secondary)',
            }}
            title="Toggle Live Traffic Layer"
          >
            <Layers className="w-3 h-3" />
            <span>Traffic</span>
          </button>

          {/* Key Management Button */}
          <button
            type="button"
            onClick={() => {
              setKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className="p-1.5 rounded-md border hover:opacity-80 transition-all flex items-center justify-center"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: apiKey ? 'var(--color-text-secondary)' : '#f59e0b',
            }}
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Viewport with @vis.gl/react-google-maps */}
      <div className="relative flex-1 w-full h-full min-h-[360px] bg-neutral-900 overflow-hidden">
        {apiKey ? (
          <APIProvider
            apiKey={apiKey}
            libraries={['marker']}
          >
            <Map
              mapId={VITE_MAP_ID}
              defaultCenter={{
                lat: currentCoords.latitude,
                lng: currentCoords.longitude,
              }}
              center={
                autoCenter
                  ? {
                      lat: currentCoords.latitude,
                      lng: currentCoords.longitude,
                    }
                  : undefined
              }
              defaultZoom={16}
              zoom={zoom}
              onZoomChanged={(e) => setZoom(e.detail.zoom)}
              onDragstart={() => setAutoCenter(false)}
              gestureHandling="greedy"
              disableDefaultUI={true}
              colorScheme={isDark ? 'DARK' : 'LIGHT'}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController
                currentCoords={currentCoords}
                showTraffic={showTraffic}
                autoCenter={autoCenter}
              />

              {/* Vehicle Current Position Marker (Advanced Marker Element) */}
              <AdvancedMarker
                position={{
                  lat: currentCoords.latitude,
                  lng: currentCoords.longitude,
                }}
                title={vehicle.name || 'Vehicle'}
                zIndex={100}
              >
                <div className="relative flex items-center justify-center select-none cursor-pointer">
                  {/* Radar Ripple Effect during active drive */}
                  {isDriving && (
                    <div className="absolute w-12 h-12 rounded-full border border-sky-400/50 bg-sky-500/15 animate-ping pointer-events-none" />
                  )}

                  {/* Vehicle Marker Pin Container */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 transition-transform transform hover:scale-110"
                    style={{
                      backgroundColor: isOverSpeed ? '#ef4444' : '#0284c7',
                      borderColor: '#ffffff',
                      boxShadow: isOverSpeed
                        ? '0 0 16px rgba(239, 68, 68, 0.8)'
                        : '0 0 16px rgba(2, 132, 199, 0.8)',
                    }}
                  >
                    <Car className="w-5 h-5 text-white" />
                  </div>

                  {/* Heading Arrow indicator */}
                  <div
                    className="absolute -top-1.5 w-3 h-3 bg-white rotate-45 rounded-xs shadow"
                    style={{
                      borderLeft: '2px solid #0284c7',
                      borderTop: '2px solid #0284c7',
                    }}
                  />
                </div>
              </AdvancedMarker>

              {/* SOS Crash Emergency Location Marker */}
              {sosCrashEvent && (
                <AdvancedMarker
                  position={{
                    lat: sosCrashEvent.coords.latitude,
                    lng: sosCrashEvent.coords.longitude,
                  }}
                  title="SOS Crash Event Zone"
                  zIndex={200}
                >
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="absolute w-14 h-14 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
                    <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-2xl text-white font-bold">
                      <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
                    </div>
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* API Key Prompt Fallback View */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 text-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
              <Key className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">
              Google Maps API Key Required
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              Google Maps Live 3D Vector tiles require an active Google Maps Platform key with Maps JavaScript API enabled.
            </p>
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter Maps API Key</span>
            </button>
          </div>
        )}

        {/* Speed & Safety Telematics HUD Overlay (Top-Left) */}
        <div
          className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xl select-none backdrop-blur-md z-10 transition-colors"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.88)'
              : 'rgba(255, 255, 255, 0.92)',
            borderColor: isOverSpeed ? '#ef4444' : 'var(--color-border)',
            boxShadow: isOverSpeed ? '0 0 12px rgba(239, 68, 68, 0.4)' : undefined,
          }}
        >
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
              Speed
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-black font-telematics ${
                  isOverSpeed ? 'text-red-500' : 'text-sky-400'
                }`}
              >
                {Math.round(currentSpeed)}
              </span>
              <span className="text-[10px] font-semibold opacity-70" style={{ color: 'var(--color-text-secondary)' }}>
                km/h
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700/50 mx-0.5" />

          {/* Speed Limit Ring */}
          <div
            className="w-7 h-7 rounded-full border-2 border-red-500 bg-white text-slate-950 flex flex-col items-center justify-center font-black text-[10px] shadow"
            title={`Road Speed Limit: ${speedLimit} km/h`}
          >
            {speedLimit}
          </div>
        </div>

        {/* Floating Map Zoom & Recenter Controls (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10 select-none">
          <button
            type="button"
            onClick={() => setAutoCenter(true)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-lg backdrop-blur-md transition-all ${
              autoCenter
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-slate-900/80 text-slate-200 border-white/10 hover:bg-slate-800'
            }`}
            title="Recenter Map to Vehicle"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-900/80 backdrop-blur-md divide-y divide-white/10">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-9 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-9 h-9 flex items-center justify-center text-slate-200 hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Driving State Badge (Bottom-Left) */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-md select-none backdrop-blur-md z-10 text-[10px] font-mono"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(255, 255, 255, 0.9)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Radio
            className={`w-3 h-3 ${
              isDriving ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span>
            {isDriving ? 'TELEMETRICS ACTIVE' : 'PARKED / STANDBY'}
          </span>
          <span className="opacity-50">•</span>
          <span>{currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}</span>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Google Maps API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-xs px-2 py-1 rounded-md opacity-70 hover:opacity-100"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Configure your Google Maps Platform API key to render vector tiles with Map ID{' '}
              <code className="text-sky-400 font-mono text-[11px] bg-sky-950/40 px-1 py-0.5 rounded">
                {VITE_MAP_ID}
              </code>
              .
            </p>

            <form onSubmit={handleSaveCustomKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  API Key
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-sky-500"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
