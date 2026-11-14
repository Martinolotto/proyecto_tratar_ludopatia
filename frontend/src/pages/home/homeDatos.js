/*
 * Consulta los datos personales que necesita Inicio mediante el cliente Supabase.
 * La página identifica la cuenta; las políticas RLS autorizan sus registros.
 */
import { supabase } from "../../lib/supabase.js";

// Seleccionamos solo el alias y los dos datos necesarios del registro más reciente.
export const consultarDatosInicio = async (usuarioId) => {
  const [respuestaPerfil, respuestaActividad] = await Promise.all([
    supabase
      .from("perfiles")
      .select("username")
      .eq("usuario_id", usuarioId)
      .maybeSingle(),
    supabase
      .from("registros_actividad")
      .select("fecha, aposto")
      .eq("usuario_id", usuarioId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // Un error no equivale a una lista vacía: dejamos que la página ofrezca reintentar.
  if (respuestaPerfil.error) throw respuestaPerfil.error;
  if (respuestaActividad.error) throw respuestaActividad.error;
  if (!respuestaPerfil.data) throw new Error("El perfil de la cuenta no está disponible.");

  return {
    alias: respuestaPerfil.data.username,
    ultimoRegistro: respuestaActividad.data,
  };
};
