/*
 * Página pública de acceso a MODUS: presenta registro e inicio de sesión.
 * Recibe el modo desde AppRouter y conecta los formularios con Supabase Auth.
 */
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import "./LoginPage.css";

export const LoginPage = () => {
  // La URL permite que cada botón de la Landing abra directamente el formulario elegido.
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegister = searchParams.get("modo") === "registro";
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousMode, setPreviousMode] = useState(isRegister);

  // Si la cabecera o el historial cambian la URL, también se reinicia el estado visual.
  // React repite el render antes de mostrar el nuevo formulario con los datos anteriores.
  if (previousMode !== isRegister) {
    setPreviousMode(isRegister);
    setShowPassword(false);
    setMessage("");
  }

  // El cambio de formulario limpia avisos y devuelve el foco al nuevo encabezado.
  const switchMode = () => {
    setMessage("");
    setShowPassword(false);
    setSearchParams({ modo: isRegister ? "ingreso" : "registro" });
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  // Auth administra la cuenta y la sesión; el disparador de PostgreSQL crea el perfil.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    const username = String(values.get("username") || "").trim();
    const confirmation = String(values.get("passwordConfirmation") || "");

    if (isRegister && (!username || username.length > 64)) {
      setMessage("Ingresá un nombre de usuario de entre 1 y 64 caracteres.");
      return;
    }
    if (isRegister && password !== confirmation) {
      setMessage("Las contraseñas no coinciden. Revisalas y volvé a intentar.");
      return;
    }

    setMessage("");
    setIsSubmitting(true);
    try {
      const result = isRegister
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      // El navegador nunca debe mostrar los detalles internos devueltos por el servidor.
      if (result.error) {
        setMessage(
          isRegister
            ? "No pudimos crear la cuenta. Revisá tus datos o probá otro nombre de usuario."
            : "No pudimos iniciar sesión. Revisá tu correo y contraseña.",
        );
        return;
      }
      if (!result.data.session) {
        setMessage("No se pudo iniciar la sesión. Intentá nuevamente más tarde.");
        return;
      }
      navigate(isRegister ? "/onboarding" : "/inicio", { replace: true });
    } catch {
      setMessage("No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="access-page" aria-label="Acceso a MODUS">
      {/* El panel decorativo se desplaza; solo el formulario visible está montado y recibe foco. */}
      <div className={`access-shell${isRegister ? " access-shell--register" : ""}`}>
        <div className="access-panel" aria-hidden="true" />
        <div className="access-invitation">
          <div>
            <h2>{isRegister ? "¿Ya tenés una cuenta?" : "Tu espacio empieza acá"}</h2>
            <p>
              {isRegister
                ? "Ingresá para continuar a tu ritmo."
                : "Creá tu cuenta y explorá MODUS a tu ritmo."}
            </p>
            <button type="button" onClick={switchMode} disabled={isSubmitting}>
              {isRegister ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </div>
        </div>

        <div className="access-content">
          <h1 ref={titleRef} tabIndex={-1}>
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="access-intro">
            {isRegister ? "Completá tus datos para comenzar." : "Ingresá a tu cuenta para continuar."}
          </p>

          {/* FormData recoge los campos del formulario activo cuando se envía. */}
          <form key={isRegister ? "registro" : "ingreso"} onSubmit={handleSubmit} className="access-form">
            {isRegister && (
              <label>
                <span>Nombre de usuario</span>
                <input name="username" type="text" autoComplete="username" maxLength={64} required />
              </label>
            )}
            <label>
              <span>Correo electrónico</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <div className="access-field">
              {/* La etiqueta solo identifica el campo; el botón mantiene su propio nombre accesible. */}
              <label htmlFor="access-password">Contraseña</label>
              <span className="access-password">
                <input
                  id="access-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                </button>
              </span>
            </div>
            {isRegister && (
              <label>
                <span>Confirmar contraseña</span>
                <input name="passwordConfirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" required />
              </label>
            )}
            {message && <p className="access-message" role="alert">{message}</p>}
            <button className="access-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Un momento…" : isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </form>
          <p className="access-switch-mobile">
            {isRegister ? "¿Ya tenés una cuenta?" : "¿Todavía no tenés cuenta?"}{" "}
            <button type="button" onClick={switchMode} disabled={isSubmitting}>
              {isRegister ? "Iniciar sesión" : "Registrarse"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
