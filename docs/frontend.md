# MODUS — Guía de estructura y desarrollo frontend

## 1. Propósito

Este documento explica la organización del frontend de MODUS, las responsabilidades de sus carpetas y los criterios que deben seguir los desarrolladores.

El objetivo es facilitar el desarrollo colaborativo, mantener un código comprensible y evitar duplicaciones o cambios innecesarios en la estructura compartida.

## 2. Tecnologías

- JavaScript con ESModules.
- React para construir la interfaz.
- Vite como servidor de desarrollo y herramienta de compilación.
- React Router para la navegación.
- Tailwind CSS 4 para estilos.
- Lucide React para iconografía.
- ESLint para analizar el código.
- Supabase para autenticación y operaciones de datos, cuando se integre.

## 3. Organización del código

### Punto de entrada

**main.jsx:** monta la aplicación React y carga los estilos y fuentes globales.

**App.jsx:** componente raíz que incorpora AppRouter. No debe concentrar las funcionalidades de las páginas.

### Navegación

**router/AppRouter.jsx:** define las rutas y qué páginas corresponden a cada dirección.

No duplicar la definición de rutas en componentes individuales.

### Layouts

**PublicLayout.jsx:** estructura compartida por las páginas públicas.

**AppLayout.jsx:** estructura compartida de las páginas de la aplicación, con navegación, encabezado y área de contenido. Es el lugar previsto para disponer del Dashboard global desplegable. Actualmente no verifica sesión: “layout autenticado” describe su destino funcional, no una protección ya implementada.

Los layouts no deben contener la lógica particular de los ejes funcionales.

### Componentes

**components/:** elementos visuales o interactivos reutilizables entre páginas.

**components/navigation/:** componentes relacionados con la navegación, incluida la adaptación a escritorio y móvil.

No crear componentes compartidos cuando su reutilización no tenga una finalidad concreta.

### Páginas

- **home/:** Home autenticada; entrada integrada de los tres ejes, con resúmenes, accesos y contenidos destacados según los RF. La página actual solo presenta accesos iniciales.
- **prevencion/:** páginas del eje funcional de Prevención/Concientización.
- **comunidad/:** páginas del eje de Vinculación y apoyo entre pares.
- **mi-espacio/:** página inicial existente asociada a `/mi-espacio`; permanece como parte de la base anterior, pendiente de adaptar a la decisión vigente del Dashboard. No define la navegación definitiva del eje 2.
- **onboarding/:** experiencia inicial del usuario.
- **perfil/:** identidad y configuración de la cuenta.
- **publicas/:** landing, inicio de sesión y registro.
- **errores/:** páginas de error y rutas inexistentes.

Home, Dashboard y Perfil tienen responsabilidades diferentes: Home integra la experiencia; Dashboard es un panel global desplegable de accesos; Perfil mantiene identidad y configuración de la cuenta.

Las páginas iniciales son componentes mínimos conectados al router. Sus funcionalidades se implementarán posteriormente según los RF aprobados.

### Decisión vigente: Dashboard global desplegable

El responsable del proyecto definió Dashboard como un panel disponible desde el layout autenticado, no como una cuarta página principal junto a Inicio, Prevención y Comunidad. Sus filas con icono, título y acceso abren páginas independientes de herramientas: Mi actividad, Historial y progreso y Escudo digital.

El panel no debe concentrar los formularios o gráficos completos. Puede priorizar accesos con el contexto del onboarding, sin ocultar herramientas. Esta precisión de interacción sustituye la interpretación anterior del Dashboard como página, conservando las capacidades aprobadas del eje 2.

**Diferencia con el código actual:** `AppRouter.jsx` conserva `/mi-espacio`; `AppNavigation.jsx` lo presenta como cuarta entrada y `HomePage.jsx` enlaza allí. `AppLayout.jsx` aún no contiene el panel desplegable. Estos archivos se mantienen intactos en esta etapa documental; su adaptación debe realizarse coordinadamente en una tarea posterior, sin borrar o renombrar la página de forma aislada. Las páginas de herramientas todavía no existen y no se fijan nuevas URLs en esta guía.

La documentación visual anterior que muestre cuatro páginas principales debe tratarse como referencia histórica para este punto. La [guía de diseño vigente, versión 1.1](design/DESIGN_GUIDELINES.md), confirma el Dashboard global desplegable y colapsable; no cambia la adaptación del código que sigue pendiente.

### Límites funcionales relevantes

- El onboarding aprobado aparece una sola vez tras el registro: hasta cinco preguntas, posibilidad de omitir y sin edición posterior. La ruta actual todavía está bajo `PublicLayout` y su página es inicial, sin flujo ni sesión implementados.
- Mi actividad permite una entrada del día actual por usuario, actualizable ese día y sin creación, edición o eliminación retroactiva. Historial y progreso interpreta únicamente información declarada; un día sin registro no es un día sin apostar.
- Escudo digital organiza medidas y recursos prácticos; coordinar sus recursos con Prevención. Compartir logros es voluntario y depende de Comunidad, sin publicar registros completos.
- Chatbot global y “Necesito ayuda ahora” siguen pendientes. Laboratorio de decisiones no es herramienta aprobada del MVP.

