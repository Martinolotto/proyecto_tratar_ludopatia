/*
 * Presenta el calendario, los registros y las reflexiones recibidas de la página.
 * La selección sincroniza calendario, lista y detalle sin modificar datos privados.
 */
import { HeatCalendar } from "../../../components/HeatCalendar/HeatCalendar.jsx";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import "./HistorialVista.css";

const fechaComoDate = (fecha) => new Date(`${fecha}T12:00:00Z`);
const formatearFecha = (fecha, opciones) => new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  ...opciones,
}).format(fechaComoDate(fecha));
const fechaLarga = (fecha) => formatearFecha(fecha, {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});
const moneda = (valor) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", minimumFractionDigits: 2,
}).format(valor);
const cantidad = (valor) => new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
}).format(valor);
const hayValor = (valor) => valor !== null && valor !== undefined;

// El calendario mensual usa una lectura de fechas propia, independiente de los filtros.
function Calendario({ mes, desdeMes, hastaMes, fechasMes, estadoMes, seleccion, onSeleccionar,
  onAnterior, onSiguiente, puedeAnterior, puedeSiguiente, onReintentar }) {
  const tituloMes = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(fechaComoDate(`${mes}-01`));
  return (
    <section className="historial-card historial-calendario" aria-labelledby="historial-calendario-titulo">
      <div className="historial-calendario__mes">
        <h2 id="historial-calendario-titulo">{tituloMes}</h2>
        <div className="historial-calendario__flechas">
          <button type="button" aria-label="Mes anterior" onClick={onAnterior} disabled={!puedeAnterior}><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" aria-label="Mes siguiente" onClick={onSiguiente} disabled={!puedeSiguiente}><ChevronRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      {estadoMes === "cargando" && <p role="status">Cargando el calendario...</p>}
      {estadoMes === "error" && <div role="alert"><p>No pudimos cargar el calendario.</p><button type="button" className="historial-enlace" onClick={onReintentar}>Reintentar</button></div>}
      {estadoMes === "listo" && <HeatCalendar mes={mes} desde={desdeMes} hasta={hastaMes}
        fechasRegistradas={fechasMes} seleccion={seleccion} onSeleccionar={onSeleccionar} />}
    </section>
  );
}

