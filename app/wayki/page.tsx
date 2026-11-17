import type { Metadata } from 'next';
import Link from 'next/link';
import { asset } from '@/lib/asset';
import s from './wayki.module.css';

export const metadata: Metadata = {
  title: 'Wayki IA',
  description: 'Wayki IA, el asistente del Ente Tucumán Turismo para planear tu visita a Tucumán.',
  alternates: { canonical: '/wayki/' },
  robots: { index: false, follow: true },
};

// URL del chatbot Wayki IA (del EATT). Se lee al compilar; sin ella se muestra "muy pronto".
// El sitio del chatbot tiene que permitir mostrarse en un iframe de tucumanturismo.gob.ar
// (Content-Security-Policy: frame-ancestors, o sin X-Frame-Options: DENY/SAMEORIGIN si es otro dominio).
const WAYKI_IA_URL = process.env.NEXT_PUBLIC_WAYKI_IA_URL;

export default function WaykiPage() {
  if (WAYKI_IA_URL) {
    return (
      <main id="contenido" className={s.chat}>
        <h1 className="sr-only">Wayki IA</h1>
        <iframe src={WAYKI_IA_URL} title="Wayki IA, asistente turístico de Tucumán" className={s.iframe} />
      </main>
    );
  }

  return (
    <main id="contenido" className={s.pronto}>
      <span className={s.sol} aria-hidden="true" />
      <div className={`${s.contenido} content-width`}>
        <div className={s.texto}>
          <h1><span className="display">Wayki IA</span></h1>
          <p>
            Estamos preparando el asistente del Ente Tucumán Turismo: planes, lugares y datos útiles
            para tu visita, en una charla.
          </p>
          <Link href="/" className="btn primary">Mientras tanto, mirá los cupones</Link>
        </div>
        <div className={s.escena}>
          <p className={s.globo}>¡Hola! Pronto vas a poder preguntarme qué hacer en Tucumán.</p>
          <img className={s.wayki} src={asset('/wayki-promo/mascota/wayki-cuerpo-completo.png')} alt="Wayki" width={546} height={862} />
        </div>
      </div>
    </main>
  );
}
