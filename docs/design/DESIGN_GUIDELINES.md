# MODUS — Design Guidelines

**Convención:** `MODUS-DS-001` · **Versión:** 1.1 · **Actualización:** 2026-10-27  
**Ubicación prevista:** `docs/design/DESIGN_GUIDELINES.md` del repositorio principal.  
**Estado:** baseline de diseño aceptada por el responsable para iniciar implementación. El PDF/láminas del compañero son las referencias visuales principales. El documento funcional aprobado prevalece si surge una contradicción.

> **No usar `pp-maqueta-ui`.** No redefinir funcionalidades, acceso, resultados, riesgo o diagnóstico a partir de decisiones visuales. La confirmación del usuario de que los tres ejes están cerrados no reemplaza sus RF finales: consultar Trello/versiones del equipo antes de codificar esos flujos.

## 1. Principios que guían cada pantalla

1. **Primero utilidad:** el Home debe permitir ir a Prevención y Comunidad y abrir las herramientas personales desde el Dashboard global (patrón ACCESS).
2. **Joven pero maduro:** lenguaje directo y humano; no infantil, influencer, clínico ni promocional.
3. **Composición compacta y respirable:** buen uso del viewport; evitar padding gigante, demasiadas cards o sombras.
4. **Una misma identidad:** un conjunto coherente de tokens, tipografía, iconos y patrones; no diseñar cada módulo como una app diferente.
5. **No simular certeza clínica:** prohibidos diagnósticos automáticos, porcentajes de ludopatía, etiquetas patologizantes o gráficos sin datos y fundamento.
6. **Respeto por personas menores:** datos sensibles privados, acciones públicas/anónimas diferenciadas; no prometer seguridad técnica no implementada.
7. **Referencias responsables al tema:** se permiten referencias visuales a las apuestas cuando sirven para explicar o contextualizar, sin promoción, estética de casino dominante, premios ficticios ni gamificación que fomente participación compulsiva.
8. **Accesibilidad desde el inicio:** navegación teclado, etiquetas, foco, contraste, responsive y feedback de acciones.

## 2. Tokens semánticos

La propuesta del compañero establece estos valores **iniciales**. No escribir colores HEX dispersos dentro de JSX.

| Token | Valor | Uso |
|---|---|---|
| `--color-brand-navy` | `#172B3A` | logo, navegación y ancla de identidad |
| `--color-brand-teal` | `#2A7774` | acciones, enlaces, estado seleccionado |
| `--color-canvas` | `#F5F3EE` | fondo general |
| `--color-surface-soft` | `#DCE8E5` | fondos secundarios y énfasis suave |
| `--color-ink` | `#27343C` | texto principal |
| `--color-surface` | `#FFFFFF` | formulario, superficie y panel |
| `--color-border` | por derivar | borde neutro con contraste suficiente |
| `--color-muted` | por derivar | texto secundario contrastado |
| `--color-danger` / `warning` / `success` | por definir | feedback semántico independiente de marca |

Implementación sugerida en **Tailwind CSS 4** (ajustar a la arquitectura real):

```css
@import "tailwindcss";

:root {
  --modus-brand-navy: #172b3a;
  --modus-brand-teal: #2a7774;
  --modus-canvas: #f5f3ee;
  --modus-surface-soft: #dce8e5;
  --modus-ink: #27343c;
  --modus-surface: #ffffff;
}

@theme inline {
  --color-brand-navy: var(--modus-brand-navy);
  --color-brand-teal: var(--modus-brand-teal);
  --color-canvas: var(--modus-canvas);
  --color-surface-soft: var(--modus-surface-soft);
  --color-ink: var(--modus-ink);
  --color-surface: var(--modus-surface);
}
```

**Validación:** comprobar que Tailwind genere clases como `bg-canvas`, `text-ink` y `bg-brand-teal`; comprobar `@theme inline` con la versión de Tailwind instalada. Evitar introducir configuración de Tailwind 3 por inercia.

