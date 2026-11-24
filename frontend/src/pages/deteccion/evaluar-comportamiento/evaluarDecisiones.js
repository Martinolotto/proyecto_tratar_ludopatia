/* Valida el recorrido con las mismas opciones y transiciones que usa la interfaz. */
import { obtenerEscena, siguienteEscena } from './guionFinal.js';

function validarRecorrido(decisiones) {
  if (!Array.isArray(decisiones)) return { estado: 'invalido' };
  const recorrido = [];
  let indice = 0;
  for (const [posicion, id] of decisiones.entries()) {
    const previas = decisiones.slice(0, posicion);
    const escena = obtenerEscena(indice, previas);
    const opcion = escena.opciones.find((disponible) => disponible.id === id);
    if (!opcion) return { estado: 'invalido' };
    recorrido.push({ id, texto: opcion.texto });
    indice = siguienteEscena(indice, [...previas, id]);
  }
  if (obtenerEscena(indice, decisiones).id !== 'fin') return { estado: 'incompleto' };
  return { estado: 'completo', recorrido };
}

export function evaluarDecisiones(decisiones) {
  const resultado = validarRecorrido(decisiones);
  if (resultado.estado !== 'completo') return resultado;

  const { recorrido } = resultado;
  const tiene = (id) => decisiones.includes(id);
  const citas = (ids) => recorrido.filter(({ id }) => ids.includes(id));
  const observaciones = [];
  const proteccion = [];
  const agregar = (id, tipo, titulo, ids, observado, porQueImporta, orientacion, cambio) => {
    const evidencias = citas(ids);
    if (!evidencias.length) return;
    observaciones.push({ id, tipo, titulo, observado, porQueImporta, orientacion,
      evidencias: cambio ? citas([...ids, cambio.id]) : evidencias,
      ...(cambio ? { matiz: cambio.texto } : {}),
    });
  };

  const desiste = ['s3_reserva_desiste', 's4_desiste'].find(tiene);
  const protege = ['s4_protege_reserva', 's3_reserva_protege'].find(tiene);
  const mantiene = ['s4_mantiene_reserva', 's4_mantiene'].find(tiene);
  const postura = desiste ? { id: desiste, texto: 'Más adelante decidiste dejar de lado esa posibilidad.' }
    : mantiene ? { id: mantiene, texto: 'Después de conocer lo que le pasó a Gonza, dijiste que seguías considerando la propuesta.' }
    : tiene('s4_abierta') || tiene('s4_protege_reserva')
      ? { id: tiene('s4_abierta') ? 's4_abierta' : 's4_protege_reserva', texto: 'La decisión quedó abierta.' }
      : undefined;
  const cambioReserva = protege && !desiste
    ? { id: protege, texto: mantiene
      ? 'Elegiste mantener separada la reserva. Después de conocer lo que le pasó a Gonza, seguiste considerando la propuesta.'
      : 'Elegiste mantener separado el dinero de tus compromisos. Eso deja sin resolver lo que harías respecto a la propuesta.' }
    : postura;
  const compromisoIds = ['s3_ganancia', 's3_reserva_usa', 's4_mantiene_reserva'];
  agregar('compromisos', 'atencion', 'La plata tenía otro destino',
    protege && mantiene ? [...compromisoIds, mantiene] : compromisoIds,
    ['Vinculaste la salida del sábado a la posibilidad de conseguir más plata con lo del partido.',
      tiene('s3_reserva_usa') && 'También consideraste usar parte de lo que ya habías separado.',
      tiene('s4_mantiene_reserva') && 'Volviste a mencionar esa posibilidad después de conocer la pérdida de Gonza.',
    ].filter(Boolean).join(' '),
    'Si el dinero reservado dejara de estar disponible, podrían verse afectados planes o necesidades que ya tenías. La posibilidad de ganar no elimina la de perder.',
    '¿Alguna vez consideraste dejar de lado un plan personal por la posibilidad de ganar dinero apostando?',
    tiene('s4_mantiene_reserva') ? undefined : cambioReserva);

  agregar('recuperacion_perdidas', 'atencion', 'La idea de recuperar lo perdido', ['s4_recuperar'],
    'Al imaginarte en el lugar de Tomi, dijiste que te quedarían ganas de volver a poner dinero para recuperar una pérdida.',
    'Intentar recuperar lo perdido con nuevas apuestas no garantiza recuperarlo y puede aumentar las pérdidas.',
    'Si algo así te pasa fuera de esta historia, podés hablar con un adulto de confianza y conocer herramientas de desconexión y apoyo en Escudo digital.');

  agregar('influencia_social', 'atencion', '¿Cuánto influyen tus amigos en tus decisiones?', ['s1_grupo'],
    'Durante la situación consideraste participar dependiendo de lo que decidieran tus amigos.',
    'Cuando las apuestas se vuelven habituales en un grupo, puede resultar difícil distinguir lo que realmente querés hacer de lo que considerás hacer para acompañar a los demás.',
    '¿Tomarías la misma decisión si tus amigos eligieran algo distinto?', postura);

  const expectativaIds = ['s1_dinero', 's2_interes', 's3_ganancia'];
  agregar('expectativa_economica', tiene('s2_interes') || tiene('s3_ganancia') ? 'atencion' : 'reflexion',
    'La expectativa de conseguir más plata', tiene('s1_no') && tiene('s2_interes') ? ['s1_no', ...expectativaIds] : expectativaIds,
    [
      tiene('s1_dinero') && 'Al principio dijiste que te vendría bien tener más plata.',
      tiene('s2_interes') && (tiene('s1_no')
        ? 'Al principio preferiste seguir mirando. Cuando supiste que Gonza había cobrado, dijiste que te daban más ganas.'
        : 'Cuando supiste que Gonza había cobrado, dijiste que te daban más ganas.'),
      tiene('s3_ganancia') && 'Después vinculaste la salida a la posibilidad de conseguir más plata con lo del partido.',
    ].filter(Boolean).join(' '),
    'Una ganancia que le ocurrió a otra persona no garantiza otro resultado favorable. Concentrarse solo en lo que se podría ganar puede hacer que se pierda de vista lo que está en juego.',
    'Pensá si esa posibilidad cambiaría tus decisiones aunque no hubiera ninguna garantía de ganar.', postura);

  if (tiene('s2_seguir')) {
    agregar('continuidad_resultado', 'reflexion', 'Cuando cuesta dar por terminada una actividad', ['s2_seguir'],
      'Al imaginarte en una situación similar a la de Gonza, expresaste que te quedarían ganas de seguir después de un resultado favorable.',
      'Una ganancia no asegura que la siguiente decisión tenga el mismo resultado. Seguir buscando ese resultado puede exponer a nuevas pérdidas.',
      '¿Qué te ayudaría a dejar de participar si alguna vez te sintieras así?',
      tiene('s4_recuperar') ? { id: 's4_recuperar', texto: 'En ambos supuestos, dijiste que te quedarían ganas de seguir.' } : undefined);
  }

  const yaExplicado = (id) => observaciones.some(({ evidencias }) => evidencias.some((evidencia) => evidencia.id === id));
  const grupos = [
    ['consecuencias', 'Consideraste posibles consecuencias', ['s1_duda', 's2_incierto', 's4_consecuencias']],
    ['detenerse', 'Preferiste detenerte en una situación hipotética', ['s2_parar', 's4_detener']],
    ['planes', 'Buscaste resolver la salida o proteger la plata que habías separado', ['s3_completa', 's3_alternativa', 's3_reserva_protege', 's4_protege_reserva', 's4_plan_confirma', 's4_plan_alternativa']],
    ['reconsideracion', 'Reconsideraste la propuesta', ['s3_reserva_desiste', 's4_desiste'].filter((id) => !yaExplicado(id))],
    ['rechazo', 'Elegiste seguir mirando', tiene('s2_interes') ? [] : ['s1_no']],
    ['continuidad_ajena', 'Te preguntaste por qué Gonza quería seguir', ['s2_cuestiona']],
    ['supuesto', 'Preferiste no involucrarte en ese supuesto', ['s2_otro']],
  ];
  for (const [id, titulo, ids] of grupos) {
    const evidencias = citas(ids);
    if (evidencias.length) proteccion.push({ id, titulo, evidencias });
  }

  const resumen = observaciones.length
    ? 'Durante esta experiencia aparecieron decisiones sobre las que vale la pena reflexionar.'
    : 'En este recorrido no encontramos decisiones que permitan generar observaciones específicas sobre los aspectos explorados.';
  return { ...resultado, resumen, observaciones, proteccion };
}
