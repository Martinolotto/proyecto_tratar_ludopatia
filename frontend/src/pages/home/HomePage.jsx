/*
 * Página de inicio (/inicio) dentro de AppLayout.
 * Integra:
 * - Resumen personal de perfil y meta.
 * - Banner de asistencia rápida ("Necesito ayuda ahora").
 * - Guía interactiva paso a paso.
 * - Frases y reflexiones del día.
 * - Lecturas destacadas de Prevención.
 * - Widget de chequeo de estado de ánimo.
 */
import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import {
  BookOpen,
  UsersRound,
  PanelRightOpen,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Compass,
  Smile,
  Zap,
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  Award,
  RefreshCw,
  HeartHandshake,
  Shield,
  FileText,
  Target,
  X,
} from "lucide-react";

// Pasos de la guía explicativa
const PASOS_GUIA = [
  {
    id: 1,
    titulo: "1. Infórmate sin presiones",
    subtitulo: "Sección de Prevención",
    descripcion:
      "Accedé a guías claras y contenidos educativos sobre el impacto de las apuestas en jóvenes, explicados de forma directa y sin juicios.",
    icono: BookOpen,
    link: "/prevencion",
    linkTexto: "Explorar Prevención",
  },
  {
    id: 2,
    titulo: "2. Compartí en un entorno seguro",
    subtitulo: "Sección de Comunidad",
    descripcion:
      "Leé y compartí vivencias con otros pares. Podés publicar usando tu alias personal o de forma 100% anónima para cuidar tu privacidad.",
    icono: UsersRound,
    link: "/comunidad",
    linkTexto: "Ir a Comunidad",
  },
  {
    id: 3,
    titulo: "3. Organizá tus herramientas",
    subtitulo: "Dashboard Personal",
    descripcion:
      "Llevá el control de tus metas diarias en 'Mi Actividad' y activá recomendaciones prácticas en el 'Escudo Digital' desde el panel desplegable.",
    icono: PanelRightOpen,
    esBotonDashboard: true,
    linkTexto: "Abrir Herramientas",
  },
];

// Opciones de ánimo
const OPCIONES_ANIMO = [
  {
    id: "tranquilo",
    etiqueta: "Tranquilo",
    emoji: "😌",
    recomendacion:
      "¡Excelente momento para repasar contenidos en Prevención o inspirar a otros!",
  },
  {
    id: "motivado",
    etiqueta: "Motivado",
    emoji: "⚡",
    recomendacion:
      "Aprovechá esta energía para registrar tus metas del día en Mi Actividad.",
  },
  {
    id: "ansioso",
    etiqueta: "Ansioso / Tentado",
    emoji: "💭",
    recomendacion:
      "Te sugerimos dar una vuelta por Comunidad o activar los bloqueos del Escudo Digital.",
  },
  {
    id: "necesito-apoyo",
    etiqueta: "Necesito desahogarme",
    emoji: "🤝",
    recomendacion:
      "Entrá a Comunidad para leer a otros o pedí apoyo inmediato en la línea de asistencia.",
  },
];

// Colección de frases del día
const FRASES_REFLEXION = [
  {
    frase:
      "Un día a la vez no es solo una meta, es la única forma real de avanzar.",
    autor: "Consejo MODUS",
  },
  {
    frase:
      "Reconocer cuándo hacer una pausa es el primer paso para retomar el control de tus decisiones.",
    autor: "Equipo de Orientación",
  },
  {
    frase:
      "Tus proyectos personales valen más que cualquier racha ilusoria de azar.",
    autor: "Reflexión Comunitaria",
  },
  {
    frase:
      "El apoyo entre pares no elimina el esfuerzo, pero hace que el camino sea mucho más liviano.",
    autor: "Comunidad MODUS",
  },
];

// Lecturas destacadas del eje de Prevención
const LECTURAS_DESTACADAS = [
  {
    id: 1,
    titulo: "El mito de la racha ganadora",
    categoria: "Mitos y Verdades",
    tiempo: "3 min de lectura",
    descripcion:
      "Descubrí por qué los algoritmos de apuestas están diseñados para generar la falsa sensación de control.",
  },
  {
    id: 2,
    titulo: "Bloqueo efectivo de notificaciones",
    categoria: "Guía Práctica",
    tiempo: "2 min de lectura",
    descripcion:
      "Paso a paso para desactivar las alertas de casas de apuestas y canales de deportes en tu celular.",
  },
];

