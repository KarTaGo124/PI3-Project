'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { EvolutionChart } from '@/components/patients/evolution-chart';
import { MetalValueCard } from '@/components/patients/metal-value-card';
import { NewTestModal } from '@/components/patients/new-test-modal';
import { GuardianPatientView } from '@/components/patients/guardian-patient-view';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  birth_date: string;
  location: string;
  guardian_name: string;
  guardian_phone: string;
  created_at: string;
  notes?: string;
}

interface Test {
  id: string;
  patient_id: string;
  test_date: string;
  lead_level: number;
  cadmium_level: number;
  arsenic_level: number;
  created_at: string;
  notes?: string;
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

function calculateStatus(lead: number, cadmium: number, arsenic: number): 'normal' | 'alert' | 'critical' {
  // Critical thresholds
  if (lead >= 45 || cadmium >= 2.5 || arsenic >= 15) {
    return 'critical';
  }
  // Alert thresholds
  if (lead >= 25 || cadmium >= 1.5 || arsenic >= 8) {
    return 'alert';
  }
  return 'normal';
}

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTest, setShowNewTest] = useState(false);
  const [canCreateTest, setCanCreateTest] = useState(false);
  const [userRole, setUserRole] = useState<'doctor' | 'guardian' | 'unknown'>('unknown');

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Check permissions (User Role)
      const roleRes = await fetch('/api/auth/me');
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setUserRole(roleData.role);
        // Only doctors have full permission to create data
        setCanCreateTest(roleData.role === 'doctor');
      }

      // 2. Fetch patient details
      const patientRes = await fetch(`/api/patients/${resolvedParams.id}`);
      if (patientRes.ok) {
        const patientData = await patientRes.json();
        setPatient(patientData.patient);
      }

      // 3. Fetch patient tests
      const testsRes = await fetch(`/api/tests?patient_id=${resolvedParams.id}`);
      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Paciente no encontrado</p>
      </div>
    );
  }

  // --- GUARDIAN VIEW ---
  if (userRole === 'guardian') {
    return (
      <GuardianPatientView
        patient={patient}
        tests={tests}
      />
    );
  }

  // --- DOCTOR VIEW ---
  const latestTest = tests.length > 0 ? tests[0] : null;
  const status = latestTest
    ? calculateStatus(latestTest.lead_level, latestTest.cadmium_level, latestTest.arsenic_level)
    : 'normal';

  // Transform tests for chart (needs to be ascending order: Oldest -> Newest)
  const chartTests = [...tests].reverse().map(t => ({
    date: t.test_date,
    lead: t.lead_level,
    cadmium: t.cadmium_level,
    arsenic: t.arsenic_level,
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="flex flex-col gap-1 text-muted-foreground mt-1">
                <p className="">
                  {patient.age} años
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    Primer control: {tests.length > 0
                      ? new Date(tests[tests.length - 1].test_date).toLocaleDateString('es-PE')
                      : new Date(patient.created_at).toLocaleDateString('es-PE')}
                  </span>
                  {latestTest && (
                    <span>• Último control: {new Date(latestTest.test_date).toLocaleDateString('es-PE')}</span>
                  )}
                </div>
              </div>
            </div>
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Tutor/Responsable
            </h3>
            <p className="font-semibold mb-2">{patient.guardian_name || 'No especificado'}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              {patient.guardian_phone || 'No especificado'}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Ubicación
            </h3>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm">{patient.location || 'No especificado'}</p>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Fecha de Nacimiento
            </h3>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold">
                {patient.birth_date
                  ? new Date(patient.birth_date).toLocaleDateString('es-PE')
                  : 'No especificado'}
              </p>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm md:col-span-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Notas Médicas / Antecedentes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{patient.notes || 'Sin observaciones registradas.'}</p>
          </Card>
        </div>

        {/* Alert if critical */}
        {status === 'critical' && (
          <Card className="p-4 border-0 shadow-sm bg-red-50 border-l-4 border-red-600 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Caso Crítico - Requiere Atención Urgente
                </h3>
                <p className="text-sm text-red-800">
                  Los valores de metales pesados han superado los límites
                  críticos. Se recomienda realizar seguimiento médico inmediato.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Current Values */}
        {latestTest && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetalValueCard
              metalName="Plomo"
              value={latestTest.lead_level}
              unit="µg/dL"
              alertThreshold={25}
              criticalThreshold={45}
              status={
                latestTest.lead_level >= 45
                  ? 'critical'
                  : latestTest.lead_level >= 25
                    ? 'alert'
                    : 'normal'
              }
            />
            <MetalValueCard
              metalName="Cadmio"
              value={latestTest.cadmium_level}
              unit="µg/L"
              alertThreshold={1.5}
              criticalThreshold={2.5}
              status={
                latestTest.cadmium_level >= 2.5
                  ? 'critical'
                  : latestTest.cadmium_level >= 1.5
                    ? 'alert'
                    : 'normal'
              }
            />
            <MetalValueCard
              metalName="Arsénico"
              value={latestTest.arsenic_level}
              unit="µg/L"
              alertThreshold={8}
              criticalThreshold={15}
              status={
                latestTest.arsenic_level >= 15
                  ? 'critical'
                  : latestTest.arsenic_level >= 8
                    ? 'alert'
                    : 'normal'
              }
            />
          </div>
        )}

        {/* Evolution Chart */}
        {tests.length > 0 ? (
          <Card className="p-6 border-0 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Evolución de Niveles</h2>
              {canCreateTest && (
                <Button size="sm" variant="outline" onClick={() => setShowNewTest(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Nuevo Test
                </Button>
              )}
            </div>
            <EvolutionChart tests={chartTests} />
          </Card>
        ) : (
          <Card className="p-6 border-0 shadow-sm mb-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No hay tests registrados</p>
              {canCreateTest && (
                <Button size="sm" onClick={() => setShowNewTest(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Registrar Primer Test
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Test History */}
        {tests.length > 0 && (
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Historial de Tests</h2>
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(test.test_date).toLocaleDateString('es-PE')}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Pb: {test.lead_level} µg/dL | Cd: {test.cadmium_level} µg/L | As:{' '}
                      {test.arsenic_level} µg/L
                    </p>
                    {test.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Nota: {test.notes}
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <NewTestModal
        isOpen={showNewTest}
        onClose={() => setShowNewTest(false)}
        onSuccess={() => {
          fetchData();
          setShowNewTest(false);
        }}
        patientId={patient.id}
      />
    </main>
  );
}
