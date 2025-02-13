
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Shield, Trash2 } from "lucide-react";
import { Role } from "../types/role";

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
  return (
    <Card key={role.id} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-card-foreground">{role.nicename}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{role.name}</p>
          {role.description && (
            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
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
