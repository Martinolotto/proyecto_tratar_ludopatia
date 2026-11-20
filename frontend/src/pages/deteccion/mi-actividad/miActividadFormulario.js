/*
 * Traduce entre los campos legibles de Mi actividad y los datos de PostgreSQL.
 * También valida números argentinos antes de enviarlos desde la página.
 */
export const formularioVacio = () => ({
  aposto: null, tuvoGanas: null, tiempo: "", unidad: "minutos", cantidad: "",
  apostado: "", perdido: "", nota: "", conductas: [],
});

// El formato visible usa coma decimal; NULL permanece vacío y cero se conserva.
const aTexto = (valor) => valor === null || valor === undefined
  ? "" : String(valor).replace(".", ",");

export const desdeRegistro = (registro, conductas = []) => registro ? ({
  aposto: registro.aposto,
  tuvoGanas: registro.tuvo_ganas,
  tiempo: aTexto(registro.tiempo_valor),
  unidad: registro.tiempo_unidad || "minutos",
  cantidad: aTexto(registro.cantidad_apuestas),
  apostado: aTexto(registro.dinero_apostado),
  perdido: aTexto(registro.dinero_perdido),
  nota: registro.observacion || "",
  conductas: [...conductas],
}) : formularioVacio();

// Aceptamos 1250,50 o 1.250,50: el punto solo separa grupos de miles.
const decimalArgentino = (texto, maxDecimales) => {
  const valor = texto.trim();
  if (!valor) return null;
  const formato = maxDecimales === 2
    ? /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/
    : /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/;
  if (!formato.test(valor)) return undefined;
  const normalizado = valor.replaceAll(".", "").replace(",", ".");
  // PostgreSQL numeric admite hasta 131072 dígitos enteros y 16383 decimales.
  // Conservamos la cadena original: Number redondearía valores grandes.
  const [entero, decimales = ""] = normalizado.split(".");
  if (entero.replace(/^0+/, "").length > 131072 || decimales.length > 16383) {
    return undefined;
  }
  return normalizado;
};

export const validarActividad = (formulario) => {
  const errores = {};
  if (formulario.aposto === null) errores.aposto = "Elegí si hoy apostaste o no.";
  const tiempo = decimalArgentino(formulario.tiempo, Infinity);
  const apostado = decimalArgentino(formulario.apostado, 2);
  const perdido = decimalArgentino(formulario.perdido, 2);
  const cantidadTexto = formulario.cantidad.trim();
  const cantidad = cantidadTexto === "" ? null : Number(cantidadTexto);
  if (formulario.aposto && tiempo === undefined) errores.tiempo = "Ingresá un tiempo válido, por ejemplo 1,5.";
  if (formulario.aposto && apostado === undefined) errores.apostado = "Ingresá un monto válido, por ejemplo 1.250,50.";
  if (formulario.aposto && perdido === undefined) errores.perdido = "Ingresá un monto válido, por ejemplo 1.250,50.";
  if (formulario.aposto && cantidad !== null && (!/^\d+$/.test(cantidadTexto) || !Number.isSafeInteger(cantidad) || cantidad > 2147483647)) {
    errores.cantidad = "Ingresá una cantidad entera no negativa.";
  }
  return {
    errores,
    datos: {
      aposto: formulario.aposto,
      tuvoGanas: formulario.tuvoGanas,
      tiempo: formulario.aposto ? tiempo : null,
      unidad: formulario.aposto && tiempo !== null ? formulario.unidad : null,
      cantidad: formulario.aposto ? cantidad : null,
      apostado: formulario.aposto ? apostado : null,
      perdido: formulario.aposto ? perdido : null,
      nota: formulario.nota.trim() || null,
      conductas: formulario.conductas,
    },
  };
};

export const hayCantidades = (formulario) =>
  [formulario.tiempo, formulario.cantidad, formulario.apostado, formulario.perdido]
    .some((valor) => valor.trim() !== "");

// Agrupamos texto en lugar de convertirlo a Number: así no se pierden centavos
// aunque PostgreSQL guarde un importe mayor al rango numérico de JavaScript.
export const formatoPesos = (valor) => {
  if (valor === null || valor === undefined) return "Sin indicar";
  const [enteroOriginal, decimal = ""] = String(valor).split(".");
  const entero = enteroOriginal.replace(/^0+(?=\d)/, "");
  const grupos = [];
  for (let fin = entero.length; fin > 0; fin -= 3) {
    grupos.push(entero.slice(Math.max(0, fin - 3), fin));
  }
  return `$ ${grupos.reverse().join(".")},${decimal.padEnd(2, "0")}`;
};
