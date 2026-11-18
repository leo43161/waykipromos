import type { ReactNode } from 'react';
import { asset } from '@/lib/asset';
import { fechaCorta, type Promocion } from '@/lib/promociones';
import s from './Ticket.module.css';

/**
 * Cupón con forma de ticket: foto, troquel y el beneficio enorme.
 * - `card`: vertical (catálogo). `hero`: más grande, horizontal en escritorio. `mio`: horizontal y compacto (Mis cupones).
 * - `extra` va entre los datos y la acción (ej. el código). `sello` lo apaga y le estampa un sello ("Usado").
 */
export default function Ticket({
  promo: p,
  variante = 'card',
  extra,
  accion,
  sello,
  vence = p.vence,
}: {
  promo: Promocion;
  variante?: 'hero' | 'card' | 'mio';
  extra?: ReactNode;
  accion?: ReactNode;
  sello?: { texto: string; tono: 'usado' | 'vencido' };
  vence?: string;
}) {
  const Titulo = variante === 'hero' ? 'h2' : 'h3';
  return (
    <article className={`${s.ticket} ${s[variante]} ${sello ? s.apagado : ''}`} aria-labelledby={`t-${variante}-${p.id}`}>
      <div className={s.foto}>
        <img src={p.foto} alt="" width={800} height={533} loading={variante === 'hero' ? 'eager' : 'lazy'} />
        {variante !== 'mio' && <span className={s.categoria}>{p.categoria.nombre}</span>}
        {variante !== 'mio' && p.quedan < 15 && <span className={s.pocos}>¡Quedan {p.quedan}!</span>}
      </div>
      <div className={s.cuerpo}>
        <p className={s.beneficio}>
          <span className="display">{p.beneficio}</span>
          {p.beneficio.endsWith('%') && <small>de descuento</small>}
        </p>
        <Titulo id={`t-${variante}-${p.id}`} className={s.titulo}>{p.titulo}</Titulo>
        <p className={s.detalle}>{p.detalle}</p>
        <ul className={s.datos}>
          <li>
            <img src={asset('/wayki-promo/iconos/ubicacion.svg')} alt="" width={16} height={16} />
            <span><strong>{p.prestador}</strong>, {p.localidad}</span>
          </li>
          <li>
            <img src={asset('/wayki-promo/iconos/calendario.svg')} alt="" width={16} height={16} />
            <span>{sello?.texto === 'Vencido' ? 'Venció' : 'Hasta'} el {fechaCorta(vence)}</span>
          </li>
        </ul>
        {extra}
        {accion}
      </div>
      {sello && <span className={`${s.sello} ${s[sello.tono]}`}>{sello.texto}</span>}
    </article>
  );
}
