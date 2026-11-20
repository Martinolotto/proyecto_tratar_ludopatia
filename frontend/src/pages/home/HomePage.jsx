/*
 * Página de Inicio: reúne los accesos a los ejes y un resumen personal de actividad.
 * Supabase identifica la cuenta y el router conecta las páginas disponibles.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { ArrowRight, BookOpen, CalendarDays, ChartNoAxesCombined, Shield, UsersRound } from "lucide-react";
import {
  categoriasPrevencion,
  contenidosPrevencion,
} from "../prevencion/prevencionContenido.js";
import { supabase } from "../../lib/supabase.js";
import { consultarDatosInicio } from "./homeDatos.js";
import { ActividadSemanal } from "../../components/ActividadSemanal.jsx";
import "./HomePage.css";

const lecturasDestacadas = ["casi-ganar", "publicidad-y-apuestas"]
  .map((id) => contenidosPrevencion.find((contenido) => contenido.id === id))
  .filter(Boolean);

export const HomePage = () => {
  const navigate = useNavigate();
  const { openSidebar, signOutInProgress } = useOutletContext();
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
          // El layout informa el resultado cuando el cierre local todavía está en curso.
          if (!signOutInProgress.current) navigate("/login", { replace: true });
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
  }, [intento, navigate, signOutInProgress]);

  // Al volver a la pestaña consultamos de nuevo; mientras permanece visible solo
  // comprobamos el día de la base una vez por minuto, sin refrescar la pantalla.
  useEffect(() => {
    if (estado !== "listo" || !datos?.fechaActual) return undefined;
    let vigente = true;
    let consultaPendiente = false;
    const revision = revisionSesion.current;

    const comprobarDia = async () => {
      if (document.hidden || consultaPendiente || signOutInProgress.current) return;
      consultaPendiente = true;
      try {
        const { data, error } = await supabase.rpc("consultar_actividad_hoy");
        if (!vigente || revision !== revisionSesion.current) return;
        if (error || !data?.fecha) throw error || new Error("Fecha no disponible");
        if (data.fecha !== datos.fechaActual) {
          // El calendario anterior deja de ser válido al terminar el día argentino.
          setDatos(null);
          setEstado("cargando");
          setIntento((anterior) => anterior + 1);
        }
      } catch {
        if (vigente && revision === revisionSesion.current) setEstado("error");
      } finally {
        consultaPendiente = false;
      }
    };
    const alVolver = () => {
      if (!document.hidden && !signOutInProgress.current) {
        setIntento((anterior) => anterior + 1);
      }
    };
    const intervalo = window.setInterval(comprobarDia, 60_000);
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [estado, datos?.fechaActual, signOutInProgress]);

  // Formateamos la fecha devuelta por PostgreSQL como día calendario argentino.
  const diaVisible = (fecha) => new Intl.DateTimeFormat("es-AR", {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));

  // La fecha es un día calendario, no un instante: invertir sus partes evita
  // desplazarla por la zona horaria del navegador.
  const fechaVisible = (fecha) => fecha.split("-").reverse().join("/");

  // Los enlaces conservan los destinos existentes del router y sus descripciones.
  const herramientas = [
    { label: "Mi actividad", description: "Registrá tu día, a tu manera.", path: "/mi-actividad", icon: CalendarDays },
    { label: "Historial y progreso", description: "Consultá tu espacio de historial.", path: "/historial-y-progreso", icon: ChartNoAxesCombined },
    { label: "Escudo digital", description: "Explorá las categorías disponibles.", path: "/escudo-digital", icon: Shield },
  ];

  return (
    <section className="home-b2" aria-labelledby="home-welcome-title">
      {/* El alias llega de Supabase; mientras carga usamos una bienvenida neutral. */}
      <header className="home-b2__welcome">
        <div>
          <h1 id="home-welcome-title">
            {estado === "listo" ? `Hola, ${datos.alias}.` : "Un espacio para vos."}
          </h1>
          {estado === "listo" ? (
            <p className="home-b2__today">
              Hoy es <time dateTime={datos.fechaActual}>{diaVisible(datos.fechaActual)}</time>.
              {" "}{datos.registradoHoy
                ? "Tu registro de hoy está disponible."
                : "Todavía no registraste tu actividad de hoy."}
            </p>
          ) : (
            <p>Un punto de partida para entender tu actividad y encontrar lo que necesitás.</p>
          )}
        </div>
        {/* El layout abre la sidebar existente y enfoca su primer acceso. */}
        <button
          type="button"
          className="home-b2__welcome-link"
          onClick={() => openSidebar({ focusFirst: true })}
        >
          Explorá tus herramientas <ArrowRight size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="home-b2__workspace">
        {/* La ausencia de registro nunca se interpreta como un día sin apuestas. */}
        <section className="home-b2__activity" aria-labelledby="home-activity-title">
          <div className="home-b2__activity-heading">
            <h2 id="home-activity-title">Tu actividad</h2>
            {estado === "listo" && (
              <span className="home-b2__status">
                {datos.ultimoRegistro ? "Último registro" : "Sin registros"}
              </span>
            )}
          </div>
          <div className="home-b2__activity-content" role="status" aria-live="polite">
            {estado === "cargando" && (
              <p className="home-b2__activity-copy">Cargando tu información...</p>
            )}
            {estado === "listo" && (datos.ultimoRegistro ? (
              <>
                <p className="home-b2__activity-date">
                  <time dateTime={datos.ultimoRegistro.fecha}>
                    {fechaVisible(datos.ultimoRegistro.fecha)}
                  </time>
                </p>
                <p className="home-b2__activity-statement">
                  Declaraste que {datos.ultimoRegistro.aposto ? "sí" : "no"} realizaste apuestas.
                </p>
              </>
            ) : (
              <>
                <p className="home-b2__activity-statement">Tu primer registro empieza acá.</p>
                <p className="home-b2__activity-copy">
                  Podés contar si apostaste, si tuviste ganas y lo que quieras sumar sobre tu día.
                </p>
              </>
            ))}
          </div>
          {estado === "error" && (
            <div className="home-b2__error">
              <p role="alert">No pudimos cargar tu información. Revisá tu conexión e intentá de nuevo.</p>
              <button
                type="button"
                onClick={() => {
                  setEstado("cargando");
                  setIntento((anterior) => anterior + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          )}
          <div className="home-b2__activity-actions">
            <Link to="/mi-actividad" className="home-b2__button">
              Ir a Mi actividad <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <span>Tu registro es privado.</span>
          </div>
        </section>

        {/* Los accesos abren las páginas reales sin atribuirles funciones pendientes. */}
        <section className="home-b2__tools" aria-labelledby="home-tools-title">
          <div className="home-b2__tools-heading">
            <h2 id="home-tools-title">A tu alcance</h2>
            <p>Tres herramientas para explorar a tu ritmo.</p>
          </div>
          <div className="home-b2__tool-list">
            {herramientas.map(({ label, description, path, icon: Icon }) => (
              <Link key={path} to={path} className="home-b2__tool">
                <span className="home-b2__tool-icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="home-b2__tool-text"><strong>{label}</strong><small>{description}</small></span>
                <ArrowRight className="home-b2__tool-arrow" size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* El calendario se dibuja solo con la respuesta confirmada para esta cuenta. */}
      {estado === "listo" && (
        <div className="home-b2__week">
          <ActividadSemanal dias={datos.semana} racha={datos.racha} hoy={datos.fechaActual} />
        </div>
      )}

      {/* El catálogo de Prevención mantiene los textos; no se prometen enlaces directos. */}
      <section className="home-b2__discover" aria-labelledby="home-readings-title">
        <div className="home-b2__discover-heading">
          <div>
            <h2 id="home-readings-title">Para mirar con otra perspectiva</h2>
            <p>Ideas para conocer más sobre las apuestas.</p>
          </div>
          <Link to="/prevencion">Explorar Prevención <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="home-b2__discover-grid">
          {lecturasDestacadas.map((contenido) => {
            const categoria = categoriasPrevencion.find((item) => item.id === contenido.category);
            return (
              <article className="home-b2__reading" key={contenido.id}>
                <BookOpen size={20} aria-hidden="true" />
                {categoria && <span>{categoria.label}</span>}
                <h3>{contenido.title}</h3>
                <p>{contenido.summary}</p>
              </article>
            );
          })}
          <aside className="home-b2__community">
            <UsersRound size={22} aria-hidden="true" />
            <h3>También hay un espacio compartido.</h3>
            <p>Conocé Comunidad, el espacio de intercambio entre pares.</p>
            <Link to="/comunidad">Conocer Comunidad <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>
    </section>
  );
};
