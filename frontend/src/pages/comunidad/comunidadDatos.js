/*
 * Consultas y operaciones de Comunidad en Supabase.
 * La identidad visible se resuelve desde perfiles solo cuando no es anónima;
 * la autoría real permanece protegida en la base mediante RPC y RLS.
 */
import { supabase } from "../../lib/supabase.js";

function formatearFechaRelativa(isoString) {
  if (!isoString) return "";
  const fecha = new Date(isoString);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function resolverAutorVisible(perfilId, perfilesPorId, esAnonimo, aliasActual) {
  if (esAnonimo || !perfilId) {
    return {
      autor: "Anónimo",
      esAnonimo: true,
      esPropioConAlias: false,
    };
  }
  const perfil = perfilesPorId.get(perfilId);
  return {
    autor: perfil?.username || aliasActual || "Integrante",
    esAnonimo: false,
    esPropioConAlias: Boolean(aliasActual && perfil?.username === aliasActual),
  };
}

export async function obtenerUsuarioComunidad() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return { user: null, alias: "" };
    }
    throw error;
  }
  const user = data?.user ?? null;
  if (!user) return { user: null, alias: "" };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("username")
    .eq("usuario_id", user.id)
    .maybeSingle();

  return {
    user,
    alias: perfil?.username || "",
  };
}

