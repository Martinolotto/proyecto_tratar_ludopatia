/* Guion local de la situación ficticia. Las opciones no ejecutan apuestas. */
const opcion = (id, texto, personaje, reaccion, etiqueta) => ({ id, texto, personaje, reaccion, etiqueta });
export const GUION = [
  { minuto: 68, personaje: 'Juli', texto: 'Uhh, casi entra esa, boludo. Hace rato que están llegando. Qué partido.', opciones: [
    opcion('1a', 'Mal, están jugando re bien', 'Juli', 'Encima quedan varios minutos todavía.'),
    opcion('1b', 'Para mí nos vamos al alargue', 'Tomi', 'Puede ser, no se sacan ventaja.'),
    opcion('1c', 'Che, ¿queda algo para tomar?', 'Nico', 'Sí, ahí tenés sobre la mesa.'),
  ] },
  { minuto: 71, personaje: 'Tomi', texto: 'Gonza mandó al grupo que le puso plata al partido y espera cobrar más si hay otro gol.', opciones: [
    opcion('2a', '¿Gonza sigue con eso?', 'Tomi', 'Sí, cada vez que hay partido manda algo al grupo.'),
    opcion('2b', '¿Y si termina así el partido?', 'Tomi', 'Y, perdería la plata que puso.', 'consecuencias'),
    opcion('2c', 'Últimamente están todos con eso', 'Tomi', 'Mal, el grupo está lleno de mensajes así.'),
    opcion('2d', 'Uhh, mirá esa jugada', 'Juli', '¡Casi! Qué final, amigo.'),
  ] },
  { minuto: 75, personaje: 'Tomi', texto: 'Estaba pensando en poner plata también. Si sale bien, tendría más para el sábado, aunque también puedo perderla.', opciones: [
    opcion('3a', 'Si vos y Nico ponen, capaz me prendo', 'Nico', 'Yo todavía no decidí, la verdad.', 'influencia'),
    opcion('3b', 'Mmm, capaz le pongo algo y saco un poco más', 'Tomi', 'Yo también lo estaba pensando.', 'expectativa'),
    opcion('3c', 'No sé, tendría que ver', 'Nico', 'Bueno, tranqui.'),
    opcion('3d', 'Nah, estoy bien así. Sigamos mirando', 'Nico', 'De una, mirá que ya están llegando otra vez.', 'negativa'),
  ] },
  { minuto: 80, personaje: 'Juli', texto: 'Che, hablando del sábado, yo ya separé la plata para la salida. ¿Vos tenés la tuya o cómo hacemos?', opciones: [
    opcion('4a', 'Capaz saco un poco de lo del sábado y, si sale, me queda más', 'Juli', 'Ah, bueno... ¿entonces cuento con vos para el sábado?', 'reservado'),
    opcion('4b', 'Sí, esa plata no la toco. Tengo algo aparte', 'Juli', 'De una, entonces seguimos con el plan.', 'compromiso'),
    opcion('4c', 'Sabés qué, mejor lo dejo. Lo del sábado ya está', 'Juli', 'Buenísimo, después arreglamos dónde vamos.', 'reconsideracion'),
    opcion('4d', 'Todavía no sé, amigo. Después veo', 'Juli', 'Bueno, avisame durante la semana.'),
  ], alternativa: { texto: 'Che, el sábado al final salimos a comer, ¿no? Yo ya separé la plata. ¿Vos venís?', opciones: [
    opcion('4e', 'Obvio, ya tengo la plata guardada', 'Juli', 'De una, después organizamos.', 'compromiso'),
    opcion('4f', 'Bancá, tengo que revisar cuánto tengo', 'Juli', 'Sí, fijate tranqui.', 'billetera'),
    opcion('4g', 'Todavía tengo que confirmar', 'Juli', 'No pasa nada, arreglamos durante la semana.'),
  ] } },
  { minuto: 85, personaje: 'Tomi', texto: 'Igual, yo el otro finde perdí plata con esto. Desde ese día me quedó la idea de que hoy podía recuperarla. Por eso estoy tan pendiente del celu.', opciones: [
    opcion('5a', 'Y... capaz hoy recuperás algo', 'Tomi', 'No sé, amigo. También puede salir mal.', 'recuperacion'),
    opcion('5b', '¿Y si terminás perdiendo más?', 'Tomi', 'Sí, puede pasar. La otra vez también pensaba que iba a salir.', 'consecuencias'),
    opcion('5c', 'Ah, con razón estabas tan pendiente', 'Tomi', 'Sí, desde el otro finde vengo pensando en eso.'),
    opcion('5d', 'Dejá el celu un rato, amigo, que falta poco', 'Tomi', 'Sí, hace rato que ni miro la tele.'),
  ] },
  { minuto: 90, personaje: 'Narrador', texto: 'Suena el silbato. Termina el tiempo reglamentario. Los chicos empiezan a comentar la última jugada mientras esperan el alargue. La juntada sigue.', opciones: [] },
];

export function obtenerEscena(indice, decisiones) {
  const escena = GUION[indice];
  return indice === 3 && !['3a', '3b'].includes(decisiones[2]) ? { ...escena, ...escena.alternativa } : escena;
}
