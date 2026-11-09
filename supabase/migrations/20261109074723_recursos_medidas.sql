-- Catálogo compartido: solo se exponen recursos revisados y publicados por el equipo.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Describe recursos publicados; las fuentes y fechas de verificación respaldan su publicación.
create table public.recursos (
  id bigint generated always as identity primary key,
  nombre text not null check (length(btrim(nombre)) > 0),
  utilidad text not null,
  imagen_o_icono text,
  enlace text not null,
  instrucciones text not null,
  compatibilidad text,
  categoria_escudo text check (categoria_escudo in ('acceso','estimulos','apoyo')),
  alcance_territorial text,
  fuente_verificacion text,
  verificado_en timestamptz,
  publicado boolean not null default false,
  check (not publicado or (fuente_verificacion is not null and verificado_en is not null))
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.recursos enable row level security;
revoke all on table public.recursos from public, anon, authenticated;
grant select on public.recursos to anon, authenticated;
create policy recursos_publicados on public.recursos for select to anon, authenticated using (publicado);

-- Relaciona cada medida práctica con el recurso al que pertenece.
create table public.medidas_proteccion (
  id bigint generated always as identity primary key,
  recurso_id bigint not null references public.recursos(id),
  descripcion text not null check (length(btrim(descripcion)) > 0)
);
create index medidas_recurso_idx on public.medidas_proteccion(recurso_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.medidas_proteccion enable row level security;
revoke all on table public.medidas_proteccion from public, anon, authenticated;
grant select on public.medidas_proteccion to authenticated;
create policy medidas_publicadas on public.medidas_proteccion for select to authenticated
  using (exists (select 1 from public.recursos r where r.id = recurso_id and r.publicado));

-- Conserva el estado declarado por cada usuario; no comprueba instalaciones externas.
create table public.medidas_usuario (
  usuario_id uuid not null references auth.users(id),
  medida_id bigint not null references public.medidas_proteccion(id),
  realizada boolean not null,
  actualizado_en timestamptz not null default clock_timestamp(),
  primary key (usuario_id, medida_id)
);
create index medidas_usuario_medida_idx on public.medidas_usuario(medida_id);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.medidas_usuario enable row level security;
revoke all on table public.medidas_usuario from public, anon, authenticated;
grant select on public.medidas_usuario to authenticated;
grant insert (
  usuario_id,
  medida_id,
  realizada
) on public.medidas_usuario to authenticated;
grant update (
  realizada
) on public.medidas_usuario to authenticated;
create policy medidas_usuario_leer on public.medidas_usuario for select to authenticated using (usuario_id = (select auth.uid()));
create policy medidas_usuario_insertar on public.medidas_usuario for insert to authenticated
  with check (usuario_id = (select auth.uid())
      and exists (select 1 from public.medidas_proteccion m where m.id = medida_id));
create policy medidas_usuario_actualizar on public.medidas_usuario for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- Actualiza automáticamente la fecha cuando cambia el estado declarado de una medida.
create function private.actualizar_fecha_medida() returns trigger language plpgsql set search_path = '' as $$
begin
  new.actualizado_en := clock_timestamp();
  return new;
end;
$$;
create trigger medidas_usuario_fecha before update on public.medidas_usuario
  for each row execute function private.actualizar_fecha_medida();
