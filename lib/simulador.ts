// Backend SIMULADO en el navegador para las etapas que todavía no están activadas (ver lib/api.ts).
// Responde con el mismo formato y los mismos códigos de error que el contrato (api-doc/contrato-api.html): las
// pantallas no notan la diferencia entre esto y la API real.
// ⚠️ No valida nada de verdad: el token de Google se decodifica sin verificar y el código se genera acá.
// Datos de ejemplo tomados del seed de wayki-promo-demo.html; prestadores y beneficios ficticios.

import type { CuponApi, EncuestaApi, LoginApi, Opcion, OpcionesEncuestaApi, Pedido, PerfilApi, PromocionApi, Respuesta, RespuestasApi, TuristaApi } from '@/lib/api';

// Las tres categorías de la base (categorias_comercio, ids de db/propuesta_contrato_api.sql).
const ALOJA: Opcion = { id: 1, nombre: 'Alojamiento' };
const GASTRO: Opcion = { id: 2, nombre: 'Gastronomía' };
const ACTIVIDADES: Opcion = { id: 3, nombre: 'Actividades y experiencias' };

const promo = (id: number, titulo: string, descripcion_corta: string, descuento_visual: string, categoria: Opcion,
  comercio: [number, string, string], imagen: string, fecha_hasta: string, cupos_disponibles: number, destacada = false): PromocionApi => ({
  id, titulo, descripcion_corta, descuento_visual, categoria, fecha_desde: '2026-11-01', fecha_hasta, dias_validos: null, horario: null,
  cupos_disponibles, cupos_totales: 100, destacada,
  comercio: { id: comercio[0], nombre: comercio[1], lugar: comercio[2] }, imagen_url: `/fotos/${imagen}.webp`,
});

const PATIO: [number, string, string] = [10, 'Patio del Jardín', 'San Miguel de Tucumán'];
const PROMOS: PromocionApi[] = [
  promo(1, 'Empanadas que cuentan historias', 'En una docena de empanadas tucumanas', '20%', GASTRO, PATIO, 'empanadas', '2027-01-31', 37, true),
  promo(6, 'Tu refugio en el valle', 'En dos noches con desayuno casero', '25%', ALOJA, [11, 'Casa del Valle', 'Tafí del Valle'], 'alojamiento', '2027-02-15', 12, true),
  promo(2, 'La merienda se comparte', 'Dos meriendas, una invitación', '2×1', GASTRO, PATIO, 'merienda', '2027-01-15', 54),
  promo(9, 'Senderos para desconectar', 'En trekking guiado por el valle', '20%', ACTIVIDADES, [12, 'Cumbres del Aconquija', 'Tafí del Valle'], 'montana', '2027-03-01', 8, true),
  promo(14, 'Historias a cada paso', 'En el recorrido guiado por el casco histórico', '2×1', ACTIVIDADES, [13, 'Rutas de la Historia', 'San Miguel de Tucumán'], 'cultura', '2027-02-28', 61),
  promo(26, 'El dique desde otra mirada', 'En paseo en kayak con equipo incluido', '25%', ACTIVIDADES, [14, 'Agua y Montaña', 'El Cadillal'], 'dique', '2027-02-15', 40),
  promo(17, 'Tu pausa entre las Yungas', 'En el circuito de relax de 60 minutos', '20%', ACTIVIDADES, [15, 'Aire de Yungas', 'Yerba Buena'], 'bienestar', '2027-01-31', 19),
  promo(20, 'Llevate un pedacito de Tucumán', 'En la caja de sabores regionales', '15%', GASTRO, [16, 'Almacén Raíces', 'Tafí Viejo'], 'regionales', '2027-03-15', 44),
  promo(12, 'Sabores del corazón del valle', 'En el menú regional del mediodía', '20%', GASTRO, [17, 'Sabores de Amaicha', 'Amaicha del Valle'], 'vino', '2027-02-28', 29),
];

