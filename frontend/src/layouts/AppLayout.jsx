/*
 * Estructura compartida: Navbar, barra personal y páginas de la aplicación.
 * AppRouter aporta Outlet; aquí se coordinan identidad, navegación y sesión.
 */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Navbar } from "../components/navigation/Navbar.jsx";
import { Sidebar } from "../components/navigation/Sidebar.jsx";
import { useNavigationProfile } from "../components/navigation/useNavigationProfile.js";
import { supabase } from "../lib/supabase.js";

export const AppLayout = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const dialogRef = useRef(null);
  const mainRef = useRef(null);
  const signOutLock = useRef(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, refreshNavigationProfile } = useNavigationProfile();

  // El mismo acceso abre la barra y enfoca su primera herramienta en ambos tamaños.
  const openSidebar = () => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (desktop) setExpanded(true);
    else if (!dialogRef.current.open) {
      dialogRef.current.showModal();
      setMobileOpen(true);
    }
    requestAnimationFrame(() => {
      const container = desktop ? document.getElementById("app-sidebar") : dialogRef.current;
      container?.querySelector('[data-first-tool="true"]')?.focus();
    });
  };
  const closeMobileSidebar = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  // La promesa debe confirmarse antes de navegar; el ref impide clics simultáneos.
  const signOut = async () => {
    if (signOutLock.current) return;
    signOutLock.current = true;
    setSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      navigate("/login", { replace: true });
    } catch {
      // Auth puede borrar la sesión local antes de que falle la revocación remota.
      // No restauramos credenciales: comprobamos el estado real de este navegador.
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          navigate("/login", {
            replace: true,
            state: { logoutWarning: "La sesión se cerró en este navegador, pero no pudimos confirmar su cierre en el servidor." },
          });
        } else {
          setSignOutError("No pudimos cerrar la sesión. Intentá nuevamente.");
        }
      } catch {
        // Si tampoco es posible comprobar la sesión, no aseguramos su estado.
        navigate("/login", {
          replace: true,
          state: { logoutWarning: "No pudimos comprobar el estado de tu sesión. Volvé a ingresar cuando tengas conexión." },
        });
      }
    } finally {
      signOutLock.current = false;
      setSigningOut(false);
    }
  };

  useEffect(() => {
    closeMobileSidebar();
    mainRef.current.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 1024px)");
    const handleResize = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) closeMobileSidebar();
    };
    breakpoint.addEventListener("change", handleResize);
    return () => breakpoint.removeEventListener("change", handleResize);
  }, []);

  const sidebarProps = { profile, onSignOut: signOut, signingOut, signOutError };
  return (
    <div className="modus-app-shell flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-surface px-4 py-3 text-brand-teal focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Ir al contenido
      </a>
      <Navbar
        onOpenSidebar={openSidebar}
        sidebarExpanded={isDesktop ? expanded : mobileOpen}
        sidebarControls={isDesktop ? "app-sidebar" : "app-sidebar-mobile"}
        profile={profile}
      />
      <div className="modus-app-body">
        <div
          className={`modus-sidebar-desktop ${expanded ? "" : "modus-sidebar-desktop--collapsed"}`}
          id="app-sidebar"
        >
          <Sidebar
            {...sidebarProps}
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
          />
        </div>
        <div className="modus-app-content">
          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none sm:px-6 md:py-8"
          >
            {/* Las páginas hijas reciben acciones compartidas mediante el router. */}
            <Outlet
              context={{
                openSidebar,
                sidebarExpanded: isDesktop ? expanded : mobileOpen,
                sidebarControls: isDesktop ? "app-sidebar" : "app-sidebar-mobile",
                refreshNavigationProfile,
                signOutInProgress: signOutLock,
              }}
            />
          </main>
        </div>
      </div>
      {/* El diálogo móvil reutiliza la misma barra y permite cerrar con Escape. */}
      <dialog
        id="app-sidebar-mobile"
        ref={dialogRef}
        className="modus-sidebar-dialog"
        aria-label="Herramientas personales"
        onClose={() => setMobileOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMobileSidebar();
        }}
      >
        <Sidebar
          {...sidebarProps}
          mobile
          expanded
          onToggle={closeMobileSidebar}
          onNavigate={closeMobileSidebar}
        />
      </dialog>
    </div>
  );
};
