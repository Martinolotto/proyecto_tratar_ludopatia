import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarDecisiones } from './evaluarDecisiones.js';
import { obtenerContexto, obtenerEntorno, obtenerEscena, siguienteEscena } from './guionFinal.js';

const base = ['intro_partido', 's1_no', 's2_independiente', 's2_no_sabe', 's3_pendiente', 's4_duda', 's4_plan_pendiente'];
const economia = ['intro_partido', 's1_grupo', 's2_interes', 's2_seguir', 's3_ganancia', 's3_reserva_usa', 's4_recuperar', 's4_mantiene_reserva'];
const cambiar = (ruta, anterior, nuevo) => ruta.map((id) => id === anterior ? nuevo : id);

test('rechaza decisiones extra, fuera de orden, duplicadas o ajenas a la rama', () => {
  for (const ruta of [null, [...base, base[0]], [base[1], base[0]], [base[0], base[0]],
    cambiar(base, 's3_pendiente', 's3_ganancia'), cambiar(base, 's2_no_sabe', 'fin'),
    economia.filter((id) => id !== 's3_reserva_usa'), cambiar(economia, 's4_mantiene_reserva', 's4_mantiene'),
    cambiar(economia, 's3_reserva_usa', 's3_reserva_desiste')]) {
    assert.deepEqual(evaluarDecisiones(ruta), { estado: 'invalido' });
  }
  assert.deepEqual(evaluarDecisiones(base.slice(0, -1)), { estado: 'incompleto' });
});

test('la hora, el marcador, los mensajes y el plan se derivan sin mutar el guion', () => {
  const intro = obtenerEscena(0, []);
  const descanso = obtenerEscena(2, base.slice(0, 2));
  const plan = obtenerEscena(4, base.slice(0, 4));
  assert.equal(intro.marcador, '0 — 0');
  assert.deepEqual([descanso.hora, descanso.marcador, descanso.etapa], ['22:15', '1 — 0', 'Entretiempo']);
  assert.equal(obtenerEntorno(descanso, []).mensajes.length, 6);
  assert.equal(obtenerEntorno(plan, []).costoActualizado, true);
  const decisiones = [...base.slice(0, 4), 's3_completa'];
  assert.equal(obtenerEntorno(plan, decisiones).plan, 'confirmada');
  assert.deepEqual(obtenerEntorno(plan, decisiones), obtenerEntorno(plan, decisiones));
  assert.equal(obtenerContexto(cambiar(base, 's4_plan_pendiente', 's4_plan_alternativa')).plan, 'alternativa');
});

test('todos los recorridos del guion llegan a fin con citas válidas y temas únicos', () => {
  let total = 0;
  function visitar(indice, ids, textos) {
    const escena = obtenerEscena(indice, ids);
    if (escena.id === 'fin') {
      const resultado = evaluarDecisiones(ids);
      assert.equal(resultado.estado, 'completo');
      assert.deepEqual(resultado.recorrido, textos);
      const observaciones = resultado.observaciones ?? [];
      assert.equal(new Set(observaciones.map(({ id }) => id)).size, observaciones.length);
      assert.ok(observaciones.length <= 5);
      for (const { evidencias } of [...observaciones, ...(resultado.proteccion ?? [])]) {
        assert.equal(new Set(evidencias.map(({ id }) => id)).size, evidencias.length);
        assert.deepEqual(evidencias, textos.filter(({ id }) => evidencias.some((evidencia) => evidencia.id === id)));
      }
      total += 1;
      return;
    }
    assert.ok(escena.opciones.length > 0);
    for (const { id, texto } of escena.opciones) {
      const siguientes = [...ids, id];
      visitar(siguienteEscena(indice, siguientes), siguientes, [...textos, { id, texto }]);
    }
  }
  visitar(0, [], []);
  assert.equal(total, 3 * 4 * 4 * (10 * 22 + 6 * 9));
});

test('separa influencia aislada, interés económico aislado y cambio tras la ganancia ajena', () => {
  const conCierre = cambiar(base, 's4_plan_pendiente', 's4_abierta');
  const social = evaluarDecisiones(cambiar(conCierre, 's1_no', 's1_grupo'));
  assert.deepEqual(social.observaciones.map(({ id, tipo }) => [id, tipo]), [['influencia_social', 'atencion']]);
  const dinero = evaluarDecisiones(cambiar(conCierre, 's1_no', 's1_dinero'));
  assert.deepEqual(dinero.observaciones.map(({ id, tipo }) => [id, tipo]), [['expectativa_economica', 'reflexion']]);
  const cambio = evaluarDecisiones(cambiar(conCierre, 's2_independiente', 's2_interes'));
  assert.match(cambio.observaciones[0].observado, /Al principio preferiste seguir mirando/);
  assert.deepEqual(cambio.observaciones[0].evidencias.map(({ id }) => id), ['s1_no', 's2_interes', 's4_abierta']);
  assert.equal(cambio.proteccion.some(({ id }) => id === 'rechazo'), false);
});

test('las cinco observaciones tienen prioridad, evidencia y matices compatibles', () => {
  const { observaciones } = evaluarDecisiones(economia);
  assert.deepEqual(observaciones.map(({ id }) => id), [
    'compromisos', 'recuperacion_perdidas', 'influencia_social', 'expectativa_economica', 'continuidad_resultado',
  ]);
  assert.deepEqual(observaciones[0].evidencias.map(({ id }) => id), ['s3_ganancia', 's3_reserva_usa', 's4_mantiene_reserva']);
  assert.match(observaciones[0].observado, /Volviste a mencionar/);
  assert.match(observaciones[4].matiz, /ambos supuestos/);
  for (const [id, texto] of [
    ['s4_desiste', /dejar de lado/], ['s4_protege_reserva', /mantener separado/], ['s4_abierta', /quedó abierta/],
  ]) {
    const { observaciones: [compromiso] } = evaluarDecisiones(cambiar(economia, 's4_mantiene_reserva', id));
    assert.match(compromiso.matiz, texto);
    assert.doesNotMatch(compromiso.observado, /Volviste/);
  }
  const planCondicionado = cambiar(cambiar(economia, 's3_reserva_usa', 's3_reserva_duda'), 's4_mantiene_reserva', 's4_abierta');
  assert.doesNotMatch(evaluarDecisiones(planCondicionado).observaciones[0].observado, /usar parte/);
});

test('distingue supuestos y conserva protección aun en devoluciones neutrales', () => {
  assert.equal(evaluarDecisiones(cambiar(base, 's4_duda', 's4_recuperar')).observaciones[0].id, 'recuperacion_perdidas');
  assert.equal(evaluarDecisiones(cambiar(base, 's2_no_sabe', 's2_seguir')).observaciones[0].id, 'continuidad_resultado');
  const plan = cambiar(cambiar(base, 's3_pendiente', 's3_completa'), 's4_plan_pendiente', 's4_plan_confirma');
  const neutral = evaluarDecisiones(cambiar(plan, 's4_duda', 's4_detener'));
  assert.deepEqual(neutral.observaciones, []);
  assert.match(neutral.resumen, /no encontramos decisiones/);
  assert.deepEqual(neutral.proteccion.map(({ id }) => id), ['detenerse', 'planes', 'rechazo']);
  const reconsidera = cambiar(cambiar(economia, 's3_reserva_usa', 's3_reserva_desiste'), 's4_mantiene_reserva', 's4_plan_alternativa');
  assert.match(evaluarDecisiones(reconsidera).observaciones[0].matiz, /dejar de lado/);
  assert.equal(obtenerContexto(reconsidera).plan, 'alternativa');
});
