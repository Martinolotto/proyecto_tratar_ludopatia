-- Las solicitudes y los vínculos comparten una fila por par de cuentas.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Registra solicitudes entre cuentas y su respuesta con acceso limitado a las partes.
create table public.vinculos (
  id bigint generated always as identity primary key,
  solicitante_id uuid not null references auth.users(id),
  destinatario_id uuid not null references auth.users(id),
  estado text not null default 'pendiente' check (estado in ('pendiente','aceptado','rechazado')),
  solicitado_en timestamptz not null default clock_timestamp(),
  respondido_en timestamptz,
  check (solicitante_id <> destinatario_id)
);
create unique index vinculos_par_unico on public.vinculos (least(solicitante_id,
    destinatario_id),
    greatest(solicitante_id,
    destinatario_id));
create index vinculos_destinatario_idx on public.vinculos(destinatario_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.vinculos enable row level security;
revoke all on table public.vinculos from public, anon, authenticated;
grant select on public.vinculos to authenticated;
grant insert (
  solicitante_id,
  destinatario_id
) on public.vinculos to authenticated;
grant update (
  estado
) on public.vinculos to authenticated;
grant usage, select on sequence public.vinculos_id_seq to authenticated;
create policy vinculos_lectura on public.vinculos for select to authenticated
  using ((select auth.uid()) in (solicitante_id,destinatario_id));
create policy vinculos_solicitud on public.vinculos for insert to authenticated
  with check (solicitante_id = (select auth.uid()) and estado = 'pendiente');
create policy vinculos_respuesta on public.vinculos for update to authenticated
  using (destinatario_id = (select auth.uid()) and estado = 'pendiente')
  with check (destinatario_id = (select auth.uid()) and estado in ('aceptado','rechazado'));

-- Registra el momento de respuesta a una solicitud o invitación.
create function private.marcar_respuesta() returns trigger language plpgsql set search_path = '' as $$
begin
  new.respondido_en := clock_timestamp();
  return new;
  end;
$$;
create trigger vinculos_respuesta_fecha before update on public.vinculos
  for each row execute function private.marcar_respuesta();

-- Representa cada espacio de apoyo y su creador.
create table public.tableros_apoyo (
  id bigint generated always as identity primary key,
  creador_id uuid not null references auth.users(id),
  nombre text not null check (length(btrim(nombre)) > 0),
  creado_en timestamptz not null default clock_timestamp()
);

-- Relaciona cuentas con tableros y distingue invitaciones pendientes de membresías aceptadas.
create table public.participantes_tablero (
  tablero_id bigint not null references public.tableros_apoyo(id),
  usuario_id uuid not null references auth.users(id),
  invitado_por uuid references auth.users(id),
  estado text not null check (estado in ('pendiente','aceptado','rechazado')),
  invitado_en timestamptz not null default clock_timestamp(),
  respondido_en timestamptz,
  primary key (tablero_id, usuario_id)
);
create index participantes_usuario_idx on public.participantes_tablero(usuario_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.tableros_apoyo enable row level security;
revoke all on table public.tableros_apoyo from public, anon, authenticated;

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.participantes_tablero enable row level security;
revoke all on table public.participantes_tablero from public, anon, authenticated;

-- Los auxiliares privados solo responden por la cuenta de la sesión y evitan políticas recursivas.
grant usage on schema private to authenticated;

-- Comprueba la membresía aceptada para aplicar las reglas de acceso al tablero.
create function private.es_integrante(p_tablero bigint) returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
      and exists (select 1 from public.participantes_tablero p where p.tablero_id=p_tablero
      and p.usuario_id=(select auth.uid())
      and p.estado='aceptado');
$$;

-- Determina si la cuenta puede consultar el tablero según su participación.
create function private.puede_ver_tablero(p_tablero bigint) returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
      and exists (select 1 from public.participantes_tablero p where p.tablero_id=p_tablero
      and p.usuario_id=(select auth.uid())
      and p.estado in ('pendiente','aceptado'));
$$;

-- Comprueba las condiciones necesarias para permitir operaciones dentro del tablero.
create function private.tablero_habilitado(p_tablero bigint) returns boolean language sql stable security definer set search_path = '' as $$
  select private.es_integrante(p_tablero)
      and (select count(*) >= 2 from public.participantes_tablero p where p.tablero_id=p_tablero
      and p.estado='aceptado');
$$;
revoke all on function private.es_integrante(bigint),
    private.puede_ver_tablero(bigint),
    private.tablero_habilitado(bigint) from public,
    anon;
grant execute on function private.es_integrante(bigint),
    private.puede_ver_tablero(bigint),
    private.tablero_habilitado(bigint) to authenticated;
grant select on public.tableros_apoyo to authenticated;
grant insert (
  creador_id,
  nombre
) on public.tableros_apoyo to authenticated;
grant usage, select on sequence public.tableros_apoyo_id_seq to authenticated;
create policy tableros_lectura on public.tableros_apoyo for select to authenticated
  using (creador_id=(select auth.uid()) or private.puede_ver_tablero(id));
create policy tableros_creacion on public.tableros_apoyo for insert to authenticated with check (creador_id=(select auth.uid()));
grant select on public.participantes_tablero to authenticated;
grant insert (
  tablero_id,
  usuario_id,
  invitado_por,
  estado
) on public.participantes_tablero to authenticated;
grant update (
  estado
) on public.participantes_tablero to authenticated;
create policy participantes_lectura on public.participantes_tablero for select to authenticated
  using (usuario_id=(select auth.uid()) or private.es_integrante(tablero_id));
create policy participantes_invitacion on public.participantes_tablero for insert to authenticated
  with check (estado='pendiente'
      and invitado_por=(select auth.uid())
      and usuario_id<>invitado_por
      and private.es_integrante(tablero_id)

        and exists (select 1 from public.vinculos v where v.estado='aceptado'
        and ((v.solicitante_id=invitado_por
        and v.destinatario_id=usuario_id)
        or (v.destinatario_id=invitado_por
        and v.solicitante_id=usuario_id))));
create policy participantes_respuesta on public.participantes_tablero for update to authenticated
  using (usuario_id=(select auth.uid()) and estado='pendiente')
  with check (usuario_id=(select auth.uid()) and estado in ('aceptado','rechazado'));
create trigger participantes_respuesta_fecha before update on public.participantes_tablero
  for each row execute function private.marcar_respuesta();

-- La creación del tablero y la pertenencia inicial ocurren en la misma transacción.
-- Incorpora al creador como participante al crear un tablero.
create function private.agregar_creador_tablero() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or new.creador_id <> (select auth.uid()) then
    raise exception 'Se requiere creador autorizado';
  end if;
  insert into public.participantes_tablero(tablero_id,
      usuario_id,
      estado,
      respondido_en) values (new.id,
      new.creador_id,
      'aceptado',
      clock_timestamp());
  return new;
end;
$$;
revoke all on function private.agregar_creador_tablero() from public, anon, authenticated;
create trigger tablero_agrega_creador after insert on public.tableros_apoyo for each row execute function private.agregar_creador_tablero();

-- Conserva la participación diaria válida de un tablero para su seguimiento.
create table public.participacion_tablero_diaria (
  tablero_id bigint not null references public.tableros_apoyo(id),
  fecha date not null,
  primera_accion_valida text not null,
  acreditado_en timestamptz not null default clock_timestamp(),
  primary key (tablero_id,fecha)
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.participacion_tablero_diaria enable row level security;
revoke all on table public.participacion_tablero_diaria from public, anon, authenticated;
grant select on public.participacion_tablero_diaria to authenticated;
create policy racha_tablero_lectura on public.participacion_tablero_diaria for select to authenticated using (private.es_integrante(tablero_id));
