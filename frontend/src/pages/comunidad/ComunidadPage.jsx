/*
 * Pantalla de Comunidad (/comunidad), renderizada dentro de AppLayout.
 * Eje 3: Espacio de apoyo entre pares, publicaciones e intercambio anónimo o con alias.
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
} from "lucide-react";

// Publicaciones iniciales para maquetar la interfaz de la comunidad
const MOCK_POSTS = [
  {
    id: 1,
    autor: "Anónimo",
    esAnonimo: true,
    categoria: "Reflexiones",
    contenido:
      "Hoy cumplí dos semanas sin entrar a aplicaciones de apuestas. Al principio costaba bastante no mirar las alertas de partidos, pero haber bloqueado las apps me sirvió un montón.",
    meGusta: 12,
    comentarios: 4,
    hace: "Hace 2 horas",
  },
  {
    id: 2,
    autor: "Lucas_04",
    esAnonimo: false,
    categoria: "Experiencias",
    contenido:
      "Lo que más me ayudó fue hablarlo con un amigo cercano. Es difícil dar el primer paso por vergüenza, pero sacarse el peso de encima cambia todo.",
    meGusta: 18,
    comentarios: 7,
    hace: "Hace 5 horas",
  },
  {
    id: 3,
    autor: "Anónimo",
    esAnonimo: true,
    categoria: "Apoyo",
    contenido:
      "¿Alguien probó las herramientas del Escudo Digital de la app? Me gustaría saber qué medidas les sirvieron más para evitar la tentación en horarios de la noche.",
    meGusta: 8,
    comentarios: 3,
    hace: "Hace 1 día",
  },
];

export const ComunidadPage = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [filtro, setFiltro] = useState("Todos");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("Reflexiones");
  const [publicarAnonimo, setPublicarAnonimo] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const categorias = ["Todos", "Reflexiones", "Experiencias", "Apoyo"];

  const handleCrearPost = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const nuevoPost = {
      id: Date.now(),
      autor: publicarAnonimo ? "Anónimo" : "Estudiante",
      esAnonimo: publicarAnonimo,
      categoria: categoriaSeleccionada,
      contenido: nuevoMensaje,
      meGusta: 0,
      comentarios: 0,
      hace: "Justo ahora",
    };

    setPosts([nuevoPost, ...posts]);
    setNuevoMensaje("");
    setMostrarFormulario(false);
  };

  const handleMeGusta = (id) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, meGusta: post.meGusta + 1 } : post,
      ),
    );
  };

  const postsFiltrados =
    filtro === "Todos"
      ? posts
      : posts.filter((post) => post.categoria === filtro);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Encabezado del eje de comunidad */}
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
            Espacio de intercambio respetuoso y apoyo entre pares. Podés
            participar con tu alias o de forma anónima.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          <Plus size={18} aria-hidden="true" />
          Nueva publicación
        </button>
      </div>

      {/* Formulario para publicar */}
      {mostrarFormulario && (
        <form
          onSubmit={handleCrearPost}
          className="rounded-xl border border-brand-navy/20 bg-surface p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold text-brand-navy">
            Compartir con la comunidad
          </h2>

          <textarea
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribí tu mensaje o reflexión..."
            rows={4}
            className="mt-3 w-full rounded-lg border border-brand-navy/20 bg-canvas p-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-ink/60" aria-hidden="true" />
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="rounded-lg border border-brand-navy/20 bg-canvas px-3 py-1.5 text-xs font-medium text-ink focus-visible:outline-2 focus-visible:outline-brand-teal"
                >
                  <option value="Reflexiones">Reflexiones</option>
                  <option value="Experiencias">Experiencias</option>
                  <option value="Apoyo">Apoyo</option>
                </select>
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
                {publicarAnonimo
                  ? "Publicar como Anónimo"
                  : "Publicar con alias"}
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-4 py-2 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand-teal"
              >
                <Send size={14} aria-hidden="true" />
                Publicar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filtros de categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFiltro(cat)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand-teal ${
              filtro === cat
                ? "bg-brand-teal text-white"
                : "bg-surface text-ink border border-brand-navy/10 hover:bg-surface-soft"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listado de publicaciones */}
      <div className="space-y-4">
        {postsFiltrados.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-navy/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft font-heading text-xs font-bold text-brand-teal">
                  {post.autor.charAt(0)}
                </span>
                <div>
                  <span className="block text-sm font-semibold text-ink">
                    {post.autor}
                  </span>
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

            <div className="mt-4 flex items-center justify-between border-t border-brand-navy/10 pt-3 text-xs text-ink/70">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleMeGusta(post.id)}
                  className="flex items-center gap-1.5 rounded px-1 transition hover:text-brand-teal focus-visible:outline-2 focus-visible:outline-brand-teal"
                >
                  <Heart size={16} aria-hidden="true" />
                  <span>{post.meGusta} Apoyos</span>
                </button>

                <span className="flex items-center gap-1.5">
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>{post.comentarios} comentarios</span>
                </span>
              </div>

              {post.esAnonimo && (
                <span
                  className="flex items-center gap-1 text-ink/50"
                  title="Publicación anónima"
                >
                  <Shield size={14} aria-hidden="true" />
                  Anónimo
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
