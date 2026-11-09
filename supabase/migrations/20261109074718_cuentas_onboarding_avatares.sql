-- Cuentas compartidas, onboarding final e imágenes de perfil. Auth administra las credenciales.
-- Esta migración forma parte del esquema local de MODUS y se aplica en el orden de su nombre.

-- Conecta la cuenta administrada por Auth con la información visible del perfil.
create table public.perfiles (
  usuario_id uuid primary key references auth.users(id),
  username text not null check (length(btrim(username)) between 1 and 64 and username = btrim(username)),
  avatar_path text,
  creado_en timestamptz not null default now()
);
create unique index perfiles_username_normalizado_uidx on public.perfiles (lower(username));

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.perfiles enable row level security;
revoke all on table public.perfiles from public, anon, authenticated;
grant select on public.perfiles to authenticated;
grant update (
  username,
  avatar_path
) on public.perfiles to authenticated;
create policy perfiles_lectura on public.perfiles for select to authenticated using (true);
create policy perfiles_modificacion_propia on public.perfiles for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- El nombre se valida en PostgreSQL; los metadatos nunca se usan para conceder permisos.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Crea el perfil vinculado cuando Auth registra una cuenta nueva.
create function private.crear_perfil_al_registrar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (usuario_id, username)
  values (new.id, btrim(new.raw_user_meta_data ->> 'username'));
  return new;
end;
$$;
revoke all on function private.crear_perfil_al_registrar() from public, anon, authenticated;
create trigger crear_perfil_al_registrar after insert on auth.users
  for each row execute function private.crear_perfil_al_registrar();

-- Guarda una sola finalización por cuenta, con respuestas opcionales y sin diagnósticos.
create table public.onboarding (
  usuario_id uuid primary key references auth.users(id),
  estado text not null check (estado in ('completado', 'omitido')),
  rango_edad text check (rango_edad in ('13-14', '15-17', '18-plus')),
  participo_en_apuestas boolean,
  frecuencia_inicial text check (frecuencia_inicial in ('not-currently', 'less-than-weekly', 'one-to-three-days', 'four-to-six-days', 'daily')),
  percepcion_personal text check (percepcion_personal in ('little-presence', 'questions', 'concerns', 'unsure')),
  motivo_ingreso text check (motivo_ingreso in ('understand-risks', 'understand-activity', 'peer-support', 'practical-resources')),
  finalizado_en timestamptz not null default now()
);

-- RLS y permisos limitan qué filas y operaciones están disponibles para cada cuenta.
alter table public.onboarding enable row level security;
revoke all on table public.onboarding from public, anon, authenticated;
grant select on public.onboarding to authenticated;
grant insert (
  usuario_id,
  estado,
  rango_edad,
  participo_en_apuestas,
  frecuencia_inicial,
  percepcion_personal,
  motivo_ingreso
) on public.onboarding to authenticated;
create policy onboarding_consulta_propia on public.onboarding for select to authenticated using (usuario_id = (select auth.uid()));
create policy onboarding_finalizacion_propia on public.onboarding for insert to authenticated with check (usuario_id = (select auth.uid()));

-- El bucket es privado: cada propietario escribe bajo su UUID y solo cuentas autenticadas leen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']);
create policy avatares_lectura_autenticada on storage.objects for select to authenticated using (bucket_id = 'avatares');
create policy avatares_insercion_propia on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatares_actualizacion_propia on storage.objects for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatares_borrado_propio on storage.objects for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
