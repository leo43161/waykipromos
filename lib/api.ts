// Cliente de la API de Wayki Promo (projects/api). El contrato es api-doc/contrato-api.html (fuente:
// api-doc/contrato/datos.mjs): los tipos *Api de abajo son una copia de sus objetos. Si cambia el contrato, cambian
// juntos: este archivo, los adaptadores (aPromocion, aCupon, aTurista) y lib/simulador.ts.
//
// Se activa POR ETAPAS: NEXT_PUBLIC_API_URL (termina en /v1) + NEXT_PUBLIC_API_ETAPAS (ej. "login,catalogo"). Lo que
// no está activado lo responde lib/simulador.ts con el MISMO formato y los mismos códigos de error, así que activar
// una etapa no cambia nada más en el front. Qué endpoints tiene que tener la API para encender cada etapa:
//   login     POST /auth/google · GET /turista/perfil
//   catalogo  GET /promociones
//   encuesta  GET /encuesta/opciones · GET y POST /turista/encuesta          (necesita login)
//   cupones   GET y POST /turista/cupones                                    (necesita login y catalogo)

import { simular } from '@/lib/simulador';

export type Etapa = 'login' | 'catalogo' | 'encuesta' | 'cupones';

const URL_API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const ETAPAS = (process.env.NEXT_PUBLIC_API_ETAPAS ?? '').split(',').map((e) => e.trim());

/** true si la etapa la responde la API real; false si la simula el navegador. */
export const conApi = (e: Etapa) => URL_API !== '' && ETAPAS.includes(e);

/** Error de negocio o de red. `mensaje` (en message) ya está escrito para mostrárselo al turista. */
export class ErrorApi extends Error {
  constructor(readonly http: number, readonly codigo: string, mensaje: string) {
    super(mensaje);
  }
}

export type Pedido = { cuerpo?: unknown; token?: string | null };
export type Respuesta = { http: number; cuerpo: unknown };
type Sobre<T> = { ok: true; data: T } | { ok: false; error: { codigo: string; mensaje: string } };

export async function api<T>(etapa: Etapa, metodo: 'GET' | 'POST', ruta: string, pedido: Pedido = {}): Promise<T> {
  const { http, cuerpo } = conApi(etapa) ? await pedir(metodo, ruta, pedido) : await simular(metodo, ruta, pedido);
  const r = cuerpo as Sobre<T> | null;
  if (r?.ok) return r.data;
  throw new ErrorApi(http, r?.error.codigo ?? 'ERROR', r?.error.mensaje ?? 'Algo falló de nuestro lado. Probá de nuevo en un rato.');
}

async function pedir(metodo: string, ruta: string, { cuerpo, token }: Pedido): Promise<Respuesta> {
  try {
    const r = await fetch(URL_API + ruta, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    return { http: r.status, cuerpo: await r.json().catch(() => null) };
  } catch {
    return { http: 0, cuerpo: { ok: false, error: { codigo: 'SIN_CONEXION', mensaje: 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.' } } };
  }
}

// ---------- Contrato (objetos de api-doc/contrato-api.html) ----------

/** Opcion: un ítem de una lista. */
export type Opcion = { id: number; nombre: string };

/** POST /auth/google → data.turista. */
export type TuristaApi = {
  id: number;
  nombre: string | null;
  apellido: string | null;
  nombre_completo: string | null;
  email: string;
  foto_url: string | null;
};
/** POST /auth/google { id_token } → data. */
export type LoginApi = { token: string; turista: TuristaApi };
/** GET /turista/perfil → data (objeto Turista: lee la base, no el token). */
export type PerfilApi = TuristaApi & {
  creado_el: string;
  encuesta_respondida: boolean;
  cupones: { para_usar: number; usados: number; vencidos: number };
};

/** GET /promociones?limite=100 → data[] (objeto Promocion; también va dentro de cada cupón). */
export type PromocionApi = {
  id: number;
  titulo: string;
  descripcion_corta: string;
  comercio: { id: number; nombre: string; lugar: string };
  categoria: Opcion;
  descuento_visual: string; // "20%", "2×1"
  fecha_desde: string; // yyyy-mm-dd
  fecha_hasta: string; // yyyy-mm-dd: vale hasta las 23:59:59 de ese día
  dias_validos: string[] | null; // LUN…DOM; null = todos los días
  horario: { desde: string; hasta: string } | null; // "HH:MM"; null = todo el día
  cupos_disponibles: number;
  cupos_totales: number;
  imagen_url: string | null;
  destacada: boolean;
};

/** GET /encuesta/opciones → data. */
export type OpcionesEncuestaApi = {
  rangos_edad: Opcion[];
  duraciones: Opcion[];
  motivos: Opcion[];
  companias: Opcion[];
  medios: Opcion[];
  provincias: Opcion[]; // de Argentina
  paises: Opcion[]; // sin Argentina: quien vive en Argentina elige su provincia
};
/** POST /turista/encuesta ← cuerpo. Va provincia_id O pais_id, no los dos. */
export type EncuestaApi = {
  rango_edad_id: number;
  duracion_id: number;
  motivo_id: number;
  compania_id: number;
  medio_id: number;
  provincia_id: number | null;
  pais_id: number | null;
};
/** POST /turista/encuesta y GET /turista/encuesta → data (objeto RespuestasEncuesta; null si no respondió). */
export type RespuestasApi = {
  rango_edad: Opcion;
  duracion: Opcion;
  motivo: Opcion;
  compania: Opcion;
  medio: Opcion;
  provincia: Opcion | null;
  pais: Opcion | null;
  respondida_el: string;
};

/** POST /turista/cupones { promocion_id } (201 nuevo, 200 si ya lo tenía) y GET /turista/cupones → data (objeto Cupon). */
export type CuponApi = {
  codigo: string;
  estado: 'EMITIDO' | 'CANJEADO' | 'VENCIDO' | 'ANULADO'; // EMITIDO = para usar
  emitido_el: string;
  vence_el: string;
  canjeado_el: string | null;
  promocion: PromocionApi;
};
