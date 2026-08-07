'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, SortingIcon, Download01Icon, EyeIcon, Edit01Icon, Delete01Icon, Grid02Icon, ListXIcon, Loading01Icon, Refresh01Icon, CloudSyncIcon } from '@hugeicons/core-free-icons';
import { api, Device, GNS3Project, SyncResult } from '@/lib/api';

export default function Inventory() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gns3Projects, setGns3Projects] = useState<GNS3Project[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showGNS3, setShowGNS3] = useState(false);

  useEffect(() => {
    loadDevices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDevices();
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGNS3Projects = async () => {
    try {
      const projects = await api.getGNS3Projects();
      setGns3Projects(projects);
    } catch (err) {
      console.error('Failed to load GNS3 projects:', err);
    }
  };

  const syncGNS3Project = async (projectId: string) => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const result = await api.syncGNS3Project(projectId, true, 'GNS3 Imported');
      setSyncResult(result);
      await loadDevices(); // Reload devices after sync
    } catch (err) {
      console.error('Failed to sync GNS3 project:', err);
    } finally {
      setSyncing(false);
    }
  };

  const toggleGNS3 = async () => {
    if (!showGNS3) {
      await loadGNS3Projects();
    }
    setShowGNS3(!showGNS3);
  };

  const filteredDevices = devices.filter(device =>
    device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-500 font-mono">INVENTORY</h2>
          <p className="text-green-500/70 font-mono">Manage and view all network devices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleGNS3}
            className="flex items-center gap-2 px-4 py-2 border border-green-500/40 rounded-xl hover:bg-green-900/50 transition-colors text-green-500 font-mono"
          >
            <HugeiconsIcon icon={CloudSyncIcon} className="w-4 h-4" />
            <span className="hidden sm:inline">SYNC FROM GNS3</span>
          </button>
          <button
            onClick={loadDevices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-green-500/40 rounded-xl hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-green-500 font-mono"
          >
            <HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4" />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-green-500/40 rounded-xl hover:bg-green-900/50 transition-colors text-green-500 font-mono">
            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
            <span className="hidden sm:inline">EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-500/40 rounded-xl bg-green-900/30 text-green-500 placeholder-green-500/50 focus:ring-2 focus:ring-green-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-mono ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/40'
                  : 'bg-green-900/30 text-green-300 border border-green-500/40 hover:bg-green-900/50 backdrop-blur-sm'
              }`}
            >
              <HugeiconsIcon icon={ListXIcon} className="w-4 h-4" />
              <span className="hidden sm:inline">TABLE</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-mono ${
                viewMode === 'card'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/40'
                  : 'bg-green-900/30 text-green-300 border border-green-500/40 hover:bg-green-900/50 backdrop-blur-sm'
              }`}
            >
              <HugeiconsIcon icon={Grid02Icon} className="w-4 h-4" />
              <span className="hidden sm:inline">CARD</span>
            </button>
          </div>
        </div>
      </div>

      {/* GNS3 Sync Section */}
      {showGNS3 && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
          <h3 className="text-lg font-semibold text-green-500 mb-4 font-mono">GNS3 PROJECT SYNC</h3>
          {gns3Projects.length === 0 ? (
            <div className="text-center py-8 text-green-500/70 font-mono">No GNS3 projects found</div>
          ) : (
            <div className="space-y-3">
              {gns3Projects.map((project) => (
                <div key={project.project_id} className="flex items-center justify-between p-4 bg-green-900/20 rounded-xl border border-green-500/20">
                  <div>
                    <div className="text-green-500 font-medium font-mono">{project.name}</div>
                    <div className="text-green-500/50 text-xs font-mono mt-1">{project.filename}</div>
                  </div>
                  <button
                    onClick={() => syncGNS3Project(project.project_id)}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  >
                    {syncing ? (
                      <>
                        <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 animate-spin" />
                        SYNCING...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={CloudSyncIcon} className="w-4 h-4" />
                        SYNC
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          {syncResult && (
            <div className="mt-4 p-4 bg-green-900/30 rounded-xl border border-green-500/40">
              <div className="text-green-500 font-mono text-sm">
                <div className="font-semibold mb-2">SYNC RESULT: {syncResult.project_name}</div>
                <div>Synced: {syncResult.synced_devices} devices</div>
                <div>Skipped: {syncResult.skipped_devices} devices</div>
                {syncResult.errors.length > 0 && (
                  <div className="mt-2 text-red-400">
                    Errors: {syncResult.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
          <button onClick={loadDevices} className="ml-4 underline text-green-500">Retry</button>
        </div>
      )}

      {/* Table View (Desktop) */}
      {viewMode === 'table' && !loading && !error && (
        <div className="hidden md:block bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl border border-cyan-500/30 shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-cyan-500/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Hostname</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">IP Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">MAC Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Model</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/70">
                    No devices found
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="border-b border-cyan-500/20 hover:bg-cyan-900/20 transition-all duration-300">
                    <td className="px-6 py-4 text-sm font-medium text-white">{device.hostname}</td>
                    <td className="px-6 py-4 text-sm text-white/70 font-mono">{device.ip_address}</td>
                    <td className="px-6 py-4 text-sm text-white/70 font-mono">{device.mac_address}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{device.vendor}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{device.model}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        device.status === 'active'
                          ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-white border border-emerald-500/40'
                          : device.status === 'offline'
                          ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 text-white border border-red-500/40'
                          : 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-white border border-amber-500/40'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-cyan-900/30 rounded-xl transition-all duration-300">
                          <HugeiconsIcon icon={EyeIcon} className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-1.5 hover:bg-cyan-900/30 rounded-xl transition-all duration-300">
                          <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-1.5 hover:bg-cyan-900/30 rounded-xl transition-all duration-300">
                          <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View (Mobile) */}
      {viewMode === 'card' && !loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-white/70">
              No devices found
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div key={device.id} className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-4 border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{device.hostname}</h3>
                    <p className="text-sm text-white/70">{device.vendor} {device.model}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    device.status === 'active'
                      ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-white border border-emerald-500/40'
                      : device.status === 'offline'
                      ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 text-white border border-red-500/40'
                      : 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-white border border-amber-500/40'
                  }`}>
                    {device.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">IP:</span>
                    <span className="font-mono text-white">{device.ip_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">MAC:</span>
                    <span className="font-mono text-white">{device.mac_address}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-cyan-500/20">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-cyan-900/30 text-white rounded-xl hover:bg-cyan-900/50 transition-all duration-300">
                    <HugeiconsIcon icon={EyeIcon} className="w-3 h-3" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-cyan-900/30 text-white rounded-xl hover:bg-cyan-900/50 transition-all duration-300">
                    <HugeiconsIcon icon={Edit01Icon} className="w-3 h-3" />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-300 rounded-xl hover:from-red-500/40 hover:to-rose-500/40 transition-all duration-300">
                    <HugeiconsIcon icon={Delete01Icon} className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
