-- Completa índices de apoyo a relaciones del modelo compartido de MODUS.
-- Las claves foráneas ya existen: estos índices facilitan búsquedas por cuenta
-- sin modificar tablas, datos, permisos ni estados funcionales.

-- Permite localizar los tableros creados por una cuenta sin recorrer toda la tabla.
create index tableros_apoyo_creador_idx
  on public.tableros_apoyo (creador_id);

-- El índice del par ordenado evita vínculos duplicados, pero no sustituye
-- un índice directo para buscar las solicitudes enviadas por una cuenta.
create index vinculos_solicitante_idx
  on public.vinculos (solicitante_id);

-- Complementa la clave tablero/usuario y el índice del usuario invitado:
-- esta relación identifica la cuenta que realizó la invitación.
create index participantes_invitado_por_idx
  on public.participantes_tablero (invitado_por);
