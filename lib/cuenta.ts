// Cuenta del turista: sesión (token de la API), encuesta y cupones. Etapas "login", "encuesta" y "cupones" de
// lib/api.ts: mientras no estén activadas, las responde lib/simulador.ts con el mismo formato.
// Un solo estado para toda la página: se carga una vez y cada componente se suscribe con useCuenta().
// El turista nunca decide nada: el código del cupón, el stock y si ya respondió la encuesta los define el servidor.

import { useEffect, useSyncExternalStore } from 'react';
import { api, ErrorApi, type CuponApi, type EncuestaApi, type Etapa, type LoginApi, type OpcionesEncuestaApi, type RespuestasApi, type TuristaApi } from '@/lib/api';
import { aPromocion, type Promocion } from '@/lib/promociones';

export type Turista = { id: number; nombre: string; nombreCompleto: string; email: string; foto: string | null };
export type EstadoCupon = 'disponible' | 'usado' | 'vencido' | 'anulado';
export type Cupon = { codigo: string; estado: EstadoCupon; vence: string; promo: Promocion };
export type { RespuestasApi as Respuestas, EncuestaApi, OpcionesEncuestaApi } from '@/lib/api';

type Estado = { listo: boolean; sesion: Turista | null; encuesta: RespuestasApi | null; cupones: Cupon[]; error: string };
const SIN_SESION: Estado = { listo: true, sesion: null, encuesta: null, cupones: [], error: '' };
const INICIAL: Estado = { ...SIN_SESION, listo: false }; // el HTML estático sale así: nada de "sin sesión" por un instante

let estado = INICIAL;
const oyentes = new Set<() => void>();
function fijar(cambio: Partial<Estado>) {
  estado = { ...estado, ...cambio };
  oyentes.forEach((f) => f());
}

/** Texto para mostrar de cualquier error (los de la API ya vienen escritos para el turista). */
export const mensajeDeError = (e: unknown) => (e instanceof ErrorApi ? e.message : 'Algo falló. Probá de nuevo en un rato.');

/** La sesión dejó de valer: token ausente/vencido (401), alterado (403 TOKEN_INVALIDO) o cuenta suspendida. */
const esSesionInvalida = (e: unknown) =>
  e instanceof ErrorApi &&
  (e.http === 401 || (e.http === 403 && e.codigo === 'TOKEN_INVALIDO') || e.codigo === 'TURISTA_SUSPENDIDO');

// ---------- Token de la API ----------

const K_TOKEN = 'wayki-turista-token';
/** Vencimiento (ms) leído del claim `exp` del propio JWT. La API oficial no manda `expira_en` aparte. */
function venceEn(token: string): number {
  try {
    const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(b + '='.repeat((4 - (b.length % 4)) % 4))).exp;
    return typeof exp === 'number' ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}
function leerToken(): string | null {
  try {
    const token = localStorage.getItem(K_TOKEN);
    return token && venceEn(token) > Date.now() ? token : null;
  } catch {
    return null;
  }
}
function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(K_TOKEN, token);
    else localStorage.removeItem(K_TOKEN);
  } catch {
    // navegación privada o storage bloqueado: la sesión dura lo que dure la pestaña
  }
}

/** Pedido como turista. Si la sesión dejó de valer, se cierra sola. */
async function comoTurista<T>(etapa: Etapa, metodo: 'GET' | 'POST', ruta: string, cuerpo?: unknown): Promise<T> {
  try {
    return await api<T>(etapa, metodo, ruta, { cuerpo, token: leerToken() });
  } catch (e) {
    if (esSesionInvalida(e)) cerrarSesion();
    throw e;
  }
}

// ---------- Adaptadores (si cambia el contrato, se toca solo acá) ----------

const aTurista = (t: TuristaApi): Turista => ({
  id: t.id ?? t.turistas_id ?? 0,
  nombre: t.nombre || t.nombre_completo?.split(' ')[0] || '',
  nombreCompleto: t.nombre_completo || [t.nombre, t.apellido].filter(Boolean).join(' ') || t.email,
  email: t.email,
  foto: t.foto_url ?? null,
});

