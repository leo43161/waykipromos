import type { Metadata } from 'next';
import { asset } from '@/lib/asset';
import Cuponera from '@/components/Cuponera';
import { PROMOCIONES } from '@/lib/promociones';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/site';
import s from './home.module.css';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Datos estructurados para buscadores (schema.org): el sitio + los cupones como ofertas.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Wayki Promo',
      url: `${SITE_URL}/`,
      inLanguage: 'es-AR',
      description: SITE_DESCRIPTION,
      publisher: {
        '@type': 'GovernmentOrganization',
        name: 'Ente Autárquico Tucumán Turismo',
        url: 'https://www.tucumanturismo.gob.ar',
      },
      about: { '@type': 'TouristDestination', name: 'Provincia de Tucumán, Argentina' },
    },
    // TODO(backend): cuando los cupones sean reales, sumar cada uno como Offer (hoy son de ejemplo y no se publican).
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Cuponera />
      <footer className={`${s.footer} content-width`}>
        <img src={asset('/wayki-promo/marca/logo-tucuman-tiene-todo.png')} alt="Tucumán tiene todo" width={110} height={48} />
        <p className="small-note">
          Wayki Promo es una iniciativa del Ente Autárquico Tucumán Turismo.
          {' '}{PROMOCIONES.length} cupones de ejemplo mientras preparamos el lanzamiento.
        </p>
      </footer>
    </>
  );
}
