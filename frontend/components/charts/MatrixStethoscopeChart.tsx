'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CPUMetrics } from '@/hooks/useWebSocket';

interface MatrixStethoscopeChartProps {
  metrics: CPUMetrics | null;
}

export default function MatrixStethoscopeChart({ metrics }: MatrixStethoscopeChartProps) {
  const [history, setHistory] = useState<Array<{ time: string; cpu: number }>>([]);

  useEffect(() => {
    if (metrics) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 2
      });
      
      setHistory(prev => {
        const newHistory = [...prev, { time: timeStr, cpu: metrics.cpu_usage }];
        // Keep only last 50 data points
        return newHistory.slice(-50);
      });
    }
  }, [metrics]);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-green-500/50">
        <div className="text-center">
          <div className="text-sm">Initializing stethoscope...</div>
          <div className="text-xs mt-2 animate-pulse">Acquiring CPU pulse</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-green-500/5 rounded-lg blur-xl" />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#00FF00', fontSize: 10, fontFamily: 'monospace' }}
            stroke="#00FF00"
            strokeOpacity={0.3}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: '#00FF00', fontSize: 10, fontFamily: 'monospace' }}
            stroke="#00FF00"
            strokeOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000000',
              border: '1px solid #00FF00',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: '#00FF00'
            }}
            itemStyle={{ color: '#00FF00' }}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#00FF00"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={2} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </LineChart>
      </ResponsiveContainer>
      <div className="absolute top-2 right-2 text-xs text-green-500/70 font-mono">
        CPU PULSE MONITOR
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-green-500/70 font-mono">
        {metrics ? `CURRENT: ${metrics.cpu_usage.toFixed(1)}%` : ''}
      </div>
    </div>
  );
}
