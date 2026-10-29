/*
 * Navegación principal reutilizada por Navbar: Inicio, Prevención y Comunidad.
 * NavLink relaciona cada acceso con AppRouter y permite destacar la ruta activa.
 */
// Los iconos son componentes visuales; el destino de cada enlace lo resuelve el router.
import { NavLink } from "react-router";
import { House, BookOpen, UsersRound } from "lucide-react";

// Un solo listado evita mantener menús distintos para móvil y escritorio.
const navigationItems = [
  { label: "Inicio", path: "/inicio", icon: House },
  { label: "Prevención", path: "/prevencion", icon: BookOpen },
  { label: "Comunidad", path: "/comunidad", icon: UsersRound },
];

// Los tres destinos principales comparten navegación en escritorio y móvil.
export const AppNavigation = () => {
  return (
    <nav
      aria-label="Navegación principal"
      className="order-3 w-full md:order-none md:w-auto"
    >
      <ul className="grid grid-cols-3 gap-1 md:flex">
        {/* map crea un enlace por destino; key identifica cada elemento para React.
            icon se renombra Icon para usarlo como componente JSX, con inicial mayúscula. */}
        {navigationItems.map(({ label, path, icon: Icon }) => (
          <li key={path}>
            {/* NavLink entrega isActive a className para elegir el estilo de selección.
                Las clases sin prefijo cubren móvil; sm: y md: ajustan pantallas mayores.
                focus-visible muestra el foco y motion-reduce respeta movimiento reducido. */}
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal sm:flex-row sm:gap-2 sm:px-3
                ${
                  isActive
                    ? "bg-brand-teal text-white"
                    : "text-ink hover:bg-surface-soft"
                }`
              }
            >
              {/* El texto ya nombra el destino; aria-hidden evita anunciar también el icono. */}
              <Icon size={20} aria-hidden="true" className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
