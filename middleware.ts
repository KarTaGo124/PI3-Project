import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/patients', '/search'];
const publicRoutes = ['/', '/login', '/signup'];

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;

  // Crear cliente Supabase en el proxy
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Obtener sesión del usuario
  const { data: { user }, error } = await supabase.auth.getUser();

  // Si el usuario está autenticado pero intenta acceder a rutas públicas (login/signup)
  // redirigir al dashboard
  if (user && publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si el usuario NO está autenticado e intenta acceder a rutas protegidas
  // redirigir al login
  if (!user && protectedRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si es la raíz y no está autenticado, ir a login
  if (!user && path === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
