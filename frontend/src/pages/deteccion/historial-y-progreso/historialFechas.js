/*
 * Fechas de Historial y progreso: calcula períodos por día argentino y sus
 * límites. La página usa estas funciones sin depender del reloj del navegador.
 */
const ZONA = "America/Argentina/Cordoba";
const DIA_MS = 86400000;

// Una fecha de calendario se procesa en UTC para no desplazarla entre zonas.
const aFecha = (fecha) => {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("Fecha de calendario inválida.");
  }
  const valor = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(valor.getTime()) || valor.toISOString().slice(0, 10) !== fecha) {
    throw new Error("Fecha de calendario inválida.");
  }
  return valor;
};
const aTexto = (fecha) => fecha.toISOString().slice(0, 10);

export const sumarDias = (fecha, cantidad) => aTexto(new Date(aFecha(fecha).getTime() + cantidad * DIA_MS));

// Sitúa cualquier fecha en un bloque de 30 días anclado a hoy, sin solapamientos.
export const alinearBloque30 = (fecha, hoy) => {
  const diasDesdeHoy = Math.floor((aFecha(hoy).getTime() - aFecha(fecha).getTime()) / DIA_MS);
  const bloquesAnteriores = Math.max(0, Math.floor(diasDesdeHoy / 30));
  return sumarDias(hoy, -30 * bloquesAnteriores);
};

// La creación es un instante de Auth: se convierte a la misma zona que la base.
export const fechaCordoba = (instante) => {
  if (!instante) throw new Error("Instante de cuenta inválido.");
  const fecha = new Date(instante);
  if (Number.isNaN(fecha.getTime())) throw new Error("Instante de cuenta inválido.");
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(fecha);
  const valor = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valor.year}-${valor.month}-${valor.day}`;
};

// Se conservan los límites nominales para desplazar bloques sin solapamientos.
const limitesNominales = (tipo, ancla) => {
  const fecha = aFecha(ancla);
  if (tipo === "dia") return { inicioNominal: ancla, finNominal: ancla };
  if (tipo === "30dias") return { inicioNominal: sumarDias(ancla, -29), finNominal: ancla };
  if (tipo === "semana") {
    const lunes = sumarDias(ancla, -((fecha.getUTCDay() + 6) % 7));
    return { inicioNominal: lunes, finNominal: sumarDias(lunes, 6) };
  }
  if (tipo === "mes") {
    const inicio = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
    const fin = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 0));
    return { inicioNominal: aTexto(inicio), finNominal: aTexto(fin) };
  }
  throw new Error("Período de historial inválido.");
};

// Los días antes de la cuenta y posteriores a hoy no pertenecen al cálculo.
export const obtenerPeriodo = (tipo, fechaAncla, creacion, hoy) => {
  aFecha(creacion);
  aFecha(hoy);
  if (creacion > hoy) throw new Error("La fecha de creación es posterior al día actual.");
  const nominal = limitesNominales(tipo, fechaAncla);
  return {
    ...nominal,
    desde: nominal.inicioNominal < creacion ? creacion : nominal.inicioNominal,
    hasta: nominal.finNominal > hoy ? hoy : nominal.finNominal,
  };
};

// Al cambiar de mes se usa el primer día: evita saltos como 31 de enero a marzo.
export const desplazarPeriodo = (tipo, fechaAncla, direccion) => {
  if (direccion !== -1 && direccion !== 1) throw new Error("Dirección de período inválida.");
  if (tipo === "dia") return sumarDias(fechaAncla, direccion);
  if (tipo === "semana") return sumarDias(fechaAncla, direccion * 7);
  if (tipo === "30dias") return sumarDias(fechaAncla, direccion * 30);
  if (tipo === "mes") {
    const fecha = aFecha(fechaAncla);
    return aTexto(new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + direccion, 1)));
  }
  throw new Error("Período de historial inválido.");
};

export const puedeNavegar = (tipo, fechaAncla, direccion, creacion, hoy) => {
  const candidato = obtenerPeriodo(tipo, desplazarPeriodo(tipo, fechaAncla, direccion), creacion, hoy);
  return candidato.desde <= candidato.hasta;
};
