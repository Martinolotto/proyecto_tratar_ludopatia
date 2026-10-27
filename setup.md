# MODUS — Preparación del código base

Checklist de la base compartida para tres integrantes. Las reglas permanentes están en [AGENTS.md](AGENTS.md), la [constitución](docs/CONSTITUTION.md) y los archivos específicos de cada proyecto. Los comandos están en el [README](README.md).

`[x]` significa comprobado durante la preparación del repositorio. Esta revisión documental conserva los resultados anteriores; no vuelve a presentar esas ejecuciones como pruebas nuevas ni marca integraciones no verificadas. No implica sincronización remota ni preparación para usuarios reales.

## Hito A — Código base compartido

Frontend y backend ejecutables, estructura modular organizada, navegación inicial, convenciones, documentación y preparación para que los tres integrantes trabajen sobre una base común. Este hito no depende de terminar Supabase, la autenticación ni las funcionalidades reales de la plataforma.

### Base local verificada

- [x] Repositorio Git existente y rama actual `develop`, sin reinicializar proyectos ni alterar ramas.
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
- [x] Identificar que `docs/design/DESIGN_GUIDELINES.md` falta; reconocer los tokens actuales sin afirmar que el diseño oficial está terminado.

### Verificaciones ejecutadas durante la preparación

- [x] `npm --prefix frontend run lint`.
- [x] `npm --prefix frontend run build`.
- [x] `node --check backend/app.js`.
- [x] Servidor temporal de backend: `GET /` respondió HTTP 200 con el JSON esperado; proceso detenido al finalizar.
- [x] Inspeccionar los scripts reales: frontend tiene `dev`, `lint`, `build` y `preview`; backend tiene `dev`, `start` y un `test` de ejemplo que falla y no es una suite.

Estas verificaciones no prueban navegación manual completa, autenticación, permisos ni integración de Supabase. Se usaron las dependencias ya instaladas; no se realizó una instalación limpia.

### Pendiente para cerrar la base compartida

- [ ] Adaptar conjuntamente `AppLayout.jsx`, `AppNavigation.jsx`, `HomePage.jsx` y la ruta/página de Mi espacio al Dashboard desplegable; revisar navegación móvil y escritorio.
- [ ] Preparar las carpetas, páginas y archivos iniciales de herramientas cuya estructura haya sido aprobada por el equipo; no exige implementar todavía sus RF.
- [ ] Definir e incorporar la guía de diseño oficial, preservando y revisando los tokens compartidos existentes.
- [ ] Acordar las configuraciones generales de Express necesarias para la base, como CORS, entorno o prefijos, y documentar sus valores; no agregar configuración arbitraria ni servicios inexistentes.
- [ ] Verificar la navegación inicial completa y una instalación limpia de frontend/backend con la configuración de la base.
- [ ] Verificar sincronización con GitHub; no comprobada en esta tarea.
- [ ] Revisar cambios preparados y crear commits pequeños solo con autorización.
- [ ] Publicar `develop` y crear ramas funcionales desde ella solo cuando corresponda y exista autorización expresa.

### Criterio de cierre del Hito A

La base se considera preparada cuando frontend y backend se ejecutan y pasan sus verificaciones aplicables, la estructura aprobada y la navegación inicial están listas y el equipo dispone de convenciones y documentación para colaborar. Las pantallas iniciales pueden carecer de lógica funcional; no se requiere autenticación simulada ni real para dar por preparado este hito. Las tareas de base no verificadas arriba siguen pendientes.

## Hito B — Integración funcional

Implementación progresiva de las capacidades aprobadas sobre la base compartida. La [arquitectura Supabase–Express](docs/backend.md#arquitectura-aprobada-supabase-y-express) es la referencia para distribuir responsabilidades.

- [ ] Configurar el proyecto Supabase y sus variables de entorno, sin exponer credenciales privilegiadas.
- [ ] Integrar Supabase Auth y verificar autenticación real, sin sesiones simuladas.
- [ ] Preparar el esquema inicial de PostgreSQL, SQL y migraciones con aprobación previa.
- [ ] Definir y comprobar permisos y políticas RLS para acceso efectivo a datos.
- [ ] Integrar las operaciones habituales de datos mediante Data API y `supabase-js` cuando sea seguro.
- [ ] Implementar progresivamente los RF aprobados en las páginas y módulos correspondientes.
- [ ] Coordinar contratos y prefijos de las operaciones especiales que requieran Express; incorporar rutas, controladores, validaciones y errores cuando correspondan.
- [ ] Verificar la integración real de frontend, backend administrado, servidor y datos, según las funciones implementadas.
- [ ] Comprobar las variables y la preparación de una copia limpia para la integración funcional.

### Criterio de avance del Hito B

Cada capacidad se verifica con sus RF y criterios de aceptación antes de considerarse terminada; la preparación de carpetas o pantallas no prueba integración de datos, autenticación ni autorización.

Esta revisión conserva los estados reales y no implementa ninguno de estos pendientes. No se modificó código fuente ni se instalaron dependencias; tampoco se realizaron commits o push.
