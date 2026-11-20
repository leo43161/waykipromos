import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACTO_EMAIL } from '@/lib/site';
import s from '../legal.module.css';

// La pide Google para publicar el ingreso con Google (pantalla de consentimiento) y la Ley 25.326.
// Describe lo que la app y la API hacen de verdad (api-doc/contrato-api.html): si eso cambia, cambia esta página.
// PENDIENTE: revisión del área legal del Ente.
export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos usa Wayki Promo, para qué, quién los ve y cómo ejercer tus derechos según la Ley 25.326.',
  alternates: { canonical: '/privacidad/' },
};

export default function Privacidad() {
  return (
    <main id="contenido" className={`${s.legal} content-width`}>
      <article className={s.texto}>
        <h1><span className="display">Política de privacidad</span></h1>
        <p className={s.vigencia}>Wayki Promo · Ente Autárquico Tucumán Turismo · Vigente desde el 19 de noviembre de 2026</p>
        <p>
          Wayki Promo es la cuponera del Ente Autárquico Tucumán Turismo. Acá te contamos qué datos tuyos usamos, para qué,
          quién los ve y qué derechos tenés. Para mirar las promociones no hace falta ningún dato: solo te pedimos ingresar
          cuando querés guardar un cupón.
        </p>

        <h2>Quién es responsable</h2>
        <p>El Ente Autárquico Tucumán Turismo es el responsable de la base de datos de Wayki Promo.</p>

        <h2>Qué datos usamos</h2>
        <ul>
          <li>
            <strong>De tu cuenta de Google</strong>, cuando ingresás: nombre, apellido, email, foto de perfil y el identificador
            de tu cuenta. No accedemos a tus contactos, correos, archivos ni a ningún otro dato de tu cuenta de Google.
          </li>
          <li>
            <strong>De la encuesta de viaje</strong> que respondés antes de tu primer cupón: rango de edad, provincia o país
            donde vivís, cuánto tiempo te quedás, motivo del viaje, con quién viajás y cómo conociste Wayki Promo.
          </li>
          <li><strong>De tus cupones:</strong> cuáles guardaste y cuándo, y cuándo y en qué comercio los usaste.</li>
          <li><strong>Datos técnicos</strong> de cada pedido al servidor (dirección IP, fecha y hora), por seguridad.</li>
        </ul>

        <h2>Para qué los usamos</h2>
        <ul>
          <li>Crear y mantener tu cuenta.</li>
          <li>Generar tus cupones y que el comercio pueda validarlos cuando los usás.</li>
          <li>
            Elaborar las estadísticas del Observatorio Turístico del Ente, para conocer a quienes nos visitan y planificar la
            actividad turística de la provincia. Las estadísticas se elaboran y se publican siempre agrupadas, sin identificar
            a ninguna persona.
          </li>
          <li>Cuidar la seguridad del servicio y evitar abusos, como guardar el mismo cupón muchas veces.</li>
        </ul>
        <p>No vendemos, alquilamos ni cedemos tus datos, y no los usamos para publicidad de terceros.</p>

        <h2>Quién los ve</h2>
        <ul>
          <li>
            <strong>El comercio</strong>, cuando usás un cupón: ve tu nombre, la inicial de tu apellido y el cupón. No ve tu
            email ni tus respuestas.
          </li>
          <li>
            <strong>El personal autorizado del Ente</strong>: tu perfil de viaje y tus cupones, sin tu email, para las
            estadísticas.
          </li>
          <li><strong>El equipo técnico</strong> de la plataforma, solo para mantenerla funcionando.</li>
          <li>
            <strong>Google</strong>, que te permite ingresar con tu cuenta según su propia{' '}
            <a href="https://policies.google.com/privacy?hl=es-419" target="_blank" rel="noopener noreferrer">política de privacidad</a>.
          </li>
        </ul>

        <h2>Dónde se guardan</h2>
        <p>
          En los servidores del Ente Tucumán Turismo. En tu celular o computadora guardamos tu sesión para no pedirte que
          ingreses cada vez; se borra cuando cerrás sesión. No usamos cookies de publicidad ni de seguimiento. El botón de
          Google puede usar sus propias cookies para el ingreso.
        </p>

        <h2>Cuánto tiempo</h2>
        <p>
          Mientras tengas tu cuenta. Podés borrarla cuando quieras desde <Link href="/cuenta/">Mi cuenta</Link>: eliminamos
          tus datos personales (nombre, email, foto e identificador de Google) y anulamos los cupones que no usaste. Tus
          respuestas de la encuesta y el uso de los cupones quedan solo como estadística anónima.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Podés acceder a tus datos, corregirlos, actualizarlos o borrarlos, como establece la Ley N.º 25.326 de
          Protección de los Datos Personales. En <Link href="/cuenta/">Mi cuenta</Link> ves tus datos y tus respuestas,
          las corregís y borrás tu cuenta. Para cualquier otro pedido o consulta, escribile al Ente Autárquico Tucumán
          Turismo a <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>.
        </p>
        <p className={s.ley}>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo
          establecido en el artículo 14, inciso 3 de la Ley N.º 25.326. La Agencia de Acceso a la Información Pública, en su
          carácter de Órgano de Control de la Ley N.º 25.326, tiene la atribución de atender las denuncias y reclamos que
          interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de
          protección de datos personales.
        </p>

        <h2>Cambios</h2>
        <p>
          Si cambiamos esta política, lo publicamos en esta página con la fecha nueva. Ver también las{' '}
          <Link href="/terminos/">condiciones del servicio</Link>.
        </p>
      </article>
    </main>
  );
}
