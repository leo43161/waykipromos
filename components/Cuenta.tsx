'use client';

// Tab Mi cuenta. Sin sesión: explica que la cuenta se crea con el primer cupón (y deja ingresar a quien
// ya tiene una, por ejemplo desde otro celular). Con sesión: perfil, resumen de cupones, respuestas del viaje
// y cerrar sesión. Más opciones (editar respuestas, preferencias, ayuda) quedan para después.

import Link from 'next/link';
import GoogleLogin from '@/components/GoogleLogin';
import Icono from '@/components/Icono';
import { asset } from '@/lib/asset';
import { estadoCupon, logout, useCuenta } from '@/lib/cuenta';
import s from './Cuenta.module.css';

export default function Cuenta() {
  const { listo, sesion, encuesta, cupones } = useCuenta();
  if (!listo) return <main id="contenido" className={s.main} />;

  if (!sesion) {
    return (
      <main id="contenido" className={`${s.main} content-width`}>
        <div className={s.invitado}>
          <img src={asset('/wayki-promo/mascota/wayki-busto.png')} alt="" width={546} height={456} className={s.wayki} />
          <h1>Tu cuenta</h1>
          <p className="muted">
            Se crea sola cuando guardás tu primer cupón: ingresás con Google y respondés seis preguntas, una sola vez.
          </p>
          <Link href="/#cupones" className="btn accent">Elegir mi primer cupón</Link>
        </div>
        <div className={s.yaTengo}>
          <h2>¿Ya tenés cuenta?</h2>
          <p className="muted">Ingresá con la misma cuenta de Google para ver tus cupones.</p>
          <GoogleLogin />
        </div>
      </main>
    );
  }

  const paraUsar = cupones.filter((c) => estadoCupon(c) === 'disponible').length;
  const usados = cupones.length - paraUsar;
  const respuestas = encuesta && [
    ['Vivís en', encuesta.residencia],
    ['Motivo', encuesta.motivo],
    ['Viajás', encuesta.conQuien],
    ['Estadía', encuesta.noches],
    ['Te enteraste por', encuesta.medio],
    ['Edad', encuesta.edad],
  ];

  return (
    <main id="contenido" className={`${s.main} content-width`}>
      <section className={s.perfil} aria-labelledby="perfil-title">
        {sesion.picture
          ? <img src={sesion.picture} alt="" width={72} height={72} referrerPolicy="no-referrer" className={s.foto} />
          : <span className={`${s.foto} ${s.inicial}`} aria-hidden="true">{sesion.givenName.charAt(0)}</span>}
        <div>
          <h1 id="perfil-title">{sesion.name}</h1>
          <p>{sesion.email}</p>
        </div>
      </section>

      <Link href="/mis-cupones/" className={s.resumen}>
        <span><strong className="display">{paraUsar}</strong> para usar</span>
        <span><strong className="display">{usados}</strong> usados o vencidos</span>
        <span className={s.ver}>Ver mis cupones</span>
      </Link>

      <section className={s.bloque} aria-labelledby="viaje-title">
        <h2 id="viaje-title">Tu viaje</h2>
        {respuestas ? (
          <dl className={s.respuestas}>
            {respuestas.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        ) : (
          <p className="muted">Todavía no respondiste las preguntas del viaje. Te las pedimos con tu primer cupón.</p>
        )}
      </section>

      <section className={s.bloque} aria-label="Sesión">
        <button type="button" className={`btn secondary ${s.salir}`} onClick={logout}>
          <Icono nombre="salir" size={20} /> Cerrar sesión
        </button>
        <p className="small-note">Si usás un celular compartido, cerrá sesión al terminar. Tus cupones quedan guardados en tu cuenta.</p>
      </section>
    </main>
  );
}
