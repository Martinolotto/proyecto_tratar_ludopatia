-- Un logro compartido conserva solo el hecho elegido; nunca enlaza el registro privado.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Describe el hecho compartido sin incorporar el registro personal completo.
create table public.logros_compartidos (
  publicacion_id bigint primary key references public.publicaciones(id),
  logro_codigo text not null,
  regla_version text not null,
  fecha_del_hecho date not null
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.logros_compartidos enable row level security;
revoke all on table public.logros_compartidos from public, anon, authenticated;
grant select on public.logros_compartidos to authenticated;
create policy logros_lectura on public.logros_compartidos for select to authenticated
  using (exists (select 1 from public.publicaciones p where p.id=publicacion_id and p.eliminado_en is null));

-- La referencia de origen es interna y garantiza que la medida pertenece al autor real.
alter table private.autorias_publicaciones add constraint autorias_publicacion_usuario_unica unique(publicacion_id,usuario_id);

-- Relaciona el logro con su medida de origen sin revelar ese vínculo al resto de usuarios.
create table private.origenes_logros_medidas (
  publicacion_id bigint primary key references public.logros_compartidos(publicacion_id),
  usuario_id uuid not null,
  medida_id bigint not null,
  foreign key (publicacion_id, usuario_id)
    references private.autorias_publicaciones(publicacion_id, usuario_id),
  foreign key (usuario_id, medida_id)
    references public.medidas_usuario(usuario_id, medida_id)
);
create index origenes_logros_medida_idx on private.origenes_logros_medidas(usuario_id,medida_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table private.origenes_logros_medidas enable row level security;
revoke all on table private.origenes_logros_medidas from public, anon, authenticated;

-- Comprueba la autoría, quita los metadatos del logro y conserva las respuestas.
create or replace function private.retirar_publicacion(p_id bigint) returns void language plpgsql security definer set search_path = '' as $$
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
  delete from private.origenes_logros_medidas where publicacion_id=p_id;
  delete from public.logros_compartidos where publicacion_id=p_id;
end;
$$;

-- El cambio de estado bloquea la misma fila que debe bloquear una futura publicación del logro.
-- Así la retirada y el estado declarado quedan en una única transacción.
-- Al desmarcar una medida, retira sus logros asociados dentro de la misma transacción.
create function private.retirar_logros_de_medida() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_publicaciones bigint[];
begin
  if old.realizada and not new.realizada then
    if (select auth.uid()) is null or new.usuario_id <> (select auth.uid()) then
      raise exception 'No autorizado';
    end if;
    select array_agg(o.publicacion_id) into v_publicaciones from private.origenes_logros_medidas o
      where o.usuario_id=new.usuario_id and o.medida_id=new.medida_id;
    if v_publicaciones is not null then
      update public.publicaciones set titulo=null,
          contenido=null,
          perfil_visible_id=null,
          etiqueta_codigo=null,
          eliminado_en=clock_timestamp()
        where id=any(v_publicaciones) and eliminado_en is null;
      delete from private.origenes_logros_medidas where publicacion_id=any(v_publicaciones);
      delete from public.logros_compartidos where publicacion_id=any(v_publicaciones);
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.retirar_logros_de_medida() from public, anon, authenticated;
create trigger medida_retirar_logros after update of realizada on public.medidas_usuario
  for each row execute function private.retirar_logros_de_medida();

-- La operación para crear un logro compartible se agregará al aprobar su primera regla factual.
-- Ningún cliente puede insertar libremente una publicación de tipo logro o afirmar un hecho inventado.
