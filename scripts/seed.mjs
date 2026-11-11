/* Cuentas y actividad ficticias de MODUS para desarrollo y comprobación.
 * Se usan Auth y la CLI desde Node: ninguna clave administrativa llega a React.
 */
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(raiz, "node_modules/.bin/supabase");
const proyecto = "jmtgahbjrvpwofwjbbui";
const marca = "modus-deteccion-v1";
const cuentas = [1, 2, 3].map((n) => ({
  numero: n,
  email: `modus.seed.0${n}@example.com`,
  alias: `modus_seed_0${n}`,
}));
const patronUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const [accion, destino, ...extras] = process.argv.slice(2);

// Es obligatorio elegir destino: jamás se deduce del proyecto vinculado.
if (
  !["seed", "clean"].includes(accion) ||
  !["--local", "--remote"].includes(destino) ||
  extras.length
) {
  console.error(
    "Uso: npm run seed -- --local|--remote, o npm run seed:clean -- --local|--remote",
  );
  process.exit(1);
}
const remoto = destino === "--remote";
const entorno = { ...process.env };
if (!entorno.DOCKER_HOST && typeof process.getuid === "function") {
  entorno.DOCKER_HOST = `unix:///run/user/${process.getuid()}/podman/podman.sock`;
}

// La CLI siempre recibe el proyecto remoto concreto; sus salidas quedan en memoria.
function ejecutarCli(args) {
  try {
    return execFileSync(cli, args, {
      cwd: raiz,
      env: entorno,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60000,
    });
  } catch {
    throw new Error(
      "La CLI no pudo completar la operación. Comprobá el entorno y la autenticación.",
    );
  }
}

function consultar(sql) {
  const args = ["db", "query", "--output", "json"];
  if (remoto) args.push(`--remote=${proyecto}`, "--yes");
  args.push(sql);
  const salida = ejecutarCli(args).trim();
  // Un bloque DO ejecutado correctamente no devuelve filas: la CLI responde
  // con la etiqueta PostgreSQL "DO" incluso si se pidió salida JSON.
  if (/^do\s/i.test(sql.trim()) && salida === "DO") return [];

  let resultado;
  try {
    resultado = JSON.parse(salida);
  } catch {
    throw new Error(
      "La CLI devolvió una respuesta SQL inesperada; revisá el destino antes de reintentar.",
    );
  }
  if (!Array.isArray(resultado.rows)) {
    throw new Error(
      "La CLI devolvió una respuesta SQL inesperada; revisá el destino antes de reintentar.",
    );
  }
  return resultado.rows;
}

function validarId(id) {
  if (!patronUuid.test(id || "")) {
    throw new Error("Identificador de cuenta inválido.");
  }
  return id;
}

function literales(valores) {
  return valores.map((valor) => `'${valor.replaceAll("'", "''")}'`).join(", ");
}
const correosSql = literales(cuentas.map((c) => c.email));
const aliasesSql = literales(cuentas.map((c) => c.alias));

