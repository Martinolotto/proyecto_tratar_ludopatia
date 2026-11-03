/*
 * Pantalla de Mi perfil (/perfil) personalizable.
 * Corrección de maquetado: alineación limpia del avatar sobre el banner y espacio holgado para el nombre.
 */
import { useState } from "react";
import {
  User,
  Shield,
  Eye,
  Bell,
  LogOut,
  Check,
  Palette,
  MessageSquareQuote,
  Trophy,
  Award,
  Camera,
  Image as ImageIcon,
  Medal,
  Sparkles,
  Zap,
  Heart,
  Target,
  CheckCircle2,
} from "lucide-react";

// Opciones de color con clases directas
const OPCIONES_COLOR = [
  { id: "teal", bg: "bg-brand-teal", label: "Teal" },
  { id: "navy", bg: "bg-brand-navy", label: "Navy" },
  { id: "indigo", bg: "bg-indigo-600", label: "Índigo" },
  { id: "emerald", bg: "bg-emerald-600", label: "Esmeralda" },
  { id: "amber", bg: "bg-amber-600", label: "Ámbar" },
  { id: "rose", bg: "bg-rose-600", label: "Rosa" },
];

const LISTA_LOGROS = [
  {
    id: "primer-paso",
    titulo: "Primer Paso",
    descripcion: "Te uniste a la comunidad de MODUS.",
    icono: Trophy,
    desbloqueado: true,
  },
  {
    id: "escudo-activo",
    titulo: "Escudo Activo",
    descripcion: "Configuraste tus primeras herramientas de control.",
    icono: Shield,
    desbloqueado: true,
  },
  {
    id: "voz-de-apoyo",
    titulo: "Voz de Apoyo",
    descripcion: "Publicaste o comentaste en la comunidad.",
    icono: Award,
    desbloqueado: true,
  },
  {
    id: "mente-clara",
    titulo: "Mente Clara",
    descripcion: "Completaste el test de autoobservación sin omitir pasos.",
    icono: Zap,
    desbloqueado: true,
  },
  {
    id: "constancia-7",
    titulo: "Constancia 7 Días",
    descripcion: "Completaste 7 días seguidos registrando tu actividad.",
    icono: Medal,
    desbloqueado: false,
  },
  {
    id: "compañero-fiel",
    titulo: "Compañero Fiel",
    descripcion: "Diste 10 apoyos en publicaciones de la comunidad.",
    icono: Heart,
    desbloqueado: false,
  },
  {
    id: "en-meta",
    titulo: "En Meta",
    descripcion: "Cumpliste tu objetivo de ahorro personal del mes.",
    icono: Target,
    desbloqueado: false,
  },
];

