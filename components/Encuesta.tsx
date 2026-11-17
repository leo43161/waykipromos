'use client';

import { useState, type FormEvent } from 'react';
import { guardarEncuesta, type Encuesta as Datos } from '@/lib/cuenta';
import s from './Encuesta.module.css';

// Preguntas definidas por el Ente (2026-11-16). Opciones cerradas para poder tabularlas.
// Si cambian, actualizar también el tipo Encuesta en lib/cuenta.ts (es el contrato con el backend).
const PROVINCIAS = [
  'Tucumán', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
];
const PAISES = ['Bolivia', 'Brasil', 'Chile', 'Paraguay', 'Perú', 'Uruguay', 'Otro país de América', 'Europa', 'Otro país'];

const PREGUNTAS = [
  {
    nombre: 'motivo',
    pregunta: '¿Cuál es el motivo principal de tu visita?',
    opciones: ['Vacaciones / Ocio / Recreación', 'Visita a familiares o amigos', 'Trabajo / Negocios / Congresos', 'Deporte / Eventos culturales', 'Soy residente local'],
  },
  {
    nombre: 'conQuien',
    pregunta: '¿Con quién viajás?',
    opciones: ['Solo/a', 'En pareja', 'En familia (con niños/as)', 'En familia (solo adultos)', 'Con amigos/as', 'En grupo organizado / excursión'],
  },
  {
    nombre: 'noches',
    pregunta: '¿Cuántas noches te quedás (o te vas a quedar)?',
    opciones: ['No me quedo a dormir (voy y vuelvo en el día / soy local)', '1 a 2 noches', '3 a 5 noches', '6 noches o más'],
  },
  {
    nombre: 'medio',
    pregunta: '¿Por qué medio te enteraste del destino?',
    opciones: ['Redes sociales (Instagram, TikTok, Facebook)', 'Recomendación de amigos o familiares', 'Cartelería / Vía pública / Oficinas de turismo', 'Medios tradicionales (radio, TV, diarios)', 'Buscadores de internet (Google)'],
  },
  {
    nombre: 'edad',
    pregunta: '¿En qué rango de edad estás?',
    opciones: ['Menor de 18 años', '18 a 29 años', '30 a 44 años', '45 a 59 años', '60 años o más'],
  },
] as const;

export default function Encuesta({ textoBoton, onListo }: { textoBoton: string; onListo: () => void }) {
  const [error, setError] = useState('');

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '');
    // El navegador ya exige todo con `required`; esto cubre navegadores viejos.
    if (['residencia', ...PREGUNTAS.map((p) => p.nombre)].some((k) => !v(k))) {
      return setError('Te falta responder alguna pregunta.');
    }
    guardarEncuesta({
      residencia: v('residencia'),
      motivo: v('motivo'),
      conQuien: v('conQuien'),
      noches: v('noches'),
      medio: v('medio'),
      edad: v('edad'),
      consentimiento: true,
    } satisfies Datos);
    onListo();
  }

  return (
    <form className={s.form} onSubmit={enviar}>
      <label className="field">
        <span className={s.pregunta}>¿De dónde nos visitás?</span>
        <select name="residencia" required defaultValue="">
          <option value="" disabled>Elegí tu lugar de residencia</option>
          <optgroup label="Argentina">
            {PROVINCIAS.map((x) => <option key={x}>{x}</option>)}
          </optgroup>
          <optgroup label="Otro país">
            {PAISES.map((x) => <option key={x}>{x}</option>)}
          </optgroup>
        </select>
        <small>Donde vivís habitualmente.</small>
      </label>

      {PREGUNTAS.map((p) => (
        <fieldset key={p.nombre} className={s.grupo}>
          <legend>{p.pregunta}</legend>
          <div className={s.pastillas}>
            {p.opciones.map((o, i) => (
              <label key={o} className={s.pastilla}>
                {/* un required en el grupo alcanza para que el navegador exija elegir una opción */}
                <input type="radio" name={p.nombre} value={o} required={i === 0} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label className={s.consentimiento}>
        <input type="checkbox" name="consentimiento" required />
        <span>Acepto que el Ente Tucumán Turismo use mis respuestas con fines estadísticos, para conocer mejor a quienes nos visitan.</span>
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn accent full">{textoBoton}</button>
    </form>
  );
}
