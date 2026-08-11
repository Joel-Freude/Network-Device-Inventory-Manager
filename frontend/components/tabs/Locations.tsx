'use client';

import { useState, useEffect } from 'react';
import type { Marker } from '@/components/globe/MatrixGlobe';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Location01Icon, Building01Icon, McpServerIcon, Edit01Icon, Delete01Icon, Loading01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { api, Location, Device } from '@/lib/api';
import MatrixGlobe from '@/components/globe/MatrixGlobe';

export default function Locations() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy arc data for network connections between locations
  // Cameroon coordinate: 3.8300535205218154, 11.491438725213422
  const cameroonCoords = [3.8300535205218154, 11.491438725213422] as [number, number];
  
  const dummyArcs = [
    {
      from: [40.7128, -74.0060] as [number, number], // New York
      to: cameroonCoords,
      color: [0.13, 0.85, 0.37] as [number, number, number], // Matrix green
      id: 'nyc-cameroon'
    },
    {
      from: [51.5074, -0.1278] as [number, number],  // London
      to: cameroonCoords,
      color: [0.13, 0.85, 0.37] as [number, number, number],
      id: 'london-cameroon'
    },
    {
      from: [35.6762, 139.6503] as [number, number], // Tokyo
      to: cameroonCoords,
      color: [0.13, 0.85, 0.37] as [number, number, number],
      id: 'tokyo-cameroon'
    },
    {
      from: [48.8566, 2.3522] as [number, number],   // Paris
      to: cameroonCoords,
      color: [0.09, 0.64, 0.29] as [number, number, number], // Darker green
      id: 'paris-cameroon'
    },
    {
      from: [-33.8688, 151.2093] as [number, number], // Sydney
      to: cameroonCoords,
      color: [0.08, 0.50, 0.24] as [number, number, number], // Even darker green
      id: 'sydney-cameroon'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [locationsData, devicesData] = await Promise.all([
        api.getLocations(),
        api.getDevices()
      ]);
      setLocations(locationsData);
      setDevices(devicesData);
    } catch (err) {
      setError('Failed to load locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceCountForLocation = (locationId: number) => {
    return devices.filter(device => device.location_id === locationId).length;
  };

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker);
    setSelectedSite(marker.label || marker.id);
  };

  const handleCancelDetails = () => {
    setSelectedMarker(null);
    setSelectedSite(null);
  };

  const sites = locations.map(location => ({
    id: location.id,
    name: location.site_name,
    building: location.building_rack,
    racks: 1, // Simplified - backend doesn't track rack count
    devices: getDeviceCountForLocation(location.id)
  }));

  const filteredDevices = devices.filter(device => {
    const location = locations.find(loc => loc.id === device.location_id);
    return location?.site_name === selectedSite;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-500 font-mono">LOCATIONS</h2>
          <p className="text-green-500/70 font-mono">Manage physical sites and rack locations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-green-500/40 rounded-xl hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-green-500 font-mono"
          >
            <HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors font-mono">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
            <span>ADD SITE</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <HugeiconsIcon icon={Loading01Icon} className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-green-950 border border-green-800 rounded-xl p-4 text-green-400 font-mono">
          {error}
          <button onClick={loadData} className="ml-4 underline text-green-500">Retry</button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - 3D Globe */}
            <div className="flex items-start">
              <MatrixGlobe 
                devices={devices} 
                locations={locations} 
                arcs={dummyArcs}
                onMarkerClick={handleMarkerClick}
                selectedMarkerId={selectedMarker?.id}
                isRotationPaused={!!selectedMarker}
                targetMarkerLocation={selectedMarker?.location ?? null}
              />
            </div>

            {/* Right - Sites Directory */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
                {sites.length === 0 ? (
                  <div className="text-center py-8 text-green-500/70 font-mono">No sites found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => {
                          setSelectedSite(site.name);
                          setSelectedMarker(null); // Clear globe marker selection when clicking site card
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          selectedSite === site.name
                            ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-500/50 shadow-lg shadow-green-500/40'
                            : 'bg-green-900/20 border-green-500/30 hover:bg-green-900/40 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl">
                            <HugeiconsIcon icon={Building01Icon} className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-500 font-mono">{site.name}</h4>
                            <p className="text-sm text-green-500/70 font-mono">{site.building}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-500/70 font-mono">
                          <HugeiconsIcon icon={McpServerIcon} className="w-3 h-3" />
                          <span>{site.devices} devices</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Inventory View */}
              {selectedSite && (
                <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-500 font-mono">
                      DEVICES AT {selectedSite.toUpperCase()}
                    </h3>
                    <button
                      onClick={handleCancelDetails}
                      className="text-sm text-green-500 hover:text-green-400 font-mono"
                    >
                      CLEAR FILTER
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredDevices.length === 0 ? (
                      <div className="text-center py-8 text-green-500/70 font-mono">
                        No devices at this location
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDevices.map((device) => (
                          <div key={device.id} className="flex items-center gap-4 p-4 bg-green-900/30 rounded-xl hover:bg-green-900/50 transition-all duration-300 border border-green-500/20">
                            <div className={`p-2 rounded-xl ${
                              device.status === 'active' ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' :
                              'bg-gradient-to-br from-amber-500/30 to-orange-500/30'
                            }`}>
                              <HugeiconsIcon icon={McpServerIcon} className={`w-4 h-4 ${
                                device.status === 'active' ? 'text-green-400' :
                                'text-amber-400'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-500 font-mono">{device.hostname}</p>
                              <p className="text-xs text-green-500/70 font-mono">{device.vendor} {device.model}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full font-mono ${
                              device.status === 'active'
                                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-500 border border-green-500/40'
                                : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-500 border border-amber-500/40'
                            }`}>
                              {device.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
