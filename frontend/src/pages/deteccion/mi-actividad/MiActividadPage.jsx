/*
 * Herramienta personal de Detección: organiza la edición del día y su resumen.
 * Supabase aporta la sesión y los datos; miActividadDatos y el formulario aíslan
 * las consultas y las reglas de entrada que esta pantalla necesita.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import {
  ArrowLeft, ArrowUpRight, Check, ChevronDown, Clock3, Coins,
  ListChecks, PencilLine, Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase.js";
import { consultarActividad, guardarActividad } from "./miActividadDatos.js";
import {
  desdeRegistro, formularioVacio, formatoPesos, hayCantidades, validarActividad,
} from "./miActividadFormulario.js";
import "./miActividad.css";

// Los bloques secundarios se expanden en la misma página y conservan sus hijos.
const Bloque = ({ id, titulo, descripcion, resumen, icono: Icono, activo, alAlternar, children, deshabilitado }) => (
  <section className={`actividad-bloque actividad-bloque--${id} ${activo ? "esta-abierto" : ""}`}>
    <button
      type="button"
      className="actividad-bloque-cabecera"
      aria-expanded={activo}
      aria-controls={`panel-${id}`}
      onClick={alAlternar}
      disabled={deshabilitado}
    >
      <span className="actividad-icono"><Icono size={20} aria-hidden="true" /></span>
      <span className="actividad-bloque-texto">
        <strong>{titulo}</strong>
        <small>{descripcion}</small>
        <span>{resumen}</span>
      </span>
      <ChevronDown className="actividad-chevron" size={19} aria-hidden="true" />
    </button>
    <div id={`panel-${id}`} hidden={!activo} className="actividad-bloque-contenido">
      <fieldset disabled={deshabilitado} className="actividad-campos-grupo">{children}</fieldset>
    </div>
  </section>
);

const Campo = ({ id, titulo, value, onChange, error, ayuda, inputMode = "decimal" }) => (
  <div className="actividad-campo">
    <label htmlFor={id}>{titulo}</label>
    <input
      id={id}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
      aria-invalid={Boolean(error)}
      aria-describedby={[ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined}
    />
    {ayuda && <small id={`${id}-ayuda`}>{ayuda}</small>}
    {error && <small id={`${id}-error`} className="actividad-error">{error}</small>}
  </div>
);

// El resumen utiliza exclusivamente la respuesta confirmada por el servidor.
// Presenta cada dato por separado sin convertir omisiones en ceros ni evaluaciones.
const Resumen = ({ fecha, registro, conductas, catalogo, onEditar }) => {
  const nombres = conductas.map((codigo) => catalogo.find((item) => item.codigo === codigo)?.nombre || codigo);
  const tiempo = registro.tiempo_valor === null
    ? "Sin indicar"
    : `${String(registro.tiempo_valor).replace(".", ",")} ${registro.tiempo_unidad}`;

  return (
    <section className="actividad-resumen" aria-labelledby="resumen-titulo">
      <div className="actividad-resumen-principal">
        <span className="actividad-marca"><Check size={20} aria-hidden="true" /> Registro guardado</span>
        <h2 id="resumen-titulo" tabIndex={-1}>¡Bien hecho por registrar tu día!</h2>
        <p>
          El {fecha.split("-").reverse().join("/")} declaraste que
          {" "}<strong>{registro.aposto ? "sí apostaste" : "no apostaste"}</strong>.
        </p>
        <p>Un paso a la vez. Podés volver a revisar o actualizar lo que registraste hoy.</p>
        <button type="button" className="actividad-accion actividad-accion-clara" onClick={onEditar}>
          Actualizar registro <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Cada tarjeta refleja datos reales u omisiones de la declaración guardada. */}
      <div className="actividad-resumen-detalles">
        <div className="actividad-resumen-tarjeta actividad-resumen-ganas">
          <span>Ganas de apostar</span>
          <strong>{registro.tuvo_ganas === null ? "Sin indicar" : registro.tuvo_ganas ? "Sí" : "No"}</strong>
        </div>
        {registro.aposto && (
          <>
            <div className="actividad-resumen-tarjeta actividad-resumen-dinero">
              <span>Dinero apostado</span>
              <strong>{formatoPesos(registro.dinero_apostado)}</strong>
            </div>
            <div className="actividad-resumen-tarjeta actividad-resumen-perdido">
              <span>Dinero perdido</span>
              <strong>{formatoPesos(registro.dinero_perdido)}</strong>
            </div>
            <div className="actividad-resumen-tarjeta actividad-resumen-tiempo">
              <span>Tiempo dedicado</span>
              <strong>{tiempo}</strong>
            </div>
            <div className="actividad-resumen-tarjeta actividad-resumen-cantidad">
              <span>Cantidad de apuestas</span>
              <strong>{registro.cantidad_apuestas === null ? "Sin indicar" : registro.cantidad_apuestas}</strong>
            </div>
          </>
        )}
        <div className="actividad-resumen-tarjeta actividad-resumen-situaciones">
          <span>Situaciones</span>
          <strong>{nombres.length ? nombres.join(" · ") : "Sin seleccionar"}</strong>
        </div>
        <div className="actividad-resumen-tarjeta actividad-resumen-nota">
          <span>Tu nota</span>
          <strong className="actividad-nota-guardada">{registro.observacion || "Sin nota"}</strong>
        </div>
      </div>
    </section>
  );
};

