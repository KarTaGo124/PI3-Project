'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'doctor' | 'guardian'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Doctor specific
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Guardian specific
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          firstName,
          lastName,
          // Send specific fields based on role
          ...(role === 'doctor' ? { specialty, licenseNumber } : { phone }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear cuenta');
      }

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="MetaTrace" width={220} height={80} priority />
        </div>

        <Card className="p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Crear Cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona tu rol y completa tus datos
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                onClick={() => setRole('doctor')}
                className={`cursor-pointer p-4 border rounded-lg text-center transition-all ${role === 'doctor'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="font-semibold text-sm">Soy Médico</div>
              </div>
              <div
                onClick={() => setRole('guardian')}
                className={`cursor-pointer p-4 border rounded-lg text-center transition-all ${role === 'guardian'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="font-semibold text-sm">Soy Tutor</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombres</label>
                <Input
                  required
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellidos</label>
                <Input
                  required
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <Input
                required
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {role === 'doctor' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialidad</label>
                  <Input
                    required
                    placeholder="Ej. Toxicología"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">N° de Colegiatura (CMP)</label>
                  <Input
                    required
                    placeholder="Ej. 123456"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono de Contacto</label>
                <Input
                  required
                  placeholder="Ej. 987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Registrarme'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">
              ¿Ya tienes cuenta?
            </p>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push('/login')}
              disabled={isLoading}
            >
              Iniciar Sesión
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
