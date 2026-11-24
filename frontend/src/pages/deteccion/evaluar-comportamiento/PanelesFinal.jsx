import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarDays, CreditCard, MessageCircle, Tv, X } from 'lucide-react';
import { Retrato } from './LivingPOV.jsx';
import { evaluarDecisiones } from './evaluarDecisiones.js';

import { estadosPlan } from './guionFinal.js';

const ubicaciones = {
  Tomi: 'En el sillón de la izquierda',
  Nico: 'Anfitrión de la juntada',
  Juli: 'En el sillón de la derecha',
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

function Celular({ hora, entorno, verMensajes }) {
  const [tab, setTab] = useState('Billetera');
  const { mensajes, plan, costoActualizado } = entorno;
  return (
    <div className="final-telefono">
      <div className="final-telefono__estado"><span>{hora}</span><span>Celular ficticio</span></div>
      <div className="final-telefonotabs" role="group" aria-label="Aplicaciones del celular">
        {[[CreditCard, 'Billetera'], [MessageCircle, 'Mensajes'], [CalendarDays, 'Mis planes']].map(([Icono, nombre]) => (
          <button key={nombre} type="button" aria-pressed={tab === nombre} onClick={() => { setTab(nombre); if (nombre === 'Mensajes') verMensajes(); }}><Icono size={17} />{nombre}</button>
        ))}
      </div>
      <div className="final-telefono__contenido">
        {tab === 'Billetera' && <>
          <h3>Saldo ficticio</h3><strong className="final-saldo">$12.000 ARS</strong>
          <dl><div><dt>Reserva inicial para la salida</dt><dd>$6.000</dd></div><div><dt>Transporte de la semana</dt><dd>$2.000</dd></div><div><dt>Sin destino asignado</dt><dd>$4.000</dd></div></dl>
        </>}
        {tab === 'Mensajes' && <><h3>Los pibes ⚽</h3><ul>{mensajes.map(([autor, texto]) => <li key={texto}><strong>{autor}</strong><p>{texto}</p></li>)}</ul></>}
        {tab === 'Mis planes' && <><h3>Mis planes</h3><dl><div><dt>Sábado · Salir a comer</dt><dd>{costoActualizado ? '$9.000' : '$6.000'}</dd></div>{costoActualizado && <div><dt>Diferencia con la reserva inicial</dt><dd>$3.000</dd></div>}<div><dt>Estado</dt><dd>{estadosPlan[plan]}</dd></div><div><dt>Lunes a viernes · Transporte</dt><dd>$2.000</dd></div></dl></>}
      </div>
    </div>
  );
}

export function PanelContextual({ objeto, escena, entorno, cerrar, verMensajes }) {
  return (
    <Modal titulo={objeto} cerrar={cerrar} variante={objeto === 'Tu celular' ? 'final-modal--celular' : 'final-modal--escena'}>
      {objeto === 'Tu celular' ? <Celular hora={escena.hora} entorno={entorno} verMensajes={verMensajes} /> : objeto === 'Partido' ? (
        <section className="final-partido">
          <h2><Tv size={20} /> La final</h2>
          <p>Atlético del Sur · Deportivo Norte</p>
          <div className="final-marcador"><span>SUR</span><strong>{escena.marcador}</strong><span>NORTE</span></div>
          <p>{escena.minuto}′ · {escena.etapa}</p>
        </section>
      ) : (
        <section className="final-amigo">
          <Retrato nombre={objeto} />
          <div><h2>{objeto}</h2><p>{ubicaciones[objeto]}</p></div>
          <p>{entorno.amigos[objeto]}</p>
        </section>
      )}
    </Modal>
  );
}

export function Devolucion({ decisiones, volver, repetir, tituloRef }) {
  const { resumen, observaciones, proteccion, recorrido } = evaluarDecisiones(decisiones);
  return (
    <section className="final-resultado">
      <h1 tabIndex={-1} ref={tituloRef}>Tus decisiones también cuentan una historia</h1>
      <p>{resumen}</p>
      {['atencion', 'reflexion'].map((tipo) => {
        const grupo = observaciones.filter((observacion) => observacion.tipo === tipo);
        if (!grupo.length) return null;
        return <section key={tipo}>
          <h2>{tipo === 'atencion' ? 'Para prestar atención' : 'Para reflexionar'}</h2>
          <div className="final-devoluciones">
            {grupo.map(({ id, titulo, evidencias, observado, porQueImporta, orientacion, matiz }) => (
              <article key={id}><h3>{titulo}</h3>
                {evidencias.map((cita) => <blockquote key={cita.id}>«{cita.texto}»</blockquote>)}
                <p>{observado}</p>{matiz && <p>{matiz}</p>}
                <p>{porQueImporta}</p><strong>{orientacion}</strong>
              </article>
            ))}
          </div>
        </section>;
      })}
      {proteccion.length > 0 && <section>
        <h2>Decisiones de protección</h2>
        <div className="final-devoluciones">
          {proteccion.map(({ id, titulo, evidencias }) => <article key={id}>
            <h3>{titulo}</h3>
            {evidencias.map((cita) => <blockquote key={cita.id}>«{cita.texto}»</blockquote>)}
          </article>)}
        </div>
      </section>}
      <details><summary>Ver las decisiones de mi recorrido</summary><ol>{recorrido.map(({ id, texto }) => <li key={id}>{texto}</li>)}</ol></details>
      <p>Estas observaciones se basan únicamente en tus decisiones dentro de una situación ficticia. No constituyen un diagnóstico ni permiten determinar tu conducta real. Tu recorrido y devolución no se guardarán.</p>
      <div className="final-recursos"><Link to="/prevencion">Explorar Prevención <ArrowRight size={16} /></Link><Link to="/escudo-digital">Escudo digital <ArrowRight size={16} /></Link></div>
      <div className="final-resultado__acciones"><button type="button" onClick={volver}>Volver a situaciones</button><button type="button" onClick={repetir}>Realizar otro recorrido</button></div>
    </section>
  );
}
