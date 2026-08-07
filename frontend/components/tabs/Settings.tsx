'use client';

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiSecurity01Icon, CheckmarkCircle02Icon, CancelCircleIcon, ExternalLinkIcon, User02Icon, McpServerIcon, Database01Icon, CloudSyncIcon, Loading01Icon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { api, GNS3Project, SyncResult } from '@/lib/api';

export default function Settings() {
  const [role, setRole] = useState<'admin' | 'readonly'>('admin');
  const [gns3Projects, setGns3Projects] = useState<GNS3Project[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [gns3Error, setGns3Error] = useState<string | null>(null);

  const healthStatus = [
    { name: 'Next.js Frontend', status: 'connected', icon: User02Icon },
    { name: 'FastAPI Backend', status: 'connected', icon: McpServerIcon },
    { name: 'PostgreSQL Database', status: 'connected', icon: Database01Icon },
  ];

  useEffect(() => {
    loadGNS3Projects();
  }, []);

  const loadGNS3Projects = async () => {
    try {
      setLoadingProjects(true);
      setGns3Error(null);
      const projects = await api.getGNS3Projects();
      setGns3Projects(projects);
    } catch (err) {
      setGns3Error('Failed to load GNS3 projects');
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const syncProject = async (projectId: string) => {
    try {
      setSyncing(true);
      setGns3Error(null);
      const result = await api.syncGNS3Project(projectId, true, 'GNS3 Imported');
      setSyncResult(result);
      // Reload devices after sync
      await loadGNS3Projects();
    } catch (err) {
      setGns3Error('Failed to sync GNS3 project');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-white/70">Configure system preferences and access controls</p>
      </div>

      {/* Role-Based Access Control */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl">
            <HugeiconsIcon icon={AiSecurity01Icon} className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Role-Based Access Control</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-cyan-900/30 rounded-xl">
            <div>
              <h4 className="font-medium text-white">Current Role</h4>
              <p className="text-sm text-white/70">Select your access level</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRole('admin')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40'
                    : 'bg-cyan-900/30 text-white/70 border border-cyan-500/40 hover:bg-cyan-900/50'
                }`}
              >
                Administrator
              </button>
              <button
                onClick={() => setRole('readonly')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  role === 'readonly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40'
                    : 'bg-cyan-900/30 text-white/70 border border-cyan-500/40 hover:bg-cyan-900/50'
                }`}
              >
                Read-Only Technician
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-cyan-900/30 rounded-xl">
            <h4 className="font-medium text-white mb-2">Role Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-white">Administrator</p>
                <ul className="space-y-1 text-white/70">
                  <li>• Full CRUD operations on devices</li>
                  <li>• Create, edit, delete locations</li>
                  <li>• Manage system settings</li>
                  <li>• Export data reports</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-white">Read-Only Technician</p>
                <ul className="space-y-1 text-white/70">
                  <li>• View device inventory</li>
                  <li>• View location hierarchy</li>
                  <li>• Access dashboard analytics</li>
                  <li>• No modification permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Check */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">System Health Check</h3>
        <div className="space-y-3">
          {healthStatus.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center justify-between p-4 bg-cyan-900/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-900/50 rounded-xl">
                    <HugeiconsIcon icon={item.icon} className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'connected' ? (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-emerald-300">Connected</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CancelCircleIcon} className="w-5 h-5 text-red-400" />
                      <span className="text-sm text-red-300">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GNS3 Integration */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-xl">
              <HugeiconsIcon icon={CloudSyncIcon} className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">GNS3 Integration</h3>
          </div>
          <button
            onClick={loadGNS3Projects}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-cyan-500/40 rounded-xl hover:bg-cyan-900/50 transition-all duration-300 text-white"
          >
            <HugeiconsIcon icon={Refresh01Icon} className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {gns3Error && (
          <div className="mb-4 p-4 bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/40 rounded-xl text-red-300 shadow-lg">
            {gns3Error}
          </div>
        )}

        {loadingProjects ? (
          <div className="flex items-center justify-center py-8">
            <HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 text-white animate-spin" />
          </div>
        ) : gns3Projects.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            No GNS3 projects found
          </div>
        ) : (
          <div className="space-y-3">
            {gns3Projects.map((project) => (
              <div key={project.project_id} className="flex items-center justify-between p-4 bg-cyan-900/30 rounded-xl hover:bg-cyan-900/50 transition-all duration-300">
                <div>
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <p className="text-sm text-white/70">Status: {project.status}</p>
                </div>
                <button
                  onClick={() => syncProject(project.project_id)}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/40"
                >
                  {syncing ? (
                    <>
                      <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CloudSyncIcon} className="w-4 h-4" />
                      Sync
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {syncResult && (
          <div className="mt-4 p-4 bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/40 rounded-xl shadow-lg">
            <h4 className="font-medium text-emerald-100 mb-2">Sync Complete</h4>
            <div className="text-sm text-emerald-200 space-y-1">
              <p>Project: {syncResult.project_name}</p>
              <p>Synced devices: {syncResult.synced_devices}</p>
              <p>Skipped devices: {syncResult.skipped_devices}</p>
              {syncResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside text-xs">
                    {syncResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setSyncResult(null)}
              className="mt-3 text-sm text-emerald-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">API Documentation</h3>
        <div className="p-4 bg-cyan-900/30 rounded-xl">
          <p className="text-sm text-white/70 mb-4">
            Access the interactive OpenAPI/Swagger documentation for the FastAPI backend.
          </p>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/40"
          >
            <HugeiconsIcon icon={ExternalLinkIcon} className="w-4 h-4" />
            Open API Docs
          </a>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/70">Application Version</p>
            <p className="font-medium text-white">v1.0.0</p>
          </div>
          <div>
            <p className="text-white/70">Frontend Framework</p>
            <p className="font-medium text-white">Next.js 16.3.0</p>
          </div>
          <div>
            <p className="text-white/70">Backend Framework</p>
            <p className="font-medium text-white">FastAPI 0.110.0</p>
          </div>
          <div>
            <p className="text-white/70">Database</p>
            <p className="font-medium text-white">PostgreSQL 16</p>
          </div>
        </div>
      </div>
    </div>
  );
}
