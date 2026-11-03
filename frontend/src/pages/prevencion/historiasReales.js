export const formatosHistorias = [
  { id: "todos", label: "Todas las experiencias" },
  { id: "primera-persona", label: "En primera persona" },
  { id: "familiar", label: "Relato familiar" },
];

export const historiasReales = [
  {
    id: "matias-r",
    title: "De un juego social a una situación difícil de manejar",
    summary:
      "Matías R. cuenta que empezó a jugar presencialmente y que, más adelante, también apostó por internet. En la entrevista relata dificultades con el dinero, ocultamiento y búsqueda de apoyo.",
    country: "Argentina",
    format: "primera-persona",
    formatLabel: "Entrevista en primera persona",
    themes: ["Dinero y deudas", "Estudios y vínculos", "Búsqueda de apoyo"],
    contentNote: "Menciona deudas, ocultamiento y una recaída.",
    sections: [
      {
        heading: "Contexto",
        text: "En la entrevista publicada por Revista GENTE, Matías R. relata que comenzó a jugar presencialmente a los 18 años y que después incorporó apuestas por internet.",
      },
      {
        heading: "Consecuencias que cuenta",
        text: "Describe dificultades para manejar el dinero, deudas, mentiras sobre sus actividades y momentos en que dejó de asistir a la facultad para jugar. También cuenta que tendía a aislarse.",
      },
      {
        heading: "Búsqueda de apoyo",
        text: "Relata que buscó apoyo en Jugadores Anónimos junto con su pareja y que después atravesó una recaída. La entrevista no presenta el proceso como inmediato ni lineal.",
      },
    ],
    editorialNote:
      "El artículo distingue a Mariano T., quien presenta el contacto, de Matías R., la persona entrevistada. Este resumen se refiere únicamente al testimonio de Matías.",
    reflection:
      "¿Qué cambios en sus actividades cotidianas te ayudan a notar que la situación empezó a afectarlo?",
    sourcePublisher: "Revista GENTE",
    sourceLanguage: "Fuente original en español",
    sourceUrl:
      "https://www.revistagente.com/actualidad/me-estaba-arruinando-la-vida-el-infierno-de-un-ludopata-y-como-le-gano-a-la-adiccion-a-las-apuestas-online/",
  },
  {
    id: "relato-familiar-bbc",
    title: "Una familia buscando cómo acompañar",
    summary:
      "Steve, un padre entrevistado por la BBC, cuenta cómo su familia se enteró de que su hijo adulto estaba apostando online y buscó orientación.",
    country: "Reino Unido",
    format: "familiar",
    formatLabel: "Relato de un familiar",
    themes: ["Dinero y deudas", "Familia y vínculos", "Búsqueda de apoyo"],
    contentNote: "Menciona pérdidas de dinero y preocupación familiar.",
    sections: [
      {
        heading: "Contexto",
        text: "La BBC recoge el relato de Steve sobre su hijo, que era adulto al momento de la entrevista. El hijo no es identificado y la historia está narrada por su padre, no en primera persona por él.",
      },
      {
        heading: "Consecuencias que cuenta",
        text: "Steve relata que su hijo perdió el salario de una semana en poco tiempo y que más adelante apostó online con dinero de otras personas. La familia dice que al principio no comprendía el alcance de lo que ocurría y se aisló por temor a ser juzgada.",
      },
      {
        heading: "Búsqueda de apoyo",
        text: "El padre cuenta que él y su esposa buscaron información y asistieron a un grupo de apoyo para familiares; su hijo también comenzó a recibir ayuda.",
      },
    ],
    editorialNote:
      "La nota recoge la opinión del padre sobre videojuegos, pero también incluye cautela profesional: no establece que estos hayan causado las apuestas. Este resumen no afirma una relación causal.",
    reflection:
      "¿Qué podría ayudar a una familia a buscar información y apoyo sin juzgar a quien está atravesando una dificultad?",
    sourcePublisher: "BBC",
    sourceLanguage: "Fuente original en inglés",
    sourceUrl: "https://www.bbc.com/news/stories-49941610",
  },
];
