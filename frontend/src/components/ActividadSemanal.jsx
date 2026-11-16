/*
 * Cuadrícula reutilizable de siete días declarados en Mi actividad.
 * Home aporta los registros autorizados y la racha; este componente solo los presenta.
 */
import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import "./ActividadSemanal.css";

// Cada fecha es un día calendario de la base, no una hora del dispositivo.
const fechaCalendario = (fecha, opciones) => new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  ...opciones,
}).format(new Date(`${fecha}T12:00:00Z`));

export const ActividadSemanal = ({ dias, racha, hoy }) => {
  const [seleccion, setSeleccion] = useState(null);
  // Si cambia la semana, dejamos de mostrar un día que ya no forma parte de ella.
  const diaSeleccionado = dias.find((dia) => dia.fecha === seleccion)
    || dias.find((dia) => dia.fecha === hoy)
    || dias[dias.length - 1];

  return (
    <section className="semana-actividad" aria-labelledby="semana-actividad-titulo">
      <div className="semana-actividad__cabecera">
        <div>
          <span className="semana-actividad__indicador"><CalendarDays size={18} aria-hidden="true" /> Últimos siete días</span>
          <h2 id="semana-actividad-titulo">Tu actividad de la semana</h2>
          <p>Cada casilla representa un día. Elegí una para ver su resumen.</p>
        </div>
        <div className="semana-actividad__racha" aria-label={`Racha de registros: ${racha} ${racha === 1 ? "día" : "días"}`}>
          <strong>{racha}</strong>
          <span>{racha === 1 ? "día consecutivo" : "días consecutivos"}<small>Racha de registros</small></span>
        </div>
      </div>

      {/* Un botón nativo por día permite seleccionar con ratón, Tab, Enter o espacio. */}
      <div className="semana-actividad__dias" role="group" aria-label="Elegí un día de los últimos siete">
        {dias.map((dia) => {
          const seleccionado = dia.fecha === diaSeleccionado?.fecha;
          const diaCompleto = fechaCalendario(dia.fecha, { weekday: "long", day: "numeric", month: "long" });
          return (
            <button
              key={dia.fecha}
              type="button"
              className={`semana-actividad__dia ${dia.registro ? "semana-actividad__dia--registrado" : ""}`}
              onClick={() => setSeleccion(dia.fecha)}
              aria-pressed={seleccionado}
              aria-label={`${diaCompleto}: ${dia.registro ? "registro guardado" : "sin registro"}`}
            >
              <span className="semana-actividad__dia-semana">{fechaCalendario(dia.fecha, { weekday: "short" }).replace(".", "")}</span>
              <span className="semana-actividad__casilla" aria-hidden="true"><span /></span>
              <span className="semana-actividad__numero">{fechaCalendario(dia.fecha, { day: "numeric" })}</span>
            </button>
          );
        })}
      </div>

      <div className="semana-actividad__leyenda" aria-label="Leyenda">
        <span><i className="semana-actividad__muestra" aria-hidden="true" /> Sin registro</span>
        <span><i className="semana-actividad__muestra semana-actividad__muestra--registrado" aria-hidden="true" /> Registro guardado</span>
      </div>

      {/* Ausencia de información no se interpreta como un día sin apostar. */}
      {diaSeleccionado && (
        <div className="semana-actividad__detalle" aria-live="polite">
          <div>
            <strong>{fechaCalendario(diaSeleccionado.fecha, { weekday: "long", day: "numeric", month: "long" })}</strong>
            <p>{diaSeleccionado.registro
              ? `Declaraste que ${diaSeleccionado.registro.aposto ? "sí" : "no"} realizaste apuestas.`
              : "No hay registro para este día."}</p>
          </div>
          <Link to="/mi-actividad">Ir al registro de hoy <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
};
