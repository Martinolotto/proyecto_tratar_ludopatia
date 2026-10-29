/*
 * Estructura compartida de las páginas de la aplicación: Navbar, contenido y Dashboard.
 * AppRouter selecciona la página; Outlet la coloca dentro de este layout.
 * Centraliza la apertura del panel y el foco al navegar; aún no verifica autenticación.
 */
// Los hooks conectan elementos HTML y cambios de ruta con el comportamiento del layout.
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { Navbar } from "../components/navigation/Navbar.jsx";
import { Dashboard } from "../components/navigation/Dashboard.jsx";

export const AppLayout = () => {
  // Una ref conserva el acceso al elemento HTML entre renderizados sin provocar otro.
  // Dashboard recibe la del diálogo; mainRef permite enfocar el contenido principal.
  const dashboardRef = useRef(null);
  const mainRef = useRef(null);
  // pathname contiene la ruta actual; su cambio dispara el efecto de foco de abajo.
  const { pathname } = useLocation();

  // Navbar y Home reciben esta misma función: ambos abren un único panel global.
  // showModal es del diálogo HTML y bloquea la interacción con el resto de la página.
  const openDashboard = () => {
    // Evitar volver a abrir un diálogo que ya está abierto.
    if (!dashboardRef.current.open) {
      dashboardRef.current.showModal();
    }
  };

  // useEffect ejecuta esta sincronización después del renderizado inicial y al navegar.
  useEffect(() => {
    // Al cambiar de página, llevar el foco al contenido y no perderlo en el panel.
    mainRef.current.focus();
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Atajo de teclado: salta la cabecera y lleva directamente al contenido. */}
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-surface px-4 py-3 text-brand-teal focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20"
      >
        Ir al contenido
      </a>

      {/* La prop comunica una acción del layout a la cabecera, sin duplicar el panel. */}
      <Navbar onOpenDashboard={openDashboard} />

      {/* tabIndex=-1 admite foco programático sin sumar main al recorrido de Tab. */}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 py-6 outline-none sm:px-6 md:py-8"
      >
        {/* La página hija recibe esta función mediante useOutletContext, como hace Home. */}
        <Outlet context={{ openDashboard }} />
      </main>

      {/* El panel sigue montado entre páginas; su ref permite abrirlo desde el layout. */}
      <Dashboard dialogRef={dashboardRef} />
    </div>
  );
};
