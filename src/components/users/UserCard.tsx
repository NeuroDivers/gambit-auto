
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserEditDialog } from "./UserEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "./card/UserAvatar";
import { UserActions } from "./card/UserActions";
import { User } from "./hooks/useUserData";
import { useNavigate } from "react-router-dom";

type UserCardProps = {
  user: User;
};

export const UserCard = ({ user }: UserCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (error) throw error;

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

  const handleCardClick = () => {
    navigate(`/users/${user.id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-card border border-border/50 rounded-lg p-4 transition-all duration-200 hover:border-primary/30 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <UserAvatar
            displayName={displayName}
            email={user.email}
            showEmail={!!(user.first_name && user.last_name)}
            role={user.role}
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
