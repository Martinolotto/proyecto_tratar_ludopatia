/*
 * Pantalla de Escudo digital, accesible desde el Dashboard del eje de Detección.
 * Organiza las tres categorías de RF-DO-10; su catálogo aún no está conectado.
 * No inventa recursos ni afirma haber instalado o activado herramientas externas.
 */
import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ChevronDown, EyeOff, HeartHandshake, Shield } from "lucide-react";

// Las categorías provienen del alcance aprobado; no incluyen proveedores o contactos inventados.
const categories = [
  {
    id: "access",
    title: "Bloquear o restringir el acceso a apuestas",
    description: "Herramientas y guías para limitar el acceso.",
    icon: Shield,
  },
  {
    id: "stimuli",
    title: "Reducir publicidad y otros estímulos",
    description: "Opciones para reducir promociones, publicidad y notificaciones.",
    icon: EyeOff,
  },
  {
    id: "support",
    title: "Encontrar apoyo y orientación",
    description: "Recursos para buscar acompañamiento e información.",
    icon: HeartHandshake,
  },
];

export const EscudoDigitalPage = () => {
  // Una categoría puede abrirse o cerrarse sin guardar preferencias ni simular recursos.
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (id) => {
    setOpenCategory((previous) => (previous === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex items-center gap-3 text-brand-teal">
          <Shield size={26} aria-hidden="true" />
          <p className="text-sm font-semibold">Herramientas personales</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-brand-navy">Escudo digital</h1>
        <p className="mt-3 leading-relaxed text-ink">
          Explorá opciones para reducir el acceso a apuestas, los estímulos y encontrar orientación.
        </p>
      </header>

      {/* Esta aclaración impide presentar un catálogo pendiente como recursos disponibles. */}
      <p className="rounded-lg border border-brand-navy/10 bg-surface-soft p-4 text-sm leading-relaxed text-ink">
        Todavía no hay recursos conectados. Se incorporarán después de verificar
        sus fuentes y su disponibilidad.
      </p>

      <div className="space-y-3">
        {categories.map(({ id, title, description, icon: Icon }) => {
          const isOpen = openCategory === id;

          return (
            <section key={id} className="rounded-xl border border-brand-navy/10 bg-surface">
              {/* El botón controla el contenido identificado por aria-controls; no abre otro sitio. */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`shield-category-${id}`}
                onClick={() => toggleCategory(id)}
                className="flex min-h-16 w-full items-start gap-3 rounded-xl p-5 text-left text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                <Icon size={22} className="mt-1 shrink-0 text-brand-teal" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-lg font-semibold text-brand-navy">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed">{description}</span>
                </span>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={`mt-1 shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* El contenido existe para asociarlo con el botón y se oculta cuando está cerrado.
                  Cuando haya un catálogo real, aquí se podrán consultar sus recursos verificados. */}
              <div id={`shield-category-${id}`} hidden={!isOpen} className="border-t border-brand-navy/10 px-5 py-4">
                <p className="text-sm leading-relaxed text-ink">
                  No hay recursos cargados para esta categoría por el momento.
                </p>
              </div>
            </section>
          );
        })}
      </div>

      <Link
        to="/inicio"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-brand-teal underline focus-visible:outline-2 focus-visible:outline-brand-teal"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a Inicio
      </Link>
    </section>
  );
};
