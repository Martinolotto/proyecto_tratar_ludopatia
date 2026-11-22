/*
 * Heat Calendar original provisto por el usuario, adaptado a React de MODUS.
 * Conecta días registrados con el detalle; licencia MIT de ssych-ui en LICENSE.
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './HeatCalendar.css'

const EASE = [0.16, 1, 0.3, 1]
/* El resorte conserva el movimiento original del componente. */
const LIFT_SPRING = { type: 'spring', stiffness: 500, damping: 30 }
/** Escalas para la celda apuntada y sus vecinas. */
const LIFT = [1.3, 1.08, 1.03]

/** Solo los dispositivos con puntero muestran la respuesta de hover. */
function useCanHover() {
  const [can, setCan] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)')
    const onChange = () => setCan(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return can
}

const SURFACE = 'var(--surface, var(--card))'
const HAIRLINE = 'var(--border)'
const DAYS = 7
const DOW = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

function HeatCalendarOriginal({
  title = 'Registro diario',
  unit = 'registros',
  weeks = 5,
  maxCount = 1,
  values,
  className = '',
  etiquetas,
  habilitados,
  fechaSeleccionada,
  onSelectDay,

}) {
  const reduced = useReducedMotion()
  const canHover = useCanHover()
  const [hover, setHover] = useState(null)
  const [pinWeek, setPinWeek] = useState(null)
  const [foco, setFoco] = useState(null)
  const grilla = useRef(null)
  const habilitadas = etiquetas.flatMap((columna, w) => columna.map((fecha, d) => ({ fecha, w, d })))
    .filter(({ w, d }) => habilitados[w][d])
  const focoActual = habilitadas.find(({ w, d }) => foco?.w === w && foco?.d === d)
    ?? habilitadas.find(({ fecha }) => fecha === fechaSeleccionada) ?? habilitadas.at(-1)
  const moverFoco = (evento, w, d) => {
    const pasos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const paso = pasos[evento.key]
    if (!paso) return
    evento.preventDefault()
    let indice = w * DAYS + d + paso
    while (indice >= 0 && indice < weeks * DAYS && !habilitados[Math.floor(indice / DAYS)]?.[indice % DAYS]) indice += paso
    grilla.current?.querySelector(`[data-indice="${indice}"]`)?.focus()
  }

  const level = (w, d) => values?.[w]?.[d] ?? 0
  const count = (v) => Math.round(v * maxCount)
  const fechaLegible = (fecha) => new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${fecha}T12:00:00Z`))
  const weekTotal = (w) =>
    Array.from({ length: DAYS }, (_, d) => count(level(w, d))).reduce((a, b) => a + b, 0)

  // La separación de 4 px se suma al tamaño visual de cada celda.
  const posicionTooltip = hover ? {
    left: `${(hover.d + 0.5) * 100 / 7}%`,
    top: `calc(${hover.w} * 38px - 4px)`,
    translate: hover.d < 2 ? '0 -100%' : hover.d > 4 ? '-100% -100%' : '-50% -100%',
  } : {}

  return (
    <div className={`heat-calendar-original relative w-full ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{title}</span>
        <span className="text-[11px] text-muted-foreground">{weeks} semanas</span>
      </div>

      <div className="heat-calendar-days" aria-hidden="true">{DOW.map((dia) => <span key={dia}>{dia}</span>)}</div>
      <div ref={grilla} className="heat-calendar-grid relative mt-3 flex gap-[4px]" onPointerLeave={() => setHover(null)}>
        {Array.from({ length: weeks }, (_, w) => {
          const colOn = pinWeek === w || hover?.w === w
          return (
            <motion.div
              key={w}
              className="heat-calendar-week flex flex-col gap-[4px] rounded-[5px] transition-colors"
              style={{
                background: pinWeek === w ? 'color-mix(in srgb, var(--foreground) 6%, transparent)' : 'transparent',
              }}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE, delay: w * 0.035 }}
            >
              {Array.from({ length: DAYS }, (_, d) => {
                const v = level(w, d)
                const habilitado = habilitados[w][d]
                const fecha = etiquetas[w][d]
                const seleccionado = fecha === fechaSeleccionada
                const on = hover?.w === w && hover?.d === d
                /* El componente original amplía la celda y atenúa el efecto en sus vecinas. */
                const dist = hover && habilitado ? Math.max(Math.abs(hover.w - w), Math.abs(hover.d - d)) : 9
                const lift = reduced ? 1 : dist === 0 ? LIFT[0] : canHover && dist < LIFT.length ? LIFT[dist] : 1
                return (
                  <span
                    key={d}
                    className="heat-calendar-cell relative block"
                    onPointerEnter={!habilitado ? () => setHover(null) : undefined}
                    style={{ zIndex: lift > 1 ? LIFT.length - dist : 0 }}
                  >
                  {/* El área del botón cubre la celda y la mitad de cada separación. */}
                  <button
                    type="button"
                    data-indice={w * DAYS + d}
                    disabled={!habilitado}
                    tabIndex={habilitado && focoActual?.w === w && focoActual?.d === d ? 0 : -1}
                    aria-label={habilitado
                      ? `${fechaLegible(fecha)}, ${v ? 'registrado' : 'sin registro'}${seleccionado ? ', día seleccionado' : ''}. Seleccionar día y ${pinWeek === w ? 'desfijar' : 'fijar'} semana ${w + 1}`
                      : 'Fecha no disponible'}
                    aria-pressed={pinWeek === w}
                    onKeyDown={(e) => {
                      moverFoco(e, w, d)
                      if (e.key === 'Escape') {
                        setPinWeek(null)
                        setHover(null)
                      }
                    }}
                    onPointerEnter={() => { if (habilitado) setHover({ w, d }) }}
                    onFocus={() => { setFoco({ w, d }); setHover({ w, d }) }}
                    onBlur={() => setHover(null)}
                    onClick={() => { setPinWeek((p) => (p === w ? null : w)); onSelectDay(fecha) }}
                    /* Cada fecha conserva su área de interacción y se alcanza por teclado. */
                    className="absolute -inset-0.5 block cursor-pointer rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <motion.span
                      className="pointer-events-none absolute inset-0.5 block rounded-[3.5px]"
                      style={{
                        background: !habilitado ? '#cbd2d6' : v ? '#3978c8' : '#e9edf0',
                        // El día seleccionado conserva un contorno visible aunque no tenga registro.
                        outline: habilitado && seleccionado ? '2px solid #172b3a' : undefined,
                        outlineOffset: '1px',
                        /* El borde interior mantiene las celdas visibles en superficies claras. */
                        boxShadow: !habilitado
                          ? 'none'
                          : on
                          ? 'inset 0 0 0 1px color-mix(in srgb, var(--foreground) 40%, transparent)'
                          : `inset 0 0 0 1px color-mix(in srgb, var(--foreground) ${colOn ? 14 : 7}%, transparent)`,
                        transition: 'box-shadow 150ms',
                      }}
                      animate={{ scale: lift }}
                      transition={{ ...LIFT_SPRING, delay: Math.min(dist, 3) * 0.03 }}
                    />
                    <span className="heat-calendar-number" aria-hidden="true" style={{ color: v && habilitado ? '#fff' : '#263e48' }}>{Number(fecha.slice(8))}</span>
                  </button>
                  </span>
                )
              })}
            </motion.div>
          )
        })}

        {/* El tooltip sigue la celda real sin depender de un tamaño fijo. */}
        <AnimatePresence>
          {hover && (
            <motion.span
              key={`${hover.w}-${hover.d}`}
              role="status"
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9.5px] tabular-nums text-foreground/75"
              style={{
                ...posicionTooltip,
                background: SURFACE,
                borderColor: HAIRLINE,
                boxShadow: '0 8px 24px -6px rgba(0,0,0,0.35)',
              }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.12 }}
            >
              <b className="font-semibold text-foreground/90">{count(level(hover.w, hover.d))}</b> {count(level(hover.w, hover.d)) === 1 ? 'registro' : unit} · {DOW[hover.d]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 whitespace-nowrap" role="group" aria-label="Leyenda del calendario: sin registro y con registro">
          <span className="h-[11px] w-[11px] rounded-[3px]" style={{ background: '#e9edf0' }} />
          <span className="text-[10px] text-muted-foreground" aria-hidden="true">Sin</span>
          <span className="h-[11px] w-[11px] rounded-[3px]" style={{ background: '#3978c8' }} />
          <span className="text-[10px] text-muted-foreground" aria-hidden="true">Con</span>
        </span>
        {/* El total de la semana fijada permanece cuando el puntero sale. */}
        <span className="whitespace-nowrap tabular-nums text-[11px] text-muted-foreground">
          {pinWeek !== null ? `sem ${pinWeek + 1} · ${weekTotal(pinWeek)} ${weekTotal(pinWeek) === 1 ? 'registro' : unit}` : ' '}
        </span>
      </div>
    </div>
  )
}


