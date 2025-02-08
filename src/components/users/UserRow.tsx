
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserEditDialog } from "./UserEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { UserInfo } from "./row/UserInfo";
import { UserActions } from "./row/UserActions";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type UserRowProps = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
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
        <UserInfo
          displayName={displayName}
          email={user.email}
          userRole={user.role}
        />
        <UserActions
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      </div>
      <UserEditDialog
        user={user}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </>
  );
};
