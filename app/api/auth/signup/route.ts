import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    email,
    password,
    role,
    firstName,
    lastName,
    specialty,
    licenseNumber,
    phone
  } = body;

  const supabase = await createClient();

  // 1. Create Supabase Auth User
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role // Optional: store role in metadata too
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (data.user) {
    // 2. Insert into specific Role Table
    let profileError;

    if (role === 'doctor') {
      const { error } = await supabase
        .from('doctors')
        .insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          specialty: specialty,
          license_number: licenseNumber
        });
      profileError = error;
    } else if (role === 'guardian') {
      const { error } = await supabase
        .from('guardians')
        .insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email, // Required unique in guardians table
          phone: phone
        });
      profileError = error;
    }

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // NOTE: In a production app you might want to rollback the auth user creation here
      // providing a robust transaction, but for this MVP we just return error.
      return NextResponse.json(
        { error: 'Usuario creado pero falló la creación del perfil. ' + profileError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { user: data.user, session: data.session },
    { status: 201 }
  );
}
