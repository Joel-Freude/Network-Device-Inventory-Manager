'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Location01Icon, Building01Icon, McpServerIcon, Edit01Icon, Delete01Icon, Loading01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { api, Location, Device } from '@/lib/api';

export default function Locations() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <h2 className="text-2xl font-bold text-white">Locations</h2>
          <p className="text-white/70">Manage physical sites and rack locations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-cyan-500/40 rounded-xl hover:bg-cyan-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-colors">
            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
            <span>Add Site</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <HugeiconsIcon icon={Loading01Icon} className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-sm border border-red-500/40 rounded-2xl p-4 text-white shadow-lg">
          {error}
          <button onClick={loadData} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Sites Directory */}
      {!loading && !error && (
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Site Directory</h3>
          {sites.length === 0 ? (
            <div className="text-center py-8 text-white/70">No sites found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site.name)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedSite === site.name
                      ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-500/50 shadow-lg shadow-cyan-500/40'
                      : 'bg-cyan-900/20 border-cyan-500/30 hover:bg-cyan-900/40 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl">
                      <HugeiconsIcon icon={Building01Icon} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{site.name}</h4>
                      <p className="text-sm text-white/70">{site.building}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <HugeiconsIcon icon={McpServerIcon} className="w-3 h-3" />
                    <span>{site.devices} devices</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location Inventory View */}
      {selectedSite && !loading && !error && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Devices at {selectedSite}
            </h3>
            <button
              onClick={() => setSelectedSite(null)}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Clear Filter
            </button>
          </div>
          <div className="space-y-2">
            {filteredDevices.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No devices at this location
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDevices.map((device) => (
                  <div key={device.id} className="flex items-center gap-4 p-4 bg-cyan-900/30 rounded-xl hover:bg-cyan-900/50 transition-all duration-300">
                    <div className={`p-2 rounded-xl ${
                      device.status === 'active' ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/30' :
                      'bg-gradient-to-br from-amber-500/30 to-orange-500/30'
                    }`}>
                      <HugeiconsIcon icon={McpServerIcon} className={`w-4 h-4 ${
                        device.status === 'active' ? 'text-emerald-400' :
                        'text-amber-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{device.hostname}</p>
                      <p className="text-xs text-white/70">{device.vendor} {device.model}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      device.status === 'active'
                        ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-white border border-emerald-500/40'
                        : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-white border border-amber-500/40'
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
  );
}
