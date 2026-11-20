/* Pruebas de métricas: ausencia, ceros, bases y reglas descriptivas. */
import test from "node:test";
import assert from "node:assert/strict";
import { calcularMetricasHistorial } from "./metricasHistorial.js";

test("ceros cuentan, omisiones no, y las horas se expresan en minutos", () => {
  const registros = [
    { fecha: "2026-01-01", aposto: true, dinero_apostado: 0, dinero_perdido: null, tiempo_valor: 2, tiempo_unidad: "horas", cantidad_apuestas: 0, conductas: [] },
    { fecha: "2026-01-03", aposto: false, dinero_apostado: 100, dinero_perdido: 0, conductas: [] },
  ];
  const datos = calcularMetricasHistorial(registros, "2026-01-01", "2026-01-03");
  assert.equal(datos.dias[1].registrado, false);
  assert.equal(datos.dias[1].apostado, null);
  assert.deepEqual(datos.apostado, { valor: 100, promedio: 50, base: 2 });
  assert.deepEqual(datos.perdido, { valor: 0, promedio: 0, base: 1 });
  assert.equal(datos.minutos.promedio, 120);
  assert.equal(datos.cantidad.promedio, 0);
  assert.equal(datos.declararonApuestas, 1);
});

test("situaciones repetidas requieren cinco registros y tres fechas distintas", () => {
  const base = Array.from({ length: 5 }, (_, i) => ({ fecha: `2026-01-0${i + 1}`, aposto: true, conductas: i < 3 ? [{ codigo: "A", nombre: "Situación A" }, { codigo: "A", nombre: "Situación A" }] : [] }));
  assert.equal(calcularMetricasHistorial(base.slice(0, 4), "2026-01-01", "2026-01-05").repetida, null);
  const resultado = calcularMetricasHistorial(base, "2026-01-01", "2026-01-05");
  assert.equal(resultado.repetida.cantidad, 3);
  assert.equal(resultado.registrados, 5);
});

test("concentración exige importes suficientes y no mezcla series", () => {
  const registros = [100, 90, 10, 0, 0].map((dinero_apostado, i) => ({ fecha: `2026-01-0${i + 1}`, aposto: true, dinero_apostado, dinero_perdido: null, conductas: [] }));
  const resultado = calcularMetricasHistorial(registros, "2026-01-01", "2026-01-05");
  assert.equal(resultado.concentracion.clave, "apostado");
  assert.equal(resultado.concentracion.base, 5);
  assert.equal(resultado.concentracion.proporcion, 0.95);
  assert.equal(calcularMetricasHistorial(registros.slice(0, 4), "2026-01-01", "2026-01-05").concentracion, null);
});
