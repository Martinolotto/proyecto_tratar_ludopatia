/*
 * Operaciones de datos del onboarding: traducen las respuestas de la pantalla
 * y utilizan el cliente compartido de Supabase con la sesión de la persona.
 */
import { supabase } from "../../lib/supabase.js";

// La tabla permite cero o una finalización por cuenta; RLS protege la fila propia.
export const consultarFinalizacion = async (usuarioId) => {
  const { data, error } = await supabase
    .from("onboarding")
    .select("usuario_id")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Una inserción cierra el recorrido; las respuestas omitidas permanecen en NULL.
export const guardarFinalizacion = async (usuarioId, estado, respuestas) => {
  const participo = respuestas.bettingExperience;
  const { error } = await supabase.from("onboarding").insert({
    usuario_id: usuarioId,
    estado,
    rango_edad: respuestas.ageRange ?? null,
    participo_en_apuestas: participo === "yes" ? true : participo === "no" ? false : null,
    frecuencia_inicial: respuestas.approximateFrequency ?? null,
    percepcion_personal: respuestas.personalPerception ?? null,
    motivo_ingreso: respuestas.entryReason ?? null,
  });

  if (error) throw error;
};
