/*
 * Cabecera compartida que AppLayout muestra en todas sus páginas.
 * Incluye el isotipo del logo MODUS y la navegación principal.
 */
import { Link } from "react-router";
import { PanelRightOpen, UserRound } from "lucide-react";
import { AppNavigation } from "./AppNavigation.jsx";
import logoModus from "../../assets/logo.jpg";

export const Navbar = ({ onOpenDashboard }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-brand-navy/20 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Marca con Iso-Logo */}
        <Link
          to="/inicio"
          aria-label="MODUS — Inicio"
          className="flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          <img
            src={logoModus}
            alt=""
            aria-hidden="true"
            className="h-8 w-auto rounded object-contain"
          />
          <span className="font-heading text-xl font-bold text-brand-navy">
            MODUS
          </span>
        </Link>

        <AppNavigation />

        <div className="flex items-center gap-2">
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
