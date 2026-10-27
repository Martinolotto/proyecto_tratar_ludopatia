# MODUS

Proyecto universitario desarrollado por tres integrantes para adolescentes de 13 a 17 años que han participado en apuestas. Integra Prevención/concientización, Detección/orientación no diagnóstica y Comunidad/apoyo entre pares. No realiza diagnósticos ni tratamientos.

## Qué contiene el repositorio

- `frontend/`: React + Vite, JavaScript/ESModules, React Router y Tailwind CSS 4; layouts, navegación y páginas iniciales existentes.
- `backend/`: Express con `app.js` como entrada y una ruta de comprobación `GET /`.
- `docs/`: constitución y guías del equipo.
- `setup.md`: preparación verificada y pendientes de la base común.

Supabase será el backend administrado principal; React podrá usar su Data API con sesión y RLS, y Express resolverá necesidades concretas de servidor. Ver la [arquitectura aprobada](docs/backend.md#arquitectura-aprobada-supabase-y-express). El proyecto Supabase todavía no está configurado: son flujos previstos, no integraciones existentes.

## Incorporarse al equipo: Git y ramas

- `main`: versión estable.
- `develop`: integración y pruebas de la base y del trabajo del equipo.
- Ramas funcionales: trabajo de cada eje, derivado de `develop`; pueden tener subramas de tareas acordadas por el equipo.

Para una copia nueva, reemplazar los marcadores entre `<...>` por la URL y los nombres acordados:

```bash
git clone https://github.com/Martinolotto/proyecto_tratar_ludopatia.git
cd Proyecto_ludopatia
git fetch origin
git branch --all
git switch develop
git pull --ff-only origin develop
git branch --remotes
```

`fetch` descarga referencias; `branch --all` permite consultar ramas locales y remotas; `switch` cambia de rama. Si `develop` solo existe como `origin/develop`, se puede crear su seguimiento local con `git switch --track origin/develop`. Cambiar o actualizar ramas requiere un árbol de trabajo limpio; no descartar cambios locales para hacerlo.

Buscar en las ramas remotas las del eje asignado y confirmar su nombre con el equipo. **No se presupone que las ramas por eje ya existan.** Si faltan, coordinar su creación desde `develop`. Para una rama del eje existente:

```bash
git switch --track origin/<rama-del-eje>
```

Ese comando se usa la primera vez si aún no existe localmente; después, `git switch <rama-del-eje>`. Si corresponde una subrama, partir de la rama del eje y usar `git switch -c <subrama-acordada>`.

Una vez en la rama asignada, instalar y ejecutar como se indica abajo. Antes de integrar a `develop`, revisar `git status` y `git diff`, ejecutar las comprobaciones aplicables y coordinar la revisión del equipo. Estos comandos son una guía para integrantes; no se ejecutan cambios de ramas ni descargas remotas durante esta revisión documental.

## Instalación

Usar Node.js compatible con los lockfiles y npm. La dependencia instalada de React Router requiere Node `>=22.22.0`; esta revisión se verificó con Node `26.9.0` y npm `11.19.1`.

Desde la raíz del repositorio local, al preparar una copia nueva:

```bash
npm --prefix frontend ci
npm --prefix backend ci
```

Los proyectos ya existen: no ejecutar generadores de React, Vite o Express. Cada uno tiene su `package.json` y lockfile; no hay scripts npm en la raíz. Estos comandos de instalación son instrucciones para el equipo, no instalaciones realizadas en esta tarea.

## Comandos

En dos terminales, desde la raíz:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev
```

Vite está configurado en el puerto 5173; consultar la URL que informe al iniciar. Express usa 3000 salvo que se proporcione `PORT`. Para comprobar la ruta actual del backend: `curl http://localhost:3000/`.

Comprobaciones de la base:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
node --check backend/app.js
```

Otros scripts disponibles: `npm --prefix frontend run preview` sirve la compilación frontend y `npm --prefix backend start` ejecuta Express sin observación de cambios. El script `test` del backend es un placeholder que falla; no hay una suite implementada.

El proxy `/api` de Vite aún no corresponde a rutas funcionales de Express. Tampoco se cargan archivos `.env` automáticamente en el backend. Consultar la [guía de backend](docs/backend.md) antes de conectar servicios.

## Cómo empezar a contribuir

1. Leer [AGENTS.md](AGENTS.md), la [constitución](docs/CONSTITUTION.md) y las instrucciones de [frontend](frontend/AGENTS.md) o [backend](backend/AGENTS.md).
2. Revisar [setup.md](setup.md), la guía de [frontend](docs/frontend.md) o [backend](docs/backend.md) y el [RF vigente en Trello](https://trello.com/b/nMHsAZXQ/proyecto-tratar-ludopatia).
3. Inspeccionar cambios locales y coordinar modificaciones en navegación, layouts, diseño, autenticación y contratos compartidos.
4. Implementar solo el alcance acordado y ejecutar las comprobaciones aplicables. No incluir secretos ni datos reales sensibles.

Seguir Conventional Commits con mensajes en español, en pasado y descriptivos. Los agentes requieren autorización para alterar ramas, crear commits, hacer push o merge, conforme a las reglas raíz.

La decisión vigente del Dashboard es un panel global desplegable desde el layout autenticado. El código todavía conserva `/mi-espacio` como página: su adaptación queda pendiente y está explicada en la guía de frontend. No se impone SDD, TDD ni otro paradigma obligatorio.