export async function obtenerEtiquetasComunidad() {
  const { data, error } = await supabase
    .from("etiquetas_comunidad")
    .select("codigo, nombre")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function cargarFeedComunidad({ etiquetaCodigo = "" } = {}) {
  const { user, alias } = await obtenerUsuarioComunidad();
  if (!user) {
    return { autenticado: false, publicaciones: [] };
  }

  let consultaPubs = supabase
    .from("publicaciones")
    .select(
      "id, etiqueta_codigo, perfil_visible_id, tipo, titulo, contenido, creado_en, eliminado_en",
    )
    .is("tablero_id", null)
    .is("eliminado_en", null)
    .order("creado_en", { ascending: false });

  if (etiquetaCodigo) {
    consultaPubs = consultaPubs.eq("etiqueta_codigo", etiquetaCodigo);
  }

  const { data: pubsData, error: pubsError } = await consultaPubs;
  if (pubsError) throw pubsError;

  const publicacionesBase = pubsData ?? [];
  if (publicacionesBase.length === 0) {
    return { autenticado: true, publicaciones: [] };
  }

  const pubIds = publicacionesBase.map((p) => p.id);

  const [comentariosRes, reaccionesPropiasRes, conteosRes] = await Promise.all([
    supabase
      .from("comentarios")
      .select(
        "id, publicacion_id, respuesta_a_id, perfil_visible_id, contenido, creado_en, eliminado_en",
      )
      .in("publicacion_id", pubIds)
      .order("creado_en", { ascending: true }),
    supabase
      .from("reacciones")
      .select("publicacion_id")
      .eq("usuario_id", user.id)
      .in("publicacion_id", pubIds),
    Promise.all(
      pubIds.map(async (id) => {
        const { data: total, error: rpcError } = await supabase.rpc(
          "contar_reacciones",
          { p_id: id },
        );
        return { id, total: rpcError ? 0 : Number(total ?? 0) };
      }),
    ),
  ]);

  if (comentariosRes.error) throw comentariosRes.error;
  if (reaccionesPropiasRes.error) throw reaccionesPropiasRes.error;

  const comentariosBase = comentariosRes.data ?? [];
  const idsPerfil = new Set();

  for (const pub of publicacionesBase) {
    if (pub.perfil_visible_id) idsPerfil.add(pub.perfil_visible_id);
  }
  for (const com of comentariosBase) {
    if (com.perfil_visible_id) idsPerfil.add(com.perfil_visible_id);
  }

  const perfilesPorId = new Map();
  if (idsPerfil.size > 0) {
    const { data: perfilesData, error: perfilesError } = await supabase
      .from("perfiles")
      .select("usuario_id, username")
      .in("usuario_id", Array.from(idsPerfil));

    if (perfilesError) throw perfilesError;
    for (const p of perfilesData ?? []) {
      perfilesPorId.set(p.usuario_id, p);
    }
  }

  const apoyoPropioSet = new Set(
    (reaccionesPropiasRes.data ?? []).map((r) => r.publicacion_id),
  );
  const conteosPorPub = new Map(
    (conteosRes ?? []).map((item) => [item.id, item.total]),
  );

  const comentariosPorPub = new Map();
  for (const com of comentariosBase) {
    const retirado = Boolean(com.eliminado_en);
    const infoAutor = resolverAutorVisible(
      com.perfil_visible_id,
      perfilesPorId,
      retirado || !com.perfil_visible_id,
      alias,
    );
    const lista = comentariosPorPub.get(com.publicacion_id) ?? [];
    lista.push({
      id: com.id,
      respuestaAId: com.respuesta_a_id,
      autor: retirado ? "Contenido retirado" : infoAutor.autor,
      esAnonimo: retirado ? true : infoAutor.esAnonimo,
      retirado,
      texto: retirado ? "Este comentario fue retirado." : com.contenido || "",
      hace: formatearFechaRelativa(com.creado_en),
    });
    comentariosPorPub.set(com.publicacion_id, lista);
  }

  const publicaciones = publicacionesBase.map((pub) => {
    const esAnonimo = !pub.perfil_visible_id;
    const infoAutor = resolverAutorVisible(
      pub.perfil_visible_id,
      perfilesPorId,
      esAnonimo,
      alias,
    );

    return {
      id: pub.id,
      autor: infoAutor.autor,
      esAnonimo,
      etiquetaCodigo: pub.etiqueta_codigo || "",
      tipo: pub.tipo || "texto",
      titulo: pub.titulo || "",
      contenido: pub.contenido || "",
      meGusta: conteosPorPub.get(pub.id) ?? 0,
      dioMeGusta: apoyoPropioSet.has(pub.id),
      comentarios: comentariosPorPub.get(pub.id) ?? [],
      hace: formatearFechaRelativa(pub.creado_en),
    };
  });

  return { autenticado: true, publicaciones };
}

export async function crearPublicacionComunidad({
  etiquetaCodigo,
  titulo,
  contenido,
  anonimo,
}) {
  const { error } = await supabase.rpc("crear_publicacion", {
    p_tablero: null,
    p_etiqueta: etiquetaCodigo,
    p_tipo: "texto",
    p_titulo: titulo.trim(),
    p_contenido: contenido.trim(),
    p_anonimo: Boolean(anonimo),
  });
  if (error) throw error;
}

export async function crearComentarioComunidad({
  publicacionId,
  respuestaAId = null,
  contenido,
  anonimo,
}) {
  const { error } = await supabase.rpc("crear_comentario", {
    p_publicacion: publicacionId,
    p_respuesta: respuestaAId,
    p_contenido: contenido.trim(),
    p_anonimo: Boolean(anonimo),
  });
  if (error) throw error;
}

export async function alternarApoyoPublicacion({ publicacionId, dioApoyo }) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Necesitás iniciar sesión para registrar tu apoyo.");
  }

  if (dioApoyo) {
    const { error } = await supabase
      .from("reacciones")
      .delete()
      .eq("publicacion_id", publicacionId)
      .eq("usuario_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reacciones").insert({
      publicacion_id: publicacionId,
      usuario_id: user.id,
    });
    if (error) throw error;
  }
}

export async function retirarPublicacionComunidad(publicacionId) {
  const { error } = await supabase.rpc("retirar_publicacion", {
    p_id: publicacionId,
  });
  if (error) throw error;
}

export async function retirarComentarioComunidad(comentarioId) {
  const { error } = await supabase.rpc("retirar_comentario", {
    p_id: comentarioId,
  });
  if (error) throw error;
}

export async function responderComentarioComunidad({
  publicacionId,
  respuestaAId,
  contenido,
  anonimo,
}) {
  const { error } = await supabase.rpc("crear_comentario", {
    p_publicacion: publicacionId,
    p_respuesta: respuestaAId,
    p_contenido: contenido.trim(),
    p_anonimo: Boolean(anonimo),
  });
  if (error) throw error;
}
