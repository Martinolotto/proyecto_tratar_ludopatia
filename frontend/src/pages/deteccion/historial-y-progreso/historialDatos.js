/*
 * Lecturas privadas de Historial y progreso. La página autentica la cuenta;
 * este módulo consulta Supabase con RLS y devuelve datos sin modificar registros.
 */
import { supabase } from "../../../lib/supabase.js";

const TAMANO_PAGINA = 100;

// El servidor determina hoy con la misma regla que Mi actividad.
export const consultarFechaActual = async () => {
  const { data, error } = await supabase.rpc("consultar_actividad_hoy");
  if (error) throw error;
  if (!data?.fecha) throw new Error("No se pudo conocer el día actual.");
  return data.fecha;
};

// RLS filtra por propietario; la condición explícita también limita la consulta.
// La relación entrega únicamente las situaciones asociadas a cada registro.
export const consultarRegistros = async (usuarioId, desde, hasta) => {
  const { data, error } = await supabase
    .from("registros_actividad")
    .select("id,fecha,aposto,tuvo_ganas,tiempo_valor,tiempo_unidad,cantidad_apuestas,dinero_apostado,dinero_perdido,observacion,registro_conductas(conducta_codigo,conductas(codigo,nombre))")
    .eq("usuario_id", usuarioId)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });
  if (error) throw error;
  if (!data) throw new Error("No se pudieron consultar tus registros.");
  return data.map(({ registro_conductas: relaciones = [], ...registro }) => ({
    ...registro,
    conductas: relaciones.map(({ conducta_codigo, conductas }) => ({
      codigo: conductas?.codigo || conducta_codigo,
      nombre: conductas?.nombre || conducta_codigo,
    })),
  }));
};

// Se buscan notas con cursor por fecha y se omiten cadenas de solo espacios.
// Pedir una nota adicional permite informar si existe otra página realmente.
export const consultarNotas = async (usuarioId, { antes = null, limite = 3, desde, hoy } = {}) => {
  if (!desde || !hoy || !Number.isInteger(limite) || limite < 1) throw new Error("Parámetros de notas inválidos.");
  const notas = [];
  let cursor = antes;
  let agotadas = false;
  while (notas.length <= limite && !agotadas) {
    let consulta = supabase.from("registros_actividad")
      .select("fecha,observacion")
      .eq("usuario_id", usuarioId)
      .not("observacion", "is", null)
      .lte("fecha", hoy)
      .gte("fecha", desde)
      .order("fecha", { ascending: false })
      .limit(TAMANO_PAGINA);
    if (cursor) consulta = consulta.lt("fecha", cursor);
    const { data, error } = await consulta;
    if (error) throw error;
    if (!data) throw new Error("No se pudieron consultar tus reflexiones.");
    for (const nota of data) {
      if (nota.observacion?.trim()) notas.push(nota);
      if (notas.length > limite) break;
    }
    agotadas = data.length < TAMANO_PAGINA;
    if (data.length) cursor = data[data.length - 1].fecha;
    else agotadas = true;
  }
  const pagina = notas.slice(0, limite);
  return { notas: pagina, siguienteCursor: notas.length > limite ? pagina[pagina.length - 1].fecha : null };
};

// El calendario solo necesita saber qué días tienen una entrada, no sus valores.
export const consultarFechasMes = async (usuarioId, desde, hasta) => {
  const { data, error } = await supabase.from("registros_actividad")
    .select("fecha").eq("usuario_id", usuarioId).gte("fecha", desde).lte("fecha", hasta);
  if (error) throw error;
  if (!data) throw new Error("No se pudo consultar el calendario.");
  return data.map(({ fecha }) => fecha);
};

// La continuidad y los reconocimientos solo necesitan fechas y declaraciones.
// El cursor por fecha evita perder registros cuando la Data API limita resultados.
export const consultarHistorialCompleto = async (usuarioId, desde, hasta) => {
  const resultados = [];
  let antes = null;
  while (true) {
    let consulta = supabase.from("registros_actividad")
      .select("fecha,aposto").eq("usuario_id", usuarioId)
      .gte("fecha", desde).lte("fecha", hasta)
      .order("fecha", { ascending: false }).limit(TAMANO_PAGINA);
    if (antes) consulta = consulta.lt("fecha", antes);
    const { data, error } = await consulta;
    if (error) throw error;
    if (!data) throw new Error("No se pudo consultar el recorrido.");
    resultados.push(...data);
    if (data.length < TAMANO_PAGINA) return resultados;
    antes = data[data.length - 1].fecha;
  }
};
