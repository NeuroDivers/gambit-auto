
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Shield, Trash2, Users } from "lucide-react";
import { Role } from "../types/role";
import { useRoleStats } from "../../hooks/useRoleStats";

interface RoleCardProps {
  role: Role;
  isAdmin: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
}

export const RoleCard = ({ 
  role, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onManagePermissions 
}: RoleCardProps) => {
  const { data: roleStats } = useRoleStats();
  const userCount = roleStats ? roleStats[role.name] || 0 : 0;

  return (
    <Card key={role.id} className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="space-y-2 flex-grow">
          <h4 className="font-medium text-card-foreground">{role.nicename}</h4>
          <p className="text-sm text-muted-foreground">{role.name}</p>
          {role.description && (
            <p className="text-sm text-muted-foreground">{role.description}</p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{userCount} {userCount === 1 ? 'user' : 'users'}</span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2 justify-end sm:flex-col">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManagePermissions(role)}
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(role)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(role)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
