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

  // Determine user role
  let role = 'unknown';
  const { data: doctor } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
  if (doctor) role = 'doctor';

  if (role !== 'doctor') {
    const { data: guardian } = await supabase.from('guardians').select('id').eq('user_id', user.id).single();
    if (guardian) role = 'guardian';
  }

  let query = supabase
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
          email,
          user_id
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Filter if guardian
  if (role === 'guardian') {
    // This is a bit complex in Supabase JS SDK without a direct filter on a joined table in one go for filtering parent rows based on child rows presence
    // Alternative: Get list of patient IDs first
    const { data: guardian } = await supabase.from('guardians').select('id').eq('user_id', user.id).single();
    if (guardian) {
      const { data: links } = await supabase.from('patient_guardians').select('patient_id').eq('guardian_id', guardian.id);
      const patientIds = links?.map(l => l.patient_id) || [];
      query = query.in('id', patientIds);
    } else {
      // Should not happen if role detected correctly, but safety fallback
      query = query.in('id', []);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Transform data
  const transformedData = data?.map((p: any) => {
    const primaryGuardian = p.patient_guardians?.find((pg: any) => pg.is_primary)?.guardians;
    return {
      ...p,
      guardian_name: primaryGuardian ? `${primaryGuardian.first_name} ${primaryGuardian.last_name}` : null,
      guardian_phone: primaryGuardian?.phone || null,
      guardian_email: primaryGuardian?.email || null,
    };
  }) || [];

  return NextResponse.json({ patients: transformedData, role }, { status: 200 });
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

  // 1. Create Patient
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .insert([
      {
        first_name: body.first_name,
        last_name: body.last_name,
        age: body.age,
        gender: body.gender,
        birth_date: body.birth_date,
        location: body.location,
        status: body.status || 'normal',
        notes: body.notes,
      }
    ])
    .select()
    .single();

  if (patientError) {
    return NextResponse.json(
      { error: patientError.message },
      { status: 400 }
    );
  }

  // 2. Link Existing Guardian (Strict Mode)
  if (body.guardian_id) {
    const { error: linkError } = await supabase
      .from('patient_guardians')
      .insert({
        patient_id: patientData.id,
        guardian_id: body.guardian_id,
        relationship: 'Tutor', // Default, could be expanded to be dynamic later
        is_primary: true
      });

    if (linkError) {
      console.error('Error linking guardian:', linkError);
      // We continue even if linking fails distinct from patient creation, but this is critical
      // Might want to return a warning or partial success
    }
  }

  return NextResponse.json(
    { patient: patientData },
    { status: 201 }
  );
}
