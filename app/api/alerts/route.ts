import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get alerts with patient information AND the actual test date
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select(`
        *,
        patients (
          id,
          first_name,
          last_name
        ),
        metal_tests (
          test_date
        )
      `)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform alerts to match frontend format
        const transformedAlerts = (alerts || []).map((alert: any) => ({
            id: alert.id.toString(),
            patientName: alert.patients
                ? `${alert.patients.first_name} ${alert.patients.last_name}`
                : 'Desconocido',
            patientId: alert.patient_id,
            metalType: alert.metal_type || 'Desconocido',
            level: alert.level || 0,
            unit: getMetalUnit(alert.metal_type),
            severity: alert.severity as 'critical' | 'alert',
            // Use test_date if available, otherwise use timestamp
            timestamp: formatTimestamp(alert.metal_tests?.[0]?.test_date || alert.timestamp),
        }));

        return NextResponse.json({ alerts: transformedAlerts });
    } catch (error) {
        console.error('Error in alerts API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function getMetalUnit(metalType: string): string {
    const metalTypeUpper = metalType?.toUpperCase() || '';
    if (metalTypeUpper.includes('PLOMO') || metalTypeUpper.includes('LEAD')) {
        return 'µg/dL';
    }
    return 'µg/L';
}

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) {
        return 'Hace unos momentos';
    } else if (diffMins < 60) {
        return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
        return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffMonths < 12) {
        return `Hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`;
    } else {
        return `Hace ${diffYears} año${diffYears !== 1 ? 's' : ''}`;
    }
}
