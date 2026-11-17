'use client';

// Tab Inicio: el cupón destacado es lo primero que se ve; el catálogo (buscar y filtrar) se mira sin cuenta.
// El PRIMER cupón pide, una sola vez, ingresar con Google y responder la encuesta. Después cada cupón
// se guarda con un toque (lib/cuenta.ts lo recuerda en este navegador hasta que exista el backend).

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Encuesta from '@/components/Encuesta';
import GoogleLogin from '@/components/GoogleLogin';
import Icono from '@/components/Icono';
import Ticket from '@/components/Ticket';
import { asset } from '@/lib/asset';
import { getEncuesta, getSession, reclamarCupon, useCuenta, type CuponReclamado } from '@/lib/cuenta';
import { CATEGORIAS, PROMOCIONES, fechaCorta, type Categoria, type Promocion } from '@/lib/promociones';
import s from './Cuponera.module.css';

type Paso = 'ingresar' | 'encuesta' | 'listo';

const DESTACADA = PROMOCIONES.find((p) => p.destacada) ?? PROMOCIONES[0];
const LOCALIDADES = [...new Set(PROMOCIONES.map((p) => p.localidad))].sort((a, b) => a.localeCompare(b, 'es'));
/** Minúsculas y sin tildes: "tafi" encuentra "Tafí". */
const normalizar = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function Cuponera() {
  const { sesion, cupones } = useCuenta();
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas');
  const [localidad, setLocalidad] = useState('');
  const [paso, setPaso] = useState<Paso | null>(null); // null = diálogo cerrado
  const [promo, setPromo] = useState<Promocion>(DESTACADA); // cupón que el turista quiere guardar
  const [cupon, setCupon] = useState<CuponReclamado | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (paso && d && !d.open) d.showModal();
    if (!paso && d?.open) d.close();
  }, [paso]);

  /** Pide solo lo que falta: cuenta → encuesta → cupón. */
  const avanzar = useCallback((p: Promocion) => {
    if (!getSession()) return setPaso('ingresar');
    if (!getEncuesta()) return setPaso('encuesta');
    // TODO(backend): POST /promociones/{id}/adquirir (ver lib/cuenta.ts). Hoy se simula en el navegador.
    setCupon(reclamarCupon(p.id, p.vence));
    setPaso('listo');
  }, []);

  function quiero(p: Promocion) {
    setPromo(p);
    setCupon(null);
    avanzar(p);
  }

  const alIngresar = useCallback(() => avanzar(promo), [avanzar, promo]);

  const busqueda = normalizar(texto.trim());
  const lista = PROMOCIONES.filter(
    (p) =>
      (categoria === 'todas' || p.categoria === categoria) &&
      (!localidad || p.localidad === localidad) &&
      (!busqueda || normalizar([p.titulo, p.detalle, p.prestador, p.localidad].join(' ')).includes(busqueda)),
  );
  const filtrando = Boolean(busqueda || localidad || categoria !== 'todas');
  const limpiar = () => { setTexto(''); setLocalidad(''); setCategoria('todas'); };
  const tengo = (id: string) => cupones.some((c) => c.promoId === id);

  const botonCupon = (p: Promocion, variante: 'hero' | 'card') =>
    tengo(p.id) ? (
      <Link href="/mis-cupones/" className={`btn secondary full ${variante === 'hero' ? s.btnGrande : ''}`}>
        Ya lo tenés: ver mi código
      </Link>
    ) : (
      <button type="button" className={`btn accent full ${variante === 'hero' ? s.btnGrande : ''}`} onClick={() => quiero(p)} aria-describedby={`t-${variante}-${p.id}`}>
        Quiero este cupón
      </button>
    );

  return (
    <>
      <main id="contenido">
        {/* ---------- Hero: el cupón primero ---------- */}
        <section className={s.hero} aria-labelledby="hero-title">
          {/* Escena del manual por capas (líneas topográficas, sol, lomas de fondo-claro-organico.svg del kit) */}
          <div className={s.heroDeco} aria-hidden="true">
            <img className={s.topo} src={asset('/wayki-promo/fondos/lineas-topograficas.svg')} alt="" width={720} height={720} />
            <span className={s.sol} />
            <svg className={s.lomas} viewBox="0 690 1920 390" preserveAspectRatio="none">
              <path d="M0 750C220 690 360 800 560 750S930 660 1180 750s450-30 740-45v375H0Z" fill="#b4d2a6" />
              <path d="M0 870C220 810 430 930 640 860S950 825 1120 905 1520 815 1920 875v205H0Z" fill="#84b786" />
            </svg>
          </div>
          <div className={`${s.heroGrid} content-width`}>
            <div className={s.escena}>
              <div className={s.wayki}>
                <p className={s.globo}>{sesion ? `¡${sesion.givenName}, mirá lo que te guardé!` : '¡Mirá lo que te guardé!'}</p>
                <img src={asset('/wayki-promo/mascota/wayki-cuerpo-completo.png')} alt="Wayki, tu anfitrión en Tucumán" width={546} height={862} />
              </div>
              <div className={s.ticketHero}>
                <Ticket
                  promo={DESTACADA}
                  variante="hero"
                  extra={
                    !tengo(DESTACADA.id) && (
                      <p className={s.codigo}>
                        <img src={asset('/wayki-promo/iconos/candado.svg')} alt="" width={20} height={20} />
                        <span className={s.codigoTexto}>
                          <span className="display" aria-hidden="true">W • • • • • •</span>
                          <small>Tu código aparece cuando lo guardás</small>
                        </span>
                      </p>
                    )
                  }
                  accion={botonCupon(DESTACADA, 'hero')}
                />
              </div>
            </div>

            <div className={s.lockup}>
              <h1 id="hero-title">
                <span className="display">Más Tucumán.</span>
                <span className={s.lockupB}>Más para vos.</span>
              </h1>
              <p>
                Cupones gratis en restaurantes, alojamientos y paseos de toda la provincia.
                Guardalos en el celular y mostralos cuando llegues.
              </p>
              <a href="#cupones" className="btn primary">Ver los {PROMOCIONES.length} cupones</a>
            </div>
          </div>
        </section>

        {/* ---------- Catálogo: buscar y filtrar ---------- */}
        <section id="cupones" className={`${s.catalogo} content-width`} aria-labelledby="catalogo-title">
          <div className={s.catalogoHead}>
            <h2 id="catalogo-title">Elegí tu próximo plan</h2>
            <p className="muted">Mirá todos los que quieras. Con el primero creás tu cuenta y después se guardan con un toque.</p>
          </div>

          <div className={s.buscador} role="search">
            <label className={s.campo}>
              <Icono nombre="buscar" size={20} />
              <span className="sr-only">Buscar cupones</span>
              <input type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Empanadas, kayak, Tafí…" autoComplete="off" />
            </label>
            <label className={s.campo}>
              <Icono nombre="ubicacion" size={20} />
              <span className="sr-only">Localidad</span>
              <select value={localidad} onChange={(e) => setLocalidad(e.target.value)}>
                <option value="">Toda la provincia</option>
                {LOCALIDADES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className={s.chips} role="group" aria-label="Filtrar cupones por categoría">
            {[{ id: 'todas' as const, nombre: 'Todos' }, ...CATEGORIAS].map((c) => (
              <button key={c.id} type="button" className={s.chip} aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>
                {c.nombre}
              </button>
            ))}
          </div>

          <p className={s.total} aria-live="polite">
            {lista.length === 1 ? '1 cupón' : `${lista.length} cupones`}
            {filtrando && lista.length > 0 && <button type="button" className={s.limpiar} onClick={limpiar}>Ver todos</button>}
          </p>
          {lista.length ? (
            <div className={s.grilla}>
              {lista.map((p) => <Ticket key={p.id} promo={p} accion={botonCupon(p, 'card')} />)}
            </div>
          ) : (
            <div className={s.vacio}>
              <p><strong>No encontramos cupones con esa búsqueda.</strong></p>
              <p className="muted">Probá con otra palabra, otra categoría o toda la provincia.</p>
              <button type="button" className="btn primary" onClick={limpiar}>Ver todos los cupones</button>
            </div>
          )}
          <p className="small-note">Beneficios y comercios de ejemplo, sin validez comercial. Imágenes ilustrativas.</p>
        </section>

        {/* ---------- Cómo funciona (solo mientras no tenga cuenta) ---------- */}
        {!sesion && (
          <section className={s.banda} aria-labelledby="pasos-title">
            <img className={s.bandaFondo} src={asset('/wayki-promo/fondos/lineas-topograficas.svg')} alt="" width={720} height={720} />
            <div className={`${s.bandaGrid} content-width`}>
              <div>
                <h2 id="pasos-title">Tu primer cupón, en tres pasos</h2>
                <ol className={s.pasos}>
                  <li><span className="display">1</span><div><h3>Ingresá con Google</h3><p>Una sola vez. Sin contraseñas nuevas.</p></div></li>
                  <li><span className="display">2</span><div><h3>Contanos de tu viaje</h3><p>Seis preguntas cortas, también una sola vez.</p></div></li>
                  <li><span className="display">3</span><div><h3>Mostrá el código</h3><p>En el local, antes de pagar. Los próximos cupones se guardan con un toque.</p></div></li>
                </ol>
                <a href="#cupones" className="btn accent">Elegir mi primer cupón</a>
              </div>
              <img className={s.bandaWayki} src={asset('/wayki-promo/mascota/wayki-busto.png')} alt="" width={546} height={456} loading="lazy" />
            </div>
          </section>
        )}
      </main>

      {/* ---------- Diálogo: cuenta → encuesta → cupón (los dos primeros, una sola vez) ---------- */}
      <dialog
        ref={dialogo}
        className={s.dialogo}
        aria-labelledby="dialogo-title"
        onClose={() => setPaso(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setPaso(null); }} // clic en el fondo
      >
        {paso && (
          <div className={s.dialogoCuerpo}>
            <button type="button" className={s.cerrar} onClick={() => setPaso(null)} aria-label="Cerrar">×</button>

            {paso !== 'listo' && (
              <>
                <div className={s.progreso} aria-hidden="true">
                  <span className={s.hecho} />
                  <span className={paso === 'encuesta' ? s.hecho : ''} />
                </div>
                <p className={s.pasoN}>Paso {paso === 'ingresar' ? 1 : 2} de 2, solo esta vez</p>
                <div className={s.resumen}>
                  <img src={asset(promo.foto)} alt="" width={64} height={64} />
                  <p><span className="display">{promo.beneficio}</span> {promo.titulo}</p>
                </div>
              </>
            )}

            {paso === 'ingresar' && (
              <>
                <h2 id="dialogo-title">Guardá tu primer cupón</h2>
                <p className="muted">Ingresá con Google. Lo hacés una sola vez: después cada cupón se guarda con un toque.</p>
                <div className={s.google}><GoogleLogin onLogin={alIngresar} /></div>
                <p className="small-note">Usamos tu nombre, correo y foto de Google solo para identificar tu cuenta.</p>
              </>
            )}

            {paso === 'encuesta' && (
              <>
                <h2 id="dialogo-title">{sesion ? `${sesion.givenName}, contanos de tu viaje` : 'Contanos de tu viaje'}</h2>
                <p className="muted">Lo respondés una sola vez. Nos ayuda a mejorar lo que Tucumán tiene para vos.</p>
                <Encuesta textoBoton="Guardar y obtener mi cupón" onListo={() => avanzar(promo)} />
              </>
            )}

            {paso === 'listo' && cupon && (
              <div className={s.listo}>
                <img src={asset('/wayki-promo/mascota/wayki-busto.png')} alt="" width={546} height={456} className={s.listoWayki} />
                <h2 id="dialogo-title">¡Ya es tuyo!</h2>
                <p>{promo.titulo}, en {promo.prestador}.</p>
                <div className={s.codigoFinal}>
                  <small>Tu código</small>
                  <strong className="display">{cupon.codigo}</strong>
                  <small>Válido hasta el {fechaCorta(cupon.vence)}</small>
                </div>
                <p className="muted">Quedó guardado en Mis cupones. Mostralo en el local antes de pagar.</p>
                <p className="small-note">Código de prueba: todavía no se puede canjear.</p>
                <div className={s.listoAcciones}>
                  <button type="button" className="btn primary full" onClick={() => setPaso(null)}>Seguir mirando cupones</button>
                  <Link href="/mis-cupones/" className="btn ghost full">Ir a Mis cupones</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
