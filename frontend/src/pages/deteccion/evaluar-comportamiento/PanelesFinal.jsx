import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, CalendarDays, CreditCard, MessageCircle, Shield, ShieldCheck, X } from 'lucide-react';
import { Retrato } from './LivingPOV.jsx';
import { evaluarDecisiones } from './evaluarDecisiones.js';

import { estadosPlan } from './guionFinal.js';

const ubicaciones = {
  Tomi: 'Sigue el partido y los mensajes del grupo',
  Nico: 'Anfitrión de la juntada',
  Juli: 'Organiza la juntada del sábado',
};

export function Modal({ titulo, cerrar, rotulo = titulo, variante = '', children }) {
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
      <header><span>{rotulo}</span><button type="button" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
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
          <div className="final-billetera"><h3>Saldo ficticio</h3><strong className="final-saldo">$12.000 ARS</strong></div>
          <dl><div><dt>Reserva inicial para la salida</dt><dd>$6.000</dd></div><div><dt>Transporte de la semana</dt><dd>$2.000</dd></div><div><dt>Sin destino asignado</dt><dd>$4.000</dd></div></dl>
        </>}
        {tab === 'Mensajes' && <><h3>Los pibes ⚽</h3><ul>{mensajes.map(([autor, texto]) => <li key={texto}><strong>{autor}</strong><p>{texto}</p></li>)}</ul></>}
        {tab === 'Mis planes' && <><h3>Mis planes</h3><p className="final-plan-estado">{estadosPlan[plan]}</p><dl><div><dt>Sábado · Salir a comer</dt><dd>{costoActualizado ? '$9.000' : '$6.000'}</dd></div>{costoActualizado && <div><dt>Diferencia con la reserva inicial</dt><dd>$3.000</dd></div>}<div><dt>Lunes a viernes · Transporte</dt><dd>$2.000</dd></div></dl></>}
      </div>
    </div>
  );
}

export function PanelContextual({ objeto, escena, entorno, cerrar, verMensajes, expresion }) {
  const celular = objeto === 'Tu celular';
  const partido = objeto === 'Partido';
  return (
    <Modal titulo={objeto} rotulo={celular ? 'Tu celular' : partido ? 'Transmisión de la final' : 'Conversación'}
      cerrar={cerrar} variante={celular ? 'final-modal--celular' : 'final-modal--escena'}>
      {celular ? <Celular hora={escena.hora} entorno={entorno} verMensajes={verMensajes} /> : partido ? (
        <section className="final-partido" aria-label="La final">
          <div className="final-transmision">
            <h2>Torneo Continental</h2>
            <div className="final-marcador">
              <span><Shield size={24} aria-hidden="true" /> Atlético del Sur</span>
              <strong>{escena.marcador}</strong>
              <span><Shield size={24} aria-hidden="true" /> Deportivo Norte</span>
            </div>
            <p>{escena.minuto}′ · {escena.etapa}</p>
          </div>
          <p>{escena.minuto === 90 ? 'La final sigue en el alargue.' : escena.minuto === 45
            ? 'Atlético del Sur se va al descanso en ventaja.' : 'La final se ve desde la casa de Nico, con todos pendientes de la tele.'}</p>
        </section>
      ) : (
        <section className="final-amigo">
          <Retrato nombre={objeto} expresion={expresion(objeto)} />
          <div><h2>{objeto}</h2><p>{ubicaciones[objeto]}</p></div>
          <p>«{entorno.amigos[objeto]}»</p>
        </section>
      )}
      <button className="final-secundario" type="button" onClick={cerrar}>{partido ? 'Volver al living' : 'Volver a la situación'}</button>
    </Modal>
  );
}

const recursos = [
  [BookOpen, '/prevencion', 'Prevención', 'Conocé más sobre las apuestas y sus posibles consecuencias.', 'Explorar recursos'],
  [ShieldCheck, '/escudo-digital', 'Escudo digital', 'Descubrí herramientas de protección y apoyo.', 'Conocer herramientas'],
];

export function Devolucion({ decisiones, volver, repetir, tituloRef }) {
  const { resumen, observaciones, proteccion, recorrido } = evaluarDecisiones(decisiones);
  return (
    <section className="final-resultado">
      <header><p className="final-etiqueta">La noche de la final</p><h1 tabIndex={-1} ref={tituloRef}>Comprendé tus decisiones.</h1></header>
      <p>{resumen}</p>
      {['atencion', 'reflexion'].map((tipo) => {
        const grupo = observaciones.filter((observacion) => observacion.tipo === tipo);
        if (!grupo.length) return null;
        return <section key={tipo} className={`final-resultados-${tipo}`}>
          <h2>{tipo === 'atencion' ? 'Aspectos que merecen atención' : 'Aspectos para reflexionar'}</h2>
          <div className="final-devoluciones">
            {grupo.map(({ id, titulo, evidencias, observado, porQueImporta, orientacion, matiz }) => (
              <article key={id}>
                <p className="final-etiqueta">{tipo === 'atencion' ? 'Atención' : 'Reflexión'}</p>
                <h3>{id === 'continuidad_resultado' ? 'Después de una ganancia, ¿cuándo parar?' : titulo}</h3>
                {evidencias.map((cita) => <blockquote key={cita.id}>«{cita.texto}»</blockquote>)}
                <p>{observado}</p>{matiz && <p>{matiz}</p>}
                <h4>¿Por qué es importante?</h4><p>{porQueImporta}</p><p className="final-orientacion">{orientacion}</p>
              </article>
            ))}
          </div>
        </section>;
      })}
      {proteccion.length > 0 && <section>
        <h2>Decisiones de protección</h2>
        <ul className="final-proteccion">
          {proteccion.map(({ id, titulo, evidencias }) => <li key={id}>
            <ShieldCheck size={19} aria-hidden="true" />
            <div><h3>{titulo}</h3>
              {evidencias.map((cita) => <blockquote key={cita.id}>«{cita.texto}»</blockquote>)}
            </div>
          </li>)}
        </ul>
      </section>}
      <details><summary>Ver las decisiones de mi recorrido</summary><ol>{recorrido.map(({ id, texto }) => <li key={id}>{texto}</li>)}</ol></details>
      <section>
        <h2>Seguí descubriendo herramientas.</h2>
        <div className="final-recursos">{recursos.map(([Icono, ruta, nombre, descripcion, accion]) => (
          <Link to={ruta} key={ruta}>
            <Icono size={21} aria-hidden="true" /><h3>{nombre}</h3><p>{descripcion}</p>
            <span>{accion} <ArrowRight size={16} aria-hidden="true" /></span>
          </Link>
        ))}</div>
      </section>
      <p className="final-privacidad">Estas observaciones se basan en una experiencia ficticia. No constituyen un diagnóstico ni permiten determinar tu conducta real. Tu recorrido y devolución no se guardarán.</p>
      <div className="final-resultado__acciones"><button type="button" onClick={volver}>Volver a situaciones</button><button type="button" onClick={repetir}>Realizar otro recorrido</button></div>
    </section>
  );
}
