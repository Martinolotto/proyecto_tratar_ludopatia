import { Link } from "react-router";

const footerLinkClass =
  "rounded-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-brand-navy/10 bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <span className="font-heading text-xl font-bold">MODUS</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              Un espacio educativo de prevención, orientación no diagnóstica y
              comunidad para adolescentes.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <h2 className="font-heading text-sm font-semibold">Navegación</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <Link to="/inicio" className={footerLinkClass}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/prevencion" className={footerLinkClass}>
                  Prevención
                </Link>
              </li>
              <li>
                <Link to="/comunidad" className={footerLinkClass}>
                  Comunidad
                </Link>
              </li>
              <li>
                <Link to="/perfil" className={footerLinkClass}>
                  Mi perfil
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Herramientas personales">
            <h2 className="font-heading text-sm font-semibold">
              Herramientas
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <Link to="/mi-actividad" className={footerLinkClass}>
                  Mi actividad
                </Link>
              </li>
              <li>
                <Link to="/historial-y-progreso" className={footerLinkClass}>
                  Historial y progreso
                </Link>
              </li>
              <li>
                <Link to="/escudo-digital" className={footerLinkClass}>
                  Escudo digital
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-white/70">
          <p>© {new Date().getFullYear()} MODUS.</p>
        </div>
      </div>
    </footer>
  );
};
