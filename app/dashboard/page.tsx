'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/kpi-card';
import { PatientList } from '@/components/dashboard/patient-list';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import Image from 'next/image';
import { Plus, Search, LogOut } from 'lucide-react';
import { GuardianView } from '@/components/dashboard/guardian-view';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  status: 'normal' | 'alert' | 'critical';
}

interface Alert {
  id: string;
  patientName: string;
  patientId: string;
  metalType: string;
  level: number;
  unit: string;
  severity: 'critical' | 'alert';
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'doctor' | 'guardian' | 'unknown'>('unknown');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch patients and alerts on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get User Role
      const roleRes = await fetch('/api/auth/me');
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        setUserRole(roleData.role);
        setUserProfile(roleData.profile);
      }

      // 2. Fetch patients (API filters based on role)
      const patientsRes = await fetch('/api/patients');
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        // Transform patients to ensure they have required fields
        const transformedPatients = (patientsData.patients || []).map((p: any) => ({
          ...p,
          status: p.status || 'normal',
        }));
        setPatients(transformedPatients);
      }

      // 3. Fetch alerts (Only needed for doctors usually, but let's fetch for now)
      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate KPIs
  const criticalCount = patients.filter(p => p.status === 'critical').length;
  const alertCount = patients.filter(p => p.status === 'alert' || p.status === 'critical').length;

  if (loading) {
    return <Loading />;
  }

  // --- VISTA TUTOR (GUARDIAN) ---
  if (userRole === 'guardian') {
    return (
      <GuardianView
        userProfile={userProfile}
        patients={patients}
        onLogout={handleLogout}
        isLoading={isLoading}
      />
    );
  }

  // --- VISTA DOCTOR (DEFAULT) ---
  return (
    <main className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header Doctor */}
      <div className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="MetaTrace" width={160} height={48} priority />
            </div>

            {/* Mobile Actions */}
            <div className="flex gap-2">
              <Link href="/search">
                <Button variant="ghost" size="icon" className="sm:hidden text-muted-foreground">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="hidden sm:flex gap-2 bg-transparent">
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </Link>

              <Link href="/patients/new">
                <Button size="icon" className="sm:hidden rounded-full h-10 w-10 shadow-md">
                  <Plus className="w-5 h-5" />
                </Button>
                <Button className="hidden sm:flex gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Paciente
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Doctor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Helper for small screens: show Dr Name */}
        <div className="sm:hidden mb-6">
          <h2 className="text-lg font-bold">Hola, Dr. {userProfile?.last_name || 'Médico'}</h2>
          <p className="text-sm text-muted-foreground">Resumen del día</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <KPICard
            label="Casos Críticos"
            value={criticalCount}
            icon="critical"
            color="red"
          />
          <KPICard
            label="Total Pacientes"
            value={patients.length}
            icon="patients"
            color="blue"
          />
          <KPICard
            label="Alertas Activas"
            value={alertCount}
            icon="alert"
            color="yellow"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-1">
              <Suspense fallback={<Loading />}>
                <AlertsSection alerts={alerts} />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <PatientList
              patients={patients.slice(0, 3)}
              title="Recientes"
              filter="all"
            />
          </div>
        </div>

        {/* All Patients Section */}
        <div className="mt-8">
          <PatientList
            patients={patients}
            title="Todos los Pacientes"
            filter="all"
          />
        </div>
      </div>
    </main>
  );
}
