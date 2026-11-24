/* La experiencia ficticia conserva decisiones únicamente en memoria. */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LivingPOV } from './LivingPOV.jsx';
import { obtenerEscena } from './guionFinal.js';
import { evaluarDecisiones } from './evaluarDecisiones.js';
import { supabase } from '../../../lib/supabase.js';
import './EvaluarComportamientoPage.css';

function Modal({ titulo, cerrar, children }) {
  const ref = useRef(null);
  useEffect(() => { const dialogo = ref.current; dialogo.showModal(); return () => dialogo.close(); }, []);
  return <dialog ref={ref} className="final-modal" aria-label={titulo} onCancel={(e) => { e.preventDefault(); cerrar(); }}><header><span>{titulo}</span><button type="button" onClick={cerrar} aria-label="Cerrar">×</button></header>{children}</dialog>;
}
function Celular({ momento }) {
  const [tab, setTab] = useState('Billetera');
  return <><div className="final-telefonotabs">{['Billetera','Mensajes','Mis planes'].map((item)=><button key={item} aria-pressed={tab === item} onClick={()=>setTab(item)}>{item}</button>)}</div>{tab === 'Billetera' ? <><h3>Saldo ficticio: $12.000</h3><p>Salida del sábado: $6.000</p><p>Transporte de la semana: $2.000</p><p>Dinero sin destino asignado: $4.000</p></> : tab === 'Mensajes' ? <><h3>Los pibes ⚽</h3><p>Gonza: Qué partidazo amigo</p><p>Emi: Para mí termina en penales</p><p>Juli: Che, el sábado nos juntamos también, ¿sí?</p>{momento >= 1 && <p>Gonza: Le puse plata al partido; si hay otro gol espero cobrar más.</p>}{momento >= 3 && <p>Juli: El sábado a comer, no se olviden jajaja</p>}</> : <><h3>Mis planes</h3><p>Sábado: salir a comer con los chicos · $6.000</p><p>Lunes a viernes: transporte de la semana · $2.000</p></>}<small>Información ficticia.</small></>;
}
export function EvaluarComportamientoPage() {
  const [fase,setFase]=useState('catalogo'); const [modal,setModal]=useState(null); const [pantalla,setPantalla]=useState(false); const [momento,setMomento]=useState(0); const [decisiones,setDecisiones]=useState([]); const [reaccion,setReaccion]=useState(null); const marco=useRef(null); const bloqueo=useRef(false);
  const salirPantalla=async()=>{if(document.fullscreenElement) await document.exitFullscreen().catch(()=>{});};
  const reiniciar=()=>{salirPantalla();setFase('catalogo');setMomento(0);setDecisiones([]);setReaccion(null);setModal(null);bloqueo.current=false;};
  useEffect(()=>()=>{if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});},[]);
  useEffect(() => {
    let cuenta;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const actual = sesion?.user?.id ?? null;
      if (cuenta !== undefined && cuenta !== actual) { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); setFase('catalogo'); setMomento(0); setDecisiones([]); setReaccion(null); setModal(null); bloqueo.current = false; }
      cuenta = actual;
    });
    return () => subscription.unsubscribe();
  }, []);
  const comenzar=async()=>{setModal(null);setFase('experiencia');if(pantalla && marco.current?.requestFullscreen) await marco.current.requestFullscreen().catch(()=>{});};
  const elegir=(opcion)=>{if(bloqueo.current || reaccion)return;bloqueo.current=true;setDecisiones((prev)=>[...prev,opcion.id]);setReaccion(opcion);if(opcion.etiqueta==='billetera')setModal('Tu celular');};
  const seguir=()=>{if(!reaccion)return;setReaccion(null);setMomento((valor)=>valor+1);bloqueo.current=false;};
  const finalizar=async()=>{await salirPantalla();setFase('resultado');};
  const escena=obtenerEscena(momento,decisiones); const observaciones=evaluarDecisiones(decisiones);
  return <div ref={marco} className="final-pagina"><div className="final-marco">{fase==='catalogo' ? <><p className="final-etiqueta">DETECCIÓN / EXPERIENCIAS</p><h1>Ponete en situación.</h1><p>Viví una situación cotidiana, interactuá con tu entorno y descubrí qué pueden contarte tus decisiones.</p><article className="final-catalogo"><LivingPOV /><div><small>Situación 01 · 3–5 min</small><h2>La noche de la final</h2><p>Una noche de fútbol, tus amigos y una conversación inesperada.</p><button className="final-accion" onClick={()=>setModal('intro')}>Entrar a la situación →</button></div></article><p>Tus decisiones no se guardan ni modifican tus registros personales.</p></> : fase==='experiencia' ? <div className="final-experiencia"><header className="final-barra"><div><strong>modus.</strong><small>La noche de la final</small></div><div><button onClick={()=>document.fullscreenElement ? salirPantalla() : marco.current?.requestFullscreen?.().catch(()=>{})}>Ampliar / reducir</button><button onClick={()=>setModal('salir')}>Salir ×</button></div></header><LivingPOV minuto={escena.minuto} interactivo interlocutor={escena.personaje} onAbrir={setModal}/><section className="final-dialogo"><div className="final-progreso" aria-label={`Momento ${momento+1} de 6`}>{Array.from({length:6},(_,i)=><span key={i} className={i<=momento?'activo':''}/>)}</div><strong>{escena.personaje}</strong><p>{escena.texto}</p>{reaccion ? <><p>Elegiste: «{reaccion.texto}»</p><p><strong>{reaccion.personaje}:</strong> {reaccion.reaccion}</p><button className="final-accion" onClick={seguir}>Continuar →</button></> : momento===5 ? <button className="final-accion" onClick={finalizar}>Finalizar situación</button> : <div className="final-opciones">{escena.opciones.map((opcion)=><button key={opcion.id} onClick={()=>elegir(opcion)}>{opcion.texto} <span>›</span></button>)}</div>}</section><footer>Experiencia ficticia · Sin límite de tiempo</footer></div> : <section className="final-resultado"><h1>Tus decisiones también cuentan una historia</h1><p>Estos son algunos aspectos de tu recorrido sobre los que podrías reflexionar.</p>{observaciones.length ? observaciones.map((item)=><article key={item.titulo}><small>{item.categoria}</small><h2>{item.titulo}</h2><blockquote>«{item.cita}»</blockquote><p>{item.observado}</p><p>{item.consecuencia}</p><strong>{item.reflexion}</strong></article>) : <article>Este recorrido no generó observaciones específicas. Podés explorar las herramientas cuando quieras.</article>}<details><summary>Ver las decisiones de mi recorrido</summary><ul>{decisiones.map((id,i)=>{const opcion=obtenerEscena(i,decisiones).opciones.find((item)=>item.id===id);return <li key={id}>{opcion?.texto}</li>;})}</ul></details><p>Estas observaciones se basan únicamente en tus decisiones dentro de una situación ficticia. No constituyen un diagnóstico.</p><p>Al salir, tu recorrido y devolución no se conservarán.</p><div className="final-recursos"><Link to="/prevencion">Explorar Prevención →</Link><Link to="/escudo-digital">Escudo digital →</Link></div><button onClick={reiniciar}>Volver a situaciones</button><button onClick={()=>{reiniciar();setFase('experiencia');}}>Realizar otro recorrido</button></section>}</div>
  {modal==='intro' && <Modal titulo="SITUACIÓN 01 · LA NOCHE DE LA FINAL" cerrar={()=>setModal(null)}><h2>Es domingo, son las 21:30. Estás en la casa de Nico. ¡Se juntaron tus amigos a ver la final!</h2><p>¡Podés interactuar con la situación, avanzar en ella e interactuar con tus amigos y tu entorno para completarla!</p><label><input type="checkbox" checked={pantalla} onChange={(e)=>setPantalla(e.target.checked)}/> Activar pantalla completa <small>Para una mejor experiencia</small></label><button className="final-accion" onClick={comenzar}>Continuar con la situación →</button><small>Es una situación ficticia y temporal. Tu recorrido no se guardará.</small></Modal>}
  {modal==='salir' && <Modal titulo="SALIR DE LA EXPERIENCIA" cerrar={()=>setModal(null)}><h2>¿Querés dejar la situación?</h2><p>Podés salir ahora. Las decisiones que tomaste hasta este momento no se conservarán y no se generará una devolución.</p><button className="final-accion" onClick={()=>setModal(null)}>Seguir en la situación →</button><button className="final-secundario" onClick={reiniciar}>Salir y descartar recorrido</button></Modal>}
  {modal && !['intro','salir'].includes(modal) && <Modal titulo={modal} cerrar={()=>setModal(null)}>{modal==='Tu celular' ? <Celular momento={momento}/> : <p>{modal==='Partido' ? `La final sigue empatada 1–1 en el minuto ${escena.minuto}.` : `${modal} está mirando la final con vos.`}</p>}</Modal>}</div>;
}
