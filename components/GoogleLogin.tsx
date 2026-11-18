'use client';

/* ============================================================================
 * LOGIN CON GOOGLE — TUTORIAL RÁPIDO (versión completa: docs/GOOGLE_AUTH.md)
 * ----------------------------------------------------------------------------
 *  1. https://console.cloud.google.com → crear proyecto "Wayki Promo".
 *  2. Google Auth Platform → "Comenzar": nombre de app, correo de soporte,
 *     público EXTERNO, correo de contacto → Crear.
 *  3. Google Auth Platform → Público → "Usuarios de prueba": agregá tu Gmail
 *     (mientras la app esté "En prueba", solo esos usuarios pueden entrar).
 *  4. Google Auth Platform → Clientes → "Crear cliente" → Aplicación web.
 *     Orígenes autorizados de JavaScript:
 *        http://localhost:3015
 *        http://localhost
 *     (URIs de redireccionamiento: dejar VACÍO, usamos popup).
 *  5. Copiá el "ID de cliente" (termina en .apps.googleusercontent.com).
 *  6. En projects/turista: copiá .env.example a .env.local y pegá:
 *        NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
 *  7. Reiniciá `npm run dev` y entrá a http://localhost:3015/cuenta/
 *
 *  El "secreto de cliente" NO va en este proyecto (es público/estático).
 *  Cómo funciona: Google Identity Services (GIS) dibuja el botón oficial,
 *  abre un popup y nos devuelve un `credential` (ID token JWT) → lib/cuenta.ts → POST /auth/google.
 * ========================================================================== */

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ingresarConGoogle, mensajeDeError, type Turista } from '@/lib/cuenta';
import s from './GoogleLogin.module.css';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Tipado mínimo de la librería de Google (https://developers.google.com/identity/gsi/web/reference/js-reference).
type GoogleId = {
  initialize(config: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: 'popup' }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
};
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

// initialize() debe llamarse una sola vez por página; el callback apunta al componente montado.
let initialized = false;
let onCredential: (credential: string) => void = () => {};

/** Botón oficial "Continuar con Google". `onLogin` recibe el perfil, con la cuenta ya cargada (cupones y encuesta). */
export default function GoogleLogin({ onLogin }: { onLogin?: (s: Turista) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    onCredential = (credential) => {
      setError('');
      setEntrando(true);
      ingresarConGoogle(credential)
        .then((perfil) => onLogin?.(perfil))
        .catch((e) => setError(mensajeDeError(e)))
        .finally(() => setEntrando(false));
    };
  }, [onLogin]);

  useEffect(() => {
    const google = window.google;
    if (!ready || !CLIENT_ID || !google || !buttonRef.current) return;
    if (!initialized) {
      google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => onCredential(r.credential), ux_mode: 'popup' });
      initialized = true;
    }
    google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
      locale: 'es-419',
      width: Math.min(buttonRef.current.clientWidth || 320, 400), // Google acepta 200–400 px
    });
  }, [ready]);

  if (!CLIENT_ID) {
    return (
      <div className={s.setup} role="note">
        <strong>Falta configurar el login con Google.</strong>
        <p>
          Definí <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> en <code>.env.local</code> y reiniciá <code>npm run dev</code>.
          Paso a paso en <code>docs/GOOGLE_AUTH.md</code>.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setError('No se pudo cargar Google. Revisá tu conexión o si un bloqueador lo está impidiendo.')}
      />
      <div ref={buttonRef} className={s.button} aria-busy={!ready || entrando} />
      {entrando && <p className={s.estado} role="status">Entrando a tu cuenta…</p>}
      {error && <p className={s.error} role="alert">{error}</p>}
    </>
  );
}
