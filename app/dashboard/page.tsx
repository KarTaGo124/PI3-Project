'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/kpi-card';
import { PatientList } from '@/components/dashboard/patient-list';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { Plus, BarChart3, Search, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  status: 'normal' | 'alert' | 'critical';
}

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
      <main className="min-h-screen bg-background">
        {/* Header Tutor */}
        <div className="border-b bg-white sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Mis Hijos</h1>
                  <p className="text-sm text-muted-foreground">
                    Panel de Familia - {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tutor */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {patients.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground">No tienes pacientes vinculados.</h3>
              <p>Contacta al administrador si crees que esto es un error.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.map((patient) => (
                <Link href={`/patients/${patient.id}`} key={patient.id} className="block group">
                  <div className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${patient.status === 'critical' ? 'border-red-200 bg-red-50/50' :
                    patient.status === 'alert' ? 'border-yellow-200 bg-yellow-50/50' :
                      'border-gray-100 bg-white'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-muted-foreground">{patient.age} años</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${patient.status === 'critical' ? 'bg-red-100 text-red-700' :
                        patient.status === 'alert' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {patient.status === 'critical' ? 'Atención Requerida' :
                          patient.status === 'alert' ? 'Observación' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // --- VISTA DOCTOR (DEFAULT) ---
  return (
    <main className="min-h-screen bg-background">
      {/* Header Doctor */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Monitoreo Médico</h1>
                <p className="text-sm text-muted-foreground">
                  La Oroya, Perú {userRole === 'doctor' && userProfile ? `- Dr. ${userProfile.last_name}` : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/search">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </Link>
              <Link href="/patients/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Paciente
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Doctor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            label="Casos Críticos"
            value={criticalCount}
            icon="critical"
            color="red"
          />
          <KPICard
            label="Total de Pacientes"
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
            <Suspense fallback={<Loading />}>
              <AlertsSection alerts={alerts} />
            </Suspense>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <PatientList
              patients={patients.slice(0, 3)}
              title="Pacientes Recientes"
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
