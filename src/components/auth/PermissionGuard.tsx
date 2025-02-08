
import { ReactNode, useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionType } from "@/types/permissions";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  resource: string;
  type: PermissionType;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  resource,
  type,
  fallback
}: PermissionGuardProps) => {
  const { checkPermission } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const allowed = await checkPermission(resource, type);
      setHasPermission(allowed);

      if (!allowed && type === 'page_access') {
        navigate('/unauthorized');
      }
    };

    checkAccess();
  }, [resource, type, checkPermission, navigate]);

  if (hasPermission === null) {
    return null; // Loading state
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (type === 'feature_access') {
      return (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};
