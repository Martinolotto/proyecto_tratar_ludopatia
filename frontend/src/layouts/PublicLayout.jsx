/*
 * Estructura de las páginas públicas: cabecera, contenido y pie compartido.
 * AppRouter elige la página que Outlet renderiza; aquí no hay lógica de sesión.
 */
// Link navega dentro de React; Outlet reserva el lugar para la ruta hija activa.
import { Link, Outlet, useLocation } from "react-router";
import { Footer } from "../components/navigation/Footer.jsx";

export const PublicLayout = () => {
  // La cabecera del acceso acompaña el fondo oscuro sin alterar la Landing.
  const isAccessPage = useLocation().pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Los enlaces reutilizan este encabezado en landing, acceso y demás rutas públicas. */}
      <header className={`flex items-center justify-between px-4 py-4 sm:px-6 ${
        isAccessPage
          ? "relative z-10 border-b border-white/15 bg-brand-navy/95 text-white backdrop-blur-md"
          : "bg-surface text-brand-navy"
      }`}>
        <Link to="/" className="font-heading text-xl font-bold">
          MODUS
        </Link>

        {/* Cada enlace abre el mismo acceso con el formulario correspondiente. */}
        <nav aria-label="Acceso a la cuenta" className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <Link to="/login?modo=ingreso" className={`rounded-md px-3 py-2 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isAccessPage ? "text-white focus-visible:outline-white" : "text-brand-navy focus-visible:outline-brand-teal"
            }`}>
            Iniciar sesión
          </Link>
          <Link to="/login?modo=registro" className="rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal">
            Registrarse
          </Link>
        </nav>
      </header>

      {/* Solo cambia la página hija; el layout mantiene la estructura y sus márgenes. */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-6 md:p-10">
        <Outlet />
      </main>

      {/* El pie compartido mantiene los mismos accesos que el resto de MODUS. */}
      <Footer />
    </div>
  );
};
