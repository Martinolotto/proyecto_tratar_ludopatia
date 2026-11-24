import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarDecisiones } from './evaluarDecisiones.js';
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
  assert.match(evaluarDecisiones(['3a','4c'])[0].observado, /reconsideraste/);
  assert.equal(evaluarDecisiones(['2b'])[0].titulo, 'Mirar las consecuencias');
  assert.equal(evaluarDecisiones(['4e'])[0].titulo, 'Un plan que ya tenías');
  assert.equal(evaluarDecisiones(['3d'])[0].titulo, 'Seguir mirando');
});
