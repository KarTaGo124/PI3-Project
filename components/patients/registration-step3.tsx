'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface Step3Props {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export function RegistrationStep3({
  onSubmit,
  onBack,
  initialData,
}: Step3Props) {
  const [formData, setFormData] = useState({
    initialLead: initialData.initialLead || '',
    initialCadmium: initialData.initialCadmium || '',
    initialArsenic: initialData.initialArsenic || '',
    initialNotes: initialData.initialNotes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.initialLead)
      newErrors.initialLead = 'El nivel de plomo es requerido';
    if (!formData.initialCadmium)
      newErrors.initialCadmium = 'El nivel de cadmio es requerido';
    if (!formData.initialArsenic)
      newErrors.initialArsenic = 'El nivel de arsénico es requerido';

    // Validate numbers
    if (formData.initialLead && isNaN(parseFloat(formData.initialLead)))
      newErrors.initialLead = 'Ingrese un valor numérico válido';
    if (formData.initialCadmium && isNaN(parseFloat(formData.initialCadmium)))
      newErrors.initialCadmium = 'Ingrese un valor numérico válido';
    if (formData.initialArsenic && isNaN(parseFloat(formData.initialArsenic)))
      newErrors.initialArsenic = 'Ingrese un valor numérico válido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-sm bg-blue-50 border-l-4 border-primary">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-1">
              Valores Iniciales de Metales Pesados
            </h3>
            <p className="text-sm text-primary/80">
              Ingrese los resultados del primer análisis. Estos valores se
              utilizarán como base para el monitoreo continuo del paciente.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Valores Iniciales</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plomo */}
          <div className="space-y-2">
            <Label htmlFor="initialLead">Nivel de Plomo (µg/dL) *</Label>
            <Input
              id="initialLead"
              name="initialLead"
              type="number"
              step="0.01"
              value={formData.initialLead}
              onChange={handleChange}
              placeholder="0.00"
              className={errors.initialLead ? 'border-red-500' : ''}
            />
            {errors.initialLead && (
              <p className="text-sm text-red-600">{errors.initialLead}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Límite de alerta: 25 µg/dL | Crítico: 45 µg/dL
            </p>
          </div>

          {/* Cadmio */}
          <div className="space-y-2">
            <Label htmlFor="initialCadmium">
              Nivel de Cadmio (µg/L) *
            </Label>
            <Input
              id="initialCadmium"
              name="initialCadmium"
              type="number"
              step="0.01"
              value={formData.initialCadmium}
              onChange={handleChange}
              placeholder="0.00"
              className={errors.initialCadmium ? 'border-red-500' : ''}
            />
            {errors.initialCadmium && (
              <p className="text-sm text-red-600">{errors.initialCadmium}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Límite de alerta: 1.5 µg/L | Crítico: 2.5 µg/L
            </p>
          </div>

          {/* Arsénico */}
          <div className="space-y-2">
            <Label htmlFor="initialArsenic">
              Nivel de Arsénico (µg/L) *
            </Label>
            <Input
              id="initialArsenic"
              name="initialArsenic"
              type="number"
              step="0.01"
              value={formData.initialArsenic}
              onChange={handleChange}
              placeholder="0.00"
              className={errors.initialArsenic ? 'border-red-500' : ''}
            />
            {errors.initialArsenic && (
              <p className="text-sm text-red-600">{errors.initialArsenic}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Límite de alerta: 8 µg/L | Crítico: 15 µg/L
            </p>
          </div>

          {/* Notas del Test Inicial */}
          <div className="space-y-2">
            <Label htmlFor="initialNotes">Notas del Análisis (Opcional)</Label>
            <textarea
              id="initialNotes"
              name="initialNotes"
              value={formData.initialNotes || ''}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Observaciones sobre la toma de muestra, laboratorio, etc..."
            />
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
              Registrar Paciente
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
