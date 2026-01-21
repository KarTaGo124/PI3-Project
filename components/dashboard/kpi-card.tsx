'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, Users, TrendingUp } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  icon: 'critical' | 'patients' | 'alert';
  color: 'red' | 'blue' | 'yellow';
}

const iconComponents = {
  critical: AlertTriangle,
  patients: Users,
  alert: TrendingUp,
};

const colorClasses = {
  red: 'bg-red-50 text-red-900',
  blue: 'bg-blue-50 text-blue-900',
  yellow: 'bg-yellow-50 text-yellow-900',
};

const iconColorClasses = {
  red: 'text-red-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
};

export function KPICard({ label, value, icon, color }: KPICardProps) {
  const Icon = iconComponents[icon];

  return (
    <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className={`text-3xl font-bold font-mono ${colorClasses[color]}`}>
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${colorClasses[color]}`}
        >
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
    </Card>
  );
}
