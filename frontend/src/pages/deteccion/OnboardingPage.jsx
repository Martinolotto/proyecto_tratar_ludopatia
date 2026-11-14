/*
 * Primera experiencia visual del eje de Detección, basada en RF-DO-01.
 * AppRouter la muestra en /onboarding sin la cabecera de navegación pública.
 * Consulta la cuenta y guarda una única finalización con respuestas opcionales en Supabase.
 * Las respuestas solo permanecen en memoria hasta completar u omitir el recorrido.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { onboardingQuestions } from "./onboardingQuestions.js";
import { consultarFinalizacion, guardarFinalizacion } from "./onboardingDatos.js";

export const OnboardingPage = () => {
  // Separar posición, respuestas y cierre permite retroceder sin perder lo seleccionado.
  // Empezar con un objeto vacío evita inventar respuestas para preguntas omitidas.
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completion, setCompletion] = useState(null);
  const [accountState, setAccountState] = useState("loading");
  const [userId, setUserId] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);
  const titleRef = useRef(null);
  const navigate = useNavigate();

  // Estos valores se derivan del estado; no necesitan otra copia que mantener sincronizada.
  const question = onboardingQuestions[currentStep];
  const selectedAnswer = answers[question.id];
  const isLastStep = currentStep === onboardingQuestions.length - 1;

  // Auth identifica la cuenta. La consulta posterior solo permite mostrar preguntas
  // cuando la cuenta todavía no tiene una finalización guardada.
  useEffect(() => {
    let active = true;

    const checkAccount = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (!data.user) {
          navigate("/login", { replace: true });
          return;
        }

        const previousCompletion = await consultarFinalizacion(data.user.id);
        if (!active) return;
        if (previousCompletion) {
          navigate("/inicio", { replace: true });
          return;
        }
        setUserId(data.user.id);
        setAccountState("ready");
      } catch {
        if (active) setAccountState("error");
      }
    };

    checkAccount();
    return () => { active = false; };
  }, [attempt, navigate]);

  // El título de la pregunta o del cierre recibe foco al aparecer en pantalla.
  useEffect(() => {
    if (accountState === "ready") titleRef.current?.focus();
  }, [accountState, currentStep, completion]);

  // Una consulta previa reconoce un guardado cuya confirmación se haya perdido.
  // La base impide duplicados incluso si otra pestaña finaliza al mismo tiempo.
  const finish = async (estado, finalAnswers) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError("");
    try {
      const previousCompletion = await consultarFinalizacion(userId);
      if (previousCompletion) {
        navigate("/inicio", { replace: true });
        return;
      }
      try {
        await guardarFinalizacion(userId, estado, finalAnswers);
      } catch (error) {
        // 23505 indica una clave repetida; verificar la fila antes de continuar.
        if (error.code !== "23505" || !(await consultarFinalizacion(userId))) throw error;
        navigate("/inicio", { replace: true });
        return;
      }
      setCompletion(estado);
    } catch {
      setSaveError("No pudimos guardar tus respuestas. Revisá tu conexión e intentá de nuevo.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  // Copiar el objeto anterior conserva las otras respuestas sin modificar el estado directamente.
  const selectAnswer = (value) => {
    setSaveError("");
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  };

  // Al terminar enviamos la copia exacta de respuestas correspondiente a la acción.
  const advance = (finalAnswers) => {
    setSaveError("");
    if (isLastStep) {
      finish("completado", finalAnswers);
    } else {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const handleContinue = (event) => {
    event.preventDefault();
    if (selectedAnswer === undefined || isSaving) return;
    advance(answers);
  };

  // La copia se usa inmediatamente al guardar la última pregunta: React actualiza
  // el estado de forma diferida y leer answers aquí conservaría el valor anterior.
  const skipQuestion = () => {
    if (isSaving) return;
    const updated = { ...answers };
    delete updated[question.id];
    setAnswers(updated);
    advance(updated);
  };

  if (accountState === "loading") {
    return <p role="status" className="text-ink">Comprobando tu cuenta...</p>;
  }

  if (accountState === "error") {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-brand-navy/10 bg-surface p-6">
        <h1 className="font-heading text-2xl font-semibold text-brand-navy">No pudimos abrir el recorrido</h1>
        <p role="alert" className="mt-3 text-ink">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => { setAccountState("loading"); setAttempt((previous) => previous + 1); }}
          className="mt-5 min-h-11 rounded-lg bg-brand-teal px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          Reintentar
        </button>
      </section>
    );
  }

  // Solo se muestra el cierre cuando la inserción recibió confirmación de Supabase.
  if (completion !== null) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-brand-navy/10 bg-surface p-6 sm:p-8">
        <Compass size={32} className="text-brand-teal" aria-hidden="true" />
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="mt-4 font-heading text-3xl font-semibold text-brand-navy focus:outline-2 focus:outline-offset-4 focus:outline-brand-teal"
        >
          Seguí explorando a tu ritmo
        </h1>
        <p className="mt-3 leading-relaxed text-ink">
          {completion === "omitido"
            ? "Omitiste el resto del recorrido. Se guardaron las respuestas que proporcionaste."
            : "Terminaste el recorrido inicial. Podés acceder a los contenidos y herramientas de MODUS."}
        </p>
        {/* La finalización ya fue guardada; el enlace abre la página de Inicio. */}
        <Link
          to="/inicio"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal hover:underline"
        >
          Ir a Inicio
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
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
            onClick={() => finish("omitido", answers)}
            disabled={isSaving}
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
          <fieldset key={question.id} disabled={isSaving} aria-describedby="onboarding-question-help">
            <legend
              ref={titleRef}
              tabIndex={-1}
              className="w-full font-heading text-xl font-semibold text-brand-navy focus:outline-2 focus:outline-offset-4 focus:outline-brand-teal sm:text-2xl"
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
              disabled={currentStep === 0 || isSaving}
              onClick={() => {
                setSaveError("");
                setCurrentStep((previous) => previous - 1);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Anterior
            </button>
            <button
              type="submit"
              disabled={selectedAnswer === undefined || isSaving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-5 py-3 text-sm font-medium text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastStep ? "Finalizar recorrido" : "Continuar"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={skipQuestion}
            disabled={isSaving}
            className="mt-3 min-h-11 w-full rounded-lg px-3 text-sm font-medium text-brand-teal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Omitir esta pregunta
          </button>
        </form>
      </div>

      {/* El estado anuncia el guardado tanto al finalizar como al omitir el recorrido. */}
      <p role="status" className="text-sm font-medium text-ink">
        {isSaving ? "Guardando tus respuestas..." : ""}
      </p>
      {saveError && <p role="alert" className="text-sm font-medium text-ink">{saveError}</p>}
      <p className="text-sm leading-relaxed text-ink">
        Al finalizar u omitir el recorrido guardaremos las respuestas que hayas proporcionado.
        Si salís antes, no se guardarán.
      </p>
    </section>
  );
};
