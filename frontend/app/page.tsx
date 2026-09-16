'use client'

import { useState } from 'react'
import GlobeMap from '@/components/Globe'
import NycPerformanceCard from '@/components/NycPerformanceCard'
import DeviceList from '@/components/DeviceList'
import AddDatacenterModal from '@/components/AddDatacenterModal'
import { Globe, Activity, Network, Settings, BarChart3, Shield, Radio, Layers, LayoutDashboard } from 'lucide-react'

type WidgetKey = 'dashboard' | 'network' | 'activity' | 'settings' | 'layers' | 'analytics' | 'threats' | 'live'

const WIDGET_LABELS: Record<WidgetKey, string> = {
  dashboard: 'Dashboard',
  network: 'Network',
  activity: 'Activity',
  settings: 'Settings',
  layers: 'Layers',
  analytics: 'Analytics',
  threats: 'Threats',
  live: 'Live feeds',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const LEFT_WIDGET_KEYS: WidgetKey[] = ['dashboard', 'network', 'activity', 'settings']
const RIGHT_WIDGET_KEYS: WidgetKey[] = ['layers', 'analytics', 'threats', 'live']

export default function DashboardPage() {
  const [activeWidgets, setActiveWidgets] = useState<WidgetKey[]>(['dashboard'])
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const toggleWidget = (key: WidgetKey) => {
    setActiveWidgets((prev) => {
      const isLeft = LEFT_WIDGET_KEYS.includes(key)
      const has = prev.includes(key)

      if (isLeft) {
        return [key]
      }

      return has ? prev.filter((k) => k !== key) : [...prev, key]
    })
  }

  const isActive = (key: WidgetKey) => activeWidgets.includes(key)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cyber-black">
      {/* Top-left title + horizontal icon rail */}
      <div className="fixed top-4 left-3 z-50 flex items-center gap-3">
        <div className="bg-transparent border border-cyan-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
          <h1 className="text-4xl font-bold tracking-wider text-cyan-400 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
            NDIM
          </h1>
          <p className="text-[10px] tracking-widest text-gray-400 mt-0.5">
            NETWORK DEVICE IVENTORY MANAGER
          </p>
        </div>

        <nav className="flex items-center rounded-lg gap-2 px-2 py-1">
        {([
          ['dashboard', 'dashboard', LayoutDashboard],
          ['network', 'network', Network],
          ['activity', 'activity', Activity],
          ['settings', 'settings', Settings],
        ] as const).map(([pageKey, widgetKey, Icon]) => (
            <button
              key={pageKey}
              onClick={() => toggleWidget(widgetKey)}
              className={`group relative w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                isActive(widgetKey)
                  ? 'text-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-cyan-500/10'
              }`}
              title={WIDGET_LABELS[widgetKey]}
            >
              <Icon size={18} />
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700">
                {WIDGET_LABELS[widgetKey]}
              </span>
            </button>
          ))}
        </nav>
        <div className="text-xs tracking-widest text-gray-400" style={{ fontFamily: 'var(--font-data)' }}>
          {WIDGET_LABELS[activeWidgets.find((key) => LEFT_WIDGET_KEYS.includes(key)) ?? 'dashboard']}
        </div>
      </div>

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
        {isActive('dashboard') && (
          <>
            <div className="absolute left-4 top-24 z-30 pt-10 flex flex-col gap-4">
              <NycPerformanceCard onLocationSelect={(coords) => {
                setFlyToLocation(coords)
                setSelectedSite(coords?.site ?? null)
              }} onOpenAddModal={() => setIsAddModalOpen(true)} />
              {selectedSite && <DeviceList site={selectedSite} />}
            </div>
            <AddDatacenterModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={(dc) => {
                fetch(`${API_URL}/api/devices`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(dc),
                }).then(() => {
                  window.location.reload()
                })
              }}
            />
            <GlobeMap flyToLocation={flyToLocation} />
          </>
        )}

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
