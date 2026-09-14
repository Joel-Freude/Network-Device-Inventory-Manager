'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Map, { MapRef, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer } from 'deck.gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/styles/theme.css';
import type { FeatureCollection, Feature, Point, LineString } from 'geojson';

const VECTOR_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'esri-imagery', type: 'raster', source: 'esri' }],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type BaseStyle = 'map' | 'sat';
type ProjectionMode = 'globe' | 'mercator';

interface Device {
  id: string;
  hostname: string;
  ip: string;
  vendor: string;
  model: string;
  site: string;
  lat: number;
  lng: number;
  status: 'online' | 'warning' | 'offline';
}

const STATUS_COLOR: Record<Device['status'], string> = {
  online: '#00ff9d',
  warning: '#ff9f43',
  offline: '#ff4757',
};

const DEFAULT_DEVICES: Device[] = [
  { id: '1', hostname: 'nyc-dc-01', ip: '10.0.0.1', vendor: 'AWS', model: 'DC-01', site: 'New York Data Center', lat: 40.7128, lng: -74.006, status: 'online' },
  { id: '2', hostname: 'switch-02', ip: '10.0.1.1', vendor: 'Juniper', model: 'EX4300', site: 'London', lat: 51.5074, lng: -0.1278, status: 'online' },
  { id: '3', hostname: 'firewall-01', ip: '10.0.2.1', vendor: 'Palo Alto', model: 'PA-5200', site: 'Tokyo', lat: 35.6762, lng: 139.6503, status: 'warning' },
  { id: '4', hostname: 'server-01', ip: '10.0.3.1', vendor: 'Dell', model: 'PowerEdge', site: 'Sydney', lat: -33.8688, lng: 151.2093, status: 'online' },
  { id: '5', hostname: 'ap-01', ip: '10.0.4.1', vendor: 'Ubiquiti', model: 'U6 Pro', site: 'Paris', lat: 48.8566, lng: 2.3522, status: 'offline' },
  { id: '6', hostname: 'router-02', ip: '10.0.5.1', vendor: 'Cisco', model: 'ISR 4000', site: 'Berlin', lat: 52.52, lng: 13.405, status: 'online' },
];

const DATA_CENTER_IDS = new Set(['1', 'dev-002']);
const CONNECTED_SITE_IDS = new Set(['2', '3', '4', '5', '6', 'dev-001', 'dev-003', 'dev-004', 'dev-005', 'dev-006', 'dev-007']);

function devicesToGeoJSON(devices: Device[]): FeatureCollection<Point, Device> {
  return {
    type: 'FeatureCollection',
    features: devices.map((d) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: d,
    })),
  };
}

function arcsToGeoJSON(devices: Device[]): FeatureCollection<LineString> {
  const features: Feature<LineString>[] = [];
  const dc = devices.find((d) => DATA_CENTER_IDS.has(d.id));
  if (!dc) return { type: 'FeatureCollection', features };

  const connected = devices.filter((d) => CONNECTED_SITE_IDS.has(d.id));
  for (const site of connected) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [dc.lng, dc.lat],
          [site.lng, site.lat],
        ],
      },
      properties: {},
    });
  }
  return { type: 'FeatureCollection', features };
}

function arcsToDeckGL(devices: Device[]) {
  const dc = devices.find((d) => DATA_CENTER_IDS.has(d.id));
  if (!dc) return [];
  const connected = devices.filter((d) => CONNECTED_SITE_IDS.has(d.id));
  return connected.map((site) => ({
    source: [dc.lng, dc.lat],
    target: [site.lng, site.lat],
  }));
}

function nightHemisphereGeoJSON(): FeatureCollection<Point> {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const features: Feature<Point>[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const lng = -180 + (360 * i) / steps;
    const lat = 23.44 * Math.sin(((dayOfYear - 81) / 365) * 2 * Math.PI) * Math.cos((hour / 12) * Math.PI);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {},
    });
  }
  return { type: 'FeatureCollection', features };
}

function computeScaleBar(zoom: number, lat: number): { widthPx: number; label: string } {
  const circumference = 40075017;
  const metersPerPx = (circumference * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom + 8);
  const targetMeters = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000].find(
    (m) => m / metersPerPx >= 60
  ) || 1000000;
  return {
    widthPx: Math.max(40, Math.min(160, targetMeters / metersPerPx)),
    label: targetMeters >= 1000 ? `${targetMeters / 1000} km` : `${targetMeters} m`,
  };
}

function setMapProjection(map: any, mode: ProjectionMode) {
  if (!map || typeof map.setProjection !== 'function') return;

  if (mode === 'globe') {
    map.setProjection({ type: 'globe' });
    map.setPitch(-10);
    map.setBearing(0);
  } else {
    map.setProjection({ type: 'globe' });
    map.setPitch(0);
    map.setBearing(0);
  }
}

interface GlobeMapProps {
  initialProjection?: ProjectionMode;
  showDayNight?: boolean;
  onProjectionChange?: (mode: ProjectionMode) => void;
}

