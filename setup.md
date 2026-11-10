# MODUS — Preparación del código base

Checklist de la base compartida para tres integrantes. Las reglas permanentes están en [AGENTS.md](AGENTS.md), la [constitución](docs/CONSTITUTION.md) y los archivos específicos de cada proyecto. Los comandos están en el [README](README.md).

`[x]` significa comprobado durante la preparación del repositorio. Se conservan los resultados anteriores y se distinguen las comprobaciones de la etapa de navegación compartida. No implica integración funcional, sincronización remota ni preparación para usuarios reales.

## Hito A — Código base compartido

Frontend y backend ejecutables, estructura modular organizada, navegación inicial, convenciones, documentación y preparación para que los tres integrantes trabajen sobre una base común. Este hito no depende de terminar Supabase, la autenticación ni las funcionalidades reales de la plataforma.

### Base local verificada

- [x] Durante la preparación inicial se verificó el repositorio existente en `develop`, sin reinicializar proyectos. Esta es una comprobación histórica, no una afirmación sobre la rama actual de cada integrante.
- [x] Frontend React + Vite con JavaScript/ESModules, React Router, Tailwind 4 y ESLint existentes.
- [x] Dependencias locales resueltas: React/React DOM, Router, Tailwind y plugin Vite, fuentes Inter/Manrope, Lucide y herramientas de lint/build; comprobadas con `npm --prefix frontend ls --depth=0`.
- [x] Router, layouts, navegación y páginas iniciales presentes; son base de interfaz, no funcionalidades completas.
- [x] Backend Express existente en `backend/app.js`, con JSON, `PORT` y `GET /`; dependencia local comprobada con `npm --prefix backend ls --depth=0`.
- [x] Leídos `AGENTS.md` y `docs/CONSTITUTION.md`.

### Documentación de la base

- [x] Completar `frontend/AGENTS.md` y `backend/AGENTS.md`.
- [x] Consolidar `docs/frontend.md`: Dashboard global desplegable, Home y Perfil diferenciados y transición del código actual identificada.
- [x] Crear `docs/backend.md` con estructura real, responsabilidades, ejecución y coordinación pendiente del proxy `/api`.
- [x] Completar `README.md` con instalación, comandos, ramas y contribución.
- [x] Verificar la incorporación de [DESIGN_GUIDELINES.md](docs/design/DESIGN_GUIDELINES.md), versión 1.1 (`MODUS-DS-001`), como base visual aceptada; referencias actualizadas y colores de marca/fuentes actuales cotejados. Esto no acredita la aplicación completa ni la validación visual del sistema.

### Verificaciones ejecutadas durante la preparación

- [x] `npm --prefix frontend run lint`.
- [x] `npm --prefix frontend run build`.
- [x] `node --check backend/app.js`.
- [x] Servidor temporal de backend: `GET /` respondió HTTP 200 con el JSON esperado; proceso detenido al finalizar.
- [x] Inspeccionar los scripts reales: frontend tiene `dev`, `lint`, `build` y `preview`; backend tiene `dev`, `start` y un `test` de ejemplo que falla y no es una suite.

Lint y build se ejecutaron nuevamente para la navegación compartida; los resultados del backend corresponden a su verificación anterior. No prueban autenticación, permisos ni integración de Supabase. Se usaron las dependencias ya instaladas; no se realizó una instalación limpia.

### Navegación compartida comprobada