**Contrastes:** teal/blanco `5.26:1`; teal/marfil `4.75:1`; teal/verde suave `4.19:1` **no** usar para texto normal AA. Ink/marfil `11.53:1`. Verificar combinaciones reales: componentes, iconos, hover/focus/disabled; texto normal AA ≥ 4.5:1, texto grande ≥ 3:1, componentes no textuales ≥ 3:1 cuando aplique.

## 3. Tipografía

- Títulos: **Manrope** 600, ocasionalmente 700.
- UI y lectura: **Inter** 400–600.
- Escala de trabajo: H1 30–36px desktop / 26–30px móvil; H2 22–28px; H3 18–20px; cuerpo 16px / line-height 1.5–1.65; secundarios 14px mínimo cuando sean informativos. Ajustar por contenido y pruebas, no por azar.
- Ancho de párrafo educativo de referencia: 60–75 caracteres; evitar columnas demasiado anchas.
- Si las fuentes fallan, fallback legible `system-ui, sans-serif`.

## 4. Shell, navegación y rutas

**Navegación principal compartida:** un Navbar con accesos a `Inicio`, `Prevención` y `Comunidad`, disponible en las pantallas de la aplicación autenticada. **Dashboard:** panel global desplegable y colapsable, accesible desde esas pantallas y desde las páginas de herramientas; reúne accesos a las herramientas personales del eje Detección/Orientación, pero **no es una cuarta página principal**. **Perfil:** acceso secundario de cuenta. En escritorio y móvil, adaptar la posición y la forma de abrir/cerrar los elementos sin perder accesibilidad; el diseño responsive concreto se validará en la implementación.

**Home ACCESS:** presentar tres entradas a los ejes: Prevención, Comunidad y herramientas personales (abriendo el Dashboard global). Permitir información destacada secundaria real. Evitar feed central, métricas ficticias y tarjetas sobredimensionadas.

**No fusionar responsabilidades:** `Home` es la página inicial, `Dashboard` es un componente global de navegación a herramientas y `Perfil` es una página de cuenta. Cada herramienta del eje 2 puede tener su propia ruta y pantalla.

**Política de acceso:** NO aplicar permisos basándose solamente en el mockup del compañero. Su documento afirma que Prevención/Comunidad son privadas incluso para leer; documentación previa contemplaba contenido preventivo público y lectura de Comunidad abierta. Se necesita **RF final aprobado**. Los controles se implementan en backend/Supabase RLS donde corresponda, no solo ocultando enlaces.

Las URL técnicas se acuerdan tras inspección real del repo; no inventar rutas como contrato definitivo.

## 5. Componentes y normas de interacción

- Crear componentes de interfaz compartidos (`Button`, `Input`, `Dialog`, `EmptyState`, etc.) cuando aporten reutilización real. Crear Navbar y Dashboard como componentes del layout global porque deben estar disponibles desde distintas pantallas, aunque se monten una sola vez.
- Colores de botones: primario teal con texto de contraste; secundarios de borde discreto. Hover/focus/disabled/active distinguibles; no depender solo de cambios de tono.
- Radios de referencia: 8–14px para superficies; botones rectangulares suavizados, no todo cápsula; sin sombras elevadas innecesarias.
- Iconos: familia lineal consistente (Lucide es candidato técnico), no usar emojis como iconografía de producto.
- Fotografía/ilustración: el compañero propone ilustraciones; utilizarlas puntualmente donde comuniquen, sin convertirlas en lenguaje dominante. Verificar licencias y archivos fuente.
- Inputs con `<label>`, mensajes junto al campo, errores claros y sin perder valores al fallar.
- Carga, error, éxito, vacío y permiso denegado diseñados para cada vista relevante.
- Acción de usuario: feedback claro y no afirmar éxito antes de respuesta del servidor.

## 6. Responsive y accesibilidad

