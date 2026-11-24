import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarResumen } from './reglasResumen.js';

const fecha = (dia) => `2026-01-${String(dia).padStart(2, '0')}`;
const registros = (total, repeticiones = total, minutos = null) => Array.from({ length: total }, (_, i) => ({ fecha: fecha(i + 1), aposto: i % 2 === 0, tiempo_valor: minutos, tiempo_unidad: 'minutos', conductas: i < repeticiones ? [{ codigo: 'a', nombre: 'Situación A' }, { codigo: 'a', nombre: 'Situación A' }] : [] }));
const evaluar = (datos) => evaluarResumen(datos, fecha(1), fecha(30));
test('la recurrencia exige cinco registros y respeta 2/3 y 6/7 fechas', () => {
  assert.equal(evaluar(registros(4)).observaciones.length, 0);
  assert.equal(evaluar(registros(5, 2)).observaciones.length, 0);
  assert.equal(evaluar(registros(5, 3)).observaciones[0].nivel, 'atencion');
  assert.equal(evaluar(registros(6)).observaciones[0].nivel, 'atencion');
  assert.equal(evaluar(registros(7)).observaciones[0].nivel, 'especial');
});
test('el tiempo exige tres datos y promedio superior a 90, incluyendo ceros', () => {
  assert.equal(evaluar(registros(2, 0, 100)).observaciones.length, 0);
  assert.equal(evaluar(registros(3, 0, 90)).observaciones.length, 0);
  assert.equal(evaluar(registros(3, 0, 91)).observaciones[0].id, 'tiempo');
  assert.equal(evaluar(registros(3, 0, 0)).observaciones.length, 0);
});
test('deduplica fechas, excluye el exterior y ordena las reglas', () => {
  const datos = registros(7, 7, 120); datos.push({ ...datos[0] }, { fecha: '2025-12-31', conductas: [{ codigo: 'b' }] });
  const resultado = evaluar(datos);
  assert.equal(resultado.registrados, 7);
  assert.deepEqual(resultado.observaciones.map((item) => item.id), ['situacion:a', 'tiempo']);
});
test('incluye cambio de año, omisiones y actualización del mismo día', () => {
  const datos = [{ fecha: '2025-12-31', aposto: false, tiempo_valor: null }, { fecha: '2026-01-01', aposto: true, tiempo_valor: 0, tiempo_unidad: 'minutos' }, { fecha: '2026-01-01', aposto: false, tiempo_valor: 2, tiempo_unidad: 'horas' }];
  const resultado = evaluarResumen(datos, '2025-12-31', '2026-01-01');
  assert.equal(resultado.registrados, 2);
  assert.equal(resultado.sinApostar, 2);
  assert.equal(resultado.suficienciaTiempo, false);
});
test('desempata por código y conserva todas las situaciones activadas', () => {
  const datos = registros(7, 0);
  for (const dia of datos) dia.conductas = [{ codigo: 'b', nombre: 'B' }, { codigo: 'a', nombre: 'A' }];
  assert.deepEqual(evaluar(datos).observaciones.map(({ id }) => id), ['situacion:a', 'situacion:b']);
});
