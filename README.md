# MODUS

MODUS es una plataforma web universitaria dirigida principalmente a adolescentes de 13 a 17 años. Ofrece un espacio cercano, accesible y respetuoso para informarse sobre las apuestas, comprender las propias decisiones y encontrar recursos de apoyo.

## La problemática y nuestra respuesta

Las apuestas pueden aparecer como una actividad cotidiana en el deporte, las redes sociales y los grupos de amigos. Reconocer sus posibles consecuencias y pedir ayuda no siempre resulta sencillo, especialmente cuando cuesta poner en palabras lo que está pasando.

MODUS reúne información preventiva, herramientas de registro y orientación, y un espacio de intercambio. Cada persona puede explorar la plataforma a su ritmo. Las devoluciones son orientativas: no constituyen un diagnóstico ni reemplazan la atención profesional.

## Equipo y desarrollo

### Martino · Detección y orientación

El eje de Detección ayuda a observar la actividad personal y reflexionar sobre las decisiones, incluso sin contar con registros previos.

- **Mi actividad:** registro diario privado y editable, con campos opcionales para el tiempo, las cantidades, el dinero, las situaciones y las notas.
- **Mi historial:** calendario, detalle por día, reflexiones, métricas y gráficos para consultar los registros.
- **Mis avances:** participación, continuidad y reconocimientos vinculados al recorrido y a las medidas de protección declaradas.
- **Tu resumen:** observaciones orientativas basadas en los registros de los últimos 30 días, con evidencia, explicaciones y acceso a herramientas preventivas.
- **Evaluar mi comportamiento:** una situación ficticia interactiva en la que las decisiones dan lugar a una devolución para reflexionar. El recorrido es temporal y no se incorpora a los registros personales.
- **Escudo digital:** recursos de protección y apoyo, con medidas que cada persona puede declarar y actualizar.

Martino también trabajó en la base compartida del proyecto: registro e ingreso con **Supabase Auth**, sesión y navegación protegida, recorrido inicial, perfil, integración de Inicio y la navegación, además del modelo de datos, migraciones y permisos para las funcionalidades de la plataforma.

### Ivan · Prevención

El eje de Prevención busca que los adolescentes puedan entender mejor las apuestas, sus riesgos y las situaciones que las rodean.

Incluye contenidos organizados por categorías, búsqueda y filtros, lecturas, historias y testimonios en video para acercar información desde diferentes formatos.

### Jonathan · Comunidad

El eje de Comunidad propone un espacio de intercambio y apoyo entre pares para compartir experiencias y conversar sobre ellas.

Permite explorar y filtrar publicaciones por etiquetas, publicar y comentar de forma anónima o con alias, responder comentarios, expresar apoyo y retirar publicaciones o comentarios propios.

## Tecnología y documentación

MODUS utiliza React, Vite y Supabase, con un backend Express. Para preparar el proyecto y conocer su organización, consultá [setup.md](setup.md) y la [documentación del equipo](docs/).
