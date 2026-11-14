/*
 * Conecta Mi actividad con Supabase: consulta el día de la base y su catálogo,
 * y envía el registro mediante la operación transaccional protegida por RLS.
 */
import { supabase } from "../../../lib/supabase.js";

// Una lectura vacía no es un error; un error sí debe permitir reintentar.
export const consultarActividad = async () => {
  const [actividad, conductas] = await Promise.all([
    supabase.rpc("consultar_actividad_hoy"),
    supabase.from("conductas").select("codigo, nombre").order("codigo"),
  ]);
  if (actividad.error) throw actividad.error;
  if (conductas.error) throw conductas.error;
  return { ...actividad.data, catalogo: conductas.data };
};

// PostgreSQL comprueba la fecha esperada y confirma toda la escritura o ninguna.
export const guardarActividad = async (fecha, datos) => {
  const { data, error } = await supabase.rpc("guardar_actividad_hoy_validada", {
    p_fecha_esperada: fecha,
    p_aposto: datos.aposto,
    p_tuvo_ganas: datos.tuvoGanas,
    p_tiempo_valor: datos.tiempo,
    p_tiempo_unidad: datos.unidad,
    p_cantidad_apuestas: datos.cantidad,
    p_dinero_apostado: datos.apostado,
    p_dinero_perdido: datos.perdido,
    p_observacion: datos.nota,
    p_conductas: datos.conductas,
  });
  if (error) throw error;
  return data;
};
