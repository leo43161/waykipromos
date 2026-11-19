import type { Metadata } from 'next';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import Cuponera from '@/components/Cuponera';
import { conApi } from '@/lib/api';
import { listarPromociones } from '@/lib/promociones';
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

// El catálogo se pide AL COMPILAR (queda en el HTML, para buscadores) y Cuponera lo refresca al abrir.
// Si la API no responde durante el build, la página sale igual y el catálogo se carga en el navegador.
export default async function Home() {
  const promociones = await listarPromociones().catch(() => []);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Cuponera inicial={promociones} />
      <footer className={`${s.footer} content-width`}>
        <img src={asset('/wayki-promo/marca/logo-tucuman-tiene-todo.png')} alt="Tucumán tiene todo" width={110} height={48} />
        <p className="small-note">
          Wayki Promo es una iniciativa del Ente Autárquico Tucumán Turismo.
          {!conApi('catalogo') && ` ${promociones.length} cupones de ejemplo mientras preparamos el lanzamiento.`}
          <br />
          <Link href="/terminos/">Condiciones del servicio</Link> · <Link href="/privacidad/">Política de privacidad</Link>
        </p>
      </footer>
    </>
  );
}
