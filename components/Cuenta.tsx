'use client';

// Tab Mi cuenta. Sin sesión: explica que la cuenta se crea con el primer cupón (y deja ingresar a quien
// ya tiene una, por ejemplo desde otro celular). Con sesión: perfil, resumen de cupones, respuestas del viaje
// (que se pueden corregir), cerrar sesión y borrar la cuenta (Ley 25.326, DELETE /turista/cuenta).

import { useState } from 'react';
import Link from 'next/link';
import Encuesta from '@/components/Encuesta';
import GoogleLogin from '@/components/GoogleLogin';
import Icono from '@/components/Icono';
import { asset } from '@/lib/asset';
import { borrarCuenta, cerrarSesion, mensajeDeError, recargarCuenta, useCuenta } from '@/lib/cuenta';
import s from './Cuenta.module.css';

export default function Cuenta() {
  const { listo, sesion, encuesta, cupones, error } = useCuenta();
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState(''); // "Guardamos tus respuestas" / "Borramos tu cuenta"
  const [borrar, setBorrar] = useState<'no' | 'confirmar' | 'borrando'>('no');
  const [errorBorrar, setErrorBorrar] = useState('');
  if (!listo) return <main id="contenido" className={s.main} />;

  const avisoError = error && (
    <div className={s.bloque} role="alert">
      <p className="form-error">{error}</p>
      <button type="button" className="btn secondary" onClick={recargarCuenta}>Probar de nuevo</button>
    </div>
  );
  const avisoListo = aviso && <p className={s.aviso} role="status">{aviso}</p>;

  async function confirmarBorrado() {
    setBorrar('borrando');
    setErrorBorrar('');
    try {
      await borrarCuenta(); // cierra la sesión: la página pasa a la vista sin cuenta
      setAviso('Borramos tu cuenta y tus datos personales.');
      setBorrar('no');
    } catch (e) {
      setErrorBorrar(mensajeDeError(e));
      setBorrar('confirmar');
    }
  }

  if (!sesion) {
    return (
      <main id="contenido" className={`${s.main} content-width`}>
        {avisoError}
        {avisoListo}
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

  const paraUsar = cupones.filter((c) => c.estado === 'disponible').length;
  const usados = cupones.length - paraUsar;
  const respuestas = encuesta && [
    ['Vivís en', encuesta.provincia?.nombre ?? encuesta.pais?.nombre],
    ['Motivo', encuesta.motivo.nombre],
    ['Viajás', encuesta.compania.nombre],
    ['Estadía', encuesta.duracion.nombre],
    ['Te enteraste por', encuesta.medio.nombre],
    ['Edad', encuesta.rango_edad.nombre],
  ];

  return (
    <main id="contenido" className={`${s.main} content-width`}>
      {avisoError}
      <section className={s.perfil} aria-labelledby="perfil-title">
        {sesion.foto
          ? <img src={sesion.foto} alt="" width={72} height={72} referrerPolicy="no-referrer" className={s.foto} />
          : <span className={`${s.foto} ${s.inicial}`} aria-hidden="true">{(sesion.nombre || sesion.email).charAt(0)}</span>}
        <div>
          <h1 id="perfil-title">{sesion.nombreCompleto}</h1>
          <p>{sesion.email}</p>
        </div>
      </section>

      <Link href="/mis-cupones/" className={s.resumen}>
        <span><strong className="display">{paraUsar}</strong> para usar</span>
        <span><strong className="display">{usados}</strong> usados o vencidos</span>
        <span className={s.ver}>Ver mis cupones</span>
      </Link>

      <section className={s.bloque} aria-labelledby="viaje-title">
        <div className={s.bloqueCab}>
          <h2 id="viaje-title">Tu viaje</h2>
          {respuestas && !editando && (
            <button type="button" className={s.enlace} onClick={() => { setEditando(true); setAviso(''); }}>Corregir respuestas</button>
          )}
        </div>
        {avisoListo}
        {editando ? (
          <>
            <Encuesta
              inicial={encuesta}
              textoBoton="Guardar cambios"
              onListo={() => { setEditando(false); setAviso('Listo: guardamos tus respuestas.'); }}
            />
            <button type="button" className="btn ghost" onClick={() => setEditando(false)}>Cancelar</button>
          </>
        ) : respuestas ? (
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
        <button type="button" className={`btn secondary ${s.salir}`} onClick={cerrarSesion}>
          <Icono nombre="salir" size={20} /> Cerrar sesión
        </button>
        <p className="small-note">Si usás un celular compartido, cerrá sesión al terminar. Tus cupones quedan guardados en tu cuenta.</p>
      </section>

      <section className={`${s.bloque} ${s.borrar}`} aria-labelledby="borrar-title">
        <h2 id="borrar-title">Borrar mi cuenta</h2>
        {borrar === 'no' ? (
          <>
            <p className="muted">Borramos tus datos personales. Más información en la <Link href="/privacidad/">política de privacidad</Link>.</p>
            <button type="button" className={`btn secondary ${s.salir}`} onClick={() => setBorrar('confirmar')}>Borrar mi cuenta</button>
          </>
        ) : (
          <div className={s.confirmar} role="group" aria-label="Confirmar borrado">
            <p><strong>¿Seguro? No se puede deshacer.</strong></p>
            <ul>
              <li>Borramos tu nombre, tu email, tu foto y la conexión con tu cuenta de Google.</li>
              {paraUsar > 0 && (
                <li>
                  {paraUsar === 1
                    ? 'Tu cupón sin usar se anula y vuelve a estar disponible para otros.'
                    : `Tus ${paraUsar} cupones sin usar se anulan y vuelven a estar disponibles para otros.`}
                </li>
              )}
              <li>Tus respuestas del viaje quedan solo como estadística, sin tu nombre.</li>
            </ul>
            {errorBorrar && <p className="form-error" role="alert">{errorBorrar}</p>}
            <div className={s.confirmarAcciones}>
              <button type="button" className={`btn ${s.peligro}`} onClick={confirmarBorrado} disabled={borrar === 'borrando'}>
                {borrar === 'borrando' ? 'Borrando…' : 'Sí, borrar mi cuenta'}
              </button>
              <button type="button" className="btn ghost" onClick={() => { setBorrar('no'); setErrorBorrar(''); }} disabled={borrar === 'borrando'}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
