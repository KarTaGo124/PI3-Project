'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step1Props {
  onNext: (data: any) => void;
  initialData: any;
}

export function RegistrationStep1({ onNext, initialData }: Step1Props) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    notes: initialData.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim())
      newErrors.lastName = 'El apellido es requerido';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    if (!formData.gender)
      newErrors.gender = 'El género es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(formData);
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Información Básica del Paciente</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Juan"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Pérez"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género *</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm bg-background ${errors.gender ? 'border-red-500' : ''
                }`}
            >
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas Médicas (Opcional)</Label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Antecedentes, alergias, observaciones..."
          />
        </div>

        <div className="flex gap-3 pt-6">
          <Button
            type="submit"
            className="flex-1"
          >
            Siguiente
          </Button>
        </div>
      </form>
    </Card >
  );
}
