'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetalValueCardProps {
  metalName: string;
  value: number;
  unit: string;
  alertThreshold: number;
  criticalThreshold: number;
  status: 'normal' | 'alert' | 'critical';
}

const statusConfig = {
  normal: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    label: 'Normal',
    icon: TrendingDown,
    iconColor: 'text-green-600',
  },
  alert: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    label: 'Alerta',
    icon: TrendingUp,
    iconColor: 'text-yellow-600',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    label: 'Crítico',
    icon: TrendingUp,
    iconColor: 'text-red-600',
  },
};

export function MetalValueCard({
  metalName,
  value,
  unit,
  alertThreshold,
  criticalThreshold,
  status,
}: MetalValueCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`p-6 border-0 shadow-sm ${config.bg} border-l-4 ${config.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${config.text}`}>{metalName}</p>
          <p className={`text-3xl font-bold font-mono ${config.text} mt-1`}>
            {value}
          </p>
          <p className={`text-xs ${config.text} opacity-75 mt-1`}>{unit}</p>
        </div>
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>

      <div className="space-y-2 border-t border-current opacity-20 pt-4">
        <div className="flex justify-between text-xs">
          <span className={config.text}>Normal</span>
          <span className={`font-mono ${config.text}`}>0 - {alertThreshold}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className={config.text}>Alerta</span>
          <span className={`font-mono ${config.text}`}>
            {alertThreshold} - {criticalThreshold}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className={config.text}>Crítico</span>
          <span className={`font-mono ${config.text}`}>&gt; {criticalThreshold}</span>
        </div>
      </div>

      <div className={`mt-4 px-2 py-1 rounded text-xs font-medium text-center ${config.text} bg-white bg-opacity-50`}>
        {config.label}
      </div>
    </Card>
  );
}
