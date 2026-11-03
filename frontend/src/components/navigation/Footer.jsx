/*
 * Pie de página (Footer) compartido para la aplicación.
 * Mantiene la identidad visual con la paleta de colores de marca y accesos útiles.
 */
import { Link } from "react-router";
import { Shield, HeartHandshake } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-brand-navy/10 bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Columna 1: Marca y Propósito */}
          <div className="space-y-3">
            <span className="font-heading text-xl font-bold text-white">
              MODUS
            </span>
            <p className="text-xs text-white/70 leading-relaxed">
              Plataforma de concientización, orientación no diagnóstica y apoyo
              entre pares para jóvenes.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-brand-teal font-medium">
              <Shield size={14} aria-hidden="true" />
              <span>Espacio seguro y anónimo</span>
            </div>
          </div>

          {/* Columna 2: Navegación Principal */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white">
              Navegación
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-white/80">
              <li>
                <Link to="/inicio" className="transition hover:text-brand-teal">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/prevencion"
                  className="transition hover:text-brand-teal"
                >
                  Prevención
                </Link>
              </li>
              <li>
                <Link
                  to="/comunidad"
                  className="transition hover:text-brand-teal"
                >
                  Comunidad
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="transition hover:text-brand-teal">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Herramientas Personales */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white">
              Herramientas
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-white/80">
              <li>
                <Link
                  to="/mi-actividad"
                  className="transition hover:text-brand-teal"
                >
                  Mi Actividad
                </Link>
              </li>
              <li>
                <Link
                  to="/historial-y-progreso"
                  className="transition hover:text-brand-teal"
                >
                  Historial y Progreso
                </Link>
              </li>
              <li>
                <Link
                  to="/escudo-digital"
                  className="transition hover:text-brand-teal"
                >
                  Escudo Digital
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Asistencia */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-white">
              Asistencia
            </h3>
            <p className="mt-3 text-xs text-white/70 leading-relaxed">
              Si necesitás contención o ayuda inmediata, podés comunicarte
              gratuitamente a la Línea 141 (24 hs).
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-teal font-medium">
              <HeartHandshake size={14} aria-hidden="true" />
              <span>Confidencial y gratuito</span>
            </div>
          </div>
        </div>

        {/* Derechos de autor y créditos */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} MODUS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
