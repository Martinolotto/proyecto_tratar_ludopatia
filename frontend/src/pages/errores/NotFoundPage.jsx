/*
 * Pantalla que AppRouter muestra mediante la ruta * cuando ninguna dirección coincide.
 * PublicLayout aporta la cabecera; este componente comunica que la página no existe.
 */
// Página inicial de Página no encontrada.
// Su contenido funcional se implementará posteriormente.
export const NotFoundPage = () => {
  return (
    // Mostrar el aviso en la interfaz no configura por sí solo un estado HTTP 404 del servidor.
    <section>
      <h1 className="text-3xl font-semibold">Página no encontrada</h1>
    </section>
  );
};