export const MiActividadPage = () => {
  const navigate = useNavigate();
  const { signOutInProgress } = useOutletContext();
  const [estado, setEstado] = useState("cargando");
  const [intento, setIntento] = useState(0);
  const [fecha, setFecha] = useState("");
  const [guardado, setGuardado] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [inicial, setInicial] = useState(formularioVacio);
  const [abierto, setAbierto] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const revision = useRef(0);
  const usuario = useRef(undefined);
  const guardandoRef = useRef(false);
  const botonConfirmar = useRef(null);
  const botonCancelarEdicion = useRef(null);

  // El foco entra a la confirmación cuando aparece para anunciar su decisión.
  useEffect(() => {
    if (confirmacion) botonConfirmar.current?.focus();
  }, [confirmacion]);

  // El callback de Auth solo invalida la vista; la consulta ocurre en otro efecto.
  useEffect(() => {
    let vigente = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!vigente) return;
      const nuevoId = sesion?.user?.id ?? null;
      if (usuario.current === nuevoId) return;
      usuario.current = nuevoId;
      revision.current += 1;
      setGuardado(null);
      setFormulario(formularioVacio());
      setInicial(formularioVacio());
      setCatalogo([]);
      setFecha("");
      setGuardando(false);
      guardandoRef.current = false;
      setMensaje("");
      setEstado("cargando");
      setIntento((anterior) => anterior + 1);
    });
    return () => { vigente = false; revision.current += 1; subscription.unsubscribe(); };
  }, []);

  // Consultar Auth primero evita mostrar datos hasta comprobar la cuenta activa.
  useEffect(() => {
    let vigente = true;
    const revisionCarga = revision.current;
    const cargar = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vigente || revisionCarga !== revision.current) return;
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (!data.user) {
          // La navegación compartida resuelve el resultado del cierre en curso.
          if (!signOutInProgress.current) navigate("/login", { replace: true });
          return;
        }
        if (usuario.current !== undefined && usuario.current !== data.user.id) return;
        const datos = await consultarActividad();
        if (!vigente || revisionCarga !== revision.current) return;
        const valores = desdeRegistro(datos.registro, datos.conductas);
        setFecha(datos.fecha);
        setCatalogo(datos.catalogo);
        setGuardado(datos.registro ? datos : null);
        setFormulario(valores);
        setInicial(valores);
        setErrores({});
        setConfirmacion(null);
        setEstado(datos.registro ? "resumen" : "edicion");
      } catch {
        if (vigente && revisionCarga === revision.current) setEstado("error");
      }
    };
    cargar();
    return () => { vigente = false; };
  }, [intento, navigate, signOutInProgress]);

  const cambiar = (campo, valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setMensaje("");
  };
  const elegirApuesto = (valor) => {
    if (!valor && formulario.aposto && hayCantidades(formulario)) {
      setConfirmacion("cambiar");
      return;
    }
    setConfirmacion(null);
    if (!valor) setAbierto(null);
    cambiar("aposto", valor);
  };
  const confirmarCambio = () => {
    setFormulario((anterior) => ({ ...anterior, aposto: false, tiempo: "", unidad: "minutos", cantidad: "", apostado: "", perdido: "" }));
    setErrores({});
    setAbierto(null);
    setConfirmacion(null);
    requestAnimationFrame(() => document.querySelector('input[name="aposto"]:checked')?.focus());
  };
  const volverResumen = () => {
    if (JSON.stringify(formulario) !== JSON.stringify(inicial)) setConfirmacion("cancelar");
    else {
      setEstado("resumen");
      requestAnimationFrame(() => document.getElementById("resumen-titulo")?.focus());
    }
  };

  // El ref bloquea clics simultáneos antes de que React dibuje el estado de carga.
  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardandoRef.current || confirmacion) return;
    const resultado = validarActividad(formulario);
    setErrores(resultado.errores);
    if (Object.keys(resultado.errores).length) {
      // El campo enfocado debe estar dentro del mismo bloque que abrimos.
      const campoError = ["aposto", "apostado", "perdido", "tiempo", "cantidad"]
        .find((campo) => resultado.errores[campo]);
      const bloqueError = ["apostado", "perdido"].includes(campoError)
        ? "dinero" : ["tiempo", "cantidad"].includes(campoError) ? "tiempo" : null;
      if (bloqueError) setAbierto(bloqueError);
      setMensaje("Revisá los campos indicados antes de guardar.");
      requestAnimationFrame(() => document.getElementById(campoError === "aposto" ? "actividad-pregunta" : campoError)?.focus());
      return;
    }
    const revisionGuardado = revision.current;
    guardandoRef.current = true;
    setGuardando(true);
    setMensaje("");
    try {
      const respuesta = await guardarActividad(fecha, resultado.datos);
      if (revisionGuardado !== revision.current) return;
      const valores = desdeRegistro(respuesta.registro, respuesta.conductas);
      setGuardado(respuesta);
      setFormulario(valores);
      setInicial(valores);
      setEstado("resumen");
      setMensaje("Tu registro quedó guardado.");
      requestAnimationFrame(() => document.getElementById("resumen-titulo")?.focus());
    } catch (error) {
      if (revisionGuardado !== revision.current) return;
      if (error?.message?.includes("ACTIVIDAD_DIA_CAMBIO")) {
        setEstado("dia-cambio");
      } else setMensaje("No pudimos guardar. Tus respuestas siguen acá; revisá tu conexión y volvé a intentar.");
    } finally {
      if (revisionGuardado === revision.current) {
        guardandoRef.current = false;
        setGuardando(false);
      }
    }
  };

  const fechaVisible = fecha ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "";
  const alternar = (id) => setAbierto((actual) => actual === id ? null : id);
  const inhabilitado = guardando || Boolean(confirmacion);
  const resumenDinero = [formulario.apostado && `Apostado $ ${formulario.apostado}`, formulario.perdido && `Perdido $ ${formulario.perdido}`].filter(Boolean).join(" · ") || "Anotá lo que apostaste y perdiste, por separado";
  const resumenTiempo = [formulario.tiempo && `${formulario.tiempo} ${formulario.unidad}`, formulario.cantidad && `${formulario.cantidad} apuestas`].filter(Boolean).join(" · ") || "Sumá el tiempo y la cantidad, si querés";

  return (
    <div className="mi-actividad">
      <Link className="actividad-volver" to="/inicio">
        <ArrowLeft size={17} aria-hidden="true" /> Volver a Inicio
      </Link>
      {/* Esta presentación explica el propósito antes de pedir datos y mantiene
          visible el día que la base acepta para el registro. */}
      <header className="actividad-encabezado">
        <div className="actividad-introduccion">
          <h1>Mi actividad, a mi manera.</h1>
          <p>
            Registrá lo que pasó hoy y actualizalo durante el día.
            Elegí qué querés registrar y qué preferís dejar en blanco.
          </p>
        </div>
        <div className="actividad-hoy">
          {fecha && <time dateTime={fecha}>{fechaVisible}</time>}
          <span>Un registro privado, editable durante el día.</span>
        </div>
      </header>

      {estado === "cargando" && (
        <p role="status" className="actividad-estado">Cargando tu actividad...</p>
      )}
      {estado === "error" && (
        <div role="alert" className="actividad-estado">
          <p>No pudimos cargar tu actividad. Revisá tu conexión.</p>
          <button type="button" className="actividad-accion" onClick={() => {
            setEstado("cargando");
            setIntento((anterior) => anterior + 1);
          }}>
            Reintentar
          </button>
        </div>
      )}
      {estado === "dia-cambio" && (
        <div role="alert" className="actividad-estado">
          <p>
            Terminó el día que estabas editando. Para cuidar la fecha de tu registro,
            empezá el día nuevo sin trasladar estas respuestas.
          </p>
          <button type="button" className="actividad-accion" onClick={() => {
            setEstado("cargando");
            setMensaje("");
            setIntento((anterior) => anterior + 1);
          }}>
            Ir al día actual
          </button>
        </div>
      )}
      {estado === "resumen" && guardado && (
        <>
          <p role="status" className="actividad-sr">{mensaje}</p>
          <Resumen
            fecha={guardado.fecha}
            registro={guardado.registro}
            conductas={guardado.conductas}
            catalogo={catalogo}
            onEditar={() => {
              setMensaje("");
              setEstado("edicion");
              requestAnimationFrame(() => document.getElementById("actividad-pregunta")?.focus());
            }}
          />
        </>
      )}
      {estado === "edicion" && (
        <form onSubmit={guardar} noValidate>
          <div className="actividad-distribucion">
            <section className="actividad-principal" aria-labelledby="actividad-pregunta">
              <div className="actividad-principal-cabeza">
                <span className="actividad-icono actividad-icono-claro">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <span>Tu registro de hoy</span>
              </div>
              <h2 id="actividad-pregunta" tabIndex={-1}>¿Cómo fue tu día?</h2>
              <p>Empezá por contarnos si apostaste.</p>
              <fieldset
                className="actividad-eleccion"
                disabled={inhabilitado}
                aria-describedby={errores.aposto ? "aposto-error" : undefined}
              >
                <legend>¿Hoy apostaste? <span>(obligatorio)</span></legend>
                {[true, false].map((valor) => (
                  <label key={String(valor)} className={formulario.aposto === valor ? "seleccionada" : ""}>
                    <input
                      type="radio"
                      name="aposto"
                      required
                      checked={formulario.aposto === valor}
                      onChange={() => elegirApuesto(valor)}
                    />
                    <span>{valor ? "Hoy aposté" : "Hoy no aposté"}</span>
                    <Check size={18} aria-hidden="true" />
                  </label>
                ))}
              </fieldset>
              {errores.aposto && (
                <p id="aposto-error" className="actividad-error actividad-error-claro">{errores.aposto}</p>
              )}
              {confirmacion === "cambiar" && (
                <div className="actividad-confirmacion" role="group" aria-label="Confirmar cambio" aria-live="polite">
                  <p>Si cambiás a «Hoy no aposté», se borrarán las cantidades ingresadas.</p>
                  <button ref={botonConfirmar} type="button" onClick={confirmarCambio}>
                    Sí, borrar cantidades
                  </button>
                  <button type="button" onClick={() => {
                    setConfirmacion(null);
                    requestAnimationFrame(() => document.querySelector('input[name="aposto"]:checked')?.focus());
                  }}>
                    Conservar datos
                  </button>
                </div>
              )}
              <fieldset className="actividad-ganas" disabled={inhabilitado}>
                <legend>¿Tuviste ganas de apostar? <span>Opcional</span></legend>
                <div>
                  {[true, false].map((valor) => (
                    <label key={String(valor)} className={formulario.tuvoGanas === valor ? "seleccionada" : ""}>
                      <input
                        type="radio"
                        name="ganas"
                        checked={formulario.tuvoGanas === valor}
                        onChange={() => cambiar("tuvoGanas", valor)}
                      />
                      {valor ? "Sí" : "No"}
                    </label>
                  ))}
                  {formulario.tuvoGanas !== null && (
                    <button type="button" onClick={() => cambiar("tuvoGanas", null)}>Quitar respuesta</button>
                  )}
                </div>
              </fieldset>
            </section>

            {/* Cada zona opcional mantiene sus valores al cerrar su bloque. */}
            <div className="actividad-secundarios">
              <p className="actividad-opcionales">
                Sumá lo que quieras <span>Todo esto es opcional</span>
              </p>
              <div className="actividad-bento">
                <Bloque
                  id="dinero" titulo="Dinero" icono={Coins}
                  descripcion="Anotá montos apostados y perdidos por separado."
                  resumen={formulario.aposto !== true ? "Disponible cuando indiques que apostaste" : resumenDinero}
                  activo={abierto === "dinero"} alAlternar={() => alternar("dinero")}
                  deshabilitado={inhabilitado || formulario.aposto !== true}
                >
                  <div className="actividad-campos">
                    <Campo
                      id="apostado" titulo="Dinero apostado · ARS" value={formulario.apostado}
                      onChange={(evento) => cambiar("apostado", evento.target.value)}
                      error={errores.apostado} ayuda="Ejemplo: 1.250,50"
                    />
                    <Campo
                      id="perdido" titulo="Dinero perdido · ARS" value={formulario.perdido}
                      onChange={(evento) => cambiar("perdido", evento.target.value)}
                      error={errores.perdido} ayuda="Ejemplo: 1.250,50"
                    />
                  </div>
                </Bloque>
                <Bloque
                  id="tiempo" titulo="Tiempo y cantidad" icono={Clock3}
                  descripcion="Registrá cuánto tiempo y cuántas apuestas hiciste."
                  resumen={formulario.aposto !== true ? "Disponible cuando indiques que apostaste" : resumenTiempo}
                  activo={abierto === "tiempo"} alAlternar={() => alternar("tiempo")}
                  deshabilitado={inhabilitado || formulario.aposto !== true}
                >
                  <div className="actividad-campos">
                    <Campo
                      id="tiempo" titulo="Tiempo dedicado" value={formulario.tiempo}
                      onChange={(evento) => cambiar("tiempo", evento.target.value)}
                      error={errores.tiempo} ayuda="Por ejemplo: 1,5"
                    />
                    <div className="actividad-campo">
                      <label htmlFor="unidad">Unidad</label>
                      <select id="unidad" value={formulario.unidad} onChange={(evento) => cambiar("unidad", evento.target.value)}>
                        <option value="minutos">Minutos</option>
                        <option value="horas">Horas</option>
                      </select>
                    </div>
                    <Campo
                      id="cantidad" titulo="Cantidad de apuestas" inputMode="numeric"
                      value={formulario.cantidad} error={errores.cantidad}
                      onChange={(evento) => cambiar("cantidad", evento.target.value)}
                    />
                  </div>
                </Bloque>
                <Bloque
                  id="situaciones" titulo="Situaciones" icono={ListChecks}
                  descripcion="Señalá experiencias o consecuencias de tu día."
                  resumen={formulario.conductas.length
                    ? `${formulario.conductas.length} seleccionada${formulario.conductas.length === 1 ? "" : "s"}`
                    : "Identificá las situaciones que quieras registrar"}
                  activo={abierto === "situaciones"} alAlternar={() => alternar("situaciones")}
                  deshabilitado={inhabilitado}
                >
                  <fieldset className="actividad-situaciones">
                    <legend>¿Te pasó alguna de estas situaciones?</legend>
                    {catalogo.map((item) => (
                      <label key={item.codigo}>
                        <input
                          type="checkbox"
                          checked={formulario.conductas.includes(item.codigo)}
                          onChange={() => cambiar("conductas", formulario.conductas.includes(item.codigo)
                            ? formulario.conductas.filter((codigo) => codigo !== item.codigo)
                            : [...formulario.conductas, item.codigo])}
                        />
                        {item.nombre}
                      </label>
                    ))}
                  </fieldset>
                </Bloque>
                <Bloque
                  id="nota" titulo="Tu nota" icono={PencilLine}
                  descripcion="Escribí algo que quieras recordar sobre hoy."
                  resumen={formulario.nota.trim() || "Un espacio para ponerlo en palabras"}
                  activo={abierto === "nota"} alAlternar={() => alternar("nota")}
                  deshabilitado={inhabilitado}
                >
                  <div className="actividad-campo">
                    <label htmlFor="nota">¿Querés agregar algo?</label>
                    <textarea id="nota" rows="3" value={formulario.nota} onChange={(evento) => cambiar("nota", evento.target.value)} />
                  </div>
                </Bloque>
              </div>
            </div>
          </div>
          {confirmacion === "cancelar" && (
            <div className="actividad-aviso" role="group" aria-label="Confirmar descarte" aria-live="polite">
              <p>Hay cambios sin guardar. ¿Querés descartarlos?</p>
              <button ref={botonConfirmar} type="button" onClick={() => {
                setFormulario(inicial);
                setErrores({});
                setConfirmacion(null);
                setEstado("resumen");
                requestAnimationFrame(() => document.getElementById("resumen-titulo")?.focus());
              }}>
                Descartar cambios
              </button>
              <button type="button" onClick={() => {
                setConfirmacion(null);
                requestAnimationFrame(() => botonCancelarEdicion.current?.focus());
              }}>
                Seguir editando
              </button>
            </div>
          )}
          <div className="actividad-pie">
            <div>
              <p>Tu registro es privado.</p>
              <span>Podés actualizarlo durante el día.</span>
            </div>
            <div className="actividad-pie-acciones">
              {guardado && (
                <button ref={botonCancelarEdicion} type="button" className="actividad-cancelar" onClick={volverResumen} disabled={inhabilitado}>
                  Cancelar edición
                </button>
              )}
              <button type="submit" className="actividad-accion" disabled={inhabilitado}>
                {guardando ? "Guardando..." : "Guardar registro"}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          {mensaje && <p role="alert" className="actividad-mensaje">{mensaje}</p>}
        </form>
      )}
    </div>
  );
};
