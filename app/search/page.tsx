'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { PatientList } from '@/components/dashboard/patient-list';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  status: 'normal' | 'alert' | 'critical';
}

const Loading = () => <div className="text-center p-8">Cargando...</div>;

function SearchContent() {
  const searchParams = useSearchParams();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'critical' | 'alert' | 'normal'
  >('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'young' | 'older'>('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        // Transform patients to ensure they have required fields
        const transformedPatients = (data.patients || []).map((p: any) => ({
          ...p,
          status: p.status || 'normal',
        }));
        setAllPatients(transformedPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return allPatients.filter(patient => {
      // Search filter
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        patient.first_name.toLowerCase().includes(searchTerm) ||
        patient.last_name.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && patient.status !== statusFilter) {
        return false;
      }

      // Age filter
      if (ageFilter === 'young' && patient.age > 6) return false;
      if (ageFilter === 'older' && patient.age <= 6) return false;

      return true;
    });
  }, [allPatients, searchQuery, statusFilter, ageFilter]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Card className="p-6 border-0 shadow-sm mb-8">
        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar por nombre</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nombre o apellido..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'alert', label: 'Alerta' },
                  { value: 'critical', label: 'Crítico' },
                ].map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={
                      statusFilter === option.value ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setStatusFilter(
                        option.value as
                        | 'all'
                        | 'critical'
                        | 'alert'
                        | 'normal'
                      )
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rango de Edad</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Todas' },
                  { value: 'young', label: '0-6 años' },
                  { value: 'older', label: '7-12 años' },
                ].map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={
                      ageFilter === option.value ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setAgeFilter(
                        option.value as 'all' | 'young' | 'older'
                      )
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {filteredPatients.length} paciente
              {filteredPatients.length !== 1 ? 's' : ''} encontrado
              {filteredPatients.length !== 1 ? 's' : ''}
            </p>
            {(searchQuery || statusFilter !== 'all' || ageFilter !== 'all') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setAgeFilter('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {filteredPatients.length > 0 ? (
        <PatientList
          patients={filteredPatients}
          title={`Resultados (${filteredPatients.length})`}
          filter="all"
        />
      ) : (
        <Card className="p-12 border-0 shadow-sm text-center">
          <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No se encontraron pacientes</p>
          <p className="text-muted-foreground">
            Intenta con otros términos de búsqueda o filtros
          </p>
        </Card>
      )}
    </>
  );
}

export default function SearchPage() {
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
          <h1 className="text-2xl font-bold">Buscar Pacientes</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<Loading />}>
          <SearchContent />
        </Suspense>
      </div>
    </main>
  );
}
