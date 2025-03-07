
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceSkillsManager } from "./skills/ServiceSkillsManager";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface StaffSkillsProps {
  profileId: string;
  isCurrentUser: boolean;
}

export function StaffSkills({ profileId, isCurrentUser }: StaffSkillsProps) {
  const { isAdmin } = useAdminStatus();
  const { user } = useAuth();
  
  const canManageSkills = isAdmin || isCurrentUser;

  if (!canManageSkills) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage service skills for this user. Only administrators or the user themselves can manage service skills.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <ServiceSkillsManager profileId={profileId} />
      </CardContent>
    </Card>
  );
}
