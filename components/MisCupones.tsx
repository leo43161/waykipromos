'use client';

// Tab Mis cupones: primero los que se pueden usar (con el código bien grande para mostrar en el local),
// después los usados, vencidos y anulados, apagados y con sello. Salen de GET /turista/cupones (lib/cuenta.ts):
// cada cupón trae su promoción, así que se ve aunque la promoción ya no esté en el catálogo.

import Link from 'next/link';
import Ticket from '@/components/Ticket';
import { asset } from '@/lib/asset';
import { recargarCuenta, useCuenta, type EstadoCupon } from '@/lib/cuenta';
import s from './MisCupones.module.css';

const SELLO: Record<Exclude<EstadoCupon, 'disponible'>, { texto: string; tono: 'usado' | 'vencido' }> = {
  usado: { texto: 'Usado', tono: 'usado' },
  vencido: { texto: 'Vencido', tono: 'vencido' },
  anulado: { texto: 'Anulado', tono: 'vencido' },
};

export default function MisCupones() {
  const { listo, cupones, error } = useCuenta();
  const paraUsar = cupones.filter((c) => c.estado === 'disponible');
  const usados = cupones.filter((c) => c.estado !== 'disponible');

  return (
    <main id="contenido" className={`${s.main} content-width`}>
      <div className={s.cabecera}>
        <h1>Mis cupones</h1>
        <p className="muted">Mostrá el código en el local antes de pagar. El personal lo valida y listo.</p>
      </div>

      {!listo && <p className="muted" role="status">Cargando tus cupones…</p>}

      {error && (
        <div className={s.vacio} role="alert">
          <p className="form-error">{error}</p>
          <button type="button" className="btn secondary" onClick={recargarCuenta}>Probar de nuevo</button>
        </div>
      )}

      {listo && !error && cupones.length === 0 && (
        <div className={s.vacio}>
          <img src={asset('/wayki-promo/estados/mis-cupones-vacios.svg')} alt="" width={560} height={340} />
          <h2>Todavía no guardaste cupones</h2>
          <p className="muted">Elegí uno en Inicio: con el primero creás tu cuenta y después se guardan con un toque.</p>
          <Link href="/#cupones" className="btn accent">Elegir mi primer cupón</Link>
        </div>
      )}

      {paraUsar.length > 0 && (
        <section aria-labelledby="para-usar">
          <h2 id="para-usar" className={s.seccion}>Para usar <span>{paraUsar.length}</span></h2>
          <ul className={s.lista}>
            {paraUsar.map((c) => (
              <li key={c.codigo}>
                <Ticket
                  promo={c.promo}
                  variante="mio"
                  vence={c.vence}
                  extra={
                    <p className={s.codigo}>
                      <small>Código</small>
                      <strong className="display">{c.codigo}</strong>
                    </p>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {usados.length > 0 && (
        <section aria-labelledby="usados">
          <h2 id="usados" className={s.seccion}>Usados y vencidos <span>{usados.length}</span></h2>
          <ul className={s.lista}>
            {usados.map((c) => (
              <li key={c.codigo}>
                <Ticket promo={c.promo} variante="mio" vence={c.vence} sello={SELLO[c.estado as keyof typeof SELLO]} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
