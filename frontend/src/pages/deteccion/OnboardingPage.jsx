/*
 * Primera experiencia visual del eje de Detección, basada en RF-DO-01.
 * AppRouter la muestra en /onboarding dentro de PublicLayout.
 * Conserva respuestas solo en memoria durante el recorrido; no autentica, envía ni persiste datos.
 * El registro y la realización única por cuenta se integrarán cuando exista autenticación real.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { onboardingQuestions } from "./onboardingQuestions.js";

export const OnboardingPage = () => {
  // Separar posición, respuestas y cierre permite retroceder sin perder lo seleccionado.
  // Empezar con un objeto vacío evita inventar respuestas para preguntas omitidas.
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completion, setCompletion] = useState(null);
  const titleRef = useRef(null);

  // Estos valores se derivan del estado; no necesitan otra copia que mantener sincronizada.
  const question = onboardingQuestions[currentStep];
  const selectedAnswer = answers[question.id];
  const isLastStep = currentStep === onboardingQuestions.length - 1;

  // Al cambiar de paso o cerrar el recorrido, anunciar el nuevo título mediante el foco.
  // La ref apunta a la pregunta visible o al encabezado final, según lo que se renderice.
  useEffect(() => {
    titleRef.current?.focus();
  }, [currentStep, completion]);

  // Copiar el objeto anterior conserva las otras respuestas sin modificar el estado directamente.
  const selectAnswer = (value) => {
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  };

  // Un mismo avance sirve al responder u omitir: el último paso cierra la edición local.
  const advance = () => {
    if (isLastStep) {
      setCompletion("completed");
    } else {
      setCurrentStep((previous) => previous + 1);
    }
  };

  // Interceptar el formulario evita una recarga o un envío HTTP del navegador.
  const handleContinue = (event) => {
    event.preventDefault();
    if (selectedAnswer === undefined) return;
    advance();
  };

  // Si una pregunta ya estaba respondida, omitirla también retira esa respuesta.
  // No guardar null, cero o una opción supuesta en su lugar: queda sin información.
  const skipQuestion = () => {
    setAnswers((previous) => {
      const updated = { ...previous };
      delete updated[question.id];
      return updated;
    });
    advance();
  };

  // Después de completar u omitir todo no se vuelven a renderizar preguntas editables.
  // Este cierre es local: recargar o salir desmonta la página y descarta sus respuestas.
  if (completion !== null) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-brand-navy/10 bg-surface p-6 sm:p-8">
        <Compass size={32} className="text-brand-teal" aria-hidden="true" />
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="mt-4 font-heading text-3xl font-semibold text-brand-navy outline-none"
        >
          Seguí explorando a tu ritmo
        </h1>
        <p className="mt-3 leading-relaxed text-ink">
          {completion === "skipped"
            ? "Omitiste el recorrido inicial. Podés acceder a MODUS sin responder estas preguntas."
            : "Terminaste el recorrido inicial. Podés acceder a los contenidos y herramientas de MODUS."}
        </p>
        {/* El enlace abre la Home existente; no crea una sesión ni afirma un guardado en cuenta. */}
        <Link
          to="/inicio"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal hover:underline"
        >
          Ir a Inicio
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <p className="mt-5 text-sm leading-relaxed text-ink">
          En esta versión, las respuestas solo permanecen en esta pantalla. Al
          salir o recargar se descartan; no se envían ni se guardan en una cuenta.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      {/* Presentar el propósito y la libertad de omitir antes de solicitar información. */}
      <header>
        <p className="text-sm font-semibold text-brand-teal">MODUS · Primeros pasos</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-brand-navy">
          Un primer paso, a tu ritmo
        </h1>
        <p className="mt-3 leading-relaxed text-ink">
          Estas preguntas nos ayudan a conocer qué buscás. Podés omitir cualquier
          pregunta o todo el recorrido. No es una evaluación ni un diagnóstico.
        </p>
      </header>

      <div className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-7">
        {/* El progreso expresa la posición actual, no un puntaje ni un nivel de riesgo. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink" aria-live="polite">
            Pregunta {currentStep + 1} de {onboardingQuestions.length}
          </p>
          <button
            type="button"
            onClick={() => setCompletion("skipped")}
            className="min-h-11 rounded-lg px-3 text-sm font-medium text-brand-teal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Omitir recorrido
          </button>
        </div>
        {/* Las variantes WebKit/Firefox aplican los tokens de marca a la barra nativa. */}
        <progress
          value={currentStep + 1}
          max={onboardingQuestions.length}
          aria-label="Paso actual del recorrido"
          className="mt-2 h-2 w-full appearance-none overflow-hidden rounded-full bg-surface-soft [&::-moz-progress-bar]:bg-brand-teal [&::-webkit-progress-bar]:bg-surface-soft [&::-webkit-progress-value]:bg-brand-teal"
        />

        <form onSubmit={handleContinue} className="mt-6">
          {/* fieldset y legend agrupan los radios bajo la pregunta que describen.
              La key cambia al avanzar, para montar los controles del nuevo paso. */}
          <fieldset key={question.id} aria-describedby="onboarding-question-help">
            <legend
              ref={titleRef}
              tabIndex={-1}
              className="w-full font-heading text-xl font-semibold text-brand-navy outline-none sm:text-2xl"
            >
              {question.title}
            </legend>
            <p id="onboarding-question-help" className="mt-2 text-sm leading-relaxed text-ink">
              {question.description}
            </p>

            {/* Radios controlados: React conserva qué opción se eligió al volver atrás.
                Todas las opciones empiezan sin marcar y comparten el nombre de la pregunta. */}
            <div className="mt-5 space-y-3">
              {question.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-ink ${
                    selectedAnswer === option.value
                      ? "border-brand-teal bg-surface-soft"
                      : "border-brand-navy/20 hover:border-brand-teal"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={selectedAnswer === option.value}
                    onChange={() => selectAnswer(option.value)}
                    className="h-4 w-4 shrink-0 accent-brand-teal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-teal"
                  />
                  <span className="text-sm leading-relaxed sm:text-base">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Retroceder conserva respuestas; omitir y continuar usan acciones distintas.
              Continuar exige selección, pero omitir siempre permite avanzar sin responder. */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-brand-navy/10 pt-5">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((previous) => previous - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Anterior
            </button>
            <button
              type="submit"
              disabled={selectedAnswer === undefined}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-medium text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastStep ? "Finalizar recorrido" : "Continuar"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={skipQuestion}
            className="mt-3 min-h-11 w-full rounded-lg px-3 text-sm font-medium text-brand-teal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Omitir esta pregunta
          </button>
        </form>
      </div>

      {/* Avisar el límite real de esta entrega evita prometer persistencia aún no implementada. */}
      <p className="text-sm leading-relaxed text-ink">
        En esta versión, las respuestas solo permanecen en esta pantalla. Al salir
        o recargar se descartan; no se envían ni se guardan en una cuenta.
      </p>
    </section>
  );
};
