/*
 * Diálogo de valores diarios compartido por los tres gráficos de Mi historial.
 * Usa los días ya calculados y conserva el flujo hacia el detalle de una fecha.
 */
import { useId, useRef } from "react";
import { X } from "lucide-react";
import { formatearFechaCorta, formatearPeriodo } from "./formatosMetricas.js";

export function ValoresDiariosModal({ titulo, desde, hasta, unidad, dias, columnas, onSeleccionarFecha }) {
  const dialogo = useRef(null);
  const encabezado = useRef(null);
  const tituloId = useId();
  const periodoId = useId();

  const abrir = (evento) => {
    // El diálogo nativo devuelve el foco al elemento que estaba activo al abrirlo.
    evento.currentTarget.focus({ preventScroll: true });
    const modal = dialogo.current;
    modal.showModal();
    modal.querySelector(".metricas-modal__scroll").scrollTop = 0;
    encabezado.current.focus({ preventScroll: true });
  };
  const cerrar = () => dialogo.current.close();
  const consultarFecha = (fecha) => {
    cerrar();
    onSeleccionarFecha(fecha);
  };

  return (
    <>
      <button className="metricas-valores__accion" type="button" aria-haspopup="dialog" onClick={abrir}>
        Ver valores por día
      </button>
      <dialog className="metricas-modal" ref={dialogo} aria-labelledby={tituloId} aria-describedby={periodoId}>
        <div className="metricas-modal__panel">
          <header className="metricas-modal__cabecera">
            <div>
              <h2 id={tituloId} ref={encabezado} tabIndex={-1}>{titulo} por día</h2>
              <p id={periodoId}>{formatearPeriodo(desde, hasta)}{unidad && ` · ${unidad}`}</p>
            </div>
            <button type="button" className="metricas-modal__icono" aria-label="Cerrar valores por día" onClick={cerrar}>
              <X size={20} aria-hidden="true" />
            </button>
          </header>
          <div className="metricas-modal__scroll">
            <table className="metricas-modal__tabla">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  {columnas.map(({ clave, etiqueta }) => <th scope="col" key={clave}>{etiqueta}</th>)}
                </tr>
              </thead>
              <tbody>{dias.map((dia) => (
                <tr key={dia.fecha}>
                  <th scope="row">
                    <button type="button" onClick={() => consultarFecha(dia.fecha)}>{formatearFechaCorta(dia.fecha)}</button>
                  </th>
                  {columnas.map(({ clave, formatear }) => (
                    <td key={clave}>{dia.registrado ? formatear(dia[clave]) : "Sin registro"}</td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <footer className="metricas-modal__pie">
            <span>{dias.length} {dias.length === 1 ? "día" : "días"} del período</span>
            <button className="metricas-modal__cerrar" type="button" onClick={cerrar}>Cerrar</button>
          </footer>
        </div>
      </dialog>
    </>
  );
}
