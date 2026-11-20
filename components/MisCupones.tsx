'use client';

// Tab Mis cupones: primero los que se pueden usar (con el código bien grande para mostrar en el local),
// después los usados, vencidos y anulados, apagados y con sello. Salen de GET /turista/cupones (lib/cuenta.ts):
// cada cupón trae su promoción, así que se ve aunque la promoción ya no esté en el catálogo.
// "Mostrar QR" abre el código en grande para que el empleado lo escanee (el QR lleva el mismo código).

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Qr from '@/components/Qr';
import Ticket from '@/components/Ticket';
import { asset } from '@/lib/asset';
import { recargarCuenta, useCuenta, type Cupon, type EstadoCupon } from '@/lib/cuenta';
import { fechaCorta } from '@/lib/promociones';
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
  const [qr, setQr] = useState<Cupon | null>(null); // el cupón que se muestra en grande
  const dialogo = useRef<HTMLDialogElement>(null);
  const sigueParaUsar = !qr || paraUsar.some((c) => c.codigo === qr.codigo);

  useEffect(() => {
    const d = dialogo.current;
    // Si lo canjean mientras está abierto (el panel avisa por el almacenamiento compartido), se cierra solo.
    const abierto = qr && sigueParaUsar;
    if (abierto && d && !d.open) d.showModal();
    if (!abierto && d?.open) d.close();
  }, [qr, sigueParaUsar]);

  return (
    <main id="contenido" className={`${s.main} content-width`}>
      <div className={s.cabecera}>
        <h1>Mis cupones</h1>
        <p className="muted">Mostrá el código o el QR en el local antes de pagar. El personal lo valida y listo.</p>
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
                    <div className={s.usar}>
                      <p className={s.codigo}>
                        <small>Código</small>
                        <strong className="display">{c.codigo}</strong>
                      </p>
                      <button type="button" className={`btn secondary ${s.verQr}`} onClick={() => setQr(c)}>
                        <img src={asset('/wayki-promo/iconos/qr.svg')} alt="" width={20} height={20} />
                        Mostrar QR
                      </button>
                    </div>
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

      <dialog
        ref={dialogo}
        className={s.dialogo}
        aria-labelledby="qr-title"
        onClose={() => setQr(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setQr(null); }} // clic en el fondo
      >
        {qr && (
          <div className={s.qrCuerpo}>
            <button type="button" className={s.cerrar} onClick={() => setQr(null)} aria-label="Cerrar">×</button>
            <p className={s.qrBeneficio}><span className="display">{qr.promo.beneficio}</span></p>
            <h2 id="qr-title">{qr.promo.titulo}</h2>
            <p className="muted">{qr.promo.prestador}, {qr.promo.localidad}</p>
            <div className={s.qr}><Qr texto={qr.codigo} tamano={240} /></div>
            <p className={s.codigoGrande}>
              <small>Código</small>
              <strong className="display">{qr.codigo}</strong>
            </p>
            <ul className={s.qrDatos}>
              <li>Hasta el {fechaCorta(qr.vence)}</li>
              {qr.promo.cuando && <li>{qr.promo.cuando}</li>}
            </ul>
            <p className="small-note">Mostralo en el local antes de pagar. Si no lo pueden escanear, dictales el código.</p>
          </div>
        )}
      </dialog>
    </main>
  );
}
