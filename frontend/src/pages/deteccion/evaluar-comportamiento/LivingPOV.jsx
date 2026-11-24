/* Las coordenadas de los controles corresponden al mismo encuadre que el SVG. */
import { useId } from 'react';

const elenco = {
  Tomi: { piel: '#bc8763', pelo: '#393027', ropa: '#637f98', sombra: '#445b71', cabello: 'M-35 8Q-37-26-5-32Q28-37 36-8L36 7L22-6L6-4L-22 15Z' },
  Nico: { piel: '#d09b76', pelo: '#292b28', ropa: '#b88c52', sombra: '#8a6845', cabello: 'M-35 11Q-44-29-8-34Q32-37 37 0L22-10L-2-6L-21 14Z' },
  Juli: { piel: '#d7a480', pelo: '#45372d', ropa: '#6f9383', sombra: '#456858', cabello: 'M-35 9Q-41-16-17-29Q4-40 25-27Q38-22 37 7L22-6L-4-1L-22 15Z' },
};

function Cara({ nombre }) {
  const { piel, pelo, cabello } = elenco[nombre];
  return <g>
    <path d="M-13 23h26v33q-13 13-26 0Z" fill={piel} />
    <ellipse cx="-34" cy="12" rx="7" ry="9" fill={piel} /><ellipse cx="34" cy="12" rx="7" ry="9" fill={piel} />
    <path d="M-34-4Q0-34 34-4V14Q29 41 0 44Q-29 41-34 14Z" fill={piel} />
    <path d={cabello} fill={pelo} />
    <path d="M-18 9h5m26 0h5" stroke="#332c28" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M-6 27q6 5 13-1" fill="none" stroke="#805743" strokeWidth="2" strokeLinecap="round" />
    {nombre === 'Juli' && <circle cx="35" cy="19" r="3" fill="#e9ce94" />}
  </g>;
}

export function Retrato({ nombre }) {
  return <svg className="final-retrato" aria-hidden="true" viewBox="-45 -42 90 98">
    <rect x="-45" y="-42" width="90" height="98" fill="#a5b7a2" />
    <path d="M-45 56q14-28 45-27q31-1 45 27" fill={elenco[nombre].ropa} />
    <Cara nombre={nombre} />
  </svg>;
}

function Persona({ nombre, x, y, escala = 1 }) {
  const { piel, ropa, sombra } = elenco[nombre];
  return <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <ellipse cy="158" rx="82" ry="13" fill="#263d36" opacity=".45" />
    <path d="M-42 126Q-69 128-73 160L-34 169L-5 146L23 167L66 162Q61 133 43 125Z" fill="#304744" />
    <path d="M-35 40L-55 56L-60 109Q-56 136-37 140H38Q55 130 56 106L47 57L25 40Z" fill={ropa} />
    <path d="M-48 83L-35 108L30 126L37 140H-37Q-56 138-60 111Z" fill={sombra} opacity=".55" />
    <Cara nombre={nombre} />
    {nombre === 'Tomi' && <g fill={piel}><path d="M-54 67L-70 113Q-72 126-57 130L-12 111L-22 94L-47 108L-35 74Z" /><path d="M48 65L65 109Q71 122 58 129L29 113L38 96L47 102L32 71Z" /><rect x="21" y="92" width="20" height="33" rx="4" transform="rotate(15 30 108)" fill="#1f3833" /><path d="M25 98l12 3-5 20-11-3z" fill="#91a99d" /></g>}
    {nombre === 'Nico' && <g fill={piel}><path d="M-52 65L-64 115Q-65 130-46 132L1 114L-9 99L-44 113L-30 72Z" /><path d="M45 65L64 106Q69 119 56 126L8 114L14 96L43 106L28 73Z" /></g>}
    {nombre === 'Juli' && <g fill={piel}><path d="M-53 69L-66 114Q-65 127-51 129L-11 113L-21 93L-46 109L-34 72Z" /><path d="M47 73L62 112L42 133L15 117L26 100L41 111L30 80Z" /></g>}
  </g>;
}

