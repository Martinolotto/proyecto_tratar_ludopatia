-- Comunidad y tableros comparten contenido, pero aplican permisos distintos.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Mantiene las etiquetas disponibles para clasificar publicaciones de Comunidad.
create table public.etiquetas_comunidad (codigo text primary key, nombre text not null);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.etiquetas_comunidad enable row level security;
revoke all on table public.etiquetas_comunidad from public, anon, authenticated;
grant select on public.etiquetas_comunidad to authenticated;
create policy etiquetas_lectura on public.etiquetas_comunidad for select to authenticated using (true);

-- Guarda el contenido visible y el destino de publicaciones, incluyendo intervenciones anónimas.
create table public.publicaciones (
  id bigint generated always as identity primary key,
  tablero_id bigint references public.tableros_apoyo(id),
  etiqueta_codigo text references public.etiquetas_comunidad(codigo),
  perfil_visible_id uuid references public.perfiles(usuario_id),
  tipo text not null check (tipo in ('texto','hilo','logro')),
  titulo text,
  contenido text,
  creado_en timestamptz not null default clock_timestamp(),
  eliminado_en timestamptz,
  check ((eliminado_en is null
      and contenido is not null
      and length(btrim(contenido)) > 0
      and (tablero_id is not null
      or (titulo is not null
      and length(btrim(titulo)) > 0
      and etiqueta_codigo is not null)))

        or (eliminado_en is not null
        and contenido is null
        and titulo is null
        and etiqueta_codigo is null
        and perfil_visible_id is null))
);
create index publicaciones_tablero_fecha_idx on public.publicaciones(tablero_id,creado_en desc);
create index publicaciones_etiqueta_idx on public.publicaciones(etiqueta_codigo);
create index publicaciones_perfil_idx on public.publicaciones(perfil_visible_id);

