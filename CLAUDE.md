# Turista — app pública de Wayki Promo

Leé también `../../CLAUDE.md` (reglas generales: export estático, seguridad, marca, cómo leer el demo).

App que usan los **visitantes**: descubrir promociones, guardar cupones y mostrarlos en el local.
Es el **único proyecto público e indexable**: el SEO importa acá.
Referencia de UX: rol `turista` del demo (`renderTourist`, `renderCatalog`, `showDetails`, `signup`,
`claimPromotion`, `renderProfile`, `showQR` en `wayki-promo-demo.html`).

## Comandos

```bash
npm install
npm run dev        # http://localhost:3015  (ese origen tiene que estar autorizado en Google)
npm run build      # export estático en out/ + chequeo de tipos
npx serve out      # previsualizar el build estático
```

## Estructura

```
app/
  layout.tsx            metadata SEO global, fuentes Montserrat + Anton, skip-link, <Navegacion/> (tabs)
  page.tsx              tab Inicio: <Cuponera/> + footer + JSON-LD          (indexable, en el sitemap)
  mis-cupones/page.tsx  tab Mis cupones: <MisCupones/>                       (noindex)
  wayki/page.tsx        tab Wayki: iframe a Wayki IA o "muy pronto"          (noindex)
  cuenta/page.tsx       tab Mi cuenta: <Cuenta/> (perfil, viaje, cerrar sesión; o ingresar) (noindex)
  robots.ts, sitemap.ts generados estáticos (dynamic = force-static)
  icon.png              favicon (avatar de Wayki)
  globals.css           tokens + base (COMPARTIDO con admin/)
components/
  Navegacion.tsx        encabezado + tabs (un solo <nav>: abajo fijo en el celular, arriba en escritorio)
  Icono.tsx             íconos del kit inline con currentColor (inicio, cupon, usuario, buscar, ubicacion, salir)
  Cuponera.tsx          Inicio: hero con el cupón destacado, buscador, filtros, "tres pasos" y el diálogo
                        cuenta → encuesta → código (lógica en avanzar())
  Ticket.tsx            el cupón-ticket: variantes hero / card / mio, y sello (Usado / Vencido)
  Encuesta.tsx          preguntas del Ente (opciones cerradas)
  MisCupones.tsx        "Para usar" (con el código grande) y "Usados y vencidos"
  Cuenta.tsx            Mi cuenta
  GoogleLogin.tsx       botón oficial de Google (GIS); prop onLogin; tutorial en el comentario de arriba
  Brand.tsx             logo Wayki | PROMO (COMPARTIDO)
lib/
  api.ts                cliente de la API + CONTRATO (tipos *Api) + etapas (NEXT_PUBLIC_API_ETAPAS)
  simulador.ts          backend simulado en el navegador para las etapas apagadas (mismo formato y errores)
  cuenta.ts             sesión (token de la API) + encuesta + cupones + useCuenta() (estado único de la página)
  promociones.ts        catálogo: tipo Promocion + aPromocion() + listarPromociones() (sin hooks: lo usa el build)
  site.ts               SITE_URL, nombre y descripción (usados por SEO)
  asset.ts              asset(/wayki-promo/…) → antepone el basePath (COMPARTIDO)
public/opengraph-image.jpg  imagen para compartir (declarada en layout.tsx; ver el comentario de por qué)
public/fotos/          fotos ilustrativas del demo (no son del kit)
docs/GOOGLE_AUTH.md     Client ID de Google (§1-8) + qué entrega Google (§9)
.github/workflows/deploy.yml  deploy a cPanel → tucumanturismo.gob.ar/waykipromo/ (ver ../../deploy/README.md)
```

## Datos: la API por etapas

- Todo dato pasa por `api()` de `lib/api.ts`. Cada pedido pertenece a una **etapa** (`login`, `catalogo`, `encuesta`,
  `cupones`). Si la etapa está en `NEXT_PUBLIC_API_ETAPAS` (y hay `NEXT_PUBLIC_API_URL`), va a la API real; si no, la
  responde `lib/simulador.ts` **con el mismo formato y los mismos códigos de error**. Encender una etapa no toca código.
