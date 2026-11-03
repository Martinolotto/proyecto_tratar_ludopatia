/*
 * Estructura compartida de las páginas de la aplicación: Navbar, contenido principal, Footer y Dashboard.
 * AppRouter selecciona la página; Outlet la coloca dentro de este layout.
 */
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { Navbar } from "../components/navigation/Navbar.jsx";
import { Dashboard } from "../components/navigation/Dashboard.jsx";
import { Footer } from "../components/navigation/Footer.jsx";

export const AppLayout = () => {
  const dashboardRef = useRef(null);
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  const openDashboard = () => {
    if (!dashboardRef.current.open) {
      dashboardRef.current.showModal();
    }
  };

  useEffect(() => {
    mainRef.current.focus();
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-surface px-4 py-3 text-brand-teal focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20"
      >
        Ir al contenido
      </a>

      <Navbar onOpenDashboard={openDashboard} />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none sm:px-6 md:py-8"
      >
        <Outlet context={{ openDashboard }} />
      </main>

      <Footer />

      <Dashboard dialogRef={dashboardRef} />
    </div>
  );
};