- [x] Adaptar conjuntamente `AppLayout.jsx`, `AppNavigation.jsx` y `HomePage.jsx`: Navbar global con Inicio, Prevención y Comunidad; Dashboard como panel independiente de Home y Perfil.
- [x] En la etapa inicial se conservaron `App.jsx`, las páginas anteriores y `/mi-espacio`. Posteriormente, el responsable autorizó retirar Mi espacio y su ruta; ya no forman parte de la estructura actual.
- [x] Preparar páginas iniciales y rutas de Mi actividad, Historial y progreso y Escudo digital. Esa verificación correspondía a la estructura navegable; el avance visual posterior se detalla abajo y no acredita RF completos.
- [x] Revisar apertura desde Navbar y Home; cierre con botón, Escape, fondo y navegación; ciclo de Tab/Shift+Tab, retorno de foco y foco en el contenido tras cambiar de página.
- [x] Revisar navegación en escritorio y móvil, anchos de 360, 390, 768, 1280 y 1440 px sin desborde horizontal; panel a ancho completo en móvil y lateral en escritorio.
- [x] Revisar enlaces principales, Perfil, las tres herramientas, rutas públicas existentes, ruta inexistente, Atrás/Adelante y recarga directa de una herramienta.

### Pendiente para cerrar la base compartida

- [ ] Aplicar y validar la guía 1.1 en la interfaz: resolver tokens semánticos pendientes, comprobar contrastes reales y revisar navegación/estados en móvil y escritorio. Conservar sus pendientes de contraste con RF y confirmación de permisos; no darlos por resueltos por la incorporación del archivo.
- [ ] Acordar las configuraciones generales de Express necesarias para la base, como CORS, entorno o prefijos, y documentar sus valores; no agregar configuración arbitraria ni servicios inexistentes.
- [ ] Verificar una instalación limpia de frontend/backend con la configuración de la base.
- [ ] Verificar sincronización con GitHub al integrar; comparar referencias guardadas localmente no sustituye una consulta reciente al remoto.
- [ ] Revisar cambios preparados y crear commits pequeños solo con autorización.
- [x] Comprobar la existencia local de `develop` y de las ramas `feat/deteccion`, `feat/prevencion` y `feat/comunidad` en la revisión del 2026-11-08.
- [ ] Publicar o integrar nuevos cambios solo cuando corresponda y exista autorización expresa; la existencia de ramas no acredita su sincronización remota.

### Criterio de cierre del Hito A

La base se considera preparada cuando frontend y backend se ejecutan y pasan sus verificaciones aplicables, la estructura aprobada y la navegación inicial están listas y el equipo dispone de convenciones y documentación para colaborar. Las pantallas iniciales pueden carecer de lógica funcional; no se requiere autenticación simulada ni real para dar por preparado este hito. Las tareas de base no verificadas arriba siguen pendientes.

## Hito B — Integración funcional