- Los tipos `*Api` de `lib/api.ts` son el contrato que le pedimos al backend; lo que falta de cada etapa está en
  `../../api-doc/pedidos-backend.html`. Si cambia el contrato: tipo en `api.ts`, adaptador (`aPromocion`, `aCupon`,
  `aTurista`), el simulador y la página de pedidos, juntos.
- Las pantallas usan tipos propios (`Promocion`, `Cupon`, `Turista`), nunca los `*Api`.
- El catálogo se pide **al compilar** (`app/page.tsx`, para SEO) y `Cuponera` lo refresca al abrir.
- Errores: `ErrorApi` trae `http`, `codigo` y un `message` ya escrito para el turista (`mensajeDeError`).
  La sesión se cierra sola (`esSesionInvalida` en `lib/cuenta.ts`) ante 401, `403 TOKEN_INVALIDO` o `TURISTA_SUSPENDIDO`.

## Cuenta del turista

- Login con **Google Identity Services** en el navegador (compatible con export estático). Sin NextAuth.
  Requiere `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en `.env.local`; sin esa variable el botón muestra un aviso.
  El `credential` va a `POST /auth/google`; la app guarda el JWT de la API y, al abrir, lo valida con `GET /auth/perfil`.
  El vencimiento sale del claim `exp` del propio token (la API no manda `expira_en` aparte).
- **El ingreso y la encuesta se piden una sola vez, con el primer cupón.** Después cada cupón se guarda con un toque.
  El servidor tiene la última palabra: código, stock y encuesta pendiente (`409 ENCUESTA_PENDIENTE` vuelve a la encuesta).
- Simulado: la encuesta y los cupones quedan en `localStorage` bajo el `sub` del token (`wayki-sim-<sub>`). Para
  probar sin Google, cargar un token simulado a mano (ver `BITACORA.md`, 2026-11-18).
- Los componentes leen el estado con `useCuenta()` (se carga una vez y se actualiza solo, también entre pestañas).

## Reglas de este proyecto

- Toda página nueva: `export const metadata` con `title`, `description` y `alternates.canonical`
  (con barra final, ej. `'/cupones/'`). Si es pública, agregarla a `app/sitemap.ts`.
  Páginas privadas (perfil, mis cupones): `robots: { index: false }`.
- Un `<h1>` por página. Textos con voseo. Mobile-first: probar a 375 px.
- Estilos de pantalla en `*.module.css` junto a la página; tokens y clases base en `globals.css`.
- Datos de Wayki Promo: siempre por `lib/api.ts` (ver arriba). Si se agrega contenido de la API del EATT
  (lugares, eventos), tiene que pasar por un backend proxy — nunca la `X-API-Key` acá.

## Tabs (pedido del Ente, 2026-11-16)

Íconos del kit (`iconos/`): Inicio → `inicio`, Mis cupones → `cupon` (con contador de "para usar"),
Wayki → la cara de Wayki (`mascota/wayki-avatar-128.png`), Mi cuenta → `usuario` (o la foto de Google).

1. **Inicio**: lo primero es **un cupón** (el destacado) con el código bloqueado. Catálogo sin cuenta, con
   buscador (sin tildes), localidad y categoría. "Quiero este cupón" → (solo la primera vez: Google + encuesta) → código.
2. **Mis cupones**: "Para usar" con el código grande y "Usados y vencidos" apagados con sello. El estado "usado"
   lo pone el backend al canjear (`CANJEADO`); también hay vencidos y anulados.
3. **Wayki**: iframe a Wayki IA (`NEXT_PUBLIC_WAYKI_IA_URL`). Sin URL, pantalla de "muy pronto". El sitio del
   chatbot tiene que permitir mostrarse en un iframe (`frame-ancestors`).
4. **Mi cuenta**: perfil, resumen de cupones, respuestas del viaje y cerrar sesión. Sin sesión, explica que la
   cuenta se crea con el primer cupón y deja ingresar a quien ya tiene una.

## Próximos pasos sugeridos

1. QR del código en Mis cupones (`showQR` del demo) para que el empleado lo escanee.
2. Detalle del cupón (condiciones completas) antes de guardarlo.
3. Mi cuenta: editar respuestas del viaje, ayuda/contacto, borrar cuenta.
4. Encender las etapas a medida que el backend las termine (`../../api-doc/pedidos-backend.html`).
