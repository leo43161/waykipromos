# Bitácora · Turista

Registro de sesiones de trabajo. Lo más nuevo arriba. Formato: fecha, qué se hizo, decisiones, pendientes.

---

## 2026-11-19 — Login con Google en producción + contrato de la API

**Hecho**
- Producción mostraba "Falta configurar el login con Google": el build de GitHub Actions no recibía el Client ID
  (la Variable del repo no llegaba; `.env.local` nunca va a CI). El ID es público: quedó fijo en
  `.github/workflows/deploy.yml` (commit 603ea95). Login andando en producción.
- Contrato de la API para las 2 apps: `../../api-doc/contrato-api.html` + `openapi.yaml` (ver bitácora del admin).
  Lo del turista: `/promociones` (+ ficha), `/encuesta/opciones`, `/turista/encuesta`, `/turista/cupones`,
  `/turista/perfil` (nuevo, lee la base) y `DELETE /turista/cuenta` (borrar datos personales).

- **App alineada con el contrato**: `lib/api.ts` (tipos copiados del contrato; arriba, qué endpoints necesita cada
  etapa), `lib/simulador.ts` (cupón `EMITIDO`, encuesta incompleta 400, `GET /turista/perfil` con los contadores,
  `respondida_el`, las 3 categorías reales con ids numéricos, `fecha_desde`/`dias_validos`/`horario`, token de 30 días)
  y `lib/cuenta.ts` (valida la sesión con `/turista/perfil`). `NEXT_PUBLIC_API_URL` termina en `/v1` (yml, example y
  `.env.local`). En producción todas las etapas siguen simuladas (`NEXT_PUBLIC_API_ETAPAS` vacía), así que nada se rompió.
- **Para publicar el login en Google**: páginas `/privacidad/` y `/terminos/` (en el sitemap; enlazadas en el pie de
  Inicio y debajo del botón de Google, "Al continuar, aceptás…"), contacto `informes@tucumanturismo.gob.ar`
  (`CONTACTO_EMAIL` en `lib/site.ts`), y `docs/google-logo-120.png` (avatar de Wayki del kit). Los datos de
  Branding quedaron en `docs/GOOGLE_AUTH.md` §8.
- **TEMPORAL**: la consola muestra lo que devuelve Google al ingresar (respuesta, JWT y su contenido), también en
  producción, para probar la API (`mostrarRespuestaDeGoogle` en `components/GoogleLogin.tsx`).

- **Conexión con el panel simulado** (tarde): `lib/simulador.ts` lee los canjes de `wayki-canjes-sim` (los escribe el
  simulador del panel; en producción comparten dominio) y marca el cupón `CANJEADO`; `lib/cuenta.ts` se recarga sola
  si cambia esa clave en otra pestaña. Los ids de comercios y promociones del catálogo simulado tienen que coincidir
  con `admin/lib/simulador.ts`. Probado en `admin/pruebas/simulador.mjs`.

**Decisiones**
- Logo para Google: el avatar de Wayki (redondo, ya es el favicon). Con logo, Google pide verificar la marca.
- Los textos legales describen lo que hace la app y la API del contrato. Los revisa el área legal del Ente.

**Pendiente**
- Sacar el `console.log` del token de Google antes de abrir al público.
- Revisión legal de `/privacidad/` y `/terminos/`.
- "Borrar mi cuenta" en Mi cuenta (`DELETE /turista/cuenta` ya está en el contrato; hoy se pide por mail).

---

## 2026-11-18 (tarde) — App adaptada a la API oficial (login)

**Hecho**
- Llegó la API oficial del equipo de backend (repo `waykipromos-api`, PHP 8.4+). Tres cambios en el front para hablar
  su dialecto, sin tocar nada más (las etapas siguen simuladas hasta prenderlas):
  1. El vencimiento del token sale del claim `exp` del propio JWT (`venceEn` en `lib/cuenta.ts`); la API no manda
     `expira_en`. El token se guarda como string pelado en `localStorage` (antes era `{token, expira_en}`).
  2. El perfil se valida con `GET /auth/perfil` (antes `/turista/perfil`). Devuelve el contenido del token
     (`turistas_id`, `nombre`, `email`, `rol`), sin foto: `aTurista` ahora tolera las dos formas.
  3. La sesión se cierra sola también con `403 TOKEN_INVALIDO` (nuevo `esSesionInvalida`), además de 401 y suspendido.
