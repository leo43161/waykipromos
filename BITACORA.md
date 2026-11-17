# Bitácora · Turista

Registro de sesiones de trabajo. Lo más nuevo arriba. Formato: fecha, qué se hizo, decisiones, pendientes.

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