export const HomePage = () => {
  const { openDashboard } = useOutletContext();
  const [pasoActivo, setPasoActivo] = useState(1);
  const [animoSeleccionado, setAnimoSeleccionado] = useState(null);
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);

  const pasoActualData = PASOS_GUIA.find((p) => p.id === pasoActivo);

  const cambiarFrase = () => {
    setIndiceFrase((prev) => (prev + 1) % FRASES_REFLEXION.length);
  };

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      {/* Resumen de Perfil Personal + Asistencia de Emergencia */}
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-navy/10 bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal text-white font-heading font-bold text-lg">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-ink text-base">
                Hola, Estudiante
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[11px] font-bold text-brand-teal">
                <Award size={12} />
                Escudo Activo
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-brand-teal font-medium mt-0.5">
              <Target size={13} />
              Meta activa: Ahorrar para mi primera computadora.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMostrarModalAyuda(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/10 px-4 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
        >
          <PhoneCall size={16} />
          Necesito ayuda ahora
        </button>
      </div>

      {/* Banner de Bienvenida Principal */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-navy/10 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-teal p-6 text-white shadow-sm md:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Sparkles size={14} aria-hidden="true" />
            Bienvenido a MODUS
          </span>

          <h1 className="mt-3 font-heading text-2xl font-bold md:text-3xl">
            Tu espacio seguro para la reflexión y el autocontrol
          </h1>

          <p className="mt-2 text-sm text-white/90 md:text-base">
            Información clara, herramientas personales de organización y una
            comunidad sin prejuicios.
          </p>
        </div>
      </div>

      {/* Frase / Reflexión del Día (Interactiva) */}
      <div className="rounded-2xl border border-brand-navy/10 bg-surface-soft/40 p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-teal">
            <Lightbulb size={16} />
            Reflexión del día
          </span>
          <button
            type="button"
            onClick={cambiarFrase}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink/60 hover:text-brand-teal transition"
          >
            <RefreshCw size={13} />
            Otra frase
          </button>
        </div>

        <blockquote className="mt-3 font-heading text-base font-semibold text-brand-navy italic">
          "{FRASES_REFLEXION[indiceFrase].frase}"
        </blockquote>
        <span className="mt-1 block text-xs font-medium text-ink/60">
          — {FRASES_REFLEXION[indiceFrase].autor}
        </span>
      </div>

      {/* Guía Interactiva Paso a Paso */}
      <div className="rounded-2xl border border-brand-navy/10 bg-surface p-6 shadow-sm md:p-8">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-navy">
            <Compass className="text-brand-teal" size={24} aria-hidden="true" />
            ¿Cómo usar MODUS? Guía rápida
          </h2>
          <p className="mt-1 text-xs text-ink/70 sm:text-sm">
            Conocé las 3 funciones principales para aprovechar la plataforma a
            tu ritmo.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-12">
          {/* Tabs laterales */}
          <div className="space-y-3 md:col-span-5">
            {PASOS_GUIA.map((paso) => {
              const esSeleccionado = pasoActivo === paso.id;
              const IconoPaso = paso.icono;

              return (
                <button
                  key={paso.id}
                  type="button"
                  onClick={() => setPasoActivo(paso.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    esSeleccionado
                      ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                      : "border-brand-navy/10 bg-canvas/50 hover:bg-surface-soft"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        esSeleccionado
                          ? "bg-brand-teal text-white"
                          : "bg-surface text-ink/70"
                      }`}
                    >
                      <IconoPaso size={20} />
                    </div>
                    <div>
                      <span className="block font-heading text-sm font-semibold text-brand-navy">
                        {paso.titulo}
                      </span>
                      <span className="text-xs text-brand-teal font-medium">
                        {paso.subtitulo}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className={`transition-transform ${
                      esSeleccionado
                        ? "translate-x-1 text-brand-teal"
                        : "text-ink/30"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Detalle del Paso */}
          <div className="flex flex-col justify-between rounded-xl border border-brand-teal/20 bg-surface-soft/30 p-6 md:col-span-7">
            <div>
              <div className="flex items-center gap-2 text-brand-teal font-semibold text-xs">
                <CheckCircle2 size={16} />
                <span>Paso {pasoActualData.id} de 3</span>
              </div>

              <h3 className="mt-2 font-heading text-lg font-bold text-brand-navy">
                {pasoActualData.titulo}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-ink/80">
                {pasoActualData.descripcion}
              </p>
            </div>

            <div className="mt-6 border-t border-brand-navy/10 pt-4">
              {pasoActualData.esBotonDashboard ? (
                <button
                  type="button"
                  onClick={openDashboard}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  <PanelRightOpen size={16} />
                  {pasoActualData.linkTexto}
                </button>
              ) : (
                <Link
                  to={pasoActualData.link}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  <span>{pasoActualData.linkTexto}</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lecturas Destacadas de Prevención */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-brand-navy">
            Lecturas destacadas de Prevención
          </h2>
          <Link
            to="/prevencion"
            className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {LECTURAS_DESTACADAS.map((articulo) => (
            <Link
              key={articulo.id}
              to="/prevencion"
              className="group rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal hover:shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-ink/60">
                <span className="rounded bg-surface-soft px-2 py-0.5 font-medium text-brand-teal">
                  {articulo.categoria}
                </span>
                <span>{articulo.tiempo}</span>
              </div>

              <h3 className="mt-3 font-heading font-semibold text-ink group-hover:text-brand-teal transition">
                {articulo.titulo}
              </h3>
              <p className="mt-1.5 text-xs text-ink/75 leading-relaxed">
                {articulo.descripcion}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chequeo Rápido de Estado de Ánimo */}
      <div className="rounded-2xl border border-brand-navy/10 bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Smile className="text-brand-teal" size={22} aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-brand-navy">
            ¿Cómo te encontrás hoy?
          </h2>
        </div>
        <p className="mt-1 text-xs text-ink/70">
          Un chequeo personal rápido para orientar tu navegación en MODUS.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {OPCIONES_ANIMO.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setAnimoSeleccionado(opcion)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
                animoSeleccionado?.id === opcion.id
                  ? "border-brand-teal bg-brand-teal text-white shadow-sm"
                  : "border-brand-navy/10 bg-canvas text-ink hover:bg-surface-soft"
              }`}
            >
              <span className="text-base">{opcion.emoji}</span>
              <span>{opcion.etiqueta}</span>
            </button>
          ))}
        </div>

        {animoSeleccionado && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-soft/60 p-4 text-xs text-ink">
            <Zap size={18} className="text-brand-teal shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-navy block mb-0.5">
                Sugerencia MODUS:
              </span>
              <p className="leading-relaxed">
                {animoSeleccionado.recomendacion}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Asistencia Rápida ("Necesito ayuda ahora") */}
      {mostrarModalAyuda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-brand-navy/10">
            <div className="flex items-center justify-between border-b border-brand-navy/10 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-heading font-bold text-lg">
                <HeartHandshake size={22} />
                Líneas de ayuda e información
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalAyuda(false)}
                className="text-ink/60 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-ink/80 leading-relaxed">
              Si sentís que la tentación o el malestar son fuertes hoy, recordá
              que hay espacios gratuitos y confidenciales para hablar:
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-surface-soft/60 p-3.5 border border-brand-teal/20">
                <span className="block font-bold text-xs text-brand-navy">
                  Línea 141 (Sedronar - Argentina)
                </span>
                <span className="text-[11px] text-ink/70 block mt-0.5">
                  Atención gratuita, anónima y disponible las 24 horas.
                </span>
              </div>

              <div className="rounded-xl bg-canvas p-3.5 border border-brand-navy/10">
                <span className="block font-bold text-xs text-brand-navy">
                  Comunidad MODUS (Modo Anónimo)
                </span>
                <span className="text-[11px] text-ink/70 block mt-0.5">
                  Publicá en el foro lo que estás sintiendo para recibir
                  contención entre pares.
                </span>
                <Link
                  to="/comunidad"
                  onClick={() => setMostrarModalAyuda(false)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
                >
                  Ir a Comunidad <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalAyuda(false)}
                className="rounded-lg bg-brand-teal px-4 py-2 text-xs font-semibold text-white"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
