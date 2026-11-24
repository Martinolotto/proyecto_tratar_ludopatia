/* Guion V1.6. Los identificadores y textos se comparten con el evaluador. */
const tiempos = [
  [0, "21:30", "0 — 0", "Primer tiempo"],
  [24, "21:54", "0 — 0", "Primer tiempo"],
  [45, "22:15", "1 — 0", "Entretiempo"],
  [67, "22:52", "1 — 0", "Segundo tiempo"],
  [85, "23:10", "1 — 1", "Segundo tiempo"],
  [90, "23:15", "1 — 1", "Fin del tiempo reglamentario"],
];

export const GUION = [
  { id: "intro", momento: 0, intervenciones: [
    ["Nico", "Bueno, ahí arranca. ¿Quién gana para ustedes?"],
    ["Tomi", "Para mí gana el Sur, amigo. Vienen jugando re bien"],
    ["Juli", "Después no quiero escuchar excusas, eh. Che, ¿el sábado nos juntamos de nuevo?"],
  ], opciones: [
    ["intro_partido", "Para mí va a estar parejo", "Nico", "Sí, va a estar lindo el partido"],
    ["intro_sabado", "Obvio, ya tengo algo separado para el sábado", "Juli", "Buenísimo, después arreglamos"],
    ["intro_bebida", "De una. Che, ¿queda algo para tomar?", "Nico", "Sí, ahí tenés sobre la mesa"],
  ] },
  { id: "s1_propuesta", momento: 1, intervenciones: [
    ["Tomi", "Che, ¿vieron lo que mandó Gonza? Yo también estaba pensando en ponerle algo"],
    ["Nico", "¿Tres lucas puso? ¿Y si no hay un gol?"],
    ["Tomi", "Y, las pierde. ¿Vos qué pensás? ¿Te prenderías también?"],
  ], opciones: [
    ["s1_grupo", "Si ustedes se prenden, capaz yo también", "Nico", "Yo todavía no sé qué voy a hacer, amigo"],
    ["s1_dinero", "Mmm, capaz. Me vendría bien tener un poco más de plata", "Tomi", "Ah, vos también estabas pensando en eso"],
    ["s1_duda", "No sé, ¿y si no sale?", "Tomi", "Y, ahí perdés lo que pusiste. No hay garantía"],
    ["s1_no", "Nah, amigo. Sigamos mirando", "Tomi", "Bueno, de una"],
  ] },
  { id: "s2_ganancia", momento: 2, intervenciones: [
    ["Tomi", "Mirá, al final le salió. Yo pensé que iba a perder la plata"],
    ["Nico", "¿Y ahora quiere seguir? ¿Vos qué pensás de eso?"],
  ], opciones: [
    ["s2_interes", "Ahora que veo que le salió, me dan más ganas", "Nico", "Sí, llama la atención verlo, pero es lo que le pasó a él"],
    ["s2_incierto", "Capaz tiene suerte de nuevo, pero también puede perder", "Tomi", "Sí, ahora puede salir cualquier cosa"],
    ["s2_cuestiona", "Si ya consiguió lo que quería, no entiendo por qué sigue", "Nico", "Eso mismo me preguntaba"],
    ["s2_independiente", "Bien por él, pero yo sigo con la mía", "Juli", "De una, ¿quieren algo para tomar?"],
  ] },
  { id: "s2_continuidad", momento: 2, intervenciones: [
    ["Nico", "Igual, me llama la atención que Gonza dijo que había terminado y ahora quiere seguir"],
    ["Tomi", "Capaz se quedó pensando en eso. ¿Vos cómo te imaginás reaccionando si te pasara algo parecido?"],
  ], opciones: [
    ["s2_seguir", "Creo que me costaría dejarlo ahí. Me quedarían ganas de seguir", "Nico", "Claro, a Gonza parece que le pasó eso"],
    ["s2_parar", "Si ya hubiera terminado, preferiría dejarlo ahí", "Tomi", "Sí, entiendo lo que decís"],
    ["s2_no_sabe", "No sé, amigo. Capaz en el momento pienso distinto", "Nico", "Puede ser"],
    ["s2_otro", "La verdad, prefiero no meterme en eso", "Juli", "Bueno, ya está por arrancar el segundo tiempo"],
  ] },
  { id: "s3_plan", momento: 3, intervenciones: [
    ["Juli", "Che, estuve viendo dónde vamos a comer el sábado. Al final serían nueve lucas por cabeza, más o menos"],
    ["Nico", "Uh, pensé que era menos"],
    ["Tomi", "Yo también había separado seis"],
    ["Juli", "¿Qué hacemos entonces? ¿Vamos igual o buscamos otro lugar?"],
  ], opciones: [
    ["s3_ganancia", "Capaz consigo un poco más con lo del partido y vamos igual", "Juli", "Bueno, entonces todavía no cuento con vos, ¿me avisás después?"],
    ["s3_completa", "Tengo algo aparte, puedo completar lo que falta", "Juli", "Buenísimo, entonces te anoto"],
    ["s3_alternativa", "Busquemos algo más barato, así no gastamos tanto", "Nico", "De una, después vemos otro lugar"],
    ["s3_pendiente", "Por ahora no me anotes. Tengo que ver qué hago con la plata", "Juli", "Dale, avisame durante la semana"],
  ] },
  { id: "s3_reserva", momento: 3, intervenciones: [
    ["Juli", "Bancá, ¿no tenías ya separada la plata del sábado? Si no te sale lo del partido, ¿qué hacemos con la salida?"],
    ["Nico", "También podemos buscar otro lugar, no hace falta gastar tanto"],
  ], opciones: [
    ["s3_reserva_usa", "Capaz saco un poco de lo del sábado. Si sale mal, después veo qué hago", "Juli", "Bueno, no te anoto todavía entonces"],
    ["s3_reserva_protege", "Lo del sábado no lo toco. Lo otro todavía no sé", "Juli", "Bueno, por lo menos esa plata queda para la salida"],
    ["s3_reserva_desiste", "Sabés qué, mejor lo dejo. Busquemos otro lugar", "Nico", "De una, lo importante es juntarnos"],
    ["s3_reserva_duda", "No sé todavía. Después te confirmo", "Juli", "Dale, avisame después"],
  ] },
  { id: "s4_perdida", momento: 4, intervenciones: [
    ["Tomi", "Me pasó lo mismo el otro finde. Después de perder me quedé re enganchado con recuperarlo"],
    ["Nico", "¿Y no te daba cosa terminar perdiendo más todavía?"],
    ["Tomi", "Y sí. Pero en ese momento estaba pensando más en recuperar lo que había perdido"],
    ["Tomi", "¿Vos qué harías si te pasara eso?"],
  ], opciones: [
    ["s4_recuperar", "Creo que me quedarían ganas de recuperar esa plata poniendo de nuevo", "Tomi", "Eso es lo que me pasó. Y al final terminé más preocupado"],
    ["s4_detener", "Me daría bronca, pero preferiría dejarlo ahí", "Tomi", "Sí, entiendo. Yo tendría que haber parado"],
    ["s4_consecuencias", "Primero pensaría en lo que puedo terminar perdiendo", "Nico", "Claro, también está todo lo que necesitás para otras cosas"],
    ["s4_duda", "No sé cómo reaccionaría, la verdad", "Tomi", "Sí, es difícil saberlo"],
  ] },
  { id: "s4_cierre", momento: 4, intervenciones: [], opciones: [
    ["s4_desiste", "Dejo lo del partido. Lo del sábado lo arreglamos entre todos", "Juli", "Dale, vemos bien qué hacemos"],
    ["s4_mantiene", "Todavía sigo pensando en lo del partido", "Nico", "Bueno, la decisión es tuya"],
    ["s4_mantiene_reserva", "Por ahora no me anotes. Sigo pensando en usar parte de esa plata", "Juli", "Bueno, después avisame"],
    ["s4_protege_reserva", "No, lo del sábado no lo voy a tocar. Lo otro todavía no sé", "Juli", "Dale, lo vemos después"],
    ["s4_abierta", "Todavía no decidí, después lo veo", "Nico", "Bueno, sigamos mirando"],
    ["s4_plan_confirma", "Sí, cuento con la plata. Anotame", "Juli", "De una, ya te anoté"],
    ["s4_plan_alternativa", "Veamos otro lugar, así vamos todos", "Nico", "De una, después buscamos"],
    ["s4_plan_pendiente", "Todavía tengo que confirmar", "Juli", "Bueno, avisame después"],
  ] },
  { id: "fin", momento: 5, intervenciones: [
    ["Nico", "Uh, se terminó el tiempo. Nos vamos al alargue"],
    ["Juli", "Bueno, después arreglamos lo del sábado"],
    ["Narrador", "Suena el silbato. Los chicos comentan la última jugada y se preparan para ver el alargue. La juntada sigue"],
  ], opciones: [] },
].map(({ momento, opciones, ...bloque }) => {
  const [minuto, hora, marcador, etapa] = tiempos[momento];
  return { ...bloque, momento, minuto, hora, marcador, etapa,
    opciones: opciones.map(([id, texto, personaje, reaccion]) => ({ id, texto, personaje, reaccion })),
  };
});

