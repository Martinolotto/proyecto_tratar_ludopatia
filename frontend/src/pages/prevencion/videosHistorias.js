export const categoriasVideosHistorias = [
  "Historias de jóvenes",
  "Historias familiares",
  "Deudas y pérdidas económicas",
  "Consecuencias personales y emocionales",
  "Historias de recuperación",
  "Duelo y suicidio",
];

export const videoIntroduccionPrevencion = {
  title: "Las apuestas no son un juego",
  publisher: "Ministerio Público Tutelar de la Ciudad Autónoma de Buenos Aires",
  summary:
    "La campaña invita a pensar cómo una apuesta puede irrumpir en un momento compartido y afectar los vínculos, el descanso, la vida cotidiana y la salud mental. El MPT también señala al celular y a la promesa de ganar dinero fácil como posibles puertas de entrada.",
  sourceUrl:
    "https://mptutelar.gob.ar/campana/las-apuestas-no-son-un-juego/",
  embedUrl: "https://www.youtube.com/embed/5OGZNxsejRY",
  aspect: "vertical",
};

export const spotsPrevencion = [
  {
    ...videoIntroduccionPrevencion,
    id: "mpt-las-apuestas-no-son-un-juego",
    formatLabel: "Campaña institucional",
    provider: "youtube",
    awarenessMessage:
      "Cuando las apuestas están a un clic, pueden mezclarse con la rutina y las decisiones sin que siempre sea fácil advertirlo. Entender cómo funcionan y hablarlo a tiempo ayuda a mirar la situación con más claridad y a pedir acompañamiento sin vergüenza.",
    categories: ["Prevención y campañas"],
    actionLabel: "Conocer la campaña en el MPT",
  },
  {
    id: "campana-movistar-faro-tiktok",
    title: "No pierdas tu adolescencia apostando",
    person: "Campaña de Fundación Telefónica Movistar y Faro Digital",
    summary:
      "Pieza de concientización sobre las apuestas durante la adolescencia. La descripción de la publicación menciona un informe de la Defensoría del Pueblo de la Ciudad de Buenos Aires y remite a una guía de LA NACIÓN.",
    categories: ["Prevención y campañas"],
    publisher:
      "LA NACIÓN · campaña de Fundación Telefónica Movistar y Faro Digital",
    sourceUrl:
      "https://www.tiktok.com/@lanacioncom/video/7466161560210164998",
    embedUrl:
      "https://www.tiktok.com/player/v1/7466161560210164998?description=1&music_info=0",
    aspect: "vertical",
    referenceUrl: "https://www.lanacion.com.ar/chicosyapuestas",
    referenceLabel: "Consultar la guía de LA NACIÓN",
    formatLabel: "Campaña de concientización",
    provider: "tiktok",
    awarenessMessage:
      "Una apuesta puede parecer una forma rápida de ganar o resolver algo. También vale preguntarse qué lugar empieza a ocupar en el tiempo, la plata y los vínculos. No hace falta esperar a estar mal para conversar y buscar apoyo.",
    actionLabel: "Abrir video original en TikTok",
  },
];

