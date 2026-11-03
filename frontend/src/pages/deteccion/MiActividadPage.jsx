/*
 * Interfaz inicial de Mi actividad, disponible desde el Dashboard y Home.
 * Permite explorar los campos del registro diario aprobado en RF-DO-02.
 * Las respuestas viven solo en esta página: todavía no hay cuenta ni guardado real.
 */
import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";

// Cada opción describe una conducta o consecuencia aprobada; no asigna niveles de riesgo.
const situations = [
  "Intenté recuperar pérdidas",
  "Me excedí de lo que tenía previsto",
  "Me costó detenerme",
  "Interrumpí otras actividades",
  "Tuve repercusiones cotidianas o sociales",
];

export const MiActividadPage = () => {
  // null significa que todavía no se eligió una respuesta. No equivale a «no».
  const [betToday, setBetToday] = useState(null);
  const [urgeToday, setUrgeToday] = useState(null);
  // Las cadenas vacías representan cantidades sin declarar, diferentes de cero.
  const [amounts, setAmounts] = useState({
    time: "",
    timeUnit: "minutos",
    count: "",
    betMoney: "",
    lostMoney: "",
  });
  const [selectedSituations, setSelectedSituations] = useState([]);
  const [note, setNote] = useState("");

  // Al indicar que no hubo apuestas se limpian datos que solo corresponden a apuestas.
  // Si se vuelve a elegir «Sí», esos campos empiezan sin cantidades anteriores.
  const selectBetToday = (value) => {
    setBetToday(value);
    if (value === "no") {
      setAmounts({
        time: "",
        timeUnit: "minutos",
        count: "",
        betMoney: "",
        lostMoney: "",
      });
    }
  };

  // Copiar el estado conserva los otros campos y permite modificar solo el indicado.
  const updateAmount = (field, value) => {
    setAmounts((previous) => ({ ...previous, [field]: value }));
  };

  // Las casillas permiten elegir varias situaciones o ninguna, sin generar una evaluación.
  const toggleSituation = (situation) => {
    setSelectedSituations((previous) =>
      previous.includes(situation)
        ? previous.filter((item) => item !== situation)
        : [...previous, situation],
    );
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex items-center gap-3 text-brand-teal">
          <CalendarDays size={26} aria-hidden="true" />
          <p className="text-sm font-semibold">Registro de hoy</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-brand-navy">Mi actividad</h1>
        <p className="mt-3 leading-relaxed text-ink">
          Este espacio es voluntario y te invita a observar lo que pasó hoy, sin juicios ni diagnósticos.
        </p>
      </header>

      {/* Avisar el límite de esta entrega evita presentar la interacción local como guardado real. */}
      <p className="rounded-lg border border-brand-navy/10 bg-surface-soft p-4 text-sm leading-relaxed text-ink">
        Esta es una vista inicial: lo que escribas solo permanece en esta pantalla.
        Al salir o recargar se descarta; todavía no se guarda ni se envía.
      </p>

      <div className="space-y-6 rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-7">
        {/* La selección explícita distingue un día sin apuestas de una pregunta sin responder. */}
        <fieldset>
          <legend className="font-heading text-lg font-semibold text-brand-navy">
            ¿Hoy realizaste apuestas?
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-brand-navy/20 px-4 py-2 text-ink"
              >
                <input
                  type="radio"
                  name="betToday"
                  value={option.value}
                  checked={betToday === option.value}
                  onChange={() => selectBetToday(option.value)}
                  className="accent-brand-teal"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Las ganas de apostar son opcionales y se pueden indicar tanto si se apostó como si no. */}
        <fieldset>
          <legend className="font-heading text-lg font-semibold text-brand-navy">
            ¿Tuviste ganas de apostar? <span className="text-sm font-normal">(opcional)</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-brand-navy/20 px-4 py-2 text-ink"
              >
                <input
                  type="radio"
                  name="urgeToday"
                  value={option.value}
                  checked={urgeToday === option.value}
                  onChange={() => setUrgeToday(option.value)}
                  className="accent-brand-teal"
                />
                {option.label}
              </label>
            ))}
            {/* Permite volver al estado sin información si la persona cambia de opinión. */}
            {urgeToday !== null && (
              <button
                type="button"
                onClick={() => setUrgeToday(null)}
                className="min-h-11 rounded-lg px-3 text-sm text-brand-teal underline focus-visible:outline-2 focus-visible:outline-brand-teal"
              >
                Quitar respuesta
              </button>
            )}
          </div>
        </fieldset>

        {/* Solo si se declararon apuestas aparecen los datos relacionados con ellas.
            Las cuatro cantidades son opcionales y permanecen separadas en el estado. */}
        {betToday === "si" && (
          <section aria-labelledby="activity-details-title" className="border-t border-brand-navy/10 pt-6">
            <h2 id="activity-details-title" className="text-lg font-semibold text-brand-navy">
              Sobre las apuestas de hoy
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink">Completá solo lo que quieras declarar.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="activity-time" className="block text-sm font-medium text-ink">Tiempo dedicado</label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="activity-time"
                    type="number"
                    min="0"
                    step="any"
                    value={amounts.time}
                    onChange={(event) => updateAmount("time", event.target.value)}
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-brand-navy/20 px-3 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                  />
                  <select
                    aria-label="Unidad de tiempo"
                    value={amounts.timeUnit}
                    onChange={(event) => updateAmount("timeUnit", event.target.value)}
                    className="min-h-11 rounded-lg border border-brand-navy/20 bg-surface px-2 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                  >
                    <option value="minutos">Minutos</option>
                    <option value="horas">Horas</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="activity-count" className="block text-sm font-medium text-ink">Cantidad de apuestas</label>
                <input
                  id="activity-count"
                  type="number"
                  min="0"
                  step="1"
                  value={amounts.count}
                  onChange={(event) => updateAmount("count", event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-brand-navy/20 px-3 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="activity-bet-money" className="block text-sm font-medium text-ink">Dinero apostado</label>
                <input
                  id="activity-bet-money"
                  type="number"
                  min="0"
                  step="any"
                  value={amounts.betMoney}
                  onChange={(event) => updateAmount("betMoney", event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-brand-navy/20 px-3 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="activity-lost-money" className="block text-sm font-medium text-ink">Dinero perdido</label>
                <input
                  id="activity-lost-money"
                  type="number"
                  min="0"
                  step="any"
                  value={amounts.lostMoney}
                  onChange={(event) => updateAmount("lostMoney", event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-brand-navy/20 px-3 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                />
              </div>
            </div>
          </section>
        )}

        {/* Algunas consecuencias pueden ocurrir también en un día sin apuestas.
            Dejar disponibles estas casillas evita deducir la respuesta de otra pregunta. */}
        {betToday !== null && (
          <fieldset className="border-t border-brand-navy/10 pt-6">
            <legend className="font-heading text-lg font-semibold text-brand-navy">¿Te pasó alguna de estas situaciones?</legend>
            <p className="mt-1 text-sm leading-relaxed text-ink">Podés elegir varias o dejar todas sin marcar.</p>
            <div className="mt-3 space-y-2">
              {situations.map((situation) => (
                <label
                  key={situation}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-brand-navy/20 px-3 py-2 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={selectedSituations.includes(situation)}
                    onChange={() => toggleSituation(situation)}
                    className="h-4 w-4 accent-brand-teal"
                  />
                  {situation}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* La observación es libre y opcional, tanto en un día con apuestas como sin ellas. */}
        <div className="border-t border-brand-navy/10 pt-6">
          <label htmlFor="activity-note" className="block font-heading text-lg font-semibold text-brand-navy">
            ¿Querés agregar algo? <span className="text-sm font-normal">(opcional)</span>
          </label>
          <textarea
            id="activity-note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-3 w-full rounded-lg border border-brand-navy/20 px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />
        </div>
      </div>

      {/* La navegación no afirma un guardado: al salir se pierde el estado local. */}
      <Link
        to="/inicio"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-brand-teal underline focus-visible:outline-2 focus-visible:outline-brand-teal"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a Inicio
      </Link>
    </section>
  );
};
