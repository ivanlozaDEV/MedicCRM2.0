'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

/**
 * Hook para manejar el slug de la organización en la URL
 * Valida que el slug coincida con la organización del usuario
 */
export function useOrganizationSlug() {
  const params = useParams();
  const router = useRouter();
  const { organization, isLoading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  const slug = params?.slug as string | undefined;

  useEffect(() => {
    // Esperar a que cargue la autenticación
    if (isLoading) {
      return;
    }

    // Si no hay organización, redirigir al login
    if (!organization) {
      router.push('/login');
      return;
    }

    // Si hay organización pero no hay slug en la URL, redirigir al slug correcto
    if (!slug) {
      router.push(`/${organization.slug}/dashboard`);
      return;
    }

    // Si el slug no coincide con la organización del usuario, redirigir al slug correcto
    if (slug !== organization.slug) {
      console.warn(`Slug mismatch: URL has "${slug}" but user belongs to "${organization.slug}"`);
      router.push(`/${organization.slug}/dashboard`);
      return;
    }

    // Todo está bien
    setIsValidating(false);
  }, [slug, organization, isLoading, router]);

  return {
    slug,
    organization,
    isValidating: isLoading || isValidating,
    isValid: !isLoading && !isValidating && slug === organization?.slug,
  };
}
