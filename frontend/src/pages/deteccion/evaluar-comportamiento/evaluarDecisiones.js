/* La evaluación describe elecciones de la ficción, sin puntajes ni diagnóstico. */
import { obtenerEscena } from './guionFinal.js';

// Cada opción debe pertenecer al momento y a la rama que el usuario recorrió.
export function recuperarElecciones(decisiones) {
  const recorrido = [];
  for (const id of decisiones.slice(0, 5)) {
    const escena = obtenerEscena(recorrido.length, recorrido.map((opcion) => opcion.id));
    const opcion = escena.opciones.find((item) => item.id === id);
    if (!opcion) break;
    recorrido.push(opcion);
  }
  return recorrido;
}
const textos = {
  reservado: ['La plata tenía otro destino', 'Dinero y planes', 'Consideraste usar dinero reservado para la salida.', 'Si dejara de estar disponible, podría afectar el plan.', '¿Alguna vez consideraste dejar de lado un plan por la posibilidad de ganar dinero apostando?'],
  influencia: ['La decisión del grupo', 'Influencia social', 'Vinculaste tu posible participación con lo que hicieran tus amigos.', 'Las decisiones del grupo pueden influir en las propias.', '¿Qué elegirías si ellos tomaran una decisión diferente?'],
  recuperacion: ['Intentar recuperar lo perdido', 'Recuperación ajena', 'Mencionaste la posibilidad de que Tomi recuperara algo de lo perdido; eso no describe una experiencia tuya.', 'Una nueva apuesta no garantiza recuperar dinero y puede aumentar las pérdidas.', '¿Qué alternativas podría considerar Tomi?'],
  expectativa: ['La posibilidad de ganar', 'Expectativa económica', 'Consideraste la posibilidad de obtener más dinero.', 'El resultado es incierto y también se puede perder.', '¿Qué otras posibilidades conviene considerar?'],
  consecuencias: ['Mirar las consecuencias', 'Consecuencias', 'Preguntaste qué podría ocurrir si se perdía el dinero.', 'Considerar distintos resultados ayuda a mirar la situación completa.', '¿Qué otros planes podrían verse afectados?'],
  compromiso: ['Un plan que ya tenías', 'Compromisos', 'Mencionaste que querías mantener el dinero para el sábado.', 'Separar dinero para un plan ayuda a mantenerlo disponible.', '¿Qué planes son importantes para vos?'],
  negativa: ['Seguir mirando', 'Decisión personal', 'Elegiste continuar mirando sin participar.', 'Cada persona puede decidir a su propio ritmo.', '¿Qué te ayudó a elegir?'],
};

export function evaluarDecisiones(decisiones) {
  const elegidas = recuperarElecciones(decisiones);
  const reconsideracion = elegidas.find((opcion) => opcion.etiqueta === 'reconsideracion');
  const orden = ['reservado', 'influencia', 'recuperacion', 'expectativa', 'consecuencias', 'compromiso', 'negativa'];
  return orden.flatMap((etiqueta) => {
    const citas = elegidas.filter((opcion) => opcion.etiqueta === etiqueta).map((opcion) => opcion.texto);
    if (!citas.length) return [];
    const [titulo, categoria, observado, consecuencia, reflexion] = textos[etiqueta];
    const cambio = reconsideracion && ['influencia', 'expectativa'].includes(etiqueta);
    if (cambio) citas.push(reconsideracion.texto);
    return [{ titulo, categoria, citas, observado: observado + (cambio ? ' Después reconsideraste esa posibilidad y elegiste mantener tu plan del sábado.' : ''), consecuencia, reflexion }];
  }).slice(0, 3);
}
