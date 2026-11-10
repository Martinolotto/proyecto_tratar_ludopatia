/*
 * Estructura de las páginas públicas: cabecera sencilla y zona de contenido.
 * AppRouter elige la página que Outlet renderiza; aquí no hay lógica de sesión.
 */
// Link navega dentro de React; Outlet reserva el lugar para la ruta hija activa.
import { Link, Outlet } from "react-router";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen">
      {/* Los enlaces reutilizan este encabezado en landing, acceso y demás rutas públicas. */}
      <header className="flex items-center justify-between bg-surface px-6 py-4">
        <Link to="/" className="font-heading text-xl font-bold text-brand-navy">
          MODUS
        </Link>

        {/* Cada enlace abre el mismo acceso con el formulario correspondiente. */}
        <nav aria-label="Acceso a la cuenta" className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <Link to="/login?modo=ingreso" className="rounded-md px-3 py-2 text-sm font-semibold text-brand-navy hover:underline focus-visible:outline-2 focus-visible:outline-brand-teal">
            Iniciar sesión
          </Link>
          <Link to="/login?modo=registro" className="rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal">
            Registrarse
          </Link>
        </nav>
      </header>

      {/* Solo cambia la página hija; el layout mantiene la estructura y sus márgenes. */}
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};