export default function GlobeMap({
  initialProjection = 'globe',
  showDayNight = true,
  onProjectionChange,
}: GlobeMapProps) {
  const mapRef = useRef<MapRef>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [ready, setReady] = useState(false);
  const [projection, setProjection] = useState<ProjectionMode>(initialProjection);
  const [baseStyle, setBaseStyle] = useState<BaseStyle>('map');
  const [view, setView] = useState({ lat: 0, lng: 20, zoom: 3 });
  const [cursor, setCursor] = useState<{ lat: number; lng: number } | null>(null);
  const [devices, setDevices] = useState<Device[]>(DEFAULT_DEVICES);
  const [devicesError, setDevicesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/devices`)
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setDevices(data.devices ?? []); })
      .catch(() => { if (!cancelled) setDevicesError(true); });
    return () => { cancelled = true; };
  }, []);

  const handleMove = useCallback((evt: any) => {
    const vs = evt.viewState || evt;
    if (vs && typeof vs.latitude === 'number') {
      setView({ lat: vs.latitude, lng: vs.longitude, zoom: vs.zoom });
    }
  }, []);

  const toggleProjection = useCallback((mode: ProjectionMode) => {
    const map = mapRef.current;
    if (!map || mode === projection) return;
    setMapProjection(map.getMap(), mode);
    setProjection(mode);
    onProjectionChange?.(mode);
  }, [projection, onProjectionChange]);

  const switchBaseStyle = useCallback((next: BaseStyle) => {
    const map = mapRef.current;
    if (!map || next === baseStyle) return;
    setBaseStyle(next);
    const inner = map.getMap();
    if (inner && typeof inner.setStyle === 'function') {
      inner.setStyle(next === 'map' ? VECTOR_STYLE_URL : SATELLITE_STYLE);
    }
  }, [baseStyle]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    setMapProjection(map.getMap(), initialProjection);

    if (!overlayRef.current) {
      const overlay = new MapboxOverlay({ layers: [] });
      map.getMap().addControl(overlay);
      overlayRef.current = overlay;
    }
  }, [ready, initialProjection]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.setProps({
      layers: [
        new ArcLayer({
          id: 'arcs-3d',
          data: arcsToDeckGL(devices),
          getSourcePosition: (d: any) => d.source,
          getTargetPosition: (d: any) => d.target,
          getWidth: 6,
          getSourceColor: [0, 212, 255],
          getTargetColor: [0, 212, 255],
          getHeight: 2,
        }),
      ],
    });
  }, [devices]);

  const scaleBar = computeScaleBar(view.zoom, view.lat);
  const onlineCount = devices.filter((d) => d.status === 'online').length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1 }} className="hud-viewport">
        <Map
          ref={mapRef}
          initialViewState={{ latitude: 0, longitude: 20, zoom: 3 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={VECTOR_STYLE_URL}
          onMove={handleMove}
          onLoad={() => setReady(true)}
          reuseMaps
        >
          <NavigationControl position="bottom-right" />

          <Source id="devices" type="geojson" data={devicesToGeoJSON(devices)}>
            <Layer
              id="devices-circle"
              type="circle"
              paint={{
                'circle-radius': [
                  'case',
                  ['==', ['get', 'site'], 'New York Data Center'],
                  14,
                  8,
                ],
                'circle-color': [
                  'case',
                  ['==', ['get', 'site'], 'New York Data Center'],
                  '#ff4757',
                  ['==', ['get', 'status'], 'online'],
                  STATUS_COLOR.online,
                  ['==', ['get', 'status'], 'warning'],
                  STATUS_COLOR.warning,
                  ['==', ['get', 'status'], 'offline'],
                  STATUS_COLOR.offline,
                  '#00ff9d',
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#0a0a0f',
                'circle-opacity': 0.95,
              }}
            />
          </Source>
        </Map>

        <div
          className="hud-panel"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 6, fontSize: 12, letterSpacing: '0.04em',
          }}
        >
          <span className={`hud-status-dot ${ready ? 'hud-status-dot--live' : ''}`} />
          {devicesError ? 'API OFFLINE' : `${devices.length} DEVICES · ${onlineCount} ONLINE`}
        </div>

        <div style={{ position: 'absolute', bottom: 14, left: 52, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="hud-segmented" role="group" aria-label="View mode">
            <button type="button" className="hud-segment" data-active={projection === 'globe'} onClick={() => toggleProjection('globe')}>3D</button>
            <button type="button" className="hud-segment" data-active={projection === 'mercator'} onClick={() => toggleProjection('mercator')}>2D</button>
            <button type="button" className="hud-segment" data-active={baseStyle === 'map'} onClick={() => switchBaseStyle('map')}>MAP</button>
            <button type="button" className="hud-segment" data-active={baseStyle === 'sat'} onClick={() => switchBaseStyle('sat')}>SAT</button>
          </div>
          <div className="hud-scalebar">
            <div className="hud-scalebar-line" style={{ width: scaleBar.widthPx }} />
            {scaleBar.label}
          </div>
        </div>
      </div>

      <div className="hud-cursorbar">
        <span>CURSOR <b>{cursor ? `${cursor.lat.toFixed(4)}, ${cursor.lng.toFixed(4)}` : '—, —'}</b></span>
        <span>CENTER <b>{view.lat.toFixed(4)}, {view.lng.toFixed(4)}</b></span>
        <span>ZOOM <b>{view.zoom.toFixed(1)}</b></span>
      </div>
    </div>
  );
}
