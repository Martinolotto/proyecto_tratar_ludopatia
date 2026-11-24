/* Devoluciones descriptivas sobre registros propios, sin diagnóstico ni persistencia. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { consultarRegistros } from '../historialDatos.js';
import { formatearDuracion } from '../formatosMetricas.js';
import { evaluarResumen } from './reglasResumen.js';
import './ResumenVista.css';

const explicaciones = {
  recuperar_perdidas: ['Intentar recuperar lo perdido', 'Seguir apostando para recuperar dinero puede aumentar las pérdidas.', 'Conocer esta situación puede ayudarte a buscar otras alternativas.'],
  dificultad_detenerse: ['Dificultad para detenerte', 'Si te cuesta parar, puede ser útil contar con apoyo de alguien de confianza.', 'En Escudo digital hay herramientas para limitar el acceso.'],
  exceder_previsto: ['Apostar más de lo que tenías pensado', 'Puede resultar difícil mantener los límites que te habías propuesto.', 'Pensá en cuándo te resulta más difícil detenerte y conocé herramientas de protección.'],
  interrumpir_actividades: ['Interrumpir otras actividades', 'Observar qué actividades dejaste de lado puede ayudarte a decidir cómo organizar tu tiempo.', 'Podés buscar apoyo y conocer herramientas para desconectarte.'],
};

export function ResumenVista({ usuarioId, desde, hasta }) {
  const [resultado, setResultado] = useState({ clave: '', estado: 'cargando' });
  const [revision, setRevision] = useState(0);
  const clave = `${usuarioId}|${desde}|${hasta}`;
  useEffect(() => {
    let vigente = true;
    consultarRegistros(usuarioId, desde, hasta).then((datos) => {
      if (vigente) setResultado({ clave, estado: 'listo', datos: evaluarResumen(datos, desde, hasta) });
    }).catch(() => { if (vigente) setResultado({ clave, estado: 'error' }); });
    return () => { vigente = false; };
  }, [usuarioId, desde, hasta, revision, clave]);
  if (resultado.clave !== clave || resultado.estado === 'cargando') return <div className="resumen-carga" role="status"><p>Cargando tu resumen...</p><div className="resumen-carga__principal"><span /><span /><span /></div><div className="resumen-carga__bloques"><span /><span /></div></div>;
  if (resultado.estado === 'error') return <div role="alert"><p>No pudimos consultar tu resumen.</p><button type="button" onClick={() => { setResultado({ clave, estado: 'cargando' }); setRevision((valor) => valor + 1); }}>Reintentar</button></div>;
  const datos = resultado.datos;
  return <div className="resumen-vista">
    <section className="resumen-principal"><small>UNA MIRADA A TU MES</small><h2>¿Qué nos cuentan tus registros?</h2><p>Una mirada a tu actividad durante los últimos 30 días.</p><div className="resumen-cifras">{[[datos.registrados, 'Días registrados'], [datos.conApuestas, 'Días con apuestas'], [datos.sinApostar, 'Días sin apostar']].map(([cantidad, etiqueta]) => <div key={etiqueta}><strong>{cantidad}</strong><span>{etiqueta}</span></div>)}</div><p>{datos.observaciones.length ? 'Encontramos aspectos que vale la pena conocer mejor.' : 'Este resumen muestra lo que compartiste en tus registros.'}</p></section>
    {datos.recurrentes.length > 0 && <section><h2>Hay situaciones que se repiten</h2><p>Estas son las que aparecieron en tus registros durante los últimos 30 días.</p><div className="resumen-recurrentes">{datos.recurrentes.map((item) => <article key={item.codigo}><h3>{item.nombre}</h3><strong>{item.cantidad}</strong><span> de {datos.registrados} días registrados</span><progress max={datos.registrados} value={item.cantidad} /></article>)}</div><p>Las situaciones son opcionales: no seleccionarlas no significa que no hayan ocurrido.</p></section>}
    {datos.observaciones.length > 0 ? <section><h2>Situaciones que merecen tu atención</h2><div className="resumen-observaciones">{datos.observaciones.map((item) => {
      const tiempo = item.tipo === 'tiempo';
      const textos = explicaciones[item.codigo] ?? [item.nombre, 'Observar cuándo aparece esta situación puede ayudarte a comprender mejor tus decisiones.', 'Podés consultar Prevención y hablar con alguien de confianza.'];
      return <article key={item.id} className={`resumen-observacion resumen-observacion--${item.nivel}`}><header><small>{item.nivel === 'especial' ? 'ESPECIAL ATENCIÓN' : 'MERECE ATENCIÓN'}</small><h3>{tiempo ? 'El tiempo que dedicás a las apuestas' : textos[0]}</h3><strong>{tiempo ? formatearDuracion(item.cantidad) : `${item.cantidad} días`}</strong></header><div><h4>¿Qué notamos?</h4><p>{tiempo ? `En ${item.base} días con duración informada, el promedio fue ${formatearDuracion(item.cantidad)}.` : `Mencionaste esta situación en ${item.cantidad} de tus ${item.base} días registrados.`}</p><h4>¿Por qué merece atención?</h4><p>{tiempo ? 'Vale la pena mirar cuánto espacio ocupa esta actividad en tu día y si desplaza otras cosas que disfrutás o necesitás hacer.' : textos[1]}</p><p className="resumen-orientacion">{tiempo ? 'Podés conocer herramientas de desconexión y hablar con alguien de confianza.' : textos[2]}</p></div></article>;
    })}</div></section> : <section className="resumen-vacio"><h2>{!datos.suficienciaSituaciones ? 'Tu resumen empieza a tomar forma' : 'Una mirada a tu mes'}</h2><p>{!datos.suficienciaSituaciones ? 'Todavía tenemos poca información para reconocer situaciones que se repiten.' : 'En los registros disponibles no encontramos situaciones que cumplan las condiciones para generar una observación específica.'}</p><Link to="/mi-actividad">Ir a Mi actividad →</Link></section>}
    <section><h2>¿Qué podés hacer a partir de ahora?</h2><div className="resumen-recursos"><Link to="/prevencion"><strong>Informate</strong><span>Conocé más sobre las apuestas y tus decisiones.</span>Explorá Prevención →</Link><Link to="/escudo-digital"><strong>Protegé tu entorno</strong><span>Encontrá herramientas de desconexión y recursos de ayuda.</span>Escudo digital →</Link></div></section>
    <p>Este resumen se basa únicamente en tus registros personales. Es una herramienta de orientación, no un diagnóstico.</p>
  </div>;
}
