/* Umbrales operativos de MODUS: ordenan orientación y no son criterios clínicos. */
export const UMBRALES = Object.freeze({ registros: 5, recurrencia: 3, especial: 7, duraciones: 3, minutos: 90 });

// Cada fecha aporta una sola declaración y cada situación se cuenta una vez por fecha.
export function evaluarResumen(registros, desde, hasta) {
  const porFecha = new Map(registros.filter(({ fecha }) => fecha >= desde && fecha <= hasta).map((registro) => [registro.fecha, registro]));
  const dias = [...porFecha.values()];
  const situaciones = new Map();
  const duraciones = [];
  for (const registro of dias) {
    for (const situacion of new Map((registro.conductas ?? []).map((item) => [item.codigo, item])).values()) {
      const anterior = situaciones.get(situacion.codigo) ?? { codigo: situacion.codigo, nombre: situacion.nombre, cantidad: 0 };
      situaciones.set(situacion.codigo, { ...anterior, cantidad: anterior.cantidad + 1 });
    }
    const valor = registro.tiempo_valor;
    if (valor !== null && valor !== undefined && valor !== '' && Number.isFinite(Number(valor)) && Number(valor) >= 0 && ['horas', 'minutos'].includes(registro.tiempo_unidad)) {
      duraciones.push(Number(valor) * (registro.tiempo_unidad === 'horas' ? 60 : 1));
    }
  }
  const recurrentes = dias.length >= UMBRALES.registros ? [...situaciones.values()].filter((item) => item.cantidad >= UMBRALES.recurrencia).sort((a, b) => b.cantidad - a.cantidad || a.codigo.localeCompare(b.codigo)) : [];
  const promedio = duraciones.length ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length : null;
  const observaciones = recurrentes.map((item) => ({ id: `situacion:${item.codigo}`, tipo: 'situacion', ...item, base: dias.length, nivel: item.cantidad >= UMBRALES.especial ? 'especial' : 'atencion' }));
  if (duraciones.length >= UMBRALES.duraciones && promedio > UMBRALES.minutos) observaciones.push({ id: 'tiempo', tipo: 'tiempo', nivel: 'atencion', cantidad: promedio, base: duraciones.length });
  observaciones.sort((a, b) => (a.nivel === 'especial' ? 0 : 1) - (b.nivel === 'especial' ? 0 : 1) || (a.tipo === 'situacion' ? 0 : 1) - (b.tipo === 'situacion' ? 0 : 1) || (b.cantidad - a.cantidad) || a.id.localeCompare(b.id));
  return { registrados: dias.length, conApuestas: dias.filter((dia) => dia.aposto === true).length, sinApostar: dias.filter((dia) => dia.aposto === false).length, recurrentes, observaciones, suficienciaSituaciones: dias.length >= UMBRALES.registros, suficienciaTiempo: duraciones.length >= UMBRALES.duraciones };
}
