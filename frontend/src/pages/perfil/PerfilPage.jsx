/*
 * Muestra y permite actualizar los datos reales de la cuenta en /perfil.
 * Supabase Auth identifica la sesión; perfiles y Storage conservan alias y avatar,
 * y perfil_preferencias guarda en PostgreSQL portada, colores, bio, meta e insignias.
 */
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Camera,
  Eye,
  Image as ImageIcon,
  LogOut,
  Palette,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const FORMATOS_IMAGEN = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAXIMO_IMAGEN = 2 * 1024 * 1024;
const MAX_BIO = 50;
const MAX_META = 50;
const CORTE_PREVIEW_TEXTO = 32;

const PORTADA_POR_DEFECTO = "#0f766e";
const COLOR_AVATAR_POR_DEFECTO = "#0d9488";

const COLORES_BASICOS = [
  { label: "Azul", valor: "#2563eb" },
  { label: "Verde", valor: "#16a34a" },
  { label: "Rojo", valor: "#dc2626" },
  { label: "Amarillo", valor: "#ca8a04" },
  { label: "Violeta", valor: "#7c3aed" },
  { label: "Gris", valor: "#475569" },
];

const CATALOGO_INSIGNIAS = [
  {
    id: "inicio_consciente",
    eje: "Inicio y claridad",
    titulo: "Decisión de cambio",
    requisito: "Activar tu cuenta en MODUS y dar el primer paso.",
  },
  {
    id: "registro_constante",
    eje: "Seguimiento y hábito",
    titulo: "Registro con propósito",
    requisito: "Completar al menos 3 registros de seguimiento o hábito.",
  },
  {
    id: "autocontrol_firme",
    eje: "Autocontrol y límites",
    titulo: "Pausa y límite",
    requisito: "Registrar al menos 5 hábitos, metas o pausas de control.",
  },
  {
    id: "red_de_apoyo",
    eje: "Comunidad y pares",
    titulo: "Acompañamiento mutuo",
    requisito:
      "Participar en Comunidad (publicar, comentar o apoyar) al menos 3 veces.",
  },
];

function esHexValido(valor) {
  return typeof valor === "string" && /^#[0-9a-fA-F]{6}$/.test(valor);
}

function esDataImagenValida(valor) {
  return (
    typeof valor === "string" &&
    /^data:image\/(jpeg|png|webp);base64,/.test(valor)
  );
}

function prefsPorDefecto() {
  return {
    portada: PORTADA_POR_DEFECTO,
    portadaImagen: "",
    colorAvatar: COLOR_AVATAR_POR_DEFECTO,
    biografia: "",
    metaPrincipal: "",
    anonimoPorDefecto: true,
    insigniasVisibles: ["inicio_consciente"],
    insigniaDestacada: "inicio_consciente",
  };
}

function normalizarPrefs(rawObj) {
  const base = prefsPorDefecto();
  if (!rawObj || typeof rawObj !== "object") return base;

  const visiblesFuente = Array.isArray(rawObj.insignias_visibles)
    ? rawObj.insignias_visibles
    : ["inicio_consciente"];

  const visiblesValidas = visiblesFuente.filter((id) =>
    CATALOGO_INSIGNIAS.some((item) => item.id === id),
  );

  const destacadaRaw = rawObj.insignia_destacada;
  const destacadaValida =
    typeof destacadaRaw === "string" &&
    CATALOGO_INSIGNIAS.some((item) => item.id === destacadaRaw)
      ? destacadaRaw
      : "inicio_consciente";

  return {
    portada: esHexValido(rawObj.portada_color)
      ? rawObj.portada_color
      : PORTADA_POR_DEFECTO,
    portadaImagen: esDataImagenValida(rawObj.portada_imagen)
      ? rawObj.portada_imagen
      : "",
    colorAvatar: esHexValido(rawObj.color_avatar)
      ? rawObj.color_avatar
      : COLOR_AVATAR_POR_DEFECTO,
    biografia:
      typeof rawObj.biografia === "string"
        ? rawObj.biografia.slice(0, MAX_BIO)
        : "",
    metaPrincipal:
      typeof rawObj.meta_principal === "string"
        ? rawObj.meta_principal.slice(0, MAX_META)
        : "",
    anonimoPorDefecto:
      typeof rawObj.anonimo_por_defecto === "boolean"
        ? rawObj.anonimo_por_defecto
        : true,
    insigniasVisibles: visiblesValidas,
    insigniaDestacada: destacadaValida,
  };
}

