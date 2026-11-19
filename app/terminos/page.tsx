import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACTO_EMAIL } from '@/lib/site';
import s from '../legal.module.css';

// La pide Google para publicar el ingreso con Google (pantalla de consentimiento).
// Las reglas salen del contrato de la API (api-doc/contrato-api.html): un cupón por persona y promoción, canje único,
// días y horarios, cupos. Si cambian ahí, cambian acá. PENDIENTE: revisión del área legal del Ente.
export const metadata: Metadata = {
  title: 'Condiciones del servicio',
  description: 'Cómo funcionan Wayki Promo y sus cupones: cuenta, validez, canje en los comercios adheridos y uso responsable.',
  alternates: { canonical: '/terminos/' },
};

export default function Terminos() {
  return (
    <main id="contenido" className={`${s.legal} content-width`}>
      <article className={s.texto}>
        <h1><span className="display">Condiciones del servicio</span></h1>
        <p className={s.vigencia}>Wayki Promo · Ente Autárquico Tucumán Turismo · Vigentes desde el 19 de noviembre de 2026</p>
        <p>
          Wayki Promo es un servicio gratuito del Ente Autárquico Tucumán Turismo que ofrece cupones con descuentos y
          beneficios en comercios adheridos de Tucumán. Al usarlo, aceptás estas condiciones.
        </p>

        <h2>Tu cuenta</h2>
        <p>
          Para mirar las promociones no necesitás cuenta. Para guardar cupones ingresás con tu cuenta de Google y respondés
          una vez una breve encuesta de viaje. Sos responsable de lo que se haga con tu cuenta.
        </p>

        <h2>Los cupones</h2>
        <ul>
          <li>Son gratuitos y no tienen valor en dinero: no se venden ni se cambian por efectivo.</li>
          <li>Podés guardar un cupón por promoción.</li>
          <li>
            Valen según las condiciones de cada promoción que se muestran en la app: fechas, días, horarios, cupos y
            restricciones. Si una promoción tiene condiciones particulares, se aplican esas.
          </li>
          <li>
            Se usan una sola vez, mostrando el código o el QR en el comercio, que lo valida en el momento. Un cupón usado o
            vencido no vuelve a servir.
          </li>
          <li>
            Los cupos son limitados. Guardar un cupón te reserva el beneficio hasta su vencimiento; cuando se agotan, la
            promoción deja de ofrecerse.
          </li>
        </ul>

        <h2>Los comercios</h2>
        <p>
          Cada comercio adherido es responsable de brindar el beneficio y del producto o servicio que ofrece. El Ente organiza
          la plataforma y controla que los comercios cumplan las condiciones del programa. Si tuviste un problema con un
          beneficio, escribinos a <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>.
        </p>

        <h2>Promociones y cuentas</h2>
        <p>
          El Ente puede modificar, pausar o dar de baja promociones. Los cupones que ya guardaste se pueden seguir usando
          hasta su vencimiento aunque la promoción se pause. También puede suspender cuentas que hagan un uso indebido del
          servicio, por ejemplo, crear cuentas para acumular cupones o intentar usar cupones de otras personas.
        </p>

        <h2>Tus datos</h2>
        <p>
          Cómo usamos tus datos y cuáles son tus derechos está en la <Link href="/privacidad/">política de privacidad</Link>.
        </p>

        <h2>Cambios</h2>
        <p>Si cambiamos estas condiciones, las publicamos en esta página con la fecha nueva.</p>
      </article>
    </main>
  );
}
