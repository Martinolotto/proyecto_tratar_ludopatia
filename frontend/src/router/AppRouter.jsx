/*
 * Mapa central de URL: relaciona cada dirección con una página y su layout.
 * App lo renderiza; los enlaces de navegación utilizan las rutas declaradas aquí.
 * Agrupar rutas bajo AppLayout todavía no restringe el acceso por sesión.
 */
// BrowserRouter conecta la navegación React con la dirección y el historial del navegador.
import { BrowserRouter, Route, Routes } from "react-router";

// Layouts: estructuras comunes para las páginas.
import { AppLayout } from "../layouts/AppLayout.jsx";
import { PublicLayout } from "../layouts/PublicLayout.jsx";

// Página principal de la aplicación.
import { HomePage } from "../pages/home/HomePage.jsx";

// Páginas iniciales de Prevención, Comunidad y Perfil.
import { PrevencionPage } from "../pages/prevencion/PrevencionPage.jsx";
import { ComunidadPage } from "../pages/comunidad/ComunidadPage.jsx";
import { PerfilPage } from "../pages/perfil/PerfilPage.jsx";

// Las herramientas comparten carpeta por eje, pero cada una tiene su propia ruta.
// El Dashboard permanece como panel global en AppLayout.
import { MiActividadPage } from "../pages/deteccion/MiActividadPage.jsx";
import { HistorialYProgresoPage } from "../pages/deteccion/HistorialYProgresoPage.jsx";
import { EscudoDigitalPage } from "../pages/deteccion/EscudoDigitalPage.jsx";

// Páginas públicas y flujo inicial.
import { LandingPage } from "../pages/publicas/LandingPage.jsx";
import { LoginPage } from "../pages/publicas/LoginPage.jsx";
import { RegisterPage } from "../pages/publicas/RegisterPage.jsx";
import { OnboardingPage } from "../pages/deteccion/OnboardingPage.jsx";

// Página para direcciones que no existen.
import { NotFoundPage } from "../pages/errores/NotFoundPage.jsx";

export const AppRouter = () => {
  // Routes selecciona la coincidencia; cada layout muestra su página hija con Outlet.
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas que utilizan la estructura pública. */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          {/* Onboarding será la primera pantalla tras el registro; la conexión sigue pendiente. */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* El comodín muestra la página de error si ninguna ruta concreta coincide. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Páginas de la aplicación con navegación compartida. */}
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/prevencion" element={<PrevencionPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          {/* Cada herramienta ocupa una página completa dentro del mismo layout. */}
          <Route path="/mi-actividad" element={<MiActividadPage />} />
          <Route
            path="/historial-y-progreso"
            element={<HistorialYProgresoPage />}
          />
          <Route path="/escudo-digital" element={<EscudoDigitalPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
