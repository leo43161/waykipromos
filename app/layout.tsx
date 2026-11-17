import type { Metadata, Viewport } from 'next';
import { Anton, Montserrat } from 'next/font/google';
import Navegacion from '@/components/Navegacion';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';
import s from './layout.module.css';

// next/font descarga Montserrat en el build y la sirve desde el propio sitio (funciona en export estático).
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
// Sustituto libre de Gobold (títulos de campaña del manual) hasta tener la licencia. Ver --font-display en globals.css.
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Wayki Promo · Beneficios y cupones para disfrutar Tucumán',
    template: '%s · Wayki Promo Tucumán',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Wayki Promo',
  keywords: [
    'Tucumán', 'turismo Tucumán', 'cupones Tucumán', 'descuentos Tucumán', 'beneficios turísticos',
    'Tafí del Valle', 'Valles Calchaquíes', 'Yungas', 'San Miguel de Tucumán', 'Tucumán Tiene Todo', 'Wayki',
  ],
  authors: [{ name: 'Ente Autárquico Tucumán Turismo', url: 'https://www.tucumanturismo.gob.ar' }],
  publisher: 'Ente Autárquico Tucumán Turismo',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_NAME,
    title: 'Wayki Promo · Más Tucumán. Más para vos.',
    description: SITE_DESCRIPTION,
    // En public/ y no como app/opengraph-image.jpg: con basePath + metadataBase con ruta,
    // Next 16 duplica /waykipromos en la URL de las imágenes por convención de archivo.
    images: [{
      url: '/opengraph-image.jpg',
      width: 1921,
      height: 1081,
      alt: 'Ilustración institucional Tucumán Tiene Todo con la Casa Histórica, cerros verdes y un pájaro benteveo.',
    }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#206c60',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${montserrat.variable} ${anton.variable}`}>
      <body className={s.body}>
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <Navegacion />
        {children}
      </body>
    </html>
  );
}
