# MODUS — Reglas de frontend

Estas instrucciones aplican a `frontend/` y complementan el `AGENTS.md` raíz.
Antes de editar, leer `../docs/CONSTITUTION.md` y `../docs/frontend.md`.

## Stack y estructura

- Mantener JavaScript, ESModules, React, Vite, React Router y Tailwind CSS 4.
- Importar la navegación desde `react-router`, como el código existente.
- Conservar `src/main.jsx`, `src/App.jsx`, `src/router/`, `src/layouts/`, `src/pages/` y `src/components/`; no reinicializar el proyecto.
- Centralizar rutas en `src/router/AppRouter.jsx`; usar `Link`/`NavLink` para navegación interna y `Outlet` en layouts.
- Mantener componentes funcionales en archivos `.jsx`, PascalCase para componentes, camelCase para funciones y variables y prefijo `use` para Custom Hooks.
- Seguir las exportaciones existentes y la indentación de dos espacios; no reformatear archivos ajenos a la tarea.

## Responsabilidades

- Páginas: componer pantallas; layouts: estructura compartida; router y navegación: destinos y accesos.
- Separar presentación de la lógica de datos y reglas cuando su complejidad lo justifique.
- Extraer componentes reutilizables y Custom Hooks solo cuando aporten reutilización o claridad real.
- Se permite crear carpetas, páginas y archivos iniciales de una estructura previamente aprobada por el equipo, aunque todavía no tengan lógica funcional, para que los tres integrantes trabajen sobre una base consistente y comprensible.
- No generar capas, servicios, dependencias ni funcionalidades ficticias por iniciativa del agente; una pantalla inicial no equivale a una función implementada.
- Comentar en español responsabilidades, reglas y decisiones no evidentes, sin describir mecánicamente cada línea. Textos de interfaz en español.

## Dashboard y diseño

- La decisión vigente define Dashboard como panel global desplegable disponible desde el layout autenticado, con enlaces a páginas independientes de herramientas; no como cuarta página principal.
- Home es la entrada integrada de los tres ejes; Perfil mantiene identidad y configuración.
- El código aún conserva `/mi-espacio`: ver la transición pendiente en `../docs/frontend.md` antes de adaptar navegación, layouts o rutas. No renombrar ni borrar archivos de forma aislada.
- Reutilizar los tokens centralizados de `src/index.css`, las fuentes Inter/Manrope y Lucide existentes; evitar repetir colores o valores arbitrarios en componentes.
- Tailwind 4 ya está integrado mediante `@tailwindcss/vite` y `@import "tailwindcss"`; no introducir configuración de otra versión.
- Seguir [DESIGN_GUIDELINES.md](../docs/design/DESIGN_GUIDELINES.md), versión 1.1 (`MODUS-DS-001`), como base visual aceptada. Su incorporación no implica implementación o validación visual terminada; respetar sus pendientes y la prioridad de los RF vigentes. No sustituir tokens sin coordinación.
- Priorizar accesibilidad, foco visible, controles comprensibles y adaptación móvil/escritorio. Se admite estética lúdica apropiada para adolescentes, sin imitar apuestas ni incentivar uso compulsivo.

## Alcance y verificación

- Respetar decisiones vigentes y RF de Trello. No añadir funcionalidades ni tratar pantallas iniciales como capacidades terminadas.
- No implementar autenticación simulada, usuarios ficticios como sesión real ni protecciones basadas solo en ocultar elementos. Supabase Auth se integrará en una etapa posterior autorizada.
- Ningún secreto o credencial privilegiada debe llegar al navegador, incluidos valores expuestos mediante variables `VITE_*`.
- Coordinar cambios de rutas, layouts, tokens, sesión y contratos compartidos; aplicar las autorizaciones del `AGENTS.md` raíz.
- Para cambios de frontend ejecutar `npm --prefix frontend run lint` y `npm --prefix frontend run build` desde la raíz; comprobar además el comportamiento afectado cuando se cambie la interfaz.
- Informar fallos y verificaciones pendientes; no afirmar que build o lint comprueban autenticación o integración de datos.