Implementación progresiva de las capacidades aprobadas sobre la base compartida. La [arquitectura Supabase–Express](docs/backend.md#arquitectura-aprobada-supabase-y-express) es la referencia para distribuir responsabilidades.

- [ ] Configurar el proyecto Supabase y sus variables de entorno, sin exponer credenciales privilegiadas.
- [ ] Integrar Supabase Auth y verificar autenticación real, sin sesiones simuladas.
- [x] Preparar el esquema inicial de PostgreSQL, SQL y migraciones con aprobación previa: ocho migraciones propias aplicadas en local y en el remoto de desarrollo; estructura remota inspeccionada.
- [ ] Definir y comprobar permisos y políticas RLS para acceso efectivo a datos.
- [ ] Integrar las operaciones habituales de datos mediante Data API y `supabase-js` cuando sea seguro.
- [ ] Implementar progresivamente los RF aprobados en las páginas y módulos correspondientes.
- [ ] Coordinar contratos y prefijos de las operaciones especiales que requieran Express; incorporar rutas, controladores, validaciones y errores cuando correspondan.
- [ ] Verificar la integración real de frontend, backend administrado, servidor y datos, según las funciones implementadas.
- [ ] Comprobar las variables y la preparación de una copia limpia para la integración funcional.

### Criterio de avance del Hito B

Cada capacidad se verifica con sus RF y criterios de aceptación antes de considerarse terminada; la preparación de carpetas o pantallas no prueba integración de datos, autenticación ni autorización.

## Estado inspeccionado del eje 2 — 2026-11-08

Las comprobaciones de capacidades corresponden a lectura del código, no a una nueva validación interactiva en navegador. En esta revisión también pasaron lint del frontend, build con `--configLoader native` y salida temporal fuera del repositorio, y `node --check backend/app.js`; no acreditan autenticación ni cumplimiento completo de RF.

- [x] Confirmar las cuatro páginas en `frontend/src/pages/deteccion/`, sus rutas y el contenido separado de preguntas de Onboarding.
- [x] Confirmar el recorrido local de cinco preguntas de Onboarding con retroceso y omisión; no hay guardado ni control por cuenta.
- [x] Confirmar campos condicionales y estado local en Mi actividad; no hay registro persistido ni validación completa de guardado.
- [x] Confirmar períodos locales y espacios informativos en Historial; no hay métricas ni gráficos con datos conectados.
- [x] Confirmar las tres categorías desplegables de Escudo; no hay catálogo ni marcado de medidas conectado.
- [x] Confirmar acceso al Dashboard desde Navbar y Home; Home incluye guía interactiva y contenidos destacados de Prevención, sin resúmenes personales conectados.
- [ ] Contrastar la implementación con RF-DO-01 a RF-DO-13 y sus criterios vigentes antes de cerrar capacidades.
- [ ] Repetir la verificación de navegador, teclado y adaptación móvil de las pantallas actuales.

El detalle de las capacidades visuales y de sus límites permanece en [docs/frontend.md](docs/frontend.md). La autenticación, los datos y los permisos siguen dentro del Hito B; esta actualización no cambia las reglas funcionales ni la arquitectura aprobada.

## Revisión de estructura Supabase local — 2026-11-09

- [x] Comparar las 21 tablas propias, campos y tipos locales con `docs/bd-grafico.svg`; distinguir 18 tablas en `public`, tres en `private` y la referencia a `auth.users`.
- [x] Preparar dos migraciones correctivas con comentarios en español y revisión estática: tiempo/unidad e índices de relaciones.
- [ ] Reproducir los ocho archivos en una instancia aislada. Dos arranques fallaron al copiar un archivo al contenedor de Podman; el responsable decidió postergar esta comprobación y mantener el sistema.
- [x] Aplicar las dos migraciones correctivas a la base principal local con autorización de continuar sin reproducción aislada previa. Se validaron la restricción de tiempo y los tres índices.

La base principal tiene ocho migraciones aplicadas. La comparación final confirmó 21 tablas, 103 campos y sus tipos, 32 claves foráneas y RLS activo en todas las tablas propias. Este avance cierra la entrega estructural local; no acredita conexión de pantallas, reproducción desde cero, validación funcional completa de permisos ni aplicación remota. El detalle está en [docs/base-de-datos.md](docs/base-de-datos.md#revisión-estructural-y-correcciones--2026-11-09).

## Despliegue Supabase remoto — 2026-11-10

- [x] Aplicar las ocho migraciones al proyecto de desarrollo conservando el antecedente remoto.
- [x] Comprobar 21 tablas, 103 columnas, 32 claves foráneas, RLS y configuración del bucket privado mediante metadatos.
- [x] Configurar las URL locales de Auth; posteriormente se desactivó la confirmación de correo en el remoto por decisión del responsable.
- [ ] Configurar el envío de correos cuando se implemente la recuperación de cuenta.
- [ ] Reproducir todas las migraciones desde cero en local y verificar funcionalmente los permisos.

## Acceso con Supabase — 2026-11-10

- [x] Conectar los formularios de registro e inicio de sesión a Supabase Auth.
- [x] Comprobar en el remoto de desarrollo registro con sesión, perfil, ingreso y rechazo de contraseña incorrecta y nombre repetido usando una cuenta ficticia retirada al finalizar.
- [ ] Verificar el recorrido completo desde el navegador, el cierre de sesión y la protección de rutas.
- [ ] Conectar la persistencia y realización única del onboarding mediante PTL-115.
