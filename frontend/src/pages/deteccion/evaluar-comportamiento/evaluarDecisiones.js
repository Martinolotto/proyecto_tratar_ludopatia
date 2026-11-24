/* Valida el recorrido con las mismas opciones y transiciones que usa la interfaz. */
import { obtenerEscena, siguienteEscena } from './guionFinal.js';

export function evaluarDecisiones(decisiones) {
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
