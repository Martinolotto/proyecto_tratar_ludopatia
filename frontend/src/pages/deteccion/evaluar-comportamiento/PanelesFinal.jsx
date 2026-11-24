import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarDays, CreditCard, MessageCircle, Tv, X } from 'lucide-react';
import { Retrato } from './LivingPOV.jsx';
import { evaluarDecisiones, recuperarElecciones } from './evaluarDecisiones.js';

const amigos = {
  Tomi: ['En el sillón de la izquierda', 'Hace rato que está pendiente del grupo. Ahora vuelve a mirar la jugada.'],
  Nico: ['Anfitrión de la juntada', 'Corre el vaso para hacerte lugar en la mesa. «Servite si querés», te dice.'],
  Juli: ['En el sillón de la derecha', 'Sigue la jugada con la mirada y te hace un gesto para que mires la tele.'],
};

export function Modal({ titulo, cerrar, variante = '', children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const dialogo = ref.current;
    const disparador = document.activeElement;
    dialogo.showModal();
    return () => {
      dialogo.close();
      if (disparador?.isConnected) disparador.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog ref={ref} className={`final-modal ${variante}`} aria-label={titulo}
      onCancel={(evento) => { evento.preventDefault(); cerrar(); }}>
      <header><span>{titulo}</span><button type="button" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
      <div className="final-modal__cuerpo">{children}</div>
    </dialog>
  );
}

function Celular({ momento }) {
  const [tab, setTab] = useState('Billetera');
  const mensajes = [
    ['Gonza', 'Qué partidazo amigo'], ['Emi', 'Para mí termina en penales'],
    ['Juli', 'Che, el sábado nos juntamos también, ¿sí?'],
    ...(momento >= 1 ? [['Gonza', 'Le puse plata al partido. Si hay otro gol, espero cobrar más.']] : []),
    ...(momento >= 3 ? [['Juli', 'El sábado a comer, no se olviden jajaja']] : []),
  ];
  return (
    <div className="final-telefono">
      <div className="final-telefono__estado"><span>21:30</span><span>Celular ficticio</span></div>
      <div className="final-telefonotabs" role="group" aria-label="Aplicaciones del celular">
        {[[CreditCard, 'Billetera'], [MessageCircle, 'Mensajes'], [CalendarDays, 'Mis planes']].map(([Icono, nombre]) => (
          <button key={nombre} type="button" aria-pressed={tab === nombre} onClick={() => setTab(nombre)}><Icono size={17} />{nombre}</button>
        ))}
      </div>
      <div className="final-telefono__contenido">
        {tab === 'Billetera' && <>
          <h3>Saldo ficticio</h3><strong className="final-saldo">$12.000</strong>
          <dl><div><dt>Salida del sábado</dt><dd>$6.000</dd></div><div><dt>Transporte de la semana</dt><dd>$2.000</dd></div><div><dt>Sin destino asignado</dt><dd>$4.000</dd></div></dl>
        </>}
        {tab === 'Mensajes' && <><h3>Los pibes ⚽</h3><ul>{mensajes.map(([autor, texto]) => <li key={texto}><strong>{autor}</strong><p>{texto}</p></li>)}</ul></>}
        {tab === 'Mis planes' && <><h3>Mis planes</h3><dl><div><dt>Sábado · Salir a comer</dt><dd>$6.000</dd></div><div><dt>Lunes a viernes · Transporte</dt><dd>$2.000</dd></div></dl></>}
      </div>
    </div>
  );
}

export function PanelContextual({ objeto, escena, momento, reaccion, cerrar }) {
  const [subtitulo, descripcion] = amigos[objeto] ?? [];
  const intervencion = reaccion?.personaje === objeto ? reaccion.reaccion : escena.personaje === objeto ? escena.texto : descripcion;
  return (
    <Modal titulo={objeto} cerrar={cerrar} variante={objeto === 'Tu celular' ? 'final-modal--celular' : 'final-modal--escena'}>
      {objeto === 'Tu celular' ? <Celular momento={momento} /> : objeto === 'Partido' ? (
        <section className="final-partido">
          <h2><Tv size={20} /> La final</h2>
          <div className="final-marcador"><span>SUR</span><strong>1 — 1</strong><span>NORTE</span></div>
          <p>{escena.minuto}′ · {escena.minuto === 90 ? 'Fin del tiempo reglamentario' : 'Segundo tiempo'}</p>
        </section>
      ) : (
        <section className="final-amigo">
          <Retrato nombre={objeto} />
          <div><h2>{objeto}</h2><p>{subtitulo}</p></div>
          <p>{intervencion}</p>
        </section>
      )}
    </Modal>
  );
}

export function Devolucion({ decisiones, volver, repetir, tituloRef }) {
  const observaciones = evaluarDecisiones(decisiones);
  return (
    <section className="final-resultado">
      <h1 tabIndex={-1} ref={tituloRef}>Tus decisiones también cuentan una historia</h1>
      <p>Estos son algunos aspectos de tu recorrido sobre los que podrías reflexionar.</p>
      <div className="final-devoluciones">
        {observaciones.map(({ titulo, categoria, citas, observado, consecuencia, reflexion }) => (
          <article key={titulo}><small>{categoria}</small><h2>{titulo}</h2>
            {citas.map((cita) => <blockquote key={cita}>«{cita}»</blockquote>)}
            <p>{observado}</p><p>{consecuencia}</p><strong>{reflexion}</strong>
          </article>
        ))}
        {!observaciones.length && <article>Este recorrido no generó observaciones específicas. Podés explorar las herramientas cuando quieras.</article>}
      </div>
      <details><summary>Ver las decisiones de mi recorrido</summary><ol>{recuperarElecciones(decisiones).map(({ id, texto }) => <li key={id}>{texto}</li>)}</ol></details>
      <p>Estas observaciones se basan únicamente en tus decisiones dentro de una situación ficticia. No constituyen un diagnóstico.</p>
      <p>Al salir, tu recorrido y devolución no se conservarán.</p>
      <div className="final-recursos"><Link to="/prevencion">Explorar Prevención <ArrowRight size={16} /></Link><Link to="/escudo-digital">Escudo digital <ArrowRight size={16} /></Link></div>
      <div className="final-resultado__acciones"><button type="button" onClick={volver}>Volver a situaciones</button><button type="button" onClick={repetir}>Realizar otro recorrido</button></div>
    </section>
  );
}
