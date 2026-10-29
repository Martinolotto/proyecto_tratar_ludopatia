/*
 * Panel global de accesos a herramientas; AppLayout lo monta y controla su apertura.
 * La ref recibida apunta al diálogo HTML. Aquí se gestionan cierres y teclado.
 * Cada enlace abre una página independiente; el panel no contiene sus funcionalidades.
 */
// El router informa cambios de navegación y Lucide aporta los iconos del panel.
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { CalendarDays, ChartNoAxesCombined, Shield, X } from "lucide-react";

// Este catálogo reúne las tres herramientas aprobadas y sus rutas existentes.
const tools = [
  { title: "Mi actividad", path: "/mi-actividad", icon: CalendarDays },
  {
    title: "Historial y progreso",
    path: "/historial-y-progreso",
    icon: ChartNoAxesCombined,
  },
  { title: "Escudo digital", path: "/escudo-digital", icon: Shield },
];

// El diálogo nativo contiene el foco y permite cerrar con Escape sin otra librería.
export const Dashboard = ({ dialogRef }) => {
  // location.key cambia con la entrada de historial, incluso al volver a una misma URL.
  const location = useLocation();

  // Sincronizar el diálogo con la navegación para no dejarlo abierto sobre otra página.
  useEffect(() => {
    // También cerrar si la navegación ocurre con Atrás/Adelante del navegador.
    // ?. evita acceder a open si la referencia todavía no tiene un elemento asignado.
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [location.key, dialogRef]);

  // Compartir el cierre entre botón, enlaces y fondo mantiene una única acción.
  const closeDashboard = () => dialogRef.current.close();

  // El evento de teclado sube desde los controles al diálogo que contiene el panel.
  const handleKeyDown = (event) => {
    // Las demás teclas conservan su comportamiento nativo, incluido Escape.
    if (event.key !== "Tab") return;

    // Mantener el ciclo de teclado dentro del panel, también en sus extremos.
    // currentTarget es el diálogo; target es el control donde comenzó el evento.
    const controls = event.currentTarget.querySelectorAll("button, a[href]");
    const firstControl = controls[0];
    const lastControl = controls[controls.length - 1];

    // Shift+Tab desde el primero vuelve al último; Tab desde el último vuelve al primero.
    // preventDefault evita que el navegador saque el foco antes de moverlo manualmente.
    if (event.shiftKey && event.target === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && event.target === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  };

  // El diálogo ocupa el ancho móvil y se limita a un lateral desde sm:.
  // aria-labelledby y aria-describedby lo conectan con su título y explicación visibles.
  return (
    <dialog
      id="app-dashboard"
      ref={dialogRef}
      aria-labelledby="dashboard-title"
      aria-describedby="dashboard-description"
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        // Cerrar solo si el clic cae en el propio diálogo, fuera de su contenido interior.
        // Los clics de sus hijos también llegan aquí, pero tienen otro target.
        if (event.target === event.currentTarget) {
          closeDashboard();
        }
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto border-l border-brand-navy/20 bg-surface p-0 text-ink backdrop:bg-brand-navy/40 sm:max-w-sm"
    >
      <div className="flex min-h-full flex-col p-6">
        {/* El título identifica el panel y el botón ofrece un cierre explícito accesible. */}
        <div className="flex items-start justify-between gap-4">
          <h2 id="dashboard-title" className="text-2xl font-semibold">
            Dashboard
          </h2>

          <button
            type="button"
            onClick={closeDashboard}
            aria-label="Cerrar Dashboard"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* La descripción explica el propósito del panel al verlo o usar un lector de pantalla. */}
        <p id="dashboard-description" className="mt-2 leading-relaxed">
          Accedé a tus herramientas personales.
        </p>

        {/* map genera las filas desde tools; key conserva la identidad de cada destino.
            icon se renombra Icon para renderizar el componente de Lucide correspondiente. */}
        <nav aria-label="Herramientas personales" className="mt-6">
          <ul className="space-y-2">
            {tools.map(({ title, path, icon: Icon }) => (
              <li key={path}>
                {/* El clic cierra el panel y NavLink navega; isActive destaca la ruta actual. */}
                <NavLink
                  to={path}
                  onClick={closeDashboard}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${
                      isActive
                        ? "bg-brand-teal text-white"
                        : "text-ink hover:bg-surface-soft"
                    }`
                  }
                >
                  {/* El título ya describe el acceso: el icono se oculta a lectores de pantalla. */}
                  <Icon size={22} aria-hidden="true" />
                  {title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </dialog>
  );
};