async function leerPrefsRemotas(usuarioId) {
  const { data, error } = await supabase
    .from("perfil_preferencias")
    .select(
      "portada_color, portada_imagen, color_avatar, biografia, meta_principal, anonimo_por_defecto, insignias_visibles, insignia_destacada",
    )
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (error || !data) return prefsPorDefecto();
  return normalizarPrefs(data);
}

async function calcularDesbloqueosUsuario(usuarioId) {
  const desbloqueadas = new Set(["inicio_consciente"]);
  if (!usuarioId) return desbloqueadas;

  const [participacionRes, medidasRes, pubsRes, comsRes, reacsRes] =
    await Promise.all([
      supabase
        .from("participacion_diaria")
        .select("fecha", { count: "exact", head: true })
        .eq("usuario_id", usuarioId),
      supabase
        .from("medidas_usuario")
        .select("medida_id", { count: "exact", head: true })
        .eq("usuario_id", usuarioId)
        .eq("realizada", true),
      supabase
        .from("publicaciones")
        .select("id", { count: "exact", head: true })
        .eq("perfil_visible_id", usuarioId)
        .is("eliminado_en", null),
      supabase
        .from("comentarios")
        .select("id", { count: "exact", head: true })
        .eq("perfil_visible_id", usuarioId)
        .is("eliminado_en", null),
      supabase
        .from("reacciones")
        .select("publicacion_id", { count: "exact", head: true })
        .eq("usuario_id", usuarioId),
    ]);

  const totalDias = participacionRes.error ? 0 : participacionRes.count || 0;
  const totalMedidas = medidasRes.error ? 0 : medidasRes.count || 0;
  const totalPubs = pubsRes.error ? 0 : pubsRes.count || 0;
  const totalComs = comsRes.error ? 0 : comsRes.count || 0;
  const totalReacs = reacsRes.error ? 0 : reacsRes.count || 0;

  const totalComunidad = totalPubs + totalComs + totalReacs;

  if (totalDias >= 3) desbloqueadas.add("registro_constante");
  if (totalMedidas >= 5 || totalDias + totalMedidas >= 5) {
    desbloqueadas.add("autocontrol_firme");
  }
  if (totalComunidad >= 3) desbloqueadas.add("red_de_apoyo");

  return desbloqueadas;
}

function archivoADataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(archivo);
  });
}

