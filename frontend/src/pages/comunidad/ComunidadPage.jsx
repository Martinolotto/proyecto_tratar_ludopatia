/*
 * Pantalla de Comunidad (/comunidad) interactiva.
 * Incluye insignias chiquitas junto al nombre del usuario en publicaciones y comentarios.
 */
import { useState } from "react";
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
  Paperclip,
  Image as ImageIcon,
  Award,
  X,
  FileText,
} from "lucide-react";

const MOCK_POSTS = [
  {
    id: 1,
    autor: "Anónimo",
    esAnonimo: true,
    insignia: null,
    categoria: "Reflexiones",
    contenido:
      "Hoy cumplí dos semanas sin entrar a aplicaciones de apuestas. Al principio costaba bastante no mirar las alertas de partidos, pero haber bloqueado las apps me sirvió un montón.",
    archivoAdjunto: null,
    meGusta: 12,
    dioMeGusta: false,
    comentarios: [
      {
        id: 101,
        autor: "Lucas_04",
        insignia: "Escudo Activo",
        texto: "¡Totalmente de acuerdo! Bloquear las alertas es la clave.",
      },
    ],
    hace: "Hace 2 horas",
  },
  {
    id: 2,
    autor: "Lucas_04",
    esAnonimo: false,
    insignia: "Escudo Activo",
    categoria: "Experiencias",
    contenido:
      "Lo que más me ayudó fue hablarlo con un amigo cercano. Sacarse el peso de encima cambia todo.",
    archivoAdjunto: null,
    meGusta: 18,
    dioMeGusta: true,
    comentarios: [],
    hace: "Hace 5 horas",
  },
];

