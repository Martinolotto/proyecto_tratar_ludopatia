/*
 * Pantalla de Comunidad (/comunidad) conectada a Supabase.
 * Gestiona publicaciones generales, filtros por etiqueta, apoyos, comentarios
 * (incluidas respuestas y retiro ocultando los retirados), retirada de publicaciones propias e insignias.
 */
import { useCallback, useEffect, useState } from "react";
import {
  UsersRound,
  MessageSquare,
  Heart,
  Shield,
  Eye,
  Plus,
  Send,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
  CornerUpLeft,
  Sparkles,
  Check,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import {
  alternarApoyoPublicacion,
  cargarFeedComunidad,
  crearComentarioComunidad,
  crearPublicacionComunidad,
  obtenerEtiquetasComunidad,
  retirarComentarioComunidad,
  retirarPublicacionComunidad,
} from "./comunidadDatos.js";

const TITULOS_INSIGNIAS = {
  inicio_consciente: "Decisión de cambio",
  registro_constante: "Registro con propósito",
  autocontrol_firme: "Pausa y límite",
  red_de_apoyo: "Acompañamiento mutuo",
};

export const ComunidadPage = () => {
  const [etiquetas, setEtiquetas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [sinSesion, setSinSesion] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [aliasUsuarioActual, setAliasUsuarioActual] = useState("");
  const [insigniaPrincipal, setInsigniaPrincipal] = useState("");
  const [cantidadExtraInsignias, setCantidadExtraInsignias] = useState(0);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("");
  const [menuEtiquetaAbierto, setMenuEtiquetaAbierto] = useState(false);
  const [publicarAnonimo, setPublicarAnonimo] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviandoPost, setEnviandoPost] = useState(false);

  const [postAbiertoId, setPostAbiertoId] = useState(null);
  const [respuestaAId, setRespuestaAId] = useState(null);
  const [nuevoComentarioTexto, setNuevoComentarioTexto] = useState("");
  const [comentarioAnonimo, setComentarioAnonimo] = useState(true);
  const [enviandoComentarioId, setEnviandoComentarioId] = useState(null);

  useEffect(() => {
    let activo = true;
    const cargarPreferenciasUsuario = async () => {
      const { data } = await supabase.auth.getUser();
      if (!activo || !data?.user) return;

      const usuarioId = data.user.id;

      try {
        const prefsRaw = window.localStorage.getItem(
          `modus_perfil_prefs_${usuarioId}`,
        );
        if (prefsRaw) {
          const prefs = JSON.parse(prefsRaw);
          if (typeof prefs?.anonimoPorDefecto === "boolean") {
            setPublicarAnonimo(prefs.anonimoPorDefecto);
            setComentarioAnonimo(prefs.anonimoPorDefecto);
          }

          const visibles = Array.isArray(prefs?.insigniasVisibles)
            ? prefs.insigniasVisibles.filter((id) => TITULOS_INSIGNIAS[id])
            : [];
          const destacada = prefs?.insigniaDestacada;

          if (visibles.length > 0) {
            const principalId =
              destacada && visibles.includes(destacada)
                ? destacada
                : visibles[0];
            setInsigniaPrincipal(TITULOS_INSIGNIAS[principalId] || "");
            setCantidadExtraInsignias(Math.max(0, visibles.length - 1));
          } else {
            setInsigniaPrincipal("");
            setCantidadExtraInsignias(0);
          }
        }
      } catch {
        // Ignoramos errores de lectura de storage
      }

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("username")
        .eq("usuario_id", usuarioId)
        .maybeSingle();

      if (activo && perfil?.username) {
        setAliasUsuarioActual(perfil.username);
      }
    };

    cargarPreferenciasUsuario();
    return () => {
      activo = false;
    };
  }, []);

  const cargarTodo = useCallback(async (codigoFiltro = "") => {
    setCargando(true);
    setErrorMsg("");
    try {
      const [listaEtiquetas, feed] = await Promise.all([
        obtenerEtiquetasComunidad(),
        cargarFeedComunidad({ etiquetaCodigo: codigoFiltro }),
      ]);

      setEtiquetas(listaEtiquetas);
      setEtiquetaSeleccionada((prev) => {
        if (prev && listaEtiquetas.some((e) => e.codigo === prev)) return prev;
        return listaEtiquetas[0]?.codigo || "";
      });

      setSinSesion(!feed.autenticado);
      setPosts(feed.publicaciones);
    } catch {
      setErrorMsg(
        "No pudimos cargar la comunidad. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerEtiquetasComunidad(),
      cargarFeedComunidad({ etiquetaCodigo: filtroCodigo }),
    ])
      .then(([listaEtiquetas, feed]) => {
        if (!activo) return;
        setEtiquetas(listaEtiquetas);
        setEtiquetaSeleccionada((prev) => {
          if (prev && listaEtiquetas.some((e) => e.codigo === prev))
            return prev;
          return listaEtiquetas[0]?.codigo || "";
        });
        setSinSesion(!feed.autenticado);
        setPosts(feed.publicaciones);
        setErrorMsg("");
      })
      .catch(() => {
        if (!activo) return;
        setErrorMsg(
          "No pudimos cargar la comunidad. Revisá tu conexión e intentá de nuevo.",
        );
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [filtroCodigo]);

  const handleCrearPost = async (e) => {
    e.preventDefault();
    if (enviandoPost) return;

    const tituloLimpio = nuevoTitulo.trim();
    const contenidoLimpio = nuevoMensaje.trim();
    if (!tituloLimpio || !contenidoLimpio) {
      setErrorMsg("Completá el título y el mensaje antes de publicar.");
      return;
    }
    if (!etiquetaSeleccionada) {
      setErrorMsg("Seleccioná una etiqueta para publicar en Comunidad.");
      return;
    }

    setEnviandoPost(true);
    setErrorMsg("");
    try {
      await crearPublicacionComunidad({
        etiquetaCodigo: etiquetaSeleccionada,
        titulo: tituloLimpio,
        contenido: contenidoLimpio,
        anonimo: publicarAnonimo,
      });

      setNuevoTitulo("");
      setNuevoMensaje("");
      setMenuEtiquetaAbierto(false);
      setMostrarFormulario(false);
      await cargarTodo(filtroCodigo);
    } catch {
      setErrorMsg("No pudimos publicar el mensaje. Intentá nuevamente.");
    } finally {
      setEnviandoPost(false);
    }
  };

  const handleToggleMeGusta = async (post) => {
    setErrorMsg("");
    try {
      await alternarApoyoPublicacion({
        publicacionId: post.id,
        dioApoyo: post.dioMeGusta,
      });

      setPosts((prev) =>
        prev.map((item) => {
          if (item.id !== post.id) return item;
          const yaDioLike = item.dioMeGusta;
          return {
            ...item,
            dioMeGusta: !yaDioLike,
            meGusta: yaDioLike
              ? Math.max(0, item.meGusta - 1)
              : item.meGusta + 1,
          };
        }),
      );
    } catch {
      setErrorMsg("No pudimos actualizar tu apoyo. Intentá de nuevo.");
    }
  };

  const handleToggleSeccionComentarios = (id) => {
    if (postAbiertoId === id) {
      setPostAbiertoId(null);
      setRespuestaAId(null);
    } else {
      setPostAbiertoId(id);
      setRespuestaAId(null);
      setNuevoComentarioTexto("");
    }
  };

  const handleAgregarComentario = async (e, postId) => {
    e.preventDefault();
    if (enviandoComentarioId === postId) return;
    const textoLimpio = nuevoComentarioTexto.trim();
    if (!textoLimpio) return;

    setEnviandoComentarioId(postId);
    setErrorMsg("");
    try {
      await crearComentarioComunidad({
        publicacionId: postId,
        respuestaAId,
        contenido: textoLimpio,
        anonimo: comentarioAnonimo,
      });
      setNuevoComentarioTexto("");
      setRespuestaAId(null);
      await cargarTodo(filtroCodigo);
    } catch {
      setErrorMsg("No pudimos guardar tu comentario. Intentá nuevamente.");
    } finally {
      setEnviandoComentarioId(null);
    }
  };

  const handleRetirarComentario = async (comentarioId) => {
    setErrorMsg("");
    try {
      await retirarComentarioComunidad(comentarioId);
      if (respuestaAId === comentarioId) setRespuestaAId(null);
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          comentarios: post.comentarios.filter((c) => c.id !== comentarioId),
        })),
      );
    } catch {
      setErrorMsg("No pudimos retirar este comentario.");
    }
  };

  const handleRetirarPost = async (postId) => {
    setErrorMsg("");
    try {
      await retirarPublicacionComunidad(postId);
      setPosts((prev) => prev.filter((item) => item.id !== postId));
      if (postAbiertoId === postId) {
        setPostAbiertoId(null);
        setRespuestaAId(null);
      }
    } catch {
      setErrorMsg("No pudimos retirar esta publicación.");
    }
  };

  const nombreEtiquetaPorCodigo = new Map(
    etiquetas.map((et) => [et.codigo, et.nombre]),
  );
  const etiquetaActualNombre =
    nombreEtiquetaPorCodigo.get(etiquetaSeleccionada) || "Seleccionar etiqueta";

  const renderInsigniaChip = (esMini = false) => {
    if (!insigniaPrincipal) return null;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-brand-teal/15 font-medium text-brand-teal ${
          esMini ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
        }`}
      >
        <Sparkles size={esMini ? 9 : 11} aria-hidden="true" />
        <span>{insigniaPrincipal}</span>
        {cantidadExtraInsignias > 0 && (
          <span
            className={`rounded-full bg-brand-teal font-semibold text-white ${
              esMini ? "px-1 text-[9px]" : "px-1.5 py-0.2 text-[10px]"
            }`}
          >
            +{cantidadExtraInsignias}
          </span>
        )}
      </span>
    );
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-brand-navy/10 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-brand-navy">
            <UsersRound
              className="text-brand-teal"
              size={28}
              aria-hidden="true"
            />
            Comunidad MODUS
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            Espacio de intercambio respetuoso y apoyo entre pares.
          </p>
        </div>

        <button
          type="button"
          disabled={sinSesion}
          onClick={() => {
            if (etiquetas.length === 0) {
              setErrorMsg(
                "No hay etiquetas disponibles en la base para crear una publicación.",
              );
              return;
            }
            setErrorMsg("");
            setMenuEtiquetaAbierto(false);
            setMostrarFormulario((prev) => !prev);
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={18} aria-hidden="true" />
          Nueva publicación
        </button>
      </div>

      {errorMsg && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorMsg}
        </p>
      )}

      {mostrarFormulario && !sinSesion && (
        <form
          onSubmit={handleCrearPost}
          className="rounded-xl border border-brand-navy/20 bg-surface p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold text-brand-navy">
            Compartir mensaje
          </h2>

          <label
            htmlFor="post-titulo"
            className="mt-3 block text-xs font-medium text-ink/80"
          >
            Título
          </label>
          <input
            id="post-titulo"
            type="text"
            value={nuevoTitulo}
            onChange={(e) => setNuevoTitulo(e.target.value)}
            placeholder="Escribí un título breve..."
            className="mt-1 w-full rounded-lg border border-brand-navy/20 bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />

          <label
            htmlFor="post-contenido"
            className="mt-3 block text-xs font-medium text-ink/80"
          >
            Mensaje
          </label>
          <textarea
            id="post-contenido"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={4}
            maxLength={1200}
            className="mt-1 max-h-48 min-h-24 w-full resize-none rounded-lg border border-brand-navy/20 bg-canvas p-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center gap-2">
                <Tag size={16} className="text-ink/60" aria-hidden="true" />
                <button
                  type="button"
                  aria-expanded={menuEtiquetaAbierto}
                  aria-label="Etiqueta de la publicación"
                  onClick={() => setMenuEtiquetaAbierto((prev) => !prev)}
                  className="inline-flex items-center justify-between gap-2 rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand-teal"
                >
                  <span>{etiquetaActualNombre}</span>
                  <ChevronDown size={14} className="text-ink/60" />
                </button>

                {menuEtiquetaAbierto && (
                  <div
                    role="listbox"
                    aria-label="Opciones de etiqueta"
                    className="absolute left-0 top-full z-20 mt-1.5 min-w-48 overflow-hidden rounded-xl border border-brand-navy/15 bg-surface py-1 shadow-lg"
                  >
                    {etiquetas.map((et) => {
                      const activa = et.codigo === etiquetaSeleccionada;
                      return (
                        <button
                          key={et.codigo}
                          type="button"
                          role="option"
                          aria-selected={activa}
                          onClick={() => {
                            setEtiquetaSeleccionada(et.codigo);
                            setMenuEtiquetaAbierto(false);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${
                            activa
                              ? "bg-brand-teal/15 font-semibold text-brand-teal"
                              : "text-ink hover:bg-surface-soft"
                          }`}
                        >
                          <span>{et.nombre}</span>
                          {activa && <Check size={13} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPublicarAnonimo(!publicarAnonimo)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                  publicarAnonimo
                    ? "bg-brand-navy text-white"
                    : "bg-surface-soft text-ink"
                }`}
              >
                <Eye size={14} aria-hidden="true" />
                {publicarAnonimo ? "Anónimo" : "Con alias"}
              </button>

              {!publicarAnonimo && renderInsigniaChip(false)}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={enviandoPost}
                onClick={() => {
                  setMenuEtiquetaAbierto(false);
                  setMostrarFormulario(false);
                }}
                className="rounded-lg px-3 py-2 text-xs font-medium text-ink/70 hover:bg-surface-soft"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviandoPost}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                <Send size={14} aria-hidden="true" />
                {enviandoPost ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        </form>
      )}

      {!sinSesion && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFiltroCodigo("")}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              filtroCodigo === ""
                ? "bg-brand-teal text-white"
                : "border border-brand-navy/10 bg-surface text-ink hover:bg-surface-soft"
            }`}
          >
            Todas
          </button>
          {etiquetas.map((et) => (
            <button
              key={et.codigo}
              type="button"
              onClick={() => setFiltroCodigo(et.codigo)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                filtroCodigo === et.codigo
                  ? "bg-brand-teal text-white"
                  : "border border-brand-navy/10 bg-surface text-ink hover:bg-surface-soft"
              }`}
            >
              {et.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {cargando && (
          <p
            role="status"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 text-sm text-ink/70"
          >
            Cargando publicaciones...
          </p>
        )}

        {!cargando && sinSesion && (
          <p className="rounded-xl border border-brand-navy/10 bg-surface p-5 text-sm text-ink/70">
            Iniciá sesión para ver y participar en Comunidad.
          </p>
        )}

        {!cargando && !sinSesion && posts.length === 0 && (
          <p className="rounded-xl border border-brand-navy/10 bg-surface p-5 text-sm text-ink/70">
            Todavía no hay publicaciones para mostrar.
          </p>
        )}

        {!cargando &&
          posts.map((post) => {
            const estaAbierto = postAbiertoId === post.id;
            const etiquetaTexto =
              nombreEtiquetaPorCodigo.get(post.etiquetaCodigo) ||
              post.etiquetaCodigo;
            const comentariosVisibles = post.comentarios.filter(
              (item) => !item.retirado,
            );
            const comentarioReferencia = comentariosVisibles.find(
              (item) => item.id === respuestaAId,
            );
            const mostrarInsigniaEnPost =
              !post.esAnonimo &&
              insigniaPrincipal &&
              aliasUsuarioActual &&
              post.autor === aliasUsuarioActual;

            return (
              <article
                key={post.id}
                className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft font-heading text-xs font-bold text-brand-teal">
                      {post.autor.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-ink">
                          {post.autor}
                        </span>
                        {mostrarInsigniaEnPost && renderInsigniaChip(false)}
                      </div>
                      {post.hace && (
                        <span className="block text-xs text-ink/60">
                          {post.hace}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {etiquetaTexto && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft/60 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                        {etiquetaTexto}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRetirarPost(post.id)}
                      title="Retirar publicación"
                      aria-label="Retirar publicación"
                      className="rounded p-1 text-ink/50 transition hover:bg-surface-soft hover:text-ink"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {post.titulo && (
                  <h2 className="mt-3 font-heading text-base font-semibold text-brand-navy">
                    {post.titulo}
                  </h2>
                )}

                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink">
                  {post.contenido}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-brand-navy/10 pt-3 text-xs text-ink/70">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleMeGusta(post)}
                      className={`flex items-center gap-1.5 rounded px-2 py-1 font-medium transition ${
                        post.dioMeGusta
                          ? "bg-brand-teal/10 text-brand-teal"
                          : "text-ink/70 hover:bg-surface-soft"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={
                          post.dioMeGusta
                            ? "fill-brand-teal text-brand-teal"
                            : ""
                        }
                      />
                      <span>{post.meGusta} Apoyos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSeccionComentarios(post.id)}
                      className="flex items-center gap-1.5 rounded px-2 py-1 font-medium text-ink/70 hover:bg-surface-soft"
                    >
                      <MessageSquare size={16} />
                      <span>{comentariosVisibles.length} Comentarios</span>
                      {estaAbierto ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </div>

                  {post.esAnonimo && (
                    <span className="flex items-center gap-1 text-ink/50">
                      <Shield size={14} />
                      Anónimo
                    </span>
                  )}
                </div>

                {estaAbierto && (
                  <div className="mt-4 space-y-3 border-t border-brand-navy/10 pt-4">
                    {comentariosVisibles.length > 0 ? (
                      <div className="space-y-2">
                        {comentariosVisibles.map((c) => {
                          const mostrarInsigniaEnComentario =
                            insigniaPrincipal &&
                            aliasUsuarioActual &&
                            c.autor === aliasUsuarioActual;

                          return (
                            <div
                              key={c.id}
                              className={`rounded-lg bg-canvas p-3 text-xs text-ink ${
                                c.respuestaAId
                                  ? "ml-4 border-l-2 border-brand-teal/40"
                                  : ""
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-brand-teal">
                                    {c.autor}
                                  </span>
                                  {mostrarInsigniaEnComentario &&
                                    renderInsigniaChip(true)}
                                  {c.respuestaAId && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-ink/50">
                                      <CornerUpLeft
                                        size={11}
                                        aria-hidden="true"
                                      />
                                      Respuesta
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {c.hace && (
                                    <span className="text-[11px] text-ink/50">
                                      {c.hace}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setRespuestaAId(c.id)}
                                    className="text-[11px] font-medium text-brand-teal hover:underline"
                                  >
                                    Responder
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRetirarComentario(c.id)
                                    }
                                    className="text-[11px] text-ink/50 hover:text-red-600"
                                  >
                                    Retirar
                                  </button>
                                </div>
                              </div>
                              <p>{c.texto}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs italic text-ink/60">
                        No hay comentarios aún.
                      </p>
                    )}

                    {comentarioReferencia && (
                      <div className="flex items-center justify-between rounded-lg bg-surface-soft/60 px-3 py-1.5 text-[11px] text-ink/80">
                        <span>
                          Respondiendo a{" "}
                          <strong>{comentarioReferencia.autor}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setRespuestaAId(null)}
                          className="font-medium text-brand-teal hover:underline"
                        >
                          Cancelar respuesta
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => handleAgregarComentario(e, post.id)}
                      className="flex flex-wrap items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={nuevoComentarioTexto}
                        onChange={(e) =>
                          setNuevoComentarioTexto(e.target.value)
                        }
                        placeholder={
                          comentarioReferencia
                            ? `Responder a ${comentarioReferencia.autor}...`
                            : "Escribí un comentario..."
                        }
                        className="min-w-48 flex-1 rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs text-ink"
                      />
                      <button
                        type="button"
                        onClick={() => setComentarioAnonimo(!comentarioAnonimo)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          comentarioAnonimo
                            ? "bg-brand-navy text-white"
                            : "bg-surface-soft text-ink"
                        }`}
                      >
                        {comentarioAnonimo ? "Anónimo" : "Con alias"}
                      </button>

                      {!comentarioAnonimo && renderInsigniaChip(true)}

                      <button
                        type="submit"
                        disabled={enviandoComentarioId === post.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      >
                        <Send size={12} />
                        Responder
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
};
