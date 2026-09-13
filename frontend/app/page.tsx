'use client'

import { useState } from 'react'
import GlobeMap from '@/components/Globe'
import { Globe, Activity, Network, Settings, BarChart3, Shield, Radio, Layers } from 'lucide-react'

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-black">
      {/* Top-left title card */}
      <div className="fixed top-4 left-3 z-50">
        <div className="bg-transparent border border-cyan-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
          <h1 className="text-4xl font-bold tracking-wider text-cyan-400 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
            NDIM
          </h1>
          <p className="text-[10px] tracking-widest text-gray-400 mt-0.5">
            NETWORK DEVICE IVENTORY MANAGER
          </p>
        </div>
      </div>

      {/* Floating left icon rail */}
      <nav className="fixed left-4 top-1/3 -translate-y-1/2 flex flex-col items-center border border-cyan-500/30 rounded-lg gap-3 z-40">
        <button
          onClick={() => setActivePage('dashboard')}
          className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePage === 'dashboard'
              ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
          }`}
          title="Dashboard"
        >
          <Globe size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Dashboard
          </span>
        </button>

        <button
          onClick={() => setActivePage('network')}
          className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePage === 'network'
              ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
          }`}
          title="Network"
        >
          <Network size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Network
          </span>
        </button>

        <button
          onClick={() => setActivePage('activity')}
          className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePage === 'activity'
              ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
          }`}
          title="Activity"
        >
          <Activity size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Activity
          </span>
        </button>

        <button
          onClick={() => setActivePage('settings')}
          className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            activePage === 'settings'
              ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
              : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
          }`}
          title="Settings"
        >
          <Settings size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Settings
          </span>
        </button>
      </nav>

      {/* Floating right tools rail */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40">
        <button
          className="group relative w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all"
          title="Layers"
        >
          <Layers size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Layers
          </span>
        </button>
        <button
          className="group relative w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all"
          title="Analytics"
        >
          <BarChart3 size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Analytics
          </span>
        </button>
        <button
          className="group relative w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all"
          title="Threats"
        >
          <Shield size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Threats
          </span>
        </button>
        <button
          className="group relative w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all"
          title="Live feeds"
        >
          <Radio size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
            Live feeds
          </span>
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {activePage === 'dashboard' && <GlobeMap />}

        {activePage === 'network' && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="cyber-panel rounded-lg p-8 text-center">
              <Network size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">NETWORK</h2>
              <p className="text-cyber-muted">Network management interface coming soon...</p>
            </div>
          </div>
        )}

        {activePage === 'activity' && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="cyber-panel rounded-lg p-8 text-center">
              <Activity size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">ACTIVITY</h2>
              <p className="text-cyber-muted">Live activity feed coming soon...</p>
            </div>
          </div>
        )}

        {activePage === 'settings' && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="cyber-panel rounded-lg p-8 text-center">
              <Settings size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">SETTINGS</h2>
              <p className="text-cyber-muted">System configuration panel coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
