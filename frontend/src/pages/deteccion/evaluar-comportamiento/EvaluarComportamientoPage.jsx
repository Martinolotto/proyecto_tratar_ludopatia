/* Las decisiones pertenecen al recorrido actual y se conservan en memoria. */
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronRight, Clock, Maximize, Minimize, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase.js';
import { LivingPOV, Retrato } from './LivingPOV.jsx';
import { GUION, obtenerEscena } from './guionFinal.js';
import { Devolucion, Modal, PanelContextual } from './PanelesFinal.jsx';
import './EvaluarComportamientoPage.css';

function Catalogo({ entrar, tituloRef }) {
  return <section className="final-catalogo-vista">
    <p className="final-etiqueta">DETECCIÓN / EXPERIENCIAS</p>
    <h1 tabIndex={-1} ref={tituloRef}>Ponete en situación.</h1>
    <p>Viví una situación cotidiana, interactuá con tu entorno y descubrí qué pueden contarte tus decisiones.</p>
    <article className="final-catalogo">
      <LivingPOV />
      <div>
        <small><Clock size={16} /> 3–5 min</small>
        <h2>La noche de la final</h2>
        <p>Una noche de fútbol, tus amigos y una conversación inesperada.</p>
        <button className="final-accion" type="button" onClick={entrar}>Entrar a la situación <ArrowRight size={17} /></button>
      </div>
    </article>
    <p className="final-privacidad"><ShieldCheck size={19} /> Tus decisiones no se guardan ni modifican tus registros personales.</p>
  </section>;
}

function PanelNarrativo({ escena, momento, reaccion, elegir, seguir, finalizar, tituloRef }) {
  const personaje = reaccion?.personaje ?? escena.personaje;
  const parlamentoId = useId();
  return <section className="final-dialogo" aria-label="Diálogo">
    <div className="final-progreso" role="img" aria-label={`Momento ${momento + 1} de ${GUION.length}`}>
      {GUION.map(({ minuto }, indice) => <span key={minuto} className={indice === momento ? 'activo' : indice < momento ? 'pasado' : ''} />)}
    </div>
    <div className="final-interlocutor">
      {personaje !== 'Narrador' && <Retrato nombre={personaje} />}
      <h2 ref={tituloRef} tabIndex={-1} aria-describedby={parlamentoId}>{personaje === 'Narrador' ? 'Fin del tiempo reglamentario' : personaje}</h2>
    </div>
    {reaccion ? <>
      <p className="final-eleccion">Elegiste «{reaccion.texto}»</p>
      <p className="final-parlamento" id={parlamentoId}>{reaccion.reaccion}</p>
      <button className="final-accion" type="button" onClick={seguir}>Continuar <ArrowRight size={17} /></button>
    </> : <>
      <p className="final-parlamento" id={parlamentoId}>{escena.texto}</p>
      {escena.opciones.length ? <div className="final-opciones">{escena.opciones.map((opcion) => (
        <button key={opcion.id} type="button" onClick={() => elegir(opcion)}>{opcion.texto}<ChevronRight size={16} aria-hidden="true" /></button>
      ))}</div> : <button className="final-accion" type="button" onClick={finalizar}>Finalizar situación <ArrowRight size={17} /></button>}
    </>}
  </section>;
}

const recorridoInicial = { fase: 'catalogo', momento: 0, decisiones: [] };

