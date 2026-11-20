/*
 * Catálogo de Escudo digital: presenta recursos publicados y conecta las medidas
 * declaradas por cada cuenta con el cliente de Supabase existente.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, EyeOff, HeartHandshake, Mail, MonitorSmartphone, Phone, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { supabase } from "../../../lib/supabase.js";
import "./EscudoDigitalPage.css";

const CATEGORIAS = [
  { id: "acceso", filtro: "Bloqueo de accesos", titulo: "Protegé tus dispositivos", icono: ShieldCheck, descripcion: "Las herramientas de bloqueo te permiten establecer límites en tus dispositivos y dificultar el acceso a páginas o aplicaciones de apuestas. Podés elegir la alternativa que mejor se adapte a tu navegador, computadora o celular." },
  { id: "estimulos", filtro: "Reducir estímulos", titulo: "Reducí los estímulos digitales", icono: EyeOff, descripcion: "La publicidad, las promociones y los contenidos relacionados con apuestas pueden aparecer constantemente mientras navegás por internet o utilizás redes sociales. Estos recursos te ayudan a gestionar ese contenido y reducir tu exposición a él." },
  { id: "apoyo", filtro: "Apoyo y orientación", titulo: "Encontrá apoyo", icono: HeartHandshake, descripcion: "Si tenés dudas sobre las apuestas, te preocupa alguna situación o simplemente necesitás hablar con alguien, existen organizaciones y servicios que pueden brindarte información, escucha y acompañamiento. Conocé los recursos disponibles en Argentina y elegí el que mejor se adapte a lo que necesitás." },
];

// Los contactos son destinos verificados, no valores derivados de texto arbitrario del catálogo.
const CONTACTOS = {
  sedronar: { numero: "141", etiqueta: "ORIENTACIÓN NACIONAL" },
  "línea 102": { numero: "102", etiqueta: "NIÑEZ Y ADOLESCENCIA" },
  "linea 102": { numero: "102", etiqueta: "NIÑEZ Y ADOLESCENCIA" },
  "orientación en urgencias de salud mental": { numero: "0800-999-0091", etiqueta: "SALUD MENTAL" },
  "jugadores anónimos argentina": { numero: "+54 9 11 4412-6745", etiqueta: "AYUDA MUTUA" },
  "ias formosa · juego responsable": { correo: "juegoresponsable@ias.gob.ar", etiqueta: "FORMOSA" },
};

const normalizar = (texto) => texto?.toLocaleLowerCase("es-AR").trim() ?? "";
const obtenerContacto = (nombre, identificador) => {
  const id = { "sedronar": "sedronar", "linea-102": "línea 102", "salud-mental": "orientación en urgencias de salud mental", "jugadores-anonimos": "jugadores anónimos argentina", "ias-formosa": "ias formosa · juego responsable" };
  if (id[identificador]) return CONTACTOS[id[identificador]];
  const clave = normalizar(nombre);
  if (CONTACTOS[clave]) return CONTACTOS[clave];
  if (clave.includes("sedronar")) return CONTACTOS.sedronar;
  if (clave.includes("102")) return CONTACTOS["línea 102"];
  if (clave.includes("salud mental")) return CONTACTOS["orientación en urgencias de salud mental"];
  if (clave.includes("jugadores anónimos")) return CONTACTOS["jugadores anónimos argentina"];
  if (clave.includes("ias formosa")) return CONTACTOS["ias formosa · juego responsable"];
  return null;
};
const destinoSeguro = (destino) => {
  try { const url = new URL(destino); return url.protocol === "https:" ? url.href : null; } catch { return null; }
};

function Medida({ medida, marcada, ocupado, error, onCambiar }) {
  return <div><label className="escudo-medida"><input type="checkbox" checked={marcada} disabled={ocupado} onChange={(evento) => onCambiar(medida, evento.target.checked)} /><span>{medida.descripcion}</span></label>{error && <p className="escudo-error" role="alert">{error}</p>}</div>;
}

function TarjetaRecurso({ recurso, medidas, estados, ocupadas, errores, onCambiar }) {
  const nombre = normalizar(recurso.nombre);
  const contacto = obtenerContacto(recurso.nombre, recurso.imagen_o_icono);
  const destino = destinoSeguro(recurso.enlace);
  const destacado = nombre.includes("betblocker") || nombre.includes("leechblock") || nombre.includes("sedronar") || nombre.includes("102");
  const clase = nombre.includes("betblocker") ? "petroleo" : nombre.includes("leechblock") ? "azul" : nombre.includes("sedronar") ? "marino" : nombre.includes("102") ? "violeta" : nombre.includes("salud mental") ? "azul" : "claro";
  const [copiado, setCopiado] = useState("");
  const copiar = async () => {
    try { await navigator.clipboard.writeText(contacto.numero); setCopiado("Número copiado"); }
    catch { setCopiado("No se pudo copiar el número. Podés seleccionarlo y copiarlo manualmente."); }
  };
  const Icono = recurso.categoria_escudo === "apoyo" ? HeartHandshake : recurso.categoria_escudo === "estimulos" ? SlidersHorizontal : MonitorSmartphone;
  return (
    <article className={`escudo-tarjeta escudo-tarjeta--${clase} ${destacado ? "escudo-tarjeta--destacada" : ""} ${recurso.categoria_escudo === "estimulos" ? "escudo-tarjeta--horizontal" : ""}`}>
      <div className="escudo-icono"><Icono size={22} aria-hidden="true" /></div>
      <div className="escudo-tarjeta-contenido">
        {contacto?.etiqueta && <p className="escudo-kicker">{contacto.etiqueta}</p>}
        {contacto?.numero && <p className="escudo-telefono">{contacto.numero}</p>}
        <h3>{recurso.nombre}</h3>
        <p>{recurso.utilidad}</p>
        {recurso.compatibilidad && <p className="escudo-meta">{recurso.compatibilidad}</p>}
        {recurso.alcance_territorial && <p className="escudo-meta">{recurso.alcance_territorial}</p>}
        {recurso.instrucciones && <details className="escudo-instrucciones"><summary>Cómo usar este recurso</summary><p>{recurso.instrucciones}</p></details>}
        <div className="escudo-acciones">
          {contacto?.numero && <><a className="escudo-accion escudo-accion--principal" href={`tel:${contacto.numero.replace(/[^+\d]/g, "")}`}><Phone size={16} aria-hidden="true" /> Llamar</a><button type="button" className="escudo-accion escudo-accion--secundaria" onClick={copiar}><Copy size={15} aria-hidden="true" /> Copiar número</button></>}
          {contacto?.correo && <a className="escudo-accion escudo-accion--principal" href={`mailto:${contacto.correo}`}><Mail size={16} aria-hidden="true" /> Enviar correo</a>}
          {destino && <a className="escudo-accion escudo-accion--enlace" href={destino} target="_blank" rel="noopener noreferrer">{contacto ? "Información oficial" : recurso.categoria_escudo === "acceso" ? "Conocer herramienta" : "Acceder al recurso"} <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (abre en otra pestaña)</span></a>}
        </div>
        <span className="escudo-aviso" role="status">{copiado}</span>
        {medidas.length > 0 && <div className="escudo-tarjeta-medidas">{medidas.map((medida) => <Medida key={medida.id} medida={medida} marcada={Boolean(estados[medida.id])} ocupado={Boolean(ocupadas[medida.id])} error={errores[medida.id]} onCambiar={onCambiar} />)}</div>}
      </div>
    </article>
  );
}

export const EscudoDigitalPage = () => {
  const [categoria, setCategoria] = useState("todos");
  const [datos, setDatos] = useState({ recursos: [], medidas: [], estados: {}, usuario: null });
  const [estado, setEstado] = useState("cargando");
  const [erroresMedidas, setErroresMedidas] = useState({});
  const [ocupadas, setOcupadas] = useState({});
  const generacion = useRef(0);
  const cuentaActual = useRef(undefined);
  const enCurso = useRef(new Set());

  // El contador invalida respuestas pendientes al cambiar de sesión o desmontar.
  const cargar = useCallback(async (usuario) => {
    const turno = ++generacion.current;
    cuentaActual.current = usuario?.id ?? null;
    setDatos({ recursos: [], medidas: [], estados: {}, usuario: null });
    setOcupadas({});
    setErroresMedidas({});
    enCurso.current.clear();
    setEstado("cargando");
    try {
      const [recursos, medidas, estados] = await Promise.all([
        supabase.from("recursos").select("id,nombre,utilidad,instrucciones,enlace,compatibilidad,categoria_escudo,alcance_territorial,imagen_o_icono").eq("publicado", true).not("categoria_escudo", "is", null).order("id"),
        usuario ? supabase.from("medidas_proteccion").select("id,recurso_id,descripcion") : Promise.resolve({ data: [], error: null }),
        usuario ? supabase.from("medidas_usuario").select("medida_id,realizada").eq("usuario_id", usuario.id) : Promise.resolve({ data: [], error: null }),
      ]);
      if (recursos.error || medidas.error || estados.error) throw recursos.error || medidas.error || estados.error;
      if (turno !== generacion.current) return;
      const idsRecursos = new Set((recursos.data ?? []).map((recurso) => recurso.id));
      setDatos({ recursos: recursos.data ?? [], medidas: (medidas.data ?? []).filter((medida) => idsRecursos.has(medida.recurso_id)), estados: Object.fromEntries((estados.data ?? []).map((item) => [item.medida_id, item.realizada])), usuario });
      setEstado("listo");
    } catch { if (turno === generacion.current) setEstado("error"); }
  }, []);

  useEffect(() => {
    let activo = true;
    let huboEvento = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      huboEvento = true;
      const nuevaCuenta = sesion?.user?.id ?? null;
      if (cuentaActual.current === nuevaCuenta) return;
      const turno = ++generacion.current;
      cuentaActual.current = sesion?.user?.id ?? null;
      setDatos({ recursos: [], medidas: [], estados: {}, usuario: null });
      setEstado("cargando");
      // Evita iniciar consultas Supabase dentro de la devolución de Auth.
      setTimeout(() => { if (activo && turno === generacion.current) cargar(sesion?.user ?? null); }, 0);
    });
    supabase.auth.getUser().then(({ data, error }) => {
      if (!activo || huboEvento) return;
      if (error) { setEstado("error"); return; }
      cargar(data.user);
    }).catch(() => { if (activo && !huboEvento) setEstado("error"); });
    return () => { activo = false; generacion.current += 1; cuentaActual.current = undefined; subscription.unsubscribe(); };
  }, [cargar]);

  const cambiarMedida = async (medida, realizada) => {
    const usuarioId = datos.usuario?.id;
    if (!usuarioId || enCurso.current.has(medida.id)) return;
    const turno = generacion.current;
    enCurso.current.add(medida.id);
    setOcupadas((anterior) => ({ ...anterior, [medida.id]: true }));
    setErroresMedidas((anterior) => ({ ...anterior, [medida.id]: "" }));
    // La política solo permite actualizar realizada; usuario y medida son claves inmutables.
    const existente = Object.hasOwn(datos.estados, medida.id);
    const consulta = existente
      ? supabase.from("medidas_usuario").update({ realizada }).eq("usuario_id", usuarioId).eq("medida_id", medida.id)
      : supabase.from("medidas_usuario").insert({ usuario_id: usuarioId, medida_id: medida.id, realizada });
    let error;
    try { ({ error } = await consulta); } catch { error = true; }
    if (cuentaActual.current !== usuarioId || generacion.current !== turno) return;
    // Otra pestaña pudo crear la fila: releemos su valor sin sobrescribirlo.
    if (!existente && error?.code === "23505") {
      try {
        const actual = await supabase.from("medidas_usuario").select("realizada").eq("usuario_id", usuarioId).eq("medida_id", medida.id).maybeSingle();
        if (cuentaActual.current !== usuarioId || generacion.current !== turno) return;
        if (!actual.error && actual.data) {
          setDatos((anterior) => ({ ...anterior, estados: { ...anterior.estados, [medida.id]: actual.data.realizada } }));
          setErroresMedidas((anterior) => ({ ...anterior, [medida.id]: "Esta medida cambió en otra pestaña. Actualizamos su estado; volvé a seleccionarla si querés cambiarlo." }));
          enCurso.current.delete(medida.id);
          setOcupadas((anterior) => ({ ...anterior, [medida.id]: false }));
          return;
        }
      } catch { /* Se informa el error de guardado si tampoco fue posible releer. */ }
    }
    if (cuentaActual.current !== usuarioId || generacion.current !== turno) return;
    enCurso.current.delete(medida.id);
    setOcupadas((anterior) => ({ ...anterior, [medida.id]: false }));
    if (error) { setErroresMedidas((anterior) => ({ ...anterior, [medida.id]: "No pudimos guardar la medida. Probá de nuevo." })); return; }
    setDatos((anterior) => ({ ...anterior, estados: { ...anterior.estados, [medida.id]: realizada } }));
  };

  const reintentar = async () => {
    setEstado("cargando");
    const { data, error } = await supabase.auth.getUser();
    if (error) { setEstado("error"); return; }
    cargar(data.user);
  };
  const categoriasVisibles = categoria === "todos" ? CATEGORIAS : CATEGORIAS.filter((item) => item.id === categoria);
  return (
    <div className="escudo-pagina">
      <header className="escudo-encabezado"><div className="escudo-encabezado-icono"><ShieldCheck size={30} aria-hidden="true" /></div><div><h1>Escudo digital</h1><p className="escudo-subtitulo">Herramientas que te pueden ayudar en tu día a día.</p></div></header>
      <p className="escudo-introduccion">Encontrá recursos para gestionar tu entorno digital, reducir la exposición a las apuestas y buscar apoyo cuando lo necesites.</p>
      <nav className="escudo-filtros" aria-label="Categorías de Escudo digital">{[{ id: "todos", filtro: "Todos los recursos" }, ...CATEGORIAS].map((item) => <button key={item.id} type="button" aria-pressed={categoria === item.id} onClick={() => setCategoria(item.id)}>{item.filtro}</button>)}</nav>
      {estado === "cargando" && <p className="escudo-estado" role="status">Cargando recursos…</p>}
      {estado === "error" && <div className="escudo-estado" role="alert"><p>No pudimos cargar los recursos. Revisá tu conexión e intentá nuevamente.</p><button type="button" onClick={reintentar}>Volver a intentar</button></div>}
      {estado === "listo" && <>
        {categoriasVisibles.map(({ id, titulo, descripcion, icono: Icono }) => {
          const orden = ["betblocker", "leechblock", "gamban", "family-link", "apple", "anuncios", "redes", "consumidor", "sedronar", "linea-102", "salud-mental", "jugadores-anonimos", "ias-formosa"];
          const recursos = datos.recursos.filter((recurso) => recurso.categoria_escudo === id).sort((a, b) => { const posicion = (item) => { const indice = orden.indexOf(item.imagen_o_icono); return indice < 0 ? orden.length : indice; }; return posicion(a) - posicion(b); });
          return <section className="escudo-seccion" key={id}><div className={`escudo-seccion-titulo escudo-seccion-titulo--${id}`}><Icono size={23} aria-hidden="true" /><h2>{titulo}</h2></div><p className="escudo-seccion-descripcion">{descripcion}</p>{recursos.length ? <div className={`escudo-grid escudo-grid--${id}`}>{recursos.map((recurso) => <TarjetaRecurso key={recurso.id} recurso={recurso} medidas={datos.medidas.filter((medida) => { const origen = recurso.imagen_o_icono === "gamban" ? datos.recursos.find((item) => item.imagen_o_icono === "betblocker")?.id : recurso.id; return medida.recurso_id === origen; })} estados={datos.estados} ocupadas={ocupadas} errores={erroresMedidas} onCambiar={cambiarMedida} />)}</div> : <p className="escudo-estado">No hay recursos publicados en esta categoría por el momento.</p>}</section>;
        })}
        <section className="escudo-resumen"><div className="escudo-resumen-titulo"><span className="escudo-icono"><ShieldCheck size={22} aria-hidden="true" /></span><div><h2>Mis medidas de protección</h2><p>Llevá un registro personal de las acciones que decidiste realizar.</p></div></div>{!datos.usuario ? <p>Iniciá sesión para registrar tus medidas de forma privada.</p> : datos.medidas.length ? <div className="escudo-lista-medidas">{datos.medidas.map((medida) => <Medida key={medida.id} medida={medida} marcada={Boolean(datos.estados[medida.id])} ocupado={Boolean(ocupadas[medida.id])} error={erroresMedidas[medida.id]} onCambiar={cambiarMedida} />)}</div> : <p>Todavía no hay medidas disponibles.</p>}<p className="escudo-privacidad"><Check size={16} aria-hidden="true" /> Tus medidas son privadas y podés modificarlas cuando quieras.</p></section>
      </>}
    </div>
  );
};
