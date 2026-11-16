/*
 * Carga la identidad de la cuenta para Navbar y Sidebar. La imagen privada se
 * descarga con la sesión actual y su URL temporal se libera al cambiar de cuenta.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";

export const useNavigationProfile = () => {
  const [profile, setProfile] = useState({ alias: "", avatar: null });
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const refreshNavigationProfile = useCallback(() => {
    generation.current += 1;
    setProfile({ alias: "", avatar: null });
    setRevision((value) => value + 1);
  }, []);

  // No consultar Supabase dentro del callback de Auth: solo invalidar y recargar.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshNavigationProfile();
    });
    return () => subscription.unsubscribe();
  }, [refreshNavigationProfile]);

  useEffect(() => {
    let active = true;
    let objectUrl;
    const current = generation.current;
    const load = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active || current !== generation.current || error || !user) return;
        const result = await supabase.from("perfiles")
          .select("username, avatar_path").eq("usuario_id", user.id).maybeSingle();
        if (!active || current !== generation.current || result.error || !result.data) return;
        const alias = result.data.username || "";
        if (result.data.avatar_path) {
          const image = await supabase.storage.from("avatares").download(result.data.avatar_path);
          if (!active || current !== generation.current) return;
          if (!image.error && image.data) objectUrl = URL.createObjectURL(image.data);
        }
        if (active && current === generation.current) setProfile({ alias, avatar: objectUrl || null });
      } catch {
        // El acceso al perfil sigue disponible mediante una alternativa neutral.
        if (active && current === generation.current) setProfile({ alias: "", avatar: null });
      }
    };
    load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [revision]);

  return { profile, refreshNavigationProfile };
};
