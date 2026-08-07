'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CPUMetrics } from '@/hooks/useWebSocket';

interface MatrixRadarChartProps {
  metrics: CPUMetrics | null;
}

export default function MatrixRadarChart({ metrics }: MatrixRadarChartProps) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-green-500/50">
        <div className="text-center">
          <div className="text-sm">Waiting for data...</div>
          <div className="text-xs mt-2 animate-pulse">Connecting to matrix stream</div>
        </div>
      </div>
    );
  }

  const data = [
    { metric: 'CPU', value: metrics.cpu_usage },
    { metric: 'Memory', value: metrics.memory_usage },
    { metric: 'Load 1m', value: metrics.load_average_1m * 10 },
    { metric: 'Load 5m', value: metrics.load_average_5m * 10 },
    { metric: 'Net In', value: metrics.network_in },
    { metric: 'Net Out', value: metrics.network_out },
    { metric: 'Disk', value: metrics.disk_usage },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-green-500/5 rounded-lg blur-xl" />
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid 
            stroke="#00FF00" 
            strokeOpacity={0.3}
            strokeWidth={1}
          />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#00FF00', fontSize: 12, fontFamily: 'monospace' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#00FF00', fontSize: 10, fontFamily: 'monospace' }}
            stroke="#00FF00"
            strokeOpacity={0.3}
          />
          <Radar
            name="Metrics"
            dataKey="value"
            stroke="#00FF00"
            strokeWidth={2}
            fill="#00FF00"
            fillOpacity={0.3}
            dot={{ fill: '#00FF00', r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="absolute top-2 right-2 text-xs text-green-500/70 font-mono">
        DEVICE #{metrics.device_id}
      </div>
    </div>
  );
}
