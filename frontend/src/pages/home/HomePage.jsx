/*
 * Página de inicio seleccionada por AppRouter dentro de AppLayout.
 * Ofrece accesos a los tres ejes: dos páginas y el panel global de herramientas.
 * Solo contiene navegación inicial; aún no consulta actividad ni datos personales.
 */
// Link abre páginas; useOutletContext recibe acciones que el layout comparte con su Outlet.
import { Link, useOutletContext } from "react-router";

// Estos textos son accesos estáticos de navegación, no resultados o datos de un usuario.
const sections = [
  {
    title: "Prevención",
    description: "Explorá contenidos sobre las apuestas.",
    path: "/prevencion",
  },
  {
    title: "Comunidad",
    description: "Encontrá espacios para compartir y participar.",
    path: "/comunidad",
  },
];

export const HomePage = () => {
  // Home abre el mismo panel global del layout, sin crear otra página Dashboard.
  const { openDashboard } = useOutletContext();

  return (
    <section>
      {/* Encabezado general: aún no hay nombre o alias de una sesión real disponible. */}
      <h1 className="text-3xl font-semibold">¡Bienvenido a MODUS!</h1>

      <p className="mt-2">¿Por dónde querés empezar?</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* map reutiliza la misma presentación; cada path identifica y dirige su enlace. */}
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>

            <p className="mt-2 text-sm">{section.description}</p>
          </Link>
        ))}

        {/* Este tercer acceso ejecuta openDashboard del layout en lugar de cambiar de URL.
            Las tres columnas aparecen desde md:; en móvil se conserva una sola columna. */}
        <button
          type="button"
          onClick={openDashboard}
          aria-haspopup="dialog"
          aria-controls="app-dashboard"
          className="rounded-xl border border-brand-navy/20 bg-surface p-5 text-left hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          <span className="block font-heading text-lg font-semibold">
            Herramientas personales
          </span>
          <span className="mt-2 block">Accedé a tus herramientas personales.</span>
        </button>
      </div>
    </section>
  );
};