- Mobile first; revisar 360–390px, 768px y 1280–1440px como muestras, **no breakpoints rígidos de producto**.
- No overflow horizontal; ancho táctil cómodo, foco visible y orden de tabulación natural.
- HTML semántico, links para navegación y buttons para acciones; `aria` solo cuando aporte sobre semántica nativa.
- Contraste según WCAG 2.2 AA; no color como única señal.
- `prefers-reduced-motion` para transiciones no esenciales.
- Menús y diálogos deben manejar foco/apertura/cierre correctamente.
- En móvil, evitar que la barra inferior o el teclado virtual tapen botones de formularios.

## 7. Lenguaje y contenido

- Segmento: adolescentes **13–17 años** según definición vigente documentada; cualquier cambio debe registrarse.
- Frases breves, no paternalistas. No llamar «ludópata» a una persona ni ofrecer «diagnóstico».
- No afirmar que una experiencia inventada sea un testimonio real ni que noticias ficticias sean actuales.
- El contenido educativo definitivo requiere fuentes y revisión del eje 1.
- En Comunidad: distinguir identidad visible/anónima, privado/público y contenido de Tableros. La representación UX no reemplaza autorización efectiva.

## 8. Módulos que NO se inventan desde UI

No generar instrumentos diagnósticos, resultados en dimensiones conductuales, registros sensibles, métricas de recuperación, rachas de abstinencia, chat privado entre menores y adultos o emparejamientos sin requerimientos finales y seguridad revisada. **Las rachas grupales de participación**, si siguen en RF vigente, no son días sin apostar.

Los módulos del eje 2 se maquetan contra sus RF cerrados y entregados por el responsable. Mantener el **Dashboard global** como acceso ampliable a herramientas con páginas propias, sin imponer una página central `MiEspacioPage` ni una estructura clínica.

## 9. Convenciones frontend

- Proyecto **original**, no maqueta temporal. Inspeccionar árbol real antes de crear carpetas.
- Stack de referencia: React + Vite + JavaScript + Tailwind CSS 4; separar `features`, `layouts`, `pages`, `components` y `assets` solo si corresponde a la estructura acordada.
- Rutas declaradas en un lugar; datos remotos aislados en adaptadores/herramientas de acceso; no consultas duplicadas en componentes visuales.
- Estado local para UI efímera, fuente remota para datos persistentes; no conservar información sensible en localStorage sin un análisis explícito de seguridad.
- Componentes reutilizables solo ante duplicación real; no sobreingeniería.
- Sin librerías UI que impongan su identidad por defecto. Verificar dependencias y licencias.
- Validar `npm run build` y revisión visual desktop/móvil antes de declarar una pantalla lista.

## 10. Criterio de listo para implementación

- [ ] Repositorio original localizado e inventariado.
- [x] Dirección visual y Home ACCESS aceptados como baseline por responsable.
- [ ] Diseño y flujos comparados con **RF finales** de los tres ejes.
- [ ] Permisos públicos/privados confirmados por el equipo.
- [ ] Tokens comprobados y contraste de pares reales verificado.
- [ ] Layout navegable y estados básicos revisados en móvil y escritorio.
- [ ] Dudas de seguridad de menores tratadas antes de habilitar usuarios reales.

## 11. Control de cambios

| Versión | Fecha | Cambio | Estado |
|---|---|---|---|
| 1.0 | 2026-10-27 | Adopción de dirección MODUS del compañero + convenciones técnicas y correcciones textuales | Baseline original |
| 1.1 | 2026-10-27 | Se alineó el acceso al Dashboard global, la navegación principal y el uso educativo de referencias visuales a apuestas con las decisiones vigentes | Baseline de diseño; funciones y permisos dependen de RF vigentes |

**Regla para agentes:** Si alguna instrucción de esta guía contradice un RF aprobado más reciente, no cambies silenciosamente el RF ni el diseño. Registrá la contradicción con fuente, pedí decisión al responsable y continuá con partes independientes.
