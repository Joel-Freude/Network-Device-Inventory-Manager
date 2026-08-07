'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  DashboardSpeed01Icon, 
  McpServerIcon, 
  Location01Icon, 
  Settings01Icon,
  Menu01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardSpeed01Icon },
  { id: 'inventory', label: 'Inventory', icon: McpServerIcon },
  { id: 'locations', label: 'Locations', icon: Location01Icon },
  { id: 'settings', label: 'Settings', icon: Settings01Icon },
];

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-green-950 to-black">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-green-900/30 backdrop-blur-sm border-r border-green-500/30">
        <div className="p-6 border-b border-green-500/30">
          <h1 className="text-xl font-bold text-green-500 font-mono">NDIM</h1>
          <p className="text-sm text-green-500/70 font-mono">Network Device Inventory</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-500 shadow-lg shadow-green-500/20'
                    : 'text-green-500/70 hover:bg-green-900/50'
                }`}
              >
                <HugeiconsIcon icon={tab.icon} className="w-5 h-5" />
                <span className="font-medium font-mono">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-green-500/30">
          <div className="text-xs text-green-500/70 font-mono">
            v1.0.0
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-green-900/30 backdrop-blur-sm border-b border-green-500/30">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-green-500 font-mono">NDIM</h1>
            <p className="text-xs text-green-500/70 font-mono">Network Device Inventory</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-green-900/50 text-green-500"
          >
            {mobileMenuOpen ? <HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6" /> : <HugeiconsIcon icon={Menu01Icon} className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-green-900/30 backdrop-blur-sm border-b border-green-500/30 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-500 shadow-lg shadow-green-500/20'
                    : 'text-green-500/70 hover:bg-green-900/50'
                }`}
              >
                <HugeiconsIcon icon={tab.icon} className="w-5 h-5" />
                <span className="font-medium font-mono">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-green-900/30 backdrop-blur-sm border-t border-green-500/30 z-50">
        <div className="flex justify-around p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-green-500'
                    : 'text-green-500/70'
                }`}
              >
                <HugeiconsIcon icon={tab.icon} className="w-5 h-5" />
                <span className="text-xs font-medium font-mono">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
