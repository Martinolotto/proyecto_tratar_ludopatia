/*
 * Visualizaciones de Mi historial: adapta las composiciones de barras y líneas
 * de shadcn/ui a Recharts y a los registros privados ya consultados por la página.
 * Los diálogos de valores diarios permiten consultar y seleccionar fechas con teclado.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularMetricasHistorial } from "./metricasHistorial.js";
import { ValoresDiariosModal } from "./ValoresDiariosModal.jsx";
import {
  formatearCantidad, formatearDuracion, formatearEjeMoneda, formatearEjeTiempo,
  formatearFechaCorta, formatearMoneda, formatearPorcentaje,
} from "./formatosMetricas.js";
import "./MetricasHistorial.css";

const columnas = {
  apostado: { clave: "apostado", etiqueta: "Apostado", formatear: formatearMoneda },
  perdido: { clave: "perdido", etiqueta: "Perdido", formatear: formatearMoneda },
  minutos: { clave: "minutos", etiqueta: "Duración", formatear: formatearDuracion },
  cantidad: { clave: "cantidad", etiqueta: "Apuestas", formatear: formatearCantidad },
};
const colores = { apostado: "#357bb7", perdido: "#c77a43", minutos: "#7464ad", cantidad: "#277974" };

function TooltipDiario({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="metricas-tooltip">
      {payload.map(({ dataKey, value }) => (
        <div key={dataKey}>
          <span>{columnas[dataKey].etiqueta}</span>
          <strong>{columnas[dataKey].formatear(value)}</strong>
        </div>
      ))}
    </div>
  );
}

function MensajeVacio({ children }) {
  return <p className="metricas-vacio">{children}</p>;
}

function GraficoDias({ titulo, descripcion, dias, desde, hasta, claves, tipo = "barras", onSeleccionarFecha, onConsultarDetalle }) {
  const hayDatos = dias.some((dia) => claves.some((clave) => dia[clave] !== null));
  const esMoneda = claves.includes("apostado") || claves.includes("perdido");
  // El eje conserva todas las fechas; null deja un hueco y 0 es un valor declarado.
  const alSeleccionar = (estado) => {
    // Recharts 3 expone el índice activo, no activePayload en este evento.
    const indice = estado?.activeTooltipIndex;
    const fecha = indice == null ? undefined : dias[Number(indice)]?.fecha;
    if (fecha) onSeleccionarFecha(fecha);
  };
  return (
    <section className={`metricas-grafico metricas-grafico--${tipo}`}>
      <div className="metricas-grafico__cabecera"><div><h3>{titulo}</h3><p>{descripcion}</p></div></div>
      {hayDatos ? (
        <>
          <div className="metricas-grafico__leyenda">{claves.map((clave) => <span key={clave}><i style={{ backgroundColor: colores[clave] }} aria-hidden="true" />{columnas[clave].etiqueta}</span>)}</div>
          <div className="metricas-grafico__lienzo" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              {tipo === "linea" ? (
                <LineChart accessibilityLayer={false} data={dias} onClick={alSeleccionar} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e3ebe8" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={24} tick={{ fontSize: 12 }} />
                  <YAxis width={65} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={formatearEjeTiempo} />
                  <Tooltip content={<TooltipDiario />} isAnimationActive={false} />
                  <Line type="monotone" dataKey={claves[0]} stroke={colores[claves[0]]} strokeWidth={3}
                    dot={({ cx, cy, payload }) => Number.isFinite(cx) && Number.isFinite(cy) ? (
                      <circle key={payload.fecha} cx={cx} cy={cy} r={4} fill="#fff" stroke={colores[claves[0]]} strokeWidth={2}
                        onClick={(evento) => { evento.stopPropagation(); onSeleccionarFecha(payload.fecha); }} />
                    ) : null} connectNulls={false} isAnimationActive={false} />
                </LineChart>
              ) : (
                <BarChart accessibilityLayer={false} data={dias} onClick={alSeleccionar} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e3ebe8" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={24} tick={{ fontSize: 12 }} />
                  <YAxis width={65} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={esMoneda ? formatearEjeMoneda : formatearCantidad} />
                  <Tooltip content={<TooltipDiario />} isAnimationActive={false} />
                  {claves.map((clave) => <Bar key={clave} onClick={(barra, _indice, evento) => { evento.stopPropagation(); if (barra?.payload?.fecha) onSeleccionarFecha(barra.payload.fecha); }} dataKey={clave} fill={colores[clave]} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      ) : <MensajeVacio>Todavía no hay valores informados para este período.</MensajeVacio>}
      <ValoresDiariosModal titulo={titulo} desde={desde} hasta={hasta} unidad={esMoneda ? "ARS" : undefined}
        dias={dias} columnas={claves.map((clave) => columnas[clave])}
        onSeleccionarFecha={onConsultarDetalle ?? onSeleccionarFecha} />
    </section>
  );
}

export function MetricasHistorial({ registros, desde, hasta, onSeleccionarFecha, onConsultarDetalle }) {
  const [series, setSeries] = useState("ambas");
  const metricas = useMemo(() => calcularMetricasHistorial(registros, desde, hasta), [registros, desde, hasta]);
  const clavesDinero = series === "ambas" ? ["apostado", "perdido"] : [series];
  const frecuencia = metricas.registrados
    ? `${metricas.declararonApuestas} de ${metricas.registrados} días (${formatearPorcentaje(metricas.declararonApuestas / metricas.registrados)})`
    : "Sin datos";
  return (
    <div className="metricas-historial">
      <h2 className="sr-only">Métricas de tu actividad</h2>
      <div className="metricas-resumen" aria-label="Resumen del período">
        <article><span>Días registrados</span><strong>{metricas.registrados}</strong><small>En el período elegido</small></article>
        <article><span>Frecuencia declarada</span><strong>{frecuencia}</strong><small>Días con apuestas / registrados</small></article>
        <article><span>Dinero apostado</span><strong>{formatearMoneda(metricas.apostado.valor)}</strong><small>Promedio: {formatearMoneda(metricas.apostado.promedio)} · {metricas.apostado.base} días informados</small></article>
        <article><span>Dinero perdido</span><strong>{formatearMoneda(metricas.perdido.valor)}</strong><small>Promedio: {formatearMoneda(metricas.perdido.promedio)} · {metricas.perdido.base} días informados</small></article>
      </div>
      <div className="metricas-economia">
        <div className="metricas-economia__principal">
          <div className="metricas-selector" role="group" aria-label="Series de dinero">
            {[["ambas", "Ambas"], ["apostado", "Apostado"], ["perdido", "Perdido"]].map(([clave, nombre]) => <button key={clave} type="button" aria-pressed={series === clave} onClick={() => setSeries(clave)}>{nombre}</button>)}
          </div>
          <GraficoDias titulo="Dinero declarado" descripcion="Importes por día, expresados en pesos argentinos." dias={metricas.dias} desde={desde} hasta={hasta} claves={clavesDinero} onSeleccionarFecha={onSeleccionarFecha} onConsultarDetalle={onConsultarDetalle} />
        </div>
        <aside className="metricas-contexto">
          <h3>Para observar</h3>
          {metricas.registrados > 0 ? <p>En base a tus registros, notamos que declaraste apuestas en {metricas.declararonApuestas} de {metricas.registrados} días registrados durante este período. Podés explorar tus datos con calma y conocer más sobre cómo funcionan las apuestas.</p> : <p>Cuando registres tu actividad, acá vas a poder observar un resumen de lo que compartiste.</p>}
          {metricas.concentracion && <p>Los días {metricas.concentracion.fechas.map(formatearFechaCorta).join(" y ")} reúnen el {formatearPorcentaje(metricas.concentracion.proporcion)} del dinero {metricas.concentracion.clave} informado en {metricas.concentracion.base} días.</p>}
          <Link to="/prevencion" className="metricas-contexto__enlace">Explorar recursos de Prevención →</Link>
        </aside>
      </div>
      <div className="metricas-dos-columnas">
        <GraficoDias titulo="Tiempo dedicado" descripcion={`Promedio: ${formatearDuracion(metricas.minutos.promedio)} · ${metricas.minutos.base} días informados.`} dias={metricas.dias} desde={desde} hasta={hasta} claves={["minutos"]} tipo="linea" onSeleccionarFecha={onSeleccionarFecha} onConsultarDetalle={onConsultarDetalle} />
        <GraficoDias titulo="Cantidad de apuestas" descripcion={`Promedio: ${formatearCantidad(metricas.cantidad.promedio)} · ${metricas.cantidad.base} días informados.`} dias={metricas.dias} desde={desde} hasta={hasta} claves={["cantidad"]} onSeleccionarFecha={onSeleccionarFecha} onConsultarDetalle={onConsultarDetalle} />
      </div>
      <div className="metricas-dos-columnas metricas-dos-columnas--patrones">
        <section className="metricas-grafico"><h3>Frecuencia por día</h3><p>Días con apuestas sobre días registrados.</p>{metricas.registrados ? <ul className="metricas-semana">{metricas.semana.map((dia) => <li key={dia.nombre}><span>{dia.nombre}</span><strong>{dia.registrados ? `${dia.apuestas}/${dia.registrados}` : "Sin registro"}</strong><i aria-hidden="true"><b style={{ width: `${dia.registrados ? dia.apuestas / dia.registrados * 100 : 0}%` }} /></i></li>)}</ul> : <MensajeVacio>Todavía no hay días registrados en este período.</MensajeVacio>}{metricas.distribucion && <p className="metricas-observacion">Entre los días de la semana con al menos dos registros, {metricas.distribucion[0].nombre} tuvo {metricas.distribucion[0].apuestas} declaraciones de apuestas en {metricas.distribucion[0].registrados} registros; {metricas.distribucion[1].nombre}, {metricas.distribucion[1].apuestas} en {metricas.distribucion[1].registrados}.</p>}</section>
        <section className="metricas-grafico"><h3>Situaciones declaradas</h3><p>Veces que seleccionaste cada situación.</p>{metricas.situaciones.length ? <ul className="metricas-situaciones">{metricas.situaciones.map((situacion) => <li key={situacion.codigo}><span>{situacion.nombre}</span><strong>{situacion.cantidad}</strong><i aria-hidden="true"><b style={{ width: `${situacion.cantidad / metricas.registrados * 100}%` }} /></i></li>)}</ul> : <MensajeVacio>No seleccionaste situaciones en este período.</MensajeVacio>}{metricas.repetida && <p className="metricas-observacion">«{metricas.repetida.nombre}» apareció en {metricas.repetida.cantidad} de {metricas.registrados} días registrados ({metricas.repetida.fechas.map(formatearFechaCorta).join(", ")}). La selección de situaciones es opcional.{metricas.repetida.codigo === "recuperar_perdidas" && <> <Link to="/prevencion">Explorar contenidos de Prevención</Link></>}</p>}</section>
      </div>
    </div>
  );
}
