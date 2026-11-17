// Promociones publicadas — DATOS DE EJEMPLO tomados del seed de wayki-promo-demo.html.
// Prestadores y beneficios ficticios; fotos ilustrativas del demo (public/fotos/).
//
// TODO(backend): reemplazar por `GET ${NEXT_PUBLIC_API_URL}/promociones` (solo estado PUBLICADA y vigentes),
// pedido desde el cliente. Contrato esperado por ítem: el tipo `Promocion` de abajo. Ojo SEO: si el catálogo
// pasa a cargarse en el cliente, el HTML estático queda sin cupones; evaluar regenerar el build al publicar.

export type Categoria = 'gastronomia' | 'alojamiento' | 'aventura' | 'cultura' | 'bienestar' | 'regionales';

export const CATEGORIAS: { id: Categoria; nombre: string }[] = [
  { id: 'gastronomia', nombre: 'Gastronomía' },
  { id: 'alojamiento', nombre: 'Alojamiento' },
  { id: 'aventura', nombre: 'Aventura' },
  { id: 'cultura', nombre: 'Cultura' },
  { id: 'bienestar', nombre: 'Bienestar' },
  { id: 'regionales', nombre: 'Regionales' },
];

export type Promocion = {
  id: string;
  titulo: string;
  detalle: string;      // qué incluye, en una línea
  beneficio: string;    // el sello grande del cupón: "20%", "2×1", "Regalo"
  categoria: Categoria;
  prestador: string;
  localidad: string;
  foto: string;         // ruta en public/ (pasar por asset())
  vence: string;        // ISO yyyy-mm-dd (PROMOCION.fechafin)
  quedan: number;       // cupones disponibles (PROMOCION.cantidad - adquiridos)
  condiciones: string;
  destacada?: boolean;
};

export const PROMOCIONES: Promocion[] = [
  {
    id: 'promo1', titulo: 'Empanadas que cuentan historias', detalle: 'En una docena de empanadas tucumanas',
    beneficio: '20%', categoria: 'gastronomia', prestador: 'Patio del Jardín', localidad: 'San Miguel de Tucumán',
    foto: '/fotos/empanadas.webp', vence: '2027-01-31', quedan: 37, destacada: true,
    condiciones: 'De lunes a jueves, de 12 a 16 h. No incluye bebidas. Un cupón por persona.',
  },
  {
    id: 'promo6', titulo: 'Tu refugio en el valle', detalle: 'En dos noches con desayuno casero',
    beneficio: '25%', categoria: 'alojamiento', prestador: 'Casa del Valle', localidad: 'Tafí del Valle',
    foto: '/fotos/alojamiento.webp', vence: '2027-02-15', quedan: 12, destacada: true,
    condiciones: 'Estadía mínima de dos noches. Sujeto a disponibilidad. No válido en fines de semana largos.',
  },
  {
    id: 'promo2', titulo: 'La merienda se comparte', detalle: 'Dos meriendas, una invitación',
    beneficio: '2×1', categoria: 'gastronomia', prestador: 'Patio del Jardín', localidad: 'San Miguel de Tucumán',
    foto: '/fotos/merienda.webp', vence: '2027-01-15', quedan: 54,
    condiciones: 'De lunes a viernes, de 16 a 19 h. Se bonifica la merienda de menor valor.',
  },
  {
    id: 'promo9', titulo: 'Senderos para desconectar', detalle: 'En trekking guiado por el valle',
    beneficio: '20%', categoria: 'aventura', prestador: 'Cumbres del Aconquija', localidad: 'Tafí del Valle',
    foto: '/fotos/montana.webp', vence: '2027-03-01', quedan: 8, destacada: true,
    condiciones: 'Salida de tres horas. Mayores de 12 años. Sujeto a condiciones meteorológicas.',
  },
  {
    id: 'promo14', titulo: 'Historias a cada paso', detalle: 'En el recorrido guiado por el casco histórico',
    beneficio: '2×1', categoria: 'cultura', prestador: 'Rutas de la Historia', localidad: 'San Miguel de Tucumán',
    foto: '/fotos/cultura.webp', vence: '2027-02-28', quedan: 61,
    condiciones: 'Recorrido peatonal de 90 minutos. Reserva previa. No incluye entradas a espacios de terceros.',
  },
  {
    id: 'promo26', titulo: 'El dique desde otra mirada', detalle: 'En paseo en kayak con equipo incluido',
    beneficio: '25%', categoria: 'aventura', prestador: 'Agua y Montaña', localidad: 'El Cadillal',
    foto: '/fotos/dique.webp', vence: '2027-02-15', quedan: 40,
    condiciones: 'Incluye equipo y chaleco. Reserva previa; sujeto a condiciones del agua y del clima.',
  },
  {
    id: 'promo17', titulo: 'Tu pausa entre las Yungas', detalle: 'En el circuito de relax de 60 minutos',
    beneficio: '20%', categoria: 'bienestar', prestador: 'Aire de Yungas', localidad: 'Yerba Buena',
    foto: '/fotos/bienestar.webp', vence: '2027-01-31', quedan: 19,
    condiciones: 'Mayores de 18 años. Reserva previa. No implica un tratamiento médico.',
  },
  {
    id: 'promo20', titulo: 'Llevate un pedacito de Tucumán', detalle: 'En la caja de sabores regionales',
    beneficio: '15%', categoria: 'regionales', prestador: 'Almacén Raíces', localidad: 'Tafí Viejo',
    foto: '/fotos/regionales.webp', vence: '2027-03-15', quedan: 44,
    condiciones: 'Válido sobre cajas seleccionadas. Retiro en el local. No incluye envío.',
  },
  {
    id: 'promo12', titulo: 'Sabores del corazón del valle', detalle: 'En el menú regional del mediodía',
    beneficio: '20%', categoria: 'gastronomia', prestador: 'Sabores de Amaicha', localidad: 'Amaicha del Valle',
    foto: '/fotos/vino.webp', vence: '2027-02-28', quedan: 29,
    condiciones: 'De miércoles a sábado al mediodía. No incluye bebidas.',
  },
];

const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
/** "31 de enero" */
export const fechaCorta = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));
