/* Casos de participación y continuidad con fechas de calendario explícitas. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularAvances, calcularRachaRegistro, contarMedidas } from './avancesCalculos.js';
const calcular = (registrosHistoricos, registrosPeriodo = registrosHistoricos) => calcularAvances({ registrosHistoricos, registrosPeriodo, desde: '2026-01-01', hasta: '2026-01-05', hoy: '2026-01-05' });
test('hoy pendiente conserva continuidad desde ayer y cuenta días distintos', () => {
  const registros = [{ fecha: '2026-01-03', aposto: false }, { fecha: '2026-01-04', aposto: false }, { fecha: '2026-01-04', aposto: false }];
  assert.deepEqual([calcular(registros).total, calcular(registros).actual, calcular(registros).maxima, calcular(registros).porcentaje], [2, 2, 2, 40]);
});
test('racha de registro deduplica fechas y conserva ayer aunque haya apuestas', () => {
  const dias = ['2025-12-31', '2026-01-01', '2026-01-02', '2026-01-02', '2026-01-04'].map((fecha) => ({ fecha, aposto: true }));
  assert.deepEqual(calcularRachaRegistro(dias, '2026-01-05'), { actual: 1, maxima: 3 });
  assert.deepEqual(calcularRachaRegistro(dias, '2026-01-06'), { actual: 0, maxima: 3 });
  assert.deepEqual(calcularRachaRegistro([], '2026-01-05'), { actual: 0, maxima: 0 });
});
test('medidas declaradas cuentan una vez y al desmarcarlas dejan de contar', () => {
  assert.equal(contarMedidas([{ medida_id: 1, realizada: true }, { medida_id: 1, realizada: true }, { medida_id: 2, realizada: false }]), 1);
  assert.equal(contarMedidas([{ medida_id: 1, realizada: false }]), 0);
});
test('el progreso acumulado usa el objetivo completo', () => {
  const dias = Array.from({ length: 27 }, (_, i) => ({ fecha: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10) }));
  const resultado = calcularAvances({ registrosHistoricos: dias, registrosPeriodo: dias, desde: '2026-01-01', hasta: '2026-01-30', hoy: '2026-01-30' });
  assert.equal(resultado.progreso, 90);
});
test('apuesta hoy o día sin información interrumpe la racha actual', () => {
  const antes = [{ fecha: '2026-01-02', aposto: false }, { fecha: '2026-01-03', aposto: false }];
  assert.equal(calcular(antes).actual, 0);
  assert.equal(calcular([...antes, { fecha: '2026-01-05', aposto: true }]).actual, 0);
  assert.equal(calcular(antes).maxima, 2);
});
test('período e historial usan bases distintas y el próximo hito es acumulado', () => {
  const historicos = [{ fecha: '2025-12-31', aposto: false }, { fecha: '2026-01-01', aposto: true }, { fecha: '2026-01-05', aposto: false }];
  const resultado = calcular(historicos, [historicos[2]]);
  assert.deepEqual([resultado.total, resultado.sinApostar, resultado.registrados, resultado.siguiente.dias], [3, 1, 1, 7]);
});
test('continuidad cruza años y no crea un sexto logro después de treinta días', () => {
  const fechas = Array.from({ length: 31 }, (_, i) => ({ fecha: new Date(Date.UTC(2025, 11, 6 + i)).toISOString().slice(0, 10), aposto: false }));
  const resultado = calcularAvances({ registrosHistoricos: fechas, registrosPeriodo: fechas.filter(({ fecha }) => fecha >= '2026-01-01'), desde: '2026-01-01', hasta: '2026-01-05', hoy: '2026-01-05' });
  assert.equal(resultado.total, 31);
  assert.equal(resultado.actual, 31);
  assert.equal(resultado.maxima, 31);
  assert.equal(resultado.siguiente, null);
  assert.equal(resultado.progreso, 100);
});
