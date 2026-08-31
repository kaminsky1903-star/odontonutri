import { useState, type FormEvent } from "react";
import { SITE_NAME } from "../site";
import { useAuth } from "./AuthContext";

type AdminLoginProps = {
  pending?: boolean;
};

export function AdminLogin({ pending = false }: AdminLoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    const message = await signIn(email, password);
    setSubmitting(false);
    if (message) {
      setError(message);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <img
          className="admin-login-logo"
          src="/logo.png"
          alt=""
          width={56}
          height={56}
        />
        <p className="admin-kicker">{SITE_NAME}</p>
        <h1>Panel de analíticas</h1>
        <p className="admin-login-lead">
          Acceso privado para revisar el rendimiento del sitio.
        </p>

        {pending ? (
          <p className="admin-banner" role="status">
            Configuración pendiente. El acceso se habilita cuando Supabase esté
            conectado.
          </p>
        ) : null}

        <form className="admin-login-form" onSubmit={onSubmit}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending || submitting}
            required
          />

          <label htmlFor="admin-password">Contraseña</label>
          <div className="admin-password-row">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending || submitting}
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              disabled={pending}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {error ? (
            <p className="admin-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="admin-submit"
            type="submit"
            disabled={pending || submitting}
          >
            {submitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
