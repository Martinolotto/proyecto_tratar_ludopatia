/*
 * Pruebas de los períodos de Historial: comprueban límites, cambio de meses y
 * conversión del instante de creación a la zona funcional de MODUS.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { alinearBloque30, desplazarPeriodo, fechaCordoba, obtenerPeriodo, puedeNavegar, sumarDias } from "./historialFechas.js";

test("creación en UTC se interpreta en Córdoba", () => {
  assert.equal(fechaCordoba("2026-01-01T01:30:00Z"), "2025-12-31");
  assert.equal(fechaCordoba("2026-01-01T04:00:00Z"), "2026-01-01");
});

test("últimos 30 días son inclusivos, contiguos y recortados por cuenta", () => {
  const hoy = "2026-03-02";
  const actual = obtenerPeriodo("30dias", hoy, "2026-02-20", hoy);
  assert.deepEqual(actual, { inicioNominal: "2026-02-01", finNominal: hoy, desde: "2026-02-20", hasta: hoy });
  const anterior = desplazarPeriodo("30dias", hoy, -1);
  assert.equal(anterior, "2026-01-31");
  assert.equal(puedeNavegar("30dias", hoy, -1, "2026-02-20", hoy), false);
  assert.equal(puedeNavegar("30dias", hoy, 1, "2026-01-01", hoy), false);
});

test("semana lunes a domingo y mes sin saltar febrero", () => {
  assert.deepEqual(obtenerPeriodo("semana", "2026-01-01", "2025-01-01", "2026-01-31"), {
    inicioNominal: "2025-12-29", finNominal: "2026-01-04", desde: "2025-12-29", hasta: "2026-01-04",
  });
  assert.equal(desplazarPeriodo("mes", "2024-01-31", 1), "2024-02-01");
  assert.equal(obtenerPeriodo("mes", "2024-02-01", "2024-01-01", "2024-03-01").hasta, "2024-02-29");
});

test("fechas no válidas y límites imposibles se rechazan", () => {
  assert.throws(() => obtenerPeriodo("dia", "2026-02-30", "2026-01-01", "2026-03-01"));
  assert.throws(() => obtenerPeriodo("dia", "2026-01-01", "2026-02-01", "2026-01-01"));
  assert.throws(() => desplazarPeriodo("semana", "2026-01-01", 0));
});

test("al entrar desde una fecha intermedia los bloques de 30 días no se solapan", () => {
  const hoy = "2026-11-16";
  const actual = alinearBloque30("2026-11-14", hoy);
  assert.equal(actual, hoy);
  assert.equal(puedeNavegar("30dias", actual, 1, "2026-01-01", hoy), false);
  const anterior = desplazarPeriodo("30dias", actual, -1);
  const limitesAnteriores = obtenerPeriodo("30dias", anterior, "2026-01-01", hoy);
  const limitesActuales = obtenerPeriodo("30dias", actual, "2026-01-01", hoy);
  assert.equal(sumarDias(limitesAnteriores.hasta, 1), limitesActuales.desde);
  assert.equal(alinearBloque30("2026-10-17", hoy), anterior);
  assert.equal(alinearBloque30("2026-10-18", hoy), actual);
});

test("la alineación de bloques cruza años y contempla fechas futuras", () => {
  assert.equal(alinearBloque30("2025-12-02", "2026-01-01"), "2025-12-02");
  assert.equal(alinearBloque30("2026-01-05", "2026-01-01"), "2026-01-01");
  assert.throws(() => alinearBloque30("2026-02-30", "2026-03-01"));
});
