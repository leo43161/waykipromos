import type { Metadata } from 'next';
import Cuenta from '@/components/Cuenta';

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description: 'Tu cuenta de Wayki Promo: datos, respuestas de tu viaje y cierre de sesión.',
  alternates: { canonical: '/cuenta/' },
  robots: { index: false, follow: true }, // página personal
};

export default function CuentaPage() {
  return <Cuenta />;
}
