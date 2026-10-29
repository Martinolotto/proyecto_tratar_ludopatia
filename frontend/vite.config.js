/*
 * Configuración de Vite: transforma React y Tailwind y prepara el servidor local.
 * Los scripts dev y build de package.json utilizan este archivo; no es lógica de producto.
 */
// Cada plugin conecta su herramienta con el proceso de desarrollo y compilación de Vite.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // React procesa JSX y su recarga de desarrollo; Tailwind genera las utilidades CSS.
  plugins: [react(), tailwindcss()],
  // Estas opciones solo corresponden al servidor de desarrollo, no al despliegue final.
  server: {
    port: 5173,
    // Reenviar /api a Express conserva el prefijo: /api no se convierte en /.
    // Actualmente Express solo tiene GET /; todavía no hay integración funcional aquí.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
