/*
 * Contenido del onboarding definido en RF-DO-01: cinco temas y opciones seleccionables.
 * OnboardingPage usa este catálogo para renderizar un paso por pregunta.
 * Las opciones son textos de interfaz, no respuestas precargadas ni niveles de riesgo.
 * Fuente: https://trello.com/c/GvkSf6nr
 */
export const onboardingQuestions = [
  // Los rangos no se superponen y no requieren la fecha de nacimiento exacta.
  {
    id: "ageRange",
    title: "¿En qué rango de edad estás?",
    description: "No necesitamos tu fecha de nacimiento exacta.",
    options: [
      { value: "13-14", label: "13 a 14 años" },
      { value: "15-17", label: "15 a 17 años" },
      { value: "18-plus", label: "18 años o más" },
    ],
  },
  // La experiencia previa aporta contexto; no crea registros de Mi actividad.
  {
    id: "bettingExperience",
    title: "¿Participaste alguna vez en apuestas?",
    description: "Elegí la opción que describa tu experiencia.",
    options: [
      { value: "yes", label: "Sí, participé" },
      { value: "no", label: "No participé" },
    ],
  },
  // Esta frecuencia es aproximada: no se interpreta como actividad diaria registrada.
  {
    id: "approximateFrequency",
    title: "¿Con qué frecuencia apostás aproximadamente?",
    description: "Es una referencia inicial, no un registro de tus días.",
    options: [
      { value: "not-currently", label: "No apuesto actualmente" },
      { value: "less-than-weekly", label: "Menos de una vez por semana" },
      { value: "one-to-three-days", label: "Entre 1 y 3 días por semana" },
      { value: "four-to-six-days", label: "Entre 4 y 6 días por semana" },
      { value: "daily", label: "Todos los días" },
    ],
  },
  // Recoger la percepción expresada por la persona sin asignarle una clasificación.
  {
    id: "personalPerception",
    title: "¿Cómo sentís hoy tu relación con las apuestas?",
    description: "No hay respuestas correctas o incorrectas.",
    options: [
      { value: "little-presence", label: "No ocupan un lugar importante en mi día a día" },
      { value: "questions", label: "Tengo algunas dudas sobre mi forma de apostar" },
      { value: "concerns", label: "Hay situaciones que me preocupan" },
      { value: "unsure", label: "Todavía no sé cómo describirla" },
    ],
  },
  // El motivo permite conocer qué busca; aquí todavía no se personalizan otros módulos.
  {
    id: "entryReason",
    title: "¿Qué te gustaría encontrar en MODUS?",
    description: "Podés elegir lo que más te interese en este momento.",
    options: [
      { value: "understand-risks", label: "Entender mejor los riesgos de las apuestas" },
      { value: "understand-activity", label: "Observar y comprender mi actividad" },
      { value: "peer-support", label: "Conocer experiencias y apoyo entre pares" },
      { value: "practical-resources", label: "Encontrar herramientas y recursos prácticos" },
    ],
  },
];
