import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Heart,
  Phone,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const CLAVE_CONTACTO_AYUDA = "modus.contacto-ayuda";
const POSICIONES_BURBUJAS = [
  { top: "24%", left: "12%" },
  { top: "68%", left: "25%" },
  { top: "38%", left: "40%" },
  { top: "72%", left: "54%" },
  { top: "22%", left: "68%" },
  { top: "56%", left: "84%" },
  { top: "83%", left: "88%" },
  { top: "82%", left: "7%" },
  { top: "14%", left: "49%" },
  { top: "44%", left: "90%" },
];
const COLORES_BURBUJAS = ["#b8e6df", "#c8d8f3", "#f4d6e7", "#f5e3b2", "#c9e7c8"];
const crearBurbuja = (id, indice) => ({
  id,
  posicion: POSICIONES_BURBUJAS[indice % POSICIONES_BURBUJAS.length],
  color: COLORES_BURBUJAS[indice % COLORES_BURBUJAS.length],
  tamano: 46 + ((indice * 13) % 28),
  demora: `${(indice % 5) * -0.7}s`,
  estallando: false,
});

const MiniJuego = () => {
  const dialogRef = useRef(null);
  const siguienteId = useRef(10);
  const [burbujas, setBurbujas] = useState(() =>
    Array.from({ length: 7 }, (_, indice) => crearBurbuja(indice, indice)),
  );
  const [mensaje, setMensaje] = useState("Tocá una burbuja y seguí su movimiento suave.");

  const hacerEstallar = (id) => {
    setBurbujas((actuales) =>
      actuales.map((burbuja) =>
        burbuja.id === id ? { ...burbuja, estallando: true } : burbuja,
      ),
    );
    setMensaje("Una pequeña pausa a la vez.");
  };

  const reemplazarBurbuja = (id) => {
    const indice = siguienteId.current++;
    setBurbujas((actuales) =>
      actuales.map((burbuja) =>
        burbuja.id === id ? crearBurbuja(indice, indice) : burbuja,
      ),
    );
  };

  const reiniciarBurbujas = () => {
    siguienteId.current = 10;
    setBurbujas(Array.from({ length: 7 }, (_, indice) => crearBurbuja(indice, indice)));
    setMensaje("Tocá una burbuja y seguí su movimiento suave.");
  };

  return (
    <section className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6" aria-labelledby="juego-titulo">
      <h2 id="juego-titulo" className="font-heading text-xl font-semibold text-brand-navy">
        Burbujas de calma
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink">
        Tocá las burbujas para verlas cambiar y desaparecer suavemente.
      </p>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="mt-4 min-h-11 rounded-lg bg-brand-teal px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
      >
        Abrir burbujas
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="burbujas-dialogo-titulo"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,44rem)] max-w-none overflow-y-auto rounded-2xl border border-brand-navy/15 bg-surface p-0 text-ink shadow-xl backdrop:bg-brand-navy/55"
      >
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="burbujas-dialogo-titulo" className="font-heading text-2xl font-semibold text-brand-navy">
                Burbujas de calma
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Tocá las burbujas y mirá cómo flotan, brillan y vuelven a aparecer. No hay puntajes ni apuro.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar burbujas de calma"
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-brand-teal"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div
            className="relative mt-5 h-64 overflow-hidden rounded-lg border border-sky-200/70 bg-gradient-to-b from-sky-100 via-cyan-50 to-indigo-100 sm:h-72"
            role="group"
            aria-label="Burbujas interactivas"
          >
            {burbujas.map((burbuja) => (
              <div
                key={burbuja.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={burbuja.posicion}
              >
                <button
                  type="button"
                  onClick={() => hacerEstallar(burbuja.id)}
                  onAnimationEnd={(event) => {
                    if (
                      burbuja.estallando &&
                      event.animationName === "burbuja-estalla"
                    ) {
                      reemplazarBurbuja(burbuja.id);
                    }
                  }}
                  disabled={burbuja.estallando}
                  aria-label="Hacer estallar una burbuja"
                  className={`burbuja-flota flex rounded-full border border-white/80 shadow-[inset_-5px_-7px_12px_rgba(72,103,155,0.12),0_4px_12px_rgba(72,103,155,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-default ${burbuja.estallando ? "burbuja-estalla" : "cursor-pointer hover:brightness-105"}`}
                  style={{
                    width: `${burbuja.tamano}px`,
                    height: `${burbuja.tamano}px`,
                    background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.95), ${burbuja.color} 68%, rgba(255,255,255,.6))`,
                    animationDelay: burbuja.demora,
                  }}
                >
                  <span aria-hidden="true" className="m-2 h-2 w-4 rounded-full bg-white/70 blur-[1px]" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink" aria-live="polite">{mensaje}</p>
            <button
              type="button"
              onClick={reiniciarBurbujas}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-teal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-teal"
            >
              <RotateCcw size={18} aria-hidden="true" />
              Reiniciar
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
};
export const PausaAyudaPage = () => {
  const [contactoAyuda, setContactoAyuda] = useState("");
  const [cargandoContacto, setCargandoContacto] = useState(true);

  useEffect(() => {
    let vigente = true;
    const cargarContacto = async () => {
      const { data } = await supabase.auth.getUser();
      if (!vigente) return;
      if (data.user) {
        try {
          setContactoAyuda(
            localStorage.getItem(`${CLAVE_CONTACTO_AYUDA}.${data.user.id}`) ?? "",
          );
        } catch {
          setContactoAyuda("");
        }
      }
      setCargandoContacto(false);
    };
    cargarContacto();
    return () => {
      vigente = false;
    };
  }, []);

  const telefono = contactoAyuda.replace(/[^\d+]/g, "");

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-5 sm:p-7">
        <div className="flex items-center gap-2 text-brand-teal">
          <Heart size={22} aria-hidden="true" />
          <p className="text-sm font-semibold">Un momento para vos</p>
        </div>
        <h1 className="mt-3 font-heading text-3xl font-bold text-brand-navy">
          No tenés que resolver todo ahora
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink">
          Hacé una pausa. Apoyá los pies en el suelo y tomá aire despacio, a tu ritmo. Este momento puede pasar de a poco; si podés, acercate a alguien de confianza.
        </p>
      </header>

      <section className="rounded-xl border border-brand-navy/10 bg-surface p-5 sm:p-6" aria-labelledby="contacto-titulo">
        <div className="flex items-start gap-3">
          <Phone className="mt-1 shrink-0 text-brand-teal" size={21} aria-hidden="true" />
          <div>
            <h2 id="contacto-titulo" className="font-heading text-xl font-semibold text-brand-navy">
              Contactá a alguien de confianza
            </h2>
            {cargandoContacto ? (
              <p className="mt-2 text-sm text-ink" role="status">Buscando tu contacto guardado…</p>
            ) : contactoAyuda ? (
              <a
                href={`tel:${telefono}`}
                className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-teal px-4 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
              >
                <Phone size={18} aria-hidden="true" /> Llamar a {contactoAyuda}
              </a>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Todavía no guardaste un número. Podés agregar el de una persona adulta de confianza en tu perfil.
              </p>
            )}
            <p className="mt-3 text-xs text-ink/70">
              Si hay un peligro inmediato, buscá a una persona adulta cercana o contactá los servicios de emergencia de tu zona.
            </p>
            <Link to="/perfil" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-teal underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-teal">
              {contactoAyuda ? "Cambiar contacto en Perfil" : "Agregar contacto en Perfil"}
            </Link>
          </div>
        </div>
      </section>

      <MiniJuego />

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink/70">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        Esta pantalla ofrece una pausa y acceso a tu contacto personal; no es un servicio de emergencias ni reemplaza ayuda profesional.
      </p>

      <Link to="/inicio" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-brand-teal underline focus-visible:outline-2 focus-visible:outline-brand-teal">
        <ArrowLeft size={18} aria-hidden="true" /> Volver a Inicio
      </Link>
    </section>
  );
};
