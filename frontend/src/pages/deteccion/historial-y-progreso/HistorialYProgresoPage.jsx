/*
 * Pantalla de Historial y progreso del eje de Detección, abierta desde el Dashboard.
 * Presenta las vistas aprobadas sin inventar registros, métricas, rachas ni logros.
 * La selección de período es local hasta conectar los datos reales de Mi actividad.
 */
import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";

// Períodos aprobados para consultar la actividad; no contienen fechas o registros ficticios.
const periods = [
  { value: "dia", label: "Día" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

// Nombres de magnitudes diferentes. Aún no se calculan valores ni se confunde ausencia con cero.
const metrics = [
  "Tiempo dedicado",
  "Cantidad de apuestas",
  "Dinero apostado",
  "Dinero perdido",
  "Frecuencia declarada",
];

export const HistorialYProgresoPage = () => {
  // El período seleccionado solo cambia la vista local; todavía no consulta datos guardados.
  const [period, setPeriod] = useState(periods[0]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex items-center gap-3 text-brand-teal">
          <ChartNoAxesCombined size={26} aria-hidden="true" />
          <p className="text-sm font-semibold">Tu espacio personal</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-brand-navy">
          Historial y progreso
        </h1>
        <p className="mt-3 leading-relaxed text-ink">
          Un espacio para consultar lo que declares en Mi actividad y observar cambios a tu ritmo.
        </p>
      </header>

      <section aria-labelledby="history-title" className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6">
        <h2 id="history-title" className="text-xl font-semibold text-brand-navy">Historial</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Elegí cómo querés consultar tus registros.
        </p>

        {/* aria-pressed comunica qué período está seleccionado también a lectores de pantalla. */}
        <div role="group" aria-label="Vista del historial" className="mt-4 flex flex-wrap gap-2">
          {periods.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={period.value === item.value}
              onClick={() => setPeriod(item)}
              className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${
                period.value === item.value
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-brand-navy/20 text-ink hover:bg-surface-soft"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Una vista sin datos no se interpreta como una declaración de días sin apostar. */}
        <div className="mt-5 rounded-lg bg-canvas p-4" aria-live="polite">
          <h3 className="font-semibold text-ink">Vista por {period.label.toLowerCase()}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Todavía no hay datos conectados para mostrar. Cuando estén disponibles,
            podrás consultar el detalle de cada registro.
          </p>
        </div>
        <Link
          to="/mi-actividad"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-brand-teal underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          Conocer Mi actividad
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      {/* Se muestran los nombres de las magnitudes, sin ceros, promedios o gráficos simulados. */}
      <section aria-labelledby="metrics-title" className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6">
        <h2 id="metrics-title" className="text-xl font-semibold text-brand-navy">Métricas y gráficos</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Cuando haya datos disponibles, podrás consultar estas magnitudes por separado:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-relaxed text-ink">
          {metrics.map((metric) => <li key={metric}>{metric}</li>)}
        </ul>
      </section>

      {/* Calendario, rachas y logros quedan como espacios informativos hasta contar con hechos reales. */}
      <section aria-labelledby="progress-title" className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6">
        <h2 id="progress-title" className="text-xl font-semibold text-brand-navy">Calendario y logros</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Cuando estén disponibles tus registros y acciones, podrás consultar el calendario,
          tu participación y los reconocimientos que correspondan.
        </p>
      </section>
    </section>
  );
};
