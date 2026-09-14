'use client'

import { useState } from 'react'
import GlobeMap from '@/components/Globe'
import { Globe, Activity, Network, Settings, BarChart3, Shield, Radio, Layers } from 'lucide-react'

type WidgetKey = 'globe' | 'network' | 'activity' | 'settings' | 'layers' | 'analytics' | 'threats' | 'live'

const WIDGET_LABELS: Record<WidgetKey, string> = {
  globe: 'Globe',
  network: 'Network',
  activity: 'Activity',
  settings: 'Settings',
  layers: 'Layers',
  analytics: 'Analytics',
  threats: 'Threats',
  live: 'Live feeds',
}

export default function DashboardPage() {
  const [activeWidgets, setActiveWidgets] = useState<WidgetKey[]>(['globe'])

  const toggleWidget = (key: WidgetKey) => {
    setActiveWidgets((prev) => {
      const has = prev.includes(key)
      if (key === 'globe') return ['globe']
      return has ? prev.filter((k) => k !== key) : [...prev, key]
    })
  }

  const isActive = (key: WidgetKey) => activeWidgets.includes(key)

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
        {([
          ['dashboard', 'globe', Globe],
          ['network', 'network', Network],
          ['activity', 'activity', Activity],
          ['settings', 'settings', Settings],
        ] as const).map(([pageKey, widgetKey, Icon]) => (
          <button
            key={pageKey}
            onClick={() => toggleWidget(widgetKey)}
            className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              isActive(widgetKey)
                ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
            }`}
            title={WIDGET_LABELS[widgetKey]}
          >
            <Icon size={20} />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
              {WIDGET_LABELS[widgetKey]}
            </span>
          </button>
        ))}
      </nav>

      {/* Floating right tools rail */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40">
        {([
          ['layers', 'layers', Layers],
          ['analytics', 'analytics', BarChart3],
          ['threats', 'threats', Shield],
          ['live', 'live', Radio],
        ] as const).map(([pageKey, widgetKey, Icon]) => (
          <button
            key={pageKey}
            onClick={() => toggleWidget(widgetKey)}
            className={`group relative w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              isActive(widgetKey)
                ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
            }`}
            title={WIDGET_LABELS[widgetKey]}
          >
            <Icon size={20} />
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
              {WIDGET_LABELS[widgetKey]}
            </span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {isActive('globe') && <GlobeMap />}

        {isActive('network') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Network size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">NETWORK</h2>
              <p className="text-cyber-muted">Network management interface coming soon...</p>
            </div>
          </div>
        )}

        {isActive('activity') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Activity size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">ACTIVITY</h2>
              <p className="text-cyber-muted">Live activity feed coming soon...</p>
            </div>
          </div>
        )}

        {isActive('settings') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Settings size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">SETTINGS</h2>
              <p className="text-cyber-muted">System configuration panel coming soon...</p>
            </div>
          </div>
        )}

        {isActive('layers') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Layers size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">LAYERS</h2>
              <p className="text-cyber-muted">Layer controls coming soon...</p>
            </div>
          </div>
        )}

        {isActive('analytics') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <BarChart3 size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">ANALYTICS</h2>
              <p className="text-cyber-muted">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {isActive('threats') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Shield size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">THREATS</h2>
              <p className="text-cyber-muted">Threat monitoring coming soon...</p>
            </div>
          </div>
        )}

        {isActive('live') && (
          <div className="h-full w-full flex items-center justify-center pointer-events-none">
            <div className="cyber-panel rounded-lg p-8 text-center pointer-events-auto">
              <Radio size={48} className="text-cyber-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold cyber-text mb-2">LIVE FEEDS</h2>
              <p className="text-cyber-muted">Live feeds coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