// Mismos ids que db/propuesta_contrato_api.sql (opciones) y que la base huakipromo (provincias y países).
const lista = (nombres: string[], desde = 1): Opcion[] => nombres.map((nombre, i) => ({ id: desde + i, nombre }));
const OPCIONES: OpcionesEncuestaApi = {
  motivos: lista(['Vacaciones / Ocio / Recreación', 'Visita a familiares o amigos', 'Trabajo / Negocios / Congresos', 'Deporte / Eventos culturales', 'Soy residente local']),
  companias: lista(['Solo/a', 'En pareja', 'En familia (con niños/as)', 'En familia (solo adultos)', 'Con amigos/as', 'En grupo organizado / excursión']),
  duraciones: lista(['No me quedo a dormir (voy y vuelvo en el día / soy local)', '1 a 2 noches', '3 a 5 noches', '6 noches o más']),
  medios: lista(['Redes sociales (Instagram, TikTok, Facebook)', 'Recomendación de amigos o familiares', 'Cartelería / Vía pública / Oficinas de turismo', 'Medios tradicionales (radio, TV, diarios)', 'Buscadores de internet (Google)', 'En el propio prestador']),
  rangos_edad: lista(['Menor de 18 años', '18 a 29 años', '30 a 44 años', '45 a 59 años', '60 años o más']),
  provincias: [
    [1, 'Tucumán'], [5, 'Buenos Aires'], [2, 'Catamarca'], [8, 'Chaco'], [9, 'Chubut'], [7, 'Ciudad Autónoma de Buenos Aires'],
    [10, 'Córdoba'], [11, 'Corrientes'], [12, 'Entre Ríos'], [13, 'Formosa'], [4, 'Jujuy'], [14, 'La Pampa'], [15, 'La Rioja'],
    [16, 'Mendoza'], [17, 'Misiones'], [18, 'Neuquén'], [19, 'Río Negro'], [3, 'Salta'], [20, 'San Juan'], [21, 'San Luis'],
    [6, 'Santa Cruz'], [22, 'Santa Fe'], [23, 'Santiago del Estero'], [24, 'Tierra del Fuego'],
  ].map(([id, nombre]) => ({ id: id as number, nombre: nombre as string })),
  paises: [
    [70, 'Alemania'], [42, 'Bolivia'], [43, 'Brasil'], [53, 'Chile'], [60, 'Colombia'], [80, 'España'], [245, 'Estados Unidos'],
    [86, 'Francia'], [122, 'Italia'], [153, 'México'], [194, 'Paraguay'], [186, 'Perú'], [244, 'Uruguay'],
  ].map(([id, nombre]) => ({ id: id as number, nombre: nombre as string })),
};

// ---------- Datos del turista simulado (localStorage, por `sub` del token) ----------

type CuponGuardado = { codigo: string; promocion_id: number; emitido_el: string };
type Datos = {
  turista: (TuristaApi & { creado_el: string }) | null;
  encuesta: (EncuestaApi & { respondida_el: string }) | null;
  cupones: CuponGuardado[];
};

const clave = (sub: string) => `wayki-sim-${sub}`;
function leer(sub: string): Datos {
  try {
    return JSON.parse(localStorage.getItem(clave(sub)) ?? 'null') ?? { turista: null, encuesta: null, cupones: [] };
  } catch {
    return { turista: null, encuesta: null, cupones: [] };
  }
}
function guardar(sub: string, d: Datos) {
  try {
    localStorage.setItem(clave(sub), JSON.stringify(d));
  } catch {
    // navegación privada o storage bloqueado: la UI sigue, solo que no recuerda
  }
}

/** Payload de un JWT sin verificar (soporta tildes). Sirve para el de Google y para el token de la API. */
function payload(jwt: string): Record<string, unknown> | null {
  try {
    const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))));
  } catch {
    return null;
  }
}
const b64url = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const ok = (data: unknown, http = 200): Respuesta => ({ http, cuerpo: { ok: true, data } });
const error = (http: number, codigo: string, mensaje: string): Respuesta => ({ http, cuerpo: { ok: false, error: { codigo, mensaje, detalles: null } } });
const SESION_INVALIDA = () => error(401, 'SESION_INVALIDA', 'Tu sesión venció. Ingresá de nuevo.');

function respuestas(e: Datos['encuesta']): RespuestasApi | null {
  if (!e) return null;
  const buscar = (l: Opcion[], id: number | null) => l.find((o) => o.id === id) ?? null;
  return {
    rango_edad: buscar(OPCIONES.rangos_edad, e.rango_edad_id)!, duracion: buscar(OPCIONES.duraciones, e.duracion_id)!,
    motivo: buscar(OPCIONES.motivos, e.motivo_id)!, compania: buscar(OPCIONES.companias, e.compania_id)!,
    medio: buscar(OPCIONES.medios, e.medio_id)!, provincia: buscar(OPCIONES.provincias, e.provincia_id), pais: buscar(OPCIONES.paises, e.pais_id),
    respondida_el: e.respondida_el,
  };
}

function encuestaValida(e: Partial<EncuestaApi> | undefined): e is EncuestaApi {
  if (!e) return false;
  const en = (l: Opcion[], id: unknown) => l.some((o) => o.id === id);
  const residencia = en(OPCIONES.provincias, e.provincia_id) !== en(OPCIONES.paises, e.pais_id); // una sola de las dos
  return residencia && en(OPCIONES.rangos_edad, e.rango_edad_id) && en(OPCIONES.duraciones, e.duracion_id) &&
    en(OPCIONES.motivos, e.motivo_id) && en(OPCIONES.companias, e.compania_id) && en(OPCIONES.medios, e.medio_id);
}

