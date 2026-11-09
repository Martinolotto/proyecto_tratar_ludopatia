-- Corrige la integridad del tiempo declarado en Mi actividad de MODUS.
-- Complementa la migración inicial sin reescribir su historial: cantidad y unidad
-- deben estar ambas ausentes o presentes con una unidad admitida.

-- La comprobación previa informa solo la cantidad de filas incompatibles.
-- Si existen, la migración se detiene para que el responsable decida qué hacer;
-- nunca completa unidades ni cambia información declarada automáticamente.
do $$
declare
  filas_incompatibles bigint;
begin
  select count(*)
  into filas_incompatibles
  from public.registros_actividad
  where not (
    (tiempo_valor is null and tiempo_unidad is null)
    or (
      tiempo_valor is not null
      and tiempo_unidad is not null
      and tiempo_unidad in ('minutos', 'horas')
    )
  );

  if filas_incompatibles > 0 then
    raise exception
      'No se puede corregir el tiempo: existen % registros incompatibles. Se requiere revisión manual.',
      filas_incompatibles;
  end if;
end;
$$;

-- PostgreSQL admite NULL como resultado de un CHECK. La condición explícita
-- de presencia de la unidad impide aceptar una cantidad sin minutos u horas.
-- Primero se valida la nueva regla; después se retira la versión incompleta.
alter table public.registros_actividad
  add constraint registros_actividad_tiempo_completo_check
  check (
    (tiempo_valor is null and tiempo_unidad is null)
    or (
      tiempo_valor is not null
      and tiempo_unidad is not null
      and tiempo_unidad in ('minutos', 'horas')
    )
  );

alter table public.registros_actividad
  drop constraint registros_actividad_check;
