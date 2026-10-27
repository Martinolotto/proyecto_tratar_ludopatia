# MODUS — Reglas de backend

Estas instrucciones aplican a `backend/` y complementan el `AGENTS.md` raíz.
Antes de editar, leer `../docs/CONSTITUTION.md` y `../docs/backend.md`.

## Estructura y estilo

- Mantener Node.js, Express, JavaScript y ESModules; conservar `app.js` como entrada principal.
- Seguir el estilo de los trabajos prácticos: rutas, controladores, middlewares y validaciones cuando exista una necesidad concreta.
- Usar `src/routes/`, `src/controllers/` y `src/middlewares/`, ya existentes y vacías.
- Se permite crear carpetas y archivos iniciales de una estructura previamente aprobada por el equipo, aunque todavía no tengan lógica funcional, para dar a los tres integrantes una base consistente y comprensible. No presentarlos como módulos implementados.
- No generar capas, servicios, dependencias ni funcionalidades ficticias por iniciativa del agente.
- Las rutas asocian método y dirección; los controladores atienden el caso de uso; los middlewares resuelven comportamientos transversales. No crear servicios, repositorios o capas adicionales por obligación.
- Usar nombres descriptivos y mantener el estilo existente: dos espacios, ESModules y comentarios en español para responsabilidades y decisiones no evidentes.

## Supabase y Express

- Seguir la arquitectura aprobada en `../docs/backend.md`: Supabase es el backend administrado principal para PostgreSQL, Auth, RLS y operaciones habituales mediante Data API; React podrá acceder directamente con `supabase-js` y su sesión.
- Reservar Express para lógica que realmente necesite servidor; no duplicar endpoints de datos ni trasladar automáticamente reglas que correspondan a PostgreSQL o RLS.
- No usar Sequelize ni Prisma; no crear autenticación JWT propia ni sesiones simuladas.
- Una futura ruta protegida debe validar la identidad real y autorizar la operación sobre sus datos; no confiar en un identificador enviado por el navegador ni en una restricción visual.
- La integración de Supabase aún no está implementada. Cambios de esquemas, migraciones, RLS y contratos compartidos requieren las autorizaciones del `AGENTS.md` raíz.
- No usar credenciales privilegiadas para eludir autorización ni exponer secretos en respuestas, registros o frontend.

## Solicitudes, errores y configuración

- Validar entradas y responder con estados HTTP y JSON comprensibles, sin filtrar información sensible ni detalles internos.
- Mantener coherencia entre validaciones, controladores y manejo de errores; incorporar middlewares comunes solo cuando las rutas lo necesiten.
- Leer configuración del entorno y documentar las variables al incorporarlas. Actualmente `app.js` solo utiliza `PORT`, con valor predeterminado 3000.
- Se permite incorporar CORS, configuración de entorno y prefijos de rutas cuando sus necesidades y valores estén acordados. Documentar los acuerdos y respetar las autorizaciones raíz sobre dependencias y contratos.
- No agregar configuraciones arbitrarias ni integrar servicios inexistentes; no presentar configuración prevista como implementada.
- Antes de incorporar rutas, revisar el proxy de Vite y la discrepancia actual entre `/api` y `GET /` descrita en `../docs/backend.md`.

## Verificación

- Ejecutar `node --check backend/app.js` y revisar sintaxis de los archivos nuevos o modificados cuando existan.
- Comprobar las rutas afectadas y ejecutar pruebas reales adicionales si están disponibles, usando datos ficticios seguros.
- El script actual `test` es un placeholder que termina con error; no presentarlo como una suite de pruebas.
- No instalar dependencias ni modificar archivos de otros módulos para corregir verificaciones fuera del alcance autorizado.