function aCuponApi(c: CuponGuardado): CuponApi | null {
  const p = PROMOS.find((x) => x.id === c.promocion_id);
  return !p ? null : { codigo: c.codigo, estado: 'EMITIDO', emitido_el: c.emitido_el, vence_el: `${p.fecha_hasta}T23:59:59-03:00`, canjeado_el: null, promocion: p };
}

// ---------- Rutas ----------

export async function simular(metodo: string, ruta: string, { cuerpo, token }: Pedido): Promise<Respuesta> {
  if (typeof window !== 'undefined') await new Promise((r) => setTimeout(r, 350)); // que se vean los estados de carga
  const pedido = `${metodo} ${ruta.split('?')[0]}`;
  const datos = cuerpo as Record<string, unknown> | undefined;

  if (pedido === 'GET /promociones') return ok(PROMOS);
  if (pedido === 'GET /encuesta/opciones') return ok(OPCIONES);

  if (pedido === 'POST /auth/google') {
    const g = payload(String(datos?.id_token ?? ''));
    if (!g?.sub) return error(401, 'TOKEN_GOOGLE_INVALIDO', 'No pudimos validar tu cuenta de Google. Probá de nuevo.');
    const sub = String(g.sub);
    const d = leer(sub);
    d.turista = {
      id: Number(sub.slice(-9)), nombre: (g.given_name as string) ?? null, apellido: (g.family_name as string) ?? null,
      nombre_completo: (g.name as string) ?? null, email: String(g.email ?? ''), foto_url: (g.picture as string) ?? null,
      creado_el: d.turista?.creado_el ?? new Date().toISOString(),
    };
    guardar(sub, d);
    const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 días, como la API
    const { creado_el, ...turista } = d.turista;
    const respuesta: LoginApi = { token: `${b64url({ alg: 'none' })}.${b64url({ sub, rol: 'turista', exp })}.simulado`, turista };
    return ok(respuesta);
  }

  // De acá en adelante, todo es /turista/* y exige token. Sirve también el de la API real (si "login" ya está activada).
  const p = token ? payload(token) : null;
  if (!p?.sub || p.rol !== 'turista' || Number(p.exp) * 1000 < Date.now()) return SESION_INVALIDA();
  const sub = String(p.sub);
  const d = leer(sub);

  switch (pedido) {
    case 'GET /turista/perfil': {
      if (!d.turista) return SESION_INVALIDA();
      const cupones = d.cupones.map(aCuponApi).filter((c): c is CuponApi => c !== null);
      const vencido = (c: CuponApi) => new Date(c.vence_el).getTime() < Date.now();
      const perfil: PerfilApi = {
        ...d.turista,
        encuesta_respondida: d.encuesta !== null,
        cupones: {
          para_usar: cupones.filter((c) => c.estado === 'EMITIDO' && !vencido(c)).length,
          usados: cupones.filter((c) => c.estado === 'CANJEADO').length,
          vencidos: cupones.filter((c) => c.estado === 'VENCIDO' || (c.estado === 'EMITIDO' && vencido(c))).length,
        },
      };
      return ok(perfil);
    }

    case 'GET /turista/encuesta':
      return ok(respuestas(d.encuesta));

    case 'POST /turista/encuesta': {
      if (!encuestaValida(datos as Partial<EncuestaApi>)) return error(400, 'ENCUESTA_INCOMPLETA', 'Te falta responder alguna pregunta.');
      d.encuesta = { ...(datos as EncuestaApi), respondida_el: new Date().toISOString() }; // crea o reemplaza: una por turista
      guardar(sub, d);
      return ok(respuestas(d.encuesta));
    }

    case 'GET /turista/cupones':
      return ok(d.cupones.map(aCuponApi).filter(Boolean));

    case 'POST /turista/cupones': {
      const promo = PROMOS.find((x) => x.id === datos?.promocion_id);
      if (!promo) return error(404, 'PROMOCION_INEXISTENTE', 'Esta promoción ya no está disponible.');
      if (!d.encuesta) return error(409, 'ENCUESTA_PENDIENTE', 'Antes de tu primer cupón, contanos de tu viaje.');
      const existente = d.cupones.find((c) => c.promocion_id === promo.id);
      if (existente) return ok(aCuponApi(existente)); // no duplica: devuelve el que ya tenía
      if (promo.cupos_disponibles <= 0) return error(409, 'STOCK_AGOTADO', 'Se agotaron los cupones de esta promoción.');
      // Sin 0/O/1/I para dictarlo sin errores (como el demo).
      const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const codigo = 'W' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => abc[n % abc.length]).join('');
      const nuevo = { codigo, promocion_id: promo.id, emitido_el: new Date().toISOString() };
      d.cupones.unshift(nuevo);
      guardar(sub, d);
      return ok(aCuponApi(nuevo), 201);
    }
  }
  return error(404, 'RUTA_INEXISTENTE', `No existe ${pedido}.`);
}
