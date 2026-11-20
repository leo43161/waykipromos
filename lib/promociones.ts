// Catálogo público (etapa "catalogo"): GET /promociones y GET /promociones/{id}. Mientras la etapa no esté activada
// lo responde lib/simulador.ts con los cupones de ejemplo. Sin hooks: lo usa también app/page.tsx al compilar (SEO).

import { api, type PromocionApi, type PromocionFichaApi } from '@/lib/api';
import { asset } from '@/lib/asset';
import { cuandoVale } from '@/lib/cuando';

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
  cuando: string | null; // "De lunes a viernes, de 16:00 a 20:00"; null = cualquier día y hora
  quedan: number;
  destacada: boolean;
};

/** La ficha: lo que hace falta para decidir guardarlo (GET /promociones/{id}). */
export type Ficha = Promocion & {
  descripcion: string | null;
  condiciones: string | null;
  direccion: string;
  telefono: string | null;
  circuito: string | null;
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
  // Las respuestas viejas del simulador (guardadas en el navegador) pueden no traer estos campos.
  cuando: cuandoVale(p.dias_validos ?? null, p.horario ?? null),
  quedan: p.cupos_disponibles,
  destacada: p.destacada,
});

// ponytail: trae todo de una y filtra en el navegador (búsqueda instantánea); paginar si pasa de ~100 promociones.
export const listarPromociones = async () => (await api<PromocionApi[]>('catalogo', 'GET', '/promociones?limite=100')).map(aPromocion);

/** GET /promociones/{id}. Responde aunque se hayan agotado los cupos (quedan: 0). */
export async function fichaPromocion(id: number): Promise<Ficha> {
  const f = await api<PromocionFichaApi>('catalogo', 'GET', `/promociones/${id}`);
  return {
    ...aPromocion(f),
    descripcion: f.descripcion,
    condiciones: f.condiciones,
    direccion: f.comercio.direccion,
    telefono: f.comercio.telefono,
    circuito: f.circuito?.nombre ?? null,
  };
}

const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
/** "31 de enero" */
export const fechaCorta = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));
