'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  status: 'normal' | 'alert' | 'critical';
}

interface PatientListProps {
  patients: Patient[];
  title?: string;
  filter?: 'all' | 'critical' | 'alert';
}

const statusColors = {
  normal: 'bg-green-100 text-green-800',
  alert: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

const statusLabels = {
  normal: 'Normal',
  alert: 'Alerta',
  critical: 'Crítico',
};

export function PatientList({
  patients,
  title = 'Pacientes',
  filter = 'all',
}: PatientListProps) {
  const filteredPatients =
    filter === 'all'
      ? patients
      : patients.filter(p => p.status === filter);

  return (
    <Card className="border-0 shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="divide-y">
        {filteredPatients.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No hay pacientes registrados
          </div>
        ) : (
          filteredPatients.map(patient => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="block hover:bg-muted/50 transition-colors"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <Badge className={statusColors[patient.status]}>
                      {statusLabels[patient.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Edad: {patient.age} años
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
