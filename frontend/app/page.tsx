'use client'

import { useState } from 'react'
import GlobeMap from '@/components/Globe'
import { Activity, Network, Settings } from 'lucide-react'

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-black">
      <nav className="w-64 bg-cyber-panel cyber-border flex flex-col z-20">
        <div className="p-4 border-b border-cyber-border">
          <h1 className="text-xl font-bold cyber-text tracking-wider">
            NET//INVENTORY
          </h1>
          <p className="text-xs text-cyber-muted mt-1">v2.0.47 // SYSTEM ONLINE</p>
        </div>
        
        <div className="flex-1 py-4">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              activePage === 'dashboard'
                ? 'bg-cyber-accent/10 text-cyber-accent border-r-2 border-cyber-accent'
                : 'text-cyber-text hover:bg-cyber-border/50'
            }`}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActivePage('network')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              activePage === 'network'
                ? 'bg-cyber-accent/10 text-cyber-accent border-r-2 border-cyber-accent'
                : 'text-cyber-text hover:bg-cyber-border/50'
            }`}
          >
            <Network size={18} />
            <span>Network</span>
          </button>
          
          <button
            onClick={() => setActivePage('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              activePage === 'settings'
                ? 'bg-cyber-accent/10 text-cyber-accent border-r-2 border-cyber-accent'
                : 'text-cyber-text hover:bg-cyber-border/50'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
        
        <div className="p-4 border-t border-cyber-border">
          <div className="text-xs text-cyber-muted">
            <p>STATUS: <span className="text-cyber-accent">● ONLINE</span></p>
            <p className="mt-1">UPTIME: 99.97%</p>
          </div>
        </div>
      </nav>

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
