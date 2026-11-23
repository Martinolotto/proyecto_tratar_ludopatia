/* Formatos de presentación compartidos por los gráficos, tablas y detalles del historial. */
const locale = "es-AR";
const moneda = new Intl.NumberFormat(locale, {
  style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const cantidad = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
const compacto = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
const cientifico = new Intl.NumberFormat(locale, { notation: "scientific", maximumSignificantDigits: 3 });
const porcentaje = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
const fechaCorta = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
const fechaPeriodo = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: "UTC" });
const fechaPeriodoConAno = new Intl.DateTimeFormat(locale, {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});
const fechaUTC = (fecha) => new Date(`${fecha}T12:00:00Z`);

export const formatearMoneda = (valor) => valor == null ? "Sin dato" : moneda.format(valor);
export const formatearCantidad = (valor) => valor == null ? "Sin dato" : cantidad.format(valor);
export const formatearPorcentaje = (valor) => porcentaje.format(valor);
export const formatearEjeMoneda = (valor) => compacto.formatToParts(valor)
  .map(({ type, value }) => type === "compact" && value === "mil" ? "k" : value)
  .join("");
export const formatearFechaCorta = (fecha) => fechaCorta.format(fechaUTC(fecha)).replace(".", "");

export function formatearDuracion(minutos) {
  if (minutos == null) return "Sin dato";
  if (minutos > 0 && minutos < 1) return "Menos de 1 min";

  const redondeado = Math.round(minutos);
  const horas = Math.floor(redondeado / 60);
  const resto = redondeado % 60;
  if (!horas) return `${cantidad.format(resto)} min`;
  return resto ? `${cantidad.format(horas)} h ${resto} min` : `${cantidad.format(horas)} h`;
}

export function formatearEjeTiempo(minutos) {
  // Las marcas fraccionarias del eje deben seguir siendo distinguibles.
  if (minutos > 0 && minutos < 0.1) return `${cientifico.format(minutos)} min`;
  if (minutos > 0 && minutos < 1) return `${cantidad.format(minutos)} min`;
  return formatearDuracion(minutos);
}

export function formatearPeriodo(desde, hasta) {
  const formato = desde.slice(0, 4) === hasta.slice(0, 4) ? fechaPeriodo : fechaPeriodoConAno;
  if (desde === hasta) return formato.format(fechaUTC(desde));
  return `${formato.format(fechaUTC(desde))} – ${formato.format(fechaUTC(hasta))}`;
}
