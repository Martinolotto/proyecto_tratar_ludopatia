/* Vista de participación y reconocimientos calculados desde registros privados. */
import { Award, Flag, Flame, Footprints, Medal, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../../lib/supabase.js';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { calcularAvances, contarMedidas, HITOS } from './avancesCalculos.js';
import './AvancesVista.css';

// Adaptado de Achievement Badge de Trophy UI (MIT): icono y estado conseguido/pendiente.
// Fuente: https://ui.trophy.so/r/achievement-badge.json
const ICONOS = [Footprints, Flag, Sparkles, Medal, Trophy];
function Insignia({ hito, index, conseguida }) {
  const Icono = ICONOS[index];
  return <li className={`avance-insignia ${conseguida ? 'avance-insignia--lograda' : ''}`}>
    <span className="avance-insignia__icono" aria-hidden="true"><Icono size={26} /></span>
    <strong>{hito.nombre}</strong>
      <span>{hito.dias} {hito.dias === 1 ? 'día registrado' : 'días registrados'}</span>
    <small>{conseguida ? 'Conseguida' : 'Pendiente'}</small>
    {hito.dias === 7 && <small>No necesariamente consecutivos</small>}
  </li>;
}

// Adaptado de Milestone Chart de BigBull UI (MIT); el avance es por días, no por número de hitos.
// Fuente: https://github.com/F0Rextasy/bigbullui/blob/main/src/components/ui/milestone-chart.tsx
function Camino({ total, progreso, siguiente }) {
  return <div className="avance-camino">
    <div className="avance-camino__pista" role="progressbar" aria-label="Progreso hacia la próxima insignia" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
      <span style={{ width: `${progreso}%` }} />
    </div>
    <div className="avance-camino__hitos"><span>{siguiente ? `${total} de ${siguiente.dias} registros · ${siguiente.nombre}` : `${total} registros acumulados`}</span><span>{progreso}%</span></div>
    <p>{siguiente ? `Te ${siguiente.dias - total === 1 ? 'falta 1 día registrado' : `faltan ${siguiente.dias - total} días registrados`} para ${siguiente.nombre}.` : '¡Completaste todas las insignias disponibles!'}</p>
  </div>;
}

export function AvancesVista({ registrosPeriodo, registrosHistoricos, desde, hasta, hoy, usuarioId }) {
  const [medidas, setMedidas] = useState({ cuenta: null, estado: 'cargando', total: 0 });
  useEffect(() => {
    let vigente = true;
    async function consultar() {
      const { data, error } = await supabase.from('medidas_usuario').select('medida_id,realizada').eq('usuario_id', usuarioId);
      if (vigente) setMedidas(error ? { cuenta: usuarioId, estado: 'error', total: 0 } : { cuenta: usuarioId, estado: 'listo', total: contarMedidas(data ?? []) });
    }
    if (usuarioId) consultar();
    return () => { vigente = false; };
  }, [usuarioId]);
  const datos = calcularAvances({ registrosPeriodo, registrosHistoricos, desde, hasta, hoy });
  return <div className="avances-vista">
    <section className="avance-participacion" aria-labelledby="avance-participacion-titulo">
      <div><p className="avance-etiqueta">EN ESTE PERÍODO</p>
      <h2 id="avance-participacion-titulo">Tu participación</h2>
      <strong className="avance-fraccion">{datos.registrados} de {datos.diasPosibles} días</strong>
      <p>Registraste tu actividad durante este período.</p>
      <div className="avance-racha"><span><Flame size={18} aria-hidden="true" /> Tu racha actual</span>
        <strong>{datos.rachaRegistro.actual} {datos.rachaRegistro.actual === 1 ? 'día consecutivo' : 'días consecutivos'}</strong>
        <small>{datos.rachaRegistro.actual ? `¡Felicitaciones! Llevás ${datos.rachaRegistro.actual} ${datos.rachaRegistro.actual === 1 ? 'día' : 'días'} registrando tu actividad.` : 'Cada registro suma a tu recorrido.'}{datos.hoyPendiente && datos.rachaRegistro.actual > 0 ? ' Hoy todavía está pendiente.' : ''}</small>
      </div>
      </div>
      <div className="avance-radial" aria-label={`${datos.porcentaje}% de días registrados`}><ResponsiveContainer width="100%" height="100%"><RadialBarChart accessibilityLayer={false} innerRadius="72%" outerRadius="100%" barSize={14} data={[{ valor: datos.porcentaje }]} startAngle={90} endAngle={-270}><PolarAngleAxis type="number" domain={[0, 100]} tick={false} /><RadialBar dataKey="valor" background fill="#2a7774" cornerRadius={10} /></RadialBarChart></ResponsiveContainer><strong>{datos.porcentaje}%</strong>
      </div>
    </section>
    <section className="avance-recorrido"><div><p className="avance-etiqueta">TU RECORRIDO</p>
      <h2>Cada registro suma</h2>
      <p>Todos los días registrados, sean consecutivos o no.</p>
      </div>
      <div className="avance-total"><strong>{datos.total}</strong>
      <span>{datos.total === 1 ? 'día registrado en total' : 'días registrados en total'}</span>
      </div>
      </section>
    <section className="avance-continuidad" aria-labelledby="avance-continuidad-titulo"><div><p className="avance-etiqueta">DÍAS DECLARADOS</p>
      <h2 id="avance-continuidad-titulo">Continuidad sin apostar</h2>
      <p>Solo se cuentan los días que declaraste expresamente.</p>
      </div>
      <div className="avance-indicadores"><div><strong>{datos.sinApostar}</strong>
      <span>En este período</span>
      </div>
      <div><strong>{datos.actual}</strong>
      <span>Días consecutivos sin apostar</span>
      </div>
      <div><strong>{datos.maxima}</strong>
      <span>Mayor racha histórica sin apostar</span>
      </div>
      </div>{datos.hoyPendiente && datos.actual > 0 && <p>El registro de hoy está pendiente; tu continuidad se conserva durante el día.</p>}</section>
    <section className="avance-logros" aria-labelledby="avance-logros-titulo"><div className="avance-logros__cabecera"><div><p className="avance-etiqueta"><Award size={15} aria-hidden="true" /> TUS RECONOCIMIENTOS</p>
      <h2 id="avance-logros-titulo">Mirá todo lo que lograste.</h2>
      </div>
      <span>{HITOS.filter((h) => datos.total >= h.dias).length} de {HITOS.length} insignias</span>
      </div>
      <h3>Tu recorrido</h3><p>Se consiguen por días registrados acumulados, sin necesidad de que sean consecutivos.</p>
      <ul className="avance-insignias">{HITOS.map((hito, index) => <Insignia key={hito.dias} hito={hito} index={index} conseguida={datos.total >= hito.dias} />)}</ul><Camino total={datos.total} progreso={datos.progreso} siguiente={datos.siguiente} />
      <div className="avance-grupos"><section><h3>Tu constancia</h3><p>Celebrá los días que dedicaste a registrar tu actividad.</p><div className="avance-nuevos">{[[3, 'Buen comienzo'], [7, 'A tu ritmo'], [14, 'Paso a paso']].map(([dias, nombre]) => <article key={dias} className={datos.rachaRegistro.maxima >= dias ? 'logrado' : ''}><Flame size={19} aria-hidden="true" /><strong>{dias} días seguidos</strong><b>{nombre}</b><small>{datos.rachaRegistro.maxima >= dias ? 'Conseguido' : 'Pendiente'}</small></article>)}</div></section>
      <section><h3>Tu protección</h3><p>Pequeñas acciones para cuidar tu entorno digital.</p>{medidas.cuenta !== usuarioId || medidas.estado === 'cargando' ? <p role="status">Cargando tus medidas...</p> : medidas.estado === 'error' ? <p role="alert">No pudimos consultar tus medidas.</p> : <div className="avance-nuevos">{[[1, 'Primer escudo'], [3, 'Más herramientas']].map(([cantidad, nombre]) => <article key={cantidad} className={medidas.total >= cantidad ? 'logrado' : ''}><ShieldCheck size={19} aria-hidden="true" /><b>{nombre}</b><strong>{cantidad}</strong><span>{cantidad === 1 ? 'Medida declarada' : 'Medidas declaradas'}</span><small>{medidas.total >= cantidad ? 'Conseguido' : 'Pendiente'}</small></article>)}</div>}<Link to="/escudo-digital">Explorá las herramientas de Escudo digital →</Link></section></div></section>
  </div>;
}
