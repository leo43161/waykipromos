// Días y horario de validez de una promoción, en palabras. Sin dependencias: lo prueba pruebas/simulador.mjs.

const DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const NOMBRE_DIA: Record<string, string> = { LUN: 'lunes', MAR: 'martes', MIE: 'miércoles', JUE: 'jueves', VIE: 'viernes', SAB: 'sábado', DOM: 'domingo' };
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const plural = (dia: string) => (dia.endsWith('s') ? dia : `${dia}s`); // sábado → sábados; lunes queda igual

/** Días y horario de validez en palabras ("De lunes a viernes, de 16:00 a 20:00"). null si vale siempre. */
export function cuandoVale(dias: string[] | null, horario: { desde: string; hasta: string } | null): string | null {
  const orden = (dias ?? []).map((d) => DIAS.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
  const nombres = orden.map((i) => NOMBRE_DIA[DIAS[i]]);
  const seguidos = orden.length >= 3 && orden.every((v, i) => i === 0 || v === orden[i - 1] + 1);
  const textoDias =
    orden.length === 0 || orden.length === 7 ? null
    : seguidos ? `de ${nombres[0]} a ${nombres[nombres.length - 1]}`
    : nombres.length === 1 ? `solo los ${plural(nombres[0])}`
    : `${nombres.slice(0, -1).map(plural).join(', ')} y ${plural(nombres[nombres.length - 1])}`;
  const textoHora = horario && `de ${horario.desde} a ${horario.hasta}`;
  if (!textoDias && !textoHora) return null;
  return mayuscula([textoDias ?? 'todos los días', textoHora].filter(Boolean).join(', '));
}
