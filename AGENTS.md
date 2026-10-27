
# MODUS — Instrucciones generales para agentes

## 1. Contexto

MODUS es una plataforma web universitaria dirigida a adolescentes.
Integra Prevención, Comunidad y Detección/Orientación no diagnóstica.

Repositorio: React + Vite + Tailwind CSS, Express y Supabase.
Lenguaje: JavaScript con ESModules.

## 2. Instrucciones aplicables

Antes de trabajar:

- Leer `docs/CONSTITUTION.md`.
- Inspeccionar los archivos afectados y sus dependencias.
- Para React, seguir `frontend/AGENTS.md`.
- Para Express, seguir `backend/AGENTS.md`.
- Consultar `docs/frontend.md`, `docs/backend.md` o las guías de diseño cuando corresponda.
- Respetar los requisitos funcionales vigentes de Trello.

No asumir que los archivos mencionados existen o están terminados:
comprobarlo e informar cualquier ausencia.

## 3. Procedimiento de trabajo

1. Comprender el estado actual y el alcance solicitado.
2. Explicar brevemente los cambios importantes antes de realizarlos.
3. Implementar una solución simple y coherente con el código existente.
4. Ejecutar las verificaciones aplicables.
5. Informar archivos modificados, resultados y pendientes.

No exigir TDD, SDD ni otra metodología de desarrollo.

## 4. Código

- Priorizar legibilidad, modularidad y responsabilidades claras.
- Mantener convenciones y nomenclatura existentes.
- Escribir nombres descriptivos e indentación consistente.
- Documentar en español las decisiones y los bloques no evidentes.
- No agregar comentarios redundantes.
- Reutilizar componentes y funciones cuando corresponda.
- No introducir abstracciones, dependencias ni capas innecesarias.
- No modificar módulos ajenos a la tarea sin justificación.

## 5. Autorizaciones

Solicitar aprobación antes de:

- Agregar dependencias o sustituir tecnologías.
- Cambiar la arquitectura o los contratos compartidos.
- Modificar esquemas, migraciones o políticas de seguridad.
- Eliminar archivos importantes o realizar cambios destructivos.
- Crear commits, hacer push, merge, rebase o alterar ramas.

Nunca exponer credenciales ni utilizar datos reales sensibles.

## 6. Verificaciones

Frontend:

- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`

Backend:

- `node --check backend/app.js`
- Ejecutar pruebas adicionales cuando existan.

No afirmar que una prueba pasó sin ejecutarla.
No exigir scripts inexistentes.

## 7. Git

- `main`: versión estable.
- `develop`: integración y pruebas.
- Ramas funcionales: derivadas de `develop`.
- Seguir Conventional Commits.
- Mensajes en español, en pasado y descriptivos.
- Realizar commits pequeños y coherentes.
- Revisar el contenido preparado antes de cada commit.
- No hacer push ni merge sin autorización expresa.

Ejemplos:

- `chore(frontend): se configuró la base de React`
- `feat(frontend): se implementó la navegación principal`
- `fix(backend): se corrigió la validación de usuarios`
- `docs: se actualizaron las convenciones del proyecto`

## 8. Fuente de verdad

1. Decisiones vigentes del equipo y RF aprobados.
2. Arquitectura técnica y constitución acordadas.
3. Guías de implementación y diseño del repositorio.
4. Mockups y referencias históricas.

Ante contradicciones, informar antes de implementar.
No inventar funcionalidades ni modificar el alcance aprobado.
