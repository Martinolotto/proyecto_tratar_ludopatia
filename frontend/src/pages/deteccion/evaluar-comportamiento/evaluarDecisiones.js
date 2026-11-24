/* La evaluación describe elecciones de la ficción, sin puntajes ni diagnóstico. */
import { GUION } from './guionFinal.js';

const opciones = GUION.flatMap((escena) => [...escena.opciones, ...(escena.alternativa?.opciones ?? [])]);
const textos = {
  reservado: ['La plata tenía otro destino', 'Dinero y planes', 'Consideraste usar dinero reservado para la salida.', 'Si dejara de estar disponible, podría afectar el plan.', '¿Alguna vez consideraste dejar de lado un plan por la posibilidad de ganar dinero apostando?'],
  influencia: ['La decisión del grupo', 'Influencia social', 'Vinculaste tu posible participación con lo que hicieran tus amigos.', 'Las decisiones del grupo pueden influir en las propias.', '¿Qué elegirías si ellos tomaran una decisión diferente?'],
  recuperacion: ['Intentar recuperar lo perdido', 'Recuperación ajena', 'Mencionaste la posibilidad de que Tomi recuperara algo de lo perdido; eso no describe una experiencia tuya.', 'Una nueva apuesta no garantiza recuperar dinero y puede aumentar las pérdidas.', '¿Qué alternativas podría considerar Tomi?'],
  reconsideracion: ['Cambiar de decisión', 'Reconsideración', 'Decidiste dejar de lado la posibilidad que habías considerado.', 'Revisar una decisión permite tener presentes otros planes.', '¿Qué te ayudó a reconsiderarla?'],
  expectativa: ['La posibilidad de ganar', 'Expectativa económica', 'Consideraste la posibilidad de obtener más dinero.', 'El resultado es incierto y también se puede perder.', '¿Qué otras posibilidades conviene considerar?'],
  consecuencias: ['Mirar las consecuencias', 'Consecuencias', 'Preguntaste qué podría ocurrir si se perdía el dinero.', 'Considerar distintos resultados ayuda a mirar la situación completa.', '¿Qué otros planes podrían verse afectados?'],
  compromiso: ['Un plan que ya tenías', 'Compromisos', 'Mencionaste que querías mantener el dinero para el sábado.', 'Separar dinero para un plan ayuda a mantenerlo disponible.', '¿Qué planes son importantes para vos?'],
  negativa: ['Seguir mirando', 'Decisión personal', 'Elegiste continuar mirando sin participar.', 'Cada persona puede decidir a su propio ritmo.', '¿Qué te ayudó a elegir?'],
};

export function evaluarDecisiones(decisiones) {
  const elegidas = decisiones.map((id) => opciones.find((opcion) => opcion.id === id)).filter(Boolean);
  const reconsidero = elegidas.some((opcion) => opcion.etiqueta === 'reconsideracion');
  const orden = ['reservado', 'influencia', 'recuperacion', 'reconsideracion', 'expectativa', 'consecuencias', 'compromiso', 'negativa'];
  return orden.flatMap((etiqueta) => {
    const elegida = elegidas.find((opcion) => opcion.etiqueta === etiqueta);
    if (!elegida) return [];
    const [titulo, categoria, observado, consecuencia, reflexion] = textos[etiqueta];
    return [{ titulo, categoria, cita: elegida.texto, observado: observado + (reconsidero && ['influencia', 'expectativa'].includes(etiqueta) ? ' Luego reconsideraste esa posibilidad.' : ''), consecuencia, reflexion }];
  }).slice(0, 3);
}
