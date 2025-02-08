
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserEditDialog } from "./UserEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "./card/UserAvatar";
import { UserActions } from "./card/UserActions";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type UserCardProps = {
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_roles: {
      role: string;
      nicename: string;
    };
  };
};

export const UserCard = ({ user }: UserCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Invalidate both users and role stats queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["roleStats"] })
      ]);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
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
      <div className="bg-[#242424] border border-white/12 rounded-lg p-6 transition-all duration-200 hover:border-[#BB86FC]/50">
        <div className="flex items-start justify-between">
          <UserAvatar
            displayName={displayName}
            email={user.email}
            showEmail={!!(user.first_name && user.last_name)}
            userRole={user.user_roles}
          />
          <UserActions
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />
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
