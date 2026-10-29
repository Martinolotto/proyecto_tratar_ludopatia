/*
 * Entrada del frontend: conecta React con el elemento #root de index.html.
 * Carga fuentes y estilos compartidos antes de renderizar App, el componente raíz.
 */
// Estos imports reúnen las herramientas de montaje y los recursos visuales globales.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import './index.css'
import App from './App.jsx'

// createRoot permite que React gestione el contenido del contenedor HTML.
// StrictMode activa comprobaciones de desarrollo para detectar problemas;
// no agrega una pantalla ni implementa autenticación.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