export const PerfilPage = () => {
  const navigate = useNavigate();
  const { refreshNavigationProfile } = useOutletContext();
  const [usuarioId, setUsuarioId] = useState(null);
  const [alias, setAlias] = useState("");
  const [aliasGuardado, setAliasGuardado] = useState("");
  const [rutaAvatar, setRutaAvatar] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [imagenElegida, setImagenElegida] = useState(null);
  const [quitarFotoPendiente, setQuitarFotoPendiente] = useState(false);

  const [portadaColor, setPortadaColor] = useState(PORTADA_POR_DEFECTO);
  const [portadaImagen, setPortadaImagen] = useState("");
  const [colorAvatar, setColorAvatar] = useState(COLOR_AVATAR_POR_DEFECTO);
  const [biografia, setBiografia] = useState("");
  const [metaPrincipal, setMetaPrincipal] = useState("");
  const [verMasBio, setVerMasBio] = useState(false);
  const [verMasMeta, setVerMasMeta] = useState(false);
  const [anonimoPorDefecto, setAnonimoPorDefecto] = useState(true);

  const [desbloqueadasIds, setDesbloqueadasIds] = useState([
    "inicio_consciente",
  ]);
  const [insigniasVisibles, setInsigniasVisibles] = useState([
    "inicio_consciente",
  ]);
  const [insigniaDestacada, setInsigniaDestacada] =
    useState("inicio_consciente");

  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cerrando, setCerrando] = useState(false);

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
        setMensaje(
          "No pudimos cargar tu perfil. Intentá nuevamente más tarde.",
        );
        setEstado("error");
        return;
      }

      const [prefs, setDesbloqueadas] = await Promise.all([
        leerPrefsRemotas(data.user.id),
        calcularDesbloqueosUsuario(data.user.id),
      ]);
      if (!vigente) return;

      const listaDesbloqueadas = Array.from(setDesbloqueadas);
      const visiblesFiltradas = prefs.insigniasVisibles.filter((id) =>
        setDesbloqueadas.has(id),
      );
      const destacadaValida = setDesbloqueadas.has(prefs.insigniaDestacada)
        ? prefs.insigniaDestacada
        : "inicio_consciente";

      setUsuarioId(data.user.id);
      setAlias(perfil.username);
      setAliasGuardado(perfil.username);
      setRutaAvatar(perfil.avatar_path);
      setPortadaColor(prefs.portada);
      setPortadaImagen(prefs.portadaImagen);
      setColorAvatar(prefs.colorAvatar);
      setBiografia(prefs.biografia);
      setMetaPrincipal(prefs.metaPrincipal);
      setAnonimoPorDefecto(prefs.anonimoPorDefecto);
      setDesbloqueadasIds(listaDesbloqueadas);
      setInsigniasVisibles(visiblesFiltradas);
      setInsigniaDestacada(destacadaValida);
      setEstado("listo");
    };
    cargarPerfil();
    return () => {
      vigente = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!rutaAvatar || quitarFotoPendiente) {
      return undefined;
    }
    let vigente = true;
    let direccionTemporal;
    const cargarAvatar = async () => {
      const { data, error } = await supabase.storage
        .from("avatares")
        .download(rutaAvatar);
      if (!vigente) return;
      if (error) {
        setFotoPerfil(null);
        setMensaje(
          "No pudimos cargar tu foto. Podés intentar nuevamente más tarde.",
        );
        return;
      }
      direccionTemporal = URL.createObjectURL(data);
      setFotoPerfil(direccionTemporal);
    };
    cargarAvatar();
    return () => {
      vigente = false;
      if (direccionTemporal) URL.revokeObjectURL(direccionTemporal);
    };
  }, [rutaAvatar, quitarFotoPendiente]);

  const handleFotoUpload = (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    if (!FORMATOS_IMAGEN[archivo.type] || archivo.size > MAXIMO_IMAGEN) {
      setImagenElegida(null);
      setMensaje("Elegí una imagen JPEG, PNG o WebP de hasta 2 MiB.");
      return;
    }
    setQuitarFotoPendiente(false);
    setImagenElegida(archivo);
    setMensaje("Foto seleccionada. Guardá los cambios para aplicarla.");
  };

  const handleQuitarFoto = () => {
    setImagenElegida(null);
    setFotoPerfil(null);
    setQuitarFotoPendiente(true);
    setMensaje(
      "Se quitará la foto de perfil al guardar cambios y volverá al avatar por defecto.",
    );
  };

  const handlePortadaImagenUpload = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    if (!FORMATOS_IMAGEN[archivo.type] || archivo.size > MAXIMO_IMAGEN) {
      setMensaje(
        "Elegí una imagen de portada JPEG, PNG o WebP de hasta 2 MiB.",
      );
      return;
    }
    try {
      const dataUrl = await archivoADataUrl(archivo);
      setPortadaImagen(dataUrl);
      setMensaje(
        "Imagen de portada cargada. Guardá los cambios para conservarla.",
      );
    } catch {
      setMensaje("No pudimos cargar la imagen de portada.");
    }
  };

  const handleQuitarPortada = () => {
    setPortadaImagen("");
    setPortadaColor(PORTADA_POR_DEFECTO);
    setMensaje("Portada restablecida a la opción por defecto.");
  };

  const handleAlternarVisible = (insigniaId) => {
    if (!desbloqueadasIds.includes(insigniaId)) return;
    setInsigniasVisibles((prev) =>
      prev.includes(insigniaId)
        ? prev.filter((id) => id !== insigniaId)
        : [...prev, insigniaId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (guardando || cerrando || !usuarioId) return;
    const nuevoAlias = alias.trim();
    if (!nuevoAlias || nuevoAlias.length > 64) {
      setMensaje("Ingresá un nombre de usuario de entre 1 y 64 caracteres.");
      return;
    }
    const bioLimpia = biografia.trim().slice(0, MAX_BIO);
    const metaLimpia = metaPrincipal.trim().slice(0, MAX_META);

    setGuardando(true);
    setMensaje("");
    let nuevaRuta = null;
    try {
      if (imagenElegida) {
        nuevaRuta = `${usuarioId}/${crypto.randomUUID()}.${FORMATOS_IMAGEN[imagenElegida.type]}`;
        const { error } = await supabase.storage
          .from("avatares")
          .upload(nuevaRuta, imagenElegida, {
            contentType: imagenElegida.type,
            upsert: false,
          });
        if (error) {
          setMensaje("No pudimos subir la foto. No se guardaron los cambios.");
          return;
        }
      }

      const cambios = { username: nuevoAlias };
      if (nuevaRuta) {
        cambios.avatar_path = nuevaRuta;
      } else if (quitarFotoPendiente) {
        cambios.avatar_path = null;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .update(cambios)
        .eq("usuario_id", usuarioId)
        .select("username, avatar_path")
        .single();

      if (error || !data) {
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

      const { error: errorPrefs } = await supabase
        .from("perfil_preferencias")
        .upsert(
          {
            usuario_id: usuarioId,
            portada_color: portadaColor,
            portada_imagen: portadaImagen,
            color_avatar: colorAvatar,
            biografia: bioLimpia,
            meta_principal: metaLimpia,
            anonimo_por_defecto: anonimoPorDefecto,
            insignias_visibles: insigniasVisibles,
            insignia_destacada: insigniaDestacada,
            actualizado_en: new Date().toISOString(),
          },
          { onConflict: "usuario_id" },
        );

      if (errorPrefs) {
        setMensaje(
          "No pudimos guardar las preferencias en la base de datos. Intentá de nuevo.",
        );
        return;
      }

      const rutaAnterior = rutaAvatar;
      setAlias(data.username);
      setAliasGuardado(data.username);
      setBiografia(bioLimpia);
      setMetaPrincipal(metaLimpia);
      setRutaAvatar(data.avatar_path);
      setImagenElegida(null);
      setQuitarFotoPendiente(false);
      setMensaje("Cambios guardados en la base de datos.");
      refreshNavigationProfile();

      if (
        rutaAnterior &&
        rutaAnterior.startsWith(`${usuarioId}/`) &&
        rutaAnterior !== data.avatar_path
      ) {
        const { error: errorAnterior } = await supabase.storage
          .from("avatares")
          .remove([rutaAnterior]);
        if (errorAnterior) {
          setMensaje(
            "El perfil se guardó, pero no pudimos retirar la foto anterior.",
          );
        }
      }
    } catch {
      setMensaje(
        "No pudimos confirmar el guardado. Revisá tu perfil antes de intentar otra vez.",
      );
    } finally {
      setGuardando(false);
    }
  };

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

  const tieneFotoActiva = Boolean(fotoPerfil) || Boolean(imagenElegida);
  const previsualizacionFoto = imagenElegida
    ? URL.createObjectURL(imagenElegida)
    : fotoPerfil;

  const visiblesActivas = CATALOGO_INSIGNIAS.filter(
    (item) =>
      desbloqueadasIds.includes(item.id) && insigniasVisibles.includes(item.id),
  );
  const insigniaPrincipal =
    visiblesActivas.find((item) => item.id === insigniaDestacada) ||
    visiblesActivas[0] ||
    null;
  const cantidadExtraInsignias = Math.max(0, visiblesActivas.length - 1);

  const tienePortadaPersonalizada =
    Boolean(portadaImagen) || portadaColor !== PORTADA_POR_DEFECTO;

  const bioEsLarga = biografia.length > CORTE_PREVIEW_TEXTO;
  const bioMostrada =
    bioEsLarga && !verMasBio
      ? `${biografia.slice(0, CORTE_PREVIEW_TEXTO)}…`
      : biografia;

  const metaEsLarga = metaPrincipal.length > CORTE_PREVIEW_TEXTO;
  const metaMostrada =
    metaEsLarga && !verMasMeta
      ? `${metaPrincipal.slice(0, CORTE_PREVIEW_TEXTO)}…`
      : metaPrincipal;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-brand-navy/10 bg-surface shadow-sm">
          <div
            className="relative h-40 w-full bg-cover bg-center"
            style={{
              backgroundColor: portadaColor,
              backgroundImage: portadaImagen
                ? `url("${portadaImagen}")`
                : undefined,
            }}
          >
            <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-surface/90 p-1.5 text-xs font-medium text-ink shadow-sm">
              <ImageIcon size={14} aria-hidden="true" />
              <label
                htmlFor="portada-imagen-upload"
                className="cursor-pointer rounded bg-canvas px-2 py-1 text-xs text-ink hover:bg-surface-soft"
              >
                Subir imagen
                <input
                  id="portada-imagen-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePortadaImagenUpload}
                  className="sr-only"
                  disabled={guardando || cerrando}
                />
              </label>

              <label
                htmlFor="portada-color-picker"
                className="inline-flex cursor-pointer items-center gap-1 rounded bg-canvas px-2 py-1 text-xs text-ink"
              >
                <span>Color</span>
                <input
                  id="portada-color-picker"
                  type="color"
                  value={portadaColor}
                  onChange={(e) => setPortadaColor(e.target.value)}
                  className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>

              {tienePortadaPersonalizada && (
                <button
                  type="button"
                  onClick={handleQuitarPortada}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 transition hover:bg-surface-soft"
                  title="Quitar portada y volver a la opción por defecto"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Quitar portada
                </button>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 pt-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="relative -mt-14 shrink-0">
                  <div
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface font-heading text-3xl font-bold text-white shadow-md"
                    style={{ backgroundColor: colorAvatar }}
                  >
                    {previsualizacionFoto ? (
                      <img
                        src={previsualizacionFoto}
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
                      disabled={guardando || cerrando}
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-heading text-2xl font-bold text-brand-navy">
                      {aliasGuardado}
                    </h1>
                    {insigniaPrincipal && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-teal/15 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                        <span>{insigniaPrincipal.titulo}</span>
                        {cantidadExtraInsignias > 0 && (
                          <span className="rounded-full bg-brand-teal px-1.5 py-0.2 text-[10px] font-semibold text-white">
                            +{cantidadExtraInsignias}
                          </span>
                        )}
                      </span>
                    )}
                    {tieneFotoActiva && (
                      <button
                        type="button"
                        onClick={handleQuitarFoto}
                        disabled={guardando || cerrando}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-navy/15 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-surface-soft disabled:opacity-50"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        Quitar foto
                      </button>
                    )}
                  </div>

                  {biografia && (
                    <div className="mt-1 max-w-full break-words text-xs text-ink/70">
                      <span>{bioMostrada}</span>
                      {bioEsLarga && (
                        <button
                          type="button"
                          onClick={() => setVerMasBio((prev) => !prev)}
                          className="ml-1.5 font-medium text-brand-teal hover:underline"
                        >
                          {verMasBio ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                  )}

                  {metaPrincipal && (
                    <div className="mt-1 max-w-full break-words text-[11px] font-medium text-brand-teal">
                      <span>Meta: {metaMostrada}</span>
                      {metaEsLarga && (
                        <button
                          type="button"
                          onClick={() => setVerMasMeta((prev) => !prev)}
                          className="ml-1.5 font-semibold underline-offset-2 hover:underline"
                        >
                          {verMasMeta ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-brand-teal">
                <Shield size={14} aria-hidden="true" /> Cuenta activa
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
              <Sparkles size={20} aria-hidden="true" /> Logros e Insignias por
              Eje
            </h2>
            <span className="text-xs text-ink/70">
              Desbloqueados: {desbloqueadasIds.length} de{" "}
              {CATALOGO_INSIGNIAS.length}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CATALOGO_INSIGNIAS.map((ins) => {
              const desbloqueada = desbloqueadasIds.includes(ins.id);
              const visible =
                desbloqueada && insigniasVisibles.includes(ins.id);
              const esDestacada = desbloqueada && insigniaDestacada === ins.id;

              return (
                <div
                  key={ins.id}
                  className={`rounded-lg border p-3.5 ${
                    desbloqueada
                      ? "border-brand-navy/15 bg-canvas"
                      : "border-brand-navy/10 bg-surface-soft/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-brand-teal">
                      {ins.eje}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        desbloqueada
                          ? "bg-brand-teal/15 text-brand-teal"
                          : "bg-surface text-ink/60"
                      }`}
                    >
                      {desbloqueada ? "Desbloqueado" : "Bloqueado"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold text-brand-navy">
                    {ins.titulo}
                  </p>
                  <p className="mt-1 text-xs text-ink/70">{ins.requisito}</p>

                  {desbloqueada && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAlternarVisible(ins.id)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                          visible
                            ? "bg-brand-navy text-white"
                            : "border border-brand-navy/15 bg-surface text-ink/80"
                        }`}
                      >
                        {visible ? "Mostrar" : "No mostrar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInsigniaDestacada(ins.id);
                          if (!insigniasVisibles.includes(ins.id)) {
                            setInsigniasVisibles((prev) => [...prev, ins.id]);
                          }
                        }}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                          esDestacada
                            ? "bg-brand-teal text-white"
                            : "border border-brand-navy/15 bg-surface text-ink/80"
                        }`}
                      >
                        {esDestacada
                          ? "Activa en perfil y comunidad"
                          : "Elegir para comunidad"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Palette size={20} aria-hidden="true" /> Color de Avatar
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {COLORES_BASICOS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setColorAvatar(c.valor)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  colorAvatar.toLowerCase() === c.valor.toLowerCase()
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-navy/15 bg-canvas text-ink"
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: c.valor }}
                />
                {c.label}
              </button>
            ))}

            <label
              htmlFor="avatar-color-picker"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-navy/15 bg-canvas px-3 py-1.5 text-xs font-medium text-ink"
            >
              <span>Color personalizado</span>
              <input
                id="avatar-color-picker"
                type="color"
                value={colorAvatar}
                onChange={(e) => setColorAvatar(e.target.value)}
                className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <User size={20} aria-hidden="true" /> Información y Presentación
          </h2>

          <label
            htmlFor="alias-input"
            className="mt-4 block text-sm font-medium text-ink"
          >
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

          <div className="mt-4 flex items-center justify-between">
            <label
              htmlFor="biografia-input"
              className="block text-sm font-medium text-ink"
            >
              Descripción corta
            </label>
            <span className="text-xs text-ink/60">
              {biografia.length}/{MAX_BIO}
            </span>
          </div>
          <input
            id="biografia-input"
            type="text"
            value={biografia}
            maxLength={MAX_BIO}
            placeholder="Contá algo breve sobre vos..."
            onChange={(event) =>
              setBiografia(event.target.value.slice(0, MAX_BIO))
            }
            disabled={guardando || cerrando}
            className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />

          <div className="mt-4 flex items-center justify-between">
            <label
              htmlFor="meta-input"
              className="block text-sm font-medium text-ink"
            >
              Meta principal
            </label>
            <span className="text-xs text-ink/60">
              {metaPrincipal.length}/{MAX_META}
            </span>
          </div>
          <input
            id="meta-input"
            type="text"
            value={metaPrincipal}
            maxLength={MAX_META}
            placeholder="Ej.: Mantener el control de mi tiempo"
            onChange={(event) =>
              setMetaPrincipal(event.target.value.slice(0, MAX_META))
            }
            disabled={guardando || cerrando}
            className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />
        </div>

        <div className="rounded-xl border border-brand-navy/10 bg-surface p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-navy">
            <Eye size={20} aria-hidden="true" /> Privacidad en Comunidad
          </h2>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-ink/80">
              Publicar y comentar en modo anónimo por defecto
            </p>
            <button
              type="button"
              onClick={() => setAnonimoPorDefecto(!anonimoPorDefecto)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                anonimoPorDefecto
                  ? "bg-brand-navy text-white"
                  : "bg-surface-soft text-ink"
              }`}
            >
              {anonimoPorDefecto ? "Activado (Anónimo)" : "Desactivado (Alias)"}
            </button>
          </div>
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