export const videosHistoriasReales = [
  {
    id: "valentino-solda-la-nacion",
    title: "Valentino: una experiencia que empezó durante la adolescencia",
    person: "Valentino Solda",
    summary:
      "Valentino cuenta que empezó a apostar online durante la adolescencia y relata cómo la situación afectó su vida cotidiana y sus vínculos. La publicación también describe el apoyo que buscó para salir adelante.",
    contentNote:
      "El relato menciona deudas, mentiras y malestar emocional.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "LA NACIÓN · reproductor oficial de JW Player",
    publicationDate: "20 de junio de 2025",
    sourceUrl:
      "https://www.lanacion.com.ar/comunidad/tiene-21-anos-y-sufrio-una-adiccion-a-las-apuestas-online-pedi-cinco-prestamos-y-llegue-a-robarle-nid19062025/",
    embedUrl: "https://cdn.jwplayer.com/players/NQFikhDB.html",
    aspect: "horizontal",
    formatLabel: "Entrevista en video",
    actionLabel: "Abrir publicación original en LA NACIÓN",
  },
  {
    id: "max-tn",
    title: "Max: una historia que comenzó a los 14 años",
    person: "Max (identificado así por TN)",
    summary:
      "En el reportaje, Max cuenta que empezó a apostar durante la adolescencia y describe deudas, ocultamiento y su proceso de recuperación. TN indica que tenía 16 años al compartir su experiencia.",
    contentNote:
      "El relato aborda deudas, vergüenza y malestar emocional.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "TN",
    publicationDate: "31 de agosto de 2024",
    sourceUrl:
      "https://tn.com.ar/sociedad/2024/08/31/tenia-14-anos-perdio-us400-mil-en-apuestas-y-hoy-esta-en-recuperacion-el-peligro-de-la-ludopatia-infantil/",
    nativeVideoUrl:
      "https://vod.vodgc.net/gid1/vod/Artear/TN/144/1-398-mFekVR1725157044138_360P.mp4",
    aspect: "horizontal",
    formatLabel: "Testimonio en un reportaje",
    actionLabel: "Abrir publicación original en TN",
  },
  {
    id: "madre-testimonio-tiktok",
    title: "El testimonio de una madre",
    person: "Testimonio de una madre",
    summary:
      "El video compartido por el equipo de MODUS presenta el testimonio de una madre sobre una situación relacionada con las apuestas, las deudas y el suicidio.",
    contentNote:
      "Contenido sensible: una madre habla de la muerte de su hijo por suicidio y de una situación relacionada con apuestas y deudas. La experiencia no representa a todas las personas ni permite concluir que exista una causa única.",
    categories: [
      "Historias familiares",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Duelo y suicidio",
    ],
    publisher: "@hernan_danolfo · TikTok",
    publicationDate: "",
    sourceUrl:
      "https://www.tiktok.com/@hernan_danolfo/video/7685891241732607252",
    embedUrl:
      "https://www.tiktok.com/player/v1/7685891241732607252?description=1&music_info=0",
    aspect: "vertical",
    formatLabel: "Testimonio familiar",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "adolescente-anonimo-tn-tiktok",
    title: "Un adolescente cuenta cómo empezó a apostar a los 14",
    person: "Adolescente con identidad reservada",
    summary:
      "Cuenta que empezó a apostar influido por sus amigos y que llegó a hacerlo durante las clases, ocultando lo que hacía. Describe cómo aumentaron las cantidades, el endeudamiento y una recaída después de intentar dejarlo; se identifica como una persona en recuperación.",
    contentNote:
      "El testimonio aborda endeudamiento, ocultamiento y dificultad para dejar de apostar. Se preserva la identidad del adolescente y no se destacan las cifras económicas que menciona.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "Todo Noticias · TikTok",
    sourceUrl:
      "https://www.tiktok.com/@todonoticias/video/7412337806682393862",
    embedUrl:
      "https://www.tiktok.com/player/v1/7412337806682393862?description=1&music_info=0",
    aspect: "vertical",
    referenceUrl: "https://screenapp.io/app/files/6af0a0d26c103a6ee2f7710a",
    referenceLabel: "Consultar grabación de la entrevista",
    formatLabel: "Entrevista anónima",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "joven-adulto-infobae-tiktok",
    title: "De la ruleta recreativa a una decisión de dejar de apostar",
    person: "Joven adulto entrevistado por Infobae",
    summary:
      "Relata que pasó de jugar a la ruleta por diversión a tener dificultades para controlar las apuestas. Describe cambios en su ánimo y sus vínculos, deudas, pérdidas y recaídas; también cuenta que decidió dejar de apostar y documentar un reto sin apuestas.",
    contentNote:
      "El relato aborda deudas, cambios emocionales, conflictos familiares y recaídas. La decisión de dejar de apostar se presenta como parte de su experiencia, no como una recuperación garantizada.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "Infobae · TikTok",
    sourceUrl:
      "https://www.tiktok.com/@infobae/video/7455879633678961926",
    embedUrl:
      "https://www.tiktok.com/player/v1/7455879633678961926?description=1&music_info=0",
    aspect: "vertical",
    referenceUrl:
      "https://www.infobae.com/reportajes/2025/01/04/el-relato-del-joven-que-documenta-cada-dia-que-lleva-sin-apostar-el-juego-no-solo-te-lleva-a-perder-plata-sino-la-vida/",
    referenceLabel: "Leer la entrevista de Infobae",
    formatLabel: "Entrevista a un joven adulto",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "julio-charly-testimonio-recuperacion",
    title: "Un testimonio sobre la ludopatía y la recuperación",
    person: "Adulto entrevistado, sin nombre publicado",
    summary:
      "En una entrevista callejera republicada por @juliocharly033, un hombre cuenta que apuesta desde los 18 años y que actualmente realiza un tratamiento; llevaba cerca de ocho meses sin jugar al momento de la entrevista. Relata que pedía dinero para seguir jugando, pagar cuentas y comprar comida, y que llegó a sentir que ya no controlaba el juego ni sus cuentas. Explica que lo usaba para escapar de situaciones personales, con aislamiento y deterioro de sus amistades y pareja. También expresa arrepentimiento y advierte sobre la publicidad de apuestas difundida por deportistas e influencers.",
    contentNote:
      "El testimonio aborda endeudamiento, aislamiento y dificultades personales. El entrevistado no proporciona su nombre.",
    categories: [
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "TikTok · republicación de una entrevista de @hernan_danolfo",
    sourceUrl:
      "https://www.tiktok.com/@juliocharly033/video/7620547490688847124",
    embedUrl:
      "https://www.tiktok.com/player/v1/7620547490688847124?description=1&music_info=0",
    aspect: "vertical",
    formatLabel: "Entrevista callejera republicada",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "infobae-testimonio-mujer-ludopatia",
    title: "Una experiencia de ludopatía y búsqueda de acompañamiento",
    person: "Mujer entrevistada, identidad reservada",
    summary:
      "En la entrevista, una mujer que aparece en silueta cuenta que comenzó a consumir sustancias a los 15 años y fue madre a los 16. Relata que empezó a apostar después de que una amiga le mostrara cómo cargar dinero en una plataforma; una primera ganancia y la expectativa de resolver sus problemas económicos la llevaron a continuar, y las deudas de préstamos agravaron la situación. Después de una conversación difícil con su madre, decidió internarse. Actualmente continúa con atención ambulatoria, terapia y grupos de adicciones.",
    contentNote:
      "Contenido sensible: aborda consumo problemático de sustancias, apuestas, deudas y una situación emocional difícil. La entrevistada aparece sin revelar su identidad.",
    categories: [
      "Historias familiares",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "Infobae · TikTok",
    sourceUrl:
      "https://www.tiktok.com/@infobae/video/7445501100033199365",
    embedUrl:
      "https://www.tiktok.com/player/v1/7445501100033199365?description=1&music_info=0",
    aspect: "vertical",
    referenceUrl:
      "https://www.infobae.com/reportajes/2024/12/07/el-flagelo-de-la-ludopatia-y-la-mama-que-se-interno-cuando-su-hijo-le-dijo-que-se-queria-morir-mama-no-quiero-que-juegues-mas/",
    referenceLabel: "Leer la entrevista de Infobae",
    formatLabel: "Entrevista en silueta",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "joven-identidad-reservada-tn-tiktok",
    title: "Un joven relata cómo las apuestas afectaron su adolescencia",
    person: "Joven entrevistado por TN, identidad reservada",
    summary:
      "Cuenta que al despertarse revisaba el celular para conocer el resultado de sus apuestas y que durante las clases pensaba en los partidos y en qué apostar. Relata el estrés y las amenazas de personas de su edad y de adultos, y que dejó su provincia en ese contexto. También describe el apoyo de compañeros y hermanos, y cómo recuperó tranquilidad, volvió a trabajar, empezó a pagar deudas y reconstruyó vínculos.",
    contentNote:
      "El relato aborda consecuencias escolares, endeudamiento y amenazas. No se publica el nombre ni una edad exacta del entrevistado.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
      "Historias de recuperación",
    ],
    publisher: "Todo Noticias · TikTok",
    sourceUrl:
      "https://www.tiktok.com/@todonoticias/video/7369193336948755718",
    embedUrl:
      "https://www.tiktok.com/player/v1/7369193336948755718?description=1&music_info=0",
    aspect: "vertical",
    formatLabel: "Entrevista en silueta",
    actionLabel: "Abrir video original en TikTok",
  },
  {
    id: "agustin-stizza-despacho-play-tiktok",
    title: "Agustín Stizza cuenta cómo empezaron sus apuestas",
    person: "Agustín Stizza",
    summary:
      "Agustín cuenta que empezó a apostar a los 17 años y que una primera ganancia lo llevó a continuar. Describe cómo volvió a jugar para recuperar pérdidas, recurrió a préstamos crecientes y ocultó a personas cercanas en qué usaba su dinero; su madre le preguntaba por su sueldo. También relata que llegó a perder el sueldo de un mes en pocos minutos y que podía perder lo que llevaba en una noche de casino.",
    contentNote:
      "El testimonio aborda endeudamiento, ocultamiento y pérdidas económicas.",
    categories: [
      "Historias de jóvenes",
      "Deudas y pérdidas económicas",
      "Consecuencias personales y emocionales",
    ],
    publisher: "Despacho Play · TikTok",
    sourceUrl:
      "https://www.tiktok.com/@despacho.play/video/7567474199149743367",
    embedUrl:
      "https://www.tiktok.com/player/v1/7567474199149743367?description=1&music_info=0",
    aspect: "vertical",
    referenceUrl:
      "https://www.lacapital.com.ar/la-ciudad/tiene-20-anos-fue-adicto-al-juego-y-ahora-acompana-chicos-que-no-repitan-su-historia-n10219124.html/amp",
    referenceLabel: "Leer la nota relacionada de La Capital",
    formatLabel: "Entrevista testimonial",
    actionLabel: "Abrir video original en TikTok",
  },
];
