/*
 * Pantalla inicial de la dirección /, renderizada por AppRouter dentro de PublicLayout.
 * Presenta la bienvenida pública; todavía no contiene el resto de la presentación del producto.
 */
// Página inicial de Bienvenido a MODUS.
// Su contenido funcional se implementará posteriormente.
export const LandingPage = () => {
  return (
    // El encabezado ofrece una bienvenida general; no depende de sesión ni de datos remotos.
    <section>
      <h1 className="text-3xl font-semibold">Bienvenido a MODUS</h1>
    </section>
  );
};
