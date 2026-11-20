// Prueba del simulador del turista y del texto "cuándo vale" (lo que ve el turista mientras la API no esté encendida).
// Uso, desde projects/turista:   node pruebas/simulador.mjs      (Node 22.18+ o 24: importa los .ts directo)
// La conexión con el panel (canjes) la prueba ../admin/pruebas/simulador.mjs.

const memoria = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
  setItem: (k, v) => void memoria.set(k, String(v)),
  removeItem: (k) => void memoria.delete(k),
};

const { simular } = await import('../lib/simulador.ts');
const { cuandoVale } = await import('../lib/cuando.ts');
const qrcode = (await import('qrcode-generator')).default;

const resultados = [];
const chequear = (nombre, condicion) => resultados.push([nombre, !!condicion]);
const S = (metodo, ruta, cuerpo, token) => simular(metodo, ruta, { cuerpo, token });
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

// ---- Cuándo vale ----
chequear('sin restricción: null', cuandoVale(null, null) === null && cuandoVale([], null) === null);
chequear('todos los días con horario', cuandoVale(['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'], { desde: '10:00', hasta: '14:00' }) === 'Todos los días, de 10:00 a 14:00');
chequear('rango de días y horario', cuandoVale(['VIE', 'LUN', 'MIE', 'MAR', 'JUE'], { desde: '16:00', hasta: '20:00' }) === 'De lunes a viernes, de 16:00 a 20:00');
chequear('días sueltos en plural', cuandoVale(['VIE', 'SAB'], null) === 'Viernes y sábados');
chequear('un solo día', cuandoVale(['DOM'], null) === 'Solo los domingos');
chequear('lista de tres no seguidos', cuandoVale(['LUN', 'MIE', 'VIE'], null) === 'Lunes, miércoles y viernes');
chequear('horario que cruza la medianoche', cuandoVale(null, { desde: '21:00', hasta: '02:00' }) === 'Todos los días, de 21:00 a 02:00');

// ---- QR ----
const qr = qrcode(0, 'M');
qr.addData('W9BDSXB', 'Alphanumeric');
qr.make();
chequear('el QR del código se arma (versión 1, 21 módulos)', qr.getModuleCount() === 21);

// ---- Catálogo y ficha ----
const catalogo = (await S('GET', '/promociones?limite=100')).cuerpo.data;
chequear('catálogo con días y horario en la merienda', catalogo.find((p) => p.id === 2)?.horario?.desde === '16:00');
const ficha = await S('GET', '/promociones/2');
chequear('ficha con dirección, teléfono, condiciones y circuito', ficha.http === 200 && ficha.cuerpo.data.comercio.direccion === 'Av. Aconquija 1450'
  && ficha.cuerpo.data.comercio.telefono && ficha.cuerpo.data.condiciones && ficha.cuerpo.data.circuito?.nombre === 'Ciudad');
chequear('ficha inexistente: 404', (await S('GET', '/promociones/9999')).cuerpo.error?.codigo === 'PROMOCION_INEXISTENTE');

// ---- Cuenta: ingresar, encuesta, cupón, perfil, borrar ----
const google = `${b64({ alg: 'RS256' })}.${b64({ sub: '112233445566778899', given_name: 'Ana', family_name: 'Gómez', name: 'Ana Gómez', email: 'ana@example.com' })}.firma`;
const token = (await S('POST', '/auth/google', { id_token: google })).cuerpo.data.token;
chequear('encuesta incompleta: 400', (await S('POST', '/turista/encuesta', { rango_edad_id: 3 }, token)).http === 400);
const respuestas = { rango_edad_id: 3, duracion_id: 2, motivo_id: 1, compania_id: 2, medio_id: 1, provincia_id: 10, pais_id: null };
await S('POST', '/turista/encuesta', respuestas, token);
const corregida = await S('POST', '/turista/encuesta', { ...respuestas, provincia_id: null, pais_id: 53 }, token);
chequear('corregir la encuesta reemplaza la anterior', corregida.http === 200 && corregida.cuerpo.data.pais?.nombre === 'Chile' && corregida.cuerpo.data.provincia === null);
const cupon = (await S('POST', '/turista/cupones', { promocion_id: 2 }, token)).cuerpo.data;
chequear('el cupón trae días y horario de su promoción', cupon.estado === 'EMITIDO' && cupon.promocion.dias_validos?.length === 5);
chequear('perfil con 1 cupón para usar', (await S('GET', '/turista/perfil', undefined, token)).cuerpo.data.cupones.para_usar === 1);
const borrado = await S('DELETE', '/turista/cuenta', undefined, token);
chequear('borrar la cuenta: 200', borrado.http === 200 && borrado.cuerpo.data.mensaje);
chequear('después de borrar, la sesión no vale', (await S('GET', '/turista/perfil', undefined, token)).http === 401);
chequear('y no quedan sus datos en el navegador', ![...memoria.keys()].some((k) => k.includes('112233445566778899')));

let fallas = 0;
for (const [nombre, bien] of resultados) { if (!bien) fallas++; console.log(bien ? 'ok   ' : 'FALLA', nombre); }
console.log(`\n${resultados.length - fallas} de ${resultados.length} chequeos bien.`);
process.exit(fallas ? 1 : 0);
