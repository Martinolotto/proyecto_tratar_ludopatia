import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ExternalLink,
  Play,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  categoriasPrevencion,
  contenidosPrevencion,
} from "./prevencionContenido.js";
import { formatosHistorias, historiasReales } from "./historiasReales.js";
import {
  categoriasVideosHistorias,
  videosHistoriasReales,
} from "./videosHistorias.js";
import { SpotsCarousel } from "./SpotsCarousel.jsx";
import "./PrevencionPage.css";

const normalizeText = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const isTikTokEmbed = (video) =>
  video.embedUrl?.includes("tiktok.com/player/");

export const PrevencionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchText, setSearchText] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedStoryFormat, setSelectedStoryFormat] = useState("todos");
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState("todos");
  const [loadedTikTokVideos, setLoadedTikTokVideos] = useState(() => new Set());
  const [tiktokReloadCounts, setTiktokReloadCounts] = useState({});
  const videoStoriesRef = useRef(null);
  const articleRef = useRef(null);
  const articleHeadingRef = useRef(null);
  const explorerRef = useRef(null);
  const storyDetailRef = useRef(null);
  const storyHeadingRef = useRef(null);
  const storyTriggerRef = useRef(null);

  const visibleStories =
    selectedStoryFormat === "todos"
      ? historiasReales
      : historiasReales.filter(
          (story) => story.format === selectedStoryFormat,
        );

  const visibleVideos =
    selectedVideoCategory === "todos"
      ? videosHistoriasReales
      : videosHistoriasReales.filter((video) =>
          video.categories.includes(selectedVideoCategory),
        );

  useEffect(() => {
    const mediaNodes = videoStoriesRef.current?.querySelectorAll(
      "[data-tiktok-video-id]",
    );
    if (!mediaNodes?.length) return undefined;

    if (!("IntersectionObserver" in window)) {
      const visibleMedia = [...mediaNodes].filter((node) => {
        const bounds = node.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      });

      if (visibleMedia.length) {
        setLoadedTikTokVideos((current) => {
          const next = new Set(current);
          visibleMedia.forEach((node) => next.add(node.dataset.tiktokVideoId));
          return next;
        });
      }

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target);

        if (!newlyVisible.length) return;

        setLoadedTikTokVideos((current) => {
          const next = new Set(current);
          newlyVisible.forEach((node) => next.add(node.dataset.tiktokVideoId));
          return next;
        });
        newlyVisible.forEach((node) => observer.unobserve(node));
      },
      { threshold: 0.01 },
    );

    mediaNodes.forEach((node) => {
      if (!loadedTikTokVideos.has(node.dataset.tiktokVideoId)) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [loadedTikTokVideos, selectedVideoCategory]);
  const visibleContents = useMemo(() => {
    const query = normalizeText(searchText.trim());

    return contenidosPrevencion.filter((content) => {
      const matchesCategory =
        selectedCategory === "todos" || content.category === selectedCategory;
      const searchableText = normalizeText(
        [
          content.title,
          content.summary,
          content.introduction,
          content.searchTerms,
          ...content.sections.flatMap((section) => [
            section.heading,
            section.text,
          ]),
        ].join(" "),
      );

      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [searchText, selectedCategory]);

  useEffect(() => {
    if (!selectedContent) return;

    articleHeadingRef.current?.focus({ preventScroll: true });
    articleRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, [selectedContent]);

  useEffect(() => {
    if (!selectedStory) return;

    storyHeadingRef.current?.focus({ preventScroll: true });
    storyDetailRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, [selectedStory]);

  const categoryLabel = (categoryId) =>
    categoriasPrevencion.find((category) => category.id === categoryId)?.label;

  const openContent = (content) => setSelectedContent(content);

  const openStory = (story) => {
    storyTriggerRef.current = document.activeElement;
    setSelectedStory(story);
  };

  const closeStory = () => {
    setSelectedStory(null);
    window.requestAnimationFrame(() => {
      storyTriggerRef.current?.focus({ preventScroll: true });
    });
  };

  const closeContent = () => {
    setSelectedContent(null);
    window.requestAnimationFrame(() => {
      explorerRef.current?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="prevention-page">
      <section className="prevention-hero" aria-labelledby="prevention-title">
        <div className="prevention-hero__copy">
          <p className="prevention-eyebrow">Eje 01 · Prevención</p>
          <h1 id="prevention-title">Información para mirar con otra perspectiva.</h1>
          <p className="prevention-hero__description">
            Un espacio para entender cómo funcionan las apuestas online, qué
            ideas pueden aparecer alrededor y qué impactos podrían tener.
            Explorá a tu ritmo, sin juicios ni evaluaciones.
          </p>
        </div>

        <div className="prevention-hero__visual" aria-hidden="true">
          <div className="prevention-orbit">
            <span className="prevention-orbit__center">MODUS</span>
            <span className="prevention-orbit__label prevention-orbit__label--top">
              Mirar
            </span>
            <span className="prevention-orbit__label prevention-orbit__label--right">
              Entender
            </span>
            <span className="prevention-orbit__label prevention-orbit__label--left">
              Preguntar
            </span>
          </div>
        </div>
      </section>

      <nav className="prevention-section-links" aria-label="Ir a una sección">
        <a href="#prevention-spots">Spots</a>
        <a href="#prevention-explorer-title">Explorar temas</a>
        <a href="#prevention-stories-title">Historias reales</a>
      </nav>

      <section
        id="prevention-spots"
        className="prevention-section prevention-spots"
        aria-label="Campañas audiovisuales de prevención"
      >
        <SpotsCarousel />
        <div className="prevention-spots__filters">
          <p className="prevention-spots__filters-label">
            Filtrar testimonios por tema
          </p>
          <div
            className="prevention-video-filters"
            role="group"
            aria-label="Filtrar testimonios de video por tema"
          >
            <button
              type="button"
              className="prevention-filter"
              aria-pressed={selectedVideoCategory === "todos"}
              onClick={() => setSelectedVideoCategory("todos")}
            >
              Todas las experiencias
            </button>
            {categoriasVideosHistorias.map((category) => (
              <button
                key={category}
                type="button"
                className="prevention-filter"
                aria-pressed={selectedVideoCategory === category}
                onClick={() => setSelectedVideoCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        id="prevention-learning"
        className="prevention-section"
        aria-labelledby="prevention-explorer-title"
      >
        <div className="prevention-section__heading">
          <div>
            <p className="prevention-eyebrow">Explorá el tema</p>
            <h2
              id="prevention-explorer-title"
              ref={explorerRef}
              tabIndex={-1}
            >
              ¿Qué te gustaría entender?
            </h2>
          </div>
          <p>
            Buscá una idea o elegí un tema. Los grupos son una organización
            inicial del contenido y pueden ajustarse con el equipo.
          </p>
        </div>

        <div className="prevention-explorer">
          <div className="prevention-explorer__controls">
            <label className="prevention-search">
              <Search size={20} aria-hidden="true" />
              <span className="sr-only">Buscar contenidos</span>
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Buscar por palabra o tema"
                autoComplete="off"
              />
              {searchText && (
                <button
                  type="button"
                  className="prevention-search__clear"
                  aria-label="Borrar búsqueda"
                  onClick={() => setSearchText("")}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </label>

            <div
              className="prevention-filters"
              role="group"
              aria-label="Filtrar por tema"
            >
              <button
                type="button"
                className="prevention-filter"
                aria-pressed={selectedCategory === "todos"}
                onClick={() => setSelectedCategory("todos")}
              >
                Todos los temas
              </button>
              {categoriasPrevencion.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="prevention-filter"
                  aria-pressed={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <p className="prevention-results-count" aria-live="polite">
            {visibleContents.length === 1
              ? "1 lectura disponible"
              : `${visibleContents.length} lecturas disponibles`}
          </p>

          <div className="prevention-content-grid">
            {visibleContents.length > 0 ? (
              visibleContents.map((content, index) => (
                <button
                  key={content.id}
                  type="button"
                  className="prevention-content-card"
                  aria-expanded={selectedContent?.id === content.id}
                  aria-controls="prevention-article"
                  onClick={() => openContent(content)}
                >
                  <span className="prevention-content-card__meta">
                    <span>{categoryLabel(content.category)}</span>
                    <span className="prevention-content-card__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span
                    className="prevention-content-card__title"
                    role="heading"
                    aria-level="3"
                  >
                    {content.title}
                  </span>
                  <p>{content.summary}</p>
                  <span className="prevention-content-card__action">
                    Leer contenido
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </button>
              ))
            ) : (
              <div className="prevention-empty" role="status">
                <h3>No encontramos ese contenido</h3>
                <p>
                  Probá con otra palabra o quitá el filtro para volver a ver
                  todos los temas.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedContent && (
          <article
            id="prevention-article"
            className="prevention-article"
            ref={articleRef}
            aria-labelledby="prevention-article-title"
          >
            <div className="prevention-article__topline">
              <p className="prevention-article__category">
                {categoryLabel(selectedContent.category)}
              </p>
              <button
                type="button"
                className="prevention-article__back"
                onClick={closeContent}
              >
                <ArrowLeft size={17} aria-hidden="true" />
                Volver a los temas
              </button>
            </div>

            <h2 id="prevention-article-title" ref={articleHeadingRef} tabIndex={-1}>
              {selectedContent.title}
            </h2>
            <p className="prevention-article__intro">
              {selectedContent.introduction}
            </p>

            <div className="prevention-article__body">
              {selectedContent.sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.text}</p>
                </section>
              ))}
            </div>

            <aside className="prevention-reflection">
              <p className="prevention-reflection__label">
                <BookOpenText
                  size={16}
                  aria-hidden="true"
                  style={{ verticalAlign: "text-bottom", marginRight: "0.35rem" }}
                />
                Para pensar, si te sirve
              </p>
              <p>{selectedContent.reflection}</p>
            </aside>

            <div className="prevention-sources">
              <h3>Fuentes consultadas</h3>
              <ul>
                {selectedContent.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.name}
                    </a>
                    <span className="prevention-sources__organization">
                      {source.organization}
                    </span>
                    <span className="prevention-sources__language">
                      {source.language}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        )}
      </section>

      <section
        id="prevention-stories"
        className="prevention-section prevention-stories"
        aria-labelledby="prevention-stories-title"
      >
        <div className="prevention-section__heading">
          <div>
            <p className="prevention-eyebrow">Voces y experiencias</p>
            <h2 id="prevention-stories-title">Historias reales</h2>
          </div>
          <p>
            Relatos publicados por medios reconocidos, resumidos con cuidado y
            enlazados a sus fuentes originales. Cada experiencia es distinta.
          </p>
        </div>

        <div
          className="prevention-story-filters"
          role="group"
          aria-label="Filtrar historias por formato"
        >
          {formatosHistorias.map((format) => (
            <button
              key={format.id}
              type="button"
              className="prevention-filter"
              aria-pressed={selectedStoryFormat === format.id}
              onClick={() => {
                setSelectedStory(null);
                setSelectedStoryFormat(format.id);
              }}
            >
              {format.label}
            </button>
          ))}
        </div>

        <p className="prevention-results-count" aria-live="polite">
          {visibleStories.length === 1
            ? "1 experiencia disponible"
            : `${visibleStories.length} experiencias disponibles`}
        </p>

        <div className="prevention-stories-grid">
          {visibleStories.map((story, index) => (
            <article
              key={story.id}
              className={`prevention-story-card prevention-story-card--${story.format} ${
                index === 0 ? "prevention-story-card--featured" : ""
              }`}
            >
              <div className="prevention-story-card__topline">
                <span>{story.formatLabel}</span>
                <span>{story.country}</span>
              </div>
              <p className="prevention-story-card__eyebrow">
                Historia editorial MODUS
              </p>
              <h3>{story.title}</h3>
              <p>{story.summary}</p>
              <ul
                className="prevention-story-card__themes"
                aria-label="Temas de la experiencia"
              >
                {story.themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>
              <p className="prevention-story-card__source">
                Publicado por {story.sourcePublisher}
              </p>
              <button
                type="button"
                className="prevention-story-card__action"
                aria-expanded={selectedStory?.id === story.id}
                aria-controls="prevention-story-detail"
                onClick={() =>
                  selectedStory?.id === story.id
                    ? closeStory()
                    : openStory(story)
                }
              >
                {selectedStory?.id === story.id
                  ? "Cerrar historia"
                  : "Conocer la experiencia"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>

        {selectedStory && (
          <article
            id="prevention-story-detail"
            className={`prevention-story-detail prevention-story-detail--${selectedStory.format}`}
            ref={storyDetailRef}
            aria-labelledby="prevention-story-title"
          >
            <div className="prevention-article__topline">
              <p className="prevention-article__category">
                {selectedStory.formatLabel} · {selectedStory.country}
              </p>
              <button
                type="button"
                className="prevention-article__back"
                onClick={closeStory}
              >
                <X size={17} aria-hidden="true" />
                Cerrar historia
              </button>
            </div>

            <p className="prevention-story-detail__eyebrow">
              Historia editorial MODUS
            </p>
            <h2
              id="prevention-story-title"
              ref={storyHeadingRef}
              tabIndex={-1}
            >
              {selectedStory.title}
            </h2>
            <p className="prevention-article__intro">
              {selectedStory.summary}
            </p>
            <p className="prevention-story-detail__notice">
              Nota de contenido: {selectedStory.contentNote}
            </p>

            <aside className="prevention-story-source-card">
              <p className="prevention-story-source-card__eyebrow">
                Publicación original
              </p>
              <h3>{selectedStory.sourceTitle}</h3>
              <p>
                {selectedStory.sourcePublisher} ·{" "}
                {selectedStory.publicationDate}
              </p>
              <p className="prevention-story-source-card__language">
                {selectedStory.sourceLanguage}
              </p>
              <a
                href={selectedStory.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir fuente original
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </aside>

            <div className="prevention-story-detail__body">
              {selectedStory.sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.text}</p>
                </section>
              ))}
            </div>

            <aside className="prevention-reflection">
              <p className="prevention-reflection__label">
                <BookOpenText
                  size={16}
                  aria-hidden="true"
                  style={{ verticalAlign: "text-bottom", marginRight: "0.35rem" }}
                />
                Para pensar, si te sirve
              </p>
              <p>{selectedStory.reflection}</p>
            </aside>

            <p className="prevention-story-detail__editorial-note">
              {selectedStory.editorialNote}
            </p>

            <p className="prevention-story-detail__external-note">
              El enlace abre una publicación externa que puede incluir
              información adicional y contenido no resumido aquí.
            </p>
          </article>
        )}

        <aside
          className="prevention-stories-note"
          aria-label="Criterios de las historias"
        >
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Estos relatos son experiencias personales publicadas por terceros;
            no representan a todas las personas ni permiten sacar conclusiones
            sobre quien lee. MODUS comparte resúmenes propios y no reemplaza la
            fuente original.
          </p>
        </aside>
      </section>

      <section
        id="prevention-video-testimonials"
        ref={videoStoriesRef}
        className="prevention-section prevention-video-stories"
        aria-labelledby="prevention-video-stories-title"
      >
        <div className="prevention-section__heading">
          <div>
            <p className="prevention-eyebrow">Voces en video</p>
            <h2 id="prevention-video-stories-title">
              Experiencias contadas por sus protagonistas
            </h2>
          </div>
          <p>
            Los videos se reproducen aquí desde los reproductores oficiales de
            sus publicaciones. MODUS no descarga ni recorta el material.
          </p>
        </div>

        <p className="prevention-results-count" aria-live="polite">
          {visibleVideos.length === 1
            ? "1 video disponible"
            : `${visibleVideos.length} videos disponibles`}
        </p>

        <div className="prevention-video-grid">
          {visibleVideos.map((video) => (
            <article
              key={video.id}
              className={`prevention-video-card prevention-video-card--${video.aspect}`}
            >
              <p className="prevention-video-card__format">
                {video.formatLabel}
              </p>
              <h3>{video.title}</h3>
              <p className="prevention-video-card__person">{video.person}</p>
              {video.contentNote && (
                <p className="prevention-video-card__warning" role="note">
                  {video.contentNote}
                </p>
              )}
              <div
                id={`prevention-video-${video.id}`}
                data-tiktok-video-id={
                  isTikTokEmbed(video) ? video.id : undefined
                }
                className={`prevention-video-card__media prevention-video-card__media--${video.aspect}`}
                role="region"
                aria-label={`Reproductor de ${video.title}`}
              >
                {video.nativeVideoUrl ? (
                  <video
                    className="prevention-embed prevention-video-native"
                    controls
                    preload="none"
                    playsInline
                    aria-label={`${video.title} — ${video.publisher}`}
                  >
                    <source src={video.nativeVideoUrl} type="video/mp4" />
                    Tu navegador no puede reproducir este video.
                  </video>
                ) : isTikTokEmbed(video) && !loadedTikTokVideos.has(video.id) ? (
                  <div className="prevention-video-card__load" role="status">
                    <Play size={22} aria-hidden="true" />
                    El video se cargará al llegar aquí
                  </div>
                ) : (
                  <iframe
                    key={`${video.id}-${tiktokReloadCounts[video.id] || 0}`}
                    className="prevention-embed"
                    src={video.embedUrl}
                    title={`${video.title} — ${video.publisher}`}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture; fullscreen; autoplay"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                )}
              </div>
              <p className="prevention-video-card__summary">{video.summary}</p>
              <p className="prevention-video-card__fallback">
                La reproducción depende del reproductor del medio. Si no inicia
                en tu navegador, podés abrir la publicación original desde el
                enlace siguiente.
              </p>
              <ul
                className="prevention-video-card__categories"
                aria-label="Temas de la experiencia"
              >
                {video.categories.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
              <p className="prevention-video-card__source">
                {[video.publisher, video.publicationDate]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="prevention-video-card__actions">
                {isTikTokEmbed(video) && loadedTikTokVideos.has(video.id) && (
                    <button
                      className="prevention-video-card__play"
                      type="button"
                      onClick={() =>
                        setTiktokReloadCounts((counts) => ({
                          ...counts,
                          [video.id]: (counts[video.id] || 0) + 1,
                        }))
                      }
                    >
                      Reintentar video
                    </button>
                  )}
                <a
                  className="prevention-video-card__play"
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {video.actionLabel}
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
                {video.referenceUrl && (
                  <a
                    className="prevention-video-card__play"
                    href={video.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {video.referenceLabel}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <aside
          className="prevention-video-note"
          aria-label="Orientación y apoyo"
        >
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Si una experiencia te preocupa, podés dejar de verla y conversarlo
            con una persona adulta de confianza. Para consultar opciones de
            orientación sobre apuestas y salud mental, podés consultar al{" "}
            <a
              href="https://mptutelar.gob.ar/campana/las-apuestas-no-son-un-juego/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ministerio Público Tutelar
            </a>{" "}
            o al{" "}
            <a
              href="https://www.argentina.gob.ar/salud/mental-y-adicciones/suicidio"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ministerio de Salud de la Nación
            </a>
            . También podés conocer opciones de orientación y grupos
            vinculados al juego en{" "}
            <a
              href="https://jugadoresanonimos.org.ar/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jugadores Anónimos Argentina
            </a>
            .
          </p>
        </aside>
      </section>

      <aside className="prevention-note" aria-label="Alcance informativo">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          Este espacio comparte información general: no realiza diagnósticos ni
          evalúa experiencias personales. Las preguntas son opcionales y no se
          guardan respuestas.
        </p>
      </aside>
    </div>
  );
};
