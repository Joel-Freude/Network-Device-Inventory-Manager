import { Activity, Globe, Map, Satellite, Settings, Network } from 'lucide-react';

const items = [
  { icon: Globe, label: 'Globe', active: true },
  { icon: Map, label: 'Map', active: false },
  { icon: Satellite, label: 'Satellite', active: false },
  { icon: Activity, label: 'Activity', active: false, badge: 3 },
  { icon: Network, label: 'Network', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export default function IconRail() {
  return (
    <div className="hud-rail">
      {items.map((item) => (
        <button
          key={item.label}
          className="hud-rail-btn"
          data-active={item.active}
          title={item.label}
        >
          <item.icon size={18} />
          {item.badge && <span className="hud-rail-badge">{item.badge}</span>}
        </button>
      ))}
    </div>
  );
}
