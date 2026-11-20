/*
 * Cabecera de MODUS: marca, destinos principales y acceso al perfil real.
 * AppLayout comparte el estado de la barra lateral y la foto de la cuenta.
 */
import { Link } from "react-router";
import { PanelLeftOpen, UserRound } from "lucide-react";
import { AppNavigation } from "./AppNavigation.jsx";
import logoModus from "../../assets/logo.jpg";
import "./Navbar.css";

export const Navbar = ({ onOpenSidebar, sidebarExpanded, sidebarControls, profile }) => (
  <header className="modus-header">
    <div className="modus-navbar">
      <Link to="/inicio" aria-label="MODUS — Inicio" className="modus-navbar__brand">
        <img src={logoModus} alt="" aria-hidden="true" />
        <span>MODUS</span>
      </Link>
      <AppNavigation />
      <div className="modus-navbar__actions">
        <button type="button" onClick={onOpenSidebar} aria-controls={sidebarControls}
          aria-expanded={sidebarExpanded} aria-label="Herramientas" className="modus-navbar__tools">
          <PanelLeftOpen size={21} aria-hidden="true" />
        </button>
        <Link to="/perfil" aria-label="Mi perfil" className="modus-navbar__profile">
          <UserRound size={21} aria-hidden="true" />
          {profile.avatar && <img key={profile.avatar} src={profile.avatar} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
        </Link>
      </div>
    </div>
  </header>
);
