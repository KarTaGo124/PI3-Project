import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // 2. Check if Doctor
    const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (doctor) {
        return NextResponse.json({
            role: 'doctor',
            profile: doctor,
            user_id: user.id,
            email: user.email
        });
    }

    // 3. Check if Guardian
    const { data: guardian, error: guardianError } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (guardian) {
        return NextResponse.json({
            role: 'guardian',
            profile: guardian,
            user_id: user.id,
            email: user.email
        });
    }

    // 4. Default / Unknown (e.g. just registered user without profile yet)
    return NextResponse.json({
        role: 'unknown',
        user_id: user.id,
        email: user.email
    });
}