function obtenerDestino() {
  if (remoto) {
    if (!process.env.SUPABASE_SEED_SECRET_KEY) {
      throw new Error("Falta SUPABASE_SEED_SECRET_KEY en la terminal.");
    }
    return {
      url: `https://${proyecto}.supabase.co`,
      clave: process.env.SUPABASE_SEED_SECRET_KEY,
    };
  }
  // La CLI local entrega la clave en memoria; no se imprime ni se escribe en Git.
  const variables = {};
  for (const linea of ejecutarCli(["status", "--output", "env"]).split("\n")) {
    const par = linea.match(/^([A-Z_]+)=(.*)$/);
    if (par) variables[par[1]] = par[2].replace(/^['"]|['"]$/g, "");
  }
  const url = new URL(variables.API_URL || "");
  if (
    !["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
    !variables.SERVICE_ROLE_KEY
  ) {
    throw new Error("La CLI no devolvió una API y clave locales válidas.");
  }
  return { url: url.origin, clave: variables.SERVICE_ROLE_KEY };
}

// Las operaciones administrativas viven en Node y no exponen su respuesta completa.
async function api(origen, ruta, metodo, body) {
  let respuesta;
  try {
    respuesta = await fetch(`${origen.url}${ruta}`, {
      method: metodo,
      headers: {
        apikey: origen.clave,
        Authorization: `Bearer ${origen.clave}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new Error(
      "No se pudo confirmar la operación. Revisá el estado antes de reintentar.",
    );
  }
  if (!respuesta.ok) {
    throw new Error(`Supabase rechazó la operación (HTTP ${respuesta.status}).`);
  }
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : {};
}

// La CLI y Auth son servicios distintos. Confirmamos que la clave es
// administrativa en la API elegida antes de ejecutar cualquier escritura SQL.
// La respuesta se usa solo para validar su forma; no se muestran sus datos.
async function comprobarCredencial(origen) {
  const resultado = await api(
    origen,
    "/auth/v1/admin/users?page=1&per_page=1",
    "GET",
  );
  if (!Array.isArray(resultado.users)) {
    throw new Error("No se pudo validar la credencial administrativa del destino.");
  }
}

function leerCuentas() {
  return consultar(`select u.id::text, u.email, u.raw_app_meta_data ->> 'modus_seed' as marca,
    p.username from auth.users u left join public.perfiles p on p.usuario_id = u.id
    where lower(u.email) in (${correosSql}) order by u.email`);
}

function revisarColisiones(existentes) {
  for (const cuenta of existentes) {
    validarId(cuenta.id);
    if (
      cuenta.marca !== marca ||
      !cuentas.some((c) => c.email === cuenta.email?.toLowerCase())
    ) {
      throw new Error("Un correo de prueba pertenece a otra cuenta; no se modificó.");
    }
  }
  const alias = consultar(`select p.username, u.email, u.raw_app_meta_data ->> 'modus_seed' as marca
    from public.perfiles p join auth.users u on u.id = p.usuario_id
    where lower(p.username) in (${aliasesSql})`);
  for (const fila of alias) {
    const esperada = cuentas.find((c) => c.alias === fila.username?.toLowerCase());
    if (
      !esperada ||
      fila.marca !== marca ||
      fila.email?.toLowerCase() !== esperada.email
    ) {
      throw new Error("Un alias de prueba pertenece a otra cuenta; no se modificó.");
    }
  }
}

// En el remoto, confirmar el identificador también evita ejecutar por accidente.
async function confirmar() {
  if (!remoto) return;
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("El remoto requiere una terminal interactiva.");
  }
  console.log(`Destino: proyecto remoto de desarrollo ${proyecto}.`);
  console.log(
    accion === "clean"
      ? "Se eliminarán las cuentas ficticias identificadas y sus datos propios después de revisar relaciones."
      : "Se crearán cuentas ficticias con contraseña conocida; no usarlas para datos reales.",
  );
  const entrada = createInterface({ input: stdin, output: stdout });
  try {
    const confirmacion = await entrada.question(
      `Escribí ${proyecto} para confirmar: `,
    );
    if (confirmacion.trim() !== proyecto) {
      throw new Error("Destino no confirmado; no se realizaron cambios.");
    }
  } finally {
    entrada.close();
  }
}

async function sembrar(origen) {
  const existentes = leerCuentas();
  revisarColisiones(existentes);
  for (const cuenta of cuentas) {
    let existente = existentes.find(
      (fila) => fila.email?.toLowerCase() === cuenta.email,
    );
    if (!existente) {
      const creada = await api(origen, "/auth/v1/admin/users", "POST", {
        email: cuenta.email,
        password: "modus123",
        email_confirm: true,
        user_metadata: { username: cuenta.alias },
        app_metadata: { modus_seed: marca },
      });
      existente = { id: validarId(creada.id || creada.user?.id) };
      console.log(`Cuenta ficticia ${cuenta.numero} creada.`);
    } else {
      console.log(`Cuenta ficticia ${cuenta.numero} existente: se conserva.`);
    }
    const id = validarId(existente.id);
    // El trigger de actividad exige auth.uid: la identidad se establece solo en
    // esta transacción; no se desactivan triggers ni se completan datos omitidos.
    consultar(`do $seed$ declare v_usuario uuid := '${id}'::uuid; begin
      perform set_config('request.jwt.claim.sub', v_usuario::text, true);
      insert into public.registros_actividad
        (usuario_id, fecha, aposto, tuvo_ganas, tiempo_valor, tiempo_unidad,
         cantidad_apuestas, dinero_apostado, dinero_perdido, observacion)
      select v_usuario, (clock_timestamp() at time zone 'America/Argentina/Cordoba')::date - dia,
        dia % (3 + ${cuenta.numero}) = 0,
        case when dia % 4 = 0 then true else null end,
        case when dia % (3 + ${cuenta.numero}) = 0 then (20 + dia * ${cuenta.numero})::numeric else null end,
        case when dia % (3 + ${cuenta.numero}) = 0 then 'minutos' else null end,
        case when dia % (3 + ${cuenta.numero}) = 0 then 1 + dia % 3 else null end,
        case when dia % (3 + ${cuenta.numero}) = 0 then (100 + dia * 10)::numeric else null end,
        case when dia % (3 + ${cuenta.numero}) = 0 and dia % 2 = 0 then (50 + dia * 5)::numeric else null end,
        null from generate_series(0, 29) as dias(dia)
      where dia % (4 + ${cuenta.numero}) <> 0
      on conflict (usuario_id, fecha) do nothing;
    end $seed$;`);
    console.log(`Actividad ficticia preparada para la cuenta ${cuenta.numero}.`);
  }
}

// Ninguna limpieza modifica Comunidad: cualquier vínculo detiene la operación.
function relaciones(idsSql) {
  return `exists(select 1 from public.vinculos
      where solicitante_id in (${idsSql}) or destinatario_id in (${idsSql})) or
    exists(select 1 from public.tableros_apoyo where creador_id in (${idsSql})) or
    exists(select 1 from public.participantes_tablero
      where usuario_id in (${idsSql}) or invitado_por in (${idsSql})) or
    exists(select 1 from public.publicaciones where perfil_visible_id in (${idsSql})) or
    exists(select 1 from public.comentarios where perfil_visible_id in (${idsSql})) or
    exists(select 1 from private.autorias_publicaciones where usuario_id in (${idsSql})) or
    exists(select 1 from private.autorias_comentarios where usuario_id in (${idsSql})) or
    exists(select 1 from public.reacciones where usuario_id in (${idsSql})) or
    exists(select 1 from private.origenes_logros_medidas where usuario_id in (${idsSql}))`;
}

async function limpiar(origen) {
  const existentes = leerCuentas();
  revisarColisiones(existentes);
  if (!existentes.length) {
    console.log("No hay cuentas de este seeder para eliminar.");
    return;
  }
  const ids = existentes.map((cuenta) => validarId(cuenta.id));
  const idsSql = ids.map((id) => `'${id}'::uuid`).join(", ");
  if (consultar(`select (${relaciones(idsSql)}) as hay_relaciones`)[0]?.hay_relaciones) {
    throw new Error("Se encontraron relaciones con Comunidad; no se eliminó ningún dato.");
  }
  const objetos = consultar(`select bucket_id, name, coalesce(owner_id, owner::text) as propietario
    from storage.objects where coalesce(owner_id, owner::text) in (${literales(ids)})
      or split_part(name, '/', 1) in (${literales(ids)})`);
  if (
    objetos.some(
      (objeto) =>
        objeto.bucket_id !== "avatares" ||
        !ids.includes(objeto.propietario) ||
        !objeto.name.startsWith(`${objeto.propietario}/`),
    )
  ) {
    throw new Error("Se encontraron archivos fuera del alcance seguro; no se eliminó ningún dato.");
  }
  if (objetos.length) {
    // Storage y PostgreSQL son servicios distintos: si no se confirma la baja
    // de cada objeto, detenerse antes de eliminar filas o cuentas de Auth.
    const rutas = objetos.map((objeto) => objeto.name);
    const eliminados = await api(
      origen,
      "/storage/v1/object/avatares",
      "DELETE",
      { prefixes: rutas },
    );
    const rutasEliminadas = new Set(
      Array.isArray(eliminados) ? eliminados.map((objeto) => objeto.name) : [],
    );
    if (!rutas.every((ruta) => rutasEliminadas.has(ruta))) {
      throw new Error(
        "No se pudo confirmar la eliminación de todos los archivos de prueba.",
      );
    }
  }
  // La limpieza relacional es una transacción y vuelve a comprobar los vínculos.
  consultar(`do $clean$ begin
    if ${relaciones(idsSql)} then raise exception 'Relaciones de Comunidad detectadas'; end if;
    delete from public.registro_conductas where registro_id in
      (select id from public.registros_actividad where usuario_id in (${idsSql}));
    delete from public.registros_actividad where usuario_id in (${idsSql});
    delete from public.participacion_diaria where usuario_id in (${idsSql});
    delete from public.medidas_usuario where usuario_id in (${idsSql});
    delete from public.onboarding where usuario_id in (${idsSql});
    delete from public.perfiles where usuario_id in (${idsSql});
  end $clean$;`);
  // Auth elimina cada cuenta una vez retirados sus datos y archivos propios.
  for (const id of ids) {
    await api(origen, `/auth/v1/admin/users/${id}`, "DELETE");
  }
  console.log(`Cuentas ficticias eliminadas: ${ids.length}.`);
}

try {
  await confirmar();
  const origen = obtenerDestino();
  await comprobarCredencial(origen);
  if (accion === "seed") {
    await sembrar(origen);
  } else {
    await limpiar(origen);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Error inesperado.");
  console.error(
    "La operación podría estar incompleta; revisá el entorno antes de reintentar.",
  );
  process.exitCode = 1;
}
