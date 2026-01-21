
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // Verificar autenticación (opcional, dependiendo de si quieres que sea público)
    // Idealmente solo doctores deberían ver esto
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Fetch all guardians
    const { data: guardians, error } = await supabase
        .from('guardians')
        .select('id, first_name, last_name, email, phone')
        .order('first_name', { ascending: true });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json({ guardians }, { status: 200 });
}