const mensajes = [
  [["Gonza", "Qué partidazo amigo"], ["Emi", "Para mí va al alargue"], ["Juli", "Che, el sábado nos juntamos también, ¿sí?"]],
  [["Gonza", "Le puse tres lucas al partido. Dice que me pagan el doble si hay un gol"]],
  [["Gonza", "Al final cobré seis lucas. Estoy pensando en volver a poner la plata"], ["Emi", "¿Otra vez? Pensé que ya habías terminado"]],
  [["Juli", "Chicos, serían nueve lucas por cabeza. Confirmen así nos organizamos"]],
  [["Gonza", "Al final seguí y perdí toda la plata que había cobrado. Qué bronca, amigo"], ["Gonza", "Encima me quedé pensando en recuperar esa plata"]],
];

const frasesAmigos = [
  ["Qué final, amigo. Hace rato esperaba este partido", "Hay algo para tomar sobre la mesa", "El sábado repetimos, ¿no?"],
  ["Gonza manda mensajes así cada vez que hay partido", "Yo todavía no sé. No quiero perder plata por una jugada", "Después tenemos que ver bien lo del sábado"],
  ["Mirá el grupo, Gonza contó cómo le fue", "Que le haya salido una vez no dice qué va a pasar después", "Ya arranca el segundo tiempo, ¿quieren algo más?"],
  ["Yo también había separado seis lucas para el sábado", "Podemos buscar otro lugar si se hace caro"],
  ["Lo del otro finde me quedó dando vueltas", "Qué partido, falta poquito"],
];

