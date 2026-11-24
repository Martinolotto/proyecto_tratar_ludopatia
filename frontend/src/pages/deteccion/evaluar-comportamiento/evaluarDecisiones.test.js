import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarDecisiones, recuperarElecciones } from './evaluarDecisiones.js';
import { obtenerEscena } from './guionFinal.js';

test('respeta la bifurcación y no infiere intención desde curiosidad', () => {
  assert.equal(obtenerEscena(3, ['1a','2a','3c']).opciones[0].id, '4e');
  assert.equal(obtenerEscena(3, ['1a','2a','3a']).opciones[0].id, '4a');
  assert.deepEqual(evaluarDecisiones(['1a','2a','3c','4g','5c']), []);
});
test('prioriza dinero, influencia y recuperación con máximo tres', () => {
  assert.deepEqual(evaluarDecisiones(['1a','2b','3a','4a','5a']).map((item)=>item.titulo), ['La plata tenía otro destino','La decisión del grupo','Intentar recuperar lo perdido']);
});
test('contextualiza reconsideración y describe consecuencias y negativa', () => {
  const cambio = evaluarDecisiones(['1a', '2a', '3a', '4c']);
  assert.equal(cambio.length, 1);
  assert.match(cambio[0].observado, /reconsideraste/);
  assert.deepEqual(cambio[0].citas, ['Si vos y Nico ponen, capaz me prendo', 'Sabés qué, mejor lo dejo. Lo del sábado ya está']);
  const consecuencias = evaluarDecisiones(['1a', '2b', '3c', '4g', '5b']);
  assert.equal(consecuencias.length, 1);
  assert.equal(consecuencias[0].citas.length, 2);
  const titulos = evaluarDecisiones(['1a', '2a', '3d', '4e']).map(({ titulo }) => titulo);
  assert.deepEqual(titulos, ['Un plan que ya tenías', 'Seguir mirando']);
});

test('solo evalúa el prefijo válido de elecciones y no salta momentos', () => {
  assert.deepEqual(evaluarDecisiones(['4a', '5a']), []);
  assert.deepEqual(recuperarElecciones(['1a', '2a', '3d', '4a', '5a']).map(({ id }) => id), ['1a', '2a', '3d']);
});
