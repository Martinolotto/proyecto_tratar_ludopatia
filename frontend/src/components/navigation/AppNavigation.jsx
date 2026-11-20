/*
 * Navegación principal compartida: React Router señala el destino activo.
 * Los iconos acompañan el nombre y conservan una sola fuente de rutas.
 */
import { NavLink } from "react-router";
import { BookOpen, House, UsersRound } from "lucide-react";

const navigationItems = [
  { label: "Prevención", path: "/prevencion", icon: BookOpen },
  { label: "Inicio", path: "/inicio", icon: House },
  { label: "Comunidad", path: "/comunidad", icon: UsersRound },
];

export const AppNavigation = () => (
  <nav aria-label="Navegación principal" className="modus-navbar__navigation">
    <ul>
      {navigationItems.map(({ label, path, icon: Icon }) => (
        <li key={path}>
          <NavLink to={path} className={({ isActive }) =>
            `modus-navbar__link ${isActive ? "modus-navbar__link--active" : ""}`}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
