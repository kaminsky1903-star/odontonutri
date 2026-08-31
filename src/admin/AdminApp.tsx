import { AdminDashboard } from "./AdminDashboard";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAdminSeo } from "./useAdminSeo";
import "./admin.css";

export function AdminApp() {
  useAdminSeo();

  return (
    <AuthProvider>
      <div className="admin-shell">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}
