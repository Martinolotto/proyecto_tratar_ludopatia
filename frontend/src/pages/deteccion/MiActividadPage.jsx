/*
 * Pantalla inicial de /mi-actividad, enlazada desde el Dashboard para el eje 2.
 * AppRouter la muestra dentro de AppLayout; no tiene formulario ni persistencia todavía.
 */
// Página inicial de la herramienta aprobada; el registro diario se implementará después.
export const MiActividadPage = () => {
  return (
    // El título confirma la navegación; no crea ni modifica registros de actividad.
    <section>
      <h1 className="text-3xl font-semibold">Mi actividad</h1>
    </section>
  );
};
