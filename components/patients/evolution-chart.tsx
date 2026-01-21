'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';

interface Test {
  date: string;
  lead: number;
  cadmium: number;
  arsenic: number;
}

interface EvolutionChartProps {
  tests: Test[];
}

export function EvolutionChart({ tests }: EvolutionChartProps) {
  const [visibleLines, setVisibleLines] = useState({
    lead: true,
    cadmium: true,
    arsenic: true,
  });

  const toggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [line]: !prev[line],
    }));
  };

  const chartData = tests.map(test => ({
    date: new Date(test.date).toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
    }),
    Plomo: test.lead,
    Cadmio: test.cadmium,
    Arsénico: test.arsenic,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={visibleLines.lead ? 'default' : 'outline'}
          onClick={() => toggleLine('lead')}
        >
          Plomo
        </Button>
        <Button
          size="sm"
          variant={visibleLines.cadmium ? 'default' : 'outline'}
          onClick={() => toggleLine('cadmium')}
        >
          Cadmio
        </Button>
        <Button
          size="sm"
          variant={visibleLines.arsenic ? 'default' : 'outline'}
          onClick={() => toggleLine('arsenic')}
        >
          Arsénico
        </Button>
      </div>

      <div className="w-full h-96 bg-background border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            {visibleLines.lead && (
              <Line
                type="monotone"
                dataKey="Plomo"
                stroke="var(--status-critical)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-critical)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {visibleLines.cadmium && (
              <Line
                type="monotone"
                dataKey="Cadmio"
                stroke="var(--status-alert)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-alert)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {visibleLines.arsenic && (
              <Line
                type="monotone"
                dataKey="Arsénico"
                stroke="var(--status-normal)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-normal)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
