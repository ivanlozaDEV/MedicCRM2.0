import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para validar rutas con slug de organización
 * Solo valida que las rutas /[slug]/dashboard/* tengan un formato válido
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo procesar rutas que tengan el patrón /[slug]/dashboard/*
  const slugPattern = /^\/([^\/]+)\/dashboard/;
  const match = pathname.match(slugPattern);

  if (!match) {
    // No es una ruta con slug, dejar pasar
    return NextResponse.next();
  }

  const slug = match[1];

  // Verificar que el slug no sea una ruta estática conocida
  const staticRoutes = ['api', '_next', 'favicon.ico'];
  if (staticRoutes.includes(slug)) {
    return NextResponse.next();
  }

  // Validación básica del formato del slug
  // Solo permitir slugs con letras minúsculas, números y guiones
  const validSlugPattern = /^[a-z0-9-]+$/;
  if (!validSlugPattern.test(slug)) {
    // Slug inválido, redirigir al login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // El slug parece válido, dejar pasar
  // La validación real (si el usuario pertenece a esa org) se hace en el hook useOrganizationSlug
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Solo aplicar middleware a rutas que empiecen con /[cualquier-cosa]/dashboard
     * Excluir archivos estáticos y rutas API
     */
    '/:slug/dashboard/:path*',
  ],
};
