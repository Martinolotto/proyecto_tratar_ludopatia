/*
 * Pantalla de Mi perfil (/perfil), renderizada dentro de AppLayout.
 * Permite gestionar los datos de cuenta, alias y preferencias de privacidad en la comunidad.
 */
import { useState } from "react";
import { User, Shield, Eye, Bell, LogOut, Check } from "lucide-react";

export const PerfilPage = () => {
  // Estado local para simular la edición de datos y opciones de configuración
  const [alias, setAlias] = useState("Estudiante");
  const [esAnonimo, setEsAnonimo] = useState(true);
  const [notificaciones, setNotificaciones] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Encabezado del perfil */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-navy/10 bg-surface p-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft font-heading text-2xl font-bold text-brand-teal">
            {alias.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-navy">
              {alias}
            </h1>
            <p className="text-sm text-ink/70">Usuario en MODUS</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-brand-teal">
          <Shield size={14} aria-hidden="true" />
          Cuenta activa
        </span>
      </div>

      {/* Formulario de configuración */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información general */}
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <User size={20} className="text-brand-teal" aria-hidden="true" />
            Información de la cuenta
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="alias-input"
                className="block text-sm font-medium text-ink"
              >
                Alias o nombre público
              </label>
              <input
                id="alias-input"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                placeholder="Ingresá tu alias"
              />
              <p className="mt-1 text-xs text-ink/60">
                Este nombre se mostrará en las secciones compartidas.
              </p>
            </div>
          </div>
        </div>

        {/* Privacidad en comunidad */}
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Eye size={20} className="text-brand-teal" aria-hidden="true" />
            Privacidad en Comunidad
          </h2>
          <p className="mt-1 text-sm text-ink/70">
            Ajustá cómo se visualiza tu identidad al participar en espacios
            grupales.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-soft/40 p-4">
            <div>
              <span className="block text-sm font-medium text-ink">
                Modo anónimo por defecto
              </span>
              <span className="text-xs text-ink/70">
                Oculta tu alias personal en las publicaciones de la comunidad.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={esAnonimo}
              onClick={() => setEsAnonimo(!esAnonimo)}
              className={`relative flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-brand-teal ${
                esAnonimo ? "bg-brand-teal" : "bg-brand-navy/20"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  esAnonimo ? "translate-x-5.5" : "translate-x-0.5"
                } shadow`}
              />
            </button>
          </div>
        </div>

        {/* Notificaciones y preferencias */}
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Bell size={20} className="text-brand-teal" aria-hidden="true" />
            Preferencias
          </h2>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-soft/40 p-4">
            <div>
              <span className="block text-sm font-medium text-ink">
                Avisos y recordatorios
              </span>
              <span className="text-xs text-ink/70">
                Recibir notificaciones sobre contenidos y novedades de la
                plataforma.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificaciones}
              onClick={() => setNotificaciones(!notificaciones)}
              className={`relative flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-brand-teal ${
                notificaciones ? "bg-brand-teal" : "bg-brand-navy/20"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  notificaciones ? "translate-x-5.5" : "translate-x-0.5"
                } shadow`}
              />
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-surface-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          >
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            {guardado ? (
              <>
                <Check size={18} aria-hidden="true" />
                Cambios guardados
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
