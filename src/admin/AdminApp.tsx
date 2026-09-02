import { useLayoutEffect } from "react";
import { markInternalAnalyticsBrowser } from "../analytics/session";
import { AdminDashboard } from "./AdminDashboard";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAdminSeo } from "./useAdminSeo";
import "./admin.css";

export function AdminApp() {
  useAdminSeo();
  useLayoutEffect(() => {
    markInternalAnalyticsBrowser();
  }, []);

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
