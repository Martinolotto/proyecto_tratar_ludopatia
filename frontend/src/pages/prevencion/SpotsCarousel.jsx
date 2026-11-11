import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { spotsPrevencion } from "./videosHistorias.js";

let youtubeApiPromise;

const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const script = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };

    if (!script) {
      const apiScript = document.createElement("script");
      apiScript.src = "https://www.youtube.com/iframe_api";
      apiScript.onerror = () => reject(new Error("No se pudo cargar YouTube."));
      document.head.append(apiScript);
    }
  }).catch((error) => {
    youtubeApiPromise = undefined;
    throw error;
  });

  return youtubeApiPromise;
};

const sendTikTokMessage = (frame, type) => {
  frame?.contentWindow?.postMessage(
    { type, value: "", "x-tiktok-player": true },
    "https://www.tiktok.com",
  );
};

const getYouTubePlayerUrl = (url) => {
  const playerUrl = new URL(url);
  playerUrl.searchParams.set("enablejsapi", "1");
  playerUrl.searchParams.set("controls", "1");
  playerUrl.searchParams.set("playsinline", "1");
  playerUrl.searchParams.set("origin", window.location.origin);
  return playerUrl.toString();
};

const SpotPlayer = ({ spot }) => {
  const mediaRef = useRef(null);
  const frameRef = useRef(null);
  const playerRef = useRef(null);
  const visibleRef = useRef(false);
  const manuallyPausedRef = useRef(false);
  const automaticPauseRef = useRef(false);
  const [playerError, setPlayerError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const syncPlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!visibleRef.current || document.hidden) {
      if (spot.provider === "youtube") {
        if (player.getPlayerState?.() === window.YT.PlayerState.PLAYING) {
          automaticPauseRef.current = true;
          player.pauseVideo();
        }
      } else {
        automaticPauseRef.current = true;
        sendTikTokMessage(frameRef.current, "pause");
      }
      return;
    }

    if (manuallyPausedRef.current) return;

    if (spot.provider === "youtube") {
      player.mute();
      player.playVideo();
    } else {
      sendTikTokMessage(frameRef.current, "mute");
      sendTikTokMessage(frameRef.current, "play");
    }
  }, [spot.provider]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        syncPlayback();
      },
      { threshold: [0, 0.25] },
    );
    const handleVisibilityChange = () => syncPlayback();

    observer.observe(media);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (spot.provider === "youtube") {
      loadYouTubeApi()
        .then((YT) => {
          if (cancelled || !frameRef.current) return;
          playerRef.current = new YT.Player(frameRef.current, {
            events: {
              onReady: ({ target }) => {
                playerRef.current = target;
                target.mute();
                syncPlayback();
              },
              onStateChange: ({ data }) => {
                if (data === YT.PlayerState.PAUSED) {
                  if (automaticPauseRef.current) {
                    automaticPauseRef.current = false;
                  } else if (visibleRef.current) {
                    manuallyPausedRef.current = true;
                  }
                }
                if (data === YT.PlayerState.PLAYING) {
                  manuallyPausedRef.current = false;
                  setPlayerError(false);
                }
              },
              onError: () => {
                if (!cancelled) setPlayerError(true);
              },
            },
          });
        })
        .catch(() => {
          if (!cancelled) setPlayerError(true);
        });
    }

    const handleTikTokMessage = (event) => {
      if (
        event.origin !== "https://www.tiktok.com" ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.["x-tiktok-player"] !== true
      ) {
        return;
      }

      if (event.data.type === "onPlayerReady") {
        playerRef.current = { ready: true };
        setPlayerError(false);
        syncPlayback();
      }
      if (event.data.type === "onStateChange") {
        const state = Number(event.data.value);
        if (state === 2) {
          if (automaticPauseRef.current) {
            automaticPauseRef.current = false;
          } else if (visibleRef.current) {
            manuallyPausedRef.current = true;
          }
        }
        if (state === 1) {
          manuallyPausedRef.current = false;
          setPlayerError(false);
        }
      }
      if (event.data.type === "onPlayerError") setPlayerError(true);
    };

    if (spot.provider === "tiktok") {
      window.addEventListener("message", handleTikTokMessage);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("message", handleTikTokMessage);
      if (spot.provider === "youtube") playerRef.current?.pauseVideo?.();
      playerRef.current = null;
    };
  }, [spot, syncPlayback]);

  return (
    <div ref={mediaRef} className={`prevention-spot__media prevention-spot__media--${spot.aspect}`}>
      {spot.provider === "youtube" ? (
        <iframe
          ref={frameRef}
          className="prevention-embed"
          src={getYouTubePlayerUrl(spot.embedUrl)}
          title={`${spot.title} — ${spot.publisher}`}
          loading="eager"
          allow="encrypted-media; picture-in-picture; fullscreen; autoplay"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <iframe
          ref={frameRef}
          key={reloadCount}
          className="prevention-embed"
          src={`${spot.embedUrl}&autoplay=0&force_muted=0`}
          title={`${spot.title} — ${spot.publisher}`}
          loading="eager"
          allow="encrypted-media; picture-in-picture; fullscreen; autoplay"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
      {playerError && (
        <p className="prevention-spot__player-error" role="status">
          {spot.provider === "tiktok" && (
            <button
              type="button"
              onClick={() => {
                playerRef.current = null;
                manuallyPausedRef.current = false;
                setPlayerError(false);
                setReloadCount((count) => count + 1);
              }}
            >
              Reintentar video
            </button>
          )}
          El reproductor externo no pudo iniciar. Podés abrir la publicación original.
        </p>
      )}
    </div>
  );
};

export const SpotsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isInteracting, setIsInteracting] = useState(false);
  const spot = spotsPrevencion[activeIndex];
  const isAutoAdvanceRunning = autoAdvanceEnabled && !isInteracting;

  const move = useCallback((direction) => {
    setActiveIndex(
      (current) => (current + direction + spotsPrevencion.length) % spotsPrevencion.length,
    );
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event) => {
      if (event.matches) setAutoAdvanceEnabled(false);
    };

    reducedMotion.addEventListener("change", handleMotionPreference);
    return () => reducedMotion.removeEventListener("change", handleMotionPreference);
  }, []);

  useEffect(() => {
    if (!isAutoAdvanceRunning || spotsPrevencion.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % spotsPrevencion.length);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [activeIndex, isAutoAdvanceRunning]);

  return (
    <div
      className="prevention-spots__showcase"
      aria-roledescription="carrusel"
      aria-label="Campañas audiovisuales"
      onPointerEnter={() => setIsInteracting(true)}
      onPointerLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsInteracting(false);
        }
      }}
    >
      <article
        className="prevention-spot"
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`Spot ${activeIndex + 1} de ${spotsPrevencion.length}: ${spot.title}`}
      >
        <div className="prevention-spot__message">
          <p className="prevention-spot__format">{spot.formatLabel}</p>
          <h3>{spot.title}</h3>
          <p className="prevention-spot__source">{spot.publisher}</p>
          <p className="prevention-spot__summary">{spot.awarenessMessage}</p>
          <ul className="prevention-spot__categories" aria-label="Categoría de la campaña">
            {spot.categories.map((category) => <li key={category}>{category}</li>)}
          </ul>
          <nav className="prevention-spot__navigation" aria-label="Navegación de spots">
            <button type="button" onClick={() => move(-1)} aria-label="Ver spot anterior">
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(spotsPrevencion.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => move(1)} aria-label="Ver spot siguiente">
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </nav>
        </div>
        <div className="prevention-spot__view">
          <SpotPlayer spot={spot} />
          <p className="prevention-spot__playback-note">Se inicia en silencio cuando el navegador lo permite y pausa al salir del área visible. Podés controlarlo desde el reproductor.</p>
          <div className="prevention-spot__actions">
            <a className="prevention-spot__action" href={spot.sourceUrl} target="_blank" rel="noopener noreferrer">
              {spot.actionLabel}<ExternalLink size={16} aria-hidden="true" />
            </a>
            {spot.referenceUrl && (
              <a className="prevention-spot__action" href={spot.referenceUrl} target="_blank" rel="noopener noreferrer">
                {spot.referenceLabel}<ExternalLink size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