- `lib/api.ts`: `TuristaApi` con casi todo opcional (dos formas: `/auth/google` vs `/auth/perfil`); `LoginApi` sin
  `expira_en`. `lib/simulador.ts`: espejo del mismo contrato (`/auth/perfil`, login sin `expira_en`).
- **Probado contra la nube** (`https://tucumanturismo.gob.ar/waykipromo/api`, etapa `login` prendida en local): token con
  `exp` futuro → llama a `/auth/perfil`, recibe 403 `TOKEN_INVALIDO` y cierra sesión sin error; token vencido → ni pega
  a la nube; sin token → sin sesión. Los códigos reales (401 `TOKEN_REQUERIDO`, 403 `TOKEN_INVALIDO`, 401
  `GOOGLE_TOKEN_INVALIDO`) coinciden con lo que la app espera. Build OK.

**Pendientes (backend, en `api-doc/pedidos-backend.html`)**
- Falta que la API valide `aud` contra el Client ID, ponga `RoleMiddleware` en `/admin/*` y `/comercio/*`, y un
  `GET /turista/perfil` que lea la tabla y traiga `foto_url` (hoy, al recargar, se pierde el avatar).
- Para que ande Google en producción: autorizar `https://tucumanturismo.gob.ar` en Google Cloud y cargar
  `GOOGLE_CLIENT_ID` en el `.env` del servidor.

---

## 2026-11-18 — Front listo para la API, por etapas

**Hecho**
- `lib/api.ts`: cliente (`api()`, `ErrorApi`) y contrato (`*Api`). Etapas `login`, `catalogo`, `encuesta`, `cupones`:
  las que están en `NEXT_PUBLIC_API_ETAPAS` van a `NEXT_PUBLIC_API_URL`; el resto lo responde `lib/simulador.ts`
  con el mismo formato y códigos de error (el seed y el localStorage de antes viven ahí ahora).
- `lib/cuenta.ts`: estado único (`useSyncExternalStore`), token de la API, `GET /turista/perfil` al abrir, 401 cierra
  la sesión, `esperarCuenta()` para no pedir Google a quien ya tiene sesión.
- Catálogo pedido al compilar (`app/page.tsx`, sigue en el HTML para SEO) y refrescado en el navegador. Categorías y
  localidades salen de los datos. Estados de carga, error y "todavía no hay cupones".
- Encuesta con opciones de `GET /encuesta/opciones` y envío por ids; residencia = provincia **o** país. Opción nueva
  "En el propio prestador" (CU-15).
- Cupón: pasos "guardando" y "error" en el diálogo; `ENCUESTA_PENDIENTE` vuelve a la encuesta, `STOCK_AGOTADO` recarga
  el catálogo. Mis cupones usa la promoción que trae cada cupón (también anulados).
- Avisos "de ejemplo" / "código de prueba" solo con la etapa simulada. Deploy: `NEXT_PUBLIC_API_URL` fija y
  `NEXT_PUBLIC_API_ETAPAS` desde la Variable del repo.
- Probado en el navegador con sesión simulada (390 px): encuesta → primer cupón, segundo con un toque, Mis cupones,
  Mi cuenta con respuestas, token vencido cierra la sesión. Build OK, catálogo en `out/index.html`.

**Decisiones**
- "Encuesta respondida" sale de `GET /turista/encuesta` (no del perfil): funciona aunque login sea real y encuesta simulada.
- El simulador acepta el token de la API real (lee su `sub` sin verificar) para poder mezclar etapas.
- Los datos simulados viejos (`wayki-turista-sesion`, `wayki-turista-datos-*`) quedan huérfanos: eran de prueba.

