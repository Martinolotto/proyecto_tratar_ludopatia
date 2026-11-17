/* Vista de participación y reconocimientos calculados desde registros privados. */
import { Award, Flag, Footprints, Medal, Sparkles, Trophy } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { calcularAvances, HITOS } from './avancesCalculos.js';
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
function Camino({ total, previo, progreso, siguiente }) {
  return <div className="avance-camino">
    <div className="avance-camino__pista" role="progressbar" aria-label="Progreso hacia la próxima insignia" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
      <span style={{ width: `${progreso}%` }} />
    </div>
    <div className="avance-camino__hitos"><span>Desde {previo} {previo === 1 ? 'registro' : 'registros'}</span><span>{siguiente ? `Objetivo: ${siguiente.dias}` : `${total} registros acumulados`}</span></div>
    <p>{siguiente ? `Te ${siguiente.dias - total === 1 ? 'falta 1 día registrado' : `faltan ${siguiente.dias - total} días registrados`} para ${siguiente.nombre}.` : '¡Completaste todas las insignias disponibles!'}</p>
  </div>;
}

export function AvancesVista({ registrosPeriodo, registrosHistoricos, desde, hasta, hoy }) {
  const datos = calcularAvances({ registrosPeriodo, registrosHistoricos, desde, hasta, hoy });
  return <div className="avances-vista">
    <section className="avance-participacion" aria-labelledby="avance-participacion-titulo">
      <div><p className="avance-etiqueta">EN ESTE PERÍODO</p>
      <h2 id="avance-participacion-titulo">Tu participación</h2>
      <p>Una mirada a los días que elegiste registrar.</p>
      <strong className="avance-fraccion">{datos.registrados} de {datos.diasPosibles} días</strong>
      <p>{datos.hoyPendiente && hasta === hoy ? 'El registro de hoy está pendiente.' : 'Cada registro cuenta en tu recorrido.'}</p>
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
      <span>Racha actual</span>
      </div>
      <div><strong>{datos.maxima}</strong>
      <span>Mayor racha histórica</span>
      </div>
      </div>{datos.hoyPendiente && datos.actual > 0 && <p>El registro de hoy está pendiente; tu continuidad se conserva durante el día.</p>}</section>
    <section className="avance-logros" aria-labelledby="avance-logros-titulo"><div className="avance-logros__cabecera"><div><p className="avance-etiqueta"><Award size={15} aria-hidden="true" /> TUS RECONOCIMIENTOS</p>
      <h2 id="avance-logros-titulo">Tu recorrido tiene huellas</h2>
      </div>
      <span>{HITOS.filter((h) => datos.total >= h.dias).length} de {HITOS.length} insignias</span>
      </div>
      <p>Se consiguen por días registrados acumulados, sin necesidad de que sean consecutivos.</p>
      <ul className="avance-insignias">{HITOS.map((hito, index) => <Insignia key={hito.dias} hito={hito} index={index} conseguida={datos.total >= hito.dias} />)}</ul><h3>{datos.siguiente ? `Próximo paso: ${datos.siguiente.nombre}` : 'Tu recorrido continúa'}</h3><Camino total={datos.total} previo={datos.previo} progreso={datos.progreso} siguiente={datos.siguiente} /></section>
  </div>;
}
