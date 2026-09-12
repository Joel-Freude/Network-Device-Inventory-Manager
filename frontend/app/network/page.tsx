'use client'

import { Network } from 'lucide-react'

export default function NetworkPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-cyber-black">
      <div className="cyber-panel rounded-lg p-8 text-center">
        <Network size={48} className="text-cyber-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold cyber-text mb-2">NETWORK</h2>
        <p className="text-cyber-muted">Network management interface coming soon...</p>
      </div>
    </div>
  )
}
