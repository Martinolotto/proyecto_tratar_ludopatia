/*
 * Página de inicio seleccionada por AppRouter dentro de AppLayout.
 * Ofrece accesos a los tres ejes: dos páginas y el panel global de herramientas.
 * Ofrece una entrada voluntaria a Mi actividad y accesos a los tres ejes.
 * Todavía no consulta actividad ni datos personales de una cuenta.
 */
// Link abre páginas; useOutletContext recibe acciones que el layout comparte con su Outlet.
import { Link, useOutletContext } from "react-router";
import { ArrowRight, CalendarDays } from "lucide-react";

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

      <p className="mt-2 leading-relaxed">
        Encontrá información, herramientas y espacios de apoyo a tu ritmo.
      </p>

      {/* Este acceso lleva a la página existente del eje 2. La invitación es
          voluntaria y no afirma que existan registros o datos de una cuenta. */}
      <section
        aria-labelledby="home-activity-title"
        className="mt-6 rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <CalendarDays size={24} className="mt-1 shrink-0 text-brand-teal" aria-hidden="true" />
          <div>
            <h2 id="home-activity-title" className="text-xl font-semibold text-brand-navy">
              Tu actividad, a tu ritmo
            </h2>
            <p className="mt-2 leading-relaxed text-ink">
              Mi actividad será un espacio de registro voluntario. Por ahora, podés conocer la página.
            </p>
            <Link
              to="/mi-actividad"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 font-medium text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
            >
              Conocer Mi actividad
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <h2 className="mt-8 text-xl font-semibold text-brand-navy">
        ¿Por dónde querés empezar?
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* map reutiliza la misma presentación; cada path identifica y dirige su enlace. */}
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <h3 className="text-lg font-semibold">{section.title}</h3>

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
