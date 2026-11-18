// Cliente de la API de Wayki Promo (projects/api). Contrato y faltantes del backend: api-doc/pedidos-backend.html.
//
// Se activa POR ETAPAS: NEXT_PUBLIC_API_URL + NEXT_PUBLIC_API_ETAPAS (ej. "login,catalogo"). Lo que no está activado
// lo responde lib/simulador.ts con el MISMO formato y los mismos códigos de error, así que activar una etapa no
// cambia nada más en el front. Dependencias: "cupones" necesita "login" y "catalogo"; "encuesta" necesita "login".

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

// ---------- Contrato: lo que el front espera de cada endpoint ----------
// Donde difiere de la documentación del backend (Wayki-Promo-Doc), está marcado con "pedido".

// Dos formas del mismo turista, por eso casi todo es opcional:
//  · POST /auth/google → data.turista: { id, nombre, apellido, email, foto_url, rol }
//  · GET  /auth/perfil → data (el contenido del token): { turistas_id, nombre, email, rol, ... } (sin foto)
// pedido: un GET /turista/perfil que lea la tabla y traiga foto_url y nombre_completo (ver pedidos-backend.html).
export type TuristaApi = {
  id?: number;
  turistas_id?: number;
  nombre: string | null;
  apellido?: string | null;
  nombre_completo?: string | null;
  email: string;
  foto_url?: string | null;
};
export type LoginApi = { token: string; turista: TuristaApi };

/** GET /promociones?limite=100 → data[] (también va dentro de cada cupón). */
export type PromocionApi = {
  id: number;
  titulo: string;
  descripcion_corta: string;
  comercio: { id: number; nombre: string; lugar: string };
  categoria: { id: number | string; nombre: string }; // pedido: la documentación manda solo el nombre
  descuento_visual: string; // "20%", "2×1"
  fecha_hasta: string; // yyyy-mm-dd
  cupos_disponibles: number;
  cupos_totales: number;
  imagen_url: string | null; // pedido: la tabla promociones no tiene imagen
  destacada: boolean; // pedido: la que va primera en Inicio
};

/** GET /encuesta/opciones → data (pedido: no está en la documentación). */
export type Opcion = { id: number; nombre: string };
export type OpcionesEncuestaApi = {
  rangos_edad: Opcion[];
  duraciones: Opcion[];
  motivos: Opcion[];
  companias: Opcion[];
  medios: Opcion[];
  provincias: Opcion[]; // de Argentina
  paises: Opcion[]; // sin Argentina: quien vive en Argentina elige su provincia
};
/** POST /turista/encuesta ← cuerpo (pedido: la documentación pide otros campos). Va provincia_id O pais_id. */
export type EncuestaApi = {
  rango_edad_id: number;
  duracion_id: number;
  motivo_id: number;
  compania_id: number;
  medio_id: number;
  provincia_id: number | null;
  pais_id: number | null;
};
/** POST /turista/encuesta y GET /turista/encuesta → data (null si no respondió). Pedido. */
export type RespuestasApi = {
  rango_edad: Opcion;
  duracion: Opcion;
  motivo: Opcion;
  compania: Opcion;
  medio: Opcion;
  provincia: Opcion | null;
  pais: Opcion | null;
};

/** POST /turista/cupones { promocion_id } y GET /turista/cupones → data. Pedido: fechas ISO y la promoción adentro. */
export type CuponApi = {
  codigo: string;
  estado: 'GUARDADO' | 'EMITIDO' | 'CANJEADO' | 'VENCIDO' | 'ANULADO'; // la documentación dice GUARDADO; la base, EMITIDO
  emitido_el: string;
  vence_el: string;
  canjeado_el: string | null;
  promocion: PromocionApi;
};
