import type { Metadata } from 'next';
import MisCupones from '@/components/MisCupones';

export const metadata: Metadata = {
  title: 'Mis cupones',
  description: 'Tus cupones guardados de Wayki Promo: los que tenés para usar y los que ya usaste.',
  alternates: { canonical: '/mis-cupones/' },
  robots: { index: false, follow: true }, // página personal
};

export default function MisCuponesPage() {
  return <MisCupones />;
}
