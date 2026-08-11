'use client';

import { useRef, useEffect, useMemo } from 'react';
import createGlobe from 'cobe';
import { Device, Location } from '@/lib/api';

interface MatrixGlobeProps {
  devices: Device[];
  locations: Location[];
  className?: string;
  /** Optional connections to draw as animated arcs between two lat/lng points */
  arcs?: {
    from: [number, number];
    to: [number, number];
    color?: [number, number, number];
    id?: string;
  }[];
  arcColor?: [number, number, number];
  arcWidth?: number;
  arcHeight?: number;
  onMarkerClick?: (marker: Marker) => void;
  selectedMarkerId?: string | null;
  isRotationPaused?: boolean;
  targetMarkerLocation?: [number, number] | null;
}

export interface Marker {
  location: [number, number];
  size: number;
  color: [number, number, number];
  id: string;
  label?: string;
}

export default function MatrixGlobe({ devices, locations, className = '', arcs = [], arcColor = [0.3, 0.5, 1], arcWidth = 0.5, arcHeight = 0.5, onMarkerClick, selectedMarkerId, isRotationPaused = false, targetMarkerLocation = null }: MatrixGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<any>(null);
  const phi = useRef(0);
  const theta = useRef(0.2);
  const isRotationPausedRef = useRef(isRotationPaused);
  const targetMarkerLocationRef = useRef(targetMarkerLocation);
  const previousTargetLocation = useRef(targetMarkerLocation);
  const originalPhi = useRef(0);
  const originalTheta = useRef(0.2);
  const isReturningToOriginal = useRef(false);

  // Create markers from devices with valid locations
  const markers = useMemo(() => {
    const deviceLocations = devices
      .filter(device => device.location_id)
      .map(device => {
        const location = locations.find(loc => loc.id === device.location_id);
        if (location && location.latitude && location.longitude) {
          return {
            location: [location.latitude, location.longitude] as [number, number],
            size: 0.03 + (device.device_type === 'router' ? 0.02 : 0), // Routers are slightly larger
            id: `device-${device.id}`,
            color: [0.1, 0.8, 0.3] as [number, number, number], // Matrix green
            label: device.hostname || device.ip_address || `Device ${device.id}`
          } as Marker;
        }
        return null;
      })
      .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

    // Add some default locations if no devices with coordinates exist
    if (deviceLocations.length === 0) {
      return [
        { location: [40.7128, -74.0060] as [number, number], size: 0.03, color: [0.1, 0.8, 0.3] as [number, number, number], id: 'nyc', label: 'New York' } as Marker,
        { location: [51.5074, -0.1278] as [number, number], size: 0.05, color: [0.2, 0.9, 0.4] as [number, number, number], id: 'london', label: 'London' } as Marker,
        { location: [35.6762, 139.6503] as [number, number], size: 0.04, color: [0.15, 0.85, 0.35] as [number, number, number], id: 'tokyo', label: 'Tokyo' } as Marker,
        { location: [48.8566, 2.3522] as [number, number], size: 0.03, color: [0.1, 0.8, 0.3] as [number, number, number], id: 'paris', label: 'Paris' } as Marker,
        { location: [-33.8688, 151.2093] as [number, number], size: 0.03, color: [0.1, 0.8, 0.3] as [number, number, number], id: 'sydney', label: 'Sydney' } as Marker,
        { location: [3.8300535205218154, 11.491438725213422] as [number, number], size: 0.06, color: [1.0, 0.5, 0.0] as [number, number, number], id: 'cameroon', label: 'Cameroon' } as Marker, // Cameroon - center point
      ];
    }

    return deviceLocations;
  }, [devices, locations]);

  // Update refs when props change
  useEffect(() => {
    isRotationPausedRef.current = isRotationPaused;
  }, [isRotationPaused]);

  useEffect(() => {
    const previousValue = previousTargetLocation.current;
    targetMarkerLocationRef.current = targetMarkerLocation;
    
    // Save original position when starting to center on a location (null -> value)
    if (previousValue === null && targetMarkerLocation !== null && targetMarkerLocation !== undefined) {
      originalPhi.current = phi.current;
      originalTheta.current = theta.current;
      isReturningToOriginal.current = false;
    }
    
    // Trigger return animation when centering ends (value -> null)
    if (previousValue !== null && previousValue !== undefined && targetMarkerLocation === null) {
      isReturningToOriginal.current = true;
    }
    
    previousTargetLocation.current = targetMarkerLocation;
  }, [targetMarkerLocation]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 500;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: phi.current,
      theta: theta.current,
      dark: 1,
      diffuse: 0.0,
      mapSamples: 20000,
      mapBrightness: 6,
      mapBaseBrightness: 0,
      baseColor: [0.1, 0.8, 0.3], // Matrix green (#22c55e)
      markerColor: [0.1, 0.8, 0.3], // Slightly darker green for markers
      glowColor: [0.13, 0.85, 0.37],
      markers: markers.map((m) => ({
        location: m.location,
        size: m.size,
        id: m.id || `marker-${Math.random().toString(36).substr(2, 9)}`,
      })),
      arcs: arcs.map((arc, index) => ({
        from: arc.from,
        to: arc.to,
        color: arc.color,
        id: arc.id || `arc-${index}`,
      })),
      arcColor: arcColor,
      arcWidth: arcWidth,
      arcHeight: arcHeight,
    });

    globeRef.current = globe;

    // Helper function to convert lat/long to phi/theta
    const latLngToPhiTheta = (lat: number, lng: number): { phi: number; theta: number } => {
      // Convert to radians
      const latRad = (lat * Math.PI) / 180;
      const lngRad = (lng * Math.PI) / 180;
      
      // Calculate phi (horizontal rotation)
      // Phi represents longitude, with adjustment for the globe's coordinate system
      const targetPhi = -lngRad + Math.PI / 2;
      
      // Calculate theta (vertical tilt)
      // Theta represents latitude, clamped between -PI/2 and PI/2
      const targetTheta = latRad;
      
      return { phi: targetPhi, theta: targetTheta };
    };

    // Animate the globe
    function animate() {
      const currentTargetLocation = targetMarkerLocationRef.current;
      const currentPaused = isRotationPausedRef.current;
      const returningToOriginal = isReturningToOriginal.current;
      
      if (currentTargetLocation !== null && currentTargetLocation !== undefined) {
        // State 1: Centering on target location
        const [lat, lng] = currentTargetLocation;
        const { phi: targetPhiValue, theta: targetThetaValue } = latLngToPhiTheta(lat, lng);
        
        // Smooth interpolation towards target
        const lerpFactor = 0.05;
        phi.current += (targetPhiValue - phi.current) * lerpFactor;
        theta.current += (targetThetaValue - theta.current) * lerpFactor;
        
        globe.update({ phi: phi.current, theta: theta.current });
      } else if (returningToOriginal) {
        // State 2: Returning to original position
        const lerpFactor = 0.05;
        phi.current += (originalPhi.current - phi.current) * lerpFactor;
        theta.current += (originalTheta.current - theta.current) * lerpFactor;
        
        // Check if close enough to original position to snap and switch to normal rotation
        const phiDistance = Math.abs(phi.current - originalPhi.current);
        const thetaDistance = Math.abs(theta.current - originalTheta.current);
        
        if (phiDistance < 0.001 && thetaDistance < 0.001) {
          // Snap to exact original position
          phi.current = originalPhi.current;
          theta.current = originalTheta.current;
          isReturningToOriginal.current = false;
        }
        
        globe.update({ phi: phi.current, theta: theta.current });
      } else if (!currentPaused) {
        // State 3: Normal rotation
        phi.current += 0.005;
        globe.update({ phi: phi.current, theta: theta.current });
      } else {
        // Paused but not centering or returning - maintain current position
        globe.update({ phi: phi.current, theta: theta.current });
      }
      
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      globe.destroy();
    };
  }, [markers, arcs, arcColor, arcWidth, arcHeight]);

  return (
    <div className="relative w-full aspect-square select-none">
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.28) 0%, rgba(34,197,94,0.10) 52%, transparent 72%)",
          filter: "blur(18px)",
          transform: "scale(1.1)",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "1",
          cursor: "grab",
          opacity: 1,
        }}
      />

      {/* Marker labels */}
      {markers.map((marker) => {
        const visibleVar = `--cobe-visible-${marker.id}`;
        const isSelected = selectedMarkerId === marker.id;
        const shouldShow = !selectedMarkerId || isSelected;
        
        return (
          <button
            key={marker.id}
            onClick={() => onMarkerClick?.(marker)}
            className={`marker-label absolute left-10 text-xs font-mono text-green-500 bg-green-900/80 px-4 py-1 rounded cursor-pointer hover:bg-green-800/90 transition-colors ${!shouldShow ? 'opacity-0 pointer-events-none' : ''}`}
            style={{
              positionAnchor: `--cobe-${marker.id}`,
              bottom: 'anchor(bottom)',
              left: 'anchor(center)',
              opacity: shouldShow ? `var(${visibleVar}, 0)` : 0,
              filter: shouldShow ? `blur(calc((1 - var(${visibleVar}, 0)) * 8px))` : 'blur(8px)',
              transition: 'opacity 0.3s, filter 0.3s',
            }}
          >
            {(marker as Marker).label || marker.id}
          </button>
        );
      })}
    </div>
  );
}
