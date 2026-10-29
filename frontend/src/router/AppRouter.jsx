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

// Páginas iniciales de los tres ejes y del perfil.
import { PrevencionPage } from "../pages/prevencion/PrevencionPage.jsx";
import { ComunidadPage } from "../pages/comunidad/ComunidadPage.jsx";
import { MiEspacioPage } from "../pages/mi-espacio/MiEspacioPage.jsx";
import { PerfilPage } from "../pages/perfil/PerfilPage.jsx";

// Las herramientas tienen páginas propias; el Dashboard permanece en AppLayout.
import { MiActividadPage } from "../pages/mi-actividad/MiActividadPage.jsx";
import { HistorialYProgresoPage } from "../pages/historial-y-progreso/HistorialYProgresoPage.jsx";
import { EscudoDigitalPage } from "../pages/escudo-digital/EscudoDigitalPage.jsx";

// Páginas públicas y flujo inicial.
import { LandingPage } from "../pages/publicas/LandingPage.jsx";
import { LoginPage } from "../pages/publicas/LoginPage.jsx";
import { RegisterPage } from "../pages/publicas/RegisterPage.jsx";
import { OnboardingPage } from "../pages/onboarding/OnboardingPage.jsx";

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
          {/* Ubicación actual del onboarding: aún no hay flujo posterior al registro. */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* El comodín muestra la página de error si ninguna ruta concreta coincide. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Páginas de la aplicación con navegación compartida. */}
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/prevencion" element={<PrevencionPage />} />
          <Route path="/comunidad" element={<ComunidadPage />} />
          {/* Ruta conservada durante la transición; no representa el Dashboard global. */}
          <Route path="/mi-espacio" element={<MiEspacioPage />} />
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
