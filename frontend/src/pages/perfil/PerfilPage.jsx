/*
 * Muestra y permite actualizar los datos reales de la cuenta en /perfil.
 * Supabase Auth identifica la sesión; perfiles y Storage conservan alias y avatar.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Camera,
  Eye,
  Image as ImageIcon,
  LogOut,
  Palette,
  Phone,
  Shield,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import {
  convertirArchivoADataUrl,
  recortarImagen,
} from "../../lib/cropImage.js";

// El bucket admite solo estos formatos y un máximo de dos mebibytes.
const FORMATOS_AVATAR = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAXIMO_AVATAR = 2 * 1024 * 1024;
const MAXIMO_PORTADA = 1.5 * 1024 * 1024;
const CLAVE_PORTADA_LOCAL = "modus.portada.perfil";
const CLAVE_CONTACTO_AYUDA = "modus.contacto-ayuda";

export const PerfilPage = () => {
  const navigate = useNavigate();
  const [usuarioId, setUsuarioId] = useState(null);
  const [alias, setAlias] = useState("");
  const [aliasGuardado, setAliasGuardado] = useState("");
  const [rutaAvatar, setRutaAvatar] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [vistaPreviaAvatar, setVistaPreviaAvatar] = useState(null);
  const [portadaPerfil, setPortadaPerfil] = useState(null);
  const [contactoAyuda, setContactoAyuda] = useState("");
  const [imagenElegida, setImagenElegida] = useState(null);
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [preparandoImagen, setPreparandoImagen] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  // Obtener la cuenta validada por Auth antes de consultar su perfil por identificador.
  // La política de la base, además, controla qué datos puede modificar cada sesión.
  useEffect(() => {
    let vigente = true;
    const cargarPerfil = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!vigente) return;
      if (error && error.name !== "AuthSessionMissingError") {
        setMensaje(
          "No pudimos comprobar tu sesión. Revisá tu conexión e intentá de nuevo.",
        );
        setEstado("error");
        return;
      }
      if (!data.user) {
        navigate("/login", { replace: true });
        return;
      }
      const { data: perfil, error: errorPerfil } = await supabase
        .from("perfiles")
        .select("username, avatar_path")
        .eq("usuario_id", data.user.id)
        .maybeSingle();
      if (!vigente) return;
      if (errorPerfil || !perfil) {
        setMensaje("No pudimos cargar tu perfil. Intentá nuevamente más tarde.");
        setEstado("error");
        return;
      }
      setUsuarioId(data.user.id);
      setAlias(perfil.username);
      setAliasGuardado(perfil.username);
      setRutaAvatar(perfil.avatar_path);
      try {
        setPortadaPerfil(
          localStorage.getItem(`${CLAVE_PORTADA_LOCAL}.${data.user.id}`),
        );
        setContactoAyuda(
          localStorage.getItem(`${CLAVE_CONTACTO_AYUDA}.${data.user.id}`) ?? "",
        );
      } catch {
        setMensaje("No pudimos leer la portada guardada en este navegador.");
      }
      setEstado("listo");
    };
    cargarPerfil();
    return () => {
      vigente = false;
    };
  }, [navigate]);

  // El bucket es privado: se descarga con la sesión y se crea una dirección temporal
  // del navegador; al cambiar de imagen o salir se libera esa dirección de memoria.
  useEffect(() => {
    if (!rutaAvatar) return undefined;
    let vigente = true;
    let direccionTemporal;
    const cargarAvatar = async () => {
      const { data, error } = await supabase.storage
        .from("avatares")
        .download(rutaAvatar);
      if (!vigente) return;
      if (error) {
        setFotoPerfil(null);
        setMensaje("No pudimos cargar tu foto. Podés intentar nuevamente más tarde.");
        return;
      }
      direccionTemporal = URL.createObjectURL(data);
      setFotoPerfil(direccionTemporal);
      setVistaPreviaAvatar(null);
    };
    cargarAvatar();
    return () => {
      vigente = false;
      if (direccionTemporal) URL.revokeObjectURL(direccionTemporal);
    };
  }, [rutaAvatar]);

  useEffect(() => {
    if (!vistaPreviaAvatar) return undefined;
    return () => URL.revokeObjectURL(vistaPreviaAvatar);
  }, [vistaPreviaAvatar]);

  // El archivo se valida antes de subirlo; elegirlo aún no guarda cambios remotos.
  const handleFotoUpload = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    if (!FORMATOS_AVATAR[archivo.type] || archivo.size > MAXIMO_AVATAR) {
      setImagenElegida(null);
      setVistaPreviaAvatar(null);
      setMensaje("Elegí una imagen JPEG, PNG o WebP de hasta 2 MiB.");
      return;
    }
    setPreparandoImagen(true);
    try {
      const avatarCuadrado = await recortarImagen(archivo, 512, 512);
      if (avatarCuadrado.size > MAXIMO_AVATAR) {
        setMensaje("La foto recortada supera el límite de 2 MiB.");
        return;
      }
      setImagenElegida(avatarCuadrado);
      setVistaPreviaAvatar(URL.createObjectURL(avatarCuadrado));
      setMensaje("Foto cuadrada seleccionada. Guardá los cambios para subirla.");
    } catch {
      setMensaje("No pudimos recortar la foto seleccionada.");
    } finally {
      setPreparandoImagen(false);
    }
  };

  const handlePortadaUpload = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;

    if (!FORMATOS_AVATAR[archivo.type] || archivo.size > MAXIMO_PORTADA) {
      setMensaje("Elegí una portada JPEG, PNG o WebP de hasta 1,5 MiB.");
      return;
    }

    try {
      const portadaBanner = await recortarImagen(archivo, 1500, 500);
      const portadaDataUrl = await convertirArchivoADataUrl(portadaBanner);
      if (!usuarioId) return;
      localStorage.setItem(
        `${CLAVE_PORTADA_LOCAL}.${usuarioId}`,
        portadaDataUrl,
      );
      setPortadaPerfil(portadaDataUrl);
      setMensaje(
        "Portada guardada en formato 1500 × 500. Solo queda en este navegador.",
      );
    } catch {
      setMensaje(
        "No pudimos recortar o guardar la portada. Revisá el espacio disponible en este navegador.",
      );
    }
  };

  const handleQuitarPortada = () => {
    try {
      localStorage.removeItem(`${CLAVE_PORTADA_LOCAL}.${usuarioId}`);
      setPortadaPerfil(null);
      setMensaje("Portada quitada de este navegador.");
    } catch {
      setMensaje("No pudimos quitar la portada guardada en este navegador.");
    }
  };

  const handleGuardarContacto = (event) => {
    event.preventDefault();
    const numero = contactoAyuda.trim();
    const digitos = numero.replace(/\D/g, "");
    if (
      numero &&
      (!/^\+?[\d\s().-]+$/.test(numero) ||
        digitos.length < 7 ||
        digitos.length > 15)
    ) {
      setMensaje("Ingresá un número de ayuda válido, con código de país si corresponde.");
      return;
    }

    try {
      if (numero) {
        localStorage.setItem(
          `${CLAVE_CONTACTO_AYUDA}.${usuarioId}`,
          numero,
        );
      } else {
        localStorage.removeItem(`${CLAVE_CONTACTO_AYUDA}.${usuarioId}`);
      }
      setMensaje("Contacto de ayuda guardado solo en este navegador.");
    } catch {
      setMensaje("No pudimos guardar el contacto en este navegador.");
    }
  };

  // Primero subimos un archivo con nombre único y luego vinculamos su ruta al perfil.
  // Si la base rechaza el nombre duplicado, retiramos el archivo nuevo cuando sea posible.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (guardando || cerrando || preparandoImagen || !usuarioId) return;
    const nuevoAlias = alias.trim();
    if (!nuevoAlias || nuevoAlias.length > 64) {
      setMensaje("Ingresá un nombre de usuario de entre 1 y 64 caracteres.");
      return;
    }
    setGuardando(true);
    setMensaje("");
    let nuevaRuta = null;
    try {
      if (imagenElegida) {
        nuevaRuta = `${usuarioId}/${crypto.randomUUID()}.${FORMATOS_AVATAR[imagenElegida.type]}`;
        const { error } = await supabase.storage
          .from("avatares")
          .upload(nuevaRuta, imagenElegida, {
            contentType: imagenElegida.type,
            upsert: false,
          });
        if (error) {
          setMensaje(
            error.statusCode === "403"
              ? "Supabase rechazó la foto (403). Revisá los permisos del bucket de avatares."
              : "No pudimos subir la foto. No se guardaron los cambios.",
          );
          return;
        }
      }
      const cambios = { username: nuevoAlias };
      if (nuevaRuta) cambios.avatar_path = nuevaRuta;
      const { data, error } = await supabase
        .from("perfiles")
        .update(cambios)
        .eq("usuario_id", usuarioId)
        .select("username, avatar_path")
        .single();
      if (error || !data) {
        // Solo una violación de unicidad confirma que la base rechazó el cambio.
        // Un error de red puede llegar después de que la base haya guardado la ruta:
        // en ese caso conservar el archivo evita que el perfil apunte a algo borrado.
        if (error?.code === "23505") {
          if (nuevaRuta) {
            const { error: errorLimpieza } = await supabase.storage
              .from("avatares")
              .remove([nuevaRuta]);
            if (errorLimpieza) {
              setMensaje(
                "El nombre ya está en uso y no pudimos retirar la foto subida. Intentá más tarde.",
              );
              return;
            }
          }
          setMensaje("Ese nombre de usuario ya está en uso. Elegí otro.");
        } else {
          setMensaje(
            "No pudimos confirmar el guardado. Revisá tu perfil antes de intentar otra vez.",
          );
        }
        return;
      }
      setAlias(data.username);
      setAliasGuardado(data.username);
      setRutaAvatar(data.avatar_path);
      setImagenElegida(null);
      setMensaje("Cambios guardados.");
      // Solo el propietario puede eliminar; nunca borrar una ruta de otro usuario.
      if (
        nuevaRuta &&
        rutaAvatar &&
        rutaAvatar.startsWith(`${usuarioId}/`) &&
        rutaAvatar !== nuevaRuta
      ) {
        const { error: errorAnterior } = await supabase.storage
          .from("avatares")
          .remove([rutaAvatar]);
        if (errorAnterior) {
          setMensaje("El perfil se guardó, pero no pudimos retirar la foto anterior.");
        }
      }
    } catch {
      // Un fallo de red puede dejar incierto el resultado: no asegurar que se guardó.
      setMensaje(
        "No pudimos confirmar el guardado. Revisá tu perfil antes de intentar otra vez.",
      );
    } finally {
      setGuardando(false);
    }
  };

  // El alcance local cierra esta sesión sin terminar sesiones de otros dispositivos.
  const handleCerrarSesion = async () => {
    if (guardando || cerrando) return;
    setCerrando(true);
    setMensaje("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        setMensaje("No pudimos cerrar la sesión. Intentá nuevamente.");
        return;
      }
      navigate("/login", { replace: true });
    } catch {
      setMensaje(
        "No pudimos cerrar la sesión. Revisá tu conexión e intentá nuevamente.",
      );
    } finally {
      setCerrando(false);
    }
  };

  if (estado === "cargando") {
    return (
      <p role="status" className="mx-auto max-w-3xl p-6">
        Cargando tu perfil…
      </p>
    );
  }
  if (estado === "error") {
    return (
      <p role="alert" className="mx-auto max-w-3xl p-6">
        {mensaje}
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* El banner queda asociado al navegador; el avatar sí se guarda en Supabase. */}
      <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-surface shadow-sm">
        <div
          className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-brand-navy to-brand-teal sm:h-40"
        >
          {portadaPerfil && (
            <img
              src={portadaPerfil}
              alt="Portada del perfil"
              className="h-full w-full object-cover"
            />
          )}
          <label
            htmlFor="portada-upload"
            className="absolute right-3 top-3 flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-surface/90 px-3 py-2 text-xs font-semibold text-ink shadow focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-teal"
          >
            <ImageIcon size={14} aria-hidden="true" />
            {portadaPerfil ? "Cambiar portada" : "Agregar portada"}
            <input
              id="portada-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePortadaUpload}
              className="sr-only"
              disabled={guardando || cerrando || preparandoImagen}
            />
          </label>
          {portadaPerfil && (
            <button
              type="button"
              onClick={handleQuitarPortada}
              disabled={guardando || cerrando}
              className="absolute right-3 top-14 min-h-10 rounded-lg bg-surface/90 px-3 py-2 text-xs font-semibold text-ink shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:opacity-60"
            >
              Quitar portada
            </button>
          )}
        </div>
        <div className="px-6 pb-6 pt-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative -mt-14">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-brand-teal font-heading text-3xl font-bold text-white shadow-md">
                  {vistaPreviaAvatar || fotoPerfil ? (
                    <img
                      src={vistaPreviaAvatar || fotoPerfil}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    aliasGuardado.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="foto-upload"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-brand-teal text-white shadow has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-teal"
                  title="Cambiar foto de perfil"
                >
                  <Camera size={16} aria-hidden="true" />
                  <span className="sr-only">Cambiar foto de perfil</span>
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoUpload}
                    className="sr-only"
                    disabled={guardando || cerrando || preparandoImagen}
                  />
                </label>
              </div>
              <h1 className="font-heading text-2xl font-bold text-brand-navy">
                {aliasGuardado}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-brand-teal">
              <Shield size={14} aria-hidden="true" /> Cuenta activa
            </span>
          </div>
        </div>
      </div>

      {imagenElegida && (
        <div className="-mt-3 flex justify-end">
          <button
            type="submit"
            form="profile-form"
            disabled={guardando || cerrando || preparandoImagen}
            className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:opacity-60"
          >
            {preparandoImagen
              ? "Preparando foto…"
              : guardando
                ? "Guardando foto…"
                : "Guardar foto de perfil"}
          </button>
        </div>
      )}

      {/* Las secciones sin modelo conservan su lugar sin atribuir datos inventados. */}
      <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
          <Sparkles size={20} aria-hidden="true" /> Insignias y Logros
        </h2>
        <p className="mt-2 text-sm text-ink">
          Esta sección todavía no está disponible.
        </p>
      </div>
      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Palette size={20} aria-hidden="true" /> Color de Avatar
          </h2>
          <p className="mt-2 text-sm text-ink">
            La personalización del color todavía no está disponible.
          </p>
        </div>
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <User size={20} aria-hidden="true" /> Información y Presentación
          </h2>
          <label htmlFor="alias-input" className="mt-4 block text-sm font-medium text-ink">
            Alias o nombre público
          </label>
          <input
            id="alias-input"
            type="text"
            value={alias}
            maxLength={64}
            onChange={(event) => setAlias(event.target.value)}
            disabled={guardando || cerrando}
            className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />
          <p className="mt-4 text-sm text-ink">
            Biografía corta y meta principal: todavía no disponibles.
          </p>
        </div>
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Phone size={20} aria-hidden="true" /> Contacto de ayuda
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Guardá el teléfono de una persona de confianza para poder llamarla desde el botón de pánico. Queda solo en este navegador.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="contacto-ayuda" className="sr-only">Número de teléfono de ayuda</label>
            <input
              id="contacto-ayuda"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={contactoAyuda}
              onChange={(event) => setContactoAyuda(event.target.value)}
              placeholder="Ej.: +54 9 11 1234 5678"
              maxLength={30}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
            />
            <button
              type="button"
              onClick={handleGuardarContacto}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
            >
              <Save size={17} aria-hidden="true" /> Guardar contacto
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Eye size={20} aria-hidden="true" /> Privacidad en Comunidad
          </h2>
          <p className="mt-2 text-sm text-ink">
            La configuración de anonimato por defecto todavía no está disponible.
          </p>
        </div>
        {mensaje && (
          <p role="status" aria-live="polite" className="text-sm text-ink">
            {mensaje}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCerrarSesion}
            disabled={guardando || cerrando}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-60"
          >
            <LogOut size={18} aria-hidden="true" />
            {cerrando ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
          <button
            type="submit"
            disabled={guardando || cerrando}
            className="rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
};