// Adaptador: transforma las fechas civiles de Córdoba en la matriz semanal original.
export function HeatCalendar({ mes, desde, hasta, fechasRegistradas, seleccion, onSeleccionar }) {
  const [ano, numeroMes] = mes.split('-').map(Number)
  const primerDia = new Date(Date.UTC(ano, numeroMes - 1, 1))
  const ultimoDia = new Date(Date.UTC(ano, numeroMes, 0))
  const inicio = new Date(primerDia.getTime() - ((primerDia.getUTCDay() + 6) % 7) * 86400000)
  const semanas = Math.max(5, Math.ceil(((ultimoDia - inicio) / 86400000 + 1) / 7))
  const registradas = new Set(fechasRegistradas)
  const etiquetas = Array.from({ length: semanas }, (_, w) => Array.from({ length: DAYS }, (_, d) =>
    new Date(inicio.getTime() + (w * DAYS + d) * 86400000).toISOString().slice(0, 10)))
  const habilitados = etiquetas.map((columna) => columna.map((fecha) =>
    fecha.slice(0, 7) === mes && fecha >= desde && fecha <= hasta))
  const values = etiquetas.map((columna, w) => columna.map((fecha, d) =>
    habilitados[w][d] && registradas.has(fecha) ? 1 : 0))

  return <HeatCalendarOriginal key={mes} title="Registro diario" unit="registros" weeks={semanas}
    maxCount={1} values={values} etiquetas={etiquetas} habilitados={habilitados}
    fechaSeleccionada={seleccion} onSelectDay={onSeleccionar} />
}
