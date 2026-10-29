/*
 * Pantalla conservada en /mi-espacio durante la transición de navegación.
 * AppRouter mantiene su acceso bajo AppLayout; no reemplaza el panel global Dashboard.
 */
// Página inicial de Mi espacio.
// Su contenido funcional se implementará posteriormente.
export const MiEspacioPage = () => {
  return (
    // Mantener este contenido inicial permite conservar la ruta anterior sin añadir funcionalidades.
    <section>
      <h1 className="text-3xl font-semibold">Mi espacio</h1>
    </section>
  );
};