**Para probar sin Google** (consola del navegador en `localhost:3015`):
```js
const b = (o) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const exp = Math.floor(Date.now() / 1000) + 3600;
localStorage.setItem('wayki-turista-token', JSON.stringify({ token: `${b({ alg: 'none' })}.${b({ sub: 'prueba', rol: 'turista', exp })}.x`, expira_en: new Date(exp * 1000).toISOString() }));
localStorage.setItem('wayki-sim-prueba', JSON.stringify({ turista: { id: 1, nombre: 'Ana', nombre_completo: 'Ana Pérez', email: 'ana@gmail.com', foto_url: null }, encuesta: null, cupones: [] }));
```

**Pendientes**
- Encender `login` cuando el servidor tenga `config.php` y los procedimientos (ver `api-doc/pedidos-backend.html`).
- El resto de las etapas, según responda el backend.

---

## 2026-11-16 (tarde) — Tabs + cuenta por única vez

**Hecho**
- Tabs **Inicio · Mis cupones · Wayki · Mi cuenta** (`components/Navegacion.tsx`): barra fija abajo en el celular,
  en el encabezado en escritorio. Íconos del kit (inicio, cupon, usuario) inline con `currentColor`
  (`components/Icono.tsx`); Wayki con su avatar; contador de cupones para usar.
- **Ingreso y encuesta una sola vez, con el primer cupón**; después cada cupón se guarda con un toque.
  `lib/session.ts` + `lib/cuponera.ts` → `lib/cuenta.ts` en `localStorage`, datos por `sub` de Google y hook `useCuenta()`.
- Inicio: buscador (sin tildes) + localidad + categoría; sin la barra fija (la reemplazan las tabs).
- Mis cupones: "Para usar" con el código grande y "Usados y vencidos" apagados con sello (`Ticket` variante `mio`).
- Wayki: iframe a `NEXT_PUBLIC_WAYKI_IA_URL` (variable nueva en `.env.example` y `deploy.yml`); sin URL, "muy pronto".
- Mi cuenta: perfil, resumen, respuestas del viaje, cerrar sesión; sin sesión, ingresar o elegir el primer cupón.
- Se borró `/ingresar/` (lo reemplaza Mi cuenta). `GoogleLogin` quedó solo como botón.
- Verificado en el navegador (390 px y 1366 px): primer cupón con encuesta, segundo directo, sellos, cerrar
  sesión y volver a ingresar conserva cupones y encuesta. Build con `basePath` OK.

**Decisiones**
- Cerrar sesión no borra la encuesta ni los cupones de esa cuenta (como pasará con el backend).
- El estado "usado" lo marca el backend al canjear; el turista nunca lo cambia.
- Tab de cuenta rotulada "Mi cuenta" (ruta `/cuenta/`).

**Pendientes**
- URL de Wayki IA y que ese sitio permita iframe (`frame-ancestors`).
- QR del código; editar respuestas del viaje; más opciones en Mi cuenta.

---

## 2026-11-16 — Home con cupones + registro con encuesta

**Hecho**
- Cambio de planes: quedan 2 proyectos (`turista/` y `admin/`); `globals.css`, `Brand` y `asset` se comparten con admin.
- Home nueva (`components/Cuponera.tsx`): lo primero que se ve es un **cupón-ticket** destacado con el código
  bloqueado y Wayki "presentándolo"; catálogo de 9 cupones de ejemplo con filtro por categoría; bloque
  "Tu cupón, en tres pasos"; barra fija en el celular para registrarse.
- "Quiero este cupón" abre un diálogo (hoja inferior en el celular): ingresar con Google → encuesta → código.
  Encuesta con las **preguntas del Ente** (residencia, motivo, con quién, noches, medio, edad + consentimiento).
- Escena del manual por capas: menta, líneas topográficas, sol naranja y lomas (paths de `fondo-claro-organico.svg`).
- Tipografía de campaña: **Anton** como sustituto de Gobold (`--font-display`, clase `.display`).
- Fotos ilustrativas del demo en `public/fotos/`.
- Verificado: build con y sin `basePath` (/waykipromos); flujo completo probado en el navegador a 390 px y 1366 px.

