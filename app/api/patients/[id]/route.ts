import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      patient_guardians (
        is_primary,
        guardians (
          id,
          first_name,
          last_name,
          phone,
          email
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  // Transform data to flatten guardian info
  const primaryGuardian = data.patient_guardians?.find((pg: any) => pg.is_primary)?.guardians;
  const patientData = {
    ...data,
    guardian_name: primaryGuardian ? `${primaryGuardian.first_name} ${primaryGuardian.last_name}` : null,
    guardian_phone: primaryGuardian?.phone || null,
    guardian_email: primaryGuardian?.email || null,
  };

  return NextResponse.json({ patient: patientData }, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data, error } = await supabase
    .from('patients')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ patient: data }, { status: 200 });
}
