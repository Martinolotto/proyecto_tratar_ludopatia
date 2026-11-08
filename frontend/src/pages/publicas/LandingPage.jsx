import { useEffect, useRef, useState } from "react";
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
  const [accessMode, setAccessMode] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formNotice, setFormNotice] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const landingRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !accessMode) return;

    if (!dialog.open) dialog.showModal();
    setIsClosing(false);
    setShowPasswords(false);
    setFormNotice("");
    dialog.querySelector("[data-autofocus]")?.focus();
  }, [accessMode]);

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    landing.classList.add("modus-landing--reveal-ready");
    revealTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      landing.classList.remove("modus-landing--reveal-ready");
      revealTargets.forEach((target) => target.classList.remove("is-visible"));
    };
  }, []);

  const openAccessModal = (mode, event) => {
    openerRef.current = event.currentTarget;
    setAccessMode(mode);
  };

  const closeAccessModal = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open || isClosing) return;

    window.clearTimeout(closeTimerRef.current);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      if (dialog.open) {
        dialog.close();
        openerRef.current?.focus();
      }
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 170);
  };

  const handleModalClose = () => {
    window.clearTimeout(closeTimerRef.current);
    setAccessMode(null);
    setShowPasswords(false);
    setFormNotice("");
    setIsClosing(false);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setFormNotice(
      "Este formulario todavía no está conectado. No se enviaron tus datos.",
    );
  };

  const switchAccessMode = (mode) => {
    window.clearTimeout(closeTimerRef.current);
    setIsClosing(false);
    setAccessMode(mode);
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
            <button
              type="button"
              className="landing-button landing-button--primary"
              onClick={(event) => openAccessModal("register", event)}
            >
              Registrarse
              <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              className="landing-button landing-button--secondary"
              onClick={(event) => openAccessModal("login", event)}
            >
              Iniciar sesión
            </button>
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
          <span className="landing-map__point landing-map__point--one">
            <span className="landing-map__point-index">01</span>
            Prevención
          </span>
          <span className="landing-map__point landing-map__point--two">
            <span className="landing-map__point-index">02</span>
            Comunidad
          </span>
          <span className="landing-map__point landing-map__point--three">
            <span className="landing-map__point-index">03</span>
            Orientación
          </span>
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
          <button
            className="landing-button landing-button--primary"
            type="button"
            onClick={(event) => openAccessModal("register", event)}
          >
            Ver formulario de muestra
            <span aria-hidden="true">↗</span>
          </button>
          <p>El acceso real todavía no está disponible.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <Link className="landing-footer__brand" to="/" aria-label="MODUS, inicio">
          MODUS<span>.</span>
        </Link>
        <p>Educación, orientación y acompañamiento para adolescentes.</p>
        <a href="#landing-title" className="landing-footer__top">
          Volver arriba <span aria-hidden="true">↑</span>
        </a>
      </footer>

      <dialog
        ref={dialogRef}
        className={`landing-modal${isClosing ? " landing-modal--closing" : ""}`}
        aria-labelledby="landing-modal-title"
        aria-describedby="landing-modal-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeAccessModal();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeAccessModal();
        }}
        onClose={handleModalClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeAccessModal();
        }}
      >
        <section className="landing-modal__panel">
          <div className="landing-modal__heading">
            <div>
              <p className="landing-eyebrow landing-eyebrow--dark">
                MODUS <span aria-hidden="true">/</span>{" "}
                {accessMode === "register" ? "Crear cuenta" : "Tu espacio"}
              </p>
              <h2 id="landing-modal-title">
                {accessMode === "register"
                  ? "Registrarse"
                  : "Iniciar sesión"}
              </h2>
            </div>
            <button
              className="landing-modal__close"
              type="button"
              aria-label="Cerrar ventana"
              onClick={closeAccessModal}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <p id="landing-modal-description" className="landing-modal__intro">
            {accessMode === "register"
              ? "Completá tus datos para crear una cuenta."
              : "Ingresá tus datos para acceder a tu cuenta."}
          </p>

          {accessMode === "register" ? (
            <form
              className="landing-form"
              onSubmit={handleFormSubmit}
              onChange={() => setFormNotice("")}
            >
              <label className="landing-form__field">
                <span>Nombre</span>
                <input
                  autoComplete="name"
                  data-autofocus
                  name="name"
                  placeholder="Tu nombre"
                  required
                  type="text"
                />
              </label>

              <label className="landing-form__field">
                <span>Correo electrónico</span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="nombre@correo.com"
                  required
                  type="email"
                />
              </label>

              <label className="landing-form__field">
                <span>Contraseña</span>
                <input
                  autoComplete="new-password"
                  name="password"
                  placeholder="Ingresá una contraseña"
                  required
                  type={showPasswords ? "text" : "password"}
                />
              </label>

              <label className="landing-form__field">
                <span>Confirmar contraseña</span>
                <input
                  autoComplete="new-password"
                  name="passwordConfirmation"
                  placeholder="Volvé a ingresar la contraseña"
                  required
                  type={showPasswords ? "text" : "password"}
                />
              </label>

              <button
                className="landing-form__visibility"
                type="button"
                aria-pressed={showPasswords}
                onClick={() => setShowPasswords((visible) => !visible)}
              >
                {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              </button>

              <button
                className="landing-button landing-button--primary landing-form__submit"
                type="submit"
              >
                Registrarse
              </button>
            </form>
          ) : (
            <form
              className="landing-form"
              onSubmit={handleFormSubmit}
              onChange={() => setFormNotice("")}
            >
              <label className="landing-form__field">
                <span>Correo electrónico</span>
                <input
                  autoComplete="email"
                  data-autofocus
                  name="email"
                  placeholder="nombre@correo.com"
                  required
                  type="email"
                />
              </label>

              <label className="landing-form__field">
                <span>Contraseña</span>
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Ingresá tu contraseña"
                  required
                  type={showPasswords ? "text" : "password"}
                />
              </label>

              <button
                className="landing-form__visibility"
                type="button"
                aria-pressed={showPasswords}
                onClick={() => setShowPasswords((visible) => !visible)}
              >
                {showPasswords ? "Ocultar contraseña" : "Mostrar contraseña"}
              </button>

              <button
                className="landing-button landing-button--primary landing-form__submit"
                type="submit"
              >
                Iniciar sesión
              </button>
            </form>
          )}

          <p className="landing-form__notice" role="status" aria-live="polite">
            {formNotice ||
              "La autenticación todavía no está disponible. Este formulario no envía tus datos."}
          </p>

          <p className="landing-modal__switch">
            {accessMode === "register"
              ? "¿Ya tenés una cuenta?"
              : "¿Todavía no tenés cuenta?"}{" "}
            <button
              type="button"
              onClick={() =>
                switchAccessMode(
                  accessMode === "register" ? "login" : "register",
                )
              }
            >
              {accessMode === "register"
                ? "Iniciar sesión"
                : "Registrarse"}
            </button>
          </p>
        </section>
      </dialog>
    </div>
  );
};
