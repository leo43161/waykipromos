// Catálogo público (etapa "catalogo"): GET /promociones. Mientras la etapa no esté activada lo responde
// lib/simulador.ts con los cupones de ejemplo. Sin hooks: lo usa también app/page.tsx al compilar (SEO).

import { api, type PromocionApi } from '@/lib/api';
import { asset } from '@/lib/asset';

/** Lo que muestran las pantallas. Se arma desde PromocionApi en aPromocion(): si cambia el contrato, se toca solo ahí. */
export type Promocion = {
  id: number;
  titulo: string;
  detalle: string; // qué incluye, en una línea
  beneficio: string; // el sello grande del cupón: "20%", "2×1", "Regalo"
  categoria: { id: number | string; nombre: string };
  prestador: string;
  localidad: string;
  foto: string; // URL lista para el <img>
  vence: string; // yyyy-mm-dd
  quedan: number;
  destacada: boolean;
};

export const aPromocion = (p: PromocionApi): Promocion => ({
  id: p.id,
  titulo: p.titulo,
  detalle: p.descripcion_corta,
  beneficio: p.descuento_visual,
  categoria: p.categoria,
  prestador: p.comercio.nombre,
  localidad: p.comercio.lugar,
  // La API manda URLs absolutas; el simulador, rutas de public/. Sin foto: las líneas del manual sobre verde.
  foto: !p.imagen_url ? asset('/wayki-promo/fondos/lineas-topograficas.svg') : /^https?:/.test(p.imagen_url) ? p.imagen_url : asset(p.imagen_url),
  vence: p.fecha_hasta,
  quedan: p.cupos_disponibles,
  destacada: p.destacada,
});

// ponytail: trae todo de una y filtra en el navegador (búsqueda instantánea); paginar si pasa de ~100 promociones.
export const listarPromociones = async () => (await api<PromocionApi[]>('catalogo', 'GET', '/promociones?limite=100')).map(aPromocion);

const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
/** "31 de enero" */
export const fechaCorta = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));
