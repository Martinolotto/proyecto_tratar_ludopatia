/*
 * Pantalla de error 404 para rutas inexistentes en PublicLayout.
 * Permite al usuario volver a la página principal.
 */
import { Link } from "react-router";
import { House, FileQuestion } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <section className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft text-brand-teal">
        <FileQuestion size={36} aria-hidden="true" />
      </div>

      <h1 className="font-heading text-4xl font-bold text-brand-navy">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-ink">
        Página no encontrada
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/80">
        La página que estás buscando no existe o fue movida.
      </p>

      <Link
        to="/inicio"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
      >
        <House size={18} aria-hidden="true" />
        Volver al inicio
      </Link>
    </section>
  );
};
