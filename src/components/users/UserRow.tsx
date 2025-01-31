import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { UserEditDialog } from "./UserEditDialog";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type UserRowProps = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_roles: {
      role: UserRole;
    } | null;
  };
};

export const UserRow = ({ user }: UserRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email;

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {user.first_name && user.last_name ? user.email : ''}
              {user.user_roles?.role && ` • ${user.user_roles.role}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <UserEditDialog
        user={user}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
};