
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { RoleDialog } from "./RoleDialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/useAdminStatus";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

export const RoleList = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdminStatus();

  const { data: roles, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Role[];
    },
  });

  const handleDelete = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white/[0.87]">System Roles</h3>
          <p className="text-sm text-white/60">Manage application roles and their descriptions</p>
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
                <h4 className="font-medium text-white/[0.87] capitalize">{role.name}</h4>
                {role.description && (
                  <p className="text-sm text-white/60 mt-1">{role.description}</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
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
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
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
    </div>
  );
};
