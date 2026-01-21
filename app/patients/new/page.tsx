'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { RegistrationStep1 } from '@/components/patients/registration-step1';
import { RegistrationStep2 } from '@/components/patients/registration-step2';
import { RegistrationStep3 } from '@/components/patients/registration-step3';

export default function NewPatientPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    notes: '', // Initialize notes
    guardianId: '', // New field
    guardianName: '', // Kept for legacy/display compatibility if needed temporarily
    guardianPhone: '',
    address: '',
    initialLead: '',
    initialCadmium: '',
    initialArsenic: '',
    initialNotes: '',
  });

  const handleStep1 = (data: typeof formData) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const handleStep2 = (data: typeof formData) => {
    setFormData({ ...formData, ...data });
    setStep(3);
  };

  const handleStep3 = async (data: typeof formData) => {
    const finalData = { ...formData, ...data };

    try {
      // Calculate age from date of birth
      const birthDate = new Date(finalData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Prepare patient data for API
      const patientData = {
        first_name: finalData.firstName,
        last_name: finalData.lastName,
        age: age,
        gender: finalData.gender,
        birth_date: finalData.dateOfBirth,
        location: finalData.address,
        guardian_id: finalData.guardianId, // Send ID instead of creating new
        notes: finalData.notes, // Add notes
      };

      // Create patient
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error('Error al crear paciente');
      }

      const result = await response.json();
      const patientId = result.patient.id;

      // If initial metal values are provided, create a test
      if (finalData.initialLead || finalData.initialCadmium || finalData.initialArsenic) {
        const testData = {
          patient_id: patientId,
          test_date: new Date().toISOString().split('T')[0],
          lead_level: parseFloat(finalData.initialLead) || 0,
          cadmium_level: parseFloat(finalData.initialCadmium) || 0,
          arsenic_level: parseFloat(finalData.initialArsenic) || 0,
          notes: finalData.initialNotes,
        };

        await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData),
        });
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error al crear el paciente. Por favor intenta de nuevo.');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center w-full">
            {[
              { num: 1, label: 'Información Básica' },
              { num: 2, label: 'Contacto' },
              { num: 3, label: 'Valores Iniciales' }
            ].map((s, index, array) => (
              <div key={s.num} content="true" className="contents">
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors z-10 ${step >= s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <div className={`absolute top-12 whitespace-nowrap text-sm font-medium ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {s.label}
                  </div>
                </div>
                {index < array.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-colors ${step > s.num ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <RegistrationStep1 onNext={handleStep1} initialData={formData} />
        )}
        {step === 2 && (
          <RegistrationStep2
            onNext={handleStep2}
            onBack={handleBack}
            initialData={formData}
          />
        )}
        {step === 3 && (
          <RegistrationStep3
            onSubmit={handleStep3}
            onBack={handleBack}
            initialData={formData}
          />
        )}
      </div>
    </main>
  );
}