export function EvaluarComportamientoPage() {
  const [recorrido, setRecorrido] = useState(recorridoInicial);
  const [modal, setModal] = useState(null);
  const [preferencia, setPreferencia] = useState(false);
  const [completa, setCompleta] = useState(false);
  const marco = useRef(null);
  const titulo = useRef(null);
  const focoAlCerrar = useRef(false);
  const { fase, momento, decisiones } = recorrido;
  const escena = obtenerEscena(momento, decisiones);
  const reaccion = escena.opciones.find(({ id }) => id === decisiones[momento]);

  useEffect(() => {
    const contenedor = marco.current;
    const sincronizar = () => setCompleta(document.fullscreenElement === contenedor);
    document.addEventListener('fullscreenchange', sincronizar);
    let cuenta;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const actual = sesion?.user?.id ?? null;
      if (cuenta !== undefined && cuenta !== actual) {
        if (document.fullscreenElement === contenedor) document.exitFullscreen().catch(() => {});
        setRecorrido(recorridoInicial);
        setModal(null);
        setPreferencia(false);
      }
      cuenta = actual;
    });
    return () => {
      document.removeEventListener('fullscreenchange', sincronizar);
      subscription.unsubscribe();
      if (document.fullscreenElement === contenedor) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!modal && focoAlCerrar.current) {
      titulo.current?.focus({ preventScroll: true });
      focoAlCerrar.current = false;
    }
  }, [fase, momento, reaccion, modal]);

  function cambiarPantalla() {
    if (document.fullscreenElement === marco.current) return document.exitFullscreen().catch(() => {});
    return marco.current?.requestFullscreen?.().catch(() => {});
  }

  function reiniciar(faseSiguiente = 'catalogo') {
    if (document.fullscreenElement === marco.current) cambiarPantalla();
    focoAlCerrar.current = true;
    setRecorrido({ ...recorridoInicial, fase: faseSiguiente });
    setModal(null);
    setPreferencia(false);
  }

  function elegir(opcion) {
    focoAlCerrar.current = true;
    setRecorrido((actual) => actual.momento === momento && actual.decisiones.length === momento
      ? { ...actual, decisiones: [...actual.decisiones, opcion.id] } : actual);
    if (opcion.etiqueta === 'billetera') {
      focoAlCerrar.current = true;
      setModal('Tu celular');
    }
  }

  function seguir() {
    focoAlCerrar.current = true;
    setRecorrido((actual) => actual.momento === momento && actual.decisiones.length === momento + 1
      ? { ...actual, momento: momento + 1 } : actual);
  }

  function finalizar() {
    focoAlCerrar.current = true;
    if (document.fullscreenElement === marco.current) cambiarPantalla();
    setRecorrido((actual) => ({ ...actual, fase: 'resultado' }));
  }

  const cerrar = () => setModal(null);
  return <div ref={marco} className="final-pagina">
    {fase === 'catalogo' && <Catalogo tituloRef={titulo} entrar={() => { setPreferencia(false); setModal('intro'); }} />}
    {fase === 'experiencia' && <div className="final-experiencia">
      <header className="final-barra">
        <div><strong>modus.</strong><small>La noche de la final</small></div>
        <div>
          {document.fullscreenEnabled && <button type="button" onClick={cambiarPantalla}>{completa ? <Minimize size={16} /> : <Maximize size={16} />}{completa ? 'Reducir' : 'Ampliar'}</button>}
          <button type="button" onClick={() => setModal('salir')}>Salir <X size={16} /></button>
        </div>
      </header>
      <LivingPOV minuto={escena.minuto} interactivo interlocutor={reaccion?.personaje ?? escena.personaje} onAbrir={setModal} />
      <PanelNarrativo {...{ escena, momento, reaccion, elegir, seguir, finalizar }} tituloRef={titulo} />
      <footer>Experiencia ficticia · Sin límite de tiempo</footer>
    </div>}
    {fase === 'resultado' && <Devolucion decisiones={decisiones} tituloRef={titulo} volver={() => reiniciar()} repetir={() => reiniciar('experiencia')} />}
    {modal === 'intro' && <Modal titulo="SITUACIÓN 01 · LA NOCHE DE LA FINAL" cerrar={cerrar}>
      <h2>Es domingo, son las 21:30. Estás en la casa de Nico. ¡Se juntaron tus amigos a ver la final!</h2>
      <p>¡Podés interactuar con la situación, avanzar en ella e interactuar con tus amigos y tu entorno para completarla!</p>
      {document.fullscreenEnabled && <label><input type="checkbox" checked={preferencia} onChange={(evento) => setPreferencia(evento.target.checked)} /><span>Activar pantalla completa<small>Para una mejor experiencia</small></span></label>}
      <button type="button" className="final-accion" onClick={() => {
        if (preferencia) cambiarPantalla();
        focoAlCerrar.current = true;
        cerrar();
        setRecorrido({ ...recorridoInicial, fase: 'experiencia' });
      }}>Continuar con la situación <ArrowRight size={17} /></button>
      <small>Es una situación ficticia y temporal. Tu recorrido no se guardará.</small>
    </Modal>}
    {modal === 'salir' && <Modal titulo="SALIR DE LA EXPERIENCIA" cerrar={cerrar}>
      <h2>¿Querés dejar la situación?</h2>
      <p>Podés salir ahora. Las decisiones que tomaste hasta este momento no se conservarán y no se generará una devolución.</p>
      <button type="button" className="final-accion" onClick={cerrar}>Seguir en la situación <ArrowRight size={17} /></button>
      <button type="button" className="final-secundario" onClick={() => reiniciar()}>Salir y descartar recorrido</button>
    </Modal>}
    {modal && !['intro', 'salir'].includes(modal) && <PanelContextual objeto={modal} {...{ escena, momento, reaccion, cerrar }} />}
  </div>;
}
