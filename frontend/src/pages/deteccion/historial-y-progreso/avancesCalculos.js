/* Calcula participación, continuidad e hitos a partir de registros propios. */
import { sumarDias } from './historialFechas.js';

export const HITOS = [
  { dias: 1, nombre: 'Primer paso' },
  { dias: 3, nombre: 'En marcha' },
  { dias: 7, nombre: 'Una semana' },
  { dias: 15, nombre: 'Constancia' },
  { dias: 30, nombre: 'Mi recorrido' },
];

// Las rachas usan fechas distintas y mantienen la de ayer durante el día actual.
export function calcularRachaRegistro(registros, hoy) {
  const fechas = [...new Set(registros.map(({ fecha }) => fecha).filter((fecha) => fecha <= hoy))].sort();
  let maxima = 0, tramo = 0, anterior = null;
  for (const fecha of fechas) {
    tramo = anterior && sumarDias(anterior, 1) === fecha ? tramo + 1 : 1;
    maxima = Math.max(maxima, tramo);
    anterior = fecha;
  }
  const registradas = new Set(fechas);
  let fecha = registradas.has(hoy) ? hoy : sumarDias(hoy, -1);
  let actual = 0;
  while (registradas.has(fecha)) { actual += 1; fecha = sumarDias(fecha, -1); }
  return { actual, maxima };
}

export const contarMedidas = (medidas) => new Set(medidas.filter((medida) => medida.realizada).map((medida) => medida.medida_id)).size;

// El historial contiene fechas civiles de Córdoba; la actualización no suma otro día.
export function calcularAvances({ registrosPeriodo, registrosHistoricos, desde, hasta, hoy }) {
  const porFecha = new Map(registrosHistoricos.map((registro) => [registro.fecha, registro.aposto]));
  const periodo = new Map(registrosPeriodo.map((registro) => [registro.fecha, registro.aposto]));
  const diasPosibles = Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000) + 1;
  const total = porFecha.size;
  const registrados = periodo.size;
  const sinApostar = [...periodo.values()].filter((aposto) => aposto === false).length;
  const fechasSinApostar = [...porFecha.entries()].filter(([, aposto]) => aposto === false).map(([fecha]) => fecha).sort();
  let maxima = 0;
  let tramo = 0;
  let anterior = null;
  for (const fecha of fechasSinApostar) {
    tramo = anterior && sumarDias(anterior, 1) === fecha ? tramo + 1 : 1;
    maxima = Math.max(maxima, tramo);
    anterior = fecha;
  }
  const hoyPendiente = !porFecha.has(hoy);
  let fecha = hoyPendiente ? sumarDias(hoy, -1) : hoy;
  let actual = 0;
  while (porFecha.get(fecha) === false) {
    actual += 1;
    fecha = sumarDias(fecha, -1);
  }
  const siguiente = HITOS.find((hito) => total < hito.dias) ?? null;
  const previo = [...HITOS].reverse().find((hito) => total >= hito.dias)?.dias ?? 0;
  const progreso = siguiente ? Math.round(total / siguiente.dias * 100) : 100;
  return { total, registrados, diasPosibles, porcentaje: diasPosibles > 0 ? Math.round(registrados * 100 / diasPosibles) : 0,
    sinApostar, actual, maxima, hoyPendiente, siguiente, previo, progreso, rachaRegistro: calcularRachaRegistro(registrosHistoricos, hoy) };
}
