/*
 * Cabecera compartida que AppLayout muestra en todas sus páginas.
 * Compone AppNavigation y recibe onOpenDashboard para solicitar abrir el panel.
 * No administra sesión ni datos de perfil; sus enlaces solo cambian de página.
 */
// Link mantiene navegación interna; Lucide aporta iconos y AppNavigation los tres destinos.
import { Link } from "react-router";
import { PanelRightOpen, UserRound } from "lucide-react";
import { AppNavigation } from "./AppNavigation.jsx";

// Estructura global: navegación principal, herramientas y acceso secundario al perfil.
export const Navbar = ({ onOpenDashboard }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-brand-navy/20 bg-surface">
      {/* sticky mantiene la cabecera visible; flex-wrap permite reorganizarla en móvil. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* La marca funciona como enlace de regreso al inicio de la aplicación. */}
        <Link
          to="/inicio"
          aria-label="MODUS — Inicio"
          className="rounded font-heading text-xl font-bold text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          MODUS
        </Link>

        {/* Delegar los destinos principales evita repetirlos en esta cabecera. */}
        <AppNavigation />

        <div className="flex items-center gap-2">
          {/* Es una acción, por eso usa button: invoca la función recibida del layout.
              Los atributos aria indican que abre el diálogo con id app-dashboard. */}
          <button
            type="button"
            onClick={onOpenDashboard}
            aria-haspopup="dialog"
            aria-controls="app-dashboard"
            className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-teal px-3 py-2 text-sm font-medium text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <PanelRightOpen size={20} aria-hidden="true" />
            Herramientas
          </button>

          {/* Perfil abre otra página; sr-only conserva su nombre accesible en móvil. */}
          <Link
            to="/perfil"
            className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <UserRound size={20} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Mi perfil</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
