import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ExternalLink,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  categoriasPrevencion,
  contenidosPrevencion,
} from "./prevencionContenido.js";
import { formatosHistorias, historiasReales } from "./historiasReales.js";
import "./PrevencionPage.css";

const normalizeText = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

export const PrevencionPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchText, setSearchText] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [selectedStoryFormat, setSelectedStoryFormat] = useState("todos");
  const [selectedStory, setSelectedStory] = useState(null);
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

      <section
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
              className={`prevention-story-card ${
                index === 0 ? "prevention-story-card--featured" : ""
              }`}
            >
              <div className="prevention-story-card__topline">
                <span>{story.formatLabel}</span>
                <span>{story.country}</span>
              </div>
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
                Fuente: {story.sourcePublisher}
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
            className="prevention-story-detail"
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

            <div className="prevention-article__body">
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

            <div className="prevention-sources">
              <h3>Fuente original</h3>
              <p>
                {selectedStory.sourcePublisher} · {selectedStory.sourceLanguage}
              </p>
              <a
                href={selectedStory.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir publicación original de {selectedStory.sourcePublisher}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
              <p className="prevention-story-detail__external-note">
                El enlace abre una publicación externa que puede incluir
                información adicional y contenido no resumido aquí.
              </p>
            </div>
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
