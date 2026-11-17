/*
 * Coordina Historial y progreso: sesión, períodos y lecturas privadas.
 * Los componentes vecinos presentan los datos obtenidos mediante Supabase.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import { supabase } from "../../../lib/supabase.js";
import { CabeceraHistorial } from "./CabeceraHistorial.jsx";
import { HistorialVista } from "./HistorialVista.jsx";
import { AvancesVista } from "./AvancesVista.jsx";
import { consultarFechaActual, consultarFechasMes, consultarHistorialCompleto, consultarNotas, consultarRegistros } from "./historialDatos.js";
import { alinearBloque30, desplazarPeriodo, fechaCordoba, obtenerPeriodo, puedeNavegar } from "./historialFechas.js";

const PERIODOS = ["dia", "semana", "mes", "30dias"];

// Las fechas de la URL son días de calendario; no se interpretan en la zona del navegador.
const esFechaValida = (fecha) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return false;
  const fechaUtc = new Date(`${fecha}T12:00:00Z`);
  return !Number.isNaN(fechaUtc.getTime()) && fechaUtc.toISOString().slice(0, 10) === fecha;
};

const limitarFecha = (fecha, desde, hasta) => {
  if (!esFechaValida(fecha)) return hasta;
  return fecha < desde ? desde : fecha > hasta ? hasta : fecha;
};

// Distingue el período vigente de uno histórico aunque pertenezcan al mismo filtro.
const esPeriodoActual = (tipo, ancla, creacion, hoy) => {
  if (tipo === "30dias") return ancla === hoy;
  const { inicioNominal, finNominal } = obtenerPeriodo(tipo, ancla, creacion, hoy);
  return inicioNominal <= hoy && hoy <= finNominal;
};

export const HistorialYProgresoPage = () => {
  const navigate = useNavigate();
  const { signOutInProgress } = useOutletContext();
  const [parametros, setParametros] = useSearchParams();
  const [cuenta, setCuenta] = useState(null);
  const [estadoCuenta, setEstadoCuenta] = useState("cargando");
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [estadoHistorico, setEstadoHistorico] = useState("cargando");
  const [revisionHistorico, setRevisionHistorico] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [estadoRegistros, setEstadoRegistros] = useState("cargando");
  const [claveRegistros, setClaveRegistros] = useState("");
  const [fechasMes, setFechasMes] = useState([]);
  const [estadoMes, setEstadoMes] = useState("cargando");
  const [claveMesCargado, setClaveMesCargado] = useState("");
  const [detalleExterno, setDetalleExterno] = useState(null);
  const [estadoDetalle, setEstadoDetalle] = useState("cargando");
  const [claveDetalleCargado, setClaveDetalleCargado] = useState("");
  const [revisionMes, setRevisionMes] = useState(0);
  const [revisionDetalle, setRevisionDetalle] = useState(0);
  const [notas, setNotas] = useState([]);
  const [notasEstado, setNotasEstado] = useState("cargando");
  const [cursorNotas, setCursorNotas] = useState(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [revision, setRevision] = useState(0);
  const [revisionNotas, setRevisionNotas] = useState(0);
  const cuentaActual = useRef(undefined);
  const revisionSesion = useRef(0);
  const cargaNotasEnCurso = useRef(false);
  const versionNotasActual = useRef(0);
  const montado = useRef(true);
  const cuentaAnterior = useRef(null);
  const parametrosActuales = useRef(parametros);
  useEffect(() => { parametrosActuales.current = parametros; }, [parametros]);

  const vista = parametros.get("vista") === "avances" ? "avances" : "historial";
  const periodoUrl = parametros.get("periodo");
  const periodo = PERIODOS.includes(periodoUrl) ? periodoUrl : "30dias";
  const fechaUrl = cuenta ? limitarFecha(parametros.get("fecha"), cuenta.creacion, cuenta.hoy) : "";
  // Las ventanas móviles de 30 días comparten un origen y nunca se superponen.
  const ancla = cuenta && periodo === "30dias" ? alinearBloque30(fechaUrl, cuenta.hoy) : fechaUrl;
  const rango = cuenta ? obtenerPeriodo(periodo, ancla, cuenta.creacion, cuenta.hoy) : null;
  const desde = rango?.desde;
  const hasta = rango?.hasta;
  // El resultado solo pertenece al rango exacto que estaba activo al consultarlo.
  const claveRango = cuenta && desde && hasta ? `${cuenta.id}|${desde}|${hasta}|${cuenta.hoy}` : "";
  const estadoVisible = claveRango === claveRegistros ? estadoRegistros : "cargando";
  const fechaSeleccionada = rango
    ? parametros.has("seleccion")
      ? limitarFecha(parametros.get("seleccion"), cuenta.creacion, cuenta.hoy)
      : hasta
    : "";
  const mesUrl = parametros.get("mes");
  const mesValido = /^\d{4}-(0[1-9]|1[0-2])$/.test(mesUrl || "")
    && mesUrl >= cuenta?.creacion.slice(0, 7) && mesUrl <= cuenta?.hoy.slice(0, 7);
  const mesCalendario = cuenta ? (mesValido ? mesUrl : hasta.slice(0, 7)) : "";
  const inicioMes = mesCalendario ? `${mesCalendario}-01` : "";
  const finMes = mesCalendario
    ? new Date(Date.UTC(Number(mesCalendario.slice(0, 4)), Number(mesCalendario.slice(5, 7)), 0)).toISOString().slice(0, 10)
    : "";
  const desdeMes = cuenta && inicioMes < cuenta.creacion ? cuenta.creacion : inicioMes;
  const hastaMes = cuenta && finMes > cuenta.hoy ? cuenta.hoy : finMes;
  const claveMes = cuenta && desdeMes && hastaMes ? `${cuenta.id}|${desdeMes}|${hastaMes}` : "";
  const estadoMesVisible = claveMes === claveMesCargado ? estadoMes : "cargando";
  const fueraDelPeriodo = fechaSeleccionada && (fechaSeleccionada < desde || fechaSeleccionada > hasta);
  const claveDetalle = cuenta && fueraDelPeriodo ? `${cuenta.id}|${fechaSeleccionada}` : "";
  const estadoDetalleVisible = !fueraDelPeriodo ? "listo"
    : claveDetalle === claveDetalleCargado ? estadoDetalle : "cargando";
  const registroSeleccionado = fueraDelPeriodo ? detalleExterno
    : registros.find((registro) => registro.fecha === fechaSeleccionada);

  // Los filtros y la vista viven en la URL para sobrevivir a recargas y cambios de pestaña.
  const cambiarParametros = (cambios) => {
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales);
      for (const [clave, valor] of Object.entries(cambios)) {
        if (valor === null) siguientes.delete(clave);
        else siguientes.set(clave, valor);
      }
      return siguientes;
    });
  };

  // Nunca conservamos registros de una cuenta anterior cuando cambia la sesión.
  useEffect(() => {
    montado.current = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const usuarioId = sesion?.user?.id ?? null;
      if (cuentaActual.current === usuarioId) return;
      cuentaActual.current = usuarioId;
      cuentaAnterior.current = null;
      revisionSesion.current += 1;
      versionNotasActual.current += 1;
      cargaNotasEnCurso.current = false;
      setCuenta(null);
      setHistorialCompleto([]);
      setEstadoHistorico("cargando");
      setRegistros([]);
      setClaveRegistros("");
      setFechasMes([]);
      setClaveMesCargado("");
      setDetalleExterno(null);
      setClaveDetalleCargado("");
      setNotas([]);
      setCursorNotas(null);
      setMostrarTodas(false);
      setEstadoCuenta("cargando");
      setRevision((valor) => valor + 1);
    });
    return () => {
      montado.current = false;
      revisionSesion.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  // Auth confirma la cuenta y la base aporta el día vigente en Córdoba.
  useEffect(() => {
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const cargarCuenta = async () => {
      setEstadoCuenta("cargando");
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!vigente || versionSesion !== revisionSesion.current) return;
        if (error && error.name !== "AuthSessionMissingError") throw error;
        if (!data.user) {
          if (!signOutInProgress.current) navigate("/login", { replace: true });
          return;
        }
        if (cuentaActual.current !== undefined && cuentaActual.current !== data.user.id) {
          throw new Error("La sesión cambió durante la consulta.");
        }
        const hoy = await consultarFechaActual();
        const creacion = fechaCordoba(data.user.created_at);
        if (!esFechaValida(hoy) || !esFechaValida(creacion) || creacion > hoy) {
          throw new Error("No se pudo establecer el período disponible.");
        }
        if (!vigente || versionSesion !== revisionSesion.current) return;
        // Si cambió el día, la vista actual se desplaza con él; las históricas no.
        const anterior = cuentaAnterior.current;
        if (anterior?.id === data.user.id && anterior.hoy !== hoy) {
          const actuales = parametrosActuales.current;
          const tipoAnterior = PERIODOS.includes(actuales.get("periodo")) ? actuales.get("periodo") : "30dias";
          const anclaAnterior = limitarFecha(actuales.get("fecha"), anterior.creacion, anterior.hoy);
          if (actuales.has("fecha") && esPeriodoActual(tipoAnterior, anclaAnterior, anterior.creacion, anterior.hoy)) {
            const siguientes = new URLSearchParams(actuales);
            siguientes.set("fecha", hoy);
            navigate({ search: `?${siguientes.toString()}` }, { replace: true });
          }
        }
        cuentaAnterior.current = { id: data.user.id, creacion, hoy };
        setCuenta({ id: data.user.id, creacion, hoy });
        setEstadoCuenta("listo");
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoCuenta("error");
      }
    };
    cargarCuenta();
    return () => { vigente = false; };
  }, [navigate, revision, signOutInProgress]);

  // El período efectivo acota la lectura; RLS también protege cada registro.
  useEffect(() => {
    if (!cuenta || !desde || !hasta || estadoCuenta !== "listo") return undefined;
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const cargarRegistros = async () => {
      setEstadoRegistros("cargando");
      setClaveRegistros(claveRango);
      try {
        const datos = await consultarRegistros(cuenta.id, desde, hasta);
        if (!vigente || versionSesion !== revisionSesion.current) return;
        setRegistros(datos);
        setEstadoRegistros("listo");
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoRegistros("error");
      }
    };
    cargarRegistros();
    return () => { vigente = false; };
  }, [cuenta, estadoCuenta, desde, hasta, claveRango]);

  // Se consultan solo fecha y declaración para calcular el recorrido acumulado.
  useEffect(() => {
    if (!cuenta || estadoCuenta !== "listo" || vista !== "avances") return undefined;
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const cargar = async () => {
      setEstadoHistorico("cargando");
      try {
        const datos = await consultarHistorialCompleto(cuenta.id, cuenta.creacion, cuenta.hoy);
        if (vigente && versionSesion === revisionSesion.current) {
          setHistorialCompleto(datos);
          setEstadoHistorico("listo");
        }
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoHistorico("error");
      }
    };
    cargar();
    return () => { vigente = false; };
  }, [cuenta, estadoCuenta, vista, revisionHistorico]);

  // El mes se consulta por separado: no altera los cálculos del período elegido.
  useEffect(() => {
    if (!cuenta || !claveMes || estadoCuenta !== "listo") return undefined;
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const cargarMes = async () => {
      setEstadoMes("cargando");
      setClaveMesCargado(claveMes);
      try {
        const fechas = await consultarFechasMes(cuenta.id, desdeMes, hastaMes);
        if (vigente && versionSesion === revisionSesion.current) {
          setFechasMes(fechas);
          setEstadoMes("listo");
        }
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoMes("error");
      }
    };
    cargarMes();
    return () => { vigente = false; };
  }, [cuenta, estadoCuenta, desdeMes, hastaMes, claveMes, revisionMes]);

  // Para una fecha exterior al filtro solo se lee ese día y se mantiene el período.
  useEffect(() => {
    if (!cuenta || !claveDetalle || estadoCuenta !== "listo") return undefined;
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const cargarDetalle = async () => {
      setEstadoDetalle("cargando");
      setClaveDetalleCargado(claveDetalle);
      try {
        const datos = await consultarRegistros(cuenta.id, fechaSeleccionada, fechaSeleccionada);
        if (vigente && versionSesion === revisionSesion.current) {
          setDetalleExterno(datos[0] ?? null);
          setEstadoDetalle("listo");
        }
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoDetalle("error");
      }
    };
    cargarDetalle();
    return () => { vigente = false; };
  }, [cuenta, estadoCuenta, claveDetalle, fechaSeleccionada, revisionDetalle]);

  // Las reflexiones recientes son globales: cambiar el filtro no cambia sus resultados.
  useEffect(() => {
    if (!cuenta || estadoCuenta !== "listo") return undefined;
    let vigente = true;
    const versionSesion = revisionSesion.current;
    const versionNotas = ++versionNotasActual.current;
    cargaNotasEnCurso.current = false;
    const cargarNotas = async () => {
      setNotasEstado("cargando");
      try {
        const resultado = await consultarNotas(cuenta.id, {
          desde: cuenta.creacion, hoy: cuenta.hoy, limite: 3,
        });
        if (!vigente || versionSesion !== revisionSesion.current || versionNotas !== versionNotasActual.current) return;
        setNotas(resultado.notas);
        setCursorNotas(resultado.siguienteCursor);
        setNotasEstado("listo");
      } catch {
        if (vigente && versionSesion === revisionSesion.current && versionNotas === versionNotasActual.current) setNotasEstado("error");
      }
    };
    cargarNotas();
    return () => {
      vigente = false;
      if (versionNotas === versionNotasActual.current) versionNotasActual.current += 1;
    };
  }, [cuenta, estadoCuenta, revisionNotas]);

  // La paginación usa un cursor de fecha, sin volver a consultar las notas ya visibles.
  const cargarMasNotas = async () => {
    if (notasEstado === "error") {
      setRevisionNotas((valor) => valor + 1);
      return;
    }
    if (!cuenta || !cursorNotas || cargaNotasEnCurso.current) return;
    cargaNotasEnCurso.current = true;
    const versionSesion = revisionSesion.current;
    const versionNotas = versionNotasActual.current;
    setNotasEstado("cargando-mas");
    try {
      const resultado = await consultarNotas(cuenta.id, {
        antes: cursorNotas, desde: cuenta.creacion, hoy: cuenta.hoy, limite: 12,
      });
      if (!montado.current || versionSesion !== revisionSesion.current || versionNotas !== versionNotasActual.current) return;
      setNotas((anteriores) => [...anteriores, ...resultado.notas]);
      setCursorNotas(resultado.siguienteCursor);
      setNotasEstado("listo");
    } catch {
      if (montado.current && versionSesion === revisionSesion.current && versionNotas === versionNotasActual.current) setNotasEstado("error-mas");
    } finally {
      if (versionSesion === revisionSesion.current && versionNotas === versionNotasActual.current) cargaNotasEnCurso.current = false;
    }
  };

  // Al volver desde otra pestaña o cambiar el día se consultan nuevamente los datos.
  useEffect(() => {
    if (!cuenta || estadoCuenta !== "listo") return undefined;
    let vigente = true;
    let consultaPendiente = false;
    const versionSesion = revisionSesion.current;
    const alVolver = () => {
      if (!document.hidden && !signOutInProgress.current) setRevision((valor) => valor + 1);
    };
    const comprobarDia = async () => {
      if (document.hidden || consultaPendiente || signOutInProgress.current) return;
      consultaPendiente = true;
      try {
        const hoy = await consultarFechaActual();
        if (vigente && versionSesion === revisionSesion.current && hoy !== cuenta.hoy) {
          setRevision((valor) => valor + 1);
        }
      } catch {
        if (vigente && versionSesion === revisionSesion.current) setEstadoCuenta("error");
      } finally {
        consultaPendiente = false;
      }
    };
    const intervalo = window.setInterval(comprobarDia, 60_000);
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cuenta, estadoCuenta, signOutInProgress]);

  const reintentar = () => setRevision((valor) => valor + 1);
  const cambiarPeriodo = (tipo) => cambiarParametros({
    periodo: tipo,
    // La fecha elegida determina el bloque y permanece seleccionada al cambiar el filtro.
    fecha: tipo === "30dias" ? alinearBloque30(fechaSeleccionada, cuenta.hoy) : ancla,
    seleccion: fechaSeleccionada, mes: null,
  });
  const moverPeriodo = (direccion) => cambiarParametros({
    fecha: desplazarPeriodo(periodo, ancla, direccion), seleccion: null, mes: null,
  });
  const moverMes = (direccion) => cambiarParametros({
    mes: desplazarPeriodo("mes", `${mesCalendario}-01`, direccion).slice(0, 7),
  });

  return (
    <section className="historial-pagina" aria-labelledby={estadoCuenta === "listo" ? "historial-titulo" : undefined}>
      {estadoCuenta === "cargando" && <p role="status">Cargando tu historial...</p>}
      {estadoCuenta === "error" && (
        <div role="alert">
          <p>No pudimos cargar tu historial. Revisá tu conexión e intentá nuevamente.</p>
          <button type="button" onClick={reintentar}>Reintentar</button>
        </div>
      )}
      {estadoCuenta === "listo" && cuenta && rango && (
        <>
          <CabeceraHistorial
            vista={vista}
            onCambiarVista={(siguiente) => cambiarParametros({ vista: siguiente })}
            periodo={periodo}
            onCambiarPeriodo={cambiarPeriodo}
            desde={rango.desde}
            hasta={rango.hasta}
            onAnterior={() => moverPeriodo(-1)}
            onSiguiente={() => moverPeriodo(1)}
            onPeriodoActual={() => cambiarParametros({ fecha: cuenta.hoy, seleccion: null, mes: null })}
            enPeriodoActual={esPeriodoActual(periodo, ancla, cuenta.creacion, cuenta.hoy)}
            puedeAnterior={puedeNavegar(periodo, ancla, -1, cuenta.creacion, cuenta.hoy)}
            puedeSiguiente={puedeNavegar(periodo, ancla, 1, cuenta.creacion, cuenta.hoy)}
          />
          <div className="historial-panel" id="panel-historial" role="tabpanel" aria-labelledby="tab-historial" hidden={vista !== "historial"}>
            {estadoVisible === "cargando" && <p role="status">Cargando tus registros...</p>}
            {estadoVisible === "error" && (
              <div role="alert"><p>No pudimos consultar tus registros.</p><button type="button" onClick={reintentar}>Reintentar</button></div>
            )}
            {estadoVisible === "listo" && (
              <HistorialVista
                hoy={cuenta.hoy}
                desde={rango.desde}
                hasta={rango.hasta}
                registros={registros}
                mes={mesCalendario}
                desdeMes={desdeMes}
                hastaMes={hastaMes}
                fechasMes={fechasMes}
                estadoMes={estadoMesVisible}
                onReintentarMes={() => setRevisionMes((valor) => valor + 1)}
                onMesAnterior={() => moverMes(-1)}
                onMesSiguiente={() => moverMes(1)}
                puedeMesAnterior={mesCalendario > cuenta.creacion.slice(0, 7)}
                puedeMesSiguiente={mesCalendario < cuenta.hoy.slice(0, 7)}
                registroSeleccionado={registroSeleccionado}
                estadoDetalle={estadoDetalleVisible}
                fueraDelPeriodo={fueraDelPeriodo}
                onReintentarDetalle={() => setRevisionDetalle((valor) => valor + 1)}
                fechaSeleccionada={fechaSeleccionada}
                onSeleccionarFecha={(fecha) => cambiarParametros({ seleccion: fecha, mes: fecha.slice(0, 7) })}
                notas={mostrarTodas ? notas : notas.slice(0, 3)}
                notasEstado={notasEstado}
                mostrarTodas={mostrarTodas}
                onVerTodas={() => setMostrarTodas(true)}
                onVolverNotas={() => setMostrarTodas(false)}
                cargarMasNotas={cargarMasNotas}
                hayMasNotas={Boolean(cursorNotas)}
              />
            )}
          </div>
          <div className="historial-panel" id="panel-avances" role="tabpanel" aria-labelledby="tab-avances" hidden={vista !== "avances"}>
            {(estadoVisible === "cargando" || estadoHistorico === "cargando") && <p role="status">Cargando tus avances...</p>}
            {(estadoVisible === "error" || estadoHistorico === "error") && (
              <div role="alert"><p>No pudimos consultar tus avances.</p><button type="button" onClick={() => { reintentar(); setRevisionHistorico((valor) => valor + 1); }}>Reintentar</button></div>
            )}
            {estadoVisible === "listo" && estadoHistorico === "listo" && (
              <AvancesVista registrosPeriodo={registros} registrosHistoricos={historialCompleto}
                desde={rango.desde} hasta={rango.hasta} hoy={cuenta.hoy} />
            )}
          </div>
        </>
      )}
    </section>
  );
};
