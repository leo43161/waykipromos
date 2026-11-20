'use client';

// Encuesta del Ente (CU-15), una sola vez. Las preguntas son texto de la app; las OPCIONES vienen de la API
// (GET /encuesta/opciones, con los ids de las tablas de la base) y se manda POST /turista/encuesta con esos ids.
// Con `inicial` arranca con las respuestas guardadas: así se corrigen desde Mi cuenta (el POST reemplaza la anterior).

import { useEffect, useState, type FormEvent } from 'react';
import { guardarEncuesta, mensajeDeError, opcionesEncuesta, type EncuestaApi, type OpcionesEncuestaApi, type Respuestas } from '@/lib/cuenta';
import s from './Encuesta.module.css';

const PREGUNTAS = [
  { nombre: 'motivo_id', lista: 'motivos', respuesta: 'motivo', pregunta: '¿Cuál es el motivo principal de tu visita?' },
  { nombre: 'compania_id', lista: 'companias', respuesta: 'compania', pregunta: '¿Con quién viajás?' },
  { nombre: 'duracion_id', lista: 'duraciones', respuesta: 'duracion', pregunta: '¿Cuántas noches te quedás (o te vas a quedar)?' },
  { nombre: 'medio_id', lista: 'medios', respuesta: 'medio', pregunta: '¿Por qué medio te enteraste del destino?' },
  { nombre: 'rango_edad_id', lista: 'rangos_edad', respuesta: 'rango_edad', pregunta: '¿En qué rango de edad estás?' },
] as const;

export default function Encuesta({ textoBoton, onListo, inicial = null }: { textoBoton: string; onListo: () => void; inicial?: Respuestas | null }) {
  const [opciones, setOpciones] = useState<OpcionesEncuestaApi | null>(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cargar() {
    setErrorCarga('');
    opcionesEncuesta().then(setOpciones, (e) => setErrorCarga(mensajeDeError(e)));
  }
  useEffect(cargar, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = (k: string) => Number(f.get(k)) || null;
    // Residencia: "p:5" = provincia argentina; "x:43" = otro país. Se manda una de las dos.
    const [tipo, residencia] = String(f.get('residencia') ?? ':').split(':');
    // El navegador ya exige todo con `required`; esto cubre navegadores viejos.
    if (!residencia || PREGUNTAS.some((p) => !id(p.nombre))) return setError('Te falta responder alguna pregunta.');
    setError('');
    setEnviando(true);
    try {
      await guardarEncuesta({
        rango_edad_id: id('rango_edad_id'),
        duracion_id: id('duracion_id'),
        motivo_id: id('motivo_id'),
        compania_id: id('compania_id'),
        medio_id: id('medio_id'),
        provincia_id: tipo === 'p' ? Number(residencia) : null,
        pais_id: tipo === 'x' ? Number(residencia) : null,
      } as EncuestaApi);
      onListo();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (errorCarga) {
    return (
      <div className={s.form}>
        <p className="form-error" role="alert">{errorCarga}</p>
        <button type="button" className="btn secondary full" onClick={cargar}>Probar de nuevo</button>
      </div>
    );
  }
  if (!opciones) return <p className="muted" role="status">Cargando las preguntas…</p>;

  return (
    <form className={s.form} onSubmit={enviar}>
      <label className="field">
        <span className={s.pregunta}>¿De dónde nos visitás?</span>
        <select name="residencia" required defaultValue={inicial?.provincia ? `p:${inicial.provincia.id}` : inicial?.pais ? `x:${inicial.pais.id}` : ''}>
          <option value="" disabled>Elegí tu lugar de residencia</option>
          <optgroup label="Argentina">
            {opciones.provincias.map((o) => <option key={o.id} value={`p:${o.id}`}>{o.nombre}</option>)}
          </optgroup>
          <optgroup label="Otro país">
            {opciones.paises.map((o) => <option key={o.id} value={`x:${o.id}`}>{o.nombre}</option>)}
          </optgroup>
        </select>
        <small>Donde vivís habitualmente.</small>
      </label>

      {PREGUNTAS.map((p) => (
        <fieldset key={p.nombre} className={s.grupo}>
          <legend>{p.pregunta}</legend>
          <div className={s.pastillas}>
            {opciones[p.lista].map((o, i) => (
              <label key={o.id} className={s.pastilla}>
                {/* un required en el grupo alcanza para que el navegador exija elegir una opción */}
                <input type="radio" name={p.nombre} value={o.id} required={i === 0} defaultChecked={inicial?.[p.respuesta].id === o.id} />
                <span>{o.nombre}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label className={s.consentimiento}>
        <input type="checkbox" name="consentimiento" required defaultChecked={Boolean(inicial)} />
        <span>Acepto que el Ente Tucumán Turismo use mis respuestas con fines estadísticos, para conocer mejor a quienes nos visitan.</span>
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn accent full" disabled={enviando}>{enviando ? 'Guardando…' : textoBoton}</button>
    </form>
  );
}
