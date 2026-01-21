'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export function RegistrationStep2({
  onNext,
  onBack,
  initialData,
}: Step2Props) {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    guardianId: initialData.guardianId || '',
    address: initialData.address || '',
  });

  // Selected guardian details for display
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch guardians on mount
  React.useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const res = await fetch('/api/guardians');
        if (res.ok) {
          const data = await res.json();
          setGuardians(data.guardians || []);

          // Pre-select if initialData has ID
          if (initialData.guardianId) {
            const found = data.guardians.find((g: any) => g.id.toString() === initialData.guardianId.toString());
            if (found) setSelectedGuardian(found);
          }
        }
      } catch (error) {
        console.error("Failed to fetch guardians", error);
      }
    };
    fetchGuardians();
  }, [initialData.guardianId]);

  const handleGuardianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const guardianId = e.target.value;
    setFormData(prev => ({ ...prev, guardianId }));

    const guardian = guardians.find(g => g.id.toString() === guardianId);
    setSelectedGuardian(guardian || null);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, address: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.guardianId)
      newErrors.guardianId = 'Debe seleccionar un tutor responsable';
    if (!formData.address.trim())
      newErrors.address = 'La dirección es requerida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass the ID and the display info needed for next steps or summary
    onNext({
      guardianId: formData.guardianId,
      address: formData.address,
      // Pass these for legacy support or display if needed, though mostly ID matters now
      guardianName: selectedGuardian ? `${selectedGuardian.first_name} ${selectedGuardian.last_name}` : '',
      guardianPhone: selectedGuardian?.phone || '',
    });
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Vincular Tutor</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Seleccione un tutor registrado. Si el tutor no aparece, debe registrarse primero en la plataforma.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="guardianId">Seleccionar Tutor *</Label>
          <select
            id="guardianId"
            name="guardianId"
            value={formData.guardianId}
            onChange={handleGuardianChange}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.guardianId ? 'border-red-500' : ''}`}
          >
            <option value="">-- Seleccione --</option>
            {guardians.map(g => (
              <option key={g.id} value={g.id}>
                {g.first_name} {g.last_name} ({g.email})
              </option>
            ))}
          </select>
          {errors.guardianId && (
            <p className="text-sm text-red-600">{errors.guardianId}</p>
          )}
        </div>

        {selectedGuardian && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p><strong>Teléfono:</strong> {selectedGuardian.phone || 'No registrado'}</p>
            <p><strong>Email:</strong> {selectedGuardian.email}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">Dirección del Paciente *</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleAddressChange}
            placeholder="Calle, número, distrito..."
            rows={4}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
          <p className="text-xs text-muted-foreground">
            La dirección es importante para seguimiento y comunicación
          </p>
        </div>

        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 bg-transparent"
          >
            Atrás
          </Button>
          <Button type="submit" className="flex-1">
            Siguiente
          </Button>
        </div>
      </form>
    </Card>
  );
}
