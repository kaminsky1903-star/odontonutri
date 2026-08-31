import type { ReactNode } from "react";
import { AdminLogin } from "./AdminLogin";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { configured, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading" role="status">
        Cargando panel…
      </div>
    );
  }

  if (!configured) {
    return <AdminLogin pending />;
  }

  if (!session) {
    return <AdminLogin />;
  }

  return children;
}
