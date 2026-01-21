'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Alert {
  id: string;
  patientName: string;
  patientId: number;
  metalType: string;
  level: number;
  unit: string;
  severity: 'critical' | 'alert';
  timestamp: string;
}

interface AlertsSectionProps {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-sm p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            No hay alertas activas en este momento
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-red-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">
            Alertas Críticas ({alerts.length})
          </h2>
        </div>
      </div>
      <div className="divide-y">
        {alerts.map(alert => (
          <Link
            key={alert.id}
            href={`/patients/${alert.patientId}`}
            className="block hover:bg-red-50/50 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-red-900">
                  {alert.patientName}
                </p>
                <Badge
                  className={
                    alert.severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }
                >
                  {alert.severity === 'critical'
                    ? 'CRÍTICO'
                    : 'ALERTA'}
                </Badge>
              </div>
              <p className="text-sm text-red-800 mb-2">
                {alert.metalType}:{' '}
                <span className="font-mono font-semibold">
                  {alert.level} {alert.unit}
                </span>
              </p>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <Clock className="w-4 h-4" />
                {alert.timestamp}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
