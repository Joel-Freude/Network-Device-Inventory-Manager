'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MatrixHorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  className?: string;
}

const defaultColors = ['#22c55e', '#10b981', '#059669', '#047857'];

export default function MatrixHorizontalBarChart({ data, className = '' }: MatrixHorizontalBarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#22c55e" opacity={0.2} />
          <XAxis 
            type="number" 
            stroke="#22c55e" 
            tick={{ fill: '#22c55e', fontSize: 12 }}
            axisLine={{ stroke: '#22c55e' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#22c55e" 
            tick={{ fill: '#22c55e', fontSize: 12 }}
            width={60}
            axisLine={{ stroke: '#22c55e' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              color: '#22c55e',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: '#22c55e' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
