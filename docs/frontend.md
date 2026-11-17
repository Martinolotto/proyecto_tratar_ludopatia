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

**PublicLayout.jsx:** estructura compartida por las páginas públicas; incorpora la cabecera de acceso. El pie aparece únicamente en Landing; Onboarding se presenta sin cabecera ni pie.

**AppLayout.jsx:** estructura compartida de las páginas de la aplicación. Monta `Navbar` y la barra de herramientas `Sidebar`, y entrega su apertura a las páginas mediante el contexto de `Outlet`. Actualmente no verifica sesión: “layout autenticado” describe su destino funcional, no una protección ya implementada.

Los layouts no deben contener la lógica particular de los ejes funcionales.

### Componentes

**components/:** elementos visuales o interactivos reutilizables entre páginas. `ActividadSemanal.jsx` presenta siete días seleccionables, su resumen y la racha de registros a partir de los datos que recibe de Home.

**components/navigation/:** componentes relacionados con la navegación, incluida la adaptación a escritorio y móvil.

- `AppNavigation.jsx`: enlaces centrados con iconos para Prevención, Inicio y Comunidad; el router determina el estado activo.
- `Navbar.jsx`: cabecera global con marca, navegación y acceso a Perfil. Si existe, muestra el avatar descargado de forma autorizada; ante ausencia o error utiliza un icono neutral. En pantallas estrechas ofrece el botón de herramientas.
- `Sidebar.jsx`: barra personal con Mi actividad, Historial y progreso, Escudo digital, Perfil y cierre de sesión. En escritorio se expande o contrae y el contenido se reajusta a su ancho; en pantallas estrechas utiliza un diálogo que admite Escape y navegación por teclado.
- `useNavigationProfile.js`: consulta la identidad y el avatar de la cuenta para la navegación, invalida la vista ante cambios de sesión y libera la URL temporal de la imagen. Tras guardar Perfil, el layout solicita una actualización.

No crear componentes compartidos cuando su reutilización no tenga una finalidad concreta.

### Páginas

- **home/:** entrada integrada en `/inicio`; conserva accesos y contenidos destacados de Prevención. Consulta la sesión, el alias, la fecha argentina de la base y los registros propios; muestra el último registro, una cuadrícula seleccionable de los últimos siete días y la racha de días consecutivos con Mi actividad guardada. La racha se conserva durante hoy si terminó ayer y se distingue de la futura racha de participación general; un día sin registro es un día sin información. La pantalla ofrece carga, error con reintento y estado sin registros, y actualiza el día al recuperar la pestaña o detectar su cambio. Los resúmenes de participación general y logros siguen pendientes.
- **prevencion/:** páginas y contenido del eje de Prevención/Concientización.
- **comunidad/:** páginas del eje de Vinculación y apoyo entre pares.
- **deteccion/:** las carpetas `onboarding/`, `mi-actividad/`, `historial-y-progreso/` y `escudo-digital/` agrupan cada página y sus archivos propios. Cada página conserva su ruta independiente; `onboardingQuestions.js` reúne las cinco preguntas.
- **perfil/:** consulta la cuenta autenticada y permite guardar su nombre de usuario y avatar privado. Las demás secciones permanecen pendientes; sin sesión redirige a `/login`.
- **publicas/:** Landing y página `/login`, con formularios de registro e inicio de sesión conectados a Supabase Auth. Los accesos de la Landing seleccionan el formulario mediante `?modo=registro` o `?modo=ingreso`.
- **errores/:** páginas de error y rutas inexistentes.

Mi espacio y su ruta fueron retirados por decisión del responsable; las herramientas se acceden desde la barra lateral.

Home, la barra lateral y Perfil tienen responsabilidades diferentes: Home integra la experiencia; la barra reúne accesos a herramientas; Perfil mantiene identidad y configuración de la cuenta.

### Estado actual del eje de Detección/Orientación

- **Onboarding (`/onboarding`):** recorrido de cinco preguntas con selección, retroceso y omisión individual o completa. La pantalla consulta la cuenta y guarda una única finalización y las respuestas proporcionadas en Supabase; el responsable comprobó el recorrido y guardado remoto; el aislamiento se probó con cuentas ficticias en local. Si se abandona antes, no guarda borrador ni se ofrece automáticamente al ingresar de nuevo. La opción «18 años o más» no asigna un rol ni cambia el segmento objetivo de 13–17. La priorización de accesos con esas respuestas queda pendiente.
- **Mi actividad (`/mi-actividad`):** consulta la cuenta y el día argentino de Supabase; presenta bloques opcionales, guarda o actualiza una entrada privada y muestra el resumen confirmado. Se validan importes en ARS, tiempo y cantidad; los valores omitidos se conservan sin dato. Las confirmaciones protegen los cambios de selección y el descarte de una edición. Se revisaron navegación, selección, confirmaciones y conservación de valores en navegador; siguen pendientes la revisión completa de accesibilidad y el cruce real de medianoche.
- **Historial y progreso (`/historial-y-progreso`):** la primera entrega conecta Mi historial a los registros propios de Supabase. Permite consultar día, semana, mes y últimos 30 días, seleccionar una fecha en el calendario o listado y ver su detalle de solo lectura; las tres reflexiones recientes se consultan independientemente del período y las demás se cargan por páginas. La fecha funcional es la de Córdoba y los datos están sujetos a las políticas de la cuenta. La vista Mis avances es informativa y permanece pendiente, al igual que métricas, gráficos, rachas y observaciones de esta herramienta. La validación completa de la entrega sigue en curso.
- **Escudo digital (`/escudo-digital`):** tres categorías desplegables: restringir acceso a apuestas, reducir estímulos y encontrar apoyo. No hay catálogo verificado conectado, fichas de recursos ni marcado persistente de medidas realizadas.

