/*
 * Visualizaciones de Mi historial: adapta las composiciones de barras y líneas
 * de shadcn/ui a Recharts y a los registros privados ya consultados por la página.
 * Las tablas desplegables permiten consultar y seleccionar fechas con teclado.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularMetricasHistorial } from "./metricasHistorial.js";
import "./MetricasHistorial.css";

const formatoNumero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const formatoMoneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
const valor = (numero, formato = formatoNumero) => numero === null ? "Sin dato" : formato.format(numero);
const fechaCorta = (fecha) => new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
const unidades = { apostado: "Apostado", perdido: "Perdido", minutos: "Minutos", cantidad: "Apuestas" };

function TablaDias({ dias, columnas, onSeleccionarFecha }) {
  return (
    <details className="metricas-tabla">
      <summary>Ver valores por día</summary>
      <div className="metricas-tabla__scroll">
        <table>
          <thead><tr><th>Fecha</th>{columnas.map((clave) => <th key={clave}>{unidades[clave]}</th>)}</tr></thead>
          <tbody>{dias.map((dia) => (
            <tr key={dia.fecha}>
              <th><button type="button" onClick={() => onSeleccionarFecha(dia.fecha)}>{fechaCorta(dia.fecha)}</button></th>
              {columnas.map((clave) => <td key={clave}>{dia.registrado ? valor(dia[clave], clave === "apostado" || clave === "perdido" ? formatoMoneda : formatoNumero) : "Sin registro"}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </details>
  );
}

function MensajeVacio({ children }) {
  return <p className="metricas-vacio">{children}</p>;
}

function GraficoDias({ titulo, descripcion, dias, claves, tipo = "barras", onSeleccionarFecha }) {
  const hayDatos = dias.some((dia) => claves.some((clave) => dia[clave] !== null));
  const colores = { apostado: "#357bb7", perdido: "#c77a43", minutos: "#7464ad", cantidad: "#277974" };
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
          <div className="metricas-grafico__leyenda">{claves.map((clave) => <span key={clave}><i style={{ backgroundColor: colores[clave] }} aria-hidden="true" />{unidades[clave]}</span>)}</div>
          <div className="metricas-grafico__lienzo" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              {tipo === "linea" ? (
                <LineChart accessibilityLayer={false} data={dias} onClick={alSeleccionar} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e3ebe8" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={24} tick={{ fontSize: 11 }} />
                  <YAxis width={42} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(_, datos) => datos?.[0]?.payload?.fecha ? fechaCorta(datos[0].payload.fecha) : ""} formatter={(v, nombre) => [valor(v), unidades[nombre]]} />
                  <Line type="monotone" dataKey={claves[0]} stroke={colores[claves[0]]} strokeWidth={3}
                    dot={({ cx, cy, payload }) => Number.isFinite(cx) && Number.isFinite(cy) ? (
                      <circle key={payload.fecha} cx={cx} cy={cy} r={4} fill="#fff" stroke={colores[claves[0]]} strokeWidth={2}
                        onClick={(evento) => { evento.stopPropagation(); onSeleccionarFecha(payload.fecha); }} />
                    ) : null} connectNulls={false} isAnimationActive={false} />
                </LineChart>
              ) : (
                <BarChart accessibilityLayer={false} data={dias} onClick={alSeleccionar} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e3ebe8" strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={24} tick={{ fontSize: 11 }} />
                  <YAxis width={esMoneda ? 65 : 42} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(n) => formatoNumero.format(n)} />
                  <Tooltip labelFormatter={(_, datos) => datos?.[0]?.payload?.fecha ? fechaCorta(datos[0].payload.fecha) : ""} formatter={(v, nombre) => [valor(v, esMoneda ? formatoMoneda : formatoNumero), unidades[nombre]]} />
                  {claves.map((clave) => <Bar key={clave} onClick={(barra, _indice, evento) => { evento.stopPropagation(); if (barra?.payload?.fecha) onSeleccionarFecha(barra.payload.fecha); }} dataKey={clave} fill={colores[clave]} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      ) : <MensajeVacio>Todavía no hay valores informados para este período.</MensajeVacio>}
      <TablaDias dias={dias} columnas={claves} onSeleccionarFecha={onSeleccionarFecha} />
    </section>
  );
}

export function MetricasHistorial({ registros, desde, hasta, onSeleccionarFecha }) {
  const [series, setSeries] = useState("ambas");
  const metricas = useMemo(() => calcularMetricasHistorial(registros, desde, hasta), [registros, desde, hasta]);
  const clavesDinero = series === "ambas" ? ["apostado", "perdido"] : [series];
  const frecuencia = metricas.registrados ? `${metricas.declararonApuestas} de ${metricas.registrados}` : "Sin datos";
  return (
    <div className="metricas-historial">
      <h2 className="sr-only">Métricas de tu actividad</h2>
      <div className="metricas-resumen" aria-label="Resumen del período">
        <article><span>Días registrados</span><strong>{metricas.registrados}</strong><small>En el período elegido</small></article>
        <article><span>Frecuencia declarada</span><strong>{frecuencia}</strong><small>Días con apuestas / registrados</small></article>
        <article><span>Dinero apostado</span><strong>{valor(metricas.apostado.valor, formatoMoneda)}</strong><small>Promedio: {valor(metricas.apostado.promedio, formatoMoneda)} · {metricas.apostado.base} días informados</small></article>
        <article><span>Dinero perdido</span><strong>{valor(metricas.perdido.valor, formatoMoneda)}</strong><small>Promedio: {valor(metricas.perdido.promedio, formatoMoneda)} · {metricas.perdido.base} días informados</small></article>
      </div>
      <div className="metricas-economia">
        <div className="metricas-economia__principal">
          <div className="metricas-selector" role="group" aria-label="Series de dinero">
            {[["ambas", "Ambas"], ["apostado", "Apostado"], ["perdido", "Perdido"]].map(([clave, nombre]) => <button key={clave} type="button" aria-pressed={series === clave} onClick={() => setSeries(clave)}>{nombre}</button>)}
          </div>
          <GraficoDias titulo="Dinero declarado" descripcion="Importes por día, expresados en pesos argentinos." dias={metricas.dias} claves={clavesDinero} onSeleccionarFecha={onSeleccionarFecha} />
        </div>
        <aside className="metricas-contexto"><h3>Para observar</h3>{metricas.concentracion ? <p>Los días {metricas.concentracion.fechas.map(fechaCorta).join(" y ")} reúnen el {Math.round(metricas.concentracion.proporcion * 100)} % del dinero {metricas.concentracion.clave} informado en {metricas.concentracion.base} días.</p> : <p>Los importes omitidos quedan fuera de los totales; apostar y perder se muestran por separado.</p>}</aside>
      </div>
      <div className="metricas-dos-columnas">
        <GraficoDias titulo="Tiempo dedicado" descripcion={`Promedio: ${valor(metricas.minutos.promedio)} min · ${metricas.minutos.base} días informados.`} dias={metricas.dias} claves={["minutos"]} tipo="linea" onSeleccionarFecha={onSeleccionarFecha} />
        <GraficoDias titulo="Cantidad de apuestas" descripcion={`Promedio: ${valor(metricas.cantidad.promedio)} · ${metricas.cantidad.base} días informados.`} dias={metricas.dias} claves={["cantidad"]} onSeleccionarFecha={onSeleccionarFecha} />
      </div>
      <div className="metricas-dos-columnas metricas-dos-columnas--patrones">
        <section className="metricas-grafico"><h3>Frecuencia por día</h3><p>Días con apuestas sobre días registrados.</p>{metricas.registrados ? <ul className="metricas-semana">{metricas.semana.map((dia) => <li key={dia.nombre}><span>{dia.nombre}</span><strong>{dia.registrados ? `${dia.apuestas}/${dia.registrados}` : "Sin registro"}</strong><i aria-hidden="true"><b style={{ width: `${dia.registrados ? dia.apuestas / dia.registrados * 100 : 0}%` }} /></i></li>)}</ul> : <MensajeVacio>Todavía no hay días registrados en este período.</MensajeVacio>}{metricas.distribucion && <p className="metricas-observacion">Entre los días de la semana con al menos dos registros, {metricas.distribucion[0].nombre} tuvo {metricas.distribucion[0].apuestas} declaraciones de apuestas en {metricas.distribucion[0].registrados} registros; {metricas.distribucion[1].nombre}, {metricas.distribucion[1].apuestas} en {metricas.distribucion[1].registrados}.</p>}</section>
        <section className="metricas-grafico"><h3>Situaciones declaradas</h3><p>Veces que seleccionaste cada situación.</p>{metricas.situaciones.length ? <ul className="metricas-situaciones">{metricas.situaciones.map((situacion) => <li key={situacion.codigo}><span>{situacion.nombre}</span><strong>{situacion.cantidad}</strong><i aria-hidden="true"><b style={{ width: `${situacion.cantidad / metricas.registrados * 100}%` }} /></i></li>)}</ul> : <MensajeVacio>No seleccionaste situaciones en este período.</MensajeVacio>}{metricas.repetida && <p className="metricas-observacion">«{metricas.repetida.nombre}» apareció en {metricas.repetida.cantidad} de {metricas.registrados} días registrados ({metricas.repetida.fechas.map(fechaCorta).join(", ")}). La selección de situaciones es opcional.{metricas.repetida.codigo === "recuperar_perdidas" && <> <Link to="/prevencion">Explorar contenidos de Prevención</Link></>}</p>}</section>
      </div>
    </div>
  );
}
