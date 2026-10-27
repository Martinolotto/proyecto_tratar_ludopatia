# MODUS — Guía de backend

## Estado actual

El backend existente usa Node.js, Express 5 y JavaScript con ESModules. Su entrada es `backend/app.js`; no debe reinicializarse ni sustituirse.

Actualmente interpreta cuerpos JSON con `express.json()`, inicia el servidor y ofrece una única ruta de comprobación: `GET /`, que responde HTTP 200 con `{"message":"Servidor MODUS funcionando"}`. No hay rutas funcionales, integración con Supabase, autenticación ni manejo específico de errores implementados.

## Estructura existente

```text
backend/
  app.js                 Entrada, configuración JSON y ruta de prueba
  package.json           Dependencia Express y scripts de ejecución
  package-lock.json      Resolución de dependencias
  src/
    .gitkeep
    routes/              Vacía: futuros routers cuando sean necesarios
    controllers/         Vacía: futuros controladores
    middlewares/         Vacía: validaciones y lógica transversal cuando corresponda
```

Las carpetas vacías existen localmente, pero Git no conserva directorios sin archivos. No representan funcionalidades terminadas. Se pueden crear archivos iniciales de una estructura previamente aprobada por el equipo, aunque aún no tengan lógica; no es obligatorio añadir placeholders ni se autorizan capas o servicios ficticios por iniciativa del agente.

## Arquitectura aprobada: Supabase y Express

Esta es la referencia principal de la arquitectura de datos y servidor de MODUS. El proyecto Supabase todavía no está configurado y no hay cliente `supabase-js` integrado. Los siguientes flujos son la arquitectura prevista, no conexiones existentes.

### Supabase: backend administrado principal

Supabase resolverá:

- PostgreSQL y persistencia.
- Autenticación mediante Supabase Auth.
- Autorización de acceso a datos mediante políticas RLS.
- API REST automática sobre las tablas habilitadas para la Data API.
- Consultas, creaciones, modificaciones y eliminaciones habituales que puedan resolverse de manera segura con esa API y los permisos correspondientes.

React podrá comunicarse directamente con Supabase mediante `supabase-js`, utilizando la sesión autenticada y los permisos configurados. No será obligatorio pasar estas operaciones por Express.

**Operación habitual:** React → Supabase Data API → RLS → PostgreSQL.

La Data API recibe la operación, los permisos y políticas RLS limitan el acceso a los datos y PostgreSQL realiza la consulta o escritura autorizada. La integridad y las restricciones propias de los datos también pueden residir en PostgreSQL; no se trasladan automáticamente a Express.

### Express: operaciones con necesidad concreta de servidor

Express se usará únicamente cuando sea necesario, por ejemplo para:

- Reglas de negocio que requieran procesamiento o validación específica del lado del servidor.
- Integraciones externas que necesiten credenciales privadas.
- Operaciones que no convenga o no se pueda resolver directamente mediante Supabase.
- Procesos que requieran coordinación o procesamiento especial.

**Operación especial:** React → Express → lógica de servidor → servicio o datos necesarios, verificando identidad y autorización.

Si la operación es protegida, Express debe verificar la identidad y los permisos antes de ejecutarla, sin confiar en identificadores enviados por React. Cuando acceda a datos, debe respetar la autorización correspondiente; disponer de una credencial privilegiada no sustituye esa comprobación.

### Reglas compartidas

- No crear endpoints Express que dupliquen innecesariamente operaciones cubiertas de forma segura por Supabase.
- No usar Sequelize ni Prisma ni implementar autenticación JWT propia: la autenticación corresponde a Supabase Auth. Verificar una sesión emitida por Supabase no significa crear otro sistema de autenticación.
- No exponer claves secretas ni credenciales privilegiadas en React; las restricciones visuales no reemplazan la autorización efectiva sobre los datos.
- Gestionar posteriormente las modificaciones del esquema mediante SQL y migraciones, con las autorizaciones previstas en las reglas raíz.
- Mantener una arquitectura simple, comprensible y ampliable, sin capas obligatorias.

La configuración del proyecto, el cliente, las tablas, las políticas, las migraciones y las operaciones funcionales pertenecen al Hito B de [setup.md](../setup.md). Esta revisión solo documenta la decisión aprobada; no crea ninguna de esas integraciones.

Las reglas para agentes y código están en [backend/AGENTS.md](../backend/AGENTS.md); las autorizaciones generales, en [AGENTS.md](../AGENTS.md).

## Cómo incorporar una ruta cuando se autorice

1. Revisar su RF y confirmar qué operación necesita servidor y qué puede resolver Supabase.
2. Definir método, dirección, datos y respuesta con el equipo si afecta contratos compartidos.
3. Incorporar el router necesario en `src/routes/` y su controlador en `src/controllers/`, con nombres consistentes con la funcionalidad.
4. Agregar validaciones y middlewares solo cuando correspondan. Las rutas protegidas deben verificar identidad real y permisos; la cuenta recibida en el cuerpo no prueba autoría.
5. Importar y montar el router en `app.js`, después de la configuración necesaria. Mantener allí el inicio del servidor.
6. Revisar respuestas, estados HTTP y errores sin exponer secretos; comprobar el caso correcto y los errores relevantes.

Este procedimiento no crea todavía rutas ni obliga a añadir capas de servicios o repositorios.

## Configuraciones generales acordadas

Se permite incorporar CORS, variables de entorno y prefijos de rutas cuando el equipo haya acordado su necesidad y sus valores: orígenes permitidos, nombres y forma de carga de variables, o prefijo del contrato, según corresponda. Documentar cada incorporación y mantener `app.js` como entrada y punto de montaje de rutas y middlewares.

No agregar valores arbitrarios, servicios que todavía no existen ni configuración especulativa. Las dependencias nuevas y los cambios de contratos compartidos siguen sujetos a las autorizaciones del `AGENTS.md` raíz. Que una configuración esté permitida no significa que ya esté implementada.

## Ejecutar y comprobar

Desde la raíz, después de instalar las dependencias existentes según el [README](../README.md):

```bash
npm --prefix backend run dev
```

`dev` ejecuta `node --watch app.js`; `npm --prefix backend start` ejecuta el servidor sin modo observación.

La única variable utilizada actualmente es `PORT`; si no se proporciona, se usa 3000. El código no carga archivos `.env` automáticamente. No se necesita configuración de Supabase para ejecutar la ruta de prueba.

En otra terminal, con el servidor ejecutándose en su puerto predeterminado:

```bash
curl http://localhost:3000/
node --check backend/app.js
```

La comprobación HTTP verifica esa ruta; el chequeo de Node verifica sintaxis. El script `npm --prefix backend test` es un placeholder que falla y no constituye pruebas automatizadas.

## Conexión pendiente con el frontend

`frontend/vite.config.js` redirige `/api` hacia `http://localhost:3000` en desarrollo, pero Express solo ofrece `GET /`. No hay reescritura del prefijo ni ruta `/api`: consultar `/api` desde Vite no equivale a consultar la ruta de prueba del backend.

El prefijo y los contratos se coordinarán antes de incorporar llamadas reales. Esta tarea documental no cambia proxy, rutas, CORS ni configuración. El proxy de desarrollo tampoco resuelve por sí solo la integración de producción.
