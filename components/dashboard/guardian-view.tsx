'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, HeartPulse, AlertTriangle, CheckCircle } from 'lucide-react';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    status: 'normal' | 'alert' | 'critical';
}

interface GuardianViewProps {
    userProfile: any;
    patients: Patient[];
    onLogout: () => void;
    isLoading: boolean;
}

export function GuardianView({ userProfile, patients, onLogout, isLoading }: GuardianViewProps) {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header Simple */}
            <div className="bg-white border-b px-6 py-6 sticky top-0 z-50">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            Hola, {userProfile?.first_name || 'Papá/Mamá'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Aquí está la salud de tus hijos
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
                {patients.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HeartPulse className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No hay registros aún</h3>
                        <p className="text-slate-500 px-6 mt-2">
                            Cuando el doctor registre a tus hijos, aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {patients.map((patient) => {
                            const styles = getStatusStyles(patient.status);

                            return (
                                <div
                                    key={patient.id}
                                    className={`relative overflow-hidden rounded-2xl bg-white shadow-sm border-2 ${styles.borderColor} transition-transform active:scale-95 touch-manipulation`}
                                >
                                    <div className={`p-6 ${styles.bgTone}`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                                                    {patient.first_name}
                                                </h2>
                                                <p className="text-slate-600 font-medium">
                                                    {patient.age} años
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-full ${styles.iconBg}`}>
                                                {styles.icon}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${styles.statusBg} ${styles.statusText} font-bold text-lg`}>
                                                {styles.statusLabel}
                                            </div>
                                        </div>

                                        <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                                            {styles.message}
                                        </p>

                                        <Link href={`/patients/${patient.id}`} className="block mt-6">
                                            <Button className={`w-full h-12 text-base font-semibold shadow-none ${styles.buttonBg} hover:${styles.buttonHover} text-white border-0`}>
                                                Ver Detalles
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'critical':
            return {
                borderColor: 'border-red-100',
                bgTone: 'bg-red-50/30',
                iconBg: 'bg-red-100',
                icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
                statusBg: 'bg-red-100',
                statusText: 'text-red-700',
                statusLabel: '⚠️ Ir al Doctor',
                message: 'Los niveles están altos. Por favor lleva a tu hijo al centro de salud lo antes posible.',
                buttonBg: 'bg-red-600',
                buttonHover: 'bg-red-700'
            };
        case 'alert':
            return {
                borderColor: 'border-yellow-100',
                bgTone: 'bg-yellow-50/30',
                iconBg: 'bg-yellow-100',
                icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
                statusBg: 'bg-yellow-100',
                statusText: 'text-yellow-800',
                statusLabel: '👁️ Observar',
                message: 'Hay niveles un poco altos. Sigue las recomendaciones de higiene y alimentación.',
                buttonBg: 'bg-yellow-500',
                buttonHover: 'bg-yellow-600'
            };
        default:
            return {
                borderColor: 'border-emerald-100',
                bgTone: 'bg-emerald-50/30',
                iconBg: 'bg-emerald-100',
                icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
                statusBg: 'bg-emerald-100',
                statusText: 'text-emerald-700',
                statusLabel: '✅ Todo Bien',
                message: '¡Excelente! Los niveles están dentro de lo normal. Sigan así.',
                buttonBg: 'bg-emerald-600',
                buttonHover: 'bg-emerald-700'
            };
    }
}