-- Separa la autoría real del contenido visible para controlar operaciones sin exponer identidad.
create table private.autorias_publicaciones (
  publicacion_id bigint primary key references public.publicaciones(id),
  usuario_id uuid not null references auth.users(id)
);
create index autorias_publicaciones_usuario_idx on private.autorias_publicaciones(usuario_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.publicaciones enable row level security;
revoke all on table public.publicaciones from public, anon, authenticated;

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table private.autorias_publicaciones enable row level security;
revoke all on table private.autorias_publicaciones from public, anon, authenticated;
grant select on public.publicaciones to authenticated;
create policy publicaciones_lectura on public.publicaciones for select to authenticated
  using (tablero_id is null or private.es_integrante(tablero_id));

-- Relaciona respuestas con sus publicaciones y conserva su estado de retirada.
create table public.comentarios (
  id bigint generated always as identity primary key,
  publicacion_id bigint not null references public.publicaciones(id),
  respuesta_a_id bigint,
  perfil_visible_id uuid references public.perfiles(usuario_id),
  contenido text,
  creado_en timestamptz not null default clock_timestamp(),
  eliminado_en timestamptz,
  unique(id,publicacion_id),
  foreign key(respuesta_a_id,publicacion_id) references public.comentarios(id,publicacion_id),
  check ((eliminado_en is null
      and contenido is not null
      and length(btrim(contenido)) > 0)
      or (eliminado_en is not null
      and contenido is null
      and perfil_visible_id is null))
);
create index comentarios_publicacion_idx on public.comentarios(publicacion_id,creado_en);
create index comentarios_respuesta_idx on public.comentarios(respuesta_a_id,publicacion_id);
create index comentarios_perfil_idx on public.comentarios(perfil_visible_id);

-- Restringe la identidad real de cada comentario, incluso cuando se muestra anónimo.
create table private.autorias_comentarios (
  comentario_id bigint primary key references public.comentarios(id),
  usuario_id uuid not null references auth.users(id)
);
create index autorias_comentarios_usuario_idx on private.autorias_comentarios(usuario_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.comentarios enable row level security;
revoke all on table public.comentarios from public, anon, authenticated;

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table private.autorias_comentarios enable row level security;
revoke all on table private.autorias_comentarios from public, anon, authenticated;
grant select on public.comentarios to authenticated;
create policy comentarios_lectura on public.comentarios for select to authenticated
  using (exists (select 1 from public.publicaciones p where p.id=publicacion_id));

-- Registra las reacciones de usuarios sobre publicaciones según los permisos establecidos.
create table public.reacciones (
  publicacion_id bigint not null references public.publicaciones(id),
  usuario_id uuid not null references auth.users(id),
  primary key(publicacion_id,usuario_id)
);
create index reacciones_usuario_idx on public.reacciones(usuario_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.reacciones enable row level security;
revoke all on table public.reacciones from public, anon, authenticated;
grant select, insert, delete on public.reacciones to authenticated;
create policy reacciones_lectura_propia on public.reacciones for select to authenticated
  using (usuario_id=(select auth.uid())
      and exists (select 1 from public.publicaciones p where p.id=publicacion_id
      and p.eliminado_en is null));
create policy reacciones_crear_propia on public.reacciones for insert to authenticated
  with check (usuario_id=(select auth.uid())
      and exists (select 1 from public.publicaciones p where p.id=publicacion_id
      and p.eliminado_en is null
      and (p.tablero_id is null
      or private.tablero_habilitado(p.tablero_id))));
create policy reacciones_eliminar_propia on public.reacciones for delete to authenticated
  using (usuario_id=(select auth.uid())
      and exists (select 1 from public.publicaciones p where p.id=publicacion_id
      and p.eliminado_en is null));

-- El auxiliar protege la autoría real; acepta solo identidad de la sesión autenticada.
-- Valida la solicitud y registra la publicación junto con su autoría protegida.
create function private.crear_publicacion(p_tablero bigint,
    p_etiqueta text,
    p_tipo text,
    p_titulo text,
    p_contenido text,
    p_anonimo boolean)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_usuario uuid := (select auth.uid());
begin
  if v_usuario is null or p_anonimo is null then
    raise exception 'Se requiere sesión e identidad elegida';
  end if;
  if p_tipo not in ('texto','hilo') then
    raise exception 'Tipo de publicación no habilitado';
  end if;
  if p_tipo = 'hilo' and coalesce((select auth.jwt()) -> 'app_metadata' ->> 'rol','') <> 'equipo' then
    raise exception 'Se requiere rol del equipo';
  end if;
  if p_tablero is not null and not private.tablero_habilitado(p_tablero) then
    raise exception 'Tablero no disponible';
  end if;
  insert into public.publicaciones(tablero_id,etiqueta_codigo,perfil_visible_id,tipo,titulo,contenido)
  values(p_tablero,
      p_etiqueta,
      case when p_anonimo then null else v_usuario end,
      p_tipo,
      p_titulo,
      p_contenido) returning id into v_id;
  -- La autoría real se conserva separada de la identidad visible elegida.
  insert into private.autorias_publicaciones(publicacion_id,usuario_id) values(v_id,v_usuario);
  if p_tablero is not null then
    insert into public.participacion_tablero_diaria(tablero_id,fecha,primera_accion_valida)
    values(p_tablero,
        (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date,
        'publicacion') on conflict (tablero_id,
        fecha) do nothing;
  end if;
  return v_id;
end;
$$;
revoke all on function private.crear_publicacion(bigint,text,text,text,text,boolean) from public, anon;
grant execute on function private.crear_publicacion(bigint,text,text,text,text,boolean) to authenticated;

-- Expone la operación de publicación a la API sin duplicar sus validaciones internas.
create function public.crear_publicacion(p_tablero bigint,
    p_etiqueta text,
    p_tipo text,
    p_titulo text,
    p_contenido text,
    p_anonimo boolean)
returns bigint language sql security invoker set search_path = '' as $$
  select private.crear_publicacion(p_tablero,p_etiqueta,p_tipo,p_titulo,p_contenido,p_anonimo);
$$;
revoke all on function public.crear_publicacion(bigint,text,text,text,text,boolean) from public, anon;
grant execute on function public.crear_publicacion(bigint,text,text,text,text,boolean) to authenticated;

-- Valida la solicitud y registra el comentario junto con su autoría protegida.
create function private.crear_comentario(p_publicacion bigint,
    p_respuesta bigint,
    p_contenido text,
    p_anonimo boolean)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_tablero bigint; v_autor uuid; v_usuario uuid := (select auth.uid());
begin
  if v_usuario is null or p_anonimo is null then
    raise exception 'Se requiere sesión e identidad elegida';
  end if;
  select p.tablero_id,
      a.usuario_id into v_tablero,
      v_autor from public.publicaciones p join private.autorias_publicaciones a on a.publicacion_id=p.id
    where p.id=p_publicacion and p.eliminado_en is null;
  if not found or (v_tablero is not null and not private.tablero_habilitado(v_tablero)) then
    raise exception 'Publicación no disponible';
  end if;
  if p_respuesta is not null
      and not exists (select 1 from public.comentarios c where c.id=p_respuesta
      and c.publicacion_id=p_publicacion
      and c.eliminado_en is null) then
  raise exception 'Respuesta no disponible';
  end if;
  insert into public.comentarios(publicacion_id,respuesta_a_id,perfil_visible_id,contenido)
    values(p_publicacion,
        p_respuesta,
        case when p_anonimo then null else v_usuario end,
        p_contenido) returning id into v_id;
  -- El vínculo privado permite comprobar autoría sin mostrarla en comentarios anónimos.
  insert into private.autorias_comentarios(comentario_id,usuario_id) values(v_id,v_usuario);
  if v_tablero is not null and v_autor <> v_usuario then
    insert into public.participacion_tablero_diaria(tablero_id,fecha,primera_accion_valida)
    values(v_tablero,
        (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date,
        'respuesta_otro_integrante') on conflict (tablero_id,
        fecha) do nothing;
  end if;
  return v_id;
end;
$$;
revoke all on function private.crear_comentario(bigint,bigint,text,boolean) from public, anon;
grant execute on function private.crear_comentario(bigint,bigint,text,boolean) to authenticated;

-- Expone a la API la operación de crear comentarios.
create function public.crear_comentario(p_publicacion bigint,
    p_respuesta bigint,
    p_contenido text,
    p_anonimo boolean)
returns bigint language sql security invoker set search_path = '' as $$ select private.crear_comentario(p_publicacion,
    p_respuesta,
    p_contenido,
    p_anonimo); $$;
revoke all on function public.crear_comentario(bigint,bigint,text,boolean) from public, anon;
grant execute on function public.crear_comentario(bigint,bigint,text,boolean) to authenticated;

-- Comprueba la autoría y retira el contenido conservando las relaciones necesarias.
create function private.retirar_publicacion(p_id bigint) returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null
      or not exists (select 1 from private.autorias_publicaciones a where a.publicacion_id=p_id
      and a.usuario_id=(select auth.uid())) then
  raise exception 'No autorizado';
  end if;
  update public.publicaciones set titulo=null,
      contenido=null,
      perfil_visible_id=null,
      etiqueta_codigo=null,
      eliminado_en=clock_timestamp() where id=p_id and eliminado_en is null;
end;
$$;

-- Comprueba la autoría y retira el contenido del comentario.
create function private.retirar_comentario(p_id bigint) returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null
      or not exists (select 1 from private.autorias_comentarios a where a.comentario_id=p_id
      and a.usuario_id=(select auth.uid())) then
  raise exception 'No autorizado';
  end if;
  update public.comentarios set contenido=null,
      perfil_visible_id=null,
      eliminado_en=clock_timestamp() where id=p_id and eliminado_en is null;
end;
$$;
revoke all on function private.retirar_publicacion(bigint),
    private.retirar_comentario(bigint) from public,
    anon;
grant execute on function private.retirar_publicacion(bigint), private.retirar_comentario(bigint) to authenticated;

-- Permite solicitar la retirada mediante la función interna autorizada.
create function public.retirar_publicacion(p_id bigint) returns void language sql security invoker set search_path = '' as $$ select private.retirar_publicacion(p_id); $$;

-- Permite solicitar la retirada del comentario mediante la función interna autorizada.
create function public.retirar_comentario(p_id bigint) returns void language sql security invoker set search_path = '' as $$ select private.retirar_comentario(p_id); $$;
revoke all on function public.retirar_publicacion(bigint),public.retirar_comentario(bigint) from public, anon;
grant execute on function public.retirar_publicacion(bigint),public.retirar_comentario(bigint) to authenticated;

-- El conteo agregado se expone sin revelar quién reaccionó y respeta el destino.
-- Cuenta las reacciones cuando la cuenta puede consultar la publicación.
create function private.contar_reacciones(p_id bigint) returns bigint language plpgsql stable security definer set search_path = '' as $$
declare v_cantidad bigint;
begin
  if (select auth.uid()) is null
      or not exists (select 1 from public.publicaciones p where p.id=p_id
      and p.eliminado_en is null
      and (p.tablero_id is null
      or private.es_integrante(p.tablero_id))) then
  raise exception 'Publicación no disponible';
  end if;
  select count(*) into v_cantidad from public.reacciones r where r.publicacion_id=p_id;
  return v_cantidad;
end;
$$;
revoke all on function private.contar_reacciones(bigint) from public, anon;
grant execute on function private.contar_reacciones(bigint) to authenticated;

-- Expone a la API el conteo autorizado sin revelar las reacciones individuales.
create function public.contar_reacciones(p_id bigint) returns bigint language sql stable security invoker set search_path = '' as $$ select private.contar_reacciones(p_id); $$;
revoke all on function public.contar_reacciones(bigint) from public, anon;
grant execute on function public.contar_reacciones(bigint) to authenticated;
