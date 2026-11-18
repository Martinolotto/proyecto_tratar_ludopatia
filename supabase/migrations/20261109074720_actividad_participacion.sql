-- Actividad diaria privada: un registro por cuenta y día argentino.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Conserva la entrada privada diaria y valida por separado las cantidades declaradas.
create table public.registros_actividad (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id),
  fecha date not null default (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date,
  aposto boolean not null,
  tuvo_ganas boolean,
  tiempo_valor numeric,
  tiempo_unidad text,
  cantidad_apuestas integer check (cantidad_apuestas >= 0),
  dinero_apostado numeric,
  dinero_perdido numeric,
  observacion text,
  creado_en timestamptz not null default clock_timestamp(),
  actualizado_en timestamptz not null default clock_timestamp(),
  unique (usuario_id, fecha),
  -- Una cantidad omitida permanece vacía; no se interpreta como cero.
  check (
    (tiempo_valor is null and tiempo_unidad is null)
    or (tiempo_valor is not null and tiempo_unidad in ('minutos', 'horas'))
  ),
  check (
    tiempo_valor is null
    or (tiempo_valor >= 0 and tiempo_valor not in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric))
  ),
  check (
    dinero_apostado is null
    or (
      dinero_apostado >= 0
      and scale(dinero_apostado) <= 2
      and dinero_apostado not in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric)
    )
  ),
  check (
    dinero_perdido is null
    or (
      dinero_perdido >= 0
      and scale(dinero_perdido) <= 2
      and dinero_perdido not in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric)
    )
  ),
  check (
    aposto
    or (
      tiempo_valor is null
      and tiempo_unidad is null
      and cantidad_apuestas is null
      and dinero_apostado is null
      and dinero_perdido is null
    )
  )
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.registros_actividad enable row level security;
revoke all on table public.registros_actividad from public, anon, authenticated;
grant select on public.registros_actividad to authenticated;
grant insert (
  usuario_id,
  fecha,
  aposto,
  tuvo_ganas,
  tiempo_valor,
  tiempo_unidad,
  cantidad_apuestas,
  dinero_apostado,
  dinero_perdido,
  observacion
) on public.registros_actividad to authenticated;
grant update (
  aposto,
  tuvo_ganas,
  tiempo_valor,
  tiempo_unidad,
  cantidad_apuestas,
  dinero_apostado,
  dinero_perdido,
  observacion
) on public.registros_actividad to authenticated;
grant usage, select on sequence public.registros_actividad_id_seq to authenticated;
create policy actividad_leer on public.registros_actividad for select to authenticated using (usuario_id = (select auth.uid()));
create policy actividad_crear_hoy on public.registros_actividad for insert to authenticated
  with check (usuario_id = (select auth.uid()) and fecha = (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date);
create policy actividad_actualizar_hoy on public.registros_actividad for update to authenticated
  using (usuario_id = (select auth.uid()) and fecha = (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date)
  with check (usuario_id = (select auth.uid()) and fecha = (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date);

-- Evita actualizar fechas cerradas y asigna la fecha de modificación desde la base.
create function private.marcar_actualizacion_actividad() returns trigger language plpgsql set search_path = '' as $$
begin
  if old.fecha <> (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date then
    raise exception 'El día ya está cerrado';
  end if;
  new.actualizado_en := clock_timestamp();
  return new;
end;
$$;
create trigger actividad_fecha_actualizacion before update on public.registros_actividad
  for each row execute function private.marcar_actualizacion_actividad();

-- Ofrece los códigos de conductas que una persona puede seleccionar en su registro.
create table public.conductas (codigo text primary key, nombre text not null);
insert into public.conductas(codigo,nombre) values
  ('recuperar_perdidas','Intenté recuperar pérdidas'),
  ('exceder_previsto','Me excedí de lo que tenía previsto'),
  ('dificultad_detenerse','Me costó detenerme'),
  ('interrumpir_actividades','Interrumpí otras actividades'),
  ('repercusiones','Tuve repercusiones cotidianas o sociales');

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.conductas enable row level security;
revoke all on table public.conductas from public, anon, authenticated;
grant select on public.conductas to authenticated;
create policy conductas_lectura on public.conductas for select to authenticated using (true);

-- Vincula cada registro con cero o varias conductas, sin repetir una misma selección.
create table public.registro_conductas (
  registro_id bigint not null references public.registros_actividad(id),
  conducta_codigo text not null references public.conductas(codigo),
  primary key (registro_id, conducta_codigo)
);
create index registro_conductas_codigo_idx on public.registro_conductas(conducta_codigo);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.registro_conductas enable row level security;
revoke all on table public.registro_conductas from public, anon, authenticated;
grant select, insert, delete on public.registro_conductas to authenticated;
create policy conductas_registro_leer on public.registro_conductas for select to authenticated
  using (exists (select 1 from public.registros_actividad r where r.id = registro_id
      and r.usuario_id = (select auth.uid())));
create policy conductas_registro_insertar on public.registro_conductas for insert to authenticated
  with check (exists (select 1 from public.registros_actividad r where r.id = registro_id
      and r.usuario_id = (select auth.uid())
      and r.fecha = (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date));
create policy conductas_registro_eliminar_hoy on public.registro_conductas for delete to authenticated
  using (exists (select 1 from public.registros_actividad r where r.id = registro_id
      and r.usuario_id = (select auth.uid())
      and r.fecha = (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date));

-- Acredita como máximo una participación por cuenta y día para las funciones que la necesitan.
create table public.participacion_diaria (
  usuario_id uuid not null references auth.users(id),
  fecha date not null,
  primera_accion_valida text not null,
  acreditado_en timestamptz not null default clock_timestamp(),
  primary key (usuario_id, fecha)
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.participacion_diaria enable row level security;
revoke all on table public.participacion_diaria from public, anon, authenticated;
grant select on public.participacion_diaria to authenticated;
create policy participacion_propia on public.participacion_diaria for select to authenticated using (usuario_id = (select auth.uid()));

-- Solo una escritura auténtica de actividad acredita participación; iniciar sesión no cuenta.
create function private.acreditar_actividad() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or new.usuario_id <> (select auth.uid()) then
    raise exception 'La participación requiere una cuenta autorizada';
  end if;
  insert into public.participacion_diaria(usuario_id, fecha, primera_accion_valida)
  values (new.usuario_id, new.fecha, 'actividad_guardada') on conflict (usuario_id, fecha) do nothing;
  return new;
end;
$$;
revoke all on function private.acreditar_actividad() from public, anon, authenticated;
create trigger actividad_acredita_participacion after insert or update on public.registros_actividad
  for each row execute function private.acreditar_actividad();

-- Guarda o actualiza la entrada de hoy y sus conductas en una sola transacción.
create function public.guardar_actividad_hoy(p_aposto boolean,
    p_tuvo_ganas boolean,
    p_tiempo_valor numeric,
    p_tiempo_unidad text,
    p_cantidad_apuestas integer,
    p_dinero_apostado numeric,
    p_dinero_perdido numeric,
    p_observacion text,
    p_conductas text[])
returns bigint language plpgsql security invoker set search_path = '' as $$
declare
  v_id bigint; v_hoy date := (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date;
begin
  if (select auth.uid()) is null then
    raise exception 'Se requiere sesión';
  end if;
  -- La clave usuario/fecha decide si se crea la entrada o se actualiza la existente.
  insert into public.registros_actividad(usuario_id,
      fecha,
      aposto,
      tuvo_ganas,
      tiempo_valor,
      tiempo_unidad,
      cantidad_apuestas,
      dinero_apostado,
      dinero_perdido,
      observacion)
  values ((select auth.uid()),
      v_hoy,
      p_aposto,
      p_tuvo_ganas,
      p_tiempo_valor,
      p_tiempo_unidad,
      p_cantidad_apuestas,
      p_dinero_apostado,
      p_dinero_perdido,
      p_observacion)
  on conflict (usuario_id,
      fecha) do update set aposto=excluded.aposto,
      tuvo_ganas=excluded.tuvo_ganas,
      tiempo_valor=excluded.tiempo_valor,
      tiempo_unidad=excluded.tiempo_unidad,
      cantidad_apuestas=excluded.cantidad_apuestas,
      dinero_apostado=excluded.dinero_apostado,
      dinero_perdido=excluded.dinero_perdido,
      observacion=excluded.observacion
  returning id into v_id;
  -- Las selecciones anteriores se sustituyen por las enviadas en este guardado.
  delete from public.registro_conductas where registro_id=v_id;
  insert into public.registro_conductas(registro_id,conducta_codigo)
  select v_id, x from unnest(coalesce(p_conductas, array[]::text[])) x;
  return v_id;
end;
$$;
revoke all on function public.guardar_actividad_hoy(boolean,
    boolean,
    numeric,
    text,
    integer,
    numeric,
    numeric,
    text,
    text[]) from public,
    anon;
grant execute on function public.guardar_actividad_hoy(boolean,
    boolean,
    numeric,
    text,
    integer,
    numeric,
    numeric,
    text,
    text[]) to authenticated;