export const PerfilPage = () => {
  const [alias, setAlias] = useState("Estudiante");
  const [colorAvatar, setColorAvatar] = useState("bg-brand-teal");
  const [bio, setBio] = useState(
    "Tratando de mantener malos hábitos lejos y enfocarme en mis proyectos.",
  );
  const [motivacion, setMotivacion] = useState(
    "Ahorrar para mi primera computadora.",
  );

  const [insigniaEquipadaId, setInsigniaEquipadaId] = useState("escudo-activo");

  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [bannerPerfil, setBannerPerfil] = useState(null);

  const [esAnonimo, setEsAnonimo] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFotoPerfil(URL.createObjectURL(file));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBannerPerfil(URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const insigniaObjetoEquipada = LISTA_LOGROS.find(
    (l) => l.id === insigniaEquipadaId,
  );

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Banner y Encabezado de Perfil */}
      <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-surface shadow-sm">
        {/* Banner */}
        <div className="relative h-40 w-full bg-brand-navy/20">
          {bannerPerfil ? (
            <img
              src={bannerPerfil}
              alt="Banner de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-brand-navy to-brand-teal opacity-90" />
          )}
          <label
            htmlFor="banner-upload"
            className="absolute right-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface/85 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur-sm transition hover:bg-surface"
          >
            <ImageIcon size={14} aria-hidden="true" />
            Cambiar portada
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Avatar e Información del usuario */}
        <div className="px-6 pb-6 pt-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              {/* Avatar superpuesto sólo en la imagen */}
              <div className="relative -mt-14 self-start sm:self-auto">
                <div
                  className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface font-heading text-3xl font-bold text-white shadow-md ${
                    fotoPerfil ? "bg-surface" : colorAvatar
                  }`}
                >
                  {fotoPerfil ? (
                    <img
                      src={fotoPerfil}
                      alt={alias}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    alias.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <label
                  htmlFor="foto-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-teal text-white shadow transition hover:opacity-90"
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} aria-hidden="true" />
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Nombre y Meta con espacio de separación del banner */}
              <div className="mt-1 sm:mt-0 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold text-brand-navy">
                    {alias}
                  </h1>

                  {insigniaObjetoEquipada && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal"
                      title={`Insignia equipada: ${insigniaObjetoEquipada.titulo}`}
                    >
                      <Award size={13} />
                      {insigniaObjetoEquipada.titulo}
                    </span>
                  )}
                </div>

                {motivacion && (
                  <p className="mt-1 text-xs font-medium text-brand-teal">
                    🎯 Meta: {motivacion}
                  </p>
                )}
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-brand-teal sm:self-end">
              <Shield size={14} aria-hidden="true" />
              Cuenta activa
            </span>
          </div>

          {bio && (
            <p className="mt-4 border-t border-brand-navy/10 pt-3 text-sm leading-relaxed text-ink/80">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Insignias y Logros */}
      <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
          <Sparkles size={20} className="text-brand-teal" aria-hidden="true" />
          Insignias y Logros
        </h2>
        <p className="mt-1 text-xs text-ink/70">
          Tocá cualquier insignia desbloqueada para equiparla y mostrarla en la
          comunidad.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LISTA_LOGROS.map((logro) => {
            const IconoLogro = logro.icono;
            const estaEquipada = insigniaEquipadaId === logro.id;

            return (
              <div
                key={logro.id}
                onClick={() => {
                  if (logro.desbloqueado) setInsigniaEquipadaId(logro.id);
                }}
                className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                  logro.desbloqueado
                    ? estaEquipada
                      ? "border-brand-teal bg-brand-teal/10 shadow-sm"
                      : "border-brand-navy/10 bg-surface hover:border-brand-teal/50"
                    : "cursor-not-allowed border-brand-navy/10 bg-canvas/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      logro.desbloqueado
                        ? estaEquipada
                          ? "bg-brand-teal text-white"
                          : "bg-surface-soft text-brand-teal"
                        : "bg-brand-navy/10 text-ink/40"
                    }`}
                  >
                    <IconoLogro size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block font-semibold text-xs text-ink">
                      {logro.titulo}
                    </span>
                    <p className="mt-0.5 text-[11px] leading-tight text-ink/70">
                      {logro.descripcion}
                    </p>
                  </div>
                </div>

                {logro.desbloqueado ? (
                  estaEquipada ? (
                    <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-brand-teal px-2 py-1 text-[10px] font-bold text-white">
                      <CheckCircle2 size={12} />
                      Equipada
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-medium text-brand-teal opacity-80 hover:underline">
                      Equipar
                    </span>
                  )
                ) : (
                  <span className="shrink-0 rounded bg-brand-navy/10 px-2 py-0.5 text-[10px] font-medium text-ink/50">
                    Bloqueado
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulario de Configuración */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!fotoPerfil && (
          <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
              <Palette
                size={20}
                className="text-brand-teal"
                aria-hidden="true"
              />
              Color de Avatar
            </h2>
            <p className="mt-1 text-xs text-ink/70">
              Elegí el color base para tus iniciales.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {OPCIONES_COLOR.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setColorAvatar(color.bg)}
                  aria-label={`Color ${color.label}`}
                  className={`h-10 w-10 rounded-full transition ${color.bg} ${
                    colorAvatar === color.bg
                      ? "ring-4 ring-brand-teal/40 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <User size={20} className="text-brand-teal" aria-hidden="true" />
            Información y Presentación
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
              />
            </div>

            <div>
              <label
                htmlFor="bio-input"
                className="block text-sm font-medium text-ink"
              >
                Biografía corta
              </label>
              <textarea
                id="bio-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
              />
            </div>

            <div>
              <label
                htmlFor="motivacion-input"
                className="block text-sm font-medium text-ink"
              >
                Meta principal
              </label>
              <div className="mt-1 flex items-center gap-2">
                <MessageSquareQuote size={18} className="text-brand-teal" />
                <input
                  id="motivacion-input"
                  type="text"
                  value={motivacion}
                  onChange={(e) => setMotivacion(e.target.value)}
                  className="w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Eye size={20} className="text-brand-teal" aria-hidden="true" />
            Privacidad en Comunidad
          </h2>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-soft/40 p-4">
            <div>
              <span className="block text-sm font-medium text-ink">
                Modo anónimo por defecto
              </span>
              <span className="text-xs text-ink/70">
                Oculta tu alias personal en las publicaciones.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={esAnonimo}
              onClick={() => setEsAnonimo(!esAnonimo)}
              className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${
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

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-surface-soft"
          >
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
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
