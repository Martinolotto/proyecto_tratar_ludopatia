/* Pantalla provisoria para la futura herramienta de evaluación. */
import { ClipboardCheck } from "lucide-react";

export function EvaluarComportamientoPage() {
  return (
    <section className="max-w-3xl text-brand-navy">
      <ClipboardCheck size={32} aria-hidden="true" />
      <h1 className="mt-4 font-heading text-3xl font-bold">Evaluar mi comportamiento</h1>
      <p className="mt-4 text-lg">Esta herramienta está en desarrollo.</p>
    </section>
  );
}
