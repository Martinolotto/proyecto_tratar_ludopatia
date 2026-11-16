/*
 * Barra de herramientas y cuenta compartida. AppLayout administra su apertura,
 * identidad y cierre de sesión; React Router determina la opción activa.
 */
import { NavLink } from "react-router";
import {
  CalendarDays,
  ChartNoAxesCombined,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import "./Sidebar.css";

const tools = [
  { label: "Mi actividad", path: "/mi-actividad", icon: CalendarDays },
  { label: "Historial y progreso", path: "/historial-y-progreso", icon: ChartNoAxesCombined },
  { label: "Escudo digital", path: "/escudo-digital", icon: Shield },
];

export const Sidebar = ({
  expanded,
  onToggle,
  mobile = false,
  onNavigate,
  profile,
  onSignOut,
  signingOut,
  signOutError,
}) => {
  const showLabels = expanded || mobile;
  return (
    <aside className={`modus-sidebar ${showLabels ? "modus-sidebar--expanded" : ""}`}>
      <div className="modus-sidebar__profile">
        {showLabels && (
          <NavLink
            to="/perfil"
            onClick={onNavigate}
            className="modus-sidebar__profile-link"
            aria-label="Ir a mi perfil"
          >
            <span className="modus-sidebar__avatar">
              <UserRound size={20} aria-hidden="true" />
              {profile.avatar && (
                <img
                  key={profile.avatar}
                  src={profile.avatar}
                  alt=""
                  onError={(event) => { event.currentTarget.hidden = true; }}
                />
              )}
            </span>
            <span className="modus-sidebar__profile-text">
              <strong>{profile.alias || "Mi perfil"}</strong>
              <small>Mi perfil</small>
            </span>
          </NavLink>
        )}
        <button
          type="button"
          className="modus-sidebar__toggle"
          onClick={onToggle}
          aria-label={
            mobile
              ? "Cerrar herramientas"
              : expanded ? "Contraer barra de herramientas" : "Expandir barra de herramientas"
          }
          aria-expanded={mobile ? undefined : expanded}
        >
          {mobile ? (
            <X size={21} aria-hidden="true" />
          ) : expanded ? (
            <PanelLeftClose size={21} aria-hidden="true" />
          ) : (
            <PanelLeftOpen size={21} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* NavLink representa rutas reales y conserva el nombre accesible en modo contraído. */}
      <nav aria-label="Herramientas personales" className="modus-sidebar__navigation">
        <ul>
          {tools.map(({ label, path, icon: Icon }, index) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={onNavigate}
                aria-label={label}
                data-first-tool={index === 0 ? "true" : undefined}
                className={({ isActive }) =>
                  `modus-sidebar__item ${isActive ? "modus-sidebar__item--active" : ""}`
                }
              >
                <Icon size={21} aria-hidden="true" />
                <span className="modus-sidebar__label">{label}</span>
              </NavLink>
            </li>
          ))}
          {!showLabels && (
            <li>
              <NavLink
                to="/perfil"
                onClick={onNavigate}
                aria-label="Mi perfil"
                className="modus-sidebar__item"
              >
                <UserRound size={21} aria-hidden="true" />
                <span className="modus-sidebar__label">Mi perfil</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* La sesión se cierra realmente desde AppLayout y los errores siguen visibles. */}
      <div className="modus-sidebar__actions">
        {signOutError && (
          <p role="alert" className="modus-sidebar__error">{signOutError}</p>
        )}
        <button
          type="button"
          className="modus-sidebar__item modus-sidebar__logout"
          onClick={onSignOut}
          disabled={signingOut}
          aria-label={signingOut ? "Cerrando sesión" : "Cerrar sesión"}
        >
          <LogOut size={21} aria-hidden="true" />
          <span className="modus-sidebar__label">
            {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </span>
        </button>
      </div>
    </aside>
  );
};
