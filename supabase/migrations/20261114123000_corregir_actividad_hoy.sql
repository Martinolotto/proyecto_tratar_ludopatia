-- Conserva la precisión de los números al enviarlos a React y reconoce el
-- cierre del día incluso si la función de guardado anterior genera un error.

-- Devuelve la fecha del servidor incluso cuando la cuenta no tiene una entrada.
-- La identidad proviene de Auth; nunca se recibe desde el navegador.
create or replace function public.consultar_actividad_hoy()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_usuario uuid := (select auth.uid());
  v_fecha date := (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date;
  v_registro public.registros_actividad%rowtype;
  v_conductas text[];
begin
  if v_usuario is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  select * into v_registro
  from public.registros_actividad
  where usuario_id = v_usuario and fecha = v_fecha;

  if not found then
    return jsonb_build_object('fecha', v_fecha, 'registro', null, 'conductas', '[]'::jsonb);
  end if;

  select coalesce(array_agg(rc.conducta_codigo order by rc.conducta_codigo), array[]::text[])
  into v_conductas
  from public.registro_conductas as rc
  where rc.registro_id = v_registro.id;

  return jsonb_build_object(
    'fecha', v_fecha,
    -- JSON numérico pierde precisión al convertirse a Number en JavaScript.
    -- El texto conserva el valor exacto y las columnas NULL siguen vacías.
    'registro', to_jsonb(v_registro) || jsonb_build_object(
      'tiempo_valor', v_registro.tiempo_valor::text,
      'dinero_apostado', v_registro.dinero_apostado::text,
      'dinero_perdido', v_registro.dinero_perdido::text
    ),
    'conductas', to_jsonb(v_conductas)
  );
end;
$$;

-- Al atravesar medianoche durante la operación, la excepción deshace también
-- la escritura y las conductas realizadas por guardar_actividad_hoy.
create or replace function public.guardar_actividad_hoy_validada(
  p_fecha_esperada date,
  p_aposto boolean,
  p_tuvo_ganas boolean,
  p_tiempo_valor numeric,
  p_tiempo_unidad text,
  p_cantidad_apuestas integer,
  p_dinero_apostado numeric,
  p_dinero_perdido numeric,
  p_observacion text,
  p_conductas text[]
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id bigint;
  v_fecha_guardada date;
  v_resultado jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  if p_fecha_esperada is null
    or p_fecha_esperada <> (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date then
    raise exception 'ACTIVIDAD_DIA_CAMBIO' using errcode = 'P0001';
  end if;

  -- Si el día cerró durante la llamada, informamos el caso concreto; para
  -- cualquier otro fallo conservamos el error original y no ocultamos su causa.
  begin
    v_id := public.guardar_actividad_hoy(
      p_aposto, p_tuvo_ganas, p_tiempo_valor, p_tiempo_unidad,
      p_cantidad_apuestas, p_dinero_apostado, p_dinero_perdido,
      p_observacion, p_conductas
    );
  exception when others then
    if p_fecha_esperada <> (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date then
      raise exception 'ACTIVIDAD_DIA_CAMBIO' using errcode = 'P0001';
    end if;
    raise;
  end;

  select fecha into v_fecha_guardada
  from public.registros_actividad
  where id = v_id and usuario_id = (select auth.uid());

  if v_fecha_guardada is distinct from p_fecha_esperada
    or p_fecha_esperada <> (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date then
    raise exception 'ACTIVIDAD_DIA_CAMBIO' using errcode = 'P0001';
  end if;

  v_resultado := public.consultar_actividad_hoy();
  if (v_resultado ->> 'fecha')::date <> p_fecha_esperada then
    raise exception 'ACTIVIDAD_DIA_CAMBIO' using errcode = 'P0001';
  end if;
  return v_resultado;
end;
$$;

-- Ambas funciones mantienen los permisos y políticas de la cuenta que las invoca.
revoke all on function public.consultar_actividad_hoy() from public, anon;
grant execute on function public.consultar_actividad_hoy() to authenticated;
revoke all on function public.guardar_actividad_hoy_validada(date, boolean, boolean, numeric, text, integer, numeric, numeric, text, text[]) from public, anon;
grant execute on function public.guardar_actividad_hoy_validada(date, boolean, boolean, numeric, text, integer, numeric, numeric, text, text[]) to authenticated;

-- PostgREST vuelve a leer las firmas nuevas sin alterar otros servicios.
notify pgrst, 'reload schema';
