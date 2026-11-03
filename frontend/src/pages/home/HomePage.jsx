import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  PanelRightOpen,
  UsersRound,
} from "lucide-react";
import {
  categoriasPrevencion,
  contenidosPrevencion,
} from "../prevencion/prevencionContenido.js";

const pasosGuia = [
  {
    id: "prevencion",
    title: "Informarte",
    subtitle: "Prevención",
    description:
      "Explorá contenidos educativos para comprender mejor las apuestas online y sus posibles impactos.",
    icon: BookOpen,
    path: "/prevencion",
    action: "Explorar Prevención",
  },
  {
    id: "comunidad",
    title: "Conocer el espacio de pares",
    subtitle: "Comunidad",
    description:
      "Visitá el espacio de Comunidad y conocé las opciones de participación disponibles.",
    icon: UsersRound,
    path: "/comunidad",
    action: "Ir a Comunidad",
  },
  {
    id: "herramientas",
    title: "Explorar herramientas",
    subtitle: "Panel de herramientas",
    description:
      "Abrí el panel para consultar las páginas de herramientas personales disponibles.",
    icon: PanelRightOpen,
    action: "Abrir herramientas",
  },
];

const lecturasDestacadas = ["casi-ganar", "publicidad-y-apuestas"]
  .map((id) => contenidosPrevencion.find((contenido) => contenido.id === id))
  .filter(Boolean);

export const HomePage = () => {
  const { openDashboard } = useOutletContext();
  const [pasoActivo, setPasoActivo] = useState(pasosGuia[0].id);
  const pasoSeleccionado =
    pasosGuia.find((paso) => paso.id === pasoActivo) ?? pasosGuia[0];
  const IconoPaso = pasoSeleccionado.icon;

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-2xl bg-brand-navy p-6 text-white md:p-8">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/85">
          <Compass size={18} aria-hidden="true" />
          Bienvenido a MODUS
        </span>
        <h1 className="mt-3 max-w-2xl font-heading text-2xl font-bold md:text-3xl">
          Un espacio para informarte y explorar MODUS a tu ritmo.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
          Encontrá contenidos de Prevención, conocé Comunidad y accedé a las
          herramientas disponibles desde un mismo lugar.
        </p>
      </header>

      <section aria-labelledby="home-access-title">
        <h2
          id="home-access-title"
          className="font-heading text-xl font-semibold text-brand-navy"
        >
          ¿Por dónde querés empezar?
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link
            to="/prevencion"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <BookOpen className="text-brand-teal" size={22} aria-hidden="true" />
            <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy">
              Prevención
            </h3>
            <p className="mt-2 text-sm text-ink/80">
              Explorá contenidos educativos sobre apuestas online.
            </p>
          </Link>

          <Link
            to="/comunidad"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <UsersRound
              className="text-brand-teal"
              size={22}
              aria-hidden="true"
            />
            <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy">
              Comunidad
            </h3>
            <p className="mt-2 text-sm text-ink/80">
              Conocé el espacio de participación entre pares.
            </p>
          </Link>

          <button
            type="button"
            onClick={openDashboard}
            aria-haspopup="dialog"
            aria-controls="app-dashboard"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 text-left transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <PanelRightOpen
              className="text-brand-teal"
              size={22}
              aria-hidden="true"
            />
            <span className="mt-3 block font-heading text-lg font-semibold text-brand-navy">
              Herramientas personales
            </span>
            <span className="mt-2 block text-sm text-ink/80">
              Abrí el panel para consultar sus páginas disponibles.
            </span>
          </button>
        </div>
      </section>

      <section
        aria-labelledby="home-guide-title"
        className="rounded-2xl border border-brand-navy/10 bg-surface p-5 md:p-7"
      >
        <div>
          <h2
            id="home-guide-title"
            className="font-heading text-xl font-semibold text-brand-navy"
          >
            Una guía rápida para empezar
          </h2>
          <p className="mt-1 text-sm text-ink/75">
            Elegí un espacio para conocer qué podés encontrar en MODUS.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-5">
          <div className="space-y-2 md:col-span-2">
            {pasosGuia.map((paso) => {
              const Icono = paso.icon;
              const seleccionado = paso.id === pasoActivo;

              return (
                <button
                  key={paso.id}
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => setPasoActivo(paso.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${
                    seleccionado
                      ? "border-brand-teal bg-surface-soft/60"
                      : "border-brand-navy/10 hover:bg-canvas"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icono
                      className="shrink-0 text-brand-teal"
                      size={20}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-medium text-brand-navy">
                        {paso.title}
                      </span>
                      <span className="text-sm text-ink/70">
                        {paso.subtitle}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className="shrink-0 text-brand-teal"
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-canvas p-5 md:col-span-3">
            <div>
              <IconoPaso
                className="text-brand-teal"
                size={24}
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium text-brand-teal">
                {pasoSeleccionado.subtitle}
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-brand-navy">
                {pasoSeleccionado.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {pasoSeleccionado.description}
              </p>
            </div>

            {pasoSeleccionado.path ? (
              <Link
                to={pasoSeleccionado.path}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                {pasoSeleccionado.action}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={openDashboard}
                aria-haspopup="dialog"
                aria-controls="app-dashboard"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                {pasoSeleccionado.action}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="home-readings-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="home-readings-title"
              className="font-heading text-xl font-semibold text-brand-navy"
            >
              Para explorar en Prevención
            </h2>
            <p className="mt-1 text-sm text-ink/75">
              Algunas lecturas disponibles en el eje.
            </p>
          </div>
          <Link
            to="/prevencion"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Ver Prevención <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {lecturasDestacadas.map((contenido) => {
            const categoria = categoriasPrevencion.find(
              (item) => item.id === contenido.category,
            );

            return (
              <Link
                key={contenido.id}
                to="/prevencion"
                className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                {categoria && (
                  <span className="text-sm font-medium text-brand-teal">
                    {categoria.label}
                  </span>
                )}
                <h3 className="mt-2 font-heading font-semibold text-brand-navy">
                  {contenido.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  {contenido.summary}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
};
