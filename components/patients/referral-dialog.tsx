'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Download, Send } from 'lucide-react';

interface ReferralDialogProps {
  patientName: string;
  patientId: number;
  status: 'critical' | 'alert' | 'normal';
  currentMetalValues: {
    lead: number;
    cadmium: number;
    arsenic: number;
  };
  onClose: () => void;
  onSubmit: (referral: ReferralData) => void;
}

interface ReferralData {
  specialistType: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  scheduledDate?: string;
}

const specialistOptions = [
  'Toxicología',
  'Pediatría',
  'Medicina Ocupacional',
  'Neurología',
  'Hematología',
  'Nefrología',
];

export function ReferralDialog({
  patientName,
  patientId,
  status,
  currentMetalValues,
  onClose,
  onSubmit,
}: ReferralDialogProps) {
  const [referralData, setReferralData] = useState<ReferralData>({
    specialistType: status === 'critical' ? 'Toxicología' : '',
    reason: '',
    urgency: status === 'critical' ? 'emergency' : 'routine',
    scheduledDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setReferralData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!referralData.specialistType)
      newErrors.specialistType = 'Selecciona un especialista';
    if (!referralData.reason.trim())
      newErrors.reason = 'Proporciona una razón para la derivación';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(referralData);
  };

  const handleGeneratePDF = () => {
    // Generate PDF referral document
    const content = `
REFERENCIA MÉDICA
Fecha: ${new Date().toLocaleDateString('es-PE')}
Paciente: ${patientName}
ID Paciente: ${patientId}

VALORES ACTUALES DE METALES PESADOS:
- Plomo: ${currentMetalValues.lead} µg/dL (Crítico: >45 | Alerta: >25)
- Cadmio: ${currentMetalValues.cadmium} µg/L (Crítico: >2.5 | Alerta: >1.5)
- Arsénico: ${currentMetalValues.arsenic} µg/L (Crítico: >15 | Alerta: >8)

Especialista Solicitado: ${referralData.specialistType}
Razón: ${referralData.reason}
Urgencia: ${referralData.urgency === 'emergency' ? 'EMERGENCIA' : referralData.urgency === 'urgent' ? 'URGENTE' : 'RUTINA'}
    `;

    // In production, use a library like jsPDF
    console.log('PDF generated:', content);
    alert('PDF generado - En un ambiente de producción se descargaría');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-0 shadow-lg">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Generar Derivación</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Alert Banner if Critical */}
        {status === 'critical' && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Caso Crítico</p>
                <p className="text-sm text-red-800 mt-1">
                  Los valores del paciente superan los límites críticos. Se
                  recomienda derivación URGENTE a un especialista.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Values Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Valores Actuales de Metales Pesados
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-mono font-semibold">
                  {currentMetalValues.lead}
                </span>
                <p className="text-xs text-blue-700">µg/dL Plomo</p>
              </div>
              <div>
                <span className="text-blue-600 font-mono font-semibold">
                  {currentMetalValues.cadmium}
                </span>
                <p className="text-xs text-blue-700">µg/L Cadmio</p>
              </div>
              <div>
                <span className="text-blue-600 font-mono font-semibold">
                  {currentMetalValues.arsenic}
                </span>
                <p className="text-xs text-blue-700">µg/L Arsénico</p>
              </div>
            </div>
          </div>

          {/* Specialist Selection */}
          <div className="space-y-2">
            <Label htmlFor="specialist">Especialista Solicitado *</Label>
            <select
              id="specialist"
              name="specialistType"
              value={referralData.specialistType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm bg-background ${
                errors.specialistType ? 'border-red-500' : ''
              }`}
            >
              <option value="">Seleccionar especialista...</option>
              {specialistOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.specialistType && (
              <p className="text-sm text-red-600">{errors.specialistType}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la Derivación *</Label>
            <Textarea
              id="reason"
              name="reason"
              value={referralData.reason}
              onChange={handleChange}
              placeholder="Describe los síntomas, hallazgos clínicos, o motivos para la derivación..."
              rows={4}
              className={errors.reason ? 'border-red-500' : ''}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Nivel de Urgencia</Label>
            <select
              id="urgency"
              name="urgency"
              value={referralData.urgency}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="routine">Rutina</option>
              <option value="urgent">Urgente (2-3 días)</option>
              <option value="emergency">Emergencia (hoy)</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Fecha Sugerida de Cita</Label>
            <Input
              id="scheduledDate"
              name="scheduledDate"
              type="date"
              value={referralData.scheduledDate}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePDF}
              className="flex-1 gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
              Registrar Derivación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
