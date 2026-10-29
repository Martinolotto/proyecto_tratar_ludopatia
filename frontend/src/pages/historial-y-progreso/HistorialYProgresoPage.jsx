/*
 * Pantalla inicial de /historial-y-progreso, accesible desde el Dashboard global.
 * AppRouter la renderiza en AppLayout; aún no consulta registros ni calcula indicadores.
 */
// Página inicial de la herramienta aprobada, sin métricas ni datos simulados.
export const HistorialYProgresoPage = () => {
  return (
    // El encabezado identifica la página reservada; todavía no hay historial o gráficos que mostrar.
    <section>
      <h1 className="text-3xl font-semibold">Historial y progreso</h1>
    </section>
  );
};
