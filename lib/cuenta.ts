// Cuenta del turista: sesión de Google, encuesta y cupones — MODO DESARROLLO (todavía no hay backend).
//
// Se guarda en localStorage para que el ingreso y la encuesta se pidan UNA sola vez (con el primer cupón)
// y sigan ahí en la próxima visita. La encuesta y los cupones quedan asociados a la cuenta de Google (`sub`):
// cerrar sesión no los borra y al volver a ingresar con la misma cuenta reaparecen, como pasará con el backend.
// ⚠️ El ID token se decodifica SIN verificar y el código del cupón se genera acá: nada de esto autoriza nada.
//
// TODO(backend) — contrato esperado (detalle del login en docs/GOOGLE_AUTH.md §9):
//   POST /auth/google                 body { credential }  → perfil + cookie de sesión httpOnly
//   GET  /persona                     → { perfil, encuesta | null, cupones: CuponReclamado[] }  (reemplaza a localStorage)
//   POST /auth/logout                 → 204
//   PUT  /persona/encuesta            body: Encuesta → 204 (columnas nuevas en PERSONA o tabla ENCUESTA;
//                                     hoy PERSONA solo tiene `procedencia`)
//   POST /promociones/{id}/adquirir   → 201 CuponReclamado  (fila en ADQUIERE)
//        El servidor valida: sesión, encuesta completa, promoción PUBLICADA y vigente, stock, un cupón por persona
//        y promoción. El código (7 caracteres, ADQUIERE.codigo) lo genera SIEMPRE el servidor.
//        Errores: 401 sin sesión · 409 ya lo tenés · 410 agotada o vencida · 428 falta la encuesta.
//   El canje (ADQUIERE.canjeado / fechacanje) lo hace el empleado desde el panel admin, nunca el turista.

import { useEffect, useState } from 'react';

export type TouristSession = {
  sub: string; // id único y estable de la cuenta Google (usar esto, no el email, como clave)
  email: string;
  name: string;
  givenName: string;
  picture?: string;
};

// Respuestas = el texto exacto de la opción elegida (opciones cerradas en components/Encuesta.tsx).
export type Encuesta = {
  residencia: string;     // provincia o país → PERSONA.procedencia
  motivo: string;
  conQuien: string;
  noches: string;         // rango ("1 a 2 noches"…)
  medio: string;          // cómo se enteró del destino
  edad: string;           // rango
  consentimiento: true;
};

export type CuponReclamado = {
  promoId: string;
  codigo: string;
  vence: string;        // yyyy-mm-dd (ADQUIERE.fechavencimiento)
  canjeado?: string;    // yyyy-mm-dd (ADQUIERE.fechacanje); lo marca el backend al canjear
};

export type EstadoCupon = 'disponible' | 'usado' | 'vencido';

type Datos = { encuesta: Encuesta | null; cupones: CuponReclamado[] };

const K_SESION = 'wayki-turista-sesion';
const kDatos = (sub: string) => `wayki-turista-datos-${sub}`;
const EVENTO = 'wayki-cuenta'; // avisa a los componentes montados que algo cambió

function leer<T>(clave: string, vacio: T): T {
  try {
    return JSON.parse(localStorage.getItem(clave) ?? 'null') ?? vacio;
  } catch {
    return vacio;
  }
}
function escribir(clave: string, valor: unknown) {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // navegación privada o storage bloqueado: la UI sigue funcionando, solo que no recuerda
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Decodifica (sin verificar) la parte central de un JWT. Soporta tildes y ñ. */
function decodeJwtPayload(jwt: string): Record<string, string> {
  const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function loginWithGoogle(credential: string): Promise<TouristSession> {
  const p = decodeJwtPayload(credential);
  const sesion: TouristSession = { sub: p.sub, email: p.email, name: p.name, givenName: p.given_name ?? p.name, picture: p.picture };
  escribir(K_SESION, sesion);
  return sesion;
}

export const getSession = () => leer<TouristSession | null>(K_SESION, null);

export function logout() {
  escribir(K_SESION, null);
  window.google?.accounts.id.disableAutoSelect();
}

function getDatos(): Datos {
  const s = getSession();
  return s ? leer<Datos>(kDatos(s.sub), { encuesta: null, cupones: [] }) : { encuesta: null, cupones: [] };
}
function setDatos(cambio: Partial<Datos>) {
  const s = getSession();
  if (s) escribir(kDatos(s.sub), { ...getDatos(), ...cambio });
}

export const getEncuesta = () => getDatos().encuesta;
export const guardarEncuesta = (encuesta: Encuesta) => setDatos({ encuesta });

/** Simula POST /promociones/{id}/adquirir. Si ya lo tenía, devuelve el mismo cupón. */
export function reclamarCupon(promoId: string, venceHasta: string): CuponReclamado {
  const { cupones } = getDatos();
  const existente = cupones.find((c) => c.promoId === promoId);
  if (existente) return existente;
  // Mismo alfabeto que el demo (sin 0/O/1/I para dictarlo sin errores).
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const azar = crypto.getRandomValues(new Uint8Array(6));
  const cupon = { promoId, codigo: 'W' + Array.from(azar, (n) => abc[n % abc.length]).join(''), vence: venceHasta };
  setDatos({ cupones: [cupon, ...cupones] });
  return cupon;
}

export function estadoCupon(c: CuponReclamado, hoy = new Date()): EstadoCupon {
  if (c.canjeado) return 'usado';
  const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return c.vence < hoyIso ? 'vencido' : 'disponible'; // vale todo el día del vencimiento
}

/**
 * Estado de la cuenta para los componentes. `listo` es false hasta leer el navegador: el HTML estático sale
 * "sin sesión" y así se evita mostrar un estado equivocado por un instante.
 */
export function useCuenta() {
  const [estado, setEstado] = useState({ listo: false, sesion: null as TouristSession | null, encuesta: null as Encuesta | null, cupones: [] as CuponReclamado[] });
  useEffect(() => {
    const actualizar = () => setEstado({ listo: true, sesion: getSession(), ...getDatos() });
    actualizar();
    window.addEventListener(EVENTO, actualizar);
    window.addEventListener('storage', actualizar); // otra pestaña
    return () => {
      window.removeEventListener(EVENTO, actualizar);
      window.removeEventListener('storage', actualizar);
    };
  }, []);
  return estado;
}
