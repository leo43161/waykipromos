'use client';

// Encabezado + tabs. Es UN solo <nav>: en el celular se fija abajo (como una app), en escritorio va arriba.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Brand from '@/components/Brand';
import Icono from '@/components/Icono';
import { asset } from '@/lib/asset';
import { useCuenta } from '@/lib/cuenta';
import s from './Navegacion.module.css';

export default function Navegacion() {
  const ruta = usePathname();
  const { sesion, cupones } = useCuenta();
  const paraUsar = cupones.filter((c) => c.estado === 'disponible').length;
  // usePathname viene sin basePath; con o sin barra final según el caso, por eso startsWith sin la barra.
  const activa = (href: string) => (href === '/' ? ruta === '/' : ruta.startsWith(href)) ? 'page' : undefined;

  return (
    <header className={s.header}>
      <div className={`${s.in} content-width`}>
        <Brand />
        <nav className={s.nav} aria-label="Principal">
          <Link href="/" className={s.tab} aria-current={activa('/')}>
            <span className={s.icono}><Icono nombre="inicio" /></span>
            Inicio
          </Link>
          <Link href="/mis-cupones/" className={s.tab} aria-current={activa('/mis-cupones')}>
            <span className={s.icono}>
              <Icono nombre="cupon" />
              {paraUsar > 0 && <span className={s.contador}>{paraUsar}<span className="sr-only"> para usar</span></span>}
            </span>
            Mis cupones
          </Link>
          <Link href="/wayki/" className={s.tab} aria-current={activa('/wayki')}>
            <span className={s.icono}>
              <img src={asset('/wayki-promo/mascota/wayki-avatar-128.png')} alt="" width={128} height={128} className={s.wayki} />
            </span>
            Wayki
          </Link>
          <Link href="/cuenta/" className={s.tab} aria-current={activa('/cuenta')}>
            <span className={s.icono}>
              {sesion?.foto
                ? <img src={sesion.foto} alt="" width={26} height={26} referrerPolicy="no-referrer" className={s.foto} />
                : <Icono nombre="usuario" />}
            </span>
            Mi cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
