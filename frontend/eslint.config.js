/*
 * Reglas de análisis estático del frontend, utilizadas por npm run lint.
 * Revisan JavaScript, JSX y uso de hooks; no prueban flujos completos ni ejecutan la app.
 */
// Reunir reglas de JavaScript, React Hooks y compatibilidad con la recarga de Vite.
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist contiene resultados generados; el análisis se aplica a los archivos fuente.
  globalIgnores(['dist']),
  {
    // Usar las mismas reglas para módulos JavaScript y componentes JSX.
    files: ['**/*.{js,jsx}'],
    // Componer las recomendaciones existentes sin escribir reglas particulares por archivo.
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // Reconocer nombres del navegador como document; esto no los crea ni los ejecuta.
      globals: globals.browser,
      // Permitir la sintaxis JSX que React usa para describir elementos de interfaz.
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
