import qrcode from 'qrcode-generator';

/**
 * QR del código del cupón: lo que escanea el empleado (el contrato dice que el QR lleva el mismo código).
 * SVG para que se vea nítido a cualquier tamaño. Siempre oscuro sobre blanco y con margen: así lo leen los escáneres,
 * también con el celular en modo oscuro.
 */
export default function Qr({ texto, tamano = 220 }: { texto: string; tamano?: number }) {
  const qr = qrcode(0, 'M'); // tamaño automático; corrección media (aguanta una pantalla rayada o un reflejo)
  qr.addData(texto, 'Alphanumeric'); // los códigos son mayúsculas y números
  qr.make();
  const n = qr.getModuleCount();
  const margen = 4; // la "zona tranquila" que pide el estándar
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + margen} ${y + margen}h1v1h-1z`;
  const lado = n + margen * 2;
  return (
    <svg viewBox={`0 0 ${lado} ${lado}`} width={tamano} height={tamano} role="img" aria-label={`Código QR del cupón ${texto}`} shapeRendering="crispEdges">
      <rect width={lado} height={lado} fill="#ffffff" />
      <path d={d} fill="#0d3236" />
    </svg>
  );
}