La conexión de Mi actividad no completa los RF de Historial y Escudo, que siguen pendientes. Registro e ingreso utilizan Supabase Auth.

### Decisión vigente: barra lateral de herramientas

El responsable definió una barra lateral de herramientas disponible desde el layout de la aplicación. Sus enlaces abren Mi actividad, Historial y progreso y Escudo digital; Inicio, Prevención y Comunidad permanecen en la navegación superior.

La barra no concentra formularios ni gráficos. En escritorio se expande o contrae y el contenido utiliza el ancho disponible; en pantallas estrechas se presenta como diálogo superpuesto. Desde Home, «Explorá tus herramientas» abre o expande la barra y enfoca su primer enlace.

**Estado implementado de la base:** `Navbar` reutiliza `AppNavigation` con tres destinos; Home abre la misma barra de herramientas que Navbar. `AppRouter.jsx` conecta las tres herramientas bajo `AppLayout`, con navegación compartida. Onboarding se renderiza sin la cabecera pública ni la navegación principal. El router no verifica sesiones: disponer de estas rutas no implica autenticación o autorización sobre datos.

La documentación visual anterior que muestre cuatro páginas principales debe tratarse como referencia histórica para este punto. La barra lateral reemplaza el diálogo anterior; la [guía de diseño vigente, versión 1.1](design/DESIGN_GUIDELINES.md) conserva referencias históricas del panel; la implementación funcional de las herramientas y la validación del resto de las pantallas siguen pendientes.

Al cerrar sesión desde la barra se usa el alcance local de Supabase Auth. La biblioteca elimina primero la sesión del navegador e intenta después revocar la sesión en el servidor. Si no puede confirmarse esa revocación, Login informa el resultado; si la sesión local sigue activa, la barra muestra un error y permite reintentar. Los tokens eliminados no se restauran.

### Límites funcionales relevantes

- El onboarding aprobado aparece una sola vez tras el registro: hasta cinco preguntas, posibilidad de omitir y sin edición posterior. El recorrido visual se muestra sin la cabecera pública; el registro dirige al recorrido y su finalización queda vinculada a la cuenta.
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

La [arquitectura de datos y servidor](backend.md#arquitectura-aprobada-supabase-y-express) prevé acceso directo de React a Supabase mediante `supabase-js`, sesión autenticada y permisos/RLS para operaciones habituales. Express se reserva para necesidades concretas de servidor. Registro e inicio de sesión utilizan el cliente Supabase; Perfil y la barra lateral permiten cerrar la sesión del navegador actual; la protección general de rutas sigue pendiente; Onboarding consulta y guarda su finalización; Mi actividad consulta y actualiza el registro propio mediante funciones de base de datos; Historial consulta los registros y notas propios mediante la Data API, con RLS y sin escrituras históricas. La URL y la clave pública del cliente deben corresponder a la base elegida; las migraciones locales no se aplican ni sincronizan automáticamente con el remoto. El estado local de la base se documenta en [base de datos](base-de-datos.md#9-entorno-local-y-verificaciones).

## 6. Diseño

La referencia visual del repositorio es [DESIGN_GUIDELINES.md](design/DESIGN_GUIDELINES.md), convención `MODUS-DS-001`, versión 1.1: base de diseño aceptada por el responsable para iniciar implementación. Sus referencias visuales no sustituyen decisiones funcionales ni políticas de acceso; ante contradicciones, prevalecen los RF vigentes y se consulta al responsable.

El sistema de estilos disponible está centralizado en `frontend/src/index.css`: variables `--modus-*`, tokens de color mediante `@theme inline` y fuentes Inter/Manrope cargadas desde `main.jsx`. Reutilizar clases como `bg-surface`, `text-brand-navy`, `text-brand-teal`, `font-sans` y `font-heading`, e iconos de Lucide cuando correspondan.

Tailwind CSS 4 se incorpora mediante `@tailwindcss/vite` en `vite.config.js` y `@import "tailwindcss"` en el CSS global. No agregar configuración de Tailwind de otra versión.

Los seis colores de marca actuales y las fuentes Inter/Manrope coinciden con la guía. Se añadieron variables compartidas para superficies albaricoque y lavanda, borde, texto secundario y foco. Lucide ya está disponible en el proyecto; los demás tokens de feedback siguen pendientes de definición.

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

Las decisiones vigentes del equipo tienen prioridad sobre referencias históricas. Los requisitos funcionales se mantienen en [Trello](https://trello.com/b/nMHsAZXQ/proyecto-tratar-ludopatia), incluidas las capacidades del eje 2 en [su definición funcional](https://trello.com/c/DoYehTF4) y RF-DO-01 a RF-DO-13. La decisión actual sobre la barra lateral se documenta arriba sin modificar el tablero.

Las dependencias y scripts existentes están en `frontend/package.json`; los comandos desde la raíz se resumen en el [README](../README.md). Auth, Perfil y Onboarding utilizan Supabase; la protección general de rutas sigue pendiente. El proxy `/api` de Vite tampoco implica una API funcional: ver [docs/backend.md](backend.md).

## 8. Uso de agentes de IA

Los agentes deben leer esta guía, el `AGENTS.md` raíz, [frontend/AGENTS.md](../frontend/AGENTS.md) y la constitución antes de modificar el frontend.

Deben respetar la estructura existente, explicar cambios importantes y evitar instalaciones o reestructuraciones no solicitadas.

La utilización personal de SDD es opcional y no constituye una obligación para el resto del equipo.
