
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { RoleDialog } from "./RoleDialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { RolePermissionsDialog } from "./RolePermissionsDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = {
  id: string;
  name: string;
  nicename: string;
  description: string | null;
  can_be_assigned_to_bay: boolean;
};

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
        .from("roles")
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
    console.error("Error in RoleList:", error);
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
                    onClick={() => {
                      setSelectedRole(role);
                      setIsPermissionsDialogOpen(true);
                    }}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Please select a new role to assign to users with the {selectedRole?.nicename} role.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select
              value={newRoleId}
              onValueChange={setNewRoleId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.filter(role => role.id !== selectedRole?.id).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.nicename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRole && handleDelete(selectedRole.id)}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
