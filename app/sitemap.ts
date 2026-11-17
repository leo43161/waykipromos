import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Agregar acá cada página pública indexable (con barra final: trailingSlash está activo).
// /mis-cupones/, /wayki/ y /cuenta/ quedan fuera a propósito (noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 }];
}
