import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Network Device Inventory Manager',
  description: 'Hacking theme SPA with MapLibre 3D Globe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cyber-black text-cyber-text antialiased">
        {children}
      </body>
    </html>
  )
}