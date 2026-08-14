import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, roles }: { children: ReactNode; roles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