export const ComunidadPage = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [filtro, setFiltro] = useState("Todos");

  // Formulario de publicación
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("Reflexiones");
  const [publicarAnonimo, setPublicarAnonimo] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Adjuntos
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);

  // Comentarios
  const [postAbiertoId, setPostAbiertoId] = useState(null);
  const [nuevoComentarioTexto, setNuevoComentarioTexto] = useState("");

  const categorias = ["Todos", "Reflexiones", "Experiencias", "Apoyo"];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const esImagen = file.type.startsWith("image/");
    setArchivoAdjunto({
      nombre: file.name,
      url: esImagen ? URL.createObjectURL(file) : null,
      tipo: esImagen ? "imagen" : "documento",
    });
  };

  const handleCrearPost = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !archivoAdjunto) return;

    const nuevoPost = {
      id: Date.now(),
      autor: publicarAnonimo ? "Anónimo" : "Estudiante",
      esAnonimo: publicarAnonimo,
      insignia: publicarAnonimo ? null : "Escudo Activo",
      categoria: categoriaSeleccionada,
      contenido: nuevoMensaje,
      archivoAdjunto: archivoAdjunto,
      meGusta: 0,
      dioMeGusta: false,
      comentarios: [],
      hace: "Justo ahora",
    };

    setPosts([nuevoPost, ...posts]);
    setNuevoMensaje("");
    setArchivoAdjunto(null);
    setMostrarFormulario(false);
  };

  const handleToggleMeGusta = (id) => {
    setPosts(
      posts.map((post) => {
        if (post.id === id) {
          const yaDioLike = post.dioMeGusta;
          return {
            ...post,
            dioMeGusta: !yaDioLike,
            meGusta: yaDioLike ? post.meGusta - 1 : post.meGusta + 1,
          };
        }
        return post;
      }),
    );
  };

  const handleToggleSeccionComentarios = (id) => {
    if (postAbiertoId === id) {
      setPostAbiertoId(null);
    } else {
      setPostAbiertoId(id);
      setNuevoComentarioTexto("");
    }
  };

  const handleAgregarComentario = (e, postId) => {
    e.preventDefault();
    if (!nuevoComentarioTexto.trim()) return;

    const comentarioNuevo = {
      id: Date.now(),
      autor: "Estudiante",
      insignia: "Escudo Activo",
      texto: nuevoComentarioTexto.trim(),
    };

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comentarios: [...post.comentarios, comentarioNuevo],
          };
        }
        return post;
      }),
    );

    setNuevoComentarioTexto("");
  };

  const postsFiltrados =
    filtro === "Todos"
      ? posts
      : posts.filter((post) => post.categoria === filtro);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Encabezado */}
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
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} aria-hidden="true" />
          Nueva publicación
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <form
          onSubmit={handleCrearPost}
          className="rounded-xl border border-brand-navy/20 bg-surface p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold text-brand-navy">
            Compartir mensaje
          </h2>

          <textarea
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={4}
            className="mt-3 w-full rounded-lg border border-brand-navy/20 bg-canvas p-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />

          {archivoAdjunto && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-soft p-2.5 text-xs text-ink">
              <div className="flex items-center gap-2 overflow-hidden">
                {archivoAdjunto.tipo === "imagen" ? (
                  <ImageIcon size={16} className="text-brand-teal shrink-0" />
                ) : (
                  <FileText size={16} className="text-brand-teal shrink-0" />
                )}
                <span className="truncate">{archivoAdjunto.nombre}</span>
              </div>
              <button
                type="button"
                onClick={() => setArchivoAdjunto(null)}
                className="text-ink/60 hover:text-ink"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-ink/60" aria-hidden="true" />
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs font-medium text-ink"
                >
                  <option value="Reflexiones">Reflexiones</option>
                  <option value="Experiencias">Experiencias</option>
                  <option value="Apoyo">Apoyo</option>
                </select>
              </div>

              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-soft"
              >
                <Paperclip size={14} className="text-brand-teal" />
                Adjuntar foto/archivo
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

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
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-ink/70 hover:bg-surface-soft"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-4 py-2 text-xs font-medium text-white hover:opacity-90"
              >
                <Send size={14} aria-hidden="true" />
                Publicar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFiltro(cat)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              filtro === cat
                ? "bg-brand-teal text-white"
                : "bg-surface text-ink border border-brand-navy/10 hover:bg-surface-soft"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Publicaciones */}
      <div className="space-y-4">
        {postsFiltrados.map((post) => {
          const estaAbierto = postAbiertoId === post.id;

          return (
            <article
              key={post.id}
              className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft font-heading text-xs font-bold text-brand-teal">
                    {post.autor.charAt(0)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="block text-sm font-semibold text-ink">
                        {post.autor}
                      </span>

                      {/* Insignia chiquita al lado del nombre */}
                      {post.insignia && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold text-brand-teal">
                          <Award size={11} />
                          {post.insignia}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink/60">{post.hace}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft/60 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                  {post.categoria}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink">
                {post.contenido}
              </p>

              {post.archivoAdjunto && (
                <div className="mt-3">
                  {post.archivoAdjunto.tipo === "imagen" ? (
                    <img
                      src={post.archivoAdjunto.url}
                      alt="Adjunto"
                      className="max-h-60 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-brand-navy/10 bg-canvas p-3 text-xs text-ink">
                      <FileText size={18} className="text-brand-teal" />
                      <span>{post.archivoAdjunto.nombre}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-brand-navy/10 pt-3 text-xs text-ink/70">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleMeGusta(post.id)}
                    className={`flex items-center gap-1.5 rounded px-2 py-1 font-medium transition ${
                      post.dioMeGusta
                        ? "bg-brand-teal/10 text-brand-teal"
                        : "hover:bg-surface-soft text-ink/70"
                    }`}
                  >
                    <Heart
                      size={16}
                      className={
                        post.dioMeGusta ? "fill-brand-teal text-brand-teal" : ""
                      }
                    />
                    <span>{post.meGusta} Apoyos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSeccionComentarios(post.id)}
                    className="flex items-center gap-1.5 rounded px-2 py-1 font-medium hover:bg-surface-soft text-ink/70"
                  >
                    <MessageSquare size={16} />
                    <span>{post.comentarios.length} Comentarios</span>
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

              {/* Comentarios */}
              {estaAbierto && (
                <div className="mt-4 space-y-3 border-t border-brand-navy/10 pt-4">
                  {post.comentarios.length > 0 ? (
                    <div className="space-y-2">
                      {post.comentarios.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg bg-canvas p-3 text-xs text-ink"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-semibold text-brand-teal">
                              {c.autor}
                            </span>
                            {c.insignia && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-brand-teal bg-brand-teal/10 px-1.5 py-0.2 rounded-full">
                                <Award size={10} />
                                {c.insignia}
                              </span>
                            )}
                          </div>
                          <p>{c.texto}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-ink/60">
                      No hay comentarios aún.
                    </p>
                  )}

                  <form
                    onSubmit={(e) => handleAgregarComentario(e, post.id)}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={nuevoComentarioTexto}
                      onChange={(e) => setNuevoComentarioTexto(e.target.value)}
                      placeholder="Escribí un comentario..."
                      className="flex-1 rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs text-ink"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-medium text-white"
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
