/*
 * Adapta LiveFigure de ssych-ui para presentar la fecha bajo foco sin afectar
 * el estado seleccionado. La licencia MIT acompaña a HeatCalendar.
 */
import { motion, useReducedMotion } from "motion/react";

export function LiveFigure({ intent, children }) {
  const reducirMovimiento = useReducedMotion();
  return (
    <motion.div
      key={intent ?? "actual"}
      initial={reducirMovimiento ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: reducirMovimiento ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
