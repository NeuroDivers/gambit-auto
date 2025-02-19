
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { RoleDialog } from "./RoleDialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { RolePermissionsDialog } from "./RolePermissionsDialog";
import { Role } from "./types/role";
import { RoleCard } from "./components/RoleCard";
import { DeleteRoleDialog } from "./components/DeleteRoleDialog";

export const RoleList = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState<string>("");
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();

  const { data: roles, refetch, error } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      console.log("Fetching roles...");
      const { data, error } = await supabase
        .from("roles")  // Changed from "available_roles" to "roles"
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching roles:", error);
        throw error;
      }
      
      console.log("Fetched roles:", data);
      return data as Role[];
    },
  });

  const handleDelete = async (roleId: string) => {
    if (!newRoleId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a role to reassign users to.",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('reassign_users_and_delete_role', {
        role_id_to_delete: roleId,
        new_role_id: newRoleId
      });

      if (error) throw error;

      toast({
        title: "Role deleted",
        description: "The role has been deleted and users have been reassigned.",
      });

      setIsDeleteDialogOpen(false);
      setNewRoleId("");
      refetch();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Roles</h3>
            <p className="text-sm text-muted-foreground">Manage application roles and their descriptions</p>
          </div>
        </div>
        <Card className="p-4 text-muted-foreground">
          There was an error loading the roles. Please try again later.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Roles</h3>
          <p className="text-sm text-muted-foreground">Manage application roles and their descriptions</p>
        </div>
        {isAdmin && (
          <Button onClick={() => {
            setSelectedRole(null);
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {roles?.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isAdmin={isAdmin}
            onEdit={(role) => {
              setSelectedRole(role);
              setIsDialogOpen(true);
            }}
            onDelete={(role) => {
              setSelectedRole(role);
              setIsDeleteDialogOpen(true);
            }}
            onManagePermissions={(role) => {
              setSelectedRole(role);
              setIsPermissionsDialogOpen(true);
            }}
          />
        ))}
        {roles?.length === 0 && (
          <Card className="p-4 text-muted-foreground">
            No roles found. {isAdmin && 'Click "Create Role" to add one.'}
          </Card>
        )}
      </div>

      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={selectedRole}
        onSuccess={() => {
          setIsDialogOpen(false);
          refetch();
        }}
      />

      <RolePermissionsDialog
        roleId={selectedRole?.id || null}
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      />

      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedRole={selectedRole}
        roles={roles || []}
        newRoleId={newRoleId}
        onNewRoleSelect={setNewRoleId}
        onDelete={handleDelete}
      />
    </div>
  );
};
