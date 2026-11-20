/*
 * Reúne el perfil, los registros recientes y la racha personal para Inicio.
 * Supabase identifica el día argentino; RLS limita cada lectura a su dueño.
 */
import { supabase } from "../../lib/supabase.js";

const TAMANO_PAGINA = 100;

// Las fechas son días de calendario, no horas del navegador: UTC permite restar
// días sin que la zona local o un cambio de horario desplacen la fecha.
export const restarDias = (fecha, cantidad) => {
  const [ano, mes, dia] = fecha.split("-").map(Number);
  const resultado = new Date(Date.UTC(ano, mes - 1, dia));
  resultado.setUTCDate(resultado.getUTCDate() - cantidad);
  return resultado.toISOString().slice(0, 10);
};

// La operación existente obtiene la fecha de Córdoba directamente de PostgreSQL.
const consultarFechaActual = async () => {
  const { data, error } = await supabase.rpc("consultar_actividad_hoy");
  if (error) throw error;
  if (!data?.fecha) throw new Error("No se pudo conocer el día actual.");
  return data.fecha;
};

// Una página solo necesita fecha y declaración. La racha usa paginación por
// fecha: insertar un registro nuevo no desplaza las páginas que faltan leer.
const consultarRacha = async (usuarioId, hoy) => {
  let limite = hoy;
  let incluirLimite = true;
  let esperada = hoy;
  let cantidad = 0;
  let primeraFecha = true;

  while (true) {
    let consulta = supabase
      .from("registros_actividad")
      .select("fecha")
      .eq("usuario_id", usuarioId)
      .order("fecha", { ascending: false });
    consulta = incluirLimite
      ? consulta.lte("fecha", limite)
      : consulta.lt("fecha", limite);

    const { data, error } = await consulta.limit(TAMANO_PAGINA);
    if (error) throw error;
    if (!data) throw new Error("No se pudo consultar la racha.");

    for (const registro of data) {
      // Si todavía no registró hoy, la racha de ayer sigue vigente durante hoy.
      if (primeraFecha && registro.fecha !== hoy) {
        esperada = restarDias(hoy, 1);
      }
      primeraFecha = false;
      if (registro.fecha !== esperada) return cantidad;
      cantidad += 1;
      esperada = restarDias(esperada, 1);
    }

    if (data.length < TAMANO_PAGINA) return cantidad;
    limite = data[data.length - 1].fecha;
    incluirLimite = false;
  }
};

// Cada lectura mantiene separado el estado vacío del error. La consulta semanal
// incluye solo la fecha y lo declarado, sin enviar importes, notas ni conductas.
const consultarConFecha = async (usuarioId, hoy) => {
  const inicioSemana = restarDias(hoy, 6);
  const [perfil, ultimo, registrosSemana, racha] = await Promise.all([
    supabase.from("perfiles").select("username").eq("usuario_id", usuarioId).maybeSingle(),
    supabase.from("registros_actividad").select("fecha, aposto")
      .eq("usuario_id", usuarioId).lte("fecha", hoy)
      .order("fecha", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("registros_actividad").select("fecha, aposto")
      .eq("usuario_id", usuarioId).gte("fecha", inicioSemana).lte("fecha", hoy)
      .order("fecha", { ascending: true }),
    consultarRacha(usuarioId, hoy),
  ]);

  if (perfil.error) throw perfil.error;
  if (ultimo.error) throw ultimo.error;
  if (registrosSemana.error) throw registrosSemana.error;
  if (!perfil.data) throw new Error("El perfil de la cuenta no está disponible.");
  if (!registrosSemana.data) throw new Error("No se pudo consultar la semana.");

  const porFecha = new Map(registrosSemana.data.map((registro) => [registro.fecha, registro]));
  const semana = Array.from({ length: 7 }, (_, indice) => {
    const fecha = restarDias(hoy, 6 - indice);
    return { fecha, registro: porFecha.get(fecha) || null };
  });

  return {
    alias: perfil.data.username,
    ultimoRegistro: ultimo.data,
    fechaActual: hoy,
    semana,
    racha,
    registradoHoy: porFecha.has(hoy),
  };
};

// Una lectura que cruza medianoche se repite una vez con el nuevo día. Así no
// se mezclan una semana y una racha calculadas para fechas funcionales distintas.
export const consultarDatosInicio = async (usuarioId) => {
  for (let intento = 0; intento < 2; intento += 1) {
    const hoy = await consultarFechaActual();
    const datos = await consultarConFecha(usuarioId, hoy);
    const fechaConfirmada = await consultarFechaActual();
    if (hoy === fechaConfirmada) return datos;
  }
  throw new Error("El día cambió durante la consulta. Intentá nuevamente.");
};
