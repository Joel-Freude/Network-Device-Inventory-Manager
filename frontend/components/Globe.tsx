'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/styles/theme.css';
import { setMapProjection, type ProjectionMode } from '@/lib/map-projection';
import { nightHemisphereGeoJSON } from '@/lib/day-night-terminator';
import { computeScaleBar } from '@/lib/scale-bar';
import IconRail from '@/components/IconRail';

const NIGHT_SOURCE_ID = 'night-hemisphere';
const NIGHT_LAYER_ID = 'night-hemisphere-fill';

const VECTOR_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

const SATELLITE_STYLE: maplibregl.StyleSpecification = {
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

type BaseStyle = 'map' | 'sat';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [projection, setProjection] = useState<ProjectionMode>(initialProjection);
  const [baseStyle, setBaseStyle] = useState<BaseStyle>('map');
  const [view, setView] = useState({ lat: 20, lng: 0, zoom: 1.5 });
  const [cursor, setCursor] = useState<{ lat: number; lng: number } | null>(null);

  const attachNightLayer = useCallback((map: maplibregl.Map) => {
    if (!showDayNight || map.getSource(NIGHT_SOURCE_ID)) return;
    map.addSource(NIGHT_SOURCE_ID, { type: 'geojson', data: nightHemisphereGeoJSON() });
    map.addLayer({
      id: NIGHT_LAYER_ID,
      type: 'fill',
      source: NIGHT_SOURCE_ID,
      paint: { 'fill-color': '#000015', 'fill-opacity': 0.35 },
    });
  }, [showDayNight]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: VECTOR_STYLE_URL,
      center: [0, 20],
      zoom: 1.5,
      pitch: 0,
      antialias: true,
    });

    map.on('move', () => {
      const c = map.getCenter();
      setView({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
    });
    map.on('mousemove', (e) => setCursor({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    map.on('mouseout', () => setCursor(null));

    map.on('load', () => {
      setMapProjection(map, initialProjection);
      attachNightLayer(map);
      setReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialProjection, attachNightLayer]);

  useEffect(() => {
    if (!ready || !showDayNight) return;
    const map = mapRef.current;
    if (!map) return;
    const tick = () => {
      const source = map.getSource(NIGHT_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      source?.setData(nightHemisphereGeoJSON());
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [ready, showDayNight]);

  const toggleProjection = useCallback((mode: ProjectionMode) => {
    const map = mapRef.current;
    if (!map || mode === projection) return;
    setMapProjection(map, mode);
    setProjection(mode);
    onProjectionChange?.(mode);
  }, [projection, onProjectionChange]);

  const switchBaseStyle = useCallback((next: BaseStyle) => {
    const map = mapRef.current;
    if (!map || next === baseStyle) return;
    setBaseStyle(next);
    map.setStyle(next === 'map' ? VECTOR_STYLE_URL : SATELLITE_STYLE);
    map.once('style.load', () => {
      setMapProjection(map, projection);
      attachNightLayer(map);
    });
  }, [baseStyle, projection, attachNightLayer]);

  const scaleBar = computeScaleBar(view.zoom, view.lat);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1 }} className="hud-viewport">
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

        <IconRail />

        <div
          className="hud-panel"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 6, fontSize: 12, letterSpacing: '0.04em',
          }}
        >
          <span className={`hud-status-dot ${ready ? 'hud-status-dot--live' : ''}`} />
          {ready ? 'LIVE' : 'CONNECTING'}
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