function Detalle({ fecha, registro, hoy, fueraDelPeriodo, estado, onReintentar }) {
  // Solo se listan valores presentes. Los omitidos se mencionan juntos, nunca como cero.
  const campos = registro ? [
    { nombre: "Ganas de apostar", valor: hayValor(registro.tuvo_ganas) ? (registro.tuvo_ganas ? "Sí" : "No") : null },
    { nombre: "Tiempo", valor: hayValor(registro.tiempo_valor) ? `${cantidad(registro.tiempo_valor)} ${registro.tiempo_unidad || ""}` : null },
    { nombre: "Cantidad de apuestas", valor: hayValor(registro.cantidad_apuestas) ? cantidad(registro.cantidad_apuestas) : null },
    { nombre: "Dinero apostado", valor: hayValor(registro.dinero_apostado) ? moneda(registro.dinero_apostado) : null },
    { nombre: "Dinero perdido", valor: hayValor(registro.dinero_perdido) ? moneda(registro.dinero_perdido) : null },
  ] : [];
  const presentes = campos.filter((campo) => campo.valor !== null);
  const omitidos = campos.filter((campo) => campo.valor === null);

  return (
    <aside className="historial-card historial-detalle" aria-labelledby="historial-detalle-titulo" aria-live="polite">
      <p className="historial-eyebrow">DÍA SELECCIONADO</p>
      <h2 id="historial-detalle-titulo">Tu día en detalle</h2>
      {!fecha ? (
        <p>Elegí un día para ver lo que registraste.</p>
      ) : (
        <>
          <p className="historial-detalle__fecha">{fechaLarga(fecha)}</p>
          {fueraDelPeriodo && <p className="historial-detalle__fuera">Fuera del período seleccionado</p>}
          {estado === "cargando" && <p role="status">Cargando el detalle...</p>}
          {estado === "error" && <div role="alert"><p>No pudimos cargar este día.</p><button type="button" className="historial-enlace" onClick={onReintentar}>Reintentar</button></div>}
          {estado === "listo" && (registro ? (
            <>
              <p className="historial-detalle__declaracion">
                {registro.aposto ? "Declaraste apuestas" : "Declaraste que no apostaste"}
              </p>
              {presentes.length > 0 && (
                <dl className="historial-detalle__datos">
                  {presentes.map((campo) => (
                    <div key={campo.nombre}>
                      <dt>{campo.nombre}</dt><dd>{campo.valor}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {omitidos.length > 0 && (
                <p className="historial-detalle__omitidos">
                  No informado: {omitidos.map((campo) => campo.nombre.toLowerCase()).join(", ")}.
                </p>
              )}
              <div className="historial-detalle__seccion">
                <strong>Situaciones seleccionadas</strong>
                {registro.conductas?.length ? (
                  <ul>{registro.conductas.map((conducta) => <li key={conducta.codigo}>{conducta.nombre}</li>)}</ul>
                ) : <p>No seleccionaste situaciones.</p>}
              </div>
              {registro.observacion?.trim() && (
                <div className="historial-detalle__seccion">
                  <strong>Tu nota</strong>
                  <p className="historial-texto-personal">{registro.observacion}</p>
                </div>
              )}
            </>
          ) : <p>No hay información para este día.</p>)}
          {estado === "listo" && fecha === hoy && (
            <Link className="historial-enlace" to="/mi-actividad">
              {registro ? "Ir a Mi actividad" : "Registrar mi día"}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </>
      )}
    </aside>
  );
}

function Reflexiones({ notas, notasEstado, mostrarTodas, onVerTodas, onVolverNotas, cargarMasNotas, hayMasNotas }) {
  return (
    <section className="historial-reflexiones" aria-labelledby="historial-reflexiones-titulo">
      <div className="historial-card__encabezado">
        <div>
          <p className="historial-eyebrow"><NotebookPen size={16} aria-hidden="true" /> TUS PALABRAS</p>
          <h2 id="historial-reflexiones-titulo">Tus reflexiones {mostrarTodas ? "guardadas" : "recientes"}</h2>
        </div>
        {mostrarTodas ? (
          <button className="historial-enlace" type="button" onClick={onVolverNotas}>Volver a recientes</button>
        ) : (
          <button className="historial-enlace" type="button" onClick={onVerTodas}>
            Ver todas <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="historial-card__ayuda">Tus notas de cualquier fecha, en un espacio privado.</p>
      {(notasEstado === "cargando" || notasEstado === "cargando-mas") && <p role="status">Cargando tus reflexiones...</p>}
      {(notasEstado === "error" || notasEstado === "error-mas") && <p role="alert">No pudimos cargar tus reflexiones. Intentá nuevamente.</p>}
      {notasEstado !== "cargando" && notas.length === 0 && notasEstado !== "error" && (
        <p>Aún no agregaste notas a tus registros.</p>
      )}
      {/* details conserva una interacción nativa de apertura por teclado. */}
      <div className="historial-notas">
        {notas.map((nota) => (
          <details className="historial-nota" key={nota.fecha}>
            <summary><span>{fechaLarga(nota.fecha)}</span><span aria-hidden="true">+</span></summary>
            <p className="historial-texto-personal">{nota.observacion}</p>
          </details>
        ))}
      </div>
      {(notasEstado === "error" || notasEstado === "error-mas") && (
        <button type="button" className="historial-enlace" onClick={cargarMasNotas}>Reintentar</button>
      )}
      {mostrarTodas && hayMasNotas && notasEstado !== "cargando" && notasEstado !== "cargando-mas" && notasEstado !== "error-mas" && (
        <button type="button" className="historial-enlace" onClick={cargarMasNotas}>Cargar más reflexiones</button>
      )}
    </section>
  );
}

export function HistorialVista({
  hoy, registros = [], fechaSeleccionada, onSeleccionarFecha,
  mes, desdeMes, hastaMes, fechasMes, estadoMes, onReintentarMes,
  onMesAnterior, onMesSiguiente, puedeMesAnterior, puedeMesSiguiente,
  registroSeleccionado, estadoDetalle, fueraDelPeriodo, onReintentarDetalle,
  notas = [], notasEstado = "listo", mostrarTodas = false, onVerTodas,
  onVolverNotas, cargarMasNotas, hayMasNotas = false,
}) {
  const historial = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <div className="historial-vista">
      <div className="historial-vista__principal">
        <div className="historial-vista__explorar">
          <Calendario mes={mes} desdeMes={desdeMes} hastaMes={hastaMes} fechasMes={fechasMes}
            estadoMes={estadoMes} seleccion={fechaSeleccionada} onSeleccionar={onSeleccionarFecha}
            onAnterior={onMesAnterior} onSiguiente={onMesSiguiente} puedeAnterior={puedeMesAnterior}
            puedeSiguiente={puedeMesSiguiente} onReintentar={onReintentarMes} />
          <section className="historial-lista" aria-labelledby="historial-lista-titulo">
            <div className="historial-card__encabezado">
              <div>
                <p className="historial-eyebrow">LO QUE REGISTRASTE</p>
                <h2 id="historial-lista-titulo">Tus días</h2>
              </div>
              <span className="historial-etiqueta">
                {historial.length} {historial.length === 1 ? "registro" : "registros"}
              </span>
            </div>
            {historial.length ? (
              <ul>
                {historial.map((registro) => (
                  <li key={registro.fecha}>
                    <button
                      type="button"
                      aria-pressed={registro.fecha === fechaSeleccionada}
                      onClick={() => onSeleccionarFecha(registro.fecha)}
                    >
                      <span>
                        <strong>{fechaLarga(registro.fecha)}</strong>
                        <small>{registro.aposto ? "Declaraste apuestas" : "Declaraste que no apostaste"}</small>
                      </span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p>Todavía no hay registros en este período.</p>}
          </section>
        </div>
        <Detalle fecha={fechaSeleccionada} registro={registroSeleccionado} hoy={hoy}
          fueraDelPeriodo={fueraDelPeriodo} estado={estadoDetalle} onReintentar={onReintentarDetalle} />
      </div>
      <Reflexiones
        notas={notas}
        notasEstado={notasEstado}
        mostrarTodas={mostrarTodas}
        onVerTodas={onVerTodas}
        onVolverNotas={onVolverNotas}
        cargarMasNotas={cargarMasNotas}
        hayMasNotas={hayMasNotas}
      />
    </div>
  );
}
