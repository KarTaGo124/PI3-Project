import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const patientId = request.nextUrl.searchParams.get('patient_id');

  let query = supabase
    .from('metal_tests')
    .select('*')
    .order('test_date', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ tests: data }, { status: 200 });
}

// Thresholds definition
const THRESHOLDS = {
  Plomo: { critical: 45, alert: 25 },
  Cadmio: { critical: 2.5, alert: 1.5 },
  Arsénico: { critical: 15, alert: 8 },
};

function checkThresholds(lead: number, cadmium: number, arsenic: number) {
  const alertsToCreate = [];

  // Check Lead (Plomo)
  if (lead >= THRESHOLDS.Plomo.critical) {
    alertsToCreate.push({ type: 'Plomo', level: lead, severity: 'critical' });
  } else if (lead >= THRESHOLDS.Plomo.alert) {
    alertsToCreate.push({ type: 'Plomo', level: lead, severity: 'alert' });
  }

  // Check Cadmium (Cadmio)
  if (cadmium >= THRESHOLDS.Cadmio.critical) {
    alertsToCreate.push({ type: 'Cadmio', level: cadmium, severity: 'critical' });
  } else if (cadmium >= THRESHOLDS.Cadmio.alert) {
    alertsToCreate.push({ type: 'Cadmio', level: cadmium, severity: 'alert' });
  }

  // Check Arsenic (Arsénico)
  if (arsenic >= THRESHOLDS.Arsénico.critical) {
    alertsToCreate.push({ type: 'Arsénico', level: arsenic, severity: 'critical' });
  } else if (arsenic >= THRESHOLDS.Arsénico.alert) {
    alertsToCreate.push({ type: 'Arsénico', level: arsenic, severity: 'alert' });
  }

  return alertsToCreate;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();

  // 1. Insert the test
  const { data: testData, error: testError } = await supabase
    .from('metal_tests')
    .insert([
      {
        patient_id: body.patient_id,
        test_date: body.test_date,
        lead_level: body.lead_level,
        cadmium_level: body.cadmium_level,
        arsenic_level: body.arsenic_level,
        notes: body.notes,
      }
    ])
    .select()
    .single();

  if (testError) {
    return NextResponse.json(
      { error: testError.message },
      { status: 400 }
    );
  }

  // 2. Generate alerts
  const alertsToCreate = checkThresholds(
    body.lead_level || 0,
    body.cadmium_level || 0,
    body.arsenic_level || 0
  );

  if (alertsToCreate.length > 0) {
    const alertRecords = alertsToCreate.map(alert => ({
      patient_id: body.patient_id,
      metal_type: alert.type,
      level: alert.level,
      severity: alert.severity,
      test_id: testData.id // Link to the newly created test
    }));

    const { error: alertError } = await supabase
      .from('alerts')
      .insert(alertRecords);

    if (alertError) {
      console.error('Error creating alerts:', alertError);
      // We don't fail the request if alerts fail, but we log it
    }
  }

  // 3. Update patient status
  let patientStatus = 'normal';
  if (alertsToCreate.some(a => a.severity === 'critical')) {
    patientStatus = 'critical';
  } else if (alertsToCreate.some(a => a.severity === 'alert')) {
    patientStatus = 'alert';
  }

  // Update patient status if it changed to a more severe state or update it anyway to reflect current test
  // Ideally we should check if the new status is more severe than current, 
  // but for now we assume the latest test defines the status.
  const { error: updateError } = await supabase
    .from('patients')
    .update({
      status: patientStatus,
      last_test_date: body.test_date
    })
    .eq('id', body.patient_id);

  if (updateError) {
    console.error('Error updating patient status:', updateError);
  }

  return NextResponse.json(
    { test: testData, alertsGenerated: alertsToCreate.length },
    { status: 201 }
  );
}