export const estadosPlan = {
  pendiente: 'Pendiente de confirmar',
  confirmada: 'Confirmada',
  alternativa: 'Buscando una alternativa',
};

const actualizacionPlan = {
  s3_ganancia: 'pendiente', s3_completa: 'confirmada', s3_alternativa: 'alternativa', s3_pendiente: 'pendiente',
  s3_reserva_usa: 'pendiente', s3_reserva_protege: 'pendiente', s3_reserva_desiste: 'alternativa',
  s3_reserva_duda: 'pendiente', s4_mantiene_reserva: 'pendiente',
  s4_plan_confirma: 'confirmada', s4_plan_alternativa: 'alternativa', s4_plan_pendiente: 'pendiente',
};

const frasesPlan = {
  confirmada: 'Ya te anoté', alternativa: 'Buscamos otro lugar', pendiente: 'Todavía espero tu confirmación',
};

const frasesCierre = {
  desistimiento: 'Decidiste dejar de lado la propuesta que había aparecido durante la noche.',
  interes: 'Terminó el tiempo reglamentario y seguís considerando aquella propuesta. No realizaste ninguna apuesta en esta historia.',
  abierta: 'La propuesta quedó sin una decisión definitiva.',
  rechazo: 'Elegiste seguir disfrutando del partido sin participar en la propuesta.',
};

