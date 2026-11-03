export const categoriasPrevencion = [
  { id: "azar", label: "Apuestas y azar" },
  { id: "pensamientos", label: "Pensamientos y sesgos" },
  { id: "entorno", label: "Publicidad y entorno" },
  { id: "impactos", label: "Impactos posibles" },
];

export const contenidosPrevencion = [
  {
    id: "apuestas-y-azar",
    category: "azar",
    title: "Apuestas online y azar",
    summary:
      "Qué significa arriesgar dinero en un resultado incierto y por qué posibilidad no es lo mismo que certeza.",
    introduction:
      "Entender qué se pone en juego ayuda a mirar las apuestas online con más claridad, sin confundir una posibilidad con una garantía.",
    sections: [
      {
        heading: "¿Qué es una apuesta?",
        text: "La Organización Mundial de la Salud describe el juego de apuestas como arriesgar dinero u otro objeto de valor en un resultado incierto, con la posibilidad de obtener algo a cambio. En internet, estas opciones pueden estar disponibles desde distintos dispositivos.",
      },
      {
        heading: "Posible no quiere decir seguro",
        text: "Cuando un resultado es incierto, no hay una promesa de que ocurra lo que alguien espera. Una secuencia anterior, por sí sola, tampoco permite asegurar qué pasará después.",
      },
    ],
    reflection:
      "¿Qué diferencia hay entre que algo pueda ocurrir y tener la seguridad de que va a ocurrir?",
    sources: [
      {
        name: "Gambling — ficha informativa",
        organization: "Organización Mundial de la Salud (OMS)",
        language: "Fuente en inglés",
        url: "https://www.who.int/news-room/fact-sheets/detail/gambling",
      },
    ],
    searchTerms: "incertidumbre probabilidad funcionamiento dinero",
  },
  {
    id: "casi-ganar",
    category: "pensamientos",
    title: "Cuando algo parece «casi ganar»",
    summary:
      "Un resultado que se siente cercano a una victoria sigue siendo distinto de haber ganado.",
    introduction:
      "A veces una situación puede sentirse muy cerca de salir como esperábamos. Ponerle nombre a esa sensación ayuda a separar lo que sentimos de lo que efectivamente ocurrió.",
    sections: [
      {
        heading: "La sensación de estar cerca",
        text: "En investigación sobre apuestas, «casi ganar» describe un resultado que no es una victoria pero que se percibe como cercano a una. Esa cercanía percibida no cambia el resultado: no fue una victoria.",
      },
      {
        heading: "Una sensación no predice el siguiente resultado",
        text: "Sentir que algo estuvo cerca no da información suficiente para saber qué ocurrirá después. La impresión de cercanía y el resultado real son cosas distintas.",
      },
    ],
    reflection:
      "¿Qué diferencia hay entre sentir que estuviste cerca y haber obtenido el resultado que querías?",
    sources: [
      {
        name: "Neurophysiological Correlates of the Near-Miss Effect in Gambling",
        organization: "Journal of Gambling Studies, registro en PubMed",
        language: "Artículo científico en inglés",
        url: "https://pubmed.ncbi.nlm.nih.gov/32170502/",
      },
    ],
    searchTerms: "sesgos cognitivos casi casi ilusión cercanía",
  },
  {
    id: "recuperar-perdidas",
    category: "pensamientos",
    title: "La idea de recuperar lo perdido",
    summary:
      "Seguir arriesgando para intentar recuperar dinero puede hacer más difícil tomar distancia.",
    introduction:
      "Después de una pérdida, puede aparecer la idea de que una apuesta más permitiría compensarla. Esa idea merece una pausa: no convierte el siguiente resultado en algo seguro.",
    sections: [
      {
        heading: "Una pregunta para observar",
        text: "El Servicio Nacional de Salud del Reino Unido incluye entre sus preguntas de reflexión si alguien intentó recuperar dinero que perdió. MODUS la presenta solo como un tema para pensar; no es un test ni permite sacar conclusiones sobre una persona.",
      },
      {
        heading: "La pérdida no asegura una recuperación",
        text: "Haber perdido antes no garantiza recuperar ese dinero en un resultado posterior. Tomar un momento para reconocer la presión o la expectativa puede ayudar a mirar la situación con más perspectiva.",
      },
    ],
    reflection:
      "¿Alguna vez sentiste presión por compensar una pérdida o un error rápidamente?",
    sources: [
      {
        name: "Gambling addiction",
        organization: "National Health Service (NHS), Reino Unido",
        language: "Fuente en inglés; referencia internacional, no recurso local",
        url: "https://www.nhs.uk/live-well/addiction-support/gambling-addiction/",
      },
    ],
    searchTerms:
      "perseguir pérdidas perdida perder recuperar dinero apuestas",
  },
  {
    id: "publicidad-y-apuestas",
    category: "entorno",
    title: "Publicidad, deportes y redes",
    summary:
      "La promoción puede hacer que las apuestas parezcan parte habitual de actividades cotidianas.",
    introduction:
      "Los mensajes sobre apuestas pueden aparecer junto a deportes, contenidos populares y redes sociales. Reconocer el contexto ayuda a distinguir una promoción de información neutral.",
    sections: [
      {
        heading: "Lo que vemos también construye contexto",
        text: "La OMS señala que la promoción en deportes y medios populares, incluidas las redes sociales, puede contribuir a normalizar las apuestas. Que una actividad aparezca mucho no significa que sea adecuada para todas las personas ni que esté libre de riesgos.",
      },
      {
        heading: "Mirar el mensaje con distancia",
        text: "Cuando un contenido relaciona apuestas con pertenecer a un grupo, ser fan o seguir a una figura conocida, puede servir preguntarse quién lo comunica y qué busca promover.",
      },
    ],
    reflection:
      "¿Dónde viste mensajes sobre apuestas y cómo cambia su significado según quién los comparte?",
    sources: [
      {
        name: "Gambling — ficha informativa",
        organization: "Organización Mundial de la Salud (OMS)",
        language: "Fuente en inglés",
        url: "https://www.who.int/news-room/fact-sheets/detail/gambling",
      },
    ],
    searchTerms: "marketing influencers captación redes sociales deportes",
  },
  {
    id: "impactos-posibles",
    category: "impactos",
    title: "Lo que puede verse afectado",
    summary:
      "Las consecuencias no son iguales para todas las personas, pero pueden alcanzar distintas áreas de la vida.",
    introduction:
      "Hablar de posibles impactos no significa asumir que todas las personas vivirán lo mismo. Sirve para comprender por qué el tema merece atención y un trato sin culpa.",
    sections: [
      {
        heading: "Más de un aspecto de la vida",
        text: "La OMS describe daños asociados a las apuestas que pueden incluir dificultades económicas y en las relaciones, además de efectos sobre la salud y el bienestar. No son un destino inevitable ni una forma de definir a alguien.",
      },
      {
        heading: "Cada experiencia merece respeto",
        text: "Las situaciones personales son distintas. Este material comparte información general y no evalúa experiencias individuales, diagnostica ni reemplaza la orientación de profesionales o servicios especializados.",
      },
    ],
    reflection:
      "¿Qué personas de confianza podrían escuchar sin juzgar si algo te preocupa?",
    sources: [
      {
        name: "Gambling — ficha informativa",
        organization: "Organización Mundial de la Salud (OMS)",
        language: "Fuente en inglés",
        url: "https://www.who.int/news-room/fact-sheets/detail/gambling",
      },
    ],
    searchTerms: "consecuencias personales sociales económicas bienestar",
  },
];
