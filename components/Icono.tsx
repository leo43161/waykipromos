// Íconos del kit (WaykiPromo_Kit_Visual_v1/public/wayki-promo/iconos/*.svg), copiados inline para que
// tomen el color del texto (currentColor) y cambien con el estado activo. Mismo trazo que el kit: 1.8.
const TRAZOS = {
  inicio: <path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3z" />,
  cupon: (
    <>
      <path d="M3 6h18v4a2.5 2.5 0 0 0 0 5v3H3v-3a2.5 2.5 0 0 0 0-5V6Z" />
      <path d="M13 6v2m0 3v2m0 3v2" strokeDasharray="2 3" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  buscar: (
    <>
      <circle cx="10.9" cy="10.9" r="6.9" />
      <path d="m16 16 5 5" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  salir: <path d="M11 3H4v18h7m-2-9h12m-4-4 4 4-4 4" />,
};

export type NombreIcono = keyof typeof TRAZOS;

export default function Icono({ nombre, size = 24 }: { nombre: NombreIcono; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {TRAZOS[nombre]}
    </svg>
  );
}