**Decisiones**
- El catálogo se ve sin cuenta; la cuenta y la encuesta se piden recién al guardar un cupón.
- Diálogo nativo `<dialog>` en lugar de páginas: el turista no pierde el cupón que eligió.
- Encuesta y cupones en `sessionStorage` (MODO DESARROLLO); el código real lo generará el servidor.
- La pregunta 5 dice "del destino" (se quitó "de este concurso"). Edad obligatoria porque no pedimos fecha de nacimiento.

**Pendientes**
- Backend: `PUT /persona/encuesta` y `POST /promociones/{id}/adquirir` (contrato en `lib/cuponera.ts`).
- Columnas de la encuesta en la base (hoy `PERSONA` solo tiene `procedencia`).
- Mis cupones + QR; detalle del cupón; rediseñar `/ingresar/`.

---

## 2026-11-13 — Deploy a cPanel con GitHub Actions

**Hecho**
- Deploy automático a `/waykipromos/` dentro del sitio principal (tucumanturismo.gob.ar).
- `basePath` desde `NEXT_PUBLIC_BASE_PATH` en `next.config.ts` (vacío en desarrollo) y `lib/asset.ts` (compartido)
  para los `<img>` de `public/`.
- `.github/workflows/deploy.yml`: build → ZIP → FTP a `waykipromos/_deploy/<app>/` → `descomprimir.php` lo extrae.
  Basado en el yml del proyecto principal; el secreto viaja en una cabecera, no en la URL.
- Verificado: `npm run build` con el basePath de producción, sin rutas `/_next/` sueltas en el HTML.
- `docs/GOOGLE_AUTH.md` §9: contrato de la API de login (payload de Google, flujo, endpoints, cambios en `PERSONA`).
- Imagen OG movida a `public/` y declarada en `layout.tsx`: por convención de archivo, Next 16 duplicaba `/waykipromos`.

**Pendientes**
- Crear el repo, cargar secrets y la variable `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (ver `deploy/README.md` en la raíz).
- Agregar los orígenes `https://tucumanturismo.gob.ar` y `https://www.tucumanturismo.gob.ar` en Google.
- Sumar el sitemap al `robots.txt` del sitio principal (el de `/waykipromos/` no lo leen los buscadores).
- Subir `deploy/descomprimir.php` al servidor con el secreto (una sola vez para los 4 proyectos).

---

## 2026-11-12 — Base del proyecto + login con Google

**Hecho**
- Proyecto Next.js 16.4.6 + React 19.3 + TypeScript con `output: 'export'`, `trailingSlash`, imágenes sin optimizar.
- Tokens y clases base tomados de `wayki-promo-demo.html` y del kit visual (`app/globals.css`).
- SEO: metadata global (title template, descripción con destinos de Tucumán, OG `es_AR`, Twitter card),
  `opengraph-image.jpg` (hero institucional), favicon (avatar Wayki), `robots.txt`, `sitemap.xml`,
  JSON-LD `WebSite` publicado por `GovernmentOrganization` (EATT).
- Inicio (`/`) con hero del demo y CTA a ingresar.
- `/ingresar/` (noindex): botón oficial de Google Identity Services, estados de carga/error/sin configurar/logueado.
- `docs/GOOGLE_AUTH.md` con el paso a paso de Google Cloud + tutorial resumido en `components/GoogleLogin.tsx`.
- Verificado: `npm run build` OK; el botón de Google se dibuja con un Client ID de prueba.

**Decisiones**
- GIS en el navegador en lugar de NextAuth: NextAuth necesita servidor y el proyecto es estático.
- Sesión en `sessionStorage` y token decodificado sin verificar: **solo desarrollo**. La verificación real
  queda para el backend (`POST /auth/google`, contrato en `lib/session.ts`).
- No se guarda el ID token, solo el perfil (sub, email, nombre, foto).
- `/ingresar/` fuera del sitemap y con `noindex`.

**Pendientes**
- Configurar el Client ID real (ver `docs/GOOGLE_AUTH.md`).
- Backend que verifique el token y emita sesión; columna `googlesub` en `PERSONA`.
- Catálogo, detalle de promoción, mis cupones, QR, encuesta post-login.
- Definir dominio de producción → `NEXT_PUBLIC_SITE_URL`.
