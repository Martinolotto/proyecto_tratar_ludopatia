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

        <Link to="/login" className="text-brand-teal">
          Iniciar sesión
        </Link>
      </header>

      {/* Solo cambia la página hija; el layout mantiene la estructura y sus márgenes. */}
      <main className="mx-auto max-w-5xl p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};