export function obtenerContexto(decisiones) {
  const incluye = (id) => decisiones.includes(id);
  const interes = ['s1_grupo', 's1_dinero', 's2_interes'].some(incluye);
  let postura = 'sin_expresar';
  if (incluye('s4_desiste') || incluye('s3_reserva_desiste')) postura = 'desistimiento';
  else if (incluye('s4_mantiene') || incluye('s4_mantiene_reserva')) postura = 'interes';
  else if (incluye('s4_abierta') || incluye('s4_protege_reserva')) postura = 'abierta';
  else if (incluye('s1_no') && !interes) postura = 'rechazo';
  const plan = decisiones.reduce((estado, id) => actualizacionPlan[id] ?? estado, 'pendiente');
  return { interes, postura, plan };
}

export function obtenerEscena(indice, decisiones) {
  const escena = GUION[indice];
  const { interes, postura, plan } = obtenerContexto(decisiones);
  if (escena.id === 's3_plan' && !interes) {
    return { ...escena, opciones: escena.opciones.filter(({ id }) => id !== 's3_ganancia') };
  }
  if (escena.id === 's4_cierre') {
    // La respuesta pendiente no puede cambiar la rama que la hizo posible.
    const ramaA = interes && !decisiones.includes('s3_reserva_desiste');
    const reserva = decisiones.includes('s3_reserva_usa');
    const ids = ramaA
      ? ['s4_desiste', ...(reserva ? ['s4_mantiene_reserva', 's4_protege_reserva'] : ['s4_mantiene']), 's4_abierta']
      : ['s4_plan_confirma', 's4_plan_alternativa', 's4_plan_pendiente'];
    return { ...escena, opciones: escena.opciones.filter(({ id }) => ids.includes(id)), intervenciones: [
      ['Juli', frasesPlan[plan]],
      ['Nico', 'Bueno, falta poquito. ¿Al final cómo quedamos para el sábado?'],
      ...(!ramaA ? [['Juli', 'Che, antes de que me olvide, ¿cómo quedamos para el sábado?']] : []),
    ] };
  }
  if (escena.id === 'fin') {
    return { ...escena, intervenciones: [...escena.intervenciones,
      ...(frasesCierre[postura] ? [['Narrador', frasesCierre[postura]]] : []),
      ['Narrador', `Salida del sábado: ${estadosPlan[plan].toLowerCase()}.`],
    ] };
  }
  // Estos mensajes explican hechos necesarios aun si no se abre el celular.
  if (['s1_propuesta', 's2_ganancia', 's4_perdida'].includes(escena.id)) {
    return { ...escena, intervenciones: [...mensajes[escena.momento], ...escena.intervenciones] };
  }
  return escena;
}

export function siguienteEscena(indice, decisiones) {
  return GUION[indice].id === 's3_plan' && !decisiones.includes('s3_ganancia')
    ? indice + 2 : indice + 1;
}

export function obtenerEntorno(escena, decisiones) {
  const { plan } = obtenerContexto(decisiones);
  const [Tomi, Nico, Juli = frasesPlan[plan]] = frasesAmigos[Math.min(4, escena.momento)];
  const mensajesVisibles = mensajes.slice(0, escena.momento + 1).flatMap((grupo, momento) => [
    ...grupo,
    ...GUION.filter((bloque) => bloque.momento === momento)
      .flatMap(({ opciones }) => opciones)
      .filter(({ id }) => decisiones.includes(id) && Object.hasOwn(actualizacionPlan, id))
      .map(({ personaje, reaccion }) => [personaje, reaccion]),
  ]);
  return {
    amigos: { Tomi, Nico, Juli },
    plan,
    costoActualizado: escena.momento >= 3,
    mensajes: mensajesVisibles,
  };
}
