/*
 * Calendario de participación adaptado del Heat Calendar de ssych-ui, revisión
 * 2f5533656732324cf0dbdea2b20c66e0b1d3ec27 (licencia MIT en LICENSE).
 * Recibe días de calendario de MODUS y comunica la selección al historial.
 */
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LiveFigure } from "./LiveFigure.jsx";
import "./HeatCalendar.css";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"].map((nombre, d) => ({ nombre, d }));
const PASOS = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
const DIA_MS = 86400000;
const aFecha = (texto) => new Date(`${texto}T00:00:00Z`);
const aTexto = (fecha) => fecha.toISOString().slice(0, 10);
const sumarDias = (fecha, cantidad) => new Date(fecha.getTime() + cantidad * DIA_MS);
const etiquetaFecha = (fecha) => new Intl.DateTimeFormat("es-AR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
}).format(aFecha(fecha));

// Conserva la disposición original por semanas verticales y la navegación con flechas.
export function HeatCalendar({ mes, desde, hasta, fechasRegistradas, seleccion, onSeleccionar }) {
  const reducido = useReducedMotion();
  const referencia = useRef(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [fechaEnfocada, setFechaEnfocada] = useState(null);
  const { dias, columnas, registrados } = useMemo(() => {
    const [ano, numeroMes] = mes.split("-").map(Number);
    const primero = new Date(Date.UTC(ano, numeroMes - 1, 1));
    const ultimo = new Date(Date.UTC(ano, numeroMes, 0));
    // El original calcula el lunes inicial y una columna por semana completa.
    const inicio = sumarDias(primero, -((primero.getUTCDay() + 6) % 7));
    const semanas = Math.ceil(((ultimo - inicio) / DIA_MS + 1) / 7);
    const columnasMes = Array.from({ length: semanas }, (_, w) => ({ id: `w${w}`, w }));
    const celdas = Array.from({ length: semanas * 7 }, (_, indice) => {
      const fecha = aTexto(sumarDias(inicio, indice));
      return { fecha, visible: fecha.slice(0, 7) === mes && fecha >= desde && fecha <= hasta };
    });
    return { dias: celdas, columnas: columnasMes, registrados: new Set(fechasRegistradas) };
  }, [mes, desde, hasta, fechasRegistradas]);
  const disponibles = dias.filter((dia) => dia.visible);
  const seleccionVisible = disponibles.find((dia) => dia.fecha === seleccion);
  // La última celda enfocada recibe el tabIndex, incluso antes de seleccionarla.
  const focoInicial = disponibles.find((dia) => dia.fecha === fechaEnfocada)?.fecha
    || seleccionVisible?.fecha || disponibles.at(-1)?.fecha;
  const diaMostrado = vistaPrevia && disponibles.some((dia) => dia.fecha === vistaPrevia)
    ? vistaPrevia : seleccionVisible?.fecha;

  // Mantiene el índice y los movimientos del original: semana horizontal, día vertical.
  const indiceDe = (celda) => celda.w * 7 + celda.d;
  const enfocarCelda = (celda) => {
    referencia.current?.querySelector(`[data-indice="${indiceDe(celda)}"]`)?.focus();
  };
  const manejarTecla = (evento, celda) => {
    const paso = PASOS[evento.key];
    if (!paso) return;
    evento.preventDefault();
    let siguiente = indiceDe(celda) + paso;
    while (siguiente >= 0 && siguiente < dias.length && !dias[siguiente].visible) siguiente += paso;
    if (siguiente >= 0 && siguiente < dias.length) {
      enfocarCelda({ w: Math.floor(siguiente / 7), d: siguiente % 7 });
    }
  };

  return (
    <div className="heat-calendar" aria-label="Participación mensual">
      <div className="heat-calendar__lectura" role="status">
        <LiveFigure intent={diaMostrado}>
          {diaMostrado ? (
            <><strong>{registrados.has(diaMostrado) ? "Registrado" : "Sin registro"}</strong><span>{etiquetaFecha(diaMostrado)}</span></>
          ) : <><strong>Tu participación</strong><span>Elegí un día para ver el detalle</span></>}
        </LiveFigure>
      </div>
      <motion.div
        className="heat-calendar__grilla"
        ref={referencia}
        role="group"
        aria-label="Días del mes. Usá las flechas para recorrerlos y Enter o espacio para seleccionar."
        style={{ "--heat-semanas": columnas.length }}
        initial={false}
        animate={{ opacity: 1 }}
      >
        {DIAS.map(({ nombre, d }) => <span key={d} className="heat-calendar__dia-semana" style={{ gridColumn: 1, gridRow: d + 1 }}>{nombre}</span>)}
        {columnas.map(({ id, w }) => DIAS.map(({ d }) => {
          const celda = { w, d };
          const indice = indiceDe(celda);
          const { fecha, visible } = dias[indice];
          const registrado = registrados.has(fecha);
          const elegido = seleccion === fecha;
          if (!visible) return <span key={`${id}-${d}`} className="heat-calendar__fuera" style={{ gridColumn: w + 2, gridRow: d + 1 }} aria-hidden="true" />;
          return (
            <button
              key={`${id}-${d}`}
              type="button"
              className="heat-calendar__boton"
              data-indice={indice}
              style={{ gridColumn: w + 2, gridRow: d + 1 }}
              tabIndex={fecha === focoInicial ? 0 : -1}
              aria-label={`${etiquetaFecha(fecha)}: ${registrado ? "registrado" : "sin registro"}`}
              aria-pressed={elegido}
              onPointerEnter={() => setVistaPrevia(fecha)}
              onPointerLeave={() => setVistaPrevia(null)}
              onFocus={() => { setFechaEnfocada(fecha); setVistaPrevia(fecha); }}
              onBlur={() => setVistaPrevia(null)}
              onClick={() => onSeleccionar(fecha)}
              onKeyDown={(evento) => manejarTecla(evento, celda)}
            >
              <motion.span
                className={`heat-calendar__celda${registrado ? " heat-calendar__celda--registrada" : ""}`}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: reducido ? 0 : 0.15 }}
                aria-hidden="true"
              />
            </button>
          );
        }))}
      </motion.div>
      <div className="heat-calendar__leyenda" aria-label="Referencias">
        <span><i aria-hidden="true" /> Sin registro</span>
        <span><i className="heat-calendar__marca" aria-hidden="true" /> Registrado</span>
        <span><i className="heat-calendar__no-disponible" aria-hidden="true" /> No disponible</span>
      </div>
    </div>
  );
}
