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
- Supabase para autenticación y operaciones de datos.

## 3. Organización del código

### Punto de entrada

**main.jsx:** monta la aplicación React y carga los estilos y fuentes globales.

**App.jsx:** componente raíz que incorpora AppRouter. No debe concentrar las funcionalidades de las páginas.

### Navegación

**router/AppRouter.jsx:** define las rutas y qué páginas corresponden a cada dirección.

No duplicar la definición de rutas en componentes individuales.

### Layouts

**PublicLayout.jsx:** estructura compartida por las páginas públicas.

**AppLayout.jsx:** estructura compartida de las páginas de la aplicación. Monta `Navbar` y el panel global `Dashboard`, y entrega `openDashboard` a las páginas mediante el contexto de `Outlet`. Actualmente no verifica sesión: “layout autenticado” describe su destino funcional, no una protección ya implementada.

Los layouts no deben contener la lógica particular de los ejes funcionales.

### Componentes

**components/:** elementos visuales o interactivos reutilizables entre páginas.

**components/navigation/:** componentes relacionados con la navegación, incluida la adaptación a escritorio y móvil.

- `AppNavigation.jsx`: enlaces a Inicio, Prevención y Comunidad.
- `Navbar.jsx`: cabecera global con esa navegación, botón de herramientas y acceso secundario a Perfil.
- `Dashboard.jsx`: panel de herramientas con diálogo nativo; cierra por botón, Escape, fondo o navegación. Maneja los extremos de Tab/Shift+Tab y el layout enfoca el contenido al cambiar de página. Se presenta lateralmente en escritorio y a ancho completo en móvil.

No crear componentes compartidos cuando su reutilización no tenga una finalidad concreta.

### Páginas

- **home/:** entrada integrada de los tres ejes en `/inicio`; ofrece accesos, una guía interactiva y contenidos destacados de Prevención. Todavía no muestra resúmenes personales basados en datos de una cuenta.
- **prevencion/:** páginas y contenido del eje de Prevención/Concientización.
- **comunidad/:** páginas del eje de Vinculación y apoyo entre pares.
- **deteccion/:** Onboarding, Mi actividad, Historial y progreso y Escudo digital. Cada página conserva su ruta independiente; `onboardingQuestions.js` reúne el contenido de las cinco preguntas.
- **perfil/:** identidad y configuración de la cuenta; su interfaz no acredita autenticación ni persistencia.
- **publicas/:** Landing y página `/login`, con formularios de registro e inicio de sesión conectados a Supabase Auth. Los accesos de la Landing seleccionan el formulario mediante `?modo=registro` o `?modo=ingreso`.
- **errores/:** páginas de error y rutas inexistentes.

Mi espacio y su ruta fueron retirados por decisión del responsable; no hay una cuarta página principal ni un reemplazo del Dashboard como panel.

Home, Dashboard y Perfil tienen responsabilidades diferentes: Home integra la experiencia; Dashboard es un panel global desplegable de accesos; Perfil mantiene identidad y configuración de la cuenta.

### Estado actual del eje de Detección/Orientación

- **Onboarding (`/onboarding`):** recorrido de cinco preguntas con selección, progreso, retroceso conservando respuestas, omisión individual o completa y cierre local con acceso a Inicio. Las respuestas se descartan al salir o recargar. La opción «18 años o más» fue aprobada por el responsable como opción seleccionable; no implementa por sí misma una política de acceso ni cambia el segmento objetivo de 13–17. El registro dirige a esta pantalla; la persistencia por cuenta, la realización única y el uso de las respuestas para priorizar accesos siguen pendientes.
- **Mi actividad (`/mi-actividad`):** interacción local para declarar apuestas y ganas de apostar, cantidades separadas, situaciones y observación opcional. Los campos de apuestas aparecen condicionalmente y las cantidades omitidas no se convierten en cero. Todavía no hay guardado, validación completa del registro, unicidad por usuario y día, cierre del día ni edición de una entrada persistida.
- **Historial y progreso (`/historial-y-progreso`):** selección local de día, semana y mes y espacios informativos de métricas, calendario y logros. No hay registros conectados ni filtros efectivos sobre datos, cálculos, gráficos, rachas u observaciones implementados.
- **Escudo digital (`/escudo-digital`):** tres categorías desplegables: restringir acceso a apuestas, reducir estímulos y encontrar apoyo. No hay catálogo verificado conectado, fichas de recursos ni marcado persistente de medidas realizadas.

Estas capacidades visuales no equivalen al cumplimiento completo de los RF. Registro e ingreso utilizan Supabase Auth; las herramientas de Detección aún no guardan datos por cuenta.

### Decisión vigente: Dashboard global desplegable

El responsable del proyecto definió Dashboard como un panel disponible desde el layout autenticado, no como una cuarta página principal junto a Inicio, Prevención y Comunidad. Sus filas con icono, título y acceso abren páginas independientes de herramientas: Mi actividad, Historial y progreso y Escudo digital.

El panel no debe concentrar los formularios o gráficos completos. Puede priorizar accesos con el contexto del onboarding, sin ocultar herramientas. Esta precisión de interacción sustituye la interpretación anterior del Dashboard como página, conservando las capacidades aprobadas del eje 2.

**Estado implementado de la base:** `Navbar` reutiliza `AppNavigation` con tres destinos; Home abre el mismo Dashboard global que Navbar. `AppRouter.jsx` conecta las tres herramientas bajo `AppLayout`, con navegación compartida. Onboarding permanece bajo `PublicLayout`. El router no verifica sesiones: disponer de estas rutas no implica autenticación o autorización sobre datos.

La documentación visual anterior que muestre cuatro páginas principales debe tratarse como referencia histórica para este punto. La navegación compartida sigue el Dashboard global desplegable y colapsable de la [guía de diseño vigente, versión 1.1](design/DESIGN_GUIDELINES.md); la implementación funcional de las herramientas y la validación del resto de las pantallas siguen pendientes.

### Límites funcionales relevantes

- El onboarding aprobado aparece una sola vez tras el registro: hasta cinco preguntas, posibilidad de omitir y sin edición posterior. El recorrido visual ya existe bajo `PublicLayout`; la realización única por cuenta todavía no está implementada; el registro dirige al recorrido visual.
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

La [arquitectura de datos y servidor](backend.md#arquitectura-aprobada-supabase-y-express) prevé acceso directo de React a Supabase mediante `supabase-js`, sesión autenticada y permisos/RLS para operaciones habituales. Express se reserva para necesidades concretas de servidor. Registro e inicio de sesión utilizan el cliente Supabase; cierre de sesión, protección de rutas y persistencia del onboarding siguen pendientes. La URL y la clave pública del cliente deben corresponder a la base elegida; las migraciones locales no se aplican ni sincronizan automáticamente con el remoto. El estado local de la base se documenta en [base de datos](base-de-datos.md#9-entorno-local-y-verificaciones).

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