Los detalles completos, condiciones y criterios de aceptación permanecen en las tarjetas de Trello; esta guía no los reemplaza.

## 4. Convenciones de desarrollo

- Componentes React en PascalCase y archivos `.jsx`.
- Funciones y variables en camelCase.
- Hooks personalizados con prefijo `use`.
- Exportaciones nombradas preferentemente, manteniendo las existentes cuando corresponda.
- Indentación uniforme de dos espacios.
- Nombres descriptivos en inglés para identificadores técnicos.
- Textos visibles al usuario en español.
- Comentarios explicativos en español.

Los comentarios deben describir responsabilidades, reglas, decisiones y comportamientos que no resulten evidentes. No comentar mecánicamente cada línea.

## 5. Separación de responsabilidades

- Las páginas representan pantallas.
- Los componentes reutilizables representan partes de la interfaz.
- Los layouts contienen estructuras visuales compartidas.
- El router administra la navegación.
- Las futuras consultas de datos deben organizarse fuera de componentes exclusivamente visuales cuando su complejidad lo justifique.

Se permite crear carpetas, páginas y archivos iniciales que respondan a una estructura previamente aprobada por el equipo, aunque todavía no tengan lógica funcional. No generar capas, hooks, servicios, dependencias ni funcionalidades ficticias por iniciativa del agente.

La [arquitectura de datos y servidor](backend.md#arquitectura-aprobada-supabase-y-express) prevé acceso directo de React a Supabase mediante `supabase-js`, sesión autenticada y permisos/RLS para operaciones habituales. Express se reserva para necesidades concretas de servidor. La integración todavía no existe; esta guía no autoriza crear clientes, tablas o endpoints en la revisión documental.

## 6. Diseño

La referencia visual del repositorio es [DESIGN_GUIDELINES.md](design/DESIGN_GUIDELINES.md), convención `MODUS-DS-001`, versión 1.1: base de diseño aceptada por el responsable para iniciar implementación. Sus referencias visuales no sustituyen decisiones funcionales ni políticas de acceso; ante contradicciones, prevalecen los RF vigentes y se consulta al responsable.

El sistema de estilos disponible está centralizado en `frontend/src/index.css`: variables `--modus-*`, tokens de color mediante `@theme inline` y fuentes Inter/Manrope cargadas desde `main.jsx`. Reutilizar clases como `bg-surface`, `text-brand-navy`, `text-brand-teal`, `font-sans` y `font-heading`, e iconos de Lucide cuando correspondan.

Tailwind CSS 4 se incorpora mediante `@tailwindcss/vite` en `vite.config.js` y `@import "tailwindcss"` en el CSS global. No agregar configuración de Tailwind de otra versión.

Los seis colores de marca actuales y las fuentes Inter/Manrope coinciden con la guía. Lucide ya está disponible en el proyecto. Los tokens semánticos adicionales de borde, texto secundario y feedback siguen por definir o derivar; no se incorporan valores nuevos en esta revisión.

La guía ya está incorporada, pero su aplicación y validación no se consideran terminadas. Siguen pendientes sus comprobaciones de contraste en componentes reales, navegación y estados responsive, comparación de flujos con RF finales y confirmación de permisos públicos/privados. Su política de acceso no se deduce de un mockup. Coordinar la evolución de los tokens y evitar valores arbitrarios repetidos entre componentes.

La experiencia debe ser juvenil, atractiva, accesible e interactiva. Se permiten ilustraciones, animaciones y elementos lúdicos adecuados, sin imitar apuestas, incentivar uso compulsivo ni adoptar una apariencia hospitalaria o infantilizada.

## 7. Desarrollo colaborativo

Cada integrante puede desarrollar las páginas y funcionalidades de su eje.

Los cambios a layouts, navegación, componentes compartidos, autenticación o configuraciones generales deben coordinarse con el equipo.

Antes de integrar cambios a `develop`, comprobar el funcionamiento de las rutas afectadas y ejecutar:

```bash
npm run lint
npm run build
```

Estos comandos se ejecutan dentro de `frontend/`.

No implementar datos ficticios como si fueran funcionalidades reales ni añadir sistemas de autenticación simulados.

Las decisiones vigentes del equipo tienen prioridad sobre referencias históricas. Los requisitos funcionales se mantienen en [Trello](https://trello.com/b/nMHsAZXQ/proyecto-tratar-ludopatia), incluidas las capacidades del eje 2 en [su definición funcional](https://trello.com/c/DoYehTF4) y RF-DO-01 a RF-DO-13. La precisión actual del Dashboard se documenta arriba sin modificar el tablero.

Las dependencias y scripts existentes están en `frontend/package.json`; los comandos desde la raíz se resumen en el [README](../README.md). No hay integración de Supabase ni protección real de rutas todavía. El proxy `/api` de Vite tampoco implica una API funcional: ver [docs/backend.md](backend.md).

## 8. Uso de agentes de IA

Los agentes deben leer esta guía, el `AGENTS.md` raíz, [frontend/AGENTS.md](../frontend/AGENTS.md) y la constitución antes de modificar el frontend.

Deben respetar la estructura existente, explicar cambios importantes y evitar instalaciones o reestructuraciones no solicitadas.

La utilización personal de SDD es opcional y no constituye una obligación para el resto del equipo.
