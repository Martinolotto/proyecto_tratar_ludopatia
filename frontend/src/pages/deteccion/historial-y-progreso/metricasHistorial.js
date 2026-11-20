/*
 * Calcula los datos descriptivos de Mi historial a partir de registros propios.
 * Mantiene fechas sin registro y cantidades omitidas como ausencia, no como cero.
 */
const numeroDisponible = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
};

const fechaUTC = (fecha) => new Date(`${fecha}T12:00:00Z`);
const sumarDia = (fecha) => {
  const dia = fechaUTC(fecha);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString().slice(0, 10);
};

// Un registro actualizado varias veces representa una sola fecha de actividad.
export function calcularMetricasHistorial(registros, desde, hasta) {
  const porFecha = new Map(registros.map((registro) => [registro.fecha, registro]));
  const dias = [];
  for (let fecha = desde; fecha <= hasta; fecha = sumarDia(fecha)) {
    const registro = porFecha.get(fecha);
    const tiempo = numeroDisponible(registro?.tiempo_valor);
    dias.push({
      fecha,
      etiqueta: `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`,
      registrado: Boolean(registro),
      aposto: registro?.aposto ?? null,
      apostado: numeroDisponible(registro?.dinero_apostado),
      perdido: numeroDisponible(registro?.dinero_perdido),
      minutos: tiempo === null ? null : registro?.tiempo_unidad === "horas" ? tiempo * 60 : tiempo,
      cantidad: numeroDisponible(registro?.cantidad_apuestas),
    });
  }
  const propios = dias.filter((dia) => dia.registrado);
  const declararonApuestas = propios.filter((dia) => dia.aposto === true).length;
  const total = (clave) => {
    const valores = propios.map((dia) => dia[clave]).filter((valor) => valor !== null);
    const suma = valores.reduce((acumulado, valor) => acumulado + valor, 0);
    return { valor: valores.length ? suma : null, promedio: valores.length ? suma / valores.length : null, base: valores.length };
  };
  const nombresDia = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const semana = nombresDia.map((nombre, indice) => {
    const registrados = propios.filter((dia) => (fechaUTC(dia.fecha).getUTCDay() + 6) % 7 === indice);
    return { nombre, registrados: registrados.length, apuestas: registrados.filter((dia) => dia.aposto === true).length };
  });
  // Cada categoría cuenta como máximo una vez por fecha aunque llegue repetida.
  const situacionesMap = new Map();
  for (const dia of propios) {
    const registro = porFecha.get(dia.fecha);
    const unicas = new Map((registro.conductas ?? []).map((conducta) => [conducta.codigo, conducta]));
    for (const conducta of unicas.values()) {
      const previa = situacionesMap.get(conducta.codigo) ?? { codigo: conducta.codigo, nombre: conducta.nombre, cantidad: 0, fechas: [] };
      situacionesMap.set(conducta.codigo, { ...previa, cantidad: previa.cantidad + 1, fechas: [...previa.fechas, dia.fecha] });
    }
  }
  const situaciones = [...situacionesMap.values()].sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, "es"));
  const repetida = propios.length >= 5 && situaciones[0]?.cantidad >= 3 ? situaciones[0] : null;
  // Las comparaciones solo incluyen días de semana con una base mínima visible.
  const comparables = semana.filter((dia) => dia.registrados >= 2)
    .sort((a, b) => b.apuestas / b.registrados - a.apuestas / a.registrados);
  const distribucion = propios.length >= 5 && declararonApuestas >= 3 && comparables.length >= 2
    && comparables[0].apuestas / comparables[0].registrados > comparables[1].apuestas / comparables[1].registrados
    ? [comparables[0], comparables.at(-1)] : null;
  // Una concentración describe los importes conocidos, sin suponer los omitidos.
  const concentracion = ["apostado", "perdido"].map((clave) => {
    const informados = propios.filter((dia) => dia[clave] !== null);
    const positivos = informados.filter((dia) => dia[clave] > 0).sort((a, b) => b[clave] - a[clave]);
    const suma = informados.reduce((acumulado, dia) => acumulado + dia[clave], 0);
    if (informados.length < 5 || positivos.length < 3 || !suma) return null;
    const proporcion = (positivos[0][clave] + positivos[1][clave]) / suma;
    return proporcion >= 0.6 ? { clave, fechas: positivos.slice(0, 2).map((dia) => dia.fecha), proporcion, base: informados.length } : null;
  }).find(Boolean) ?? null;
  return { dias, registrados: propios.length, declararonApuestas, apostado: total("apostado"), perdido: total("perdido"), minutos: total("minutos"), cantidad: total("cantidad"), semana, situaciones, repetida, distribucion, concentracion };
}
