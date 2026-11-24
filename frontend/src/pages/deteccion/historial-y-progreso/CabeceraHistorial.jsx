/*
 * Cabecera compartida de Historial y progreso: conecta las vistas y filtros que
 * administra la página con controles accesibles y sin consultas propias.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HistorialVista.css";

const opcionesPeriodo = [
  { valor: "dia", etiqueta: "Día" },
  { valor: "semana", etiqueta: "Semana" },
  { valor: "mes", etiqueta: "Mes" },
  { valor: "30dias", etiqueta: "Últimos 30 días" },
];
const vistas = [
  { valor: "historial", etiqueta: "Mi historial" },
  { valor: "avances", etiqueta: "Mis avances" },
  { valor: "resumen", etiqueta: "Tu resumen" },
];

// Las fechas llegan como días de Córdoba, por lo que no se convierten a hora local.
const mostrarFecha = (fecha) => fecha
  ? new Intl.DateTimeFormat("es-AR", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  })
    .format(new Date(`${fecha}T12:00:00Z`)).replaceAll(".", "")
  : "";

export function CabeceraHistorial({
  vista, onCambiarVista, periodo, onCambiarPeriodo, desde, hasta,
  onAnterior, onSiguiente, puedeAnterior, puedeSiguiente, onPeriodoActual, enPeriodoActual,
}) {
  // Las flechas cambian de pestaña sin desplazar el foco fuera del grupo.
  const navegarPestanas = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let indice = vistas.findIndex((item) => item.valor === vista);
    if (event.key === "Home") indice = 0;
    else if (event.key === "End") indice = vistas.length - 1;
    else indice = (indice + (event.key === "ArrowRight" ? 1 : -1) + vistas.length) % vistas.length;
    onCambiarVista(vistas[indice].valor);
    document.getElementById(`tab-${vistas[indice].valor}`)?.focus();
  };

  return (
    <header className="historial-cabecera">
      <div className="historial-cabecera__intro">
        <div>
          <p className="historial-eyebrow">TU ESPACIO PERSONAL</p>
          <h1 id="historial-titulo">
            Historial y progreso<span aria-hidden="true">.</span>
          </h1>
          <p>Un espacio para mirar tu recorrido con más claridad, a tu ritmo.</p>
        </div>
        <span className="historial-privado">Tu recorrido es privado</span>
      </div>
      <nav className="historial-subnav" aria-label="Vistas de historial y progreso">
        <div className="historial-tabs" role="tablist" aria-label="Vistas" onKeyDown={navegarPestanas}>
          {vistas.map((item) => (
            <button
              key={item.valor}
              id={`tab-${item.valor}`}
              type="button"
              role="tab"
              aria-selected={vista === item.valor}
              aria-controls={`panel-${item.valor}`}
              tabIndex={vista === item.valor ? 0 : -1}
              onClick={() => onCambiarVista(item.valor)}
            >
              {item.etiqueta}
            </button>
          ))}
        </div>
        <div className="historial-dots" aria-label="Seleccionar vista">
          {vistas.map((item) => (
            <button
              key={item.valor}
              type="button"
              aria-label={`Ir a ${item.etiqueta}`}
              aria-pressed={vista === item.valor}
              onClick={() => onCambiarVista(item.valor)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      </nav>
      <div className="historial-filtros">
        <div className="historial-filtros__titulo">
          <span className="historial-eyebrow">{vista === 'resumen' ? 'TU RESUMEN PERSONAL' : 'TU PERÍODO'}</span>
          <strong>{desde === hasta ? mostrarFecha(desde) : `${mostrarFecha(desde)} — ${mostrarFecha(hasta)}`}</strong>
        </div>
        {vista === 'resumen' ? <span>Últimos 30 días</span> : <div className="historial-filtros__controles">
          <div className="historial-periodos" role="group" aria-label="Elegir período">
            {opcionesPeriodo.map((item) => (
              <button
                key={item.valor}
                type="button"
                aria-pressed={periodo === item.valor}
                onClick={() => onCambiarPeriodo(item.valor)}
              >
                {item.etiqueta}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="historial-periodo-actual"
            onClick={onPeriodoActual}
            disabled={enPeriodoActual}
          >
            Ir al período actual
          </button>
          <div className="historial-flechas" role="group" aria-label="Recorrer períodos">
            <button type="button" onClick={onAnterior} disabled={!puedeAnterior} aria-label="Período anterior">
              <ChevronLeft size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={onSiguiente} disabled={!puedeSiguiente} aria-label="Período siguiente">
              <ChevronRight size={19} aria-hidden="true" />
            </button>
          </div>
        </div>}
      </div>
    </header>
  );
}
