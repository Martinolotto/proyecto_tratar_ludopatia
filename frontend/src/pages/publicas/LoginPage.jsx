/*
 * Pantalla inicial de /login, enlazada desde la cabecera de PublicLayout.
 * AppRouter reserva esta ruta; aún no hay formulario ni integración con Supabase Auth.
 */
// Página inicial de Iniciar sesión.
// Su contenido funcional se implementará posteriormente.
export const LoginPage = () => {
  return (
    // Mostrar el título no inicia una sesión ni protege las otras rutas.
    <section>
      <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
    </section>
  );
};
