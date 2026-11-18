/*
 * Presenta MODUS y sus ejes en la página pública.
 * Los accesos llevan a LoginPage; sus formularios viven en una ruta independiente.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import "./LandingPage.css";

const axes = [
  {
    number: "01",
    id: "prevencion",
    name: "Prevención / Concientización",
    title: "Comprender el contexto y sus riesgos.",
    detail:
      "Acercar información clara sobre las apuestas online, sus riesgos y factores relacionados.",
  },
  {
    number: "02",
    id: "comunidad",
    name: "Comunidad / Apoyo entre pares",
    title: "El apoyo entre pares importa.",
    detail:
      "Poner en valor la escucha y el intercambio entre adolescentes, con respeto por cada experiencia.",
  },
  {
    number: "03",
    id: "orientacion",
    name: "Detección / Orientación no diagnóstica",
    title: "Orientarse sin etiquetas.",
    detail:
      "Acompañar el reconocimiento de posibles señales o patrones sin convertirlos en un diagnóstico.",
  },
];

export const LandingPage = () => {
  const landingRef = useRef(null);

  // Animación progresiva para las secciones visibles de la página.
  useEffect(() => {
    const landing = landingRef.current;
    if (
      !landing ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const revealTargets = landing.querySelectorAll("[data-scroll-reveal]");
    const motionTargets = landing.querySelectorAll(
      ".landing-hero, .landing-purpose__audience, .landing-axis, " +
        ".landing-boundaries, .landing-footer",
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "is-motion-active",
            entry.isIntersecting,
          );
        });
      },
      { threshold: 0.08 },
    );
    const syncPageVisibility = () => {
      landing.classList.toggle("modus-landing--motion-enabled", !document.hidden);
    };

    landing.classList.add("modus-landing--reveal-ready");
    syncPageVisibility();
    revealTargets.forEach((target) => revealObserver.observe(target));
    motionTargets.forEach((target) => motionObserver.observe(target));
    document.addEventListener("visibilitychange", syncPageVisibility);

    return () => {
      revealObserver.disconnect();
      motionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPageVisibility);
      landing.classList.remove(
        "modus-landing--reveal-ready",
        "modus-landing--motion-enabled",
      );
      revealTargets.forEach((target) => target.classList.remove("is-visible"));
      motionTargets.forEach((target) =>
        target.classList.remove("is-motion-active"),
      );
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="modus-landing" ref={landingRef}>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__ambient" aria-hidden="true">
          <span className="landing-hero__glow landing-hero__glow--one" />
          <span className="landing-hero__glow landing-hero__glow--two" />
          <span className="landing-hero__glow landing-hero__glow--three" />
        </div>

        <div className="landing-hero__content">
          <p className="landing-eyebrow">
            Educación <span aria-hidden="true">/</span> orientación{" "}
            <span aria-hidden="true">/</span> acompañamiento
          </p>
          <h1 id="landing-title">
            Apuestas online. <span>Entenderlas desde otra perspectiva.</span>
          </h1>
          <p className="landing-hero__lead">
            MODUS es una plataforma en desarrollo para adolescentes de 13 a 17
            años que ya participaron en apuestas online. Reúne educación,
            apoyo entre pares y orientación no diagnóstica.
          </p>

          <div
            className="landing-hero__actions"
            role="group"
            aria-label="Acceso a MODUS"
          >
            <Link
              to="/login?modo=registro"
              className="landing-button landing-button--primary"
            >
              Registrarse
              <span aria-hidden="true">↗</span>
            </Link>
            <Link
              to="/login?modo=ingreso"
              className="landing-button landing-button--secondary"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        <figure className="landing-map" aria-labelledby="landing-map-caption">
          <svg
            className="landing-map__path"
            viewBox="0 0 520 420"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="landing-map__route"
              pathLength="1"
              d="M75 310C143 278 128 191 210 184C288 177 299 271 377 242C428 223 420 146 469 101"
            />
            <path
              className="landing-map__route landing-map__route--secondary"
              pathLength="1"
              d="M83 95C144 130 154 236 222 259C284 280 329 119 423 143"
            />
          </svg>
          <a className="landing-map__point landing-map__point--one" href="#prevencion">
            <span className="landing-map__point-index">01</span>
            Prevención
          </a>
          <a className="landing-map__point landing-map__point--two" href="#comunidad">
            <span className="landing-map__point-index">02</span>
            Comunidad
          </a>
          <a className="landing-map__point landing-map__point--three" href="#orientacion">
            <span className="landing-map__point-index">03</span>
            Orientación
          </a>
          <span className="landing-map__center" aria-hidden="true">
            MODUS
          </span>
          <figcaption id="landing-map-caption">
            Tres perspectivas conectadas por un mismo propósito.
          </figcaption>
        </figure>

        <a className="landing-scroll" href="#proposito">
          <span aria-hidden="true">↓</span>
          Conocé el propósito
        </a>
      </section>

      <section
        className="landing-purpose"
        id="proposito"
        aria-labelledby="purpose-title"
      >
        <div className="landing-purpose__copy" data-scroll-reveal>
          <p className="landing-eyebrow landing-eyebrow--dark">
            Una experiencia que merece comprensión
          </p>
          <h2 id="purpose-title">
            Entender lo vivido, <span>sin juzgar.</span>
          </h2>
          <p className="landing-purpose__detail">
            Participar en apuestas online puede despertar dudas o preocupación,
            especialmente cuando se repite. MODUS busca acercar información y
            una mirada respetuosa, sin culpar ni definir a nadie por su
            experiencia.
          </p>
        </div>
        <aside
          className="landing-purpose__audience"
          aria-label="A quién está dirigida MODUS"
          data-scroll-reveal
        >
          <span className="landing-purpose__age">13–17</span>
          <div>
            <p className="landing-eyebrow landing-eyebrow--dark">
              Para adolescentes
            </p>
            <p>
              Una propuesta educativa y de acompañamiento para adolescentes que
              ya participaron en apuestas online.
            </p>
          </div>
        </aside>
      </section>

      <section className="landing-axes" aria-labelledby="axes-title">
        <div className="landing-axes__heading">
          <div data-scroll-reveal>
            <p className="landing-eyebrow landing-eyebrow--dark">
              Cómo se organiza MODUS
            </p>
            <h2 id="axes-title">
              Tres perspectivas,
              <br />
              <span>un propósito compartido.</span>
            </h2>
          </div>
          <p data-scroll-reveal>
            Los ejes se complementan; no son pasos obligatorios ni servicios
            clínicos. Expresan el propósito de una plataforma que todavía está
            en desarrollo.
          </p>
        </div>

        <ol className="landing-axes__list">
          {axes.map((axis) => (
            <li
              className="landing-axis"
              data-scroll-reveal
              id={axis.id}
              key={axis.id}
            >
              <span className="landing-axis__number">{axis.number}</span>
              <p className="landing-axis__category">{axis.name}</p>
              <div>
                <h3>{axis.title}</h3>
                <p>{axis.detail}</p>
              </div>
              <span className="landing-axis__symbol" aria-hidden="true">
                ↗
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-boundaries" aria-labelledby="boundaries-title">
        <div data-scroll-reveal>
          <p className="landing-eyebrow">El alcance de MODUS</p>
          <h2 id="boundaries-title">
            Orientar no es diagnosticar.
          </h2>
        </div>
        <p data-scroll-reveal>
          MODUS propone educación, apoyo entre pares y orientación no
          diagnóstica. No realiza diagnósticos ni brinda tratamiento
          psicológico.
        </p>
        <div className="landing-boundaries__action" data-scroll-reveal>
          <Link
            className="landing-button landing-button--primary"
            to="/login?modo=registro"
          >
            Crear una cuenta
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {/* Se conserva el acceso para volver al inicio; el pie común vive en PublicLayout. */}
      <div className="landing-footer">
        <button
          className="landing-footer__top"
          type="button"
          onClick={scrollToTop}
        >
          Volver arriba <span aria-hidden="true">↑</span>
        </button>
      </div>

    </div>
  );
};