/** Si la API manda solo la fecha, el cupón vale hasta el final de ese día en Tucumán. */
const finDe = (iso: string) => new Date(iso.length === 10 ? `${iso}T23:59:59-03:00` : iso);
const dia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function aCupon(c: CuponApi): Cupon {
  const vence = finDe(c.vence_el);
  const estado: EstadoCupon =
    c.estado === 'CANJEADO' ? 'usado'
    : c.estado === 'ANULADO' ? 'anulado'
    : c.estado === 'VENCIDO' || vence.getTime() < Date.now() ? 'vencido'
    : 'disponible';
  return { codigo: c.codigo, estado, vence: dia(vence), promo: aPromocion(c.promocion) };
}

// ---------- Carga ----------

async function cargarDatos() {
  const [cupones, encuesta] = await Promise.all([
    comoTurista<CuponApi[]>('cupones', 'GET', '/turista/cupones'),
    comoTurista<RespuestasApi | null>('encuesta', 'GET', '/turista/encuesta'),
  ]);
  fijar({ listo: true, cupones: cupones.map(aCupon), encuesta, error: '' });
}

let carga: Promise<void> = Promise.resolve();
/** Lee la sesión guardada y la valida con GET /auth/perfil. También sirve para "Probar de nuevo". */
export function recargarCuenta() {
  carga = cargar();
  return carga;
}
/** Espera la carga en curso: así no se le pide Google a quien ya tiene sesión y tocó un cupón muy rápido. */
export const esperarCuenta = () => carga;

async function cargar() {
  if (!leerToken()) return fijar(SIN_SESION);
  try {
    fijar({ sesion: aTurista(await comoTurista<TuristaApi>('login', 'GET', '/auth/perfil')) });
    await cargarDatos();
  } catch (e) {
    // Si la sesión dejó de valer, comoTurista ya la cerró; no mostramos error, solo quedamos sin sesión.
    if (!esSesionInvalida(e)) fijar({ listo: true, error: mensajeDeError(e) });
  }
}

// ---------- Acciones ----------

/** POST /auth/google con el `credential` del botón de Google. Vuelve con la cuenta ya cargada (cupones y encuesta). */
export async function ingresarConGoogle(credential: string): Promise<Turista> {
  const r = await api<LoginApi>('login', 'POST', '/auth/google', { cuerpo: { id_token: credential } });
  guardarToken(r.token);
  const sesion = aTurista(r.turista);
  fijar({ sesion, error: '' });
  await cargarDatos().catch((e) => fijar({ listo: true, error: mensajeDeError(e) }));
  return sesion;
}

/** Con un JWT sin estado no hace falta endpoint: se borra el token. Los cupones y la encuesta siguen en la cuenta. */
export function cerrarSesion() {
  guardarToken(null);
  fijar(SIN_SESION);
  window.google?.accounts.id.disableAutoSelect();
}

export async function guardarEncuesta(e: EncuestaApi) {
  fijar({ encuesta: await comoTurista<RespuestasApi>('encuesta', 'POST', '/turista/encuesta', e) });
}

/** POST /turista/cupones. Si ya lo tenía, el servidor devuelve el mismo cupón (no duplica). */
export async function reclamarCupon(promocionId: number): Promise<Cupon> {
  const cupon = aCupon(await comoTurista<CuponApi>('cupones', 'POST', '/turista/cupones', { promocion_id: promocionId }));
  fijar({ cupones: [cupon, ...estado.cupones.filter((c) => c.codigo !== cupon.codigo)] });
  return cupon;
}

let opciones: Promise<OpcionesEncuestaApi> | null = null;
/** GET /encuesta/opciones (público). Se pide una vez por visita. */
export function opcionesEncuesta() {
  opciones ??= api<OpcionesEncuestaApi>('encuesta', 'GET', '/encuesta/opciones').catch((e) => {
    opciones = null; // que "Probar de nuevo" vuelva a pedirlas
    throw e;
  });
  return opciones;
}

// ---------- Hook ----------

const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => void oyentes.delete(f);
};
let iniciada = false;

/** Estado actual sin suscribirse (para decidir dentro de un evento). */
export const leerCuenta = () => estado;

/** Estado de la cuenta. `listo` es false hasta leer el navegador y validar el token con la API. */
export function useCuenta() {
  const e = useSyncExternalStore(suscribir, () => estado, () => INICIAL);
  useEffect(() => {
    if (iniciada) return;
    iniciada = true;
    recargarCuenta();
    window.addEventListener('storage', (ev) => { if (ev.key === K_TOKEN) recargarCuenta(); }); // otra pestaña
  }, []);
  return e;
}
