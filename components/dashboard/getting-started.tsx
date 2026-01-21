'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const gettingStartedSteps = [
  {
    icon: Users,
    title: 'Registrar Paciente',
    description: 'Agrega un nuevo paciente con información básica y valores iniciales',
    action: '/patients/new',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Ver Evolución',
    description: 'Monitorea los cambios en los niveles de metales a través de gráficos',
    action: '#',
    color: 'primary',
  },
  {
    icon: AlertCircle,
    title: 'Gestionar Alertas',
    description: 'Revisa alertas críticas y crea derivaciones a especialistas',
    action: '#',
    color: 'red',
  },
];

export function GettingStarted() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card className="p-6 border-0 shadow-sm mb-8 bg-gradient-to-r from-primary/5 to-blue-50">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-bold">Guía de Inicio Rápido</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Acciones recomendadas para comenzar a usar la plataforma
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gettingStartedSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="p-4 bg-white rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              {step.action !== '#' && (
                <Link href={step.action}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-between gap-1"
                  >
                    Comenzar
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
