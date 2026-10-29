/*
 * Componente raíz: entrega a AppRouter la elección de páginas y layouts.
 * main.jsx monta App; las funcionalidades particulares pertenecen a sus páginas.
 */
import { AppRouter } from "./router/AppRouter.jsx";

// Mantener esta composición pequeña evita mezclar el inicio de la app con cada eje.
function App() {
  return <AppRouter />;
}

// La exportación predeterminada permite importarlo como App desde main.jsx.
export default App;
