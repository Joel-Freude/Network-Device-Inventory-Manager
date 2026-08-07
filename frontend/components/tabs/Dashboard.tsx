'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Download01Icon, ActivityIcon, UserWarning01Icon, Clock01Icon, Loading01Icon, Refresh01Icon, CpuIcon, MemoryStickIcon, HardDriveIcon } from '@hugeicons/core-free-icons';
import { api, Device } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import MatrixRadarChart from '@/components/charts/MatrixRadarChart';
import MatrixStethoscopeChart from '@/components/charts/MatrixStethoscopeChart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws') + '/api/v1/ws/cpu-metrics';

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  const { isConnected, metrics } = useWebSocket(WS_URL);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDevices({ limit: 100 });
      console.log('Devices loaded:', data);
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        setSelectedDevice(data[0]);
      }
    } catch (err) {
      setError('Failed to load devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'active').length;
  const offlineDevices = devices.filter(d => d.status === 'offline' || d.status === 'maintenance').length;
  
  // Group by vendor
  const vendorCounts = devices.reduce((acc, device) => {
    acc[device.vendor] = (acc[device.vendor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const vendorData = Object.entries(vendorCounts)
    .map(([vendor, count]) => ({
      vendor,
      count,
      percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Group by device type
  const typeCounts = devices.reduce((acc, device) => {
    acc[device.device_type] = (acc[device.device_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const typeData = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <HugeiconsIcon icon={Loading01Icon} className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-green-950 border border-green-800 rounded-xl p-4 text-green-400 font-mono">
        {error}
        <button onClick={loadDevices} className="ml-4 underline text-green-500">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-500 font-mono">DASHBOARD</h2>
          <p className="text-green-500/70 font-mono">Overview of network device inventory</p>
        </div>
        <div className="flex gap-2">
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
            <span className="hidden sm:inline">EXPORT REPORT</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/40 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500/70 font-medium font-mono">TOTAL DEVICES</p>
              <p className="text-3xl font-bold text-green-500 mt-1 font-mono">{totalDevices}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <HugeiconsIcon icon={ActivityIcon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/40 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500/70 font-medium font-mono">ACTIVE ASSETS</p>
              <p className="text-3xl font-bold text-green-500 mt-1 font-mono">{activeDevices}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <HugeiconsIcon icon={ActivityIcon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/40 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500/70 font-medium font-mono">OFFLINE/MAINTENANCE</p>
              <p className="text-3xl font-bold text-green-500 mt-1 font-mono">{offlineDevices}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <HugeiconsIcon icon={UserWarning01Icon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-500/40 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500/70 font-medium font-mono">LOCATIONS</p>
              <p className="text-3xl font-bold text-green-500 mt-1 font-mono">{new Set(devices.map(d => d.location_id)).size}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <HugeiconsIcon icon={Clock01Icon} className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time CPU Monitoring */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-green-500 font-mono">REAL-TIME CPU MONITORING</h3>
            <p className="text-green-500/70 text-sm font-mono">Matrix-style performance metrics (100ms refresh)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-green-500 font-mono">
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Device Selection */}
        {devices.length > 0 && (
          <div className="mb-6">
            <label className="text-sm text-green-500/70 font-mono mb-2 block">SELECT DEVICE</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                    selectedDevice?.id === device.id
                      ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-green-900/10 border-green-500/20 hover:border-green-500/40 hover:bg-green-900/20'
                  }`}
                >
                  <div className="text-green-500 font-mono text-sm font-medium">
                    {device.hostname}
                  </div>
                  <div className="text-green-500/50 font-mono text-xs mt-1">
                    {device.vendor}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {selectedDevice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-green-500/70 font-mono mb-3">MULTI-DIMENSIONAL METRICS</h4>
              <MatrixRadarChart metrics={metrics} />
            </div>
            <div>
              <h4 className="text-sm text-green-500/70 font-mono mb-3">CPU PULSE MONITOR</h4>
              <MatrixStethoscopeChart metrics={metrics} />
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        {metrics && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon icon={CpuIcon} className="w-4 h-4 text-green-500" />
                <span className="text-green-500/70 font-mono text-xs">CPU USAGE</span>
              </div>
              <div className="text-2xl font-bold text-green-500 font-mono">
                {metrics.cpu_usage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon icon={MemoryStickIcon} className="w-4 h-4 text-green-500" />
                <span className="text-green-500/70 font-mono text-xs">MEMORY</span>
              </div>
              <div className="text-2xl font-bold text-green-500 font-mono">
                {metrics.memory_usage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon icon={ActivityIcon} className="w-4 h-4 text-green-500" />
                <span className="text-green-500/70 font-mono text-xs">LOAD AVG</span>
              </div>
              <div className="text-2xl font-bold text-green-500 font-mono">
                {metrics.load_average_1m.toFixed(2)}
              </div>
            </div>
            <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HugeiconsIcon icon={HardDriveIcon} className="w-4 h-4 text-green-500" />
                <span className="text-green-500/70 font-mono text-xs">DISK</span>
              </div>
              <div className="text-2xl font-bold text-green-500 font-mono">
                {metrics.disk_usage.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
          <h3 className="text-lg font-semibold text-green-500 mb-4 font-mono">DEVICES BY VENDOR</h3>
          {vendorData.length === 0 ? (
            <div className="text-center py-8 text-green-500/70 font-mono">No devices found</div>
          ) : (
            <div className="space-y-3">
              {vendorData.map((item) => (
                <div key={item.vendor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-500/70 font-mono">{item.vendor}</span>
                    <span className="text-green-500 font-medium font-mono">{item.count}</span>
                  </div>
                  <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 shadow-lg shadow-green-500/40"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
          <h3 className="text-lg font-semibold text-green-500 mb-4 font-mono">DEVICES BY TYPE</h3>
          {typeData.length === 0 ? (
            <div className="text-center py-8 text-green-500/70 font-mono">No devices found</div>
          ) : (
            <div className="space-y-3">
              {typeData.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-500/70 font-mono">{item.type}</span>
                    <span className="text-green-500 font-medium font-mono">{item.count}</span>
                  </div>
                  <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 shadow-lg shadow-green-500/40"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Devices */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-lg">
        <h3 className="text-lg font-semibold text-green-500 mb-4 font-mono">RECENTLY ADDED DEVICES</h3>
        {devices.length === 0 ? (
          <div className="text-center py-8 text-green-500/70 font-mono">No devices found</div>
        ) : (
          <div className="space-y-4">
            {devices.slice(0, 5).map((device) => (
              <div key={device.id} className="flex items-center gap-4 pb-4 border-b border-green-500/20 last:border-0 last:pb-0 hover:bg-green-900/20 rounded-lg p-3 -mx-3 transition-all duration-300">
                <div className={`p-2 rounded-xl ${
                  device.status === 'active' ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30' :
                  'bg-gradient-to-br from-green-500/30 to-emerald-500/30'
                }`}>
                  <HugeiconsIcon icon={ActivityIcon} className={`w-4 h-4 ${
                    device.status === 'active' ? 'text-green-400' :
                    'text-green-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-500">
                    <span className="font-medium font-mono">{device.hostname}</span>
                  </p>
                  <p className="text-xs text-green-500/70 font-mono">{device.vendor} {device.model}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full font-mono ${
                  device.status === 'active'
                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-500 border border-green-500/40'
                    : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-500 border border-green-500/40'
                }`}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
