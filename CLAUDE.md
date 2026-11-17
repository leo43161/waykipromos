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
  cuenta.ts             sesión + encuesta + cupones (MODO DESARROLLO, localStorage) + useCuenta() + contrato TODO(backend)
  promociones.ts        cupones de EJEMPLO (seed del demo) + contrato TODO(backend)
  site.ts               SITE_URL, nombre y descripción (usados por SEO)
  asset.ts              asset(/wayki-promo/…) → antepone el basePath (COMPARTIDO)
public/opengraph-image.jpg  imagen para compartir (declarada en layout.tsx; ver el comentario de por qué)
public/fotos/          fotos ilustrativas del demo (no son del kit)
docs/GOOGLE_AUTH.md     Client ID de Google (§1-8) + contrato de la API de login (§9)
.github/workflows/deploy.yml  deploy a cPanel → tucumanturismo.gob.ar/waykipromos/ (ver ../../deploy/README.md)
```

## Cuenta del turista (estado actual)

- Login con **Google Identity Services** en el navegador (compatible con export estático). Sin NextAuth.
  Requiere `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en `.env.local`; sin esa variable el botón muestra un aviso.
- **El ingreso y la encuesta se piden una sola vez, con el primer cupón.** Después cada cupón se guarda con un toque.
- `lib/cuenta.ts` guarda todo en `localStorage` (sobrevive al cerrar el navegador). La encuesta y los cupones
  quedan bajo el `sub` de Google: cerrar sesión no los borra y vuelven al ingresar con la misma cuenta.
- El ID token se decodifica **sin verificar** y el código del cupón se genera en el navegador: sirve para la UI,
  **no** para autorizar nada. Con backend: reemplazar según el contrato de `lib/cuenta.ts` y `docs/GOOGLE_AUTH.md` §9.
- Los componentes leen el estado con `useCuenta()` (se actualiza solo, también entre pestañas).

## Reglas de este proyecto

- Toda página nueva: `export const metadata` con `title`, `description` y `alternates.canonical`
  (con barra final, ej. `'/cupones/'`). Si es pública, agregarla a `app/sitemap.ts`.
  Páginas privadas (perfil, mis cupones): `robots: { index: false }`.
- Un `<h1>` por página. Textos con voseo. Mobile-first: probar a 375 px.
- Estilos de pantalla en `*.module.css` junto a la página; tokens y clases base en `globals.css`.
- Datos de promociones: por ahora no hay API propia. Si se agrega contenido de la API del EATT
  (lugares, eventos), tiene que pasar por un backend proxy — nunca la `X-API-Key` acá.

## Tabs (pedido del Ente, 2026-11-16)

Íconos del kit (`iconos/`): Inicio → `inicio`, Mis cupones → `cupon` (con contador de "para usar"),
Wayki → la cara de Wayki (`mascota/wayki-avatar-128.png`), Mi cuenta → `usuario` (o la foto de Google).

1. **Inicio**: lo primero es **un cupón** (el destacado) con el código bloqueado. Catálogo sin cuenta, con
   buscador (sin tildes), localidad y categoría. "Quiero este cupón" → (solo la primera vez: Google + encuesta) → código.
2. **Mis cupones**: "Para usar" con el código grande y "Usados y vencidos" apagados con sello. El estado "usado"
   lo pondrá el backend (`canjeado`); hoy solo se ven vencidos por fecha.
3. **Wayki**: iframe a Wayki IA (`NEXT_PUBLIC_WAYKI_IA_URL`). Sin URL, pantalla de "muy pronto". El sitio del
   chatbot tiene que permitir mostrarse en un iframe (`frame-ancestors`).
4. **Mi cuenta**: perfil, resumen de cupones, respuestas del viaje y cerrar sesión. Sin sesión, explica que la
   cuenta se crea con el primer cupón y deja ingresar a quien ya tiene una.

## Próximos pasos sugeridos

1. QR del código en Mis cupones (`showQR` del demo) para que el empleado lo escanee.
2. Detalle del cupón (condiciones completas) antes de guardarlo.
3. Mi cuenta: editar respuestas del viaje, ayuda/contacto, borrar cuenta.
4. Backend: login (`docs/GOOGLE_AUTH.md` §9), `GET /persona`, encuesta y adquirir (`lib/cuenta.ts`), catálogo (`lib/promociones.ts`).
