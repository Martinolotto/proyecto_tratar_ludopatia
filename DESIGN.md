---
name: MODUS
description: Interfaz joven y madura para educación, orientación y apoyo entre pares
colors:
  marca-azul-profundo: "#172b3a"
  marca-verde-azulado: "#2a7774"
  lienzo-calido: "#f5f3ee"
  superficie-suave: "#dce8e5"
  tinta: "#27343c"
  superficie: "#ffffff"
typography:
  heading:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
---

# MODUS — referencia de diseño

## Overview

La guía [MODUS-DS-001](docs/design/DESIGN_GUIDELINES.md) es la baseline aprobada. Este archivo resume el sistema observado y la dirección pedida por el responsable; no convierte en definitivos los diseños o componentes que siguen en revisión. Ante diferencias, prevalecen los RF y las decisiones vigentes del equipo.

Buscamos una plataforma cercana a adolescentes, madura y con personalidad propia: clara, contemporánea y respetuosa. Evitar tanto la estética hospitalaria y de centro de adicciones como la infantilización. El vidrio translúcido puede aportar profundidad de forma puntual y sutil, manteniendo contraste y legibilidad.

## Colors

Los colores anteriores proceden de `frontend/src/index.css`: azul profundo para identidad y anclaje, verde azulado para acciones, lienzo cálido y superficies claras para lectura. Los colores semánticos para errores, advertencias y éxito siguen por definir. Comprobar el contraste real de cada combinación; no depender únicamente del color para indicar estados.

## Typography

Manrope identifica títulos; Inter se usa para lectura e interfaz. Usar jerarquía visible, texto breve y pesos cómodos. Las escalas sugeridas por la guía son una referencia, no tamaños definitivos para todas las pantallas.

## Layout

Composición respirable y compacta, con jerarquía clara y sin multiplicar tarjetas. Adaptar controles y contenido a móvil y escritorio, sin desbordamiento horizontal. Home, Dashboard y Perfil mantienen responsabilidades distintas.

**Historial y progreso:** en escritorio utiliza el ancho disponible junto a la barra lateral, con encabezado y filtros compactos. La vista Mi historial organiza calendario y listado junto a un detalle contextual; las reflexiones ocupan una sección abierta. Las celdas distinguen sus estados mediante color, marcas y etiquetas accesibles. Mis avances tendrá una composición propia centrada en participación e insignias; su diseño y conexión siguen pendientes. Ambas vistas comparten pestañas y puntos de navegación, con movimiento reducido.

## Elevation & Depth

Preferir profundidad discreta. Los efectos de vidrio deben conservar una base legible si no existe soporte para desenfoque; evitar desenfoques o sombras que compitan con las acciones.

## Shapes

La guía propone esquinas suavizadas de 8–14 px como referencia, no una escala definitiva. Bordes y superficies deben comunicar agrupación y estados sin adornos innecesarios.

## Components

- **Navegación:** accesos coherentes y foco visible. El Dashboard es un panel global, no una cuarta página principal.
- **Pie compartido:** agrupa enlaces existentes y se adapta a la pantalla; no implica que los permisos de las rutas estén resueltos.
- **Botones y campos:** acción principal reconocible, etiquetas visibles, estados de carga y error comprensibles y uso por teclado.
- **Acceso:** formulario de registro e ingreso con transición entre modos; respetar movimiento reducido. Su apariencia actual puede evolucionar.

## Do's and Don'ts

- Favorecer voz directa, humana y no paternalista.
- Usar acentos visuales y animación con propósito, sin convertir la interfaz en una estética de casino.
- Evitar texto clínico, diagnósticos o datos inventados.
- No fijar como definitiva una composición de una página que el equipo todavía está revisando.

## Referencia anterior: Mi actividad en superficies oscuras

La versión anterior de Mi actividad utilizaba el fondo `#253a45`, un encabezado
`#304f58` y una superficie principal `#28464f`, con texto `#eef6f3` y texto
secundario `#e0eeea`. Los bloques de dinero, tiempo, situaciones y nota usaban
respectivamente `#38675e`, `#405970`, `#396467` y `#46596d`; los estados de
selección y acción se apoyaban en `#dcebe3` y `#a4e0cb`. Se conservan como
referencia de diseño para una posible exploración posterior, sin activar un tema
oscuro ni alterar los tokens de marca actuales.
