// URL pública del sitio. Se usa para canonical, Open Graph, sitemap y robots.
// En producción definir NEXT_PUBLIC_SITE_URL (ver .env.example) ANTES de `npm run build`.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SITE_NAME = 'Wayki Promo · Tucumán Turismo';
export const SITE_DESCRIPTION =
  'Cupones y beneficios gratis para disfrutar Tucumán: gastronomía, alojamiento, aventura, cultura y bienestar en San Miguel de Tucumán, Tafí del Valle, las Yungas y los Valles Calchaquíes. Una iniciativa del Ente Tucumán Turismo.';
