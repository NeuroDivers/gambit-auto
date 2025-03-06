
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "../shared/LoadingScreen";

interface AuthGuardProps {
  children: ReactNode;
  isPublic?: boolean;
}

export function AuthGuard({ children, isPublic = false }: AuthGuardProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session && !isPublic) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (session && isPublic) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
