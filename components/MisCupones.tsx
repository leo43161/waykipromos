'use client';

// Tab Mis cupones: primero los que se pueden usar (con el código bien grande para mostrar en el local),
// después los usados y vencidos, apagados y con sello.
// TODO(backend): hoy salen de lib/cuenta.ts (este navegador); con backend, de GET /persona (estado real del canje).

import Link from 'next/link';
import Ticket from '@/components/Ticket';
import { asset } from '@/lib/asset';
import { estadoCupon, useCuenta } from '@/lib/cuenta';
import { PROMOCIONES } from '@/lib/promociones';
import s from './MisCupones.module.css';

export default function MisCupones() {
  const { listo, cupones } = useCuenta();
  // Un cupón cuya promoción ya no está en el catálogo igual se muestra si el backend manda su snapshot; hoy se omite.
  const mios = cupones.flatMap((c) => {
    const p = PROMOCIONES.find((x) => x.id === c.promoId);
    return p ? [{ c, p, estado: estadoCupon(c) }] : [];
  });
  const paraUsar = mios.filter((x) => x.estado === 'disponible');
  const usados = mios.filter((x) => x.estado !== 'disponible');

  return (
    <main id="contenido" className={`${s.main} content-width`}>
      <div className={s.cabecera}>
        <h1>Mis cupones</h1>
        <p className="muted">Mostrá el código en el local antes de pagar. El personal lo valida y listo.</p>
      </div>

      {listo && mios.length === 0 && (
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
            {paraUsar.map(({ c, p }) => (
              <li key={c.codigo}>
                <Ticket
                  promo={p}
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
            {usados.map(({ c, p, estado }) => (
              <li key={c.codigo}>
                <Ticket
                  promo={p}
                  variante="mio"
                  vence={c.vence}
                  sello={estado === 'usado' ? { texto: 'Usado', tono: 'usado' } : { texto: 'Vencido', tono: 'vencido' }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
