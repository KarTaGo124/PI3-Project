'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    location: string;
}

interface Test {
    test_date: string;
    lead_level: number;
    cadmium_level: number;
    arsenic_level: number;
}

interface GuardianPatientViewProps {
    patient: Patient;
    tests: Test[];
}

export function GuardianPatientView({ patient, tests }: GuardianPatientViewProps) {
    const latestTest = tests[0];
    const previousTest = tests[1];

    const getStatus = (test: Test) => {
        if (!test) return 'normal';
        if (test.lead_level >= 45 || test.cadmium_level >= 2.5 || test.arsenic_level >= 15) return 'critical';
        if (test.lead_level >= 25 || test.cadmium_level >= 1.5 || test.arsenic_level >= 8) return 'alert';
        return 'normal';
    };

    const status = getStatus(latestTest);

    // Simplified Status Logic
    const statusConfig = {
        normal: {
            color: 'bg-emerald-100 text-emerald-800',
            borderColor: 'border-emerald-200',
            icon: <CheckCircle className="w-12 h-12 text-emerald-600" />,
            title: '¡Todo se ve bien!',
            description: 'Los niveles de tu hijo están saludables. Sigan con los buenos hábitos.',
        },
        alert: {
            color: 'bg-yellow-100 text-yellow-800',
            borderColor: 'border-yellow-200',
            icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
            title: 'Hay que tener cuidado',
            description: 'Algunos niveles están un poco altos. Revisa los consejos abajo.',
        },
        critical: {
            color: 'bg-red-100 text-red-800',
            borderColor: 'border-red-200',
            icon: <AlertTriangle className="w-12 h-12 text-red-600" />,
            title: 'Necesita atención médica',
            description: 'Los niveles son altos. Es importante ir al centro de salud.',
        },
    };

    const currentStatus = statusConfig[status];

    // Specific Advice based on which metal is highest relative to its limit
    const getAdvice = (test: Test | undefined) => {
        if (!test) return [];

        const advice = [];

        // Lead Advice
        if (test.lead_level >= 25) {
            advice.push({
                metal: 'Plomo',
                tips: [
                    'Lavar las manos y juguetes frecuentemente.',
                    'Limpiar el polvo de casa con trapo húmedo.',
                    'Consumir alimentos ricos en Calcio y Hierro.'
                ]
            });
        }

        // Arsenic/Cadmium Advice (General)
        if (test.cadmium_level >= 1.5 || test.arsenic_level >= 8) {
            advice.push({
                metal: 'Otros Metales',
                tips: [
                    'Evitar beber agua no tratada.',
                    'Lavar bien frutas y verduras.',
                    'Evitar exposicion a humos tóxicos.'
                ]
            });
        }

        if (advice.length === 0) {
            advice.push({
                metal: 'Prevención General',
                tips: [
                    'Mantener una dieta balanceada.',
                    'Higiene constante de manos.',
                    'Asistir a controles regulares.'
                ]
            });
        }

        return advice;
    };

    const adviceList = getAdvice(latestTest);

    // Trend Logic
    const getTrend = () => {
        if (!latestTest || !previousTest) return 'stable';

        // Average difference percentage
        const leadDiff = latestTest.lead_level - previousTest.lead_level;
        const cadmiumDiff = latestTest.cadmium_level - previousTest.cadmium_level;
        const arsenicDiff = latestTest.arsenic_level - previousTest.arsenic_level;

        const totalDiff = leadDiff + cadmiumDiff + arsenicDiff;

        if (totalDiff < -1) return 'improving';
        if (totalDiff > 1) return 'worsening';
        return 'stable';
    };

    const trend = getTrend();

    return (
        <main className="min-h-screen bg-slate-50 pb-8">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h1>
                        <p className="text-sm text-slate-500">{patient.age} años</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

                {/* Main Status Card */}
                <div className={`p-6 rounded-2xl border-2 ${currentStatus.borderColor} ${currentStatus.color} text-center space-y-4 shadow-sm`}>
                    <div className="flex justify-center">
                        <div className="p-4 bg-white/50 rounded-full">
                            {currentStatus.icon}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{currentStatus.title}</h2>
                        <p className="text-lg opacity-90 leading-snug">
                            {currentStatus.description}
                        </p>
                    </div>
                </div>

                {/* Trend Section */}
                {previousTest && (
                    <Card className="p-6 border-slate-100 shadow-sm">
                        <h3 className="text-slate-500 font-medium mb-4 uppercase text-xs tracking-wider">Comparado con la última vez</h3>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${trend === 'improving' ? 'bg-green-100' :
                                    trend === 'worsening' ? 'bg-red-100' : 'bg-slate-100'
                                }`}>
                                {trend === 'improving' && <TrendingDown className="w-6 h-6 text-green-600" />}
                                {trend === 'worsening' && <TrendingUp className="w-6 h-6 text-red-600" />}
                                {trend === 'stable' && <Minus className="w-6 h-6 text-slate-600" />}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-slate-800">
                                    {trend === 'improving' ? 'Está mejorando' :
                                        trend === 'worsening' ? 'Ha subido un poco' : 'Sigue igual'}
                                </p>
                                <p className="text-slate-500 text-sm">
                                    {trend === 'improving' ? '¡Muy bien! Los niveles han bajado.' :
                                        trend === 'worsening' ? 'Hay que prestar más atención.' : 'No hubo cambios grandes.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Advice Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 pl-1">¿Qué puedo hacer en casa?</h3>
                    {adviceList.map((item, idx) => (
                        <Card key={idx} className="p-6 border-slate-100 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h4 className="font-bold text-blue-700 mb-3 text-lg flex items-center gap-2">
                                ℹ️ {item.metal === 'Plomo' ? 'Consejos para Plomo' :
                                    item.metal === 'Otros Metales' ? 'Cuidado General' : 'Recomendaciones'}
                            </h4>
                            <ul className="space-y-3">
                                {item.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700">
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-200 flex-shrink-0"></span>
                                        <span className="text-base font-medium leading-relaxed">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>

                {/* Last Check Info */}
                <div className="text-center pt-4">
                    <p className="text-sm text-slate-400">
                        Última revisión: {new Date(latestTest?.test_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

            </div>
        </main>
    );
}