const controles = [['Tomi', 12, 67], ['Nico', 81, 59], ['Juli', 92, 74], ['Partido', 50, 44], ['Tu celular', 52, 84]];
export function LivingPOV({ minuto = 68, interactivo = false, interlocutor, onAbrir }) {
  const luz = useId();
  return <div className="final-living">
    <div className="final-encuadre">
      <svg viewBox="0 0 1000 540" role="img" aria-label="Living de noche con tres amigos mirando la final">
        <defs><radialGradient id={luz} cx=".67" cy=".25" r=".83"><stop stopColor="#8c9985" /><stop offset="1" stopColor="#486053" /></radialGradient></defs>
        <rect width="1000" height="540" fill={`url(#${luz})`} />
        <path d="M0 365H1000V540H0Z" fill="#596252" />
        <path d="M0 360H1000" stroke="#92a296" strokeWidth="8" />
        <g aria-hidden="true">
          <rect x="35" y="60" width="137" height="156" rx="5" fill="#304b46" />
          <rect x="45" y="69" width="117" height="136" fill="#263f4c" />
          <circle cx="67" cy="91" r="11" fill="#dde0bd" />
          <path d="M45 158h18v-20h23v26h22v-42h23v28h31v55H45Z" fill="#435e5f" />
          <path d="M103 69v136M45 129h117" stroke="#97aa9d" strokeWidth="6" />
          <path d="M811 48h94v117h-94z" fill="#d0c9ad" stroke="#384b41" strokeWidth="9" />
          <path d="M822 150l35-60 37 60" fill="#879d85" /><circle cx="857" cy="89" r="16" fill="#a9b99a" />
          <path d="M949 92v179" stroke="#354d42" strokeWidth="8" /><path d="M930 69h37l18 46q-35 14-72 0Z" fill="#e2d0a3" />
        </g>
        <g>
          <rect x="214" y="44" width="574" height="225" rx="12" fill="#1a302b" />
          <rect x="228" y="58" width="546" height="29" fill="#203f39" />
          <g fill="#edf6ea" fontFamily="sans-serif" fontWeight="700" fontSize="15"><text x="248" y="78">SUR</text><text x="469" y="78">1 — 1</text><text x="625" y="78">{minuto}′</text><text x="706" y="78">NORTE</text></g>
          <rect x="228" y="87" width="546" height="168" fill="#68986d" />
          <path d="M235 87h82v168h-82zm166 0h82v168h-82zm166 0h82v168h-82zm166 0h41v168h-41z" fill="#81aa7f" />
          <path d="M239 97h524v148H239zM501 97v148M239 132h56v79h-56M763 132h-56v79h56" fill="none" stroke="#c7dfbe" strokeWidth="2" />
          <circle cx="501" cy="171" r="31" fill="none" stroke="#c7dfbe" strokeWidth="2" />
          {[[332,132],[402,152],[455,138],[602,130],[690,122],[660,183],[543,199],[391,212]].map(([px,py],i) => <circle key={px} cx={px} cy={py} r="7" fill={i % 3 ? '#f0d9ae' : '#345779'} />)}
          <circle cx="565" cy="175" r="5" fill="#f1f1df" />
          <rect x="223" y="269" width="555" height="65" rx="5" fill="#675949" />
          <rect x="223" y="269" width="555" height="13" fill="#9b876c" />
          <path d="M240 291h248v29H240zm276 0h244v29H516z" fill="#453e34" /><path d="M345 306h35m240 0h35" stroke="#9c8d70" strokeWidth="4" />
        </g>
        <path d="M0 280q10-34 43-34h143q38 0 38 41v171H0zm777 7q0-41 38-41h143q39 0 42 37v175H777Z" fill="#3f594c" />
        <path d="M9 273q0-17 24-17h151q27 0 27 23v71H9zm790 7q0-24 22-24h145q27 0 27 24v70H799Z" fill="#718875" />
        <path d="M0 366h224v49H0zm777 0h223v49H777Z" fill="#516f5d" />
        <Persona nombre="Tomi" x={119} y={186} escala={1.35} /><Persona nombre="Nico" x={811} y={174} escala={1.18} /><Persona nombre="Juli" x={932} y={223} escala={.96} />
        <path d="M290 352H710L811 540H190Z" fill="#b29b77" /><path d="M231 463h538l42 77H190Z" fill="#75634e" />
        <ellipse cx="366" cy="402" rx="55" ry="20" fill="#cbc4a7" /><ellipse cx="366" cy="398" rx="45" ry="15" fill="#ded6ba" />
        <path d="M335 395q8-13 18-3q9-5 16 1q10-10 20-2q9 10-15 14q-30 4-39-10" fill="#c5a35e" />
        <rect x="627" y="374" width="34" height="53" rx="4" fill="#809e96" /><ellipse cx="644" cy="374" rx="17" ry="6" fill="#c7d7be" /><path d="M632 400h24v12h-24Z" fill="#afbeb0" />
        <g transform="translate(482 402) rotate(-9)"><rect width="67" height="106" rx="10" fill="#233b36" /><rect x="7" y="8" width="53" height="88" rx="4" fill="#a6c8af" /><path d="M16 24h35m-35 18h29m-29 18h33" stroke="#e4eddb" strokeWidth="8" strokeLinecap="round" /></g>
        <path d="M0 540V503l111-58 38 16-72 79m923 0v-37l-111-58-38 16 72 79" fill="#cda07d" />
        <path d="M0 540l143-78 79 78m778 0l-143-78-79 78" fill="#304d45" />
      </svg>
      {interactivo && <>
        <span className="final-ambiente">DOMINGO · CASA DE NICO <strong>21:30 · La final</strong></span>
        <span className="final-pista">Tocá un elemento para interactuar</span>
        <div className="final-hotspots" role="group" aria-label="Elementos del living">{controles.map(([nombre,x,y]) => <button key={nombre} type="button"
          className={`final-hotspot${interlocutor === nombre ? ' activo' : ''}`}
          style={{ left: `${x}%`, top: `${y}%` }} onClick={() => onAbrir(nombre)}>{nombre}</button>)}</div>
      </>}
    </div>
  </div>;
}
