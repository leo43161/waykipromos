# Login con Google — paso a paso (Turista)

Guía para conseguir las credenciales de Google y activar "Continuar con Google" en `projects/turista`.
El código ya está listo: solo falta el **ID de cliente**.

> **Qué se usa:** [Google Identity Services (GIS)](https://developers.google.com/identity/gsi/web/guides/overview),
> la librería oficial de "Sign in with Google" para la web. Funciona 100 % en el navegador, por eso sirve
> con el export estático de Next.js (no hay servidor, no hay NextAuth).
>
> **Qué NO se necesita:** el *secreto de cliente* (client secret). Este proyecto es estático y público:
> si alguna vez ves un secreto, no lo pongas acá.

---

## 0. Antes de empezar

- Usá una **cuenta institucional** del Ente (o una cuenta compartida del equipo), no tu Gmail personal:
  el proyecto de Google queda a nombre de esa cuenta y va a vivir más que este desarrollo.
- Tené a mano: nombre de la app (**Wayki Promo**), correo de soporte y, para producción, el dominio
  definitivo (ej. `tucumanturismo.gob.ar`).

## 1. Crear el proyecto en Google Cloud

1. Entrá a <https://console.cloud.google.com/>.
2. Arriba a la izquierda, en el selector de proyectos → **Proyecto nuevo**.
3. Nombre: `Wayki Promo` · Organización: la del Ente si aparece (si no, "Sin organización") → **Crear**.
4. Verificá que el selector de arriba muestre **Wayki Promo** antes de seguir.

## 2. Configurar la pantalla de consentimiento (Google Auth Platform)

1. Menú ☰ → **Google Auth Platform** (también: *APIs y servicios → Pantalla de consentimiento de OAuth*).
2. Si es la primera vez, botón **Comenzar** y completá el asistente:
   - **Información de la app:** nombre `Wayki Promo`, correo de asistencia del usuario.
   - **Público:** **Externo** (los turistas son cualquier persona con cuenta Google).
   - **Información de contacto:** correo del equipo técnico.
   - Aceptá la política de datos de usuario → **Crear**.
3. **Acceso a los datos (scopes):** no agregues nada. GIS solo usa `openid`, `email` y `profile`,
   que son básicos y no requieren verificación.
4. **Desarrollo de la marca (Branding)** — opcional en desarrollo, necesario para producción:
   - Página principal, política de privacidad y condiciones del servicio (URLs públicas).
   - Dominios autorizados: `tucumanturismo.gob.ar` (o el que se defina).
   - ⚠️ Subir un **logo** dispara una verificación de marca de Google (días). En desarrollo, no lo subas.

## 3. Agregar usuarios de prueba

Mientras la app esté en estado **"En prueba"**, solo pueden ingresar los usuarios que agregues acá.

1. Google Auth Platform → **Público** → *Usuarios de prueba* → **Agregar usuarios**.
2. Agregá tu Gmail y el de quienes vayan a probar (máximo 100).

## 4. Crear el ID de cliente OAuth

1. Google Auth Platform → **Clientes** → **Crear cliente**.
2. Tipo de aplicación: **Aplicación web**.
3. Nombre: `Wayki Turista (web)`.
4. **Orígenes autorizados de JavaScript** → agregá **los dos** (Google lo pide así para localhost):
   ```
   http://localhost:3015
   http://localhost
   ```
   - Si corrés el dev server en otro puerto (`npx next dev -p 3010`), agregá también `http://localhost:3010`.
   - Sin barra final, sin rutas: solo esquema + host + puerto.
5. **URIs de redireccionamiento autorizados:** dejalo **vacío** (usamos el modo popup).
6. **Crear** → copiá el **ID de cliente**. Tiene esta forma:
   ```
   1234567890-abc123def456.apps.googleusercontent.com
   ```
   El "secreto de cliente" que también muestra **no se usa** en este proyecto.

> Los cambios de orígenes pueden tardar **de 5 minutos a unas horas** en aplicarse.

## 5. Configurar el proyecto

```bash
cd projects/turista
cp .env.example .env.local     # en Windows PowerShell: copy .env.example .env.local
```

Editá `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=http://localhost:3015
```

Reiniciá el servidor (`Ctrl+C` y `npm run dev`). Las variables `NEXT_PUBLIC_*` se leen al arrancar.

## 6. Probar

1. Abrí <http://localhost:3015/cuenta/> (tab **Mi cuenta**).
2. Tiene que aparecer el botón oficial **"Continuar con Google"** (si ves un recuadro naranja
   "Falta configurar…", la variable no se cargó: revisá el paso 5).
3. Click → popup de Google → elegí una cuenta de **usuario de prueba** → la tab Mi cuenta muestra tu nombre, correo y foto.
4. "Cerrar sesión" borra la sesión local.

## 7. Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| Recuadro naranja "Falta configurar el login con Google" | `.env.local` no existe, la variable está mal escrita o no reiniciaste `npm run dev`. |
| `Error 400: origin_mismatch` / "The given origin is not allowed for the given client ID" | El origen exacto (con puerto) no está en *Orígenes autorizados*. Agregalo y esperá unos minutos. `localhost` y `127.0.0.1` son distintos. |
| `Error 403: access_denied` / "La app no completó la verificación" | Tu cuenta no está en *Usuarios de prueba* (paso 3). |
| El botón no aparece y no hay recuadro naranja | Bloqueador de anuncios/extensiones bloqueando `accounts.google.com`, o cookies de terceros bloqueadas. Probá en ventana normal sin extensiones y mirá la consola (F12). |
| El popup se abre y se cierra sin hacer nada | En `http://localhost`, Google recomienda la cabecera `Referrer-Policy: no-referrer-when-downgrade`. Si pasa, agregá `referrer: 'no-referrer-when-downgrade'` al `metadata` de `app/layout.tsx`. |
| La foto de perfil no carga | Ya se usa `referrerPolicy="no-referrer"` en el `<img>`; si persiste, es la cuenta sin foto. |

## 8. Antes de producción (pendiente)

Sin la etapa `login` encendida, el login funciona en **modo simulado**: `lib/simulador.ts` decodifica el token en el navegador
solo para mostrar nombre/foto. **Eso no es seguro para autorizar nada** (un JWT se puede fabricar).
Para producción:

1. **Backend que verifique el token** y emita su propia sesión: hecho en `projects/api` (§9).
   Para encenderlo: `NEXT_PUBLIC_API_ETAPAS=login` (variable del repo; ver `lib/api.ts`).
2. **Base de datos:** la tabla `turistas` sirve como está; faltan dos procedimientos (`projects/api/sql/login_google.sql`).
3. **Google Cloud:** en el cliente web agregá los orígenes de producción `https://tucumanturismo.gob.ar`
   y `https://www.tucumanturismo.gob.ar`. Van sin `/waykipromo`, porque un origen no lleva ruta. HTTPS es obligatorio
   fuera de localhost. Después completá Branding (privacidad, términos, dominio) y en **Público** tocá **Publicar app**.
   Con scopes básicos no hace falta verificación, salvo que subas un logo.
4. **Variables:** las define el workflow `.github/workflows/deploy.yml` antes de `npm run build`, porque se
   incrustan en el HTML al compilar:
   - `NEXT_PUBLIC_BASE_PATH=/waykipromo`
   - `NEXT_PUBLIC_SITE_URL=https://tucumanturismo.gob.ar/waykipromo`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, tomado de la *Variable* del repo con ese mismo nombre.

   Guía completa del deploy: `deploy/README.md` en la carpeta raíz de Wayki Promo.

### Opcional (más adelante)

- **One Tap** (el cartelito "Continuar como…" arriba a la derecha): `google.accounts.id.prompt()` después
  de `initialize()` en `components/GoogleLogin.tsx`.
- **Encuesta turística**: hecha (se pide una sola vez, con el primer cupón; `components/Encuesta.tsx`). Se guarda con la etapa `encuesta` (ver `api-doc/pedidos-backend.html`).

## 9. Contrato para la API (backend)

> Lo que Google entrega y cómo lo usa la API.

### 9.1 Qué devuelve Google

Cuando la persona elige su cuenta, GIS llama al callback con `{ credential, select_by }`. El `credential` es
un **ID token**: un JWT firmado por Google. Su contenido (payload) se ve así:

```json
{
  "iss": "https://accounts.google.com",
  "aud": "1234-abc.apps.googleusercontent.com",
  "azp": "1234-abc.apps.googleusercontent.com",
  "sub": "10769150350006150715113082367",
  "email": "turista@gmail.com",
  "email_verified": true,
  "name": "Ana Pérez",
  "given_name": "Ana",
  "family_name": "Pérez",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "iat": 1763050000,
  "exp": 1763053600,
  "nbf": 1763049700,
  "jti": "abc123..."
}
```

| Campo | Uso |
|---|---|
| `sub` | **Clave de la persona.** Es el ID de la cuenta Google: único y nunca cambia. Va en `turistas.google_sub`. |
| `email` | Sirve para contactar a la persona, no para identificarla, porque puede cambiar. Confiá en él solo si `email_verified` es `true`. |
| `given_name` / `family_name` | Van a `turistas.nombre` y `turistas.apellido`. **Pueden faltar**: en ese caso usá `name` o un string vacío. |
| `picture` | URL de la foto. Puede cambiar, así que conviene actualizarla en cada login. |
| `hd` | Solo aparece en cuentas de Google Workspace. En turistas casi nunca viene. |
| `iss`, `aud`, `azp`, `exp`, `iat`, `nbf`, `jti` | Sirven para verificar el token. No se guardan. |

Google **no** entrega DNI, teléfono ni procedencia. Esos datos se piden en la encuesta post-login.

### 9.2 Flujo, endpoints y base

Ya no son un borrador: el login está hecho en `projects/api` (`POST /auth/google`, `GET /turista/perfil`, con los
procedimientos de `projects/api/sql/login_google.sql`). El contrato completo y lo que falta para encenderlo están en
`api-doc/pedidos-backend.html` (pestaña "1 · Login"), en la carpeta raíz de Wayki Promo. Del lado de la app, el contrato
vive en `lib/api.ts` y se enciende con la etapa `login` de `NEXT_PUBLIC_API_ETAPAS`.
