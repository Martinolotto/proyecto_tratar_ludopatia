/*
 * Página de Inicio: reúne los accesos a los ejes y un resumen personal de actividad.
 * El layout entrega el acceso al panel y Supabase identifica y consulta la cuenta.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Compass,
  PanelRightOpen,
  UsersRound,
} from "lucide-react";
import {
  categoriasPrevencion,
  contenidosPrevencion,
} from "../prevencion/prevencionContenido.js";
import { supabase } from "../../lib/supabase.js";
import { consultarDatosInicio } from "./homeDatos.js";

const lecturasDestacadas = ["casi-ganar", "publicidad-y-apuestas"]
  .map((id) => contenidosPrevencion.find((contenido) => contenido.id === id))
  .filter(Boolean);

export const HomePage = () => {
  const { openDashboard } = useOutletContext();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("cargando");
  const [datos, setDatos] = useState(null);
  const [intento, setIntento] = useState(0);
  const cuentaActual = useRef(undefined);
  const revisionSesion = useRef(0);

  // Una sesión puede cambiar en otra pestaña mientras Inicio sigue montado.
  // El callback solo limpia la vista y solicita otra carga; no llama a Supabase.
  useEffect(() => {
    let vigente = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!vigente) return;
      const usuarioId = sesion?.user?.id ?? null;
      if (cuentaActual.current === usuarioId) return;
      cuentaActual.current = usuarioId;
      revisionSesion.current += 1;
      setDatos(null);
      setEstado("cargando");
      setIntento((anterior) => anterior + 1);
    });
    return () => {
      vigente = false;
      subscription.unsubscribe();
    };
  }, []);

  // Primero comprobamos la cuenta con Auth; después consultamos solo sus datos.
  // La limpieza evita actualizar la pantalla si la persona navega mientras carga.
  useEffect(() => {
    let vigente = true;
    // La revisión invalida respuestas en vuelo si llega un cambio de sesión.
    const revision = revisionSesion.current;
    const cargarInicio = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vigente || revision !== revisionSesion.current) return;
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (!data.user) {
          navigate("/login", { replace: true });
          return;
        }
        // No mezclar una identidad anterior con la sesión comunicada por Auth.
        if (cuentaActual.current !== undefined && cuentaActual.current !== data.user.id) {
          throw new Error("La sesión cambió durante la consulta.");
        }
        const resultado = await consultarDatosInicio(data.user.id);
        if (!vigente || revision !== revisionSesion.current) return;
        setDatos(resultado);
        setEstado("listo");
      } catch {
        if (vigente && revision === revisionSesion.current) setEstado("error");
      }
    };
    cargarInicio();
    return () => { vigente = false; };
  }, [intento, navigate]);

  // La fecha es un día calendario, no un instante: invertir sus partes evita
  // desplazarla por la zona horaria del navegador.
  const fechaVisible = (fecha) => fecha.split("-").reverse().join("/");

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-2xl bg-brand-navy p-6 text-white md:p-8">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/85">
          <Compass size={18} aria-hidden="true" />
          Bienvenido a MODUS
        </span>
        <h1 className="mt-3 max-w-2xl break-words font-heading text-2xl font-bold md:text-3xl">
          {estado === "listo"
            ? `Hola, ${datos.alias}`
            : "Un espacio para explorar MODUS a tu ritmo"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
          Encontrá contenidos de Prevención, conocé Comunidad y accedé a las
          herramientas disponibles desde un mismo lugar.
        </p>
      </header>

      {/* Un día sin registro es ausencia de información, no una declaración sin apuestas. */}
      <section aria-labelledby="home-activity-title" className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6">
        <h2 id="home-activity-title" className="font-heading text-xl font-semibold text-brand-navy">
          Tu última actividad
        </h2>
        {/* La región persistente anuncia carga y resultado sin duplicar la alerta de error. */}
        <div role="status" aria-live="polite">
          {estado === "cargando" && <p className="mt-3 text-sm text-ink">Cargando tu información...</p>}
          {estado === "listo" && (datos.ultimoRegistro ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              El <time dateTime={datos.ultimoRegistro.fecha}>{fechaVisible(datos.ultimoRegistro.fecha)}</time> declaraste que {datos.ultimoRegistro.aposto ? "sí" : "no"} realizaste apuestas.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Todavía no tenés registros. Podés consultar Mi actividad cuando quieras.
            </p>
          ))}
        </div>
        {estado === "error" && (
          <div className="mt-3">
            <p role="alert" className="text-sm text-ink">No pudimos cargar tu información. Revisá tu conexión e intentá de nuevo.</p>
            <button
              type="button"
              onClick={() => {
                setEstado("cargando");
                setIntento((anterior) => anterior + 1);
              }}
              className="mt-3 min-h-11 rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
            >
              Reintentar
            </button>
          </div>
        )}
        <Link
          to="/mi-actividad"
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
        >
          Ir a Mi actividad <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="home-access-title">
        <h2
          id="home-access-title"
          className="font-heading text-xl font-semibold text-brand-navy"
        >
          ¿Por dónde querés empezar?
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link
            to="/prevencion"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <BookOpen className="text-brand-teal" size={22} aria-hidden="true" />
            <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy">
              Prevención
            </h3>
            <p className="mt-2 text-sm text-ink/80">
              Explorá contenidos educativos sobre apuestas online.
            </p>
          </Link>

          <Link
            to="/comunidad"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <UsersRound
              className="text-brand-teal"
              size={22}
              aria-hidden="true"
            />
            <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy">
              Comunidad
            </h3>
            <p className="mt-2 text-sm text-ink/80">
              Conocé el espacio de participación entre pares.
            </p>
          </Link>

          <button
            type="button"
            onClick={openDashboard}
            aria-haspopup="dialog"
            aria-controls="app-dashboard"
            className="rounded-xl border border-brand-navy/10 bg-surface p-5 text-left transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            <PanelRightOpen
              className="text-brand-teal"
              size={22}
              aria-hidden="true"
            />
            <span className="mt-3 block font-heading text-lg font-semibold text-brand-navy">
              Herramientas personales
            </span>
            <span className="mt-2 block text-sm text-ink/80">
              Abrí el panel para consultar sus páginas disponibles.
            </span>
          </button>
        </div>
      </section>

      <section aria-labelledby="home-readings-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="home-readings-title"
              className="font-heading text-xl font-semibold text-brand-navy"
            >
              Para explorar en Prevención
            </h2>
            <p className="mt-1 text-sm text-ink/75">
              Algunas lecturas disponibles en el eje.
            </p>
          </div>
          <Link
            to="/prevencion"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Ver Prevención <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {lecturasDestacadas.map((contenido) => {
            const categoria = categoriasPrevencion.find(
              (item) => item.id === contenido.category,
            );

            return (
              <Link
                key={contenido.id}
                to="/prevencion"
                className="rounded-xl border border-brand-navy/10 bg-surface p-5 transition hover:border-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                {categoria && (
                  <span className="text-sm font-medium text-brand-teal">
                    {categoria.label}
                  </span>
                )}
                <h3 className="mt-2 font-heading font-semibold text-brand-navy">
                  {contenido.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  {contenido.summary}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
};
